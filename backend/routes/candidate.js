// routes/candidate.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const blockchainService = require('../services/blockchainService');
const router = express.Router();

// Register candidate
router.post('/register', [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('party').notEmpty().trim().withMessage('Party is required'),
    body('manifesto').notEmpty().trim().isLength({ max: 2000 }).withMessage('Manifesto is required (max 2000 characters)'),
    body('age').isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
    body('gender').isIn(['NotSpecified', 'Male', 'Female', 'Other']),
    body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            name, party, manifesto, age, gender, walletAddress,
            email, phone, address, education, experience,
            achievements, socialMedia
        } = req.body;

        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({
            $or: [
                { walletAddress },
                { email },
                { phone }
            ]
        });

        if (existingCandidate) {
            return res.status(409).json({
                success: false,
                message: 'Candidate already registered with this wallet, email, or phone'
            });
        }

        // Create candidate
        const candidate = new Candidate({
            name,
            party,
            manifesto,
            age,
            gender,
            walletAddress,
            email,
            phone,
            address,
            education,
            experience,
            achievements: achievements || [],
            socialMedia: socialMedia || {},
            verificationStatus: 'pending'
        });

        await candidate.save();

        res.status(201).json({
            success: true,
            message: 'Candidate registered successfully',
            data: {
                candidate: {
                    candidateId: candidate.candidateId,
                    name: candidate.name,
                    party: candidate.party,
                    walletAddress: candidate.walletAddress,
                    verificationStatus: candidate.verificationStatus
                }
            }
        });

    } catch (error) {
        console.error('Candidate registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register candidate',
            error: error.message
        });
    }
});

// Register candidate for election on blockchain
router.post('/register-election', [
    body('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid contract address required'),
    body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required'),
    body('privateKey').notEmpty().withMessage('Private key required for blockchain registration')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { contractAddress, walletAddress, privateKey } = req.body;

        // Find candidate in database
        const candidate = await Candidate.findOne({ walletAddress });
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found. Please register first.'
            });
        }

        if (candidate.verificationStatus !== 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Candidate not verified. Please complete verification first.'
            });
        }

        // Find election
        const election = await Election.findOne({ contractAddress });
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        // Check if already registered for this election
        const alreadyRegistered = election.candidates.some(
            c => c.candidateId.toString() === candidate._id.toString()
        );

        if (alreadyRegistered) {
            return res.status(409).json({
                success: false,
                message: 'Already registered for this election'
            });
        }

        // Check candidate limit
        if (election.candidates.length >= election.maxCandidates) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${election.maxCandidates} candidates allowed`
            });
        }

        // Register on blockchain
        const result = await blockchainService.registerCandidate(
            contractAddress,
            candidate.name,
            candidate.party,
            candidate.manifesto,
            candidate.age,
            ['NotSpecified', 'Male', 'Female', 'Other'].indexOf(candidate.gender),
            privateKey
        );

        // Update candidate record
        candidate.onChainCandidateId = result.candidateId;
        candidate.isRegisteredOnChain = true;
        candidate.registrationTxHash = result.transactionHash;

        candidate.elections.push({
            electionId: election._id,
            contractAddress,
            votesReceived: 0
        });

        await candidate.save();

        // Update election record
        election.candidates.push({
            candidateId: candidate._id,
            onChainId: result.candidateId,
            registeredAt: new Date()
        });

        await election.save();

        res.json({
            success: true,
            message: 'Candidate registered for election successfully',
            data: {
                onChainCandidateId: result.candidateId,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber
            }
        });

    } catch (error) {
        console.error('Election registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register for election',
            error: error.message
        });
    }
});

// Get candidate profile
router.get('/profile/:walletAddress', [
    param('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { walletAddress } = req.params;

        const candidate = await Candidate.findOne({ walletAddress })
            .populate('elections.electionId', 'title electionType status contractAddress');

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        res.json({
            success: true,
            data: { candidate }
        });

    } catch (error) {
        console.error('Get candidate profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get candidate profile',
            error: error.message
        });
    }
});

// Get all candidates for an election
router.get('/election/:contractAddress', [
    param('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid contract address required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { contractAddress } = req.params;

        // Get candidates from blockchain
        const blockchainCandidates = await blockchainService.getCandidateList(contractAddress);

        // Get candidates from database
        const election = await Election.findOne({ contractAddress })
            .populate('candidates.candidateId', 'name party manifesto profileImage socialMedia');

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        // Merge blockchain and database data
        const candidates = blockchainCandidates.map(blockchainCandidate => {
            const dbCandidate = election.candidates.find(
                c => c.onChainId === parseInt(blockchainCandidate.candidateId)
            );

            return {
                ...blockchainCandidate,
                profileImage: dbCandidate?.candidateId?.profileImage,
                socialMedia: dbCandidate?.candidateId?.socialMedia,
                registeredAt: dbCandidate?.registeredAt
            };
        });

        res.json({
            success: true,
            data: { candidates }
        });

    } catch (error) {
        console.error('Get election candidates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get election candidates',
            error: error.message
        });
    }
});

module.exports = router;

// routes/voter.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { body, param, validationResult } = require('express-validator');
const Voter = require('../models/Voter');
const Election = require('../models/Election');
const blockchainService = require('../services/blockchainService');
const router = express.Router();

// Voter authentication middleware
const authenticateVoter = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const voter = await Voter.findById(decoded.id);

        if (!voter || !voter.isActive || !voter.isEligible) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or voter account deactivated/not eligible'
            });
        }

        req.voter = voter;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: error.message
        });
    }
};

// Voter login with wallet signature
router.post('/login', [
    body('walletAddress').isEthereumAddress().withMessage('Valid wallet address required'),
    body('signature').notEmpty().withMessage('Signature is required'),
    body('message').notEmpty().withMessage('Message is required')
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

        const { walletAddress, signature, message } = req.body;

        // Verify signature
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid signature'
                });
            }
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid signature format'
            });
        }

        // Find voter
        const voter = await Voter.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found. Please register first.'
            });
        }

        if (!voter.isEligible) {
            return res.status(401).json({
                success: false,
                message: 'Account not eligible for voting'
            });
        }

        // Update last login (add this field to schema if needed)
        voter.lastLogin = new Date();
        await voter.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: voter._id, 
                voterId: voter.voterId,
                walletAddress: voter.walletAddress,
                role: 'voter' 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                voter: {
                    voterId: voter.voterId,
                    name: voter.name,
                    walletAddress: voter.walletAddress,
                    age: voter.age,
                    gender: voter.gender,
                    email: voter.email,
                    verificationStatus: voter.verificationStatus,
                    isEligible: voter.isEligible,
                    isRegisteredOnChain: voter.isRegisteredOnChain,
                    lastLogin: voter.lastLogin
                },
                token
            }
        });

    } catch (error) {
        console.error('Voter login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Register voter
router.post('/register', [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('age').isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
    body('gender').isIn(['NotSpecified', 'Male', 'Female', 'Other']),
    body('walletAddress').isEthereumAddress().withMessage('Valid wallet address required'),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
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

        const { name, age, gender, walletAddress, email, phone, address } = req.body;

        // Check if voter already exists
        const existingVoter = await Voter.findOne({
            $or: [
                { walletAddress: walletAddress.toLowerCase() },
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : [])
            ]
        });

        if (existingVoter) {
            return res.status(409).json({
                success: false,
                message: 'Voter already registered with this wallet, email, or phone'
            });
        }

        // Create voter
        const voter = new Voter({
            name,
            age,
            gender,
            walletAddress: walletAddress.toLowerCase(), // Store in lowercase for consistency
            email,
            phone,
            address,
            verificationStatus: 'pending'
        });

        await voter.save();

        res.status(201).json({
            success: true,
            message: 'Voter registered successfully',
            data: {
                voter: {
                    voterId: voter.voterId,
                    name: voter.name,
                    walletAddress: voter.walletAddress,
                    verificationStatus: voter.verificationStatus
                }
            }
        });

    } catch (error) {
        console.error('Voter registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register voter',
            error: error.message
        });
    }
});

// Register voter for specific election on blockchain
router.post('/register-election', [
    body('contractAddress').isEthereumAddress().withMessage('Valid contract address required'),
    body('walletAddress').isEthereumAddress().withMessage('Valid wallet address required'),
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

        // Find voter in database
        const voter = await Voter.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found. Please register first.'
            });
        }

        if (voter.verificationStatus !== 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Voter not verified. Please complete verification first.'
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
        const alreadyRegistered = election.registeredVoters.some(
            v => v.voterId.toString() === voter._id.toString()
        );

        if (alreadyRegistered) {
            return res.status(409).json({
                success: false,
                message: 'Already registered for this election'
            });
        }

        // Register on blockchain
        const result = await blockchainService.registerVoter(
            contractAddress,
            voter.name,
            voter.age,
            ['NotSpecified', 'Male', 'Female', 'Other'].indexOf(voter.gender),
            privateKey
        );

        // Update voter record
        voter.onChainVoterId = result.voterId;
        voter.isRegisteredOnChain = true;
        voter.registrationTxHash = result.transactionHash;
        await voter.save();

        // Update election record
        election.registeredVoters.push({
            voterId: voter._id,
            onChainId: result.voterId,
            registeredAt: new Date()
        });
        election.totalRegisteredVoters = election.registeredVoters.length;
        await election.save();

        res.json({
            success: true,
            message: 'Voter registered for election successfully',
            data: {
                onChainVoterId: result.voterId,
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

// Cast vote
router.post('/vote', [
    body('contractAddress').isEthereumAddress().withMessage('Valid contract address required'),
    body('candidateId').isInt({ min: 1 }).withMessage('Valid candidate ID required'),
    body('privateKey').notEmpty().withMessage('Private key required for voting')
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

        const { contractAddress, candidateId, privateKey } = req.body;

        // Get wallet address from private key
        const wallet = new (require('ethers')).Wallet(privateKey);
        const walletAddress = wallet.address;

        // Find voter
        const voter = await Voter.findOne({ walletAddress });
        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
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

        // Check if voter is registered for this election
        const voterRegistration = election.registeredVoters.find(
            v => v.voterId.toString() === voter._id.toString()
        );

        if (!voterRegistration) {
            return res.status(400).json({
                success: false,
                message: 'Not registered for this election'
            });
        }

        if (voterRegistration.hasVoted) {
            return res.status(400).json({
                success: false,
                message: 'Already voted in this election'
            });
        }

        // Cast vote on blockchain
        const result = await blockchainService.castVote(contractAddress, candidateId, privateKey);

        // Update voter's voting history
        voter.votingHistory.push({
            electionId: election._id,
            contractAddress,
            candidateId,
            voteTxHash: result.transactionHash,
            votedAt: new Date(),
            blockNumber: result.blockNumber
        });
        await voter.save();

        // Update election records
        voterRegistration.hasVoted = true;
        voterRegistration.votedAt = new Date();

        // Update candidate vote count
        const candidateRegistration = election.candidates.find(c => c.onChainId === candidateId);
        if (candidateRegistration) {
            candidateRegistration.votesReceived += 1;
        }

        election.totalVotesCast += 1;
        await election.save();

        res.json({
            success: true,
            message: 'Vote cast successfully',
            data: {
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                votedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Vote casting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cast vote',
            error: error.message
        });
    }
});

// Get voter profile
router.get('/profile/:walletAddress', [
    param('walletAddress').isEthereumAddress().withMessage('Valid wallet address required')
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

        const voter = await Voter.findOne({ walletAddress })
            .populate('votingHistory.electionId', 'title electionType status');

        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
            });
        }

        // Remove sensitive information
        const voterData = voter.toObject();
        delete voterData.__v;

        res.json({
            success: true,
            data: { voter: voterData }
        });

    } catch (error) {
        console.error('Get voter profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get voter profile',
            error: error.message
        });
    }
});

// Get voter's elections
router.get('/:walletAddress/elections', [
    param('walletAddress').isEthereumAddress().withMessage('Valid wallet address required')
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

        // Find voter
        const voter = await Voter.findOne({ walletAddress });
        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
            });
        }

        // Find elections where voter is registered
        const elections = await Election.find({
            'registeredVoters.voterId': voter._id
        }).populate('deployedBy', 'name email');

        // Add voting status for each election
        const electionsWithStatus = elections.map(election => {
            const voterReg = election.registeredVoters.find(
                v => v.voterId.toString() === voter._id.toString()
            );

            return {
                ...election.toObject(),
                voterStatus: {
                    hasVoted: voterReg?.hasVoted || false,
                    votedAt: voterReg?.votedAt,
                    registeredAt: voterReg?.registeredAt
                }
            };
        });

        res.json({
            success: true,
            data: { elections: electionsWithStatus }
        });

    } catch (error) {
        console.error('Get voter elections error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get voter elections',
            error: error.message
        });
    }
});

module.exports = router;
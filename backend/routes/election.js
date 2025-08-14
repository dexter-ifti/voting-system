
// routes/election.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Election = require('../models/Election');
const Admin = require('../models/Admin');
const blockchainService = require('../services/blockchainService');
const router = express.Router();

// Create new election
router.post('/create', [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('description').notEmpty().trim().withMessage('Description is required'),
    body('electionType').isIn(['presidential', 'parliamentary', 'local', 'referendum', 'student', 'corporate']),
    body('adminPrivateKey').notEmpty().withMessage('Admin private key required for deployment'),
    body('registrationStartTime').optional().isISO8601().toDate(),
    body('registrationEndTime').optional().isISO8601().toDate(),
    body('votingStartTime').optional().isISO8601().toDate(),
    body('votingEndTime').optional().isISO8601().toDate()
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
            title,
            description,
            electionType,
            adminPrivateKey,
            registrationStartTime,
            registrationEndTime,
            votingStartTime,
            votingEndTime,
            maxCandidates = 10
        } = req.body;

        // Deploy contract
        const deployResult = await blockchainService.deployElectionContract(
            title,
            description,
            adminPrivateKey
        );

        // Get admin wallet address
        const wallet = new (require('ethers')).Wallet(adminPrivateKey);
        const deployerAddress = wallet.address;

        // Find admin in database
        const admin = await Admin.findOne({ walletAddress: deployerAddress });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found with this wallet address'
            });
        }

        // Create election record
        const election = new Election({
            electionId: deployResult.contractAddress,
            title,
            description,
            electionType,
            contractAddress: deployResult.contractAddress,
            deploymentTxHash: deployResult.transactionHash,
            deployedBy: admin._id,
            deployerAddress,
            registrationStartTime,
            registrationEndTime,
            votingStartTime,
            votingEndTime,
            maxCandidates,
            status: 'created'
        });

        await election.save();

        // Add to admin's created elections
        admin.createdElections.push(election._id);
        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Election created successfully',
            data: {
                election,
                contractAddress: deployResult.contractAddress,
                transactionHash: deployResult.transactionHash
            }
        });

    } catch (error) {
        console.error('Create election error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create election',
            error: error.message
        });
    }
});

// Set election timing
router.put('/:contractAddress/timing', [
    param('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid contract address'),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('startTimeFromNow').isInt({ min: 1 }).withMessage('Start time must be positive'),
    body('durationInSeconds').isInt({ min: 1 }).withMessage('Duration must be positive'),
    body('adminPrivateKey').notEmpty().withMessage('Admin private key required')
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
        const { title, description, startTimeFromNow, durationInSeconds, adminPrivateKey } = req.body;

        // Update on blockchain
        const txHash = await blockchainService.setElectionDetails(
            contractAddress,
            title || '',
            description || '',
            startTimeFromNow,
            durationInSeconds,
            adminPrivateKey
        );

        // Update in database
        const startTime = new Date(Date.now() + (startTimeFromNow * 1000));
        const endTime = new Date(startTime.getTime() + (durationInSeconds * 1000));

        const election = await Election.findOneAndUpdate(
            { contractAddress },
            {
                votingStartTime: startTime,
                votingEndTime: endTime,
                status: 'registration_open',
                ...(title && { title }),
                ...(description && { description })
            },
            { new: true }
        );

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        res.json({
            success: true,
            message: 'Election timing set successfully',
            data: {
                election,
                transactionHash: txHash
            }
        });

    } catch (error) {
        console.error('Set election timing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set election timing',
            error: error.message
        });
    }
});

// Get election details
router.get('/:contractAddress', [
    param('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid contract address')
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

        // Get from database
        const election = await Election.findOne({ contractAddress })
            .populate('deployedBy', 'name email')
            .populate('candidates.candidateId', 'name party walletAddress')
            .populate('registeredVoters.voterId', 'name walletAddress');

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        // Get blockchain data
        const blockchainInfo = await blockchainService.getElectionInfo(contractAddress);
        const votingStatus = await blockchainService.getVotingStatus(contractAddress);
        const candidates = await blockchainService.getCandidateList(contractAddress);

        res.json({
            success: true,
            data: {
                election,
                blockchain: {
                    ...blockchainInfo,
                    votingStatus,
                    candidates
                }
            }
        });

    } catch (error) {
        console.error('Get election error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get election details',
            error: error.message
        });
    }
});

// Get all elections
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            electionType,
            search
        } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (electionType) {
            query.electionType = electionType;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const elections = await Election.find(query)
            .populate('deployedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Election.countDocuments(query);

        res.json({
            success: true,
            data: {
                elections,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalElections: total
            }
        });

    } catch (error) {
        console.error('Get elections error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get elections',
            error: error.message
        });
    }
});

// Emergency stop election
router.post('/:contractAddress/emergency-stop', [
    param('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid contract address'),
    body('adminPrivateKey').notEmpty().withMessage('Admin private key required'),
    body('reason').optional().trim()
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
        const { adminPrivateKey, reason } = req.body;

        // Emergency stop on blockchain
        const result = await blockchainService.emergencyStopVoting(contractAddress, adminPrivateKey);

        // Get admin wallet address
        const wallet = new (require('ethers')).Wallet(adminPrivateKey);
        const adminAddress = wallet.address;

        // Find admin
        const admin = await Admin.findOne({ walletAddress: adminAddress });

        // Update election in database
        const election = await Election.findOneAndUpdate(
            { contractAddress },
            {
                'emergencyStop.isActive': true,
                'emergencyStop.reason': reason || 'Emergency stop activated',
                'emergencyStop.stoppedBy': admin?._id,
                'emergencyStop.stoppedAt': new Date(),
                'emergencyStop.txHash': result.transactionHash,
                status: 'cancelled'
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Emergency stop activated successfully',
            data: {
                election,
                transactionHash: result.transactionHash
            }
        });

    } catch (error) {
        console.error('Emergency stop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate emergency stop',
            error: error.message
        });
    }
});

// Announce results
router.post('/:contractAddress/announce-results', [
    param('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid contract address'),
    body('adminPrivateKey').notEmpty().withMessage('Admin private key required')
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
        const { adminPrivateKey } = req.body;

        // Announce results on blockchain
        const result = await blockchainService.announceResults(contractAddress, adminPrivateKey);

        // Get results from blockchain
        const blockchainResults = await blockchainService.getResults(contractAddress);
        const candidates = await blockchainService.getCandidateList(contractAddress);

        // Process results
        const results = candidates.map((candidate, index) => ({
            candidateId: candidate.candidateId,
            candidateAddress: candidate.candidateAddress,
            name: candidate.name,
            party: candidate.party,
            votesReceived: parseInt(candidate.votes),
            percentage: candidates.length > 0 ? (parseInt(candidate.votes) / parseInt(blockchainResults.totalVotes) * 100) : 0,
            position: 0 // Will be calculated below
        }));

        // Sort by votes and assign positions
        results.sort((a, b) => b.votesReceived - a.votesReceived);
        results.forEach((result, index) => {
            result.position = index + 1;
        });

        // Find winner
        const winner = results[0];

        // Update election in database
        const election = await Election.findOneAndUpdate(
            { contractAddress },
            {
                'winner.walletAddress': blockchainResults.winnerAddress,
                'winner.votesReceived': parseInt(blockchainResults.winnerVotes),
                results: results,
                resultsAnnouncedAt: new Date(),
                resultsTxHash: result.transactionHash,
                status: 'results_announced',
                totalVotesCast: parseInt(blockchainResults.totalVotes),
                turnoutPercentage: 0 // Calculate based on registered voters
            },
            { new: true }
        );

        // Calculate turnout percentage
        if (election && election.totalRegisteredVoters > 0) {
            election.turnoutPercentage = (parseInt(blockchainResults.totalVotes) / election.totalRegisteredVoters) * 100;
            await election.save();
        }

        res.json({
            success: true,
            message: 'Results announced successfully',
            data: {
                election,
                results: blockchainResults,
                detailedResults: results,
                transactionHash: result.transactionHash
            }
        });

    } catch (error) {
        console.error('Announce results error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to announce results',
            error: error.message
        });
    }
});

module.exports = router;
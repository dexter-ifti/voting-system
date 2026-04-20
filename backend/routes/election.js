
// routes/election.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Election = require('../models/Election');
const Admin = require('../models/Admin');
const blockchainService = require('../services/blockchainService');
const router = express.Router();
const DEFAULT_ADMIN_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const useDefaultAdminPrivateKey = (req, res, next) => {
    if (!req.body.adminPrivateKey) {
        req.body.adminPrivateKey = DEFAULT_ADMIN_PRIVATE_KEY;
    }
    next();
};

// Create new election
router.post('/create', useDefaultAdminPrivateKey, [
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

        // Generate a unique election ID using timestamp to avoid duplicates
        const uniqueElectionId = `${deployResult.contractAddress}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create election record
        const election = new Election({
            electionId: uniqueElectionId,
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

// Update election status
router.patch('/:contractAddress/status', [
    param('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid contract address'),
    body('status').isIn(['created', 'registration_open', 'registration_closed', 'voting_active', 'voting_ended', 'results_announced', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        console.log('🔄 Status update request received:', {
            contractAddress: req.params.contractAddress,
            newStatus: req.body.status,
            timestamp: new Date().toISOString()
        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { contractAddress } = req.params;
        const { status } = req.body;

        // Check current status before update
        const currentElection = await Election.findOne({ contractAddress });
        console.log('📊 Current election status:', currentElection?.status);

        const election = await Election.findOneAndUpdate(
            { contractAddress },
            { status },
            { new: true }
        );

        console.log('✅ Election status updated:', {
            contractAddress,
            oldStatus: currentElection?.status,
            newStatus: election?.status,
            success: !!election
        });

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        res.json({
            success: true,
            message: 'Election status updated successfully',
            data: { election }
        });

    } catch (error) {
        console.error('Update election status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update election status',
            error: error.message
        });
    }
});

// Set election timing
router.put('/:contractAddress/timing', useDefaultAdminPrivateKey, [
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

        // Fix missing winner wallet address if results are announced but wallet is empty
        if (election.status === 'results_announced' && 
            election.winner && 
            election.winner.votesReceived > 0 && 
            (!election.winner.walletAddress || election.winner.walletAddress === '')) {
            
            console.log('🔧 Fixing missing winner wallet address for election:', election.title);
            
            // Find the winning candidate based on votes
            const winningCandidate = election.candidates.reduce((max, current) => {
                return current.votesReceived > max.votesReceived ? current : max;
            });
            
            if (winningCandidate && winningCandidate.candidateId && winningCandidate.candidateId.walletAddress) {
                console.log(`   Winner: ${winningCandidate.candidateId.name} (${winningCandidate.candidateId.walletAddress})`);
                
                // Update the election in database
                await Election.updateOne(
                    { _id: election._id },
                    { 
                        $set: { 
                            'winner.walletAddress': winningCandidate.candidateId.walletAddress,
                            'winner.candidateId': winningCandidate.candidateId._id
                        } 
                    }
                );
                
                // Update the in-memory object for the response
                election.winner.walletAddress = winningCandidate.candidateId.walletAddress;
                election.winner.candidateId = winningCandidate.candidateId._id;
                
                console.log('   ✅ Fixed winner wallet address');
            }
        }

        // Get blockchain data with fallback
        let blockchainData = {
            title: election.title,
            description: election.description,
            startTime: '0',
            endTime: '0',
            isActive: false,
            totalVotes: '0',
            resultsAnnounced: false,
            votingStatus: { isActive: false, canVote: false },
            candidates: []
        };

        try {
            const blockchainInfo = await blockchainService.getElectionInfo(contractAddress);
            const votingStatus = await blockchainService.getVotingStatus(contractAddress);
            const candidates = await blockchainService.getCandidateList(contractAddress);

            blockchainData = {
                ...blockchainInfo,
                votingStatus,
                candidates
            };
        } catch (blockchainError) {
            console.warn('⚠️ Blockchain data unavailable for election:', contractAddress, blockchainError.message);
            // Use database data as fallback with actual vote counts
            blockchainData.title = election.title;
            blockchainData.description = election.description;
            blockchainData.isActive = election.status === 'voting_active';
            blockchainData.totalVotes = election.totalVotesCast?.toString() || '0';
            blockchainData.resultsAnnounced = election.status === 'results_announced';
            
            blockchainData.candidates = election.candidates.map(c => ({
                candidateId: c.candidateId._id,
                name: c.candidateId.name,
                party: c.candidateId.party,
                walletAddress: c.candidateId.walletAddress,
                votes: c.votesReceived?.toString() || '0',
                manifesto: c.candidateId.manifesto || ''
            }));
        }

        res.json({
            success: true,
            data: {
                election,
                blockchain: blockchainData
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
router.post('/:contractAddress/emergency-stop', useDefaultAdminPrivateKey, [
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
router.post('/:contractAddress/announce-results', useDefaultAdminPrivateKey, [
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

        // Check if election exists
        const election = await Election.findOne({ contractAddress })
            .populate('candidates.candidateId', 'name party walletAddress');
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        // Check if voting has ended (use database info if blockchain fails)
        let votingEnded = false;
        try {
            const votingStatus = await blockchainService.getVotingStatus(contractAddress);
            votingEnded = votingStatus === 'Ended';
        } catch (error) {
            console.log('⚠️ Blockchain voting status check failed, using database info:', error.message);
            // Fallback to database check
            const now = new Date();
            votingEnded = election.votingEndTime && now > election.votingEndTime;
        }

        // if (!votingEnded) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Voting must be ended before announcing results',
        //         currentTime: new Date(),
        //         votingEndTime: election.votingEndTime
        //     });
        // }

        // Check if results already announced
        if (election.status === 'results_announced') {
            return res.status(400).json({
                success: false,
                message: 'Results have already been announced for this election'
            });
        }

        // Announce results on blockchain
        let result;
        try {
            result = await blockchainService.announceResults(contractAddress, adminPrivateKey);
        } catch (error) {
            console.error('❌ Failed to announce results on blockchain:', error);
            
            // If blockchain call fails, we can still announce results using database data
            const mockResult = {
                transactionHash: `db_${Date.now()}`,
                blockNumber: 'offline_mode'
            };
            result = mockResult;
        }

        // Wait a moment for transaction to be mined and state to update
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get results from blockchain or use database fallback
        let blockchainResults;
        let candidates;
        
        try {
            blockchainResults = await blockchainService.getResults(contractAddress);
            candidates = await blockchainService.getCandidateList(contractAddress);
        } catch (error) {
            console.log('⚠️ Blockchain data retrieval failed, using database data:', error.message);
            
            // Fallback to database data
            candidates = election.candidates.map((candidate) => ({
                candidateId: candidate.candidateId,
                name: candidate.candidateId?.name || 'Unknown',
                party: candidate.candidateId?.party || '',
                candidateAddress: candidate.candidateId?.walletAddress || '',
                votes: candidate.votesReceived || 0
            }));
            
            // Calculate results from database data - FIX: Use actual votes cast, not sum of candidate votes
            const actualVotesCast = election.registeredVoters.filter(v => v.hasVoted).length;
            let winnerAddress = null;
            let winnerVotes = 0;
            
            candidates.forEach(candidate => {
                const votes = parseInt(candidate.votes);
                if (votes > winnerVotes) {
                    winnerVotes = votes;
                    winnerAddress = candidate.candidateAddress;
                }
            });
            
            blockchainResults = {
                winnerAddress,
                winnerVotes: winnerVotes.toString(),
                totalVotes: actualVotesCast.toString() // FIX: Use actual voters who voted, not sum of candidate votes
            };
        }

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
        const updatedElection = await Election.findOneAndUpdate(
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
        if (updatedElection && updatedElection.totalRegisteredVoters > 0) {
            updatedElection.turnoutPercentage = (parseInt(blockchainResults.totalVotes) / updatedElection.totalRegisteredVoters) * 100;
            await updatedElection.save();
        }

        res.json({
            success: true,
            message: 'Results announced successfully',
            data: {
                election: updatedElection,
                results: blockchainResults,
                detailedResults: results,
                transactionHash: result.transactionHash
            }
        });

    } catch (error) {
        console.error('Announce results error:', error);
        
        let statusCode = 500;
        let message = 'Failed to announce results';
        
        if (error.message.includes('Voting must be ended')) {
            statusCode = 400;
            message = 'Cannot announce results: Voting is still in progress or has not started';
        } else if (error.message.includes('Results have already been announced')) {
            statusCode = 400;
            message = 'Results have already been announced for this election';
        } else if (error.message.includes('Only election commission authorized')) {
            statusCode = 403;
            message = 'Unauthorized: Only election commission can announce results';
        }
        
        res.status(statusCode).json({
            success: false,
            message,
            error: error.message
        });
    }
});

// Quick fix: Update all created elections to registration_open (for debugging)
router.post('/fix-status', async (req, res) => {
    try {
        const result = await Election.updateMany(
            { status: 'created' },
            { status: 'registration_open' }
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} elections to registration_open status`,
            data: { modified: result.modifiedCount }
        });

    } catch (error) {
        console.error('Fix election status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix election status',
            error: error.message
        });
    }
});

// Fix candidate onChainId (debugging endpoint)
router.post('/:contractAddress/fix-candidate-ids', async (req, res) => {
    try {
        const { contractAddress } = req.params;
        
        const election = await Election.findOne({ contractAddress });
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        // Update onChainId for candidates (1-based indexing)
        for (let i = 0; i < election.candidates.length; i++) {
            if (!election.candidates[i].onChainId) {
                election.candidates[i].onChainId = i + 1;
            }
        }

        await election.save();

        res.json({
            success: true,
            message: 'Fixed candidate IDs',
            data: { candidates: election.candidates }
        });

    } catch (error) {
        console.error('Fix candidate IDs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix candidate IDs',
            error: error.message
        });
    }
});

// Fix vote counts for elections (admin utility)
router.post('/fix-vote-counts', async (req, res) => {
    try {
        const elections = await Election.find({});
        let fixed = 0;

        for (const election of elections) {
            // Count actual votes cast
            const actualVotesCast = election.registeredVoters.filter(v => v.hasVoted).length;
            
            // Count total votes received by all candidates
            const candidateVotesSum = election.candidates.reduce((sum, candidate) => 
                sum + (candidate.votesReceived || 0), 0
            );

            // The correct totalVotesCast should match the number of voters who have voted
            const correctTotalVotesCast = actualVotesCast;

            // Update if incorrect
            if (election.totalVotesCast !== correctTotalVotesCast) {
                console.log(`Fixing ${election.title}: ${election.totalVotesCast} → ${correctTotalVotesCast}`);
                election.totalVotesCast = correctTotalVotesCast;
                
                // Also recalculate turnout percentage
                if (election.totalRegisteredVoters > 0) {
                    election.turnoutPercentage = (correctTotalVotesCast / election.totalRegisteredVoters) * 100;
                }
                
                await election.save();
                fixed++;
            }
        }

        res.json({
            success: true,
            message: `Fixed vote counts for ${fixed} elections`,
            data: { electionsFixed: fixed }
        });

    } catch (error) {
        console.error('❌ Fix vote counts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix vote counts',
            error: error.message
        });
    }
});

// Get election results (for candidates and voters to view)
router.get('/:contractAddress/results', [
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

        // Find election
        const election = await Election.findOne({ contractAddress })
            .populate('candidates.candidateId', 'name party walletAddress')
            .populate('registeredVoters.voterId', 'name walletAddress');

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        // Check if results have been announced
        if (election.status !== 'results_announced') {
            return res.status(400).json({
                success: false,
                message: 'Results have not been announced yet',
                currentStatus: election.status
            });
        }

        // Create detailed results with populated candidate information
        const detailedResults = election.results?.map((result, index) => {
            // Find the candidate details from the populated candidates array
            const candidateDetails = election.candidates.find(c => 
                c.candidateId._id.toString() === result.candidateId.toString()
            );
            
            return {
                position: index + 1,
                candidateId: result.candidateId,
                candidateAddress: result.candidateAddress || candidateDetails?.candidateId?.walletAddress,
                name: result.name || candidateDetails?.candidateId?.name,
                party: result.party || candidateDetails?.candidateId?.party,
                votesReceived: result.votesReceived,
                percentage: result.percentage
            };
        }) || [];

        // Return results
        res.json({
            success: true,
            data: {
                election: {
                    _id: election._id,
                    title: election.title,
                    description: election.description,
                    electionType: election.electionType,
                    contractAddress: election.contractAddress,
                    status: election.status,
                    resultsAnnouncedAt: election.resultsAnnouncedAt,
                    totalRegisteredVoters: election.totalRegisteredVoters,
                    totalVotesCast: election.totalVotesCast,
                    turnoutPercentage: election.turnoutPercentage
                },
                winner: election.winner,
                results: election.results || [],
                detailedResults: detailedResults
            }
        });

    } catch (error) {
        console.error('❌ Get results error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get results',
            error: error.message
        });
    }
});

// Development helper routes

// Get contract usage statistics
router.get('/dev/contract-stats', async (req, res) => {
    try {
        const stats = await ElectionMappingService.getContractUsageStats();
        
        res.json({
            success: true,
            message: 'Contract usage statistics',
            data: {
                contractStats: stats,
                totalUniqueContracts: stats.length,
                totalElections: stats.reduce((sum, stat) => sum + stat.count, 0)
            }
        });
    } catch (error) {
        console.error('Contract stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get contract statistics'
        });
    }
});

// Clean up old test elections
router.delete('/dev/cleanup-test', async (req, res) => {
    try {
        const { olderThanHours = 24 } = req.query;
        const result = await ElectionMappingService.cleanupTestElections(Number(olderThanHours));
        
        res.json({
            success: true,
            message: 'Cleanup completed',
            data: result
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cleanup test elections'
        });
    }
});

module.exports = router;

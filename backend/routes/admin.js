const express = require('express');
const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const router = express.Router();

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const admin = await Admin.findById(decoded.id);

        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or admin deactivated'
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Admin registration
router.post('/register', [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Valid wallet address required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
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

        const { name, email, walletAddress, password, role = 'election_admin' } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { walletAddress }]
        });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'Admin already exists with this email or wallet address'
            });
        }

        // Set permissions based on role
        const permissions = role === 'super_admin'
            ? ['CREATE_ELECTION', 'MANAGE_ELECTION', 'VIEW_VOTERS', 'VIEW_RESULTS', 'EMERGENCY_STOP', 'MANAGE_ADMINS']
            : ['CREATE_ELECTION', 'MANAGE_ELECTION', 'VIEW_VOTERS', 'VIEW_RESULTS', 'EMERGENCY_STOP'];

        // Create admin
        const admin = new Admin({
            name,
            email,
            walletAddress,
            password,
            role,
            permissions
        });

        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                admin: {
                    adminId: admin.adminId,
                    name: admin.name,
                    email: admin.email,
                    walletAddress: admin.walletAddress,
                    role: admin.role,
                    permissions: admin.permissions
                },
                token
            }
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register admin',
            error: error.message
        });
    }
});

// Admin login
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
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

        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials or account deactivated'
            });
        }

        // Check password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                admin: {
                    adminId: admin.adminId,
                    name: admin.name,
                    email: admin.email,
                    walletAddress: admin.walletAddress,
                    role: admin.role,
                    permissions: admin.permissions,
                    lastLogin: admin.lastLogin
                },
                token
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Get admin dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {
        const adminId = req.admin._id;

        // Get stats
        const [
            totalElections,
            activeElections,
            totalVoters,
            totalCandidates,
            recentElections
        ] = await Promise.all([
            Election.countDocuments({ deployedBy: adminId }),
            Election.countDocuments({ deployedBy: adminId, status: { $in: ['voting_active', 'registration_open'] } }),
            Voter.countDocuments({ verificationStatus: 'verified' }),
            Candidate.countDocuments({ verificationStatus: 'verified' }),
            Election.find({ deployedBy: adminId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('candidates.candidateId', 'name party')
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalElections,
                    activeElections,
                    totalVoters,
                    totalCandidates
                },
                recentElections
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard data',
            error: error.message
        });
    }
});

// Get all voters (for verification)
router.get('/voters', authenticateAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search
        } = req.query;

        const query = {};

        if (status) {
            query.verificationStatus = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { voterId: { $regex: search, $options: 'i' } }
            ];
        }

        const voters = await Voter.find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Voter.countDocuments(query);

        res.json({
            success: true,
            data: {
                voters,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                totalVoters: total
            }
        });

    } catch (error) {
        console.error('Get voters error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get voters',
            error: error.message
        });
    }
});

// Verify/reject voter
router.put('/voters/:voterId/verify', authenticateAdmin, [
    param('voterId').notEmpty().withMessage('Voter ID required'),
    body('status').isIn(['verified', 'rejected']).withMessage('Status must be verified or rejected'),
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

        const { voterId } = req.params;
        const { status, reason } = req.body;

        const voter = await Voter.findOne({ voterId });
        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
            });
        }

        voter.verificationStatus = status;
        if (status === 'verified') {
            voter.isEligible = true;
        }
        await voter.save();

        res.json({
            success: true,
            message: `Voter ${status} successfully`,
            data: { voter }
        });

    } catch (error) {
        console.error('Voter verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify voter',
            error: error.message
        });
    }
});

// Get all candidates (for verification)
router.get('/candidates', authenticateAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search
        } = req.query;

        const query = {};

        if (status) {
            query.verificationStatus = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { party: { $regex: search, $options: 'i' } },
                { candidateId: { $regex: search, $options: 'i' } }
            ];
        }

        const candidates = await Candidate.find(query)
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Candidate.countDocuments(query);

        res.json({
            success: true,
            data: {
                candidates,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                totalCandidates: total
            }
        });

    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get candidates',
            error: error.message
        });
    }
});

// Verify/reject candidate
router.put('/candidates/:candidateId/verify', authenticateAdmin, [
    param('candidateId').notEmpty().withMessage('Candidate ID required'),
    body('status').isIn(['verified', 'rejected']).withMessage('Status must be verified or rejected'),
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

        const { candidateId } = req.params;
        const { status, reason } = req.body;

        const candidate = await Candidate.findOne({ candidateId });
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        candidate.verificationStatus = status;
        candidate.approvedBy = req.admin._id;
        candidate.approvedAt = new Date();
        await candidate.save();

        res.json({
            success: true,
            message: `Candidate ${status} successfully`,
            data: { candidate }
        });

    } catch (error) {
        console.error('Candidate verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify candidate',
            error: error.message
        });
    }
});

// Get election analytics
router.get('/elections/:contractAddress/analytics', authenticateAdmin, [
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

        const election = await Election.findOne({ contractAddress })
            .populate('candidates.candidateId', 'name party')
            .populate('registeredVoters.voterId', 'name age gender');

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        // Calculate analytics
        const totalRegistered = election.totalRegisteredVoters;
        const totalVoted = election.totalVotesCast;
        const turnout = totalRegistered > 0 ? (totalVoted / totalRegistered * 100) : 0;

        // Vote distribution
        const voteDistribution = election.candidates.map(candidate => ({
            candidateId: candidate.candidateId?._id,
            name: candidate.candidateId?.name,
            party: candidate.candidateId?.party,
            votes: candidate.votesReceived,
            percentage: totalVoted > 0 ? (candidate.votesReceived / totalVoted * 100) : 0
        }));

        // Demographics (if available)
        const voterDemographics = {
            byAge: {},
            byGender: {}
        };

        election.registeredVoters.forEach(voter => {
            if (voter.voterId?.age) {
                const ageGroup = voter.voterId.age < 30 ? '18-29' :
                    voter.voterId.age < 50 ? '30-49' : '50+';
                voterDemographics.byAge[ageGroup] = (voterDemographics.byAge[ageGroup] || 0) + 1;
            }

            if (voter.voterId?.gender) {
                voterDemographics.byGender[voter.voterId.gender] =
                    (voterDemographics.byGender[voter.voterId.gender] || 0) + 1;
            }
        });

        res.json({
            success: true,
            data: {
                election: {
                    title: election.title,
                    status: election.status,
                    totalRegistered,
                    totalVoted,
                    turnoutPercentage: turnout.toFixed(2)
                },
                voteDistribution,
                demographics: voterDemographics,
                timeline: {
                    created: election.createdAt,
                    registrationStart: election.registrationStartTime,
                    registrationEnd: election.registrationEndTime,
                    votingStart: election.votingStartTime,
                    votingEnd: election.votingEndTime,
                    resultsAnnounced: election.resultsAnnouncedAt
                }
            }
        });

    } catch (error) {
        console.error('Election analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get election analytics',
            error: error.message
        });
    }
});

module.exports = router;
// models/Election.js
const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    electionId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    electionType: {
        type: String,
        enum: ['presidential', 'parliamentary', 'local', 'referendum', 'student', 'corporate'],
        required: true
    },

    // Smart contract details
    contractAddress: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^0x[a-fA-F0-9]{40}$/.test(v);
            },
            message: 'Invalid contract address'
        }
    },
    deploymentTxHash: String,
    deployedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    deployerAddress: {
        type: String,
        required: true
    },

    // Election timeline
    registrationStartTime: Date,
    registrationEndTime: Date,
    votingStartTime: Date,
    votingEndTime: Date,

    // Election status
    status: {
        type: String,
        enum: ['created', 'registration_open', 'registration_closed', 'voting_active', 'voting_ended', 'results_announced', 'cancelled'],
        default: 'created'
    },

    // Participants
    candidates: [{
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        onChainId: Number,
        votesReceived: {
            type: Number,
            default: 0
        },
        registeredAt: Date
    }],

    registeredVoters: [{
        voterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voter'
        },
        onChainId: Number,
        hasVoted: {
            type: Boolean,
            default: false
        },
        votedAt: Date,
        registeredAt: Date
    }],

    // Election statistics
    totalRegisteredVoters: {
        type: Number,
        default: 0
    },
    totalVotesCast: {
        type: Number,
        default: 0
    },
    turnoutPercentage: {
        type: Number,
        default: 0
    },

    // Results
    winner: {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        walletAddress: String,
        votesReceived: Number
    },
    results: [{
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        votesReceived: Number,
        percentage: Number,
        position: Number
    }],
    resultsAnnouncedAt: Date,
    resultsTxHash: String,

    // Election settings
    maxCandidates: {
        type: Number,
        default: 10
    },
    allowMultipleVotes: {
        type: Boolean,
        default: false
    },
    requireVoterVerification: {
        type: Boolean,
        default: true
    },

    // Emergency controls
    emergencyStop: {
        isActive: {
            type: Boolean,
            default: false
        },
        reason: String,
        stoppedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        stoppedAt: Date,
        txHash: String
    },

    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    blockchain: {
        network: {
            type: String,
            default: 'ganache'
        },
        networkId: Number,
        blockNumber: Number
    }
}, {
    timestamps: true
});

// Virtual for contract address as election ID
electionSchema.virtual('contractAsId').get(function () {
    return this.contractAddress;
});

// Index for faster queries
electionSchema.index({ contractAddress: 1 });
electionSchema.index({ status: 1 });
electionSchema.index({ votingStartTime: 1, votingEndTime: 1 });
electionSchema.index({ deployedBy: 1 });

// Update election ID with contract address after deployment
electionSchema.pre('save', function (next) {
    if (this.contractAddress && !this.electionId) {
        this.electionId = this.contractAddress;
    }
    next();
});

module.exports = mongoose.model('Election', electionSchema);
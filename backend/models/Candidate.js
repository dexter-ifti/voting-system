// models/Candidate.js
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    candidateId: {
        type: String,
        required: true,
        unique: true,
        default: () => `CANDIDATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    party: {
        type: String,
        required: true,
        trim: true
    },
    manifesto: {
        type: String,
        required: true,
        maxlength: 2000
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 120
    },
    gender: {
        type: String,
        enum: ['NotSpecified', 'Male', 'Female', 'Other'],
        default: 'NotSpecified'
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^0x[a-fA-F0-9]{40}$/.test(v);
            },
            message: 'Invalid Ethereum wallet address'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },

    // Additional candidate information
    education: String,
    experience: String,
    

    // Blockchain-related fields
    onChainCandidateId: {
        type: Number,
        sparse: true
    },
    isRegisteredOnChain: {
        type: Boolean,
        default: false
    },
    registrationTxHash: String,

    // Election participation
    elections: [{
        electionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Election'
        },
        contractAddress: String,
        votesReceived: {
            type: Number,
            default: 0
        },
        position: Number, // Final ranking in election
        isWinner: {
            type: Boolean,
            default: false
        }
    }],

    isActive: {
        type: Boolean,
        default: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: Date,

    // Authentication tracking
    lastLogin: Date
}, {
    timestamps: true
});

// Index for faster queries
candidateSchema.index({ walletAddress: 1 });
candidateSchema.index({ candidateId: 1 });
candidateSchema.index({ isActive: 1, verificationStatus: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);

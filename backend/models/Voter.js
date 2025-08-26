// models/Voter.js
const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
    voterId: {
        type: String,
        required: true,
        unique: true,
        default: () => `VOTER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    name: {
        type: String,
        required: true,
        trim: true
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
        unique: true,
        sparse: true, // Allow multiple null values
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },
    // Blockchain-related fields
    onChainVoterId: {
        type: Number,
        sparse: true // Will be set when registered on blockchain
    },
    isRegisteredOnChain: {
        type: Boolean,
        default: false
    },
    registrationTxHash: String,

    // Voting history
    votingHistory: [{
        electionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Election'
        },
        contractAddress: String,
        candidateId: Number,
        voteTxHash: String,
        votedAt: Date,
        blockNumber: Number
    }],

    isEligible: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verificationDocuments: [{
        documentType: {
            type: String,
            enum: ['aadhar', 'passport', 'driving_license', 'voter_id']
        },
        documentNumber: String,
        documentUrl: String,
        uploadedAt: Date
    }],

    // Authentication tracking
    lastLogin: Date
}, {
    timestamps: true
});

// Index for faster queries
voterSchema.index({ walletAddress: 1 });
voterSchema.index({ voterId: 1 });
voterSchema.index({ isActive: 1, isEligible: 1 });

module.exports = mongoose.model('Voter', voterSchema);
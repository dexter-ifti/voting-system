// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        unique: true,
        default: () => `ADMIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
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
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['super_admin', 'election_admin'],
        default: 'election_admin'
    },
    permissions: [{
        type: String,
        enum: [
            'CREATE_ELECTION',
            'MANAGE_ELECTION',
            'VIEW_VOTERS',
            'VIEW_RESULTS',
            'EMERGENCY_STOP',
            'MANAGE_ADMINS'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    createdElections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election'
    }]
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);


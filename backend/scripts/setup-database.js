// scripts/setup-database.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

async function setupDatabase() {
    try {
        console.log('🗄️ Setting up database...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Create super admin if doesn't exist
        const existingAdmin = await Admin.findOne({ role: 'super_admin' });

        if (!existingAdmin) {
            const superAdmin = new Admin({
                name: 'Super Admin',
                email: 'admin@voting.com',
                walletAddress: '0x0000000000000000000000000000000000000000', // Replace with actual
                password: 'admin123456', // Change in production
                role: 'super_admin',
                permissions: [
                    'CREATE_ELECTION',
                    'MANAGE_ELECTION',
                    'VIEW_VOTERS',
                    'VIEW_RESULTS',
                    'EMERGENCY_STOP',
                    'MANAGE_ADMINS'
                ]
            });

            await superAdmin.save();
            console.log('✅ Super admin created');
            console.log('📧 Email: admin@voting.com');
            console.log('🔑 Password: admin123456');
            console.log('⚠️ Please change the password in production!');
        }

        console.log('✅ Database setup completed');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

// Run setup if script is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
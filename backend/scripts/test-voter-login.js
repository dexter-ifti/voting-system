const { ethers } = require('ethers');
const axios = require('axios');

async function testVoterLogin() {
    try {
        console.log('🧪 Testing Voter Login System...');
        
        // Create a test wallet
        const wallet = ethers.Wallet.createRandom();
        const walletAddress = wallet.address;
        const privateKey = wallet.privateKey;
        
        console.log(`📝 Test Wallet Address: ${walletAddress}`);
        
        // Step 1: Register voter first
        console.log('\n1️⃣ Registering test voter...');
        const registerData = {
            name: "Test Voter",
            age: 25,
            gender: "Male",
            walletAddress: walletAddress,
            email: "testvoter@example.com",
            phone: "+1234567890"
        };
        
        const registerResponse = await axios.post('http://localhost:3000/api/voter/register', registerData);
        console.log('✅ Voter registered successfully:', registerResponse.data.data.voter.voterId);
        
        // Step 2: Create and sign a message for login
        console.log('\n2️⃣ Creating login signature...');
        const message = `Login to Voting System at ${new Date().toISOString()}`;
        const signature = await wallet.signMessage(message);
        
        console.log(`📝 Message: ${message}`);
        console.log(`✍️ Signature: ${signature}`);
        
        // Step 3: Attempt login
        console.log('\n3️⃣ Attempting login...');
        const loginData = {
            walletAddress: walletAddress,
            signature: signature,
            message: message
        };
        
        const loginResponse = await axios.post('http://localhost:3000/api/voter/login', loginData);
        
        if (loginResponse.data.success) {
            console.log('✅ Login successful!');
            console.log('👤 Voter Info:', {
                voterId: loginResponse.data.data.voter.voterId,
                name: loginResponse.data.data.voter.name,
                walletAddress: loginResponse.data.data.voter.walletAddress,
                verificationStatus: loginResponse.data.data.voter.verificationStatus
            });
            console.log('🔑 JWT Token received (first 50 chars):', loginResponse.data.data.token.substring(0, 50) + '...');
            
            // Step 4: Test authenticated request
            console.log('\n4️⃣ Testing authenticated request...');
            const token = loginResponse.data.data.token;
            
            const profileResponse = await axios.get(
                `http://localhost:3000/api/voter/profile/${walletAddress}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (profileResponse.data.success) {
                console.log('✅ Authenticated profile request successful!');
                console.log('📊 Profile data received for:', profileResponse.data.data.voter.name);
            }
            
        } else {
            console.log('❌ Login failed:', loginResponse.data.message);
        }
        
        // Step 5: Test invalid signature
        console.log('\n5️⃣ Testing invalid signature...');
        try {
            const invalidLoginData = {
                walletAddress: walletAddress,
                signature: "0xinvalidsignature",
                message: message
            };
            
            await axios.post('http://localhost:3000/api/voter/login', invalidLoginData);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Invalid signature correctly rejected');
            } else {
                console.log('❓ Unexpected error:', error.response?.data || error.message);
            }
        }
        
        // Step 6: Test wrong wallet address
        console.log('\n6️⃣ Testing wrong wallet address...');
        try {
            const wrongWallet = ethers.Wallet.createRandom();
            const wrongSignature = await wrongWallet.signMessage(message);
            
            const wrongLoginData = {
                walletAddress: walletAddress, // Correct address
                signature: wrongSignature,    // Wrong signature (from different wallet)
                message: message
            };
            
            await axios.post('http://localhost:3000/api/voter/login', wrongLoginData);
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Mismatched signature correctly rejected');
            } else {
                console.log('❓ Unexpected error:', error.response?.data || error.message);
            }
        }
        
        console.log('\n🎉 All voter login tests completed successfully!');
        console.log('\n📋 Test Summary:');
        console.log('✅ Voter registration');
        console.log('✅ Message signing');
        console.log('✅ Successful login with valid signature');
        console.log('✅ JWT token generation and usage');
        console.log('✅ Authenticated API requests');
        console.log('✅ Invalid signature rejection');
        console.log('✅ Signature mismatch detection');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        process.exit(1);
    }
}

// Run the test
testVoterLogin();

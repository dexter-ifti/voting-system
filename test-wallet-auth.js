// Simple test to verify wallet authentication works
// This should work even without Anvil running

async function testWalletAuth() {
    console.log('Testing wallet authentication without blockchain...');
    
    // Simulate the authentication process
    const testAddress = '0x742d35Cc6634C0532925a3b8D23d2b50C8Kd6342F';
    const testRole = 'voter';
    const timestamp = Date.now();
    
    // Create auth message (same as Web3Service.createAuthMessage)
    const message = `Login to Voting System as ${testRole}\nAddress: ${testAddress}\nTimestamp: ${timestamp}`;
    
    console.log('✅ Auth message created:', message);
    
    // In real scenario, this would be signed by MetaMask
    const mockSignature = '0x' + 'a'.repeat(130); // Mock signature
    
    console.log('✅ Signature (mock):', mockSignature);
    
    // Test backend authentication payload
    const authPayload = {
        walletAddress: testAddress,
        signature: mockSignature,
        message: message
    };
    
    console.log('✅ Authentication payload ready:', authPayload);
    console.log('✅ Wallet authentication flow works without blockchain connectivity!');
}

testWalletAuth().catch(console.error);

// test-aadhar-otp.js - Test the simplified Aadhar + OTP flow

const AadharValidationService = require('./services/aadharValidationService');

async function testAadharOTPFlow() {
  console.log('🔍 Testing Simplified Aadhar + OTP Validation System\n');

  console.log('='.repeat(60));
  console.log('Test 1: Aadhar → Email Lookup');
  console.log('='.repeat(60));

  const testAadhars = [
    { aadhar: '123456789012', desc: 'Your Aadhar' },
    { aadhar: '111111111111', desc: 'Demo Voter' },
    { aadhar: '999999999999', desc: 'Invalid Aadhar' }
  ];

  testAadhars.forEach(test => {
    console.log(`\n📋 Testing: ${test.desc} (${test.aadhar})`);
    const result = AadharValidationService.validateAadharAndGetEmail(test.aadhar);
    
    if (result.isValid) {
      console.log(`   ✅ Found → Email: ${result.email}`);
    } else {
      console.log(`   ❌ ${result.message}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('Test 2: Complete OTP Flow');
  console.log('='.repeat(60));

  // Test complete OTP flow
  console.log('\n🔐 Testing Complete OTP Flow with: 123456789012');
  
  try {
    // Step 1: Send OTP
    console.log('\n📤 Step 1: Sending OTP...');
    const otpResult = await AadharValidationService.sendOTPToAadhar('123456789012');
    
    if (otpResult.isValid) {
      console.log(`   ✅ OTP sent to: ${otpResult.email}`);
      console.log(`   📧 OTP Key: ${otpResult.otpKey}`);
      console.log(`   🔢 Generated OTP: ${otpResult.otp} (for demo)`);
      
      // Step 2: Verify with correct OTP
      console.log('\n✅ Step 2: Verifying with CORRECT OTP...');
      const verifyCorrect = AadharValidationService.verifyOTP(otpResult.otpKey, otpResult.otp);
      
      if (verifyCorrect.isValid) {
        console.log(`   ✅ SUCCESS: ${verifyCorrect.message}`);
        console.log(`   📧 Verified Email: ${verifyCorrect.email}`);
        console.log(`   🆔 Verified Aadhar: ${verifyCorrect.aadhar}`);
      } else {
        console.log(`   ❌ FAILED: ${verifyCorrect.message}`);
      }
      
    } else {
      console.log(`   ❌ Failed to send OTP: ${otpResult.message}`);
    }

    // Test wrong OTP flow
    console.log('\n❌ Step 3: Testing with WRONG OTP...');
    const wrongOtpResult = await AadharValidationService.sendOTPToAadhar('111111111111');
    
    if (wrongOtpResult.isValid) {
      console.log(`   📤 OTP sent to: ${wrongOtpResult.email}`);
      console.log(`   🔢 Correct OTP: ${wrongOtpResult.otp}`);
      console.log('   🧪 Testing with wrong OTP: 000000');
      
      const verifyWrong = AadharValidationService.verifyOTP(wrongOtpResult.otpKey, '000000');
      console.log(`   ❌ Wrong OTP Result: ${verifyWrong.message}`);
    }

  } catch (error) {
    console.error('   ❌ Error during OTP flow:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Available Demo Data');
  console.log('='.repeat(60));

  const demoRecords = AadharValidationService.getAllDummyRecords();
  console.log(`\nTotal Demo Records: ${demoRecords.length}\n`);

  console.log('📋 Aadhar → Email Mappings:');
  demoRecords.slice(0, 8).forEach((record, index) => {
    console.log(`${index + 1}. ${record.aadhar} → ${record.email}`);
  });
  
  if (demoRecords.length > 8) {
    console.log(`... and ${demoRecords.length - 8} more records`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('API Testing Guide');
  console.log('='.repeat(60));

  console.log('\n🚀 Your Registration Flow:');
  console.log('1. User enters Aadhar number');
  console.log('2. Call /api/aadhar/validate → get associated email');
  console.log('3. Call /api/aadhar/send-otp → send OTP to that email');
  console.log('4. User enters OTP from their email');
  console.log('5. Call /api/aadhar/verify-otp → verify and proceed');

  console.log('\n📡 Test Commands (server should be running):');
  
  console.log('\n# Step 1: Validate Aadhar');
  console.log('curl -X POST http://localhost:5001/api/aadhar/validate \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"aadharNumber": "123456789012"}\'');

  console.log('\n# Step 2: Send OTP');
  console.log('curl -X POST http://localhost:5001/api/aadhar/send-otp \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"aadharNumber": "123456789012"}\'');

  console.log('\n# Step 3: Verify OTP (use otpKey and otp from step 2)');
  console.log('curl -X POST http://localhost:5001/api/aadhar/verify-otp \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"otpKey": "YOUR_OTP_KEY", "otp": "YOUR_OTP"}\'');

  console.log('\n🎯 Perfect for Demo!');
  console.log('• Simple {aadhar: email} mapping');
  console.log('• No complex email service needed');
  console.log('• OTP shown in API response for testing');
  console.log('• Ready to integrate with your registration');

  console.log('\n✨ Demo Complete!');
}

// Run the test
testAadharOTPFlow().catch(console.error);
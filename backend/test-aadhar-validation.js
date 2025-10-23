// test-aadhar-validation.js - Demo script for Aadhar validation

const AadharValidationService = require('./services/aadharValidationService');

console.log('🔍 Testing Simplified Aadhar + OTP Validation System\n');

// Test cases
const testCases = [
  {
    name: 'Valid Aadhar - Your number',
    aadhar: '123456789012'
  },
  {
    name: 'Valid Aadhar - Demo voter',
    aadhar: '111111111111'
  },
  {
    name: 'Invalid format - too short',
    aadhar: '12345'
  },
  {
    name: 'Invalid format - contains letters',
    aadhar: '12345678901a'
  },
  {
    name: 'Valid format but not in database',
    aadhar: '999999999999'
  }
];

console.log('='.repeat(60));
console.log('Test 1: Aadhar Format Validation');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   Aadhar: ${testCase.aadhar}`);
  
  const formatResult = AadharValidationService.validateAadharFormat(testCase.aadhar);
  console.log(`   Format Valid: ${formatResult.isValid ? '✅' : '❌'}`);
  if (!formatResult.isValid) {
    console.log(`   Error: ${formatResult.message}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('Test 2: Aadhar → Email Lookup');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   Aadhar: ${testCase.aadhar}`);
  
  const result = AadharValidationService.validateAadharAndGetEmail(testCase.aadhar);
  console.log(`   Found: ${result.isValid ? '✅' : '❌'}`);
  if (result.isValid) {
    console.log(`   Email: ${result.email}`);
  } else {
    console.log(`   Error: ${result.message}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('Test 3: OTP Generation & Verification Flow');
console.log('='.repeat(60));

// Test OTP flow with valid Aadhar
console.log('\n🔐 Testing OTP Flow with: 123456789012');

const otpResult = await AadharValidationService.sendOTPToAadhar('123456789012');
if (otpResult.isValid) {
  console.log(`✅ OTP sent to: ${otpResult.email}`);
  console.log(`📧 OTP Key: ${otpResult.otpKey}`);
  console.log(`🔢 OTP (demo): ${otpResult.otp}`);
  
  // Test OTP verification
  console.log('\n🔍 Testing OTP Verification:');
  
  // Test with correct OTP
  const verifyResult = AadharValidationService.verifyOTP(otpResult.otpKey, otpResult.otp);
  console.log(`✅ Correct OTP: ${verifyResult.isValid ? 'VERIFIED' : 'FAILED'}`);
  if (verifyResult.isValid) {
    console.log(`   Message: ${verifyResult.message}`);
    console.log(`   Verified Email: ${verifyResult.email}`);
  }
  
  // Test with wrong OTP (generate new session first)
  const wrongOtpResult = await AadharValidationService.sendOTPToAadhar('111111111111');
  if (wrongOtpResult.isValid) {
    const wrongVerify = AadharValidationService.verifyOTP(wrongOtpResult.otpKey, '000000');
    console.log(`❌ Wrong OTP: ${wrongVerify.isValid ? 'VERIFIED' : 'FAILED'}`);
    console.log(`   Message: ${wrongVerify.message}`);
  }
} else {
  console.log(`❌ Failed to send OTP: ${otpResult.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('Demo Data Summary');
console.log('='.repeat(60));

const demoRecords = AadharValidationService.getAllDummyRecords();
console.log(`\nTotal Demo Records: ${demoRecords.length}\n`);

console.log('Available Demo Aadhar Numbers:');
demoRecords.forEach((record, index) => {
  console.log(`${index + 1}. ${record.aadhar} → ${record.email}`);
});

console.log('\n' + '='.repeat(60));
console.log('API Testing Commands');
console.log('='.repeat(60));

console.log('\n📡 Test API endpoints (make sure your server is running):');
console.log('\n1. Get all demo records:');
console.log('curl http://localhost:5001/api/aadhar/demo-records');

console.log('\n2. Validate Aadhar and get email:');
console.log('curl -X POST http://localhost:5001/api/aadhar/validate \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"aadharNumber": "123456789012"}\'');

console.log('\n3. Send OTP to Aadhar-associated email:');
console.log('curl -X POST http://localhost:5001/api/aadhar/send-otp \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"aadharNumber": "123456789012"}\'');

console.log('\n4. Verify OTP (use otpKey and otp from step 3):');
console.log('curl -X POST http://localhost:5001/api/aadhar/verify-otp \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"otpKey": "YOUR_OTP_KEY", "otp": "YOUR_OTP"}\'');

console.log('\n🎯 Your Simplified Flow:');
console.log('1. User enters Aadhar number');
console.log('2. System checks if Aadhar exists → returns associated email');
console.log('3. System sends OTP to that email');
console.log('4. User enters OTP to verify');
console.log('5. Registration proceeds with verified Aadhar');

console.log('\n💡 Demo Tip: Use 123456789012 with your email for testing!');

module.exports = { AadharValidationService };
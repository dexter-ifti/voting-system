// services/aadharValidationService.js

/**
 * Dummy Aadhar Database for Demo Purposes
 * Simple mapping: Aadhar Number → Email Address
 * In production, this would connect to actual government Aadhar database
 */
const DUMMY_AADHAR_DATA = [
  // Your email for testing
  { aadhar: "123456789012", email: "tiftikhar@student.iul.ac.in" },
  
  // Demo data for testing
  { aadhar: "234567890123", email: "john.doe@example.com" },
  { aadhar: "345678901234", email: "jane.smith@example.com" },
  { aadhar: "456789012345", email: "alice.johnson@example.com" },
  { aadhar: "567890123456", email: "bob.wilson@example.com" },
  { aadhar: "678901234567", email: "charlie.brown@example.com" },
  { aadhar: "789012345678", email: "diana.prince@example.com" },
  { aadhar: "890123456789", email: "edward.stark@example.com" },
  { aadhar: "901234567890", email: "fiona.green@example.com" },
  { aadhar: "012345678901", email: "george.martin@example.com" },
  
  // Easy demo numbers
  { aadhar: "111111111111", email: "voter1@demo.com" },
  { aadhar: "222222222222", email: "voter2@demo.com" },
  { aadhar: "333333333333", email: "candidate1@demo.com" },
  { aadhar: "444444444444", email: "candidate2@demo.com" },
  { aadhar: "555555555555", email: "admin@demo.com" }
];

class AadharValidationService {
  /**
   * Validate Aadhar number format
   */
  static validateAadharFormat(aadharNumber) {
    if (!aadharNumber) {
      return { isValid: false, message: "Aadhar number is required" };
    }

    // Remove spaces and hyphens
    const cleanAadhar = aadharNumber.replace(/\s|-/g, '');

    // Check if it's exactly 12 digits
    if (!/^\d{12}$/.test(cleanAadhar)) {
      return { isValid: false, message: "Aadhar number must be exactly 12 digits" };
    }

    return { isValid: true, cleanAadhar };
  }

  /**
   * Check if Aadhar exists and get associated email
   * This is the main validation method for your flow
   */
  static validateAadharAndGetEmail(aadharNumber) {
    const formatResult = this.validateAadharFormat(aadharNumber);
    
    if (!formatResult.isValid) {
      return formatResult;
    }

    const cleanAadhar = formatResult.cleanAadhar;
    const aadharRecord = DUMMY_AADHAR_DATA.find(record => record.aadhar === cleanAadhar);

    if (!aadharRecord) {
      return {
        isValid: false,
        message: "Aadhar number not found in records. Please check your Aadhar number."
      };
    }

    return {
      isValid: true,
      message: "Aadhar number found",
      email: aadharRecord.email,
      aadhar: aadharRecord.aadhar
    };
  }

  /**
   * Generate OTP for Aadhar verification
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  /**
   * Store OTP temporarily (in production, use Redis or database)
   */
  static otpStore = new Map();

  /**
   * Send OTP to email associated with Aadhar
   */
  static async sendOTPToAadhar(aadharNumber) {
    const validationResult = this.validateAadharAndGetEmail(aadharNumber);
    
    if (!validationResult.isValid) {
      return validationResult;
    }

    const otp = this.generateOTP();
    const otpKey = `${validationResult.aadhar}_${Date.now()}`;
    
    // Store OTP with 5-minute expiry
    this.otpStore.set(otpKey, {
      otp,
      email: validationResult.email,
      aadhar: validationResult.aadhar,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
      maxAttempts: 3
    });

    // In a real system, you would send email here
    // For demo, we'll just return the OTP and email
    return {
      isValid: true,
      message: "OTP sent successfully",
      email: validationResult.email,
      aadhar: validationResult.aadhar,
      otpKey,
      // For demo purposes - show OTP in development
      otp: otp
    };
  }

  /**
   * Verify OTP for Aadhar validation
   */
  static verifyOTP(otpKey, providedOTP) {
    const otpData = this.otpStore.get(otpKey);

    if (!otpData) {
      return {
        isValid: false,
        message: "Invalid or expired OTP session"
      };
    }

    // Check if expired
    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(otpKey);
      return {
        isValid: false,
        message: "OTP has expired. Please request a new one."
      };
    }

    // Check attempts
    if (otpData.attempts >= otpData.maxAttempts) {
      this.otpStore.delete(otpKey);
      return {
        isValid: false,
        message: "Maximum OTP attempts exceeded. Please request a new OTP."
      };
    }

    // Increment attempts
    otpData.attempts++;

    // Verify OTP
    if (otpData.otp !== providedOTP) {
      const attemptsLeft = otpData.maxAttempts - otpData.attempts;
      
      if (attemptsLeft <= 0) {
        this.otpStore.delete(otpKey);
        return {
          isValid: false,
          message: "Invalid OTP. Maximum attempts exceeded."
        };
      }
      
      return {
        isValid: false,
        message: `Invalid OTP. ${attemptsLeft} attempts remaining.`
      };
    }

    // OTP verified successfully
    const result = {
      isValid: true,
      message: "Aadhar verified successfully",
      email: otpData.email,
      aadhar: otpData.aadhar
    };

    // Clean up
    this.otpStore.delete(otpKey);
    
    return result;
  }

  /**
   * Check if Aadhar is already used by another user
   */
  static async checkAadharAvailability(aadharNumber, userType, userId = null) {
    const Voter = require('../models/Voter');
    const Candidate = require('../models/Candidate');

    const formatResult = this.validateAadharFormat(aadharNumber);
    if (!formatResult.isValid) {
      return formatResult;
    }

    const cleanAadhar = formatResult.cleanAadhar;

    try {
      // Check in both Voter and Candidate collections
      const voterQuery = userId ? 
        { aadharNumber: cleanAadhar, _id: { $ne: userId } } : 
        { aadharNumber: cleanAadhar };
      
      const candidateQuery = userId ? 
        { aadharNumber: cleanAadhar, _id: { $ne: userId } } : 
        { aadharNumber: cleanAadhar };

      const [existingVoter, existingCandidate] = await Promise.all([
        Voter.findOne(voterQuery),
        Candidate.findOne(candidateQuery)
      ]);

      if (existingVoter) {
        return {
          isValid: false,
          message: "This Aadhar number is already registered as a voter"
        };
      }

      if (existingCandidate) {
        return {
          isValid: false,
          message: "This Aadhar number is already registered as a candidate"
        };
      }

      return {
        isValid: true,
        message: "Aadhar number is available"
      };

    } catch (error) {
      return {
        isValid: false,
        message: "Error checking Aadhar availability: " + error.message
      };
    }
  }

  /**
   * Get all dummy Aadhar records (for admin/demo purposes)
   */
  static getAllDummyRecords() {
    return DUMMY_AADHAR_DATA.map(record => ({
      aadhar: `${record.aadhar.substring(0, 4)}-${record.aadhar.substring(4, 8)}-${record.aadhar.substring(8)}`,
      email: record.email
    }));
  }

  /**
   * Add new dummy record (for testing)
   */
  static addDummyRecord(aadhar, email) {
    const formatResult = this.validateAadharFormat(aadhar);
    if (!formatResult.isValid) {
      return formatResult;
    }

    // Check if already exists
    const exists = DUMMY_AADHAR_DATA.find(record => 
      record.aadhar === formatResult.cleanAadhar || 
      record.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return {
        isValid: false,
        message: "Aadhar number or email already exists in dummy data"
      };
    }

    DUMMY_AADHAR_DATA.push({
      aadhar: formatResult.cleanAadhar,
      email: email.toLowerCase()
    });

    return {
      isValid: true,
      message: "Dummy record added successfully"
    };
  }
}

module.exports = AadharValidationService;
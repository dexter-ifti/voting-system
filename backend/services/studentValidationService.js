// services/studentValidationService.js
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');

/**
 * Dummy College Database for Demo Purposes
 * In production, this would connect to actual Student Information System (SIS)
 * Structure: Student ID → { email, name, enrollmentYear, department, program, isActive }
 */
const DUMMY_STUDENT_DATA = [
  { 
    studentId: "IU2021001234", 
    email: "tiftikhar@student.iul.ac.in",
    name: "Taha Iftikhar",
    enrollmentYear: 2021,
    department: "Computer Science & Engineering",
    program: "Undergraduate",
    isActive: true
  },
  { 
    studentId: "IU2021005678", 
    email: "farmmd@student.iul.ac.in",
    name: "Mohd Farhan Khan",
    enrollmentYear: 2021,
    department: "Computer Science & Engineering",
    program: "Undergraduate",
    isActive: true
  },
  { 
    studentId: "IU2022001111", 
    email: "voter1@student.iul.ac.in",
    name: "Demo Voter 1",
    enrollmentYear: 2022,
    department: "Computer Science & Engineering",
    program: "Undergraduate",
    isActive: true
  },
  { 
    studentId: "IU2022002222", 
    email: "voter2@student.iul.ac.in",
    name: "Demo Voter 2",
    enrollmentYear: 2022,
    department: "Electrical Engineering",
    program: "Undergraduate",
    isActive: true
  },
  { 
    studentId: "IU2020003333", 
    email: "candidate1@student.iul.ac.in",
    name: "Demo Candidate 1",
    enrollmentYear: 2020,
    department: "Computer Science & Engineering",
    program: "Undergraduate",
    isActive: true
  }
];

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

class StudentValidationService {
  /**
   * Validate Student ID format
   */
  static validateStudentIdFormat(studentId) {
    if (!studentId) {
      return { isValid: false, message: "Student ID is required" };
    }

    const cleanId = studentId.toUpperCase().trim();
    
    // Adjust regex based on your institution's format
    if (!/^[A-Z]{2}\d{10}$/.test(cleanId)) {
      return { 
        isValid: false, 
        message: "Student ID must be in format: XX0000000000 (2 letters + 10 digits)" 
      };
    }

    return { isValid: true, cleanId };
  }

  /**
   * Check if Student ID exists in college database and get associated data
   */
  static validateStudentIdAndGetData(studentId) {
    const formatResult = this.validateStudentIdFormat(studentId);
    if (!formatResult.isValid) {
      return formatResult;
    }

    const cleanId = formatResult.cleanId;
    const studentRecord = DUMMY_STUDENT_DATA.find(
      record => record.studentId === cleanId
    );

    if (!studentRecord) {
      return {
        isValid: false,
        message: "Student ID not found in college records. Please verify your enrollment."
      };
    }

    if (!studentRecord.isActive) {
      return {
        isValid: false,
        message: "Student enrollment is inactive. Please contact administration."
      };
    }

    return {
      isValid: true,
      message: "Student ID verified",
      email: studentRecord.email,
      studentId: studentRecord.studentId,
      name: studentRecord.name,
      enrollmentYear: studentRecord.enrollmentYear,
      department: studentRecord.department,
      program: studentRecord.program
    };
  }

  /**
   * Generate OTP for student verification
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to institutional email
   */
  static async sendOTPToStudent(studentId) {
    const validationResult = this.validateStudentIdAndGetData(studentId);
    if (!validationResult.isValid) {
      return validationResult;
    }

    const otp = this.generateOTP();
    const otpKey = `${validationResult.studentId}_${Date.now()}`;

    // Store OTP with 5-minute expiration
    otpStore.set(otpKey, {
      otp,
      studentId: validationResult.studentId,
      email: validationResult.email,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
      maxAttempts: 3
    });

    console.log(`📧 OTP for ${validationResult.studentId}: ${otp}`);
    console.log(`📨 Would send to: ${validationResult.email}`);

    return {
      isValid: true,
      message: "OTP sent to your institutional email",
      email: validationResult.email,
      studentId: validationResult.studentId,
      otpKey,
      otp // Remove in production
    };
  }

  /**
   * Verify OTP for student validation
   */
  static verifyOTP(otpKey, otp) {
    const otpData = otpStore.get(otpKey);

    if (!otpData) {
      return {
        isValid: false,
        message: "Invalid or expired OTP session"
      };
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(otpKey);
      return {
        isValid: false,
        message: "OTP has expired. Please request a new one."
      };
    }

    if (otpData.attempts >= otpData.maxAttempts) {
      otpStore.delete(otpKey);
      return {
        isValid: false,
        message: "Maximum verification attempts exceeded"
      };
    }

    otpData.attempts++;

    if (otpData.otp !== otp) {
      const attemptsLeft = otpData.maxAttempts - otpData.attempts;

      if (attemptsLeft <= 0) {
        otpStore.delete(otpKey);
        return {
          isValid: false,
          message: "Invalid OTP. Maximum attempts exceeded."
        };
      }

      return {
        isValid: false,
        message: `Incorrect OTP. ${attemptsLeft} attempts remaining.`
      };
    }

    // OTP verified successfully
    const result = {
      isValid: true,
      message: "Student verified successfully",
      email: otpData.email,
      studentId: otpData.studentId
    };

    otpStore.delete(otpKey);
    return result;
  }

  /**
   * Check if Student ID is already registered
   */
  static async checkStudentIdAvailability(studentId, userType, userId = null) {
    const formatResult = this.validateStudentIdFormat(studentId);
    if (!formatResult.isValid) {
      return formatResult;
    }

    const cleanId = formatResult.cleanId;

    try {
      const voterQuery = userId ? 
        { studentId: cleanId, _id: { $ne: userId } } : 
        { studentId: cleanId };
      
      const candidateQuery = userId ? 
        { studentId: cleanId, _id: { $ne: userId } } : 
        { studentId: cleanId };

      const [existingVoter, existingCandidate] = await Promise.all([
        Voter.findOne(voterQuery),
        Candidate.findOne(candidateQuery)
      ]);

      if (existingVoter) {
        return {
          isValid: false,
          message: "This Student ID is already registered as a voter"
        };
      }

      if (existingCandidate) {
        return {
          isValid: false,
          message: "This Student ID is already registered as a candidate"
        };
      }

      return {
        isValid: true,
        message: "Student ID is available"
      };

    } catch (error) {
      return {
        isValid: false,
        message: "Error checking Student ID availability: " + error.message
      };
    }
  }

  /**
   * Get all dummy records (for demo/testing)
   */
  static getAllDummyRecords() {
    return DUMMY_STUDENT_DATA.map(record => ({
      studentId: record.studentId,
      email: record.email,
      name: record.name,
      department: record.department
    }));
  }

  /**
   * Add dummy record (for demo/testing)
   */
  static addDummyRecord(studentId, email, name, enrollmentYear, department, program) {
    const formatResult = this.validateStudentIdFormat(studentId);
    if (!formatResult.isValid) {
      return formatResult;
    }

    const exists = DUMMY_STUDENT_DATA.find(r => r.studentId === formatResult.cleanId);
    if (exists) {
      return {
        isValid: false,
        message: "Student ID already exists in demo database"
      };
    }

    DUMMY_STUDENT_DATA.push({
      studentId: formatResult.cleanId,
      email,
      name,
      enrollmentYear,
      department,
      program,
      isActive: true
    });

    return {
      isValid: true,
      message: "Demo student record added successfully"
    };
  }
}

module.exports = StudentValidationService;

// routes/studentValidation.js
const express = require('express');
const router = express.Router();
const StudentValidationService = require('../services/studentValidationService');

/**
 * @route   POST /api/student/validate
 * @desc    Check if Student ID exists in college database
 * @access  Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const result = StudentValidationService.validateStudentIdAndGetData(studentId);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student ID is valid',
      data: {
        studentId: result.studentId,
        email: result.email,
        name: result.name,
        department: result.department,
        enrollmentYear: result.enrollmentYear,
        program: result.program
      }
    });

  } catch (error) {
    console.error('Student validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/student/send-otp
 * @desc    Send OTP to institutional email
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const result = await StudentValidationService.sendOTPToStudent(studentId);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        email: result.email,
        studentId: result.studentId,
        otpKey: result.otpKey,
        // For demo purposes only
        ...(result.otp && { otp: result.otp })
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/student/verify-otp
 * @desc    Verify OTP for student validation
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { otpKey, otp } = req.body;

    if (!otpKey || !otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP key and OTP are required'
      });
    }

    const result = StudentValidationService.verifyOTP(otpKey, otp);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        isValid: result.isValid,
        studentId: result.studentId,
        email: result.email
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/student/check-availability
 * @desc    Check if Student ID is already registered
 * @access  Public
 */
router.post('/check-availability', async (req, res) => {
  try {
    const { studentId, userType } = req.body;

    if (!studentId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and user type are required'
      });
    }

    if (!['voter', 'candidate'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'User type must be either voter or candidate'
      });
    }

    const result = await StudentValidationService.checkStudentIdAvailability(studentId, userType);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Student ID availability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/student/demo-records
 * @desc    Get all dummy student records for demo
 * @access  Public (for demo only)
 */
router.get('/demo-records', (req, res) => {
  try {
    const records = StudentValidationService.getAllDummyRecords();
    
    res.status(200).json({
      success: true,
      message: 'Demo student records retrieved',
      data: records,
      count: records.length
    });

  } catch (error) {
    console.error('Demo records error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/student/add-demo-record
 * @desc    Add new dummy student record for testing
 * @access  Public (for demo only)
 */
router.post('/add-demo-record', (req, res) => {
  try {
    const { studentId, email, name, enrollmentYear, department, program } = req.body;

    if (!studentId || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, email, and name are required'
      });
    }

    const result = StudentValidationService.addDummyRecord(
      studentId, email, name, 
      enrollmentYear || 2024, 
      department || 'Not Specified', 
      program || 'Undergraduate'
    );

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(201).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Add demo record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/student/health
 * @desc    Health check for student validation service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student validation service is running',
    totalDummyRecords: StudentValidationService.getAllDummyRecords().length,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

// routes/aadharValidation.js
const express = require('express');
const router = express.Router();
const AadharValidationService = require('../services/aadharValidationService');

/**
 * @route   POST /api/aadhar/validate
 * @desc    Check if Aadhar exists and get associated email
 * @access  Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { aadharNumber } = req.body;

    if (!aadharNumber) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number is required'
      });
    }

    const result = AadharValidationService.validateAadharAndGetEmail(aadharNumber);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Aadhar number is valid',
      data: {
        aadhar: result.aadhar,
        email: result.email
      }
    });

  } catch (error) {
    console.error('Aadhar validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/aadhar/send-otp
 * @desc    Send OTP to email associated with Aadhar
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { aadharNumber } = req.body;

    if (!aadharNumber) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number is required'
      });
    }

    const result = await AadharValidationService.sendOTPToAadhar(aadharNumber);

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
        aadhar: result.aadhar,
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
 * @route   POST /api/aadhar/verify-otp
 * @desc    Verify OTP for Aadhar validation
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

    const result = AadharValidationService.verifyOTP(otpKey, otp);

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
        aadhar: result.aadhar,
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
 * @route   POST /api/aadhar/check-availability
 * @desc    Check if Aadhar is already registered
 * @access  Public
 */
router.post('/check-availability', async (req, res) => {
  try {
    const { aadharNumber, userType } = req.body;

    if (!aadharNumber || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number and user type are required'
      });
    }

    if (!['voter', 'candidate'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'User type must be either voter or candidate'
      });
    }

    const result = await AadharValidationService.checkAadharAvailability(aadharNumber, userType);

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
    console.error('Aadhar availability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/aadhar/demo-records
 * @desc    Get all dummy Aadhar records for demo
 * @access  Public (for demo only)
 */
router.get('/demo-records', (req, res) => {
  try {
    const records = AadharValidationService.getAllDummyRecords();
    
    res.status(200).json({
      success: true,
      message: 'Demo Aadhar records retrieved',
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
 * @route   POST /api/aadhar/add-demo-record
 * @desc    Add new dummy Aadhar record for testing
 * @access  Public (for demo only)
 */
router.post('/add-demo-record', (req, res) => {
  try {
    const { aadhar, email } = req.body;

    if (!aadhar || !email) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number and email are required'
      });
    }

    const result = AadharValidationService.addDummyRecord(aadhar, email);

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
 * @route   GET /api/aadhar/health
 * @desc    Health check for Aadhar validation service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Aadhar validation service is running',
    totalDummyRecords: AadharValidationService.getAllDummyRecords().length,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
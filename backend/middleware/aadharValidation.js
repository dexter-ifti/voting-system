// middleware/aadharValidation.js

const AadharValidationService = require('../services/aadharValidationService');

/**
 * Middleware to validate Aadhar number in registration requests
 */
const validateAadharRegistration = async (req, res, next) => {
  try {
    const { aadharNumber, email } = req.body;
    // Determine user type from the request URL
    const userType = req.originalUrl.includes('/voter/') ? 'voter' : 'candidate';

    // Check if Aadhar number is provided
    if (!aadharNumber) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number is required for registration'
      });
    }

    // Validate Aadhar format
    const formatResult = AadharValidationService.validateAadharFormat(aadharNumber);
    if (!formatResult.isValid) {
      return res.status(400).json({
        success: false,
        message: formatResult.message
      });
    }

    // Check if Aadhar exists in dummy database
    const validationResult = AadharValidationService.validateAadharAndGetEmail(aadharNumber);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }

    // If email is provided, validate it matches Aadhar records
    if (email && email.toLowerCase() != validationResult.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Email does not match the one associated with this Aadhar number. Expected: ${validationResult.email}`
      });
    }

    // Store Aadhar record data for use in registration
    req.aadharData = {
      aadhar: validationResult.aadhar,
      email: validationResult.email
    };

    // Check if Aadhar is already registered in either voters or candidates
    const availabilityResult = await AadharValidationService.checkAadharAvailability(aadharNumber, userType);
    if (!availabilityResult.isValid) {
      return res.status(409).json({
        success: false,
        message: availabilityResult.message,
        error: 'AADHAR_ALREADY_REGISTERED'
      });
    }

    // Clean Aadhar number for storage
    req.body.aadharNumber = formatResult.cleanAadhar;

    next();
  } catch (error) {
    console.error('Aadhar validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating Aadhar number'
    });
  }
};

/**
 * Middleware to validate Aadhar number in update requests
 */
const validateAadharUpdate = async (req, res, next) => {
  try {
    const { aadharNumber, email } = req.body;
    const userType = req.path.includes('voter') ? 'voter' : 'candidate';
    const userId = req.params.id || req.user?.id;

    // If no Aadhar number in update, skip validation
    if (!aadharNumber) {
      return next();
    }

    // Validate Aadhar format
    const formatResult = AadharValidationService.validateAadharFormat(aadharNumber);
    if (!formatResult.isValid) {
      return res.status(400).json({
        success: false,
        message: formatResult.message
      });
    }

    // Check if Aadhar exists in dummy database
    const existsResult = AadharValidationService.validateAadharExists(aadharNumber);
    if (!existsResult.isValid) {
      return res.status(400).json({
        success: false,
        message: existsResult.message
      });
    }

    // If email is provided, validate it matches Aadhar records
    if (email) {
      const emailValidationResult = AadharValidationService.validateAadharWithEmail(aadharNumber, email);
      if (!emailValidationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: emailValidationResult.message
        });
      }
    }

    // Check if Aadhar is available (excluding current user)
    const availabilityResult = await AadharValidationService.checkAadharAvailability(aadharNumber, userType, userId);
    if (!availabilityResult.isValid) {
      return res.status(400).json({
        success: false,
        message: availabilityResult.message
      });
    }

    // Clean Aadhar number for storage
    req.body.aadharNumber = formatResult.cleanAadhar;

    next();
  } catch (error) {
    console.error('Aadhar update validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating Aadhar number for update'
    });
  }
};

/**
 * Helper function to auto-populate user data from Aadhar
 */
const populateFromAadhar = (req, res, next) => {
  if (req.aadharData && !req.body.autoPopulate) {
    // Don't auto-populate unless explicitly requested
    return next();
  }

  if (req.aadharData) {
    // Auto-populate name and email if not provided
    if (!req.body.name && req.aadharData.name) {
      req.body.name = req.aadharData.name;
    }
    if (!req.body.email && req.aadharData.email) {
      req.body.email = req.aadharData.email;
    }
    if (!req.body.phone && req.aadharData.phone) {
      req.body.phone = req.aadharData.phone;
    }
  }

  next();
};

module.exports = {
  validateAadharRegistration,
  validateAadharUpdate,
  populateFromAadhar
};
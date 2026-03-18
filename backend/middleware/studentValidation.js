// middleware/studentValidation.js

const StudentValidationService = require('../services/studentValidationService');

/**
 * Middleware to validate Student ID in registration requests
 */
const validateStudentRegistration = async (req, res, next) => {
  try {
    const { studentId, email } = req.body;
    // Determine user type from the request URL
    const userType = req.originalUrl.includes('/voter/') ? 'voter' : 'candidate';

    // Check if Student ID is provided
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required for registration'
      });
    }

    // Validate Student ID format
    const formatResult = StudentValidationService.validateStudentIdFormat(studentId);
    if (!formatResult.isValid) {
      return res.status(400).json({
        success: false,
        message: formatResult.message
      });
    }

    // Check if Student ID exists in college database
    const validationResult = StudentValidationService.validateStudentIdAndGetData(studentId);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }

    // If email is provided, validate it matches student records
    if (email && email.toLowerCase() != validationResult.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Email does not match the one associated with this Student ID. Expected: ${validationResult.email}`
      });
    }

    // Store student record data for use in registration
    req.studentData = {
      studentId: validationResult.studentId,
      email: validationResult.email,
      name: validationResult.name,
      enrollmentYear: validationResult.enrollmentYear,
      department: validationResult.department,
      program: validationResult.program
    };

    // Check if Student ID is already registered in either voters or candidates
    const availabilityResult = await StudentValidationService.checkStudentIdAvailability(studentId, userType);
    if (!availabilityResult.isValid) {
      return res.status(409).json({
        success: false,
        message: availabilityResult.message,
        error: 'STUDENT_ID_ALREADY_REGISTERED'
      });
    }

    // Clean Student ID for storage
    req.body.studentId = formatResult.cleanId;

    next();
  } catch (error) {
    console.error('Student validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating Student ID'
    });
  }
};

/**
 * Middleware to validate Student ID in update requests
 */
const validateStudentUpdate = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const userType = req.path.includes('voter') ? 'voter' : 'candidate';
    const userId = req.params.id || req.user?.id;

    // If no Student ID in update, skip validation
    if (!studentId) {
      return next();
    }

    // Validate Student ID format
    const formatResult = StudentValidationService.validateStudentIdFormat(studentId);
    if (!formatResult.isValid) {
      return res.status(400).json({
        success: false,
        message: formatResult.message
      });
    }

    // Check if Student ID exists in college database
    const validationResult = StudentValidationService.validateStudentIdAndGetData(studentId);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }

    // Check if Student ID is available (excluding current user)
    const availabilityResult = await StudentValidationService.checkStudentIdAvailability(studentId, userType, userId);
    if (!availabilityResult.isValid) {
      return res.status(400).json({
        success: false,
        message: availabilityResult.message
      });
    }

    // Clean Student ID for storage
    req.body.studentId = formatResult.cleanId;

    next();
  } catch (error) {
    console.error('Student update validation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating Student ID for update'
    });
  }
};

/**
 * Helper function to auto-populate user data from student records
 */
const populateFromStudent = (req, res, next) => {
  if (req.studentData && !req.body.autoPopulate) {
    // Don't auto-populate unless explicitly requested
    return next();
  }

  if (req.studentData) {
    // Auto-populate name and email if not provided
    if (!req.body.name && req.studentData.name) {
      req.body.name = req.studentData.name;
    }
    if (!req.body.email && req.studentData.email) {
      req.body.email = req.studentData.email;
    }
  }

  next();
};

module.exports = {
  validateStudentRegistration,
  validateStudentUpdate,
  populateFromStudent
};

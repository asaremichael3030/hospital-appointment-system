// ============================================
// AUTHENTICATION ROUTES - FULL VERSION
// ============================================

const express = require('express');
const router = express.Router();

const {
    register,
    login,
    logout,
    getCurrentUser,
    checkSession,
    forgotPassword,
    resetPassword,
    changePassword
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');

// ============================================
// PUBLIC ROUTES
// ============================================

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Forgot Password
router.post('/forgot-password', forgotPassword);

// Reset Password
router.post('/reset-password', resetPassword);

// ============================================
// PROTECTED ROUTES
// ============================================

// Logout
router.post('/logout', logout);

// Get current user
router.get('/me', verifyToken, getCurrentUser);

// Check session
router.get('/check-session', verifyToken, checkSession);

// Change password (requires login)
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
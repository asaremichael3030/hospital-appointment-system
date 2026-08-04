// ============================================
// APPOINTMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getAppointments,
    bookAppointment,
    cancelAppointment,
    getAdminAppointments,
    approveAppointment,
    rejectAppointment
} = require('../controllers/appointmentController');

// Import middleware
const { verifyToken, isPatient, isAdmin } = require('../middleware/authMiddleware');

// ============================================
// PATIENT ROUTES
// ============================================

// GET user's own appointments
router.get('/', verifyToken, getAppointments);

// Book appointment (patient only)
router.post('/', verifyToken, isPatient, bookAppointment);

// Cancel appointment (patient only)
router.delete('/:id', verifyToken, isPatient, cancelAppointment);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all appointments (admin only)
router.get('/admin', verifyToken, isAdmin, getAdminAppointments);

// Approve appointment (admin only)
router.put('/:id/approve', verifyToken, isAdmin, approveAppointment);

// Reject appointment (admin only)
router.put('/:id/reject', verifyToken, isAdmin, rejectAppointment);

module.exports = router;
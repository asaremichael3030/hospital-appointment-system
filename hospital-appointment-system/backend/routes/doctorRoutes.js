// ============================================
// DOCTOR ROUTES - JWT VERSION
// ============================================

const express = require('express');
const router = express.Router();

const {
    getDoctors,
    getDoctorById,
    addDoctor,
    updateDoctor,
    deleteDoctor
} = require('../controllers/doctorController');

const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ============================================
// GET ALL DOCTORS (Protected)
// ============================================
router.get('/', verifyToken, getDoctors);

// ============================================
// GET SINGLE DOCTOR (Protected)
// ============================================
router.get('/:id', verifyToken, getDoctorById);

// ============================================
// ADD NEW DOCTOR (Admin only)
// ============================================
router.post('/', verifyToken, isAdmin, addDoctor);

// ============================================
// UPDATE DOCTOR (Admin only)
// ============================================
router.put('/:id', verifyToken, isAdmin, updateDoctor);

// ============================================
// DELETE DOCTOR (Admin only)
// ============================================
router.delete('/:id', verifyToken, isAdmin, deleteDoctor);

module.exports = router;
// ============================================
// DOCTOR CONTROLLER - JWT VERSION
// ============================================
// This file handles all doctor-related operations
// - Get all doctors
// - Add a new doctor (admin only)
// - Update a doctor (admin only)
// - Delete a doctor (admin only)
// ============================================

const pool = require('../config/db');

// ============================================
// GET ALL DOCTORS
// ============================================
// GET /api/doctors
// Returns a list of all doctors
// Accessible by any logged-in user
// ============================================

const getDoctors = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM doctors ORDER BY created_at DESC'
        );

        res.json({
            doctors: result.rows
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching doctors'
        });
    }
};

// ============================================
// GET SINGLE DOCTOR
// ============================================
// GET /api/doctors/:id
// Returns a single doctor by ID
// ============================================

const getDoctorById = async (req, res) => {
    try {
        const doctorId = req.params.id;

        const result = await pool.query(
            'SELECT * FROM doctors WHERE id = $1',
            [doctorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Doctor not found'
            });
        }

        res.json({
            doctor: result.rows[0]
        });

    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching the doctor'
        });
    }
};

// ============================================
// ADD NEW DOCTOR
// ============================================
// POST /api/doctors
// Adds a new doctor to the system
// Admin only
// ============================================

const addDoctor = async (req, res) => {
    try {
        const { fullname, specialty, phone, email, available_days } = req.body;

        if (!fullname || !specialty || !phone || !email) {
            return res.status(400).json({
                error: 'Please provide fullname, specialty, phone, and email'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Please provide a valid email address'
            });
        }

        const existingDoctor = await pool.query(
            'SELECT * FROM doctors WHERE email = $1',
            [email]
        );

        if (existingDoctor.rows.length > 0) {
            return res.status(400).json({
                error: 'A doctor with this email already exists'
            });
        }

        const result = await pool.query(
            `INSERT INTO doctors (fullname, specialty, phone, email, available_days) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [fullname, specialty, phone, email, available_days || null]
        );

        res.status(201).json({
            message: 'Doctor added successfully!',
            doctor: result.rows[0]
        });

    } catch (error) {
        console.error('Add doctor error:', error);
        res.status(500).json({
            error: 'An error occurred while adding the doctor'
        });
    }
};

// ============================================
// UPDATE DOCTOR
// ============================================
// PUT /api/doctors/:id
// Updates an existing doctor's information
// Admin only
// ============================================

const updateDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const { fullname, specialty, phone, email, available_days } = req.body;

        if (!fullname || !specialty || !phone || !email) {
            return res.status(400).json({
                error: 'Please provide fullname, specialty, phone, and email'
            });
        }

        const doctorExists = await pool.query(
            'SELECT * FROM doctors WHERE id = $1',
            [doctorId]
        );

        if (doctorExists.rows.length === 0) {
            return res.status(404).json({
                error: 'Doctor not found'
            });
        }

        const result = await pool.query(
            `UPDATE doctors 
             SET fullname = $1, specialty = $2, phone = $3, email = $4, available_days = $5
             WHERE id = $6 
             RETURNING *`,
            [fullname, specialty, phone, email, available_days || null, doctorId]
        );

        res.json({
            message: 'Doctor updated successfully!',
            doctor: result.rows[0]
        });

    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            error: 'An error occurred while updating the doctor'
        });
    }
};

// ============================================
// DELETE DOCTOR
// ============================================
// DELETE /api/doctors/:id
// Deletes a doctor from the system
// Admin only
// ============================================

const deleteDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;

        const doctorExists = await pool.query(
            'SELECT * FROM doctors WHERE id = $1',
            [doctorId]
        );

        if (doctorExists.rows.length === 0) {
            return res.status(404).json({
                error: 'Doctor not found'
            });
        }

        await pool.query(
            'DELETE FROM doctors WHERE id = $1',
            [doctorId]
        );

        res.json({
            message: 'Doctor deleted successfully!'
        });

    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            error: 'An error occurred while deleting the doctor'
        });
    }
};

// ============================================
// EXPORT CONTROLLER FUNCTIONS
// ============================================

module.exports = {
    getDoctors,
    getDoctorById,
    addDoctor,
    updateDoctor,
    deleteDoctor
};
// ============================================
// APPOINTMENT CONTROLLER
// ============================================
// This file handles all appointment-related operations
// - Get user's appointments
// - Book a new appointment
// - Cancel an appointment
// - Get all appointments (admin)
// - Approve appointment (admin)
// - Reject appointment (admin)
// ============================================

const pool = require('../config/db');

// ============================================
// GET USER'S APPOINTMENTS
// ============================================
// GET /api/appointments
// Returns all appointments for the logged-in user
// ============================================

const getAppointments = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT a.*, d.fullname as doctor_name, d.specialty 
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.patient_id = $1
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
            [userId]
        );

        res.json({
            appointments: result.rows
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching appointments'
        });
    }
};

// ============================================
// BOOK APPOINTMENT
// ============================================
// POST /api/appointments
// Books a new appointment
// ============================================

const bookAppointment = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { doctor_id, appointment_date, appointment_time } = req.body;

        if (!doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({
                error: 'Please provide doctor_id, appointment_date, and appointment_time'
            });
        }

        const doctorExists = await pool.query(
            'SELECT * FROM doctors WHERE id = $1',
            [doctor_id]
        );

        if (doctorExists.rows.length === 0) {
            return res.status(404).json({
                error: 'Doctor not found'
            });
        }

        const existingAppointment = await pool.query(
            `SELECT * FROM appointments 
             WHERE doctor_id = $1 
             AND appointment_date = $2 
             AND appointment_time = $3 
             AND status != 'cancelled'`,
            [doctor_id, appointment_date, appointment_time]
        );

        if (existingAppointment.rows.length > 0) {
            return res.status(400).json({
                error: 'This time slot is already booked. Please choose another time.'
            });
        }

        const result = await pool.query(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) 
             VALUES ($1, $2, $3, $4, 'pending') 
             RETURNING *`,
            [patientId, doctor_id, appointment_date, appointment_time]
        );

        const doctor = doctorExists.rows[0];

        res.status(201).json({
            message: 'Appointment booked successfully!',
            appointment: {
                ...result.rows[0],
                doctor_name: doctor.fullname
            }
        });

    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({
            error: 'An error occurred while booking the appointment'
        });
    }
};

// ============================================
// CANCEL APPOINTMENT
// ============================================
// DELETE /api/appointments/:id
// Cancels an appointment
// ============================================

const cancelAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const appointmentId = req.params.id;

        const appointment = await pool.query(
            'SELECT * FROM appointments WHERE id = $1',
            [appointmentId]
        );

        if (appointment.rows.length === 0) {
            return res.status(404).json({
                error: 'Appointment not found'
            });
        }

        if (appointment.rows[0].patient_id !== userId) {
            return res.status(403).json({
                error: 'You are not authorized to cancel this appointment'
            });
        }

        if (appointment.rows[0].status === 'cancelled') {
            return res.status(400).json({
                error: 'This appointment is already cancelled'
            });
        }

        await pool.query(
            'UPDATE appointments SET status = $1 WHERE id = $2',
            ['cancelled', appointmentId]
        );

        res.json({
            message: 'Appointment cancelled successfully!'
        });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            error: 'An error occurred while cancelling the appointment'
        });
    }
};

// ============================================
// GET ALL APPOINTMENTS (ADMIN ONLY)
// ============================================
// GET /api/appointments/admin
// Returns all appointments with patient and doctor names
// ============================================

const getAdminAppointments = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Admin access required'
            });
        }

        const result = await pool.query(
            `SELECT a.*, 
                    u.fullname as patient_name, 
                    d.fullname as doctor_name,
                    u.email as patient_email,
                    d.email as doctor_email
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             JOIN doctors d ON a.doctor_id = d.id
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`
        );

        res.json({
            appointments: result.rows
        });
    } catch (error) {
        console.error('Get admin appointments error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching appointments'
        });
    }
};

// ============================================
// APPROVE APPOINTMENT (ADMIN ONLY)
// ============================================
// PUT /api/appointments/:id/approve
// ============================================

const approveAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Admin access required'
            });
        }

        const appointment = await pool.query(
            'SELECT * FROM appointments WHERE id = $1',
            [appointmentId]
        );

        if (appointment.rows.length === 0) {
            return res.status(404).json({
                error: 'Appointment not found'
            });
        }

        if (appointment.rows[0].status !== 'pending') {
            return res.status(400).json({
                error: 'Only pending appointments can be approved'
            });
        }

        await pool.query(
            'UPDATE appointments SET status = $1 WHERE id = $2',
            ['approved', appointmentId]
        );

        res.json({
            message: 'Appointment approved successfully!'
        });

    } catch (error) {
        console.error('Approve appointment error:', error);
        res.status(500).json({
            error: 'An error occurred while approving the appointment'
        });
    }
};

// ============================================
// REJECT APPOINTMENT (ADMIN ONLY)
// ============================================
// PUT /api/appointments/:id/reject
// ============================================

const rejectAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Admin access required'
            });
        }

        const appointment = await pool.query(
            'SELECT * FROM appointments WHERE id = $1',
            [appointmentId]
        );

        if (appointment.rows.length === 0) {
            return res.status(404).json({
                error: 'Appointment not found'
            });
        }

        if (appointment.rows[0].status !== 'pending') {
            return res.status(400).json({
                error: 'Only pending appointments can be rejected'
            });
        }

        await pool.query(
            'UPDATE appointments SET status = $1 WHERE id = $2',
            ['cancelled', appointmentId]
        );

        res.json({
            message: 'Appointment rejected successfully!'
        });

    } catch (error) {
        console.error('Reject appointment error:', error);
        res.status(500).json({
            error: 'An error occurred while rejecting the appointment'
        });
    }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
    getAppointments,
    bookAppointment,
    cancelAppointment,
    getAdminAppointments,
    approveAppointment,
    rejectAppointment
};
-- ============================================
-- HOSPITAL APPOINTMENT SYSTEM - DATABASE SCHEMA
-- ============================================
-- This file creates all the tables we need for our hospital appointment system
-- Run this file in PostgreSQL to set up your database

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores all users (patients and admin)
-- Passwords are hashed using bcrypt for security
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,               
    fullname VARCHAR(100) NOT NULL,      
    email VARCHAR(100) UNIQUE NOT NULL,  
    password VARCHAR(255) NOT NULL,        
    role VARCHAR(20) DEFAULT 'patient',    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- ============================================
-- 2. DOCTORS TABLE
-- ============================================
-- Stores all doctor information
-- Admin can add, update, and delete doctors
-- ============================================

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,                
    fullname VARCHAR(100) NOT NULL,        
    specialty VARCHAR(100) NOT NULL,      
    phone VARCHAR(20) NOT NULL,           
    email VARCHAR(100) UNIQUE NOT NULL, 
    available_days TEXT,                   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- ============================================
-- 3. APPOINTMENTS TABLE
-- ============================================
-- Stores all appointment bookings
-- Links patients to doctors with date and time
-- ============================================

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,                
    patient_id INTEGER NOT NULL,           
    doctor_id INTEGER NOT NULL,          
    appointment_date DATE NOT NULL,       
    appointment_time TIME NOT NULL,      
    status VARCHAR(20) DEFAULT 'pending', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,

    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- ============================================
-- 4. SAMPLE DATA
-- ============================================
-- Insert some initial data to get started
-- This makes testing easier
-- ============================================

-- Insert an admin user
-- Password: admin123 (hashed using bcrypt)
INSERT INTO users (fullname, email, password, role) VALUES 
('Admin User', 'admin@hospital.com', '$2b$10$YourHashedPasswordHere', 'admin');

-- Insert a sample patient
-- Password: patient123 (hashed using bcrypt)
INSERT INTO users (fullname, email, password, role) VALUES 
('John Patient', 'patient@test.com', '$2b$10$YourHashedPasswordHere', 'patient');

-- Insert some doctors
INSERT INTO doctors (fullname, specialty, phone, email, available_days) VALUES 
('Dr. Sarah Smith', 'Cardiology', '555-0101', 'sarah.smith@hospital.com', 'Mon, Wed, Fri'),
('Dr. James Wilson', 'Neurology', '555-0102', 'james.wilson@hospital.com', 'Tue, Thu, Sat'),
('Dr. Emily Brown', 'Pediatrics', '555-0103', 'emily.brown@hospital.com', 'Mon, Tue, Thu, Fri');

-- Insert some sample appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES 
(2, 1, '2026-08-01', '10:30:00', 'pending'),
(2, 2, '2026-08-03', '14:00:00', 'approved');

-- ============================================
-- 5. HELPER QUERIES (For reference)
-- ============================================

-- View all users
-- SELECT * FROM users;

-- View all doctors
-- SELECT * FROM doctors;

-- View all appointments with patient and doctor names
-- SELECT 
--     a.id,
--     u.fullname as patient_name,
--     d.fullname as doctor_name,
--     a.appointment_date,
--     a.appointment_time,
--     a.status
-- FROM appointments a
-- JOIN users u ON a.patient_id = u.id
-- JOIN doctors d ON a.doctor_id = d.id
-- ORDER BY a.appointment_date;

-- ============================================
-- END OF SCHEMA
-- ============================================
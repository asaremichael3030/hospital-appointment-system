// ============================================
// MAIN SERVER FILE - JWT VERSION
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// CORS CONFIGURATION
// ============================================

app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// ============================================
// TEST ROUTE
// ============================================

app.get('/', (req, res) => {
    res.send('🏥 Hospital Appointment System API is running!');
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🏥 HOSPITAL APPOINTMENT SYSTEM');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`👤 Database User: ${process.env.DB_USER}`);
    console.log('═══════════════════════════════════════');
    console.log('📌 Available endpoints:');
    console.log(`   GET  /                  - API Home`);
    console.log(`   GET  /api/health        - Health Check`);
    console.log(`   POST /api/auth/register - Register new user`);
    console.log(`   POST /api/auth/login    - Login user`);
    console.log(`   POST /api/auth/logout   - Logout user`);
    console.log(`   GET  /api/auth/me       - Get current user (JWT)`);
    console.log(`   GET  /api/doctors       - Get all doctors`);
    console.log(`   POST /api/doctors       - Add new doctor (admin)`);
    console.log(`   PUT  /api/doctors/:id   - Update doctor (admin)`);
    console.log(`   DELETE /api/doctors/:id - Delete doctor (admin)`);
    console.log(`   GET  /api/appointments  - Get appointments`);
    console.log(`   POST /api/appointments  - Book appointment`);
    console.log(`   DELETE /api/appointments/:id - Cancel appointment`);
    console.log('═══════════════════════════════════════');
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});
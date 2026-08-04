// ============================================
// DATABASE CONNECTION
// ============================================
// This file handles the connection to PostgreSQL
// It exports a pool object that can be used to run queries
// ============================================

// Import the PostgreSQL client
const { Pool } = require('pg');

// Load environment variables from .env file with explicit path
// __dirname = current folder (backend/config)
// path.join(__dirname, '..', '.env') = go up one level to backend/.env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ============================================
// DEBUG: Check if environment variables are loaded
// ============================================
console.log('🔍 Checking database configuration:');
console.log('   DB_HOST:', process.env.DB_HOST || '❌ Not set');
console.log('   DB_PORT:', process.env.DB_PORT || '❌ Not set');
console.log('   DB_NAME:', process.env.DB_NAME || '❌ Not set');
console.log('   DB_USER:', process.env.DB_USER || '❌ Not set');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('---');

// ============================================
// CREATE CONNECTION POOL
// ============================================
// A pool is a group of database connections that can be reused
// This is more efficient than opening/closing a connection for each query
// ============================================

const pool = new Pool({
    host: process.env.DB_HOST,        // Where PostgreSQL is running (localhost)
    port: process.env.DB_PORT,        // PostgreSQL port (5432)
    database: process.env.DB_NAME,    // Database name (hospital_db)
    user: process.env.DB_USER,        // Database user (postgres)
    password: process.env.DB_PASSWORD, // Database password
    max: 20,                          // Maximum number of connections in the pool
    idleTimeoutMillis: 30000,         // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000,    // Timeout after 2 seconds if can't connect
});

// ============================================
// TEST THE CONNECTION
// ============================================
// This runs when the file is first loaded
// It helps us know if the database is accessible
// ============================================

const urldb = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
// Connect to the database to test if everything works
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to the database:', err.stack);
    } else {urldb}
});

// ============================================
// EXPORT THE POOL
// ============================================
// This allows other files to import and use the database connection
// ============================================

module.exports = pool;
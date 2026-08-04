// test-db.js - Test our database connection

// Import packages
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
console.log('🔍 Looking for .env file at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found!');
    console.log('📄 File size:', fs.statSync(envPath).size, 'bytes');
    
    // Read and show the file content (without revealing password fully)
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('📄 File content preview:');
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const parts = line.split('=');
            if (parts.length === 2) {
                const key = parts[0].trim();
                const value = parts[1].trim();
                if (key === 'DB_PASSWORD') {
                    console.log(`   ${key}=${value.substring(0, 3)}... (hidden)`);
                } else {
                    console.log(`   ${key}=${value}`);
                }
            }
        }
    });
} else {
    console.log('❌ .env file NOT found!');
}

console.log('---');

// Load environment variables from .env file
require('dotenv').config({ path: envPath });

// DEBUG: Check if environment variables are loaded
console.log('🔍 Checking environment variables after dotenv:');
console.log('DB_HOST:', process.env.DB_HOST || '❌ Not found');
console.log('DB_PORT:', process.env.DB_PORT || '❌ Not found');
console.log('DB_NAME:', process.env.DB_NAME || '❌ Not found');
console.log('DB_USER:', process.env.DB_USER || '❌ Not found');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('---');

// Check if required variables are set
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    console.error('❌ Missing required environment variables!');
    console.log('Please check that .env file exists in the backend folder');
    console.log('and contains: DB_HOST, DB_USER, DB_PASSWORD');
    console.log('');
    console.log('Your .env file should look like this:');
    console.log('DB_HOST=localhost');
    console.log('DB_PORT=5432');
    console.log('DB_NAME=hospital_db');
    console.log('DB_USER=postgres');
    console.log('DB_PASSWORD=your_password_here');
    console.log('PORT=5000');
    console.log('SESSION_SECRET=your_secret_key_here');
    process.exit(1);
}

// Create a connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hospital_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Test the connection
async function testConnection() {
    try {
        // Connect to the database
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL!');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        console.log(`👤 User: ${process.env.DB_USER}`);
        
        // Release the connection back to the pool
        client.release();
        
        // End the pool
        await pool.end();
    } catch (error) {
        console.error('❌ Error connecting to PostgreSQL:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code || 'No code');
        console.error('Error detail:', error.detail || 'No detail');
    }
}

// Run the test
testConnection();
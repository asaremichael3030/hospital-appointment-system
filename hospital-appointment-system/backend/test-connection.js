// ============================================
// TEST DATABASE CONNECTION
// ============================================
// This file tests if we can connect to the database
// and run a simple query
// ============================================

// Load environment variables with explicit path
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug: Check if .env is loaded
console.log('🔍 Checking environment variables in test:');
console.log('   DB_HOST:', process.env.DB_HOST || '❌ Not set');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('---');

// Import the database pool
const pool = require('./config/db');

// ============================================
// TEST FUNCTION
// ============================================
async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');
        
        // Get a client from the pool
        const client = await pool.connect();
        
        // Run a simple query to test the connection
        const result = await client.query('SELECT NOW() as current_time');
        
        // Log the current time from the database
        console.log('✅ Database connection successful!');
        console.log(`🕐 Current database time: ${result.rows[0].current_time}`);
        
        // Release the client back to the pool
        client.release();
        
        // Test if tables exist
        console.log('\n📊 Checking tables...');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('Tables in database:');
        tables.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        // Close the pool when done
        await pool.end();
    }
}

// ============================================
// RUN THE TEST
// ============================================
testConnection();
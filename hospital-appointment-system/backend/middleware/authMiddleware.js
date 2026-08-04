// ============================================
// AUTHENTICATION MIDDLEWARE - JWT VERSION
// ============================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_jwt_key_12345';

// ============================================
// VERIFY JWT TOKEN
// ============================================

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔍 Token received:', token ? 'Yes' : 'No');

    if (!token) {
        return res.status(401).json({
            error: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log('✅ Token verified for user:', decoded.email);
        next();
    } catch (error) {
        console.error('❌ Token verification error:', error.message);
        return res.status(401).json({
            error: 'Invalid or expired token. Please login again.'
        });
    }
};

// ============================================
// CHECK IF USER IS LOGGED IN
// ============================================

const isAuthenticated = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).json({
            error: 'Please login first'
        });
    }
};

// ============================================
// CHECK IF USER IS ADMIN
// ============================================

const isAdmin = (req, res, next) => {
    console.log('🔍 Checking if user is admin...');
    console.log('👤 User:', req.user);

    if (!req.user) {
        return res.status(401).json({
            error: 'Please login first'
        });
    }

    if (req.user.role === 'admin') {
        console.log('✅ User is admin');
        next();
    } else {
        console.log('❌ User is not admin. Role:', req.user.role);
        res.status(403).json({
            error: 'Admin access required'
        });
    }
};

// ============================================
// CHECK IF USER IS PATIENT
// ============================================

const isPatient = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Please login first'
        });
    }

    if (req.user.role === 'patient') {
        next();
    } else {
        res.status(403).json({
            error: 'Patient access required'
        });
    }
};

module.exports = {
    verifyToken,
    isAuthenticated,
    isAdmin,
    isPatient
};
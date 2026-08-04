// ============================================
// AUTHENTICATION CONTROLLER - FULL VERSION
// ============================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_jwt_key_12345';

// ============================================
// REGISTER
// ============================================

const register = async (req, res) => {
    try {
        const { fullname, email, password, role } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({
                error: 'Please provide fullname, email, and password'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Please provide a valid email address'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                error: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users (fullname, email, password, role) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, fullname, email, role, created_at`,
            [fullname, email, hashedPassword, role || 'patient']
        );

        const user = newUser.rows[0];

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'An error occurred during registration. Please try again.'
        });
    }
};

// ============================================
// LOGIN
// ============================================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password'
            });
        }

        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful!',
            token: token,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'An error occurred during login. Please try again.'
        });
    }
};

// ============================================
// LOGOUT
// ============================================

const logout = async (req, res) => {
    try {
        res.json({
            message: 'Logged out successfully!'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'An error occurred during logout'
        });
    }
};

// ============================================
// GET CURRENT USER
// ============================================

const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Not logged in'
            });
        }

        res.json({
            user: req.user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'An error occurred'
        });
    }
};

// ============================================
// CHECK SESSION
// ============================================

const checkSession = async (req, res) => {
    try {
        if (req.user) {
            res.json({ 
                loggedIn: true, 
                user: req.user 
            });
        } else {
            res.json({ 
                loggedIn: false 
            });
        }
    } catch (error) {
        console.error('Check session error:', error);
        res.status(500).json({
            error: 'An error occurred'
        });
    }
};

// ============================================
// FORGOT PASSWORD - GENERATE RESET TOKEN
// ============================================

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Please provide your email address'
            });
        }

        // Check if user exists
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'No user found with this email address'
            });
        }

        const user = userResult.rows[0];

        // Generate a reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Store token in database with expiry
        const expiryDate = new Date(Date.now() + 3600000); // 1 hour from now
        
        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
            [resetToken, expiryDate, user.id]
        );

        // Return the reset token (in a real app, you'd email this)
        console.log('🔑 Reset token for', email, ':', resetToken);

        res.json({
            message: 'Password reset link sent to your email!',
            resetToken: resetToken, // For testing - remove in production
            email: email
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            error: 'An error occurred. Please try again.'
        });
    }
};

// ============================================
// RESET PASSWORD - USING TOKEN
// ============================================

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                error: 'Please provide token and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid or expired reset token'
            });
        }

        // Check if token exists in database and is not expired
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expiry > NOW()',
            [decoded.id, token]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                error: 'Invalid or expired reset token'
            });
        }

        const user = userResult.rows[0];

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );

        res.json({
            message: 'Password reset successfully! Please login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            error: 'An error occurred. Please try again.'
        });
    }
};

// ============================================
// CHANGE PASSWORD (LOGGED IN USER)
// ============================================

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Please provide current password and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'New password must be at least 6 characters long'
            });
        }

        // Get user from database
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({
            message: 'Password changed successfully!'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'An error occurred. Please try again.'
        });
    }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    checkSession,
    forgotPassword,
    resetPassword,
    changePassword
};
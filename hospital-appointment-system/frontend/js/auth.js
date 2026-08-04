// ============================================
// AUTHENTICATION - JAVASCRIPT (JWT VERSION)
// ============================================

const AUTH_API_URL = 'http://localhost:5000/api';

// ============================================
// REGISTER FUNCTION
// ============================================

async function handleRegister(event) {
    event.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullname,
                email,
                password,
                role: 'patient'
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(data.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Network error. Please check if the server is running.', 'error');
    }
}

// ============================================
// LOGIN FUNCTION
// ============================================

async function handleLogin(event) {
    event.preventDefault();

    console.log('🔑 Login function started...');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
    }

    try {
        console.log('📡 Sending login request to backend...');

        const response = await fetch(`${AUTH_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        console.log('📥 Response received. Status:', response.status);

        const data = await response.json();
        console.log('📦 Response data:', data);

        if (response.ok) {
            console.log('✅ Login successful!');

            if (data.token) {
                localStorage.setItem('token', data.token);
                console.log('💾 Token saved');
            }
            
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('session_active', 'true');

            showMessage('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                console.log('🚀 Redirecting to dashboard...');
                window.location.href = 'dashboard.html';
            }, 800);

        } else {
            console.log('❌ Login failed:', data.error);
            showMessage(data.error || 'Invalid email or password.', 'error');

            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showMessage('Network error. Please check if the server is running.', 'error');

        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    }
}

// ============================================
// LOGOUT FUNCTION
// ============================================

async function logout() {
    console.log('🚪 Logging out...');

    try {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch(`${AUTH_API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_active');

    window.location.href = 'login.html';
}

// ============================================
// CHECK AUTH STATUS
// ============================================

async function checkAuthStatus() {
    console.log('🔍 Checking auth status...');

    const token = localStorage.getItem('token');
    const sessionActive = localStorage.getItem('session_active');

    if (!token || !sessionActive) {
        console.log('❌ No token found');
        updateNavForLoggedOut();
        return false;
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📥 Auth check response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Token verified:', data.user);

            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('session_active', 'true');

            updateNavForLoggedIn();
            return true;
        } else {
            console.log('❌ Token invalid or expired');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_active');
            updateNavForLoggedOut();
            return false;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        if (token) {
            console.log('⚠️ Server unreachable, using cached token');
            const user = localStorage.getItem('user');
            if (user) {
                updateNavForLoggedIn();
                return true;
            }
        }
        updateNavForLoggedOut();
        return false;
    }
}

// ============================================
// UPDATE NAVIGATION
// ============================================

function updateNavForLoggedIn() {
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const logoutNav = document.getElementById('logoutNav');

    if (loginNav) loginNav.style.display = 'none';
    if (registerNav) registerNav.style.display = 'none';
    if (logoutNav) logoutNav.style.display = 'inline-block';

    console.log('🔵 Navigation updated for logged-in user');
}

function updateNavForLoggedOut() {
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const logoutNav = document.getElementById('logoutNav');

    if (loginNav) loginNav.style.display = 'inline-block';
    if (registerNav) registerNav.style.display = 'inline-block';
    if (logoutNav) logoutNav.style.display = 'none';

    console.log('🔴 Navigation updated for logged-out user');
}

// ============================================
// GET CURRENT USER
// ============================================

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// ============================================
// SHOW MESSAGE
// ============================================

function showMessage(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);

    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `alert alert-${type}`;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// ============================================
// AUTO-REDIRECT LOGIC
// ============================================

if (window.location.pathname.includes('login.html') ||
    window.location.pathname.includes('register.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 Login/Register page loaded, checking auth...');
        const token = localStorage.getItem('token');
        if (token) {
            checkAuthStatus().then(isLoggedIn => {
                if (isLoggedIn) {
                    window.location.href = 'dashboard.html';
                }
            });
        }
    });
}

console.log('✅ auth.js loaded successfully!');
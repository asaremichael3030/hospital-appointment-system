// ============================================
// DOCTORS - JAVASCRIPT (FIXED)
// ============================================

// Use a different variable name to avoid conflict with auth.js
const DOCTORS_API_URL = 'http://localhost:5000/api';

// ============================================
// LOAD DOCTORS
// ============================================

async function loadDoctors() {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) {
        console.error('❌ Doctors grid not found!');
        return;
    }

    console.log('🔄 Loading doctors...');
    grid.innerHTML = '<p style="color: #666; grid-column: 1 / -1; text-align: center;">🔄 Loading doctors...</p>';

    try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token exists:', !!token);

        if (!token) {
            grid.innerHTML = '<p style="color: #e74c3c; grid-column: 1 / -1; text-align: center;">⚠️ Please login to view doctors.</p>';
            return;
        }

        const response = await fetch(`${DOCTORS_API_URL}/doctors`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📥 Response status:', response.status);

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_active');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch doctors');
        }

        const data = await response.json();
        console.log('📦 Doctors received:', data.doctors ? data.doctors.length : 0);

        if (!data.doctors || data.doctors.length === 0) {
            grid.innerHTML = '<p style="color: #666; grid-column: 1 / -1; text-align: center;">📋 No doctors available.</p>';
            return;
        }

        const user = getCurrentUser();
        const isAdmin = user && user.role === 'admin';

        let html = '';
        data.doctors.forEach(doctor => {
            html += `
                <div class="doctor-card" data-id="${doctor.id}">
                    <h3>${doctor.fullname}</h3>
                    <div class="specialty">${doctor.specialty}</div>
                    <div class="details">📞 ${doctor.phone}</div>
                    <div class="details">✉️ ${doctor.email}</div>
                    <div class="available">📅 Available: ${doctor.available_days || 'Not specified'}</div>
                    <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <a href="book-appointment.html?doctorId=${doctor.id}" class="btn btn-primary btn-sm">Book Appointment</a>
                        ${isAdmin ? `
                            <button onclick="deleteDoctor(${doctor.id})" class="btn btn-danger btn-sm">Delete</button>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
        console.log('✅ Doctors displayed:', data.doctors.length);

    } catch (error) {
        console.error('❌ Error loading doctors:', error);
        grid.innerHTML = `<p style="color: #e74c3c; grid-column: 1 / -1; text-align: center;">❌ Error: ${error.message}</p>`;
    }
}

// ============================================
// DELETE DOCTOR
// ============================================

async function deleteDoctor(doctorId) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${DOCTORS_API_URL}/doctors/${doctorId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_active');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();

        if (response.ok) {
            alert('✅ Doctor deleted successfully!');
            await loadDoctors();
        } else {
            alert('❌ ' + (data.error || 'Failed to delete doctor'));
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Network error. Please try again.');
    }
}

// ============================================
// SEARCH DOCTORS
// ============================================

function searchDoctors() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.doctor-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// ============================================
// HANDLE ADD DOCTOR - FIXED
// ============================================

async function handleAddDoctor(event) {
    event.preventDefault();
    
    console.log('📝 Add doctor form submitted');

    const fullname = document.getElementById('docFullname').value;
    const specialty = document.getElementById('docSpecialty').value;
    const phone = document.getElementById('docPhone').value;
    const email = document.getElementById('docEmail').value;
    const available_days = document.getElementById('docDays').value;

    const submitBtn = document.getElementById('submitDoctorBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token exists:', !!token);

        if (!token) {
            alert('You are not logged in. Please login again.');
            window.location.href = 'login.html';
            return;
        }

        console.log('📡 Sending POST request...');
        const response = await fetch('http://localhost:5000/api/doctors', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullname, specialty, phone, email, available_days })
        });

        console.log('📥 Response status:', response.status);

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_active');
            alert('Session expired. Please login again.');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        console.log('📦 Response data:', data);

        if (response.ok) {
            alert('✅ Doctor added successfully!');
            
            document.getElementById('addDoctorFormElement').reset();
            document.getElementById('addDoctorForm').style.display = 'none';
            
            console.log('🔄 Reloading doctors...');
            await loadDoctors();
            console.log('✅ Doctors reloaded successfully!');
            
        } else {
            alert('❌ ' + (data.error || 'Failed to add doctor'));
        }
    } catch (error) {
        console.error('❌ Error adding doctor:', error);
        alert('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Doctor';
    }
}

// Make functions globally accessible
window.loadDoctors = loadDoctors;
window.deleteDoctor = deleteDoctor;
window.searchDoctors = searchDoctors;
window.handleAddDoctor = handleAddDoctor;

console.log('✅ doctors.js loaded!');
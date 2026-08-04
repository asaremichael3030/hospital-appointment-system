// ============================================
// APPOINTMENTS - JAVASCRIPT (JWT VERSION)
// ============================================

const API_URL = 'http://localhost:5000/api';

// ============================================
// GET AUTH HEADERS
// ============================================

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// ============================================
// LOAD APPOINTMENTS
// ============================================

async function loadAppointments() {
    const container = document.getElementById('appointmentsList');
    if (!container) return;

    container.innerHTML = '<p style="color: #666;">Loading your appointments...</p>';

    try {
        const response = await fetch(`${API_URL}/appointments`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_active');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();

        if (!data.appointments || data.appointments.length === 0) {
            container.innerHTML = `
                <p style="color: #666;">You have no appointments yet.</p>
                <a href="book-appointment.html" class="btn btn-primary mt-2">Book Your First Appointment</a>
            `;
            return;
        }

        let html = '<div class="table-container"><table><thead><tr>';
        html += '<th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th>';
        html += '</tr></thead><tbody>';

        data.appointments.forEach(apt => {
            const statusClass = apt.status === 'pending' ? 'badge-pending' :
                apt.status === 'approved' ? 'badge-approved' : 'badge-cancelled';

            html += `<tr>
                <td>${apt.doctor_name || 'Unknown Doctor'}</td>
                <td>${new Date(apt.appointment_date).toLocaleDateString()}</td>
                <td>${apt.appointment_time}</td>
                <td><span class="badge ${statusClass}">${apt.status}</span></td>
                <td>
                    ${apt.status !== 'cancelled' ?
                        `<button onclick="cancelAppointment(${apt.id})" class="btn btn-danger btn-sm">Cancel</button>` :
                        `<span style="color: #666; font-size: 0.9rem;">Cancelled</span>`
                    }
                </td>
            </tr>`;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading appointments:', error);
        container.innerHTML = '<p style="color: #e74c3c;">Error loading appointments. Please refresh the page.</p>';
    }
}

// ============================================
// CANCEL APPOINTMENT
// ============================================

async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
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
            alert('Appointment cancelled successfully!');
            await loadAppointments();
            if (typeof loadDashboardStats === 'function') {
                await loadDashboardStats();
            }
        } else {
            alert(data.error || 'Failed to cancel appointment');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Network error. Please try again.');
    }
}

// ============================================
// BOOK APPOINTMENT
// ============================================

async function bookAppointment(event) {
    event.preventDefault();

    const doctorId = document.getElementById('doctorId').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;

    if (!doctorId || !appointmentDate || !appointmentTime) {
        alert('Please select a doctor, date, and time.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                doctor_id: parseInt(doctorId),
                appointment_date: appointmentDate,
                appointment_time: appointmentTime
            })
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
            alert('Appointment booked successfully!');
            window.location.href = 'appointments.html';
        } else {
            alert(data.error || 'Failed to book appointment. Please try again.');
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        alert('Network error. Please check if the server is running.');
    }
}

// ============================================
// LOAD DOCTORS FOR BOOKING
// ============================================

async function loadDoctorsForBooking() {
    const select = document.getElementById('doctorId');
    if (!select) return;

    select.innerHTML = '<option value="">Select a doctor...</option>';

    try {
        const response = await fetch(`${API_URL}/doctors`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_active');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }

        const data = await response.json();

        if (data.doctors) {
            data.doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `${doctor.fullname} - ${doctor.specialty}`;
                select.appendChild(option);
            });
        }

        const urlParams = new URLSearchParams(window.location.search);
        const doctorId = urlParams.get('doctorId');
        if (doctorId) {
            select.value = doctorId;
        }

    } catch (error) {
        console.error('Error loading doctors:', error);
        select.innerHTML = '<option value="">Error loading doctors</option>';
    }
}
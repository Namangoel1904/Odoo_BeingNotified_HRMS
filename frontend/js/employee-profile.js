/* Employee Profile Logic */
document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;

    const token = Utils.getToken();

    // Configured Fields
    const fields = {
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        address: document.getElementById('address'),
        profilePicInput: document.getElementById('profile-pic-input'),
        profilePicPreview: document.getElementById('profile-pic-preview'),

        // New Fields
        gender: document.getElementById('gender'),
        maritalStatus: document.getElementById('maritalStatus'),
        nationality: document.getElementById('nationality'),
        personalEmail: document.getElementById('personalEmail'),
        ecName: document.getElementById('ecName'),
        ecPhone: document.getElementById('ecPhone'),
        ecRelation: document.getElementById('ecRelation'),

        // Read-only displays
        employeeCode: document.getElementById('employeeCode'),
        department: document.getElementById('department'),
        jobTitle: document.getElementById('jobTitle'),
        joiningDate: document.getElementById('joiningDate')
    };

    // Logout logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', Utils.logout);
    }

    async function loadProfile() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/employee/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();

                // Fill Inputs
                if (fields.fullName) fields.fullName.value = data.full_name;
                if (fields.email) fields.email.value = data.email;
                if (fields.phone) fields.phone.value = data.phone;
                if (fields.address) fields.address.value = data.address || '';

                // Enhanced Fields
                if (fields.gender) fields.gender.value = data.gender || '';
                if (fields.maritalStatus) fields.maritalStatus.value = data.marital_status || '';
                if (fields.nationality) fields.nationality.value = data.nationality || '';
                if (fields.personalEmail) fields.personalEmail.value = data.personal_email || '';
                if (fields.ecName) fields.ecName.value = data.emergency_contact_name || '';
                if (fields.ecPhone) fields.ecPhone.value = data.emergency_contact_phone || '';
                if (fields.ecRelation) fields.ecRelation.value = data.emergency_contact_relation || '';

                // Profile Pic
                if (data.profile_picture_url && fields.profilePicPreview) {
                    fields.profilePicPreview.style.backgroundImage = `url('${CONFIG.API_BASE_URL}${data.profile_picture_url}')`;
                    fields.profilePicPreview.innerHTML = ''; // Remove icon
                }

                // Fill Text Displays
                if (fields.employeeCode) fields.employeeCode.textContent = data.employee_code;
                if (fields.department) fields.department.textContent = data.department;
                if (fields.jobTitle) fields.jobTitle.textContent = data.job_title;
                if (fields.joiningDate) fields.joiningDate.textContent = data.joining_date;

            } else {
                console.error("Failed to load profile");
                if (response.status === 401) Utils.logout();
            }
        } catch (e) {
            console.error(e);
        }
    }

    loadProfile();

    // File Input Change listener
    if (fields.profilePicInput) {
        fields.profilePicInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                // Show uploading state?
                // For now, let's just upload immediately on select
                const response = await fetch(`${CONFIG.API_BASE_URL}/employee/profile-pic`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.profile_picture_url) {
                        fields.profilePicPreview.style.backgroundImage = `url('${CONFIG.API_BASE_URL}${data.profile_picture_url}')`;
                        fields.profilePicPreview.innerHTML = '';
                        alert("Profile Picture Updated");
                    }
                } else {
                    const err = await response.json();
                    alert("Upload Failed: " + err.detail);
                }
            } catch (e) {
                console.error(e);
                alert("Upload Error");
            }
        });
    }

    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                phone: fields.phone.value,
                address: fields.address.value,
                gender: fields.gender ? fields.gender.value : null,
                marital_status: fields.maritalStatus ? fields.maritalStatus.value : null,
                nationality: fields.nationality ? fields.nationality.value : null,
                personal_email: fields.personalEmail ? fields.personalEmail.value : null,
                emergency_contact_name: fields.ecName ? fields.ecName.value : null,
                emergency_contact_phone: fields.ecPhone ? fields.ecPhone.value : null,
                emergency_contact_relation: fields.ecRelation ? fields.ecRelation.value : null
            };

            try {
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = "Saving...";
                btn.disabled = true;

                const response = await fetch(`${CONFIG.API_BASE_URL}/employee/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("Profile Updated Successfully");
                    window.location.href = 'employee-dashboard.html';
                } else {
                    const err = await response.json();
                    alert("Error: " + (err.detail || "Update failed"));
                }

                btn.textContent = originalText;
                btn.disabled = false;
            } catch (e) {
                console.error(e);
                alert("Connection Error");
            }
        });
    }
});

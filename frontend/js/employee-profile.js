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

        // Resume Fields
        aboutMe: document.getElementById('aboutMe'),
        jobLove: document.getElementById('jobLove'),
        interests: document.getElementById('interests'),
        skills: document.getElementById('skills'),
        certifications: document.getElementById('certifications'),

        // Read-only displays
        employeeCode: document.getElementById('employeeCode'),
        department: document.getElementById('department'),
        jobTitle: document.getElementById('jobTitle'),
        joiningDate: document.getElementById('joiningDate'),

        // Salary Fields
        salaryBasic: document.getElementById('salaryBasic'),
        salaryHRA: document.getElementById('salaryHRA'),
        salarySA: document.getElementById('salarySA'),
        salaryPB: document.getElementById('salaryPB'),
        salaryLTA: document.getElementById('salaryLTA'),
        salaryFixed: document.getElementById('salaryFixed'),
        salaryWage: document.getElementById('salaryWage'),
        salaryPF: document.getElementById('salaryPF'),
        salaryPT: document.getElementById('salaryPT'),
        salaryDeductions: document.getElementById('salaryDeductions'),
        salaryNet: document.getElementById('salaryNet')
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
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

                // Resume Fields
                if (fields.aboutMe) fields.aboutMe.value = data.about_me || '';
                if (fields.jobLove) fields.jobLove.value = data.job_love || '';
                if (fields.interests) fields.interests.value = data.interests || '';
                if (fields.skills) fields.skills.value = data.skills || '';
                if (fields.certifications) fields.certifications.value = data.certifications || '';

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

                // Populate Salary
                if (fields.salaryBasic) fields.salaryBasic.textContent = formatCurrency(data.salary_basic);
                if (fields.salaryHRA) fields.salaryHRA.textContent = formatCurrency(data.salary_hra);
                if (fields.salarySA) fields.salarySA.textContent = formatCurrency(data.salary_sa);
                if (fields.salaryPB) fields.salaryPB.textContent = formatCurrency(data.salary_pb);
                if (fields.salaryLTA) fields.salaryLTA.textContent = formatCurrency(data.salary_lta);
                if (fields.salaryFixed) fields.salaryFixed.textContent = formatCurrency(data.salary_fixed);
                if (fields.salaryWage) fields.salaryWage.textContent = formatCurrency(data.salary_wage); // Gross

                if (fields.salaryPF) fields.salaryPF.textContent = formatCurrency(data.salary_pf_employee);
                if (fields.salaryPT) fields.salaryPT.textContent = formatCurrency(data.salary_pt);

                // Deductions Sum
                const totalDeductions = (data.salary_pf_employee || 0) + (data.salary_pt || 0);
                if (fields.salaryDeductions) fields.salaryDeductions.textContent = formatCurrency(totalDeductions);

                if (fields.salaryNet) fields.salaryNet.textContent = formatCurrency(data.salary_net);

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
                emergency_contact_relation: fields.ecRelation ? fields.ecRelation.value : null,

                // Resume Fields
                about_me: fields.aboutMe ? fields.aboutMe.value : null,
                job_love: fields.jobLove ? fields.jobLove.value : null,
                interests: fields.interests ? fields.interests.value : null,
                skills: fields.skills ? fields.skills.value : null,
                certifications: fields.certifications ? fields.certifications.value : null
            };

            try {
                const btn = document.getElementById('save-profile-btn') || form.querySelector('button[type="submit"]');
                if (!btn) {
                    console.error("Save button not found");
                    return;
                }
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

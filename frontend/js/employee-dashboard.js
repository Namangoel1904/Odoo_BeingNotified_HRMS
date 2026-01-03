/* Employee Dashboard Logic */
document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;

    const token = Utils.getToken();

    // Logout Logic
    const logoutBtns = document.querySelectorAll('button'); // In header
    logoutBtns.forEach(btn => {
        if (btn.textContent.includes('Logout')) {
            btn.addEventListener('click', Utils.logout);
        }
    });

    // Elements to Populate
    const els = {
        nameDisplay: document.querySelectorAll('.text-2xl.font-bold, .text-sm.font-semibold.truncate'), // Header name and sidebar name
        roleDisplay: document.querySelectorAll('.text-base.font-medium, .text-xs.font-medium.truncate'),
        profilePic: document.querySelectorAll('[data-alt="User profile avatar showing a smiling person"], [data-alt="Large profile picture of employee"]'),

        // Personal Info Grid
        fullName: Array.from(document.querySelectorAll('p')).find(p => p.previousElementSibling?.textContent.trim().toUpperCase() === 'FULL NAME'),

        details: {
            fullName: findValueByLabel('Full Name'), // Fallback if IDs fail, but we added IDs

            // Targeted via IDs now
            gender: document.getElementById('view-gender'),
            maritalStatus: document.getElementById('view-marital-status'),
            nationality: document.getElementById('view-nationality'),
            dob: document.getElementById('view-dob'), // placeholder

            workEmail: document.getElementById('view-work-email'),
            personalEmail: document.getElementById('view-personal-email'),
            workPhone: document.getElementById('view-work-phone'),
            mobilePhone: document.getElementById('view-mobile-phone'),

            address: document.getElementById('view-address'),

            ecName: document.getElementById('view-ec-name'),
            ecRelation: document.getElementById('view-ec-relation'),
            ecPhone: document.getElementById('view-ec-phone'),

            id: Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('ID:')),
            joined: Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('Joined')),
            location: Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('San Francisco')),
        }
    };

    // Helper to find value element by label
    function findValueByLabel(labelText) {
        const label = Array.from(document.querySelectorAll('p')).find(el => el.textContent.trim().toUpperCase() === labelText.toUpperCase());
        if (label && label.nextElementSibling) return label.nextElementSibling;
        return null;
    }

    async function loadDashboard() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/employee/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();

                // Name
                els.nameDisplay.forEach(el => {
                    if (el.tagName === 'H2' || el.tagName === 'H1') el.textContent = data.full_name;
                });

                // Role/Job
                // els.roleDisplay... logic is a bit loose with selectors. 
                // Let's target the H1 sibling or H2 sibling for specific text.
                const jobTitleEl = document.querySelector('.text-base.font-medium.text-\\[\\#4e7397\\]'); // Senior UX Designer...
                if (jobTitleEl) jobTitleEl.textContent = `${data.job_title} • ${data.department}`;

                // Profile Pic
                if (data.profile_picture_url) {
                    els.profilePic.forEach(el => {
                        el.style.backgroundImage = `url('${CONFIG.API_BASE_URL}${data.profile_picture_url}')`;
                    });
                } else {
                    // Default placeholder if none
                    // Keep existing
                }

                // Details
                if (els.details.fullName) els.details.fullName.textContent = data.full_name;

                // Enhanced Fields
                if (els.details.gender) els.details.gender.textContent = data.gender || '-';
                if (els.details.maritalStatus) els.details.maritalStatus.textContent = data.marital_status || '-';
                if (els.details.nationality) els.details.nationality.textContent = data.nationality || '-';

                if (els.details.workEmail) els.details.workEmail.textContent = data.email;
                if (els.details.personalEmail) els.details.personalEmail.textContent = data.personal_email || '-';
                if (els.details.workPhone) els.details.workPhone.textContent = data.phone; // Assuming phone is work phone
                if (els.details.mobilePhone) els.details.mobilePhone.textContent = data.phone; // Duplicate for now or leave blank if we split

                if (els.details.address) els.details.address.textContent = data.address || '-';

                // Emergency Contact
                if (els.details.ecName) els.details.ecName.textContent = data.emergency_contact_name || 'Not Set';
                if (els.details.ecRelation) els.details.ecRelation.textContent = data.emergency_contact_relation ? `Relation: ${data.emergency_contact_relation}` : '';
                if (els.details.ecPhone) els.details.ecPhone.textContent = data.emergency_contact_phone || '';

                if (els.details.id) els.details.id.textContent = `ID: ${data.employee_code}`;
                if (els.details.joined) els.details.joined.textContent = `Joined ${data.joining_date}`;
                if (els.details.location && data.address) {
                    // Try to extract city? Or just show address snippet
                    els.details.location.textContent = data.address.split(',')[0];
                }

            } else {
                console.error("Failed to load dashboard data");
                if (response.status === 401) Utils.logout();
            }
        } catch (e) {
            console.error(e);
        }
    }

    loadDashboard();

    // Edit Profile Button
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            window.location.href = 'employee-profile.html';
        });
    }

    // Sidebar Links
    const sidebarLinks = document.querySelectorAll('nav a');
    sidebarLinks.forEach(link => {
        if (link.textContent.includes('My Profile') || link.textContent.includes('Dashboard')) {
            // For now, both point here or profile
            if (link.textContent.includes('My Profile')) link.href = 'employee-dashboard.html';
            if (link.textContent.includes('Settings')) link.href = 'employee-profile.html'; // Use settings/edit for the form
        }
    });

});

document.addEventListener('DOMContentLoaded', () => {
    const user = Utils.checkAuth();
    if (!user || user.role !== 'HR') {
        window.location.href = 'index.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const publicId = urlParams.get('id');

    if (!publicId) {
        alert('No employee ID specified.');
        window.location.href = 'hr-employees.html';
        return;
    }

    // Elements
    const displayName = document.getElementById('displayName');
    const displayRole = document.getElementById('displayRole');
    const profilePicPreview = document.getElementById('profile-pic-preview');

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    const aboutMeInput = document.getElementById('aboutMe');
    const skillsInput = document.getElementById('skills');
    const interestsInput = document.getElementById('interests');

    const form = document.getElementById('profile-form');
    const saveBtn = document.getElementById('saveBtn');

    async function loadProfile() {
        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/employees/${publicId}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                populateForm(data);
            } else {
                alert('Employee profile not found.');
                window.location.href = 'hr-employees.html';
            }
        } catch (e) {
            console.error(e);
            alert('Error loading profile.');
        }
    }

    function populateForm(data) {
        displayName.textContent = data.name;
        displayRole.textContent = data.job_role || 'Employee';
        const picUrl = data.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`;
        profilePicPreview.style.backgroundImage = `url('${picUrl}')`;

        fullNameInput.value = data.name;
        emailInput.value = data.email;
        phoneInput.value = data.phone_number || '';
        addressInput.value = data.address || '';

        aboutMeInput.value = data.about_me || '';
        skillsInput.value = data.skills || '';
        interestsInput.value = data.interests || '';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const payload = {
            phone_number: phoneInput.value,
            address: addressInput.value,
            about_me: aboutMeInput.value,
            skills: skillsInput.value,
            interests: interestsInput.value
            // can add more fields if needed
        };

        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/employees/${publicId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Profile updated successfully.');
            } else {
                alert('Failed to update profile.');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating profile.');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    });

    loadProfile();
});

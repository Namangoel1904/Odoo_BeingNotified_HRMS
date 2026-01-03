document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;

    // Display user info if possible (we only have role in token for now, but in real app we'd fetch profile)
    // For now, we just ensure they are logged in.

    const logoutBtns = document.querySelectorAll('button');
    // Find logout button specifically (containing 'logout' text)
    logoutBtns.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('logout')) {
            btn.addEventListener('click', () => {
                Utils.logout();
            });
        }
    });

    // Make "Create HR Profile" cards clickable or ensure links work
    // The provided HTML has links like href="#". We can make them navigate.
    const createHrLink = document.querySelector('a[href="create-hr.html"]'); // If exists
    // Actually the dashboard has a "Create HR Profile" section.
    // Let's wire up any navigation if explicit. 

    // In the provided HTML, "Create HR Profile" is a form on the dashboard itself?
    // Looking at dashboard.html code:
    // It has a "Create HR Profile" section with inputs.
    // So the dashboard IS the Create HR page integrated?
    // Wait, the user provided separate folders: "admin_dashboard_ui" and "dayflow_admin_dashboard_-_create_hr_user".
    // "admin_dashboard_ui" has a "Create HR Profile" form in the "Main Action Area".
    // "dayflow_admin_dashboard_-_create_hr_user" has a dedicated "Create HR User" page.

    // I should probably focus on the Dashboard's own form if it functionality overlaps, OR link to the other page.
    // However, the dashboard form looks fully functional in UI. Let's make IT work.

    const createHrForm = document.querySelector('form');
    if (createHrForm) {
        createHrForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Implement Create HR logic if this form is intended to work
            // The plan said "Implement Dashboard & Create HR". 
            // I'll assume the dashboard form is a quick-action way to create HR.

            // However, the requested endpoint is `POST /admin/create-hr`.
            // Our backend currently only has a placeholder that returns a message.

            // To make it functional (even if backend is placeholder):

            const fullNameInput = document.getElementById('fullName');
            const emailInput = document.getElementById('email');
            const yearInput = document.getElementById('joiningYear');

            const full_name = fullNameInput.value;
            const email = emailInput.value;
            const year_of_joining = parseInt(yearInput.value);

            if (!full_name || !email || !year_of_joining) {
                alert("Please fill all fields");
                return;
            }

            const token = Utils.getToken();
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/admin/create-hr`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ full_name, email, year_of_joining })
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`Success! \nLogin ID: ${data.hr_login_id}\nPassword: ${data.temporary_password}\n\nPlease save these credentials.`);
                    createHrForm.reset();
                } else {
                    const err = await response.json();
                    alert(`Failed: ${err.detail}`);
                }
            } catch (e) {
                console.error(e);
                alert("Error connecting to server");
            }
        });

        const cancelBtn = document.getElementById('cancel-hr-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                createHrForm.reset();
            });
        }
    }
});

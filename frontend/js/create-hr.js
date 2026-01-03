document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;

    const logoutBtns = document.querySelectorAll('button');
    logoutBtns.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('logout')) {
            btn.addEventListener('click', () => {
                Utils.logout();
            });
        }
    });

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get inputs - adapting to the structure in create-hr.html
            // The inputs in create-hr.html didn't have IDs in the viewed file, 
            // but looking at `create-hr.html` again:
            // Input 1: Full Name (type text, required)
            // Input 2: Email (type email, required)
            // Select: Year 

            // Let's add IDs if they are missing or select them by type carefully.
            // HTML content from previous view shows NO IDs on inputs in create-hr.html!
            // I should select them by hierarchy or attributes.

            const inputs = form.querySelectorAll('input');
            const full_name = inputs[0].value;
            const email = inputs[1].value;
            const yearSelect = form.querySelector('select');
            const year_of_joining = parseInt(yearSelect.value);

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
                    const successMsg = document.getElementById('success-message');
                    successMsg.classList.remove('hidden');

                    // Update the displayed credentials
                    const codeBlocks = successMsg.querySelectorAll('code');
                    if (codeBlocks.length >= 2) {
                        codeBlocks[0].textContent = data.hr_login_id;
                        codeBlocks[1].textContent = data.temporary_password;
                    }

                    form.reset();
                } else {
                    const err = await response.json();
                    alert(`Failed: ${err.detail}`);
                }
            } catch (e) {
                console.error(e);
                alert("Error connecting to server");
            }
        });
    }
});

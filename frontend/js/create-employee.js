/* Create Employee Logic */
document.addEventListener('DOMContentLoaded', () => {
    const user = Utils.checkAuth();
    if (!user) return;

    // Logout logic
    const logoutBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.toLowerCase().includes('logout'));
    logoutBtns.forEach(btn => btn.addEventListener('click', Utils.logout));

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Map inputs. The HTML has name attributes, which is good.
            const formData = new FormData(form);
            const payload = {
                full_name: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                department: formData.get('department'),
                job_title: formData.get('jobTitle'),
                joining_date: formData.get('joiningDate'),
                joining_year: parseInt(formData.get('joiningYear'))
            };

            // Basic Client validation
            if (!payload.full_name || !payload.email || !payload.joining_date || !payload.phone || !payload.department || !payload.job_title || !payload.joining_year) {
                alert("Please fill all required fields:\n- Full Name\n- Email\n- Phone\n- Department\n- Job Title\n- Date of Joining\n- Year of Joining");
                return;
            }

            const token = Utils.getToken();
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/hr/create-employee`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();

                    // Show success section
                    // The success section in `create-employee.html` is:
                    // <div class="bg-[#f0f9ff] ..."> -> We need to identify it.
                    // It says "Employee Created" inside.

                    // In the HTML provided, it seems the success state is "Initially Visible for Demo purposes".
                    // We should probably hide it on load and show it on success.
                    // But let's find it first.

                    const headings = Array.from(document.querySelectorAll('h3'));
                    const successHeader = headings.find(h => h.textContent.includes('Employee Created'));

                    if (successHeader) {
                        // Find the container
                        const successContainer = successHeader.closest('div.shadow-sm');

                        // Update credentials
                        const codes = successContainer.querySelectorAll('code');
                        if (codes.length >= 2) {
                            codes[0].textContent = data.employee_login_id;
                            codes[1].textContent = data.temporary_password;
                        }

                        successContainer.classList.remove('hidden');
                        successContainer.style.display = 'block'; // Make sure it's visible
                        successContainer.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        alert(`Success! Login ID: ${data.employee_login_id}, Password: ${data.temporary_password}`);
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

        // Handle "Cancel" button
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cancel'));
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                form.reset();
                window.location.href = 'hr-dashboard.html'; // Or just reset? User might want to go back.
            });
        }
    }
});

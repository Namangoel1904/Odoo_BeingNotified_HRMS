document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const user = Utils.checkAuth();
    if (!user) return;

    const verifyBtn = document.getElementById('verifyBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    logoutBtn.addEventListener('click', Utils.logout);

    verifyBtn.addEventListener('click', async () => {
        // Disable button
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verifying...`;

        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Success
                verifyBtn.innerHTML = 'Verified!';
                verifyBtn.classList.remove('bg-primary', 'hover:bg-blue-600');
                verifyBtn.classList.add('bg-green-600', 'hover:bg-green-700');

                // Add short delay then redirect
                setTimeout(() => {
                    // Redirect based on role
                    // We need to re-parse token or just use the stored user object?
                    // User object from checkAuth() isn't the JWT payload.
                    // Utils.checkAuth() returns decoded payload if valid.

                    if (user.role === 'HR') {
                        window.location.href = 'hr-dashboard.html';
                    } else if (user.role === 'ADMIN') {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'employee-dashboard.html';
                    }
                }, 1000);
            } else {
                const data = await response.json();
                alert(`Verification failed: ${data.detail || data.message}`);
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = `<span>Verify Now</span><span class="material-symbols-outlined text-[20px]">check_circle</span>`;
            }
        } catch (e) {
            console.error(e);
            alert("Connection error");
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = `<span>Verify Now</span><span class="material-symbols-outlined text-[20px]">check_circle</span>`;
        }
    });
});

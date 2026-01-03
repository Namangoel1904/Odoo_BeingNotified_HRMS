document.addEventListener('DOMContentLoaded', () => {
    // Clear token on login page load
    Utils.removeToken();

    const loginBtn = document.getElementById('login-btn');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Login Logic
    const handleLogin = async () => {
        const login_id = emailInput.value.trim(); // Trim whitespace
        const password = passwordInput.value;

        // Client-side Validation
        if (!login_id) {
            alert("Email field is empty");
            return;
        }

        if (!password) {
            alert("Password field is empty");
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login_id, password }),
            });

            if (response.ok) {
                const data = await response.json();
                Utils.saveToken(data.access_token);

                const payload = Utils.parseJwt(data.access_token);
                if (payload.must_change_password) {
                    window.location.href = 'change-password.html';
                } else {
                    // Check Role
                    if (payload.role === 'HR') {
                        window.location.href = 'hr-dashboard.html';
                    } else if (payload.role === 'ADMIN') {
                        window.location.href = 'dashboard.html';
                    } else {
                        // Redirect Employee to Dashboard
                        window.location.href = 'employee-dashboard.html';
                    }
                }
            } else {
                const errorData = await response.json();
                alert(`Login Failed: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    loginBtn.addEventListener('click', handleLogin);

    // Allow pressing Enter to login
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});

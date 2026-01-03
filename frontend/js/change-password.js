document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const token = Utils.getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitBtn = document.getElementById('change-password-btn');

    const toggleNewPassBtn = document.getElementById('toggle-new-password');
    const toggleConfirmPassBtn = document.getElementById('toggle-confirm-password');

    const strengthText = document.getElementById('strength-text');
    const strengthBars = document.querySelectorAll('.strength-bar');

    // Toggle Visibility
    const toggleVisibility = (input, btn) => {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        btn.querySelector('span').textContent = type === 'password' ? 'visibility_off' : 'visibility';
    };

    if (toggleNewPassBtn) {
        toggleNewPassBtn.addEventListener('click', () => toggleVisibility(newPasswordInput, toggleNewPassBtn));
    }

    if (toggleConfirmPassBtn) {
        toggleConfirmPassBtn.addEventListener('click', () => toggleVisibility(confirmPasswordInput, toggleConfirmPassBtn));
    }


    // Password Strength Logic
    newPasswordInput.addEventListener('input', () => {
        const val = newPasswordInput.value;
        let score = 0;
        if (val.length >= 8) score++;
        if (val.match(/[A-Za-z]/) && val.match(/[0-9]/)) score++;
        if (val.match(/[^a-zA-Z0-9]/)) score++;
        if (val.length > 12) score++;

        // Update UI
        strengthBars.forEach((bar, index) => {
            if (index < score) {
                bar.classList.remove('bg-slate-200', 'dark:bg-slate-700');
                if (score <= 1) bar.classList.add('bg-red-500');
                else if (score <= 2) bar.classList.add('bg-amber-500');
                else bar.classList.add('bg-green-500');
            } else {
                bar.className = 'h-full flex-1 rounded-full bg-slate-200 dark:bg-slate-700 strength-bar';
            }
        });

        if (score <= 1) { strengthText.textContent = "Weak"; strengthText.className = "text-xs font-medium text-red-500"; }
        else if (score <= 2) { strengthText.textContent = "Medium"; strengthText.className = "text-xs font-medium text-amber-500"; }
        else { strengthText.textContent = "Strong"; strengthText.className = "text-xs font-medium text-green-500"; }
    });

    // Simple match check visualization
    confirmPasswordInput.addEventListener('input', () => {
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.classList.add('border-red-500');
        } else {
            confirmPasswordInput.classList.remove('border-red-500');
        }
    });

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // Ensure default form submission is blocked
        const new_password = newPasswordInput.value;
        const confirm_password = confirmPasswordInput.value;

        if (new_password !== confirm_password) {
            alert("Passwords do not match!");
            return;
        }

        if (new_password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Updating...";

            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ new_password, confirm_password }),
            });

            if (response.ok) {
                alert("Password changed successfully! Please login again.");
                Utils.logout(); // Force re-login
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.detail}`);
                submitBtn.disabled = false;
                submitBtn.textContent = "Update Password";
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = "Update Password";
        }
    });
});

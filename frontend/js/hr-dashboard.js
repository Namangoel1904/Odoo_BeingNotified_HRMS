document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = Utils.checkAuth();
    if (!user || user.role !== 'HR') {
        window.location.href = 'index.html'; // Redirect to login if not HR
        return;
    }

    // Logout
    const logoutBtn = document.querySelector('a[href="#"] span.material-symbols-outlined:first-child').parentElement;
    if (logoutBtn && logoutBtn.textContent.includes('Logout')) {
        logoutBtn.href = '#';
        logoutBtn.addEventListener('click', Utils.logout);
    }

    // Load Stats
    async function loadStats() {
        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/dashboard-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                document.getElementById('hr-stat-total-employees').textContent = data.total_employees;
                document.getElementById('hr-stat-present-today').textContent = data.present_today;
                document.getElementById('hr-stat-on-leave').textContent = data.on_leave_today;
                document.getElementById('hr-stat-pending-leaves').textContent = data.pending_leaves;
                document.getElementById('hr-stat-open-tickets').textContent = data.open_tickets;

            } else {
                console.error("Failed to fetch dashboard stats", response.status);
                if (response.status === 401) Utils.logout();
            }
        } catch (e) {
            console.error(e);
        }
    }

    loadStats();
});

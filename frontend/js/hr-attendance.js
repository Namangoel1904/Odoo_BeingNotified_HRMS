document.addEventListener('DOMContentLoaded', () => {
    const user = Utils.checkAuth();
    if (!user || user.role !== 'HR') {
        window.location.href = 'index.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', Utils.logout);

    const tableBody = document.getElementById('hr-attendance-table-body');
    const searchInput = document.getElementById('searchInput');

    let allAttendance = [];

    // Format current date
    const today = new Date();
    document.getElementById('currentDateDisplay').textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    async function loadDashboardStats() {
        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('att-stat-total').textContent = data.total_employees;
                document.getElementById('att-stat-present').textContent = data.present_today;
                document.getElementById('att-stat-leave').textContent = data.on_leave_today;
                document.getElementById('att-stat-pending').textContent = data.pending_leaves;
            }
        } catch (e) {
            console.error("Stats error", e);
        }
    }

    async function loadAttendance() {
        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/attendance/today`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                allAttendance = await response.json();
                renderAttendance(allAttendance);
            } else {
                console.error("Failed to load attendance");
            }
        } catch (e) {
            console.error(e);
        }
    }

    function renderAttendance(list) {
        tableBody.innerHTML = '';
        if (list.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center">No attendance records found.</td></tr>';
            return;
        }

        list.forEach(item => {
            let statusColor = 'bg-gray-100 text-gray-800';
            if (item.status === 'Present') statusColor = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
            else if (item.status === 'Absent') statusColor = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
            else if (item.status === 'Late') statusColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
            else if (item.status === 'On Leave') statusColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';

            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors';

            row.innerHTML = `
                <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                        <div class="size-9 rounded-full bg-cover bg-center bg-slate-200" style="">
                             <span class="material-symbols-outlined flex items-center justify-center h-full w-full text-slate-400">person</span>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-slate-900 dark:text-white">${item.employee_name}</p>
                            <!-- <p class="text-xs text-slate-500 dark:text-slate-400">Department</p> -->
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">${item.department || '-'}</td>
                <td class="py-4 px-6 text-sm font-medium text-slate-900 dark:text-white">${item.check_in || '--:--'}</td>
                <td class="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 italic">${item.check_out || '--:--'}</td>
                 <td class="py-4 px-6 text-right">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColor} border border-opacity-20">
                        ${item.status}
                    </span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allAttendance.filter(item =>
            item.employee_name.toLowerCase().includes(term)
        );
        renderAttendance(filtered);
    });

    loadDashboardStats();
    loadAttendance();
});

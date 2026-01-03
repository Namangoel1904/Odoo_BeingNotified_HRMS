document.addEventListener('DOMContentLoaded', () => {
    const user = Utils.checkAuth();
    if (!user || user.role !== 'HR') {
        window.location.href = 'index.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', Utils.logout);

    const tableBody = document.getElementById('hr-employees-table-body');
    const searchInput = document.getElementById('searchInput');

    let allEmployees = [];

    async function loadEmployees() {
        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                allEmployees = await response.json();
                renderEmployees(allEmployees);
            } else {
                console.error("Failed to load employees");
                if (response.status === 401) Utils.logout();
            }
        } catch (e) {
            console.error(e);
        }
    }

    function renderEmployees(employees) {
        tableBody.innerHTML = '';
        if (employees.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center">No employees found</td></tr>';
            return;
        }

        employees.forEach(emp => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group';

            row.innerHTML = `
                <td class="whitespace-nowrap px-6 py-4">
                    <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden bg-center bg-cover" 
                             style="background-image: url('${emp.profile_picture_url ? CONFIG.API_BASE_URL + emp.profile_picture_url : ''}');">
                             ${!emp.profile_picture_url ? '<span class="material-symbols-outlined flex items-center justify-center h-full w-full text-slate-400">person</span>' : ''}
                        </div>
                        <div class="ml-4">
                            <div class="font-medium text-slate-900 dark:text-white">${emp.full_name}</div>
                            <div class="text-sm text-slate-500 dark:text-slate-400 md:hidden">${emp.job_title}</div>
                        </div>
                    </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">${emp.employee_code}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">${emp.department}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell">${emp.job_title}</td>
                <td class="whitespace-nowrap px-6 py-4">
                    <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-5 ${emp.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}">
                        ${emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <a href="hr-employee-view.html?id=${emp.public_id}" class="text-primary hover:text-blue-700 dark:hover:text-blue-400 flex items-center justify-end gap-1 ml-auto group-hover:underline">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                        View
                    </a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allEmployees.filter(emp =>
            emp.full_name.toLowerCase().includes(term) ||
            emp.employee_code.toLowerCase().includes(term) ||
            emp.job_title.toLowerCase().includes(term)
        );
        renderEmployees(filtered);
    });

    loadEmployees();
});

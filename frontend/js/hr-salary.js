document.addEventListener('DOMContentLoaded', () => {
    const user = Utils.checkAuth();
    if (!user || user.role !== 'HR') {
        window.location.href = 'index.html';
        return;
    }

    // Elements
    const searchInput = document.getElementById('employeeSearchInput');
    const employeeList = document.getElementById('employeeList');
    const salaryContent = document.getElementById('salaryContent');
    const salaryPlaceholder = document.getElementById('salaryPlaceholder');
    const editStructureBtn = document.getElementById('editStructureBtn');

    // Header Elements
    const headerProfilePic = document.getElementById('headerProfilePic');
    const headerName = document.getElementById('headerName');
    const headerRole = document.getElementById('headerRole');
    const headerDept = document.getElementById('headerDept');

    // Containers
    const earningsContainer = document.getElementById('earningsContainer');
    const deductionsContainer = document.getElementById('deductionsContainer');
    const netPayDisplay = document.getElementById('netPayDisplay');

    let allEmployees = [];
    let currentEmployee = null;
    let currentSalary = null;

    // Load initial list of employees for search
    async function loadEmployees() {
        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                allEmployees = await response.json();
                populateDatalist();
            }
        } catch (e) {
            console.error(e);
        }
    }

    function populateDatalist() {
        employeeList.innerHTML = '';
        allEmployees.forEach(emp => {
            const option = document.createElement('option');
            option.value = `${emp.name} (${emp.employee_code})`;
            option.dataset.publicId = emp.public_id; // dataset not effective on option in datalist
            employeeList.appendChild(option);
        });
    }

    // Search Handler
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const matchedEmp = allEmployees.find(emp => `${emp.name} (${emp.employee_code})` === val);

        if (matchedEmp) {
            loadSalary(matchedEmp);
        } else {
            // clear if not found or empty
            if (val === '') {
                showPlaceholder();
            }
        }
    });

    function showPlaceholder() {
        salaryContent.classList.add('hidden');
        salaryPlaceholder.classList.remove('hidden');
        currentEmployee = null;
    }

    async function loadSalary(employee) {
        currentEmployee = employee;
        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/salary/${employee.public_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                currentSalary = await response.json();
                renderSalary(currentSalary, employee);
            } else {
                alert('Salary structure not found or error loading.');
            }
        } catch (e) {
            console.error(e);
            alert('Error fetching salary details.');
        }
    }

    function renderSalary(salary, employee) {
        salaryPlaceholder.classList.add('hidden');
        salaryContent.classList.remove('hidden');

        // Header
        headerName.textContent = employee.name;
        headerRole.textContent = employee.job_role || 'Employee';
        headerDept.textContent = employee.department || 'General';
        headerProfilePic.style.backgroundImage = `url('https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}')`;

        // Earnings
        earningsContainer.innerHTML = '';
        const earnings = [
            { label: 'Basic Salary', value: salary.basic_component },
            { label: 'House Rent Allowance (HRA)', value: salary.hra_component },
            { label: 'Standard Allowance', value: salary.standard_allowance },
            { label: 'Performance Bonus', value: salary.performance_bonus },
            { label: 'Leave Travel Allowance', value: salary.leave_travel_allowance },
            { label: 'Fixed Allowance', value: salary.fixed_allowance },
        ];

        // Compute Gross
        const gross = earnings.reduce((acc, curr) => acc + curr.value, 0);

        earnings.forEach(item => {
            if (item.value > 0) {
                earningsContainer.innerHTML += createRow(item.label, item.value);
            }
        });
        // Add Gross Row
        earningsContainer.innerHTML += `
            <div class="flex justify-between items-center pt-4 mt-2">
                <span class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Gross Earnings</span>
                <span class="text-base font-bold text-slate-900 dark:text-white font-mono">${Utils.formatCurrency(gross)}</span>
            </div>
        `;

        // Deductions
        deductionsContainer.innerHTML = '';
        const deductions = [
            { label: 'Provident Fund (PF)', value: salary.pf_employee_amount },
            { label: 'Professional Tax', value: salary.professional_tax },
            // Add employer PF for reference? Usually not in deductions from gross for net pay calculation in this context unless CTC view.
            // But let's show what reduces the Net.
        ];

        const totalDeductions = deductions.reduce((acc, curr) => acc + curr.value, 0);

        deductions.forEach(item => {
            if (item.value > 0) {
                deductionsContainer.innerHTML += createRow(item.label, item.value);
            }
        });

        deductionsContainer.innerHTML += `
            <div class="flex justify-between items-center pt-4 mt-2">
                <span class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Total Deductions</span>
                <span class="text-base font-bold text-red-600 dark:text-red-400 font-mono">-${Utils.formatCurrency(totalDeductions)}</span>
            </div>
        `;

        // Net Pay
        netPayDisplay.textContent = Utils.formatCurrency(salary.net_salary);
    }

    function createRow(label, value) {
        return `
            <div class="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                <span class="text-sm text-slate-600 dark:text-slate-400">${label}</span>
                <span class="text-sm font-semibold text-slate-900 dark:text-white font-mono">${Utils.formatCurrency(value)}</span>
            </div>
        `;
    }

    // Edit Handler
    editStructureBtn.addEventListener('click', async () => {
        if (!currentEmployee || !currentSalary) return;

        const newWageStr = prompt("Enter new Monthly Wage (CTC Basis):", currentSalary.wage);
        if (newWageStr === null) return; // Cancelled

        const newWage = parseFloat(newWageStr);
        if (isNaN(newWage) || newWage <= 0) {
            alert('Please enter a valid positive number.');
            return;
        }

        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/salary/${currentEmployee.public_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ monthly_wage: newWage })
            });

            if (response.ok) {
                alert('Salary structure updated successfully.');
                loadSalary(currentEmployee); // Reload
            } else {
                alert('Failed to update salary.');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating salary.');
        }
    });

    loadEmployees();
});

document.addEventListener('DOMContentLoaded', () => {
    const user = Utils.checkAuth();
    if (!user || user.role !== 'HR') {
        window.location.href = 'index.html';
        return;
    }

    /* Modal Elements */
    const modal = document.getElementById('actionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalRemarks = document.getElementById('modalRemarks');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');

    let currentAction = null; // { id: 'public_id', type: 'APPROVE' | 'REJECT' }
    let allLeaves = [];

    async function loadLeaves() {
        try {
            const token = Utils.getToken();
            const statusFilter = document.getElementById('statusFilter').value;
            let url = `${CONFIG.API_BASE_URL}/hr/leaves`;
            if (statusFilter) url += `?status=${statusFilter}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                allLeaves = await response.json();
                renderLeaves(allLeaves);
            }
        } catch (e) {
            console.error(e);
        }
    }

    function renderLeaves(leaves) {
        const tbody = document.getElementById('hr-leaves-table-body');
        tbody.innerHTML = '';

        if (leaves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center">No leave requests found.</td></tr>';
            return;
        }

        leaves.forEach(leave => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group';

            let statusColor = 'bg-gray-100 text-gray-800';
            let statusDot = 'bg-gray-500';

            if (leave.status === 'Approved') {
                statusColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
                statusDot = 'bg-green-500';
            } else if (leave.status === 'Rejected') {
                statusColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
                statusDot = 'bg-red-500';
            } else if (leave.status === 'Pending') {
                statusColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
                statusDot = 'bg-amber-500';
            }

            // Actions: Only show if Pending
            let actionsHtml = '';
            if (leave.status === 'Pending') {
                actionsHtml = `
                    <div class="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                        <button onclick="openActionModal('${leave.public_id}', 'APPROVE', '${leave.employee_name}', '${leave.leave_type}')" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Approve">
                            <span class="material-symbols-outlined">check_circle</span>
                        </button>
                        <button onclick="openActionModal('${leave.public_id}', 'REJECT', '${leave.employee_name}', '${leave.leave_type}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Reject">
                            <span class="material-symbols-outlined">cancel</span>
                        </button>
                    </div>
                `;
            } else {
                actionsHtml = `
                    <button class="text-slate-400 hover:text-primary dark:hover:text-white p-1.5 rounded-lg transition-colors">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                 `;
            }

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-cover bg-center" style="background-image: url('https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employee_name)}');"></div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-slate-900 dark:text-white">${leave.employee_name}</div>
                            <div class="text-xs text-slate-500 dark:text-slate-400">${leave.employee_code}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-900 dark:text-white">${leave.leave_type}</div>
                    <div class="text-xs text-slate-500">${leave.reason || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-900 dark:text-white font-medium">${leave.start_date} - ${leave.end_date}</div>
                    <!-- <div class="text-xs text-slate-500">X Days</div> -->
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    ${new Date(leave.created_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                        <span class="w-1.5 h-1.5 rounded-full ${statusDot} mr-1.5"></span>
                        ${leave.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${actionsHtml}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Modal Logic
    window.openActionModal = (public_id, actionType, empName, leaveType) => {
        currentAction = { id: public_id, type: actionType };
        modal.classList.remove('hidden');

        if (actionType === 'APPROVE') {
            modalTitle.textContent = 'Approve Leave Request';
            modalDescription.innerHTML = `You are about to approve <span class="font-semibold text-slate-800 dark:text-slate-200">${leaveType}</span> for <span class="font-semibold text-slate-800 dark:text-slate-200">${empName}</span>.`;
            modalConfirmBtn.className = "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm";
            modalConfirmBtn.textContent = 'Approve';
        } else {
            modalTitle.textContent = 'Reject Leave Request';
            modalDescription.innerHTML = `You are about to reject <span class="font-semibold text-slate-800 dark:text-slate-200">${leaveType}</span> for <span class="font-semibold text-slate-800 dark:text-slate-200">${empName}</span>.`;
            modalConfirmBtn.className = "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm";
            modalConfirmBtn.textContent = 'Reject';
        }
    };

    modalCancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        currentAction = null;
        modalRemarks.value = '';
    });

    modalConfirmBtn.addEventListener('click', async () => {
        if (!currentAction) return;

        try {
            const token = Utils.getToken();
            const remarks = modalRemarks.value;
            const payload = { action: currentAction.type, remarks: remarks };

            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/leaves/${currentAction.id}/action`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                modal.classList.add('hidden');
                modalRemarks.value = '';
                currentAction = null;
                // Reload
                loadLeaves();
            } else {
                alert('Failed to update leave request');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating leave request');
        }
    });

    // Filters
    document.getElementById('statusFilter').addEventListener('change', loadLeaves);
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allLeaves.filter(l =>
            l.employee_name.toLowerCase().includes(term) ||
            l.leave_type.toLowerCase().includes(term)
        );
        renderLeaves(filtered);
    });

    loadLeaves();
});

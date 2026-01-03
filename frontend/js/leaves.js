document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;
    const token = Utils.getToken();

    // DOM Elements
    const els = {
        tableBody: document.getElementById('leave-table-body'),
        form: document.getElementById('leave-form'),
        modal: document.getElementById('leave-modal'),
        pendingCount: document.getElementById('pending-count'),
        logoutBtn: document.getElementById('logout-btn')
    };

    els.logoutBtn.addEventListener('click', Utils.logout);

    // Toggle File Upload
    const leaveTypeSelect = document.getElementById('leave-type-select');
    const fileContainer = document.getElementById('file-upload-container');

    if (leaveTypeSelect) {
        leaveTypeSelect.addEventListener('change', () => {
            if (leaveTypeSelect.value === 'SICK') {
                fileContainer.classList.remove('hidden');
            } else {
                fileContainer.classList.add('hidden');
            }
        });
    }

    // Load Leaves
    async function loadLeaves() {
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/employee/leave`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const leaves = await res.json();
                renderLeaves(leaves);
                updateStats(leaves);
            } else {
                if (res.status === 401) Utils.logout();
                console.error("Failed to fetch leaves");
            }
        } catch (e) {
            console.error(e);
        }
    }

    function renderLeaves(leaves) {
        els.tableBody.innerHTML = leaves.map(leave => {
            let statusColor = "bg-slate-100 text-slate-600";
            if (leave.status === 'APPROVED') statusColor = "bg-green-100 text-green-700";
            if (leave.status === 'REJECTED') statusColor = "bg-red-100 text-red-700";
            if (leave.status === 'PENDING') statusColor = "bg-amber-100 text-amber-700";

            const attachmentLink = leave.attachment_url
                ? `<a href="${CONFIG.API_BASE_URL}${leave.attachment_url}" target="_blank" class="text-primary hover:underline flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">attachment</span>View</a>`
                : '<span class="text-slate-400">-</span>';

            return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white capitalize">${leave.leave_type}</td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                    ${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-300 truncate max-w-xs" title="${leave.reason}">
                    ${leave.reason}
                </td>
                <td class="px-6 py-4">
                    ${attachmentLink}
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-bold uppercase ${statusColor}">${leave.status}</span>
                </td>
            </tr>
            `;
        }).join('');
    }

    function updateStats(leaves) {
        const pending = leaves.filter(l => l.status === 'PENDING').length;
        els.pendingCount.textContent = pending;
    }

    // Submit Request
    els.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(els.form);

        // Remove file if not sick leave to avoid sending it? Backend ignores it anyway for non-sick, but cleaner.
        if (leaveTypeSelect.value !== 'SICK') {
            formData.delete('file');
        }

        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/employee/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type not set, let browser set it for FormData
                },
                body: formData
            });

            if (res.ok) {
                alert("Leave Requested Successfully!");
                els.modal.classList.add('hidden');
                els.form.reset();
                if (fileContainer) fileContainer.classList.add('hidden');
                loadLeaves();
            } else {
                const err = await res.json();
                alert("Error: " + err.detail);
            }
        } catch (e) {
            console.error(e);
            alert("Connection Error");
        }
    });

    loadLeaves();
});

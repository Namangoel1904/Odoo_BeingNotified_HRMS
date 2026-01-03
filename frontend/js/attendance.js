document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;
    const token = Utils.getToken();

    // DOM Elements
    const els = {
        todayStatus: document.getElementById('today-status'),
        actionContainer: document.getElementById('action-container'),
        tableBody: document.getElementById('attendance-table-body'),
        logoutBtn: document.getElementById('logout-btn')
    };

    els.logoutBtn.addEventListener('click', Utils.logout);

    async function loadAttendance() {
        try {
            // 1. Fetch History
            const historyRes = await fetch(`${CONFIG.API_BASE_URL}/employee/attendance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 2. Fetch Dashboard for Today's Status (Reusable endpoint)
            const dashboardRes = await fetch(`${CONFIG.API_BASE_URL}/employee/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (historyRes.ok && dashboardRes.ok) {
                const history = await historyRes.json();
                const dashboard = await dashboardRes.json();

                renderToday(dashboard.attendance_today);
                renderHistory(history);
            } else {
                if (historyRes.status === 401) Utils.logout();
                alert("Failed to load attendance data.");
            }
        } catch (e) {
            console.error(e);
        }
    }

    function renderToday(att) {
        if (!att) return;

        let statusText = "Not Checked In";
        let btnHtml = `
            <button onclick="handleCheckIn()" class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Check In
            </button>`;

        if (att.checked_in && !att.check_out_time) {
            statusText = `Checked In at ${att.check_in_time}`;
            btnHtml = `
            <button onclick="handleCheckOut()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Check Out
            </button>`;
        } else if (att.check_out_time) {
            statusText = `Completed (In: ${att.check_in_time}, Out: ${att.check_out_time})`;
            btnHtml = `<button disabled class="bg-slate-300 text-slate-500 cursor-not-allowed px-4 py-2 rounded-lg font-medium">Completed</button>`;
        }

        els.todayStatus.textContent = statusText;
        els.actionContainer.innerHTML = btnHtml;
    }

    function renderHistory(records) {
        els.tableBody.innerHTML = records.map(record => {
            const date = new Date(record.date).toLocaleDateString();
            const checkIn = record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            const checkOut = record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

            let statusColor = "bg-slate-100 text-slate-600";
            if (record.status === "PRESENT") statusColor = "bg-green-100 text-green-700";
            if (record.status === "ABSENT") statusColor = "bg-red-100 text-red-700";
            if (record.status === "LEAVE") statusColor = "bg-orange-100 text-orange-700";

            return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">${date}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-bold uppercase ${statusColor}">${record.status}</span>
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-300">${checkIn}</td>
                 <td class="px-6 py-4 text-slate-600 dark:text-slate-300">${checkOut}</td>
            </tr>
            `;
        }).join('');
    }

    // Expose handlers to window
    window.handleCheckIn = async () => {
        if (!confirm("Confirm Check In?")) return;
        await postAttendance('check-in');
    };

    window.handleCheckOut = async () => {
        if (!confirm("Confirm Check Out?")) return;
        await postAttendance('check-out');
    };

    async function postAttendance(action) {
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/employee/attendance/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Success!");
                loadAttendance();
            } else {
                const err = await res.json();
                alert("Error: " + err.detail);
            }
        } catch (e) {
            console.error(e);
            alert("Connection Error");
        }
    }

    loadAttendance();
});

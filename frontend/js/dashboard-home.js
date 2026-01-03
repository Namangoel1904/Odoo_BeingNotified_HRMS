document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;
    const token = Utils.getToken();

    // DOM Elements
    const els = {
        navUserName: document.getElementById('nav-user-name'),
        navUserAvatar: document.getElementById('nav-user-avatar'),

        greetingText: document.getElementById('greeting-text'),
        currentTime: document.getElementById('current-time'),
        currentDate: document.getElementById('current-date'),

        attendanceBadge: document.getElementById('attendance-badge'),
        attendanceStatusText: document.getElementById('attendance-status-text'),
        attendanceBtn: document.getElementById('attendance-btn'),

        leavePendingCount: document.getElementById('leave-pending-count'),
        ticketOpenCount: document.getElementById('ticket-open-count'),

        profileAlert: document.getElementById('profile-alert'),
        missingFields: document.getElementById('missing-fields')
    };

    // Logout
    document.getElementById('logout-btn').addEventListener('click', Utils.logout);

    // Time Update
    function updateTime() {
        const now = new Date();
        els.currentTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        els.currentDate.textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Fetch Dashboard Data
    async function loadDashboard() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/employee/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();

                // User Info
                els.navUserName.textContent = data.employee.name;
                els.greetingText.textContent = `Welcome, ${data.employee.name.split(' ')[0]} 👋`;

                // Attendance
                const att = data.attendance_today;
                if (att.checked_in && !att.check_out_time) {
                    // Checked In
                    els.attendanceBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Present`;
                    els.attendanceBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 font-semibold uppercase tracking-wider border border-green-100 w-fit";
                    els.attendanceStatusText.textContent = `Checked In at ${att.check_in_time}`;
                    els.attendanceBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">logout</span> Check Out`;
                    els.attendanceBtn.classList.replace("bg-primary", "bg-red-600");
                    els.attendanceBtn.classList.replace("hover:bg-blue-600", "hover:bg-red-700");
                    els.attendanceBtn.onclick = () => handleAttendance('check-out');
                } else if (att.check_out_time) {
                    // Checked Out
                    els.attendanceBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Completed`;
                    els.attendanceBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider border border-gray-100 w-fit";
                    els.attendanceStatusText.textContent = `Shift Completed (Out: ${att.check_out_time})`;
                    els.attendanceBtn.textContent = "Checked Out";
                    els.attendanceBtn.disabled = true;
                    els.attendanceBtn.classList.add("opacity-50", "cursor-not-allowed");
                } else {
                    // Not Checked In
                    els.attendanceBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Not Checked In`;
                    els.attendanceBadge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold uppercase tracking-wider border border-amber-100 w-fit";
                    els.attendanceStatusText.textContent = "Not Checked In";
                    els.attendanceBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">login</span> Check In Now`;
                    els.attendanceBtn.onclick = () => handleAttendance('check-in');
                }

                // Stats
                els.leavePendingCount.textContent = data.leave_summary.active;
                els.ticketOpenCount.textContent = data.ticket_summary.active;

                // Profile Alert
                if (!data.profile_status.is_complete) {
                    els.profileAlert.classList.remove('hidden');
                    els.missingFields.textContent = data.profile_status.missing_fields.join(", ");
                }

            } else {
                if (response.status === 401) Utils.logout();
                console.error("Failed to fetch dashboard data");
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleAttendance(action) {
        if (!confirm(`Are you sure you want to ${action.replace('-', ' ')}?`)) return;

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/employee/attendance/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert(`Successfully ${action.replace('-', ' ')}ed!`);
                loadDashboard(); // Refresh
            } else {
                const err = await response.json();
                alert("Error: " + err.detail);
            }
        } catch (e) {
            console.error(e);
            alert("Connection Error");
        }
    }

    // Load Data
    loadDashboard();
});

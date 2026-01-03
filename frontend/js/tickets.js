document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;
    const token = Utils.getToken();

    // DOM Elements
    const els = {
        container: document.getElementById('tickets-container'),
        form: document.getElementById('ticket-form'),
        modal: document.getElementById('ticket-modal'),
        logoutBtn: document.getElementById('logout-btn')
    };

    if (els.logoutBtn) els.logoutBtn.addEventListener('click', Utils.logout);

    // Load Tickets
    async function loadTickets() {
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/employee/ticket`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const tickets = await res.json();
                renderTickets(tickets);
            } else {
                if (res.status === 401) Utils.logout();
                console.error("Failed to fetch tickets");
            }
        } catch (e) {
            console.error(e);
        }
    }

    function renderTickets(tickets) {
        if (!els.container) return; // Guard clause

        if (tickets.length === 0) {
            els.container.innerHTML = `<div class="p-8 text-center text-slate-500">No tickets found.</div>`;
            return;
        }

        els.container.innerHTML = tickets.map(ticket => {
            let statusColor = "bg-slate-100 text-slate-600";
            if (ticket.status === 'OPEN') statusColor = "bg-blue-100 text-blue-700";
            if (ticket.status === 'IN_PROGRESS') statusColor = "bg-amber-100 text-amber-700";
            if (ticket.status === 'RESOLVED') statusColor = "bg-green-100 text-green-700";
            if (ticket.status === 'CLOSED') statusColor = "bg-gray-100 text-gray-700";

            return `
            <div class="bg-white dark:bg-[#1a222c] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1">
                        <span class="px-2 py-0.5 rounded text-xs font-bold uppercase ${statusColor}">${ticket.status}</span>
                        <span class="text-xs text-slate-400 font-mono">#${ticket.id}</span>
                        <span class="text-xs text-slate-500">${new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">${ticket.subject}</h3>
                    <p class="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">${ticket.description}</p>
                    ${ticket.resolution ? `<div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-300"><strong>Resolution:</strong> ${ticket.resolution}</div>` : ''}
                </div>
                 <div class="flex flex-col items-end gap-2 shrink-0">
                    <span class="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                        ${ticket.category ? ticket.category.replace('_', ' ') : 'Other'}
                    </span>
                 </div>
            </div>
            `;
        }).join('');
    }

    // Submit Ticket
    if (els.form) {
        els.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(els.form);
            const payload = Object.fromEntries(formData.entries());

            try {
                const res = await fetch(`${CONFIG.API_BASE_URL}/employee/ticket`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert("Ticket Created Successfully!");
                    if (els.modal) els.modal.classList.add('hidden');
                    els.form.reset();
                    loadTickets();
                } else {
                    const err = await res.json();
                    alert("Error: " + err.detail);
                }
            } catch (e) {
                console.error(e);
                alert("Connection Error");
            }
        });
    }

    loadTickets();
});

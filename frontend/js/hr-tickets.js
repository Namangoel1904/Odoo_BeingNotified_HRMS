document.addEventListener('DOMContentLoaded', () => {
    const user = Utils.checkAuth();
    if (!user || user.role !== 'HR') {
        window.location.href = 'index.html';
        return;
    }

    let allTickets = [];
    let selectedTicket = null;

    // Elements
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('ticketsTableBody');
    const noTicketSelected = document.getElementById('noTicketSelected');
    const ticketDetailPanel = document.getElementById('ticketDetailPanel');

    // Detail Elements
    const detailTitle = document.getElementById('detailTitle');
    const detailCategory = document.getElementById('detailCategory');
    const detailDate = document.getElementById('detailDate');
    const detailEmpName = document.getElementById('detailEmpName');
    const detailEmpCode = document.getElementById('detailEmpCode');
    const detailDescription = document.getElementById('detailDescription');
    const detailStatusSelect = document.getElementById('detailStatusSelect');
    const detailResolution = document.getElementById('detailResolution');
    const updateTicketBtn = document.getElementById('updateTicketBtn');

    async function loadTickets() {
        try {
            const token = Utils.getToken();
            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                allTickets = await response.json();
                renderTickets(allTickets);
            }
        } catch (e) {
            console.error(e);
        }
    }

    function renderTickets(tickets) {
        tableBody.innerHTML = '';
        if (tickets.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">No tickets found.</td></tr>';
            return;
        }

        tickets.forEach(ticket => {
            const tr = document.createElement('tr');
            tr.className = 'group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800';
            if (selectedTicket && selectedTicket.public_id === ticket.public_id) {
                tr.classList.add('bg-blue-50/50', 'dark:bg-blue-900/10');
            }

            tr.onclick = () => selectTicket(ticket);

            let statusColor = 'bg-gray-100 text-gray-800';
            if (ticket.status === 'OPEN') statusColor = 'bg-red-100 text-red-800';
            if (ticket.status === 'IN_PROGRESS') statusColor = 'bg-blue-100 text-blue-800';
            if (ticket.status === 'RESOLVED') statusColor = 'bg-green-100 text-green-800';
            if (ticket.status === 'CLOSED') statusColor = 'bg-gray-100 text-gray-800';

            tr.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">${ticket.category}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                        <div class="bg-center bg-no-repeat bg-cover rounded-full size-8 shrink-0" style="background-image: url('https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.employee_name)}');"></div>
                        <div class="flex flex-col">
                            <span class="text-slate-900 dark:text-white text-sm font-medium">${ticket.employee_name}</span>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium max-w-xs truncate">${ticket.subject}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                        ${ticket.status}
                    </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right">
                    <span class="material-symbols-outlined text-slate-400">chevron_right</span>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function selectTicket(ticket) {
        selectedTicket = ticket;
        renderTickets(allTickets); // Re-render to update active state styling

        noTicketSelected.classList.add('hidden');
        ticketDetailPanel.classList.remove('hidden');

        detailTitle.textContent = `#${ticket.id}`; // Using DB ID just for display, or could use public_id substring
        detailCategory.textContent = ticket.category;
        detailDate.textContent = `Submitted on ${new Date(ticket.created_at).toLocaleString()}`;
        detailEmpName.textContent = ticket.employee_name;
        detailEmpCode.textContent = ticket.employee_code;
        detailDescription.textContent = ticket.description;

        detailStatusSelect.value = ticket.status;
        detailResolution.value = ticket.resolution || '';

        // Scroll to top of detail panel on mobile if needed
        if (window.innerWidth < 1024) {
            ticketDetailPanel.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateTicketBtn.addEventListener('click', async () => {
        if (!selectedTicket) return;

        const newStatus = detailStatusSelect.value;
        const resolution = detailResolution.value;

        try {
            const token = Utils.getToken();
            const payload = { status: newStatus, resolution: resolution };

            const response = await fetch(`${CONFIG.API_BASE_URL}/hr/tickets/${selectedTicket.public_id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Refresh list
                const idx = allTickets.findIndex(t => t.public_id === selectedTicket.public_id);
                if (idx !== -1) {
                    allTickets[idx].status = newStatus;
                    allTickets[idx].resolution = resolution;
                }
                alert('Ticket updated successfully');
                loadTickets(); // Reload fully to be safe
            } else {
                alert('Failed to update ticket');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating ticket');
        }
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allTickets.filter(t =>
            t.employee_name.toLowerCase().includes(term) ||
            t.subject.toLowerCase().includes(term) ||
            t.public_id.toLowerCase().includes(term)
        );
        renderTickets(filtered);
    });

    loadTickets();
});

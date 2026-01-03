/* HR Dashboard Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const user = Utils.checkAuth();
    if (!user) return;

    // In real app, check if Role is HR. If Admin tries to access, maybe allow?
    // But for now, let's just ensure they are logged in.

    const logoutBtns = document.querySelectorAll('button');
    logoutBtns.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('logout')) {
            btn.addEventListener('click', () => {
                Utils.logout();
            });
        }
    });

    // Handle "CMS" or any other links if needed
    // The sidebar links in the provided HTML are '#'. 
    // We should at least make "Create New Employee" button work if it's not a link.

    // In hr-dashboard.html, there is a "Create New Employee" button.
    // Finding it by text content or structure.
    const createEmpBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Create New Employee'));
    createEmpBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'create-employee.html';
        });
    });
});

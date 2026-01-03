const Utils = {
    saveToken: (token) => {
        localStorage.setItem('access_token', token);
    },
    getToken: () => {
        return localStorage.getItem('access_token');
    },
    removeToken: () => {
        localStorage.removeItem('access_token');
    },
    isLoggedIn: () => {
        return !!localStorage.getItem('access_token');
    },
    logout: () => {
        Utils.removeToken();
        window.location.href = 'index.html';
    },
    parseJwt: (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    },
    checkAuth: () => {
        const token = Utils.getToken();
        if (!token) {
            window.location.href = 'index.html';
            return null;
        }
        // Check expiry
        const payload = Utils.parseJwt(token);
        if (payload.exp * 1000 < Date.now()) {
            Utils.logout();
            return null;
        }
        return payload;
    },
    async updatePassword(oldPwd, newPwd) {
        // ... (existing)
        alert('Password update not fully implemented in utils yet');
    },

    switchTab: function (tabId) {
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('block');
        });
        document.getElementById(tabId).classList.remove('hidden');
        document.getElementById(tabId).classList.add('block');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('border-primary', 'text-primary');
            btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        });
        const activeBtn = document.querySelector(`[onclick="Utils.switchTab('${tabId}')"]`);
        if (activeBtn) {
            activeBtn.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            activeBtn.classList.add('border-primary', 'text-primary');
        }
    }
};

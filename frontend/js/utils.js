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
    }
};

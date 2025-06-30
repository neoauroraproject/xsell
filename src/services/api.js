const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: { username, password },
        });

        if (response.success) {
            this.setToken(response.token);
        }

        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.setToken(null);
        }
    }

    async getCurrentAdmin() {
        return this.request('/auth/me');
    }

    // Panel endpoints
    async getPanels() {
        return this.request('/panels');
    }

    async addPanel(panelData) {
        return this.request('/panels', {
            method: 'POST',
            body: panelData,
        });
    }

    async updatePanel(id, panelData) {
        return this.request(`/panels/${id}`, {
            method: 'PUT',
            body: panelData,
        });
    }

    async deletePanel(id) {
        return this.request(`/panels/${id}`, {
            method: 'DELETE',
        });
    }

    async getPanelInbounds(panelId) {
        return this.request(`/panels/${panelId}/inbounds`);
    }

    async testPanelConnection(panelId) {
        return this.request(`/panels/${panelId}/test`, {
            method: 'POST',
        });
    }

    // Admin endpoints
    async getAdmins() {
        return this.request('/admins');
    }

    async addAdmin(adminData) {
        return this.request('/admins', {
            method: 'POST',
            body: adminData,
        });
    }

    async updateAdmin(id, adminData) {
        return this.request(`/admins/${id}`, {
            method: 'PUT',
            body: adminData,
        });
    }

    async deleteAdmin(id) {
        return this.request(`/admins/${id}`, {
            method: 'DELETE',
        });
    }

    async addTrafficToAdmin(id, amount) {
        return this.request(`/admins/${id}/add-traffic`, {
            method: 'POST',
            body: { amount },
        });
    }

    async addTimeToAdmin(id, days) {
        return this.request(`/admins/${id}/add-time`, {
            method: 'POST',
            body: { days },
        });
    }

    async getAdminTrafficLogs(id) {
        return this.request(`/admins/${id}/traffic-logs`);
    }

    // User endpoints
    async getUsers(adminId = null) {
        const query = adminId ? `?adminId=${adminId}` : '';
        return this.request(`/users${query}`);
    }

    async addUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: userData,
        });
    }

    async updateUser(id, userData) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: userData,
        });
    }

    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    async toggleUser(id) {
        return this.request(`/users/${id}/toggle`, {
            method: 'POST',
        });
    }

    async getUserSubscription(id) {
        return this.request(`/users/${id}/subscription`);
    }

    async syncUserTraffic(id) {
        return this.request(`/users/${id}/sync-traffic`, {
            method: 'POST',
        });
    }

    // Settings endpoints
    async getSettings() {
        return this.request('/settings');
    }

    async updateSettings(settings) {
        return this.request('/settings', {
            method: 'PUT',
            body: settings,
        });
    }

    async getSetting(key) {
        return this.request(`/settings/${key}`);
    }
}

export default new ApiService();
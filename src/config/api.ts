const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
      ...options,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      console.log('📡 Making request with config:', {
        url,
        method: config.method,
        headers: config.headers,
        hasBody: !!config.body
      });

      const response = await fetch(url, config);
      
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Success:', data);
      
      // Check if response has success field
      if (data.hasOwnProperty('success') && !data.success) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`❌ API request failed: ${endpoint}`, error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
      }
      
      throw error;
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    console.log('🔐 Attempting login with:', { username });
    
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      // Store token if login successful
      if (response.success && response.data && response.data.token) {
        console.log('💾 Storing auth token');
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login request failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Panel endpoints
  async getPanels() {
    return this.request('/panels');
  }

  async createPanel(panelData: any) {
    return this.request('/panels', {
      method: 'POST',
      body: JSON.stringify(panelData),
    });
  }

  async updatePanel(id: string, panelData: any) {
    return this.request(`/panels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(panelData),
    });
  }

  async deletePanel(id: string) {
    return this.request(`/panels/${id}`, {
      method: 'DELETE',
    });
  }

  // X-UI endpoints
  async testXUIConnection(url: string, username: string, password: string) {
    return this.request('/xui/test-connection', {
      method: 'POST',
      body: JSON.stringify({ url, username, password }),
    });
  }

  async getXUIStats(panelId: string) {
    return this.request(`/xui/stats/${panelId}`);
  }

  async getXUIInbounds(panelId: string) {
    return this.request(`/xui/inbounds/${panelId}`);
  }

  async createXUIClient(panelId: string, clientData: any) {
    return this.request(`/xui/clients/${panelId}`, {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateXUIClient(panelId: string, clientId: string, clientData: any) {
    return this.request(`/xui/clients/${panelId}/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteXUIClient(panelId: string, clientId: string) {
    return this.request(`/xui/clients/${panelId}/${clientId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdmins() {
    return this.request('/admins');
  }

  async createAdmin(adminData: any) {
    return this.request('/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async updateAdmin(id: string, adminData: any) {
    return this.request(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adminData),
    });
  }

  async deleteAdmin(id: string) {
    return this.request(`/admins/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints (local database)
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/settings');
  }

  async updateSetting(key: string, value: string, description?: string) {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  }

  async createSetting(key: string, value: string, description?: string) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value, description }),
    });
  }

  async deleteSetting(key: string) {
    return this.request(`/settings/${key}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
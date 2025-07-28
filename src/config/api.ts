const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/api`
    : 'http://localhost:3001/api'
);

class ApiClient {
  private baseURL: string;
  private mockMode = true; // Enable mock mode for standalone frontend

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
    // Mock mode for standalone frontend
    if (this.mockMode) {
      return this.handleMockRequest(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
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

  private async handleMockRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const method = options.method || 'GET';
    
    // Mock login endpoint
    if (endpoint === '/auth/login' && method === 'POST') {
      const body = JSON.parse(options.body as string);
      if (body.username === 'admin' && body.password === 'admin123') {
        return {
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'admin',
            role: 'super_admin',
            email: 'admin@xsell.com'
          }
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }

    // Mock user info endpoint
    if (endpoint === '/auth/me' && method === 'GET') {
      return {
        success: true,
        user: {
          id: 1,
          username: 'admin',
          role: 'super_admin',
          email: 'admin@xsell.com'
        }
      };
    }

    // Mock panels endpoint
    if (endpoint === '/panels' && method === 'GET') {
      return {
        success: true,
        panels: [
          {
            id: 1,
            name: 'Demo Panel 1',
            url: 'https://panel1.example.com',
            username: 'admin',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Demo Panel 2',
            url: 'https://panel2.example.com',
            username: 'admin',
            status: 'inactive',
            created_at: new Date().toISOString()
          }
        ]
      };
    }

    // Mock users endpoint
    if (endpoint === '/users' && method === 'GET') {
      return {
        success: true,
        users: [
          {
            id: 1,
            username: 'user1',
            email: 'user1@example.com',
            panel_id: 1,
            status: 'active',
            traffic_used: 1024000000,
            traffic_limit: 10240000000,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            username: 'user2',
            email: 'user2@example.com',
            panel_id: 1,
            status: 'active',
            traffic_used: 2048000000,
            traffic_limit: 10240000000,
            created_at: new Date().toISOString()
          }
        ]
      };
    }

    // Mock admins endpoint
    if (endpoint === '/admins' && method === 'GET') {
      return {
        success: true,
        admins: [
          {
            id: 1,
            username: 'admin',
            email: 'admin@xsell.com',
            role: 'super_admin',
            created_at: new Date().toISOString()
          }
        ]
      };
    }

    // Mock settings endpoint
    if (endpoint === '/settings' && method === 'GET') {
      return {
        success: true,
        settings: [
          { key: 'app_name', value: 'X-UI SELL Panel', description: 'Application name' },
          { key: 'app_version', value: '1.0.0', description: 'Application version' },
          { key: 'max_panels', value: '10', description: 'Maximum number of panels' },
          { key: 'auto_backup', value: 'true', description: 'Enable automatic backups' }
        ]
      };
    }

    // Mock dashboard stats
    if (endpoint === '/panels/stats' && method === 'GET') {
      return {
        success: true,
        stats: {
          totalPanels: 2,
          activePanels: 1,
          totalUsers: 25,
          totalTraffic: 1024000000000,
          cpuUsage: 45.2,
          memoryUsage: 67.8,
          diskUsage: 23.4
        }
      };
    }

    // Default mock response
    return {
      success: true,
      message: 'Mock response for standalone frontend',
      data: []
    };
  }

  // Method to toggle mock mode (for when backend is available)
  setMockMode(enabled: boolean) {
    this.mockMode = enabled;
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

  // Health check
  async healthCheck() {
    return this.request('/health');
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
  async testXUIConnection(url: string, username: string, password: string, panel_type?: string) {
    return this.request('/xui/test-connection', {
      method: 'POST',
      body: JSON.stringify({ url, username, password, panel_type }),
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

  // Panel Admin endpoints
  async createPanelAdmin(panelId: string, adminData: any) {
    return this.request(`/panels/${panelId}/admins`, {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async getPanelAdmins(panelId: string) {
    return this.request(`/panels/${panelId}/admins`);
  }

  async updatePanelAdmin(panelId: string, adminId: string, adminData: any) {
    return this.request(`/panels/${panelId}/admins/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(adminData),
    });
  }

  async deletePanelAdmin(panelId: string, adminId: string) {
    return this.request(`/panels/${panelId}/admins/${adminId}`, {
      method: 'DELETE',
    });
  }

  async addTrafficToPanelAdmin(panelId: string, adminId: string, amountGb: number) {
    return this.request(`/panels/${panelId}/admins/${adminId}/add-traffic`, {
      method: 'POST',
      body: JSON.stringify({ amount_gb: amountGb }),
    });
  }

  async addTimeToPanelAdmin(panelId: string, adminId: string, days: number) {
    return this.request(`/panels/${panelId}/admins/${adminId}/add-time`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
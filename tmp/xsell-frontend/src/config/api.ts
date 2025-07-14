class ApiClient {
  private baseURL = 'http://localhost:3001/api';
  private mockMode = true; // Enable mock mode for standalone frontend

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Mock mode for standalone frontend
    if (this.mockMode) {
      return this.handleMockRequest(endpoint, options);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API Error:', error);
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

  async login(username: string, password: string) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login request failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getPanels() {
    return this.request('/panels');
  }

  async createPanel(panelData: any) {
    return this.request('/panels', {
      method: 'POST',
      body: JSON.stringify(panelData),
    });
  }

  async updatePanel(id: number, panelData: any) {
    return this.request(`/panels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(panelData),
    });
  }

  async deletePanel(id: number) {
    return this.request(`/panels/${id}`, {
      method: 'DELETE',
    });
  }

  async getUsers() {
    return this.request('/users');
  }

  async getAdmins() {
    return this.request('/admins');
  }

  async createAdmin(adminData: any) {
    return this.request('/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async getSettings() {
    return this.request('/settings');
  }

  async updateSetting(key: string, value: string) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  }

  async getPanelStats() {
    return this.request('/panels/stats');
  }

  async getXuiStats(panelId: number) {
    return this.request(`/xui/${panelId}/stats`);
  }

  async getXuiInbounds(panelId: number) {
    return this.request(`/xui/${panelId}/inbounds`);
  }

  async getXuiUsers(panelId: number) {
    return this.request(`/xui/${panelId}/users`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
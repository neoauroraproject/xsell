import axios from 'axios';
import db from '../config/database.js';

class XUIService {
  async getPanel(panelId) {
    const panel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [panelId]);
    if (!panel) {
      throw new Error('Panel not found');
    }
    return panel;
  }

  async createSession(url, username, password) {
    try {
      const loginUrl = `${url}/login`;
      const response = await axios.post(loginUrl, {
        username,
        password
      }, {
        timeout: 10000,
        validateStatus: (status) => status < 500
      });

      if (response.data.success) {
        return response.headers['set-cookie'];
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Connection refused - panel may be offline');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Connection timeout - panel may be unreachable');
      }
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async testConnection(url, username, password) {
    try {
      const cookies = await this.createSession(url, username, password);
      return {
        connected: true,
        message: 'Connection successful',
        cookies: cookies ? true : false
      };
    } catch (error) {
      return {
        connected: false,
        message: error.message
      };
    }
  }

  async makeRequest(panelId, endpoint, method = 'GET', data = null) {
    const panel = await this.getPanel(panelId);
    const cookies = await this.createSession(panel.url, panel.username, panel.password);
    
    const config = {
      method,
      url: `${panel.url}${endpoint}`,
      headers: {
        'Cookie': cookies.join('; '),
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }

  async getSystemStats(panelId) {
    try {
      const stats = await this.makeRequest(panelId, '/panel/api/inbounds/list');
      return {
        totalInbounds: stats.obj?.length || 0,
        activeClients: 0, // This would need to be calculated from actual data
        totalTraffic: 0,  // This would need to be calculated from actual data
        systemUptime: 'N/A' // This would need to be fetched from system info
      };
    } catch (error) {
      throw new Error(`Failed to get system stats: ${error.message}`);
    }
  }

  async getInbounds(panelId) {
    try {
      const response = await this.makeRequest(panelId, '/panel/api/inbounds/list');
      return response.obj || [];
    } catch (error) {
      throw new Error(`Failed to get inbounds: ${error.message}`);
    }
  }

  async createClient(panelId, clientData) {
    try {
      const response = await this.makeRequest(panelId, '/panel/api/inbounds/addClient', 'POST', clientData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }
  }

  async updateClient(panelId, clientId, clientData) {
    try {
      const response = await this.makeRequest(panelId, `/panel/api/inbounds/updateClient/${clientId}`, 'POST', clientData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update client: ${error.message}`);
    }
  }

  async deleteClient(panelId, clientId) {
    try {
      const response = await this.makeRequest(panelId, `/panel/api/inbounds/delClient/${clientId}`, 'POST');
      return response;
    } catch (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }
}

export const xuiService = new XUIService();
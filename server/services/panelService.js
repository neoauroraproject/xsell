import { xuiService } from './xuiService.js';
import { marzbanService } from './marzbanService.js';
import db from '../config/database.js';

class PanelService {
  async getServiceForPanel(panelId) {
    const panel = await db.getAsync('SELECT * FROM panels WHERE id = ?', [panelId]);
    if (!panel) {
      throw new Error('Panel not found');
    }

    if (panel.panel_type === 'marzban') {
      return marzbanService;
    } else {
      return xuiService; // Default to 3x-ui
    }
  }

  async testConnection(url, username, password, panelType = '3x-ui') {
    try {
      if (panelType === 'marzban') {
        return await marzbanService.testConnection(url, username, password);
      } else {
        return await xuiService.testConnection(url, username, password);
      }
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  async getSystemStats(panelId) {
    const service = await this.getServiceForPanel(panelId);
    return await service.getSystemStats(panelId);
  }

  async getInbounds(panelId) {
    const service = await this.getServiceForPanel(panelId);
    return await service.getInbounds(panelId);
  }

  async createUser(panelId, userData) {
    const service = await this.getServiceForPanel(panelId);
    
    if (service === marzbanService) {
      return await service.createUser(panelId, userData);
    } else {
      return await service.createClient(panelId, userData);
    }
  }

  async updateUser(panelId, userId, userData) {
    const service = await this.getServiceForPanel(panelId);
    
    if (service === marzbanService) {
      return await service.updateUser(panelId, userId, userData);
    } else {
      return await service.updateClient(panelId, userId, userData);
    }
  }

  async deleteUser(panelId, userId) {
    const service = await this.getServiceForPanel(panelId);
    
    if (service === marzbanService) {
      return await service.deleteUser(panelId, userId);
    } else {
      return await service.deleteClient(panelId, userId);
    }
  }

  async resetUserTraffic(panelId, userId) {
    const service = await this.getServiceForPanel(panelId);
    
    if (service === marzbanService) {
      return await service.resetUserTraffic(panelId, userId);
    } else {
      return await service.resetClientTraffic(panelId, userId);
    }
  }
}

export const panelService = new PanelService();
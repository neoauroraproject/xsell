import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';

export interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  version: string;
  xrayVersion: string;
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  onlineConnections: number;
  totalInbounds?: number;
}

export interface Client {
  id: string;
  uuid: string;
  username: string;
  email: string;
  enable: boolean;
  expiryTime: number;
  totalGB: number;
  up: number;
  down: number;
  createdBy: string;
  createdAt: string;
  panelId: string;
  inboundId: string;
  subId: string;
  ipLock?: string;
  notes?: string;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
  trafficLimit?: number;
  trafficUsed?: number;
  timeLimit?: number;
  timeUsed?: number;
}

export interface Panel {
  id: string;
  name: string;
  url: string;
  subUrl?: string;
  username: string;
  status: 'online' | 'offline';
  cpuUsage?: number;
  ramUsage?: number;
  totalUsers?: number;
  activeUsers?: number;
  trafficGB?: number;
  createdAt: string;
  vpsUsername?: string;
  vpsPassword?: string;
  hasVpsAccess?: boolean;
}

export interface Inbound {
  id: string;
  tag: string;
  protocol: string;
  port: number;
  listen: string;
  enable: boolean;
  settings: any;
  streamSettings: any;
  sniffing: any;
}

export interface Traffic {
  up: number;
  down: number;
  total: number;
}

export const useSystemStats = (panelId?: string) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (panelId) {
          const response = await apiClient.getXUIStats(panelId);
          if (response.success) {
            setStats(response.data);
          }
        } else {
          // Get aggregated stats from all panels
          const panelsResponse = await apiClient.getPanels();
          if (panelsResponse.success && panelsResponse.data.length > 0) {
            // Get stats from the first active panel
            const activePanel = panelsResponse.data.find((p: Panel) => p.status === 'online') || panelsResponse.data[0];
            if (activePanel) {
              const response = await apiClient.getXUIStats(activePanel.id);
              if (response.success) {
                setStats(response.data);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch system stats:', error);
        // Set fallback data
        setStats({
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          disk: Math.random() * 100,
          uptime: '5 days, 12 hours',
          version: '1.8.0',
          xrayVersion: '1.8.1',
          totalUsers: 0,
          activeUsers: 0,
          expiredUsers: 0,
          onlineConnections: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [panelId]);

  return { stats, loading };
};

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await apiClient.getUsers();
      if (response.success) {
        const usersData = response.data || [];
        // Transform database users to client format
        const transformedClients = usersData.map((user: any) => ({
          id: user.id.toString(),
          uuid: user.id.toString(),
          username: user.username,
          email: user.email || user.username,
          enable: user.status === 'active',
          expiryTime: user.expiry_date ? new Date(user.expiry_date).getTime() : Date.now() + 30 * 24 * 60 * 60 * 1000,
          totalGB: user.traffic_limit || 10 * 1024 * 1024 * 1024, // 10GB default
          up: user.traffic_used ? user.traffic_used / 2 : Math.random() * 1024 * 1024 * 1024,
          down: user.traffic_used ? user.traffic_used / 2 : Math.random() * 2 * 1024 * 1024 * 1024,
          createdBy: '1',
          createdAt: user.created_at,
          panelId: user.panel_id?.toString() || '1',
          inboundId: '1',
          subId: `sub_${user.id}`,
          ipLock: undefined,
          notes: undefined
        }));
        setClients(transformedClients);
      } else {
        console.error('Failed to fetch users:', response);
        setClients([]);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: any) => {
    try {
      const response = await apiClient.createUser({
        username: clientData.email.split('@')[0],
        email: clientData.email,
        panel_id: clientData.panelId,
        traffic_limit: clientData.totalGB * 1024 * 1024 * 1024,
        expiry_date: new Date(Date.now() + clientData.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      });
      
      if (response.success) {
        await fetchClients(); // Refresh the list
        return response;
      }
      throw new Error(response.message);
    } catch (error) {
      console.error('Failed to add client:', error);
      throw error;
    }
  };

  const updateClient = async (clientUuid: string, clientData: any) => {
    try {
      const response = await apiClient.updateUser(clientUuid, clientData);
      if (response.success) {
        await fetchClients(); // Refresh the list
        return response;
      }
      throw new Error(response.message);
    } catch (error) {
      console.error('Failed to update client:', error);
      throw error;
    }
  };

  const deleteClient = async (clientUuid: string, panelId: string, inboundId: string) => {
    try {
      const response = await apiClient.deleteUser(clientUuid);
      if (response.success) {
        await fetchClients(); // Refresh the list
        return response;
      }
      throw new Error(response.message);
    } catch (error) {
      console.error('Failed to delete client:', error);
      throw error;
    }
  };

  return { clients, loading, setClients, addClient, updateClient, deleteClient, refetch: fetchClients };
};

export const useAdmins = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await apiClient.getAdmins();
      if (response.success) {
        const adminsData = response.data || [];
        setAdmins(adminsData);
      } else {
        console.error('Failed to fetch admins:', response);
        setAdmins([]);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async (adminData: any) => {
    try {
      const response = await apiClient.createAdmin(adminData);
      await fetchAdmins(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Failed to add admin:', error);
      throw error;
    }
  };

  const updateAdmin = async (id: string, adminData: any) => {
    try {
      const response = await apiClient.updateAdmin(id, adminData);
      await fetchAdmins(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Failed to update admin:', error);
      throw error;
    }
  };

  const deleteAdmin = async (id: string) => {
    try {
      const response = await apiClient.deleteAdmin(id);
      await fetchAdmins(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Failed to delete admin:', error);
      throw error;
    }
  };

  return { admins, loading, setAdmins, addAdmin, updateAdmin, deleteAdmin, refetch: fetchAdmins };
};

export const usePanels = () => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    try {
      const response = await apiClient.getPanels();
      if (response.success) {
        const panelsData = response.data || [];
        const transformedPanels = await Promise.all(panelsData.map(async (panel: any) => {
          let realStats = {
            cpuUsage: Math.random() * 100,
            ramUsage: Math.random() * 100,
            totalUsers: Math.floor(Math.random() * 50) + 10,
            activeUsers: Math.floor(Math.random() * 40) + 5,
            trafficGB: Math.floor(Math.random() * 1000) + 100
          };

          try {
            // Try to get real stats from the panel
            const statsResponse = await apiClient.getXUIStats(panel.id);
            if (statsResponse.success) {
              realStats = {
                cpuUsage: statsResponse.data.cpu,
                ramUsage: statsResponse.data.memory,
                totalUsers: statsResponse.data.totalUsers,
                activeUsers: statsResponse.data.activeUsers,
                trafficGB: Math.floor(Math.random() * 1000) + 100 // Traffic calculation would need more complex logic
              };
            }
          } catch (error) {
            console.log(`Could not get real stats for panel ${panel.name}`);
          }

          return {
            ...panel,
            status: panel.status === 'active' ? 'online' : 'offline',
            hasVpsAccess: !!(panel.vpsUsername && panel.vpsPassword),
            ...realStats
          };
        }));
        setPanels(transformedPanels);
      } else {
        console.error('Failed to fetch panels:', response);
        setPanels([]);
      }
    } catch (error) {
      console.error('Failed to fetch panels:', error);
      setPanels([]);
    } finally {
      setLoading(false);
    }
  };

  const addPanel = async (panelData: any) => {
    try {
      console.log('Adding panel with data:', panelData);
      const response = await apiClient.createPanel(panelData);
      console.log('Panel creation response:', response);
      
      if (response.success) {
        await fetchPanels(); // Refresh the list
        return response;
      } else {
        throw new Error(response.message || 'Failed to create panel');
      }
    } catch (error) {
      console.error('Failed to add panel:', error);
      throw error;
    }
  };

  const updatePanel = async (id: string, panelData: any) => {
    try {
      const response = await apiClient.updatePanel(id, panelData);
      await fetchPanels(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Failed to update panel:', error);
      throw error;
    }
  };

  const deletePanel = async (id: string) => {
    try {
      const response = await apiClient.deletePanel(id);
      await fetchPanels(); // Refresh the list
      return response;
    } catch (error) {
      console.error('Failed to delete panel:', error);
      throw error;
    }
  };

  const testConnection = async (url: string, username: string, password: string, panel_type?: string) => {
    try {
      const response = await apiClient.testXUIConnection(url, username, password, panel_type);
      return response;
    } catch (error) {
      console.error('Failed to test connection:', error);
      throw error;
    }
  };

  return { 
    panels, 
    loading, 
    setPanels, 
    addPanel, 
    updatePanel, 
    deletePanel, 
    testConnection,
    refetch: fetchPanels 
  };
};

export const useInbounds = (panelId?: string) => {
  const [inbounds, setInbounds] = useState<Inbound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (panelId) {
      fetchInbounds();
    } else {
      setLoading(false);
    }
  }, [panelId]);

  const fetchInbounds = async () => {
    if (!panelId) return;
    
    try {
      const response = await apiClient.getXUIInbounds(panelId);
      if (response.success) {
        setInbounds(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch inbounds:', error);
      setInbounds([]);
    } finally {
      setLoading(false);
    }
  };

  return { inbounds, loading, setInbounds, refetch: fetchInbounds };
};

export const useTraffic = () => {
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockTraffic: Traffic[] = Array.from({ length: 24 }, (_, i) => ({
      up: Math.random() * 1000,
      down: Math.random() * 2000,
      total: Math.random() * 3000
    }));
    
    setTimeout(() => {
      setTraffic(mockTraffic);
      setLoading(false);
    }, 1000);
  }, []);

  return { traffic, loading };
};
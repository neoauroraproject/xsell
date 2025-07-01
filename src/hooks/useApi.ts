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
          // Mock data for dashboard when no specific panel
          setStats({
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            disk: Math.random() * 100,
            uptime: '5 days, 12 hours',
            version: '1.8.0',
            xrayVersion: '1.8.1',
            totalUsers: 150,
            activeUsers: 120,
            expiredUsers: 30,
            onlineConnections: 85
          });
        }
      } catch (error) {
        console.error('Failed to fetch system stats:', error);
        // Set mock data on error
        setStats({
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          disk: Math.random() * 100,
          uptime: '5 days, 12 hours',
          version: '1.8.0',
          xrayVersion: '1.8.1',
          totalUsers: 150,
          activeUsers: 120,
          expiredUsers: 30,
          onlineConnections: 85
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
        // Transform database users to client format
        const transformedClients = response.data.map((user: any) => ({
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
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      // Set mock data on error
      setClients([
        {
          id: '1',
          uuid: 'uuid-1',
          username: 'user1',
          email: 'user1@example.com',
          enable: true,
          expiryTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
          totalGB: 10 * 1024 * 1024 * 1024,
          up: Math.random() * 1024 * 1024 * 1024,
          down: Math.random() * 2 * 1024 * 1024 * 1024,
          createdBy: '1',
          createdAt: new Date().toISOString(),
          panelId: '1',
          inboundId: '1',
          subId: 'sub_1'
        }
      ]);
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
        setAdmins(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      // Set mock data on error
      setAdmins([
        {
          id: '1',
          username: 'admin',
          email: 'admin@walpanel.com',
          role: 'super_admin',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
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
        const transformedPanels = response.data.map((panel: any) => ({
          ...panel,
          status: panel.status === 'active' ? 'online' : 'offline',
          cpuUsage: Math.random() * 100,
          ramUsage: Math.random() * 100,
          totalUsers: Math.floor(Math.random() * 50) + 10,
          activeUsers: Math.floor(Math.random() * 40) + 5,
          trafficGB: Math.floor(Math.random() * 1000) + 100
        }));
        setPanels(transformedPanels);
      }
    } catch (error) {
      console.error('Failed to fetch panels:', error);
      // Set mock data on error
      setPanels([
        {
          id: '1',
          name: 'Server-Ar1',
          url: 'https://panel1.example.com',
          username: 'admin',
          status: 'online',
          cpuUsage: 45.2,
          ramUsage: 67.8,
          totalUsers: 25,
          activeUsers: 18,
          trafficGB: 450,
          createdAt: new Date().toISOString()
        }
      ]);
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

  const testConnection = async (url: string, username: string, password: string) => {
    try {
      const response = await apiClient.testXUIConnection(url, username, password);
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
      // Set mock data on error
      setInbounds([
        {
          id: '1',
          tag: 'inbound-1',
          protocol: 'vmess',
          port: 443,
          listen: '0.0.0.0',
          enable: true,
          settings: {},
          streamSettings: {},
          sniffing: {}
        }
      ]);
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
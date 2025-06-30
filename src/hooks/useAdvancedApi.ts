import { useState, useEffect } from 'react';
import { 
  TrafficData, 
  UserConnectionLog, 
  AuditLog, 
  SharedTrafficPool, 
  SystemSettings, 
  BackupSnapshot, 
  BulkOperation,
  InboundTemplate,
  ConnectionData
} from '../types';

export const useTrafficMonitoring = (userId?: string, period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateTrafficData = () => {
      const days = period === 'daily' ? 7 : period === 'weekly' ? 4 : 12;
      const data: TrafficData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          upload: Math.random() * 5000,
          download: Math.random() * 15000,
          total: Math.random() * 20000
        });
      }
      
      setTrafficData(data);
      setLoading(false);
    };

    generateTrafficData();
  }, [userId, period]);

  return { trafficData, loading };
};

export const useLiveStats = () => {
  const [liveStats, setLiveStats] = useState({
    activeConnections: 0,
    bandwidth: { upload: 0, download: 0 },
    connectionHistory: [] as ConnectionData[]
  });

  useEffect(() => {
    const updateStats = () => {
      const newConnection: ConnectionData = {
        timestamp: new Date().toISOString(),
        activeConnections: Math.floor(Math.random() * 100) + 50,
        bandwidth: Math.random() * 1000
      };

      setLiveStats(prev => ({
        activeConnections: newConnection.activeConnections,
        bandwidth: {
          upload: Math.random() * 500,
          download: Math.random() * 1500
        },
        connectionHistory: [...prev.connectionHistory.slice(-23), newConnection]
      }));
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return liveStats;
};

export const useConnectionLogs = (userId?: string) => {
  const [logs, setLogs] = useState<UserConnectionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockLogs: UserConnectionLog[] = Array.from({ length: 20 }, (_, i) => ({
      id: `log_${i}`,
      userId: userId || `user_${Math.floor(Math.random() * 10)}`,
      username: `User${i + 1}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      connectTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      disconnectTime: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() : undefined,
      sessionDuration: Math.floor(Math.random() * 3600),
      uploadBytes: Math.random() * 1000000000,
      downloadBytes: Math.random() * 5000000000,
      protocol: ['vmess', 'vless', 'trojan'][Math.floor(Math.random() * 3)],
      port: [443, 8443, 2053][Math.floor(Math.random() * 3)]
    }));

    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, [userId]);

  return { logs, loading };
};

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
      id: `audit_${i}`,
      action: ['login', 'logout', 'create_user', 'delete_user', 'modify_user', 'system_restart'][Math.floor(Math.random() * 6)],
      adminId: `admin_${Math.floor(Math.random() * 3)}`,
      adminUsername: ['superadmin', 'admin1', 'admin2'][Math.floor(Math.random() * 3)],
      targetId: Math.random() > 0.5 ? `target_${i}` : undefined,
      targetType: ['user', 'admin', 'panel', 'inbound', 'system'][Math.floor(Math.random() * 5)] as any,
      details: `Action performed on ${new Date().toLocaleString()}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)] as any
    }));

    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  return { logs, loading };
};

export const useSharedPools = () => {
  const [pools, setPools] = useState<SharedTrafficPool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockPools: SharedTrafficPool[] = [
      {
        id: '1',
        name: 'Family Plan',
        totalQuota: 100 * 1024 * 1024 * 1024,
        usedQuota: 45 * 1024 * 1024 * 1024,
        userIds: ['1', '2', '3'],
        expiryTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: '1'
      },
      {
        id: '2',
        name: 'Business Team',
        totalQuota: 500 * 1024 * 1024 * 1024,
        usedQuota: 120 * 1024 * 1024 * 1024,
        userIds: ['4', '5', '6', '7'],
        expiryTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: '1'
      }
    ];

    setTimeout(() => {
      setPools(mockPools);
      setLoading(false);
    }, 1000);
  }, []);

  return { pools, loading, setPools };
};

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    mtu: 1500,
    dnsOverride: ['8.8.8.8', '1.1.1.1'],
    tcpFastOpen: true,
    firewallPorts: [80, 443, 8080, 8443],
    statsApiEnabled: true,
    loggingEnabled: true,
    autoCleanup: {
      enabled: true,
      expiredUsersAfterDays: 7,
      inactiveInboundsAfterDays: 30
    },
    autoRestart: {
      enabled: true,
      cpuThreshold: 80,
      memoryThreshold: 85
    }
  });

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return { settings, updateSettings };
};

export const useBackups = () => {
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockBackups: BackupSnapshot[] = [
      {
        id: '1',
        name: 'Auto Backup - Daily',
        createdAt: new Date().toISOString(),
        size: 15.6 * 1024 * 1024,
        includes: { users: true, inbounds: true, templates: true, settings: true }
      },
      {
        id: '2',
        name: 'Manual Backup - Before Update',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        size: 12.3 * 1024 * 1024,
        includes: { users: true, inbounds: true, templates: false, settings: true }
      }
    ];

    setTimeout(() => {
      setBackups(mockBackups);
      setLoading(false);
    }, 1000);
  }, []);

  const createBackup = (name: string, includes: any) => {
    const backup: BackupSnapshot = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      size: Math.random() * 20 * 1024 * 1024,
      includes
    };
    setBackups(prev => [backup, ...prev]);
  };

  return { backups, loading, createBackup };
};

export const useBulkOperations = () => {
  const [operations, setOperations] = useState<BulkOperation[]>([]);

  const createBulkOperation = (type: BulkOperation['type'], userIds: string[], parameters: any) => {
    const operation: BulkOperation = {
      id: Date.now().toString(),
      type,
      userIds,
      parameters,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setOperations(prev => [operation, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'processing' as const }
            : op
        )
      );

      setTimeout(() => {
        setOperations(prev => 
          prev.map(op => 
            op.id === operation.id 
              ? { 
                  ...op, 
                  status: 'completed' as const, 
                  completedAt: new Date().toISOString(),
                  results: { processed: userIds.length, successful: userIds.length, failed: 0 }
                }
              : op
          )
        );
      }, 3000);
    }, 1000);

    return operation.id;
  };

  return { operations, createBulkOperation };
};

export const useInboundTemplates = () => {
  const [templates, setTemplates] = useState<InboundTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockTemplates: InboundTemplate[] = [
      {
        id: '1',
        name: 'VMess + TLS',
        protocol: 'vmess',
        port: 443,
        tlsSettings: { enabled: true },
        streamSettings: { network: 'ws', path: '/ws' },
        isDefault: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'VLESS + Reality',
        protocol: 'vless',
        port: 8443,
        realitySettings: { enabled: true },
        streamSettings: { network: 'tcp' },
        isDefault: false,
        createdAt: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
    }, 1000);
  }, []);

  return { templates, loading, setTemplates };
};
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'regular_admin';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
}

export interface Panel {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline';
  cpuUsage: number;
  ramUsage: number;
  totalUsers: number;
  activeUsers: number;
  trafficGB: number;
  createdAt: string;
}

export interface Client {
  id: string;
  username: string;
  email: string;
  enable: boolean;
  expiryTime: number;
  totalGB: number;
  up: number;
  down: number;
  ipLock?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  subId: string;
  tgId: string;
  reset: number;
  lastConnection?: string;
  connectionCount?: number;
  subscriptionType?: string;
  dailyTraffic?: TrafficData[];
  weeklyTraffic?: TrafficData[];
  monthlyTraffic?: TrafficData[];
}

export interface TrafficData {
  date: string;
  upload: number;
  download: number;
  total: number;
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
  template?: InboundTemplate;
}

export interface InboundTemplate {
  id: string;
  name: string;
  protocol: string;
  port: number;
  tlsSettings?: any;
  realitySettings?: any;
  streamSettings: any;
  isDefault: boolean;
  createdAt: string;
}

export interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  diskIO: number;
  uptime: string;
  version: string;
  xrayVersion: string;
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  onlineConnections: number;
  bandwidth: {
    upload: number;
    download: number;
    total: number;
  };
  realTimeConnections: ConnectionData[];
}

export interface ConnectionData {
  timestamp: string;
  activeConnections: number;
  bandwidth: number;
}

export interface Traffic {
  up: number;
  down: number;
  total: number;
}

export interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  adminUsername: string;
  targetId?: string;
  targetType?: 'user' | 'admin' | 'panel' | 'inbound' | 'system';
  details: string;
  ipAddress: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export interface UserConnectionLog {
  id: string;
  userId: string;
  username: string;
  ipAddress: string;
  connectTime: string;
  disconnectTime?: string;
  sessionDuration?: number;
  uploadBytes: number;
  downloadBytes: number;
  protocol: string;
  port: number;
}

export interface PanelFeature {
  id: string;
  panelId: string;
  name: string;
  type: 'template' | 'optimization' | 'restart' | 'subscription';
  status: 'active' | 'inactive';
  config: any;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'subscription' | 'config' | 'inbound';
  content: string;
  isDefault: boolean;
  createdAt: string;
  trafficLimit?: number;
  timeLimit?: number;
  protocols?: string[];
  mobileOptimized?: boolean;
  pcOptimized?: boolean;
}

export interface Notification {
  id: string;
  adminId: string;
  type: 'user_limit_change' | 'user_expiry_change' | 'system_update' | 'traffic_alert' | 'security_alert' | 'connection_alert';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
  severity: 'info' | 'warning' | 'error';
}

export interface SharedTrafficPool {
  id: string;
  name: string;
  totalQuota: number;
  usedQuota: number;
  userIds: string[];
  expiryTime: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface SystemSettings {
  mtu: number;
  dnsOverride: string[];
  tcpFastOpen: boolean;
  firewallPorts: number[];
  statsApiEnabled: boolean;
  loggingEnabled: boolean;
  autoCleanup: {
    enabled: boolean;
    expiredUsersAfterDays: number;
    inactiveInboundsAfterDays: number;
  };
  autoRestart: {
    enabled: boolean;
    cpuThreshold: number;
    memoryThreshold: number;
  };
}

export interface BackupSnapshot {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  includes: {
    users: boolean;
    inbounds: boolean;
    templates: boolean;
    settings: boolean;
  };
}

export interface BulkOperation {
  id: string;
  type: 'delete' | 'extend' | 'reset' | 'template_change' | 'export';
  userIds: string[];
  parameters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  results?: any;
}
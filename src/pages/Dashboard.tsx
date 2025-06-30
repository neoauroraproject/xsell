import React from 'react';
import { StatCard } from '../components/UI/StatCard';
import { Card } from '../components/UI/Card';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Modal } from '../components/UI/Modal';
import { Button } from '../components/UI/Button';
import { useSystemStats, useClients, useAdmins, usePanels } from '../hooks/useApi';
import { 
  Users, 
  Server, 
  Activity, 
  Shield,
  UserCheck,
  UserX,
  Wifi,
  TrendingUp,
  TrendingDown,
  Calendar,
  Database,
  Plus,
  Minus,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const { stats, loading: statsLoading } = useSystemStats();
  const { clients, loading: clientsLoading } = useClients();
  const { admins, loading: adminsLoading } = useAdmins();
  const { panels, loading: panelsLoading } = usePanels();
  const { isSuperAdmin, admin } = useAuth();
  const [showTrafficLogModal, setShowTrafficLogModal] = React.useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const activeClients = clients.filter(client => client.enable).length;
  const totalClients = clients.length;
  const expiredClients = clients.filter(client => client.expiryTime < Date.now()).length;
  const totalTraffic = clients.reduce((acc, client) => acc + client.up + client.down, 0);
  const activePanels = panels.filter(panel => panel.status === 'online').length;
  const totalAdmins = admins.length;

  // Mock admin data for regular admin dashboard
  const mockAdminData = {
    activePanel: 'Server-Ar1',
    trafficLeft: 450 * 1024 * 1024 * 1024, // 450GB
    daysLeft: 25,
    status: 'active'
  };

  // Mock admin traffic log for regular admins
  const mockAdminTrafficLog = [
    { date: '2024-01-01', action: 'Initial traffic allocation', amount: '1TB', by: 'System', type: 'traffic' },
    { date: '2024-01-15', action: '500GB added by superadmin', amount: '500GB', by: 'Super Admin', type: 'traffic' },
    { date: '2024-02-01', action: '1TB added by hmray', amount: '1TB', by: 'hmray', type: 'traffic' },
    { date: '2024-02-10', action: '100 Days added by hmray', amount: '100 Days', by: 'hmray', type: 'time' },
    { date: '2024-02-15', action: 'Traffic used for user creation', amount: '250GB', by: 'System', type: 'usage' },
    { date: '2024-02-20', action: 'Traffic used for user updates', amount: '150GB', by: 'System', type: 'usage' },
  ];

  // Generate traffic chart data
  const trafficChartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    upload: Math.random() * 1000,
    download: Math.random() * 2000,
    total: Math.random() * 3000
  }));

  if (statsLoading || clientsLoading || (isSuperAdmin && (adminsLoading || panelsLoading))) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isSuperAdmin ? 'X-UI SELL Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isSuperAdmin ? 'System overview and management' : 'Your user management dashboard'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {!isSuperAdmin && (
            <Button 
              onClick={() => setShowTrafficLogModal(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Traffic Log</span>
            </Button>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </motion.div>

      {/* Admin Status Card - Only for Regular Admins */}
      {!isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Server className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Active Panel: {mockAdminData.activePanel}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Admin: {admin?.username}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  mockAdminData.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    mockAdminData.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {mockAdminData.status}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Traffic Left</span>
                  <Database className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatBytes(mockAdminData.trafficLeft)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Available for new users
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Days Left</span>
                  <Calendar className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {mockAdminData.daysLeft}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Until panel expiry
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {isSuperAdmin && (
          <StatCard
            title="Total Admins"
            value={totalAdmins}
            icon={Shield}
            trend={{ value: 0, isPositive: true }}
            color="purple"
          />
        )}
        
        {isSuperAdmin && (
          <StatCard
            title="Active Panels"
            value={`${activePanels}/${panels.length}`}
            icon={Server}
            trend={{ value: 5, isPositive: true }}
            color="blue"
          />
        )}
        
        <StatCard
          title="Total Users"
          value={totalClients}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="green"
        />
        
        <StatCard
          title="Active Users"
          value={activeClients}
          icon={UserCheck}
          trend={{ value: 8, isPositive: true }}
          color="blue"
        />
        
        {!isSuperAdmin && (
          <StatCard
            title="Expired Users"
            value={expiredClients}
            icon={UserX}
            trend={{ value: -3, isPositive: false }}
            color="red"
          />
        )}
        
        <StatCard
          title="Total Traffic"
          value={formatBytes(totalTraffic)}
          icon={Activity}
          trend={{ value: 15, isPositive: true }}
          color="yellow"
        />
      </motion.div>

      {/* Charts and System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Overview Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Traffic Overview (24h)
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Upload</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Download</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficChartData}>
                <defs>
                  <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upload"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#uploadGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="download"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#downloadGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              System Information
            </h3>
            <div className="space-y-6">
              {/* System Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats?.cpu.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats?.memory.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Memory</div>
                </div>
              </div>

              {/* System Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.uptime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Panel Version</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.version}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Online Users</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {activeClients}
                  </span>
                </div>
                {isSuperAdmin && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Panels</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {activePanels}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Admin Traffic Log Modal - Only for Regular Admins */}
      <Modal isOpen={showTrafficLogModal} onClose={() => setShowTrafficLogModal(false)} title="Admin Traffic Management Log" size="lg">
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              Admin: {admin?.username}
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Complete history of all traffic and time modifications for this admin account
            </p>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockAdminTrafficLog.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    entry.type === 'traffic' ? 'bg-blue-100 dark:bg-blue-900' :
                    entry.type === 'time' ? 'bg-green-100 dark:bg-green-900' :
                    'bg-red-100 dark:bg-red-900'
                  }`}>
                    {entry.type === 'traffic' ? (
                      <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : entry.type === 'time' ? (
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.date} • by {entry.by}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  entry.type === 'usage' ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
                }`}>
                  {entry.type === 'usage' ? '-' : '+'}{entry.amount}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  2.5TB
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Added</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  400GB
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Used</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  2.1TB
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
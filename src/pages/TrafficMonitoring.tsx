import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Modal } from '../components/UI/Modal';
import { useClients } from '../hooks/useApi';
import { useTrafficMonitoring } from '../hooks/useAdvancedApi';
import { useAuth } from '../hooks/useAuth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, Download, Upload, Calendar, Edit, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrafficMonitoring: React.FC = () => {
  const { clients, loading: clientsLoading, setClients } = useClients();
  const { admin, isSuperAdmin } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    trafficLimit: '',
    expiryDays: ''
  });
  const { trafficData, loading: trafficLoading } = useTrafficMonitoring(selectedUser, selectedPeriod);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const sortedClients = [...clients].sort((a, b) => (b.up + b.down) - (a.up + a.down));

  const handleEditUser = (client: any) => {
    setSelectedClient(client);
    setEditForm({
      trafficLimit: (client.totalGB / (1024 * 1024 * 1024)).toString(),
      expiryDays: Math.ceil((client.expiryTime - Date.now()) / (1000 * 60 * 60 * 24)).toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    if (selectedClient) {
      const updatedClients = clients.map(client => 
        client.id === selectedClient.id 
          ? {
              ...client,
              totalGB: parseInt(editForm.trafficLimit) * 1024 * 1024 * 1024,
              expiryTime: Date.now() + (parseInt(editForm.expiryDays) * 24 * 60 * 60 * 1000)
            }
          : client
      );
      setClients(updatedClients);
      setShowEditModal(false);
    }
  };

  const handleShowLog = (client: any) => {
    setSelectedClient(client);
    setShowLogModal(true);
  };

  // Mock admin traffic log for regular admins
  const mockAdminTrafficLog = [
    { date: '2024-01-01', action: 'First time added', amount: '1TB', by: 'System', type: 'traffic' },
    { date: '2024-01-15', action: '500GB added by superadmin', amount: '500GB', by: 'Super Admin', type: 'traffic' },
    { date: '2024-02-01', action: '1TB added by hmray', amount: '1TB', by: 'hmray', type: 'traffic' },
    { date: '2024-02-10', action: '100 Days added by hmray', amount: '100 Days', by: 'hmray', type: 'time' },
    { date: '2024-02-15', action: '2TB traffic used for users', amount: '2TB', by: 'System', type: 'usage' },
  ];

  if (clientsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Traffic Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isSuperAdmin ? 'Advanced traffic analysis and monitoring' : 'Monitor and manage user traffic'}
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Users</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.username}</option>
            ))}
          </select>
          {!isSuperAdmin && (
            <Button 
              onClick={() => setShowLogModal(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Admin Traffic Log</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Traffic Overview Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Traffic Overview ({selectedPeriod})
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
          {trafficLoading ? (
            <LoadingSpinner />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trafficData}>
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
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number) => [formatBytes(value), '']}
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
          )}
        </Card>
      </motion.div>

      {/* Top Users by Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Users by Traffic Usage
          </h3>
          <div className="space-y-4">
            {sortedClients.slice(0, 10).map((client, index) => {
              const totalUsage = client.up + client.down;
              const usagePercentage = (totalUsage / client.totalGB) * 100;
              
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{client.username}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-sm">
                        <Upload className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-900 dark:text-white">{formatBytes(client.up)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Download className="h-4 w-4 text-green-500" />
                        <span className="text-gray-900 dark:text-white">{formatBytes(client.down)}</span>
                      </div>
                    </div>
                    
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Usage</span>
                        <span className={`font-medium ${getUsageColor(usagePercentage)}`}>
                          {usagePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressBarColor(usagePercentage)}`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatBytes(totalUsage)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        of {formatBytes(client.totalGB)}
                      </div>
                    </div>

                    {/* Edit Button for Admins */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(client)}
                      className="px-3"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User Account">
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              User: {selectedClient?.username}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Update traffic limit and expiry date for this user
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Traffic Limit (GB)
            </label>
            <input
              type="number"
              value={editForm.trafficLimit}
              onChange={(e) => setEditForm({...editForm, trafficLimit: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter traffic limit in GB"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Days Until Expiry
            </label>
            <input
              type="number"
              value={editForm.expiryDays}
              onChange={(e) => setEditForm({...editForm, expiryDays: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter days until expiry"
              min="1"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser} 
              disabled={!editForm.trafficLimit || !editForm.expiryDays}
            >
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin Traffic Log Modal - Only for Regular Admins */}
      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Admin Traffic Management Log">
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              Admin: {admin?.username}
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              All traffic and time modifications for this admin account
            </p>
          </div>
          
          <div className="space-y-3">
            {mockAdminTrafficLog.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    entry.type === 'traffic' ? 'bg-blue-100 dark:bg-blue-900' :
                    entry.type === 'time' ? 'bg-green-100 dark:bg-green-900' :
                    'bg-red-100 dark:bg-red-900'
                  }`}>
                    {entry.type === 'traffic' ? (
                      <TrendingUp className={`h-4 w-4 ${
                        entry.type === 'traffic' ? 'text-blue-600 dark:text-blue-400' : ''
                      }`} />
                    ) : entry.type === 'time' ? (
                      <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
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
        </div>
      </Modal>
    </div>
  );
};
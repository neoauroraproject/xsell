import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Modal } from '../components/UI/Modal';
import { usePanels } from '../hooks/useApi';
import { Plus, Edit, Trash2, Server, Activity, Users, HardDrive, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Panels: React.FC = () => {
  const { panels, loading, addPanel, updatePanel, deletePanel, testConnection } = usePanels();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [newPanel, setNewPanel] = useState({
    name: '',
    url: '',
    subUrl: '',
    username: '',
    password: '',
    enableVpsAccess: false,
    vpsUsername: '',
    vpsPassword: ''
  });

  const handleTestConnection = async () => {
    if (!newPanel.url || !newPanel.username || !newPanel.password) {
      alert('Please fill in URL, username, and password first');
      return;
    }

    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const result = await testConnection(newPanel.url, newPanel.username, newPanel.password);
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleAddPanel = async () => {
    try {
      const panelData = {
        name: newPanel.name,
        url: newPanel.url,
        subUrl: newPanel.subUrl,
        username: newPanel.username,
        password: newPanel.password,
        vpsUsername: newPanel.enableVpsAccess ? newPanel.vpsUsername : null,
        vpsPassword: newPanel.enableVpsAccess ? newPanel.vpsPassword : null
      };

      await addPanel(panelData);
      setShowAddModal(false);
      setNewPanel({
        name: '',
        url: '',
        subUrl: '',
        username: '',
        password: '',
        enableVpsAccess: false,
        vpsUsername: '',
        vpsPassword: ''
      });
      setConnectionResult(null);
    } catch (error) {
      console.error('Failed to add panel:', error);
      alert('Failed to add panel. Please try again.');
    }
  };

  const handleEditPanel = (panel: any) => {
    setSelectedPanel(panel);
    setShowEditModal(true);
  };

  const handleDeletePanel = async (panelId: string) => {
    if (confirm('Are you sure you want to delete this panel?')) {
      try {
        await deletePanel(panelId);
      } catch (error) {
        console.error('Failed to delete panel:', error);
        alert('Failed to delete panel. Please try again.');
      }
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panels Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor all X-UI panels</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" />
          <span>Add Panel</span>
        </Button>
      </motion.div>

      {/* Panels Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {panels.map((panel, index) => (
          <motion.div
            key={panel.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Server className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {panel.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-48">
                      {panel.url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {panel.status === 'online' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    panel.status === 'online' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {panel.status}
                  </span>
                </div>
              </div>

              {/* System Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    CPU Usage
                  </div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {panel.cpuUsage?.toFixed(1) || '0.0'}%
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <HardDrive className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    RAM Usage
                  </div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {panel.ramUsage?.toFixed(1) || '0.0'}%
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {panel.totalUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {panel.activeUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Traffic (GB)</span>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {panel.trafficGB || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPanel(panel)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeletePanel(panel.id)}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Panel Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New X-UI Panel" size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Panel Name
              </label>
              <input
                type="text"
                value={newPanel.name}
                onChange={(e) => setNewPanel({...newPanel, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Server-01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Panel URL
              </label>
              <input
                type="url"
                value={newPanel.url}
                onChange={(e) => setNewPanel({...newPanel, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="http://85.237.211.232:2053/UHAxUEujzMD8UUL/"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subscription Page URL (Optional)
            </label>
            <input
              type="url"
              value={newPanel.subUrl}
              onChange={(e) => setNewPanel({...newPanel, subUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="http://85.237.211.232:2053/sub"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Panel Username
              </label>
              <input
                type="text"
                value={newPanel.username}
                onChange={(e) => setNewPanel({...newPanel, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="hmray"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Panel Password
              </label>
              <input
                type="password"
                value={newPanel.password}
                onChange={(e) => setNewPanel({...newPanel, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Connection Test */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Test Connection</h4>
              <Button
                onClick={handleTestConnection}
                disabled={testingConnection || !newPanel.url || !newPanel.username || !newPanel.password}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {testingConnection ? (
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
              </Button>
            </div>

            {connectionResult && (
              <div className={`p-4 rounded-lg ${
                connectionResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {connectionResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`font-medium ${
                    connectionResult.success 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {connectionResult.success ? 'Connection Successful!' : 'Connection Failed'}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  connectionResult.success 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {connectionResult.message}
                </p>
                {connectionResult.success && connectionResult.data && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Found {connectionResult.data.inbounds} inbound(s) on the panel
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="enableVpsAccess"
                checked={newPanel.enableVpsAccess}
                onChange={(e) => setNewPanel({...newPanel, enableVpsAccess: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="enableVpsAccess" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable VPS Access for Advanced Features
              </label>
            </div>

            {newPanel.enableVpsAccess && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    VPS Username
                  </label>
                  <input
                    type="text"
                    value={newPanel.vpsUsername}
                    onChange={(e) => setNewPanel({...newPanel, vpsUsername: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="root"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    VPS Password
                  </label>
                  <input
                    type="password"
                    value={newPanel.vpsPassword}
                    onChange={(e) => setNewPanel({...newPanel, vpsPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddPanel} 
              disabled={!newPanel.name || !newPanel.url || !newPanel.username || !newPanel.password || !connectionResult?.success}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Panel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
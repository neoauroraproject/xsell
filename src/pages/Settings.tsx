import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Download,
  Upload,
  Database,
  Globe,
  Clock,
  Users,
  Server
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    panelTitle: 'WalPanel Pro',
    sessionTimeout: 30,
    defaultExpiry: 30,
    maxClients: 100,
    enableRegistration: false,
    backupInterval: 24,
    enableAuditLog: true,
    superAdminInboundId: '1'
  });

  const [activeTab, setActiveTab] = useState('general');
  const [panels] = useState([
    { id: '1', name: 'Server-Ar1', status: 'online' },
    { id: '2', name: 'SERVER-X', status: 'online' }
  ]);

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState('');

  const handleSave = () => {
    console.log('Saving settings:', settings);
  };

  const handleBackupPanel = (panelId: string) => {
    setSelectedPanel(panelId);
    setShowBackupModal(true);
  };

  const handleRestorePanel = (panelId: string) => {
    console.log('Restoring backup for panel:', panelId);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'database', name: 'Database', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure your panel settings</p>
        </div>
        <Button onClick={handleSave} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700">
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-1">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Panel Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Panel Title
                  </label>
                  <input
                    type="text"
                    value={settings.panelTitle}
                    onChange={(e) => setSettings({...settings, panelTitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Client Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultExpiry}
                    onChange={(e) => setSettings({...settings, defaultExpiry: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Super Admin Inbound ID
                  </label>
                  <input
                    type="text"
                    value={settings.superAdminInboundId}
                    onChange={(e) => setSettings({...settings, superAdminInboundId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter inbound ID for super admin"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Client Limits
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Clients
                  </label>
                  <input
                    type="number"
                    value={settings.maxClients}
                    onChange={(e) => setSettings({...settings, maxClients: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableRegistration"
                    checked={settings.enableRegistration}
                    onChange={(e) => setSettings({...settings, enableRegistration: e.target.checked})}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableRegistration" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable Client Registration
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableAuditLog"
                    checked={settings.enableAuditLog}
                    onChange={(e) => setSettings({...settings, enableAuditLog: e.target.checked})}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableAuditLog" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable Audit Logging
                  </label>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Backup Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto Backup Interval (hours)
                  </label>
                  <input
                    type="number"
                    value={settings.backupInterval}
                    onChange={(e) => setSettings({...settings, backupInterval: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Panel Backup & Restore
              </h3>
              <div className="space-y-4">
                {panels.map((panel) => (
                  <div key={panel.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{panel.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Status: <span className="text-green-600 dark:text-green-400">{panel.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleBackupPanel(panel.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Backup</span>
                      </Button>
                      <Button
                        onClick={() => handleRestorePanel(panel.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Restore</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Backup Modal */}
      <Modal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} title="Create Panel Backup">
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Panel: {panels.find(p => p.id === selectedPanel)?.name}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Create a complete backup of this panel's configuration and data
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backup Name
            </label>
            <input
              type="text"
              placeholder="Enter backup name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Include in Backup:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">User accounts and configurations</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Inbound configurations</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Panel settings</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Traffic statistics</span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowBackupModal(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Create Backup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
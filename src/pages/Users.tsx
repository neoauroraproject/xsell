import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Modal } from '../components/UI/Modal';
import { useClients, usePanels, useInbounds } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Plus, Copy, Edit, RefreshCw, Trash2, Users as UsersIcon, QrCode, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const Users: React.FC = () => {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { panels } = usePanels();
  const { user, isSuperAdmin } = useAuth();
  const { setNotifications } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrafficHistoryModal, setShowTrafficHistoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedPanel, setSelectedPanel] = useState('');
  const [selectedInbound, setSelectedInbound] = useState('');
  const [newClient, setNewClient] = useState({
    email: '',
    totalGB: '',
    expiryDays: '',
    enable: true
  });
  const [editClient, setEditClient] = useState({
    email: '',
    totalGB: '',
    expiryDays: '',
    enable: true
  });

  const { inbounds } = useInbounds(selectedPanel);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toISOString().split('T')[0];
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Statuses' || 
                         (statusFilter === 'active' && client.enable) ||
                         (statusFilter === 'inactive' && !client.enable) ||
                         (statusFilter === 'expired' && client.expiryTime < Date.now());
    
    const matchesOwner = isSuperAdmin || client.createdBy === user?.id;
    
    return matchesSearch && matchesStatus && matchesOwner;
  });

  const handleAddClient = async () => {
    if (!selectedPanel || !selectedInbound) {
      alert('Please select a panel and inbound');
      return;
    }

    try {
      const clientData = {
        panelId: selectedPanel,
        inboundId: selectedInbound,
        email: newClient.email,
        totalGB: parseInt(newClient.totalGB),
        expiryDays: parseInt(newClient.expiryDays),
        enable: newClient.enable
      };

      await addClient(clientData);
      setShowAddModal(false);
      setNewClient({
        email: '',
        totalGB: '',
        expiryDays: '',
        enable: true
      });
      setSelectedPanel('');
      setSelectedInbound('');
    } catch (error) {
      console.error('Failed to add client:', error);
      alert('Failed to add client. Please try again.');
    }
  };

  const handleEditClientModal = (client: any) => {
    setSelectedClient(client);
    setEditClient({
      email: client.email,
      totalGB: (client.totalGB / (1024 * 1024 * 1024)).toString(),
      expiryDays: Math.ceil((client.expiryTime - Date.now()) / (1000 * 60 * 60 * 24)).toString(),
      enable: client.enable
    });
    setShowEditModal(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    try {
      const clientData = {
        email: editClient.email,
        totalGB: parseInt(editClient.totalGB) * 1024 * 1024 * 1024,
        expiryTime: Date.now() + (parseInt(editClient.expiryDays) * 24 * 60 * 60 * 1000),
        enable: editClient.enable
      };

      await updateClient(selectedClient.uuid, clientData);
      setShowEditModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client. Please try again.');
    }
  };

  const handleDeleteClient = async (client: any) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(client.uuid, client.panelId, client.inboundId);
      } catch (error) {
        console.error('Failed to delete client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  const handleToggleClient = async (client: any) => {
    try {
      await updateClient(client.uuid, {
        panelId: client.panelId,
        inboundId: client.inboundId,
        enable: !client.enable
      });
    } catch (error) {
      console.error('Failed to toggle client:', error);
      alert('Failed to update client. Please try again.');
    }
  };

  const handleShowQR = (client: any) => {
    setSelectedClient(client);
    setShowQRModal(true);
  };

  const handleShowTrafficHistory = (client: any) => {
    setSelectedClient(client);
    setShowTrafficHistoryModal(true);
  };

  const getStatusColor = (client: any) => {
    if (client.expiryTime < Date.now()) return 'text-red-600 dark:text-red-400';
    return client.enable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getStatusText = (client: any) => {
    if (client.expiryTime < Date.now()) return 'expired';
    return client.enable ? 'active' : 'inactive';
  };

  const getUsagePercentage = (client: any) => {
    return Math.min(((client.up + client.down) / client.totalGB) * 100, 100);
  };

  const getDotColor = (client: any) => {
    if (client.expiryTime < Date.now()) return 'bg-red-500';
    return client.enable ? 'bg-green-500' : 'bg-red-500';
  };

  // Mock traffic history for regular admins
  const mockTrafficHistory = [
    { date: '2024-01-01', action: 'First time added', amount: '20GB', by: 'System' },
    { date: '2024-01-15', action: '500GB added by superadmin', amount: '500GB', by: 'Super Admin' },
    { date: '2024-02-01', action: '1TB added by hmray', amount: '1TB', by: 'hmray' },
    { date: '2024-02-10', action: '100 Days added by hmray', amount: '100 Days', by: 'hmray' },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">{filteredClients.length} users found</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option>All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    DATA USAGE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    TOTAL DATA
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    EXPIRY DATE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${getDotColor(client)}`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white mb-1">
                          {formatBytes(client.up + client.down)} / {formatBytes(client.totalGB)}
                        </div>
                        <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${getUsagePercentage(client)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {formatBytes(client.totalGB)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {formatDate(client.expiryTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center ${getStatusColor(client)}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${getDotColor(client)}`}></div>
                        {getStatusText(client)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleShowQR(client)}
                          className="p-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Show QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Config"
                        >
                          <Copy className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditClientModal(client)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleClient(client)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title={client.enable ? "Disable User" : "Enable User"}
                        >
                          {client.enable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </motion.button>
                        {!isSuperAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleShowTrafficHistory(client)}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Traffic History"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClient(client)}
                          className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Add Client Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Panel
              </label>
              <select
                value={selectedPanel}
                onChange={(e) => {
                  setSelectedPanel(e.target.value);
                  setSelectedInbound(''); // Reset inbound when panel changes
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select a panel...</option>
                {panels.map(panel => (
                  <option key={panel.id} value={panel.id}>{panel.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Inbound
              </label>
              <select
                value={selectedInbound}
                onChange={(e) => setSelectedInbound(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={!selectedPanel}
                required
              >
                <option value="">Select an inbound...</option>
                {inbounds.map(inbound => (
                  <option key={inbound.id} value={inbound.id}>
                    {inbound.tag} ({inbound.protocol}:{inbound.port})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email/Username
            </label>
            <input
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({...newClient, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter email"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Limit (GB)
              </label>
              <input
                type="number"
                value={newClient.totalGB}
                onChange={(e) => setNewClient({...newClient, totalGB: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter data limit"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Days
              </label>
              <input
                type="number"
                value={newClient.expiryDays}
                onChange={(e) => setNewClient({...newClient, expiryDays: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter expiry days"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableUser"
              checked={newClient.enable}
              onChange={(e) => setNewClient({...newClient, enable: e.target.checked})}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="enableUser" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable user immediately
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddClient} 
              disabled={!selectedPanel || !selectedInbound || !newClient.email || !newClient.totalGB || !newClient.expiryDays}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email/Username
            </label>
            <input
              type="email"
              value={editClient.email}
              onChange={(e) => setEditClient({...editClient, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter email"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Limit (GB)
              </label>
              <input
                type="number"
                value={editClient.totalGB}
                onChange={(e) => setEditClient({...editClient, totalGB: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter data limit"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Days
              </label>
              <input
                type="number"
                value={editClient.expiryDays}
                onChange={(e) => setEditClient({...editClient, expiryDays: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter expiry days"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="editEnableUser"
              checked={editClient.enable}
              onChange={(e) => setEditClient({...editClient, enable: e.target.checked})}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="editEnableUser" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              User is enabled
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateClient} 
              disabled={!editClient.email || !editClient.totalGB || !editClient.expiryDays}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="QR Code Configuration">
        <div className="text-center space-y-4">
          <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">
              <QrCode className="h-16 w-16 mx-auto mb-2" />
              <p>QR Code for {selectedClient?.username}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configuration: {selectedClient?.username}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Subscription URL: {selectedClient?.subId}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1">
              Copy Config
            </Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
              Download QR
            </Button>
          </div>
        </div>
      </Modal>

      {/* Traffic History Modal - Only for Regular Admins */}
      <Modal isOpen={showTrafficHistoryModal} onClose={() => setShowTrafficHistoryModal(false)} title="Traffic Management History">
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              User: {selectedClient?.username}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              All traffic and time modifications for this user
            </p>
          </div>
          
          <div className="space-y-3">
            {mockTrafficHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.date} • by {entry.by}
                  </p>
                </div>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {entry.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { useClients } from '../hooks/useApi';
import { useBulkOperations } from '../hooks/useAdvancedApi';
import { useAuth } from '../hooks/useAuth';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Calendar, 
  RefreshCw, 
  CheckSquare, 
  Square,
  Users,
  FileDown,
  Clock,
  Database,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AdvancedUsers: React.FC = () => {
  const { clients, loading, setClients } = useClients();
  const { createBulkOperation } = useBulkOperations();
  const { admin, isSuperAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    subscriptionType: 'all',
    usageThreshold: 'all',
    expiryRange: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkOperation, setBulkOperation] = useState({
    type: 'delete' as 'delete' | 'extend' | 'reset' | 'template_change' | 'export' | 'add_traffic',
    parameters: {}
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.ipLock?.includes(searchTerm);
    
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && client.enable) ||
                         (filters.status === 'inactive' && !client.enable) ||
                         (filters.status === 'expired' && client.expiryTime < Date.now());
    
    const usagePercentage = ((client.up + client.down) / client.totalGB) * 100;
    const matchesUsage = filters.usageThreshold === 'all' ||
                        (filters.usageThreshold === 'high' && usagePercentage > 80) ||
                        (filters.usageThreshold === 'medium' && usagePercentage > 50 && usagePercentage <= 80) ||
                        (filters.usageThreshold === 'low' && usagePercentage <= 50);
    
    const daysUntilExpiry = (client.expiryTime - Date.now()) / (1000 * 60 * 60 * 24);
    const matchesExpiry = filters.expiryRange === 'all' ||
                         (filters.expiryRange === 'soon' && daysUntilExpiry <= 7 && daysUntilExpiry > 0) ||
                         (filters.expiryRange === 'week' && daysUntilExpiry <= 30 && daysUntilExpiry > 7) ||
                         (filters.expiryRange === 'month' && daysUntilExpiry > 30);
    
    const matchesOwner = isSuperAdmin || client.createdBy === admin?.id;
    
    return matchesSearch && matchesStatus && matchesUsage && matchesExpiry && matchesOwner;
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredClients.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredClients.map(client => client.id));
    }
  };

  const handleBulkOperation = () => {
    if (selectedUsers.length === 0) return;
    
    createBulkOperation(bulkOperation.type, selectedUsers, bulkOperation.parameters);
    setShowBulkModal(false);
    setSelectedUsers([]);
    setBulkOperation({ type: 'delete', parameters: {} });
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedUsers.length > 0 ? `${selectedUsers.length} users selected` : `${filteredClients.length} users found`}
            </p>
          </div>
        </div>
        {selectedUsers.length > 0 && (
          <Button 
            onClick={() => setShowBulkModal(true)}
            className="flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>Bulk Actions</span>
          </Button>
        )}
      </motion.div>

      {/* Advanced Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email, username, or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            
            <select 
              value={filters.usageThreshold}
              onChange={(e) => setFilters({...filters, usageThreshold: e.target.value})}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Usage</option>
              <option value="high">High (&gt;80%)</option>
              <option value="medium">Medium (50-80%)</option>
              <option value="low">Low (&lt;50%)</option>
            </select>
            
            <select 
              value={filters.expiryRange}
              onChange={(e) => setFilters({...filters, expiryRange: e.target.value})}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Expiry</option>
              <option value="soon">Expires Soon (7 days)</option>
              <option value="week">This Month</option>
              <option value="month">Later</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {selectedUsers.length === filteredClients.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Select All ({filteredClients.length})</span>
              </button>
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                  <span>{selectedUsers.length} selected</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredClients.length && filteredClients.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usage & Limits
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Connection Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status & Expiry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map((client, index) => {
                  const usagePercentage = ((client.up + client.down) / client.totalGB) * 100;
                  const daysUntilExpiry = Math.ceil((client.expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedUsers.includes(client.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(client.id)}
                          onChange={() => handleSelectUser(client.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.email}
                          </div>
                          {client.ipLock && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              IP: {client.ipLock}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatBytes(client.up + client.down)} / {formatBytes(client.totalGB)}
                          </div>
                          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                usagePercentage > 90 ? 'bg-red-500' :
                                usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {usagePercentage.toFixed(1)}% used
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">
                            ↑ {formatBytes(client.up)}
                          </div>
                          <div className="text-gray-900 dark:text-white">
                            ↓ {formatBytes(client.down)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {new Date(client.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.expiryTime < Date.now() 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : client.enable 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {client.expiryTime < Date.now() ? 'Expired' : client.enable ? 'Active' : 'Inactive'}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : `Expired ${Math.abs(daysUntilExpiry)} days ago`}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Expires: {new Date(client.expiryTime).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="px-2">
                            <FileDown className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="px-2">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="px-2">
                            <Calendar className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Bulk Operations Modal */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Operations" size="lg">
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You have selected <strong>{selectedUsers.length}</strong> users for bulk operation.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Operation
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'delete', label: 'Delete Users', icon: Trash2, color: 'red' },
                { value: 'extend', label: 'Extend Expiry', icon: Calendar, color: 'green' },
                { value: 'reset', label: 'Reset Traffic', icon: RefreshCw, color: 'blue' },
                { value: 'add_traffic', label: 'Add Traffic', icon: Plus, color: 'purple' },
                { value: 'export', label: 'Export Configs', icon: Download, color: 'indigo' }
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setBulkOperation({...bulkOperation, type: op.value as any})}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    bulkOperation.type === op.value
                      ? `border-${op.color}-500 bg-${op.color}-50 dark:bg-${op.color}-900/20`
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <op.icon className={`h-5 w-5 ${
                      bulkOperation.type === op.value ? `text-${op.color}-600` : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      bulkOperation.type === op.value ? `text-${op.color}-900 dark:text-${op.color}-100` : 'text-gray-900 dark:text-white'
                    }`}>
                      {op.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {bulkOperation.type === 'extend' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Extend by (days)
              </label>
              <input
                type="number"
                min="1"
                value={bulkOperation.parameters.days || ''}
                onChange={(e) => setBulkOperation({
                  ...bulkOperation, 
                  parameters: { ...bulkOperation.parameters, days: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter number of days"
              />
            </div>
          )}

          {bulkOperation.type === 'add_traffic' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Traffic (GB)
              </label>
              <input
                type="number"
                min="1"
                value={bulkOperation.parameters.traffic || ''}
                onChange={(e) => setBulkOperation({
                  ...bulkOperation, 
                  parameters: { ...bulkOperation.parameters, traffic: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter traffic amount in GB"
              />
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkOperation}
              disabled={
                (bulkOperation.type === 'extend' && !bulkOperation.parameters.days) ||
                (bulkOperation.type === 'add_traffic' && !bulkOperation.parameters.traffic)
              }
            >
              Execute Operation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
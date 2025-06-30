import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Modal } from '../components/UI/Modal';
import { useAdmins } from '../hooks/useApi';
import { Plus, Edit, Trash2, Shield, UserCog, Eye, EyeOff, TrendingUp, Calendar, Database, Users, Server, X } from 'lucide-react';
import { motion } from 'framer-motion';

export const Admins: React.FC = () => {
  const { admins, loading, setAdmins } = useAdmins();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'regular_admin' as 'super_admin' | 'regular_admin',
    trafficLimit: '',
    timeLimit: '',
    selectedPanels: [] as string[]
  });
  const [editAdmin, setEditAdmin] = useState({
    username: '',
    email: '',
    role: 'regular_admin' as 'super_admin' | 'regular_admin',
    trafficLimit: '',
    timeLimit: '',
    selectedPanels: [] as string[]
  });

  // Mock panels available for assignment
  const mockPanels = [
    { id: '1', name: 'Server-Ar1', url: 'https://panel1.example.com' },
    { id: '2', name: 'SERVER-X', url: 'https://panel2.example.com' },
    { id: '3', name: 'Server-EU', url: 'https://panel3.example.com' }
  ];

  const [panelInbounds, setPanelInbounds] = useState<{[key: string]: string}>({});
  const [editPanelInbounds, setEditPanelInbounds] = useState<{[key: string]: string}>({});

  const handleAddAdmin = () => {
    // Create panel assignments with inbound IDs
    const panelAssignments = newAdmin.selectedPanels.map(panelId => ({
      panelId,
      inboundId: panelInbounds[panelId] || '1'
    }));

    const admin = {
      id: Date.now().toString(),
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      createdBy: '1', // Current super admin
      trafficLimit: parseInt(newAdmin.trafficLimit) * 1024 * 1024 * 1024, // Convert GB to bytes
      trafficUsed: Math.random() * 50 * 1024 * 1024 * 1024, // Random used traffic
      timeLimit: parseInt(newAdmin.timeLimit), // Days
      timeUsed: Math.floor(Math.random() * 30), // Random used days
      totalUsers: Math.floor(Math.random() * 50) + 10,
      activeUsers: Math.floor(Math.random() * 40) + 5,
      panelAssignments
    };
    
    setAdmins([...admins, admin]);
    setShowAddModal(false);
    setNewAdmin({
      username: '',
      email: '',
      password: '',
      role: 'regular_admin',
      trafficLimit: '',
      timeLimit: '',
      selectedPanels: []
    });
    setPanelInbounds({});
  };

  const handleEditAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setEditAdmin({
      username: admin.username,
      email: admin.email,
      role: admin.role,
      trafficLimit: admin.trafficLimit ? (admin.trafficLimit / (1024 * 1024 * 1024)).toString() : '',
      timeLimit: admin.timeLimit ? admin.timeLimit.toString() : '',
      selectedPanels: admin.panelAssignments ? admin.panelAssignments.map((p: any) => p.panelId) : []
    });
    
    // Set existing inbound IDs
    const existingInbounds: {[key: string]: string} = {};
    if (admin.panelAssignments) {
      admin.panelAssignments.forEach((assignment: any) => {
        existingInbounds[assignment.panelId] = assignment.inboundId;
      });
    }
    setEditPanelInbounds(existingInbounds);
    setShowEditModal(true);
  };

  const handleUpdateAdmin = () => {
    if (selectedAdmin) {
      const panelAssignments = editAdmin.selectedPanels.map(panelId => ({
        panelId,
        inboundId: editPanelInbounds[panelId] || '1'
      }));

      const updatedAdmins = admins.map(admin => 
        admin.id === selectedAdmin.id 
          ? {
              ...admin,
              username: editAdmin.username,
              email: editAdmin.email,
              role: editAdmin.role,
              trafficLimit: parseInt(editAdmin.trafficLimit) * 1024 * 1024 * 1024,
              timeLimit: parseInt(editAdmin.timeLimit),
              panelAssignments
            }
          : admin
      );
      setAdmins(updatedAdmins);
      setShowEditModal(false);
    }
  };

  const handleShowTrafficManagement = (admin: any) => {
    setSelectedAdmin(admin);
    setShowTrafficModal(true);
  };

  const handleToggleStatus = (adminId: string) => {
    setAdmins(admins.map(admin => 
      admin.id === adminId 
        ? { ...admin, status: admin.status === 'active' ? 'inactive' : 'active' }
        : admin
    ));
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      setAdmins(admins.filter(admin => admin.id !== adminId));
    }
  };

  const handlePanelSelection = (panelId: string, isEdit = false) => {
    if (isEdit) {
      setEditAdmin(prev => ({
        ...prev,
        selectedPanels: prev.selectedPanels.includes(panelId)
          ? prev.selectedPanels.filter(id => id !== panelId)
          : [...prev.selectedPanels, panelId]
      }));
    } else {
      setNewAdmin(prev => ({
        ...prev,
        selectedPanels: prev.selectedPanels.includes(panelId)
          ? prev.selectedPanels.filter(id => id !== panelId)
          : [...prev.selectedPanels, panelId]
      }));
    }
  };

  const handleInboundChange = (panelId: string, inboundId: string, isEdit = false) => {
    if (isEdit) {
      setEditPanelInbounds(prev => ({
        ...prev,
        [panelId]: inboundId
      }));
    } else {
      setPanelInbounds(prev => ({
        ...prev,
        [panelId]: inboundId
      }));
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system administrators with traffic control</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" />
          <span>Add Admin</span>
        </Button>
      </motion.div>

      {/* Admins Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {admins.map((admin, index) => (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    admin.role === 'super_admin' 
                      ? 'bg-purple-100 dark:bg-purple-900' 
                      : 'bg-indigo-100 dark:bg-indigo-900'
                  }`}>
                    {admin.role === 'super_admin' ? (
                      <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <UserCog className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {admin.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  admin.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {admin.status}
                </span>
              </div>

              {/* Panel Assignments for Regular Admins */}
              {admin.role === 'regular_admin' && admin.panelAssignments && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Panels</h4>
                  <div className="space-y-2">
                    {admin.panelAssignments.map((assignment: any, idx: number) => {
                      const panel = mockPanels.find(p => p.id === assignment.panelId);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="flex items-center space-x-2">
                            <Server className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-900 dark:text-white">{panel?.name}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Inbound: {assignment.inboundId}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* User Stats for Regular Admins */}
              {admin.role === 'regular_admin' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Total Users
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {admin.totalUsers || 0}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <UserCog className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Active Users
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {admin.activeUsers || 0}
                    </div>
                  </div>
                </div>
              )}

              {/* Traffic and Time Stats for Regular Admins */}
              {admin.role === 'regular_admin' && (
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Traffic Usage</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatBytes(admin.trafficUsed || 0)} / {formatBytes(admin.trafficLimit || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(((admin.trafficUsed || 0) / (admin.trafficLimit || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Time Usage</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {admin.timeUsed || 0} / {admin.timeLimit || 0} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${Math.min(((admin.timeUsed || 0) / (admin.timeLimit || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                  <span className={`text-sm font-medium ${
                    admin.role === 'super_admin' 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Regular Admin'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {admin.lastLogin && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(admin.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAdmin(admin)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                {admin.role === 'regular_admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowTrafficManagement(admin)}
                    className="px-3"
                    title="Traffic Management"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant={admin.status === 'active' ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => handleToggleStatus(admin.id)}
                  className="px-3"
                >
                  {admin.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                
                {admin.role !== 'super_admin' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Admin Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Admin" size="xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter email"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="regular_admin">Regular Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {newAdmin.role === 'regular_admin' && (
            <div className="border-t pt-4 space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Admin Configuration</h4>
              
              {/* Panel Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Assign Panels
                </label>
                <div className="space-y-3">
                  {mockPanels.map(panel => (
                    <div key={panel.id} className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`panel-${panel.id}`}
                          checked={newAdmin.selectedPanels.includes(panel.id)}
                          onChange={() => handlePanelSelection(panel.id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`panel-${panel.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                          <div className="font-medium">{panel.name}</div>
                          <div className="text-xs text-gray-500">{panel.url}</div>
                        </label>
                      </div>
                      
                      {newAdmin.selectedPanels.includes(panel.id) && (
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 dark:text-gray-400">Inbound ID:</label>
                          <input
                            type="text"
                            value={panelInbounds[panel.id] || ''}
                            onChange={(e) => handleInboundChange(panel.id, e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                            placeholder="1"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic and Time Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Traffic Limit (GB)
                  </label>
                  <input
                    type="number"
                    value={newAdmin.trafficLimit}
                    onChange={(e) => setNewAdmin({...newAdmin, trafficLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter traffic limit in GB"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Limit (Days)
                  </label>
                  <input
                    type="number"
                    value={newAdmin.timeLimit}
                    onChange={(e) => setNewAdmin({...newAdmin, timeLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter time limit in days"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddAdmin} 
              disabled={
                !newAdmin.username || 
                !newAdmin.email || 
                !newAdmin.password ||
                (newAdmin.role === 'regular_admin' && newAdmin.selectedPanels.length === 0)
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Admin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Admin" size="xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={editAdmin.username}
                onChange={(e) => setEditAdmin({...editAdmin, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={editAdmin.email}
                onChange={(e) => setEditAdmin({...editAdmin, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter email"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={editAdmin.role}
              onChange={(e) => setEditAdmin({...editAdmin, role: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="regular_admin">Regular Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {editAdmin.role === 'regular_admin' && (
            <div className="border-t pt-4 space-y-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Admin Configuration</h4>
              
              {/* Panel Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Assign Panels
                </label>
                <div className="space-y-3">
                  {mockPanels.map(panel => (
                    <div key={panel.id} className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`edit-panel-${panel.id}`}
                          checked={editAdmin.selectedPanels.includes(panel.id)}
                          onChange={() => handlePanelSelection(panel.id, true)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`edit-panel-${panel.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                          <div className="font-medium">{panel.name}</div>
                          <div className="text-xs text-gray-500">{panel.url}</div>
                        </label>
                      </div>
                      
                      {editAdmin.selectedPanels.includes(panel.id) && (
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 dark:text-gray-400">Inbound ID:</label>
                          <input
                            type="text"
                            value={editPanelInbounds[panel.id] || ''}
                            onChange={(e) => handleInboundChange(panel.id, e.target.value, true)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                            placeholder="1"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic and Time Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Traffic Limit (GB)
                  </label>
                  <input
                    type="number"
                    value={editAdmin.trafficLimit}
                    onChange={(e) => setEditAdmin({...editAdmin, trafficLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter traffic limit in GB"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Limit (Days)
                  </label>
                  <input
                    type="number"
                    value={editAdmin.timeLimit}
                    onChange={(e) => setEditAdmin({...editAdmin, timeLimit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter time limit in days"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAdmin} 
              disabled={
                !editAdmin.username || 
                !editAdmin.email ||
                (editAdmin.role === 'regular_admin' && editAdmin.selectedPanels.length === 0)
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              Update Admin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Traffic Management Modal */}
      <Modal isOpen={showTrafficModal} onClose={() => setShowTrafficModal(false)} title="Traffic & Time Management" size="lg">
        <div className="space-y-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              Admin: {selectedAdmin?.username}
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Manage traffic and time allocations for this admin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 dark:text-white">Traffic Management</h5>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Usage</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatBytes(selectedAdmin?.trafficUsed || 0)} / {formatBytes(selectedAdmin?.trafficLimit || 0)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min(((selectedAdmin?.trafficUsed || 0) / (selectedAdmin?.trafficLimit || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Add traffic (GB)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Add Traffic
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 dark:text-white">Time Management</h5>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Usage</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedAdmin?.timeUsed || 0} / {selectedAdmin?.timeLimit || 0} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${Math.min(((selectedAdmin?.timeUsed || 0) / (selectedAdmin?.timeLimit || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Add time (days)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Add Time
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Total Usage History</h5>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatBytes((selectedAdmin?.trafficUsed || 0) + 50 * 1024 * 1024 * 1024)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Traffic Used</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {(selectedAdmin?.timeUsed || 0) + 45} days
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Time Used</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedAdmin?.totalUsers || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Users Created</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
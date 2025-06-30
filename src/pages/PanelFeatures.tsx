import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { usePanels } from '../hooks/useApi';
import { 
  Settings, 
  Zap, 
  RefreshCw, 
  FileText, 
  Upload, 
  Download,
  Play,
  Pause,
  Trash2,
  Plus,
  Server,
  Cpu,
  Globe,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PanelFeatures: React.FC = () => {
  const { panels, loading } = usePanels();
  const [selectedPanel, setSelectedPanel] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [operationStates, setOperationStates] = useState<{[key: string]: 'idle' | 'processing' | 'success'}>({});
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Default Subscription', type: 'subscription', isActive: true },
    { id: '2', name: 'Custom V2Ray Config', type: 'config', isActive: false },
    { id: '3', name: 'Mobile Optimized', type: 'subscription', isActive: false }
  ]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'subscription',
    file: null as File | null
  });

  const handleOperation = async (operation: string, panelId: string) => {
    const operationKey = `${operation}-${panelId}`;
    setOperationStates(prev => ({ ...prev, [operationKey]: 'processing' }));
    
    // Simulate operation
    setTimeout(() => {
      setOperationStates(prev => ({ ...prev, [operationKey]: 'success' }));
      setTimeout(() => {
        setOperationStates(prev => ({ ...prev, [operationKey]: 'idle' }));
      }, 2000);
    }, 2000);
  };

  const getButtonState = (operation: string, panelId: string) => {
    const operationKey = `${operation}-${panelId}`;
    return operationStates[operationKey] || 'idle';
  };

  const renderOperationButton = (operation: string, panelId: string, icon: any, label: string, variant: any = 'primary') => {
    const state = getButtonState(operation, panelId);
    const Icon = icon;
    
    return (
      <Button 
        onClick={() => handleOperation(operation, panelId)}
        disabled={state === 'processing'}
        variant={state === 'success' ? 'secondary' : variant}
        className={`w-full flex items-center justify-center space-x-2 ${
          state === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : ''
        }`}
      >
        {state === 'processing' ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : state === 'success' ? (
          <Check className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span>
          {state === 'processing' ? 'Processing...' : 
           state === 'success' ? 'Completed' : label}
        </span>
      </Button>
    );
  };

  const handleUploadTemplate = () => {
    if (newTemplate.name && newTemplate.file) {
      const template = {
        id: Date.now().toString(),
        name: newTemplate.name,
        type: newTemplate.type,
        isActive: false
      };
      setTemplates([...templates, template]);
      setShowTemplateModal(false);
      setNewTemplate({ name: '', type: 'subscription', file: null });
    }
  };

  const toggleTemplate = (templateId: string) => {
    setTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { ...template, isActive: !template.isActive }
          : template
      )
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel Features</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage panel features and templates</p>
        </div>
        <Button onClick={() => setShowTemplateModal(true)} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" />
          <span>Add Template</span>
        </Button>
      </motion.div>

      {/* Panel Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Panel</h3>
          <select
            value={selectedPanel}
            onChange={(e) => setSelectedPanel(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a panel...</option>
            {panels.map(panel => (
              <option key={panel.id} value={panel.id}>{panel.name}</option>
            ))}
          </select>
        </Card>
      </motion.div>

      {selectedPanel && (
        <>
          {/* Panel Operations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Cpu className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Optimize Panel
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Optimize panel performance and clean up resources
              </p>
              {renderOperationButton('optimize', selectedPanel, Zap, 'Optimize')}
            </Card>

            <Card hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Restart Xray
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Restart Xray service to apply configuration changes
              </p>
              {renderOperationButton('restart', selectedPanel, RefreshCw, 'Restart', 'secondary')}
            </Card>

            <Card hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                    <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Subscription
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage subscription templates and settings
              </p>
              {renderOperationButton('configure', selectedPanel, Settings, 'Configure', 'outline')}
            </Card>
          </motion.div>

          {/* Templates Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Active Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg ${
                      template.isActive 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.type === 'subscription' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                      }`}>
                        {template.type}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={template.isActive ? "secondary" : "primary"}
                        onClick={() => toggleTemplate(template.id)}
                        className="flex-1"
                      >
                        {template.isActive ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                        {template.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="px-3"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {/* Add Template Modal */}
      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Add New Template">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter template name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Type
            </label>
            <select
              value={newTemplate.type}
              onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="subscription">Subscription Template</option>
              <option value="config">Configuration Template</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Template File (ZIP)
            </label>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setNewTemplate({...newTemplate, file: e.target.files?.[0] || null})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadTemplate} 
              disabled={!newTemplate.name || !newTemplate.file}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Upload Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
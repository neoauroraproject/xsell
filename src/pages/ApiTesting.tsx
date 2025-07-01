import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { apiClient } from '../config/api';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Play, 
  Server, 
  Users, 
  Settings, 
  Shield,
  Database,
  Wifi,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

export const ApiTesting: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [testConfig, setTestConfig] = useState({
    panelUrl: 'https://x2.hmray.us:44965/sjagaOuItVFnqTa',
    panelUsername: 'hmray',
    panelPassword: 'hmray123',
    testUserEmail: 'test@example.com',
    testTrafficGB: '10',
    testExpiryDays: '30'
  });

  const updateTestResult = (name: string, status: TestResult['status'], message: string, data?: any, duration?: number) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      const newResult = { name, status, message, data, duration };
      
      if (existing) {
        return prev.map(r => r.name === name ? newResult : r);
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTestResult(testName, 'pending', 'Running...');
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'success', 'Test passed', result, duration);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'error', error.message || 'Test failed', null, duration);
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // 1. Test API Health
      await runTest('API Health Check', async () => {
        try {
          const response = await apiClient.healthCheck();
          if (!response.success) throw new Error('Health check failed');
          return response;
        } catch (error) {
          // Fallback test
          const response = await fetch('/api/health');
          if (!response.ok) throw new Error('API server is not responding');
          const data = await response.json();
          return data;
        }
      });

      // 2. Test Authentication
      await runTest('Authentication Test', async () => {
        const response = await apiClient.login('admin', 'admin123');
        if (!response.success) throw new Error('Login failed');
        return response;
      });

      // 3. Test Current User
      await runTest('Get Current User', async () => {
        const response = await apiClient.getCurrentUser();
        if (!response.success) throw new Error('Failed to get current user');
        return response;
      });

      // 4. Test Panels API
      await runTest('Get Panels', async () => {
        const response = await apiClient.getPanels();
        if (!response.success) throw new Error('Failed to get panels');
        return response;
      });

      // 5. Test Users API
      await runTest('Get Users', async () => {
        const response = await apiClient.getUsers();
        if (!response.success) throw new Error('Failed to get users');
        return response;
      });

      // 6. Test Admins API
      await runTest('Get Admins', async () => {
        const response = await apiClient.getAdmins();
        if (!response.success) throw new Error('Failed to get admins');
        return response;
      });

      // 7. Test Settings API
      await runTest('Get Settings', async () => {
        const response = await apiClient.getSettings();
        if (!response.success) throw new Error('Failed to get settings');
        return response;
      });

      // 8. Test X-UI Connection (if panel config provided)
      if (testConfig.panelUrl && testConfig.panelUsername && testConfig.panelPassword) {
        await runTest('X-UI Connection Test', async () => {
          const response = await apiClient.testXUIConnection(
            testConfig.panelUrl,
            testConfig.panelUsername,
            testConfig.panelPassword
          );
          if (!response.success) throw new Error('X-UI connection failed: ' + response.message);
          return response;
        });

        // 9. Test X-UI Panel Stats
        await runTest('X-UI Panel Stats', async () => {
          // First get panels to find one to test with
          const panelsResponse = await apiClient.getPanels();
          if (!panelsResponse.success || !panelsResponse.data.length) {
            throw new Error('No panels available for testing');
          }
          
          const testPanel = panelsResponse.data[0];
          const response = await apiClient.getXUIStats(testPanel.id);
          if (!response.success) throw new Error('Failed to get panel stats');
          return response;
        });

        // 10. Test X-UI Inbounds
        await runTest('X-UI Inbounds', async () => {
          const panelsResponse = await apiClient.getPanels();
          if (!panelsResponse.success || !panelsResponse.data.length) {
            throw new Error('No panels available for testing');
          }
          
          const testPanel = panelsResponse.data[0];
          const response = await apiClient.getXUIInbounds(testPanel.id);
          if (!response.success) throw new Error('Failed to get inbounds');
          return response;
        });
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'pending':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <TestTube className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Testing Suite</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test all API endpoints and X-UI panel connections
            </p>
          </div>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
        </Button>
      </motion.div>

      {/* Test Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Test Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Panel URL
              </label>
              <input
                type="url"
                value={testConfig.panelUrl}
                onChange={(e) => setTestConfig({...testConfig, panelUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="https://your-panel-url:port/path"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Panel Username
              </label>
              <input
                type="text"
                value={testConfig.panelUsername}
                onChange={(e) => setTestConfig({...testConfig, panelUsername: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="Panel username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Panel Password
              </label>
              <input
                type="password"
                value={testConfig.panelPassword}
                onChange={(e) => setTestConfig({...testConfig, panelPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                placeholder="Panel password"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Test Results Summary */}
      {testResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTests}</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{successCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Results
            </h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <motion.div
                  key={result.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {result.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {result.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {result.duration && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {result.duration}ms
                        </span>
                      )}
                      {result.data && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedResult(result);
                            setShowDetails(true);
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Test Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card hover className="p-6 text-center">
          <Server className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">API Health</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test server connectivity and health endpoints
          </p>
        </Card>
        <Card hover className="p-6 text-center">
          <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Authentication</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test login, logout, and token validation
          </p>
        </Card>
        <Card hover className="p-6 text-center">
          <Database className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Database</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test CRUD operations on all entities
          </p>
        </Card>
        <Card hover className="p-6 text-center">
          <Wifi className="h-8 w-8 text-orange-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">X-UI Integration</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test panel connections and client management
          </p>
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Modal 
        isOpen={showDetails} 
        onClose={() => setShowDetails(false)} 
        title={`Test Details: ${selectedResult?.name}`}
        size="lg"
      >
        {selectedResult && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(selectedResult.status)}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedResult.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedResult.message}
                </p>
              </div>
            </div>
            
            {selectedResult.duration && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Duration:</strong> {selectedResult.duration}ms
                </p>
              </div>
            )}
            
            {selectedResult.data && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Response Data:</h5>
                <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(selectedResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
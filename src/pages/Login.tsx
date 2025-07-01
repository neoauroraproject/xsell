import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, Wifi, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const navigate = useNavigate();
  const { login, error, clearError, isAuthenticated } = useAuth();

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submitted with:', { username, password: '***' });
    
    // Clear any previous errors
    clearError();
    
    // Validate inputs
    if (!username.trim() || !password.trim()) {
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Calling login function...');
      const success = await login(username.trim(), password);
      console.log('🎯 Login result:', success);
      
      if (success) {
        console.log('✅ Login successful, navigating to dashboard');
        navigate('/');
      } else {
        console.log('❌ Login failed');
        // Error is handled by the auth hook
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getServerStatusIcon = () => {
    switch (serverStatus) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online':
        return 'Server Online';
      case 'offline':
        return 'Server Offline';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4"
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">X-UI SELL Panel</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Professional X-UI Management System</p>
          </div>

          {/* Server Status */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm">
              {getServerStatusIcon()}
              <span className={`${
                serverStatus === 'online' ? 'text-green-600' : 
                serverStatus === 'offline' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {getServerStatusText()}
              </span>
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              {window.location.protocol}//{window.location.host}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {serverStatus === 'offline' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Server Connection Issue</p>
                  <p>Please ensure the backend server is running on port 3001</p>
                </div>
              </motion.div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your username"
                  disabled={loading || serverStatus === 'offline'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your password"
                  disabled={loading || serverStatus === 'offline'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Demo Credentials Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Demo Credentials:</p>
                <p>Username: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin</code></p>
                <p>Password: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin123</code></p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || serverStatus === 'offline' || !username.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </motion.button>

            {/* Retry Server Connection */}
            {serverStatus === 'offline' && (
              <button
                type="button"
                onClick={checkServerStatus}
                className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Retry Connection
              </button>
            )}
          </form>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Copyright © 2025 Design and developed by Hmray
          </p>
        </div>
      </motion.div>
    </div>
  );
};
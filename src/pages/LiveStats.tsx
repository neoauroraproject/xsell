import React, { useState } from 'react';
import { Card } from '../components/UI/Card';
import { StatCard } from '../components/UI/StatCard';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { useSystemStats } from '../hooks/useApi';
import { useLiveStats } from '../hooks/useAdvancedApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, HardDrive, Wifi, Users, TrendingUp, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export const LiveStats: React.FC = () => {
  const { stats, loading } = useSystemStats();
  const liveStats = useLiveStats();

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live System Statistics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time monitoring and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
        </div>
      </motion.div>

      {/* Real-time Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Active Connections"
          value={liveStats.activeConnections}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
          color="blue"
        />
        
        <StatCard
          title="Upload Speed"
          value={`${(liveStats.bandwidth.upload / 1024).toFixed(1)} MB/s`}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
          color="green"
        />
        
        <StatCard
          title="Download Speed"
          value={`${(liveStats.bandwidth.download / 1024).toFixed(1)} MB/s`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          color="purple"
        />
        
        <StatCard
          title="Server Status"
          value="Online"
          icon={Server}
          color="green"
        />
      </motion.div>

      {/* System Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CPU Usage</h3>
            <Cpu className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.cpu.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats?.cpu}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stats?.cpu && stats.cpu > 80 ? 'High usage detected' : 'Normal operation'}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Memory Usage</h3>
            <HardDrive className="h-6 w-6 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats?.memory.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats?.memory}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stats?.memory && stats.memory > 85 ? 'High usage detected' : 'Normal operation'}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Disk Usage</h3>
            <HardDrive className="h-6 w-6 text-purple-500" />
          </div>
          <div className="space-y-4">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.disk.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats?.disk}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stats?.disk && stats.disk > 90 ? 'High usage detected' : 'Normal operation'}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Real-time Connection Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Real-time Bandwidth Usage
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Live Data</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={liveStats.connectionHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="timestamp" 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <Line
                type="monotone"
                dataKey="activeConnections"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="Active Connections"
              />
              <Line
                type="monotone"
                dataKey="bandwidth"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="Bandwidth (MB/s)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.uptime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats?.version}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Panel Version</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.xrayVersion}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Xray Version</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats?.onlineConnections}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Online Now</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
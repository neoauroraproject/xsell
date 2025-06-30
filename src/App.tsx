import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { AdvancedUsers } from './pages/AdvancedUsers';
import { TrafficMonitoring } from './pages/TrafficMonitoring';
import { LiveStats } from './pages/LiveStats';
import { Panels } from './pages/Panels';
import { PanelFeatures } from './pages/PanelFeatures';
import { Admins } from './pages/Admins';
import { Settings } from './pages/Settings';
import { ApiTesting } from './pages/ApiTesting';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { LoadingSpinner } from './components/UI/LoadingSpinner';

// Mock pages for other routes
const SubscriptionTemplates = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Subscription Templates</h1>
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <p className="text-gray-600 dark:text-gray-400">Subscription templates management coming soon...</p>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/advanced-users" element={<AdvancedUsers />} />
          <Route path="/traffic-monitoring" element={<TrafficMonitoring />} />
          <Route path="/live-stats" element={<LiveStats />} />
          <Route path="/api-testing" element={<ApiTesting />} />
          
          {/* Super Admin Only Routes */}
          {isSuperAdmin && (
            <>
              <Route path="/panels" element={<Panels />} />
              <Route path="/panel-features" element={<PanelFeatures />} />
              <Route path="/admins" element={<Admins />} />
              <Route path="/subscription-templates" element={<SubscriptionTemplates />} />
              <Route path="/settings" element={<Settings />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
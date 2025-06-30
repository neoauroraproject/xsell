import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  Server,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserCog,
  Bell,
  Lock,
  FileText,
  Monitor,
  Wifi,
  HardDrive,
  Plus,
  Eye,
  Download,
  Activity,
  Zap,
  TrendingUp,
  Search,
  BarChart3,
  Globe,
  Layers,
  TestTube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  children?: NavigationItem[];
  superAdminOnly?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { logout, admin, isSuperAdmin } = useAuth();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { 
      name: 'Users', 
      icon: Users,
      children: [
        { name: 'User Management', href: '/users', icon: Users },
        { name: 'Advanced Users', href: '/advanced-users', icon: Search },
      ]
    },
    {
      name: 'Monitoring',
      icon: BarChart3,
      children: [
        { name: 'Traffic Monitor', href: '/traffic-monitoring', icon: TrendingUp },
        { name: 'Live Statistics', href: '/live-stats', icon: Activity },
      ]
    },
    { name: 'Panels', href: '/panels', icon: Server, superAdminOnly: true },
    { name: 'Panel Features', href: '/panel-features', icon: Zap, superAdminOnly: true },
    { name: 'Admins', href: '/admins', icon: UserCog, superAdminOnly: true },
    { 
      name: 'Templates', 
      icon: Layers,
      superAdminOnly: true,
      children: [
        { name: 'Subscription Templates', href: '/subscription-templates', icon: Globe },
      ]
    },
    { name: 'Settings', href: '/settings', icon: Settings, superAdminOnly: true },
    { name: 'API Testing', href: '/api-testing', icon: TestTube },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleLogout = () => {
    logout();
  };

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    // Hide super admin only items for regular admins
    if (item.superAdminOnly && !isSuperAdmin) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white ${
              depth > 0 ? 'ml-4' : ''
            }`}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 space-y-1">
                  {item.children?.map(child => renderNavigationItem(child, depth + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.href!}
        className={({ isActive }) =>
          `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
          } ${depth > 0 ? 'ml-4' : ''}`
        }
        onClick={() => window.innerWidth < 1024 && onClose()}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">
                {isSuperAdmin ? 'X-UI SELL Pro' : admin?.username || 'X-UI SELL'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map(item => renderNavigationItem(item))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isSuperAdmin 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}>
                <span className="text-white text-sm font-medium">
                  {admin?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {admin?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isSuperAdmin ? 'Super Admin' : 'Regular Admin'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
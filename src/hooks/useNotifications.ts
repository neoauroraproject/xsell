import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { admin } = useAuth();

  useEffect(() => {
    if (!admin) return;

    // Mock notifications for regular admins
    const mockNotifications: Notification[] = admin.role === 'regular_admin' ? [
      {
        id: '1',
        adminId: admin.id,
        type: 'user_limit_change',
        title: 'User Limit Updated',
        message: 'Traffic limit for user Mrphone31 has been changed to 25GB by Super Admin',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        data: { userId: '2', oldLimit: '20GB', newLimit: '25GB' }
      },
      {
        id: '2',
        adminId: admin.id,
        type: 'user_expiry_change',
        title: 'User Expiry Extended',
        message: 'Expiry date for user Mrphone74 has been extended by 15 days by Super Admin',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        data: { userId: '3', extension: '15 days' }
      },
      {
        id: '3',
        adminId: admin.id,
        type: 'system_update',
        title: 'System Maintenance',
        message: 'Panel optimization has been performed on Server-Ar1',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        data: { panelId: '1' }
      }
    ] : [];
    
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, [admin]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    setNotifications 
  };
};
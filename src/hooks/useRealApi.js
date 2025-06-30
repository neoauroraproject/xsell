import { useState, useEffect } from 'react';
import apiService from '../services/api.js';

export const useRealAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                const response = await apiService.getCurrentAdmin();
                if (response.success) {
                    setIsAuthenticated(true);
                    setAdmin(response.admin);
                } else {
                    localStorage.removeItem('auth_token');
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await apiService.login(username, password);
            if (response.success) {
                setIsAuthenticated(true);
                setAdmin(response.admin);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } finally {
            setIsAuthenticated(false);
            setAdmin(null);
        }
    };

    const isSuperAdmin = admin?.role === 'super_admin';

    return { isAuthenticated, admin, login, logout, loading, isSuperAdmin };
};

export const useRealPanels = () => {
    const [panels, setPanels] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPanels = async () => {
        try {
            const response = await apiService.getPanels();
            if (response.success) {
                setPanels(response.panels);
            }
        } catch (error) {
            console.error('Failed to fetch panels:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPanels();
    }, []);

    const addPanel = async (panelData) => {
        try {
            const response = await apiService.addPanel(panelData);
            if (response.success) {
                setPanels(prev => [...prev, response.panel]);
                return response.panel;
            }
        } catch (error) {
            console.error('Failed to add panel:', error);
            throw error;
        }
    };

    const updatePanel = async (id, panelData) => {
        try {
            const response = await apiService.updatePanel(id, panelData);
            if (response.success) {
                setPanels(prev => prev.map(panel => 
                    panel.id === id ? response.panel : panel
                ));
                return response.panel;
            }
        } catch (error) {
            console.error('Failed to update panel:', error);
            throw error;
        }
    };

    const deletePanel = async (id) => {
        try {
            const response = await apiService.deletePanel(id);
            if (response.success) {
                setPanels(prev => prev.filter(panel => panel.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete panel:', error);
            throw error;
        }
    };

    return { panels, loading, addPanel, updatePanel, deletePanel, refetch: fetchPanels };
};

export const useRealAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAdmins = async () => {
        try {
            const response = await apiService.getAdmins();
            if (response.success) {
                setAdmins(response.admins);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const addAdmin = async (adminData) => {
        try {
            const response = await apiService.addAdmin(adminData);
            if (response.success) {
                setAdmins(prev => [...prev, response.admin]);
                return response.admin;
            }
        } catch (error) {
            console.error('Failed to add admin:', error);
            throw error;
        }
    };

    const updateAdmin = async (id, adminData) => {
        try {
            const response = await apiService.updateAdmin(id, adminData);
            if (response.success) {
                setAdmins(prev => prev.map(admin => 
                    admin.id === id ? response.admin : admin
                ));
                return response.admin;
            }
        } catch (error) {
            console.error('Failed to update admin:', error);
            throw error;
        }
    };

    const deleteAdmin = async (id) => {
        try {
            const response = await apiService.deleteAdmin(id);
            if (response.success) {
                setAdmins(prev => prev.filter(admin => admin.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete admin:', error);
            throw error;
        }
    };

    return { admins, loading, addAdmin, updateAdmin, deleteAdmin, refetch: fetchAdmins };
};

export const useRealUsers = (adminId = null) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await apiService.getUsers(adminId);
            if (response.success) {
                setUsers(response.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [adminId]);

    const addUser = async (userData) => {
        try {
            const response = await apiService.addUser(userData);
            if (response.success) {
                setUsers(prev => [...prev, response.user]);
                return response.user;
            }
        } catch (error) {
            console.error('Failed to add user:', error);
            throw error;
        }
    };

    const updateUser = async (id, userData) => {
        try {
            const response = await apiService.updateUser(id, userData);
            if (response.success) {
                setUsers(prev => prev.map(user => 
                    user.id === id ? response.user : user
                ));
                return response.user;
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    };

    const deleteUser = async (id) => {
        try {
            const response = await apiService.deleteUser(id);
            if (response.success) {
                setUsers(prev => prev.filter(user => user.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw error;
        }
    };

    const toggleUser = async (id) => {
        try {
            const response = await apiService.toggleUser(id);
            if (response.success) {
                setUsers(prev => prev.map(user => 
                    user.id === id ? { ...user, enable: !user.enable } : user
                ));
            }
        } catch (error) {
            console.error('Failed to toggle user:', error);
            throw error;
        }
    };

    return { users, loading, addUser, updateUser, deleteUser, toggleUser, refetch: fetchUsers };
};
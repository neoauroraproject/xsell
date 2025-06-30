import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '../config/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  admin: User | null; // Alias for compatibility
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const _useAuthStateLogic = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔍 Checking authentication status...');
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🎫 Token found:', !!token);
      
      if (token) {
        console.log('📡 Fetching current user...');
        const response = await apiClient.getCurrentUser();
        console.log('👤 Current user response:', response);
        
        if (response.success && response.data.user) {
          console.log('✅ User authenticated:', response.data.user);
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          console.log('❌ Invalid token, removing...');
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('❌ No token found');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('🔐 Starting login process...');
    setLoading(true);
    try {
      const response = await apiClient.login(username, password);
      console.log('📡 Login response:', response);
      
      if (response.success && response.data.user && response.data.token) {
        console.log('✅ Login successful, setting user state');
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      } else {
        console.log('❌ Login failed - invalid response format');
        return false;
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out...');
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';

  return { 
    isAuthenticated, 
    user, 
    admin: user, // Alias for compatibility
    login, 
    logout, 
    loading, 
    isSuperAdmin 
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = _useAuthStateLogic();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
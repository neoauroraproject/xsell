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
  error: string | null;
  clearError: () => void;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const checkAuthStatus = async () => {
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const response = await apiClient.getCurrentUser();
        
        if (response.success && response.data.user) {
          setIsAuthenticated(true);
          setUser(response.data.user);
          setError(null);
        } else {
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error: any) {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!username || !password) {
        setError('Username and password are required');
        return false;
      }

      const response = await apiClient.login(username, password);
      
      if (response.success && response.data && response.data.user && response.data.token) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        setError(null);
        return true;
      } else {
        setError(response.message || 'Invalid username or password');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
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
    isSuperAdmin,
    error,
    clearError
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
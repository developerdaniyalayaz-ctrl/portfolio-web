import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cyber_auth_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cyber_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const currentToken = localStorage.getItem('cyber_auth_token');
      if (!currentToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        setToken(null);
        setUser(null);
        api.setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();

    // Listen for global 401 unauth triggers
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('cyber:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cyber:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    const response = await api.login(username, password);
    setToken(response.access_token);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

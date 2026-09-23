import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch {
          localStorage.removeItem('cow_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // Default auto-login as customer for seamless first-load UX
        try {
          const res = await api.login({ email: 'sophia@example.com', password: 'Customer@123' });
          localStorage.setItem('cow_token', res.access_token);
          setToken(res.access_token);
          setUser(res.user);
        } catch (e) {
          console.warn('Auto-login notice:', e);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('cow_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('cow_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('cow_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchRole = async (role) => {
    let email = 'sophia@example.com';
    let pass = 'Customer@123';
    if (role === 'admin') {
      email = 'admin@cafeonwheels.com';
      pass = 'Admin@123';
    } else if (role === 'driver') {
      email = 'driver@cafeonwheels.com';
      pass = 'Driver@123';
    }
    return login(email, pass);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
    login,
    register,
    logout,
    quickSwitchRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

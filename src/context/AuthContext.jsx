import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('hayaan_user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const meData = await meResponse.json();
        const userData = { ...meData, name: `${meData.firstName} ${meData.lastName}`, fullName: `${meData.firstName} ${meData.lastName}` };
        setUser(userData);
        localStorage.setItem('hayaan_user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        return { success: true, role: data.role };
      } else {
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, message: 'Server error, please try again later' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, message: 'Server error, please try again later' };
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const userData = { ...data, name: `${data.firstName} ${data.lastName}` };
        setUser(userData);
        localStorage.setItem('hayaan_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Refresh user error', error);
    }
  };

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData, name: `${newData.firstName || user.firstName} ${newData.lastName || user.lastName}` };
    setUser(updatedUser);
    localStorage.setItem('hayaan_user', JSON.stringify(updatedUser));
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setUser(null);
    localStorage.removeItem('hayaan_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, refreshUser, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

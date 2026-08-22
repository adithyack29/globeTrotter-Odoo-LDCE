import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gt_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await apiFetch('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('gt_token', res.token);
    setToken(res.token);
    setUser(res.user);
    showToast(`Welcome back, ${res.user.name}!`, 'success');
    return res;
  };

  const register = async (userData) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    localStorage.setItem('gt_token', res.token);
    setToken(res.token);
    setUser(res.user);
    showToast(`Welcome to Globe Trotter, ${res.user.name}!`, 'success');
    return res;
  };

  const logout = () => {
    localStorage.removeItem('gt_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const updateProfile = async (data) => {
    const res = await apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    setUser(res.user);
    showToast('Profile details updated!', 'success');
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        toast,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

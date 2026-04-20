import React, { createContext, useContext, useState } from 'react';
import { adminAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const a = localStorage.getItem('mc_admin_user');
    return a ? JSON.parse(a) : null;
  });

  const login = async (email, password) => {
    const res = await adminAPI.login({ email, password });
    const { token, role, user } = res.data;

    // Guard — make sure the account that logged in is actually an admin
    if (role !== 'admin') {
      throw new Error('Access denied. Admin account required.');
    }

    localStorage.setItem('mc_admin_token', token);
    localStorage.setItem('mc_admin_user', JSON.stringify(user));
    setAdmin(user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('mc_admin_token');
    localStorage.removeItem('mc_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
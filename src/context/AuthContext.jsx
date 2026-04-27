import React, { createContext, useContext, useState } from 'react';
import { adminAuthAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('lamazi_admin_user');
    return u ? JSON.parse(u) : null;
  });

  const login = async (email, password) => {
    const res = await adminAuthAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('lamazi_admin_token', token);
    localStorage.setItem('lamazi_admin_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('lamazi_admin_token');
    localStorage.removeItem('lamazi_admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
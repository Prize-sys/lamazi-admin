import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/dashboard', label: 'Overview', icon: '▦' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/verification', label: 'Verification', icon: '✓' },
  { path: '/payouts', label: 'Payouts', icon: '$' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
  { path: '/audit-logs', label: 'Audit Logs', icon: '📋' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>MindCare Admin</h1>
        <p>Platform Management Dashboard</p>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ path, label, icon }) => (
          <button key={path}
            className={'nav-link' + (pathname === path ? ' active' : '')}
            onClick={() => navigate(path)}
            style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 16, width: 22, display: 'inline-block' }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div className="avatar" style={{ background: 'var(--primary)' }}>
            {(admin?.full_name || 'AU').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{admin?.full_name || 'Admin User'}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Super Admin</div>
          </div>
        </div>
        <button onClick={logout} style={{ width: '100%', padding: '7px 12px', borderRadius: 6, border: '1px solid var(--gray-200)', background: 'white', fontSize: 13, color: 'var(--gray-700)', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

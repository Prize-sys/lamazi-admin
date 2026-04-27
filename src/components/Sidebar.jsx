import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',            label: 'Dashboard',    icon: '📊' },
  { to: '/users',       label: 'Users',        icon: '👥' },
  { to: '/verification',label: 'Verification', icon: '✔️'  },
  { to: '/bookings',    label: 'Bookings',     icon: '📅' },
  { to: '/payouts',     label: 'Payouts',      icon: '💸' },
  { to: '/refunds',     label: 'Refunds',      icon: '↩️'  },
  { to: '/analytics',   label: 'Analytics',    icon: '📈' },
  { to: '/audit-logs',  label: 'Audit Logs',   icon: '🔍' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#0F172A',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1E293B' }}>
        <div style={{ color: '#3B82F6', fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Lamazi</div>
        <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>Admin Dashboard</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', fontSize: 14, fontWeight: 500,
              color: isActive ? '#F8FAFC' : '#94A3B8',
              background: isActive ? '#1E3A5F' : 'transparent',
              borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #1E293B' }}>
        <div style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          {user?.full_name || 'Admin'}
        </div>
        <div style={{ color: '#475569', fontSize: 11, marginBottom: 12 }}>{user?.email}</div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '8px 0', borderRadius: 6,
            background: '#1E293B', color: '#94A3B8', border: 'none',
            fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
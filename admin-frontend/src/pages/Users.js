import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../api';

const COLORS = ['#6366F1','#EC4899','#F59E0B','#10B981','#3B82F6','#8B5CF6'];
const getColor = name => COLORS[(name || 'A').charCodeAt(0) % COLORS.length];
const getInitials = name => (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const DEMO_USERS = [
  { id: '1', full_name: 'John Doe', email: 'john.doe@email.com', phone: '+1234567890', role: 'client', status: 'active', created_at: '2025-10-15' },
  { id: '2', full_name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1234567891', role: 'client', status: 'active', created_at: '2025-11-01' },
];
const DEMO_THERAPISTS = [
  { id: '3', full_name: 'Dr. Sarah Johnson', email: 'sarah.j@therapist.com', phone: '+1234567892', role: 'therapist', status: 'active', created_at: '2025-08-20' },
  { id: '4', full_name: 'Michael Chen', email: 'michael.c@therapist.com', phone: '+1234567893', role: 'therapist', status: 'active', created_at: '2025-09-10' },
  { id: '5', full_name: 'Dr. New Therapist', email: 'new.therapist@email.com', phone: '+1234567894', role: 'therapist', status: 'pending', created_at: '2025-12-08' },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [counts, setCounts] = useState({ clients: 0, therapists: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);

  const load = useCallback(() => {
    adminAPI.users({ q: search, role: roleFilter, status: statusFilter })
      .then(r => {
        setUsers(r.data.users || []);
        setTherapists(r.data.therapists || []);
        setCounts({ clients: r.data.total_clients || 0, therapists: r.data.total_therapists || 0, pending: r.data.pending_approval || 0 });
      })
      .catch(() => {
        setUsers(DEMO_USERS);
        setTherapists(DEMO_THERAPISTS);
        setCounts({ clients: 2, therapists: 3, pending: 1 });
      })
      .finally(() => setLoading(false));
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSuspend = async (id, role) => {
    try {
      if (role === 'therapist') await adminAPI.updateTherapistStatus(id, 'suspended');
      else await adminAPI.updateUserStatus(id, 'suspended');
      load();
    } catch { alert('Failed to update status'); }
    setMenuOpen(null);
  };

  const allRows = [
    ...(roleFilter === 'therapist' ? [] : users),
    ...(roleFilter === 'client' ? [] : therapists),
  ].filter(u => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (search && !u.full_name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="top-bar">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Users</h2>
        </div>
        <div className="page-content">
          <div className="section-title">User Management</div>
          <div className="section-sub">Manage clients, therapists, and their accounts</div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input className="form-input" placeholder="🔍  Search by name or email..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-outline">⚙ Filters</button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <select className="form-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 180 }}>
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="therapist">Therapists</option>
            </select>
            <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 180 }}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, marginTop: 16 }}>
            {[{ label: 'Total Clients', val: counts.clients }, { label: 'Total Therapists', val: counts.therapists }, { label: 'Pending Approval', val: counts.pending }].map(({ label, val }) => (
              <div key={label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{val}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            {loading ? <div className="spinner" /> : (
              <table>
                <thead>
                  <tr>
                    <th>User</th><th>Contact</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: getColor(u.full_name) }}>{getInitials(u.full_name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.full_name} {u.status !== 'pending' && '✓'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>✉ {u.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>📞 {u.phone || 'N/A'}</div>
                      </td>
                      <td><span className={'badge badge-' + u.role}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span></td>
                      <td><span className={'badge badge-' + u.status}>{u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span></td>
                      <td style={{ fontSize: 13 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                      <td>
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                            style={{ background: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 18, color: 'var(--gray-500)' }}>⋮</button>
                          {menuOpen === u.id && (
                            <div style={{ position: 'absolute', right: 0, top: 28, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, boxShadow: 'var(--shadow)', zIndex: 50, minWidth: 160 }}>
                              <button onClick={() => setMenuOpen(null)} style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', fontSize: 13 }}>View Details</button>
                              <button onClick={() => setMenuOpen(null)} style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', fontSize: 13 }}>Send Message</button>
                              <button onClick={() => handleSuspend(u.id, u.role)} style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', fontSize: 13, color: 'var(--red)' }}>🚫 Suspend Account</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

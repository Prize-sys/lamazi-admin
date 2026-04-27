import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

const TIER_COLORS = { gold: '#D97706', silver: '#64748B', bronze: '#92400E' };
const TIER_BG    = { gold: '#FEF3C7', silver: '#F1F5F9', bronze: '#FEF9EE' };

export default function Users() {
  const [data, setData]       = useState({ users: [], therapists: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [tab, setTab]         = useState('all');
  const [actionLoading, setActionLoading] = useState('');

  const load = (q = '') => {
    setLoading(true);
    adminAPI.getUsers({ q, role: tab === 'all' ? '' : tab })
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(search); }, [tab]);

  const handleSearch = e => {
    setSearch(e.target.value);
    if (e.target.value.length === 0 || e.target.value.length > 2) load(e.target.value);
  };

  const handleStatusToggle = async (id, currentStatus, isTherapist) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setActionLoading(id);
    try {
      if (isTherapist) await adminAPI.updateTherapistStatus(id, { status: newStatus });
      else             await adminAPI.updateUserStatus(id, { status: newStatus });
      load(search);
    } catch {} finally { setActionLoading(''); }
  };

  const allRows = [
    ...data.users.map(u => ({ ...u, isTherapist: false })),
    ...data.therapists.map(t => ({ ...t, role: 'therapist', isTherapist: true })),
  ];

  const rows = allRows.filter(u =>
    tab === 'all' ||
    (tab === 'client'    && u.role === 'client') ||
    (tab === 'therapist' && u.role === 'therapist')
  );

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Users</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Manage clients and therapists</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Clients',     value: data.total_clients    || 0, color: '#3B82F6' },
          { label: 'Total Therapists',  value: data.total_therapists || 0, color: '#7C3AED' },
          { label: 'Pending Approval',  value: data.pending_approval || 0, color: '#D97706' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center' }}>
        <input
          placeholder="Search name or email..."
          value={search}
          onChange={handleSearch}
          style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }}
        />
        {['all', 'client', 'therapist'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: tab === t ? '#3B82F6' : '#fff',
            color: tab === t ? '#fff' : '#475569',
            border: `1px solid ${tab === t ? '#3B82F6' : '#E2E8F0'}`,
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Name', 'Email', 'Phone', 'Role', 'Tier', 'Status', 'Joined', 'Action'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No users found</td></tr>
            ) : rows.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A' }}>{u.full_name}</td>
                <td style={{ padding: '12px 14px', color: '#475569' }}>{u.email}</td>
                <td style={{ padding: '12px 14px', color: '#64748B' }}>{u.phone || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    background: u.role === 'therapist' ? '#F3E8FF' : '#EFF6FF',
                    color:      u.role === 'therapist' ? '#7C3AED'  : '#3B82F6',
                    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {u.isTherapist && u.membership_tier ? (
                    <span style={{ background: TIER_BG[u.membership_tier], color: TIER_COLORS[u.membership_tier], padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                      {u.membership_tier}
                    </span>
                  ) : <span style={{ color: '#CBD5E1' }}>—</span>}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    background: u.status === 'active' ? '#DCFCE7' : u.status === 'pending' ? '#FEF9C3' : '#FEF2F2',
                    color:      u.status === 'active' ? '#16A34A' : u.status === 'pending' ? '#CA8A04' : '#DC2626',
                    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: '#94A3B8', fontSize: 12 }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <button
                    onClick={() => handleStatusToggle(u.id, u.status, u.isTherapist)}
                    disabled={actionLoading === u.id}
                    style={{
                      padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: u.status === 'active' ? '#FEF2F2' : '#F0FDF4',
                      color:      u.status === 'active' ? '#DC2626' : '#16A34A',
                    }}
                  >
                    {actionLoading === u.id ? '...' : u.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
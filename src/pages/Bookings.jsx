import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

const STATUS_COLORS = {
  confirmed:        { bg: '#DCFCE7', color: '#16A34A' },
  completed:        { bg: '#DBEAFE', color: '#1D4ED8' },
  pending:          { bg: '#FEF9C3', color: '#CA8A04' },
  reservation_paid: { bg: '#FEF3C7', color: '#D97706' },
  balance_due:      { bg: '#FFEDD5', color: '#EA580C' },
  cancelled:        { bg: '#F1F5F9', color: '#64748B' },
};
const TIER_COLORS = { gold: '#D97706', silver: '#64748B', bronze: '#92400E' };
const TIER_BG = { gold: '#FEF3C7', silver: '#F1F5F9', bronze: '#FEF9EE' };

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    adminAPI.getBookings(filter ? { status: filter } : {})
      .then(res => setBookings(res.data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = bookings.filter(b =>
    !search ||
    b.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.therapist_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = bookings.reduce((s, b) => s + (b.platform_fee || 0), 0);

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Bookings</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>All platform bookings — full and reservation</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Bookings', value: bookings.length, color: '#3B82F6' },
          { label: 'Platform Revenue', value: `Ksh ${totalRevenue.toLocaleString()}`, color: '#16A34A' },
          { label: 'Reservations', value: bookings.filter(b => b.payment_mode === 'reservation').length, color: '#D97706' },
          { label: 'Refunds Pending', value: bookings.filter(b => b.refund_status === 'pending').length, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          placeholder="Search client or therapist..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }}
        />
        {['', 'pending', 'reservation_paid', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === s ? '#3B82F6' : '#fff',
              color: filter === s ? '#fff' : '#475569',
              border: `1px solid ${filter === s ? '#3B82F6' : '#E2E8F0'}`,
            }}
          >
            {s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Client', 'Therapist', 'Date & Time', 'Mode', 'Status', 'Amount', 'Platform Fee', 'Refund'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No bookings found</td></tr>
            ) : filtered.map((b, i) => {
              const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A' }}>{b.client_name}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{b.therapist_name}</div>
                    <span style={{ background: TIER_BG[b.membership_tier], color: TIER_COLORS[b.membership_tier], fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10, textTransform: 'capitalize' }}>
                      {b.membership_tier}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#334155' }}>
                    <div>{b.session_date}</div>
                    <div style={{ color: '#94A3B8', fontSize: 12 }}>{b.session_time}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: b.payment_mode === 'reservation' ? '#FEF3C7' : '#EFF6FF', color: b.payment_mode === 'reservation' ? '#D97706' : '#3B82F6', padding: '2px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                      {b.payment_mode === 'reservation' ? '30% Reserve' : 'Full'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {b.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>Ksh {b.amount?.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', color: '#16A34A', fontWeight: 600 }}>Ksh {b.platform_fee?.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {b.refund_status === 'pending' && (
                      <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '2px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>⚠ Refund Due</span>
                    )}
                    {b.refund_status === 'issued' && (
                      <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '2px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>✓ Refunded</span>
                    )}
                    {(!b.refund_status || b.refund_status === 'none') && (
                      <span style={{ color: '#CBD5E1', fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
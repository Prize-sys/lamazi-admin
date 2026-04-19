import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../api';

const DEMO_STATS = {
  stats: { total_clients: 2, active_therapists: 3, total_bookings: 4, platform_revenue: 43 },
  recent_activity: [
    { type: 'booking', message: 'New booking: Jane Smith with Dr. Sarah Johnson', created_at: new Date(Date.now() - 5 * 60000) },
    { type: 'verification', message: 'Therapist verification pending: Dr. New Therapist', created_at: new Date(Date.now() - 15 * 60000) },
    { type: 'payout', message: 'Payout request: $520 from Dr. Sarah Johnson', created_at: new Date(Date.now() - 3600000) },
    { type: 'booking', message: 'New client registration: Robert Chen', created_at: new Date(Date.now() - 7200000) },
  ],
  metrics: { session_completion_rate: 94, avg_therapist_rating: 4.8, client_satisfaction: 96 }
};

const REVENUE_DATA = [
  { month: 'Jul', value: 4800 }, { month: 'Aug', value: 5200 }, { month: 'Sep', value: 4600 },
  { month: 'Oct', value: 5800 }, { month: 'Nov', value: 6100 }, { month: 'Dec', value: 6400 }
];
const BOOKING_DATA = [
  { month: 'Jul', value: 48 }, { month: 'Aug', value: 52 }, { month: 'Sep', value: 55 },
  { month: 'Oct', value: 60 }, { month: 'Nov', value: 58 }, { month: 'Dec', value: 65 }
];

const TYPE_DOT = { booking: '#2563EB', verification: '#D97706', payout: '#16A34A', default: '#8B5CF6' };

function timeAgo(date) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' hour ago';
  return Math.floor(diff / 86400000) + ' days ago';
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard().then(r => setData(r.data)).catch(() => setData(DEMO_STATS)).finally(() => setLoading(false));
  }, []);

  const d = data || DEMO_STATS;
  const stats = d.stats || {};
  const metrics = d.metrics || {};

  const STAT_CARDS = [
    { label: 'Total Clients', value: stats.total_clients || 0, change: '+12%', color: '#6366F1', bg: '#EEF2FF', icon: '👤' },
    { label: 'Active Therapists', value: stats.active_therapists || 0, change: '+3', color: '#EC4899', bg: '#FDF2F8', icon: '🧑‍⚕️' },
    { label: 'Total Bookings', value: stats.total_bookings || 0, change: '+18%', color: '#F59E0B', bg: '#FFFBEB', icon: '📅' },
    { label: 'Platform Revenue', value: `$${stats.platform_revenue || 0}`, change: '+25%', color: '#10B981', bg: '#ECFDF5', icon: '💰' },
  ];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="top-bar">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Overview</h2>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="page-content">
          {loading ? <div className="spinner" /> : (
            <>
              <div className="stat-grid">
                {STAT_CARDS.map(({ label, value, change, color, bg, icon }) => (
                  <div key={label} className="card stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', background: '#ECFDF5', padding: '2px 8px', borderRadius: 20 }}>{change}</span>
                    </div>
                    <div className="stat-value">{value}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>

              {(d.recent_activity?.some(a => a.type === 'verification') || d.recent_activity?.some(a => a.type === 'payout')) && (
                <div className="alert alert-warning" style={{ marginBottom: 20 }}>
                  <strong>⚠ Action Required</strong>
                  <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                    {d.recent_activity?.filter(a => a.type === 'verification').length > 0 && (
                      <li style={{ fontSize: 13 }}>{d.recent_activity.filter(a => a.type === 'verification').length} therapist verification pending review</li>
                    )}
                    {d.recent_activity?.filter(a => a.type === 'payout').length > 0 && (
                      <li style={{ fontSize: 13 }}>{d.recent_activity.filter(a => a.type === 'payout').length} payout request awaiting approval</li>
                    )}
                  </ul>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[{ title: 'Revenue Trend', data: REVENUE_DATA, color: '#16A34A' }, { title: 'Booking Trend', data: BOOKING_DATA, color: '#2563EB' }].map(({ title, data: chartData, color }) => (
                  <div key={title} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700 }}>{title}</h3>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>+18%</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
                  {(d.recent_activity || []).map((act, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: TYPE_DOT[act.type] || TYPE_DOT.default, marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13 }}>{act.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{timeAgo(act.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Session Completion Rate', value: `${metrics.session_completion_rate || 94}%`, change: '+2%' },
                    { label: 'Avg. Therapist Rating', value: `${metrics.avg_therapist_rating || 4.8}`, change: '+0.1' },
                    { label: 'Client Satisfaction', value: `${metrics.client_satisfaction || 96}%`, change: '+3%' },
                  ].map(({ label, value, change }) => (
                    <div key={label} className="card stat-card" style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>{label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{value}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>{change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../api';

const DEMO_PAYOUTS = [
  { id: '1', therapist_id: '1', therapist_name: 'Dr. Sarah Johnson', amount: 520, payment_method: 'PayPal', status: 'pending', created_at: '2025-12-07' },
  { id: '2', therapist_id: '2', therapist_name: 'Michael Chen', amount: 380, payment_method: 'M-Pesa', status: 'approved', created_at: '2025-12-06' },
  { id: '3', therapist_id: '3', therapist_name: 'Dr. Emily Rodriguez', amount: 880, payment_method: 'Bank Transfer', status: 'completed', created_at: '2025-12-05' },
];

const STATUS_BADGE = { pending: 'badge-pending', approved: 'badge-approved', completed: 'badge-completed', rejected: 'badge-suspended' };
const COLORS = ['#6366F1', '#EC4899', '#F59E0B'];
const getColor = (name, i) => COLORS[i % COLORS.length];

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState('');

  const load = () => {
    adminAPI.payouts().then(r => setPayouts(r.data.payouts || [])).catch(() => setPayouts(DEMO_PAYOUTS)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (id, status) => {
    setActing(id + status);
    try {
      await adminAPI.updatePayout(id, { status });
      setToast(`Payout ${status} successfully`);
      setTimeout(() => setToast(''), 3000);
      load();
    } catch { setToast('Action failed'); }
    setActing(null);
  };

  const filtered = filter === 'all' ? payouts : payouts.filter(p => p.status === filter);
  const pending = payouts.filter(p => p.status === 'pending').reduce((a, p) => a + p.amount, 0);
  const approved = payouts.filter(p => p.status === 'approved').reduce((a, p) => a + p.amount, 0);
  const completed = payouts.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0);

  const getInitials = name => (name || 'U').split(' ').filter(n => n.match(/^[A-Z]/)).map(n => n[0]).join('').slice(0, 2) || name.slice(0, 2).toUpperCase();

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="top-bar">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Payouts</h2>
          <button className="btn btn-primary">⬇ Export Report</button>
        </div>
        <div className="page-content">
          {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#ECFDF5', color: '#065F46', padding: '12px 20px', borderRadius: 8, boxShadow: 'var(--shadow)', zIndex: 999, fontWeight: 600, fontSize: 14 }}>{toast}</div>}
          <div className="section-title">Payout Management</div>
          <div className="section-sub">Review and process therapist payout requests</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
            {[{ label: 'Pending Approval', val: pending, icon: '⏰', color: '#D97706', bg: '#FFFBEB' },
              { label: 'Approved (Processing)', val: approved, icon: '✓', color: '#2563EB', bg: '#EFF6FF' },
              { label: 'Completed This Month', val: completed, icon: '$', color: '#16A34A', bg: '#ECFDF5' }
            ].map(({ label, val, icon, color, bg }) => (
              <div key={label} className="card stat-card">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 20 }}>{icon}</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>${val.toFixed(2)}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <select className="form-input" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 180 }}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            {loading ? <div className="spinner" /> : (
              <table>
                <thead>
                  <tr><th>Therapist</th><th>Amount</th><th>Method</th><th>Request Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: getColor(p.therapist_name, i) }}>{getInitials(p.therapist_name)}</div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{p.therapist_name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>${p.amount.toFixed(2)}</td>
                      <td style={{ fontSize: 13 }}>{p.payment_method}</td>
                      <td style={{ fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td><span className={'badge ' + (STATUS_BADGE[p.status] || 'badge-pending')}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {p.status === 'pending' && (<>
                            <button className="btn btn-approve" style={{ fontSize: 12, padding: '6px 12px', background: '#16A34A', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                              onClick={() => handleUpdate(p.id, 'approved')} disabled={!!acting}>
                              {acting === p.id + 'approved' ? '...' : 'Approve'}
                            </button>
                            <button style={{ fontSize: 12, padding: '6px 12px', background: 'var(--red)', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                              onClick={() => handleUpdate(p.id, 'rejected')} disabled={!!acting}>
                              Reject
                            </button>
                          </>)}
                          {p.status === 'approved' && (
                            <button style={{ fontSize: 12, padding: '6px 12px', background: 'var(--blue)', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                              onClick={() => handleUpdate(p.id, 'completed')} disabled={!!acting}>
                              {acting === p.id + 'completed' ? '...' : 'Mark Completed'}
                            </button>
                          )}
                          {p.status === 'completed' && (
                            <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }}>View Details</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Recent Payout Transactions</h3>
            {filtered.filter(p => p.status === 'completed').map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>$</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Payout to {p.therapist_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>${p.amount.toFixed(2)}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{p.payment_method}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

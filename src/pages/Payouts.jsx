import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

const STATUS_STYLES = {
  pending:   { bg: '#FEF9C3', color: '#CA8A04' },
  approved:  { bg: '#DBEAFE', color: '#1D4ED8' },
  completed: { bg: '#DCFCE7', color: '#16A34A' },
  rejected:  { bg: '#FEF2F2', color: '#DC2626' },
};

export default function Payouts() {
  const [payouts, setPayouts]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [newStatus, setNewStatus] = useState('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');

  const load = () => {
    setLoading(true);
    adminAPI.getPayouts()
      .then(res => setPayouts(res.data.payouts || []))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleUpdate = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      await adminAPI.updatePayout(modal.id, { status: newStatus, admin_notes: adminNotes });
      showToast(`Payout ${newStatus}`);
      setModal(null);
      load();
    } catch {
      showToast('Action failed');
    } finally { setSaving(false); }
  };

  const totalPending  = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalPaid     = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ padding: 28 }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 24, background: '#0F172A', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 14, zIndex: 2000 }}>
          {toast}
        </div>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Payout Management</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Review and approve therapist payout requests</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Pending Payouts',   value: payouts.filter(p => p.status === 'pending').length,   color: '#D97706' },
          { label: 'Total Pending Ksh', value: `Ksh ${totalPending.toLocaleString()}`,                color: '#DC2626' },
          { label: 'Total Paid Out',    value: `Ksh ${totalPaid.toLocaleString()}`,                   color: '#16A34A' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: s.label.startsWith('Total') ? 18 : 26, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Therapist', 'Amount', 'Method', 'Status', 'Requested', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading...</td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No payout requests</td></tr>
            ) : payouts.map((p, i) => {
              const ss = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{p.therapist_name}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                    Ksh {p.amount?.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', textTransform: 'capitalize' }}>{p.payment_method}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: ss.bg, color: ss.color, padding: '3px 11px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: 12 }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {p.status === 'pending' && (
                      <button
                        onClick={() => { setModal(p); setNewStatus('approved'); setAdminNotes(''); }}
                        style={{ padding: '7px 14px', borderRadius: 7, background: '#3B82F6', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Review
                      </button>
                    )}
                    {p.admin_notes && (
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.admin_notes}</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 420 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Review Payout Request</h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
              {modal.therapist_name} · Ksh {modal.amount?.toLocaleString()} via {modal.payment_method}
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Action</label>
              {['approved', 'completed', 'rejected'].map(s => (
                <button key={s} onClick={() => setNewStatus(s)} style={{
                  display: 'inline-block', marginRight: 8, marginBottom: 8,
                  padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: newStatus === s ? (STATUS_STYLES[s]?.color || '#3B82F6') : '#F1F5F9',
                  color: newStatus === s ? '#fff' : '#475569',
                  border: 'none',
                }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', resize: 'vertical' }}
                placeholder="Optional note..."
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUpdate} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#3B82F6', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

export default function Refunds() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    adminAPI.getBookings({ status: 'cancelled' })
      .then(res => setBookings(res.data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleIssueRefund = async () => {
    if (!modal || !refundAmount) return;
    setSaving(true);
    try {
      await adminAPI.issueRefund(modal.payment_id, { refund_amount: parseFloat(refundAmount), note });
      showToast('Refund issued successfully');
      setModal(null);
      setRefundAmount('');
      setNote('');
      load();
    } catch {
      showToast('Failed to issue refund');
    } finally {
      setSaving(false);
    }
  };

  const pendingRefunds = bookings.filter(b => b.refund_status === 'pending');
  const issuedRefunds  = bookings.filter(b => b.refund_status === 'issued');

  return (
    <div style={{ padding: 28 }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 24, background: '#0F172A', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: 14, zIndex: 2000 }}>
          {toast}
        </div>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Refund Management</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>
        Cancellation refund policy: &gt;48h = 100% · 24–48h = 50% · &lt;24h = 0%
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Pending Refunds', value: pendingRefunds.length, color: '#DC2626', bg: '#FEF2F2' },
          { label: 'Refunds Issued',  value: issuedRefunds.length,  color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Total Cancelled', value: bookings.length,       color: '#3B82F6', bg: '#EFF6FF' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 10, padding: '18px 22px', border: `1px solid ${s.color}30` }}>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pending Refunds */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Pending Refunds</h2>
      {loading ? (
        <div style={{ color: '#94A3B8', padding: 32, textAlign: 'center' }}>Loading...</div>
      ) : pendingRefunds.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 10, padding: 40, textAlign: 'center', color: '#94A3B8', border: '1px solid #E2E8F0', marginBottom: 24 }}>
          No pending refunds
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 28 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
                {['Client', 'Therapist', 'Session Date', 'Amount Paid', 'Refund Due', 'Method', 'Action'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#DC2626', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingRefunds.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #FEF2F2', background: i % 2 === 0 ? '#fff' : '#FFFBFB' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{b.client_name}</td>
                  <td style={{ padding: '12px 14px', color: '#334155' }}>{b.therapist_name}</td>
                  <td style={{ padding: '12px 14px', color: '#64748B' }}>{b.session_date}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>Ksh {b.amount?.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: '#FEF2F2', color: '#DC2626', fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>
                      Ksh {b.refund_amount?.toLocaleString() || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#64748B', textTransform: 'capitalize' }}>{b.payment_method}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => { setModal(b); setRefundAmount(b.refund_amount || ''); }}
                      style={{ padding: '7px 14px', borderRadius: 7, background: '#DC2626', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Issue Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Issued Refunds */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Issued Refunds</h2>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F0FDF4', borderBottom: '1px solid #BBF7D0' }}>
              {['Client', 'Therapist', 'Session Date', 'Amount Paid', 'Refunded', 'Method'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#16A34A', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {issuedRefunds.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>No issued refunds</td></tr>
            ) : issuedRefunds.map((b, i) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #F0FDF4', background: i % 2 === 0 ? '#fff' : '#FAFFF9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{b.client_name}</td>
                <td style={{ padding: '12px 14px', color: '#334155' }}>{b.therapist_name}</td>
                <td style={{ padding: '12px 14px', color: '#64748B' }}>{b.session_date}</td>
                <td style={{ padding: '12px 14px', fontWeight: 700 }}>Ksh {b.amount?.toLocaleString()}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: '#DCFCE7', color: '#16A34A', fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>
                    ✓ Ksh {b.refund_amount?.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: '#64748B', textTransform: 'capitalize' }}>{b.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refund Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 400 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Issue Refund</h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
              {modal.client_name} · Session on {modal.session_date}
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Refund Amount (Ksh)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }}
                placeholder={`Max: ${modal.amount}`}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', resize: 'vertical' }}
                placeholder="Reason for refund..."
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleIssueRefund} disabled={saving || !refundAmount} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#DC2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Processing...' : 'Issue Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
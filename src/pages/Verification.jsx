import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../api';

const DEMO = {
  pending: [{
    id: '10000000-0000-0000-0000-000000000004',
    full_name: 'Dr. New Therapist', email: 'new.therapist@email.com', phone: '+1234567894',
    years_of_experience: 8, license_number: 'PSY-12345', education: 'Ph.D. Clinical Psychology',
    created_at: '2025-12-08',
    documents: [
      { id: '1', type: 'professional_license', url: '#' },
      { id: '2', type: 'degree_certificate', url: '#' },
      { id: '3', type: 'id_verification', url: '#' },
      { id: '4', type: 'liability_insurance', url: '#' },
    ]
  }],
  recently_verified: [
    { id: '1', full_name: 'Dr. Sarah Johnson', email: 'sarah.j@therapist.com', phone: '+1234567892', verified_at: '2025-08-20' },
    { id: '2', full_name: 'Michael Chen', email: 'michael.c@therapist.com', phone: '+1234567893', verified_at: '2025-09-10' },
  ],
  pending_count: 1, verified_count: 2, rejected_count: 3
};

const DOC_LABELS = { professional_license: 'Professional License', degree_certificate: 'Degree Certificate', id_verification: 'ID Verification', liability_insurance: 'Liability Insurance' };

export default function Verification() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState('');

  const load = () => {
    adminAPI.verification().then(r => setData(r.data)).catch(() => setData(DEMO)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, action) => {
    setActing(id + action);
    try {
      await adminAPI.verifyTherapist(id, action);
      setToast(action === 'approve' ? '✓ Therapist approved and verified!' : '✗ Application rejected.');
      setTimeout(() => setToast(''), 3000);
      load();
    } catch { setToast('Action failed. Please try again.'); }
    setActing(null);
  };

  const d = data || DEMO;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="top-bar">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Verification</h2>
        </div>
        <div className="page-content">
          {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.startsWith('✓') ? '#ECFDF5' : '#FEF2F2', color: toast.startsWith('✓') ? '#065F46' : '#991B1B', padding: '12px 20px', borderRadius: 8, boxShadow: 'var(--shadow)', zIndex: 999, fontWeight: 600, fontSize: 14 }}>{toast}</div>}

          <div className="section-title">Therapist Verification</div>
          <div className="section-sub">Review and approve therapist applications</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
            {[{ label: 'Pending Review', val: d.pending_count }, { label: 'Verified Therapists', val: d.verified_count }, { label: 'Rejected This Month', val: d.rejected_count }].map(({ label, val }) => (
              <div key={label} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{val}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
              </div>
            ))}
          </div>

          {d.pending_count > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>
              ⚠ <strong>Verification Required</strong> — {d.pending_count} therapist application awaiting your review
            </div>
          )}

          <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Pending Applications</h3>
          {loading ? <div className="spinner" /> : (d.pending || []).length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)', marginBottom: 24 }}>
              ✓ No pending applications
            </div>
          ) : (d.pending || []).map(t => (
            <div key={t.id} className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <div className="avatar" style={{ background: '#8B5CF6', width: 48, height: 48, borderRadius: 24, fontSize: 16 }}>
                  {t.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.full_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t.email}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t.phone}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Applied: {t.created_at ? new Date(t.created_at).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                </div>
              </div>

              <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Submitted Documents</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {(t.documents || []).map(doc => (
                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📄</span>
                      <span style={{ fontSize: 13 }}>{DOC_LABELS[doc.type] || doc.type}</span>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 13, fontWeight: 600 }}>👁 View</a>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '14px', background: 'var(--gray-50)', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                <div><span style={{ color: 'var(--gray-500)' }}>License Number: </span><strong>{t.license_number || 'N/A'}</strong></div>
                <div><span style={{ color: 'var(--gray-500)' }}>Years of Experience: </span><strong>{t.years_of_experience}</strong></div>
                <div><span style={{ color: 'var(--gray-500)' }}>Education: </span><strong>{t.education || 'N/A'}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button className="btn btn-approve" style={{ padding: '12px', justifyContent: 'center', background: '#16A34A', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
                  onClick={() => handleAction(t.id, 'approve')} disabled={acting === t.id + 'approve'}>
                  {acting === t.id + 'approve' ? 'Processing...' : '✓ Approve & Verify'}
                </button>
                <button style={{ padding: '12px', justifyContent: 'center', background: 'var(--red)', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                  onClick={() => handleAction(t.id, 'reject')} disabled={acting === t.id + 'reject'}>
                  {acting === t.id + 'reject' ? 'Processing...' : '✗ Reject Application'}
                </button>
              </div>
            </div>
          ))}

          <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Recently Verified</h3>
          <div className="card">
            <table>
              <thead>
                <tr><th>Therapist</th><th>Contact</th><th>Verified Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {(d.recently_verified || []).map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: '#10B981', width: 32, height: 32, borderRadius: 16, fontSize: 12 }}>
                          {t.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{t.full_name} ✓</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <div>{t.email}</div><div style={{ color: 'var(--gray-500)' }}>{t.phone}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{t.verified_at ? new Date(t.verified_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                    <td><span className="badge badge-active">✓ Verified</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

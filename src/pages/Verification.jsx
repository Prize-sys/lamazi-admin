import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

const TIER_COLORS = { gold: '#D97706', silver: '#64748B', bronze: '#92400E' };
const TIER_BG    = { gold: '#FEF3C7', silver: '#F1F5F9', bronze: '#FEF9EE' };
const DOC_LABELS = {
  professional_license: 'Professional License',
  degree_certificate:   'Degree Certificate',
  id_verification:      'ID Verification',
  policy_document:      'Policy Document',
  contract_document:    'Contract Document',
  liability_insurance:  'Liability Insurance',
};

export default function Verification() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tierModal, setTierModal] = useState(null);
  const [newTier, setNewTier] = useState('bronze');
  const [actionLoading, setActionLoading] = useState('');
  const [docNotes, setDocNotes] = useState({});

  const load = () => {
    setLoading(true);
    adminAPI.getPendingVerifications()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleVerify = async (id, action) => {
    setActionLoading(id + action);
    await adminAPI.verifyTherapist(id, action).catch(() => {});
    setActionLoading('');
    setSelected(null);
    load();
  };

  const handleDocVerify = async (docId, verified) => {
    await adminAPI.verifyDocument(docId, { verified, admin_note: docNotes[docId] || '' }).catch(() => {});
    load();
  };

  const handleTierSave = async () => {
    if (!tierModal) return;
    await adminAPI.updateTherapistTier(tierModal.id, newTier).catch(() => {});
    setTierModal(null);
    load();
  };

  const StatCard = ({ label, value, color }) => (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '18px 22px',
      border: '1px solid #E2E8F0', flex: 1,
    }}>
      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Therapist Verification</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Review therapist applications, documents, and assign membership tiers</p>

      {/* Stats */}
      {data && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          <StatCard label="Pending Review"  value={data.pending_count}  color="#D97706" />
          <StatCard label="Verified Active" value={data.verified_count} color="#16A34A" />
          <StatCard label="Rejected"        value={data.rejected_count} color="#DC2626" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>

        {/* Pending List */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Pending Applications ({data?.pending?.length || 0})
          </h2>
          {loading ? (
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: 40 }}>Loading...</div>
          ) : (data?.pending || []).length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 10, padding: 40, textAlign: 'center', color: '#94A3B8', border: '1px solid #E2E8F0' }}>
              No pending applications
            </div>
          ) : (data.pending || []).map(t => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              style={{
                background: selected?.id === t.id ? '#EFF6FF' : '#fff',
                border: `1px solid ${selected?.id === t.id ? '#3B82F6' : '#E2E8F0'}`,
                borderRadius: 10, padding: '16px 18px', marginBottom: 10,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{t.full_name}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{t.email}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                    {t.years_of_experience} yrs exp · {t.license_number}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: TIER_BG[t.membership_tier], color: TIER_COLORS[t.membership_tier],
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    textTransform: 'capitalize',
                  }}>
                    {t.membership_tier}
                  </span>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                    {t.documents?.length || 0} doc(s) · {t.documents?.filter(d => d.verified).length || 0} verified
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Recently Verified */}
          {(data?.recently_verified || []).length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Recently Verified</h2>
              {data.recently_verified.map(t => (
                <div key={t.id} style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{t.full_name}</div>
                    <div style={{ fontSize: 12, color: '#16A34A' }}>Verified {new Date(t.verified_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{ background: TIER_BG[t.membership_tier], color: TIER_COLORS[t.membership_tier], padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                    {t.membership_tier}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 22, height: 'fit-content', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>{selected.full_name}</h2>
                <div style={{ fontSize: 13, color: '#64748B' }}>{selected.email} · {selected.phone}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94A3B8' }}>×</button>
            </div>

            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[
                ['Education', selected.education],
                ['License #', selected.license_number],
                ['Experience', `${selected.years_of_experience} years`],
                ['Fee Paid', selected.membership_fee_paid ? '✅ Yes' : '❌ No'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{v || '—'}</div>
                </div>
              ))}
            </div>

            {/* Bio */}
            {selected.bio && (
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 12, marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Bio</div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.55 }}>{selected.bio}</div>
              </div>
            )}

            {/* Membership Tier */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 14px', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 3 }}>Membership Tier</div>
                  <span style={{ background: TIER_BG[selected.membership_tier], color: TIER_COLORS[selected.membership_tier], padding: '3px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'capitalize' }}>
                    {selected.membership_tier} — {selected.membership_tier === 'gold' ? '20%' : selected.membership_tier === 'silver' ? '15%' : '10%'} commission
                  </span>
                </div>
                <button
                  onClick={() => { setTierModal(selected); setNewTier(selected.membership_tier); }}
                  style={{ padding: '6px 14px', borderRadius: 6, background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Change Tier
                </button>
              </div>
            </div>

            {/* Documents */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                Documents ({selected.documents?.length || 0})
              </div>
              {(selected.documents || []).map(doc => (
                <div key={doc.id} style={{
                  border: `1px solid ${doc.verified ? '#BBF7D0' : '#E2E8F0'}`,
                  borderRadius: 8, padding: '12px 14px', marginBottom: 8,
                  background: doc.verified ? '#F0FDF4' : '#FAFAFA',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>
                        {DOC_LABELS[doc.type] || doc.type}
                      </div>
                      <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#3B82F6', marginTop: 2, display: 'block' }}>
                        📎 View Document
                      </a>
                    </div>
                    <span style={{
                      background: doc.verified ? '#DCFCE7' : '#FEF9C3',
                      color: doc.verified ? '#16A34A' : '#CA8A04',
                      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>
                      {doc.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  {!doc.verified && (
                    <>
                      <input
                        placeholder="Admin note (optional)"
                        value={docNotes[doc.id] || ''}
                        onChange={e => setDocNotes(n => ({ ...n, [doc.id]: e.target.value }))}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, marginBottom: 8, outline: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleDocVerify(doc.id, true)}
                          style={{ flex: 1, padding: '7px 0', borderRadius: 6, background: '#16A34A', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✓ Verify
                        </button>
                        <button
                          onClick={() => handleDocVerify(doc.id, false)}
                          style={{ flex: 1, padding: '7px 0', borderRadius: 6, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </>
                  )}
                  {doc.verified && doc.admin_note && (
                    <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>Note: {doc.admin_note}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Approve / Reject buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleVerify(selected.id, 'approve')}
                disabled={actionLoading === selected.id + 'approve'}
                style={{ flex: 1, padding: '11px 0', borderRadius: 8, background: '#16A34A', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                {actionLoading === selected.id + 'approve' ? 'Approving...' : '✓ Approve Therapist'}
              </button>
              <button
                onClick={() => handleVerify(selected.id, 'reject')}
                disabled={actionLoading === selected.id + 'reject'}
                style={{ flex: 1, padding: '11px 0', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                {actionLoading === selected.id + 'reject' ? 'Rejecting...' : '✕ Reject'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tier Modal */}
      {tierModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 380 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Change Membership Tier</h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>{tierModal.full_name}</p>
            {['bronze', 'silver', 'gold'].map(tier => (
              <button
                key={tier}
                onClick={() => setNewTier(tier)}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', marginBottom: 8, borderRadius: 8,
                  border: `2px solid ${newTier === tier ? TIER_COLORS[tier] : '#E2E8F0'}`,
                  background: newTier === tier ? TIER_BG[tier] : '#fff',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontWeight: 700, textTransform: 'capitalize', color: TIER_COLORS[tier] }}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
                <span style={{ fontSize: 13, color: '#64748B' }}>
                  {tier === 'gold' ? '20%' : tier === 'silver' ? '15%' : '10%'} commission
                </span>
              </button>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setTierModal(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleTierSave} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#3B82F6', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Save Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
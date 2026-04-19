import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../api';

const DEMO_LOGS = [
  { id: '1', action: 'therapist_approve', entity_type: 'therapist', admin_name: 'Admin User', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 300000) },
  { id: '2', action: 'payout_approved', entity_type: 'payout', admin_name: 'Admin User', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 3600000) },
  { id: '3', action: 'user_suspended', entity_type: 'user', admin_name: 'Admin User', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 7200000) },
  { id: '4', action: 'therapist_reject', entity_type: 'therapist', admin_name: 'Admin User', ip_address: '192.168.1.2', created_at: new Date(Date.now() - 86400000) },
];

const ACTION_COLOR = {
  therapist_approve: '#10B981', therapist_reject: '#EF4444', payout_approved: '#2563EB',
  payout_completed: '#10B981', user_suspended: '#D97706', default: '#8B5CF6'
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff/60000) + ' min ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + ' hours ago';
  return Math.floor(diff/86400000) + ' days ago';
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.auditLogs().then(r => setLogs(r.data.logs || [])).catch(() => setLogs(DEMO_LOGS)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="top-bar">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Audit Logs</h2>
          <button className="btn btn-outline" style={{ fontSize: 12 }}>⬇ Export</button>
        </div>
        <div className="page-content">
          <div className="section-title">Audit Logs</div>
          <div className="section-sub">Track all administrative actions on the platform</div>

          <div className="card">
            {loading ? <div className="spinner" /> : (
              <table>
                <thead>
                  <tr><th>Action</th><th>Entity</th><th>Admin</th><th>IP Address</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 4, background: ACTION_COLOR[log.action] || ACTION_COLOR.default, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontFamily: 'monospace', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>{log.action}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-client" style={{ fontSize: 11 }}>{log.entity_type}</span></td>
                      <td style={{ fontSize: 13 }}>{log.admin_name || 'System'}</td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray-500)' }}>{log.ip_address || 'N/A'}</td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{timeAgo(log.created_at)}</td>
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

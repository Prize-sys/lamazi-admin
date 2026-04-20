import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>Lamazi Admin</div>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Platform Management Dashboard</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: 12, background: 'var(--primary-light)', borderRadius: 8 }}>
            <span style={{ fontSize: 20 }}>🔐</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary-dark)' }}>Admin Access Only</div>
              <div style={{ fontSize: 12, color: 'var(--primary)' }}>Restricted to authorized personnel</div>
            </div>
          </div>
          {error && <div className="alert alert-warning">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Admin Email</label>
              <input className="form-input" style={{ width: '100%' }} type="email" placeholder="admin@mindcare.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
              <input className="form-input" style={{ width: '100%' }} type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: 15, justifyContent: 'center' }}>
              {loading ? 'Signing in...' : '→ Sign In to Dashboard'}
            </button>
          </form>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--gray-50)', borderRadius: 8, fontSize: 12, color: 'var(--gray-500)' }}>
            <strong>Demo:</strong> admin@lamazi.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
}

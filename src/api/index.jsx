import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('lamazi_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lamazi_admin_token');
      localStorage.removeItem('lamazi_admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const adminAuthAPI = {
  login: (data) => api.post('/auth/login', { ...data, role: 'admin' }),
};

export const adminAPI = {
  getDashboard:        ()         => api.get('/admin/dashboard'),
  getUsers:            (params)   => api.get('/admin/users', { params }),
  updateUserStatus:    (id, data) => api.put(`/admin/users/${id}/status`, data),
  updateTherapistStatus:(id,data) => api.put(`/admin/therapists/${id}/status`, data),
  // Membership tier
  updateTherapistTier: (id, tier) => api.put(`/admin/therapists/${id}/tier`, { tier }),
  // Verification
  getPendingVerifications: ()         => api.get('/admin/verification'),
  verifyTherapist:         (id, action) => api.put(`/admin/verification/${id}/${action}`),
  // Document verification
  verifyDocument:      (docId, data) => api.put(`/admin/documents/${docId}/verify`, data),
  // Bookings
  getBookings:         (params)   => api.get('/admin/bookings', { params }),
  // Payouts
  getPayouts:          ()         => api.get('/admin/payouts'),
  updatePayout:        (id, data) => api.put(`/admin/payouts/${id}`, data),
  // Refunds
  issueRefund:         (paymentId, data) => api.post(`/admin/refunds/${paymentId}`, data),
  // Analytics & audit
  getAnalytics:        ()         => api.get('/admin/analytics'),
  getAuditLogs:        ()         => api.get('/admin/audit-logs'),
};

export default api;
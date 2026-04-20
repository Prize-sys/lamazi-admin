import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mc_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) { localStorage.removeItem('mc_admin_token'); window.location.href = '/login'; }
  return Promise.reject(err);
});

export const adminAPI = {
  login: (data) => api.post('/auth/login', { ...data, role: 'admin' }),
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  updateTherapistStatus: (id, status) => api.put(`/admin/therapists/${id}/status`, { status }),
  verification: () => api.get('/admin/verification'),
  verifyTherapist: (id, action) => api.put(`/admin/verification/${id}/${action}`),
  payouts: () => api.get('/admin/payouts'),
  updatePayout: (id, data) => api.put(`/admin/payouts/${id}`, data),
  analytics: () => api.get('/admin/analytics'),
  auditLogs: () => api.get('/admin/audit-logs'),
  bookings: () => api.get('/admin/bookings'),
};

export default api;

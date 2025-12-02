// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Report API calls
export const reportAPI = {
  createReport: (data) => api.post('/reports', data),
  getAllReports: (params) => api.get('/reports', { params }),
  getSingleReport: (id) => api.get(`/reports/${id}`),
  getReportById: (id) => api.get(`/reports/${id}`),
  updateReport: (id, data) => api.put(`/reports/${id}`, data),
  addComment: (id, data) => api.post(`/reports/${id}/comments`, data),
};

export default api;
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
  deleteReport: (id) => api.delete(`/reports/${id}`),
  addComment: (id, data) => api.post(`/reports/${id}/comments`, data),
  upvoteReport: (id) => api.post(`/reports/${id}/upvote`),
  downvoteReport: (id) => api.post(`/reports/${id}/downvote`),
};

// Upload API calls
export const uploadAPI = {
  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (filename) => api.delete(`/upload/${filename}`),
};

// Emergency Contacts API calls
export const emergencyContactsAPI = {
  getAllContacts: (params) => api.get('/emergency-contacts', { params }),
  getContactsByType: (type, params) => api.get(`/emergency-contacts/type/${type}`, { params }),
  getContactTypes: () => api.get('/emergency-contacts/types'),
  getContact: (id) => api.get(`/emergency-contacts/${id}`),
  // Custom contacts
  getCustomContacts: () => api.get('/emergency-contacts/custom/list'),
  createCustomContact: (data) => api.post('/emergency-contacts/custom', data),
  updateCustomContact: (id, data) => api.put(`/emergency-contacts/custom/${id}`, data),
  deleteCustomContact: (id) => api.delete(`/emergency-contacts/custom/${id}`),
};

// User Preferences API calls
export const userPreferencesAPI = {
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (data) => api.put('/user/preferences', { notificationSettings: data }),
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getAllReports: (params) => api.get('/admin/reports', { params }),
  verifyReport: (id) => api.put(`/admin/reports/${id}/verify`),
  rejectReport: (id, reason) => api.put(`/admin/reports/${id}/reject`, { reason }),
  sendMassAlert: (data) => api.post('/admin/alerts', data),
};

// Leaderboard API calls
export const leaderboardAPI = {
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
};

// Points API calls
export const pointsAPI = {
  getUserPoints: (id) => api.get(`/points/user/${id}`),
  awardPoints: (data) => api.post('/points/award', data),
};

// User Profile & Stats API calls
export const userAPI = {
  getProfile: (id) => api.get(`/user/${id}/profile`),
  getReports: (id) => api.get(`/user/${id}/reports`),
  updateProfile: (id, data) => api.put(`/user/${id}/profile`, data),
  getActivity: (id) => api.get(`/user/${id}/activity`),
};

export default api;
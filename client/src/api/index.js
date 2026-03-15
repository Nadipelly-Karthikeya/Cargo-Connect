import apiClient from './apiClient'

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  verifyEmail: (data) => apiClient.post('/auth/verify-email', data),
  resendVerification: (data) => apiClient.post('/auth/resend-verification', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
}

export const loadAPI = {
  createLoad: (data) => apiClient.post('/loads', data),
  uploadPayment: (id, formData) => apiClient.post(`/loads/${id}/payment`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAvailableLoads: (params) => apiClient.get('/loads/available', { params }),
  getMyAcceptedLoads: (params) => apiClient.get('/loads/lorry', { params }),
  acceptLoad: (id, data) => apiClient.post(`/loads/${id}/accept`, data),
  updateStatus: (id, data) => apiClient.put(`/loads/${id}/status`, data),
  uploadDeliveryProof: (id, formData) => apiClient.post(`/loads/${id}/delivery-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyLoads: (params) => apiClient.get('/loads/company', { params }),
  getCompanyLoads: (params) => apiClient.get('/loads/company', { params }),
  getLorryLoads: (params) => apiClient.get('/loads/lorry', { params }),
  getLoadById: (id) => apiClient.get(`/loads/${id}`),
  downloadInvoice: (id) => apiClient.get(`/loads/${id}/invoice`, {
    responseType: 'blob',
  }),
  updateLoad: (id, data) => apiClient.put(`/loads/${id}`, data),
  deleteLoad: (id, data) => apiClient.delete(`/loads/${id}`, { data }),
}

export const lorryAPI = {
  addLorry: (formData) => apiClient.post('/lorries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyLorries: () => apiClient.get('/lorries/my-lorries'),
  getLorryById: (id) => apiClient.get(`/lorries/${id}`),
  updateLorry: (id, data) => apiClient.put(`/lorries/${id}`, data),
  deleteLorry: (id) => apiClient.delete(`/lorries/${id}`),
  toggleAvailability: (id) => apiClient.put(`/lorries/${id}/availability`),
}

export const companyAPI = {
  getProfile: () => apiClient.get('/company/profile'),
  updateProfile: (data) => apiClient.put('/company/profile', data),
  getStats: () => apiClient.get('/company/stats'),
}

export const adminAPI = {
  getAllUsers: (params) => apiClient.get('/admin/users', { params }),
  toggleUserSuspension: (id) => apiClient.put(`/admin/users/${id}/suspend`),
  getAllLoads: (params) => apiClient.get('/admin/loads', { params }),
  approveLoad: (id, data) => apiClient.put(`/admin/loads/${id}/approve`, data),
  getAllLorries: (params) => apiClient.get('/admin/lorries', { params }),
  verifyLorry: (id, data) => apiClient.put(`/admin/lorries/${id}/verify`, data),
  getAllTransactions: (params) => apiClient.get('/admin/transactions', { params }),
  getAnalytics: () => apiClient.get('/admin/analytics'),
  removeRating: (id) => apiClient.delete(`/admin/ratings/${id}`),
}

export const ratingAPI = {
  createRating: (data) => apiClient.post('/ratings', data),
  getUserRatings: (userId, params) => apiClient.get(`/ratings/user/${userId}`, { params }),
  getMyRatings: () => apiClient.get('/ratings/my-ratings'),
  canRate: (loadId) => apiClient.get(`/ratings/can-rate/${loadId}`),
}

export const disputeAPI = {
  createDispute: (formData) => apiClient.post('/disputes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyDisputes: (params) => apiClient.get('/disputes/my-disputes', { params }),
  getAllDisputes: (params) => apiClient.get('/disputes/all/list', { params }),
  resolveDispute: (id, data) => apiClient.put(`/disputes/${id}/resolve`, data),
  getDisputeById: (id) => apiClient.get(`/disputes/${id}`),
}

export const notificationAPI = {
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
}

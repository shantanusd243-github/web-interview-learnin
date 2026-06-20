import apiClient from './client';

export const questionRequestsApi = {
  submit: (data) => apiClient.post('/question-requests', data).then((r) => r.data),
  myRequests: (params) => apiClient.get('/question-requests/my', { params }).then((r) => r.data),
};

export const adminQuestionRequestsApi = {
  queue: (params) => apiClient.get('/admin/question-requests', { params }).then((r) => r.data),
  approve: (id, data) => apiClient.put(`/admin/question-requests/${id}/approve`, data).then((r) => r.data),
  reject: (id, data) => apiClient.put(`/admin/question-requests/${id}/reject`, data).then((r) => r.data),
  edit: (id, data) => apiClient.put(`/admin/question-requests/${id}/edit`, data).then((r) => r.data),
};

export const adminAnalyticsApi = {
  dashboard: () => apiClient.get('/admin/analytics/dashboard').then((r) => r.data),
  questions: (params) => apiClient.get('/admin/analytics/questions', { params }).then((r) => r.data),
  requests: () => apiClient.get('/admin/analytics/requests').then((r) => r.data),
};

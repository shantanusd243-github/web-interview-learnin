import apiClient from './client';

export const questionsApi = {
  search: (params) => apiClient.get('/questions', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/questions/${id}`).then((r) => r.data),
  byTag: (tag) => apiClient.get(`/questions/tags/${encodeURIComponent(tag)}`).then((r) => r.data),
  byTopic: (topic) => apiClient.get(`/questions/topics/${encodeURIComponent(topic)}`).then((r) => r.data),
  byCompany: (company) => apiClient.get(`/questions/companies/${encodeURIComponent(company)}`).then((r) => r.data),
  create: (data) => apiClient.post('/questions', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/questions/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/questions/${id}`).then((r) => r.data),
};

export const topicsApi = {
  list: () => apiClient.get('/topics').then((r) => r.data),
  create: (data) => apiClient.post('/topics', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/topics/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/topics/${id}`).then((r) => r.data),
};

export const tagsApi = {
  list: () => apiClient.get('/tags').then((r) => r.data),
  create: (data) => apiClient.post('/tags', data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/tags/${id}`).then((r) => r.data),
};

export const companiesApi = {
  list: () => apiClient.get('/companies').then((r) => r.data),
  create: (data) => apiClient.post('/companies', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/companies/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/companies/${id}`).then((r) => r.data),
};

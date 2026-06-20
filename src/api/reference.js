import apiClient from './client';

export const referenceApi = {
  list: () => apiClient.get('/reference').then((r) => r.data),
  getByPageKey: (pageKey) => apiClient.get(`/reference/${pageKey}`).then((r) => r.data),
  create: (data) => apiClient.post('/reference', data).then((r) => r.data),
  update: (pageKey, data) => apiClient.put(`/reference/${pageKey}`, data).then((r) => r.data),
  remove: (pageKey) => apiClient.delete(`/reference/${pageKey}`).then((r) => r.data),
};

export const cheatSheetApi = {
  listGrouped: () => apiClient.get('/cheatsheet').then((r) => r.data),
  create: (data) => apiClient.post('/cheatsheet', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/cheatsheet/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/cheatsheet/${id}`).then((r) => r.data),
};

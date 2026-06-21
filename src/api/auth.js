import apiClient from './client';

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data).then((r) => r.data),

  login: (data) => apiClient.post('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),

  me: () => apiClient.get('/auth/me').then((r) => r.data),

  googleLogin: async (idToken) => {
    const response = await apiClient.post('/auth/google', { idToken });
    return response.data;
  },

  forgotPassword: async (email) => {
    // Fixed: using apiClient instead of client
    const response = await apiClient.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  resetPassword: async (payload) => {
    // payload should be { token: '...', newPassword: '...' }
    // Fixed: using apiClient instead of client
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },
};
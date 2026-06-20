import apiClient from './client';

export const bookmarksApi = {
  list: () => apiClient.get('/bookmarks').then((r) => r.data),
  add: (questionId) => apiClient.post(`/bookmarks/${questionId}`).then((r) => r.data),
  remove: (questionId) => apiClient.delete(`/bookmarks/${questionId}`).then((r) => r.data),
};

export const progressApi = {
  list: () => apiClient.get('/progress').then((r) => r.data),
  update: (questionId, status) => apiClient.post(`/progress/${questionId}`, { status }).then((r) => r.data),
};

export const mockInterviewApi = {
  next: () => apiClient.get('/mock-interview/next').then((r) => r.data),
  mark: (data) => apiClient.post('/mock-interview/mark', data).then((r) => r.data),
  history: () => apiClient.get('/mock-interview/history').then((r) => r.data),
};

// --- REMOVED /api FROM ALL ENDPOINTS BELOW ---

export const saveHighlight = async (targetId, highlightedText, contextIdentifier) => {
    const response = await apiClient.post('/highlights', {
        targetId,
        highlightedText,
        contextIdentifier
    });
    return response.data;
};

export const getHighlights = async (targetId) => {
    const response = await apiClient.get(`/highlights/${targetId}`);
    return response.data;
};

export const deleteHighlight = async (id) => {
    await apiClient.delete(`/highlights/${id}`);
};

export const getNote = async (targetId) => {
    try {
        const response = await apiClient.get(`/notes/${targetId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null; // No note exists yet
        }
        throw error;
    }
};

export const saveNote = async (targetId, noteText) => {
    const response = await apiClient.post(`/notes/${targetId}`, { noteText });
    return response.data;
};

export const deleteNote = async (targetId) => {
    await apiClient.delete(`/notes/${targetId}`);
};

export const getDashboardSummary = async () => {
    const response = await apiClient.get('/progress/summary');
    return response.data;
};
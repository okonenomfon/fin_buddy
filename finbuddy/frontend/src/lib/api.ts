import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

export const transactionAPI = {
  parseSMS: (smsText: string) =>
    api.post('/api/transactions/parse-sms', { smsText }),
  getAll: (params?: any) => api.get('/api/transactions', { params }),
  getStats: (period?: string) =>
    api.get('/api/transactions/stats', { params: { period } }),
  delete: (id: number) => api.delete(`/api/transactions/${id}`),
};

export const insightsAPI = {
  get: () => api.get('/api/insights'),
  getSavingsSuggestions: () => api.get('/api/insights/savings-suggestions'),
};

export const chatAPI = {
  send: (message: string) => api.post('/api/chat', { message }),
  getHistory: (limit?: number) =>
    api.get('/api/chat/history', { params: { limit } }),
  clearHistory: () => api.delete('/api/chat/history'),
};

export const goalsAPI = {
  getAll: () => api.get('/api/goals'),
  create: (data: { title: string; target_amount: number; deadline?: string }) =>
    api.post('/api/goals', data),
  update: (id: number, data: { current_amount?: number; status?: string }) =>
    api.patch(`/api/goals/${id}`, data),
  delete: (id: number) => api.delete(`/api/goals/${id}`),
};

export const achievementsAPI = {
  getAll: () => api.get('/api/achievements'),
};

export const preferencesAPI = {
  get: () => api.get('/api/preferences'),
  update: (data: any) => api.patch('/api/preferences', data),
};

export const utilityAPI = {
  getCategories: () => api.get('/api/categories'),
};

export default api;

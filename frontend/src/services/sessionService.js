import api from './api';

export const sessionService = {
  getActiveSession: () => api.get('/sessions/active'),
  startSession: (data) => api.post('/sessions/start', data),
  heartbeat: (id, data) => api.patch(`/sessions/${id}/heartbeat`, data),
  completeSession: (id, data) => api.post(`/sessions/${id}/complete`, data),
  abandonSession: (id) => api.post(`/sessions/${id}/abandon`),
  getHistory: (limit = 20) => api.get('/sessions/history', { params: { limit } }),
};


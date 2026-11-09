import api from './api';

export const revisionService = {
  getRevisions: (params) => api.get('/revisions', { params }),
  getDueQueue: () => api.get('/revisions/due'),
  getUpcoming: (days = 14) => api.get('/revisions/upcoming', { params: { days } }),
  getAnalytics: () => api.get('/revisions/analytics'),
  createRevisionItem: (data) => api.post('/revisions', data),
  getRevisionItem: (id) => api.get(`/revisions/${id}`),
  reviewItem: (id, data) => api.post(`/revisions/${id}/review`, data),
  deleteRevisionItem: (id) => api.delete(`/revisions/${id}`),
};


import api from './api';

export const problemService = {
  getProblems: (params) => api.get('/problems', { params }),
  getAnalytics: () => api.get('/problems/analytics'),
  getProblem: (id) => api.get(`/problems/${id}`),
  createProblem: (data) => api.post('/problems', data),
  updateProblem: (id, data) => api.put(`/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/problems/${id}`),
};


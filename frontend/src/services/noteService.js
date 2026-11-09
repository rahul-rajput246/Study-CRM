import api from './api';

export const noteService = {
  getNotes: (params) => api.get('/notes', { params }),
  createNote: (data) => api.post('/notes', data),
  getNote: (id) => api.get(`/notes/${id}`),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};


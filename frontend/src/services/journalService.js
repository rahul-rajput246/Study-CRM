import api from './api';

export const journalService = {
  getTodayJournal: () => api.get('/journals/today'),
  getJournalByDate: (date) => api.get(`/journals/${date}`),
  saveJournal: (data) => api.post('/journals', data),
  getHistory: (params) => api.get('/journals/history', { params }),
};


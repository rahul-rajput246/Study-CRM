import api from './api';

export const reportService = {
  getComprehensiveReport: (period = 'last_30_days') =>
    api.get('/reports/comprehensive', { params: { period } }),
};


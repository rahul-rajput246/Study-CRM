import api from './api';

export const scheduleService = {
  getSchedules: (params) => api.get('/schedules', { params }),
  getCalendarView: (view, date) => api.get(`/schedules/calendar/${view}`, { params: { date } }),
  getOverdueSchedules: () => api.get('/schedules/calendar/overdue'),
  createSchedule: (data) => api.post('/schedules', data),
  updateSchedule: (id, data) => api.put(`/schedules/${id}`, data),
  updateStatus: (id, status, notes = null) => api.patch(`/dashboard/schedules/${id}/status`, { status, notes }),
  reschedule: (id, data) => api.patch(`/schedules/${id}/reschedule`, data),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`),
  checkConflicts: (data) => api.post('/schedules/check-conflicts', data),
};

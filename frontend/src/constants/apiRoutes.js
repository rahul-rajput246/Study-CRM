/**
 * StudyOS - Central API Routes Map
 * Keeping endpoints centralized prevents magic strings across components.
 */
export const API_ROUTES = {
  HEALTH: '/health',
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    TODAY_SCHEDULE: '/dashboard/today-schedule',
  },
  ROADMAPS: {
    BASE: '/roadmaps',
    TOPICS: '/topics',
    SUBTOPICS: '/subtopics',
  },
  SCHEDULES: {
    BASE: '/schedules',
    CONFLICTS: '/schedules/check-conflicts',
    RESCHEDULE: (id) => `/schedules/${id}/reschedule`,
  },
  SESSIONS: {
    START: '/sessions/start',
    PAUSE: (id) => `/sessions/${id}/pause`,
    RESUME: (id) => `/sessions/${id}/resume`,
    COMPLETE: (id) => `/sessions/${id}/complete`,
    ABANDON: (id) => `/sessions/${id}/abandon`,
  },
  REVISIONS: {
    DUE: '/revisions/due',
    UPCOMING: '/revisions/upcoming',
    REVIEW: '/revisions/review',
    ENROLL: '/revisions/enroll',
  },
  PROBLEMS: {
    BASE: '/problems',
    ANALYTICS: '/problems/analytics',
  },
  NOTES: {
    BASE: '/notes',
  },
  JOURNALS: {
    BASE: '/journals',
    BY_DATE: (date) => `/journals/${date}`,
  },
  REPORTS: {
    WEEKLY: '/reports/weekly',
    MONTHLY: '/reports/monthly',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    PUSH_SUBSCRIBE: '/notifications/push-subscribe',
  },
  SETTINGS: {
    BASE: '/settings',
    PROFILE: '/settings/profile',
    STUDY_PREFERENCES: '/settings/study-preferences',
    PASSWORD: '/settings/password',
    EXPORT: '/settings/export',
  },
};


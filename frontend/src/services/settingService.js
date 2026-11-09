import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const settingService = {
  /**
   * Fetch complete settings overview, profile, and stats
   */
  async getSettings() {
    const res = await api.get(API_ROUTES.SETTINGS.BASE);
    return res.data;
  },

  /**
   * Update profile settings
   */
  async updateProfile(profileData) {
    const res = await api.put(API_ROUTES.SETTINGS.PROFILE, profileData);
    return res.data;
  },

  /**
   * Update study timer and SM-2 preferences
   */
  async updateStudyPreferences(preferences) {
    const res = await api.put(API_ROUTES.SETTINGS.STUDY_PREFERENCES, preferences);
    return res.data;
  },

  /**
   * Change account password
   */
  async updatePassword(passwordData) {
    const res = await api.put(API_ROUTES.SETTINGS.PASSWORD, passwordData);
    return res.data;
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(notifData) {
    const res = await api.put(API_ROUTES.NOTIFICATIONS.PREFERENCES, notifData);
    return res.data;
  },

  /**
   * Trigger full JSON data export and trigger browser download
   */
  async downloadExport() {
    const res = await api.get(API_ROUTES.SETTINGS.EXPORT);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `studyos_portfolio_export_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return res.data;
  },
};

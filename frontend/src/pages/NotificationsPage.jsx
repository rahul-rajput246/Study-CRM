import React, { useState, useEffect } from 'react';
import {
  FaBell,
  FaClock,
  FaExclamationTriangle,
  FaSyncAlt,
  FaTrophy,
  FaCheckDouble,
  FaTrash,
  FaDesktop,
  FaVolumeUp,
  FaCheckCircle,
  FaTimesCircle,
  FaSave,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationsPage({ onNavigateTab }) {
  const {
    unreadCount,
    notifications,
    preferences,
    loading,
    browserPermission,
    requestBrowserPermission,
    triggerBrowserNotification,
    playChime,
    fetchNotifications,
    syncAlerts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
    updatePreferences,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');
  const [prefForm, setPrefForm] = useState({
    in_app_enabled: true,
    browser_enabled: true,
    lead_time_minutes: 15,
    notify_upcoming_sessions: true,
    notify_overdue_tasks: true,
    notify_revision_due: true,
    sound_enabled: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSaveSuccess, setPrefSaveSuccess] = useState(false);

  useEffect(() => {
    if (preferences) {
      setPrefForm({
        in_app_enabled: preferences.in_app_enabled ?? true,
        browser_enabled: preferences.browser_enabled ?? true,
        lead_time_minutes: preferences.lead_time_minutes ?? 15,
        notify_upcoming_sessions: preferences.notify_upcoming_sessions ?? true,
        notify_overdue_tasks: preferences.notify_overdue_tasks ?? true,
        notify_revision_due: preferences.notify_revision_due ?? true,
        sound_enabled: preferences.sound_enabled ?? true,
      });
    }
  }, [preferences]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    fetchNotifications(filter);
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefSaveSuccess(false);
    try {
      await updatePreferences(prefForm);
      setPrefSaveSuccess(true);
      setTimeout(() => setPrefSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleTestNotification = () => {
    if (prefForm.sound_enabled) {
      playChime();
    }
    triggerBrowserNotification(
      'StudyOS: Focus Reminder Test',
      'Your workstation alert system is active! Target: Senior Full-Stack Engineer (₹40 LPA+).'
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session_reminder':
        return <FaClock className="text-info fs-5" />;
      case 'overdue_alert':
        return <FaExclamationTriangle className="text-warning fs-5" />;
      case 'revision_due':
        return <FaSyncAlt className="text-primary fs-5" />;
      case 'goal_progress':
        return <FaTrophy className="text-success fs-5" />;
      default:
        return <FaBell className="text-secondary fs-5" />;
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary px-2 py-1 small fw-semibold">Phase 6</span>
            <span className="theme-text-sub small fw-medium">Notification & Reminder Center</span>
          </div>
          <h2 className="theme-text-main fw-bold mb-1">Notifications & Study Reminders</h2>
          <p className="theme-text-sub small mb-0">
            Real-time study session alerts, spaced repetition triggers, and desktop notifications.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
            onClick={syncAlerts}
            title="Scan for new study alerts"
          >
            <FaSyncAlt size={12} /> Sync Alerts
          </button>
          {unreadCount > 0 && (
            <button
              className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
              onClick={markAllAsRead}
            >
              <FaCheckDouble size={12} /> Mark All Read
            </button>
          )}
          <button
            className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
            onClick={clearRead}
            title="Remove all read notifications"
          >
            <FaTrash size={12} /> Clear Read
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Notification Feed */}
        <div className="col-12 col-lg-8">
          {/* Category Filter Pills */}
          <div className="card border-0 mb-3 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="card-body p-2 d-flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${
                  activeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${
                  activeFilter === 'unread' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => handleFilterChange('unread')}
              >
                Unread ({unreadCount})
              </button>
              <button
                className={`btn btn-sm ${
                  activeFilter === 'session_reminder' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => handleFilterChange('session_reminder')}
              >
                Upcoming Sessions
              </button>
              <button
                className={`btn btn-sm ${
                  activeFilter === 'overdue_alert' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => handleFilterChange('overdue_alert')}
              >
                Overdue Alerts
              </button>
              <button
                className={`btn btn-sm ${
                  activeFilter === 'revision_due' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => handleFilterChange('revision_due')}
              >
                Revision Due
              </button>
            </div>
          </div>

          {/* Feed List */}
          {loading ? (
            <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
              <div className="spinner-border text-primary mx-auto mb-3" role="status" />
              <p className="theme-text-sub mb-0">Synchronizing notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mx-auto mb-3"
                style={{ backgroundColor: 'var(--hover-bg)', width: '70px', height: '70px' }}
              >
                <FaBell size={28} className="text-muted" />
              </div>
              <h5 className="theme-text-main fw-bold">No Notifications in this Category</h5>
              <p className="theme-text-sub small mb-0" style={{ maxWidth: '420px', margin: '0 auto' }}>
                Your workstation is clean and all study alerts are addressed.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`card shadow-sm border transition-all ${
                    !item.is_read ? 'border-primary border-2' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '12px',
                  }}
                >
                  <div className="card-body p-3 p-md-4 d-flex gap-3 align-items-start">
                    {/* Icon */}
                    <div
                      className="rounded-circle p-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: 'var(--hover-bg)', width: '48px', height: '48px' }}
                    >
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <h6 className="theme-text-main fw-bold mb-0">{item.title}</h6>
                          {!item.is_read && (
                            <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>

                      <p className="theme-text-sub small mb-3">{item.message}</p>

                      {/* Action Bar */}
                      <div className="d-flex align-items-center justify-content-between pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="d-flex gap-2">
                          {item.action_tab && (
                            <button
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              onClick={() => {
                                if (!item.is_read) markAsRead(item.id);
                                if (onNavigateTab) onNavigateTab(item.action_tab);
                              }}
                            >
                              Go to {item.action_tab.charAt(0).toUpperCase() + item.action_tab.slice(1)} <FaExternalLinkAlt size={10} />
                            </button>
                          )}
                          {!item.is_read && (
                            <button
                              className="btn btn-sm btn-link text-decoration-none text-muted"
                              onClick={() => markAsRead(item.id)}
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>

                        <button
                          className="btn btn-sm btn-link p-0 text-danger"
                          title="Delete"
                          onClick={() => deleteNotification(item.id)}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Browser Push & Notification Preferences */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          {/* Browser Desktop Notification Card */}
          <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaDesktop className="text-primary fs-5" />
                <h6 className="theme-text-main fw-bold mb-0">Browser Desktop Push</h6>
              </div>
              <p className="theme-text-sub small mb-3">
                Receive native desktop alerts before study sessions begin, even when working in another tab or VS Code.
              </p>

              <div className="d-flex align-items-center justify-content-between p-3 rounded mb-3" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="small theme-text-main fw-semibold">Permission Status:</span>
                {browserPermission === 'granted' ? (
                  <span className="badge bg-success d-inline-flex align-items-center gap-1">
                    <FaCheckCircle /> Allowed
                  </span>
                ) : browserPermission === 'denied' ? (
                  <span className="badge bg-danger d-inline-flex align-items-center gap-1">
                    <FaTimesCircle /> Blocked
                  </span>
                ) : (
                  <span className="badge bg-warning text-dark">Default</span>
                )}
              </div>

              {browserPermission !== 'granted' ? (
                <button
                  className="btn btn-primary w-100 fw-semibold mb-2"
                  onClick={requestBrowserPermission}
                >
                  Enable Desktop Alerts
                </button>
              ) : (
                <button
                  className="btn btn-outline-secondary w-100 fw-semibold mb-2 d-inline-flex align-items-center justify-content-center gap-2"
                  onClick={handleTestNotification}
                >
                  <FaVolumeUp /> Send Test Notification
                </button>
              )}
            </div>
          </div>

          {/* Granular Notification Settings Card */}
          <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
            <div className="card-body p-4">
              <h6 className="theme-text-main fw-bold mb-3 d-flex align-items-center gap-2">
                <FaBell className="text-warning" /> Alert Preferences
              </h6>

              {prefSaveSuccess && (
                <div className="alert alert-success py-2 small mb-3 d-flex align-items-center gap-2">
                  <FaCheckCircle /> Preferences saved successfully.
                </div>
              )}

              <form onSubmit={handleSavePreferences} className="d-flex flex-column gap-3">
                {/* In-App Alerts */}
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="prefInApp"
                    checked={prefForm.in_app_enabled}
                    onChange={(e) => setPrefForm({ ...prefForm, in_app_enabled: e.target.checked })}
                  />
                  <label className="form-check-label small fw-semibold theme-text-main" htmlFor="prefInApp">
                    In-App Notification Feed
                  </label>
                </div>

                {/* Session Reminders */}
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="prefSession"
                    checked={prefForm.notify_upcoming_sessions}
                    onChange={(e) => setPrefForm({ ...prefForm, notify_upcoming_sessions: e.target.checked })}
                  />
                  <label className="form-check-label small fw-semibold theme-text-main" htmlFor="prefSession">
                    Study Session Reminders
                  </label>
                </div>

                {/* Lead Time Dropdown */}
                <div>
                  <label className="form-label small theme-text-sub fw-semibold">
                    Reminder Lead Time
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={prefForm.lead_time_minutes}
                    onChange={(e) => setPrefForm({ ...prefForm, lead_time_minutes: parseInt(e.target.value) })}
                  >
                    <option value={5}>5 minutes before start</option>
                    <option value={10}>10 minutes before start</option>
                    <option value={15}>15 minutes before start (Recommended)</option>
                    <option value={30}>30 minutes before start</option>
                  </select>
                </div>

                {/* Overdue Tasks */}
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="prefOverdue"
                    checked={prefForm.notify_overdue_tasks}
                    onChange={(e) => setPrefForm({ ...prefForm, notify_overdue_tasks: e.target.checked })}
                  />
                  <label className="form-check-label small fw-semibold theme-text-main" htmlFor="prefOverdue">
                    Overdue Task Backlog Alerts
                  </label>
                </div>

                {/* Revision Due */}
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="prefRevision"
                    checked={prefForm.notify_revision_due}
                    onChange={(e) => setPrefForm({ ...prefForm, notify_revision_due: e.target.checked })}
                  />
                  <label className="form-check-label small fw-semibold theme-text-main" htmlFor="prefRevision">
                    Spaced Repetition Due Alerts
                  </label>
                </div>

                {/* Audio Chime */}
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="prefSound"
                    checked={prefForm.sound_enabled}
                    onChange={(e) => setPrefForm({ ...prefForm, sound_enabled: e.target.checked })}
                  />
                  <label className="form-check-label small fw-semibold theme-text-main" htmlFor="prefSound">
                    Notification Sound Chime
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="btn btn-primary btn-sm fw-semibold mt-2 d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <FaSave /> {savingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


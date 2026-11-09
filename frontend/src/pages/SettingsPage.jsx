import React, { useState, useEffect } from 'react';
import {
  FaCog,
  FaUserTie,
  FaStopwatch,
  FaBell,
  FaLock,
  FaDatabase,
  FaSave,
  FaCheckCircle,
  FaDownload,
  FaInfoCircle,
  FaVolumeUp,
  FaVolumeMute,
  FaBrain,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { settingService } from '../services/settingService';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile'); // profile | study | notifications | security | data
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    target_role: '',
    daily_goal_minutes: 240,
    timezone: 'Asia/Kolkata',
    bio: '',
  });

  // Study & Algorithm Preferences
  const [studyForm, setStudyForm] = useState({
    pomodoro_minutes: 25,
    short_break_minutes: 5,
    long_break_minutes: 15,
    sound_alerts: true,
    auto_start_breaks: false,
    sm2_default_ease: 2.50,
    sm2_daily_limit: 20,
  });

  // Notification Preferences
  const [notifForm, setNotifForm] = useState({
    in_app_study_reminder: true,
    in_app_daily_summary: true,
    in_app_streak_alert: true,
    browser_enabled: false,
    lead_time_minutes: 15,
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Workspace Stats
  const [workspaceStats, setWorkspaceStats] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await settingService.getSettings();
      const u = data.user || {};
      setProfileForm({
        name: u.name || '',
        target_role: u.target_role || 'Senior Full-Stack Developer (₹40 LPA+)',
        daily_goal_minutes: u.daily_goal_minutes || 240,
        timezone: u.timezone || 'Asia/Kolkata',
        bio: u.bio || '',
      });

      const cs = u.custom_settings || {};
      setStudyForm({
        pomodoro_minutes: cs.pomodoro_minutes || 25,
        short_break_minutes: cs.short_break_minutes || 5,
        long_break_minutes: cs.long_break_minutes || 15,
        sound_alerts: cs.sound_alerts !== undefined ? cs.sound_alerts : true,
        auto_start_breaks: !!cs.auto_start_breaks,
        sm2_default_ease: cs.sm2_default_ease || 2.50,
        sm2_daily_limit: cs.sm2_daily_limit || 20,
      });

      const np = data.notification_preferences || {};
      setNotifForm({
        in_app_study_reminder: !!np.in_app_study_reminder,
        in_app_daily_summary: !!np.in_app_daily_summary,
        in_app_streak_alert: !!np.in_app_streak_alert,
        browser_enabled: !!np.browser_enabled,
        lead_time_minutes: np.lead_time_minutes || 15,
      });

      setWorkspaceStats(data.workspace_stats || null);
      setSystemInfo(data.system || null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load user settings.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await settingService.updateProfile(profileForm);
      if (res.user && updateUser) {
        updateUser(res.user);
      }
      showSuccess('Profile & career target successfully updated!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleStudySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      await settingService.updateStudyPreferences(studyForm);
      showSuccess('Focus timer & active recall algorithm settings saved!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update study preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotifSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      await settingService.updateNotificationPreferences(notifForm);
      showSuccess('Notification rules and reminder timings saved!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update notification preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      await settingService.updatePassword(passwordForm);
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      showSuccess('Account security password successfully changed!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      await settingService.downloadExport();
      showSuccess('StudyOS complete data backup downloaded to your PC!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to export portfolio data.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="theme-text-sub">Loading StudyOS settings...</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Header Hero Bar */}
      <div className="hero-card p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary">Configuration Center</span>
              <span className="theme-text-sub small fw-semibold">&bull; System Architecture</span>
            </div>
            <h2 className="fw-bold theme-text-main mb-1 d-flex align-items-center gap-2">
              <FaCog className="text-primary" />
              Settings & Preferences
            </h2>
            <p className="theme-text-sub mb-0 small">
              Customize your career target, daily discipline quota, SuperMemo SM-2 algorithm, and workspace data.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              title="Toggle Theme"
            >
              <span>Theme:</span>
              <strong className="text-capitalize">{theme}</strong>
            </button>
            <button
              onClick={handleExportData}
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
              title="Download JSON Backup"
            >
              <FaDownload />
              <span>Export Portfolio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global Feedback Alerts */}
      {statusMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-3 shadow-sm" role="alert">
          <FaCheckCircle className="fs-5 flex-shrink-0" />
          <span className="fw-semibold">{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-3 shadow-sm" role="alert">
          <FaExclamationTriangle className="fs-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Settings Navigation Tabs */}
      <div className="card">
        <div className="card-header border-bottom p-2">
          <ul className="nav nav-pills flex-nowrap overflow-x-auto gap-2">
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('profile')}
                className={`nav-link d-flex align-items-center gap-2 px-3 py-2 ${
                  activeTab === 'profile' ? 'active shadow-sm' : 'theme-text-sub'
                }`}
              >
                <FaUserTie />
                <span className="fw-semibold small">Profile & Career</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('study')}
                className={`nav-link d-flex align-items-center gap-2 px-3 py-2 ${
                  activeTab === 'study' ? 'active shadow-sm' : 'theme-text-sub'
                }`}
              >
                <FaStopwatch />
                <span className="fw-semibold small">Timer & Algorithm</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`nav-link d-flex align-items-center gap-2 px-3 py-2 ${
                  activeTab === 'notifications' ? 'active shadow-sm' : 'theme-text-sub'
                }`}
              >
                <FaBell />
                <span className="fw-semibold small">Notifications</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('security')}
                className={`nav-link d-flex align-items-center gap-2 px-3 py-2 ${
                  activeTab === 'security' ? 'active shadow-sm' : 'theme-text-sub'
                }`}
              >
                <FaLock />
                <span className="fw-semibold small">Account Security</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('data')}
                className={`nav-link d-flex align-items-center gap-2 px-3 py-2 ${
                  activeTab === 'data' ? 'active shadow-sm' : 'theme-text-sub'
                }`}
              >
                <FaDatabase />
                <span className="fw-semibold small">Data & Portfolio</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">
          {/* TAB 1: Profile & Career Targets */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                  <h5 className="fw-bold theme-text-main mb-1">Career & Engineering Identity</h5>
                  <p className="theme-text-sub small mb-0">
                    Define the north-star engineering target and daily discipline budget.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                >
                  <FaSave />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold theme-text-main">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                  <div className="form-text theme-text-sub small">Displayed across greetings, topbar, and study reports.</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold theme-text-main">Email Address (Account ID)</label>
                  <input type="email" className="form-control opacity-75" value={user?.email || ''} disabled />
                  <div className="form-text theme-text-sub small">Primary login credential for StudyOS API.</div>
                </div>

                <div className="col-md-8">
                  <label className="form-label small fw-bold theme-text-main">Career Target Designation</label>
                  <input
                    type="text"
                    className="form-control font-monospace fw-semibold"
                    value={profileForm.target_role}
                    onChange={(e) => setProfileForm({ ...profileForm, target_role: e.target.value })}
                    placeholder="e.g. Senior Full-Stack Developer (₹40 LPA+)"
                    required
                  />
                  <div className="form-text theme-text-sub small">
                    This benchmark governs your problem-solving independence ratio requirements and velocity reports.
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold theme-text-main">Workspace Timezone</label>
                  <select
                    className="form-select font-monospace"
                    value={profileForm.timezone}
                    onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST UTC+05:30)</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  </select>
                  <div className="form-text theme-text-sub small">Controls calendar slots and digital topbar clock.</div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold theme-text-main d-flex justify-content-between align-items-center">
                    <span>Daily Study & Engineering Target</span>
                    <span className="badge bg-primary px-3 py-1 fs-6">
                      {profileForm.daily_goal_minutes / 60} Hours ({profileForm.daily_goal_minutes} mins)
                    </span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="60"
                    max="600"
                    step="30"
                    value={profileForm.daily_goal_minutes}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, daily_goal_minutes: parseInt(e.target.value, 10) })
                    }
                  />
                  <div className="d-flex justify-content-between theme-text-sub small font-monospace">
                    <span>1 Hour (Light)</span>
                    <span>4 Hours (₹40 LPA+ Standard)</span>
                    <span>10 Hours (Intensive Bootcamp)</span>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold theme-text-main">Engineering Philosophy & Learning Bio</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="e.g. Dedicated to mastering clean architecture, active recall, and independent problem solving without AI dependency."
                  ></textarea>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Timer & Spaced Repetition Preferences */}
          {activeTab === 'study' && (
            <form onSubmit={handleStudySubmit}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                  <h5 className="fw-bold theme-text-main mb-1">Focus Mode & Cognitive Retention Engines</h5>
                  <p className="theme-text-sub small mb-0">
                    Configure Pomodoro intervals, break triggers, and SuperMemo SM-2 algorithm baselines.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                >
                  <FaSave />
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>

              <div className="row g-4">
                {/* Focus Timer Section */}
                <div className="col-12">
                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <FaStopwatch /> Focus Timer Configuration
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold theme-text-main">
                        Pomodoro Work Block (Minutes)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="120"
                        className="form-control"
                        value={studyForm.pomodoro_minutes}
                        onChange={(e) =>
                          setStudyForm({ ...studyForm, pomodoro_minutes: parseInt(e.target.value, 10) || 25 })
                        }
                      />
                      <div className="form-text theme-text-sub small">Recommended: 25m or 50m deep work blocks.</div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold theme-text-main">Short Break (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        className="form-control"
                        value={studyForm.short_break_minutes}
                        onChange={(e) =>
                          setStudyForm({ ...studyForm, short_break_minutes: parseInt(e.target.value, 10) || 5 })
                        }
                      />
                      <div className="form-text theme-text-sub small">Recommended: 5m to 10m cognitive rest.</div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold theme-text-main">Long Break (Minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        className="form-control"
                        value={studyForm.long_break_minutes}
                        onChange={(e) =>
                          setStudyForm({ ...studyForm, long_break_minutes: parseInt(e.target.value, 10) || 15 })
                        }
                      />
                      <div className="form-text theme-text-sub small">Triggered after 4 completed Pomodoro sets.</div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="soundAlertsToggle"
                          checked={studyForm.sound_alerts}
                          onChange={(e) => setStudyForm({ ...studyForm, sound_alerts: e.target.checked })}
                        />
                        <label className="form-check-label fw-semibold theme-text-main" htmlFor="soundAlertsToggle">
                          Audio Chime on Session Completion
                        </label>
                        <div className="form-text theme-text-sub small">
                          Synthesizes gentle Web Audio tone when countdown finishes.
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="autoBreakToggle"
                          checked={studyForm.auto_start_breaks}
                          onChange={(e) => setStudyForm({ ...studyForm, auto_start_breaks: e.target.checked })}
                        />
                        <label className="form-check-label fw-semibold theme-text-main" htmlFor="autoBreakToggle">
                          Auto-start Break Timer
                        </label>
                        <div className="form-text theme-text-sub small">
                          Automatically switches to break without waiting for user click.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spaced Repetition SM-2 Section */}
                <div className="col-12 pt-3 border-top">
                  <h6 className="fw-bold text-warning mb-3 d-flex align-items-center gap-2">
                    <FaBrain /> SuperMemo SM-2 Active Recall Settings
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold theme-text-main">
                        Default Initial Ease Factor
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="1.30"
                        max="3.50"
                        className="form-control font-monospace"
                        value={studyForm.sm2_default_ease}
                        onChange={(e) =>
                          setStudyForm({ ...studyForm, sm2_default_ease: parseFloat(e.target.value) || 2.50 })
                        }
                      />
                      <div className="form-text theme-text-sub small">
                        Standard SM-2 baseline is 2.50. Higher values expand intervals faster; minimum floor is 1.30.
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold theme-text-main">
                        Maximum Daily Review Cards Limit
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        className="form-control font-monospace"
                        value={studyForm.sm2_daily_limit}
                        onChange={(e) =>
                          setStudyForm({ ...studyForm, sm2_daily_limit: parseInt(e.target.value, 10) || 20 })
                        }
                      />
                      <div className="form-text theme-text-sub small">
                        Prevents cognitive overload by capping the active recall queue per session.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: Notifications Preferences */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotifSubmit}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                  <h5 className="fw-bold theme-text-main mb-1">Notification & Alert Rules</h5>
                  <p className="theme-text-sub small mb-0">
                    Control which background triggers dispatch in-app notifications and desktop alerts.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                >
                  <FaSave />
                  <span>{saving ? 'Saving...' : 'Save Notification Rules'}</span>
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="form-check form-switch p-3 rounded hero-box">
                  <input
                    className="form-check-input ms-0 me-3"
                    type="checkbox"
                    id="reminderSwitch"
                    checked={notifForm.in_app_study_reminder}
                    onChange={(e) => setNotifForm({ ...notifForm, in_app_study_reminder: e.target.checked })}
                  />
                  <div>
                    <label className="form-check-label fw-bold theme-text-main" htmlFor="reminderSwitch">
                      Upcoming Study Session Reminders
                    </label>
                    <div className="theme-text-sub small">
                      Dispatches an alert before a scheduled study block starts.
                    </div>
                  </div>
                </div>

                <div className="form-check form-switch p-3 rounded hero-box">
                  <input
                    className="form-check-input ms-0 me-3"
                    type="checkbox"
                    id="streakSwitch"
                    checked={notifForm.in_app_streak_alert}
                    onChange={(e) => setNotifForm({ ...notifForm, in_app_streak_alert: e.target.checked })}
                  />
                  <div>
                    <label className="form-check-label fw-bold theme-text-main" htmlFor="streakSwitch">
                      Study Streak & Overdue Task Alerts
                    </label>
                    <div className="theme-text-sub small">
                      Alerts you if study velocity drops or past sessions remain unfinished without rescheduling.
                    </div>
                  </div>
                </div>

                <div className="form-check form-switch p-3 rounded hero-box">
                  <input
                    className="form-check-input ms-0 me-3"
                    type="checkbox"
                    id="summarySwitch"
                    checked={notifForm.in_app_daily_summary}
                    onChange={(e) => setNotifForm({ ...notifForm, in_app_daily_summary: e.target.checked })}
                  />
                  <div>
                    <label className="form-check-label fw-bold theme-text-main" htmlFor="summarySwitch">
                      Daily Goal & Spaced Repetition Queue Summary
                    </label>
                    <div className="theme-text-sub small">
                      Notifies you each morning regarding active recall cards due for review.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded hero-box mt-2">
                  <label className="form-label small fw-bold theme-text-main">
                    Reminder Advance Notice Lead Time
                  </label>
                  <select
                    className="form-select font-monospace"
                    value={notifForm.lead_time_minutes}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, lead_time_minutes: parseInt(e.target.value, 10) })
                    }
                    style={{ maxWidth: '300px' }}
                  >
                    <option value="5">5 Minutes Before</option>
                    <option value="10">10 Minutes Before</option>
                    <option value="15">15 Minutes Before (Standard)</option>
                    <option value="30">30 Minutes Before</option>
                  </select>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: Account Security (Password) */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                  <h5 className="fw-bold theme-text-main mb-1">Account Password & Security</h5>
                  <p className="theme-text-sub small mb-0">
                    Update your Sanctum API authentication password securely.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                >
                  <FaSave />
                  <span>{saving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>

              <div className="row g-3" style={{ maxWidth: '560px' }}>
                <div className="col-12">
                  <label className="form-label small fw-bold theme-text-main">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold theme-text-main">New Password</label>
                  <input
                    type="password"
                    minLength="8"
                    className="form-control"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold theme-text-main">Confirm New Password</label>
                  <input
                    type="password"
                    minLength="8"
                    className="form-control"
                    value={passwordForm.password_confirmation}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 5: Data & Portfolio Management */}
          {activeTab === 'data' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                  <h5 className="fw-bold theme-text-main mb-1">Portfolio Data & Workspace Backups</h5>
                  <p className="theme-text-sub small mb-0">
                    Export your complete curriculum, problem logs, Feynman notes, and review history.
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  className="btn btn-success d-flex align-items-center gap-2 px-4 shadow-sm"
                >
                  <FaDownload />
                  <span>Download Backup (.json)</span>
                </button>
              </div>

              {/* Workspace Statistics Grid */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-lg-3">
                  <div className="hero-box p-3 text-center">
                    <div className="fs-3 fw-bold text-primary font-monospace">
                      {workspaceStats?.completed_topics} / {workspaceStats?.total_topics}
                    </div>
                    <div className="theme-text-sub small">Topics Completed</div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="hero-box p-3 text-center">
                    <div className="fs-3 fw-bold text-info font-monospace">
                      {workspaceStats?.total_revision_items || 0}
                    </div>
                    <div className="theme-text-sub small">Active Recall Cards</div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="hero-box p-3 text-center">
                    <div className="fs-3 fw-bold text-warning font-monospace">
                      {workspaceStats?.total_problem_logs || 0}
                    </div>
                    <div className="theme-text-sub small">Solved Coding Problems</div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="hero-box p-3 text-center">
                    <div className="fs-3 fw-bold text-success font-monospace">
                      {workspaceStats?.total_study_notes || 0}
                    </div>
                    <div className="theme-text-sub small">Feynman Study Notes</div>
                  </div>
                </div>
              </div>

              {/* System Diagnostics Box */}
              <div className="hero-box p-4">
                <h6 className="fw-bold theme-text-main mb-3 d-flex align-items-center gap-2">
                  <FaInfoCircle className="text-info" /> System & Runtime Diagnostics
                </h6>
                <div className="row g-3 small">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="theme-text-sub">Application Version:</span>
                      <strong className="theme-text-main font-monospace">
                        StudyOS v{systemInfo?.version || '1.0.0'}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="theme-text-sub">API Architecture:</span>
                      <strong className="theme-text-main">Laravel 12 REST API (Port 8000)</strong>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="theme-text-sub">Frontend Client:</span>
                      <strong className="theme-text-main">React 19 + Vite (Port 5173)</strong>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="theme-text-sub">Database Connection:</span>
                      <strong className="text-success">MySQL 8.0 (Connected: study_crm)</strong>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="theme-text-sub">Enforced Timezone:</span>
                      <strong className="theme-text-main font-monospace">
                        {systemInfo?.timezone || 'Asia/Kolkata'}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom">
                      <span className="theme-text-sub">Engineering Target:</span>
                      <strong className="text-primary font-monospace">{systemInfo?.target_lpa || '₹40 LPA+'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

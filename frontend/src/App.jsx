import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { TimerProvider } from './context/TimerContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RoadmapPage from './pages/RoadmapPage';
import SchedulePage from './pages/SchedulePage';
import NotificationsPage from './pages/NotificationsPage';
import RevisionPage from './pages/RevisionPage';
import ProblemsPage from './pages/ProblemsPage';
import TimerPage from './pages/TimerPage';
import NotesJournalPage from './pages/NotesJournalPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { FaTools } from 'react-icons/fa';

function MainRouter() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
        style={{ backgroundColor: 'var(--bg-main)' }}
      >
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <span className="small theme-text-sub">Loading StudyOS Command Center...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardPage onNavigateTab={setActiveTab} />}
      {activeTab === 'roadmap' && <RoadmapPage />}
      {activeTab === 'schedule' && <SchedulePage defaultView="day" />}
      {activeTab === 'calendar' && <SchedulePage defaultView="week" />}
      {activeTab === 'notifications' && <NotificationsPage onNavigateTab={setActiveTab} />}
      {activeTab === 'revision' && <RevisionPage />}
      {activeTab === 'problems' && <ProblemsPage />}
      {activeTab === 'timer' && <TimerPage />}
      {activeTab === 'notes' && <NotesJournalPage />}
      {activeTab === 'reports' && <ReportsPage />}
      {activeTab === 'settings' && <SettingsPage />}

      {/* Placeholders for upcoming phases */}
      {activeTab !== 'dashboard' &&
        activeTab !== 'roadmap' &&
        activeTab !== 'schedule' &&
        activeTab !== 'calendar' &&
        activeTab !== 'notifications' &&
        activeTab !== 'revision' &&
        activeTab !== 'problems' &&
        activeTab !== 'timer' &&
        activeTab !== 'notes' &&
        activeTab !== 'reports' &&
        activeTab !== 'settings' && (
        <div className="card text-center p-5">
          <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3">
            <span className="fs-2">🚀</span>
          </div>
          <h4 className="fw-bold theme-text-main mb-2 text-capitalize">{activeTab} Module</h4>
          <p className="text-muted small mx-auto" style={{ maxWidth: '440px' }}>
            This section is slated for the upcoming engineering phase. Use the <strong>Dashboard</strong> to review today's schedule, study hours, and spaced repetition analytics.
          </p>
          <div>
            <button onClick={() => setActiveTab('dashboard')} className="btn btn-sm btn-primary">
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <TimerProvider>
            <MainRouter />
          </TimerProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

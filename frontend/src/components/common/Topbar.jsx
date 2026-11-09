import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FaClock,
  FaMoon,
  FaSun,
  FaPlayCircle,
  FaUserCircle,
} from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';

export default function Topbar({ onOpenTimer, onNavigateTab, collapsed }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [istTime, setIstTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="navbar navbar-expand px-4 py-2 border-bottom position-sticky top-0 z-2"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
        {/* Left Side: Live IST Clock & Target */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
            <FaClock className="text-primary small" />
            <span className="small font-monospace fw-bold theme-text-main">{istTime}</span>
            <span className="badge bg-secondary bg-opacity-25 theme-text-sub" style={{ fontSize: '0.65rem' }}>
              IST
            </span>
          </div>

          <div className="d-none d-md-block small">
            <span className="text-muted">Target:</span>{' '}
            <strong className="theme-text-main ms-1">{user?.target_role || 'Senior Full-Stack Developer'}</strong>
          </div>
        </div>

        {/* Right Side: Quick Timer + Notification + Theme Toggle + User */}
        <div className="d-flex align-items-center gap-2">
          {/* Quick Focus Button */}
          <button
            onClick={onOpenTimer}
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-3 fw-semibold"
            title="Start Focus Session"
          >
            <FaPlayCircle className="text-primary" />
            <span className="d-none d-sm-inline small">Focus Mode</span>
          </button>

          {/* Notification Bell Dropdown */}
          <NotificationDropdown onNavigateTab={onNavigateTab} />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-2"
            style={{ width: '36px', height: '36px' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <FaSun className="text-warning" /> : <FaMoon className="text-primary" />}
          </button>

          {/* User Avatar Chip */}
          <div className="d-flex align-items-center gap-2 ps-2">
            <FaUserCircle className="fs-3 text-secondary" />
            <div className="d-none d-lg-block text-start">
              <div className="small fw-bold theme-text-main lh-1">{user?.name}</div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                {user?.timezone || 'Asia/Kolkata'}
              </small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

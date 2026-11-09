import React, { useState, useRef, useEffect } from 'react';
import {
  FaBell,
  FaClock,
  FaExclamationTriangle,
  FaSyncAlt,
  FaTrophy,
  FaCheckDouble,
  FaArrowRight,
  FaTrash,
} from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationDropdown({ onNavigateTab }) {
  const {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    syncAlerts,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session_reminder':
        return <FaClock className="text-info fs-6" />;
      case 'overdue_alert':
        return <FaExclamationTriangle className="text-warning fs-6" />;
      case 'revision_due':
        return <FaSyncAlt className="text-primary fs-6" />;
      case 'goal_progress':
        return <FaTrophy className="text-success fs-6" />;
      default:
        return <FaBell className="text-secondary fs-6" />;
    }
  };

  const handleItemClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.action_tab && onNavigateTab) {
      onNavigateTab(notification.action_tab);
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        className="btn btn-link position-relative p-2 rounded-circle"
        style={{
          color: 'var(--text-secondary)',
          backgroundColor: isOpen ? 'var(--hover-bg)' : 'transparent',
          border: '1px solid transparent',
        }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            syncAlerts();
          }
        }}
        title="Notifications & Reminders"
        aria-label="Notifications"
      >
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2"
            style={{
              fontSize: '0.65rem',
              borderColor: 'var(--card-bg)',
              transform: 'translate(-30%, 15%)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          className="card shadow-lg position-absolute end-0 mt-2 z-3"
          style={{
            width: '380px',
            maxWidth: '90vw',
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            borderRadius: '14px',
          }}
        >
          {/* Header */}
          <div className="card-header p-3 d-flex align-items-center justify-content-between border-bottom">
            <div className="d-flex align-items-center gap-2">
              <h6 className="theme-text-main fw-bold mb-0">Notifications</h6>
              {unreadCount > 0 && (
                <span className="badge bg-primary text-white" style={{ fontSize: '0.7rem' }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none small text-primary d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }}
                onClick={markAllAsRead}
              >
                <FaCheckDouble size={11} /> Mark all read
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="p-4 text-center">
                <FaBell size={24} className="text-muted mb-2" />
                <p className="theme-text-sub small mb-0">You're all caught up! No notifications.</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border-bottom position-relative cursor-pointer transition-all d-flex gap-3 align-items-start ${
                    !item.is_read ? 'bg-primary bg-opacity-10' : ''
                  }`}
                  style={{
                    cursor: 'pointer',
                    borderColor: 'var(--border-color)',
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Type Icon */}
                  <div
                    className="rounded-circle p-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'var(--hover-bg)', width: '34px', height: '34px' }}
                  >
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="theme-text-main fw-semibold small text-truncate pe-2">
                        {item.title}
                      </span>
                      <span className="text-muted small flex-shrink-0" style={{ fontSize: '0.68rem' }}>
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                    <p className="theme-text-sub small mb-0 text-truncate-2" style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                      {item.message}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    className="btn btn-sm btn-link p-0 text-muted opacity-50 hover-opacity-100 flex-shrink-0"
                    title="Dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="card-footer p-2 text-center border-top">
            <button
              className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold w-100 d-inline-flex align-items-center justify-content-center gap-1"
              style={{ fontSize: '0.8rem' }}
              onClick={() => {
                setIsOpen(false);
                if (onNavigateTab) {
                  onNavigateTab('notifications');
                }
              }}
            >
              Notification Center & Preferences <FaArrowRight size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


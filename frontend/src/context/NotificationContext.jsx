import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );

  // Play a soft notification audio chime using the Web Audio API (no external file needed)
  const playChime = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // AudioContext might be blocked until user gesture
    }
  }, []);

  // Native desktop notification trigger
  const triggerBrowserNotification = useCallback(
    (title, body, url = null) => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const n = new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
          if (url) {
            n.onclick = () => {
              window.focus();
              n.close();
            };
          }
        } catch (e) {
          console.error('Desktop notification error:', e);
        }
      }
    },
    []
  );

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          triggerBrowserNotification('StudyOS Notifications Enabled', 'You will now receive desktop alerts for upcoming sessions.');
        }
        return perm;
      } catch (e) {
        console.error('Failed to request notification permission:', e);
      }
    }
    return 'denied';
  };

  // Fetch full list
  const fetchNotifications = useCallback(
    async (filter = 'all') => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const res = await notificationService.getNotifications({ filter });
        setNotifications(res.notifications || []);
        setUnreadCount(res.unread_count || 0);
        if (res.preferences) {
          setPreferences(res.preferences);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Periodic poll for unread count
  const pollUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getUnreadCount();
      const newCount = res.unread_count || 0;

      // If new unread notifications arrived while user is active
      if (newCount > unreadCount && preferences?.sound_enabled) {
        playChime();
      }

      setUnreadCount(newCount);
    } catch (err) {
      // Silent error during poll
    }
  }, [isAuthenticated, unreadCount, preferences?.sound_enabled, playChime]);

  // Initial load & Polling Interval (every 60s)
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(pollUnread, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications, pollUnread]);

  // Actions
  const markAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const target = notifications.find((n) => n.id === id);
      if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearRead = async () => {
    try {
      await notificationService.clearRead();
      setNotifications((prev) => prev.filter((n) => !n.is_read));
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const res = await notificationService.updatePreferences(newPrefs);
      setPreferences(res.preferences);
      return res.preferences;
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
      throw err;
    }
  };

  const syncAlerts = async () => {
    try {
      const res = await notificationService.syncAlerts();
      setUnreadCount(res.unread_count || 0);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to sync alerts:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}


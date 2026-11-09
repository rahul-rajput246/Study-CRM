import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { sessionService } from '../services/sessionService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { playChime, triggerBrowserNotification } = useNotifications() || {};

  const [activeSession, setActiveSession] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState('pomodoro'); // pomodoro, deep_work, custom, free_flow
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [elapsedActiveSeconds, setElapsedActiveSeconds] = useState(0);
  const [elapsedPausedSeconds, setElapsedPausedSeconds] = useState(0);

  // Drift prevention refs
  const lastTickTimeRef = useRef(Date.now());
  const heartbeatTimerRef = useRef(null);

  // Check active session on initial mount
  const checkActiveSession = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await sessionService.getActiveSession();
      if (res.session) {
        const s = res.session;
        setActiveSession(s);
        setSessionType(s.session_type);
        setPlannedMinutes(s.planned_minutes);
        setElapsedActiveSeconds(s.active_seconds || 0);
        setElapsedPausedSeconds(s.paused_seconds || 0);
        setIsRunning(true);
        setIsPaused(false);
      }
    } catch (e) {
      // Ignore initial fetch error
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  // Wall-Clock Accurate Timer Tick (1000ms loop)
  useEffect(() => {
    if (!isRunning || isPaused) return;

    lastTickTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.round((now - lastTickTimeRef.current) / 1000);

      if (deltaSeconds >= 1) {
        lastTickTimeRef.current = now;
        setElapsedActiveSeconds((prev) => {
          const updated = prev + deltaSeconds;
          // Check if planned time reached
          const targetSeconds = plannedMinutes * 60;
          if (updated === targetSeconds) {
            if (playChime) playChime();
            if (triggerBrowserNotification) {
              triggerBrowserNotification(
                'Focus Session Complete! 🎯',
                `Great work! You finished your ${plannedMinutes}m session. Take a short 5m break.`
              );
            }
          }
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, plannedMinutes, playChime, triggerBrowserNotification]);

  // Periodic Backend Heartbeat (Every 30 seconds)
  useEffect(() => {
    if (!isRunning || !activeSession) return;

    heartbeatTimerRef.current = setInterval(() => {
      sessionService
        .heartbeat(activeSession.id, {
          active_seconds: elapsedActiveSeconds,
          paused_seconds: elapsedPausedSeconds,
        })
        .catch(() => {});
    }, 30000);

    return () => clearInterval(heartbeatTimerRef.current);
  }, [isRunning, activeSession, elapsedActiveSeconds, elapsedPausedSeconds]);

  // Actions
  const startFocus = async (config) => {
    try {
      const planned = config.planned_minutes || 25;
      const type = config.session_type || 'pomodoro';

      const res = await sessionService.startSession({
        planned_minutes: planned,
        session_type: type,
        topic_id: config.topic_id || null,
        study_schedule_id: config.study_schedule_id || null,
        notes: config.notes || null,
      });

      setActiveSession(res.session);
      setSessionType(type);
      setPlannedMinutes(planned);
      setElapsedActiveSeconds(0);
      setElapsedPausedSeconds(0);
      setIsRunning(true);
      setIsPaused(false);
      lastTickTimeRef.current = Date.now();
      return res.session;
    } catch (err) {
      console.error('Failed to start focus session:', err);
      throw err;
    }
  };

  const pauseFocus = () => {
    setIsPaused(true);
  };

  const resumeFocus = () => {
    lastTickTimeRef.current = Date.now();
    setIsPaused(false);
  };

  const completeFocus = async (notes = '') => {
    if (!activeSession) return;
    try {
      await sessionService.completeSession(activeSession.id, {
        active_seconds: elapsedActiveSeconds,
        paused_seconds: elapsedPausedSeconds,
        notes: notes || null,
      });

      setIsRunning(false);
      setIsPaused(false);
      setActiveSession(null);
    } catch (err) {
      console.error('Failed to complete focus session:', err);
      throw err;
    }
  };

  const abandonFocus = async () => {
    if (!activeSession) return;
    try {
      await sessionService.abandonSession(activeSession.id);
      setIsRunning(false);
      setIsPaused(false);
      setActiveSession(null);
    } catch (err) {
      console.error('Failed to cancel focus session:', err);
      throw err;
    }
  };

  const totalTargetSeconds = plannedMinutes * 60;
  const remainingSeconds = Math.max(0, totalTargetSeconds - elapsedActiveSeconds);
  const progressPercent =
    totalTargetSeconds > 0
      ? Math.min(100, Math.round((elapsedActiveSeconds / totalTargetSeconds) * 100))
      : 0;

  return (
    <TimerContext.Provider
      value={{
        activeSession,
        isRunning,
        isPaused,
        sessionType,
        plannedMinutes,
        elapsedActiveSeconds,
        elapsedPausedSeconds,
        remainingSeconds,
        progressPercent,
        startFocus,
        pauseFocus,
        resumeFocus,
        completeFocus,
        abandonFocus,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}


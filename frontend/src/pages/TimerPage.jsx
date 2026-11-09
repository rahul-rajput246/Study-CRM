import React, { useState, useEffect } from 'react';
import {
  FaPlay,
  FaPause,
  FaCheck,
  FaTimes,
  FaHourglassHalf,
  FaFire,
  FaHistory,
  FaBook,
  FaLaptopCode,
} from 'react-icons/fa';
import { useTimer } from '../context/TimerContext';
import { sessionService } from '../services/sessionService';
import { roadmapService } from '../services/roadmapService';

export default function TimerPage() {
  const {
    activeSession,
    isRunning,
    isPaused,
    sessionType,
    plannedMinutes,
    elapsedActiveSeconds,
    remainingSeconds,
    progressPercent,
    startFocus,
    pauseFocus,
    resumeFocus,
    completeFocus,
    abandonFocus,
  } = useTimer();

  // Setup state when not running
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [topics, setTopics] = useState([]);
  const [history, setHistory] = useState([]);

  // Load Roadmap Topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const roadmaps = await roadmapService.getRoadmaps();
        const extracted = [];
        roadmaps.forEach((rm) => {
          (rm.phases || []).forEach((ph) => {
            (ph.subjects || []).forEach((sub) => {
              (sub.topics || []).forEach((top) => {
                extracted.push({
                  id: top.id,
                  title: top.title,
                  subject_title: sub.name,
                });
              });
            });
          });
        });
        setTopics(extracted);
      } catch (err) {
        console.error('Failed to load topics for timer:', err);
      }
    };
    fetchTopics();
  }, []);

  // Load session history
  const loadHistory = async () => {
    try {
      const res = await sessionService.getHistory(10);
      setHistory(res.data || []);
    } catch (e) {
      console.error('Failed to load session history:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [isRunning]);

  const handleStart = async (minutes) => {
    try {
      const duration = minutes || selectedDuration;
      const type = duration === 50 ? 'deep_work' : duration === 25 ? 'pomodoro' : 'custom';
      await startFocus({
        planned_minutes: duration,
        session_type: type,
        topic_id: selectedTopicId ? parseInt(selectedTopicId) : null,
        notes: sessionNotes || null,
      });
    } catch (e) {
      alert('Failed to start focus session.');
    }
  };

  const handleFinishSession = async () => {
    try {
      await completeFocus(completionNotes);
      setShowCompleteModal(false);
      setCompletionNotes('');
      loadHistory();
    } catch (e) {
      alert('Failed to finish session.');
    }
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary px-2 py-1 small fw-semibold">Phase 9</span>
            <span className="theme-text-sub small fw-medium">Focus Mode & Deep Work Engine</span>
          </div>
          <h2 className="theme-text-main fw-bold mb-1">Pomodoro & Focus Timer</h2>
          <p className="theme-text-sub small mb-0">
            Drift-free active second logging, cognitive stamina development, and active study tracking.
          </p>
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Main Timer Display Card */}
        <div className="col-12 col-lg-8">
          <div
            className="card border-0 shadow-lg text-center p-4 p-md-5"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '20px',
              border: isRunning ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
            }}
          >
            {/* Status Pill */}
            <div className="mb-3">
              {isRunning ? (
                isPaused ? (
                  <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                    ⏸️ Focus Session Paused
                  </span>
                ) : (
                  <span className="badge bg-success px-3 py-2 fs-6 d-inline-flex align-items-center gap-2">
                    <span
                      className="spinner-grow spinner-grow-sm text-light"
                      style={{ width: '10px', height: '10px' }}
                    />
                    🔥 Deep Work In Progress
                  </span>
                )
              ) : (
                <span className="badge bg-secondary px-3 py-2 fs-6">
                  Ready to Enter Focus State
                </span>
              )}
            </div>

            {/* Linked Topic Badge if active */}
            {activeSession?.topic && (
              <div className="mb-3">
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1">
                  Focusing on: <strong>{activeSession.topic.title}</strong>
                </span>
              </div>
            )}

            {/* Giant Countdown Clock */}
            <div className="my-4">
              <h1
                className="theme-text-main font-monospace fw-bold mb-0"
                style={{
                  fontSize: 'clamp(4.5rem, 12vw, 7.5rem)',
                  letterSpacing: '2px',
                  lineHeight: 1,
                }}
              >
                {isRunning ? formatTime(remainingSeconds) : formatTime(selectedDuration * 60)}
              </h1>
              <span className="text-muted small mt-2 d-block">
                {isRunning
                  ? `${Math.round(elapsedActiveSeconds / 60)} mins active logged • ${progressPercent}% completed`
                  : `${selectedDuration} Minutes Target Session`}
              </span>
            </div>

            {/* Progress Bar */}
            {isRunning && (
              <div className="progress mx-auto mb-4" style={{ height: '8px', maxWidth: '420px' }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Controls */}
            {!isRunning ? (
              /* Setup & Start Controls */
              <div className="d-flex flex-column align-items-center gap-3">
                {/* Preset Duration Buttons */}
                <div className="btn-group mb-2" role="group">
                  <button
                    className={`btn px-3 py-2 fw-semibold ${
                      selectedDuration === 25 ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedDuration(25)}
                  >
                    25m Pomodoro
                  </button>
                  <button
                    className={`btn px-3 py-2 fw-semibold ${
                      selectedDuration === 50 ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedDuration(50)}
                  >
                    50m Deep Work
                  </button>
                  <button
                    className={`btn px-3 py-2 fw-semibold ${
                      selectedDuration === 15 ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedDuration(15)}
                  >
                    15m Sprint
                  </button>
                  <button
                    className={`btn px-3 py-2 fw-semibold ${
                      selectedDuration === 90 ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedDuration(90)}
                  >
                    90m Flow
                  </button>
                </div>

                {/* Topic Selector */}
                <div style={{ maxWidth: '420px', width: '100%' }}>
                  <select
                    className="form-select text-center"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                  >
                    <option value="">-- General Focus Session (No Topic) --</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.subject_title ? `[${t.subject_title}] ` : ''}{t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Button */}
                <button
                  className="btn btn-primary btn-lg px-5 py-3 fw-bold shadow d-inline-flex align-items-center gap-2 mt-2"
                  style={{ borderRadius: '14px', fontSize: '1.2rem' }}
                  onClick={() => handleStart(selectedDuration)}
                >
                  <FaPlay size={16} /> Start Focus Session
                </button>
              </div>
            ) : (
              /* In-Session Live Controls */
              <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mt-2">
                {isPaused ? (
                  <button
                    className="btn btn-success btn-lg px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow"
                    onClick={resumeFocus}
                  >
                    <FaPlay size={14} /> Resume Session
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-warning btn-lg px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                    onClick={pauseFocus}
                  >
                    <FaPause size={14} /> Pause
                  </button>
                )}

                <button
                  className="btn btn-primary btn-lg px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <FaCheck size={14} /> Complete & Save
                </button>

                <button
                  className="btn btn-outline-danger btn-lg px-3 py-2 d-inline-flex align-items-center gap-1"
                  onClick={() => {
                    if (window.confirm('Cancel this study session without saving time?')) {
                      abandonFocus();
                    }
                  }}
                  title="Abandon Session"
                >
                  <FaTimes size={14} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h6 className="theme-text-main fw-bold mb-3 d-flex align-items-center gap-2">
                <FaHistory className="text-primary" /> Today's Completed Sessions
              </h6>

              {history.length === 0 ? (
                <div className="p-4 text-center">
                  <FaHourglassHalf size={24} className="text-muted mb-2" />
                  <p className="theme-text-sub small mb-0">No focus sessions completed yet today.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {history.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 rounded border"
                      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="badge bg-success-subtle text-success small">
                          {Math.round(sess.active_seconds / 60)} mins active
                        </span>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {sess.ended_at ? new Date(sess.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                      <h6 className="theme-text-main fw-semibold mb-1 small text-truncate">
                        {sess.topic?.title || sess.session_type.toUpperCase()}
                      </h6>
                      {sess.notes && (
                        <p className="theme-text-sub small mb-0 text-truncate" style={{ fontSize: '0.75rem' }}>
                          "{sess.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card border-0 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold theme-text-main d-flex align-items-center gap-2">
                  <FaCheck className="text-success" /> Session Accomplishments
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-link theme-text-sub p-0"
                  onClick={() => setShowCompleteModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body p-4">
                <p className="theme-text-sub small mb-3">
                  You logged <strong>{Math.round(elapsedActiveSeconds / 60)} minutes</strong> of focused engineering study time!
                </p>
                <label className="form-label small fw-semibold theme-text-main">
                  What did you complete in this focus block? (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Implemented sliding window two-pointer tests and eliminated bounds bug."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                />
              </div>
              <div className="modal-footer border-top py-3">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowCompleteModal(false)}
                >
                  Back to Timer
                </button>
                <button
                  className="btn btn-success btn-sm fw-semibold px-4 text-white"
                  onClick={handleFinishSession}
                >
                  Save & Log Study Hours
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


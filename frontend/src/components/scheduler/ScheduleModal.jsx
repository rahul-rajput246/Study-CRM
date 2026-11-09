import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarPlus, FaClock, FaExclamationTriangle, FaMagic, FaBell } from 'react-icons/fa';
import { scheduleService } from '../../services/scheduleService';

export default function ScheduleModal({
  show,
  onClose,
  onCreated,
  onUpdated,
  editingSchedule = null,
  topics = [],
  defaultDate,
}) {
  const [formData, setFormData] = useState({
    title: '',
    topic_id: '',
    scheduled_date: defaultDate || new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '15:30',
    estimated_minutes: 90,
    priority: 'high',
    recurrence: 'none',
    reminder_enabled: true,
    description: '',
  });

  const [conflict, setConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [force, setForce] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill on open or edit
  useEffect(() => {
    if (show) {
      if (editingSchedule) {
        setFormData({
          title: editingSchedule.title || '',
          topic_id: editingSchedule.topic_id ? String(editingSchedule.topic_id) : '',
          scheduled_date: editingSchedule.scheduled_date ? String(editingSchedule.scheduled_date).slice(0, 10) : defaultDate || new Date().toISOString().split('T')[0],
          start_time: editingSchedule.start_time ? editingSchedule.start_time.slice(0, 5) : '14:00',
          end_time: editingSchedule.end_time ? editingSchedule.end_time.slice(0, 5) : '15:30',
          estimated_minutes: editingSchedule.estimated_minutes || 90,
          priority: editingSchedule.priority || 'high',
          recurrence: editingSchedule.recurrence || 'none',
          reminder_enabled: editingSchedule.reminder_enabled !== undefined ? !!editingSchedule.reminder_enabled : true,
          description: editingSchedule.description || '',
        });
      } else {
        setFormData({
          title: '',
          topic_id: '',
          scheduled_date: defaultDate || new Date().toISOString().split('T')[0],
          start_time: '14:00',
          end_time: '15:30',
          estimated_minutes: 90,
          priority: 'high',
          recurrence: 'none',
          reminder_enabled: true,
          description: '',
        });
      }
      setConflict(null);
      setError('');
      setForce(false);
    }
  }, [show, editingSchedule, defaultDate]);

  // Auto-calculate duration from times
  useEffect(() => {
    if (formData.start_time && formData.end_time && formData.start_time < formData.end_time) {
      const [startH, startM] = formData.start_time.split(':').map(Number);
      const [endH, endM] = formData.end_time.split(':').map(Number);
      const diff = endH * 60 + endM - (startH * 60 + startM);
      if (diff > 0) {
        setFormData((prev) => ({ ...prev, estimated_minutes: diff }));
      }
    }
  }, [formData.start_time, formData.end_time]);

  // Live conflict detection debounce
  useEffect(() => {
    if (!show || !formData.scheduled_date || !formData.start_time || !formData.end_time) return;
    if (formData.start_time >= formData.end_time) return;

    const timer = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const res = await scheduleService.checkConflicts({
          scheduled_date: formData.scheduled_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          ignore_id: editingSchedule?.id || undefined,
        });

        if (res.has_conflict) {
          setConflict(res.conflict);
        } else {
          setConflict(null);
        }
      } catch (e) {
        // Ignore check error
      } finally {
        setCheckingConflict(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [show, formData.scheduled_date, formData.start_time, formData.end_time]);

  if (!show) return null;

  const handleApplySuggested = () => {
    if (conflict?.suggested_slot) {
      setFormData((prev) => ({
        ...prev,
        start_time: conflict.suggested_slot.start_time,
        end_time: conflict.suggested_slot.end_time,
        estimated_minutes: conflict.suggested_slot.duration_minutes,
      }));
      setConflict(null);
    }
  };

  const handleTopicSelect = (topicId) => {
    const selected = topics.find((t) => t.id === parseInt(topicId));
    setFormData((prev) => ({
      ...prev,
      topic_id: topicId,
      title: selected ? `Study: ${selected.title}` : prev.title,
      estimated_minutes: selected?.estimated_minutes || prev.estimated_minutes,
      priority: selected?.priority || prev.priority,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        topic_id: formData.topic_id ? parseInt(formData.topic_id) : null,
        force,
      };

      if (editingSchedule && onUpdated) {
        await onUpdated(editingSchedule.id, payload);
      } else {
        await onCreated(payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule study activity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content card border-secondary border-opacity-50 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold theme-text-main d-flex align-items-center gap-2">
              <FaCalendarPlus className="text-primary" />
              {editingSchedule ? 'Edit Study Session' : 'Schedule Study Session'}
            </h5>
            <button type="button" className="btn btn-sm btn-link theme-text-sub p-0" onClick={onClose}>
              <FaTimes className="fs-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 d-flex flex-column gap-3" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              {/* Linked Topic Selector */}
              {topics.length > 0 && (
                <div>
                  <label className="form-label small fw-semibold theme-text-sub">
                    Link to Roadmap Topic (Optional)
                  </label>
                  <select
                    className="form-select"
                    value={formData.topic_id}
                    onChange={(e) => handleTopicSelect(e.target.value)}
                  >
                    <option value="">-- General Study / Custom Engineering Task --</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.subject_title ? `[${t.subject_title}] ` : ''}{t.title} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Activity Title */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">Activity Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sliding Window Problem Solving & Test Cases"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Date, Start Time, End Time */}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold theme-text-sub">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold theme-text-sub">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold theme-text-sub">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Conflict Alert Banner */}
              {conflict && (
                <div className="alert alert-danger p-3 mb-0 small">
                  <div className="d-flex align-items-center gap-2 fw-bold mb-1">
                    <FaExclamationTriangle />
                    <span>Time Overlap Detected!</span>
                  </div>
                  <p className="mb-2">
                    Collides with <strong>{conflict.conflicting_session?.title}</strong> (
                    {conflict.conflicting_session?.start_time} - {conflict.conflicting_session?.end_time}).
                  </p>

                  {conflict.suggested_slot && (
                    <div className="d-flex align-items-center justify-content-between p-2 rounded bg-dark bg-opacity-25 mt-2">
                      <span>
                        Suggested free slot: <strong>{conflict.suggested_slot.start_time} - {conflict.suggested_slot.end_time}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleApplySuggested}
                        className="btn btn-xs btn-primary d-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FaMagic /> Apply Suggested Slot
                      </button>
                    </div>
                  )}

                  <div className="form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="forceSchedule"
                      checked={force}
                      onChange={(e) => setForce(e.target.checked)}
                    />
                    <label className="form-check-label text-muted" htmlFor="forceSchedule">
                      Schedule overlap anyway (force)
                    </label>
                  </div>
                </div>
              )}

              {/* Priority & Recurrence Row */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Priority</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="critical">Critical (Must Do Today)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Recurrence</label>
                  <select
                    className="form-select"
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                  >
                    <option value="none">One-time activity</option>
                    <option value="daily">Repeats Daily (Next 7 Days)</option>
                    <option value="weekly">Repeats Weekly (Next 4 Weeks)</option>
                  </select>
                </div>
              </div>

              {/* Reminder Setting */}
              <div className="form-check form-switch p-3 rounded-2 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                <input
                  className="form-check-input ms-0 me-3"
                  type="checkbox"
                  id="reminderSwitch"
                  checked={formData.reminder_enabled}
                  onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                />
                <label className="form-check-label small fw-semibold theme-text-main d-flex align-items-center gap-2" htmlFor="reminderSwitch">
                  <FaBell className="text-warning" />
                  Enable Notification Reminder (10 mins before start)
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">Focus Objectives & Notes</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="What specifically will you implement or solve in this study window?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-top py-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (conflict && !force)}
                className="btn btn-sm btn-primary fw-semibold px-4 shadow-sm"
              >
                {submitting
                  ? 'Saving Schedule...'
                  : editingSchedule
                  ? 'Update Activity'
                  : 'Save to Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

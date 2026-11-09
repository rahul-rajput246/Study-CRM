import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaExclamationTriangle, FaMagic } from 'react-icons/fa';
import { scheduleService } from '../../services/scheduleService';

export default function RescheduleModal({ show, onClose, schedule, onRescheduled }) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:30');
  const [reason, setReason] = useState('Shifted to keep daily schedule realistic.');
  const [force, setForce] = useState(false);

  const [conflict, setConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default to today's date
  useEffect(() => {
    if (show && schedule) {
      const today = new Date().toISOString().split('T')[0];
      setScheduledDate(today);
      setStartTime(schedule.start_time?.substring(0, 5) || '11:00');
      setEndTime(schedule.end_time?.substring(0, 5) || '12:30');
      setConflict(null);
      setError('');
    }
  }, [show, schedule]);

  // Live conflict detection on date/time change
  useEffect(() => {
    if (!show || !schedule || !scheduledDate || !startTime || !endTime || startTime >= endTime) {
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const res = await scheduleService.checkConflicts({
          scheduled_date: scheduledDate,
          start_time: startTime,
          end_time: endTime,
          ignore_id: schedule.id,
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
  }, [show, schedule, scheduledDate, startTime, endTime]);

  if (!show || !schedule) return null;

  const handleApplySuggested = () => {
    if (conflict?.suggested_slot) {
      setStartTime(conflict.suggested_slot.start_time);
      setEndTime(conflict.suggested_slot.end_time);
      setConflict(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onRescheduled(schedule.id, {
        scheduled_date: scheduledDate,
        start_time: startTime,
        end_time: endTime,
        reschedule_reason: reason,
        force,
      });
      onClose();
    } catch (err) {
      setError(err.message || err.conflict?.message || 'Failed to reschedule.');
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
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card border-secondary border-opacity-50 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold theme-text-main d-flex align-items-center gap-2">
              <FaCalendarAlt className="text-warning" />
              Reschedule Study Activity
            </h5>
            <button type="button" className="btn btn-sm btn-link theme-text-sub p-0" onClick={onClose}>
              <FaTimes className="fs-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 d-flex flex-column gap-3">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              {/* Activity Info Box */}
              <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                <span className="badge bg-secondary bg-opacity-25 theme-text-sub small mb-1">
                  {schedule.topic?.subject?.title || 'General Engineering'}
                </span>
                <h6 className="fw-bold theme-text-main mb-1">{schedule.title}</h6>
                <small className="text-muted">
                  Originally scheduled on: <strong className="theme-text-sub">{schedule.scheduled_date}</strong> (
                  {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)})
                </small>
              </div>

              {/* New Date Picker */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">New Scheduled Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>

              {/* New Time Slots */}
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold theme-text-sub">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold theme-text-sub">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Conflict Warning Box */}
              {conflict && (
                <div className="alert alert-danger p-3 mb-0 small">
                  <div className="d-flex align-items-center gap-2 fw-bold mb-1">
                    <FaExclamationTriangle />
                    <span>Schedule Conflict Detected!</span>
                  </div>
                  <p className="mb-2">
                    Overlaps with <strong>{conflict.conflicting_session?.title}</strong> (
                    {conflict.conflicting_session?.start_time} - {conflict.conflicting_session?.end_time}).
                  </p>

                  {conflict.suggested_slot && (
                    <div className="d-flex align-items-center justify-content-between p-2 rounded bg-dark bg-opacity-25 mt-2">
                      <span>
                        Suggested next slot: <strong>{conflict.suggested_slot.start_time} - {conflict.suggested_slot.end_time}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleApplySuggested}
                        className="btn btn-xs btn-primary d-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FaMagic /> Use Slot
                      </button>
                    </div>
                  )}

                  <div className="form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="forceReschedule"
                      checked={force}
                      onChange={(e) => setForce(e.target.checked)}
                    />
                    <label className="form-check-label text-muted" htmlFor="forceReschedule">
                      Ignore warning and schedule overlap anyway
                    </label>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">Reschedule Reason (Optional)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Work commitment, needed extra practice on fundamentals"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer border-top py-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (conflict && !force)}
                className="btn btn-sm btn-primary fw-semibold px-4"
              >
                {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


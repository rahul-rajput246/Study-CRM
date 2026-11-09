import React from 'react';
import {
  FaClock,
  FaCheck,
  FaPlay,
  FaHistory,
  FaPlus,
  FaTrash,
  FaPencilAlt,
  FaFire,
  FaCheckCircle,
} from 'react-icons/fa';

export default function WeeklyCalendarView({
  weekData,
  loading,
  onOpenCreate,
  onOpenEdit,
  onOpenReschedule,
  onUpdateStatus,
  onDelete,
  onSelectDate,
}) {
  if (loading) {
    return (
      <div className="card border-0 p-5 text-center">
        <div className="spinner-border text-primary mx-auto mb-3" role="status" />
        <p className="theme-text-sub mb-0">Loading 7-day study calendar...</p>
      </div>
    );
  }

  const { week_range = '', days = [] } = weekData || {};

  const totalPlannedHours = days.reduce((sum, d) => sum + (parseFloat(d.planned_hours) || 0), 0);
  const totalActualHours = days.reduce((sum, d) => sum + (parseFloat(d.actual_hours) || 0), 0);
  const totalSessions = days.reduce((sum, d) => sum + (d.schedules?.length || 0), 0);

  const formatShortTime = (timeStr) => {
    if (!timeStr) return '';
    const [hh, mm] = timeStr.split(':');
    return `${hh}:${mm}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div>
      {/* Weekly Stats Header */}
      <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="text-muted small text-uppercase fw-semibold">Week View</span>
              <h5 className="theme-text-main fw-bold mb-0">{week_range}</h5>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 px-3 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="text-muted small d-block">Week Planned</span>
                <span className="theme-text-main fw-bold fs-6">{totalPlannedHours.toFixed(1)}h</span>
              </div>
              <div className="p-2 px-3 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="text-muted small d-block">Week Actual</span>
                <span className="text-success fw-bold fs-6">{totalActualHours.toFixed(1)}h</span>
              </div>
              <div className="p-2 px-3 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="text-muted small d-block">Total Sessions</span>
                <span className="theme-text-main fw-bold fs-6">{totalSessions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Columns Grid */}
      <div className="row g-3 row-cols-1 row-cols-md-7 g-2" style={{ minWidth: '100%', overflowX: 'auto' }}>
        {days.map((day) => {
          const isToday = day.is_today;
          const daySessions = day.schedules || [];

          return (
            <div key={day.date} className="col" style={{ minWidth: '155px' }}>
              <div
                className={`card h-100 shadow-sm border ${
                  isToday ? 'border-primary border-2' : ''
                }`}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '12px',
                }}
              >
                {/* Column Day Header */}
                <div
                  className="p-2 text-center border-bottom cursor-pointer"
                  style={{
                    backgroundColor: isToday ? 'var(--hero-bg)' : 'var(--hover-bg)',
                    borderTopLeftRadius: '11px',
                    borderTopRightRadius: '11px',
                    cursor: 'pointer',
                  }}
                  onClick={() => onSelectDate(day.date)}
                  title="Click to view full day timeline"
                >
                  <div className="d-flex align-items-center justify-content-between px-1">
                    <span
                      className={`small text-uppercase fw-bold ${
                        isToday ? 'text-primary' : 'theme-text-sub'
                      }`}
                    >
                      {day.day_name}
                    </span>
                    {isToday && (
                      <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>
                        TODAY
                      </span>
                    )}
                  </div>
                  <h6 className="theme-text-main fw-bold mb-1 fs-5">{day.day_number}</h6>
                  <div className="d-flex justify-content-center gap-2 small" style={{ fontSize: '0.72rem' }}>
                    <span className="theme-text-sub">{day.planned_hours}h plan</span>
                    <span className="text-success">{day.actual_hours}h act</span>
                  </div>
                </div>

                {/* Column Body: Session Cards */}
                <div className="p-2 d-flex flex-column gap-2 flex-grow-1" style={{ minHeight: '260px' }}>
                  {daySessions.length === 0 ? (
                    <div
                      className="border border-dashed rounded p-3 text-center my-auto d-flex flex-column align-items-center justify-content-center"
                      style={{ borderColor: 'var(--border-color)', opacity: 0.65 }}
                    >
                      <span className="text-muted small mb-2">No activities</span>
                      <button
                        className="btn btn-sm btn-outline-primary py-0 px-2 small"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => onOpenCreate(day.date)}
                      >
                        + Add
                      </button>
                    </div>
                  ) : (
                    daySessions.map((session) => {
                      const isCompleted = session.status === 'completed';
                      const isInProgress = session.status === 'in_progress';

                      return (
                        <div
                          key={session.id}
                          className="p-2 rounded position-relative shadow-sm"
                          style={{
                            backgroundColor: 'var(--card-bg)',
                            borderLeft: `4px solid ${getPriorityColor(session.priority)}`,
                            border: '1px solid var(--border-color)',
                            borderLeftWidth: '4px',
                            opacity: isCompleted ? 0.75 : 1,
                          }}
                        >
                          {/* Time & Status */}
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                              {formatShortTime(session.start_time)} - {formatShortTime(session.end_time)}
                            </span>
                            {isCompleted ? (
                              <FaCheckCircle className="text-success" size={11} title="Completed" />
                            ) : isInProgress ? (
                              <span className="badge bg-info text-dark p-1" style={{ fontSize: '0.65rem' }}>
                                Live
                              </span>
                            ) : null}
                          </div>

                          {/* Session Title */}
                          <p
                            className="theme-text-main fw-semibold mb-1 text-truncate"
                            style={{
                              fontSize: '0.82rem',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                            }}
                            title={session.title}
                          >
                            {session.title}
                          </p>

                          {/* Subject badge if linked */}
                          {session.topic?.subject?.name && (
                            <span
                              className="badge bg-secondary-subtle text-secondary small d-inline-block text-truncate mb-1"
                              style={{ maxWidth: '100%', fontSize: '0.65rem' }}
                            >
                              {session.topic.subject.name}
                            </span>
                          )}

                          {/* Action strip */}
                          <div className="d-flex align-items-center justify-content-between pt-1 mt-1 border-top" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="d-flex gap-1">
                              {!isCompleted && (
                                <button
                                  className="btn btn-sm btn-link p-0 text-success"
                                  title="Mark Completed"
                                  onClick={() => onUpdateStatus(session.id, 'completed')}
                                >
                                  <FaCheck size={11} />
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-link p-0 text-warning"
                                title="Reschedule Session"
                                onClick={() => onOpenReschedule(session)}
                              >
                                <FaHistory size={11} />
                              </button>
                            </div>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-link p-0 text-secondary"
                                title="Edit Session"
                                onClick={() => onOpenEdit(session)}
                              >
                                <FaPencilAlt size={10} />
                              </button>
                              <button
                                className="btn btn-sm btn-link p-0 text-danger"
                                title="Delete"
                                onClick={() => onDelete(session.id, session.title)}
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Activity Button at bottom of column */}
                <div className="p-2 border-top text-center" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    className="btn btn-sm btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-1"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => onOpenCreate(day.date)}
                  >
                    <FaPlus size={10} /> Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


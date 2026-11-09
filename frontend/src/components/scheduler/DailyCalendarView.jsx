import React from 'react';
import {
  FaClock,
  FaCheck,
  FaPlay,
  FaHistory,
  FaTrash,
  FaPencilAlt,
  FaCalendarPlus,
  FaFire,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from 'react-icons/fa';

export default function DailyCalendarView({
  dayData,
  loading,
  onOpenCreate,
  onOpenEdit,
  onOpenReschedule,
  onUpdateStatus,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="card border-0 p-5 text-center">
        <div className="spinner-border text-primary mx-auto mb-3" role="status" />
        <p className="theme-text-sub mb-0">Loading daily study timeline...</p>
      </div>
    );
  }

  const {
    date,
    formatted_date,
    planned_hours = 0,
    actual_hours = 0,
    schedules = [],
  } = dayData || {};

  const completedCount = schedules.filter((s) => s.status === 'completed').length;
  const inProgressCount = schedules.filter((s) => s.status === 'in_progress').length;
  const totalCount = schedules.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="badge bg-danger">Critical</span>;
      case 'high':
        return <span className="badge bg-warning text-dark">High</span>;
      case 'medium':
        return <span className="badge bg-primary">Medium</span>;
      case 'low':
      default:
        return <span className="badge bg-secondary">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge bg-success d-inline-flex align-items-center gap-1">
            <FaCheckCircle size={11} /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="badge bg-info text-dark d-inline-flex align-items-center gap-1">
            <FaPlay size={10} /> In Progress
          </span>
        );
      case 'missed':
        return (
          <span className="badge bg-danger d-inline-flex align-items-center gap-1">
            <FaTimesCircle size={11} /> Missed
          </span>
        );
      case 'rescheduled':
        return (
          <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1">
            <FaHistory size={10} /> Rescheduled
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
            <FaClock size={10} /> Scheduled
          </span>
        );
    }
  };

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-start border-4 border-danger';
      case 'high':
        return 'border-start border-4 border-warning';
      case 'medium':
        return 'border-start border-4 border-primary';
      default:
        return 'border-start border-4 border-secondary';
    }
  };

  // Format 24-hr time "10:00:00" to "10:00 AM"
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hh, mm] = timeStr.split(':');
    const h = parseInt(hh, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 === 0 ? 12 : h % 12;
    return `${formattedH}:${mm} ${ampm}`;
  };

  return (
    <div>
      {/* Day Overview Metrics */}
      <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-5">
              <h5 className="theme-text-main fw-bold mb-1">{formatted_date || date}</h5>
              <p className="theme-text-sub small mb-0">
                {totalCount} study {totalCount === 1 ? 'activity' : 'activities'} scheduled •{' '}
                {completedCount} completed ({completionRate}%)
              </p>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2 px-3 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="text-muted small d-block">Planned Study</span>
                <span className="theme-text-main fw-bold fs-5">{planned_hours}h</span>
              </div>
            </div>
            <div className="col-6 col-md-4 d-flex align-items-center justify-content-between">
              <div className="p-2 px-3 rounded flex-grow-1 me-3" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="text-muted small d-block">Actual Logged</span>
                <span className="text-success fw-bold fs-5">{actual_hours}h</span>
              </div>
              <button
                className="btn btn-primary d-inline-flex align-items-center gap-2 fw-semibold px-3 py-2 flex-shrink-0"
                onClick={() => onOpenCreate(date)}
              >
                <FaCalendarPlus /> Add Activity
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="progress" style={{ height: '7px' }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${completionRate}%` }}
                aria-valuenow={completionRate}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline or Empty State */}
      {schedules.length === 0 ? (
        <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div
            className="rounded-circle d-inline-flex align-items-center justify-center p-4 mx-auto mb-3"
            style={{ backgroundColor: 'var(--hover-bg)', width: '70px', height: '70px' }}
          >
            <FaClock size={28} className="text-muted" />
          </div>
          <h5 className="theme-text-main fw-bold">No Activities Scheduled for this Day</h5>
          <p className="theme-text-sub small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
            A disciplined daily schedule prevents cognitive fatigue and secures consistent focus. Block your next study
            window now.
          </p>
          <div>
            <button
              className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
              onClick={() => onOpenCreate(date)}
            >
              <FaCalendarPlus /> Schedule First Session
            </button>
          </div>
        </div>
      ) : (
        <div className="position-relative">
          {/* Vertical Timeline Track */}
          <div className="d-flex flex-column gap-3">
            {schedules.map((schedule, idx) => {
              const isPast =
                schedule.status === 'scheduled' &&
                new Date(`${schedule.scheduled_date}T${schedule.end_time}`) < new Date();

              return (
                <div
                  key={schedule.id}
                  className={`card shadow-sm ${getPriorityBorder(schedule.priority)}`}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    opacity: schedule.status === 'completed' ? 0.9 : 1,
                  }}
                >
                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="badge bg-dark border border-secondary text-light px-2 py-1 small fw-semibold font-monospace">
                          <FaClock className="me-1" size={11} />
                          {formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}
                        </span>
                        <span className="badge bg-secondary-subtle text-secondary small">
                          {schedule.estimated_minutes} mins
                        </span>
                        {getPriorityBadge(schedule.priority)}
                        {getStatusBadge(schedule.status)}
                        {schedule.recurrence && schedule.recurrence !== 'none' && (
                          <span className="badge bg-info-subtle text-info text-capitalize small">
                            {schedule.recurrence}
                          </span>
                        )}
                        {isPast && (
                          <span className="badge bg-danger-subtle text-danger small">
                            Time Window Ended
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                        {schedule.status === 'scheduled' && (
                          <button
                            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 fw-semibold"
                            title="Start Focus Session"
                            onClick={() => onUpdateStatus(schedule.id, 'in_progress')}
                          >
                            <FaPlay size={11} /> Start
                          </button>
                        )}

                        {schedule.status === 'in_progress' && (
                          <button
                            className="btn btn-sm btn-success d-inline-flex align-items-center gap-1 fw-semibold text-white"
                            title="Mark Session Completed"
                            onClick={() => onUpdateStatus(schedule.id, 'completed')}
                          >
                            <FaCheck size={11} /> Complete
                          </button>
                        )}

                        {schedule.status === 'scheduled' && (
                          <button
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            title="Mark Completed"
                            onClick={() => onUpdateStatus(schedule.id, 'completed')}
                          >
                            <FaCheck size={11} /> Done
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                          title="Reschedule Session"
                          onClick={() => onOpenReschedule(schedule)}
                        >
                          <FaHistory size={11} /> Shift
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="Edit Details"
                          onClick={() => onOpenEdit(schedule)}
                        >
                          <FaPencilAlt size={11} />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Session"
                          onClick={() => onDelete(schedule.id, schedule.title)}
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Linked Topic */}
                    <h6 className="theme-text-main fw-bold mb-1 fs-5">{schedule.title}</h6>

                    {schedule.topic && (
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                          {schedule.topic.subject?.name || 'Subject'}
                        </span>
                        <span className="theme-text-sub small">
                          Topic: <strong>{schedule.topic.title}</strong>
                        </span>
                      </div>
                    )}

                    {/* Description or Notes */}
                    {schedule.description && (
                      <p className="theme-text-sub small mb-0 mt-2 p-2 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                        <FaInfoCircle className="me-1 text-primary" size={12} />
                        {schedule.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


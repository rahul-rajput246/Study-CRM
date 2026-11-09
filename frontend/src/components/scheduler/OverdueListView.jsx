import React from 'react';
import {
  FaExclamationTriangle,
  FaHistory,
  FaCheck,
  FaTrash,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa';

export default function OverdueListView({
  overdueList = [],
  loading,
  onOpenReschedule,
  onUpdateStatus,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="card border-0 p-5 text-center">
        <div className="spinner-border text-primary mx-auto mb-3" role="status" />
        <p className="theme-text-sub mb-0">Loading overdue tasks...</p>
      </div>
    );
  }

  if (overdueList.length === 0) {
    return (
      <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mx-auto mb-3"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '70px', height: '70px' }}
        >
          <FaCheck size={28} />
        </div>
        <h5 className="theme-text-main fw-bold">Zero Overdue Tasks!</h5>
        <p className="theme-text-sub small mb-0" style={{ maxWidth: '420px', margin: '0 auto' }}>
          Your schedule is clean and up to date. Keep maintaining this consistency to achieve your ₹40 LPA+ goal.
        </p>
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="badge bg-danger">Critical</span>;
      case 'high':
        return <span className="badge bg-warning text-dark">High</span>;
      case 'medium':
        return <span className="badge bg-primary">Medium</span>;
      default:
        return <span className="badge bg-secondary">Low</span>;
    }
  };

  return (
    <div>
      {/* Educational Callout */}
      <div className="alert alert-warning border-0 shadow-sm d-flex align-items-start gap-3 p-3 mb-4 rounded-3">
        <FaExclamationTriangle className="text-warning flex-shrink-0 mt-1" size={20} />
        <div>
          <h6 className="fw-bold mb-1 text-dark">Overdue Task Recovery Protocol</h6>
          <p className="small mb-0 text-dark">
            Unfinished tasks left unaddressed create mental backlog. Use the <strong>Shift / Reschedule</strong> button
            to reallocate these items into realistic open slots today or later this week.
          </p>
        </div>
      </div>

      {/* Overdue Items List */}
      <div className="d-flex flex-column gap-3">
        {overdueList.map((item) => (
          <div
            key={item.id}
            className="card border-start border-4 border-warning shadow-sm"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="card-body p-3 p-md-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="badge bg-danger-subtle text-danger small d-inline-flex align-items-center gap-1">
                    <FaCalendarAlt size={10} /> Was scheduled: {item.scheduled_date}
                  </span>
                  <span className="badge bg-secondary-subtle text-secondary small d-inline-flex align-items-center gap-1">
                    <FaClock size={10} /> {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                  </span>
                  <span className="badge bg-secondary-subtle text-secondary small">
                    {item.estimated_minutes} mins
                  </span>
                  {getPriorityBadge(item.priority)}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 fw-semibold"
                    onClick={() => onOpenReschedule(item)}
                  >
                    <FaHistory size={11} /> Reschedule Slot
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                    onClick={() => onUpdateStatus(item.id, 'completed')}
                    title="Mark Done"
                  >
                    <FaCheck size={11} /> Mark Done
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(item.id, item.title)}
                    title="Dismiss / Delete"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>

              <h6 className="theme-text-main fw-bold mb-1 fs-5">{item.title}</h6>

              {item.topic && (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                    {item.topic.subject?.name || 'Subject'}
                  </span>
                  <span className="theme-text-sub small">
                    Topic: <strong>{item.topic.title}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


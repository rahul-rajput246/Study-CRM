import {
  FaClock,
  FaPlay,
  FaPause,
  FaRedo,
  FaCheck,
  FaCalendarPlus,
} from 'react-icons/fa';

export default function TodayScheduleWidget({ schedules = [], onStatusUpdate, onStartSession }) {
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="badge bg-danger">Critical</span>;
      case 'high':
        return <span className="badge bg-warning text-dark">High</span>;
      case 'medium':
        return <span className="badge bg-info text-dark">Medium</span>;
      default:
        return <span className="badge bg-secondary">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success bg-opacity-25 text-success">Completed</span>;
      case 'in_progress':
        return <span className="badge bg-primary bg-opacity-25 text-primary">In Progress</span>;
      case 'missed':
        return <span className="badge bg-danger bg-opacity-25 text-danger">Missed</span>;
      default:
        return <span className="badge bg-secondary bg-opacity-25 theme-text-sub">Scheduled</span>;
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header border-bottom d-flex justify-content-between align-items-center py-3">
        <h6 className="fw-bold mb-0 theme-text-main d-flex align-items-center gap-2">
          <FaClock className="text-primary" />
          Today's Scheduled Activities Timeline
        </h6>
        <span className="badge bg-secondary bg-opacity-10 theme-text-sub">
          {schedules.length} {schedules.length === 1 ? 'Activity' : 'Activities'}
        </span>
      </div>

      <div className="card-body p-0">
        {schedules.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaCalendarPlus className="fs-1 mb-2 opacity-50" />
            <p className="mb-0">No study sessions scheduled for today.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {schedules.map((item) => {
              const isCompleted = item.status === 'completed';
              const isInProgress = item.status === 'in_progress';

              return (
                <div
                  key={item.id}
                  className={`list-group-item p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom ${
                    isCompleted ? 'bg-success bg-opacity-10' : ''
                  }`}
                >
                  {/* Left: Time & Content */}
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="text-center p-2 rounded bg-secondary bg-opacity-10 flex-shrink-0"
                      style={{ minWidth: '75px' }}
                    >
                      <div className="fw-bold theme-text-main small font-monospace">{item.start_time}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        to {item.end_time}
                      </div>
                    </div>

                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span className="badge bg-secondary bg-opacity-15 theme-text-main small">{item.subject}</span>
                        {getPriorityBadge(item.priority)}
                        {getStatusBadge(item.status)}
                      </div>

                      <h6 className={`fw-bold mb-1 ${isCompleted ? 'text-decoration-line-through text-muted' : 'theme-text-main'}`}>
                        {item.title}
                      </h6>

                      {item.description && (
                        <p className="text-muted small mb-0" style={{ maxWidth: '540px' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-md-auto">
                    {!isCompleted && !isInProgress && (
                      <button
                        onClick={() => onStatusUpdate(item.id, 'in_progress')}
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        title="Start this session"
                      >
                        <FaPlay className="small" />
                        <span className="small">Start</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => onStatusUpdate(item.id, 'scheduled')}
                        className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                        title="Pause this session"
                      >
                        <FaPause className="small" />
                        <span className="small">Pause</span>
                      </button>
                    )}

                    {!isCompleted ? (
                      <button
                        onClick={() => onStatusUpdate(item.id, 'completed')}
                        className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm"
                        title="Mark as completed"
                      >
                        <FaCheck className="small" />
                        <span className="small">Done</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onStatusUpdate(item.id, 'scheduled')}
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        title="Mark as incomplete"
                      >
                        <FaRedo className="small" />
                        <span className="small">Reopen</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

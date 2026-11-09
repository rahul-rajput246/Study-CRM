import { useState } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaBookOpen,
  FaPlus,
  FaCalendarAlt,
  FaEye,
  FaTrash,
} from 'react-icons/fa';

export default function PhaseAccordion({
  phases = [],
  onOpenTopicModal,
  onOpenCreateTopicModal,
  onStatusChange,
  onDeleteTopic,
}) {
  // Default open the active phase (in_progress) or the first one
  const [openPhases, setOpenPhases] = useState(() => {
    const active = phases.find((p) => p.status === 'in_progress');
    return active ? { [active.id]: true } : { [phases[phases.length - 1]?.id]: true };
  });

  const togglePhase = (phaseId) => {
    setOpenPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const getPriorityBadge = (p) => {
    switch (p) {
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
      case 'needs_revision':
        return <span className="badge bg-warning bg-opacity-25 text-warning">Needs Revision</span>;
      default:
        return <span className="badge bg-secondary bg-opacity-25 theme-text-sub">Not Started</span>;
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {phases.map((phase) => {
        const isOpen = !!openPhases[phase.id];
        const isCompleted = phase.progress_percent === 100 || phase.status === 'completed';

        return (
          <div key={phase.id} className="card overflow-hidden shadow-sm">
            {/* Phase Header */}
            <div
              onClick={() => togglePhase(phase.id)}
              className="card-header py-3 px-4 d-flex justify-content-between align-items-center cursor-pointer user-select-none transition-all"
              style={{
                backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--card-bg)',
                cursor: 'pointer',
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-success text-white'
                      : phase.status === 'in_progress'
                      ? 'bg-primary text-white'
                      : 'bg-secondary bg-opacity-25 theme-text-sub'
                  }`}
                  style={{ width: '36px', height: '36px' }}
                >
                  {isCompleted ? <FaCheckCircle /> : phase.order_index}
                </div>

                <div>
                  <h6 className="fw-bold theme-text-main mb-0">{phase.title}</h6>
                  {phase.description && (
                    <small className="text-muted d-none d-md-block">{phase.description}</small>
                  )}
                </div>
              </div>

              {/* Right: Progress & Toggle */}
              <div className="d-flex align-items-center gap-4">
                <div className="d-flex flex-column align-items-end" style={{ minWidth: '100px' }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="small font-monospace fw-bold theme-text-main">
                      {phase.completed_topics}/{phase.total_topics} Topics
                    </span>
                    <span className="badge bg-secondary bg-opacity-20 theme-text-sub" style={{ fontSize: '0.65rem' }}>
                      {phase.progress_percent}%
                    </span>
                  </div>
                  <div className="progress w-100" style={{ height: '5px', backgroundColor: 'rgba(0,0,0,0.08)' }}>
                    <div
                      className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${phase.progress_percent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="theme-text-sub">
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
            </div>

            {/* Phase Body (Subjects & Topics) */}
            {isOpen && (
              <div className="card-body p-3 p-md-4 border-top">
                {(!phase.subjects || phase.subjects.length === 0) ? (
                  <p className="text-muted small text-center my-3">No subjects created under this phase yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {phase.subjects.map((subject) => (
                      <div key={subject.id} className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                        {/* Subject Title Bar */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <FaBookOpen className="text-primary small" />
                            <h6 className="fw-bold theme-text-main mb-0">{subject.title}</h6>
                            <span className="badge bg-secondary bg-opacity-20 theme-text-sub small">
                              {subject.completed_topics}/{subject.total_topics} Done
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenCreateTopicModal(subject.id)}
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-semibold"
                          >
                            <FaPlus className="small" />
                            <span className="small">Add Topic</span>
                          </button>
                        </div>

                        {/* Topics Grid */}
                        <div className="row g-3">
                          {subject.topics.map((topic) => {
                            const isTopicCompleted = topic.status === 'completed';

                            return (
                              <div key={topic.id} className="col-lg-6">
                                <div
                                  className={`card h-100 p-3 card-hover border-secondary border-opacity-25 ${
                                    isTopicCompleted ? 'bg-success bg-opacity-10' : ''
                                  }`}
                                >
                                  {/* Card Top: Badges */}
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                      {getPriorityBadge(topic.priority)}
                                      {getStatusBadge(topic.status)}
                                    </div>
                                    <span className="small font-monospace theme-text-sub" title="Duration">
                                      <FaClock className="text-muted me-1" />
                                      {topic.actual_minutes || 0}m / {topic.estimated_minutes}m
                                    </span>
                                  </div>

                                  {/* Title & Notes snippet */}
                                  <h6
                                    className={`fw-bold mb-1 ${
                                      isTopicCompleted ? 'text-decoration-line-through text-muted' : 'theme-text-main'
                                    }`}
                                  >
                                    {topic.title}
                                  </h6>

                                  {topic.personal_notes && (
                                    <p className="text-muted small mb-2 line-clamp-2" style={{ fontSize: '0.8rem' }}>
                                      {topic.personal_notes}
                                    </p>
                                  )}

                                  {/* Subtopic Checklist Progress */}
                                  <div className="mt-auto pt-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <span className="small theme-text-sub" style={{ fontSize: '0.75rem' }}>
                                        {topic.subtopics_completed || 0}/{topic.subtopics_count || 0} Checklist
                                      </span>
                                      <span className="small font-monospace theme-text-sub fw-semibold" style={{ fontSize: '0.75rem' }}>
                                        {topic.completion_percent || 0}%
                                      </span>
                                    </div>
                                    <div className="progress mb-3" style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.08)' }}>
                                      <div
                                        className={`progress-bar ${isTopicCompleted ? 'bg-success' : 'bg-primary'}`}
                                        style={{ width: `${topic.completion_percent || 0}%` }}
                                      ></div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-25">
                                      <button
                                        type="button"
                                        onClick={() => onOpenTopicModal(topic)}
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                                      >
                                        <FaEye className="small" />
                                        <span className="small fw-semibold">Inspect / Notes</span>
                                      </button>

                                      <div className="d-flex align-items-center gap-1">
                                        {/* Quick status dropdown */}
                                        <select
                                          className="form-select form-select-sm"
                                          style={{ width: 'auto', fontSize: '0.75rem' }}
                                          value={topic.status}
                                          onChange={(e) => onStatusChange(topic.id, e.target.value)}
                                        >
                                          <option value="not_started">Not Started</option>
                                          <option value="in_progress">In Progress</option>
                                          <option value="completed">Completed</option>
                                          <option value="needs_revision">Needs Revision</option>
                                        </select>

                                        <button
                                          type="button"
                                          onClick={() => onDeleteTopic(topic.id)}
                                          className="btn btn-sm btn-link text-danger p-1"
                                          title="Delete topic"
                                        >
                                          <FaTrash className="small" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


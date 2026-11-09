import { useState } from 'react';
import {
  FaTimes,
  FaCheckCircle,
  FaRegCircle,
  FaPlus,
  FaTrash,
  FaClock,
  FaCalendarAlt,
  FaSave,
  FaLightbulb,
  FaStickyNote,
  FaSyncAlt,
} from 'react-icons/fa';
import { roadmapService } from '../../services/roadmapService';

export default function TopicDetailModal({ show, onClose, topic, onTopicUpdated }) {
  const [activeTopic, setActiveTopic] = useState(topic);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [addingSubtopic, setAddingSubtopic] = useState(false);
  const [notes, setNotes] = useState(topic?.personal_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedAlert, setNotesSavedAlert] = useState(false);

  if (!show || !activeTopic) return null;

  const handleToggleSubtopic = async (subtopicId) => {
    try {
      const res = await roadmapService.toggleSubtopic(subtopicId);
      const updatedSubtopics = activeTopic.subtopics.map((st) =>
        st.id === subtopicId ? { ...st, is_completed: !st.is_completed } : st
      );

      const updated = {
        ...activeTopic,
        subtopics: updatedSubtopics,
        status: res.data.topic_status,
        completion_percent: res.data.completion_percent,
        subtopics_completed: res.data.completed_count,
      };

      setActiveTopic(updated);
      if (onTopicUpdated) onTopicUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to toggle subtopic.');
    }
  };

  const handleAddSubtopic = async (e) => {
    e.preventDefault();
    if (!newSubtopicTitle.trim()) return;

    setAddingSubtopic(true);
    try {
      const res = await roadmapService.createSubtopic(activeTopic.id, newSubtopicTitle.trim());
      const updatedSubtopics = [...(activeTopic.subtopics || []), res.data];
      const total = updatedSubtopics.length;
      const completed = updatedSubtopics.filter((st) => st.is_completed).count || 0;

      const updated = {
        ...activeTopic,
        subtopics: updatedSubtopics,
        subtopics_count: total,
      };

      setActiveTopic(updated);
      setNewSubtopicTitle('');
      if (onTopicUpdated) onTopicUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to add subtopic.');
    } finally {
      setAddingSubtopic(false);
    }
  };

  const handleDeleteSubtopic = async (subtopicId) => {
    try {
      await roadmapService.deleteSubtopic(subtopicId);
      const updatedSubtopics = activeTopic.subtopics.filter((st) => st.id !== subtopicId);
      const updated = {
        ...activeTopic,
        subtopics: updatedSubtopics,
        subtopics_count: updatedSubtopics.length,
      };
      setActiveTopic(updated);
      if (onTopicUpdated) onTopicUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to delete subtopic.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await roadmapService.updateTopicStatus(activeTopic.id, newStatus);
      const updated = { ...activeTopic, status: newStatus };
      if (newStatus === 'completed') updated.completion_percent = 100;
      setActiveTopic(updated);
      if (onTopicUpdated) onTopicUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to change topic status.');
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await roadmapService.updateTopic(activeTopic.id, { personal_notes: notes });
      const updated = { ...activeTopic, personal_notes: notes };
      setActiveTopic(updated);
      setNotesSavedAlert(true);
      setTimeout(() => setNotesSavedAlert(false), 2500);
      if (onTopicUpdated) onTopicUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
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

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content card border-secondary border-opacity-50 shadow-lg">
          {/* Header */}
          <div className="modal-header border-bottom py-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-secondary bg-opacity-25 theme-text-sub small">
                  {activeTopic.subject || 'Module'}
                </span>
                {getPriorityBadge(activeTopic.priority)}
              </div>
              <h5 className="modal-title fw-bold theme-text-main mb-0">{activeTopic.title}</h5>
            </div>
            <button type="button" className="btn btn-sm btn-link theme-text-sub p-0" onClick={onClose}>
              <FaTimes className="fs-5" />
            </button>
          </div>

          <div className="modal-body p-4 d-flex flex-column gap-4" style={{ maxHeight: '74vh', overflowY: 'auto' }}>
            {/* Quick Status Bar */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 p-3 rounded-3 bg-secondary bg-opacity-10">
              <div className="d-flex align-items-center gap-3">
                <span className="small fw-semibold theme-text-sub">Status:</span>
                <div className="btn-group btn-group-sm">
                  {['not_started', 'in_progress', 'completed', 'needs_revision'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`btn text-capitalize ${
                        activeTopic.status === st ? 'btn-primary fw-bold' : 'btn-outline-secondary'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 small font-monospace theme-text-sub">
                <span title="Estimated vs Actual Duration">
                  <FaClock className="text-primary me-1" />
                  {activeTopic.actual_minutes || 0}m / {activeTopic.estimated_minutes}m
                </span>
                {activeTopic.target_date && (
                  <span title="Target Completion Date">
                    <FaCalendarAlt className="text-info me-1" />
                    {activeTopic.target_date}
                  </span>
                )}
              </div>
            </div>

            {/* Overall Topic Progress Bar */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small fw-bold theme-text-main">Subtopic Mastery Checklist</span>
                <span className="small font-monospace theme-text-sub fw-semibold">
                  {activeTopic.completion_percent || 0}% Complete
                </span>
              </div>
              <div className="progress" style={{ height: '7px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${activeTopic.completion_percent || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Subtopics Checklist & Add Input */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-2 mb-3">
                {(!activeTopic.subtopics || activeTopic.subtopics.length === 0) ? (
                  <p className="text-muted small mb-0">No subtopics defined yet. Add key implementation steps below.</p>
                ) : (
                  activeTopic.subtopics.map((st) => (
                    <div
                      key={st.id}
                      className="d-flex align-items-center justify-content-between p-2 rounded-2 border border-secondary border-opacity-25 hover-bg transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtopic(st.id)}
                        className="btn btn-sm btn-link text-start text-decoration-none p-0 d-flex align-items-center gap-2 flex-grow-1"
                      >
                        {st.is_completed ? (
                          <FaCheckCircle className="text-success fs-5 flex-shrink-0" />
                        ) : (
                          <FaRegCircle className="theme-text-sub fs-5 flex-shrink-0" />
                        )}
                        <span
                          className={`small ${
                            st.is_completed ? 'text-decoration-line-through text-muted' : 'theme-text-main fw-semibold'
                          }`}
                        >
                          {st.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubtopic(st.id)}
                        className="btn btn-sm btn-link text-danger p-0 ms-2"
                        title="Remove subtopic"
                      >
                        <FaTrash className="small" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Subtopic Form */}
              <form onSubmit={handleAddSubtopic} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Add another subtopic or concept step..."
                  value={newSubtopicTitle}
                  onChange={(e) => setNewSubtopicTitle(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={addingSubtopic || !newSubtopicTitle.trim()}
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 text-nowrap"
                >
                  <FaPlus className="small" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Learning Objectives (Feynman Method) */}
            {activeTopic.learning_objectives && activeTopic.learning_objectives.length > 0 && (
              <div className="card p-3">
                <h6 className="fw-bold theme-text-main d-flex align-items-center gap-2 mb-2">
                  <FaLightbulb className="text-warning" />
                  Key Learning Objectives (Must Explain Independently)
                </h6>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {activeTopic.learning_objectives.map((obj, i) => (
                    <li key={i} className="small d-flex align-items-start gap-2 theme-text-sub">
                      <span className="badge bg-primary bg-opacity-15 text-primary mt-1" style={{ fontSize: '0.65rem' }}>
                        {i + 1}
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personal Study Notes (Markdown / Gotchas) */}
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold theme-text-main d-flex align-items-center gap-2 mb-0">
                  <FaStickyNote className="text-info" />
                  Personal Study Notes & Critical Gotchas
                </h6>
                {notesSavedAlert && (
                  <span className="badge bg-success small animate__animated animate__fadeIn">
                    Notes saved!
                  </span>
                )}
              </div>
              <textarea
                className="form-control mb-2"
                rows="4"
                placeholder="Write your mental models, edge-case observations, or questions that stumped you..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="btn btn-sm btn-primary d-flex align-items-center gap-2 fw-semibold px-3"
                >
                  <FaSave className="small" />
                  <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top py-3">
            <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


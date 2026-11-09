import { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaLightbulb, FaCheckSquare } from 'react-icons/fa';

export default function CreateTopicModal({ show, onClose, subjects = [], onCreated, defaultSubjectId }) {
  const [formData, setFormData] = useState({
    subject_id: defaultSubjectId || (subjects[0]?.id || ''),
    title: '',
    description: '',
    priority: 'high',
    estimated_minutes: 90,
    target_date: '',
    personal_notes: '',
  });

  const [objectives, setObjectives] = useState(['']);
  const [subtopics, setSubtopics] = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleAddObjective = () => setObjectives([...objectives, '']);
  const handleRemoveObjective = (idx) => setObjectives(objectives.filter((_, i) => i !== idx));
  const handleObjectiveChange = (idx, val) => {
    const updated = [...objectives];
    updated[idx] = val;
    setObjectives(updated);
  };

  const handleAddSubtopic = () => setSubtopics([...subtopics, '']);
  const handleRemoveSubtopic = (idx) => setSubtopics(subtopics.filter((_, i) => i !== idx));
  const handleSubtopicChange = (idx, val) => {
    const updated = [...subtopics];
    updated[idx] = val;
    setSubtopics(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        learning_objectives: objectives.filter((o) => o.trim() !== ''),
        subtopics: subtopics.filter((s) => s.trim() !== ''),
      };

      await onCreated(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create topic.');
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
              <FaLightbulb className="text-warning" />
              Add New Learning Topic
            </h5>
            <button type="button" className="btn btn-sm btn-link theme-text-sub p-0" onClick={onClose}>
              <FaTimes className="fs-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 d-flex flex-column gap-3" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              {/* Subject & Priority Row */}
              <div className="row g-3">
                <div className="col-md-7">
                  <label className="form-label small fw-semibold theme-text-sub">Module / Subject</label>
                  <select
                    className="form-select"
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.phase_title ? `${sub.phase_title} → ` : ''}{sub.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-semibold theme-text-sub">Priority Level</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="critical">Critical (Must Master)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Topic Title */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">Topic Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. JavaScript Closures, Lexical Scope & Garbage Collection"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Duration & Target Date */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Estimated Duration (Mins)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="10"
                    max="1440"
                    step="15"
                    value={formData.estimated_minutes}
                    onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) || 60 })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Target Completion Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">Description & Overview</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Summary of this concept and why it matters in production engineering..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              {/* Learning Objectives Checklist */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold theme-text-sub mb-0">
                    Learning Objectives (Feynman Method: What must you be able to explain?)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold d-flex align-items-center gap-1"
                  >
                    <FaPlus className="small" /> Add Objective
                  </button>
                </div>
                {objectives.map((obj, i) => (
                  <div key={i} className="input-group mb-2">
                    <span className="input-group-text bg-secondary bg-opacity-10 theme-text-sub small">{i + 1}</span>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Explain how closure retains references in heap memory"
                      value={obj}
                      onChange={(e) => handleObjectiveChange(i, e.target.value)}
                    />
                    {objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(i)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <FaTrash className="small" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Subtopics Checklist */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold theme-text-sub mb-0">
                    Subtopics & Implementation Checklist
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSubtopic}
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold d-flex align-items-center gap-1"
                  >
                    <FaPlus className="small" /> Add Subtopic
                  </button>
                </div>
                {subtopics.map((sub, i) => (
                  <div key={i} className="input-group mb-2">
                    <span className="input-group-text bg-secondary bg-opacity-10 text-primary small">
                      <FaCheckSquare />
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Practical memoization wrapper implementation"
                      value={sub}
                      onChange={(e) => handleSubtopicChange(i, e.target.value)}
                    />
                    {subtopics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtopic(i)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <FaTrash className="small" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Personal Notes */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">Personal Notes & Gotchas</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Edge cases, common mistakes, or interview pointers..."
                  value={formData.personal_notes}
                  onChange={(e) => setFormData({ ...formData, personal_notes: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-top py-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-sm btn-primary fw-semibold px-4 shadow-sm">
                {submitting ? 'Saving Topic...' : 'Save Topic to Roadmap'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


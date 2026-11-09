import React, { useState } from 'react';
import { FaTimes, FaPlus, FaBrain, FaLightbulb, FaBookOpen } from 'react-icons/fa';
import { revisionService } from '../../services/revisionService';

export default function AddRevisionModal({ show, onClose, onCreated, topics = [] }) {
  const [formData, setFormData] = useState({
    topic_id: '',
    concept_prompt: '',
    key_takeaways: '',
    confidence_score: 3,
    next_revision_date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleTopicSelect = (topicId) => {
    const selected = topics.find((t) => t.id === parseInt(topicId));
    setFormData((prev) => ({
      ...prev,
      topic_id: topicId,
      concept_prompt: selected
        ? `Explain: ${selected.title}. How does it work and what are key engineering considerations?`
        : prev.concept_prompt,
      key_takeaways: selected?.learning_objectives || selected?.description || prev.key_takeaways,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic_id) {
      setError('Please select a roadmap topic.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await revisionService.createRevisionItem({
        ...formData,
        topic_id: parseInt(formData.topic_id),
      });
      if (onCreated) {
        onCreated();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create revision item.');
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
        <div
          className="modal-content card border-0 shadow-lg"
          style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}
        >
          <div className="modal-header border-bottom py-3 px-4">
            <h5 className="modal-title fw-bold theme-text-main d-flex align-items-center gap-2">
              <FaBrain className="text-primary" /> Add Topic to Spaced Repetition
            </h5>
            <button type="button" className="btn btn-sm btn-link theme-text-sub p-0" onClick={onClose}>
              <FaTimes className="fs-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 d-flex flex-column gap-3" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              {/* Topic Picker */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">
                  Select Roadmap Topic <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.topic_id}
                  onChange={(e) => handleTopicSelect(e.target.value)}
                  required
                >
                  <option value="">-- Choose Topic from Roadmap --</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.subject_title ? `[${t.subject_title}] ` : ''}{t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Concept Question Prompt */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub d-flex align-items-center gap-1">
                  <FaLightbulb className="text-warning" /> Active Recall Challenge Prompt
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. How does Event Delegation work? Explain memory advantages."
                  value={formData.concept_prompt}
                  onChange={(e) => setFormData({ ...formData, concept_prompt: e.target.value })}
                />
              </div>

              {/* Key Takeaways */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub d-flex align-items-center gap-1">
                  <FaBookOpen className="text-success" /> Core Key Takeaways / Solution (Revealed Answer)
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Key engineering points, syntax, time complexity, or Feynman summary."
                  value={formData.key_takeaways}
                  onChange={(e) => setFormData({ ...formData, key_takeaways: e.target.value })}
                />
              </div>

              {/* Confidence & First Review Date */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Initial Confidence</label>
                  <select
                    className="form-select"
                    value={formData.confidence_score}
                    onChange={(e) => setFormData({ ...formData, confidence_score: parseInt(e.target.value) })}
                  >
                    <option value={1}>1 - Completely Unfamiliar</option>
                    <option value={2}>2 - Weak / Shaky</option>
                    <option value={3}>3 - Moderate (Standard)</option>
                    <option value={4}>4 - Confident</option>
                    <option value={5}>5 - Mastered</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">First Review Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.next_revision_date}
                    onChange={(e) => setFormData({ ...formData, next_revision_date: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-top py-3 px-4">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-sm btn-primary fw-semibold px-4"
              >
                {submitting ? 'Adding...' : 'Add to Spaced Repetition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


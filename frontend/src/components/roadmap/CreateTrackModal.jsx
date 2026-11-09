import { useState } from 'react';
import { FaTimes, FaLayerGroup } from 'react-icons/fa';

export default function CreateTrackModal({ show, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    track_type: 'fullstack',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onCreated(formData);
      setFormData({ title: '', track_type: 'fullstack', description: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create roadmap track.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card border-secondary border-opacity-50 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold theme-text-main d-flex align-items-center gap-2">
              <FaLayerGroup className="text-primary" />
              Create New Learning Track
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-link theme-text-sub p-0"
              onClick={onClose}
            >
              <FaTimes className="fs-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 d-flex flex-column gap-3">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <div>
                <label className="form-label small fw-semibold theme-text-sub">Track Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Microservices with Docker & Kubernetes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label small fw-semibold theme-text-sub">Track Category</label>
                <select
                  className="form-select"
                  value={formData.track_type}
                  onChange={(e) => setFormData({ ...formData, track_type: e.target.value })}
                >
                  <option value="fullstack">Full-Stack Development</option>
                  <option value="dsa">DSA & Problem-Solving</option>
                  <option value="system_design">System Design & Architecture</option>
                  <option value="interview">Interview Preparation</option>
                  <option value="foundation">Computer Science Foundation</option>
                </select>
              </div>

              <div>
                <label className="form-label small fw-semibold theme-text-sub">Description & Target Outcomes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="What concepts and real-world skills will you master in this track?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-top py-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-sm btn-primary fw-semibold px-4">
                {submitting ? 'Creating...' : 'Create Track'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { FaTimes, FaCode, FaLightbulb, FaShieldAlt, FaSave } from 'react-icons/fa';
import { problemService } from '../../services/problemService';

export default function ProblemFormModal({
  show,
  onClose,
  editingProblem = null,
  onSaved,
  topics = [],
}) {
  const [formData, setFormData] = useState({
    title: '',
    topic_id: '',
    platform: 'leetcode',
    problem_url: '',
    difficulty: 'medium',
    pattern: 'Sliding Window',
    language: 'JavaScript',
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    initial_understanding: '',
    approach: '',
    pseudocode: '',
    code_solution: '',
    test_cases: '',
    mistakes_made: '',
    key_learnings: '',
    independence_level: 'independent',
    time_spent_minutes: 30,
    status: 'solved',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      if (editingProblem) {
        setFormData({
          title: editingProblem.title || '',
          topic_id: editingProblem.topic_id ? String(editingProblem.topic_id) : '',
          platform: editingProblem.platform || 'leetcode',
          problem_url: editingProblem.problem_url || '',
          difficulty: editingProblem.difficulty || 'medium',
          pattern: editingProblem.pattern || 'Sliding Window',
          language: editingProblem.language || 'JavaScript',
          time_complexity: editingProblem.time_complexity || 'O(N)',
          space_complexity: editingProblem.space_complexity || 'O(1)',
          initial_understanding: editingProblem.initial_understanding || '',
          approach: editingProblem.approach || '',
          pseudocode: editingProblem.pseudocode || '',
          code_solution: editingProblem.code_solution || '',
          test_cases: editingProblem.test_cases || '',
          mistakes_made: editingProblem.mistakes_made || '',
          key_learnings: editingProblem.key_learnings || '',
          independence_level: editingProblem.independence_level || 'independent',
          time_spent_minutes: editingProblem.time_spent_minutes || 30,
          status: editingProblem.status || 'solved',
        });
      } else {
        setFormData({
          title: '',
          topic_id: '',
          platform: 'leetcode',
          problem_url: '',
          difficulty: 'medium',
          pattern: 'Sliding Window',
          language: 'JavaScript',
          time_complexity: 'O(N)',
          space_complexity: 'O(1)',
          initial_understanding: '',
          approach: '',
          pseudocode: '',
          code_solution: '',
          test_cases: '',
          mistakes_made: '',
          key_learnings: '',
          independence_level: 'independent',
          time_spent_minutes: 30,
          status: 'solved',
        });
      }
      setError('');
    }
  }, [show, editingProblem]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        topic_id: formData.topic_id ? parseInt(formData.topic_id) : null,
        time_spent_minutes: parseInt(formData.time_spent_minutes) || 30,
      };

      if (editingProblem) {
        await problemService.updateProblem(editingProblem.id, payload);
      } else {
        await problemService.createProblem(payload);
      }

      if (onSaved) {
        onSaved();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content card border-0 shadow-lg"
          style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}
        >
          <div className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <h5 className="modal-title fw-bold theme-text-main d-flex align-items-center gap-2">
              <FaCode className="text-primary" />
              {editingProblem ? 'Edit Problem Log' : 'Log Solved Engineering Problem'}
            </h5>
            <button type="button" className="btn btn-sm btn-link theme-text-sub p-0" onClick={onClose}>
              <FaTimes className="fs-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 d-flex flex-column gap-3" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              {/* Row 1: Title & Platform */}
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label small fw-semibold theme-text-sub">Problem Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. LeetCode #3: Longest Substring Without Repeating Characters"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold theme-text-sub">Platform *</label>
                  <select
                    className="form-select"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  >
                    <option value="leetcode">LeetCode</option>
                    <option value="hackerrank">HackerRank</option>
                    <option value="gfg">GeeksforGeeks</option>
                    <option value="project_feature">FoodieHub Project / System Design</option>
                    <option value="interview">Interview Mock</option>
                    <option value="other">Other / Custom</option>
                  </select>
                </div>
              </div>

              {/* Row 2: URL & Linked Topic */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Problem URL (Optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://leetcode.com/problems/..."
                    value={formData.problem_url}
                    onChange={(e) => setFormData({ ...formData, problem_url: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Link to Roadmap Topic (Optional)</label>
                  <select
                    className="form-select"
                    value={formData.topic_id}
                    onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                  >
                    <option value="">-- General Problem Solving --</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.subject_title ? `[${t.subject_title}] ` : ''}{t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Difficulty, Pattern, Language, Complexity */}
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold theme-text-sub">Difficulty *</label>
                  <select
                    className="form-select"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold theme-text-sub">Pattern / Technique</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sliding Window, DP, Trees"
                    value={formData.pattern}
                    onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label small fw-semibold theme-text-sub">Language</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label small fw-semibold theme-text-sub">Time Complex.</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="O(N)"
                    value={formData.time_complexity}
                    onChange={(e) => setFormData({ ...formData, time_complexity: e.target.value })}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label small fw-semibold theme-text-sub">Space Complex.</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="O(1)"
                    value={formData.space_complexity}
                    onChange={(e) => setFormData({ ...formData, space_complexity: e.target.value })}
                  />
                </div>
              </div>

              {/* Independence Level Highlight Box */}
              <div className="p-3 rounded-3 border" style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-color)' }}>
                <label className="form-label small fw-bold theme-text-main d-flex align-items-center gap-2 mb-2">
                  <FaShieldAlt className="text-primary" /> Cognitive Independence Level *
                </label>
                <div className="row g-2">
                  <div className="col-md-3">
                    <div
                      className={`p-2 rounded border cursor-pointer h-100 ${
                        formData.independence_level === 'independent' ? 'border-success bg-success bg-opacity-10' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setFormData({ ...formData, independence_level: 'independent' })}
                    >
                      <div className="fw-bold small text-success">🟢 Independent (100%)</div>
                      <small className="text-muted" style={{ fontSize: '0.68rem' }}>Solved completely on own without hints</small>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div
                      className={`p-2 rounded border cursor-pointer h-100 ${
                        formData.independence_level === 'small_hint' ? 'border-warning bg-warning bg-opacity-10' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setFormData({ ...formData, independence_level: 'small_hint' })}
                    >
                      <div className="fw-bold small text-warning">🟡 Small Hint</div>
                      <small className="text-muted" style={{ fontSize: '0.68rem' }}>Needed a minor nudge / edge case hint</small>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div
                      className={`p-2 rounded border cursor-pointer h-100 ${
                        formData.independence_level === 'significant_guidance' ? 'border-primary bg-primary bg-opacity-10' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setFormData({ ...formData, independence_level: 'significant_guidance' })}
                    >
                      <div className="fw-bold small text-primary">🟠 Guided</div>
                      <small className="text-muted" style={{ fontSize: '0.68rem' }}>Followed tutorial / video walkthrough</small>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div
                      className={`p-2 rounded border cursor-pointer h-100 ${
                        formData.independence_level === 'solution_memorized' ? 'border-danger bg-danger bg-opacity-10' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setFormData({ ...formData, independence_level: 'solution_memorized' })}
                    >
                      <div className="fw-bold small text-danger">🔴 Memorized</div>
                      <small className="text-muted" style={{ fontSize: '0.68rem' }}>Looked at code; must revisit independently</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Spent & Status Row */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Time Spent (Minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.time_spent_minutes}
                    onChange={(e) => setFormData({ ...formData, time_spent_minutes: e.target.value })}
                    min="1"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="solved">Solved</option>
                    <option value="attempted">Attempted / In Progress</option>
                    <option value="needs_revisit">Needs Revisit</option>
                  </select>
                </div>
              </div>

              {/* Initial Understanding */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">1. Initial Understanding & Problem Statement *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Explain what the problem is asking in your own simple words."
                  value={formData.initial_understanding}
                  onChange={(e) => setFormData({ ...formData, initial_understanding: e.target.value })}
                  required
                />
              </div>

              {/* Approach */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">2. Algorithmic Approach & Pattern Intuition *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Why did you choose this pattern? What data structures are used and how do pointers/variables transition?"
                  value={formData.approach}
                  onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                  required
                />
              </div>

              {/* Solution Code */}
              <div>
                <label className="form-label small fw-semibold theme-text-sub">3. Solution Code / Implementation *</label>
                <textarea
                  className="form-control font-monospace"
                  rows="6"
                  style={{ backgroundColor: '#0d1117', color: '#c9d1d9' }}
                  placeholder="Paste your clean, documented code here..."
                  value={formData.code_solution}
                  onChange={(e) => setFormData({ ...formData, code_solution: e.target.value })}
                  required
                />
              </div>

              {/* Mistakes & Learnings Row */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Mistakes Made / Edge Cases Tripped</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Did brute force TLE? Did empty string cause bounds exception?"
                    value={formData.mistakes_made}
                    onChange={(e) => setFormData({ ...formData, mistakes_made: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold theme-text-sub">Key Learnings & Takeaways *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Core permanent takeaway you will apply in future technical interviews."
                    value={formData.key_learnings}
                    onChange={(e) => setFormData({ ...formData, key_learnings: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-top py-3 px-4">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-sm fw-semibold px-4 d-inline-flex align-items-center gap-1 shadow-sm"
              >
                <FaSave /> {submitting ? 'Saving Problem...' : editingProblem ? 'Update Problem Log' : 'Save Problem Log'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


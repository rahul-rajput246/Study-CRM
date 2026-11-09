import React, { useState } from 'react';
import {
  FaTimes,
  FaExternalLinkAlt,
  FaClock,
  FaCode,
  FaExclamationTriangle,
  FaLightbulb,
  FaPencilAlt,
  FaTrash,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';

export default function ProblemDetailModal({ show, onClose, problem, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  if (!show || !problem) return null;

  const handleCopyCode = () => {
    if (problem.code_solution) {
      navigator.clipboard.writeText(problem.code_solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'easy':
        return <span className="badge bg-success">Easy</span>;
      case 'medium':
        return <span className="badge bg-warning text-dark">Medium</span>;
      case 'hard':
        return <span className="badge bg-danger">Hard</span>;
      default:
        return <span className="badge bg-secondary">{diff}</span>;
    }
  };

  const getIndependenceBadge = (level) => {
    switch (level) {
      case 'independent':
        return <span className="badge bg-success">🟢 100% Independent</span>;
      case 'small_hint':
        return <span className="badge bg-warning text-dark">🟡 Small Hint Needed</span>;
      case 'significant_guidance':
        return <span className="badge bg-orange text-white" style={{ backgroundColor: '#ea580c' }}>🟠 Guided Walkthrough</span>;
      case 'solution_memorized':
        return <span className="badge bg-danger">🔴 Solution Memorized (Needs Revisit)</span>;
      default:
        return <span className="badge bg-secondary">{level}</span>;
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content card border-0 shadow-lg"
          style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}
        >
          {/* Header */}
          <div className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="badge bg-primary-subtle text-primary text-uppercase small">
                {problem.platform}
              </span>
              {getDifficultyBadge(problem.difficulty)}
              {getIndependenceBadge(problem.independence_level)}
              {problem.pattern && (
                <span className="badge bg-info-subtle text-info small">
                  Pattern: {problem.pattern}
                </span>
              )}
            </div>
            <button type="button" className="btn btn-sm btn-link theme-text-sub p-0" onClick={onClose}>
              <FaTimes className="fs-5" />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-4" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            {/* Title & External Link */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="theme-text-main fw-bold mb-0">{problem.title}</h4>
              {problem.problem_url && (
                <a
                  href={problem.problem_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                >
                  Open Problem <FaExternalLinkAlt size={10} />
                </a>
              )}
            </div>

            {/* Complexity & Runtime Metrics Bar */}
            <div
              className="p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
              style={{ backgroundColor: 'var(--hover-bg)' }}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="small theme-text-sub">
                  Language: <strong className="theme-text-main">{problem.language || 'JavaScript'}</strong>
                </span>
                <span className="small theme-text-sub">
                  Time: <strong className="font-monospace text-primary">{problem.time_complexity || '—'}</strong>
                </span>
                <span className="small theme-text-sub">
                  Space: <strong className="font-monospace text-primary">{problem.space_complexity || '—'}</strong>
                </span>
              </div>
              <div className="small theme-text-sub d-flex align-items-center gap-1">
                <FaClock className="text-muted" /> Time Spent: <strong>{problem.time_spent_minutes} mins</strong>
              </div>
            </div>

            {/* Structured Insights Grid */}
            <div className="d-flex flex-column gap-4">
              {/* 1. Initial Understanding */}
              <div>
                <h6 className="theme-text-main fw-bold mb-1">1. Initial Understanding & Problem Breakdown</h6>
                <p className="theme-text-sub small mb-0 p-3 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                  {problem.initial_understanding}
                </p>
              </div>

              {/* 2. Approach & Pattern Intuition */}
              <div>
                <h6 className="theme-text-main fw-bold mb-1">2. Algorithmic Approach & Pattern Intuition</h6>
                <p className="theme-text-sub small mb-0 p-3 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                  {problem.approach}
                </p>
              </div>

              {/* 3. Pseudocode (if provided) */}
              {problem.pseudocode && (
                <div>
                  <h6 className="theme-text-main fw-bold mb-1">3. Pseudocode / High-Level Logic</h6>
                  <pre
                    className="p-3 rounded small mb-0 font-monospace"
                    style={{ backgroundColor: '#0d1117', color: '#58a6ff', whiteSpace: 'pre-wrap' }}
                  >
                    {problem.pseudocode}
                  </pre>
                </div>
              )}

              {/* 4. Solution Code Block */}
              <div>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <h6 className="theme-text-main fw-bold mb-0 d-flex align-items-center gap-2">
                    <FaCode className="text-primary" /> Solution Code ({problem.language || 'Code'})
                  </h6>
                  <button
                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 py-1 px-2"
                    style={{ fontSize: '0.75rem' }}
                    onClick={handleCopyCode}
                  >
                    {copied ? <FaCheck className="text-success" /> : <FaCopy />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre
                  className="p-3 rounded small font-monospace mb-0"
                  style={{
                    backgroundColor: '#0d1117',
                    color: '#c9d1d9',
                    maxHeight: '340px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <code>{problem.code_solution}</code>
                </pre>
              </div>

              {/* 5. Mistakes Made & Traps Caught */}
              {problem.mistakes_made && (
                <div
                  className="p-3 rounded border-start border-4 border-warning"
                  style={{ backgroundColor: 'var(--hover-bg)' }}
                >
                  <h6 className="theme-text-main fw-bold mb-1 d-flex align-items-center gap-2">
                    <FaExclamationTriangle className="text-warning" /> Mistakes Made & Edge Cases Caught
                  </h6>
                  <p className="theme-text-sub small mb-0">{problem.mistakes_made}</p>
                </div>
              )}

              {/* 6. Key Learnings & Engineering Takeaways */}
              <div
                className="p-3 rounded border-start border-4 border-success"
                style={{ backgroundColor: 'var(--hover-bg)' }}
              >
                <h6 className="theme-text-main fw-bold mb-1 d-flex align-items-center gap-2">
                  <FaLightbulb className="text-success" /> Core Key Learnings (Permanent Takeaway)
                </h6>
                <p className="theme-text-sub small mb-0">{problem.key_learnings}</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer border-top py-3 px-4 d-flex align-items-center justify-content-between">
            <button
              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
              onClick={() => onDelete(problem.id, problem.title)}
            >
              <FaTrash size={11} /> Delete Log
            </button>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                onClick={() => onEdit(problem)}
              >
                <FaPencilAlt size={11} /> Edit Problem Log
              </button>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


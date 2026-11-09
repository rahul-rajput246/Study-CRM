import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaBrain,
  FaEye,
  FaCheckCircle,
  FaRedo,
  FaTrophy,
  FaTag,
  FaLightbulb,
  FaBookOpen,
} from 'react-icons/fa';
import { revisionService } from '../../services/revisionService';

export default function ActiveRecallModal({
  show,
  onClose,
  queue = [],
  initialIndex = 0,
  onSessionCompleted,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [revealed, setRevealed] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedSession, setCompletedSession] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    if (show) {
      setCurrentIndex(initialIndex);
      setRevealed(false);
      setReviewNotes('');
      setCompletedSession(false);
      setReviewedCount(0);
    }
  }, [show, initialIndex]);

  if (!show) return null;

  const currentCard = queue[currentIndex];

  const handleRating = async (rating) => {
    if (!currentCard || submitting) return;

    setSubmitting(true);
    try {
      await revisionService.reviewItem(currentCard.id, {
        rating,
        review_notes: reviewNotes.trim() || null,
      });

      setReviewedCount((prev) => prev + 1);

      if (currentIndex + 1 < queue.length) {
        setCurrentIndex((prev) => prev + 1);
        setRevealed(false);
        setReviewNotes('');
      } else {
        setCompletedSession(true);
        if (onSessionCompleted) {
          onSessionCompleted();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit revision review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content card border-0 shadow-lg"
          style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}
        >
          {/* Header */}
          <div className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <FaBrain className="text-primary fs-5" />
              <h5 className="modal-title fw-bold theme-text-main mb-0">
                Active Recall Mode
              </h5>
              {!completedSession && queue.length > 0 && (
                <span className="badge bg-primary text-white ms-2" style={{ fontSize: '0.75rem' }}>
                  Card {currentIndex + 1} of {queue.length}
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link theme-text-sub p-0"
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes className="fs-5" />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-4" style={{ minHeight: '380px' }}>
            {completedSession ? (
              /* Session Completion Celebration Screen */
              <div className="text-center py-5">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mx-auto mb-3"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '85px', height: '85px' }}
                >
                  <FaTrophy size={38} />
                </div>
                <h4 className="theme-text-main fw-bold mb-2">Recall Session Completed!</h4>
                <p className="theme-text-sub small mb-4" style={{ maxWidth: '440px', margin: '0 auto' }}>
                  You reviewed <strong>{reviewedCount}</strong> topic{reviewedCount === 1 ? '' : 's'}. SuperMemo SM-2 intervals have been calculated and your revision schedule is updated.
                </p>
                <button className="btn btn-primary px-4 py-2 fw-semibold" onClick={onClose}>
                  Done & Return to Revision Center
                </button>
              </div>
            ) : !currentCard ? (
              <div className="text-center py-5">
                <FaCheckCircle className="text-success fs-1 mb-3" />
                <h5 className="theme-text-main fw-bold">No Cards in Due Queue</h5>
                <p className="theme-text-sub small">All topics have been revised!</p>
              </div>
            ) : (
              <div>
                {/* Meta Pills */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    {currentCard.topic?.subject?.name && (
                      <span className="badge bg-secondary-subtle text-secondary small">
                        {currentCard.topic.subject.name}
                      </span>
                    )}
                    <span className="badge bg-primary-subtle text-primary small">
                      Repetition #{currentCard.repetition_count}
                    </span>
                    <span className="badge bg-info-subtle text-info small">
                      Interval: {currentCard.interval_days}d
                    </span>
                    <span className="badge bg-dark border border-secondary text-light small font-monospace">
                      EF: {parseFloat(currentCard.ease_factor).toFixed(2)}
                    </span>
                  </div>

                  <span className="text-muted small">
                    Target: ₹40 LPA+ Mastery
                  </span>
                </div>

                {/* Progress bar across queue */}
                <div className="progress mb-4" style={{ height: '5px' }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
                  />
                </div>

                {/* Topic Title */}
                <h4 className="theme-text-main fw-bold mb-3">{currentCard.topic?.title}</h4>

                {/* Prompt Question Box (Active Recall Challenge) */}
                <div
                  className="p-4 rounded-3 border mb-4"
                  style={{
                    backgroundColor: 'var(--hover-bg)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-semibold small text-uppercase">
                    <FaLightbulb /> Active Recall Challenge
                  </div>
                  <p className="theme-text-main fs-5 fw-medium mb-0" style={{ lineHeight: 1.45 }}>
                    {currentCard.concept_prompt ||
                      currentCard.topic?.description ||
                      'Explain this core programming concept in your own words. How does it work under the hood and what problem does it solve?'}
                  </p>
                </div>

                {/* Reveal Answer Section */}
                {!revealed ? (
                  <div className="text-center py-3">
                    <button
                      className="btn btn-primary px-4 py-3 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm fs-6"
                      onClick={() => setRevealed(true)}
                    >
                      <FaEye /> Show Key Insights & Solution
                    </button>
                    <p className="text-muted small mt-2 mb-0">
                      Formulate the answer in your mind or speak it out loud before checking.
                    </p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 animate-fade-in">
                    {/* Key Takeaways & Solution */}
                    <div
                      className="p-4 rounded-3 border"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)',
                        borderLeft: '4px solid var(--primary-color)',
                      }}
                    >
                      <h6 className="theme-text-main fw-bold mb-2 d-flex align-items-center gap-2">
                        <FaBookOpen className="text-success" /> Core Engineering Insights
                      </h6>
                      <div className="theme-text-sub small" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        {currentCard.key_takeaways ||
                          currentCard.topic?.learning_objectives ||
                          'Review this topic in depth to reinforce synaptic memory pathways.'}
                      </div>
                    </div>

                    {/* Reflection Note Input */}
                    <div>
                      <label className="form-label small fw-semibold theme-text-sub mb-1">
                        Revision Note / Gotcha Learned (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Remember to use e.target.closest() when button has child SVGs"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                      />
                    </div>

                    {/* 4 SM-2 Scoring Buttons */}
                    <div className="pt-2">
                      <div className="text-center mb-2">
                        <span className="small theme-text-sub fw-semibold">
                          Rate your active recall accuracy:
                        </span>
                      </div>
                      <div className="row g-2">
                        {/* Again */}
                        <div className="col-6 col-md-3">
                          <button
                            className="btn btn-outline-danger w-100 p-2 text-start d-flex flex-column"
                            disabled={submitting}
                            onClick={() => handleRating('again')}
                          >
                            <span className="fw-bold fs-6">🟥 Again</span>
                            <small className="opacity-75" style={{ fontSize: '0.7rem' }}>
                              Blackout / 1d reset
                            </small>
                          </button>
                        </div>

                        {/* Hard */}
                        <div className="col-6 col-md-3">
                          <button
                            className="btn btn-outline-warning w-100 p-2 text-start d-flex flex-column"
                            disabled={submitting}
                            onClick={() => handleRating('hard')}
                          >
                            <span className="fw-bold fs-6">🟧 Hard</span>
                            <small className="opacity-75" style={{ fontSize: '0.7rem' }}>
                              Struggled / Minor inc
                            </small>
                          </button>
                        </div>

                        {/* Good */}
                        <div className="col-6 col-md-3">
                          <button
                            className="btn btn-outline-primary w-100 p-2 text-start d-flex flex-column"
                            disabled={submitting}
                            onClick={() => handleRating('good')}
                          >
                            <span className="fw-bold fs-6">🟦 Good</span>
                            <small className="opacity-75" style={{ fontSize: '0.7rem' }}>
                              Solid recall / Standard
                            </small>
                          </button>
                        </div>

                        {/* Easy */}
                        <div className="col-6 col-md-3">
                          <button
                            className="btn btn-outline-success w-100 p-2 text-start d-flex flex-column"
                            disabled={submitting}
                            onClick={() => handleRating('easy')}
                          >
                            <span className="fw-bold fs-6">🟩 Easy</span>
                            <small className="opacity-75" style={{ fontSize: '0.7rem' }}>
                              Instant recall / Bonus
                            </small>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


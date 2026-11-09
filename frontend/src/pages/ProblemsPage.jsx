import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCode,
  FaPlus,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaClock,
  FaTrash,
  FaPencilAlt,
  FaEye,
  FaRedo,
  FaCheckCircle,
} from 'react-icons/fa';
import { problemService } from '../services/problemService';
import { roadmapService } from '../services/roadmapService';
import ProblemStatCards from '../components/problems/ProblemStatCards';
import ProblemDetailModal from '../components/problems/ProblemDetailModal';
import ProblemFormModal from '../components/problems/ProblemFormModal';

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedIndependence, setSelectedIndependence] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [allTopics, setAllTopics] = useState([]);

  // Fetch roadmap topics for topic linker
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const roadmaps = await roadmapService.getRoadmaps();
        const extracted = [];
        roadmaps.forEach((rm) => {
          (rm.phases || []).forEach((ph) => {
            (ph.subjects || []).forEach((sub) => {
              (sub.topics || []).forEach((top) => {
                extracted.push({
                  id: top.id,
                  title: top.title,
                  subject_title: sub.name,
                });
              });
            });
          });
        });
        setAllTopics(extracted);
      } catch (err) {
        console.error('Failed to load roadmap topics:', err);
      }
    };
    fetchTopics();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedIndependence) params.independence_level = selectedIndependence;
      if (selectedStatus) params.status = selectedStatus;

      const [probRes, anaRes] = await Promise.all([
        problemService.getProblems(params),
        problemService.getAnalytics(),
      ]);

      setProblems(probRes.data || []);
      setAnalytics(anaRes.analytics || null);
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDifficulty, selectedIndependence, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDetail = (problem) => {
    setSelectedProblem(problem);
    setShowDetailModal(true);
  };

  const handleOpenCreate = () => {
    setEditingProblem(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (problem) => {
    setShowDetailModal(false);
    setEditingProblem(problem);
    setShowFormModal(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete problem log "${title}"?`)) return;
    try {
      await problemService.deleteProblem(id);
      setShowDetailModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to delete problem log.');
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'easy':
        return <span className="badge bg-success-subtle text-success border border-success-subtle">Easy</span>;
      case 'medium':
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Medium</span>;
      case 'hard':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Hard</span>;
      default:
        return <span className="badge bg-secondary">{diff}</span>;
    }
  };

  const getIndependenceBadge = (level) => {
    switch (level) {
      case 'independent':
        return <span className="badge bg-success">100% Solo</span>;
      case 'small_hint':
        return <span className="badge bg-warning text-dark">Hint Used</span>;
      case 'significant_guidance':
        return <span className="badge bg-primary">Guided</span>;
      case 'solution_memorized':
        return <span className="badge bg-danger">Memorized</span>;
      default:
        return <span className="badge bg-secondary">{level}</span>;
    }
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary px-2 py-1 small fw-semibold">Phase 8</span>
            <span className="theme-text-sub small fw-medium">Problem-Solving & Independence Tracker</span>
          </div>
          <h2 className="theme-text-main fw-bold mb-1">Problem-Solving Development Log</h2>
          <p className="theme-text-sub small mb-0">
            Track independence ratings, algorithmic patterns, and core learnings towards ₹40 LPA+ standards.
          </p>
        </div>

        <button
          className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm"
          onClick={handleOpenCreate}
        >
          <FaPlus size={12} /> Log Solved Problem
        </button>
      </div>

      {/* Analytics Stat Cards */}
      <ProblemStatCards analytics={analytics} />

      {/* Filter & Search Bar */}
      <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Search */}
            <div className="col-12 col-md-4">
              <div className="position-relative">
                <FaSearch
                  className="position-absolute top-50 translate-middle-y text-muted ms-3"
                  size={12}
                />
                <input
                  type="text"
                  className="form-control form-control-sm ps-5"
                  placeholder="Search problem title, pattern, learnings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Independence Filter */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedIndependence}
                onChange={(e) => setSelectedIndependence(e.target.value)}
              >
                <option value="">All Independence Levels</option>
                <option value="independent">🟢 100% Independent</option>
                <option value="small_hint">🟡 Small Hint Needed</option>
                <option value="significant_guidance">🟠 Guided Walkthrough</option>
                <option value="solution_memorized">🔴 Solution Memorized</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-md-3 d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="solved">Solved</option>
                <option value="attempted">Attempted</option>
                <option value="needs_revisit">Needs Revisit Queue</option>
              </select>

              {(searchQuery || selectedDifficulty || selectedIndependence || selectedStatus) && (
                <button
                  className="btn btn-sm btn-outline-secondary flex-shrink-0"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDifficulty('');
                    setSelectedIndependence('');
                    setSelectedStatus('');
                  }}
                  title="Reset Filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Problems Feed */}
      {loading ? (
        <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="spinner-border text-primary mx-auto mb-3" role="status" />
          <p className="theme-text-sub mb-0">Loading problem solving logs...</p>
        </div>
      ) : problems.length === 0 ? (
        <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mx-auto mb-3"
            style={{ backgroundColor: 'var(--hover-bg)', width: '70px', height: '70px' }}
          >
            <FaCode size={28} className="text-muted" />
          </div>
          <h5 className="theme-text-main fw-bold">No Problem Logs Found</h5>
          <p className="theme-text-sub small mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
            Logging your problems with initial approach, mistakes, and independence rating is how top engineers turn passive tutorials into permanent problem-solving confidence.
          </p>
          <div>
            <button className="btn btn-primary btn-sm px-4 fw-semibold" onClick={handleOpenCreate}>
              <FaPlus size={10} className="me-1" /> Log Your First Problem
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {problems.map((prob) => (
            <div key={prob.id} className="col-12 col-md-6 col-xl-4">
              <div
                className="card h-100 shadow-sm border cursor-pointer card-hover"
                style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', cursor: 'pointer' }}
                onClick={() => handleOpenDetail(prob)}
              >
                <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
                  <div>
                    {/* Top Row: Platform, Difficulty, Independence */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-2">
                      <span className="badge bg-secondary-subtle text-secondary small text-uppercase">
                        {prob.platform}
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        {getDifficultyBadge(prob.difficulty)}
                        {getIndependenceBadge(prob.independence_level)}
                      </div>
                    </div>

                    {/* Title */}
                    <h6 className="theme-text-main fw-bold mb-2 fs-5 text-truncate-2" title={prob.title}>
                      {prob.title}
                    </h6>

                    {/* Pattern & Complexity Badges */}
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                      {prob.pattern && (
                        <span className="badge bg-info-subtle text-info small">
                          {prob.pattern}
                        </span>
                      )}
                      {prob.time_complexity && (
                        <span className="badge bg-dark border border-secondary text-light small font-monospace">
                          {prob.time_complexity}
                        </span>
                      )}
                      <span className="text-muted small d-inline-flex align-items-center gap-1">
                        <FaClock size={10} /> {prob.time_spent_minutes}m
                      </span>
                    </div>

                    {/* Excerpt of Key Learnings */}
                    <p
                      className="theme-text-sub small mb-3 p-2 rounded text-truncate-2"
                      style={{ backgroundColor: 'var(--hover-bg)', fontSize: '0.8rem' }}
                    >
                      <strong>Learning:</strong> {prob.key_learnings}
                    </p>
                  </div>

                  {/* Card Bottom: Actions */}
                  <div className="pt-2 border-top d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                      className="btn btn-sm btn-link p-0 text-primary fw-semibold d-inline-flex align-items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(prob);
                      }}
                    >
                      <FaEye size={11} /> View Solution
                    </button>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-link p-0 text-secondary"
                        title="Edit Log"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(prob);
                        }}
                      >
                        <FaPencilAlt size={11} />
                      </button>
                      <button
                        className="btn btn-sm btn-link p-0 text-danger"
                        title="Delete Log"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(prob.id, prob.title);
                        }}
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Inspection Modal */}
      <ProblemDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        problem={selectedProblem}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit Form Modal */}
      <ProblemFormModal
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        editingProblem={editingProblem}
        onSaved={fetchData}
        topics={allTopics}
      />
    </div>
  );
}


import React from 'react';
import {
  FaCheckCircle,
  FaLightbulb,
  FaClock,
  FaExclamationCircle,
  FaShieldAlt,
  FaChartLine,
} from 'react-icons/fa';

export default function ProblemStatCards({ analytics }) {
  if (!analytics) return null;

  const {
    total_solved = 0,
    independence_ratio_pct = 100,
    benchmark = {},
    difficulty = {},
    independence = {},
    time = {},
    needs_revisit_count = 0,
  } = analytics;

  return (
    <div className="row g-3 mb-4">
      {/* 1. Independence Ratio & ₹40 LPA+ Benchmark */}
      <div className="col-12 col-md-6 col-xl-3">
        <div
          className="card border-0 shadow-sm p-3 h-100"
          style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small fw-semibold">Independence Ratio</span>
            <div className="rounded p-2 bg-success bg-opacity-10 text-success">
              <FaShieldAlt size={16} />
            </div>
          </div>
          <div className="d-flex align-items-baseline gap-2 mb-1">
            <h3 className="theme-text-main fw-bold mb-0">{independence_ratio_pct}%</h3>
            <span
              className={`badge small fw-bold ${
                independence_ratio_pct >= 70
                  ? 'bg-success'
                  : independence_ratio_pct >= 50
                  ? 'bg-primary'
                  : 'bg-warning text-dark'
              }`}
              style={{ fontSize: '0.68rem' }}
            >
              {benchmark.tier === 'elite' ? 'Elite' : benchmark.tier === 'proficient' ? 'Proficient' : 'Developing'}
            </span>
          </div>

          <div className="progress my-2" style={{ height: '6px', backgroundColor: 'var(--hover-bg)' }}>
            <div
              className={`progress-bar ${
                independence_ratio_pct >= 70 ? 'bg-success' : 'bg-primary'
              }`}
              role="progressbar"
              style={{ width: `${independence_ratio_pct}%` }}
            />
          </div>

          <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
            Target: ≥70% without hints (₹40 LPA+ benchmark)
          </span>
        </div>
      </div>

      {/* 2. Total Solved & Difficulty Distribution */}
      <div className="col-12 col-md-6 col-xl-3">
        <div
          className="card border-0 shadow-sm p-3 h-100"
          style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small fw-semibold">Problems Solved</span>
            <div className="rounded p-2 bg-primary bg-opacity-10 text-primary">
              <FaCheckCircle size={16} />
            </div>
          </div>
          <h3 className="theme-text-main fw-bold mb-2">{total_solved}</h3>
          <div className="d-flex align-items-center gap-1">
            <span className="badge bg-success-subtle text-success small" style={{ fontSize: '0.7rem' }}>
              {difficulty.easy || 0} Easy
            </span>
            <span className="badge bg-warning-subtle text-warning small" style={{ fontSize: '0.7rem' }}>
              {difficulty.medium || 0} Medium
            </span>
            <span className="badge bg-danger-subtle text-danger small" style={{ fontSize: '0.7rem' }}>
              {difficulty.hard || 0} Hard
            </span>
          </div>
        </div>
      </div>

      {/* 3. Time Invested */}
      <div className="col-12 col-md-6 col-xl-3">
        <div
          className="card border-0 shadow-sm p-3 h-100"
          style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small fw-semibold">Time Invested</span>
            <div className="rounded p-2 bg-info bg-opacity-10 text-info">
              <FaClock size={16} />
            </div>
          </div>
          <h3 className="theme-text-main fw-bold mb-1">{time.total_hours || 0}h</h3>
          <span className="theme-text-sub small">
            Avg {time.avg_minutes_per_problem || 0} mins / problem
          </span>
        </div>
      </div>

      {/* 4. Independence Breakdown & Needs Revisit */}
      <div className="col-12 col-md-6 col-xl-3">
        <div
          className="card border-0 shadow-sm p-3 h-100"
          style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-muted small fw-semibold">Independence Breakdown</span>
            <div className="rounded p-2 bg-secondary bg-opacity-10 text-secondary">
              <FaLightbulb size={16} />
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-between small mb-1">
            <span className="theme-text-sub">Solo Solved:</span>
            <strong className="text-success">{independence.independent || 0}</strong>
          </div>
          <div className="d-flex align-items-center justify-content-between small mb-1">
            <span className="theme-text-sub">Needed Hints:</span>
            <strong className="text-warning">{independence.small_hint || 0}</strong>
          </div>
          <div className="d-flex align-items-center justify-content-between small">
            <span className="theme-text-sub">Revisit Queue:</span>
            <strong className={needs_revisit_count > 0 ? 'text-danger' : 'text-muted'}>
              {needs_revisit_count}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}


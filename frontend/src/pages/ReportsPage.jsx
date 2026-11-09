import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  FaChartLine,
  FaCalendarAlt,
  FaClock,
  FaBullseye,
  FaShieldAlt,
  FaBrain,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaSyncAlt,
} from 'react-icons/fa';
import { reportService } from '../services/reportService';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const { theme } = useTheme();
  const [period, setPeriod] = useState('last_7_days'); // 'last_7_days' | 'last_30_days' | 'all_time'
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportService.getComprehensiveReport(period);
      setReport(res.report || null);
    } catch (err) {
      console.error('Failed to load performance report:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor, font: { weight: '600' } },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
  };

  // Planned vs Actual Trend Chart Data
  const trendData = {
    labels: report?.trend_chart?.labels || [],
    datasets: [
      {
        label: 'Planned Study (Hours)',
        data: report?.trend_chart?.planned || [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Actual Study (Hours)',
        data: report?.trend_chart?.actual || [],
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Subject Distribution Doughnut Data
  const subjectLabels = report?.subject_distribution?.labels || [];
  const subjectHours = report?.subject_distribution?.hours || [];
  const doughnutColors = [
    '#6366f1',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6',
    '#14b8a6',
  ];

  const subjectData = {
    labels: subjectLabels.length > 0 ? subjectLabels : ['General Study'],
    datasets: [
      {
        data: subjectHours.length > 0 ? subjectHours : [1],
        backgroundColor: doughnutColors.slice(0, Math.max(1, subjectLabels.length)),
        borderWidth: 0,
      },
    ],
  };

  // Problem Solving Independence Bar Data
  const independenceData = {
    labels: report?.independence_chart?.labels || [],
    datasets: [
      {
        label: 'Problems Count',
        data: report?.independence_chart?.counts || [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // 100% Solo
          'rgba(245, 158, 11, 0.8)', // Small hint
          'rgba(59, 130, 246, 0.8)', // Guided
          'rgba(239, 68, 68, 0.8)', // Memorized
        ],
        borderRadius: 6,
      },
    ],
  };

  // Day of Week Rhythm Data
  const dowData = {
    labels: report?.day_of_week_rhythm?.labels || [],
    datasets: [
      {
        label: 'Hours Studied',
        data: report?.day_of_week_rhythm?.hours || [],
        backgroundColor: 'rgba(139, 92, 246, 0.65)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary px-2 py-1 small fw-semibold">Phase 10</span>
            <span className="theme-text-sub small fw-medium">Quantitative Analytics & Velocity</span>
          </div>
          <h2 className="theme-text-main fw-bold mb-1">Performance & Analytics Reports</h2>
          <p className="theme-text-sub small mb-0">
            Adherence velocity, subject distribution, and algorithmic independence trends towards ₹40 LPA+.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="btn-group shadow-sm" role="group">
          <button
            type="button"
            className={`btn px-3 py-2 fw-semibold ${
              period === 'last_7_days' ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setPeriod('last_7_days')}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className={`btn px-3 py-2 fw-semibold ${
              period === 'last_30_days' ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setPeriod('last_30_days')}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className={`btn px-3 py-2 fw-semibold ${
              period === 'all_time' ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setPeriod('all_time')}
          >
            All-Time
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="spinner-border text-primary mx-auto mb-3" role="status" />
          <p className="theme-text-sub mb-0">Computing quantitative performance analytics...</p>
        </div>
      ) : (
        <div>
          {/* Executive KPI Stat Cards */}
          <div className="row g-3 mb-4">
            {/* Total Actual Hours */}
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Actual Study Logged</span>
                  <div className="rounded p-2 bg-success bg-opacity-10 text-success">
                    <FaClock size={16} />
                  </div>
                </div>
                <h3 className="theme-text-main fw-bold mb-1">{report?.summary?.total_actual_hours || 0}h</h3>
                <span className="small text-success fw-semibold">
                  Avg {report?.summary?.avg_daily_hours || 0}h / day
                </span>
              </div>
            </div>

            {/* Planned vs Velocity */}
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Schedule Velocity</span>
                  <div className="rounded p-2 bg-primary bg-opacity-10 text-primary">
                    <FaBullseye size={16} />
                  </div>
                </div>
                <h3 className="theme-text-main fw-bold mb-1">{report?.summary?.adherence_velocity_pct || 100}%</h3>
                <span className="small theme-text-sub">
                  Planned: {report?.summary?.total_planned_hours || 0}h
                </span>
              </div>
            </div>

            {/* Problem Independence */}
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Independence Ratio</span>
                  <div className="rounded p-2 bg-warning bg-opacity-10 text-warning">
                    <FaShieldAlt size={16} />
                  </div>
                </div>
                <h3 className="theme-text-main fw-bold mb-1">{report?.summary?.independence_ratio_pct || 100}%</h3>
                <span className="small theme-text-sub">
                  {report?.summary?.total_problems_solved || 0} problems solved
                </span>
              </div>
            </div>

            {/* Spaced Repetition Retention */}
            <div className="col-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Retention Accuracy</span>
                  <div className="rounded p-2 bg-info bg-opacity-10 text-info">
                    <FaBrain size={16} />
                  </div>
                </div>
                <h3 className="theme-text-main fw-bold mb-1">{report?.summary?.retention_accuracy_pct || 100}%</h3>
                <span className="small theme-text-sub">
                  {report?.summary?.total_flashcards || 0} cards in memory
                </span>
              </div>
            </div>
          </div>

          {/* Charts Row 1: Planned vs Actual & Subject Distribution */}
          <div className="row g-4 mb-4">
            {/* Planned vs Actual Trend Chart */}
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h6 className="theme-text-main fw-bold mb-3 d-flex align-items-center gap-2">
                    <FaChartLine className="text-primary" /> Planned vs Actual Study Hours ({period === 'last_7_days' ? 'Last 7 Days' : 'Last 30 Days'})
                  </h6>
                  <div style={{ height: '300px' }}>
                    <Bar data={trendData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
                <div className="card-body p-4 text-center">
                  <h6 className="theme-text-main fw-bold mb-3">Curriculum Time Distribution</h6>
                  <div style={{ height: '240px' }} className="d-flex align-items-center justify-content-center">
                    <Doughnut
                      data={subjectData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 } } },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Independence Breakdown & Day of Week Rhythm */}
          <div className="row g-4 mb-4">
            {/* Problem Solving Independence Breakdown */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h6 className="theme-text-main fw-bold mb-3 d-flex align-items-center gap-2">
                    <FaShieldAlt className="text-success" /> Problem Solving Independence Breakdown
                  </h6>
                  <div style={{ height: '250px' }}>
                    <Bar
                      data={independenceData}
                      options={{
                        ...chartOptions,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Day of Week Consistency */}
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <h6 className="theme-text-main fw-bold mb-3 d-flex align-items-center gap-2">
                    <FaCalendarAlt className="text-info" /> Study Rhythm by Day of Week
                  </h6>
                  <div style={{ height: '250px' }}>
                    <Bar
                      data={dowData}
                      options={{
                        ...chartOptions,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cognitive Career Insights & Recommendations Panel */}
          <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h5 className="theme-text-main fw-bold mb-3 d-flex align-items-center gap-2">
                <FaBullseye className="text-danger" /> ₹40 LPA+ Cognitive Career Assessment
              </h5>

              <div className="row g-4">
                {/* Strengths */}
                <div className="col-12 col-md-4">
                  <div className="p-3 rounded h-100 border-start border-4 border-success" style={{ backgroundColor: 'var(--hover-bg)' }}>
                    <h6 className="text-success fw-bold mb-2 d-flex align-items-center gap-2">
                      <FaCheckCircle /> Strengths & Momentum
                    </h6>
                    <ul className="theme-text-sub small mb-0 ps-3">
                      {(report?.insights?.strengths || []).map((st, i) => (
                        <li key={i} className="mb-1">{st}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottlenecks */}
                <div className="col-12 col-md-4">
                  <div className="p-3 rounded h-100 border-start border-4 border-warning" style={{ backgroundColor: 'var(--hover-bg)' }}>
                    <h6 className="text-warning fw-bold mb-2 d-flex align-items-center gap-2">
                      <FaExclamationTriangle /> Bottlenecks to Address
                    </h6>
                    <ul className="theme-text-sub small mb-0 ps-3">
                      {(report?.insights?.bottlenecks || []).map((bn, i) => (
                        <li key={i} className="mb-1">{bn}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="col-12 col-md-4">
                  <div className="p-3 rounded h-100 border-start border-4 border-primary" style={{ backgroundColor: 'var(--hover-bg)' }}>
                    <h6 className="text-primary fw-bold mb-2 d-flex align-items-center gap-2">
                      <FaLightbulb /> Mentor Action Items
                    </h6>
                    <ul className="theme-text-sub small mb-0 ps-3">
                      {(report?.insights?.recommendations || []).map((rec, i) => (
                        <li key={i} className="mb-1">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { API_ROUTES } from '../constants/apiRoutes';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import TodayScheduleWidget from '../components/dashboard/TodayScheduleWidget';
import WeeklyStudyChart from '../components/dashboard/WeeklyStudyChart';
import SubjectProgressWidget from '../components/dashboard/SubjectProgressWidget';
import {
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaFire,
  FaChartLine,
  FaSyncAlt,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaBullseye,
  FaSync,
} from 'react-icons/fa';

export default function DashboardPage({ onNavigateTab }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, scheduleRes] = await Promise.all([
        api.get(API_ROUTES.DASHBOARD.OVERVIEW),
        api.get(API_ROUTES.DASHBOARD.TODAY_SCHEDULE),
      ]);
      setData(overviewRes.data);
      setSchedules(scheduleRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard data from Laravel API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStatusUpdate = async (scheduleId, newStatus) => {
    setUpdatingId(scheduleId);
    try {
      await api.patch(`/dashboard/schedules/${scheduleId}/status`, {
        status: newStatus,
      });
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update schedule status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="theme-text-sub">Loading your StudyOS Command Center...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-3">
        <FaExclamationTriangle className="fs-3 flex-shrink-0" />
        <div>
          <h6 className="alert-heading fw-bold mb-1">Failed to Connect to Laravel API</h6>
          <p className="mb-0 small">{error}</p>
        </div>
      </div>
    );
  }

  const { today, metrics, weekly_trend, subject_progress } = data || {};

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Header & Hero Bar */}
      <div className="hero-card p-4">
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary">Command Center</span>
              <span className="theme-text-sub small fw-semibold">&bull; {today?.formatted_date}</span>
            </div>
            <h2 className="fw-bold theme-text-main mb-1">
              Welcome Back, {user?.name}!
            </h2>
            <p className="theme-text-sub mb-3 small">
              You have completed <strong className="theme-text-main">{today?.actual_hours}h</strong> of your{' '}
              <strong className="theme-text-main">{today?.daily_goal_hours}h</strong> daily engineering goal.
            </p>

            {/* Daily Goal Progress Bar */}
            <div className="d-flex align-items-center gap-3" style={{ maxWidth: '480px' }}>
              <div className="progress flex-grow-1" style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${today?.goal_completion_percent}%` }}
                ></div>
              </div>
              <span className="small font-monospace fw-bold theme-text-main">
                {today?.goal_completion_percent}%
              </span>
            </div>
          </div>

          {/* Highest Priority Box */}
          <div className="col-lg-4">
            <div className="hero-box p-3 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small text-warning fw-bold d-flex align-items-center gap-1">
                  <FaBullseye /> Highest-Priority Task
                </span>
                <span className="badge bg-danger">Critical</span>
              </div>
              {today?.highest_priority_task ? (
                <div>
                  <h6 className="theme-text-main fw-bold mb-1 text-truncate">
                    {today.highest_priority_task.title}
                  </h6>
                  <div className="theme-text-sub small font-monospace">
                    Slot: {today.highest_priority_task.start_time} - {today.highest_priority_task.end_time}
                  </div>
                </div>
              ) : (
                <div className="theme-text-sub small">All priority tasks cleared!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Overview Cards (8 Cards) */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Today's Scheduled Hours"
            value={`${today?.scheduled_hours}h`}
            subtitle={`${today?.scheduled_minutes} planned mins`}
            icon={FaCalendarCheck}
            color="primary"
            onClick={() => onNavigateTab && onNavigateTab('schedule')}
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Actual Study Hours"
            value={`${today?.actual_hours}h`}
            subtitle={`${today?.actual_minutes} active mins logged`}
            icon={FaClock}
            color="success"
            badgeText={`${today?.goal_completion_percent}% of Goal`}
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Tasks Completed"
            value={today?.tasks_completed}
            subtitle={`${today?.tasks_pending} pending remaining`}
            icon={FaCheckCircle}
            color="info"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Current Study Streak"
            value={`${metrics?.current_streak_days} Days`}
            subtitle="Consistency is key to mastery"
            icon={FaFire}
            color="danger"
            badgeText="Active 🔥"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Weekly Consistency"
            value={`${metrics?.weekly_consistency_percent}%`}
            subtitle="7-day study adherence"
            icon={FaChartLine}
            color="primary"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Topics Due for Revision"
            value={metrics?.topics_due_revision}
            subtitle="Spaced repetition recall"
            icon={FaSyncAlt}
            color="warning"
            badgeText="Attention"
            onClick={() => onNavigateTab && onNavigateTab('revision')}
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Pending Study Tasks"
            value={today?.tasks_pending}
            subtitle="In progress or scheduled"
            icon={FaHourglassHalf}
            color="secondary"
          />
        </div>

        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Upcoming Sessions"
            value={metrics?.upcoming_sessions_count}
            subtitle="Next scheduled blocks"
            icon={FaCalendarAlt}
            color="info"
          />
        </div>
      </div>

      {/* 3. Main Row: Today's Schedule Timeline & Charts */}
      <div className="row g-4">
        {/* Left Column: Today's Schedule Timeline (Width 7) */}
        <div className="col-lg-7">
          <TodayScheduleWidget
            schedules={schedules}
            onStatusUpdate={handleStatusUpdate}
            onStartSession={() => onNavigateTab('timer')}
          />
        </div>

        {/* Right Column: Weekly Study Chart & Subject Progress (Width 5) */}
        <div className="col-lg-5 d-flex flex-column gap-4">
          {/* Weekly Planned vs Actual Hours Chart */}
          <div className="card">
            <div className="card-header border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 theme-text-main d-flex align-items-center gap-2">
                <FaChartLine className="text-primary" />
                Planned vs Actual Study Hours (Last 7 Days)
              </h6>
              <button
                onClick={fetchDashboardData}
                className="btn btn-sm btn-link theme-text-sub p-0"
                title="Refresh"
              >
                <FaSync />
              </button>
            </div>
            <div className="card-body p-3">
              <WeeklyStudyChart trendData={weekly_trend} />
            </div>
          </div>

          {/* Subject-wise Progress */}
          <SubjectProgressWidget subjects={subject_progress} />
        </div>
      </div>
    </div>
  );
}

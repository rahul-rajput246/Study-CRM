import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCalendarAlt,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarCheck,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaSyncAlt,
  FaClock,
} from 'react-icons/fa';
import { scheduleService } from '../services/scheduleService';
import { roadmapService } from '../services/roadmapService';
import DailyCalendarView from '../components/scheduler/DailyCalendarView';
import WeeklyCalendarView from '../components/scheduler/WeeklyCalendarView';
import MonthlyCalendarView from '../components/scheduler/MonthlyCalendarView';
import OverdueListView from '../components/scheduler/OverdueListView';
import OverdueNoticeBanner from '../components/scheduler/OverdueNoticeBanner';
import ScheduleModal from '../components/scheduler/ScheduleModal';
import RescheduleModal from '../components/scheduler/RescheduleModal';

export default function SchedulePage({ defaultView = 'day' }) {
  const [activeView, setActiveView] = useState(defaultView); // 'day' | 'week' | 'month' | 'overdue'
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overdueList, setOverdueList] = useState([]);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [allTopics, setAllTopics] = useState([]);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [modalDefaultDate, setModalDefaultDate] = useState(null);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [reschedulingSchedule, setReschedulingSchedule] = useState(null);

  // Fetch topics for schedule modal topic picker
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
                  priority: top.priority,
                  estimated_minutes: top.estimated_minutes,
                  status: top.status,
                  subject_title: sub.name,
                });
              });
            });
          });
        });
        setAllTopics(extracted);
      } catch (err) {
        console.error('Failed to load roadmap topics for scheduler:', err);
      }
    };
    fetchTopics();
  }, []);

  // Fetch Overdue Schedulings
  const fetchOverdue = useCallback(async () => {
    try {
      setOverdueLoading(true);
      const res = await scheduleService.getOverdueSchedules();
      setOverdueList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch overdue:', err);
    } finally {
      setOverdueLoading(false);
    }
  }, []);

  // Fetch Calendar Data for current view & date
  const fetchCalendar = useCallback(async () => {
    if (activeView === 'overdue') {
      fetchOverdue();
      return;
    }

    try {
      setLoading(true);
      const res = await scheduleService.getCalendarView(activeView, currentDate);
      setCalendarData(res);
    } catch (err) {
      console.error(`Failed to fetch ${activeView} calendar view:`, err);
    } finally {
      setLoading(false);
    }
  }, [activeView, currentDate, fetchOverdue]);

  useEffect(() => {
    fetchCalendar();
    fetchOverdue();
  }, [fetchCalendar, fetchOverdue]);

  // Date Navigation
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (activeView === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (activeView === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (activeView === 'month') {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (activeView === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (activeView === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (activeView === 'month') {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Open modal helpers
  const handleOpenCreate = (targetDate = null) => {
    setEditingSchedule(null);
    setModalDefaultDate(targetDate || currentDate);
    setShowScheduleModal(true);
  };

  const handleOpenEdit = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const handleOpenReschedule = (schedule) => {
    setReschedulingSchedule(schedule);
    setShowRescheduleModal(true);
  };

  // Status and Delete actions
  const handleUpdateStatus = async (id, status) => {
    try {
      await scheduleService.updateStatus(id, status);
      fetchCalendar();
      fetchOverdue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update schedule status.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete session "${title}"?`)) return;
    try {
      await scheduleService.deleteSchedule(id);
      fetchCalendar();
      fetchOverdue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete schedule.');
    }
  };

  const handleCreated = async (payload) => {
    await scheduleService.createSchedule(payload);
    fetchCalendar();
    fetchOverdue();
  };

  const handleUpdated = async (id, payload) => {
    await scheduleService.updateSchedule(id, payload);
    fetchCalendar();
    fetchOverdue();
  };

  const handleRescheduled = async (id, payload) => {
    await scheduleService.reschedule(id, payload);
    setShowRescheduleModal(false);
    fetchCalendar();
    fetchOverdue();
  };

  const handleSelectDate = (dateStr) => {
    setCurrentDate(dateStr);
    setActiveView('day');
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Top Header & Page Navigation */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary px-2 py-1 small fw-semibold">Phase 5</span>
            <span className="theme-text-sub small fw-medium">Smart Scheduling Engine</span>
          </div>
          <h2 className="theme-text-main fw-bold mb-1">Study Scheduler & Calendar</h2>
          <p className="theme-text-sub small mb-0">
            Conflict-aware timeline, weekly rhythm, and workload balancer tailored for high cognitive stamina.
          </p>
        </div>

        {/* Global Action Button */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
            onClick={() => {
              fetchCalendar();
              fetchOverdue();
            }}
            title="Refresh Schedules"
          >
            <FaSyncAlt size={12} />
          </button>
          <button
            className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm"
            onClick={() => handleOpenCreate()}
          >
            <FaPlus /> Schedule Study Activity
          </button>
        </div>
      </div>

      {/* Overdue Notice Banner (if overdue tasks exist & not already in overdue view) */}
      {activeView !== 'overdue' && (
        <OverdueNoticeBanner
          overdueCount={overdueList.length}
          onViewOverdue={() => setActiveView('overdue')}
        />
      )}

      {/* Control Bar: View Switcher & Date Controls */}
      <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3">
            {/* View Switcher Pills */}
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 ${
                  activeView === 'day' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => setActiveView('day')}
              >
                <FaCalendarDay /> Day View
              </button>
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 ${
                  activeView === 'week' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => setActiveView('week')}
              >
                <FaCalendarWeek /> Week View
              </button>
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 ${
                  activeView === 'month' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => setActiveView('month')}
              >
                <FaCalendarAlt /> Month View
              </button>
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 position-relative ${
                  activeView === 'overdue' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'
                }`}
                onClick={() => setActiveView('overdue')}
              >
                <FaExclamationTriangle />
                Overdue Tasks
                {overdueList.length > 0 && (
                  <span className="badge rounded-pill bg-danger text-white ms-1">
                    {overdueList.length}
                  </span>
                )}
              </button>
            </div>

            {/* Date Navigation Bar (for Day, Week, Month) */}
            {activeView !== 'overdue' && (
              <div className="d-flex align-items-center justify-content-between justify-content-lg-end gap-2">
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handlePrev}
                    title="Previous"
                  >
                    <FaChevronLeft size={11} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary fw-semibold px-3"
                    onClick={handleToday}
                  >
                    Today
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleNext}
                    title="Next"
                  >
                    <FaChevronRight size={11} />
                  </button>
                </div>

                {/* Quick Date Picker */}
                <input
                  type="date"
                  className="form-control form-control-sm text-center"
                  style={{ width: '145px' }}
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content View Switcher */}
      {activeView === 'day' && (
        <DailyCalendarView
          dayData={calendarData}
          loading={loading}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onOpenReschedule={handleOpenReschedule}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      )}

      {activeView === 'week' && (
        <WeeklyCalendarView
          weekData={calendarData}
          loading={loading}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onOpenReschedule={handleOpenReschedule}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
          onSelectDate={handleSelectDate}
        />
      )}

      {activeView === 'month' && (
        <MonthlyCalendarView
          monthData={calendarData}
          loading={loading}
          onSelectDate={handleSelectDate}
          onOpenCreate={handleOpenCreate}
        />
      )}

      {activeView === 'overdue' && (
        <OverdueListView
          overdueList={overdueList}
          loading={overdueLoading}
          onOpenReschedule={handleOpenReschedule}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      )}

      {/* Schedule / Edit Modal */}
      <ScheduleModal
        show={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingSchedule(null);
        }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        editingSchedule={editingSchedule}
        topics={allTopics}
        defaultDate={modalDefaultDate}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        show={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setReschedulingSchedule(null);
        }}
        schedule={reschedulingSchedule}
        onRescheduled={handleRescheduled}
      />
    </div>
  );
}


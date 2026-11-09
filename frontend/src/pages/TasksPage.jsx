import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaTasks,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaPlay,
  FaPause,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaColumns,
  FaList,
  FaRedo,
  FaCalendarTimes,
} from 'react-icons/fa';
import { scheduleService } from '../services/scheduleService';
import { roadmapService } from '../services/roadmapService';
import ScheduleModal from '../components/scheduler/ScheduleModal';
import RescheduleModal from '../components/scheduler/RescheduleModal';

export default function TasksPage({ onOpenTimer }) {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'critical' | 'high' | 'medium' | 'low'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch current month's schedules (-30 to +60 days)
      const now = new Date();
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const future60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [schedRes, overdueRes, roadmapsRes] = await Promise.all([
        scheduleService.getSchedules({ start_date: past30, end_date: future60 }),
        scheduleService.getOverdueSchedules(),
        roadmapService.getRoadmaps(),
      ]);

      setSchedules(schedRes.data || []);
      setOverdueList(overdueRes.data || []);

      // Flatten topics from all roadmaps
      const allTopics = [];
      const rms = roadmapsRes.data || [];
      rms.forEach((rm) => {
        (rm.phases || []).forEach((ph) => {
          (ph.subjects || []).forEach((sub) => {
            (sub.topics || []).forEach((t) => {
              allTopics.push({
                id: t.id,
                title: `${rm.title} > ${sub.title} > ${t.title}`,
              });
            });
          });
        });
      });
      setTopics(allTopics);
    } catch (err) {
      console.error('Failed to load study tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await scheduleService.updateStatus(id, newStatus);
      await fetchTasks();
    } catch (err) {
      alert(err.message || 'Failed to update task status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study task?')) return;
    try {
      await scheduleService.deleteSchedule(id);
      await fetchTasks();
    } catch (err) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  // Combine and deduplicate overdue + regular schedules
  const allTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const map = new Map();

    // Regular schedules
    schedules.forEach((s) => {
      const isPast = s.scheduled_date < todayStr && s.status !== 'completed' && s.status !== 'cancelled';
      map.set(s.id, {
        ...s,
        isOverdue: isPast,
      });
    });

    // Overdue list overrides
    overdueList.forEach((o) => {
      map.set(o.id, {
        ...o,
        isOverdue: true,
      });
    });

    return Array.from(map.values());
  }, [schedules, overdueList]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // 1. Search filter
      const matchesSearch =
        !searchTerm ||
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.topic?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subject?.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Status filter
      let matchesStatus = true;
      if (statusFilter === 'overdue') {
        matchesStatus = task.isOverdue;
      } else if (statusFilter === 'scheduled') {
        matchesStatus = task.status === 'scheduled' && !task.isOverdue;
      } else if (statusFilter === 'in_progress') {
        matchesStatus = task.status === 'in_progress';
      } else if (statusFilter === 'completed') {
        matchesStatus = task.status === 'completed';
      }

      // 3. Priority filter
      let matchesPriority = true;
      if (priorityFilter !== 'all') {
        matchesPriority = task.priority === priorityFilter;
      }

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [allTasks, searchTerm, statusFilter, priorityFilter]);

  // Derived counts
  const totalCount = allTasks.length;
  const overdueCount = allTasks.filter((t) => t.isOverdue).length;
  const inProgressCount = allTasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = allTasks.filter((t) => t.status === 'completed').length;
  const pendingCount = allTasks.filter((t) => t.status === 'scheduled' && !t.isOverdue).length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="badge bg-danger">Critical</span>;
      case 'high':
        return <span className="badge bg-warning text-dark">High</span>;
      case 'medium':
        return <span className="badge bg-info text-dark">Medium</span>;
      default:
        return <span className="badge bg-secondary">Low</span>;
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Header Hero Bar */}
      <div className="hero-card p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary">Task Operations</span>
              <span className="theme-text-sub small fw-semibold">&bull; Discipline Command</span>
            </div>
            <h2 className="fw-bold theme-text-main mb-1 d-flex align-items-center gap-2">
              <FaTasks className="text-primary" />
              Learning & Study Tasks
            </h2>
            <p className="theme-text-sub mb-0 small">
              Manage study action items, track overdue sessions, and prevent learning backlog accumulation.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            >
              <FaPlus />
              <span>Create Study Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stat Overview Row */}
      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="theme-text-sub small fw-semibold">Total Tracked</div>
                <h3 className="fw-bold theme-text-main mb-0 font-monospace">{totalCount}</h3>
              </div>
              <div className="rounded-3 p-3 bg-primary bg-opacity-10 text-primary">
                <FaTasks className="fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="theme-text-sub small fw-semibold">Overdue Backlog</div>
                <h3 className="fw-bold text-danger mb-0 font-monospace">{overdueCount}</h3>
              </div>
              <div className="rounded-3 p-3 bg-danger bg-opacity-10 text-danger">
                <FaCalendarTimes className="fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="theme-text-sub small fw-semibold">In Progress</div>
                <h3 className="fw-bold text-warning mb-0 font-monospace">{inProgressCount}</h3>
              </div>
              <div className="rounded-3 p-3 bg-warning bg-opacity-10 text-warning">
                <FaClock className="fs-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="theme-text-sub small fw-semibold">Completed</div>
                <h3 className="fw-bold text-success mb-0 font-monospace">{completedCount}</h3>
              </div>
              <div className="rounded-3 p-3 bg-success bg-opacity-10 text-success">
                <FaCheckCircle className="fs-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="card p-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          {/* Search Box */}
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search tasks or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters & View Mode */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Status Selector */}
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Statuses ({totalCount})</option>
              <option value="overdue">Overdue Backlog ({overdueCount})</option>
              <option value="scheduled">Scheduled / Todo ({pendingCount})</option>
              <option value="in_progress">In Progress ({inProgressCount})</option>
              <option value="completed">Completed ({completedCount})</option>
            </select>

            {/* Priority Selector */}
            <select
              className="form-select form-select-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* View Mode Switcher */}
            <div className="btn-group btn-group-sm">
              <button
                onClick={() => setViewMode('kanban')}
                className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-secondary'}`}
                title="Kanban Board View"
              >
                <FaColumns />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                title="List View"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Task Board Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="theme-text-sub">Loading tasks & backlog items...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card text-center p-5">
          <FaCheckCircle className="fs-1 text-success mb-3 mx-auto" />
          <h5 className="fw-bold theme-text-main mb-1">No Matching Tasks Found</h5>
          <p className="theme-text-sub small mb-3">All clear! Add a new study session or adjust your search filter.</p>
          <div>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
              Create Study Task
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="row g-3">
          {/* Column 1: Overdue Backlog */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card h-100 border-danger border-opacity-25">
              <div className="card-header bg-danger bg-opacity-10 py-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-danger small d-flex align-items-center gap-1">
                  <FaCalendarTimes /> Overdue Backlog
                </span>
                <span className="badge bg-danger">
                  {filteredTasks.filter((t) => t.isOverdue).length}
                </span>
              </div>
              <div className="card-body p-2 d-flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
                {filteredTasks
                  .filter((t) => t.isOverdue)
                  .map((task) => (
                    <div key={task.id} className="card p-3 border-danger shadow-sm">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-secondary bg-opacity-25 theme-text-sub small">
                          {task.scheduled_date}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <h6 className="fw-bold theme-text-main mb-1 text-truncate">{task.title}</h6>
                      <div className="theme-text-sub small mb-2 font-monospace">
                        Slot: {task.start_time?.slice(0, 5)} - {task.end_time?.slice(0, 5)}
                      </div>
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          onClick={() => setRescheduleTarget(task)}
                          className="btn btn-sm btn-outline-warning flex-grow-1"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="btn btn-sm btn-success"
                          title="Mark Done"
                        >
                          <FaCheckCircle />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Column 2: Scheduled / Todo */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card h-100">
              <div className="card-header bg-secondary bg-opacity-10 py-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold theme-text-main small d-flex align-items-center gap-1">
                  <FaCalendarAlt className="text-primary" /> Scheduled / Todo
                </span>
                <span className="badge bg-secondary">
                  {filteredTasks.filter((t) => t.status === 'scheduled' && !t.isOverdue).length}
                </span>
              </div>
              <div className="card-body p-2 d-flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
                {filteredTasks
                  .filter((t) => t.status === 'scheduled' && !t.isOverdue)
                  .map((task) => (
                    <div key={task.id} className="card p-3 shadow-sm">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-secondary bg-opacity-25 theme-text-sub small">
                          {task.scheduled_date}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <h6 className="fw-bold theme-text-main mb-1 text-truncate">{task.title}</h6>
                      <div className="theme-text-sub small mb-2 font-monospace">
                        Slot: {task.start_time?.slice(0, 5)} - {task.end_time?.slice(0, 5)} ({task.estimated_minutes}m)
                      </div>
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center gap-1 flex-grow-1"
                        >
                          <FaPlay className="small" />
                          <span>Start</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="btn btn-sm btn-outline-success"
                          title="Mark Complete"
                        >
                          <FaCheckCircle />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Column 3: In Progress */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card h-100 border-primary border-opacity-25">
              <div className="card-header bg-primary bg-opacity-10 py-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-primary small d-flex align-items-center gap-1">
                  <FaClock /> In Progress
                </span>
                <span className="badge bg-primary">
                  {filteredTasks.filter((t) => t.status === 'in_progress').length}
                </span>
              </div>
              <div className="card-body p-2 d-flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
                {filteredTasks
                  .filter((t) => t.status === 'in_progress')
                  .map((task) => (
                    <div key={task.id} className="card p-3 border-primary shadow-sm">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-primary bg-opacity-25 text-primary small">
                          {task.scheduled_date}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <h6 className="fw-bold theme-text-main mb-1 text-truncate">{task.title}</h6>
                      <div className="theme-text-sub small mb-2 font-monospace">
                        Slot: {task.start_time?.slice(0, 5)} - {task.end_time?.slice(0, 5)}
                      </div>
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          onClick={() => handleStatusChange(task.id, 'scheduled')}
                          className="btn btn-sm btn-outline-warning"
                          title="Pause"
                        >
                          <FaPause />
                        </button>
                        <button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="btn btn-sm btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        >
                          <FaCheckCircle />
                          <span>Complete</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Column 4: Completed */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card h-100 border-success border-opacity-25">
              <div className="card-header bg-success bg-opacity-10 py-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-success small d-flex align-items-center gap-1">
                  <FaCheckCircle /> Completed
                </span>
                <span className="badge bg-success">
                  {filteredTasks.filter((t) => t.status === 'completed').length}
                </span>
              </div>
              <div className="card-body p-2 d-flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
                {filteredTasks
                  .filter((t) => t.status === 'completed')
                  .map((task) => (
                    <div key={task.id} className="card p-3 bg-success bg-opacity-10 shadow-sm">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-success bg-opacity-25 text-success small">
                          {task.scheduled_date}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <h6 className="fw-bold theme-text-main text-decoration-line-through mb-1 text-truncate">
                        {task.title}
                      </h6>
                      <div className="text-muted small mb-2 font-monospace">
                        Logged: {task.estimated_minutes}m
                      </div>
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          onClick={() => handleStatusChange(task.id, 'scheduled')}
                          className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                          title="Reopen"
                        >
                          <FaRedo className="small" />
                          <span>Reopen</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="card">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Task Title</th>
                  <th>Scheduled Date</th>
                  <th>Slot / Duration</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const isDone = task.status === 'completed';

                  return (
                    <tr key={task.id} className={task.isOverdue ? 'table-danger' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isDone}
                          onChange={() => handleStatusChange(task.id, isDone ? 'scheduled' : 'completed')}
                        />
                      </td>
                      <td>
                        <div className={`fw-bold ${isDone ? 'text-decoration-line-through text-muted' : 'theme-text-main'}`}>
                          {task.title}
                        </div>
                        {task.topic && (
                          <small className="text-muted">{task.topic.title}</small>
                        )}
                      </td>
                      <td className="font-monospace small">
                        {task.scheduled_date}
                        {task.isOverdue && (
                          <span className="badge bg-danger ms-2">Overdue</span>
                        )}
                      </td>
                      <td className="font-monospace small">
                        {task.start_time?.slice(0, 5)} - {task.end_time?.slice(0, 5)}
                        <span className="text-muted ms-1">({task.estimated_minutes}m)</span>
                      </td>
                      <td>{getPriorityBadge(task.priority)}</td>
                      <td>
                        <span className={`badge ${
                          isDone
                            ? 'bg-success'
                            : task.status === 'in_progress'
                            ? 'bg-primary'
                            : task.isOverdue
                            ? 'bg-danger'
                            : 'bg-secondary'
                        }`}>
                          {task.isOverdue ? 'Overdue' : task.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          {task.isOverdue && (
                            <button
                              onClick={() => setRescheduleTarget(task)}
                              className="btn btn-sm btn-outline-warning"
                              title="Reschedule Task"
                            >
                              Reschedule
                            </button>
                          )}
                          {!isDone && task.status !== 'in_progress' && (
                            <button
                              onClick={() => handleStatusChange(task.id, 'in_progress')}
                              className="btn btn-sm btn-outline-primary"
                              title="Start Session"
                            >
                              <FaPlay className="small" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                          >
                            &times;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Modals */}
      {showCreateModal && (
        <ScheduleModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchTasks}
          topics={topics}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          show={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={fetchTasks}
          schedule={rescheduleTarget}
        />
      )}
    </div>
  );
}

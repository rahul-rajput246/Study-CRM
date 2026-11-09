import React, { useState, useEffect, useCallback } from 'react';
import {
  FaBrain,
  FaPlay,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaHistory,
  FaCalendarAlt,
  FaSearch,
  FaTrash,
  FaLayerGroup,
  FaSyncAlt,
  FaLightbulb,
} from 'react-icons/fa';
import { revisionService } from '../services/revisionService';
import { roadmapService } from '../services/roadmapService';
import ActiveRecallModal from '../components/revision/ActiveRecallModal';
import AddRevisionModal from '../components/revision/AddRevisionModal';

export default function RevisionPage() {
  const [activeTab, setActiveTab] = useState('due'); // 'due' | 'upcoming' | 'all'
  const [dueQueue, setDueQueue] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState({});
  const [allCards, setAllCards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [recallIndex, setRecallIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allTopics, setAllTopics] = useState([]);

  // Load Roadmap Topics for Add Modal
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
                  learning_objectives: top.learning_objectives,
                  description: top.description,
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

  // Fetch all revision data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dueRes, analyticsRes, upcomingRes, allRes] = await Promise.all([
        revisionService.getDueQueue(),
        revisionService.getAnalytics(),
        revisionService.getUpcoming(14),
        revisionService.getRevisions({ status: statusFilter }),
      ]);

      setDueQueue(dueRes.data || []);
      setAnalytics(analyticsRes.analytics || null);
      setUpcomingSchedule(upcomingRes.schedule || {});
      setAllCards(allRes.data || []);
    } catch (err) {
      console.error('Failed to load revision data:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartReview = (index = 0) => {
    setRecallIndex(index);
    setShowRecallModal(true);
  };

  const handleDeleteCard = async (id, title) => {
    if (!window.confirm(`Remove "${title}" from Spaced Repetition queue?`)) return;
    try {
      await revisionService.deleteRevisionItem(id);
      fetchData();
    } catch (err) {
      alert('Failed to remove revision card.');
    }
  };

  const filteredCards = allCards.filter((card) => {
    const matchesSearch =
      card.topic?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.concept_prompt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary px-2 py-1 small fw-semibold">Phase 7</span>
            <span className="theme-text-sub small fw-medium">SuperMemo SM-2 Retention Engine</span>
          </div>
          <h2 className="theme-text-main fw-bold mb-1">Revision & Knowledge Retention</h2>
          <p className="theme-text-sub small mb-0">
            Active recall flashcards, exponential spacing intervals, and cognitive mastery tracking.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="d-flex align-items-center gap-2">
          {dueQueue.length > 0 && (
            <button
              className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              onClick={() => handleStartReview(0)}
            >
              <FaPlay size={12} /> Start Due Session ({dueQueue.length})
            </button>
          )}
          <button
            className="btn btn-outline-primary fw-semibold d-inline-flex align-items-center gap-2 px-3 py-2"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus size={12} /> Add Revision Card
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="row g-3 mb-4">
        {/* Due Today */}
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Due Today / Overdue</span>
              <div className="rounded p-2 bg-warning bg-opacity-10 text-warning">
                <FaClock size={16} />
              </div>
            </div>
            <h3 className="theme-text-main fw-bold mb-1">{analytics?.due_today_count ?? dueQueue.length}</h3>
            <span className="small theme-text-sub">
              {dueQueue.length > 0 ? (
                <span className="text-warning fw-semibold">Ready for active recall</span>
              ) : (
                <span className="text-success fw-semibold">Up to date</span>
              )}
            </span>
          </div>
        </div>

        {/* Total Cards */}
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Total Flashcards</span>
              <div className="rounded p-2 bg-primary bg-opacity-10 text-primary">
                <FaBrain size={16} />
              </div>
            </div>
            <h3 className="theme-text-main fw-bold mb-1">{analytics?.total_items ?? 0}</h3>
            <span className="small theme-text-sub">Across curriculum</span>
          </div>
        </div>

        {/* Mastered Topics */}
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Mastered Topics</span>
              <div className="rounded p-2 bg-success bg-opacity-10 text-success">
                <FaCheckCircle size={16} />
              </div>
            </div>
            <h3 className="theme-text-main fw-bold mb-1">{analytics?.mastered_count ?? 0}</h3>
            <span className="small text-success fw-semibold">≥ 14d retention interval</span>
          </div>
        </div>

        {/* Retention Rate */}
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Retention Accuracy</span>
              <div className="rounded p-2 bg-info bg-opacity-10 text-info">
                <FaSyncAlt size={16} />
              </div>
            </div>
            <h3 className="theme-text-main fw-bold mb-1">{analytics?.retention_rate_pct ?? 100}%</h3>
            <span className="small theme-text-sub">Avg Ease Factor: {analytics?.average_ease_factor ?? 2.5}</span>
          </div>
        </div>
      </div>

      {/* Tabs & View Controls */}
      <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
            {/* View Tabs */}
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 ${
                  activeTab === 'due' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => setActiveTab('due')}
              >
                <FaClock /> Due Queue
                {dueQueue.length > 0 && (
                  <span className="badge rounded-pill bg-danger text-white ms-1">
                    {dueQueue.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 ${
                  activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                <FaCalendarAlt /> Upcoming Schedule (14d)
              </button>
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 ${
                  activeTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => setActiveTab('all')}
              >
                <FaLayerGroup /> All Flashcards
              </button>
            </div>

            {/* Search Input for All Tab */}
            {activeTab === 'all' && (
              <div className="position-relative" style={{ minWidth: '240px' }}>
                <FaSearch
                  className="position-absolute top-50 translate-middle-y text-muted ms-3"
                  size={12}
                />
                <input
                  type="text"
                  className="form-control form-control-sm ps-5"
                  placeholder="Search topics or concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab 1: Due Queue */}
      {activeTab === 'due' && (
        <div>
          {dueQueue.length === 0 ? (
            <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center p-4 mx-auto mb-3"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '70px', height: '70px' }}
              >
                <FaCheckCircle size={32} />
              </div>
              <h5 className="theme-text-main fw-bold">Zero Revisions Due Today!</h5>
              <p className="theme-text-sub small mb-0" style={{ maxWidth: '420px', margin: '0 auto' }}>
                Your spaced repetition queue is fully up to date. Next items will appear automatically based on their SuperMemo interval.
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {dueQueue.map((item, index) => {
                const isOverdue = item.status === 'overdue' || new Date(item.next_revision_date) < new Date();

                return (
                  <div key={item.id} className="col-12 col-md-6 col-xl-4">
                    <div
                      className={`card h-100 shadow-sm border ${
                        isOverdue ? 'border-warning border-2' : ''
                      }`}
                      style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}
                    >
                      <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
                        <div>
                          {/* Badges */}
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="badge bg-secondary-subtle text-secondary small">
                              {item.topic?.subject?.name || 'Subject'}
                            </span>
                            {isOverdue ? (
                              <span className="badge bg-warning text-dark small fw-semibold">
                                Overdue
                              </span>
                            ) : (
                              <span className="badge bg-danger small">Due Today</span>
                            )}
                          </div>

                          {/* Title */}
                          <h6 className="theme-text-main fw-bold mb-2 fs-5">
                            {item.topic?.title}
                          </h6>

                          {/* Challenge Question Prompt */}
                          <div
                            className="p-3 rounded mb-3 small"
                            style={{ backgroundColor: 'var(--hover-bg)' }}
                          >
                            <span className="text-primary fw-semibold d-block mb-1">
                              <FaLightbulb size={11} className="me-1" /> Active Recall Challenge:
                            </span>
                            <span className="theme-text-sub">
                              {item.concept_prompt || 'Explain this core concept and its memory tradeoffs.'}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer: Metadata & Action */}
                        <div className="pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="d-flex align-items-center justify-content-between mb-3 small">
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              Repetition #{item.repetition_count} • Interval: {item.interval_days}d
                            </span>
                            <span className="badge bg-dark border border-secondary text-light small font-monospace">
                              EF: {parseFloat(item.ease_factor).toFixed(2)}
                            </span>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-primary w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                              onClick={() => handleStartReview(index)}
                            >
                              <FaPlay size={10} /> Test Recall
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                              onClick={() => handleDeleteCard(item.id, item.topic?.title)}
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Upcoming Schedule */}
      {activeTab === 'upcoming' && (
        <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="card-body p-4">
            <h6 className="theme-text-main fw-bold mb-3">Next 14-Day Revision Schedule</h6>
            {Object.keys(upcomingSchedule).length === 0 ? (
              <p className="text-muted small mb-0">No upcoming revisions scheduled in the next 14 days.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {Object.entries(upcomingSchedule).map(([dateStr, items]) => (
                  <div key={dateStr} className="p-3 rounded border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold theme-text-main">{dateStr}</span>
                      <span className="badge bg-primary-subtle text-primary small">
                        {items.length} topic{items.length === 1 ? '' : 's'} scheduled
                      </span>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {items.map((it) => (
                        <span key={it.id} className="badge bg-secondary-subtle text-secondary small p-2">
                          {it.topic?.title} ({it.interval_days}d interval)
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: All Flashcards Library */}
      {activeTab === 'all' && (
        <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light border-bottom">
                <tr>
                  <th className="ps-4">Topic & Subject</th>
                  <th>Recall Prompt</th>
                  <th>Repetitions</th>
                  <th>Interval</th>
                  <th>Ease Factor</th>
                  <th>Next Date</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted small">
                      No flashcards found.
                    </td>
                  </tr>
                ) : (
                  filteredCards.map((card) => {
                    const isDue = new Date(card.next_revision_date) <= new Date();

                    return (
                      <tr key={card.id}>
                        <td className="ps-4">
                          <div className="fw-bold theme-text-main">{card.topic?.title}</div>
                          <small className="text-muted">{card.topic?.subject?.name}</small>
                        </td>
                        <td style={{ maxWidth: '300px' }} className="small text-truncate theme-text-sub">
                          {card.concept_prompt || '—'}
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary">
                            #{card.repetition_count}
                          </span>
                        </td>
                        <td className="small font-monospace">{card.interval_days} days</td>
                        <td className="small font-monospace">{parseFloat(card.ease_factor).toFixed(2)}</td>
                        <td>
                          {isDue ? (
                            <span className="badge bg-danger small">Due</span>
                          ) : (
                            <span className="small text-muted">{card.next_revision_date?.slice(0, 10)}</span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-link text-danger p-0 ms-2"
                            onClick={() => handleDeleteCard(card.id, card.topic?.title)}
                          >
                            <FaTrash size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Recall Interactive Modal */}
      <ActiveRecallModal
        show={showRecallModal}
        onClose={() => setShowRecallModal(false)}
        queue={dueQueue}
        initialIndex={recallIndex}
        onSessionCompleted={() => {
          fetchData();
        }}
      />

      {/* Add Revision Card Modal */}
      <AddRevisionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        topics={allTopics}
        onCreated={() => {
          fetchData();
        }}
      />
    </div>
  );
}


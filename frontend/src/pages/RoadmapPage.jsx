import { useState, useEffect, useCallback } from 'react';
import { roadmapService } from '../services/roadmapService';
import TrackSelector from '../components/roadmap/TrackSelector';
import PhaseAccordion from '../components/roadmap/PhaseAccordion';
import TopicDetailModal from '../components/roadmap/TopicDetailModal';
import CreateTopicModal from '../components/roadmap/CreateTopicModal';
import CreateTrackModal from '../components/roadmap/CreateTrackModal';
import {
  FaRoute,
  FaPlus,
  FaSearch,
  FaCheckCircle,
  FaHourglassHalf,
  FaSyncAlt,
  FaLayerGroup,
  FaExclamationTriangle,
} from 'react-icons/fa';

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [activeRoadmapData, setActiveRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [showCreateTrackModal, setShowCreateTrackModal] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load roadmaps list
  const loadRoadmaps = useCallback(async () => {
    try {
      const res = await roadmapService.getRoadmaps();
      setRoadmaps(res.data || []);
      if (!activeRoadmapId && res.data?.length > 0) {
        setActiveRoadmapId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
      setError(err.message || 'Failed to load roadmaps from server.');
    }
  }, [activeRoadmapId]);

  // Load active roadmap deep hierarchy
  const loadRoadmapDetail = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await roadmapService.getRoadmap(id);
      setActiveRoadmapData(res.data);
    } catch (err) {
      console.error('Failed to load roadmap detail:', err);
      setError(err.message || 'Failed to load track detail.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmaps();
  }, [loadRoadmaps]);

  useEffect(() => {
    if (activeRoadmapId) {
      loadRoadmapDetail(activeRoadmapId);
    }
  }, [activeRoadmapId, loadRoadmapDetail]);

  const handleTrackCreated = async (trackData) => {
    const res = await roadmapService.createRoadmap(trackData);
    await loadRoadmaps();
    setActiveRoadmapId(res.data.id);
  };

  const handleTopicCreated = async (topicData) => {
    await roadmapService.createTopic(topicData);
    await loadRoadmapDetail(activeRoadmapId);
    await loadRoadmaps();
  };

  const handleStatusChange = async (topicId, newStatus) => {
    try {
      await roadmapService.updateTopicStatus(topicId, newStatus);
      await loadRoadmapDetail(activeRoadmapId);
      await loadRoadmaps();
    } catch (err) {
      alert(err.message || 'Failed to update topic status.');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic and its subtopics?')) return;
    try {
      await roadmapService.deleteTopic(topicId);
      await loadRoadmapDetail(activeRoadmapId);
      await loadRoadmaps();
    } catch (err) {
      alert(err.message || 'Failed to delete topic.');
    }
  };

  const handleOpenDetailModal = (topic) => {
    setSelectedTopic(topic);
    setShowDetailModal(true);
  };

  const handleOpenCreateTopic = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setShowCreateTopicModal(true);
  };

  // Flatten subjects for dropdown
  const allSubjects = (activeRoadmapData?.phases || []).flatMap((p) =>
    (p.subjects || []).map((s) => ({ ...s, phase_title: p.title }))
  );

  // Filter phases & topics by search & status
  const filteredPhases = (activeRoadmapData?.phases || []).map((phase) => {
    const filteredSubjects = (phase.subjects || []).map((subject) => {
      const filteredTopics = (subject.topics || []).filter((topic) => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          filterStatus === 'all' || topic.status === filterStatus;

        return matchesSearch && matchesStatus;
      });

      return { ...subject, topics: filteredTopics };
    });

    return { ...phase, subjects: filteredSubjects };
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Header & Quick Controls */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary">Curriculum</span>
            <span className="theme-text-sub small fw-semibold">&bull; Hierarchical Learning Architecture</span>
          </div>
          <h2 className="fw-bold theme-text-main mb-0 d-flex align-items-center gap-2">
            <FaRoute className="text-primary" />
            Study Roadmap Engine
          </h2>
        </div>

        <div className="d-flex align-items-center gap-2">
          {allSubjects.length > 0 && (
            <button
              onClick={() => handleOpenCreateTopic(allSubjects[0]?.id)}
              className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-semibold shadow-sm"
            >
              <FaPlus />
              <span>Add Topic</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Track Selector Tabs */}
      <TrackSelector
        roadmaps={roadmaps}
        activeRoadmapId={activeRoadmapId}
        onSelect={(id) => setActiveRoadmapId(id)}
        onOpenCreateModal={() => setShowCreateTrackModal(true)}
      />

      {/* 3. Track Overview Banner */}
      {activeRoadmapData && (
        <div className="hero-card p-4">
          <div className="row align-items-center g-3">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-secondary bg-opacity-25 theme-text-main text-capitalize fw-bold">
                  {activeRoadmapData.track_type?.replace('_', ' ')} Track
                </span>
                <span className="badge bg-primary bg-opacity-15 text-primary fw-semibold">
                  {activeRoadmapData.status?.toUpperCase()}
                </span>
              </div>
              <h3 className="fw-bold theme-text-main mb-1">{activeRoadmapData.title}</h3>
              <p className="theme-text-sub small mb-3">{activeRoadmapData.description}</p>

              {/* Progress Bar */}
              <div className="d-flex align-items-center gap-3" style={{ maxWidth: '480px' }}>
                <div className="progress flex-grow-1" style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${activeRoadmapData.progress_percent}%` }}
                  ></div>
                </div>
                <span className="small font-monospace fw-bold theme-text-main">
                  {activeRoadmapData.progress_percent}% Completed
                </span>
              </div>
            </div>

            {/* Quick Metrics Chips */}
            <div className="col-lg-4">
              <div className="row g-2">
                <div className="col-6">
                  <div className="hero-box p-3 text-center">
                    <div className="fs-4 fw-bold text-success">{activeRoadmapData.completed_topics}</div>
                    <small className="theme-text-sub">Completed Topics</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="hero-box p-3 text-center">
                    <div className="fs-4 fw-bold text-primary">{activeRoadmapData.total_topics}</div>
                    <small className="theme-text-sub">Total Topics</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Filter & Search Bar */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="input-group" style={{ maxWidth: '340px' }}>
          <span className="input-group-text bg-transparent border-end-0 theme-text-sub">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search topics, concepts, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small theme-text-sub fw-semibold">Filter:</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Topics</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
      </div>

      {/* 5. Phases Accordion */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="theme-text-sub">Loading hierarchical roadmap structure...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center gap-3">
          <FaExclamationTriangle className="fs-3 flex-shrink-0" />
          <div>
            <h6 className="alert-heading fw-bold mb-1">Error Loading Roadmap</h6>
            <p className="mb-0 small">{error}</p>
          </div>
        </div>
      ) : (
        <PhaseAccordion
          phases={filteredPhases}
          onOpenTopicModal={handleOpenDetailModal}
          onOpenCreateTopicModal={handleOpenCreateTopic}
          onStatusChange={handleStatusChange}
          onDeleteTopic={handleDeleteTopic}
        />
      )}

      {/* 6. Modals */}
      <TopicDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        topic={selectedTopic}
        onTopicUpdated={async () => {
          await loadRoadmapDetail(activeRoadmapId);
          await loadRoadmaps();
        }}
      />

      <CreateTopicModal
        show={showCreateTopicModal}
        onClose={() => setShowCreateTopicModal(false)}
        subjects={allSubjects}
        defaultSubjectId={selectedSubjectId}
        onCreated={handleTopicCreated}
      />

      <CreateTrackModal
        show={showCreateTrackModal}
        onClose={() => setShowCreateTrackModal(false)}
        onCreated={handleTrackCreated}
      />
    </div>
  );
}


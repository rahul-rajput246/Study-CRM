import { FaPlus, FaLayerGroup, FaCode, FaServer, FaUserTie } from 'react-icons/fa';

export default function TrackSelector({ roadmaps = [], activeRoadmapId, onSelect, onOpenCreateModal }) {
  const getTrackIcon = (trackType) => {
    switch (trackType) {
      case 'dsa':
        return <FaCode className="small" />;
      case 'system_design':
        return <FaServer className="small" />;
      case 'interview':
        return <FaUserTie className="small" />;
      default:
        return <FaLayerGroup className="small" />;
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-2 border-bottom">
      {/* Track Tabs */}
      <div className="d-flex align-items-center gap-2 overflow-x-auto py-1">
        {roadmaps.map((track) => {
          const isActive = track.id === activeRoadmapId;

          return (
            <button
              key={track.id}
              onClick={() => onSelect(track.id)}
              className={`btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3 py-2 text-nowrap fw-semibold transition-all ${
                isActive
                  ? 'btn-primary shadow-sm'
                  : 'btn-outline-secondary theme-text-sub border-opacity-50'
              }`}
            >
              {getTrackIcon(track.track_type)}
              <span>{track.title}</span>
              <span
                className={`badge rounded-pill ${
                  isActive ? 'bg-white text-primary' : 'bg-secondary bg-opacity-25 theme-text-sub'
                }`}
                style={{ fontSize: '0.65rem' }}
              >
                {track.progress_percent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Track Button */}
      <button
        onClick={onOpenCreateModal}
        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-3 py-2 fw-semibold"
      >
        <FaPlus className="small" />
        <span>New Track</span>
      </button>
    </div>
  );
}


import { FaBook } from 'react-icons/fa';

export default function SubjectProgressWidget({ subjects = [] }) {
  return (
    <div className="card h-100">
      <div className="card-header border-bottom d-flex justify-content-between align-items-center py-3">
        <h6 className="fw-bold mb-0 theme-text-main d-flex align-items-center gap-2">
          <FaBook className="text-info" />
          Subject-wise Mastery
        </h6>
        <span className="text-muted small">Active Tracks</span>
      </div>

      <div className="card-body p-3">
        {subjects.length === 0 ? (
          <p className="text-muted small text-center my-4">No subjects recorded yet.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {subjects.map((sub) => (
              <div key={sub.id}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold theme-text-main text-truncate" style={{ maxWidth: '240px' }}>
                    {sub.title}
                  </span>
                  <span className="small theme-text-sub font-monospace fw-semibold">
                    {sub.completed_topics}/{sub.total_topics} topics ({sub.progress_percent}%)
                  </span>
                </div>
                <div className="progress" style={{ height: '7px', backgroundColor: 'rgba(0,0,0,0.08)' }}>
                  <div
                    className={`progress-bar ${
                      sub.progress_percent === 100
                        ? 'bg-success'
                        : sub.progress_percent > 50
                        ? 'bg-primary'
                        : 'bg-info'
                    }`}
                    role="progressbar"
                    style={{ width: `${sub.progress_percent}%` }}
                    aria-valuenow={sub.progress_percent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

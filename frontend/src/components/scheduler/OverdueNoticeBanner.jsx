import { FaExclamationTriangle, FaCalendarCheck } from 'react-icons/fa';

export default function OverdueNoticeBanner({ overdueCount = 0, onReviewOverdue }) {
  if (overdueCount === 0) return null;

  return (
    <div className="alert alert-warning border border-warning border-opacity-50 shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2 p-3 rounded-3 mb-0">
      <div className="d-flex align-items-center gap-3">
        <div className="rounded-circle p-2 bg-warning bg-opacity-25 text-warning d-flex align-items-center justify-content-center">
          <FaExclamationTriangle className="fs-5" />
        </div>
        <div>
          <h6 className="fw-bold mb-0 text-dark">
            {overdueCount} Unfinished Study {overdueCount === 1 ? 'Activity' : 'Activities'} Found
          </h6>
          <small className="text-secondary">
            StudyOS detected activities from past days that were not completed. Review and reschedule them to keep your plan realistic without losing momentum.
          </small>
        </div>
      </div>

      <button
        onClick={onReviewOverdue}
        className="btn btn-sm btn-dark d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-pill shadow-sm"
      >
        <FaCalendarCheck />
        <span>Review & Reschedule ({overdueCount})</span>
      </button>
    </div>
  );
}


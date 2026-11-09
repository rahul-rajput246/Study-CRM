export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', badgeText, onClick }) {
  return (
    <div
      className={`card h-100 card-hover ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="theme-text-sub small fw-semibold text-truncate">{title}</span>
          <div
            className={`rounded-3 p-2 bg-${color} bg-opacity-10 text-${color} d-flex align-items-center justify-content-center`}
            style={{ width: '40px', height: '40px' }}
          >
            {Icon && <Icon className="fs-5" />}
          </div>
        </div>

        <div className="d-flex align-items-baseline gap-2 mb-1">
          <h3 className="fw-bold mb-0 theme-text-main">{value}</h3>
          {badgeText && (
            <span className={`badge bg-${color} bg-opacity-25 text-${color} small fw-bold`} style={{ fontSize: '0.7rem' }}>
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
      </div>
    </div>
  );
}

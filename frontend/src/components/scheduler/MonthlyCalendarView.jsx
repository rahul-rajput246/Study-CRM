import React from 'react';
import { FaCalendarPlus, FaCheckCircle, FaClock, FaPlus } from 'react-icons/fa';

export default function MonthlyCalendarView({
  monthData,
  loading,
  onSelectDate,
  onOpenCreate,
}) {
  if (loading) {
    return (
      <div className="card border-0 p-5 text-center">
        <div className="spinner-border text-primary mx-auto mb-3" role="status" />
        <p className="theme-text-sub mb-0">Loading monthly study calendar...</p>
      </div>
    );
  }

  const {
    month_name = '',
    month_number = 1,
    year = 2026,
    days_in_month = 30,
    start_day_of_week = 0,
    schedules_by_date = {},
  } = monthData || {};

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Today in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to format date key "2026-11-09"
  const getDateKey = (dayNum) => {
    const mm = String(month_number).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      default:
        return '#94a3b8';
    }
  };

  const totalSessionsInMonth = Object.values(schedules_by_date).reduce(
    (acc, list) => acc + (list?.length || 0),
    0
  );

  return (
    <div>
      {/* Month Overview */}
      <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="text-muted small text-uppercase fw-semibold">Month View</span>
              <h5 className="theme-text-main fw-bold mb-0">{month_name}</h5>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 px-3 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="text-muted small d-block">Scheduled Sessions</span>
                <span className="theme-text-main fw-bold fs-6">{totalSessionsInMonth}</span>
              </div>
              <div className="p-2 px-3 rounded" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="text-muted small d-block">Days with Study</span>
                <span className="text-success fw-bold fs-6">
                  {Object.keys(schedules_by_date).length} / {days_in_month}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="card-body p-2 p-md-3">
          {/* Day of week headers */}
          <div className="row g-1 text-center mb-1">
            {daysOfWeek.map((dow, idx) => (
              <div key={idx} className="col">
                <div
                  className="py-2 small fw-bold text-uppercase"
                  style={{
                    color: idx === 0 || idx === 6 ? 'var(--primary-color)' : 'var(--text-secondary)',
                    backgroundColor: 'var(--hover-bg)',
                    borderRadius: '6px',
                  }}
                >
                  {dow}
                </div>
              </div>
            ))}
          </div>

          {/* Day cells grid */}
          <div className="row g-1">
            {/* Empty cells before 1st of month */}
            {Array.from({ length: start_day_of_week }).map((_, i) => (
              <div key={`blank-${i}`} className="col" style={{ minWidth: '13%' }}>
                <div
                  className="p-2 rounded"
                  style={{
                    minHeight: '100px',
                    backgroundColor: 'transparent',
                    opacity: 0.25,
                  }}
                />
              </div>
            ))}

            {/* Days 1 to days_in_month */}
            {Array.from({ length: days_in_month }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = getDateKey(dayNum);
              const isToday = dateKey === todayStr;
              const daySchedules = schedules_by_date[dateKey] || [];
              const hasSessions = daySchedules.length > 0;

              return (
                <div key={dayNum} className="col" style={{ minWidth: '13%' }}>
                  <div
                    className={`p-2 rounded border h-100 d-flex flex-column justify-content-between position-relative cursor-pointer transition-all ${
                      isToday ? 'border-primary border-2' : ''
                    }`}
                    style={{
                      minHeight: '105px',
                      backgroundColor: isToday ? 'var(--hero-bg)' : 'var(--card-bg)',
                      borderColor: isToday ? 'var(--primary-color)' : 'var(--border-color)',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectDate(dateKey)}
                  >
                    {/* Date Number & Mini Add */}
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span
                        className={`fw-bold small rounded-circle d-inline-flex align-items-center justify-content-center ${
                          isToday ? 'bg-primary text-white' : 'theme-text-main'
                        }`}
                        style={{ width: '24px', height: '24px' }}
                      >
                        {dayNum}
                      </span>

                      <button
                        className="btn btn-sm btn-link p-0 text-muted"
                        title="Add session on this date"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCreate(dateKey);
                        }}
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>

                    {/* Session Pills in cell */}
                    <div className="d-flex flex-column gap-1 flex-grow-1 overflow-hidden">
                      {daySchedules.slice(0, 3).map((sess) => (
                        <div
                          key={sess.id}
                          className="d-flex align-items-center gap-1 px-1 py-0 rounded text-truncate small"
                          style={{
                            fontSize: '0.68rem',
                            backgroundColor: 'var(--hover-bg)',
                            borderLeft: `3px solid ${getPriorityColor(sess.priority)}`,
                          }}
                          title={`${sess.title} (${sess.start_time} - ${sess.end_time})`}
                        >
                          {sess.status === 'completed' && (
                            <FaCheckCircle className="text-success flex-shrink-0" size={9} />
                          )}
                          <span className="theme-text-main text-truncate">{sess.title}</span>
                        </div>
                      ))}

                      {daySchedules.length > 3 && (
                        <span className="text-muted small ps-1" style={{ fontSize: '0.65rem' }}>
                          +{daySchedules.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Summary Dot Bar if sessions exist */}
                    {hasSessions && (
                      <div className="d-flex gap-1 mt-1 pt-1 border-top" style={{ borderColor: 'var(--border-color)' }}>
                        {daySchedules.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-circle"
                            style={{
                              width: '6px',
                              height: '6px',
                              backgroundColor: getPriorityColor(s.priority),
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


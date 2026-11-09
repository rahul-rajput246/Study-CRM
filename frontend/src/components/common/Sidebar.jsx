import {
  FaTachometerAlt,
  FaRoute,
  FaCalendarCheck,
  FaCalendarAlt,
  FaTasks,
  FaSyncAlt,
  FaCode,
  FaBookOpen,
  FaHourglassHalf,
  FaChartLine,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import InstallAppButton from './InstallAppButton';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { unreadCount = 0 } = useNotifications() || {};

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'roadmap', label: 'My Roadmap', icon: FaRoute },
    { id: 'schedule', label: 'Daily Schedule', icon: FaCalendarCheck },
    { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
    { id: 'tasks', label: 'Tasks', icon: FaTasks },
    { id: 'revision', label: 'Revision Center', icon: FaSyncAlt, badge: 'Due', badgeColor: 'bg-warning text-dark' },
    { id: 'problems', label: 'Problem Solving', icon: FaCode },
    { id: 'notes', label: 'Notes & Journal', icon: FaBookOpen },
    { id: 'timer', label: 'Focus Timer', icon: FaHourglassHalf },
    { id: 'reports', label: 'Reports', icon: FaChartLine },
    { id: 'notifications', label: 'Notifications', icon: FaBell, badge: unreadCount > 0 ? unreadCount : null, badgeColor: 'bg-danger text-white' },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <aside
      className="sidebar-container d-flex flex-column flex-shrink-0 p-3 border-end position-fixed top-0 bottom-0 start-0 z-3"
      style={{
        width: collapsed ? '78px' : '260px',
        transition: 'width 0.2s ease',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Brand & Collapse Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        {!collapsed && (
          <div className="d-flex align-items-center gap-2">
            <div className="rounded p-2 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm">
              <FaGraduationCap className="fs-5" />
            </div>
            <div>
              <div className="fw-bold fs-5 theme-text-main mb-0" style={{ lineHeight: 1.1 }}>
                StudyOS
              </div>
              <small className="badge bg-primary bg-opacity-10 text-primary fw-semibold" style={{ fontSize: '0.65rem' }}>
                ₹40 LPA+ Command
              </small>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto rounded p-2 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm">
            <FaGraduationCap className="fs-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`btn btn-sm btn-link theme-text-sub p-1 ${collapsed ? 'd-none' : ''}`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Navigation Links */}
      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <li key={item.id} className="nav-item">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-btn nav-link w-100 d-flex align-items-center gap-3 text-start py-2 px-3 border-0 rounded-3 ${
                  isActive ? 'active shadow-sm' : ''
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="fs-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="flex-grow-1 text-truncate small fw-semibold">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={`badge ${item.badgeColor || 'bg-warning text-dark'} fw-bold`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Mobile App Install Button */}
      {!collapsed && (
        <div className="mt-2 mb-1">
          <InstallAppButton className="w-100 justify-content-center" variant="outline-primary" size="sm" />
        </div>
      )}

      {/* Footer User Info & Logout */}
      <div className="border-top pt-3 mt-2">
        {!collapsed ? (
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden me-2">
              <div
                className="rounded-circle bg-primary bg-opacity-25 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '36px', height: '36px' }}
              >
                {user?.name?.[0]?.toUpperCase() || 'E'}
              </div>
              <div className="overflow-hidden">
                <div className="fw-semibold small text-truncate theme-text-main">{user?.name || 'Engineer'}</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                  {user?.target_role?.split(' ')[0] || 'Full-Stack'}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-sm btn-outline-danger p-2 border-0"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="btn btn-sm btn-outline-danger w-100 p-2 border-0 d-flex justify-content-center"
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        )}
      </div>
    </aside>
  );
}

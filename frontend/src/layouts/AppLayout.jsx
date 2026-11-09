import { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';

export default function AppLayout({ activeTab, setActiveTab, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Fixed Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area Offset by Sidebar Width */}
      <div
        className="d-flex flex-column min-vh-100"
        style={{
          marginLeft: collapsed ? '78px' : '260px',
          transition: 'margin-left 0.2s ease',
        }}
      >
        <Topbar
          onOpenTimer={() => setActiveTab('timer')}
          onNavigateTab={setActiveTab}
          collapsed={collapsed}
        />

        <main className="flex-grow-1 p-3 p-md-4">
          <div className="container-fluid p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


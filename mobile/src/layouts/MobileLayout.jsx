import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Compass, ClipboardList, User, Bell,
  FileText, PlusCircle
} from 'lucide-react';
import { useState } from 'react';
import './MobileLayout.css';

export default function MobileLayout({ user, onLogout }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const isVolunteer = user?.role === 'VOLUNTEER';
  const isAdmin = user?.role === 'ADMIN';

  const volunteerTabs = [
    { path: '/feed', icon: Compass, label: 'Explore' },
    { path: '/applications', icon: ClipboardList, label: 'My Tasks' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const employeeTabs = [
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/reports/new', icon: PlusCircle, label: 'New Report' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const adminTabs = [
    { path: '/admin', icon: Compass, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const tabs = isVolunteer ? volunteerTabs : isAdmin ? adminTabs : employeeTabs;

  // Determine current page title
  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/feed') && path.split('/').length > 2) return 'Task Details';
    if (path === '/feed') return 'Explore Tasks';
    if (path === '/applications') return 'My Applications';
    if (path.includes('/proof')) return 'Submit Proof';
    if (path === '/profile') return 'My Profile';
    if (path === '/reports/new') return 'New Report';
    if (path === '/reports') return 'My Reports';
    if (path === '/admin') return 'Admin Dashboard';
    return 'SRA';
  };

  return (
    <div className="mobile-layout">
      {/* Top Bar */}
      <header className="mobile-topbar glass">
        <div className="mobile-topbar-left">
          <div className="mobile-topbar-logo">SRA</div>
          <span className="mobile-topbar-title title-md">{getTitle()}</span>
        </div>
        <div className="mobile-topbar-right">
          <button
            className="mobile-topbar-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            id="mobile-notifications"
          >
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
        </div>
      </header>

      {/* Notification dropdown */}
      {showNotifications && (
        <>
          <div className="notif-overlay" onClick={() => setShowNotifications(false)} />
          <div className="notif-dropdown glass animate-fade-in">
            <div className="notif-header">
              <span className="title-md">Notifications</span>
              <span className="label-md text-primary">3 new</span>
            </div>
            <div className="notif-item">
              <div className="notif-dot active"></div>
              <div className="notif-content">
                <span className="body-md">Your application for <strong>Flood Damage — Riverside Colony</strong> was accepted!</span>
                <span className="label-md text-muted">2h ago</span>
              </div>
            </div>
            <div className="notif-item">
              <div className="notif-dot active"></div>
              <div className="notif-content">
                <span className="body-md">New task near you: <strong>Clean Water Distribution — Ward 8</strong></span>
                <span className="label-md text-muted">5h ago</span>
              </div>
            </div>
            <div className="notif-item">
              <div className="notif-dot"></div>
              <div className="notif-content">
                <span className="body-md">Proof submission approved for <strong>Elderly Care task</strong></span>
                <span className="label-md text-muted">1d ago</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="mobile-main">
        <Outlet context={{ user, onLogout }} />
      </main>

      {/* Bottom Navigation */}
      <nav className="mobile-bottom-nav glass">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive || location.pathname.startsWith(tab.path) ? 'active' : ''}`
            }
          >
            <tab.icon size={22} />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

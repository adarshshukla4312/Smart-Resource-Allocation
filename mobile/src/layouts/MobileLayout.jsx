import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Compass, ClipboardList, User, Bell,
  FileText, PlusCircle, BarChart2, Users, Search,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import './MobileLayout.css';

export default function MobileLayout({ user, onLogout }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const isVolunteer = user?.role === 'VOLUNTEER';
  const isAdmin = user?.role === 'ADMIN';

  const volunteerTabs = [
    { path: '/feed', icon: Compass, label: 'EXPLORE' },
    { path: '/applications', icon: ClipboardList, label: 'MISSIONS' },
    { path: '/profile', icon: User, label: 'PROFILE' },
  ];

  const employeeTabs = [
    { path: '/reports', icon: FileText, label: 'REPORTS' },
    { path: '/reports/new', icon: PlusCircle, label: 'LOG FIELD' },
    { path: '/profile', icon: User, label: 'PROFILE' },
  ];

  const adminTabs = [
    { path: '/admin', icon: BarChart2, label: 'CONSOLE' },
    { path: '/feed', icon: Compass, label: 'GRID' },
    { path: '/reports', icon: FileText, label: 'HISTORY' },
    { path: '/profile', icon: User, label: 'IDENTITY' },
  ];

  const tabs = isVolunteer ? volunteerTabs : isAdmin ? adminTabs : employeeTabs;

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/feed/')) return 'MISSION ANALYSIS';
    if (path === '/feed') return 'MISSION GRID';
    if (path === '/applications') return 'ENGAGEMENTS';
    if (path === '/profile') return 'CONSOLE IDENTITY';
    if (path === '/reports/new') return 'FIELD LOG';
    if (path === '/reports') return 'REPORT ARCHIVE';
    if (path === '/admin') return 'SYSTEM OVERVIEW';
    return 'WISPRFLOW';
  };

  return (
    <div className="mobile-layout">
      <header className="editorial-topbar">
        <div className="topbar-left">
          <span className="brand-dot"></span>
          <span className="topbar-title serif">{getTitle()}</span>
        </div>
        <div className="topbar-right">
          <button className="icon-btn-minimal" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            <span className="notif-pulse"></span>
          </button>
          <div className="topbar-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

      {showNotifications && (
        <>
          <div className="notif-overlay-editorial" onClick={() => setShowNotifications(false)} />
          <div className="notif-dropdown-editorial animate-fade-in">
            <div className="notif-header-editorial">
              <span className="label-lg">NOTIFICATIONS</span>
              <div className="count-pill">3</div>
            </div>
            
            <div className="notif-list-editorial">
              <div className="notif-item-editorial unread">
                <div className="notif-icon-bubble"><Compass size={14} /></div>
                <div className="notif-details">
                  <p className="body-sm"><strong>Mission Grid</strong> updated with 2 new high-priority incidents.</p>
                  <span className="label-sm opacity-40">2H AGO</span>
                </div>
              </div>
              <div className="notif-item-editorial">
                <div className="notif-icon-bubble"><CheckCircle2 size={14} /></div>
                <div className="notif-details">
                  <p className="body-sm">Field Evidence for <strong>Flood Damage</strong> has been verified.</p>
                  <span className="label-sm opacity-40">1D AGO</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="mobile-main-content">
        <Outlet context={{ user, onLogout }} />
      </main>

      <nav className="editorial-bottom-nav">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `editorial-nav-item ${isActive || (tab.path !== '/profile' && location.pathname.startsWith(tab.path)) ? 'active' : ''}`
            }
          >
            <div className="nav-icon-container">
              <tab.icon size={20} />
              <div className="nav-active-indicator"></div>
            </div>
            <span className="label-sm">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}


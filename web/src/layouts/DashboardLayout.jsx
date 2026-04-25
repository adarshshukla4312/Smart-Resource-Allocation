import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ListChecks, Users, FileText, 
  BarChart3, Settings, Bell, Search, LogOut, ChevronDown,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import './DashboardLayout.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: ListChecks, label: 'Task Queue' },
  { path: '/volunteers', icon: Users, label: 'Volunteers' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ user, onLogout }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">SRA</div>
            <div className="sidebar-logo-text">
              <span className="title-md">Smart Resource</span>
              <span className="label-md text-muted">Allocation</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive || location.pathname.startsWith(item.path) ? 'active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {user?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="sidebar-user-details">
              <span className="label-lg">{user?.displayName || 'Admin'}</span>
              <span className="label-md text-muted">NGO Management</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-search">
            <Search size={18} className="topbar-search-icon" />
            <input
              type="text"
              placeholder="Search tasks, volunteers, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="global-search"
            />
          </div>

          <div className="topbar-actions">
            <button className="topbar-notification-btn" id="notifications-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="topbar-notification-badge">3</span>
            </button>

            <div className="topbar-user-menu-wrapper">
              <button 
                className="topbar-user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                id="user-menu-btn"
              >
                <div className="topbar-user-avatar">
                  {user?.displayName?.charAt(0) || 'A'}
                </div>
                <span className="label-lg">{user?.displayName || 'Admin'}</span>
                <ChevronDown size={16} />
              </button>
              
              {showUserMenu && (
                <div className="topbar-user-dropdown glass animate-fade-in">
                  <div className="topbar-user-dropdown-header">
                    <Shield size={16} />
                    <span className="label-md">{user?.role || 'NGO_MANAGEMENT'}</span>
                  </div>
                  <button className="topbar-user-dropdown-item" onClick={onLogout} id="logout-btn">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ListChecks, Users, FileText, 
  BarChart3, Settings, Bell, Search, LogOut, ChevronDown,
  Shield, Menu, Sun, Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './DashboardLayout.css';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/tasks', icon: ListChecks, label: 'Task Queue' },
  { path: '/admin/volunteers', icon: Users, label: 'Volunteers' },
  { path: '/admin/reports', icon: FileText, label: 'Reports' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ user, onLogout }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="dashboard-layout">
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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
              onClick={() => setSidebarOpen(false)}
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
          <button 
            className="topbar-menu-btn" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

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
            <button 
              className="topbar-action-btn theme-toggle" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
              id="theme-toggle-btn"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

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
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

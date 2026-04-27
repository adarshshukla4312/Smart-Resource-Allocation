import { Outlet, NavLink } from 'react-router-dom';
import { PlusCircle, FileText, LogOut, Zap, Briefcase, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import './EmployeeLayout.css';

export default function EmployeeLayout({ user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="employee-layout">
      <header className="employee-topbar">
        <div className="employee-logo">
          <div className="emp-logo-icon">
            <Briefcase size={18} />
          </div>
          <div className="emp-logo-text">
            <span className="emp-logo-name">SRA</span>
            <span className="emp-logo-sub">Field Ops</span>
          </div>
        </div>

        <nav className="employee-nav">
          <NavLink to="/employee/reports" end className={({isActive}) => `emp-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            <span>My Reports</span>
          </NavLink>
          <NavLink to="/employee/create-report" className={({isActive}) => `emp-nav-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={18} />
            <span>New Report</span>
          </NavLink>
          <NavLink to="/employee/quick-report" className={({isActive}) => `emp-nav-item emp-nav-quick ${isActive ? 'active' : ''}`}>
            <Zap size={18} />
            <span>Quick Report</span>
          </NavLink>
        </nav>

        <div className="employee-user-menu">
          <button 
            className="emp-user-btn" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="emp-avatar">
              {user?.displayName?.charAt(0) || 'E'}
            </div>
            <span className="emp-user-name hidden-mobile">{user?.displayName || 'Employee'}</span>
            <ChevronDown size={14} className="hidden-mobile" style={{ color: 'var(--on-surface-variant)' }} />
          </button>

          {showUserMenu && (
            <>
              <div className="emp-dropdown-backdrop" onClick={() => setShowUserMenu(false)} />
              <div className="emp-dropdown animate-fade-in">
                <div className="emp-dropdown-header">
                  <div className="emp-avatar" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                    {user?.displayName?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <span className="title-md">{user?.displayName || 'Employee'}</span>
                    <span className="body-sm text-muted">Field Officer</span>
                  </div>
                </div>
                <div className="emp-dropdown-divider" />
                <button className="emp-dropdown-item emp-dropdown-logout" onClick={onLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="employee-main">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet, NavLink } from 'react-router-dom';
import { List, ClipboardList, User, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import './VolunteerLayout.css';

export default function VolunteerLayout({ user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="volunteer-layout">
      <header className="volunteer-topbar">
        <div className="volunteer-logo">
          <Shield className="text-primary" size={24} />
          <span className="title-md">SRA Volunteer</span>
        </div>

        <nav className="volunteer-nav">
          <NavLink to="/volunteer/tasks" className={({isActive}) => `vol-nav-item ${isActive ? 'active' : ''}`}>
            <List size={20} />
            <span>Task Feed</span>
          </NavLink>
          <NavLink to="/volunteer/applications" className={({isActive}) => `vol-nav-item ${isActive ? 'active' : ''}`}>
            <ClipboardList size={20} />
            <span>My Tasks</span>
          </NavLink>
        </nav>

        <div className="volunteer-user-menu">
          <button 
            className="vol-user-btn" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="vol-avatar">
              {user?.displayName?.charAt(0) || 'V'}
            </div>
            <span className="label-md hidden-mobile">{user?.displayName || 'Volunteer'}</span>
          </button>

          {showUserMenu && (
            <div className="vol-dropdown glass animate-fade-in">
              <NavLink to="/volunteer/profile" className="vol-dropdown-item" onClick={() => setShowUserMenu(false)}>
                <User size={16} />
                <span>Profile</span>
              </NavLink>
              <button className="vol-dropdown-item" onClick={onLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="volunteer-main">
        <Outlet context={{ user, onLogout }} />
      </main>
    </div>
  );
}

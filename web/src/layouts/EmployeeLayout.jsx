import { Outlet, NavLink } from 'react-router-dom';
import { PlusCircle, FileText, User, LogOut, Briefcase } from 'lucide-react';
import { useState } from 'react';
import './EmployeeLayout.css';

export default function EmployeeLayout({ user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="employee-layout">
      <header className="employee-topbar">
        <div className="employee-logo">
          <Briefcase className="text-secondary" size={24} />
          <span className="title-md">SRA Field Ops</span>
        </div>

        <nav className="employee-nav">
          <NavLink to="/employee/create-report" className={({isActive}) => `emp-nav-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />
            <span>New Report</span>
          </NavLink>
          <NavLink to="/employee/reports" className={({isActive}) => `emp-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>My Reports</span>
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
            <span className="label-md hidden-mobile">{user?.displayName || 'Employee'}</span>
          </button>

          {showUserMenu && (
            <div className="emp-dropdown glass animate-fade-in">
              <button className="emp-dropdown-item" onClick={onLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="employee-main">
        <Outlet />
      </main>
    </div>
  );
}

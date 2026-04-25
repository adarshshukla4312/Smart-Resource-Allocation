import { useState } from 'react';
import { Eye, EyeOff, Shield, ArrowRight, Heart, FileText } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('VOLUNTEER');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (username === 'volunteer' && password === 'demo') {
        onLogin({
          displayName: 'Arjun Mehta',
          role: 'VOLUNTEER',
          uid: 'vol-001'
        });
      } else if (username === 'employee' && password === 'demo') {
        onLogin({
          displayName: 'Priya Sharma',
          role: 'NGO_EMPLOYEE',
          uid: 'emp-001'
        });
      } else if (username === 'admin' && password === 'admin') {
        onLogin({
          displayName: 'Admin Sarah',
          role: 'ADMIN',
          uid: 'mgr-001'
        });
      } else {
        setError('Invalid credentials. Try volunteer/demo, employee/demo, or admin/admin.');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="login-mobile">
      {/* Gradient background orbs */}
      <div className="login-bg-orb login-orb-1"></div>
      <div className="login-bg-orb login-orb-2"></div>
      <div className="login-bg-orb login-orb-3"></div>

      <div className="login-mobile-content animate-fade-in">
        {/* Logo & Branding */}
        <div className="login-branding">
          <div className="login-logo-mark">SRA</div>
          <h1 className="display-sm">Smart Resource<br/>Allocation</h1>
          <p className="body-md text-muted">Data-Driven Volunteer Coordination</p>
        </div>

        {/* Role Selector */}
        <div className="login-role-selector" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <button
            className={`login-role-btn ${selectedRole === 'VOLUNTEER' ? 'active' : ''}`}
            onClick={() => setSelectedRole('VOLUNTEER')}
            type="button"
          >
            <Heart size={16} />
            <span style={{fontSize: '12px'}}>Volunteer</span>
          </button>
          <button
            className={`login-role-btn ${selectedRole === 'NGO_EMPLOYEE' ? 'active' : ''}`}
            onClick={() => setSelectedRole('NGO_EMPLOYEE')}
            type="button"
          >
            <FileText size={16} />
            <span style={{fontSize: '12px'}}>Field Officer</span>
          </button>
          <button
            className={`login-role-btn ${selectedRole === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setSelectedRole('ADMIN')}
            type="button"
          >
            <Shield size={16} />
            <span style={{fontSize: '12px'}}>Admin</span>
          </button>
        </div>

        {/* Login Form */}
        <form className="login-mobile-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error-mobile animate-fade-in">
              <span>{error}</span>
            </div>
          )}

          <div className="login-field-mobile">
            <label className="label-md" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="mobile-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="login-field-mobile">
            <label className="label-md" htmlFor="login-password">Password</label>
            <div className="login-password-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="mobile-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-submit-mobile"
            disabled={isLoading}
            id="login-submit"
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="login-demo-hint">
          <div className="login-demo-row">
            <Shield size={12} />
            <span className="label-md text-muted">Demo: <strong className="text-primary">volunteer</strong> / <strong className="text-primary">demo</strong></span>
          </div>
          <div className="login-demo-row">
            <Shield size={12} />
            <span className="label-md text-muted">Demo: <strong className="text-primary">employee</strong> / <strong className="text-primary">demo</strong></span>
          </div>
          <div className="login-demo-row">
            <Shield size={12} />
            <span className="label-md text-muted">Demo: <strong className="text-primary">admin</strong> / <strong className="text-primary">admin</strong></span>
          </div>
        </div>

        {/* Footer */}
        <div className="login-mobile-footer">
          <p className="label-md text-muted">SRA v1.0 · Powered by Google Cloud</p>
        </div>
      </div>
    </div>
  );
}

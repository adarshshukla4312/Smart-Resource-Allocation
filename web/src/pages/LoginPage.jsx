import { useState } from 'react';
import { Eye, EyeOff, Shield, ArrowRight, User, Building2, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, register, error: authError } = useAuth();
  const [selectedRole, setSelectedRole] = useState('NGO');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const roles = [
    { id: 'VOLUNTEER', label: 'Volunteer', icon: <User size={20} />, role: 'VOLUNTEER' },
    { id: 'NGO', label: 'NGO', icon: <Building2 size={20} />, role: 'NGO_MANAGEMENT' },
    { id: 'EMPLOYEE', label: 'NGO Employee', icon: <Briefcase size={20} />, role: 'NGO_EMPLOYEE' },
  ];

  const getRoleValue = () => roles.find(r => r.id === selectedRole)?.role || 'VOLUNTEER';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        const firebaseUser = await register(username.trim(), password.trim());
        // Create profile in Firestore directly to bypass the unconfigured API
        const { setDoc, doc, db } = await import('../firebase.js');
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          displayName: username.split('@')[0],
          role: getRoleValue(),
          phone: '',
          homeLocation: { lat: 0, lng: 0, address: '' },
          interests: [],
          skills: [],
          availability: [],
          createdAt: new Date().toISOString()
        });
      } else {
        await login(username.trim(), password.trim());
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Hero Panel */}
      <div className="login-hero">
        <div className="login-hero-content">
          <div className="login-hero-badge">
            <Shield size={18} />
            <span>Secure Access Portal</span>
          </div>
          
          <h1 className="login-hero-title">
            Smart<br/>Resource<br/>Allocation
          </h1>
          
          <p className="login-hero-tagline">
            Data-Driven Volunteer Coordination for Social Impact
          </p>

          <div className="login-hero-stats">
            <div className="login-hero-stat">
              <span className="login-hero-stat-value">342</span>
              <span className="login-hero-stat-label">Active Volunteers</span>
            </div>
            <div className="login-hero-stat">
              <span className="login-hero-stat-value">24</span>
              <span className="login-hero-stat-label">Live Tasks</span>
            </div>
            <div className="login-hero-stat">
              <span className="login-hero-stat-value">98%</span>
              <span className="login-hero-stat-label">Sync Rate</span>
            </div>
          </div>
        </div>
        
        <div className="login-hero-gradient-orb login-hero-orb-1"></div>
        <div className="login-hero-gradient-orb login-hero-orb-2"></div>
        <div className="login-hero-gradient-orb login-hero-orb-3"></div>
      </div>

      {/* Right Login Panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <div className="login-logo-mark">SRA</div>
            <h2 className="headline-md">{isRegistering ? 'Create Account' : 'Management Console'}</h2>
          </div>

          <div className="role-selection-container">
            <p className="label-md role-selection-title">Who are you joining as?</p>
            <div className="role-options">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`role-option ${selectedRole === role.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setError('');
                  }}
                >
                  <div className="role-icon">{role.icon}</div>
                  <span className="role-label">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {(error || authError) && (
              <div className="login-error animate-fade-in">
                <span>{error || authError}</span>
              </div>
            )}

            <div className="login-field">
              <label className="label-md" htmlFor="login-username">Email</label>
              <input
                id="login-username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="login-field">
              <label className="label-md" htmlFor="login-password">Password</label>
              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={isLoading}
              id="login-submit"
            >
              {isLoading ? (
                <span className="login-spinner"></span>
              ) : (
                <>
                  <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="login-toggle-mode"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '8px', fontSize: '14px', marginTop: '8px', textAlign: 'center', width: '100%' }}
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </form>

          <div className="login-footer">
            <p className="label-md text-muted">Smart Resource Allocation v1.0 · April 2026</p>
            <p className="label-md text-muted">Powered by Google Cloud Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Globe,
  GitBranch,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      let msg = 'Invalid credentials. Please check your email and password.';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        msg = 'Invalid credentials. Please verify your email address and password.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Access temporarily restricted due to multiple failed login attempts. Try again later.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async () => {
    setEmail('admin@bizmonitor.io');
    setPassword('Enterprise2026!');
    setError('');
    setLoading(true);
    try {
      await loginDemo('admin@bizmonitor.io');
      navigate('/dashboard');
    } catch {
      setError('Failed to start demo session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialDemo = async (providerEmail: string) => {
    setError('');
    setLoading(true);
    try {
      await loginDemo(providerEmail);
      navigate('/dashboard');
    } catch {
      setError('Social authentication demo failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSent(false);
    }, 2000);
  };

  return (
    <div className="login-page">
      <div className="bg-glow">
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 36px 32px;
          z-index: 10;
        }

        .login-brand-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-brand-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: var(--shadow-glow);
          margin-bottom: 12px;
        }

        .login-title {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: var(--text-muted);
          font-size: 0.78rem;
        }

        .login-divider::before, .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-color);
        }

        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
      `}</style>

      <div className="login-card glass-panel glass-panel-hover">
        <div className="login-brand-header">
          <div className="login-brand-icon">
            <Activity size={28} />
          </div>
          <h1 className="login-title">
            Welcome back to <span className="gradient-text">BizMonitor</span>
          </h1>
          <p className="login-subtitle">
            Enter your credentials to access your system dashboard
          </p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px 14px', marginBottom: 16, textTransform: 'none', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', padding: 0, color: 'var(--accent-primary)' }}
                onClick={() => setShowForgotModal(true)}
              >
                Forgot password?
              </button>
            </div>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Remember this device
            </label>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Demo Sign In
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ padding: 12, fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-divider">OR CONTINUE WITH</div>

        <div className="social-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => handleSocialDemo('google.user@bizmonitor.io')}
          >
            <Globe size={16} /> Google Workspace
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => handleSocialDemo('github.dev@bizmonitor.io')}
          >
            <GitBranch size={16} /> GitHub Enterprise
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have a BizMonitor account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create Organization Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
            <h3 style={{ marginBottom: 8 }}>Reset Your Password</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Enter your work email address and we'll send you a secure recovery link.
            </p>

            {resetSent ? (
              <div className="badge badge-success" style={{ width: '100%', padding: 12, justifyContent: 'center' }}>
                <ShieldCheck size={16} /> Recovery email sent! Checking inbox...
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <input type="email" className="form-input form-input-no-icon" placeholder="name@company.com" required />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForgotModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Send Reset Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

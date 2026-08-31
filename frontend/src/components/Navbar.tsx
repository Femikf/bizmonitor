import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkBackendHealth } from '../services/api';
import {
  Activity,
  Bell,
  Moon,
  Sun,
  Search,
  LogOut,
  User,
  Shield,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      const health = await checkBackendHealth();
      if (isMounted) {
        if (health?.status === 'ok') {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      }
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const notifications = [
    { id: 1, title: 'API Response Time Alert', desc: 'US-East cluster latency spike resolved (42ms avg)', time: '5m ago', type: 'success' },
    { id: 2, title: 'New Customer Signup', desc: 'Acme Corp registered enterprise subscription', time: '18m ago', type: 'info' },
    { id: 3, title: 'SSL Certificate Renewed', desc: 'api.bizmonitor.io wildcard SSL extended for 1 year', time: '1h ago', type: 'success' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header glass-panel">
      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
          height: 64px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .brand-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: var(--shadow-glow);
        }

        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .nav-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--accent-emerald);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .nav-status-badge.disconnected {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.25);
          color: var(--accent-rose);
        }

        .nav-search {
          position: relative;
          width: 320px;
        }

        .nav-search input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }

        .nav-search input:focus {
          border-color: var(--accent-primary);
        }

        .search-shortcut {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-btn {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .nav-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
          background: var(--bg-card-hover);
        }

        .notif-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-rose);
        }

        .notif-dropdown, .profile-dropdown {
          position: absolute;
          top: 52px;
          right: 0;
          width: 320px;
          padding: 12px;
          z-index: 50;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 10px 4px 4px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          cursor: pointer;
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>

      {/* Brand & System Status */}
      <div className="nav-brand" onClick={() => navigate('/dashboard')}>
        <div className="brand-icon-box">
          <Activity size={20} />
        </div>
        <div>
          <span className="brand-title gradient-text">BizMonitor</span>
        </div>
        <div className={`nav-status-badge ${backendStatus === 'disconnected' ? 'disconnected' : ''}`}>
          {backendStatus === 'connected' ? (
            <>
              <CheckCircle2 size={13} />
              <span>Backend: Connected ✓</span>
            </>
          ) : backendStatus === 'disconnected' ? (
            <>
              <XCircle size={13} />
              <span>Backend: Disconnected ✗</span>
            </>
          ) : (
            <>
              <span className="pulse-dot"></span>
              <span>Backend: Connecting...</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Search */}
      <div className="nav-search">
        <Search size={16} className="input-icon" style={{ left: 10, top: 12 }} />
        <input type="text" placeholder="Search monitors, events, metrics..." />
        <span className="search-shortcut">⌘K</span>
      </div>

      {/* User Actions */}
      <div className="nav-actions">
        {/* Dark/Light Theme Switcher */}
        <button
          className="nav-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="nav-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notif-dot"></span>
          </button>

          {showNotifications && (
            <div className="notif-dropdown glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                <span className="badge badge-info">3 New</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ fontSize: '0.8rem', padding: 8, borderRadius: 6, background: 'var(--bg-secondary)' }}>
                    <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span>{n.title}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{n.time}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt="Avatar"
              className="profile-avatar"
            />
            <span className="profile-name">{user?.name || 'Admin User'}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown glass-panel" style={{ width: 220 }}>
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                <div style={{ fontSize: '0.7rem', marginTop: 4 }} className="badge badge-info">{user?.company}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', fontSize: '0.82rem', padding: '6px 8px' }}>
                  <User size={15} /> Profile Settings
                </button>
                <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', fontSize: '0.82rem', padding: '6px 8px' }}>
                  <Shield size={15} /> Security & Keys
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleLogout}
                  style={{ justifyContent: 'flex-start', fontSize: '0.82rem', padding: '6px 8px', color: 'var(--accent-rose)' }}
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

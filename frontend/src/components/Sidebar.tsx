import React from 'react';
import {
  LayoutDashboard,
  Database,
  Lightbulb,
  LineChart,
  MessageSquare,
  Settings,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'insights', label: 'Insights', icon: Lightbulb, badge: 'Coming soon' },
    { id: 'forecast', label: 'Forecast', icon: LineChart, badge: 'Coming soon' },
    { id: 'ask', label: 'Ask BizMonitor', icon: MessageSquare, badge: 'Coming soon' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: 'Coming soon' },
  ];

  return (
    <aside className="sidebar-container glass-panel">
      <style>{`
        .sidebar-container {
          width: 240px;
          min-height: calc(100vh - 64px);
          padding: 20px 14px;
          border-radius: 0;
          border-top: none;
          border-left: none;
          border-bottom: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .sidebar-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-item.active {
          color: #ffffff;
          background: var(--accent-gradient);
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .sidebar-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-pro-card {
          padding: 14px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(217, 70, 239, 0.15) 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          margin-top: 20px;
        }
      `}</style>

      <div className="sidebar-nav">
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 8px 8px' }}>
          Navigation
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="sidebar-item-left">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <div className="sidebar-pro-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Building2 size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user?.organization?.name || 'Organization Workspace'}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            Role: <strong style={{ color: 'var(--accent-emerald)', textTransform: 'capitalize' }}>{user?.role || 'owner'}</strong>
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Industry: {user?.organization?.industry || 'Retail'}
          </div>
        </div>

        <div style={{ marginTop: 12, padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HelpCircle size={14} /> Documentation
          </span>
          <span>v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};


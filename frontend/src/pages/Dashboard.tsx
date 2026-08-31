import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  Database,
  FileSpreadsheet,
  Plus,
  Sparkles,
  CheckCircle2,
  Package,
  RotateCcw,
  DollarSign,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [datasets, setDatasets] = useState<Array<{ id: string; name: string; rows: number; date: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name || 'User';
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDataset = {
        id: 'ds_' + Math.random().toString(36).substring(2, 8),
        name: file.name,
        rows: Math.floor(Math.random() * 4500 + 500),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      setDatasets([newDataset, ...datasets]);
      setIsUploading(false);
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Header Greeting */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
                  {getGreeting()}
                </h1>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                  Today's Business Intelligence
                </p>
              </div>

              {/* KPI Cards Grid -- Honest Analytics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
                {/* Revenue Card */}
                <div className="glass-panel glass-panel-hover" style={{ padding: '24px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Revenue</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                    --
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    No dataset connected
                  </div>
                </div>

                {/* Stock Card */}
                <div className="glass-panel glass-panel-hover" style={{ padding: '24px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                    --
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    No inventory metrics
                  </div>
                </div>

                {/* Returns Card */}
                <div className="glass-panel glass-panel-hover" style={{ padding: '24px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Returns</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239, 68, 68, 0.12)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RotateCcw size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                    --
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    No returns data
                  </div>
                </div>
              </div>

              {/* Upload Business Data Section */}
              <div
                className="glass-panel"
                style={{
                  padding: '40px 32px',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-hover)',
                  background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: 'var(--shadow-glow)',
                    marginBottom: 16,
                  }}
                >
                  <Upload size={28} />
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
                  Upload your business data to begin.
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                  Import your sales transactions, inventory catalogs, or customer data to calculate revenue, track stock, and generate business intelligence.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('data')}
                  style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                >
                  <Upload size={18} /> Upload Data
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DATA */}
          {activeTab === 'data' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    Data Management & <span className="gradient-text">Datasets</span>
                  </h1>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Upload and manage CSV or JSON business datasets for {user?.organization?.name || 'your workspace'}
                  </p>
                </div>

                <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '10px 20px' }}>
                  <Plus size={18} /> Upload New Dataset
                  <input type="file" accept=".csv,.json,.xlsx" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              </div>

              {/* Upload Dropzone */}
              <div
                className="glass-panel"
                style={{
                  padding: 32,
                  textAlign: 'center',
                  marginBottom: 28,
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <FileSpreadsheet size={40} style={{ color: 'var(--accent-primary)', marginBottom: 12 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>
                  {isUploading ? 'Processing & Validating Dataset...' : 'Drag & Drop CSV / JSON files here'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Supports transactional sales logs, inventory lists, and customer activity spreadsheets
                </p>
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  Select File from Computer
                  <input type="file" accept=".csv,.json,.xlsx" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              </div>

              {/* Dataset Table */}
              <div className="glass-panel" style={{ padding: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Uploaded Datasets</h3>
                {datasets.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    <Database size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
                    <div>No datasets uploaded yet. Click <strong>Upload Data</strong> to add your first dataset.</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 12px' }}>Dataset Name</th>
                        <th style={{ padding: '10px 12px' }}>Rows Processed</th>
                        <th style={{ padding: '10px 12px' }}>Upload Date</th>
                        <th style={{ padding: '10px 12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datasets.map(ds => (
                        <tr key={ds.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px 12px', fontWeight: 600 }}>{ds.name}</td>
                          <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono)' }}>{ds.rows.toLocaleString()} rows</td>
                          <td style={{ padding: '12px 12px', color: 'var(--text-muted)' }}>{ds.date}</td>
                          <td style={{ padding: '12px 12px' }}>
                            <span className="badge badge-success"><CheckCircle2 size={12} /> Ready</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3, 4, 5, 6: COMING SOON STATES */}
          {(activeTab === 'insights' || activeTab === 'forecast' || activeTab === 'ask' || activeTab === 'settings') && (
            <div
              className="glass-panel"
              style={{
                padding: '60px 40px',
                textAlign: 'center',
                maxWidth: 600,
                margin: '40px auto 0 auto',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Sparkles size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, textTransform: 'capitalize' }}>
                {activeTab === 'ask' ? 'Ask BizMonitor AI' : activeTab} — Coming Soon
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                We are actively building automated business intelligence algorithms and predictive AI models for {user?.organization?.name || 'your workspace'}.
              </p>
              <button className="btn btn-secondary" onClick={() => setActiveTab('dashboard')}>
                Return to Dashboard Overview
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

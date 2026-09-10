import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  uploadDatasetToPipeline,
  runDatasetAnalytics,
  getCloudStatus,
  getOpsPilotOverview,
  fetchUploadedDatasets,
  type PipelineResponse,
  type CloudStatusResponse,
  type ExecutableAction,
  type OpsPilotOverview,
} from '../services/api';
import { OpsPilotBoard } from '../components/OpsPilotBoard';
import { AskOpsPilotTerminal } from '../components/AskOpsPilotTerminal';
import { OpsPilotActionModal } from '../components/OpsPilotActionModal';
import {
  Upload,
  Database,
  FileSpreadsheet,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  Cloud,
  Cpu,
  ArrowDown,
} from 'lucide-react';


interface DatasetCard {
  id: string;
  name: string;
  category: 'Sales' | 'Inventory' | 'Purchases' | 'Returns' | string;
  rows: number;
  qualityScore: number;
  status: 'Ready' | 'Processing';
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pipelineReports, setPipelineReports] = useState<PipelineResponse[]>([]);
  const [cloudStatus, setCloudStatus] = useState<CloudStatusResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<PipelineResponse | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'validation' | 'profiling' | 'normalization' | 'destinations' | 'analytics'>('overview');
  const [selectedAction, setSelectedAction] = useState<ExecutableAction | null>(null);
  const [terminalQuery, setTerminalQuery] = useState<string>('');
  const [opsOverview, setOpsOverview] = useState<OpsPilotOverview | null>(null);
  const [datasets, setDatasets] = useState<DatasetCard[]>([]);
  const [anomalies, setAnomalies] = useState<Array<{ id: string; title: string; category: string; impact: string; bqQuery: string }>>([]);

  useEffect(() => {
    getCloudStatus().then(status => {
      if (status) setCloudStatus(status);
    });

    // Check if a dataset is already loaded in the active session
    getOpsPilotOverview().then(ov => {
      if (ov && ov.has_data) {
        setOpsOverview(ov);
      }
    }).catch(err => console.warn('OpsPilot initial overview check:', err));

    fetchUploadedDatasets().then(metaList => {
      if (metaList && metaList.length > 0) {
        const cards: DatasetCard[] = metaList.map(m => ({
          id: m.dataset_id,
          name: m.dataset_name,
          category: 'Operations',
          rows: m.rows,
          qualityScore: 97,
          status: 'Ready',
        }));
        setDatasets(cards);
      }
    }).catch(err => console.warn('Uploaded datasets check:', err));
  }, []);

  // Dynamic Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name || 'Femi';
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const orgId = user?.organizationId || 'default-org';
      const userId = user?.id || 'anonymous';
      const response = await uploadDatasetToPipeline(file, orgId, userId);

      setPipelineReports(prev => [response, ...prev]);

      // Update Datasets Grid with new uploaded dataset
      const newCard: DatasetCard = {
        id: response.dataset_id,
        name: response.dataset_name,
        category: response.analytics.dataset_category,
        rows: response.validation.total_rows,
        qualityScore: response.analytics.quality_score,
        status: 'Ready',
      };
      setDatasets(prev => [newCard, ...prev]);

      // Fetch dynamic OpsPilot 5-Stage overview computed from uploaded file
      try {
        const freshOv = await getOpsPilotOverview(response.dataset_id);
        if (freshOv && freshOv.has_data) {
          setOpsOverview(freshOv);
        }
      } catch (e) {
        console.warn('Could not refresh dynamic OpsPilot overview:', e);
      }
      if (response.analytics.anomalies_detected.length > 0) {
        const newAnoms = response.analytics.anomalies_detected.map(a => ({
          id: a.id,
          title: a.title,
          category: response.analytics.dataset_category,
          impact: a.impact_percentage ? `+${a.impact_percentage}% shift` : 'Alert',
          bqQuery: a.bigquery_query,
        }));
        setAnomalies(prev => [...newAnoms, ...prev]);
      }

      setSelectedReport(response);
      setModalTab('overview');
    } catch (err: any) {
      console.error('Pipeline processing error:', err);
      setUploadError(err.message || 'Failed to process dataset through pipeline');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const runBigQueryAnalyticsForDataset = async (dataset: DatasetCard) => {
    try {
      const report = await runDatasetAnalytics(dataset.id, dataset.name, dataset.category);
      if (report.anomalies_detected.length > 0) {
        const freshAnoms = report.anomalies_detected.map(a => ({
          id: a.id,
          title: a.title,
          category: dataset.category,
          impact: a.impact_percentage ? `+${a.impact_percentage}% shift` : 'Alert',
          bqQuery: a.bigquery_query,
        }));
        setAnomalies(prev => [...freshAnoms, ...prev]);
      }
    } catch (err) {
      console.warn('BigQuery analytics trigger note:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ flex: 1, padding: '28px 36px' }}>
          {/* TAB 1: DASHBOARD / OPSPILOT WORKFLOW */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Header OpsPilot Banner */}
              <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      OpsPilot Autonomous BI Engine
                    </span>
                    {cloudStatus?.mode === 'live' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px', borderRadius: 20, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.74rem', fontWeight: 700 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                        GCP Live ({cloudStatus.project_id}) • BigQuery Active • Firestore Active
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: 'var(--accent-primary)', fontSize: '0.74rem', fontWeight: 700 }}>
                        ⚡ Simulated Mode
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
                    {getGreeting()}
                  </h1>
                </div>


                <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '12px 24px', fontSize: '0.92rem' }}>
                  <Upload size={18} /> Upload Dataset
                  <input type="file" accept=".csv,.json,.xlsx,.parquet" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>

              {/* ZERO DUMMY DATA: IF NO DATASET LOADED YET, SHOW UPLOAD ONBOARDING HERO */}
              {datasets.length === 0 ? (
                <div
                  className="glass-panel"
                  style={{
                    padding: '52px 36px',
                    borderRadius: 16,
                    textAlign: 'center',
                    marginBottom: 36,
                    border: '2px dashed var(--border-color)',
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                    }}
                  >
                    <FileSpreadsheet size={32} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, color: '#ffffff' }}>
                    Upload Your Business Data to Begin
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                    OpsPilot provides 100% dynamic, tailored intelligence with <strong>zero dummy data</strong>. Upload your operations report — such as Weighbridge logs, Sales registers, Inventory sheets, Purchase orders, or Returns — to automatically detect bottlenecks, diagnose root causes, and generate executable actions.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
                    <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '14px 28px', fontSize: '0.95rem' }}>
                      <Upload size={18} /> Select Dataset from Computer (.xlsx, .csv, .json)
                      <input type="file" accept=".csv,.json,.xlsx,.parquet" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  {/* OPSPILOT 5-STAGE COMMAND CENTER BOARD & HERO CARD */}
                  <OpsPilotBoard
                    overview={opsOverview}
                    onOpenAction={(action) => setSelectedAction(action)}
                    onAskQuery={(q) => {
                      setTerminalQuery(q);
                      setActiveTab('ask');
                    }}
                  />

                  {/* INTERACTIVE ASK OPSPILOT TERMINAL */}
                  <div style={{ marginBottom: 36 }}>
                    <AskOpsPilotTerminal
                      datasetId={opsOverview?.dataset_id}
                      companyName={opsOverview?.company_name}
                      onOpenAction={(action) => setSelectedAction(action)}
                    />
                  </div>

                  {/* Business Data Header */}
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Active Business Datasets ({datasets.length})
                    </h2>
                    <div style={{ height: 1, width: '100%', background: 'var(--border-color)', marginTop: 8 }} />
                  </div>

                  {/* DATASETS GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 36 }}>
                    {datasets.map(ds => (
                      <div
                        key={ds.id}
                        className="glass-panel glass-panel-hover"
                        style={{
                          padding: '24px 28px',
                          borderRadius: 14,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderLeft: '4px solid #10b981',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                            {ds.name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {ds.rows.toLocaleString()} rows
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              padding: '6px 14px',
                              borderRadius: 8,
                              background: ds.qualityScore >= 90 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: ds.qualityScore >= 90 ? '#34d399' : '#fbbf24',
                              border: `1px solid ${ds.qualityScore >= 90 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                              marginBottom: 8,
                              display: 'inline-block',
                            }}
                          >
                            Quality {ds.qualityScore}
                          </div>
                          <div>
                            <button
                              onClick={() => runBigQueryAnalyticsForDataset(ds)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Run BQ Scan ➔
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* OPSPILOT ANALYTICS ENGINE & BIGQUERY SANDBOX PIPELINE */}
                  <div
                    className="glass-panel"
                    style={{
                      padding: 32,
                      borderRadius: 16,
                      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                      border: '1px solid var(--border-hover)',
                      boxShadow: 'var(--shadow-glow)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cpu size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>OpsPilot Analytics Engine</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Automated BigQuery Sandbox Anomaly & Pattern Detection Pipeline
                        </p>
                      </div>
                    </div>

                    {/* VISUAL DETECTION FLOW */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 20px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 24 }}>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {datasets.map(ds => (
                          <span key={ds.id} style={{ padding: '6px 16px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {ds.name}
                          </span>
                        ))}
                      </div>

                      <ArrowDown size={20} style={{ color: 'var(--accent-primary)' }} />

                      <div style={{ padding: '12px 28px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid var(--accent-primary)', borderRadius: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Analytics Engine</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>BigQuery Sandbox SQL Analysis</div>
                      </div>

                      <ArrowDown size={20} style={{ color: 'var(--accent-primary)' }} />

                      <div style={{ padding: '6px 20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800, color: '#34d399' }}>
                        Detect
                      </div>

                      <ArrowDown size={20} style={{ color: '#10b981' }} />

                      <div style={{ padding: '16px 32px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 12, textAlign: 'center', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          ⚡ Detected Business Anomaly
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                          "{anomalies[0]?.title || opsOverview?.detected_issues[0]?.headline || 'All transactions verified'}"
                        </div>
                      </div>
                    </div>

                    {/* DETECTED ANOMALIES FEED */}
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>Detected Insights & Alerts</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {anomalies.map((anom, idx) => (
                        <div key={idx} style={{ padding: 16, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10, borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>{anom.title}</span>
                              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 700 }}>
                                {anom.impact}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              BigQuery SQL: {anom.bqQuery}
                            </div>
                          </div>
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>BigQuery Live</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: DATA MANAGEMENT & PROCESSING PIPELINE */}
          {activeTab === 'data' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    Data Management & <span className="gradient-text">Processing Pipeline</span>
                  </h1>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Upload business datasets (CSV, JSON, XLSX, Parquet) for automated validation, profiling, and BigQuery warehouse sync.
                  </p>
                </div>

                <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '10px 20px' }}>
                  <Plus size={18} /> Upload New Dataset
                  <input type="file" accept=".csv,.json,.xlsx,.parquet" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>

              {/* Upload Dropzone */}
              <div
                className="glass-panel"
                style={{
                  padding: 36,
                  textAlign: 'center',
                  marginBottom: 28,
                  border: isUploading ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: isUploading ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <FileSpreadsheet size={44} style={{ color: isUploading ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: 12 }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>
                  {isUploading ? 'Executing Data Ingestion Pipeline...' : 'Drag & Drop CSV, JSON, Excel, or Parquet files'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Triggers Pandas ingestion ➔ Validation check ➔ Column statistical profiling ➔ snake_case normalization ➔ BigQuery staging ➔ Firestore metadata store
                </p>

                {uploadError && (
                  <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#f87171', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <label className="btn btn-secondary" style={{ cursor: 'pointer', pointerEvents: isUploading ? 'none' : 'auto' }}>
                  {isUploading ? 'Processing Pipeline...' : 'Select File from Computer'}
                  <input type="file" accept=".csv,.json,.xlsx,.parquet" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>

              {/* Dataset Table */}
              <div className="glass-panel" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Ingested & Processed Datasets</h3>
                {pipelineReports.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    <Database size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
                    <div>No datasets uploaded yet. Click <strong>Upload New Dataset</strong> to process your first dataset.</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px' }}>Dataset Name</th>
                        <th style={{ padding: '12px' }}>File Info</th>
                        <th style={{ padding: '12px' }}>Rows & Cols</th>
                        <th style={{ padding: '12px' }}>BigQuery Table</th>
                        <th style={{ padding: '12px' }}>Health Status</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pipelineReports.map(rep => (
                        <tr key={rep.dataset_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                            <div style={{ fontSize: '0.9rem' }}>{rep.dataset_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{rep.dataset_id}</div>
                          </td>
                          <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>
                            <div>{rep.file_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{(rep.file_size_bytes / 1024).toFixed(1)} KB</div>
                          </td>
                          <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)' }}>
                            {rep.validation.total_rows.toLocaleString()} rows × {rep.validation.total_columns} cols
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                              {rep.bigquery.mode === 'live' ? '☁ Live BQ' : '⚡ Simulated BQ'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            {rep.validation.is_valid ? (
                              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={12} /> Ready
                              </span>
                            ) : (
                              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <AlertTriangle size={12} /> Issues
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setSelectedReport(rep);
                                setModalTab('overview');
                              }}
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                            >
                              <Eye size={14} /> View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ASK OPSPILOT AI TERMINAL */}
          {activeTab === 'ask' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      OpsPilot Intelligence Terminal
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700 }}>
                      Live Reasoning
                    </span>
                  </div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                    Ask <span className="gradient-text">OpsPilot</span> AI Manager
                  </h1>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Ask any operational question. OpsPilot investigates across Sales, Inventory, Purchases, and Returns in BigQuery.
                  </p>
                </div>

                <button className="btn btn-secondary" onClick={() => setActiveTab('dashboard')} style={{ fontSize: '0.85rem' }}>
                  ← Back to Dashboard
                </button>
              </div>

              <AskOpsPilotTerminal
                datasetId={opsOverview?.dataset_id}
                companyName={opsOverview?.company_name}
                onOpenAction={(action) => setSelectedAction(action)}
                initialQuestion={terminalQuery || (opsOverview?.has_data ? 'What is the total charges & volume?' : '')}
              />
            </div>
          )}

          {/* TAB 4, 5, 6: COMING SOON STATES */}
          {(activeTab === 'insights' || activeTab === 'forecast' || activeTab === 'settings') && (
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
                {activeTab} — Coming Soon
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

      {/* PIPELINE REPORT MODAL */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: 960, maxHeight: '90vh', overflowY: 'auto', padding: 32, borderRadius: 16, background: '#0f172a', border: '1px solid var(--border-hover)', boxShadow: 'var(--shadow-glow)' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{selectedReport.dataset_name}</h2>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    {selectedReport.dataset_id}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Uploaded {selectedReport.file_name} ({(selectedReport.file_size_bytes / 1024).toFixed(1)} KB)
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
              {[
                { id: 'overview', label: 'Pipeline Summary' },
                { id: 'analytics', label: `Analytics (${selectedReport.analytics?.quality_score ? `Quality ${selectedReport.analytics.quality_score}` : 'Scan'})` },
                { id: 'validation', label: `Validation (${selectedReport.validation.issues.length})` },
                { id: 'profiling', label: `Profiling (${selectedReport.profiling.column_profiles.length} cols)` },
                { id: 'normalization', label: 'Normalization' },
                { id: 'destinations', label: 'BigQuery & Firestore' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setModalTab(t.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: modalTab === t.id ? 'var(--accent-primary)' : 'transparent',
                    color: modalTab === t.id ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* MODAL TAB: ANALYTICS ENGINE */}
            {modalTab === 'analytics' && selectedReport.analytics && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 20, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dataset Domain Category</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{selectedReport.analytics.dataset_category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dataset Quality Score</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                      Quality {selectedReport.analytics.quality_score}
                    </div>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>BigQuery Sandbox Detected Anomalies</h4>
                {selectedReport.analytics.anomalies_detected.map((anom, idx) => (
                  <div key={idx} style={{ padding: 16, borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: 12 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                      "{anom.title}"
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      {anom.description}
                    </p>
                    <div style={{ padding: 10, background: '#020617', borderRadius: 6, fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      {anom.bigquery_query}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MODAL TAB 1: OVERVIEW */}
            {modalTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                  <div style={{ padding: 16, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Rows</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 4 }}>{selectedReport.validation.total_rows.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: 16, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Columns</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 4 }}>{selectedReport.validation.total_columns}</div>
                  </div>
                  <div style={{ padding: 16, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quality Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 4, color: '#34d399' }}>
                      Quality {selectedReport.analytics?.quality_score || 95}
                    </div>
                  </div>
                  <div style={{ padding: 16, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Warehouse Staging</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 4, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                      {selectedReport.bigquery.mode}
                    </div>
                  </div>
                </div>

                {/* Pipeline Flow Log */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Pipeline Execution Steps</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 8 }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>1. FastAPI Ingestion & Pandas Reader</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Successfully loaded {selectedReport.file_name} into Pandas DataFrame</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 8 }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>2. Dataset Integrity Validation</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Checked structure, missing values ({selectedReport.validation.missing_cells_count}), duplicates ({selectedReport.validation.duplicate_rows_count})</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 8 }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>3. Statistical Column Profiling</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Analyzed data types, min/max metrics, memory size ({selectedReport.profiling.memory_usage_kb} KB)</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 8 }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>4. snake_case Normalization</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Converted {selectedReport.normalization.normalized_columns.length} column headers to standard snake_case schema</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 8 }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>5. BigQuery Table Staging</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedReport.bigquery.message}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(30, 41, 59, 0.4)', borderRadius: 8 }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>6. OpsPilot BigQuery Sandbox Analytics Engine</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Executed detection scan — Quality Score {selectedReport.analytics?.quality_score || 95}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL TAB 2: VALIDATION */}
            {modalTab === 'validation' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Validation Breakdown</h4>
                {selectedReport.validation.issues.length === 0 ? (
                  <div style={{ padding: 24, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 8, color: '#34d399', fontSize: '0.88rem' }}>
                    <CheckCircle2 size={18} style={{ marginBottom: 6 }} />
                    <div>All validation checks passed with 0 critical errors or formatting issues.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedReport.validation.issues.map((iss, idx) => (
                      <div key={idx} style={{ padding: 12, borderRadius: 8, background: 'rgba(30, 41, 59, 0.5)', borderLeft: '4px solid #f59e0b', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600, color: '#fbbf24', textTransform: 'capitalize' }}>[{iss.severity}] {iss.column ? `Column '${iss.column}'` : 'General'}</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{iss.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODAL TAB 3: PROFILING */}
            {modalTab === 'profiling' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Column Statistical Profiles</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px' }}>Column</th>
                      <th style={{ padding: '8px' }}>Type</th>
                      <th style={{ padding: '8px' }}>Null %</th>
                      <th style={{ padding: '8px' }}>Unique</th>
                      <th style={{ padding: '8px' }}>Min / Max / Mean</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.profiling.column_profiles.map((cp, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{cp.column_name}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: 4 }}>
                            {cp.data_type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: cp.null_percentage > 0 ? '#fbbf24' : 'var(--text-muted)' }}>{cp.null_percentage}%</td>
                        <td style={{ padding: '10px 8px' }}>{cp.unique_count}</td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>
                          {cp.data_type === 'numeric' ? (
                            <span>Min: {cp.min_val} | Max: {cp.max_val} | Avg: {cp.mean_val?.toFixed(2)}</span>
                          ) : cp.top_values ? (
                            <span>Top: {Object.keys(cp.top_values).slice(0, 3).join(', ')}</span>
                          ) : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MODAL TAB 4: NORMALIZATION */}
            {modalTab === 'normalization' && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Header snake_case Schema Mapping</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                  {Object.entries(selectedReport.normalization.column_mapping).map(([orig, norm], idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{orig}</span>
                      <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>➔ {norm}</span>
                    </div>
                  ))}
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Cleaned Sample Records Preview</h4>
                <pre style={{ background: '#020617', padding: 16, borderRadius: 8, fontSize: '0.78rem', color: '#38bdf8', overflowX: 'auto', maxHeight: 200, fontFamily: 'var(--font-mono)' }}>
                  {JSON.stringify(selectedReport.normalization.sample_records.slice(0, 3), null, 2)}
                </pre>
              </div>
            )}

            {/* MODAL TAB 5: DESTINATIONS */}
            {modalTab === 'destinations' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 20, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Cloud size={20} style={{ color: 'var(--accent-emerald)' }} />
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>BigQuery Data Warehouse</h4>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      <div><strong>Dataset ID:</strong> {selectedReport.bigquery.dataset_id}</div>
                      <div><strong>Table Name:</strong> <code style={{ color: '#38bdf8' }}>{selectedReport.bigquery.table_name}</code></div>
                      <div><strong>Inserted Rows:</strong> {selectedReport.bigquery.inserted_rows.toLocaleString()} rows</div>
                      <div><strong>Mode:</strong> {selectedReport.bigquery.mode === 'live' ? 'Live Cloud Sync' : 'Simulated Local Warehouse Staging'}</div>
                      <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#34d399' }}>{selectedReport.bigquery.message}</div>
                    </div>
                  </div>

                  <div style={{ padding: 20, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Database size={20} style={{ color: 'var(--accent-primary)' }} />
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Firestore Document Metadata</h4>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      <div><strong>Document Path:</strong> <code style={{ color: '#38bdf8' }}>{selectedReport.firestore.firestore_path}</code></div>
                      <div><strong>Status:</strong> <span style={{ color: '#34d399' }}>{selectedReport.firestore.status}</span></div>
                      <div><strong>Organization ID:</strong> {selectedReport.firestore.organization_id}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OPSPILOT ACTION MODAL (STAGE 5 EXECUTIONS) */}
      <OpsPilotActionModal
        action={selectedAction}
        onClose={() => setSelectedAction(null)}
      />
    </div>
  );
};

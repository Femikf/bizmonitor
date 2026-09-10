import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Zap,
  FileText,
  Mail,
  CheckSquare,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import {
  getOpsPilotOverview,
  type OpsPilotOverview,
  type ExecutableAction,
} from '../services/api';

interface OpsPilotBoardProps {
  overview?: OpsPilotOverview | null;
  onOpenAction: (action: ExecutableAction) => void;
  onAskQuery: (query: string) => void;
}

export const OpsPilotBoard: React.FC<OpsPilotBoardProps> = ({ overview: propOverview, onOpenAction, onAskQuery }) => {
  const [fetchedOverview, setFetchedOverview] = useState<OpsPilotOverview | null>(null);
  const [loading, setLoading] = useState(propOverview === undefined);
  const [selectedStage, setSelectedStage] = useState<'detect' | 'diagnose' | 'predict' | 'recommend' | 'act'>('detect');

  useEffect(() => {
    if (propOverview !== undefined) {
      setLoading(false);
      return;
    }
    getOpsPilotOverview()
      .then(data => setFetchedOverview(data))
      .catch(err => console.warn('Could not load OpsPilot overview:', err))
      .finally(() => setLoading(false));
  }, [propOverview]);

  const overview = propOverview !== undefined ? propOverview : fetchedOverview;

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: 32, borderRadius: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '0.95rem' }}>
          <span className="spinner" style={{ width: 18, height: 18 }} />
          Loading OpsPilot 5-Stage Intelligence Overview...
        </div>
      </div>
    );
  }

  if (!overview || overview.has_data === false || overview.detected_issues.length === 0) {
    return null;
  }

  const stageTabs = [
    { id: 'detect', label: '1. Detect', count: overview.detected_issues.length, color: '#ef4444' },
    { id: 'diagnose', label: '2. Diagnose', count: overview.diagnoses.length, color: '#f59e0b' },
    { id: 'predict', label: '3. Predict', count: overview.predictions.length, color: '#ec4899' },
    { id: 'recommend', label: '4. Recommend', count: overview.recommendations.length, color: '#6366f1' },
    { id: 'act', label: '5. Act (Agent)', count: overview.executable_actions.length, color: '#10b981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 36 }}>
      {/* 🚨 HERO CARD: TODAY'S BUSINESS INTELLIGENCE */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.95) 40%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 10px 40px rgba(239, 68, 68, 0.15), 0 0 25px rgba(99, 102, 241, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#f87171',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                🚨 TODAY'S BUSINESS INTELLIGENCE
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Cross-correlated from 5 operational sources
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {overview.revenue_at_risk}
              </h2>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171' }}>
                potential revenue at risk
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {overview.summary_headline}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignSelf: 'center' }}>
            <button
              id="btn-ask-why-losing-money"
              onClick={() => onAskQuery('Why are we losing money?')}
              className="btn btn-secondary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
              "Why are we losing money?"
            </button>
            <button
              id="btn-ask-what-to-do-tomorrow"
              onClick={() => onAskQuery('What should I do tomorrow?')}
              className="btn btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Zap size={14} />
              "What should I do tomorrow?"
            </button>
          </div>
        </div>

        {/* 4 HIGHLIGHT ISSUE PILLS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {overview.detected_issues.map(issue => (
            <div
              key={issue.id}
              onClick={() => setSelectedStage('detect')}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.4)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(30, 41, 59, 0.7)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(15, 23, 42, 0.7)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>{issue.tag}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: issue.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: issue.severity === 'critical' ? '#f87171' : '#fbbf24',
                  }}
                >
                  {issue.urgency}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>
                {issue.headline}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {issue.impact_amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-STAGE EXECUTION BOARD CONTAINER */}
      <div
        className="glass-panel"
        style={{
          padding: 28,
          borderRadius: 16,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Navigation Stage Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>OpsPilot 5-Stage Autonomous Engine</h3>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stageTabs.map(tab => {
              const active = selectedStage === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`stage-tab-${tab.id}`}
                  onClick={() => setSelectedStage(tab.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? tab.color : 'rgba(30, 41, 59, 0.6)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: active ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STAGE 1: DETECT */}
        {selectedStage === 'detect' && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Stage 1: Detected Operational Bottlenecks</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Continuous real-time anomaly detection streaming across BigQuery warehouse datasets
                </p>
              </div>
              <button onClick={() => setSelectedStage('diagnose')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                View Diagnoses ➔
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {overview.detected_issues.map(iss => (
                <div
                  key={iss.id}
                  style={{
                    padding: 20,
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: 12,
                    borderLeft: `4px solid ${iss.severity === 'critical' ? '#ef4444' : iss.severity === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>
                      {iss.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: iss.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: iss.severity === 'critical' ? '#f87171' : '#fbbf24',
                        fontWeight: 700,
                      }}
                    >
                      {iss.urgency}
                    </span>
                  </div>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>{iss.headline}</h5>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    Impact: <strong style={{ color: '#ffffff' }}>{iss.impact_amount}</strong> • Entity: <span style={{ color: 'var(--accent-cyan)' }}>{iss.affected_entity}</span>
                  </div>
                  <button
                    onClick={() => setSelectedStage('diagnose')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    View Root Cause Analysis <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 2: DIAGNOSE */}
        {selectedStage === 'diagnose' && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Stage 2: Root Cause Diagnostics</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  BigQuery cross-table correlation identifying WHY anomalies occurred
                </p>
              </div>
              <button onClick={() => setSelectedStage('predict')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                View Predictions ➔
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {overview.diagnoses.map((diag, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 22,
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderLeft: '4px solid #f59e0b',
                  }}
                >
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                    {diag.headline}
                  </h5>

                  <p style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: 14 }}>
                    {diag.root_cause}
                  </p>

                  {/* Evidence & Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
                    {Object.entries(diag.data_metrics).map(([k, v]) => (
                      <div key={k} style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {k.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {String(v)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Contributing Factors */}
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Contributing factors: </strong>
                    {diag.contributing_factors.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: PREDICT */}
        {selectedStage === 'predict' && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Stage 3: Predictive Impact Forecaster</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Financial projection of risk trajectory if operations remain unaddressed
                </p>
              </div>
              <button onClick={() => setSelectedStage('recommend')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                View Recommendations ➔
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {overview.predictions.map((pred, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 22,
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: 12,
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderLeft: '4px solid #ec4899',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase' }}>
                      Timeline: {pred.timeline}
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                      {pred.confidence_score}% Confidence
                    </span>
                  </div>

                  <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                    {pred.headline}
                  </h5>

                  <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: 14 }}>
                    {pred.if_nothing_changes}
                  </p>

                  <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#fca5a5' }}>Projected Loss:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171' }}>{pred.projected_loss}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 4: RECOMMEND */}
        {selectedStage === 'recommend' && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Stage 4: Prioritized Action Matrix</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Ranked operational countermeasures maximizing capital preservation
                </p>
              </div>
              <button onClick={() => setSelectedStage('act')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                Open Agent Act Board ➔
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {overview.recommendations.map(rec => {
                const linkedAction = overview.executable_actions.find(a => a.id === rec.executable_id);
                return (
                  <div
                    key={rec.id}
                    style={{
                      padding: '16px 20px',
                      background: 'rgba(30, 41, 59, 0.45)',
                      borderRadius: 12,
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 280 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: rec.priority === 1 ? '#ef4444' : rec.priority === 2 ? '#f59e0b' : '#6366f1',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        #{rec.priority}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
                          {rec.title}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {rec.description}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>{rec.impact}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Effort: {rec.effort}</div>
                      </div>

                      {linkedAction && (
                        <button
                          onClick={() => onOpenAction(linkedAction)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          Execute ➔
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE 5: ACT (AGENT EXECUTION) */}
        {selectedStage === 'act' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Stage 5: Autonomous Agent Actions</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                One-click review, sign-off, and dispatch of operational countermeasures directly generated by OpsPilot
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {overview.executable_actions.map(action => (
                <div
                  key={action.id}
                  style={{
                    padding: 20,
                    background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    borderRadius: 12,
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderLeft: '4px solid #10b981',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {action.type === 'supplier_email' && <Mail size={16} />}
                        {action.type === 'purchase_order' && <FileText size={16} />}
                        {action.type === 'inspection_checklist' && <CheckSquare size={16} />}
                        {action.type === 'ops_briefing' && <Cpu size={16} />}
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                        {action.type.replace('_', ' ')}
                      </span>
                    </div>

                    <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                      {action.title}
                    </h5>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                      Target: <strong style={{ color: '#e2e8f0' }}>{action.target_entity}</strong>
                    </p>
                  </div>

                  <button
                    id={`btn-review-action-${action.id}`}
                    onClick={() => onOpenAction(action)}
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.82rem',
                      padding: '8px 16px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}
                  >
                    Review & Execute <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

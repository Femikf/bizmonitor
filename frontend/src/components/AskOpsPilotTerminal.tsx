import React, { useState } from 'react';
import { Sparkles, Send, Zap, CheckCircle, Calculator, Play } from 'lucide-react';
import { askOpsPilot, type AskOpsPilotResponse, type ExecutableAction } from '../services/api';

interface AskOpsPilotTerminalProps {
  onOpenAction: (action: ExecutableAction) => void;
  initialQuestion?: string;
  datasetId?: string;
  companyName?: string;
  customPrompts?: string[];
}

export const AskOpsPilotTerminal: React.FC<AskOpsPilotTerminalProps> = ({
  onOpenAction,
  initialQuestion,
  datasetId,
  companyName,
  customPrompts,
}) => {
  const [question, setQuestion] = useState(initialQuestion || '');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskOpsPilotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = customPrompts || [
    'What is the total charges & volume?',
    'Why are transactions unbilled or at risk?',
    'Which store or vehicle has the most activity?',
    'What should I do tomorrow?',
  ];

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    setQuestion(q);
    setLoading(true);
    setError(null);

    try {
      const res = await askOpsPilot(q, datasetId);
      setResponse(res);
    } catch (err: any) {
      console.error('Ask OpsPilot error:', err);
      setError(err.message || 'Failed to get answer from OpsPilot');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: 28,
        borderRadius: 16,
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 27, 45, 0.85) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(99, 102, 241, 0.15)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Ask OpsPilot
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Operational reasoning across {companyName || 'your active business dataset'}
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          BigQuery Live Correlated
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            id={`chip-prompt-${idx}`}
            onClick={() => handleAsk(p)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(99, 102, 241, 0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(30, 41, 59, 0.8)';
            }}
          >
            <Zap size={13} style={{ color: 'var(--accent-primary)' }} />
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          background: 'rgba(11, 15, 25, 0.95)',
          padding: '6px 8px 6px 16px',
          borderRadius: 12,
          border: '1px solid rgba(99, 102, 241, 0.4)',
          alignItems: 'center',
          boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
        }}
      >
        <input
          id="ask-opspilot-input"
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask OpsPilot anything (e.g., 'Why are we losing money?', 'What should I do tomorrow?')"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: '0.92rem',
          }}
          disabled={loading}
        />
        <button
          id="ask-opspilot-submit-btn"
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="btn btn-primary"
          style={{
            padding: '8px 18px',
            fontSize: '0.85rem',
            opacity: loading || !question.trim() ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {loading ? 'Analyzing...' : 'Ask'}
          <Send size={15} />
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#f87171', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Structured Result Display */}
      {response && (
        <div
          style={{
            marginTop: 20,
            padding: 22,
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: 12,
            border: '1px solid rgba(99, 102, 241, 0.25)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Question Echo */}
          <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Q: "{response.question}"
          </div>

          {/* Answer Text */}
          <div style={{ fontSize: '0.96rem', lineHeight: 1.6, color: '#f1f5f9', fontWeight: 500, marginBottom: 16 }}>
            {response.answer}
          </div>

          {/* Calculation Breakdown Banner */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Calculator size={16} />
            <span>{response.calculation_summary}</span>
          </div>

          {/* Key Findings List */}
          {response.key_findings && response.key_findings.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                Key Operational Findings:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
                {response.key_findings.map((f, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: 6,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      borderLeft: '3px solid var(--accent-primary)',
                    }}
                  >
                    <CheckCircle size={14} style={{ color: 'var(--accent-primary)', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ color: '#e2e8f0' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Executable Action CTA */}
          {response.executable_action && (
            <div
              style={{
                marginTop: 18,
                padding: '14px 18px',
                background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.12) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Ready to Execute Agent Action
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                  {response.executable_action.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Target: {response.executable_action.target_entity}
                </div>
              </div>

              <button
                id="btn-execute-attached-action"
                onClick={() => onOpenAction(response.executable_action!)}
                className="btn btn-primary"
                style={{
                  fontSize: '0.82rem',
                  padding: '8px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 0 15px rgba(99, 102, 241, 0.35)',
                }}
              >
                <Play size={14} /> Open & Execute Action
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

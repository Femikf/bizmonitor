import React, { useState } from 'react';
import { X, Copy, Check, Mail, FileText, CheckSquare, ShieldAlert } from 'lucide-react';
import type { ExecutableAction } from '../services/api';

interface OpsPilotActionModalProps {
  action: ExecutableAction | null;
  onClose: () => void;
}

export const OpsPilotActionModal: React.FC<OpsPilotActionModalProps> = ({ action, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});
  const [isExecuted, setIsExecuted] = useState(false);

  if (!action) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(action.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheck = (idx: number) => {
    setCompletedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const checklistLines = action.type === 'inspection_checklist'
    ? action.content.split('\n').filter(line => line.includes('[ ]'))
    : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        padding: 20,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 680,
          borderRadius: 16,
          background: '#0d1322',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {action.type === 'supplier_email' && <Mail size={20} />}
              {action.type === 'purchase_order' && <FileText size={20} />}
              {action.type === 'inspection_checklist' && <CheckSquare size={20} />}
              {action.type === 'ops_briefing' && <ShieldAlert size={20} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  Stage 5: Autonomous Agent Action
                </span>
                {isExecuted && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} /> Executed & Dispatched
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 2 }}>{action.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {/* Metadata banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              padding: 14,
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              marginBottom: 18,
              fontSize: '0.82rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Target Entity:</span>{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{action.target_entity}</strong>
            </div>
            {action.subject && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subject:</span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{action.subject}</strong>
              </div>
            )}
            {Object.entries(action.metadata || {}).map(([k, v]) => (
              <div key={k}>
                <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k.replace('_', ' ')}:</span>{' '}
                <strong style={{ color: 'var(--accent-cyan)' }}>{String(v)}</strong>
              </div>
            ))}
          </div>

          {/* Type-Specific Interactive Rendering */}
          {action.type === 'inspection_checklist' && checklistLines.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Interactive Quality Verification SOP ({Object.values(completedItems).filter(Boolean).length}/{checklistLines.length} verified):
              </div>
              {checklistLines.map((line, idx) => {
                const text = line.replace('[ ]', '').trim();
                const isChecked = !!completedItems[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: isChecked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                      border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#10b981' }}
                    />
                    <span style={{ fontSize: '0.88rem', color: isChecked ? '#34d399' : 'var(--text-primary)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                position: 'relative',
                background: 'rgba(10, 15, 29, 0.95)',
                padding: 18,
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                lineHeight: 1.6,
                color: '#e2e8f0',
                whiteSpace: 'pre-wrap',
                marginBottom: 16,
              }}
            >
              {action.content}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <button
            id="btn-copy-action-content"
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            {copied ? <Check size={16} style={{ color: '#34d399' }} /> : <Copy size={16} />}
            {copied ? 'Copied to Clipboard' : 'Copy Text'}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button id="btn-close-action-modal" onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Close
            </button>
            <button
              id="btn-confirm-action-modal"
              onClick={() => setIsExecuted(true)}
              className="btn btn-primary"
              style={{
                fontSize: '0.85rem',
                background: isExecuted ? '#10b981' : undefined,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isExecuted ? <Check size={16} /> : null}
              {isExecuted ? 'Action Recorded in ERP' : 'Confirm & Execute Action'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

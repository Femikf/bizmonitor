import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Building2, ArrowRight } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('retail');
  const [currency, setCurrency] = useState('INR');
  const [country, setCountry] = useState('India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await completeOnboarding(businessName.trim(), industry, currency, country);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize business workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="bg-glow">
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>
      </div>

      <style>{`
        .onboarding-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
        }

        .onboarding-card {
          width: 100%;
          max-width: 480px;
          padding: 40px 36px;
          z-index: 10;
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .brand-badge {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: var(--shadow-glow);
          margin-bottom: 16px;
        }

        .onboarding-title {
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .onboarding-subtitle {
          font-size: 0.92rem;
          color: var(--text-muted);
        }

        .form-select-custom {
          width: 100%;
          padding: 10px 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .form-select-custom:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}</style>

      <div className="onboarding-card glass-panel glass-panel-hover">
        <div className="onboarding-header">
          <div className="brand-badge">
            <Activity size={28} />
          </div>
          <h1 className="onboarding-title">
            Welcome to <span className="gradient-text">bizmonitor</span>
          </h1>
          <p className="onboarding-subtitle">
            Tell us about your business to set up your workspace.
          </p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px 14px', marginBottom: 20, textTransform: 'none', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Business name</label>
            <div className="input-wrapper">
              <Building2 size={18} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="ABC Distributors"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Industry</label>
            <select
              className="form-select-custom"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            >
              <option value="retail">Retail</option>
              <option value="e-commerce">E-Commerce</option>
              <option value="healthcare">Healthcare</option>
              <option value="saas">SaaS & Technology</option>
              <option value="services">Professional Services</option>
              <option value="manufacturing">Manufacturing & Logistics</option>
              <option value="other">Other Industry</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="form-select-custom"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="INR">INR ₹</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="GBP">GBP £</option>
                <option value="AED">AED د.إ</option>
                <option value="SGD">SGD S$</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <select
                className="form-select-custom"
                value={country}
                onChange={e => setCountry(e.target.value)}
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Singapore">Singapore</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ padding: 12, fontSize: '0.95rem' }}
          >
            {loading ? 'Setting up Workspace...' : 'Continue to Dashboard'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Signed in as <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
        </div>
      </div>
    </div>
  );
};

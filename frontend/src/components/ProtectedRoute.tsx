import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; requireOrg?: boolean }> = ({
  children,
  requireOrg = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary, #0f172a)',
        color: 'var(--text-primary, #f8fafc)',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          <Activity size={32} color="#ffffff" />
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 500 }}>
          Verifying security credentials...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOrg && (!user?.organizationId || user?.organizationId === '')) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};



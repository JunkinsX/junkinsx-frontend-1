import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
    gap: '1rem',
  }}>
    <Loader2 size={36} className="spin" style={{ color: 'var(--text-secondary)' }} />
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{message}</p>
  </div>
);

export default LoadingSpinner;

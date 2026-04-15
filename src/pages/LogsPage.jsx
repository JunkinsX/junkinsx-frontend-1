import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLogs } from '../api/api';
import Terminal from '../components/Terminal';
import StatusBadge from '../components/StatusBadge';
import { ChevronLeft, RefreshCw, StopCircle, Play, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TERMINAL_DONE = ['SUCCESS', 'FAILED'];
const POLL_INTERVAL = 3000;

const LogsPage = () => {
  const { pipelineId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs]       = useState([]);
  const [status, setStatus]   = useState(null);
  const [error, setError]     = useState('');
  const [polling, setPolling] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const intervalRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await getLogs(pipelineId);
      const data = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean);
      setLogs(data);

      // Determine overall status from latest entry
      const latestStatus = data[data.length - 1]?.status ?? null;
      setStatus(latestStatus);
      setLastFetch(new Date());
      setError('');

      // Stop polling when done
      if (TERMINAL_DONE.includes(latestStatus)) {
        setPolling(false);
      }
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to fetch logs.');
    }
  }, [pipelineId]);

  // Initial fetch
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Polling
  useEffect(() => {
    if (!polling) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(fetchLogs, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [polling, fetchLogs]);

  const togglePolling = () => setPolling(p => !p);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/pipeline/${pipelineId}`)} className="btn btn-ghost btn-icon">
            <ChevronLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Pipeline #{pipelineId} — Logs</h1>
              {status && <StatusBadge status={status} />}
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', marginTop: '0.125rem' }}>
              {polling ? (
                <span style={{ color: 'var(--status-running-text)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-running-text)', display: 'inline-block', animation: 'pulse-badge 1.5s ease-in-out infinite' }} />
                  Auto-refreshing every {POLL_INTERVAL / 1000}s
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  {lastFetch ? `Last updated ${lastFetch.toLocaleTimeString()}` : 'Refresh paused'}
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={fetchLogs} title="Refresh now">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            className="btn btn-ghost"
            onClick={togglePolling}
            title={polling ? 'Pause auto-refresh' : 'Resume auto-refresh'}
          >
            {polling ? <StopCircle size={14} /> : <Play size={14} />}
            {polling ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ height: 'calc(100vh - 280px)', minHeight: 400 }}
      >
        <Terminal
          logs={logs}
          title={`pipeline-${pipelineId}.log`}
          status={status}
        />
      </motion.div>

      {/* Status summary when done */}
      {TERMINAL_DONE.includes(status) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={status === 'SUCCESS' ? 'success-banner' : 'error-banner'}
          style={{ marginTop: '1rem' }}
        >
          {status === 'SUCCESS' ? '✓ Pipeline completed successfully.' : '✗ Pipeline failed. Check logs above for details.'}
        </motion.div>
      )}
    </div>
  );
};

export default LogsPage;

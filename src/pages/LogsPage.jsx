import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLogs, clearLogs, API_BASE_URL } from '../api/api';
import Terminal from '../components/Terminal';
import StatusBadge from '../components/StatusBadge';
import { ChevronLeft, RefreshCw, StopCircle, Play, AlertCircle, Trash2, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const TERMINAL_DONE = ['SUCCESS', 'FAILED'];
const BASE_URL = API_BASE_URL;

const LogsPage = () => {
  const { pipelineId } = useParams();
  const pipelineIdNum = Number(pipelineId);
  const hasValidPipelineId = Number.isFinite(pipelineIdNum) && pipelineIdNum > 0;
  const navigate = useNavigate();

  const [logs, setLogs]       = useState([]);
  const [status, setStatus]   = useState(null);
  const [error, setError]     = useState('');
  const [lastFetch, setLastFetch] = useState(null);
  const [clearing, setClearing]   = useState(false);
  const [wsLive, setWsLive] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!hasValidPipelineId) {
      setError('Invalid pipeline id in URL.');
      setLogs([]);
      setStatus(null);
      return;
    }

    try {
      const res = await getLogs(pipelineIdNum);
      const data = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean);
      data.sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0));
      setLogs(data);

      const latestStatus = data[data.length - 1]?.status ?? 'RUNNING'; 
      setStatus(latestStatus);
      setLastFetch(new Date());
      setError('');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to fetch logs.');
    }
  }, [hasValidPipelineId, pipelineIdNum]);

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all logs for this pipeline?')) return;
    setClearing(true);
    try {
      await clearLogs(pipelineIdNum);
      await fetchLogs();
    } catch (err) {
      setError('Failed to clear logs.');
    } finally {
      setClearing(false);
    }
  };

  // Initial fetch
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // STOMP WebSocket implementation
  useEffect(() => {
    if (!hasValidPipelineId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      reconnectDelay: 2000,
      onConnect: () => {
        setWsLive(true);
        client.subscribe(`/topic/logs/${pipelineIdNum}`, (message) => {
          if (message.body) {
            let newLog;
            try {
              newLog = JSON.parse(message.body);
            } catch {
              // Keep the terminal usable even if a non-JSON frame arrives.
              newLog = {
                id: Date.now(),
                output: String(message.body),
                status: 'RUNNING',
                taskName: 'Live Output',
              };
            }
            setLogs((prev) => {
              const without = prev.filter(l => l.id !== newLog.id);
              return [...without, newLog].sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0));
            });
            setStatus(newLog.status);
            setLastFetch(new Date());
          }
        });
      },
      onDisconnect: () => {
        setWsLive(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setError(frame.headers?.message ?? 'Live socket error.');
        setWsLive(false);
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [hasValidPipelineId, pipelineIdNum]);

  if (!hasValidPipelineId) {
    return (
      <div className="page-container">
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          Invalid log URL. Open logs from a pipeline details page.
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/pipeline/${pipelineIdNum}`)} className="btn btn-ghost btn-icon">
            <ChevronLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Pipeline #{pipelineIdNum} - Logs</h1>
              {status && <StatusBadge status={status} />}
              {wsLive ? (
                <Wifi size={14} style={{ color: 'var(--status-running-text)' }} title="WebSocket Live" />
              ) : (
                <WifiOff size={14} style={{ color: 'var(--text-muted)' }} title="WebSocket Disconnected" />
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', marginTop: '0.125rem' }}>
              {wsLive && !TERMINAL_DONE.includes(status) ? (
                <span style={{ color: 'var(--status-running-text)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-running-text)', display: 'inline-block', animation: 'pulse-badge 1.5s ease-in-out infinite' }} />
                  Listening on Live Socket
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
          <button className="btn btn-ghost" onClick={handleClear} disabled={clearing} style={{ color: 'var(--status-failed-text)' }}>
            <Trash2 size={14} />
            {clearing ? 'Clearing...' : 'Clear Logs'}
          </button>
          <button className="btn btn-ghost" onClick={fetchLogs} title="Refresh Initial Output">
            <RefreshCw size={14} />
            Sync
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
          title={`pipeline-${pipelineIdNum}.log`}
          status={status}
          isStarting={logs.length === 0 && status === 'RUNNING'}
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

import React, { useEffect, useState, useCallback } from 'react';
import { getPipelinesByUser } from '../api/api';
import PipelineCard from '../components/PipelineCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, RefreshCw, AlertCircle, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { auth } = useAuth();
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchPipelines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPipelinesByUser(auth.userId);
      setPipelines(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load pipelines. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [auth.userId]);

  useEffect(() => { fetchPipelines(); }, [fetchPipelines]);

  return (
    <div className="page-container">
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Pipelines</h1>
          <p style={{ margin: 0 }}>Monitor and manage your deployment workflows.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={fetchPipelines}
            disabled={loading}
            className="btn btn-ghost btn-icon"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          <Link to="/create" className="btn btn-primary">
            <Plus size={16} />
            New Pipeline
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && pipelines.length === 0 ? (
        <LoadingSpinner message="Scanning for pipelines…" />
      ) : pipelines.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}
        >
          {pipelines.map((p) => (
            <PipelineCard key={p.id} pipeline={p} />
          ))}
        </motion.div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">
            <GitBranch size={24} />
          </div>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No pipelines yet</h2>
          <p style={{ maxWidth: '28rem', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
            Get started by creating your first pipeline to automate your deployments.
          </p>
          <Link to="/create" className="btn btn-primary">
            <Plus size={16} />
            Create Pipeline
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

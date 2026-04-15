import React, { useState } from 'react';
import { createPipeline } from '../api/api';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch, FileText, Link2, ChevronLeft, Rocket,
  AlertCircle, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Field = ({ label, icon: Icon, children }) => (
  <div className="form-group">
    <label className="form-label">
      {Icon && <Icon size={13} />}
      {label}
    </label>
    {children}
  </div>
);

const CreatePipeline = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [form, setForm] = useState({
    pipelineName: '',
    pipelineDescription: '',
    repoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        pipelineName: form.pipelineName,
        pipelineDescription: form.pipelineDescription,
        repoUrl: form.repoUrl,
        userId: auth.userId,
      };
      const res = await createPipeline(payload);
      const newId = res.data?.id ?? res.data?.pipelineId ?? res.data?.pipeline?.id;
      navigate(newId ? `/pipeline/${newId}` : '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? err.response?.data ?? 'Failed to create pipeline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 680 }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ marginBottom: '1.5rem', paddingLeft: '0.75rem' }}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>Create Pipeline</h1>
        <p>Configure a new automated deployment workflow.</p>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <motion.div
        className="card"
        style={{ padding: '1.75rem' }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Field label="Pipeline Name" icon={GitBranch}>
            <input
              required
              type="text"
              className="input"
              placeholder="e.g. Production Deploy"
              value={form.pipelineName}
              onChange={set('pipelineName')}
            />
          </Field>

          <Field label="Description" icon={FileText}>
            <textarea
              rows={3}
              className="input"
              placeholder="What does this pipeline do?"
              value={form.pipelineDescription}
              onChange={set('pipelineDescription')}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </Field>

          <Field label="Repository URL" icon={Link2}>
            <input
              required
              type="url"
              className="input"
              placeholder="https://github.com/user/repo"
              value={form.repoUrl}
              onChange={set('repoUrl')}
            />
            <span className="form-hint">Used to configure webhook triggers via GitHub.</span>
          </Field>

          <hr className="divider" style={{ margin: '0.25rem 0' }} />

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.25rem' }}
          >
            {loading
              ? <Loader2 size={18} className="spin" />
              : <><Rocket size={16} /> Create Pipeline</>
            }
          </button>
        </form>
      </motion.div>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        You can add Bundles, Tasks, and Secrets after creation.
      </p>
    </div>
  );
};

export default CreatePipeline;

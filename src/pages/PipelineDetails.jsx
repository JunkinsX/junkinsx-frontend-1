import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, Play, Package, ListTodo, KeyRound, Shield,
  Plus, AlertCircle, Loader2, GitBranch, Link2, Server, Eye, EyeOff,
  Check, Copy, Rocket, X, Trash2, History, AlignLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

import {
  getPipelinesByUser,
  addBundleToPipeline, addTasksToPipeline, addSecretsToPipeline,
  executePipeline, getPipelinePublicKey,
  getBundlesByUserId, createTask,
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── helpers ─────────────────────────────────────────── */
const Section = ({ title, action, children }) => (
  <div>
    <div className="section-header">
      <span className="section-title">{title}</span>
      {action}
    </div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

const EmptyRow = ({ message }) => (
  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
    {message}
  </div>
);

/* ── Add Bundle Modal ────────────────────────────────── */
const AddBundleModal = ({ open, onClose, userId, pipelineId, onAdded }) => {
  const [bundles, setBundles]   = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    getBundlesByUserId(userId)
      .then(r => setBundles(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [open, userId]);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleAdd = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      const bundleList = bundles.filter(b => selected.includes(b.id));
      await addBundleToPipeline({ pipelineId, bundleList });
      onAdded();
      onClose();
      setSelected([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Bundles to Pipeline">
      {fetching ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="spin" style={{ margin: '0 auto' }} />
        </div>
      ) : bundles.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No bundles found. <a href="/bundles" style={{ color: 'var(--text-secondary)' }}>Create one first.</a>
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {bundles.map(b => (
            <label
              key={b.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem', borderRadius: 10,
                border: `1px solid ${selected.includes(b.id) ? 'var(--border-strong)' : 'var(--border)'}`,
                background: selected.includes(b.id) ? 'var(--bg-muted)' : 'var(--bg-subtle)',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(b.id)}
                onChange={() => toggle(b.id)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{b.bundleName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.bundleDescription}</div>
              </div>
            </label>
          ))}
        </div>
      )}
      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        disabled={loading || !selected.length}
        onClick={handleAdd}
      >
        {loading ? <Loader2 size={15} className="spin" /> : `Add ${selected.length || ''} Bundle${selected.length !== 1 ? 's' : ''}`}
      </button>
    </Modal>
  );
};

/* ── Add Task Modal ──────────────────────────────────── */
/**
 * Create a brand-new task and immediately attach it to this pipeline.
 * There's no global "list all tasks" API endpoint, so this modal combines
 * task creation + pipeline attachment into one step.
 */
const AddTaskModal = ({ open, onClose, pipelineId, onAdded }) => {
  const [form, setForm]       = useState({ taskName: '', taskDescription: '' });
  const [cmds, setCmds]       = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set    = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setCmd = (i, v) => setCmds(prev => { const n = [...prev]; n[i] = v; return n; });
  const addCmd    = () => setCmds(prev => [...prev, '']);
  const removeCmd = (i) => setCmds(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const clean = cmds.filter(c => c.trim());
    if (!clean.length) { setError('Add at least one command.'); return; }
    setLoading(true);
    try {
      // 1. Create the task
      const res = await createTask({
        taskName:        form.taskName,
        taskDescription: form.taskDescription,
        commandsList:    [{ commandList: clean }],
      });
      const newTask = res.data;
      // 2. Attach it to this pipeline
      await addTasksToPipeline({ pipelineId, taskList: [newTask] });
      onAdded();
      onClose();
      setForm({ taskName: '', taskDescription: '' });
      setCmds(['']);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create & Attach Task">
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Task Name</label>
          <input required className="input" placeholder="e.g. Deploy Backend" value={form.taskName} onChange={set('taskName')} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="input" placeholder="Optional" value={form.taskDescription} onChange={set('taskDescription')} />
        </div>
        <div className="form-group">
          <label className="form-label">Commands</label>
          {cmds.map((cmd, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem', minWidth: 16 }}>{i + 1}</span>
              <input
                className="input"
                style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}
                placeholder={`$ command ${i + 1}`}
                value={cmd}
                onChange={e => setCmd(i, e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCmd(); } }}
              />
              {cmds.length > 1 && (
                <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeCmd(i)}>
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }} onClick={addCmd}>
            <Plus size={13} /> Add Command
          </button>
        </div>
        {error && <div className="error-banner"><AlertCircle size={14} />{error}</div>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? <Loader2 size={15} className="spin" /> : 'Create & Attach Task'}
        </button>
      </form>
    </Modal>
  );
};

/* ── Add Secret Modal ────────────────────────────────── */
const AddSecretModal = ({ open, onClose, pipelineId, onAdded }) => {
  const [form, setForm] = useState({ secretName: '', secretContent: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContent, setShowContent] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await addSecretsToPipeline({
        pipelineId,
        secretList: [{ secretName: form.secretName, secretContent: form.secretContent }],
      });
      onAdded();
      onClose();
      setForm({ secretName: '', secretContent: '' });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to add secret.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Secret">
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Secret Name</label>
          <input required className="input" placeholder="DATABASE_URL" value={form.secretName} onChange={set('secretName')} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ justifyContent: 'space-between' }}>
            <span>Secret Value</span>
            <button type="button" onClick={() => setShowContent(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {showContent ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </label>
          <input
            required
            type={showContent ? 'text' : 'password'}
            className="input"
            placeholder="••••••••"
            value={form.secretContent}
            onChange={set('secretContent')}
          />
        </div>
        {error && <div className="error-banner"><AlertCircle size={14} />{error}</div>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? <Loader2 size={15} className="spin" /> : 'Add Secret'}
        </button>
      </form>
    </Modal>
  );
};

const LogsModal = ({ open, onClose, logText }) => {
  return (
    <Modal open={open} onClose={onClose} title="Execution Final Logs">
      <div style={{
        background: '#0d0d0d', // dark terminal look
        color: '#f0f0f0',
        padding: '1.25rem',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.8rem',
        height: '400px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
      }}>
        {logText || 'No logs generated.'}
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={onClose}>
        Close
      </button>
    </Modal>
  );
};

/* ── SSH Keys Tab ────────────────────────────────────── */
const SSHKeysTab = ({ pipelineId }) => {
  const [publicKey, setPublicKey] = useState('');
  const [fetching, setFetching] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFetching(true);
    getPipelinePublicKey(pipelineId)
      .then(res => {
        if (res.data) setPublicKey(res.data);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [pipelineId]);

  const copyKey = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setupCommand = `echo "${publicKey}" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`;

  const copyCommand = () => {
    navigator.clipboard.writeText(setupCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (fetching) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <Loader2 size={24} className="spin" style={{ margin: '0 auto' }} />
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching security configuration...</p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Server Access Setup</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          JunkinsX has generated a unique, secure SSH key pair specifically for this pipeline.
          Copy the command below and paste it into your server's terminal to grant access.
        </p>

        <div className="card" style={{ padding: '2rem', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb), 0.03)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Authorization Command
            </span>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }} onClick={copyCommand}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard' : 'Copy Command'}
            </button>
          </div>
          
          <div style={{
            padding: '1.25rem',
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            borderRadius: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.8125rem',
            lineHeight: 1.6,
            wordBreak: 'break-all',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>$</span> {setupCommand || 'Generating...'}
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={14} />
            This command appends the key and sets the correct secure permissions.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Shield size={18} />
            <h4 style={{ fontWeight: 600, margin: 0 }}>Security Information</h4>
          </div>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              <Check size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
              <span>A unique RSA 2048-bit key pair is generated for every pipeline.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              <Check size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
              <span>The private key is encrypted at rest and never exposed via the API.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              <Check size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
              <span>You can revoke access at any time by removing the key from your server's <code>authorized_keys</code>.</span>
            </li>
          </ul>
        </div>

        <div style={{ padding: '0 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <p>
            <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            <b>Note:</b> Ensure you are logged in as the same user configured in your server <b>Bundles</b> (e.g. <code>ubuntu</code> or <code>root</code>).
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Main page ───────────────────────────────────────── */
const TABS = [
  { id: 'overview', label: 'Overview',  icon: GitBranch },
  { id: 'history',  label: 'History',   icon: History },
  { id: 'bundles',  label: 'Bundles',   icon: Package },
  { id: 'tasks',    label: 'Tasks',     icon: ListTodo },
  { id: 'secrets',  label: 'Secrets',   icon: Shield },
  { id: 'keys',     label: 'SSH Keys',  icon: KeyRound },
];

const PipelineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();

  // Try to get pipeline from router state first (avoids need for getById endpoint)
  const [pipeline, setPipeline] = useState(location.state?.pipeline ?? null);
  const [activeTab, setActiveTab] = useState('overview');
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState(null); // { type: 'success' | 'error', text: string }

  // Modals
  const [bundleModal, setBundleModal] = useState(false);
  const [taskModal,   setTaskModal]   = useState(false);
  const [secretModal, setSecretModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Refresh pipeline data from server
  const refreshPipeline = useCallback(() => {
    getPipelinesByUser(auth.userId)
      .then(r => {
        const found = (Array.isArray(r.data) ? r.data : []).find(p => String(p.id) === String(id));
        if (found) setPipeline(found);
      })
      .catch(console.error);
  }, [auth.userId, id]);

  // Refresh counter for tabs that list data
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => { setRefreshKey(k => k + 1); refreshPipeline(); };


  // If no router state, fetch from user pipelines list
  useEffect(() => {
    if (pipeline) return;
    getPipelinesByUser(auth.userId)
      .then(r => {
        const found = (Array.isArray(r.data) ? r.data : []).find(p => String(p.id) === String(id));
        if (found) setPipeline(found);
      })
      .catch(console.error);
  }, [auth.userId, id, pipeline]);

  const handleExecute = async () => {
    setExecuting(true);
    setExecResult(null);
    try {
      await executePipeline(id);
      setExecResult({ type: 'success', text: 'Pipeline execution requested successfully.' });
      refresh();
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data ?? 'Execution failed.';
      setExecResult({ type: 'error', text: msg });
    }
    setExecuting(false);
  };

  if (!pipeline) return <LoadingSpinner message="Loading pipeline…" />;

  const name = pipeline.pipelineName ?? pipeline.name ?? `Pipeline #${id}`;
  const latestStatus = pipeline.historyList && pipeline.historyList.length > 0 ? pipeline.historyList[pipeline.historyList.length - 1].status : 'QUEUED';

  return (
    <div className="page-container">
      {/* Back */}
      <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ marginBottom: '1.5rem', paddingLeft: '0.75rem' }}>
        <ChevronLeft size={16} />
        Dashboard
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{name}</h1>
            <StatusBadge status={latestStatus} />
          </div>
          {pipeline.pipelineDescription && (
            <p style={{ margin: 0, fontSize: '0.875rem' }}>{pipeline.pipelineDescription}</p>
          )}
        </div>

        <button
          onClick={handleExecute}
          disabled={executing}
          className="btn btn-primary"
          style={{ padding: '0.625rem 1.5rem' }}
        >
          {executing ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
          Run Pipeline
        </button>
      </div>

      {execResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={execResult.type === 'success' ? 'success-banner' : 'error-banner'}
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          {execResult.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <div style={{ flex: 1 }}>{execResult.text}</div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            className={`tab${activeTab === tid ? ' active' : ''}`}
            onClick={() => setActiveTab(tid)}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <span className="section-label">Pipeline Info</span>
            </div>
            <div style={{ padding: '0 1.5rem' }}>
              <div className="info-row">
                <span className="info-row__label"><GitBranch size={14} />Name</span>
                <span className="info-row__value">{name}</span>
              </div>
              {pipeline.pipelineDescription && (
                <div className="info-row">
                  <span className="info-row__label"><Server size={14} />Description</span>
                  <span className="info-row__value">{pipeline.pipelineDescription}</span>
                </div>
              )}
              {pipeline.repoUrl && (
                <div className="info-row">
                  <span className="info-row__label"><Link2 size={14} />Repo URL</span>
                  <a
                    href={pipeline.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="info-row__value truncate"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8125rem', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {pipeline.repoUrl}
                  </a>
                </div>
              )}
              <div className="info-row">
                <span className="info-row__label"><GitBranch size={14} />Pipeline ID</span>
                <span className="info-row__value" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}>#{id}</span>
              </div>
            </div>

            {/* GitHub Webhook Info */}
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Rocket size={12} /> GitHub Webhook
                </span>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: 'auto' }}
                  onClick={() => {
                    navigator.clipboard.writeText('http://18.117.224.52:8080/api/webhook/github');
                    // Simple feedback could be added here
                  }}
                >
                  <Copy size={12} /> Copy URL
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Paste this into your GitHub Repo <b>Settings &gt; Webhooks</b> to trigger this pipeline on every <code>push</code>.
              </p>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                padding: '0.625rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                wordBreak: 'break-all'
              }}>
                http://18.117.224.52:8080/api/webhook/github
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === 'history' && (
          <Section
            title="Execution History"
            action={
              <button className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={refresh}>
                <History size={14} /> Refresh
              </button>
            }
          >
            <HistoryList key={refreshKey} pipeline={pipeline} onViewLogs={setSelectedLog} />
          </Section>
        )}

        {/* ── BUNDLES ── */}
        {activeTab === 'bundles' && (
          <Section
            title="Bundles"
            action={
              <button className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={() => setBundleModal(true)}>
                <Plus size={14} /> Add Bundle
              </button>
            }
          >
            <BundleList key={refreshKey} pipeline={pipeline} />
          </Section>
        )}

        {/* ── TASKS ── */}
        {activeTab === 'tasks' && (
          <Section
            title="Tasks"
            action={
              <button className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={() => setTaskModal(true)}>
                <Plus size={14} /> Add Task
              </button>
            }
          >
            <TaskList key={refreshKey} pipeline={pipeline} />
          </Section>
        )}

        {/* ── SECRETS ── */}
        {activeTab === 'secrets' && (
          <Section
            title="Secrets"
            action={
              <button className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={() => setSecretModal(true)}>
                <Plus size={14} /> Add Secret
              </button>
            }
          >
            <SecretList key={refreshKey} pipeline={pipeline} />
          </Section>
        )}

        {/* ── SSH KEYS ── */}
        {activeTab === 'keys' && <SSHKeysTab pipelineId={id} />}
      </motion.div>

      {/* Modals */}
      <AddBundleModal open={bundleModal} onClose={() => setBundleModal(false)} userId={auth.userId} pipelineId={Number(id)} onAdded={refresh} />
      <AddTaskModal   open={taskModal}   onClose={() => setTaskModal(false)}   pipelineId={Number(id)} onAdded={refresh} />
      <AddSecretModal open={secretModal} onClose={() => setSecretModal(false)} pipelineId={Number(id)} onAdded={refresh} />
      <LogsModal      open={selectedLog !== null} onClose={() => setSelectedLog(null)} logText={selectedLog} />
    </div>
  );
};

/* ── Sub-components that fetch their own data ────────── */
const BundleList = ({ pipeline }) => {
  // Use the pipeline's already-attached bundles
  const items = pipeline?.ipAddressBundle ?? [];
  if (!items.length) return <EmptyRow message="No bundles attached. Click 'Add Bundle' to get started." />;

  return items.map((b) => (
    <div key={b.id} className="bundle-item">
      <div className="bundle-item__name">{b.bundleName}</div>
      {b.bundleDescription && <div className="bundle-item__desc">{b.bundleDescription}</div>}
      <div className="tags-list">
        {(b.ipAddresses ?? []).map((ip) => (
          <span key={ip} className="tag"><Server size={10} />{ip}</span>
        ))}
      </div>
    </div>
  ));
};

const TaskList = ({ pipeline }) => {
  const items = pipeline?.tasksList ?? [];
  if (!items.length) return <EmptyRow message="No tasks attached. Click 'Add Task' to get started." />;

  return items.map((t) => (
    <div key={t.id} className="task-item">
      <div className="task-item__name">{t.taskName}</div>
      {t.taskDescription && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{t.taskDescription}</div>
      )}
      {(t.commandsList ?? []).map((group, gi) => (
        <div key={gi} className="task-item__cmds">
          {(group.commandList ?? []).map((cmd, ci) => (
            <div key={ci}>$ {cmd}</div>
          ))}
        </div>
      ))}
    </div>
  ));
};

const SecretList = ({ pipeline }) => {
  const secrets = pipeline?.secretList ?? [];
  if (!secrets.length) {
    return (
      <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield size={14} />
        No secrets attached. Click 'Add Secret' to configure environment variables.
      </div>
    );
  }
  return secrets.map((s) => (
    <div key={s.id} style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Shield size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{s.secretName}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•••••••• (masked)</div>
      </div>
    </div>
  ));
};

const EmptyRowComp = ({ message }) => (
  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
    {message}
  </div>
);

const HistoryList = ({ pipeline, onViewLogs }) => {
  const history = pipeline?.historyList ?? [];
  if (!history.length) return <EmptyRow message="No runs yet. Click 'Run Pipeline' to execute." />;

  // Sort history newest first
  const sorted = [...history].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

  return sorted.map((h) => (
    <div key={h.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          Run #{h.runNumber} - <span style={{color: 'var(--text-secondary)'}}>{h.triggeredBy || "Manual"}</span>
          {h.finalLogs && (
            <button className="btn btn-ghost" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', height: 'auto', border: '1px solid var(--border)' }} onClick={() => onViewLogs(h.finalLogs)}>
               <AlignLeft size={13} style={{marginRight: '0.25rem'}}/> View Logs
            </button>
          )}
        </div>
        <StatusBadge status={h.status} />
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
        Executed At: {new Date(h.timestamp).toLocaleString()}
      </div>
      {h.status === 'FAILED' && h.failedAtTask && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--error)', marginTop: '0.25rem', background: 'var(--error-muted)', padding: '0.5rem', borderRadius: '4px' }}>
          <strong>Failed at Task:</strong> {h.failedAtTask}
        </div>
      )}
    </div>
  ));
};

export default PipelineDetails;

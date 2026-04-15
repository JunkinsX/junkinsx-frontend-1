import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, Play, Package, ListTodo, KeyRound, Shield,
  Plus, AlertCircle, Loader2, GitBranch, Link2, Server, Eye, EyeOff,
  Check, Copy,
} from 'lucide-react';
import { motion } from 'framer-motion';

import {
  getPipelinesByUser,
  addBundleToPipeline, addTasksToPipeline, addSecretsToPipeline,
  setSSHKeys, executePipeline,
  getBundles, getTasksByPipeline,
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
    getBundles(userId)
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
const AddTaskModal = ({ open, onClose, pipelineId, onAdded }) => {
  const [tasks, setTasks]     = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    getTasksByPipeline(pipelineId)
      .then(r => setTasks(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [open, pipelineId]);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleAdd = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      const taskList = tasks.filter(t => selected.includes(t.id));
      await addTasksToPipeline({ pipelineId, taskList });
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
    <Modal open={open} onClose={onClose} title="Add Tasks to Pipeline">
      {fetching ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Loader2 size={20} className="spin" style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
        </div>
      ) : tasks.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          No tasks found. <a href="/tasks" style={{ color: 'var(--text-secondary)' }}>Create one first.</a>
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {tasks.map(t => (
            <label
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem', borderRadius: 10,
                border: `1px solid ${selected.includes(t.id) ? 'var(--border-strong)' : 'var(--border)'}`,
                background: selected.includes(t.id) ? 'var(--bg-muted)' : 'var(--bg-subtle)',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() => toggle(t.id)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.taskName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {t.commandsList?.length ?? 0} command group(s)
                </div>
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
        {loading ? <Loader2 size={15} className="spin" /> : `Add ${selected.length || ''} Task${selected.length !== 1 ? 's' : ''}`}
      </button>
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

/* ── SSH Keys Tab ────────────────────────────────────── */
const SSHKeysTab = ({ pipelineId }) => {
  const [form, setForm] = useState({ publicKey: '', privateKey: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [showPriv, setShowPriv] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await setSSHKeys({ pipelineId: Number(pipelineId), ...form });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to save SSH keys.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 600 }}>
      <div className="form-group">
        <label className="form-label"><KeyRound size={13} />Public Key</label>
        <textarea
          rows={4}
          className="input"
          placeholder="ssh-rsa AAAA..."
          value={form.publicKey}
          onChange={set('publicKey')}
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', resize: 'vertical' }}
        />
      </div>
      <div className="form-group">
        <label className="form-label" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><KeyRound size={13} />Private Key</span>
          <button type="button" onClick={() => setShowPriv(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {showPriv ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </label>
        <textarea
          rows={6}
          className="input"
          placeholder="-----BEGIN RSA PRIVATE KEY-----"
          value={form.privateKey}
          onChange={set('privateKey')}
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', resize: 'vertical', filter: showPriv ? 'none' : 'blur(4px)', transition: 'filter 0.2s' }}
        />
      </div>
      {error   && <div className="error-banner"><AlertCircle size={14} />{error}</div>}
      {success && <div className="success-banner"><Check size={14} />SSH keys saved successfully.</div>}
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {loading ? <Loader2 size={15} className="spin" /> : 'Save Keys'}
      </button>
    </form>
  );
};

/* ── Main page ───────────────────────────────────────── */
const TABS = [
  { id: 'overview', label: 'Overview',  icon: GitBranch },
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
  const [execError, setExecError] = useState('');

  // Modals
  const [bundleModal, setBundleModal] = useState(false);
  const [taskModal,   setTaskModal]   = useState(false);
  const [secretModal, setSecretModal] = useState(false);

  // Refresh counter for tabs that list data
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

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
    setExecError('');
    setExecuting(true);
    try {
      await executePipeline(id);
      navigate(`/logs/${id}`);
    } catch (err) {
      setExecError(err.response?.data?.message ?? 'Execution failed.');
      setExecuting(false);
    }
  };

  if (!pipeline) return <LoadingSpinner message="Loading pipeline…" />;

  const name = pipeline.pipelineName ?? pipeline.name ?? `Pipeline #${id}`;

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
            <StatusBadge status={pipeline.status ?? 'QUEUED'} />
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

      {execError && (
        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {execError}
        </div>
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
          </div>
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
            <BundleList key={refreshKey} pipelineId={id} userId={auth.userId} />
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
            <TaskList key={refreshKey} pipelineId={id} />
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
            <SecretPlaceholder key={refreshKey} />
          </Section>
        )}

        {/* ── SSH KEYS ── */}
        {activeTab === 'keys' && <SSHKeysTab pipelineId={id} />}
      </motion.div>

      {/* Modals */}
      <AddBundleModal open={bundleModal} onClose={() => setBundleModal(false)} userId={auth.userId} pipelineId={Number(id)} onAdded={refresh} />
      <AddTaskModal   open={taskModal}   onClose={() => setTaskModal(false)}   pipelineId={Number(id)} onAdded={refresh} />
      <AddSecretModal open={secretModal} onClose={() => setSecretModal(false)} pipelineId={Number(id)} onAdded={refresh} />
    </div>
  );
};

/* ── Sub-components that fetch their own data ────────── */
const BundleList = ({ pipelineId, userId }) => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBundles(userId)
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <EmptyRow message="Loading bundles…" />;
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

const TaskList = ({ pipelineId }) => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasksByPipeline(pipelineId)
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pipelineId]);

  if (loading) return <EmptyRow message="Loading tasks…" />;
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

const SecretPlaceholder = () => (
  <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Shield size={14} />
    Secret names are shown here. Values are masked for security.
  </div>
);

const EmptyRowComp = ({ message }) => (
  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
    {message}
  </div>
);

export default PipelineDetails;

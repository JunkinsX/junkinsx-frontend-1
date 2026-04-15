import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../api/api';
import {
  ChevronLeft, Plus, Trash2, X, AlertCircle, Check, Loader2,
  ListTodo, Terminal as TerminalIcon, GripVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Types ────────────────────────────────────────────
  CommandGroup = { id: string, commandList: string[] }
  ────────────────────────────────────────────────── */

const uid = () => Math.random().toString(36).slice(2);
const defaultGroup = () => ({ id: uid(), commandList: [''] });

const TaskBuilderPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ taskName: '', taskDescription: '' });
  const [groups, setGroups] = useState([defaultGroup()]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  /* ── Group handlers ──────────────────────────────── */
  const addGroup = () => setGroups(prev => [...prev, defaultGroup()]);
  const removeGroup = (gid) => setGroups(prev => prev.filter(g => g.id !== gid));

  const addCmd = (gid) =>
    setGroups(prev => prev.map(g => g.id === gid ? { ...g, commandList: [...g.commandList, ''] } : g));

  const removeCmd = (gid, ci) =>
    setGroups(prev => prev.map(g => {
      if (g.id !== gid) return g;
      const next = g.commandList.filter((_, i) => i !== ci);
      return { ...g, commandList: next.length ? next : [''] };
    }));

  const setCmd = (gid, ci, val) =>
    setGroups(prev => prev.map(g => {
      if (g.id !== gid) return g;
      const list = [...g.commandList];
      list[ci] = val;
      return { ...g, commandList: list };
    }));

  /* ── Submit ──────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const clean = groups
      .map(g => ({ commandList: g.commandList.filter(c => c.trim() !== '') }))
      .filter(g => g.commandList.length > 0);

    if (!clean.length) { setError('Add at least one command.'); return; }

    setLoading(true);
    try {
      await createTask({
        taskName: form.taskName,
        taskDescription: form.taskDescription,
        commandsList: clean,
      });
      setSuccess('Task created successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '1.5rem', paddingLeft: '0.75rem' }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>Task Builder</h1>
        <p>Define reusable command sequences to attach to pipelines.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ─ Task meta ─ */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListTodo size={16} />
            Task Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Task Name</label>
              <input required className="input" placeholder="e.g. Deploy Backend" value={form.taskName} onChange={set('taskName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="input" placeholder="What does this task do?" value={form.taskDescription} onChange={set('taskDescription')} />
            </div>
          </div>
        </div>

        {/* ─ Command groups ─ */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="section-header">
            <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <TerminalIcon size={15} /> Command Groups
            </span>
            <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={addGroup}>
              <Plus size={14} /> Add Group
            </button>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Each group is a batch of commands executed sequentially. Press Enter to add a new command line.
          </p>

          <AnimatePresence>
            {groups.map((group, gi) => (
              <motion.div
                key={group.id}
                className="card"
                style={{ padding: '1.25rem', marginBottom: '0.875rem' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                transition={{ duration: 0.15 }}
              >
                {/* Group header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="section-label">Group {gi + 1}</span>
                  </div>
                  {groups.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-icon btn-ghost"
                      onClick={() => removeGroup(group.id)}
                      title="Remove group"
                    >
                      <Trash2 size={14} style={{ color: 'var(--status-failed-text)' }} />
                    </button>
                  )}
                </div>

                {/* Commands */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {group.commandList.map((cmd, ci) => (
                    <div key={ci} className="cmd-row">
                      <span className="cmd-row-num">{ci + 1}</span>
                      <input
                        className="input"
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}
                        placeholder={`$ command ${ci + 1}`}
                        value={cmd}
                        onChange={e => setCmd(group.id, ci, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); addCmd(group.id); }
                        }}
                      />
                      {group.commandList.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-icon btn-ghost"
                          onClick={() => removeCmd(group.id, ci)}
                          title="Remove command"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                  onClick={() => addCmd(group.id)}
                >
                  <Plus size={13} /> Add Command
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error   && <div className="error-banner" style={{ marginBottom: '1rem' }}><AlertCircle size={15} />{error}</div>}
        {success && <div className="success-banner" style={{ marginBottom: '1rem' }}><Check size={15} />{success}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem' }}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <><ListTodo size={16} />Create Task</>}
        </button>
      </form>
    </div>
  );
};

export default TaskBuilderPage;

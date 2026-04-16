import React, { useEffect, useState, useCallback } from 'react';
import { getBundles, addBundleToUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Server, Boxes, X, AlertCircle, Check, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── Create Bundle Modal ─────────────────────────────── */
const CreateBundleModal = ({ open, onClose, userId, onCreated }) => {
  const [form, setForm]   = useState({ bundleName: '', bundleDescription: '', sshUsername: '', ipInput: '' });
  const [ips, setIps]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addIp = () => {
    const val = form.ipInput.trim();
    if (!val) return;
    // Allow comma-separated too
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    setIps(prev => [...new Set([...prev, ...parts])]);
    setForm(f => ({ ...f, ipInput: '' }));
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addIp(); } };
  const removeIp = (ip) => setIps(prev => prev.filter(x => x !== ip));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ips.length) { setError('Add at least one IP address.'); return; }
    if (!form.sshUsername.trim()) { setError('SSH username is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await addBundleToUser({
        userId,
        bundle: {
          bundleName:        form.bundleName,
          bundleDescription: form.bundleDescription,
          ipAddresses:       ips,
          username:          form.sshUsername.trim(), // SSH login user (e.g. ec2-user, ubuntu)
        },
      });
      onCreated();
      onClose();
      setForm({ bundleName: '', bundleDescription: '', sshUsername: '', ipInput: '' });
      setIps([]);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create bundle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Bundle">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Bundle Name</label>
          <input required className="input" placeholder="e.g. Production Servers" value={form.bundleName} onChange={set('bundleName')} />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="input" placeholder="Optional description" value={form.bundleDescription} onChange={set('bundleDescription')} />
        </div>

        <div className="form-group">
          <label className="form-label"><User size={13} />SSH Username</label>
          <input
            required
            className="input"
            placeholder="e.g. ec2-user, ubuntu, root"
            value={form.sshUsername}
            onChange={set('sshUsername')}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}
          />
          <span className="form-hint">The Linux user used for SSH connections to all servers in this bundle.</span>
        </div>

        <div className="form-group">
          <label className="form-label"><Server size={13} />IP Addresses</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              placeholder="192.168.1.1 (press Enter)"
              value={form.ipInput}
              onChange={set('ipInput')}
              onKeyDown={handleKeyDown}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-ghost" onClick={addIp}>Add</button>
          </div>
          {ips.length > 0 && (
            <div className="tags-list" style={{ marginTop: '0.5rem' }}>
              {ips.map(ip => (
                <span key={ip} className="tag">
                  <Server size={9} />{ip}
                  <button type="button" className="tag-remove" onClick={() => removeIp(ip)}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <span className="form-hint">Enter IPs one at a time or comma-separated.</span>
        </div>

        {error && <div className="error-banner"><AlertCircle size={14} />{error}</div>}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? <Loader2 size={15} className="spin" /> : <><Plus size={14} />Create Bundle</>}
        </button>
      </form>
    </Modal>
  );
};

/* ── Main Page ───────────────────────────────────────── */
const BundlePage = () => {
  const { auth }  = useAuth();
  const [bundles, setBundles]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBundles(auth.userId);
      setBundles(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError('Failed to load bundles.');
    } finally {
      setLoading(false);
    }
  }, [auth.userId]);

  useEffect(() => { fetchBundles(); }, [fetchBundles]);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Bundles</h1>
          <p style={{ margin: 0 }}>Group server IP addresses into reusable bundles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Bundle
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading bundles…" />
      ) : bundles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><Boxes size={24} /></div>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No bundles yet</h2>
          <p style={{ maxWidth: '28rem', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
            Create bundles to group server IPs and reuse them across pipelines.
          </p>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Create Bundle
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}
        >
          {bundles.map((b) => (
            <div key={b.id} className="card animate-fade-up" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div className="pipeline-card__icon"><Boxes size={16} /></div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>{b.bundleName}</h3>
                  {b.bundleDescription && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }} className="truncate">
                      {b.bundleDescription}
                    </p>
                  )}
                </div>
              </div>

              {b.username && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
                  <User size={11} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                    {b.username}
                  </span>
                </div>
              )}

              <div className="tags-list">
                {(b.ipAddresses ?? []).map(ip => (
                  <span key={ip} className="tag"><Server size={10} />{ip}</span>
                ))}
                {(!b.ipAddresses || b.ipAddresses.length === 0) && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No IPs configured</span>
                )}
              </div>

              <hr className="divider" style={{ margin: '0.875rem 0' }} />
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {(b.ipAddresses ?? []).length} server{(b.ipAddresses ?? []).length !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      <CreateBundleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={auth.userId}
        onCreated={fetchBundles}
      />
    </div>
  );
};

export default BundlePage;

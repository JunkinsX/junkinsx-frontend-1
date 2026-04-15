import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GitBranch, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, registerUser } from '../api/api';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from = location.state?.from?.pathname ?? '/';

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await registerUser({ username: form.username, email: form.email, password: form.password });
        setSuccess('Account created! Signing you in…');
        // Auto-login after register
        const res = await loginUser({ email: form.email, password: form.password });
        login(res.data);
        navigate(from, { replace: true });
      } else {
        const res = await loginUser({ email: form.email, password: form.password });
        login(res.data);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message
          ?? err.response?.data
          ?? 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'var(--bg-subtle)',
    }}>
      <div className="auth-card animate-fade-up">
        {/* Logo */}
        <div className="auth-logo">
          <GitBranch size={28} strokeWidth={2.5} />
          JunkinsX
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-muted)', borderRadius: 10, padding: 4, marginBottom: '1.75rem' }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: 7,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 12 : -12 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">
                    <User size={13} /> Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      required
                      type="text"
                      className="input"
                      placeholder="johndoe"
                      value={form.username}
                      onChange={set('username')}
                      autoComplete="username"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Mail size={13} /> Email
                </label>
                <input
                  required
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={13} /> Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    required
                    type={showPw ? 'text' : 'password'}
                    className="input"
                    placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
                    value={form.password}
                    onChange={set('password')}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-banner">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              {success && (
                <div className="success-banner">
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', fontSize: '0.9375rem' }}
              >
                {loading
                  ? <Loader2 size={18} className="spin" />
                  : mode === 'login' ? 'Sign In' : 'Create Account'
                }
              </button>
            </motion.form>
          </AnimatePresence>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 'inherit' }}
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          CI/CD Pipeline Management · JunkinsX
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import AuthPage        from './pages/AuthPage';
import Dashboard       from './pages/Dashboard';
import CreatePipeline  from './pages/CreatePipeline';
import PipelineDetails from './pages/PipelineDetails';
import BundlePage      from './pages/BundlePage';
import TaskBuilderPage from './pages/TaskBuilderPage';

function App() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <AuthProvider>
      <Router>
        <Navbar dark={dark} onToggleDark={() => setDark(d => !d)} />

        <main>
          <Routes>
            {/* Public */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreatePipeline /></ProtectedRoute>} />
            <Route path="/pipeline/:id" element={<ProtectedRoute><PipelineDetails /></ProtectedRoute>} />
            <Route path="/bundles" element={<ProtectedRoute><BundlePage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TaskBuilderPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer__inner">
            <span style={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              JunkinsX
            </span>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
              CI/CD Pipeline Management · Built with React &amp; passion for automation.
            </p>
            <div className="footer__links">
              <a href="#" className="footer__link">Docs</a>
              <a href="#" className="footer__link">Support</a>
              <a href="#" className="footer__link">API</a>
            </div>
          </div>
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;

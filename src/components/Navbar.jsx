import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, GitBranch, Package, LogOut, User, Boxes, ListTodo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ dark, onToggleDark }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { auth, logout } = useAuth();

  const isAuth = location.pathname === '/auth';

  const navItems = [
    { path: '/',        label: 'Dashboard', icon: LayoutGrid },
    { path: '/bundles', label: 'Bundles',   icon: Boxes },
    { path: '/tasks',   label: 'Tasks',     icon: ListTodo },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <GitBranch size={18} strokeWidth={2.5} />
          JunkinsX
        </Link>

        {/* Center nav — hidden on auth page */}
        {!isAuth && auth && (
          <div className="navbar__nav">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon size={14} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="navbar__actions">
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle__thumb" />
          </button>

          {/* User avatar + logout */}
          {!isAuth && auth && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                title={auth.username}
                style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: 'var(--text-secondary)',
                  cursor: 'default',
                }}
              >
                {auth.username?.[0]?.toUpperCase() ?? <User size={13} />}
              </div>
              <button
                className="btn btn-icon btn-ghost"
                onClick={handleLogout}
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

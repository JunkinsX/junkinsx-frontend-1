import React, { createContext, useContext, useState, useCallback } from 'react';
import { getAllUsers } from '../api/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'jx_auth';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadFromStorage);

  /**
   * Called after a successful login/register.
   * The backend /api/user/login returns a plain string ("Login successful"),
   * not a user object. We resolve the real userId by calling getAllUsers and
   * matching on the email the user just typed in.
   *
   * @param {string|object} data  - raw response body from the login call
   * @param {string} email        - email used during login (passed by AuthPage)
   */
  const login = useCallback(async (data, email) => {
    console.log('[AuthContext] login() raw data:', data, 'email:', email);

    let userId   = 1;
    let username = email ? email.split('@')[0] : 'User';
    let resolvedEmail = email ?? '';

    // The backend returns a plain string \u2014 fetch real user info via getAllUsers
    if (email) {
      try {
        const res   = await getAllUsers();
        const users = Array.isArray(res.data) ? res.data : [];
        const found = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (found) {
          userId        = found.id ?? found.userId ?? 1;
          username      = found.username ?? found.name ?? username;
          resolvedEmail = found.email ?? email;
        }
      } catch (e) {
        console.warn('[AuthContext] Could not resolve userId from getAllUsers:', e.message);
      }
    } else if (data && typeof data === 'object') {
      // If the backend ever returns a proper user object, use it directly
      userId        = data.userId ?? data.id ?? data.user?.id ?? 1;
      username      = data.username ?? data.user?.username ?? username;
      resolvedEmail = data.email ?? data.user?.email ?? resolvedEmail;
    }

    const payload = { userId, username, email: resolvedEmail, _raw: data };
    console.log('[AuthContext] storing payload:', payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuth(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;

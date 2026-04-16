import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'jx_auth';

/**
 * Returns true only if the stored payload has a valid numeric userId.
 * Rejects old/corrupt sessions where userId ended up as a string like
 * "Login successful" (from the pre-fix version of AuthContext).
 */
const isValidPayload = (p) =>
  p && typeof p === 'object' && typeof p.userId === 'number' && p.userId > 0;

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidPayload(parsed)) {
      // Stale / corrupt session — wipe it so the user is redirected to login
      console.warn('[AuthContext] Clearing invalid cached session:', parsed);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadFromStorage);

  /**
   * Called after a successful login/register.
  * The backend returns a User object from /api/user/login.
   *
   * @param {string|object} data  - raw response body from the login call
   * @param {string} email        - email used during login (passed by AuthPage)
   */
  const login = useCallback(async (data, email) => {
    console.log('[AuthContext] login() data:', data);

    // The backend now returns the full User object
    const userId = data?.id ?? data?.userId ?? 1;
    const username = data?.username ?? (email ? email.split('@')[0] : 'User');
    const resolvedEmail = data?.email ?? email ?? '';

    const payload = {
      userId: Number(userId),
      username,
      email: resolvedEmail,
    };

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

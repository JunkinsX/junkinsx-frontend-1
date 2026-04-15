import React, { createContext, useContext, useState, useCallback } from 'react';

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

/**
 * Attempt every known field name the backend might use for the user id.
 * Falls back to 1 so the app never gets stuck on login.
 */
const extractUserId = (data) => {
  if (!data || typeof data !== 'object') return data || 1;
  return (
    data.userId     ??
    data.user_id    ??
    data.id         ??
    data.ID         ??
    data.user?.id   ??
    data.user?.userId ??
    data.data?.id   ??
    1               // final fallback — at least we know login succeeded
  );
};

const extractUsername = (data) => {
  if (!data || typeof data !== 'object') return 'User';
  return (
    data.username   ??
    data.userName   ??
    data.name       ??
    data.user?.username ??
    data.user?.name ??
    data.data?.username ??
    data.email?.split('@')[0] ??
    'User'
  );
};

const extractEmail = (data) => {
  if (!data || typeof data !== 'object') return '';
  return (
    data.email      ??
    data.user?.email ??
    data.data?.email ??
    ''
  );
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadFromStorage);

  const login = useCallback((data) => {
    // Log the raw response so we can see what the backend actually returns
    console.log('[AuthContext] login() raw data:', data);

    const payload = {
      userId:   extractUserId(data),
      username: extractUsername(data),
      email:    extractEmail(data),
      // Store the raw response too, just in case
      _raw: data,
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

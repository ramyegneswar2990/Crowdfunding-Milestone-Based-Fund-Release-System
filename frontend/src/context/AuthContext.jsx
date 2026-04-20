import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and exposes auth state.
 *
 * Expected JWT payload shape (after base64 decode):
 *   { sub: "email", name: "Full Name", role: "ADMIN|CAMPAIGNER|BACKER|VERIFIER", ... }
 *
 * The raw token is stored under the key "token" in localStorage.
 * The decoded user object is stored under "user".
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /** Call this after a successful /auth/login response */
  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  /** Wipes auth state and redirects (navigate is handled by the caller) */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  /** Returns true when a valid token + user exist in state */
  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem('token');
  }, [user]);

  const value = { user, login, logout, isAuthenticated };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Hook — use inside any component within <AuthProvider> */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

export default AuthContext;

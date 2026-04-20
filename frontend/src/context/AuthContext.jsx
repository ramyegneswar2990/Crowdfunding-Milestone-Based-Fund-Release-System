import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and exposes auth state.
 *
 * Expected JWT payload shape (after base64 decode):
 *   { sub: "email", name: "Full Name", role: "ADMIN|CAMPAIGNER|BACKER|VERIFIER", ... }
 *
 * The raw token is stored under the key "token" in localStorage.
 * The decoded user object is stored under "user".
 *
 * Usage in LoginPage:
 *   const { data } = await loginAPI(form);
 *   login(data.token, data.user);   ← call AFTER the API call
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);   // true until localStorage is read

  // Rehydrate session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token  = localStorage.getItem('token');
      if (stored && token) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore corrupt data
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Call this AFTER a successful /auth/login response.
   *   login(data.token, data.user)
   */
  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  /** Wipes auth state; redirect is handled by the caller */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  /** Returns true when a valid token + user exist */
  const isAuthenticated = useCallback(
    () => !!user && !!localStorage.getItem('token'),
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook — use inside any component within <AuthProvider> */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;

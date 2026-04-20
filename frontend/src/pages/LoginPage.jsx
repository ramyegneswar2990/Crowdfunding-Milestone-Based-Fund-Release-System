import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginAPI } from '../api/services';
import './AuthPages.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAPI(form);
      // Backend returns: { success, message, data: { token, tokenType, userId, email, role }, errors }
      const auth = res?.data?.data;
      if (!auth?.token) {
        throw new Error(res?.data?.message ?? 'Login failed. Missing token.');
      }

      const user = {
        id: auth.userId,
        email: auth.email,
        role: auth.role,
        name: auth.email, // backend AuthResponse doesn't include name; use email as display fallback
      };

      login(auth.token, user);
      toast.success(`Welcome back, ${user.name ?? 'User'}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow--one" />
      <div className="auth-glow auth-glow--two" />
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon">◈</span>
          <span className="auth-brand-name">FundFlow</span>
        </div>
        <h1 className="auth-title">Sign in to your account</h1>
        <p className="auth-sub">Welcome back — let's pick up where you left off.</p>

        <div className="auth-social-stack">
          <button type="button" className="auth-social-btn">
            Continue with Google
          </button>
          <button type="button" className="auth-social-btn">
            Continue with GitHub
          </button>
        </div>

        <div className="auth-divider">
          <span>Or</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-link-text">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

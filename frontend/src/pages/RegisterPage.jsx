import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerAPI } from '../api/services';
import './AuthPages.css';

const ROLES = ['BACKER', 'CAMPAIGNER'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'BACKER' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerAPI(form);
      toast.success('Account created! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Registration failed. Please try again.');
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
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join the platform and start making an impact.</p>

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
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="role">I want to join as</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-link-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'BACKER'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, role } = formData;
    
    if (!username || !email || !password || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus className="auth-icon" />
          </div>
          <h1>Create Account</h1>
          <p>Join our platform to start funding or creating</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="John Doe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">I want to be a</label>
            <div className="input-wrapper">
              <Briefcase className="input-icon" />
              <select
                id="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="BACKER">Backer (I want to fund campaigns)</option>
                <option value="CAMPAIGNER">Campaigner (I want to start campaigns)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

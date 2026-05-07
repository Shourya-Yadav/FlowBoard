import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/auth.css';

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return setError('Please fill in all fields.');
    }

    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Background Effects */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      {/* Main Layout */}
      <div className="auth-container">

        {/* LEFT SIDE */}
        <div className="auth-left">

          <div className="auth-left-content">

            <div className="flowboard-badge">
              🚀 FlowBoard Workspace
            </div>

            <h1 className="flowboard-title">
              Organize Work <br />
              Smarter & Faster
            </h1>

            <p className="flowboard-description">
              FlowBoard helps teams manage projects,
              track progress, collaborate seamlessly,
              and boost productivity with a modern
              workflow experience.
            </p>

            <div className="flowboard-features">

              <div className="feature-item">
                ⚡ Smart Task Management
              </div>

              <div className="feature-item">
                📊 Real-Time Analytics
              </div>

              <div className="feature-item">
                👥 Team Collaboration
              </div>

              <div className="feature-item">
                🔒 Secure Cloud Workspace
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="auth-card">

          {/* Header */}
          <div className="auth-header">

            <div className="auth-logo">
              <div className="logo-mark">F</div>
            </div>

            <h1 className="auth-title">
              Welcome Back
            </h1>

            <p className="auth-subtitle">
              Sign in to continue to your workspace
            </p>

          </div>

          {/* FORM */}
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {error && (
              <div className="alert-error">
                ⚠ {error}
              </div>
            )}

            {/* Email */}
            <div className="form-group">

              <label className="form-label">
                Email Address
              </label>

              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />

            </div>

            {/* Password */}
            <div className="form-group">

              <label className="form-label">
                Password
              </label>

              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

            </div>

            {/* Submit Button */}
            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                'Sign In →'
              )}
            </button>

          </form>

          {/* Footer */}
          <p className="auth-footer">

            No account?{' '}

            <Link
              to="/register"
              className="auth-link"
            >
              Create one →
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}
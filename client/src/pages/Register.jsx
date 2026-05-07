import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-mark" style={{ width: 44, height: 44, fontSize: 20 }}>F</div>
          </div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join your team on FlowBoard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="member">Member — Join & contribute to projects</option>
              <option value="admin">Admin — Create & manage projects</option>
            </select>
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><span className="loading-spinner" style={{ width: 18, height: 18 }} /> Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return 'All fields are required.';
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Theme toggle — fixed top-right */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 200 }}>
        <ThemeToggle />
      </div>

      {/* Back to home */}
      <Link
        to="/"
        style={{
          position: 'fixed', top: 22, left: 24, zIndex: 200,
          fontSize: 13, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 6,
          textDecoration: 'none',
        }}
      >
        ← Home
      </Link>

      <div className="auth-card animate-in">
        <div className="auth-logo">💰 FinTracker</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start tracking your finances today</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              className="input"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              className="input"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

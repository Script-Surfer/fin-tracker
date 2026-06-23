import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user, login } = useAuth();
  const [profileMsg, setProfileMsg]   = useState('');

  // ── Password form ─────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError]       = useState('');
  const [pwSuccess, setPwSuccess]   = useState('');
  const [pwLoading, setPwLoading]   = useState(false);

  // ── Currency form ─────────────────────────────────────────
  const [currency, setCurrency]     = useState(user?.currency || 'INR');
  const [currError, setCurrError]   = useState('');
  const [currSuccess, setCurrSuccess] = useState('');
  const [currLoading, setCurrLoading] = useState(false);

  // Keep currency in sync if user loads async
  useEffect(() => {
    if (user?.currency) setCurrency(user.currency);
  }, [user]);

  const handlePwChange = (e) =>
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwForm.newPassword.length < 6) {
      return setPwError('New password must be at least 6 characters.');
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError('New passwords do not match.');
    }

    setPwLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleCurrencySubmit = async (e) => {
    e.preventDefault();
    setCurrError('');
    setCurrSuccess('');
    setCurrLoading(true);
    try {
      const { data } = await api.put('/auth/settings', { currency });
      // Re-store updated user in context (keep existing token)
      const token = localStorage.getItem('token');
      login(token, data.user);
      setCurrSuccess('Currency preference saved.');
    } catch (err) {
      setCurrError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setCurrLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="main-content">

        <div className="page-header animate-in">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your account preferences</p>
          </div>
        </div>

        {/* ── Profile Info ── */}
        <div className="settings-section animate-in animate-in-delay-1">
          <h2 className="settings-section-title">Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 16 }}>{user?.name}</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          {profileMsg && (
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--income)' }}>{profileMsg}</p>
          )}
        </div>

        {/* ── Currency Preference ── */}
        <div className="settings-section animate-in animate-in-delay-2">
          <h2 className="settings-section-title">Currency</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Choose the currency symbol displayed throughout the app.
          </p>
          {currError   && <div className="error-box">{currError}</div>}
          {currSuccess && (
            <div style={{
              background: 'var(--income-bg)', border: '1px solid var(--income-border)',
              color: 'var(--income)', borderRadius: 'var(--radius-sm)',
              padding: '10px 14px', fontSize: 13, marginBottom: 16,
            }}>
              {currSuccess}
            </div>
          )}
          <form onSubmit={handleCurrencySubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label className="label">Currency</label>
              <select
                id="currency-select"
                className="select"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={currLoading}>
              {currLoading ? 'Saving…' : 'Save preference'}
            </button>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className="settings-section animate-in animate-in-delay-3">
          <h2 className="settings-section-title">Change Password</h2>
          {pwError   && <div className="error-box">{pwError}</div>}
          {pwSuccess && (
            <div style={{
              background: 'var(--income-bg)', border: '1px solid var(--income-border)',
              color: 'var(--income)', borderRadius: 'var(--radius-sm)',
              padding: '10px 14px', fontSize: 13, marginBottom: 16,
            }}>
              {pwSuccess}
            </div>
          )}
          <form onSubmit={handlePwSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                className="input"
                name="currentPassword"
                type="password"
                value={pwForm.currentPassword}
                onChange={handlePwChange}
                required
                placeholder="Enter current password"
                autoComplete="current-password"
                style={{ maxWidth: 400 }}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                className="input"
                name="newPassword"
                type="password"
                value={pwForm.newPassword}
                onChange={handlePwChange}
                required
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                style={{ maxWidth: 400 }}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                className="input"
                name="confirmPassword"
                type="password"
                value={pwForm.confirmPassword}
                onChange={handlePwChange}
                required
                placeholder="Repeat new password"
                autoComplete="new-password"
                style={{ maxWidth: 400 }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwLoading} id="change-password-btn">
              {pwLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
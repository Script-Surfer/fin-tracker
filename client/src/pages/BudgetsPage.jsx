import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Food', 'Rent', 'Transport', 'Shopping', 'Entertainment',
  'Utilities', 'Health', 'Education', 'Salary', 'Freelance', 'Other',
];

const BudgetsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency === 'USD' ? '$' : '₹';

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Food', limitAmount: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets');
      setBudgets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/budgets', form);
      setShowForm(false);
      setForm({ category: 'Food', limitAmount: '' });
      fetchBudgets();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget limit?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const barColor = (pct) => {
    if (pct >= 100) return 'var(--expense)';
    if (pct >= 75) return 'var(--warning)';
    return 'var(--income)';
  };

  // Over-budget categories for alert banner
  const overBudget = budgets.filter(b => b.spent > b.limitAmount);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="main-content">

        {/* ── over-budget banner ── */}
        {overBudget.length > 0 && (
          <div
            className="animate-in"
            style={{
              background: 'var(--expense-bg)',
              border: '1px solid var(--expense-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--expense)',
            }}
          >
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <strong>Over budget: </strong>
              {overBudget.map((b, i) => (
                <span key={b._id}>
                  {b.category} (by {currency}{(b.spent - b.limitAmount).toLocaleString()})
                  {i < overBudget.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── header ── */}
        <div className="page-header animate-in">
          <div>
            <h1 className="page-title">Budgets</h1>
            <p className="page-subtitle">
              Monthly limits for{' '}
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            id="set-budget-btn"
            className="btn btn-primary"
            onClick={() => { setShowForm(v => !v); setFormError(''); }}
          >
            {showForm ? 'Cancel' : '+ Set budget'}
          </button>
        </div>

        {/* ── set/edit form ── */}
        {showForm && (
          <div className="form-card animate-in">
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Set monthly budget</h2>
            {formError && <div className="error-box">{formError}</div>}
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}
            >
              <div style={{ flex: '1 1 160px' }}>
                <label className="label">Category</label>
                <select
                  className="select"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label className="label">Monthly limit ({currency})</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  required
                  value={form.limitAmount}
                  onChange={e => setForm(f => ({ ...f, limitAmount: e.target.value }))}
                  placeholder="e.g. 5000"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save budget'}
              </button>
            </form>
          </div>
        )}

        {/* ── budget cards ── */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : budgets.length === 0 ? (
          <div className="empty-state animate-in">
            <div className="empty-state-icon">💰</div>
            <p className="empty-state-text">
              No budgets set yet. Click &quot;+ Set budget&quot; to add one.
            </p>
          </div>
        ) : (
          <div className="budget-grid animate-in animate-in-delay-1">
            {budgets.map(b => {
              const pct = Math.min((b.spent / b.limitAmount) * 100, 100);
              const color = barColor(pct);
              const over = b.spent > b.limitAmount;

              return (
                <div
                  key={b._id}
                  className="budget-card"
                  style={{ borderTop: `3px solid ${color}` }}
                >
                  <div className="budget-card-header">
                    <span className="budget-category">{b.category}</span>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(b._id)}
                      title="Remove budget"
                      style={{ color: 'var(--expense)' }}
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="budget-amounts">
                    <span
                      className="budget-spent"
                      style={{ color: over ? 'var(--expense)' : 'var(--text-primary)' }}
                    >
                      {currency}{b.spent.toLocaleString()}
                    </span>
                    <span className="budget-limit">
                      of {currency}{b.limitAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>

                  <div className="budget-footer">
                    <span style={{ color }}>
                      {over ? `⚠️ Over by ${currency}${(b.spent - b.limitAmount).toLocaleString()}` : `${Math.round(pct)}% used`}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {currency}{Math.max(b.limitAmount - b.spent, 0).toLocaleString()} left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsPage;
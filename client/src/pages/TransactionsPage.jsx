import { useState, useCallback, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Food', 'Rent', 'Transport', 'Shopping', 'Entertainment',
  'Utilities', 'Health', 'Education', 'Salary', 'Freelance', 'Other',
];

const EMPTY_FORM = {
  amount: '',
  type: 'expense',
  category: 'Food',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

const TransactionsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency === 'USD' ? '$' : '₹';

  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '', category: '', search: '', from: '', to: '',
  });

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ── fetch ─────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await api.get('/transactions', { params });
      setTransactions(data.transactions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // ── filter handlers ───────────────────────────────────────
  const handleFilter = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters({ type: '', category: '', search: '', from: '', to: '' });
    setPage(1);
  };

  // ── modal helpers ─────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (tx) => {
    setEditTarget(tx);
    setForm({
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description || '',
      date: tx.date.split('T')[0],
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setFormError('');
  };

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editTarget) {
        await api.put(`/transactions/${editTarget._id}`, form);
      } else {
        await api.post('/transactions', form);
      }
      closeModal();
      fetchTransactions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await api.delete(`/transactions/${deleteId}`);
      setDeleteId(null);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="main-content">

        {/* ── header ── */}
        <div className="page-header animate-in">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">{total} total records</p>
          </div>
          <button id="add-transaction-btn" onClick={openAdd} className="btn btn-primary">
            + Add transaction
          </button>
        </div>

        {/* ── filters ── */}
        <div className="filter-bar animate-in animate-in-delay-1">
          <input
            className="input"
            name="search"
            placeholder="Search description…"
            value={filters.search}
            onChange={handleFilter}
            style={{ minWidth: 180 }}
          />
          <select className="select" name="type" value={filters.type} onChange={handleFilter}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="select" name="category" value={filters.category} onChange={handleFilter}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            className="input"
            name="from"
            type="date"
            value={filters.from}
            onChange={handleFilter}
            style={{ minWidth: 140 }}
          />
          <input
            className="input"
            name="to"
            type="date"
            value={filters.to}
            onChange={handleFilter}
            style={{ minWidth: 140 }}
          />
          <button onClick={clearFilters} className="btn btn-ghost btn-sm">Clear</button>
        </div>

        {/* ── table ── */}
        <div className="table-container animate-in animate-in-delay-2">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-text">No transactions found. Try adjusting your filters or add your first transaction.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx._id}>
                      <td>{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{tx.description || '—'}</td>
                      <td><span className="badge badge-category">{tx.category}</span></td>
                      <td>
                        <span className={`badge badge-${tx.type}`}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td style={{
                        fontWeight: 600,
                        color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)',
                      }}>
                        {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => openEdit(tx)}
                          title="Edit"
                          style={{ color: 'var(--accent-light)', fontSize: 16 }}
                        >✏️</button>
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteId(tx._id)}
                          title="Delete"
                          style={{ color: 'var(--expense)', fontSize: 16 }}
                        >🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── pagination ── */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h2 className="modal-title">{editTarget ? 'Edit transaction' : 'Add transaction'}</h2>
            {formError && <div className="error-box">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Amount ({currency})</label>
                <input
                  className="input"
                  type="number"
                  value={form.amount}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="label">Type</label>
                <select
                  className="select"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Category</label>
                <select
                  className="select"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <input
                  className="input"
                  type="text"
                  value={form.description}
                  placeholder="Optional note…"
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  required
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : editTarget ? 'Save changes' : 'Add transaction'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm dialog ── */}
      {deleteId && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h2 className="modal-title">Delete transaction?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              This action cannot be undone. The transaction will be permanently removed.
            </p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleDelete}>Yes, delete</button>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

const DashboardPage = () => {
  const { user } = useAuth();
  const currency = user?.currency === 'USD' ? '$' : 'Rs';

  const [summary, setSummary]       = useState(null);
  const [pieData, setPieData]       = useState([]);
  const [trendData, setTrendData]   = useState([]);
  const [recentTx, setRecentTx]     = useState([]);
  const [overBudget, setOverBudget] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [summaryRes, txRes, budgetRes] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions', { params: { limit: 5, page: 1 } }),
          api.get('/budgets'),
        ]);

        const s = summaryRes.data;
        setSummary(s);

        const catMap = {};
        (s.categoryBreakdown || []).forEach(item => { catMap[item._id] = item.total; });
        const totalSpend = Object.values(catMap).reduce((a, b) => a + b, 0);
        const pieArr = Object.entries(catMap).map(([cat, val]) => ({
          name: cat,
          value: totalSpend > 0 ? parseFloat(((val / totalSpend) * 100).toFixed(1)) : 0,
        }));
        setPieData(pieArr);

        const trend = (s.monthlyTrend || []).map(m => ({
          month: m.month,
          Expenses: m.expenses,
          Income: m.income,
        }));
        setTrendData(trend);

        setRecentTx(txRes.data.transactions || []);
        const over = (budgetRes.data || []).filter(b => b.spent > b.limitAmount);
        setOverBudget(over);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const income   = summary?.income   ?? 0;
  const expenses = summary?.expenses ?? 0;
  const balance  = income - expenses;
  const savings  = income > 0 ? ((balance / income) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="main-content">

        {overBudget.length > 0 && (
          <div className="alert-banner animate-in" style={{ background: 'var(--expense-bg)', border: '1px solid var(--expense-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 20, color: 'var(--expense)' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <strong>Over budget this month: </strong>
              {overBudget.map((b, i) => (
                <span key={b._id}>{b.category} (by {currency}{(b.spent - b.limitAmount).toLocaleString()}){i < overBudget.length - 1 ? ', ' : ''}</span>
              ))}
            </div>
          </div>
        )}

        <div className="page-header animate-in">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} overview</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <>
            <div className="summary-grid animate-in animate-in-delay-1">
              <div className="summary-card income">
                <div className="summary-icon">Income</div>
                <div className="summary-label">Total Income</div>
                <div className="summary-value">{currency}{income.toLocaleString()}</div>
              </div>
              <div className="summary-card expense">
                <div className="summary-icon">Expense</div>
                <div className="summary-label">Total Expenses</div>
                <div className="summary-value">{currency}{expenses.toLocaleString()}</div>
              </div>
              <div className="summary-card balance">
                <div className="summary-icon">Balance</div>
                <div className="summary-label">Net Balance</div>
                <div className="summary-value" style={{ color: balance >= 0 ? 'var(--accent-light)' : 'var(--expense)' }}>
                  {balance >= 0 ? '' : '-'}{currency}{Math.abs(balance).toLocaleString()}
                </div>
              </div>
              <div className="summary-card savings">
                <div className="summary-icon">Savings</div>
                <div className="summary-label">Savings Rate</div>
                <div className="summary-value">{savings}%</div>
              </div>
            </div>

            <div className="charts-grid animate-in animate-in-delay-2">
              <div className="chart-card">
                <h2 className="chart-title">Spending by Category</h2>
                {pieData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No expense data this month</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                          {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => v + '%'} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {pieData.map((entry, i) => (
                        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                          {entry.name} ({entry.value}%)
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="chart-card">
                <h2 className="chart-title">6-Month Trend</h2>
                {trendData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Not enough data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                      <Line type="monotone" dataKey="Expenses" stroke="var(--expense)" strokeWidth={2} dot={{ fill: 'var(--expense)', r: 4 }} />
                      <Line type="monotone" dataKey="Income" stroke="var(--income)" strokeWidth={2} dot={{ fill: 'var(--income)', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="animate-in animate-in-delay-3">
              <div className="section-row">
                <h2>Recent Transactions</h2>
                <Link to="/transactions" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              <div className="table-container">
                {recentTx.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 24px' }}>
                    <p className="empty-state-text">No transactions yet. Add your first one!</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-card-mobile">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTx.map(tx => (
                          <tr key={tx._id}>
                            <td data-label="Date">{new Date(tx.date).toLocaleDateString()}</td>
                            <td data-label="Description" style={{ color: 'var(--text-primary)' }}>{tx.description || '-'}</td>
                            <td data-label="Category"><span className="badge badge-category">{tx.category}</span></td>
                            <td data-label="Type"><span className={`badge badge-${tx.type}`}>{tx.type}</span></td>
                            <td data-label="Amount" style={{ fontWeight: 600, color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                              {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
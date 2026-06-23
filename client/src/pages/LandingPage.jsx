import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

/* ── Feature data ──────────────────────────────────────── */
const FEATURES = [
  {
    icon: '💸',
    name: 'Income & Expense Tracking',
    desc: 'Log every transaction with categories, descriptions, and dates. Get an instant clear picture of where your money goes.',
    color: 'var(--income-bg)',
  },
  {
    icon: '🎯',
    name: 'Smart Budget Limits',
    desc: 'Set monthly spending limits per category. Color-coded progress bars turn complex budgets into at-a-glance clarity.',
    color: 'var(--accent-bg)',
  },
  {
    icon: '📊',
    name: 'Beautiful Analytics',
    desc: 'Pie charts for spending breakdown and 6-month line charts for trend analysis. See your patterns, not just numbers.',
    color: 'rgba(99, 102, 241, 0.1)',
  },
  {
    icon: '📤',
    name: 'CSV Bank Import',
    desc: 'Upload your bank statement CSV and import hundreds of transactions in seconds. Skipped rows get clear error reports.',
    color: 'var(--warning-bg)',
  },
  {
    icon: '🔒',
    name: 'Private & Secure',
    desc: 'JWT-based authentication means your data is yours alone. No one else can see your transactions or budgets.',
    color: 'var(--expense-bg)',
  },
  {
    icon: '💱',
    name: 'Multi-Currency',
    desc: 'Switch between ₹ INR and $ USD at any time in Settings. Your preference syncs across all pages instantly.',
    color: 'var(--income-bg)',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Create a free account',
    desc: 'Sign up in under 30 seconds — no credit card required. Your financial data stays private and secure.',
  },
  {
    n: '2',
    title: 'Add your transactions',
    desc: 'Log income and expenses manually or import your bank CSV for instant bulk setup.',
  },
  {
    n: '3',
    title: 'Watch insights grow',
    desc: 'Set budgets, explore charts, and finally understand where every rupee or dollar is going.',
  },
];

/* ── Component ─────────────────────────────────────────── */
const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, go to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', transition: 'background-color 0.3s ease' }}>

      {/* ── Landing Navbar ──────────────────────────────── */}
      <nav className="landing-nav">
        <span className="landing-nav-brand">💰 FinTracker</span>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost btn-sm" id="landing-login-btn">
            Log in
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm" id="landing-signup-btn">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="landing-hero">
        <div style={{ width: '100%' }}>
          <div className="hero-content">
            <div className="hero-badge">
              ✦ Free personal finance tool
            </div>

            <h1 className="hero-title">
              Your Money,<br />
              <span className="hero-title-accent">Perfectly Organised.</span>
            </h1>

            <p className="hero-subtitle">
              Track income and expenses, set monthly budgets, import bank statements,
              and visualise spending with beautiful charts — all in one place.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
                Start for free →
              </Link>
              <a href="#features" className="btn btn-ghost" style={{ padding: '13px 28px', fontSize: 15 }}>
                See features
              </a>
            </div>
          </div>

          {/* Mock dashboard preview card */}
          <div className="hero-card" style={{ marginTop: 56 }}>
            <div className="hero-card-title">June 2026 Overview</div>
            <div className="hero-card-stats">
              <div className="hero-stat">
                <div className="hero-stat-label">Income</div>
                <div className="hero-stat-value" style={{ color: 'var(--income)' }}>₹85,000</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">Expenses</div>
                <div className="hero-stat-value" style={{ color: 'var(--expense)' }}>₹42,300</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">Savings Rate</div>
                <div className="hero-stat-value" style={{ color: 'var(--warning)' }}>50.2%</div>
              </div>
            </div>

            <div style={{ marginBottom: 6 }}>
              <div className="hero-bar-label" style={{ marginBottom: 6 }}>
                <span>Food budget</span>
                <span style={{ color: 'var(--income)' }}>68% used</span>
              </div>
              <div className="hero-bar">
                <div className="hero-bar-fill" style={{ width: '68%' }} />
              </div>
            </div>
            <div>
              <div className="hero-bar-label" style={{ marginBottom: 6 }}>
                <span>Entertainment budget</span>
                <span style={{ color: 'var(--warning)' }}>92% used</span>
              </div>
              <div className="hero-bar">
                <div className="hero-bar-fill" style={{ width: '92%', background: 'var(--warning)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────── */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          <div>
            <div className="stat-number">100%</div>
            <div className="stat-label">Free to use</div>
          </div>
          <div>
            <div className="stat-number">11</div>
            <div className="stat-label">Spending categories</div>
          </div>
          <div>
            <div className="stat-number">6-mo</div>
            <div className="stat-label">Trend history</div>
          </div>
          <div>
            <div className="stat-number">2 MB</div>
            <div className="stat-label">CSV import limit</div>
          </div>
        </div>
      </div>

      {/* ── Features ────────────────────────────────────── */}
      <section className="landing-section" id="features" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="section-label">Features</div>
        <h2 className="section-title">
          Everything you need to<br />master your finances
        </h2>
        <p className="section-subtitle">
          Built around the PRD you planned — no filler features, just the essentials done right.
        </p>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card animate-in" key={f.name} style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="feature-icon" style={{ background: f.color }}>
                {f.icon}
              </div>
              <div className="feature-name">{f.name}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="landing-section" style={{ background: 'var(--bg-surface)', maxWidth: '100%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>How it works</div>
          <h2 className="section-title" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 16px' }}>
            Up and running in minutes
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto' }}>
            No complicated setup. No bank credentials needed. Just sign up and go.
          </p>

          <div className="steps-grid">
            {STEPS.map((s) => (
              <div className="step-item" key={s.n}>
                <div className="step-number">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="landing-cta-section">
        <div className="cta-box">
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 24px',
              boxShadow: '0 0 0 12px var(--accent-bg)',
            }}
          >
            💰
          </div>
          <h2 className="cta-title">
            Take control of your<br />
            <span className="hero-title-accent">financial future</span>
          </h2>
          <p className="cta-subtitle">
            Join FinTracker today — it&apos;s completely free.
            Start tracking in seconds, no credit card required.
          </p>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 15 }}>
              Create free account →
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '13px 28px', fontSize: 15 }}>
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="landing-footer">
        <span className="landing-footer-brand">💰 FinTracker</span>
        <p className="landing-footer-copy">
          © {new Date().getFullYear()} FinTracker. Built with React + Node.js.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

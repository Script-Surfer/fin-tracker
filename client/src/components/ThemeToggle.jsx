import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ style = {} }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        transition: 'all 0.2s ease',
        flexShrink: 0,
        ...style,
      }}
      className="theme-toggle-btn"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;

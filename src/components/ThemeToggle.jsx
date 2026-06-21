import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        width: '56px',
        height: '30px',
        borderRadius: '25px',
        border: 'none',
        background: theme === 'dark' ? '#3b82f6' : '#cbd5e1',
        position: 'relative',
        cursor: 'pointer',
        padding: '0 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: theme === 'dark' ? 'flex-end' : 'flex-start',
        transition: 'background 0.3s ease'
      }}
    >
      {/* The circular thumb */}
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </button>
  );
}
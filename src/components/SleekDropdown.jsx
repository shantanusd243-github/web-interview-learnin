import { useState, useRef, useEffect } from 'react';

export default function SleekDropdown({ options, value, onChange, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', minWidth: '140px' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 14px',
          background: 'var(--card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-main)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {value || placeholder}
        <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, width: '100%',
          background: 'var(--card)', border: '1px solid var(--border-color)',
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 1000, overflow: 'hidden', padding: '4px',
          maxHeight: '300px',
          overflowY: 'auto',
          scrollbarWidth: 'thin'
        }}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderRadius: '6px' }}
              onMouseOver={(e) => e.target.style.background = 'var(--bg)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
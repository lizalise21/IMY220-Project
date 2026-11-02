import { useState } from 'react';
import { applyTheme } from '../theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark');
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };
  return (
    <button type="button" className="btn-ghost !px-3 !py-1.5" onClick={toggle} aria-label="Switch between light and dark theme">
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  );
}
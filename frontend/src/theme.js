export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
}

export function initTheme() {
  let saved = 'dark';
  try { saved = localStorage.getItem('theme') || 'dark'; } catch { /* ignore */ }
  applyTheme(saved);
}
export const getMode = () => document.documentElement.dataset.mode === 'light' ? 'light' : 'dark';

export function syncThemeLinks() {
  const mode = getMode();
  for (const anchor of document.querySelectorAll('a[href]')) {
    const target = new URL(anchor.href, location.href);
    if (target.origin !== location.origin) continue;
    if (/\/design-concepts\/round-5\/(?:preview\.html|index\.html)?$/.test(target.pathname) || /^\/(?:index\.html|(?:services|about|journal|contact|privacy)(?:\/[^/]+)?\/?)?$/.test(target.pathname)) {
      target.searchParams.set('mode', mode);
      anchor.href = target.href;
    }
  }
}

export function setMode(mode, remember = true) {
  mode = mode === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.mode = mode;
  document.documentElement.style.colorScheme = mode;
  if (remember) { try { localStorage.setItem('orbit-atlas-appearance', mode); } catch {} }
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.textContent = mode === 'dark' ? 'Light mode' : 'Dark mode';
    button.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode');
    button.setAttribute('aria-pressed', String(mode === 'dark'));
  });
  const current = new URL(location.href);
  current.searchParams.set('mode', mode);
  history.replaceState(null, '', current);
  syncThemeLinks();
  document.dispatchEvent(new CustomEvent('orbit-theme-change', { detail: { mode } }));
}

export function initThemeControls() {
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.addEventListener('click', () => setMode(getMode() === 'dark' ? 'light' : 'dark'));
  });
  setMode(getMode());
  addEventListener('storage', event => {
    if (event.key === 'orbit-atlas-appearance' && ['light', 'dark'].includes(event.newValue)) setMode(event.newValue, false);
  });
}

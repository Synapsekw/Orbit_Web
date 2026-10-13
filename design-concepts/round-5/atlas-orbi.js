import { mountOrbiWidget } from '../../src/orbi/orbi-widget.js';
import launcherStyles from './orbi-launcher.css?inline';

export function mountAtlasOrbi({ isStudy, resolveHref }) {
  const orbi = mountOrbiWidget({ resolveHref });
  const style = document.createElement('style');
  style.textContent = launcherStyles;
  orbi.element.shadowRoot.append(style);
  orbi.element.style.setProperty('--orbi-font', 'Manrope, Arial, sans-serif');
  let toolbarObserver;
  const toolbar = isStudy && document.querySelector('.review-bar');
  if (toolbar) {
    const updateOffset = () => orbi.element.style.setProperty('--orbi-bottom', `${Math.ceil(innerHeight - toolbar.getBoundingClientRect().top) + 16}px`);
    toolbarObserver = new ResizeObserver(updateOffset);
    toolbarObserver.observe(toolbar);
    updateOffset();
  }
  addEventListener('pagehide', event => { if (!event.persisted) { toolbarObserver?.disconnect(); orbi.destroy(); } });
  return orbi;
}

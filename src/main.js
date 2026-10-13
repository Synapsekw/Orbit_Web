import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import './style.css';
import './immersive.css';
import './pages.css';
import './experiences.css';

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-navigation');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menu.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
navigation.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

// Other pages do not download the spatial engine or construction model.
if (document.querySelector('#scene')) import('./explorer.js');
if (document.body.classList.contains('inner-page')) import('./experiences.js');

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let visible = 0;
    document.querySelectorAll('[data-category]').forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) visible++;
    });
    document.querySelector('#journal-count').textContent = `${visible} field note${visible === 1 ? '' : 's'}`;
  });
});

const form = document.querySelector('#enquiry-form');
if (form) {
  const service = new URLSearchParams(location.search).get('service');
  const option = [...form.elements.service.options].find(option => option.dataset.slug === service);
  if (option) form.elements.service.value = option.value;
  let brief = '';
  form.addEventListener('input', () => {
    document.querySelector('#enquiry-review').hidden = true;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    brief = `Hello Orbit Aerials,\n\nI would like to discuss a project.\n\nName: ${data.name.trim()}\nEmail: ${data.email.trim()}\nCompany: ${data.company.trim() || 'Not specified'}\nService: ${data.service}\n\nProject brief:\n${data.message.trim()}\n\nThank you,\n${data.name.trim()}`;
    document.querySelector('#enquiry-summary').textContent = brief;
    const subject = `Project enquiry — ${data.service}`;
    document.querySelector('#email-enquiry').href = `mailto:info@orbitaerials.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`;
    document.querySelector('#enquiry-review').hidden = false;
    document.querySelector('#copy-status').textContent = '';
    document.querySelector('#enquiry-review-title').focus();
  });
  document.querySelector('#copy-enquiry').addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(brief);
      status.textContent = 'Brief copied. Paste it into an email to info@orbitaerials.com.';
    } catch {
      status.textContent = 'Select and copy the brief above, then paste it into your email.';
    }
  });
}

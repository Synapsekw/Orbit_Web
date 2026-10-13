import '@fontsource/manrope/300.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import { services, articles, processSteps } from '../../src/content.js';
import privacy from '../../src/privacy-content.html?raw';
import './site.css';
import './dark.css';
import './atlas-experiences.css';
import { initThemeControls } from './theme.js';

const params = new URLSearchParams(location.search);
const isStudy=location.pathname.includes('/design-concepts/round-5/');
if(!isStudy){
  const [section,slug]=location.pathname.replace(/index\.html$/,'').split('/').filter(Boolean);
  params.set('v','atlas');
  params.set('p',section==='services'&&slug?'service':section==='journal'&&slug?'article':section||'home');
  if(section==='services'&&slug)params.set('service',slug);
  if(section==='journal'&&slug)params.set('article',slug);
  if(params.has('service')&&section==='contact')params.set('interest',params.get('service'));
}
const variants = { atlas: ['01', 'Atlas', 'Bold clarity. Open space.'], gallery: ['02', 'Gallery', 'A quieter point of view.'], fieldwork: ['03', 'Fieldwork', 'A considered field guide.'] };
const variant = variants[params.get('v')] ? params.get('v') : 'atlas';
const pageNames = { home: 'Home', services: 'Services', service: 'Services', about: 'About', journal: 'Journal', article: 'Journal', contact: 'Contact', privacy: 'Privacy' };
const page = pageNames[params.get('p')] ? params.get('p') : 'home';
const service = services.find(s => s.slug === params.get('service')) || services[1];
const article = articles.find(a => a.slug === params.get('article')) || articles[0];
const arrow = '<span aria-hidden="true">↗</span>';
const shortNames = ['Progress documentation', 'Spatial mapping', '360° walkthroughs', 'Time-lapse', 'Handover films'];
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function url(p='home', extras={}) {
  if(isStudy)return './preview.html?' + new URLSearchParams({ v:variant, p, ...extras });
  const {service,article,...query}=extras;
  const path=p==='home'?'/':p==='service'?`/services/${service}/`:p==='article'?`/journal/${article}/`:`/${p}/`;
  const search=new URLSearchParams(query).toString();return path+(search?'?'+search:'');
}
const link = (p, label, extras={}, cls='text-link') => `<a class="${cls}" href="${url(p,extras)}">${label} ${arrow}</a>`;
const label = (num, text) => `<div class="section-label"><span>${num}</span><span>${text}</span></div>`;
const photo = (file, alt, cls='', eager=false) => `<img class="${cls}" src="/images/${file}" alt="${alt}" loading="${eager?'eager':'lazy'}" width="1800" height="1013">`;
const brand = `<img src="/brand/orbit-aerials-white.png" alt="Orbit Aerials — Visual Intelligence Redefined" width="3152" height="955">`;

function header() {
  const links = ['services','about','journal','contact'].map((p,i)=>`<a href="${url(p)}" ${pageNames[page]===pageNames[p]?'aria-current="page"':''}><span class="nav-no">0${i+1}</span>${pageNames[p]}</a>`).join('');
  return `<a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="${url()}" aria-label="Orbit Aerials home">${brand}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu <span aria-hidden="true">+</span></button><nav id="site-nav" aria-label="Main navigation">${links}</nav>${link('contact','Start a project',{},'header-cta')}<div class="rail-footer"><span>BASED IN KUWAIT</span><a href="mailto:info@orbitaerials.com">A conversation starts here ${arrow}</a><span>Clarity from above.</span></div></header>`;
}

function reviewBar() {
  const extra = Object.fromEntries(params);
  return `<aside class="review-bar" aria-label="Compare design studies"><a class="review-home" href="./">Atlas studies</a><span class="review-divider"></span>${Object.entries(variants).map(([key,[n,name]])=>`<a href="./preview.html?${new URLSearchParams({...extra,v:key,p:page})}" ${key===variant?'aria-current="true"':''}><span>${n}</span> ${name}</a>`).join('')}<span class="review-divider"></span><span class="review-page">${pageNames[page]}</span></aside>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-main"><div class="footer-word">Clarity<br>from above<span>.</span></div><div class="footer-column"><span class="micro">EXPLORE</span>${['services','about','journal','contact'].map(p=>`<a href="${url(p)}">${pageNames[p]}</a>`).join('')}</div><div class="footer-column"><span class="micro">A CONVERSATION</span><a href="mailto:info@orbitaerials.com">info@orbitaerials.com</a><a href="tel:+96599111397">+965 991 11 397</a><span class="micro footer-gap">FIND US</span><span>Burj Al Tujjar<br>Kuwait City, Kuwait</span></div><div class="footer-column"><span class="micro">OFFICE HOURS</span><span>Sunday–Thursday<br>09:00–16:00</span><span class="micro footer-gap">FOLLOW THE VIEW</span><a href="https://www.instagram.com/orbit_aerials/" target="_blank" rel="noreferrer">Instagram ${arrow}</a><a href="https://www.linkedin.com/in/orbit-aerials-504324372/" target="_blank" rel="noreferrer">LinkedIn ${arrow}</a></div></div><div class="footer-base"><a class="brand" href="${url()}">${brand}</a><span>© ${new Date().getFullYear()} Orbit Aerials</span><a href="${url('privacy')}">Privacy policy</a><a href="/image-credits.html">Image credits</a><a href="#top">Back to top ↑</a></div></footer>`;
}

function cta() {
  return `<section class="project-cta">${label('NEXT','YOUR PROJECT')}<div><h2>Let's bring your<br>site into focus<span>.</span></h2><div class="cta-bottom"><p>A first conversation. A clearer brief.<br>A considered view of what comes next.</p>${link('contact','Start a conversation',{},'circle-link')}</div></div></section>`;
}

function spatialPlate() {
  return `<figure class="spatial-plate"><div class="plate-top"><span class="micro">A SITE, IN THREE DIMENSIONS</span><div class="view-modes" role="group" aria-label="Site representation"><button data-mode="photo" aria-pressed="false">Photogrammetry</button><button data-mode="points" aria-pressed="true">Point cloud</button><button data-mode="dsm" aria-pressed="false">DSM</button></div></div><div class="model-stage"><div class="model-view" aria-label="Interactive three-dimensional stadium construction scan"></div><div class="model-loading" role="status">Preparing your perspective…</div><div class="scene-actions"><button class="rotation-toggle" type="button" aria-pressed="true">Pause rotation</button><button class="reset-view" type="button" aria-label="Reset site view">Reset view ↺</button></div><span class="model-hint">Drag to orbit · Scroll to zoom</span></div><div class="plate-controls"><span>PHOTOGRAPH</span><label class="sr-only" for="reveal">Amount of spatial layer</label><input id="reveal" type="range" min="0" max="100" value="38"><span id="layer-label">POINT CLOUD</span></div><figcaption><span>Demonstration scan · Stadium under construction</span><span>Model: <a href="https://sketchfab.com/3d-models/stadium-under-construction-drone-3d-scan-9f5edb6287284b9885fc833982d11962" target="_blank" rel="noreferrer">Sircher</a> / <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></span></figcaption></figure>`;
}


function panoramaPlate() {
  return `<figure class="panorama-plate"><div class="panorama-header"><span class="micro">360° / INSIDE THE SITE</span><span>A complete view. From where you stand.</span></div><div class="panorama-stage"><div class="panorama-view"></div><div class="panorama-status" role="status">Opening your perspective…</div></div><div class="panorama-footer"><p>Drag to look around · Use + / − to zoom</p><div class="panorama-buttons"><button type="button" data-pano-action="out" disabled aria-label="Zoom panorama out">−</button><button type="button" data-pano-action="in" disabled aria-label="Zoom panorama in">+</button><button type="button" data-pano-action="reset" disabled aria-label="Reset panorama view">Reset ↺</button><button type="button" data-pano-action="fullscreen" disabled aria-label="Open panorama fullscreen">Fullscreen ↗</button></div></div><figcaption>Demonstration panorama · Interior Construction by <a href="https://polyhaven.com/a/interior_construction" target="_blank" rel="noreferrer">Sergej Majboroda / Poly Haven</a> · <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a></figcaption></figure>`;
}

function processSection() {
  return `<section class="process-section section-space">${label('03','HOW WE WORK')}<div class="section-heading"><h2>A clear process.<br>A considered result.</h2><p>From the questions you need answered<br>to the views your team can use.</p></div><div class="process-grid">${processSteps.map(([title,body],i)=>`<div class="process-step"><span class="step-number">0${i+1}</span><h3>${title}</h3><p>${body}</p></div>`).join('')}</div></section>`;
}

function serviceIndex() {
  return `<section class="services-section section-space" id="services">${label(variant==='gallery'?'02':'01','OUR PERSPECTIVES')}<div class="section-heading"><h2>One project.<br>Every point of view.</h2><p>From the earliest groundwork to the finished building,<br>choose the perspective that moves the conversation forward.</p></div><div class="service-index">${services.map((s,i)=>`<details class="service-row" name="services" ${i===1?'open':''}><summary><span class="row-number">${s.number}</span><h3>${shortNames[i]}</h3><span class="row-sign" aria-hidden="true"></span></summary><div class="service-expanded"><div class="service-copy"><p>${s.description}</p><ul>${s.deliverables.slice(0,3).map(d=>`<li>${d}</li>`).join('')}</ul>${link('service','Explore '+shortNames[i].toLowerCase(),{service:s.slug})}</div>${s.slug==='360-walkthroughs'?panoramaPlate():`<figure>${photo(s.image,s.alt)}<figcaption>Illustrative perspective / ${s.number}</figcaption></figure>`}</div></details>`).join('')}</div></section>`;
}

function journalSection(all=false) {
  return `<section class="journal-section section-space">${label('04','FIELD NOTES')}<div class="section-heading"><h2>A little more<br>perspective.</h2>${!all?link('journal','Explore the journal'): '<p>Ideas on capturing, understanding<br>and telling the story of a changing site.</p>'}</div><div class="journal-grid">${articles.slice(0,all?3:2).map((a,i)=>`<a class="journal-item" href="${url('article',{article:a.slug})}"><figure>${photo(a.image,a.title)}<figcaption><span>${a.category}</span><span>${a.minutes} read</span></figcaption></figure><h3>${a.title} ${arrow}</h3><p>${a.summary}</p></a>`).join('')}</div></section>`;
}

function philosophy() {
  return `<section class="philosophy section-space">${label(variant==='gallery'?'01':'02','A CLEARER UNDERSTANDING')}<div class="philosophy-layout"><div><h2>The site changes.<br>The bigger picture<br>should stay clear.</h2>${link('about','Get to know Orbit')}</div><div class="philosophy-right"><p class="lead">We help you see what's happening, understand what matters and share it with the people who need to know.</p><p>Aerial documentation. Spatial intelligence. Visual storytelling. Connected perspectives that give your team a useful record of the places taking shape.</p><figure>${photo('drone-operator.jpg','Close view of a drone controller during an outdoor capture session')}<figcaption>From a considered capture to a useful perspective.</figcaption></figure></div></div></section>`;
}

function home() {
  const titles={atlas:'<span>Your entire site.</span><span>In perspective.</span>',gallery:'A clearer view<br>of what comes next<span>.</span>',fieldwork:'See the<br>bigger picture<span>.</span>'};
  const top=variant==='gallery'?'<span>AERIAL DOCUMENTATION & SPATIAL INTELLIGENCE</span>':'<span>CLARITY FROM ABOVE</span><span>KUWAIT / EVERY PERSPECTIVE</span>';
  return `<section class="home-hero"><div class="hero-kicker micro">${top}</div><div class="hero-title"><h1>${titles[variant]}</h1><div class="hero-intro"><p>Aerial capture, spatial intelligence<br>and visual storytelling for the built world.</p>${link('services','Explore our perspectives')}</div></div><div class="hero-spatial"><div class="hero-index"><span class="micro">FIVE PERSPECTIVES</span>${services.map((s,i)=>`<a href="${url('service',{service:s.slug})}"><span>${s.number}</span>${shortNames[i]}</a>`).join('')}<p>From first groundworks.<br>To a lasting record.</p></div>${spatialPlate()}</div><div class="hero-bottom"><span>CAPTURE → UNDERSTAND → SHARE</span><a href="#services">Explore below ↓</a></div></section>${variant==='atlas'?customersSection():''}${variant==='gallery'?philosophy()+serviceIndex():serviceIndex()+philosophy()}${processSection()}${journalSection()}${cta()}`;
}

function customersSection() {
  // Keep fine emblem details as transparent cutouts in the white presentation.
  const monochromeFilters = `<svg class="customer-logo-filters" aria-hidden="true" width="0" height="0" xmlns="http://www.w3.org/2000/svg"><defs>
    <filter id="customer-ugcc-white" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
      <feColorMatrix in="SourceGraphic" type="luminanceToAlpha"/>
      <feComponentTransfer><feFuncA type="linear" slope="4" intercept="-2"/></feComponentTransfer>
      <feComposite in2="SourceAlpha" operator="in" result="detail"/>
      <feFlood flood-color="white"/><feComposite in2="detail" operator="in"/>
    </filter>
    <filter id="customer-future-kid-white" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
      <feColorMatrix in="SourceGraphic" type="luminanceToAlpha"/>
      <feComponentTransfer><feFuncA type="linear" slope="-3" intercept="1.8"/></feComponentTransfer>
      <feComposite in2="SourceAlpha" operator="in" result="detail"/>
      <feFlood flood-color="white" result="white"/>
      <feComposite in2="detail" operator="in" result="emblem"/>
      <feFlood x="0" y="0" width="26%" height="100%" flood-color="white" result="emblem-region"/>
      <feComposite in="emblem" in2="emblem-region" operator="in" result="white-emblem"/>
      <feComposite in="SourceAlpha" in2="emblem-region" operator="out" result="wordmark"/>
      <feComposite in="white" in2="wordmark" operator="in" result="white-wordmark"/>
      <feMerge><feMergeNode in="white-emblem"/><feMergeNode in="white-wordmark"/></feMerge>
    </filter>
  </defs></svg>`;
  const customers=[
    ['sinohydro','Sinohydro','sinohydro.webp',700,148],
    ['ugcc','UGCC — United Gulf Construction Company','ugcc.webp',700,149],
    ['bay-zero','Bay Zero','bay-zero.webp',440,306],
    ['future-kid','Future Kid','future-kid-white.svg',203,48],
  ];
  return `<section class="customers-section" id="customers" aria-labelledby="customers-heading">${monochromeFilters}<div class="customers-heading"><span class="micro">IN GOOD COMPANY</span><h2 id="customers-heading">Our customers.</h2></div><ul class="customer-logos" aria-label="Orbit Aerials customers">${customers.map(([key,name,file,width,height])=>`<li class="customer-logo customer-logo--${key}"><img src="/brand/customers/${file}" alt="${name}" width="${width}" height="${height}" loading="lazy" decoding="async"></li>`).join('')}</ul></section>`;
}

function pageHeading(kicker,title,desc) {
  return `<section class="page-heading">${label('ORBIT',kicker)}<div class="page-heading-inner"><h1>${title}</h1><p>${desc}</p></div></section>`;
}

function servicesPage() {
  return `${pageHeading('SERVICES','Your project.<br><span>Every perspective.</span>','A connected view of your project, from the earliest activity to the final handover.')}<section class="services-intro"><figure>${photo('progress-aerial.webp','Top-down drone photograph of cranes and concrete structures across a large construction site', '', true)}<figcaption><span>A change in viewpoint changes what you see.</span><span>Illustrative imagery</span></figcaption></figure><div class="services-intro-copy"><span class="micro">BUILT AROUND YOUR PROJECT</span><h2>Start with what<br>you need to see.</h2><p>A regular progress record. A spatial understanding of the site. A story for the people beyond it. Each service starts with the questions your project needs answered.</p><nav aria-label="Service chapters">${services.map((s,i)=>`<a href="#${s.slug}"><span>${s.number}</span>${shortNames[i]} ↓</a>`).join('')}</nav></div></section><div class="service-chapters">${services.map((s,i)=>`<section class="service-chapter" id="${s.slug}"><div class="chapter-number">${s.number}</div><div class="chapter-main"><div class="chapter-title"><h2>${shortNames[i]}</h2><p>${s.short}</p></div><div class="chapter-detail">${s.slug==='360-walkthroughs'?panoramaPlate():`<figure>${photo(s.image,s.alt)}<figcaption>Illustrative imagery</figcaption></figure>`}<div><p class="lead">${s.description}</p><ul class="output-list">${s.deliverables.map(d=>`<li>${d}</li>`).join('')}</ul>${link('service','Explore this perspective',{service:s.slug})}</div></div></div></section>`).join('')}</div>${processSection()}${cta()}`;
}

function servicePage() {
  const index=services.indexOf(service), next=services[(index+1)%services.length];
  return `${pageHeading('SERVICE / '+service.number,service.title,service.description)}<div class="service-breadcrumb"><a href="${url('services')}">← All services</a><span>${shortNames[index]}</span></div>${service.slug==='spatial-mapping'?spatialPlate():service.slug==='360-walkthroughs'?panoramaPlate():`<figure class="wide-photo">${photo(service.image,service.alt,'',true)}<figcaption>Illustrative imagery</figcaption></figure>`}<section class="detail-intro section-space">${label('01','THE PERSPECTIVE')}<div><h2>${service.intro}</h2><p class="lead">${service.body}</p></div></section><section class="benefits section-space">${service.benefits.map(([title,body],i)=>`<div><span class="micro">0${i+1}</span><h3>${title}</h3><p>${body}</p></div>`).join('')}</section><section class="deliverables section-space">${label('02','WHAT YOU RECEIVE')}<div><h2>Made to be used.</h2><p>We agree the scope and formats around your team's intended use.</p><ul class="output-list">${service.deliverables.map(d=>`<li>${d}</li>`).join('')}</ul>${link('contact','Discuss your project',{interest:service.slug})}</div></section><section class="faq section-space">${label('03','USEFUL TO KNOW')}<div>${service.faq.map(([q,a])=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></section><section class="next-service"><span class="micro">ANOTHER PERSPECTIVE / ${next.number}</span>${link('service',next.name,{service:next.slug})}</section>${cta()}`;
}

function aboutPage() {
  return `${pageHeading('ABOUT ORBIT','A considered<br>point of view<span>.</span>','We bring aerial capture, spatial understanding and visual storytelling together to help people see their projects clearly.')}<section class="about-opening"><figure>${photo('architectural-detail.webp','Modern apartment architecture in Amsterdam at dusk','',true)}<figcaption><span>Perspective changes the conversation.</span><span>Illustrative imagery</span></figcaption></figure><div><span class="micro">BASED IN KUWAIT. FOCUSED ON YOUR SITE.</span><h2>Closer to the detail.<br>Clearer on the whole.</h2><p>Construction is a story told over time. Each visit, each viewpoint and each milestone reveals another part of it.</p><p>We help project teams create that record with purpose. Images that communicate. Spatial views that bring context. Films that give the finished project a lasting voice.</p>${link('services','Explore our approach')}</div></section><section class="manifesto section-space">${label('01','OUR POINT OF VIEW')}<h2>A good view is more<br>than something you see.<br><span>It's something you understand.</span></h2></section><section class="about-principles section-space"><div class="principles-photo"><figure>${photo('drone-operator.jpg','Drone controller used to plan an aerial perspective')}<figcaption>A considered perspective starts before the flight.</figcaption></figure></div><div>${[['Purpose before capture','We start with the people using the information and the questions they need answered. The project defines the perspective.'],['Consistency over time','A familiar viewpoint makes change easier to see. We plan around your programme and the milestones that matter.'],['Clarity in delivery','Useful media belongs in the hands of your team. We agree the formats and organisation that fit your workflow.']].map(([title,body],i)=>`<div class="principle"><span class="micro">0${i+1}</span><h3>${title}</h3><p>${body}</p></div>`).join('')}</div></section>${processSection()}<section class="location section-space">${label('04','WHERE WE BEGIN')}<div><h2>Kuwait<span>.</span></h2><p>Burj Al Tujjar · Kuwait City<br>Sunday–Thursday / 09:00–16:00</p>${link('contact','Start a conversation')}</div></section>${cta()}`;
}

function journalPage() {
  return `${pageHeading('THE ORBIT JOURNAL','Notes from<br>a different angle<span>.</span>','Ideas, observations and useful perspectives on recording a changing world.')}<section class="journal-feature"><a href="${url('article',{article:articles[0].slug})}"><figure>${photo(articles[0].image,articles[0].title,'',true)}<figcaption>FIELD NOTE 01 / PROJECT PLANNING</figcaption></figure></a><div><span class="micro">A CONSIDERED START</span><h2>${articles[0].title}</h2><p>${articles[0].summary}</p>${link('article','Read the field note',{article:articles[0].slug})}</div></section>${journalSection(true)}${cta()}`;
}

function articlePage() {
  return `<div class="article-progress" aria-hidden="true"></div>${pageHeading(article.category,article.title,article.summary)}<div class="article-meta"><a href="${url('journal')}">← All field notes</a><span>${article.minutes} read / Orbit Journal</span></div><figure class="wide-photo article-photo">${photo(article.image,article.title,'',true)}<figcaption>Illustrative imagery</figcaption></figure><div class="article-body"><aside><span class="micro">IN THIS FIELD NOTE</span>${article.sections.map(([title],i)=>`<a href="#note-${i}">${String(i+1).padStart(2,'0')} / ${title}</a>`).join('')}</aside><article>${article.sections.map(([title,body],i)=>`<section id="note-${i}"><span class="micro">0${i+1}</span><h2>${title}</h2><p>${body}</p></section>`).join('')}</article></div>${cta()}`;
}

function contactPage() {
  return `${pageHeading('A NEW PERSPECTIVE','What are<br>you building<span>?</span>','A place to document. A milestone to capture. A new perspective to explore. Tell us where you are in the journey.')}<section class="contact-layout"><div class="contact-information"><span class="micro">LET'S TALK</span><a class="contact-email" href="mailto:info@orbitaerials.com">info@orbitaerials.com ${arrow}</a><a class="contact-phone" href="tel:+96599111397">+965 991 11 397</a><div class="contact-location"><span class="micro">COME FIND US</span><p>Burj Al Tujjar<br>13 Abdulaziz Hamad Al Saqer St<br>Kuwait City 22233, Kuwait</p><a class="text-link" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=Burj+Al+Tujjar+Kuwait+City">Open in Maps ${arrow}</a></div><div class="contact-location"><span class="micro">OFFICE HOURS</span><p>Sunday–Thursday<br>09:00–16:00</p></div><img class="contact-symbol" src="/brand/orbit-symbol.svg" alt="" width="190" height="190"></div><div class="form-area"><h2>A few details.<br>A good beginning.</h2><p>Prepare your brief here, then send it through your email app.</p><form id="enquiry"><div class="form-row"><label>Your name <span>*</span><input name="name" autocomplete="name" maxlength="100" required placeholder="Full name"></label><label>Work email <span>*</span><input name="email" type="email" autocomplete="email" maxlength="180" required placeholder="you@company.com"></label></div><label>Company<input name="company" autocomplete="organization" maxlength="160" placeholder="Company or organisation"></label><label>Your perspective<select name="service"><option>Help me choose</option>${services.map(s=>`<option ${s.slug===params.get('interest')?'selected':''}>${s.name}</option>`).join('')}</select></label><label>A little about your project <span>*</span><textarea name="message" minlength="10" maxlength="2500" rows="4" required placeholder="Site location, project stage and what you would like to capture…"></textarea></label><div class="form-bottom"><p>Your brief stays here until you choose to send it.<br><a href="${url('privacy')}">Privacy policy</a></p><button class="solid-button" type="submit">Prepare enquiry ${arrow}</button></div></form><section class="brief-review" hidden aria-labelledby="brief-heading"><h3 id="brief-heading" tabindex="-1">Your brief is ready.</h3><p>Review the details, then open your email app to send them. Nothing has been sent yet.</p><pre id="brief-text"></pre><a class="solid-button" id="email-brief" href="mailto:info@orbitaerials.com">Open email app ${arrow}</a></section></div></section>`;
}

const renderers={home,services:servicesPage,service:servicePage,about:aboutPage,journal:journalPage,article:articlePage,contact:contactPage,privacy:()=>`${pageHeading('YOUR INFORMATION','Privacy policy<span>.</span>','Our commitment to protecting your information.')}<div class="privacy-copy">${privacy}</div>`};
document.body.className=`theme-${variant} page-${page} ${isStudy?'design-study':'main-site'}`;
document.title=`${page==='service'?service.name:page==='article'?article.title:pageNames[page]} · Orbit Aerials${isStudy?' / '+variants[variant][1]:''}`;
document.querySelector('#app').innerHTML=`<div id="top"></div>${header()}<div class="site-body"><main id="main">${renderers[page]()}</main>${footer()}</div>${isStudy?reviewBar():''}`;
document.querySelector('#site-nav').insertAdjacentHTML('afterend','<button class="mode-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode" aria-pressed="false">Dark mode</button>');
initThemeControls();

if(variant==='atlas')import('./atlas-orbi.js').then(({mountAtlasOrbi})=>mountAtlasOrbi({
  isStudy,
  resolveHref(href){
    const target=new URL(href,location.origin);
    const [section,slug]=target.pathname.split('/').filter(Boolean);
    const extras=Object.fromEntries(target.searchParams);
    const destination=section==='services'&&slug?'service':section==='journal'&&slug?'article':section||'home';
    if(destination==='service')extras.service=slug;
    if(destination==='article')extras.article=slug;
    const resolved=new URL(url(destination,extras),location.href);
    return resolved.pathname+resolved.search+target.hash;
  },
}));

if(document.querySelector('.panorama-plate'))import('../../src/panorama.js').then(({initPanoramas})=>initPanoramas());

const menu=document.querySelector('.menu-toggle'), nav=document.querySelector('#site-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav.classList.toggle('is-open',!open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});

const form=document.querySelector('#enquiry');
form?.addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(form);
  const brief=`Project enquiry — Orbit Aerials\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company')||'—'}\nService: ${data.get('service')}\n\n${data.get('message')}`;
  document.querySelector('#brief-text').textContent=brief;
  document.querySelector('#email-brief').href=`mailto:info@orbitaerials.com?subject=${encodeURIComponent('Project enquiry — '+data.get('service'))}&body=${encodeURIComponent(brief)}`;
  document.querySelector('.brief-review').hidden=false;document.querySelector('#brief-heading').focus();
});

if(page==='article') {
  const progress=document.querySelector('.article-progress');
  const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;};
  addEventListener('scroll',update,{passive:true});update();
}

const view=document.querySelector('.model-view');
if(view) {
  const status=document.querySelector('.model-loading'), modes=[...document.querySelectorAll('.view-modes [data-mode]')], slider=document.querySelector('#reveal');
  const rotation=document.querySelector('.rotation-toggle');
  modes.forEach(button=>button.disabled=true);slider.disabled=true;document.querySelector('.reset-view').disabled=true;rotation.disabled=true;
  const fail=()=>{status.textContent='The interactive view is unavailable. Explore our spatial mapping service below.';view.classList.add('model-fallback');};
  try {
    const {createViewer}=await import('../../src/viewer.js');
    const viewer=await createViewer(view,{autoRotate:true,onAutoRotateChange:enabled=>{rotation.textContent=enabled?'Pause rotation':'Start rotation';rotation.setAttribute('aria-pressed',String(enabled));},onReady:()=>{status.hidden=true;},onError:fail,onProgress:text=>status.textContent=text});
    if(viewer) {
      viewer.setMode('points');viewer.setReveal(38);
      rotation.disabled=matchMedia('(prefers-reduced-motion: reduce)').matches;
      rotation.addEventListener('click',()=>viewer.setAutoRotate(!viewer.getAutoRotate()));
      const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
      motionPreference.addEventListener('change',event=>{rotation.disabled=event.matches;});
      modes.forEach(button=>{button.disabled=false;button.addEventListener('click',()=>{modes.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));viewer.setMode(button.dataset.mode);viewer.setReveal(100);slider.value=100;slider.disabled=button.dataset.mode==='photo';document.querySelector('#layer-label').textContent=button.dataset.mode==='dsm'?'SURFACE MODEL':button.dataset.mode==='photo'?'PHOTOGRAPH':'POINT CLOUD';});});
      slider.disabled=false;slider.addEventListener('input',()=>viewer.setReveal(slider.value));
      const reset=document.querySelector('.reset-view');reset.disabled=false;reset.addEventListener('click',()=>viewer.reset());
      const canvas=view.querySelector('canvas');
      if(canvas){canvas.tabIndex=0;canvas.setAttribute('aria-label','Interactive site model. Drag to orbit. Arrow keys rotate and zoom; Home resets the view.');canvas.addEventListener('keydown',event=>{const action={ArrowLeft:()=>viewer.rotate(-1),ArrowRight:()=>viewer.rotate(1),ArrowUp:()=>viewer.zoom(1.12),ArrowDown:()=>viewer.zoom(1/1.12),Home:()=>viewer.reset()}[event.key];if(action){event.preventDefault();action();}});}
      addEventListener('pagehide',event=>{if(!event.persisted)viewer.destroy();});
    }
  } catch {fail();}
}

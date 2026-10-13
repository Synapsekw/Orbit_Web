import { services, articles } from '../src/content.js';

const arrow = '<span aria-hidden="true">↗</span>';
const tag = t => `<span class="eyebrow">${t}</span>`;
const link = (href,t,cls='text-link') => `<a class="${cls}" href="${href}">${t}${arrow}</a>`;
const photo = (name,alt,cls='',priority=false) => `<img src="/images/${name}" alt="${alt}" width="1800" height="1013" class="${cls}" ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
const heading = (small,big) => `<div>${tag(small)}<h2>${big}</h2></div>`;

function about() {
  return `<section class="identity-hero wrap">
    <div class="identity-copy">${tag('ABOUT ORBIT / A DIFFERENT PERSPECTIVE')}<h1>A different<br>point of <span>view.</span></h1><p>We bring aerial technology and human understanding together. So you can see what matters.</p><a class="chapter-link" href="#our-perspective"><span class="round-down" aria-hidden="true">↓</span>Get to know Orbit</a></div>
    <div class="identity-object"><div class="object-coordinate object-coordinate-top"><span>ORBIT / THE CONNECTED VIEW</span><span>01—06</span></div><div id="brand-sculpture" role="img" aria-label="Interactive three-dimensional sculpture of Orbit’s original symbol. Drag to rotate, or use the view controls."><img class="sculpture-fallback" src="/brand/orbit-symbol.svg" width="1200" height="1200" alt=""></div><div class="object-coordinate object-coordinate-bottom"><span>ONE MARK. MANY PERSPECTIVES.</span><span>DRAG TO EXPLORE</span></div><div class="sculpture-controls" role="group" aria-label="Explore the Orbit symbol"><button type="button" data-sculpture="solid" aria-pressed="true">Sculpture</button><button type="button" data-sculpture="points" aria-pressed="false">Points</button><button type="button" data-sculpture="wire" aria-pressed="false">Structure</button><button type="button" id="reset-sculpture" aria-label="Reset sculpture view">↺</button></div></div>
    <div class="identity-foot"><span>BASED IN KUWAIT</span><span>AERIAL EXPERTISE. HUMAN JUDGEMENT.</span><a href="#our-people">Meet the disciplines <span aria-hidden="true">↓</span></a></div>
  </section>
  <section id="our-perspective" class="manifesto wrap"><div class="section-index"><span>01 / OUR PERSPECTIVE</span><span>THE REASON WE FLY</span></div><h2>A site is always changing.<br><span>Understanding it<br>changes everything.</span></h2><div class="manifesto-bottom"><span class="large-asterisk" aria-hidden="true">↗</span><div><p>Orbit began in Kuwait with a clear purpose: to transform how construction projects are documented, understood, and shared.</p><p>We look at the whole picture—the site, the people, the decisions ahead. Then we turn captured detail into something your team can use.</p></div></div></section>
  <section class="field-story"><div class="field-story-image">${photo('construction-aerial.jpg','An overhead view of a construction site and its foundations')}<span class="image-reference">PERSPECTIVE / FROM ABOVE</span><div class="focus-brackets" aria-hidden="true"></div></div><div class="field-story-note"><span>THE WORK BEHIND THE VIEW</span><h2>Technology<br>with a human<br>perspective.</h2><p>The right viewpoint starts with the right questions. Our work brings capture, analysis, and storytelling into the same conversation.</p><span class="field-number" aria-hidden="true">O/</span></div></section>
  <section id="our-people" class="people-experience wrap section-space"><div class="section-heading">${heading('02 / CONNECTED EXPERTISE','Different skills.<br>One clear view.')}<p>Explore the disciplines<br>behind the perspective.</p></div><div class="discipline-layout"><figure class="discipline-image" data-depth-card>${photo('drone-operator.jpg','A drone operator reviewing a site on a controller','',true)}<figcaption><span id="discipline-image-label">IN THE FIELD</span><span>ORBIT / 01</span></figcaption></figure><div class="discipline-accordions">${[
      ['Drone operators','In the field','drone-operator.jpg','Careful flight planning, coordinated site access, and consistent aerial capture. The people connecting your project to a wider view.'],
      ['Data analysts','In the detail','site-detail.jpg','Organizing captured information and interpreting spatial detail. Turning a complex set of images into a clearer conversation.'],
      ['Media specialists','In the story','site-overview.jpg','Finding the frames, sequences, and visual rhythm that help others understand the achievement behind your project.'],
      ['Consultants','In the conversation','construction-aerial.jpg','Starting with your objectives, your workflow, and the decisions you need to make. Connecting the output to its purpose.'],
    ].map(([h,label,img,p],i)=>`<details ${i===0?'open':''} name="disciplines" data-discipline="${i}" data-image="${img}" data-label="${label.toUpperCase()}"><summary><span>0${i+1}</span><h3>${h}</h3><span aria-hidden="true">+</span></summary><p>${p}</p></details>`).join('')}</div></div></section>
  <section class="origin-strip wrap"><span class="origin-word">Kuwait.</span><div>${tag('OUR STARTING POINT')}<p>Regional understanding.<br>A wider perspective.</p>${link('/contact/','Let’s start a conversation')}</div></section>`;
}

function serviceExplorer() {
  return `<section class="service-experience wrap"><div class="service-experience-heading">${tag('OUR CAPABILITIES / FIND YOUR PERSPECTIVE')}<h1>What do you<br>want to <span>see?</span></h1><p>Choose a perspective.<br>See what it can bring to your project.</p></div><div class="service-explorer"><div class="service-selector" role="group" aria-label="Explore services">${services.map((s,i)=>`<button type="button" data-service-choice="${i}" aria-pressed="${i===0}" aria-controls="service-view-${i}"><span>${s.number}</span><span>${['Track the progress','Understand the site','Step inside','See the transformation','Show the achievement'][i]}</span><span aria-hidden="true">↗</span></button>`).join('')}<div class="service-selector-note"><span class="small-cross" aria-hidden="true">+</span><p>One site.<br>Many ways to see it.</p></div></div><div class="service-display">${services.map((s,i)=>`<section class="service-display-panel" id="service-view-${i}" ${i?'hidden':''} aria-label="${s.name}"><div class="service-image-stage" data-depth-card>${photo(s.image,s.alt,'',i===0)}<div class="capture-grid" aria-hidden="true"></div><div class="capture-frame" aria-hidden="true"></div><div class="service-image-meta"><span>ORBIT / ${s.number}</span><span>${s.tags[0].toUpperCase()}</span></div><button class="focus-view" type="button" aria-pressed="false"><span aria-hidden="true">+</span> Take a closer look</button><span class="image-disclaimer">Illustrative imagery</span></div><div class="service-view-caption"><div><span class="service-big-number" aria-hidden="true">${s.number}</span><h2>${s.name}</h2><p>${s.description}</p></div>${link('/services/'+s.slug+'/','Explore this service','round-link')}</div></section>`).join('')}</div></div><div class="experience-baseline"><span>CAPTURE → UNDERSTAND → COMMUNICATE</span><a href="#capture-journey">The journey from here <span aria-hidden="true">↓</span></a></div></section>`;
}

function spatialServicePreview(body) {
  const stage=`<div class="service-image-stage live-service-stage"><div class="service-image-meta"><span>ORBIT / 02</span><span>EXPLORE THE CAPTURED SITE</span></div><div id="service-preview-model" role="img" aria-label="Interactive construction sample. Drag to rotate the captured site."><p class="preview-model-status" role="status">Loading the captured site…</p></div><div class="preview-model-controls" role="group" aria-label="Explore the sample representations"><button type="button" data-preview-mode="photo" aria-pressed="true">Photo</button><button type="button" data-preview-mode="points" aria-pressed="false">Points</button><button type="button" data-preview-mode="dsm" aria-pressed="false">DSM</button><button type="button" id="preview-model-reset" aria-label="Reset sample view">↺</button></div><span class="image-disclaimer">Drag to orbit</span></div>`;
  const start=body.indexOf('<div class="service-image-stage"',body.indexOf('id="service-view-1"'));
  const end=body.indexOf('<div class="service-view-caption">',start);
  body=body.slice(0,start)+stage+body.slice(end);
  const marker='<h2>Spatial mapping & intelligence</h2>';
  body=body.replace(marker,marker+'<p class="preview-credit">Sample: <a href="https://sketchfab.com/3d-models/9f5edb6287284b9885fc833982d11962">Sircher</a> / <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, via Objaverse. Simplified; derived points and DSM. Not an Orbit project.</p>');
  return body;
}

function journey() {
  return `<section class="capture-journey wrap" id="capture-journey"><div class="section-heading">${heading('A CONNECTED PROCESS','A flight is just<br>the beginning.')}<p>From a question on site<br>to a clearer view for your team.</p></div><div class="journey-track">${[
    ['01','The question','Plan & schedule','Your site, your milestones, and the decisions you need to support.'],
    ['02','The perspective','Capture & document','Consistent aerial and ground imagery, gathered around the way your site works.'],
    ['03','The understanding','Process & interpret','Spatial outputs, organized records, and visual stories that reveal the detail.'],
    ['04','The conversation','Deliver & share','Useful material in the hands of the people who need to see it.'],
  ].map(([n,label,h,p])=>`<article><span class="journey-dot" aria-hidden="true"></span><span class="journey-number">${n}</span><span class="eyebrow">${label.toUpperCase()}</span><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></section>`;
}

function journal(body) {
  const a=articles[0];
  const masthead=`<section class="journal-masthead wrap"><div class="journal-kicker"><span>IDEAS / OBSERVATIONS / PERSPECTIVES</span><span>AN ORBIT PUBLICATION</span></div><h1>The Orbit<span>Journal<span class="journal-dot">.</span></span></h1><div class="journal-masthead-bottom"><p>A wider view of the work.<br>A closer look at what matters.</p><a href="#field-notes">Explore the field notes <span aria-hidden="true">↓</span></a></div></section><section class="featured-note wrap"><a href="/journal/${a.slug}/"><div class="featured-image">${photo(a.image,a.title,'',true)}<span>THE FEATURED PERSPECTIVE</span><span class="featured-arrow" aria-hidden="true">↗</span></div><div class="featured-copy">${tag('01 / '+a.category.toUpperCase())}<h2>${a.title}</h2><p>${a.summary}</p><span class="text-link">Read the field note ${arrow}</span></div></a></section>`;
  return body.replace(/^<section class="page-intro wrap">[\s\S]*?<\/section>/,masthead).replace('<section class="journal-listing wrap">','<section id="field-notes" class="journal-listing journal-archive wrap"><div class="archive-heading"><h2>Field notes.</h2><span>THE COLLECTION / 01—03</span></div>');
}

function detail(body,s) {
  const hero=`<section class="service-cinema service-${s.slug}"><div class="cinema-backdrop">${photo(s.image,s.alt,'',true)}<div class="cinema-grid" aria-hidden="true"></div></div><div class="cinema-heading wrap"><a class="cinema-back" href="/services/">← All perspectives</a><span class="cinema-index" aria-hidden="true">${s.number}</span><div class="cinema-copy">${tag('ORBIT / '+s.name.toUpperCase())}<h1>${s.title}</h1><p>${s.description}</p>${link('/contact/?service='+s.slug,'Discuss this perspective','button-link')}</div><div class="cinema-bottom"><span>ILLUSTRATIVE IMAGERY</span><a href="#service-perspective">Discover what’s possible <span aria-hidden="true">↓</span></a><span>CAPABILITY ${s.number} / 05</span></div></div></section><nav class="chapter-nav wrap" aria-label="On this service page"><a href="#service-perspective"><span>01</span> The perspective</a><a href="#service-output"><span>02</span> The output</a><a href="#service-details"><span>03</span> The details</a></nav>`;
  body=body.replace(/^[\s\S]*?<\/figure>/,hero)
    .replace('<section class="split-section section-space wrap">','<section id="service-perspective" class="split-section section-space wrap">')
    .replace('<section class="deliverables-section">','<section id="service-output" class="deliverables-section">')
    .replace('<section class="faq-section section-space wrap">','<section id="service-details" class="faq-section section-space wrap">');
  if(s.slug==='spatial-mapping') body=body.replace(/<section class="explorer-invitation wrap">[\s\S]*?<\/section>/,`<section class="inline-spatial wrap"><div class="inline-spatial-heading">${heading('TRY A DIFFERENT LAYER','Understanding has layers.')}<div class="inline-modes" role="group" aria-label="Spatial model representation"><button type="button" data-inline-mode="photo" aria-pressed="true">Photogrammetry</button><button type="button" data-inline-mode="points" aria-pressed="false">Point cloud</button><button type="button" data-inline-mode="dsm" aria-pressed="false">DSM</button></div></div><div class="inline-viewer" id="service-spatial-model" role="img" aria-label="Interactive stadium construction sample. Drag to orbit."><p class="inline-viewer-status" role="status">Loading a new perspective…</p></div><div class="inline-spatial-footer"><span>DRAG TO ORBIT / SCROLL TO ZOOM</span><button type="button" id="inline-reset">Reset view ↺</button></div><p class="inline-credit">Sample scan by <a href="https://sketchfab.com/3d-models/9f5edb6287284b9885fc833982d11962">Sircher</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, via Objaverse. Simplified; point cloud and DSM derived from the mesh. Not an Orbit project or survey deliverable.</p></section>`);
  return body;
}

function contact(body) {
  const intro=`<section class="contact-opening wrap"><div class="contact-opening-top">${tag('A NEW PERSPECTIVE STARTS HERE')}<span class="kuwait-clock">KUWAIT CITY <time data-kuwait-time>UTC +03:00</time></span></div><h1>Let’s see<br><span>what’s possible.</span><span class="contact-star" aria-hidden="true">↗</span></h1><div class="intent-heading"><p>Where would you like to begin?</p><span>CHOOSE YOUR PERSPECTIVE</span></div><div class="intent-selector" role="group" aria-label="Choose your project goal">${[['progress-documentation','Track my progress'],['spatial-mapping','Understand my site'],['handover-media','Show my project'],['','Help me decide']].map(([slug,t],i)=>`<button type="button" data-intent="${slug}" aria-pressed="${i===3}"><span>0${i+1}</span>${t}<span aria-hidden="true">↗</span></button>`).join('')}</div></section>`;
  return body.replace(/^<section class="page-intro wrap">[\s\S]*?<\/section>/,intro)
    .replace('<div class="enquiry-panel"><h2>', '<div class="enquiry-panel"><div class="brief-heading"><span>YOUR PROJECT BRIEF</span><span id="brief-progress">0 / 3 ESSENTIALS</span></div><h2>')
    .replace('<div class="contact-details">','<div class="contact-details"><div class="contact-orbit-mark" aria-hidden="true"><img src="/brand/orbit-symbol.svg" alt=""><span>LET’S CONNECT</span></div>');
}

export function enhancePage(path,body) {
  if(path==='/about/') return about()+body.slice(body.indexOf('<section class="closing-cta'));
  if(path==='/services/') return spatialServicePreview(serviceExplorer())+journey()+body.slice(body.indexOf('<section class="closing-cta'));
  if(path==='/journal/') return journal(body);
  const s=services.find(s=>path===`/services/${s.slug}/`);
  if(s) return detail(body,s);
  if(path==='/contact/') return contact(body);
  if(path.startsWith('/journal/')&&path!=='/journal/'){
    body=body.replace('<article class="editorial-article">','<div class="reading-progress" aria-hidden="true"><div></div></div><article class="editorial-article">');
    body=body.replace(/<div class="article-body">/, '<div class="article-body"><div class="reading-label">FIELD NOTES / TAKE A CLOSER LOOK</div>');
    return body;
  }
  return body;
}

import {arrowIcon} from '../ui/icons.js';
import { createOrbiAvatar } from './orbi-avatar.js';
import {resolveOrbiMotion} from './orbi-motion.js';
import { guideReply, normalizeAnswer, safeLink } from './orbi-guide.js';
import styles from './orbi.css?inline';
import {createContactFlow} from './orbi-contact.js';
import {technicalSources} from './orbi-sources.js';

let nextId = 0;

/** The default is an offline, prepared service guide. Supply respond for a server-backed assistant. */
export function mountOrbiWidget(options = {}) {
  const { container = document.body, routes = {}, resolveHref = href => href, transport, respond = transport?.respond, motion = true, assetBase = '/orbi/', requestTimeout = 35000, renderMode = 'auto' } = options;
  const host = document.createElement('div'); host.className = 'orbi-widget-host';
  const shadow = host.attachShadow({mode:'open'}), style = document.createElement('style'); style.textContent = styles;
  const id = `orbi-${++nextId}`, shell = document.createElement('div'); shell.className = 'orbi-widget';
  // Only fixed authored markup is used here; messages, config values and replies use textContent.
  shell.innerHTML = `
    <button class="orbi-launcher" type="button" aria-expanded="false" aria-controls="${id}-panel" aria-label="Open Orbi, your Orbit guide">
      <span class="orbi-launcher__avatar"></span><span class="orbi-launcher__label">Ask Orbi<span>Your Orbit guide</span></span>
    </button>
    <dialog class="orbi-panel" id="${id}-panel" aria-labelledby="${id}-title">
      <header class="orbi-panel__header">
        <span class="orbi-panel__avatar"></span>
        <div><h2 id="${id}-title">Orbi</h2><p>Your Orbit guide</p></div>
        <button class="orbi-icon-button orbi-motion-toggle" type="button" aria-label="Pause Orbi animation" aria-pressed="false" title="Pause animation">Ⅱ</button>
        <button class="orbi-icon-button orbi-close" type="button" aria-label="Close Orbi" title="Close">×</button>
      </header>
      <div class="orbi-scroll">
        <section class="orbi-welcome">
          <span class="orbi-eyebrow">A little perspective.</span>
          <h3>What would you<br>like to capture?</h3>
          <p>I can help you explore Orbit’s services and find a good place to start.</p>
          <div class="orbi-prompts">
            <button type="button" data-prompt="I need to document construction progress">Follow a project’s progress <span>${arrowIcon()}</span></button>
            <button type="button" data-prompt="Tell me about spatial mapping">Explore a site in 3D <span>${arrowIcon()}</span></button>
            <button type="button" data-prompt="I need a 360 walkthrough">Look inside a space <span>${arrowIcon()}</span></button>
          </div>
          <a class="orbi-contact" href="/contact/">Talk to the team <span>${arrowIcon()}</span></a>
        </section>
        <div class="orbi-messages" role="log" aria-label="Conversation with Orbi" aria-live="polite" aria-relevant="additions text"></div>
        <p class="orbi-thinking" role="status" hidden>Orbi is thinking<span aria-hidden="true">…</span></p>
        <div class="orbi-notice" role="alert" hidden><p></p><button type="button">Try again</button></div>
      </div>
      <footer class="orbi-panel__footer">
        <div class="orbi-toolbar"><span class="orbi-mode"></span><button class="orbi-reset" type="button" hidden>New conversation</button></div>
        <form class="orbi-form">
          <label class="orbi-sr-only" for="${id}-input">Ask Orbi</label>
          <textarea id="${id}-input" name="message" rows="1" maxlength="1000" placeholder="Ask Orbi…" required></textarea>
          <button type="submit" aria-label="Send message" disabled>${arrowIcon('up')}</button>
        </form>
        <p class="orbi-disclosure"></p>
      </footer>
    </dialog>`;
  shadow.append(style,shell); container.append(host);
  const $ = selector => shadow.querySelector(selector);
  const launcher = $('.orbi-launcher'), panel = $('.orbi-panel'), input = $('textarea'), form = $('form'), send = form.querySelector('button');
  const welcome = $('.orbi-welcome'), messages = $('.orbi-messages'), scroll = $('.orbi-scroll'), thinking = $('.orbi-thinking'), notice = $('.orbi-notice'), reset = $('.orbi-reset');
  const motionToggle = $('.orbi-motion-toggle'), media = matchMedia('(max-width: 620px)'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let destroyed = false, opened = false, busy = false, motionEnabled = !!motion, motionAllowed = options.motionAllowed !== false, generation = 0, controller, timeout, headerAvatar, lastFocus, history = [], pending;
  let locked = false, previousOverflow, previousPriority, connected = !transport, connecting = false, contactBusy = false, callbacks = false;
  const cleanup = [];
  const on = (target,event,fn) => { target.addEventListener(event,fn); cleanup.push(()=>target.removeEventListener(event,fn)); };
  const avatarOptions = {compact:true, interactive:true, motion:motionEnabled && motionAllowed, fallbackUrl:assetBase+'orbi-icon.webp', renderMode};
  const launcherAvatar = createOrbiAvatar($('.orbi-launcher__avatar'),{...avatarOptions,playful:true,interactive:false});
  let launcherHovered = false, launcherFocused = false;
  const holdLauncher = () => launcherAvatar.setHeld(launcherHovered || launcherFocused);
  on(launcher,'pointerenter',event=>{if(event.pointerType !== 'touch'){launcherHovered=true;holdLauncher();}});
  on(launcher,'pointerleave',()=>{launcherHovered=false;holdLauncher();});
  on(launcher,'focus',()=>{launcherFocused=true;holdLauncher();});
  on(launcher,'blur',()=>{launcherFocused=false;holdLauncher();});
  const live = typeof respond === 'function';
  $('.orbi-mode').textContent = live ? 'AI assistant' : 'Local service guide';
  $('.orbi-disclosure').textContent = live
    ? (options.disclosure || 'AI can make mistakes. Messages are sent to the configured service.')
    : 'Prepared guidance. Messages stay in this page and are not sent.';
  const mapped = href => { try { return safeLink(resolveHref(href)); } catch { return null; } };
  $('.orbi-contact').href = mapped(safeLink(routes.contact) || '/contact/') || '/contact/';
  const contact=transport?createContactFlow({scroller:scroll,request:transport.request,setBusy(value){contactBusy=value;syncControls();},onChange(){syncControls();}}):null;
  const contactButton=document.createElement('button');contactButton.type='button';contactButton.className='orbi-reset';contactButton.textContent='Contact the team';contactButton.hidden=true;$('.orbi-toolbar').append(contactButton);
  on(contactButton,'click',()=>{if(!busy)contact?.open();});
  on($('.orbi-contact'),'click',e=>{if(callbacks&&connected){e.preventDefault();e.stopPropagation();contact.open();}});
  function connectionNotice(text){notice.querySelector('p').textContent=text;notice.querySelector('button').textContent='Reconnect';notice.hidden=false;}
  async function connect(){
    if(!transport||connecting||destroyed)return;
    connecting=true;connected=false;$('.orbi-mode').textContent='Connecting…';syncControls();
    const turn=++generation;
    try{
      const status=await transport.connect();if(destroyed||turn!==generation)return;
      connected=status.mode==='live';callbacks=connected&&status.callbacks_enabled===true;contact.setReady(callbacks);
      $('.orbi-mode').textContent=connected?'AI assistant':'Not connected';
      $('.orbi-disclosure').textContent=connected?'Messages are processed by OpenAI. AI can make mistakes. Contact details are shared only after you review and send.':'AI chat is not connected yet. Contact the team through the website.';
      if(status.test_mode){$('.orbi-mode').textContent='Local test';$('.orbi-disclosure').textContent='Simulated replies and receipts. No messages are sent to OpenAI or Grok.';}
      if(connected){
        history=[];messages.replaceChildren();pending=null;notice.hidden=true;
        for(const item of (status.history||[]).slice(-24))if(['user','assistant'].includes(item.role)&&typeof item.content==='string'){
          const answer=normalizeAnswer({reply:item.content,links:item.links});const article=append(item.role,answer.reply,answer.links);decorate(article,item);history.push({role:item.role,content:item.content});
        }
        welcome.hidden=history.length>0;contact.restore(status.callback_receipt);
      }else connectionNotice('Orbi’s AI connection is being prepared. You can still reach Orbit through the contact page.');
    }catch{if(!destroyed){$('.orbi-mode').textContent='Unavailable';connectionNotice('Orbi could not connect. Try reconnecting or contact the team directly.');}}
    finally{connecting=false;if(!destroyed)syncControls();}
  }
  function decorate(article,answer){
    if(!transport)return;
    for(const id of [...new Set(Array.isArray(answer.source_ids)?answer.source_ids:[])].slice(0,3)){
      const source=technicalSources[id];if(!source)continue;const a=document.createElement('a');a.textContent=source[0]+' ';a.insertAdjacentHTML('beforeend',arrowIcon());a.href=source[1];a.target='_blank';a.rel='noopener noreferrer';a.className='orbi-source';article.append(a);
    }
    if(callbacks)contact.offer(answer.contact_request,article);
  }

  function syncMotion() {
    const {active,locked,reason} = resolveOrbiMotion({enabled:motionEnabled,allowed:motionAllowed,reduced:reduced.matches});
    const paused = !active;
    launcherAvatar.setMotion(active); headerAvatar?.setMotion(active);
    motionToggle.textContent = paused ? '▷' : 'Ⅱ';
    motionToggle.setAttribute('aria-pressed',String(paused));
    motionToggle.setAttribute('aria-label',reason === 'device' ? 'Animation paused by reduced-motion preference' : reason === 'page' ? 'Animation paused by page motion setting' : paused ? 'Play Orbi animation' : 'Pause Orbi animation');
    motionToggle.title = reason === 'device' ? 'Your device prefers reduced motion' : reason === 'page' ? 'Resume motion using the page motion control' : paused ? 'Play animation' : 'Pause animation';
    motionToggle.disabled = locked;
  }
  function lockBody(value) {
    if (value && !locked) {
      previousOverflow = document.body.style.getPropertyValue('overflow'); previousPriority = document.body.style.getPropertyPriority('overflow');
      document.body.style.setProperty('overflow','hidden'); locked = true;
    } else if (!value && locked) {
      if (document.body.style.getPropertyValue('overflow') === 'hidden') {
        if (previousOverflow) document.body.style.setProperty('overflow',previousOverflow,previousPriority); else document.body.style.removeProperty('overflow');
      }
      locked = false;
    }
  }
  function showDialog() { if (media.matches) panel.showModal(); else panel.show(); lockBody(media.matches); }
  function open() {
    if (destroyed || opened) return;
    lastFocus = shadow.activeElement || document.activeElement; opened = true;
    showDialog(); launcher.hidden = true; launcher.setAttribute('aria-expanded','true'); launcherAvatar.setVisible(false);
    headerAvatar ||= createOrbiAvatar($('.orbi-panel__avatar'),avatarOptions);
    syncMotion(); headerAvatar.setVisible(true); headerAvatar.setState(busy?'thinking':'curious'); headerAvatar.playGesture();
    $('.orbi-close').focus({preventScroll:true});
    if(transport&&!connected)connect();
  }
  function close() {
    if (!opened) return;
    opened = false; panel.close(); lockBody(false); launcher.hidden = false; launcher.setAttribute('aria-expanded','false');
    launcherAvatar.setVisible(true); headerAvatar?.setVisible(false);
    const focus = lastFocus?.isConnected && lastFocus !== host ? lastFocus : launcher; focus.focus?.({preventScroll:true});
  }
  function syncControls() {
    // Chat, reset and contact all share the same session. Any expired request
    // must expose recovery, not leave the widget apparently connected.
    if(transport&&connected&&!transport.ready){
      connected=false;callbacks=false;contact.setReady(false);
      $('.orbi-mode').textContent='Session expired';
      connectionNotice('Your session expired. Reconnect to continue. If an enquiry’s delivery was uncertain, contact the team before submitting it again.');
    }
    const blocked=busy||connecting||contactBusy||!connected;
    send.disabled = blocked || !input.value.trim(); input.readOnly = blocked;
    shadow.querySelectorAll('[data-prompt]').forEach(b=>{ b.disabled = blocked; });
    reset.hidden = history.length === 0;reset.disabled=!!transport&&blocked;thinking.hidden = !busy;
    contactButton.hidden=!callbacks;contactButton.disabled=blocked;
    panel.setAttribute('aria-busy',String(busy||connecting||contactBusy));
  }
  function append(role, text, links = []) {
    const article = document.createElement('article'); article.className = 'orbi-message'+(role === 'user' ? ' is-user' : ''); article.setAttribute('aria-label',role === 'user' ? 'You' : 'Orbi'); article.dir = 'auto';
    const p = document.createElement('p'); p.textContent = text; article.append(p);
    for (const link of links) {
      const href = mapped(link.href); if (!href) continue;
      const a = document.createElement('a'); a.href = href; a.textContent = link.label+' ';a.insertAdjacentHTML('beforeend',arrowIcon()); article.append(a);
    }
    messages.append(article);
    while (messages.children.length > 80) messages.firstElementChild.remove();
    scroll.scrollTop = scroll.scrollHeight;
    return article;
  }
  function cancelPending() { generation++; clearTimeout(timeout); controller?.abort(); controller = null; busy = false; }
  async function resetConversation() {
    if (destroyed) return;
    if(transport){
      if(busy||connecting||contactBusy)return;
      busy=true;syncControls();
      try{await transport.reset();}catch(error){connectionNotice(error.message);return;}finally{busy=false;syncControls();}
      if(destroyed)return;contact.reset();
    }
    cancelPending(); history = []; pending = null; messages.replaceChildren(); notice.hidden = true; welcome.hidden = false; input.value = ''; syncControls(); headerAvatar?.setState('idle');
    if (opened) input.focus({preventScroll:true});
  }
  async function submit(value, retry = false) {
    const message = String(value).trim().slice(0,1000);
    if (destroyed || busy || connecting || contactBusy || !connected || !message) return;
    if (!retry || !pending || pending.message !== message) {
      pending = {message,requestId:crypto.randomUUID()};
      append('user',message); history.push({role:'user',content:message}); history = history.slice(-24);
    }
    const request = pending, token = ++generation; controller = new AbortController(); const {signal} = controller;
    busy = true; notice.hidden = true; welcome.hidden = true; input.value = ''; syncControls(); headerAvatar?.setState('thinking'); scroll.scrollTop = scroll.scrollHeight;
    // Keep keyboard focus at submission time; never take it back on async completion.
    if (opened && panel.contains(shadow.activeElement)) input.focus({preventScroll:true});
    try {
      const answer = await Promise.race([
        Promise.resolve().then(()=>live ? respond(message,{history:history.slice(0,-1).map(x=>({...x})),signal,requestId:request.requestId}) : guideReply(message,routes)),
        new Promise((_,reject)=>{
          signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true});
          timeout = setTimeout(()=>{ reject(new Error('timeout')); controller?.abort(); },Math.max(1000,Math.min(60000,Number(requestTimeout)||25000)));
        }),
      ]);
      if (destroyed || token !== generation) return;
      const normalized = normalizeAnswer(answer);
      const article=append('assistant',normalized.reply,normalized.links);decorate(article,answer); history.push({role:'assistant',content:normalized.reply}); history = history.slice(-24); pending = null;
      headerAvatar?.setState('happy');
    } catch (error) {
      if (destroyed || token !== generation) return;
      notice.querySelector('p').textContent = error.message === 'timeout' ? 'That reply took too long. You can try again or contact the team.' : transport ? error.message : 'Orbi couldn’t get a reply. Please try again or contact the team.';
      if(transport&&!transport.ready){connected=false;callbacks=false;contact.setReady(false);}
      notice.querySelector('button').textContent=connected?'Try again':'Reconnect';
      notice.hidden = false; headerAvatar?.setState('concerned');
    } finally {
      if (token === generation && !destroyed) { clearTimeout(timeout); controller = null; busy = false; syncControls(); scroll.scrollTop = scroll.scrollHeight; }
    }
  }
  on(launcher,'click',open); on($('.orbi-close'),'click',close);
  on(panel,'cancel',e=>{e.preventDefault();close();});
  on(document,'keydown',e=>{if(opened && e.key==='Escape'){e.preventDefault();close();}});
  on(media,'change',()=>{if(opened){const focused=shadow.activeElement;panel.close();showDialog();focused?.focus({preventScroll:true});}});
  on(motionToggle,'click',()=>{motionEnabled=!motionEnabled;syncMotion();});
  on(reduced,'change',syncMotion);
  on(form,'submit',e=>{e.preventDefault();submit(input.value);});
  on(input,'keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit(input.value);}});
  on(input,'input',syncControls);
  on(input,'focus',()=>{if(!busy)headerAvatar?.setState('listening');});
  on(input,'blur',()=>{if(!busy)headerAvatar?.setState('idle');});
  on(reset,'click',resetConversation);
  on(notice.querySelector('button'),'click',()=>{if(transport&&!connected)connect();else if(pending)submit(pending.message,true);else if(transport)connect();});
  on(shell,'click',e=>{
    const button=e.target.closest('[data-prompt]'); if(button)submit(button.dataset.prompt);
    if(e.target.closest('a'))close();
  });
  syncMotion(); syncControls();
  return {
    element:host, open, close, reset:resetConversation,
    setMotion(value){if(destroyed)return;motionEnabled=!!value;syncMotion();},
    setMotionAllowed(value){if(destroyed)return;motionAllowed=!!value;syncMotion();},
    getStatus(){return {open:opened,busy,mode:live?'assistant':'guide',messages:history.length,destroyed};},
    destroy(){if(destroyed)return;close();cancelPending();destroyed=true;cleanup.forEach(fn=>fn());launcherAvatar.destroy();headerAvatar?.destroy();host.remove();history=[];pending=null;},
  };
}

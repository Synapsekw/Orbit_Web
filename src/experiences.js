const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const cleanups = [];

document.querySelectorAll('[data-service-choice]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-service-choice]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelectorAll('.service-display-panel').forEach((panel,index) => {
      panel.hidden = index !== Number(button.dataset.serviceChoice);
      if (!panel.hidden && !reducedMotion.matches) panel.animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.23,1,.32,1)'});
    });
  });
});
document.querySelectorAll('.focus-view').forEach(button => {
  button.addEventListener('click', () => {
    const close = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed',String(close));
    button.closest('.service-image-stage').classList.toggle('is-focused',close);
    button.innerHTML = close ? '<span aria-hidden="true">−</span> Back to the wider view' : '<span aria-hidden="true">+</span> Take a closer look';
  });
});

const sculpture=document.querySelector('#brand-sculpture');
if(sculpture) import('./brand-sculpture.js').then(async module=>{
  const instance=await module.createBrandSculpture(sculpture);cleanups.push(()=>instance.destroy());
}).catch(()=>{
  // Keep the original symbol visible when WebGL or its asset is unavailable.
  document.querySelector('.sculpture-controls').hidden=true;
  document.querySelector('.object-coordinate-bottom span:last-child').textContent='THE ORBIT SYMBOL';
});

document.querySelectorAll('[data-discipline]').forEach(detail=>{
  detail.addEventListener('toggle',()=>{
    if(!detail.open)return;
    const figure=document.querySelector('.discipline-image');
    const img=figure.querySelector('img');
    img.src='/images/'+detail.dataset.image;
    img.alt=detail.querySelector('h3').textContent+' — illustrative perspective';
    document.querySelector('#discipline-image-label').textContent=detail.dataset.label;
    figure.querySelector('figcaption span:last-child').textContent='ORBIT / 0'+(Number(detail.dataset.discipline)+1);
    if(!reducedMotion.matches)img.animate([{opacity:.5},{opacity:1}],{duration:220});
  });
});

const inlineViewer=document.querySelector('#service-spatial-model');
if(inlineViewer){
  let selectedMode='photo', viewer;
  document.querySelectorAll('[data-inline-mode]').forEach(button=>button.addEventListener('click',()=>{
    selectedMode=button.dataset.inlineMode;
    document.querySelectorAll('[data-inline-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    viewer?.setMode(selectedMode);viewer?.setReveal(100);
  }));
  document.querySelector('#inline-reset').addEventListener('click',()=>viewer?.reset());
  const observer=new IntersectionObserver(async entries=>{
    if(!entries[0].isIntersecting)return;
    observer.disconnect();
    const status=inlineViewer.querySelector('.inline-viewer-status');
    const onError=()=>{status.hidden=false;status.textContent='The 3D preview is unavailable. Explore the homepage sample or contact us about your project.';document.querySelectorAll('[data-inline-mode],#inline-reset').forEach(b=>b.disabled=true);};
    try {
      const {createViewer}=await import('./viewer.js');
      viewer=await createViewer(inlineViewer,{onReady:()=>status.hidden=true,onError});
      if(viewer){viewer.setMode(selectedMode);viewer.setReveal(100);cleanups.push(()=>viewer.destroy());}
    }catch{onError();}
  },{rootMargin:'150px'});observer.observe(inlineViewer);cleanups.push(()=>observer.disconnect());
}

const previewModel=document.querySelector('#service-preview-model');
if(previewModel){
  let selected='photo',viewer;
  document.querySelectorAll('[data-preview-mode]').forEach(button=>button.addEventListener('click',()=>{
    selected=button.dataset.previewMode;
    document.querySelectorAll('[data-preview-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    viewer?.setMode(selected);viewer?.setReveal(100);
  }));
  document.querySelector('#preview-model-reset').addEventListener('click',()=>viewer?.reset());
  const observer=new IntersectionObserver(async entries=>{
    if(!entries[0].isIntersecting)return;
    observer.disconnect();
    const status=previewModel.querySelector('.preview-model-status');
    const onError=()=>{status.hidden=false;status.textContent='The interactive preview is unavailable. You can still explore this service below.';document.querySelectorAll('[data-preview-mode],#preview-model-reset').forEach(b=>b.disabled=true);};
    try{
      const {createViewer}=await import('./viewer.js');
      viewer=await createViewer(previewModel,{onReady:()=>status.hidden=true,onError});
      if(viewer){viewer.setMode(selected);viewer.setReveal(100);cleanups.push(()=>viewer.destroy());}
    }catch{onError();}
  });observer.observe(previewModel);cleanups.push(()=>observer.disconnect());
}

const form=document.querySelector('#enquiry-form');
if(form){
  const selector=form.elements.service;
  function reflectIntent(){
    const slug=selector.selectedOptions[0].dataset.slug||'';
    document.querySelectorAll('[data-intent]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.intent===slug)));
  }
  document.querySelectorAll('[data-intent]').forEach(button=>button.addEventListener('click',()=>{
    const option=[...selector.options].find(option=>(option.dataset.slug||'')===button.dataset.intent);
    selector.value=option.value;selector.dispatchEvent(new Event('input',{bubbles:true}));reflectIntent();
  }));
  selector.addEventListener('change',reflectIntent);reflectIntent();
  form.addEventListener('input',()=>{
    const complete=[form.elements.name.value.trim().length>0,form.elements.email.validity.valid&&form.elements.email.value.length>0,form.elements.message.value.trim().length>=10].filter(Boolean).length;
    document.querySelector('#brief-progress').textContent=`${complete} / 3 ESSENTIALS`;
  });
  const clock=document.querySelector('[data-kuwait-time]');
  function updateClock(){clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kuwait',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());}
  updateClock();const interval=setInterval(updateClock,60000);cleanups.push(()=>clearInterval(interval));
}

// Small perspective responses belong to the imagery, never the text or controls.
if(matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.querySelectorAll('[data-depth-card]').forEach(card=>{
    const img=card.querySelector('img');let targetX=0,targetY=0,x=0,y=0,frame=0;
    function tick(){x+=(targetX-x)*.14;y+=(targetY-y)*.14;img.style.transform=`perspective(1000px) rotateX(${x}deg) rotateY(${y}deg) scale(${card.classList.contains('is-focused')?1.65:1.045})`;if(Math.abs(x-targetX)+Math.abs(y-targetY)>.025)frame=requestAnimationFrame(tick);else frame=0;}
    const move=event=>{if(reducedMotion.matches||event.target.closest('button'))return;const r=card.getBoundingClientRect();targetX=-(event.clientY-r.top-r.height/2)/r.height*3;targetY=(event.clientX-r.left-r.width/2)/r.width*3;if(!frame)frame=requestAnimationFrame(tick);};
    const leave=()=>{targetX=targetY=0;if(!frame)frame=requestAnimationFrame(tick);};
    card.addEventListener('pointermove',move);card.addEventListener('pointerleave',leave);
    cleanups.push(()=>{cancelAnimationFrame(frame);card.removeEventListener('pointermove',move);card.removeEventListener('pointerleave',leave);});
  });
}

const progress=document.querySelector('.reading-progress>div');
if(progress){
  const article=document.querySelector('.editorial-article');let frame=0;
  const update=()=>{frame=0;const r=article.getBoundingClientRect();progress.style.transform=`scaleX(${Math.max(0,Math.min(1,-r.top/(r.height-innerHeight)))})`;};
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);update();
  cleanups.push(()=>{cancelAnimationFrame(frame);removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll);});
}
if(import.meta.hot)import.meta.hot.dispose(()=>cleanups.forEach(fn=>fn()));

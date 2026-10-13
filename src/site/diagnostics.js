// Opt-in local measurements. No requests, storage or analytics service.
export function showDiagnostics(){
 const panel=document.createElement('aside');panel.className='diagnostics';panel.setAttribute('aria-label','Local performance diagnostics');panel.style.cssText='position:fixed;left:12px;bottom:12px;z-index:100;background:#071421;color:#f1f3f5;border:1px solid #d6b56d;padding:14px;font:12px/1.6 monospace;max-width:280px';document.body.append(panel);
 let lcp=0,cls=0,maxInteraction=0;const update=()=>{panel.textContent=`Local diagnostics (no throttling)\nLCP: ${lcp?Math.round(lcp)+' ms':'waiting'} · CLS: ${cls.toFixed(3)}\nLongest observed interaction: ${maxInteraction} ms`;panel.style.whiteSpace='pre-wrap';};update();
 for(const [type,handle] of [['largest-contentful-paint',e=>lcp=e.startTime],['layout-shift',e=>{if(!e.hadRecentInput)cls+=e.value;}],['event',e=>{if(e.interactionId)maxInteraction=Math.max(maxInteraction,e.duration);}]] )try{const observer=new PerformanceObserver(list=>{list.getEntries().forEach(handle);update();});observer.observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})});}catch{}
}

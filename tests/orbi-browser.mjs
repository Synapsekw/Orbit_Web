import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ORBI_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.ORBI_PREVIEW_URL || 'http://127.0.0.1:5190/orbi/preview.html';
const output = new URL('../design-concepts/orbi-round-1/',import.meta.url);
const browser = await chromium.launch({headless:true,channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const passed=[], errors=[];
const check=(value,label)=>{assert.ok(value,label);passed.push(label);};
await mkdir(output,{recursive:true});
const screenshot=async(page,name)=>page.screenshot({path:fileURLToPath(new URL(name,output)),fullPage:false});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1050}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.orbiPreview?.hero.getStatus().frames>3);
  check((await page.evaluate(()=>window.orbiPreview.hero.getStatus())).renderer==='webgl','Character renders through WebGL');
  await screenshot(page,'orbi-preview-desktop.png');
  if(process.argv.includes('--visual')){console.log(JSON.stringify({passed,errors}));process.exitCode=0;}
  else {
    for(const state of ['curious','listening','thinking','speaking','happy','surprised','concerned','idle']) {
      await page.locator(`button[data-state="${state}"]`).click();
      assert.equal(await page.evaluate(()=>window.orbiPreview.hero.getStatus().state),state);
    }
    passed.push('All eight expression controls work');
    await page.locator('#pause').click(); await page.waitForTimeout(80);
    const paused=await page.evaluate(()=>window.orbiPreview.hero.getStatus().frames);await page.waitForTimeout(180);
    check(await page.evaluate(()=>window.orbiPreview.hero.getStatus().frames)===paused,'Pause stops rendering');
    await page.locator('#pause').click();await page.waitForTimeout(150);
    check(await page.evaluate(()=>window.orbiPreview.hero.getStatus().frames)>paused,'Resume restarts rendering');
    await page.locator('.orbi-launcher').click();
    check(await page.getByText('Local service guide',{exact:true}).isVisible(),'Local guide is clearly labelled');
    await screenshot(page,'orbi-widget-desktop.png');
    const sent=[];page.on('request',r=>{if(r.method()==='POST')sent.push(r.url());});
    await page.getByRole('textbox',{name:'Ask Orbi',exact:true}).fill('I need a spatial map');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.getByRole('link',{name:'Explore spatial mapping'}).waitFor();
    check((await page.getByRole('link',{name:'Explore spatial mapping'}).getAttribute('href'))==='/services/spatial-mapping/','Local question produces the correct service link');
    check(sent.length===0,'Local conversations make no POST requests');
    await page.getByRole('button',{name:'New conversation',exact:true}).click();
    check(await page.locator('.orbi-welcome').isVisible(),'Reset returns to welcome');
    await page.keyboard.press('Escape');
    check(await page.locator('.orbi-launcher').isVisible(),'Escape closes panel');
    check(await page.evaluate(()=>document.querySelector('.orbi-widget-host').shadowRoot.activeElement?.classList.contains('orbi-launcher')),'Close restores launcher focus');

    await page.evaluate(()=>{window.orbiPreview.widget.destroy();window.orbiTestCalls=[];window.orbiTestWidget=window.orbiPreview.mountOrbiWidget({resolveHref:href=>href==='/contact/'?'/design-concepts/round-5/preview.html?v=atlas&p=contact&mode=dark':href,respond:async(message,context)=>{window.orbiTestCalls.push(context.requestId);if(window.orbiTestCalls.length===1)throw new Error('test failure');return {reply:'Safe <img src=x onerror=alert(1)> text',links:[{label:'Unsafe',href:'javascript:alert(1)'},{label:'Contact',href:'/contact/'}]};}});window.orbiTestWidget.open();});
    await page.getByRole('textbox',{name:'Ask Orbi',exact:true}).fill('Test recovery');await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.getByRole('button',{name:'Try again',exact:true}).click();
    await page.getByText('Safe <img src=x onerror=alert(1)> text',{exact:true}).waitFor();
    check(await page.locator('.orbi-messages img').count()===0,'Backend reply is rendered as text, not HTML');
    check(await page.getByRole('link',{name:'Unsafe',exact:true}).count()===0,'Unsafe backend links are omitted');
    check((await page.getByRole('link',{name:'Contact ↗',exact:true}).getAttribute('href')).includes('p=contact'),'Website link resolver is applied');
    check(await page.locator('.orbi-message.is-user').count()===1,'Retry does not duplicate the visitor message');
    check(await page.evaluate(()=>window.orbiTestCalls.length===2&&window.orbiTestCalls[0]===window.orbiTestCalls[1]),'Retry preserves request ID');
    await page.evaluate(()=>{window.orbiTestWidget.destroy();window.orbiTestWidget=window.orbiPreview.mountOrbiWidget({respond:()=>new Promise(resolve=>{window.resolveOrbiTest=resolve;})});window.orbiTestWidget.open();});
    await page.getByRole('textbox',{name:'Ask Orbi',exact:true}).fill('Delayed');await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.getByRole('button',{name:'New conversation',exact:true}).click();
    await page.evaluate(()=>window.resolveOrbiTest({reply:'Stale answer'}));await page.waitForTimeout(100);
    check(await page.locator('.orbi-message').count()===0,'Reset ignores a late response');
    await page.evaluate(()=>{window.orbiTestWidget.destroy();window.orbiTestWidget=window.orbiPreview.mountOrbiWidget({requestTimeout:1000,respond:()=>new Promise(()=>{})});window.orbiTestWidget.open();});
    await page.getByRole('textbox',{name:'Ask Orbi',exact:true}).fill('Timeout');await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.getByText('That reply took too long.',{exact:false}).waitFor({timeout:5000});
    check(!(await page.getByRole('textbox',{name:'Ask Orbi',exact:true}).isDisabled()),'Timeout restores usable input');
    await page.evaluate(()=>{window.orbiTestWidget.destroy();window.orbiPreview.hero.destroy();});
    const stopped=await page.evaluate(()=>window.orbiPreview.hero.getStatus().frames);await page.waitForTimeout(100);
    check(await page.evaluate(()=>window.orbiPreview.hero.getStatus().frames)===stopped,'Destroy stops rendering');
    check(await page.locator('.orbi-widget-host').count()===0,'Destroy removes widget');

    const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(base,{waitUntil:'networkidle'});
    check(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile preview has no horizontal overflow');
    await mobile.evaluate(()=>document.querySelector('.orbi-widget-host').style.setProperty('--orbi-bottom','64px'));
    check(await mobile.locator('.orbi-launcher').evaluate(el=>Math.abs(innerHeight-el.getBoundingClientRect().bottom-64)<1),'Mobile launcher honors the host bottom offset');
    await mobile.locator('.orbi-launcher').click();
    check(await mobile.locator('.orbi-panel').evaluate(el=>el.matches(':modal')),'Mobile panel uses native modal focus containment');
    check(await mobile.evaluate(()=>document.body.style.overflow)==='hidden','Mobile panel locks background scroll');
    await screenshot(mobile,'orbi-widget-mobile.png');
    await mobile.getByRole('button',{name:'Close Orbi',exact:true}).click();
    check(await mobile.evaluate(()=>document.body.style.overflow)==='','Closing mobile panel restores scroll');
    await mobile.emulateMedia({reducedMotion:'reduce'});await mobile.waitForTimeout(100);
    const reducedFrames=await mobile.evaluate(()=>window.orbiPreview.hero.getStatus().frames);await mobile.waitForTimeout(150);
    check(await mobile.evaluate(()=>window.orbiPreview.hero.getStatus().frames)===reducedFrames,'Reduced motion stops the animation loop');
    check(await mobile.evaluate(()=>window.orbiPreview.hero.getStatus().motion)==='paused','Reduced motion updates the renderer status');
    await mobile.emulateMedia({reducedMotion:'no-preference'});await mobile.waitForTimeout(180);
    check(await mobile.evaluate(()=>window.orbiPreview.hero.getStatus().frames)>reducedFrames,'Removing reduced motion restarts rendering');
    await mobile.emulateMedia({reducedMotion:'reduce'});
    await mobile.locator('.orbi-launcher').click();
    await mobile.evaluate(()=>window.orbiPreview.widget.destroy());
    check(await mobile.evaluate(()=>document.body.style.overflow)==='','Destroying an open mobile widget restores scroll');

    const fallback=await browser.newPage({viewport:{width:1100,height:900}});fallback.on('pageerror',e=>errors.push(e.message));
    await fallback.goto(base+'?artwork=1',{waitUntil:'networkidle'});
    check(await fallback.locator('#hero-avatar canvas').count()===0,'Artwork mode allocates no WebGL canvas');
    check(await fallback.locator('#hero-avatar img').evaluate(img=>img.complete&&img.naturalWidth>0),'Fallback image loads');
    await screenshot(fallback,'orbi-artwork-fallback.png');
    await fallback.locator('.orbi-launcher').click();check(await fallback.locator('.orbi-welcome').isVisible(),'Widget works in artwork mode');
    check(errors.length===0,'No browser JavaScript errors');
    await writeFile(new URL('browser-verification.json',output),JSON.stringify({passed,errors},null,2));
    console.log(JSON.stringify({passed,errors},null,2));
  }
} finally {await browser.close();}

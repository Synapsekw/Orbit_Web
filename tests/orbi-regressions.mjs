import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import sharp from 'sharp';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ORBI_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true,channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const base=process.env.ORBI_PREVIEW_URL||'http://127.0.0.1:5190/orbi/preview.html',results=[];
async function scenario(name,run){const page=await browser.newPage({viewport:{width:1200,height:950}});try{await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.orbiPreview.hero.getStatus().frames>1);await run(page);results.push({name,pass:true});}catch(error){results.push({name,pass:false,error:error.message});}finally{await page.close();}}
try{
  await scenario('A delayed reply does not steal focus from the host page',async page=>{
    await page.evaluate(()=>{window.orbiPreview.widget.destroy();window.testWidget=window.orbiPreview.mountOrbiWidget({respond:()=>new Promise(resolve=>{window.finishReply=resolve;})});window.testWidget.open();});
    await page.getByRole('textbox',{name:'Ask Orbi',exact:true}).fill('Hello');await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.locator('#pause').focus();await page.evaluate(()=>window.finishReply({reply:'Hello back'}));
    await page.getByText('Hello back',{exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'pause');
  });
  await scenario('WebGL restoration restores the same studio lighting',async page=>{
    await page.locator('#pause').click();await page.waitForTimeout(100);
    const before=await sharp(await page.locator('#hero-avatar').screenshot()).stats();
    await page.evaluate(()=>{const canvas=document.querySelector('#hero-avatar canvas');window.testLoss=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');window.testLoss.loseContext();});
    await page.waitForFunction(()=>window.orbiPreview.hero.getStatus().renderer==='artwork');
    await page.evaluate(()=>window.testLoss.restoreContext());
    await page.waitForFunction(()=>window.orbiPreview.hero.getStatus().renderer==='webgl');
    const after=await sharp(await page.locator('#hero-avatar').screenshot()).stats();
    for(let c=0;c<3;c++)assert.ok(Math.abs(before.channels[c].mean-after.channels[c].mean)<1,`Channel ${c} changed by ${Math.abs(before.channels[c].mean-after.channels[c].mean).toFixed(2)}`);
  });
  await scenario('Dynamic reduced motion updates status and can resume',async page=>{
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(180);
    const reduced=await page.evaluate(()=>window.orbiPreview.hero.getStatus());assert.equal(reduced.motion,'paused');
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(180);
    const resumed=await page.evaluate(()=>window.orbiPreview.hero.getStatus());assert.equal(resumed.motion,'running');assert.ok(resumed.frames>reduced.frames);
  });
}finally{await browser.close();}
console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.pass))process.exitCode=1;

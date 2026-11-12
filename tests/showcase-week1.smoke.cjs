const { chromium } = require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/');
  await page.locator('#enterLabBtn').click();
  const status=await page.evaluate(()=>({screens:[...document.querySelectorAll('.screen')].map(e=>[e.id,e.className]),cards:document.querySelectorAll('[data-day]').length,appLoaded:!!window.GameLabGames}));
  console.log('SCREEN STATUS',JSON.stringify(status),'PAGE ERRORS',JSON.stringify(errors));
  if(!(await page.locator('#mapScreen').isVisible()))throw Error('Map screen never opened: '+JSON.stringify(status)+' errors: '+errors.join('; '));
  for(let i=0;i<4;i++){
    await page.locator('[data-day="'+i+'"]').click();
    await page.locator('[data-section="4"]').click();
    await page.locator('.showcase canvas').waitFor({state:'visible'});
    await page.locator('[data-action="right"]').click();
    await page.locator('[data-action="up"]').click();
    await page.locator('[data-action="fire"]').click();
    await page.locator('[data-togglelens]').click();
    if(!(await page.locator('.showcase-lens').isVisible()))throw Error('Code lens hidden for day '+(i+1));
    await page.locator('[data-togglelens]').click();
    await page.locator('[data-demo]').click();
    await page.waitForTimeout(100);
    await page.locator('[data-restart]').click();
    await page.locator('#backToMapBtn').click();
  }
  // Day 5 must be an actual prototype → observation → revision → retest.
  await page.locator('[data-day="4"]').click();
  await page.locator('[data-section="4"]').click();
  await page.locator('[data-test]').click();
  await page.waitForFunction(()=>document.querySelector('[data-choices]')?.hidden === false,{timeout:10000});
  if(!(await page.locator('[data-reporttext]').innerText()).includes('OBSERVATION'))throw Error('Missing playtest observation');
  await page.locator('[data-fix="clarity"]').click();
  await page.locator('[data-test]').click();
  await page.waitForFunction(()=>document.querySelector('[data-endtitle]')?.textContent?.includes('IMPROVED'),{timeout:10000});
  await page.locator('[data-again]').click();
  await page.locator('#backToMapBtn').click();
  await page.locator('[data-tab="all"]').click();
  await page.locator('[data-day="5"]').click();
  await page.locator('[data-section="4"]').click();
  if(await page.locator('.showcase').count())throw Error('Day 6 unexpectedly replaced');
  await page.locator('#timerBtn').click();
  await page.locator('#timerCloseBtn').click();
  if(await page.locator('#timerOverlay').isVisible())throw Error('Timer failed to close');
  if(errors.length)throw Error('Browser errors: '+errors.join(' | '));
  console.log('PASS: Five playable games, controls, Code Lens, resets, Day 6, and timer.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

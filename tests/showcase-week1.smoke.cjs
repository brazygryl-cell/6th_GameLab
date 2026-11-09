const { chromium } = require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/');
  await page.locator('#enterLabBtn').click();
  for(let i=0;i<5;i++){
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

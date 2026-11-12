const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:8765/");
 await page.locator("#enterLabBtn").click();
 for(let i=5;i<10;i++){
   await page.locator('[data-tab="all"]').click();
   await page.locator('[data-day="'+i+'"]').click();
   await page.locator('[data-section="4"]').click();
   await page.locator('.code-caverns canvas').waitFor({state:"visible"});
   if(!(await page.locator('.showcase-hud').isVisible()))throw Error("HUD missing on "+i);
   await page.locator("[data-code]").click();
   if(!(await page.locator(".showcase-lens").isVisible()))throw Error("Code lens missing on "+i);
   await page.locator("[data-code]").click();
   if(i===5){
     await page.locator('[data-dir="right"]').click();
     await page.locator('[data-dir="up"]').click();
     if(!(await page.locator("[data-msg]").innerText()).includes("COORDINATE"))throw Error("Coordinate feedback missing");
   }
   if(i===6){await page.locator("[data-action]").click();if(!(await page.locator("[data-msg]").innerText()).includes("EVENT"))throw Error("Event jump did not fire");}
   if(i===7){
     await page.locator('[data-count="2"]').click();
     await page.waitForFunction(()=>document.querySelector("[data-hud]")?.textContent?.includes("2/2"),null,{timeout:4000});
     if(!(await page.locator("[data-msg]").innerText()).includes("Revise"))throw Error("Loop count did not generate revision feedback");
     await page.locator('[data-count="6"]').click();
     await page.waitForFunction(()=>document.querySelector("[data-title]")?.textContent?.includes("COMPLETE"),null,{timeout:5500});
   }
   if(i===8){
     await page.locator('[data-action]').click();
     if(!(await page.locator("[data-msg]").innerText()).includes("key"))throw Error("Conditional instructions missing");
   }
   if(i===9){
     await page.locator('[data-dir="right"]').click();
     if(!(await page.locator("[data-hud]").innerText()).includes("SCORE 0/10"))throw Error("Score variable not initialized");
   }
   await page.locator("[data-restart]").click();
   await page.locator("[data-demo]").click();
   await page.waitForTimeout(100);
   await page.locator("#backToMapBtn").click();
 }
 await page.locator('[data-tab="all"]').click();
 await page.locator('[data-day="10"]').click();
 await page.locator('[data-section="4"]').click();
 if(await page.locator(".code-caverns").count())throw Error("Day 11 unexpectedly replaced");
 await page.locator("#timerBtn").click();await page.locator("#timerCloseBtn").click();
 if(await page.locator("#timerOverlay").isVisible())throw Error("Timer failed to close");
 if(errors.length)throw Error("Page errors: "+errors.join(" | "));
 console.log("PASS: all 5 Code Caverns games, lessons, Code Lens, controls, loop victory, Day 11 and timer");
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

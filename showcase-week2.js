/* Code Caverns, November 16–20: five distinct playable teaching games. */
(function(){
"use strict";
const previous=window.GameLabGames;
const titles=["Coordinate Comet","Event Relay: Skyline","Loop Lagoon: Robo Regatta","If/Then Dungeon","Variable Vault"];
const display=["COORDINATE COMET","EVENT RELAY: SKYLINE","LOOP LAGOON: ROBO REGATTA","IF/THEN DUNGEON","VARIABLE VAULT"];
const descriptions=[
 "Navigate a glowing coordinate grid. Predict x and y, then fly to three beacons without touching hazards.",
 "Jump the laser, hit the floor switch, then broadcast a signal to wake both towers. Nothing responds without an event.",
 "Program a repeat count to carry your robot boat across a river. Watch each iteration run—then revise the loop.",
 "Explore a dungeon. Collect the key, avoid lava, and test the locked door. Every collision asks a true-or-false question.",
 "Collect falling gems, dodge corrupted data, and watch score and lives change in real time. Reach 10 points to win."
];
const concepts=[
 ["POSITION + COORDINATES",'const x = column - 4; const y = 3 - row;','sprite.x += dx; sprite.y += dy;'],
 ["EVENTS + BROADCASTS",'button.addEventListener("click", jump);','broadcast("POWER_ON"); // both towers listen'],
 ["REPEAT + ITERATIONS",'for (let i = 0; i < count; i++) {','  boat.x += step; // same action, new iteration'],
 ["IF / THEN / ELSE",'if (touchingKey) inventory.key = true;','if (touchingDoor && inventory.key) openDoor();'],
 ["VARIABLES + UPDATES",'let score = 0; let lives = 3;','if (touchingGem) score += 1; else lives -= 1;']
];
const colors=[["#18214b","#67e9ff","#fbdc69"],["#201941","#ff79aa","#8effdb"],["#102b45","#68f2c8","#ffc36d"],["#301836","#ff8a80","#b0ff9a"],["#1c2149","#8aa6ff","#ffde70"]];
let active=null;
const bound=(n,a,b)=>Math.max(a,Math.min(b,n));
function make(game,mount,api,id){
 let alive=true,raf=0,last=0,tick=0,won=false,paused=false,demo=false,state={};
 const C=colors[id],keys=new Set();
 mount.innerHTML='<div class="showcase code-caverns"><div class="showcase-top"><span class="showcase-chip">WORLD 02 • DAY '+(id+6)+'</span><span class="showcase-hud" data-hud>MISSION READY</span></div><h3>'+display[id]+'</h3><p class="showcase-sub">'+descriptions[id]+'</p><div class="showcase-play"><canvas width="800" height="480" tabindex="0" aria-label="'+display[id]+' interactive game. Direction arrows or W A S D move."></canvas><div class="showcase-overlay" hidden><strong data-title></strong><p data-result></p><button data-retry>↻ PLAY AGAIN</button><button data-endcode>⌘ SEE HOW THE CODE WORKS</button></div></div><div class="showcase-bottom"><div class="showcase-actions"><button data-dir="up" aria-label="Up">▲</button><button data-dir="left" aria-label="Left">◀</button><button data-dir="down" aria-label="Down">▼</button><button data-dir="right" aria-label="Right">▶</button><button data-action>✦ ACTION</button></div><div class="showcase-tools"><button data-demo>▶ TEACHER DEMO</button><button data-pause>Ⅱ PAUSE</button><button data-restart>↻ RESET</button><button data-code>⌘ CODE LENS</button></div></div><div class="showcase-message" role="status" aria-live="polite" data-msg>Press a direction to begin. Watch what changes.</div><section class="showcase-lens" hidden><h4>🔍 CODE LENS — '+concepts[id][0]+'</h4><p>These JavaScript excerpts show the rule behind this actual game. The canvas is HTML; its neon presentation is CSS and canvas drawing.</p><pre data-code1></pre><pre data-code2></pre><p><b>Discuss:</b> Which event or value made the game react? How could you change it?</p></section></div>';
 const canvas=mount.querySelector("canvas"),ctx=canvas.getContext("2d"),overlay=mount.querySelector(".showcase-overlay"),hud=mount.querySelector("[data-hud]"),status=mount.querySelector("[data-msg]"),code=mount.querySelector(".showcase-lens");
 mount.querySelector("[data-code1]").textContent=concepts[id][1];mount.querySelector("[data-code2]").textContent=concepts[id][2];
 const reduced=()=>document.body.classList.contains("reduced-motion");
 const high=()=>document.body.classList.contains("high-contrast");
 const say=t=>{status.textContent=t;api.announce(t);};
 const hit=(a,b,r=25)=>Math.hypot(a.x-b.x,a.y-b.y)<r;
 const node=(x,y)=>({x,y});
 function reset(){
   tick=0;won=false;paused=false;demo=false;keys.clear();overlay.hidden=true;
   mount.querySelector("[data-pause]").textContent="Ⅱ PAUSE";
   mount.querySelector("[data-demo]").textContent="▶ TEACHER DEMO";
   if(id===0)state={col:4,row:3,goals:[[6,2],[2,5],[7,1]],index:0,bumps:0};
   if(id===1)state={x:95,y:370,jump:0,vy:0,switch:false,broadcast:false,towers:0,obstacle:360,attempts:0};
   if(id===2)state={boat:0,count:0,running:false,iteration:0,stepTimer:0,attempts:0};
   if(id===3)state={x:90,y:395,key:false,health:3,gate:false,hitTime:0};
   if(id===4)state={x:400,score:0,lives:3,spawn:0,drops:[],seconds:0,invulnerable:0};
   hud.textContent="MISSION READY";say(descriptions[id]);draw();
 }
 function finish(success,text){
   if(won)return;won=true;paused=true;overlay.hidden=false;
   overlay.querySelector("[data-title]").textContent=success?"★ MISSION COMPLETE":"↻ DEBUG AND RETRY";
   overlay.querySelector("[data-result]").textContent=text;
   if(success){api.sound("success");api.celebrate();}else api.sound("error");
   say(text);
 }
 function move(dir){
  if(paused||won)return;
  if(id===0){
   const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];if(!d)return;
   state.col=bound(state.col+d[0],0,8);state.row=bound(state.row+d[1],0,6);
   if((state.col===3&&state.row===2)||(state.col===5&&state.row===5)){state.col=4;state.row=3;state.bumps++;say("Asteroid collision! Back to (0, 0). Predict another route.");api.sound("error");}
   const target=state.goals[state.index];
   if(target&&state.col===target[0]&&state.row===target[1]){state.index++;say("BEACON "+state.index+"/3! Your coordinates landed exactly on target.");api.sound("click");if(state.index===3)finish(true,"All three beacons found! Horizontal movement changed x; vertical movement changed y.");}
   else if(state.index<3)say("CURRENT COORDINATE: ("+(state.col-4)+", "+(3-state.row)+"). Target: ("+(target[0]-4)+", "+(3-target[1])+").");
  }else if(id===1){
    const d={left:-45,right:45,up:0,down:0}[dir]||0;state.x=bound(state.x+d,70,740);
    if(dir==="up")action();
    if(state.switch&&state.broadcast&&state.x>700)finish(true,"You triggered a switch, broadcast POWER_ON, and both towers responded to that event.");
  }else if(id===2){
    say("The boat moves through code, not arrow presses. Choose REPEAT 2, REPEAT 4, or REPEAT 6!");
  }else if(id===3){
    const d={up:[0,-35],down:[0,35],left:[-35,0],right:[35,0]}[dir];if(!d)return;
    state.x=bound(state.x+d[0],46,752);state.y=bound(state.y+d[1],54,429);
    conditionalChecks();
  }else if(id===4){
    const d={left:-55,right:55,up:0,down:0}[dir]||0;state.x=bound(state.x+d,42,758);
  }
 }
 function action(){
  if(paused||won)return;
  if(id===1){
    if(state.jump<=0){state.vy=530;state.jump=.001;state.attempts++;say("EVENT: Jump button pressed! The event handler applied upward velocity.");api.sound("click");}
    if(state.switch&&!state.broadcast){state.broadcast=true;state.towers=2;say("BROADCAST POWER_ON: Both towers woke up from one event!");api.sound("success");}
  }else if(id===2){if(!state.running){runLoop(state.count||4);}}
  else if(id===0) say("Follow the current target coordinate. Use one x or y change at a time.");
  else if(id===3)say(state.key?"The key variable is TRUE. Now touch the glowing gate.":"You have no key yet. Touch the gold key first.");
  else if(id===4)say("Score is a variable: touching gems adds points; glitches remove lives.");
 }
 function conditionalChecks(){
   const p=node(state.x,state.y),key=node(258,155),lava=[node(400,240),node(505,340)],door=node(698,120);
   if(!state.key&&hit(p,key,37)){state.key=true;api.sound("success");say("IF touching key THEN key = TRUE. Inventory updated!");}
   if(lava.some(l=>hit(p,l,34))&&state.hitTime<=0){state.health--;state.hitTime=1;state.x=90;state.y=395;api.sound("error");say("IF touching lava THEN health -= 1. Health now "+state.health+".");if(state.health<=0)finish(false,"Health reached zero. That conditional triggered GAME OVER.");}
   if(hit(p,door,45)){if(state.key)finish(true,"IF at gate AND key = true THEN OPEN! The same door gives different results when conditions change.");else{say("ELSE: LOCKED! No key. A conditional checked your inventory.");api.sound("error");state.x=625;}}
 }
 function runLoop(count){
   state.count=count;state.boat=0;state.iteration=0;state.running=true;state.stepTimer=0;state.attempts++;say("RUNNING repeat "+count+" { move 110px } — watch every iteration.");
 }
 function shootEvent(){
   state.switch=true;say("FLOOR SWITCH PRESSED! The switch event is now TRUE. Press ACTION to broadcast POWER_ON.");api.sound("click");
 }
 function update(dt){
   tick+=dt;
   if(id===1){
    if(state.jump>0||state.vy!==0){state.jump+=state.vy*dt;state.vy-=1200*dt;if(state.jump<0){state.jump=0;state.vy=0;}}
    if(state.x>state.obstacle-35&&state.x<state.obstacle+25&&state.jump<45&&!state.switch){state.x=95;state.attempts++;say("Laser collision! An event handler reset your sprite. Jump to avoid it.");api.sound("error");}
    if(state.x>490&&!state.switch)shootEvent();
    if(state.switch&&state.broadcast&&state.x>700)finish(true,"An event powered the switch. Its broadcast woke both towers. Your inputs drove the result!");
   }
   if(id===2&&state.running){
      state.stepTimer+=dt;
      if(state.stepTimer>.48){state.stepTimer=0;state.iteration++;state.boat=state.iteration*110;api.sound("click");say("ITERATION "+state.iteration+"/"+state.count+": same move command executed again.");
      if(state.iteration>=state.count){state.running=false;if(state.boat===660)finish(true,"REPEAT 6 reached the lighthouse! Six iterations reused one instruction, with no copy-and-paste.");else say("LOOP ENDED at "+state.boat+" pixels. The goal is 660. Revise the repeat count and test again.");}}
   }
   if(id===3)state.hitTime=Math.max(0,state.hitTime-dt);
   if(id===4){
     state.seconds+=dt;state.spawn+=dt;state.invulnerable=Math.max(0,state.invulnerable-dt);
     if(state.spawn>.68){state.spawn=0;const n=Math.floor(state.seconds*10);state.drops.push({x:62+(n*137)%678,y:40,type:n%4===0?"glitch":"gem",speed:100+(n%5)*16});}
     for(const d of state.drops){d.y+=d.speed*dt;if(Math.abs(d.x-state.x)<43&&Math.abs(d.y-420)<30&&state.invulnerable<=0){
        d.y=600;if(d.type==="gem"){state.score++;say("GEM! score = score + 1 → "+state.score);api.sound("click");}
        else{state.lives--;state.invulnerable=.8;say("GLITCH! lives = lives - 1 → "+state.lives);api.sound("error");}
        if(state.score>=10)finish(true,"Score was initialized to 0 and updated with each gem. IF score ≥ 10 THEN WIN!");
        else if(state.lives<=0)finish(false,"The lives variable reached 0. Reset, then try collecting more gems.");}}
     state.drops=state.drops.filter(d=>d.y<510);
     if(state.seconds>65&&!won)finish(false,"Time expired. Test a new collecting strategy and watch the changing variables.");
   }
 }
 function text(s,x,y,size=19,color="#fff"){ctx.font="bold "+size+"px Arial, sans-serif";ctx.fillStyle=color;ctx.textAlign="center";ctx.fillText(s,x,y);}
 function orb(x,y,r,color){ctx.save();ctx.shadowColor=color;ctx.shadowBlur=reduced()?0:24;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();}
 function draw(){
  ctx.fillStyle=high()?"#000":C[0];ctx.fillRect(0,0,800,480);const cyan=C[1],gold=C[2];
  ctx.strokeStyle="#a6b1fc38";ctx.lineWidth=1;for(let x=20;x<800;x+=40){ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x,460);ctx.stroke();}for(let y=20;y<480;y+=40){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(780,y);ctx.stroke();}
  if(id===0){
    const cell=57,ox=144,oy=42;
    for(let r=0;r<7;r++)for(let c=0;c<9;c++){ctx.strokeStyle="#75cfff77";ctx.strokeRect(ox+c*cell,oy+r*cell,cell,cell);}
    ctx.strokeStyle="#ffe28d";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox+4.5*cell,oy);ctx.lineTo(ox+4.5*cell,oy+7*cell);ctx.moveTo(ox,oy+3.5*cell);ctx.lineTo(ox+9*cell,oy+3.5*cell);ctx.stroke();
    const target=state.goals[state.index];if(target){orb(ox+(target[0]+.5)*cell,oy+(target[1]+.5)*cell,19,gold);text("TARGET: ("+(target[0]-4)+", "+(3-target[1])+")",400,26,20);}
    for(const p of [[3,2],[5,5]]){orb(ox+(p[0]+.5)*cell,oy+(p[1]+.5)*cell,17,"#ff668d");text("×",ox+(p[0]+.5)*cell,oy+(p[1]+.5)*cell+6);}
    orb(ox+(state.col+.5)*cell,oy+(state.row+.5)*cell,20,cyan);text("🚀",ox+(state.col+.5)*cell,oy+(state.row+.5)*cell+7,22);
    text("POSITION: ("+(state.col-4)+", "+(3-state.row)+")  •  BEACONS "+state.index+"/3",390,464,20);
    hud.textContent="BEACONS "+state.index+"/3";
  }else if(id===1){
    ctx.fillStyle="#2d4168";ctx.fillRect(0,404,800,76);for(let i=0;i<16;i++){ctx.fillStyle="#314e78";ctx.fillRect(i*52,200-(i%5)*28,44,204+(i%5)*28);}
    ctx.fillStyle="#ff6f9c";ctx.fillRect(state.obstacle-12,346,25,58);text("LASER",state.obstacle,330,15);
    ctx.fillStyle=state.switch?"#a2ffe8":"#ffdd8d";ctx.fillRect(490,392,55,12);text("SWITCH",516,373,15);
    for(const [i,x] of [620,715].entries()){orb(x,167,26,state.broadcast?cyan:"#7f819d");text(state.broadcast?"⚡":"?",x,174,22);text("TOWER "+(i+1),x,216,14);}
    orb(state.x,380-state.jump,19,cyan);text("▶",state.x,387-state.jump,19,C[0]);
    text("JUMP laser → PRESS SWITCH → ACTION to BROADCAST → EXIT",400,33,19);
    hud.textContent="BROADCAST: "+(state.broadcast?"ON":"OFF");
  }else if(id===2){
    ctx.fillStyle="#226b89";ctx.fillRect(36,160,726,220);
    for(let i=0;i<6;i++){ctx.fillStyle="#9af8e977";ctx.fillRect(92+i*110,175,12,185);}
    ctx.fillStyle="#ffdf88";ctx.fillRect(700,120,18,240);text("★",709,99,38);
    const bx=68+state.boat;orb(bx,267,25,cyan);text("⛵",bx,278,36);
    text("REPEAT "+state.count+"  |  ITERATION "+state.iteration+"  |  DISTANCE "+state.boat+"/660",400,42,21);
    text("ONE LOOP BODY: MOVE 110 PIXELS",400,436,22);
    hud.textContent="ITERATION "+state.iteration+"/"+state.count;
  }else if(id===3){
    for(const l of [{x:400,y:240},{x:505,y:340}]){orb(l.x,l.y,25,"#ff665f");text("LAVA",l.x,l.y+43,13);}
    if(!state.key){orb(258,155,22,gold);text("🔑",258,164,30);}
    orb(698,120,34,state.key?"#8dfdc0":"#ff7c90");text(state.key?"OPEN":"🔒",698,126,22);
    orb(state.x,state.y,19,cyan);text("◆",state.x,state.y+6,19,C[0]);
    text("IF touching KEY → inventory true | IF touching LAVA → lose health",400,38,18);
    hud.textContent="KEY "+(state.key?"YES":"NO")+" • ♥ "+state.health;
  }else if(id===4){
    ctx.fillStyle="#304978";ctx.fillRect(0,439,800,41);
    for(const d of state.drops){orb(d.x,d.y,17,d.type==="gem"?gold:"#ff5d8b");text(d.type==="gem"?"◆":"×",d.x,d.y+7,22,C[0]);}
    orb(state.x,420,29,state.invulnerable>0?"#fff":cyan);text("🚀",state.x,428,33);
    text("COLLECT 10 GEMS • AVOID GLITCHES • VARIABLES CHANGE LIVE",400,37,19);
    hud.textContent="SCORE "+state.score+"/10  •  ♥ "+state.lives;
  }
  if(paused&&!won){ctx.fillStyle="#080d24cc";ctx.fillRect(0,0,800,480);text("PAUSED",400,240,54);}
 }
 function addLoopButtons(){
   if(id!==2)return;
   const area=mount.querySelector(".showcase-actions");area.innerHTML='<button data-count="2">REPEAT 2</button><button data-count="4">REPEAT 4</button><button data-count="6">REPEAT 6</button>';
   for(const b of area.querySelectorAll("[data-count]"))b.addEventListener("click",()=>{if(!paused&&!won)runLoop(Number(b.dataset.count));});
 }
 function keyDown(e){
   if(!alive||!mount.contains(document.activeElement))return;
   const direction={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right"}[e.key];
   if(direction){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)move(direction);}
   if(e.key===" "||e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)action();}
 }
 document.addEventListener("keydown",keyDown,true);
 for(const b of mount.querySelectorAll("[data-dir]"))b.addEventListener("click",()=>move(b.dataset.dir));
 mount.querySelector("[data-action]").addEventListener("click",action);
 addLoopButtons();
 const toggleLens=()=>{code.hidden=!code.hidden;};
 mount.querySelector("[data-code]").addEventListener("click",toggleLens);
 mount.querySelector("[data-endcode]").addEventListener("click",()=>{overlay.hidden=true;toggleLens();});
 mount.querySelector("[data-retry]").addEventListener("click",reset);
 mount.querySelector("[data-restart]").addEventListener("click",reset);
 mount.querySelector("[data-pause]").addEventListener("click",e=>{if(won)return;paused=!paused;e.currentTarget.textContent=paused?"▶ RESUME":"Ⅱ PAUSE";});
 mount.querySelector("[data-demo]").addEventListener("click",e=>{reset();demo=true;e.currentTarget.textContent="★ DEMO ACTIVE";say("Teacher demo: observe which code concept changes the game.");});
 function demoStep(){
    if(id===0){const t=state.goals[state.index];if(t){if(state.col<t[0])move("right");else if(state.col>t[0])move("left");else if(state.row<t[1])move("down");else if(state.row>t[1])move("up");}}
    if(id===1){if(state.x<340)action();move("right");if(state.switch&&!state.broadcast)action();}
    if(id===2&&!state.running&&state.boat<660)runLoop(6);
    if(id===3){if(!state.key){if(state.x<258)move("right");else move("up");}else{if(state.y>120)move("up");else move("right");}}
    if(id===4){const target=state.drops.find(d=>d.type==="gem"&&d.y>200);if(target)state.x=target.x;}
 }
 function loop(t){
   if(!alive)return;const dt=Math.min(.05,Math.max(0,(t-last)/1000||0));last=t;
   if(!paused&&!won){update(dt);if(demo&&Math.floor(t/290)!==Math.floor((t-dt*1000)/290))demoStep();}
   draw();raf=requestAnimationFrame(loop);
 }
 reset();raf=requestAnimationFrame(loop);
 return ()=>{alive=false;cancelAnimationFrame(raf);document.removeEventListener("keydown",keyDown,true);keys.clear();};
}
function render(game,mount,api){
 if(active){active();active=null;}
 const id=titles.indexOf(game.title);
 if(id<0){previous.render(game,mount,api);return;}
 previous.reset();active=make(game,mount,api,id);
}
function reset(){if(active){active();active=null;}previous.reset();}
window.GameLabGames={render,reset};
})();
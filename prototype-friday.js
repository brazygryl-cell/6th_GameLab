/* Friday: evidence-based prototype testing. Standalone renderer overlays only Day 5. */
(function(){
"use strict";
const previous=window.GameLabGames;
let cleanup=null;
function start(game,mount,api){
  let alive=true,raf=0,last=0,elapsed=0,playing=false,phase=0,stage="draft",revision=null,player={x:0,y:2},route=[],moveTick=0,trail=[],messageText="",mode="lesson",movesLeft=22,hardTime=35;
  const W=800,H=480,cols=8,rows=5,S=74,ox=93,oy=65,exit={x:7,y:2},key={x:5,y:1};
  const wallCells=new Set(["3,0","3,1","3,3","3,4","5,3","6,3"]);
  const hardWalls=new Set(["1,0","2,0","4,0","1,1","4,1","6,1","2,2","4,2","6,2","2,3","6,3","0,4","4,4"]);
  const hardHazards=new Set(["1,2","3,2","6,0"]);
  const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  mount.innerHTML='<div class="showcase prototype-lab"><div class="showcase-top"><span class="showcase-chip">DAY 05 • DESIGNER PLAYTEST LAB</span><span class="showcase-hud" data-phase>BUILD 01 / TEST 01</span></div><h3>PROTOTYPE PIT CREW</h3><p class="showcase-sub">Build a test version. Watch someone play. Catch the confusing rule. Change ONE thing. Test again.</p><div class="showcase-play"><canvas width="800" height="480" tabindex="0" aria-label="Top-down neon maze prototype. Use arrow keys or directional buttons to move."></canvas><div class="showcase-overlay" hidden><strong data-endtitle></strong><p data-endmsg></p><button data-again>↻ TRY ANOTHER PLAYTEST</button><button data-end-lens>⌘ SHOW CODE LENS</button></div></div><div class="showcase-bottom"><div class="showcase-actions"><button data-move="up">▲</button><button data-move="left">◀</button><button data-move="down">▼</button><button data-move="right">▶</button></div><div class="showcase-tools"><button data-test>▶ RUN PLAYTEST</button><button data-hard>☠ HARD MAZE</button><button data-restart>↻ RESET</button><button data-togglelens>⌘ CODE LENS</button></div></div><div class="showcase-message" role="status" aria-live="polite" data-message>Challenge: Reach the exit. But is the prototype actually understandable?</div><div class="prototype-report" data-report><strong>DESIGNER NOTEBOOK</strong><p data-reporttext>Version 1: A player can move around the maze. Run a playtest before deciding whether the game works.</p><div class="prototype-choices" data-choices hidden><p><strong>Choose ONE revision to test:</strong></p><button data-fix="clarity">🔑 Add a visible key + explain the locked-door rule</button><button data-fix="colors">🎨 Make the walls brighter without changing the rule</button><button data-fix="hazards">⚠ Add more obstacles without explaining the door</button></div><p data-feedback aria-live="polite"></p></div><section class="showcase-lens" hidden><h4>🔍 CODE LENS — PROTOTYPE → OBSERVATION → ITERATION</h4><p>These snippets show the actual rules behind the playtest.</p><strong>HTML • THE INTERFACE</strong><pre>&lt;canvas aria-label="Maze prototype"&gt;&lt;/canvas&gt;</pre><strong>CSS • THE PLAYTEST FEEDBACK</strong><pre>.prototype-report { border-left: 6px solid #77f7da; }</pre><strong>JAVASCRIPT • THE REVISION CHANGES BEHAVIOR</strong><pre>if (revision === "clarity" &amp;&amp; hasKey) openGate();</pre><p><b>Ask:</b> What was your observation? What one thing did you change? What happened on the second test?</p></section></div>';
  const canvas=mount.querySelector("canvas"),ctx=canvas.getContext("2d"),status=mount.querySelector("[data-message]"),report=mount.querySelector("[data-reporttext]"),choices=mount.querySelector("[data-choices]"),feedback=mount.querySelector("[data-feedback]"),phaseLabel=mount.querySelector("[data-phase]"),overlay=mount.querySelector(".showcase-overlay"),test=mount.querySelector("[data-test]"),hardBtn=mount.querySelector("[data-hard]");
  let hasKey=false;
  function say(t){messageText=t;status.textContent=t;api.announce(t);}
  const cell=(x,y)=>({x:ox+x*S+S/2,y:oy+y*S+S/2});
  function activeWalls(){return mode==="hard"?hardWalls:wallCells;}
  function valid(x,y){return x>=0&&x<cols&&y>=0&&y<rows&&!activeWalls().has(x+","+y);}
  // Deterministic route: from start to the exit via the center corridor.
  const firstRoute=[[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2]];
  const secondRoute=[[1,2],[2,2],[3,2],[4,2],[5,2],[5,1],[5,2],[6,2],[7,2]];
  function reset(){
    phase=0;stage="draft";revision=null;player={x:0,y:2};hasKey=false;playing=false;route=[];trail=[];elapsed=0;moveTick=0;mode="lesson";movesLeft=22;hardTime=35;
    overlay.hidden=true;choices.hidden=true;feedback.textContent="";phaseLabel.textContent="BUILD 01 / TEST 01";test.textContent="▶ RUN PLAYTEST";test.disabled=false;
    report.textContent="Version 1: A player can move around the maze. Run a playtest before deciding whether the game works.";
    say("Challenge: Reach the exit. But is the prototype actually understandable?");
  }
  function finishHard(won,reason){
    stage=won?"won":"hardlost";playing=false;overlay.hidden=false;
    overlay.querySelector("[data-endtitle]").textContent=won?"☠ HARD MAZE CONQUERED!":"MAZE LOCKED YOU OUT";
    overlay.querySelector("[data-endmsg]").textContent=reason;
    phaseLabel.textContent=won?"HARD MODE • CLEARED":"HARD MODE • FAILED";
    report.textContent=won?"HARD-MODE EVIDENCE: You planned a route, collected the key, avoided false paths, and escaped within the limits.":"Revise your route. The fastest-looking path is not always the usable path.";
    say(reason);api.sound(won?"success":"error");if(won)api.celebrate();
  }
  function startHard(){
    mode="hard";phase=1;stage="hard";revision="clarity";player={x:0,y:2};hasKey=false;playing=false;route=[];trail=[];movesLeft=22;hardTime=35;
    overlay.hidden=true;choices.hidden=true;test.disabled=true;test.textContent="HARD MODE ACTIVE";
    phaseLabel.textContent="HARD MODE • 22 MOVES • 35 SECONDS";
    report.textContent="HARD MODE: Collect the key before reaching the exit. You have 22 moves and 35 seconds. Purple warning tiles cost 3 extra moves.";
    say("HARD MODE! Find the key, avoid penalty tiles, and unlock the exit before time or moves run out.");canvas.focus();
  }
  function arrive(){
    if(phase===0){
      playing=false;stage="observe";phaseLabel.textContent="OBSERVE • IDENTIFY A PROBLEM";
      report.textContent='OBSERVATION: The player reached a locked exit and hesitated. The rules never explained that a key was needed—and no key was visible. That is evidence, not just "this game is bad."';
      say("PLAYTEST FOUND A PROBLEM! The player reached the exit, but the missing rule made the game impossible to finish.");
      choices.hidden=false;test.disabled=true;test.textContent="REVISE FIRST";
      api.sound("error");
    }else{
      if(revision==="clarity"&&hasKey){
        playing=false;stage="won";phaseLabel.textContent="VERSION 02 • SUCCESS";
        overlay.hidden=false;
        overlay.querySelector("[data-endtitle]").textContent="★ PROTOTYPE IMPROVED!";
        overlay.querySelector("[data-endmsg]").textContent="You observed confusion, changed one rule, and tested again. The player could now find the key and unlock the door. That is iteration!";
        report.textContent="PLAYTEST EVIDENCE: In version 1, the player could not understand the locked door. In version 2, a key, clue, and clear rule allowed the player to finish.";
        say("Success! Your evidence-based revision made the level playable.");api.sound("success");api.celebrate();
      }else{
        playing=false;stage="rethink";phaseLabel.textContent="VERSION 02 • NEEDS ANOTHER REVISION";
        report.textContent="SECOND OBSERVATION: The player still cannot open the door. Changing the decoration or adding obstacles did not solve the missing-information problem. Try a revision that addresses the evidence.";
        say("The second playtest failed. The problem remains! Choose a change that explains and unlocks the door.");
        choices.hidden=false;test.disabled=true;test.textContent="REVISE AGAIN";api.sound("error");
      }
    }
  }
  function move(dir,fromAuto=false){
    if(!alive||stage==="won"||stage==="hardlost"||stage==="observe"||stage==="rethink")return;
    const offset={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];
    if(!offset)return;
    const nx=player.x+offset[0],ny=player.y+offset[1];
    if(!valid(nx,ny)){if(!fromAuto)say("That wall blocks the path. Your playtester needs a usable route.");return;}
    player={x:nx,y:ny};trail.push({...player});if(trail.length>15)trail.shift();
    if(mode==="hard"){
      movesLeft--;
      if(hardHazards.has(nx+","+ny)){movesLeft-=3;say("PENALTY TILE! You lost 3 extra moves. Reroute!");api.sound("error");}
      if(nx===key.x&&ny===key.y&&!hasKey){hasKey=true;say("KEY FOUND! Now reach the locked exit.");api.sound("click");}
      if(nx===exit.x&&ny===exit.y){if(hasKey)finishHard(true,"You found the key and escaped the hard maze with moves to spare!");else say("LOCKED! Collect the key before reaching the exit.");}
      if(movesLeft<=0&&stage==="hard")finishHard(false,"Out of moves! Plan a cleaner route and try again.");
      return;
    }
    if(phase===1&&revision==="clarity"&&nx===key.x&&ny===key.y&&!hasKey){hasKey=true;say("KEY FOUND! The visible clue tells the player why they need it.");api.sound("click");}
    if(nx===exit.x&&ny===exit.y)arrive();
  }
  function runTest(){
    if(playing||stage==="won"||stage==="observe"||stage==="rethink")return;
    player={x:0,y:2};hasKey=false;trail=[];playing=true;stage="testing";moveTick=0;
    phaseLabel.textContent=phase===0?"PLAYTEST 01 • OBSERVE":"PLAYTEST 02 • RETEST";
    test.textContent="▶ TEST IN PROGRESS";test.disabled=true;
    route=(phase===0?firstRoute:secondRoute).slice();
    say("Watch the player. Where do they hesitate, and WHY?");
  }
  for(const b of mount.querySelectorAll("[data-fix]"))b.addEventListener("click",()=>{
    revision=b.dataset.fix;phase=1;stage="draft";playing=false;player={x:0,y:2};hasKey=false;route=[];trail=[];
    choices.hidden=true;feedback.textContent="";test.disabled=false;test.textContent="▶ RETEST VERSION 02";phaseLabel.textContent="REVISE 01 • RETEST 02";
    const notices={clarity:"Revision: a glowing key and the rule 'Collect the key to unlock the exit' will appear.",colors:"Revision: brighter walls. Does that solve the missing locked-door rule?",hazards:"Revision: extra hazards. Does that help the player understand the door?"};
    report.textContent=notices[revision];say("One change made. Now retest the prototype and compare the outcome.");
  });
  test.addEventListener("click",runTest);
  hardBtn.addEventListener("click",startHard);
  for(const b of mount.querySelectorAll("[data-move]"))b.addEventListener("click",()=>move(b.dataset.move));
  const keyDir={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",a:"left",s:"down",d:"right"};
  function handleKey(e){if(!alive||!mount.contains(document.activeElement))return;const d=keyDir[e.key];if(d){e.preventDefault();e.stopImmediatePropagation();move(d);}}
  document.addEventListener("keydown",handleKey,true);
  function toggleLens(){const lens=mount.querySelector(".showcase-lens");lens.hidden=!lens.hidden;}
  mount.querySelector("[data-togglelens]").addEventListener("click",toggleLens);
  mount.querySelector("[data-end-lens]").addEventListener("click",()=>{overlay.hidden=true;toggleLens();});
  mount.querySelector("[data-restart]").addEventListener("click",reset);
  mount.querySelector("[data-again]").addEventListener("click",reset);
  function paint(t){
    ctx.fillStyle="#11152f";ctx.fillRect(0,0,W,H);
    const glow=Math.sin(t/450);
    ctx.fillStyle="#1b2950";ctx.fillRect(ox-15,oy-15,cols*S+30,rows*S+30);
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const p=cell(x,y),wall=activeWalls().has(x+","+y);
      ctx.fillStyle=wall?(revision==="colors"?"#facc15":"#574c8b"):"#26355e";ctx.fillRect(p.x-S/2+2,p.y-S/2+2,S-4,S-4);
      if(wall){ctx.strokeStyle="#bba8ff";ctx.strokeRect(p.x-S/2+9,p.y-S/2+9,S-18,S-18);}
      else {ctx.strokeStyle="#3d5486";ctx.strokeRect(p.x-S/2+2,p.y-S/2+2,S-4,S-4);}
    }
    for(const p of trail){const c=cell(p.x,p.y);ctx.fillStyle="#59f7dc44";ctx.fillRect(c.x-8,c.y-8,16,16);}
    const door=cell(exit.x,exit.y);ctx.save();ctx.shadowColor="#ff6a98";ctx.shadowBlur=22;ctx.fillStyle="#ff507e";ctx.fillRect(door.x-24,door.y-29,48,58);ctx.restore();
    ctx.textAlign="center";ctx.fillStyle="white";ctx.font="bold 23px sans-serif";ctx.fillText("🔒",door.x,door.y+8);
    if(phase===1&&revision==="clarity"){
      const k=cell(key.x,key.y);if(!hasKey){ctx.save();ctx.shadowColor="#ffe88a";ctx.shadowBlur=20;ctx.font="34px sans-serif";ctx.fillText("🔑",k.x,k.y+11);ctx.restore();}
      ctx.fillStyle="#e9ffb1";ctx.font="bold 18px sans-serif";ctx.fillText("RULE: COLLECT KEY → UNLOCK EXIT",400,37);
    }else{
      ctx.fillStyle="#fff";ctx.font="bold 18px sans-serif";ctx.fillText("GOAL: REACH THE EXIT",400,37);
    }
    if(revision==="hazards"){ctx.font="26px sans-serif";for(const p of [{x:4,y:0},{x:6,y:4}]){const c=cell(p.x,p.y);ctx.fillText("⚠",c.x,c.y+9);}}
    if(mode==="hard"){
      ctx.font="25px sans-serif";for(const value of hardHazards){const [hx,hy]=value.split(",").map(Number),c=cell(hx,hy);ctx.fillText("☠",c.x,c.y+9);}
      const k=cell(key.x,key.y);if(!hasKey){ctx.font="32px sans-serif";ctx.fillText("🔑",k.x,k.y+10);}
      ctx.textAlign="left";ctx.fillStyle="#ffd84a";ctx.font="bold 17px sans-serif";ctx.fillText(`MOVES: ${movesLeft}   TIME LEFT: ${Math.ceil(hardTime)}s   KEY: ${hasKey?"YES":"NO"}`,20,38);
    }
    const p=cell(player.x,player.y);ctx.save();ctx.shadowColor="#73ffe6";ctx.shadowBlur=22;ctx.translate(p.x,p.y);ctx.rotate(playing?Math.sin(t/200)*.1:0);ctx.fillStyle="#78ffe2";ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(18,16);ctx.lineTo(0,8);ctx.lineTo(-18,16);ctx.closePath();ctx.fill();ctx.restore();
    ctx.textAlign="left";ctx.fillStyle="#fff";ctx.font="bold 17px sans-serif";ctx.fillText(stage==="testing"?"▶ WATCH THE PLAYTEST":"CONTROLS: ARROWS / WASD / TOUCH",20,464);
  }
  function tick(now){
    if(!alive)return;
    const dt=Math.min(.05,(now-last)/1000||0);last=now;elapsed+=dt;
    if(mode==="hard"&&stage==="hard"){hardTime-=dt;if(hardTime<=0)finishHard(false,"TIME! The maze locked before you escaped. Try a faster route.");}
    if(playing){moveTick+=dt;if(moveTick>=.28){moveTick=0;const next=route.shift();if(next){player={x:next[0],y:next[1]};trail.push({...player});if(phase===1&&revision==="clarity"&&player.x===key.x&&player.y===key.y){hasKey=true;say("The playtester saw the key and collected it!");api.sound("click");}if(player.x===exit.x&&player.y===exit.y)arrive();}}}
    paint(now);raf=requestAnimationFrame(tick);
  }
  reset();raf=requestAnimationFrame(tick);
  return ()=>{alive=false;cancelAnimationFrame(raf);document.removeEventListener("keydown",handleKey,true);};
}
function render(game,mount,api){
  if(cleanup){cleanup();cleanup=null;}
  if(game.title==="Prototype Pit Crew"){previous.reset();cleanup=start(game,mount,api);}else previous.render(game,mount,api);
}
function reset(){if(cleanup){cleanup();cleanup=null;}previous.reset();}
window.GameLabGames={render,reset};
})();

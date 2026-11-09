/* Week 01 Showstopper Arcade — self-contained, no dependencies.
   Replaces only the five Inventor's Arcade game samples. */
(function () {
  "use strict";
  const original = window.GameLabGames;
  const TITLES = ["Goal Hunt","Rules Remix","Sequence Sprint","Feedback Factory","Prototype Detective"];
  const NAMES = ["PORTAL PANIC","RULEBREAKER ARENA","TEMPLE OF THE MISSING STEP","SIGNAL STORM","PROTOTYPE PIT CREW"];
  const SUBS = [
    "Dash through a neon maze. Gather three power crystals, then reach the portal.",
    "Outmaneuver patrol drones. Choose and obey the rules to survive.",
    "Unlock a mysterious gate by collecting the runes in the correct order.",
    "Defend the signal tower. Aim and launch pulses at incoming glitches.",
    "Repair a damaged rocket while dodging roaming bugs. Make the launch happen."
  ];
  const LENS = [
    {topic:"GOAL • CHALLENGE • FEEDBACK",html:'<canvas aria-label="Playable world"></canvas>',css:'.portal { box-shadow: 0 0 30px cyan; }',js:'if (hero.touches(crystal)) { score++; showFeedback(); }'},
    {topic:"RULES AND CONSTRAINTS",html:'<button>Choose your rule</button>',css:'.danger { animation: warning 1s infinite; }',js:'if (rule === "noDash" && dashing) return;'},
    {topic:"EVENTS AND SEQUENCE",html:'<canvas aria-label="Temple puzzle"></canvas>',css:'.rune { filter: drop-shadow(0 0 12px gold); }',js:'if (rune.id === order[step]) { step++; openGate(); }'},
    {topic:"INPUT AND FEEDBACK",html:'<button>FIRE SIGNAL</button>',css:'.pulse { transition: transform .2s; }',js:'if (pulse.hits(glitch)) { shield++; spawnParticles(); }'},
    {topic:"PROTOTYPES AND DEBUGGING",html:'<canvas aria-label="Rocket hangar"></canvas>',css:'.rocket.ready { animation: launch 1s; }',js:'if (parts.every(part => part.fixed)) launchRocket();'}
  ];
  const palettes = [
    ["#100e31","#29186e","#36fff0","#ffdf6c"],
    ["#160f2b","#431a52","#ff8d7b","#92ffd3"],
    ["#101b32","#24456c","#ffe283","#96fff0"],
    ["#091b32","#19446a","#64dcff","#ff72a7"],
    ["#16162e","#47395f","#a2ffb8","#ffc67e"]
  ];
  let activeCleanup = null;
  let rootMount = null;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const rectHit=(a,b)=>Math.abs(a.x-b.x)<(a.r||15)+(b.r||15) && Math.abs(a.y-b.y)<(a.r||15)+(b.r||15);
  function start(game,mount,api,id){
    if(activeCleanup)activeCleanup();
    const [bg,deep,bright,gold] = palettes[id];
    let alive=true,done=false,paused=false, demo=false, last=0,raf=0,elapsed=0,score=0,lives=3,step=0,shots=[],sparks=[],toast="",toastTime=0;
    let player={x:76,y:265,r:15}, vx=0,vy=0,angle=0,phase=0,rule="dash";
    const keys=new Set(), objective=id===0?3:id===1?5:id===2?3:id===3?8:4;
    const things=[];
    const random=(n)=>((Math.sin(n*78.233+id*30.1)*43758.5453)%1+1)%1;
    const place=(x,y,r=13)=>({x,y,r});
    if(id===0) things.push(place(230,145),place(415,360),place(650,145));
    if(id===1) for(let i=0;i<10;i++)things.push({...place(165+i*61,110+(i%2)*280,15),type:"danger",seed:i});
    if(id===2) things.push(place(180,130),place(420,390),place(630,155));
    if(id===3) for(let i=0;i<6;i++)things.push({x:110+i*135,y:40-(i%3)*100,r:19,type:"glitch",speed:30+i*5});
    if(id===4) things.push(place(190,135),place(375,400),place(575,160),place(680,410));
    mount.innerHTML = '<div class="showcase"><div class="showcase-top"><span class="showcase-chip">DAY '+String(id+1).padStart(2,"0")+' • INTERACTIVE ARCADE</span><span class="showcase-hud">⚡ <b data-score>0</b> / '+objective+' &nbsp; ♥ <b data-lives>3</b></span></div><h3>'+NAMES[id]+'</h3><p class="showcase-sub">'+SUBS[id]+'</p><div class="showcase-play"><canvas width="800" height="500" tabindex="0" role="img" aria-label="'+NAMES[id]+' game. Use direction buttons or arrow keys."></canvas><div class="showcase-overlay" hidden><strong data-endtitle></strong><p data-endmsg></p><button data-again>PLAY AGAIN ↻</button><button data-lens>HOW WAS THIS BUILT? &lt;/&gt;</button></div></div><div class="showcase-bottom"><div class="showcase-actions"><button data-action="up" aria-label="Move up">▲</button><button data-action="left" aria-label="Move left">◀</button><button data-action="down" aria-label="Move down">▼</button><button data-action="right" aria-label="Move right">▶</button><button data-action="fire">'+(id===3?"⚡ FIRE":id===1?"⚡ DASH":"✦ ACTION")+'</button></div><div class="showcase-tools"><button data-demo>▶ TEACHER DEMO</button><button data-pause>Ⅱ PAUSE</button><button data-restart>↻ RESET</button><button data-togglelens>⌘ CODE LENS</button></div></div><div class="showcase-message" role="status" aria-live="polite" data-msg>Use the arrows or on-screen controls. Make a choice. Watch the world react.</div><section class="showcase-lens" hidden><h4>🔍 CODE LENS — '+LENS[id].topic+'</h4><p>Three web technologies make this playable experience. These are short teaching excerpts illustrating the mechanics.</p><div><strong>HTML • WHAT EXISTS</strong><pre data-html></pre><strong>CSS • HOW IT LOOKS</strong><pre data-css></pre><strong>JAVASCRIPT • WHAT HAPPENS</strong><pre data-js></pre></div><p><b>Ask students:</b> Which line creates the behavior? What would happen if we changed it?</p></section></div>';
    const canvas=mount.querySelector("canvas"),ctx=canvas.getContext("2d");
    const hud=mount.querySelector("[data-score]"),hearts=mount.querySelector("[data-lives]"),msg=mount.querySelector("[data-msg]");
    const overlay=mount.querySelector(".showcase-overlay"),lens=mount.querySelector(".showcase-lens");
    lens.querySelector("[data-html]").textContent=LENS[id].html;
    lens.querySelector("[data-css]").textContent=LENS[id].css;
    lens.querySelector("[data-js]").textContent=LENS[id].js;
    const reduced=()=>document.body.classList.contains("reduced-motion");
    const high=()=>document.body.classList.contains("high-contrast");
    function message(t){toast=t;toastTime=2.4;msg.textContent=t;api.announce(t);}
    function burst(x,y){if(reduced())return;for(let i=0;i<15;i++){let a=i/15*Math.PI*2;sparks.push({x,y,dx:Math.cos(a)* (50+i*6),dy:Math.sin(a)*(50+i*6),life:.7});}}
    function updateHud(){hud.textContent=score;hearts.textContent=lives;}
    function finish(win){
      if(done)return;done=true;paused=true;overlay.hidden=false;
      overlay.querySelector("[data-endtitle]").textContent=win?"★ MISSION COMPLETE!":"SYSTEM REBOOT REQUIRED";
      overlay.querySelector("[data-endmsg]").textContent=win?
        ["A clear goal and live feedback turned moving shapes into a game.","Rules changed the challenge. Designers decide how difficult a game feels.","Order mattered. The gate could not open before the runes activated.","Every action triggered immediate feedback. That is why games feel responsive.","You tested and repaired a real system. Iteration makes ideas better."][id]:
        "Great games reward another try. Read the feedback, change your strategy, and replay.";
      if(win){api.sound("success");api.celebrate();}
      else api.sound("error");
      message(win?"Mission complete. Open Code Lens to see why it worked.":"Try again. Adjust the strategy, not just the speed.");
    }
    function lose(){lives--;updateHud();burst(player.x,player.y);api.sound("error");player.x=76;player.y=265;vx=0;vy=0;if(lives<=0)finish(false);else message("Collision! You have "+lives+" lives left. Try another route.");}
    function reset(){
      score=0;lives=3;step=0;elapsed=0;done=false;paused=false;demo=false;toast="";toastTime=0;
      player={x:76,y:265,r:15};vx=vy=angle=phase=0;shots=[];sparks=[];overlay.hidden=true;keys.clear();
      if(id===0||id===2||id===4)things.forEach(t=>t.used=false);
      if(id===1){rule="dash";things.forEach(t=>t.used=false);}
      if(id===3){things.length=0;for(let i=0;i<6;i++)things.push({x:100+i*135,y:30-(i%3)*105,r:19,type:"glitch",speed:30+i*5});}
      updateHud();message("New round! Use the arrows and the ACTION button.");canvas.focus({preventScroll:true});
    }
    let touchDirection=null, invuln=0, cooldown=0;
    function action(){
      if(done||paused)return;
      if(id===1){if(rule==="dash"){player.x=clamp(player.x+Math.cos(angle)*82,22,778);player.y=clamp(player.y+Math.sin(angle)*82,32,468);burst(player.x,player.y);message("DASH! The rule allows a special move.");}else message("DASH DISABLED. A rule has changed your options.");}
      if(id===3){if(cooldown>0)return;shots.push({x:player.x+15,y:player.y,dx:500,life:1.8,r:7});cooldown=.25;api.sound("click");}
      if(id===2) message("Find the glowing runes in order: 1 → 2 → 3.");
      if(id===0) message("Collect all three crystals, then reach the portal on the right.");
      if(id===4) message("Touch each loose rocket part to repair it!");
    }
    function interact(e){
      const k=e.key.toLowerCase();let direction={arrowup:"up",w:"up",arrowdown:"down",s:"down",arrowleft:"left",a:"left",arrowright:"right",d:"right"}[k];
      if(direction){e.preventDefault();e.stopImmediatePropagation();keys.add(direction);return;}
      if(k===" "||k==="enter"){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)action();}
    }
    function release(e){let direction={arrowup:"up",w:"up",arrowdown:"down",s:"down",arrowleft:"left",a:"left",arrowright:"right",d:"right"}[e.key.toLowerCase()];if(direction){keys.delete(direction);e.preventDefault();}}
    // Capture only while this game has focus. Do not hijack lesson navigation elsewhere.
    function keyDown(e){if(!alive||!mount.isConnected||!mount.contains(document.activeElement))return;interact(e);}
    function keyUp(e){release(e);}
    document.addEventListener("keydown",keyDown,true);document.addEventListener("keyup",keyUp,true);
    function toggleLens(){lens.hidden=!lens.hidden;if(!lens.hidden)lens.scrollIntoView({block:"nearest",behavior:"instant"});}
    for(const button of mount.querySelectorAll("[data-action]")){
      const dir=button.dataset.action;
      if(dir==="fire"){button.addEventListener("click",action);continue;}
      const down=e=>{e.preventDefault();touchDirection=dir;keys.add(dir);};
      const up=()=>{keys.delete(dir);if(touchDirection===dir)touchDirection=null;};
      button.addEventListener("pointerdown",down);button.addEventListener("pointerup",up);button.addEventListener("pointercancel",up);
      button.addEventListener("pointerleave",up);
      button.addEventListener("click",()=>{if(!("PointerEvent" in window)){keys.add(dir);setTimeout(()=>keys.delete(dir),180);}});
    }
    mount.querySelector("[data-restart]").addEventListener("click",reset);
    mount.querySelector("[data-again]").addEventListener("click",reset);
    mount.querySelector("[data-lens]").addEventListener("click",()=>{toggleLens();});
    mount.querySelector("[data-togglelens]").addEventListener("click",toggleLens);
    mount.querySelector("[data-pause]").addEventListener("click",e=>{if(done)return;paused=!paused;e.currentTarget.textContent=paused?"▶ RESUME":"Ⅱ PAUSE";message(paused?"Game paused.":"Back in the game!");});
    mount.querySelector("[data-demo]").addEventListener("click",e=>{reset();demo=true;e.currentTarget.textContent="★ DEMO RUNNING";message("Teacher demo: watch the code control the player.");});
    function update(dt){
      elapsed+=dt;invuln=Math.max(0,invuln-dt);cooldown=Math.max(0,cooldown-dt);
      toastTime=Math.max(0,toastTime-dt);
      let dx=(keys.has("right")?1:0)-(keys.has("left")?1:0);
      let dy=(keys.has("down")?1:0)-(keys.has("up")?1:0);
      if(demo){ // deterministic guided tour; students still see real mechanics
        let target;
        if(id===0||id===2||id===4){target=id===2?things[[1,0,2][step]]:things.find(t=>!t.used);if(!target)target={x:755,y:260};}
        else if(id===1)target={x:760,y:260};
        else {target={x:120,y:430};if(cooldown<=0)action();}
        dx=Math.sign(target.x-player.x)*(Math.abs(target.x-player.x)>6);
        dy=Math.sign(target.y-player.y)*(Math.abs(target.y-player.y)>6);
      }
      const length=Math.hypot(dx,dy)||1;
      const speed=id===1?240:205;
      player.x=clamp(player.x+dx/length*speed*dt,20,780);
      player.y=clamp(player.y+dy/length*speed*dt,26,472);
      if(dx||dy)angle=Math.atan2(dy,dx);
      if(id===0){
        for(const t of things)if(!t.used&&rectHit(player,t)){t.used=true;score++;burst(t.x,t.y);updateHud();api.sound("click");message("CRYSTAL +1 • Score is feedback!");}
        if(score===3 && player.x>730&&Math.abs(player.y-260)<80)finish(true);
      }else if(id===1){
        if(elapsed>5&&rule==="dash"){rule="noDash";message("RULE CHANGE! Dash disabled. Now dodge patrols!");}
        for(const t of things){
          const tx=t.x+Math.sin(elapsed*1.6+t.seed)*28;
          const ty=t.y+Math.cos(elapsed*1.2+t.seed)*35;
          if(Math.hypot(player.x-tx,player.y-ty)<27&&invuln<=0&&!demo){invuln=1.6;lose();}
        }
        score=clamp(Math.floor(elapsed/4),0,5);updateHud();
        if(elapsed>=20)finish(true);
      }else if(id===2){
        const order=[1,0,2];
        for(let i=0;i<things.length;i++){
          const t=things[i];if(!t.used&&rectHit(player,t)){
            if(order[step]===i){t.used=true;step++;score=step;updateHud();burst(t.x,t.y);api.sound("click");message("SEQUENCE SUCCESS: Rune "+step+" activated.");}
            else if(invuln<=0){invuln=1.1;message("Wrong order! Next is rune "+(step+1)+". Follow the glowing trail.");api.sound("error");}
          }
        }
        if(step===3&&player.x>725&&Math.abs(player.y-260)<95)finish(true);
      }else if(id===3){
        for(const t of things){t.y+=t.speed*dt;t.x+=Math.sin(elapsed*2+t.speed)*.35;if(t.y>500){t.y=-40;t.x=100+random(elapsed+t.speed)*620;if(!demo&&invuln<=0){invuln=1;lose();}}}
        for(const s of shots){s.x+=s.dx*dt;s.life-=dt;for(const t of things){if(Math.hypot(s.x-t.x,s.y-t.y)<26&&s.life>0){s.life=0;t.y=-45;t.x=90+random(elapsed+score)*650;score++;burst(s.x,s.y);updateHud();api.sound("click");message("SIGNAL HIT! Instant feedback tells the player what worked.");}}}
        shots=shots.filter(s=>s.life>0&&s.x<815);
        if(score>=8)finish(true);
      }else if(id===4){
        for(const t of things)if(!t.used&&rectHit(player,t)){t.used=true;score++;updateHud();burst(t.x,t.y);api.sound("click");message("REPAIRED PART "+score+"/4! Test, fix, repeat.");}
        if(score===4&&player.x>725&&Math.abs(player.y-260)<90)finish(true);
      }
      sparks=sparks.filter(s=>s.life>0);for(const s of sparks){s.x+=s.dx*dt;s.y+=s.dy*dt;s.life-=dt;}
    }
    function draw(){
      const W=800,H=500;ctx.fillStyle=high()?"#080808":bg;ctx.fillRect(0,0,W,H);
      const now=elapsed;
      if(!reduced()){ctx.globalAlpha=.13;for(let i=0;i<28;i++){const x=(i*101+now*8)%W,y=(i*73)%H;ctx.fillStyle=bright;ctx.fillRect(x,y,2,2);}ctx.globalAlpha=1;}
      const grd=ctx.createLinearGradient(0,0,W,H);grd.addColorStop(0,deep);grd.addColorStop(1,bg);
      ctx.fillStyle=grd;ctx.fillRect(18,18,764,464);
      ctx.strokeStyle=bright;ctx.globalAlpha=.21;
      for(let x=30;x<800;x+=45){ctx.beginPath();ctx.moveTo(x,25);ctx.lineTo(x,475);ctx.stroke();}
      for(let y=30;y<500;y+=45){ctx.beginPath();ctx.moveTo(25,y);ctx.lineTo(775,y);ctx.stroke();}ctx.globalAlpha=1;
      ctx.textAlign="center";ctx.font="bold 18px sans-serif";
      if(id===0||id===2||id===4){
        ctx.save();ctx.shadowColor=bright;ctx.shadowBlur=reduced()?0:22;ctx.fillStyle=score===objective?bright:"#77758a";ctx.fillRect(744,194,23,132);ctx.restore();
        ctx.fillStyle="#fff";ctx.font="bold 14px sans-serif";ctx.fillText("PORTAL",742,180);
        for(let i=0;i<things.length;i++){
          const t=things[i];if(t.used)continue;
          ctx.save();ctx.shadowColor=gold;ctx.shadowBlur=reduced()?0:22;ctx.fillStyle=id===2?(i===[1,0,2][step]?gold:"#5a638c"):gold;
          ctx.beginPath();ctx.arc(t.x,t.y,14+(reduced()?0:Math.sin(now*5+i)*3),0,7);ctx.fill();
          ctx.restore();ctx.fillStyle="#13112b";ctx.font="bold 15px sans-serif";ctx.fillText(id===2?String([2,1,3][i]):id===4?"⚙":"✦",t.x,t.y+5);
        }
      }
      if(id===1){
        for(const t of things){const x=t.x+Math.sin(now*1.6+t.seed)*28,y=t.y+Math.cos(now*1.2+t.seed)*35;
          ctx.save();ctx.shadowColor="#ff586e";ctx.shadowBlur=12;ctx.fillStyle="#ff6e7c";ctx.fillRect(x-13,y-13,26,26);ctx.restore();}
        ctx.fillStyle="#fff";ctx.font="bold 20px sans-serif";ctx.fillText(rule==="dash"?"DASH ENABLED":"DASH DISABLED",405,64);
      }
      if(id===3){
        ctx.fillStyle=gold;ctx.fillRect(45,215,25,105);ctx.fillStyle="#fff";ctx.fillText("SIGNAL",78,200);
        for(const t of things){ctx.save();ctx.shadowColor="#fa6f98";ctx.shadowBlur=15;ctx.fillStyle="#fa6f98";ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,7);ctx.fill();ctx.restore();ctx.fillStyle="#1a1232";ctx.fillText("×",t.x,t.y+6);}
        for(const s of shots){ctx.fillStyle=bright;ctx.fillRect(s.x-10,s.y-4,22,8);}
      }
      for(const s of sparks){ctx.globalAlpha=Math.max(0,s.life);ctx.fillStyle=gold;ctx.fillRect(s.x-3,s.y-3,6,6);}ctx.globalAlpha=1;
      ctx.save();ctx.translate(player.x,player.y);ctx.rotate(angle);ctx.shadowColor=bright;ctx.shadowBlur=reduced()?0:25;
      ctx.fillStyle=invuln>0?"#ffffff":bright;ctx.beginPath();ctx.moveTo(21,0);ctx.lineTo(-15,-13);ctx.lineTo(-10,0);ctx.lineTo(-15,13);ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle=bg;ctx.beginPath();ctx.arc(0,0,5,0,7);ctx.fill();ctx.restore();
      if(paused&&!done){ctx.fillStyle="#060717bb";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.font="bold 48px sans-serif";ctx.fillText("PAUSED",400,250);}
      ctx.textAlign="left";ctx.fillStyle="#fff";ctx.font="bold 15px sans-serif";
      if(id===1)ctx.fillText("SURVIVE 20 SECONDS • "+Math.max(0,Math.ceil(20-elapsed))+"s",30,46);
      if(id===2)ctx.fillText("RUNE ORDER: 1 → 2 → 3",30,46);
      if(id===3)ctx.fillText("MOVE UP / DOWN • FIRE TO DEFEND",30,46);
      if(id===4)ctx.fillText("FIND 4 PARTS • REACH LAUNCH GATE",30,46);
    }
    function loop(t){
      if(!alive)return;
      const dt=Math.min(.035,Math.max(0,(t-last)/1000||0));last=t;
      if(!paused&&!done)update(dt);
      draw();raf=requestAnimationFrame(loop);
    }
    function cleanup(){alive=false;cancelAnimationFrame(raf);keys.clear();document.removeEventListener("keydown",keyDown,true);document.removeEventListener("keyup",keyUp,true);if(rootMount===mount)rootMount=null;}
    reset();raf=requestAnimationFrame(loop);rootMount=mount;
    return cleanup;
  }
  function render(game,mount,api){
    const id=TITLES.indexOf(game.title);
    if(activeCleanup){activeCleanup();activeCleanup=null;}
    if(id<0){original.render(game,mount,api);return;}
    original.reset();
    activeCleanup=start(game,mount,api,id);
  }
  function reset(){if(activeCleanup){activeCleanup();activeCleanup=null;}original.reset();}
  window.GameLabGames={render,reset};
})();
(function(){
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const button = (label, attrs="") => `<button ${attrs}>${esc(label)}</button>`;

  function shell(game, inner){
    return `<div class="game-shell"><div class="game-board">${inner}</div><aside class="game-side"><p class="eyebrow">PLAYABLE EXAMPLE</p><h3>${esc(game.title)}</h3><p>${esc(game.instruction)}</p><div class="purpose-box"><strong>WHY THIS EXISTS</strong><br>${esc(game.purpose)}</div><div class="game-status" data-game-status>Ready. Read the directions, then try it.</div><div class="game-controls"><button data-game-restart>↻ Restart</button></div></aside></div>`;
  }

  function setStatus(root,text,kind=""){
    const el=root.querySelector("[data-game-status]");
    if(el){el.textContent=text;el.dataset.kind=kind;}
  }
  function win(root,api,text="You found the pattern. Explain what made it work."){
    setStatus(root,text,"success");api.sound("success");api.celebrate();api.announce(text);
  }
  function miss(root,api,text="Not yet. Use the feedback and try a different choice."){
    setStatus(root,text,"try");api.sound("error");api.announce(text);
  }

  function tapGame(game,root,api){
    let score=0,remaining=game.time||12,timer=null;
    root.innerHTML=shell(game,`<div class="tap-arena" tabindex="0" aria-label="Target arena"><div class="tap-score">SCORE: <b>0</b> / ${game.goal}</div><button class="tap-target" aria-label="Catch target">${esc(game.target||"★")}</button></div>`);
    const arena=root.querySelector(".tap-arena"),target=root.querySelector(".tap-target"),scoreEl=root.querySelector(".tap-score b");
    function move(){target.style.left=`${8+Math.random()*75}%`;target.style.top=`${15+Math.random()*62}%`;}
    function hit(){if(score>=game.goal)return;score++;scoreEl.textContent=score;api.sound("click");move();if(score>=game.goal){clearInterval(timer);target.disabled=true;win(root,api,"Goal reached! The score and movement told you exactly what changed.");}}
    target.addEventListener("click",hit);arena.addEventListener("keydown",e=>{if(e.code==="Space"){e.preventDefault();hit();}});move();
    timer=setInterval(()=>{remaining--;setStatus(root,`Time: ${remaining}s • Score: ${score}/${game.goal}`);if(remaining<=0){clearInterval(timer);target.disabled=true;miss(root,api,`Round over at ${score}/${game.goal}. Restart and change your strategy.`);}},1000);
    return ()=>clearInterval(timer);
  }

  function choiceGame(game,root,api){
    root.innerHTML=shell(game,`<div class="choice-grid">${game.choices.map((c,i)=>button(c,`data-choice="${i}"`)).join("")}</div><div class="choice-result" hidden></div>`);
    const result=root.querySelector(".choice-result");
    root.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",()=>{
      const i=Number(btn.dataset.choice);result.hidden=false;
      if(i===game.correct){result.textContent=game.result||"That choice matches the design goal.";win(root,api,result.textContent);}else{result.textContent="That choice leaves an important question unanswered. Try again.";miss(root,api,result.textContent);}
    }));
  }

  function sequenceGame(game,root,api,customItems){
    const items=customItems||game.items;let step=0;
    root.innerHTML=shell(game,`<div class="sequence-list">${items.map((c,i)=>button(c,`data-seq="${i}"`)).join("")}</div><div class="choice-result">Sequence: <span data-built>—</span></div>`);
    const built=[];
    root.querySelectorAll("[data-seq]").forEach(btn=>btn.addEventListener("click",()=>{
      const i=Number(btn.dataset.seq),expected=game.order[step];
      if(i===expected){built.push(items[i]);step++;btn.disabled=true;btn.classList.add("done");root.querySelector("[data-built]").textContent=built.join(" → ");api.sound("click");if(step===game.order.length)win(root,api,"Sequence complete. Each event now creates the reason for the next.");}
      else miss(root,api,"That event cannot happen yet. Trace what must already be true.");
    }));
  }

  function buildGame(game,root,api){
    const parts=game.parts||game.repairs;const selected=new Set();
    root.innerHTML=shell(game,`<div class="build-grid">${parts.map((p,i)=>button(p,`class="build-part" data-part="${i}" aria-pressed="false"`)).join("")}</div><div class="game-controls"><button data-test>TEST DESIGN</button></div>`);
    root.querySelectorAll("[data-part]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.part);selected.has(i)?selected.delete(i):selected.add(i);btn.classList.toggle("on",selected.has(i));btn.setAttribute("aria-pressed",String(selected.has(i)));api.sound("click");}));
    root.querySelector("[data-test]").addEventListener("click",()=>{const needed=game.needed||[];const complete=needed.every(i=>selected.has(i));complete?win(root,api,"System test passed. Your choices make the intended information or behavior clear."):miss(root,api,"The test found a barrier or missing system. Re-read the purpose and revise.");});
  }

  function coordinateGame(game,root,api){
    let x=0,y=0,index=0;const targets=game.targets;
    root.innerHTML=shell(game,`<div class="frame-stage" style="background:linear-gradient(#e8f8ff 49%,#91c7ff 49% 51%,#e8f8ff 51%);position:relative"><div class="frame-actor" aria-label="Explorer">🛸</div><div style="position:absolute;top:10px;left:12px;font-weight:900">POSITION: <span data-pos>(0, 0)</span><br>TARGET: <span data-target></span></div></div><div class="frame-controls"><button data-move="-1,0">← x</button><button data-move="0,1">↑ y</button><button data-move="0,-1">↓ y</button><button data-move="1,0">x →</button></div>`);
    const actor=root.querySelector(".frame-actor"),pos=root.querySelector("[data-pos]"),target=root.querySelector("[data-target]");
    function draw(){pos.textContent=`(${x}, ${y})`;target.textContent=`(${targets[index][0]}, ${targets[index][1]})`;actor.style.transform=`translate(${x*42}px,${-y*42}px)`;if(x===targets[index][0]&&y===targets[index][1]){index++;api.sound("success");if(index===targets.length){win(root,api,"Route complete. You changed x horizontally and y vertically.");root.querySelectorAll("[data-move]").forEach(b=>b.disabled=true);}else setStatus(root,"Checkpoint reached. Read the next coordinate.");}}
    root.querySelectorAll("[data-move]").forEach(btn=>btn.addEventListener("click",()=>{const [dx,dy]=btn.dataset.move.split(",").map(Number);x=Math.max(-2,Math.min(2,x+dx));y=Math.max(-2,Math.min(2,y+dy));draw();}));draw();
  }

  function loopGame(game,root,api){
    root.innerHTML=shell(game,`<div class="frame-stage"><div class="frame-actor">⛵</div></div><div class="game-controls">${game.counts.map(c=>button(`REPEAT ${c}`,`data-count="${c}"`)).join("")}</div>`);
    root.querySelectorAll("[data-count]").forEach(btn=>btn.addEventListener("click",()=>{const c=Number(btn.dataset.count),actor=root.querySelector(".frame-actor");actor.style.transform=`translateX(${Math.min(220,c*45)}px) rotate(${c*5}deg)`;c===game.correct?win(root,api,`Repeat ${c} reaches the buoy using one reusable pattern.`):miss(root,api,`Repeat ${c} lands short or overshoots. Adjust the iteration count.`);}));
  }

  function roundsGame(game,root,api){
    let round=0;root.innerHTML=shell(game,`<div class="prompt-card"><strong data-need></strong></div><div class="choice-grid" data-round-choices></div>`);
    const need=root.querySelector("[data-need]"),choices=root.querySelector("[data-round-choices]");
    function draw(){const r=game.rounds[round];need.textContent=r.if?`${r.if}…`:r.need;choices.innerHTML=r.options.map(o=>button(o,`data-answer="${esc(o)}"`)).join("");choices.querySelectorAll("[data-answer]").forEach(btn=>btn.addEventListener("click",()=>{if(btn.dataset.answer===r.answer||btn.dataset.answer===r.then){round++;api.sound("click");if(round===game.rounds.length)win(root,api,"All scenarios solved. Each response matches the condition or production need.");else{setStatus(root,"Correct. The system is ready for the next scenario.");draw();}}else miss(root,api,"That response does not solve this specific condition. Try again.");}));}draw();
  }

  function scoreGame(game,root,api){
    let score=0;root.innerHTML=shell(game,`<div class="frame-stage"><div style="font-size:4rem">💎 <span data-score>0</span> 🌀</div></div><div class="game-controls"><button data-points="1">COLLECT GEM +1</button><button data-points="-1">TOUCH GLITCH −1</button><button data-points="0">RESET TO 0</button></div>`);
    root.querySelectorAll("[data-points]").forEach(btn=>btn.addEventListener("click",()=>{const n=Number(btn.dataset.points);score=n===0?0:score+n;root.querySelector("[data-score]").textContent=score;setStatus(root,`Variable “score” now stores ${score}.`);api.sound(n>0?"click":"error");if(score>=game.goal)win(root,api,"Win condition reached because the stored score met the target.");}));
  }

  function debugGame(game,root,api){
    root.innerHTML=shell(game,`<div class="code-stack">${game.lines.map((l,i)=>button(`${i+1}. ${l}`,`class="code-line" data-line="${i}"`)).join("")}</div>`);
    root.querySelectorAll("[data-line]").forEach(btn=>btn.addEventListener("click",()=>{const i=Number(btn.dataset.line);if(i===game.bug){btn.classList.add("glitch-picked");win(root,api,`Bug located. Replace it with: ${game.fix}.`);}else miss(root,api,"That line still matches the expected behavior. Trace to the next mismatch.");}));
  }

  function storyGame(game,root,api){
    const picks=[];root.innerHTML=shell(game,`<div class="story-path">${game.columns.map((col,ci)=>`<div class="story-node"><strong>${["CHOOSE 1","CONNECT 2","AIM FOR 3"][ci]}</strong>${col.map((x,i)=>button(x,`data-col="${ci}" data-item="${i}"`)).join("")}</div>`).join("")}</div><div class="choice-result" data-story>Your creator statement will appear here.</div>`);
    root.querySelectorAll("[data-col]").forEach(btn=>btn.addEventListener("click",()=>{const c=Number(btn.dataset.col),i=Number(btn.dataset.item);picks[c]=game.columns[c][i];btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("done"));btn.classList.add("done");root.querySelector("[data-story]").textContent=picks.filter(Boolean).join(" — ");api.sound("click");if(picks.filter(Boolean).length===game.columns.length)win(root,api,"Your choices now form a complete direction. Say it aloud and revise for clarity.");}));
  }

  function timingGame(game,root,api){
    let pos=5,dir=1,raf;root.innerHTML=shell(game,`<div class="meter"><div class="meter-marker"></div></div><div class="game-controls"><button data-stop>STOP THE MOMENT</button></div>`);const marker=root.querySelector(".meter-marker");
    function tick(){pos+=dir*1.15;if(pos>96||pos<3)dir*=-1;marker.style.left=`${pos}%`;raf=requestAnimationFrame(tick);}tick();
    root.querySelector("[data-stop]").addEventListener("click",()=>{cancelAnimationFrame(raf);const [a,b]=game.target;pos>=a&&pos<=b?win(root,api,"Readable timing. The audience has enough time without losing momentum."):miss(root,api,"That timing feels rushed or delayed. Restart and aim for the readable zone.");});return()=>cancelAnimationFrame(raf);
  }

  function transitionGame(game,root,api){
    const items=[...game.steps,...game.decoys].sort(()=>Math.random()-.5);game.order=game.steps.map(s=>items.indexOf(s));sequenceGame({...game,items,order:game.order},root,api,items);
  }

  function soundGame(game,root,api){
    root.innerHTML=shell(game,`<div class="choice-grid">${game.moods.map(m=>button(m.toUpperCase(),`data-mood="${m}"`)).join("")}</div><div class="choice-result" data-sound>Choose a mood.</div>`);
    root.querySelectorAll("[data-mood]").forEach(btn=>btn.addEventListener("click",()=>{const m=btn.dataset.mood,[cue,caption]=game.cues[m];root.querySelector("[data-sound]").innerHTML=`<strong>${esc(cue)}</strong><br>${esc(caption)}`;api.sound(m==="tense"?"error":"success");win(root,api,`Mood mixed: ${m}. The caption preserves the important sound meaning.`);}));
  }

  function framesGame(game,root,api){
    let index=0,chosen=[];root.innerHTML=shell(game,`<div class="frame-stage"><div class="frame-actor">🤖</div></div><div class="frame-controls">${["START POSE","ACTION POSE","END POSE"].map((p,i)=>button(p,`data-pose="${i}"`)).join("")}<button data-play>▶ PLAY</button></div>`);const actor=root.querySelector(".frame-actor");
    root.querySelectorAll("[data-pose]").forEach(btn=>btn.addEventListener("click",()=>{index=Number(btn.dataset.pose);chosen[index]=true;actor.style.setProperty("--pose-x",`${game.poses[index]}px`);actor.style.setProperty("--pose-r",`${game.poses[index]/2}deg`);setStatus(root,`${btn.textContent} saved. Build all three, then play.`);}));
    root.querySelector("[data-play]").addEventListener("click",async()=>{if(chosen.filter(Boolean).length<3){miss(root,api,"Create all three key poses before adding motion.");return;}for(const p of game.poses){actor.style.setProperty("--pose-x",`${p}px`);actor.style.setProperty("--pose-r",`${p/2}deg`);await new Promise(r=>setTimeout(r,420));}win(root,api,"The action reads because the key poses are distinct.");});
  }

  function framespeedGame(game,root,api){
    root.innerHTML=shell(game,`<div class="frame-stage"><div class="frame-actor">🏃</div></div><div class="game-controls"><button data-gap="${game.steps[0]}">SMALL SPACING</button><button data-gap="${game.steps[1]}">LARGE SPACING</button></div>`);const actor=root.querySelector(".frame-actor");
    root.querySelectorAll("[data-gap]").forEach(btn=>btn.addEventListener("click",async()=>{const gap=Number(btn.dataset.gap);actor.style.transform="translateX(-120px)";for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,140));actor.style.transform=`translateX(${-120+i*gap}px)`;}setStatus(root,gap===game.steps[1]?"Large spacing covers more distance per frame: faster motion.":"Small spacing covers less distance per frame: slower, smoother motion.");api.sound("success");}));
  }

  function captureGame(game,root,api){
    let frames=0,phase=0;const actions=["MOVE","HANDS CLEAR","CAPTURE"];
    root.innerHTML=shell(game,`<div class="frame-stage"><div class="frame-actor">🧙</div><div style="position:absolute;top:10px">CLEAN FRAMES: <b data-frames>0</b> / ${game.goal}</div></div><div class="game-controls">${actions.map((a,i)=>button(a,`data-action="${i}"`)).join("")}</div>`);
    root.querySelectorAll("[data-action]").forEach(btn=>btn.addEventListener("click",()=>{const a=Number(btn.dataset.action);if(a!==phase){miss(root,api,`Capture rhythm broken. Next step: ${actions[phase]}.`);return;}phase=(phase+1)%3;if(a===0)root.querySelector(".frame-actor").style.transform=`translateX(${frames*8}px) rotate(${frames*2}deg)`;if(a===2){frames++;root.querySelector("[data-frames]").textContent=frames;if(frames>=game.goal){win(root,api,"Eight clean frames captured with a repeatable production rhythm.");return;}}setStatus(root,`Good. Next: ${actions[phase]}.`);api.sound("click");}));
  }

  const renderers={tap:tapGame,choice:choiceGame,sequence:sequenceGame,build:buildGame,access:buildGame,coordinate:coordinateGame,loop:loopGame,conditional:roundsGame,camera:roundsGame,roles:roundsGame,edit:roundsGame,score:scoreGame,debug:debugGame,story:storyGame,timing:timingGame,transition:transitionGame,sound:soundGame,frames:framesGame,light:(g,r,a)=>choiceGame({...g,choices:g.setups,result:"Stable setup selected."},r,a),framespeed:framespeedGame,capture:captureGame};

  let cleanup=null;
  function render(game,mount,api){if(cleanup)cleanup();cleanup=null;const renderer=renderers[game.type]||choiceGame;cleanup=renderer(game,mount,api)||null;const restart=mount.querySelector("[data-game-restart]");if(restart)restart.addEventListener("click",()=>render(game,mount,api));}
  function reset(){if(cleanup)cleanup();cleanup=null;}
  window.GameLabGames={render,reset};
})();

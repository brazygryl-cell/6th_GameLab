(function(){
  const {WORLDS,LESSONS,LESSON_SECTIONS}=window.GameLabData;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  let lessonIndex=0,sectionIndex=0,activeWorld="all",audioCtx=null;
  let timerSeconds=180,timerInitial=180,timerHandle=null;
  const settings=Object.assign({largeText:false,highContrast:false,reducedMotion:false,sound:true},JSON.parse(localStorage.getItem("gameLabSettings")||"{}"));

  const worldFor=id=>WORLDS.find(w=>w.id===id);
  const currentLesson=()=>LESSONS[lessonIndex];
  const announce=text=>{$("#liveRegion").textContent="";setTimeout(()=>$("#liveRegion").textContent=text,20);};

  function sound(kind="click"){
    if(!settings.sound)return;
    try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const notes=kind==="success"?[520,660,820]:kind==="error"?[180,130]:[340];notes.forEach((freq,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=kind==="error"?"sawtooth":"square";o.frequency.value=freq;g.gain.setValueAtTime(.035,audioCtx.currentTime+i*.09);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+i*.09+.1);o.connect(g);g.connect(audioCtx.destination);o.start(audioCtx.currentTime+i*.09);o.stop(audioCtx.currentTime+i*.09+.11);});}catch(e){}
  }
  function celebrate(){
    if(settings.reducedMotion)return;const layer=$("#confettiLayer"),colors=["#ff4f91","#ffd84a","#56e0d0","#7657ff","#a8ed6d"];
    for(let i=0;i<36;i++){const p=document.createElement("i");p.className="confetti";p.style.setProperty("--x",`${Math.random()*100}%`);p.style.setProperty("--c",colors[i%colors.length]);p.style.animationDelay=`${Math.random()*.45}s`;layer.appendChild(p);setTimeout(()=>p.remove(),2200);}
  }
  const gameApi={sound,celebrate,announce};

  function showScreen(id){if(id!=='#lessonScreen')window.GameLabGames.reset();$$('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');window.scrollTo({top:0,behavior:settings.reducedMotion?'auto':'smooth'});}
  function applyWorld(id){const w=worldFor(id)||WORLDS[0];document.documentElement.style.setProperty('--world',w.color);document.documentElement.style.setProperty('--world-soft',w.soft);}

  function renderWorldPreview(){
    $("#worldPreview").innerHTML=WORLDS.map((w,i)=>`<button class="world-chip" data-world="${w.id}" style="--chip:${w.soft}"><span class="world-number">WORLD ${String(i+1).padStart(2,'0')} • ${w.dates}</span><span class="world-icon">${w.icon}</span><strong>${w.name}</strong><small>${w.tagline}</small></button>`).join('');
    $$("[data-world]").forEach(b=>b.addEventListener('click',()=>openMap(b.dataset.world)));
  }
  function renderWorldTabs(){
    $("#worldTabs").innerHTML=`<button class="world-tab" data-tab="all" role="tab">ALL DAYS</button>`+WORLDS.map(w=>`<button class="world-tab" data-tab="${w.id}" role="tab">${w.icon} ${w.name}</button>`).join('');
    $$("[data-tab]").forEach(b=>b.addEventListener('click',()=>{activeWorld=b.dataset.tab;renderMap();}));
  }
  function renderMap(){
    $$("[data-tab]").forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===activeWorld)));
    const days=LESSONS.map((d,i)=>({d,i})).filter(x=>activeWorld==='all'||x.d.world===activeWorld);
    $("#dayGrid").innerHTML=days.map(({d,i})=>{const w=worldFor(d.world);return `<button class="day-card" data-day="${i}" style="--world:${w.color};--world-soft:${w.soft}"><span class="day-number">DAY ${String(i+1).padStart(2,'0')} • ${w.icon} ${w.name.toUpperCase()}</span><span class="date">${d.date}</span><strong>${d.topic}</strong><p>${d.subtitle}</p><span class="game-tag">▶ ${d.game.title}</span></button>`;}).join('');
    $$("[data-day]").forEach(b=>b.addEventListener('click',()=>openLesson(Number(b.dataset.day))));
  }
  function openMap(world='all'){activeWorld=world;renderMap();showScreen('#mapScreen');}

  function todayIndex(){const now=new Date();const mon=now.getUTCMonth()===10?'NOV':now.getUTCMonth()===11?'DEC':'';const target=`${mon} ${now.getUTCDate()}`;const i=LESSONS.findIndex(l=>l.date.includes(target));return i>=0?i:0;}
  function openLesson(i){lessonIndex=i;sectionIndex=0;applyWorld(currentLesson().world);renderLesson();showScreen('#lessonScreen');}

  const sectionTitles={bell:"Start with what you already notice.",mission:"Today’s mission has a reason.",vocab:"Use the language designers use.",model:"Watch the thinking—not just the clicks.",game:"Play the idea before you build it.",wedo:"Let’s reason through it together.",youdo:"Now make the idea yours.",cfu:"Show what you understand right now.",exit:"Name the learning before you leave."};
  function sectionHTML(key,l){
    if(key==='bell')return `<div class="prompt-card"><p>${l.bell}</p><span class="sentence-stem">Write first. Then be ready to share the evidence behind your answer.</span></div>`;
    if(key==='mission')return `<div class="mission-card"><div><b>I CAN</b><p>${l.mission.replace(/^I can /i,'')}</p></div><div><b>WHY IT MATTERS</b><p>${l.purpose}</p></div></div>`;
    if(key==='vocab')return `<div class="vocab-grid">${l.vocab.map(([term,def])=>`<div class="vocab-card"><strong>${term}</strong><span>${def}</span></div>`).join('')}</div><div class="notebook-alt"><strong>Notebook move:</strong> Rephrase each definition in your own words and add one example or non-example.</div>`;
    if(key==='model')return `<div class="model-card"><ol>${l.model.map(x=>`<li>${x}</li>`).join('')}</ol><div class="say-line">TEACHER THINK-ALOUD: “${l.say}”</div></div>`;
    if(key==='game')return '';
    if(key==='wedo')return `<div class="partner-strip"><div><strong>CLASS CHALLENGE</strong><p>${l.wedo}</p></div><div><strong>WATCH • TRY • EXPLAIN</strong><p>Watch one round. Try one decision. Explain what changed and why.</p></div></div>`;
    if(key==='youdo')return `<div class="task-card"><p>${l.youdo}</p><div class="notebook-alt"><strong>NO CHROMEBOOK? STILL REAL WORK.</strong><br>${l.lowTech}</div></div>`;
    if(key==='cfu')return `<div class="cfu-card"><p><strong>${l.cfu.q}</strong></p><div class="response-buttons">${l.cfu.choices.map((c,i)=>`<button data-cfu="${i}">${c}</button>`).join('')}</div><div class="reveal" data-cfu-reveal hidden></div></div>`;
    if(key==='exit')return `<div class="exit-card"><p><strong>${l.exit}</strong></p><span class="sentence-stem">${l.stem}</span></div>`;
    return '';
  }
  function renderLesson(){
    const l=currentLesson(),s=LESSON_SECTIONS[sectionIndex],w=worldFor(l.world);applyWorld(l.world);
    $("#lessonDate").textContent=`DAY ${String(lessonIndex+1).padStart(2,'0')} • ${l.date} • ${w.name}`;$("#lessonTopic").textContent=l.topic;
    $("#progressTrack").innerHTML=LESSON_SECTIONS.map((x,i)=>`<button class="progress-step ${i<sectionIndex?'complete':''} ${i===sectionIndex?'active':''}" data-section="${i}" aria-current="${i===sectionIndex?'step':'false'}"><span>${x.icon}</span>${x.label}</button>`).join('');
    $$("[data-section]").forEach(b=>b.addEventListener('click',()=>{sectionIndex=Number(b.dataset.section);renderLesson();}));
    $("#sectionLabel").textContent=`${s.icon} ${s.label.toUpperCase()}`;$("#lessonTitle").textContent=sectionTitles[s.key];$("#lessonContent").innerHTML=sectionHTML(s.key,l);
    const gameMount=$("#gameMount");window.GameLabGames.reset();gameMount.hidden=s.key!=='game';if(s.key==='game')window.GameLabGames.render(l.game,gameMount,gameApi);
    $("#prevSectionBtn").disabled=sectionIndex===0;$("#nextSectionBtn").textContent=sectionIndex===LESSON_SECTIONS.length-1?'COMPLETE DAY ✦':'NEXT →';$("#sectionCount").textContent=`${sectionIndex+1} / ${LESSON_SECTIONS.length}`;
    $("#lessonStage").className=`lesson-stage section-${s.key}`;renderTeacher();wireCFU(l);announce(`${s.label}: ${sectionTitles[s.key]}`);
  }
  function wireCFU(l){
    $$("[data-cfu]").forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.cfu),reveal=$("[data-cfu-reveal]");reveal.hidden=false;if(i===l.cfu.correct){reveal.textContent=`Yes. ${l.cfu.explain}`;sound('success');celebrate();}else{reveal.textContent='Not yet. Point to a word in the question that your choice does not fully address, then try again.';sound('error');}}));
  }
  function nextSection(){if(sectionIndex<LESSON_SECTIONS.length-1){sectionIndex++;renderLesson();window.scrollTo({top:0,behavior:settings.reducedMotion?'auto':'smooth'});}else{celebrate();sound('success');openMap(currentLesson().world);}}
  function prevSection(){if(sectionIndex>0){sectionIndex--;renderLesson();}}

  function renderTeacher(){
    const l=currentLesson();$("#teacherContent").innerHTML=`<div class="teacher-section"><h3>Today at a glance</h3><p><strong>${l.date}: ${l.topic}</strong></p><p>${l.purpose}</p></div><div class="teacher-section"><h3>Materials</h3><p>${l.materials}</p></div><div class="teacher-section"><h3>Teacher move</h3><p>${l.teacher}</p></div><div class="teacher-section"><h3>Listen and look for</h3><p>${l.lookFor}</p></div><div class="teacher-section"><h3>Accessible fallback</h3><p>${l.lowTech}</p></div>`;
  }
  function openDrawer(id){closeDrawers();const d=$(id);d.classList.add('open');d.setAttribute('aria-hidden','false');$("#drawerScrim").hidden=false;setTimeout(()=>d.querySelector('button').focus(),30);}
  function closeDrawers(){$$('.drawer').forEach(d=>{d.classList.remove('open');d.setAttribute('aria-hidden','true');});$("#drawerScrim").hidden=true;}

  function applySettings(){
    document.body.classList.toggle('large-text',settings.largeText);document.body.classList.toggle('high-contrast',settings.highContrast);document.body.classList.toggle('reduced-motion',settings.reducedMotion);
    $$('.toggle-control').forEach(b=>b.setAttribute('aria-pressed',String(settings[b.dataset.setting])));localStorage.setItem('gameLabSettings',JSON.stringify(settings));
  }
  function toggleSetting(key){settings[key]=!settings[key];applySettings();sound('click');}
  function togglePresentation(){document.body.classList.toggle('presentation');if(document.body.classList.contains('presentation')){document.documentElement.requestFullscreen?.().catch(()=>{});}else if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});}}

  function formatTime(sec){return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
  function renderTimer(){$("#timerDisplay").textContent=formatTime(timerSeconds);$("#timerBtn").textContent=`◷ ${formatTime(timerSeconds)}`;}
  function openTimer(){$("#timerOverlay").hidden=false;renderTimer();$("#timerStartBtn").focus();}
  function closeTimer(){$("#timerOverlay").hidden=true;}
  function startTimer(){if(timerHandle)return;$("#timerStartBtn").textContent='PAUSE';timerHandle=setInterval(()=>{timerSeconds--;renderTimer();if(timerSeconds<=0){clearInterval(timerHandle);timerHandle=null;$("#timerStartBtn").textContent='START';sound('success');celebrate();announce('Timer complete.');}},1000);}
  function pauseTimer(){clearInterval(timerHandle);timerHandle=null;$("#timerStartBtn").textContent='START';}
  function resetTimer(){pauseTimer();timerSeconds=timerInitial;renderTimer();}

  function bind(){
    $("#homeBtn").addEventListener('click',()=>showScreen('#homeScreen'));$("#enterLabBtn").addEventListener('click',()=>openMap('all'));$("#todayBtn").addEventListener('click',()=>openLesson(todayIndex()));$("#mapHomeBtn").addEventListener('click',()=>showScreen('#homeScreen'));$("#backToMapBtn").addEventListener('click',()=>openMap(currentLesson().world));
    $("#nextSectionBtn").addEventListener('click',nextSection);$("#prevSectionBtn").addEventListener('click',prevSection);$("#resetGameBtn").addEventListener('click',()=>{if(LESSON_SECTIONS[sectionIndex].key==='game')window.GameLabGames.render(currentLesson().game,$("#gameMount"),gameApi);});
    $("#teacherBtn").addEventListener('click',()=>openDrawer('#teacherDrawer'));$("#accessBtn").addEventListener('click',()=>openDrawer('#accessDrawer'));$("#presentBtn").addEventListener('click',togglePresentation);$("#drawerScrim").addEventListener('click',closeDrawers);$$('.close-drawer').forEach(b=>b.addEventListener('click',closeDrawers));$$('.toggle-control').forEach(b=>b.addEventListener('click',()=>toggleSetting(b.dataset.setting)));
    $("#timerBtn").addEventListener('click',openTimer);$("#timerCloseBtn").addEventListener('click',closeTimer);$("#timerStartBtn").addEventListener('click',()=>timerHandle?pauseTimer():startTimer());$("#timerResetBtn").addEventListener('click',resetTimer);$$('[data-minutes]').forEach(b=>b.addEventListener('click',()=>{timerInitial=timerSeconds=Number(b.dataset.minutes)*60;resetTimer();}));
    document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;if(e.key==='Escape'){closeDrawers();closeTimer();}else if(e.key==='ArrowRight'&&$('#lessonScreen').classList.contains('active'))nextSection();else if(e.key==='ArrowLeft'&&$('#lessonScreen').classList.contains('active'))prevSection();else if(e.key.toLowerCase()==='t')openDrawer('#teacherDrawer');else if(e.key.toLowerCase()==='a')openDrawer('#accessDrawer');else if(e.key.toLowerCase()==='f')togglePresentation();else if(e.key.toLowerCase()==='r'&&LESSON_SECTIONS[sectionIndex].key==='game')window.GameLabGames.render(currentLesson().game,$("#gameMount"),gameApi);});
    document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)document.body.classList.remove('presentation');});
  }
  function init(){renderWorldPreview();renderWorldTabs();renderMap();applySettings();applyWorld('arcade');renderTeacher();bind();renderTimer();}
  document.addEventListener('DOMContentLoaded',init);
})();

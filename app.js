const data=JSON.parse(document.getElementById('data').textContent);
const scores={}; data.services.forEach(s=>scores[s.id]=0);
let selectedTile=null, selectedPower=null, progress=0, chosenPower=null, selectedRole=null, selectedRoleLabel='', clueAnswers={};
const contactUrl='https://www.abeam.com/id/en/contact_id/';
function addUtm(url,content){
  try{const u=new URL(url);
    u.searchParams.set('utm_source','transformation_quest');
    u.searchParams.set('utm_medium','interactive');
    u.searchParams.set('utm_campaign','abeam_id_quest');
    if(content) u.searchParams.set('utm_content',content);
    return u.toString();
  }catch(e){return url;}
}
function track(event,detail){
  try{
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(Object.assign({event:event},detail||{}));
    if(typeof window.gtag==='function') window.gtag('event',event,detail||{});
  }catch(e){}
}
let LANG='en';
try{const st=localStorage.getItem('abeam_quest_lang'); if(st==='id'||st==='en') LANG=st;}catch(e){}
function dict(){return (window.I18N&&window.I18N[LANG])||{};}
function t(k,vars){
  const en=(window.I18N&&window.I18N.en&&window.I18N.en.ui)||{};
  let v=(dict().ui&&dict().ui[k]!==undefined)?dict().ui[k]:en[k];
  if(v===undefined) return '';
  if(vars) Object.keys(vars).forEach(x=>{v=v.split('{'+x+'}').join(vars[x]);});
  return v;
}
function tm(k){const m=(dict().msg)||window.I18N.en.msg;return m[k]!==undefined?m[k]:window.I18N.en.msg[k];}
function tx(group,id,field,fallback){
  const g=dict()[group];
  if(g&&g[id]){const v=field?g[id][field]:g[id]; if(v!==undefined&&v!=='') return v;}
  return fallback;
}
function locRole(r){return {id:r.id,service:r.service,label:tx('roles',r.id,'label',r.label),copy:tx('roles',r.id,'copy',r.copy)};}
function locClue(c){return {id:c.id,service:c.service,icon:c.icon,label:tx('clues',c.id,null,c.label)};}
function locService(sv){return Object.assign({},sv,{
  name:tx('services',sv.id,'name',sv.name),
  short:tx('services',sv.id,'short',sv.short),
  next:tx('services',sv.id,'next',sv.next),
  support:tx('services',sv.id,'support',sv.support)});}
function locPower(m){return Object.assign({},m,{
  title:tx('power',m.id,'title',m.title),
  copy:tx('power',m.id,'copy',m.copy)});}
function locFocus(f){return Object.assign({},f,{label:tx('focus',f.id,null,f.label)});}
function locMetric(m,id){const o=Object.assign({},m);const g=dict().metrics;
  if(g&&g[id]) Object.keys(g[id]).forEach(k=>{if(g[id][k]) o[k]=g[id][k];});
  return o;}

const $=id=>document.getElementById(id);
const roles=[
  {id:'it',label:'IT',service:'core',copy:'systems, data, integration, and technology enablement'},
  {id:'finance',label:'Finance',service:'process',copy:'cost, controls, reporting, and finance operations'},
  {id:'hr',label:'HR',service:'people',copy:'people experience, capability, adoption, and organization readiness'},
  {id:'supply',label:'Supply Chain',service:'supply',copy:'planning, procurement, logistics, resilience, and visibility'},
  {id:'process',label:'Business Process',service:'process',copy:'workflow redesign, approvals, service quality, and operational efficiency'}
];
const roleClues={
  it:[
    {id:'it1',label:'Systems are not connected',service:'core'},
    {id:'it3',label:'Users need better adoption',service:'people'},
    {id:'it4',label:'Process gaps slow the rollout',service:'process'},
    {id:'it5',label:'Support model needs more stability',service:'managed'}
  ],
  finance:[
    {id:'fin1',label:'Reporting takes too long',service:'process'},
    {id:'fin2',label:'Cost visibility is limited',service:'strategy'},
    {id:'fin4',label:'Controls need stronger consistency',service:'core'},
    {id:'fin5',label:'Operations need cleaner ownership',service:'managed'}
  ],
  hr:[
    {id:'hr1',label:'Employee experience is inconsistent',service:'people'},
    {id:'hr3',label:'Workforce data is fragmented',service:'core'},
    {id:'hr4',label:'Processes are difficult to follow',service:'process'},
    {id:'hr5',label:'Change ownership is unclear',service:'strategy'}
  ],
  supply:[
    {id:'sc1',label:'Delivery reliability is under pressure',service:'supply'},
    {id:'sc3',label:'Planning decisions are too reactive',service:'strategy'},
    {id:'sc4',label:'Procurement or logistics data is fragmented',service:'core'},
    {id:'sc5',label:'Daily operations need more stability',service:'managed'}
  ],
  process:[
    {id:'bp1',label:'Manual work keeps returning',service:'process'},
    {id:'bp3',label:'Teams use different ways of working',service:'people'},
    {id:'bp4',label:'Data does not support decisions',service:'core'},
    {id:'bp5',label:'Business value is hard to measure',service:'strategy'}
  ]
};

const roleMissionMap={
  it:['core','process','managed'],
  finance:['process','strategy','core'],
  hr:['people','process','core'],
  supply:['supply','strategy','managed'],
  process:['process','strategy','people']
};
const roleMissionCopy={
  it:'Recommended paths for IT challenges around systems, data, integration, adoption, and support.',
  finance:'Recommended paths for Finance challenges around reporting, control, cost visibility, and operating efficiency.',
  hr:'Recommended paths for HR challenges around people experience, adoption, workforce data, and capability.',
  supply:'Recommended paths for Supply Chain challenges around planning, procurement, logistics, resilience, and visibility.',
  process:'Recommended paths for Business Process challenges around rework, approvals, ownership, and service quality.'
};
function servicesForRole(){
  const ids=roleMissionMap[selectedRole]||data.services.map(s=>s.id);
  return ids.map(id=>data.services.find(s=>s.id===id)).filter(Boolean).map(locService);
}

const serviceIconMap={}; data.services.forEach(s=>serviceIconMap[s.id]=s.icon);
function serviceBy(id){return locService(data.services.find(s=>s.id===id)||data.services[0]);}

function applyStaticText(){
  document.documentElement.lang = (LANG==='id'?'id':'en');
  const set=(sel,val)=>{const el=document.querySelector(sel); if(el) el.textContent=val;};
  const he=document.querySelector('#intro .eyebrow');
  if(he) he.innerHTML=t('heroEyebrow')+' <strong>'+t('heroEyebrowStrong')+'</strong>';
  set('#intro h1',t('heroTitle')); set('#intro .lede',t('heroLede'));
  set('#startQuest',t('startQuest'));
  set('#role .eyebrow',t('round1')); set('#role h2',t('roleTitle')); set('#role .head p:last-of-type',t('roleLede'));
  set('#clueboard .eyebrow',t('round2')); set('#clueboard h2',t('clueTitle')); set('#clueboard .head p:last-of-type',t('clueLede'));
  set('.clue-col-head[data-zone="critical"] b',t('zoneCritical')); set('.clue-col-head[data-zone="critical"] small',t('zoneCriticalSub'));
  set('.clue-col-head[data-zone="important"] b',t('zoneImportant')); set('.clue-col-head[data-zone="important"] small',t('zoneImportantSub'));
  set('.clue-col-head[data-zone="not-relevant"] b',t('zoneNot')); set('.clue-col-head[data-zone="not-relevant"] small',t('zoneNotSub'));
  set('#power .eyebrow',t('round3')); set('#power h2',t('powerTitle')); set('#power .head p:last-of-type',t('powerLede'));
  set('#continuePower',t('continue'));
  set('#choice .eyebrow',t('roundFinal')); set('#choice h2',t('choiceTitle')); set('#choice .head p:last-of-type',t('choiceLede'));
  set('#result .eyebrow',t('roundDone'));
  set('.contact-copy h3',t('contactHead')); set('.contact-copy > p',t('contactLede'));
  set('#copyMessage',t('copyMessage'));
  set('#serviceLink',t('discuss')); set('#playAgain',t('playAgain'));
  set('.unlock-card span',t('unlocked'));
  set('#restartTop',t('restart'));
  const lb=$('langToggle'); if(lb) lb.textContent=t('langToggle');
  const rv=document.querySelector('.reveal-btn');
  const cc=document.querySelector('.contact-copy');
  if(rv&&cc) rv.textContent=cc.classList.contains('is-collapsed')?t('showMessage'):t('hideMessage');
  const slot=$('powerSlot');
  if(slot&&!slot.querySelector('.power-card')) slot.innerHTML='<h3>'+t('slotTitle')+'</h3><p>'+t('slotLede')+'</p>';
  else if(slot){const h=slot.querySelector('h3'); if(h) h.textContent=t('slotTitle');}
  updateProgressText();
}
function updateProgressText(){
  const active=document.querySelector('.screen.active');
  const id=active?active.id:'intro';
  $('progressText').textContent = id==='intro'?t('questZero') : id==='result'?t('questDone') : t('questOf',{n:progress});
}
function setLang(next){
  LANG=next;
  try{localStorage.setItem('abeam_quest_lang',LANG);}catch(e){}
  applyStaticText();
  const active=document.querySelector('.screen.active');
  const id=active?active.id:'intro';
  if(id==='role') renderRoles();
  else if(id==='clueboard'){
    document.querySelectorAll('#clueRows .clue-row').forEach(el=>{
      const rt=el.querySelector('.row-text'); const cid=el.dataset.id;
      if(rt) rt.textContent=tx('clues',cid,null,rt.textContent);
    });
    updateLockButton();
  }
  else if(id==='power'){
    document.querySelectorAll('.power-card').forEach(el=>{
      const pid=el.dataset.id;
      const h=el.querySelector('h3'), p=el.querySelector('p');
      if(h){h.textContent=tx('power',pid,'title',h.textContent); el.dataset.title=h.textContent;}
      if(p) p.textContent=tx('power',pid,'copy',p.textContent);
    });
  }
  else if(id==='choice') renderFocus();
  else if(id==='result') result(true);
  track('quest_language',{language:LANG});
}
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
  updateProgressText();
  scrollToScreen(id);
  track('quest_step',{step_id:id,step_number:progress,role:selectedRoleLabel||'none'});
}
function scrollToScreen(id){
  const el=$(id); if(!el) return;
  const header=document.querySelector('.site-header');
  const offset=(header?header.offsetHeight:0)+12;
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(()=>{
    const top=el.getBoundingClientRect().top+window.pageYOffset-offset;
    window.scrollTo({top:top<0?0:top,behavior:reduce?'auto':'smooth'});
  });
}
function score(service,points){scores[service]=(scores[service]||0)+points;}
function winner(){return locService(data.services.reduce((a,b)=>(scores[b.id]>scores[a.id]?b:a),data.services[0]));}
function img(src){return `<img src="${src}" alt=""/>`;}
function renderRoles(){
  $('roleGrid').innerHTML=roles.map(locRole).map((r,i)=>`<button class="role-card" data-role="${r.id}" data-service="${r.service}">${img(data.iconPool[i%data.iconPool.length])}<h3>${r.label}</h3><p>${r.copy}</p></button>`).join('');
  document.querySelectorAll('.role-card').forEach(btn=>btn.addEventListener('click',()=>{
    const role=roles.find(r=>r.id===btn.dataset.role);
    selectedRole=role.id; selectedRoleLabel=role.label; score(role.service,6); progress=2; show('clueboard'); renderClues();
  }));
}
function roleAwareClues(){
  const base=roleClues[selectedRole]||data.clues.slice(0,4);
  return base.slice(0,4).map((c,i)=>({ ...c, icon: data.iconPool[i%data.iconPool.length] }));
}
function renderClues(){
  clueAnswers={};
  const rows=roleAwareClues().map(locClue);
  $('clueRows').innerHTML=rows.map(c=>`
    <tr class="clue-row" data-id="${c.id}" data-service="${c.service}">
      <td class="clue-row-label">${img(c.icon)}<span class="row-text">${c.label}</span></td>
      <td class="clue-cell"><label><input type="radio" name="clue-${c.id}" value="critical"><span class="cell-mark" aria-hidden="true"></span><span class="sr-only">${t('zoneCritical')}</span></label></td>
      <td class="clue-cell"><label><input type="radio" name="clue-${c.id}" value="important"><span class="cell-mark" aria-hidden="true"></span><span class="sr-only">${t('zoneImportant')}</span></label></td>
      <td class="clue-cell"><label><input type="radio" name="clue-${c.id}" value="not-relevant"><span class="cell-mark" aria-hidden="true"></span><span class="sr-only">${t('zoneNot')}</span></label></td>
    </tr>`).join('');
  bindClueRows(); updateLockButton();
}
function bindClueRows(){
  document.querySelectorAll('#clueRows .clue-row').forEach(row=>{
    row.querySelectorAll('input[type="radio"]').forEach(input=>{
      input.addEventListener('change',()=>{
        clueAnswers[row.dataset.id]=input.value;
        row.classList.add('is-answered');
        updateLockButton();
      });
    });
  });
}
function updateLockButton(){
  const total=document.querySelectorAll('#clueRows .clue-row').length;
  const left=total-Object.keys(clueAnswers).length;
  const btn=$('lockBoard'); if(btn) btn.textContent=left>0?t('lockBoardLeft',{n:left}):t('lockBoard');
}
function keyActivate(el,fn){el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){e.preventDefault();fn(e);}});}
function startPowerDrag(e){startDrag(e,'.power-slot',(item,slot)=>choosePower(item));}
function nearestTarget(selector,x,y,maxDist){
  let best=null,bestD=Infinity;
  document.querySelectorAll(selector).forEach(el=>{
    const r=el.getBoundingClientRect();
    const dx=x<r.left?r.left-x:(x>r.right?x-r.right:0);
    const dy=y<r.top?r.top-y:(y>r.bottom?y-r.bottom:0);
    const d=Math.hypot(dx,dy);
    if(d<bestD){bestD=d;best=el;}
  });
  return bestD<=maxDist?best:null;
}
let _edgeTimer=null;
function edgeScroll(clientY){
  const H=window.innerHeight, band=Math.min(120,H*0.22);
  let dir=0;
  if(clientY<band) dir=-1;
  else if(clientY>H-band) dir=1;
  if(!dir){stopEdgeScroll();return;}
  const near = dir<0 ? (band-clientY) : (clientY-(H-band));
  const speed = Math.min(26, 8 + (near/band)*18);
  if(_edgeTimer) return;
  _edgeTimer=setInterval(()=>{window.scrollBy(0,dir*speed);},16);
}
function stopEdgeScroll(){if(_edgeTimer){clearInterval(_edgeTimer);_edgeTimer=null;}}
function startDrag(e,targetSelector,onDrop){if(e.button!==undefined&&e.button!==0)return;const item=e.currentTarget;const rect=item.getBoundingClientRect();const offX=e.clientX-rect.left,offY=e.clientY-rect.top;const originalParent=item.parentElement,originalIndex=[...originalParent.children].indexOf(item);item.classList.add('dragging');item.style.width=rect.width+'px';item.style.left=rect.left+'px';item.style.top=rect.top+'px';document.body.appendChild(item);function move(ev){edgeScroll(ev.clientY);item.style.left=(ev.clientX-offX)+'px';item.style.top=(ev.clientY-offY)+'px';document.querySelectorAll(targetSelector).forEach(z=>z.classList.remove('over'));const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest(targetSelector)||nearestTarget(targetSelector,ev.clientX,ev.clientY,90);if(over)over.classList.add('over');}function up(ev){stopEdgeScroll();document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);item.classList.remove('dragging');item.style.left=item.style.top=item.style.width='';const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest(targetSelector)||nearestTarget(targetSelector,ev.clientX,ev.clientY,90);document.querySelectorAll(targetSelector).forEach(z=>z.classList.remove('over'));if(over){onDrop(item,over);}else{const kids=originalParent.children;if(originalIndex>=kids.length)originalParent.appendChild(item);else originalParent.insertBefore(item,kids[originalIndex]);}}document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);}
function scoreBoard(){
  Object.entries(clueAnswers).forEach(([id,zone])=>{
    const row=document.querySelector(`#clueRows .clue-row[data-id="${id}"]`);
    if(!row) return;
    const pts=zone==='critical'?5:zone==='important'?3:0;
    score(row.dataset.service,pts);
  });
}
function roleAwarePowerMoves(){
  const roleMoves={
    it:[
      {id:'it-data',title:'Clean up the data foundation',copy:'Prioritize data quality, integration, and scalable system design.',service:'core'},
      {id:'it-adopt',title:'Improve adoption',copy:'Make the rollout easier for users and support teams.',service:'people'},
      {id:'it-support',title:'Stabilize support',copy:'Clarify ownership, service levels, and support handover.',service:'managed'},
      {id:'it-process',title:'Simplify the workflow',copy:'Remove process friction before scaling technology.',service:'process'}
    ],
    finance:[
      {id:'fin-report',title:'Shorten reporting cycles',copy:'Prioritize faster reporting and less manual checking.',service:'process'},
      {id:'fin-cost',title:'Improve cost visibility',copy:'Make business value and cost drivers easier to see.',service:'strategy'},
      {id:'fin-control',title:'Strengthen controls',copy:'Make controls more consistent across systems and teams.',service:'core'},
      {id:'fin-operate',title:'Clarify ownership',copy:'Separate what should be governed, automated, or managed.',service:'managed'}
    ],
    hr:[
      {id:'hr-adopt',title:'Make change easier to adopt',copy:'Prioritize capability, communication, and ownership across teams.',service:'people'},
      {id:'hr-workflow',title:'Simplify HR workflows',copy:'Reduce handoffs and make processes easier to follow.',service:'process'},
      {id:'hr-data',title:'Connect workforce data',copy:'Improve visibility for workforce decisions.',service:'core'},
      {id:'hr-direction',title:'Clarify the people roadmap',copy:'Align workforce priorities with business outcomes.',service:'strategy'}
    ],
    supply:[
      {id:'supply-visible',title:'Improve end-to-end visibility',copy:'Prioritize planning, supply visibility, and operational resilience.',service:'supply'},
      {id:'supply-plan',title:'Stabilize planning',copy:'Make planning decisions less reactive.',service:'strategy'},
      {id:'supply-data',title:'Connect operating data',copy:'Improve procurement, logistics, and inventory data flow.',service:'core'},
      {id:'supply-run',title:'Protect daily operations',copy:'Strengthen continuity and operating governance.',service:'managed'}
    ],
    process:[
      {id:'bp-redesign',title:'Redesign the workflow',copy:'Prioritize simpler steps, clear ownership, and faster approvals.',service:'process'},
      {id:'bp-value',title:'Clarify value',copy:'Connect process improvement to measurable business outcomes.',service:'strategy'},
      {id:'bp-adopt',title:'Align ways of working',copy:'Help teams use one consistent process.',service:'people'},
      {id:'bp-data',title:'Improve decision data',copy:'Make the workflow easier to measure and manage.',service:'core'}
    ]
  };
  const list=roleMoves[selectedRole]||data.powerMoves.slice(0,4);
  return list.map((m,i)=>({...m,icon:data.iconPool[(i+2)%data.iconPool.length]}));
}
function renderPower(){chosenPower=null;$('continuePower').disabled=true;$('powerSlot').innerHTML='<h3>'+t('slotTitle')+'</h3><p>'+t('slotLede')+'</p>';$('powerDeck').innerHTML=roleAwarePowerMoves().map(locPower).map(m=>`<div class="power-card" data-id="${m.id}" data-service="${m.service}" data-title="${m.title}" tabindex="0" role="button"><span class="grip" aria-hidden="true"></span>${img(m.icon)}<h3>${m.title}</h3><p>${m.copy}</p></div>`).join('');document.querySelectorAll('.power-card').forEach(card=>{keyActivate(card,()=>card.click());card.addEventListener('pointerdown',startPowerDrag);card.addEventListener('click',()=>{if(selectedPower)selectedPower.classList.remove('selected');selectedPower=card;card.classList.add('selected');const sl=$('powerSlot');if(sl)sl.scrollIntoView({behavior:'smooth',block:'center'});});});const slot=$('powerSlot');slot.setAttribute('tabindex','0');slot.setAttribute('role','button');
slot.onclick=()=>{if(selectedPower)choosePower(selectedPower);};keyActivate(slot,()=>slot.click());}
function choosePower(card){if(chosenPower)return;chosenPower={id:card.dataset.id,title:card.dataset.title,service:card.dataset.service};score(card.dataset.service,3);card.classList.remove('selected');$('powerSlot').innerHTML='<h3>'+t('slotTitle')+'</h3>';$('powerSlot').appendChild(card);$('continuePower').disabled=false;confetti(18);}
function roleAwareFocusChoices(){
  const list=[...data.focusChoices];
  if(selectedRole==='it') list.unshift({id:'secure',label:'Make systems easier to connect',service:'core'});
  if(selectedRole==='finance') list.unshift({id:'control',label:'Make reporting and controls cleaner',service:'process'});
  if(selectedRole==='hr') list.unshift({id:'adopt',label:'Build readiness across teams',service:'people'});
  if(selectedRole==='supply') list.unshift({id:'visible',label:'Make the supply chain easier to see',service:'supply'});
  if(selectedRole==='process') list.unshift({id:'simple',label:'Make the workflow simpler',service:'process'});
  return list.slice(0,4);
}

function selectFinal(serviceId){
  try{
    if(!serviceId){return;}
    score(serviceId,4);
    progress=4;
    result();
  }catch(err){
    console.error('Final choice failed', err);
    const resultScreen=$('result');
    if(resultScreen){
      document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
      resultScreen.classList.add('active');
      $('resultTitle').textContent='Result ready';
      $('resultSummary').textContent=t('resultFallback');
    }
  }
}
window.selectFinal=selectFinal;

function renderFocus(){
  const choices=roleAwareFocusChoices();
  $('focusGrid').innerHTML=choices.map(locFocus).map(c=>`<button type="button" class="trade-card final-choice" data-service="${c.service}" onclick="selectFinal('${c.service}')"><h3>${c.label}</h3></button>`).join('');
  document.querySelectorAll('.final-choice').forEach(btn=>{
    btn.onclick=(e)=>{e.preventDefault();selectFinal(btn.dataset.service);};
    btn.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectFinal(btn.dataset.service);}};
  });
};
const serviceMetrics={
  core:{
    title:'Core Systems Transformation \u2014 SAP S/4HANA\u00ae',
    hero:'5',
    heroUnit:'months',
    heroLabel:'from project start to SAP S/4HANA\u00ae go-live',
    context:'An Indonesian manufacturing company went live on SAP S/4HANA\u00ae with ABeam Consulting Indonesia in five months, using a clean-core global template as the foundation for scalable enterprise operations.',
    formula:'Track go-live timeline, integration coverage, data migration quality, and post-go-live issue resolution time.',
    url:'https://www.abeam.com/id/en/news/2025/0730/',
    linkText:'Read the SAP S/4HANA\u00ae case'
  },
  managed:{
    title:'Managed Operations \u2014 run and hypercare',
    hero:'6',
    heroUnit:'months',
    heroLabel:'from mobilization all the way through hypercare',
    context:'An Indonesian IT solutions company reached a stable SAP S/4HANA\u00ae Public Cloud core in six months, with structured hypercare, controlled cutover, and knowledge transfer so the internal team could run it themselves.',
    formula:'Track hypercare exit criteria, incident recurrence, SLA coverage, and internal team self-reliance.',
    url:'https://www.abeam.com/id/en/news/2025/1120/',
    linkText:'Read the run-and-hypercare case'
  },
  process:{
    title:'Business Process Reform \u2014 end-to-end standardization',
    hero:'3',
    heroUnit:'core processes',
    heroLabel:'standardized end to end on one connected core',
    context:'An Indonesian IT solutions company standardized order-to-cash, procure-to-pay, and record-to-report on a single source of truth in 2025. Manual effort dropped, reporting cycles shortened, and finance teams reached period close faster through streamlined reconciliations.',
    formula:'Track manual touch points removed, period close duration, reporting cycle time, and reconciliation rework rate.',
    url:'https://www.abeam.com/id/en/news/2025/1120/',
    linkText:'Read the process standardization case'
  },
  people:{
    title:'People Transformation \u2014 HR digital',
    hero:'6',
    heroUnit:'platforms',
    heroLabel:'brought together into one employee hub',
    context:'An Indonesian telecom operator consolidated HR onto one connected employee experience, combining SAP SuccessFactors, Concur, Work Zone, SAP Analytics Cloud, Qualtrics, and a gamification layer, delivered in a short period with ABeam Consulting Indonesia.',
    formula:'Track adoption rate, employee experience scores, service request turnaround, and data accuracy for HR decisions.',
    url:'https://www.abeam.com/id/en/news/2024/0925/',
    linkText:'Read the HR transformation case'
  },
  supply:{
    title:'Supply Chain \u2014 procurement integrity',
    hero:'3',
    heroUnit:'risk checks',
    heroLabel:'designed into the procurement analytics platform',
    context:'An Indonesian steel manufacturer is moving from manual supplier verification to graph analytics with ABeam Consulting Indonesia: tracing vendor and third-party connections, detecting anomalies in procurement activity, and flagging risk before it becomes loss.',
    formula:'Track supplier verification coverage, anomaly detection rate, and time to investigate a flagged transaction.',
    kind:'approach',
    url:'https://www.abeam.com/id/en/news/2025/0416/',
    linkText:'Read the procurement analytics case'
  },
  strategy:{
    title:'Strategy Transformation \u2014 process baseline',
    hero:'1',
    heroUnit:'baseline',
    heroLabel:'shared process view before the roadmap is set',
    context:'An Indonesian state-owned fertilizer producer kicked off its digital transformation with ABeam Consulting Indonesia in 2026, starting with one agreed process baseline in SAP Signavio\u00ae so priorities and value cases can be argued from evidence rather than opinion.',
    formula:'Track value-case coverage, process baseline completeness, and milestone achievement against the roadmap.',
    kind:'approach',
    url:'https://www.abeam.com/id/en/news/2026/0129/',
    linkText:'Read the transformation kick-off case'
  }
};
const roleMetricOverride={
  it:'core',
  finance:'process',
  hr:'people',
  supply:'supply',
  process:'process'
};
function metricFor(service){
  const id=(service&&service.id)||'process';
  return locMetric(serviceMetrics[id]||serviceMetrics.process, serviceMetrics[id]?id:'process');
}
function renderMetric(service){
  const metric=metricFor(service);
  const eyebrow=document.querySelector('#metricCard .eyebrow');
  if(eyebrow) eyebrow.textContent=metric.kind==='approach'?t('eyebrowApproach'):t('eyebrowOutcome');
  $('metricTitle').textContent=metric.title;
  $('metricValue').innerHTML=
    '<div class="metric-hero"><span class="metric-hero-num">'+metric.hero+'</span>'+
    '<span class="metric-hero-unit">'+metric.heroUnit+'</span></div>'+
    '<p class="metric-hero-label">'+metric.heroLabel+'</p>'+
    '<p class="metric-detail">'+metric.context+'</p>'+
    '<p class="metric-disclaimer">'+t('caseDisclaimer')+'</p>';
  const link=$('insightLink');
  if(link){link.href=addUtm(metric.url,'insight_'+((service&&service.id)||'unknown'));link.textContent=metric.linkText||t('readInsight');link.target='_blank';link.rel='noopener';}
  return metric;
}

function buildMessage(service,critical){
  const rObj=roles.find(r=>r.id===selectedRole);
  const roleText=rObj?tx('roles',rObj.id,'label',rObj.label):(selectedRoleLabel||t('notSpecified'));
  const moveText=(chosenPower&&chosenPower.title)||t('notSpecified');
  const clues=critical.length?critical.join('; '):t('notSpecified');
  return tm('greeting')+'\n\n'+tm('intro')+'\n\n'+
    tm('role')+': '+roleText+'\n'+
    tm('service')+': '+service.name+'\n'+
    tm('clues')+': '+clues+'\n'+
    tm('move')+': '+moveText+'\n\n'+
    tm('close')+'\n\n'+tm('thanks');
}
function result(quiet){
  const s=winner();
  $('resultTitle').textContent=s.name;
  $('resultSummary').textContent=s.short;
  const svcImg={core:'img/core.jpg',process:'img/process.jpg',supply:'img/supply.jpg',people:'img/people.jpg',strategy:'img/strategy.jpg',managed:'img/managed.jpg'};
  const ri=$('resultIcon');
  ri.onerror=function(){this.onerror=null;this.style.display='none';};
  if(svcImg[s.id]){ri.style.display='';ri.src=svcImg[s.id];ri.classList.add('unlock-photo');}else{ri.style.display='';ri.src=s.icon;ri.classList.remove('unlock-photo');}
  $('resultCard').textContent=s.name;
  $('serviceLink').href=addUtm(contactUrl,'result_'+s.id);
  track('quest_complete',{recommended_service:s.id,role:selectedRoleLabel||'none',next_move:(chosenPower&&chosenPower.title)||'none'});
  const criticalIds=Object.entries(clueAnswers).filter(([id,zone])=>zone==='critical').map(([id])=>id);
  const critical=criticalIds.map(id=>{const row=document.querySelector(`#clueRows .clue-row[data-id="${id}"] .row-text`);return row?row.textContent:null;}).filter(Boolean).slice(0,3);
  $('why').innerHTML='<strong>'+t('whyHead')+'</strong><ul>'+(critical.map(c=>'<li>'+c+'</li>').join('')||'<li>'+t('whyFallback')+'</li>')+'</ul>';
  $('recommend').innerHTML='<strong>'+t('nextMove')+'</strong> '+s.next+'<br><br><strong>'+t('suggestedService')+'</strong> '+s.support;
  try{renderMetric(s);}catch(err){console.error('Metric render failed',err);}
  try{$('contactMessage').value=buildMessage(s,critical);}catch(err){console.error('Message build failed',err);$('contactMessage').value=t('msgFallback');}
  collapseContact();
  if(!quiet){show('result');confetti(44);}else{applyStaticText();}
}
function collapseContact(){
  const cc=document.querySelector('.contact-copy');
  if(!cc||cc.dataset.wired) return;
  cc.dataset.wired='1';
  cc.classList.remove('is-collapsed');
  const btn=document.createElement('button');
  btn.type='button'; btn.className='ghost-btn reveal-btn';
  btn.textContent=t('hideMessage');
  cc.parentNode.insertBefore(btn,cc);
  btn.onclick=()=>{
    const closed=cc.classList.toggle('is-collapsed');
    btn.textContent=closed?t('showMessage'):t('hideMessage');
    if(!closed) cc.scrollIntoView({behavior:'smooth',block:'nearest'});
  };
}
function confetti(n=30){const wrap=document.createElement('div');wrap.className='confetti';document.body.appendChild(wrap);for(let i=0;i<n;i++){const c=document.createElement('i');c.style.left=Math.random()*100+'vw';c.style.top='-20px';c.style.background=i%2?'#7d6e5a':'#001964';c.style.animationDelay=Math.random()*0.35+'s';wrap.appendChild(c);}setTimeout(()=>wrap.remove(),1500);}
$('startQuest').onclick=()=>{progress=1;show('role');renderRoles();};$('restartTop').onclick=()=>location.reload();$('playAgain').onclick=()=>location.reload();$('lockBoard').onclick=()=>{scoreBoard();progress=3;show('power');renderPower();};$('continuePower').onclick=()=>{progress=4;show('choice');renderFocus();};$('copyMessage').onclick=async()=>{try{await navigator.clipboard.writeText($('contactMessage').value);$('copyStatus').textContent=t('copied');}catch(e){$('contactMessage').select();document.execCommand('copy');$('copyStatus').textContent=t('copied');}track('quest_copy_message',{});};


document.addEventListener('click',e=>{const finalChoice=e.target.closest&&e.target.closest('.final-choice');if(finalChoice){e.preventDefault();selectFinal(finalChoice.dataset.service);}});
document.addEventListener('touchend',e=>{const finalChoice=e.target.closest&&e.target.closest('.final-choice');if(finalChoice){e.preventDefault();selectFinal(finalChoice.dataset.service);}}, {passive:false});

/* language toggle + first paint */
(function(){
  const b=$('langToggle');
  if(b) b.onclick=()=>setLang(LANG==='id'?'en':'id');
  applyStaticText();
})();

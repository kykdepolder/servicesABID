const data=JSON.parse(document.getElementById('data').textContent);
const scores={}; data.services.forEach(s=>scores[s.id]=0);
let selectedTile=null, selectedPower=null, progress=0, chosenPower=null, selectedRole=null, selectedRoleLabel='';
const contactUrl='https://www.abeam.com/id/en/contact_id/';
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
    {id:'it2',label:'Data is hard to trust',service:'core'},
    {id:'it3',label:'Users need better adoption',service:'people'},
    {id:'it4',label:'Process gaps slow the rollout',service:'process'},
    {id:'it5',label:'Support model needs more stability',service:'managed'},
    {id:'it6',label:'Security or access creates friction',service:'core'}
  ],
  finance:[
    {id:'fin1',label:'Reporting takes too long',service:'process'},
    {id:'fin2',label:'Cost visibility is limited',service:'strategy'},
    {id:'fin3',label:'Manual checks create rework',service:'process'},
    {id:'fin4',label:'Controls need stronger consistency',service:'core'},
    {id:'fin5',label:'Operations need cleaner ownership',service:'managed'},
    {id:'fin6',label:'Budget decisions lack a clear value case',service:'strategy'}
  ],
  hr:[
    {id:'hr1',label:'Employee experience is inconsistent',service:'people'},
    {id:'hr2',label:'Capability gaps slow change',service:'people'},
    {id:'hr3',label:'Workforce data is fragmented',service:'core'},
    {id:'hr4',label:'Processes are difficult to follow',service:'process'},
    {id:'hr5',label:'Change ownership is unclear',service:'strategy'},
    {id:'hr6',label:'HR service requests take too long',service:'process'}
  ],
  supply:[
    {id:'sc1',label:'Delivery reliability is under pressure',service:'supply'},
    {id:'sc2',label:'Inventory visibility is limited',service:'supply'},
    {id:'sc3',label:'Planning decisions are too reactive',service:'strategy'},
    {id:'sc4',label:'Procurement or logistics data is fragmented',service:'core'},
    {id:'sc5',label:'Daily operations need more stability',service:'managed'},
    {id:'sc6',label:'Supplier risk is hard to anticipate',service:'supply'}
  ],
  process:[
    {id:'bp1',label:'Manual work keeps returning',service:'process'},
    {id:'bp2',label:'Approvals take too long',service:'process'},
    {id:'bp3',label:'Teams use different ways of working',service:'people'},
    {id:'bp4',label:'Data does not support decisions',service:'core'},
    {id:'bp5',label:'Business value is hard to measure',service:'strategy'},
    {id:'bp6',label:'Exceptions are handled outside the process',service:'managed'}
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
  return ids.map(id=>data.services.find(s=>s.id===id)).filter(Boolean);
}

const serviceIconMap={}; data.services.forEach(s=>serviceIconMap[s.id]=s.icon);
function serviceBy(id){return data.services.find(s=>s.id===id)||data.services[0];}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');$('progressText').textContent=id==='intro'?'Quest 0/5':id==='result'?'Quest complete':`Quest ${progress}/5`;}
function score(service,points){scores[service]=(scores[service]||0)+points;}
function winner(){return data.services.reduce((a,b)=>(scores[b.id]>scores[a.id]?b:a),data.services[0]);}
function img(src){return `<img src="${src}" alt=""/>`;}
function renderRoles(){
  $('roleGrid').innerHTML=roles.map((r,i)=>`<button class="role-card" data-role="${r.id}" data-service="${r.service}">${img(data.iconPool[i%data.iconPool.length])}<h3>${r.label}</h3><p>${r.copy}</p></button>`).join('');
  document.querySelectorAll('.role-card').forEach(btn=>btn.addEventListener('click',()=>{
    const role=roles.find(r=>r.id===btn.dataset.role);
    selectedRole=role.id; selectedRoleLabel=role.label; score(role.service,5); progress=2; show('mission'); renderMissions();
  }));
}
function renderMissions(){
  const services=servicesForRole();
  const intro=$('missionIntro');
  if(intro){intro.textContent=roleMissionCopy[selectedRole]||'Pick the path that feels closest to your current transformation challenge.';}
  $('missionGrid').innerHTML=services.map((s,i)=>`<button class="service-card role-adjusted" data-service="${s.id}">${img(data.iconPool[(i+1)%data.iconPool.length])}<h3>${s.name}</h3><p>${s.short}</p></button>`).join('');
  document.querySelectorAll('.service-card').forEach(btn=>btn.addEventListener('click',()=>{score(btn.dataset.service,4);progress=3;show('clueboard');renderClues();}));
}
function roleAwareClues(){
  const base=roleClues[selectedRole]||data.clues.slice(0,6);
  return base.slice(0,6).map((c,i)=>({ ...c, icon: data.iconPool[i%data.iconPool.length] }));
}
function renderClues(){
  $('clueBank').innerHTML=roleAwareClues().map(c=>`<div class="tile" data-id="${c.id}" data-service="${c.service}">${img(c.icon)}<h4>${c.label}</h4></div>`).join('');
  bindTiles();
}
function bindTiles(){document.querySelectorAll('.tile').forEach(item=>{item.addEventListener('click',e=>{if(selectedTile)selectedTile.classList.remove('selected');selectedTile=item;item.classList.add('selected');e.stopPropagation();});item.addEventListener('pointerdown',startTileDrag);});document.querySelectorAll('.zone').forEach(z=>z.addEventListener('click',()=>{if(selectedTile){z.appendChild(selectedTile);selectedTile.classList.remove('selected');selectedTile=null;}}));}
function startTileDrag(e){startDrag(e,'.zone',(item,zone)=>zone.appendChild(item));}
function startPowerDrag(e){startDrag(e,'.power-slot',(item,slot)=>choosePower(item));}
function startDrag(e,targetSelector,onDrop){if(e.button!==undefined&&e.button!==0)return;const item=e.currentTarget;const rect=item.getBoundingClientRect();const offX=e.clientX-rect.left,offY=e.clientY-rect.top;const originalParent=item.parentElement,next=item.nextSibling;item.classList.add('dragging');item.style.width=rect.width+'px';item.style.left=rect.left+'px';item.style.top=rect.top+'px';document.body.appendChild(item);function move(ev){item.style.left=(ev.clientX-offX)+'px';item.style.top=(ev.clientY-offY)+'px';document.querySelectorAll(targetSelector).forEach(z=>z.classList.remove('over'));const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest(targetSelector);if(over)over.classList.add('over');}function up(ev){document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);item.classList.remove('dragging');item.style.left=item.style.top=item.style.width='';const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest(targetSelector);document.querySelectorAll(targetSelector).forEach(z=>z.classList.remove('over'));if(over){onDrop(item,over);}else if(next){originalParent.insertBefore(item,next)}else{originalParent.appendChild(item)}}document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);}
function scoreBoard(){document.querySelectorAll('.zone').forEach(z=>{const pts=z.dataset.zone==='critical'?5:z.dataset.zone==='important'?3:0;z.querySelectorAll('.tile').forEach(t=>score(t.dataset.service,pts));});}
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
function renderPower(){chosenPower=null;$('continuePower').disabled=true;$('powerSlot').innerHTML='<h3>My next move</h3><p>Drop one action card here.</p>';$('powerDeck').innerHTML=roleAwarePowerMoves().map(m=>`<div class="power-card" data-id="${m.id}" data-service="${m.service}" data-title="${m.title}">${img(m.icon)}<h3>${m.title}</h3><p>${m.copy}</p></div>`).join('');document.querySelectorAll('.power-card').forEach(card=>{card.addEventListener('pointerdown',startPowerDrag);card.addEventListener('click',()=>{if(selectedPower)selectedPower.classList.remove('selected');selectedPower=card;card.classList.add('selected');});});$('powerSlot').onclick=()=>{if(selectedPower)choosePower(selectedPower);};}
function choosePower(card){if(chosenPower)return;chosenPower={id:card.dataset.id,title:card.dataset.title,service:card.dataset.service};score(card.dataset.service,3);card.classList.remove('selected');$('powerSlot').innerHTML='<h3>My next move</h3>';$('powerSlot').appendChild(card);$('continuePower').disabled=false;confetti(18);}
function roleAwareFocusChoices(){
  const list=[...data.focusChoices];
  if(selectedRole==='it') list.unshift({id:'secure',label:'Make systems easier to connect',service:'core'});
  if(selectedRole==='finance') list.unshift({id:'control',label:'Make reporting and controls cleaner',service:'process'});
  if(selectedRole==='hr') list.unshift({id:'adopt',label:'Make the change easier to adopt',service:'people'});
  if(selectedRole==='supply') list.unshift({id:'visible',label:'Make the supply chain easier to see',service:'supply'});
  if(selectedRole==='process') list.unshift({id:'simple',label:'Make the workflow simpler',service:'process'});
  return list.slice(0,4);
}

function selectFinal(serviceId){
  try{
    if(!serviceId){return;}
    score(serviceId,4);
    progress=5;
    result();
  }catch(err){
    console.error('Final choice failed', err);
    const resultScreen=$('result');
    if(resultScreen){
      document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
      resultScreen.classList.add('active');
      $('resultTitle').textContent='Result ready';
      $('resultSummary').textContent='Your selected path has been captured. Please restart if the result details do not load.';
    }
  }
}
window.selectFinal=selectFinal;

function renderFocus(){
  const choices=roleAwareFocusChoices();
  $('focusGrid').innerHTML=choices.map(t=>`<button type="button" class="trade-card final-choice" data-service="${t.service}" onclick="selectFinal('${t.service}')"><h3>${t.label}</h3><p>Pick the action that would make the biggest difference right now.</p></button>`).join('');
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
    heroLabel:'built into one procurement analytics platform',
    context:'An Indonesian steel manufacturer moved from manual supplier verification to graph analytics with ABeam Consulting Indonesia: tracing vendor and third-party connections, detecting anomalies in procurement activity, and flagging risk before it becomes loss.',
    formula:'Track supplier verification coverage, anomaly detection rate, and time to investigate a flagged transaction.',
    url:'https://www.abeam.com/id/en/news/2025/0416/',
    linkText:'Read the procurement analytics case'
  },
  strategy:{
    title:'Strategy Transformation \u2014 process baseline',
    hero:'1',
    heroUnit:'baseline',
    heroLabel:'shared process view for the whole transformation roadmap',
    context:'An Indonesian state-owned fertilizer producer kicked off its digital transformation with ABeam Consulting Indonesia by first building one agreed process baseline in SAP Signavio\u00ae, so priorities and value cases could be argued from evidence.',
    formula:'Track value-case coverage, process baseline completeness, and milestone achievement against the roadmap.',
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
  return serviceMetrics[id]||serviceMetrics.process;
}
function renderMetric(service){
  const metric=metricFor(service);
  $('metricTitle').textContent=metric.title;
  $('metricValue').innerHTML=
    '<div class="metric-hero"><span class="metric-hero-num">'+metric.hero+'</span>'+
    '<span class="metric-hero-unit">'+metric.heroUnit+'</span></div>'+
    '<p class="metric-hero-label">'+metric.heroLabel+'</p>'+
    '<p class="metric-detail">'+metric.context+'</p>';
  $('metricFormula').textContent=metric.formula;
  const link=$('insightLink');
  if(link){link.href=metric.url;link.textContent=metric.linkText||'Read the case';link.target='_blank';link.rel='noopener';}
  return metric;
}

function buildMessage(service,critical){
  const roleText=selectedRoleLabel||'Not specified';
  const moveText=chosenPower?.title||'Not specified';
  const clues=critical.length?critical.join('; '):'Not specified';
  return `Hello ABeam Consulting Indonesia team,\n\nI completed the Transformation Quest and would like to discuss the recommended support.\n\nMy role/lens: ${roleText}\nRecommended service: ${service.id==='core'?'Core Systems Transformation':service.name}\nMain clues I marked as critical: ${clues}\nPreferred next move: ${moveText}\n\nI would like to understand what an initial discussion or assessment could look like for this situation.\n\nThank you.`;
}
function result(){
  const s=winner();
  $('resultTitle').textContent=s.name;
  $('resultSummary').textContent=s.short;
  $('resultIcon').src=s.icon;
  $('resultCard').textContent=s.name;
  $('serviceLink').href=contactUrl;
  const critical=[...document.querySelectorAll('.zone[data-zone="critical"] .tile h4')].map(x=>x.textContent).slice(0,3);
  $('why').innerHTML='<strong>Why this unlocked:</strong><ul>'+(critical.map(c=>'<li>'+c+'</li>').join('')||'<li>Your role, mission, clue sorting, and power move pointed here.</li>')+'</ul>';
  $('recommend').innerHTML='<strong>Suggested next move:</strong> '+s.next+'<br><br><strong>Suggested ABeam service:</strong> '+s.support;
  try{renderMetric(s);}catch(err){console.error('Metric render failed',err);}
  try{$('contactMessage').value=buildMessage(s,critical);}catch(err){console.error('Message build failed',err);$('contactMessage').value='Hello ABeam Consulting Indonesia team, I completed the Transformation Quest and would like to discuss the recommended support.';}
  show('result');
  confetti(44);
}
function confetti(n=30){const wrap=document.createElement('div');wrap.className='confetti';document.body.appendChild(wrap);for(let i=0;i<n;i++){const c=document.createElement('i');c.style.left=Math.random()*100+'vw';c.style.top='-20px';c.style.background=i%2?'#7d6e5a':'#001964';c.style.animationDelay=Math.random()*0.35+'s';wrap.appendChild(c);}setTimeout(()=>wrap.remove(),1500);}
$('startQuest').onclick=()=>{progress=1;show('role');renderRoles();};$('restartTop').onclick=()=>location.reload();$('playAgain').onclick=()=>location.reload();$('lockBoard').onclick=()=>{scoreBoard();progress=4;show('power');renderPower();};$('continuePower').onclick=()=>{progress=5;show('choice');renderFocus();};$('copyMessage').onclick=async()=>{try{await navigator.clipboard.writeText($('contactMessage').value);$('copyStatus').textContent='Copied';}catch(e){$('contactMessage').select();document.execCommand('copy');$('copyStatus').textContent='Copied';}};


document.addEventListener('click',e=>{const finalChoice=e.target.closest&&e.target.closest('.final-choice');if(finalChoice){e.preventDefault();selectFinal(finalChoice.dataset.service);}});
document.addEventListener('touchend',e=>{const finalChoice=e.target.closest&&e.target.closest('.final-choice');if(finalChoice){e.preventDefault();selectFinal(finalChoice.dataset.service);}}, {passive:false});

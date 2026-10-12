'use strict';
/* ===== Helpers ===== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function h(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const[k,v]of Object.entries(attrs)){if(v==null||v===false)continue;if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?'':v)}for(const c of kids.flat(9)){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(String(c)))}return e}
const ICONS={
 lines:'<path d="M4 6h16M4 12h16M4 18h10"/><rect x="2.5" y="9.5" width="19" height="5" rx="1.5" fill="currentColor" opacity=".18" stroke="none"/>',
 easy:'<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M7.5 10h9M7.5 13h6"/>',
 aa:'<path d="M3 18 8 6l5 12M4.8 14h6.4"/><path d="M15 18v-4.2a2.6 2.6 0 0 1 5.2 0V18M15 15.6h5.2"/>',
 speak:'<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
 stop:'<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>',
 up:'<path d="m6 15 6-6 6 6"/>', down:'<path d="m6 9 6 6 6-6"/>', right:'<path d="m9 6 6 6-6 6"/>', left:'<path d="m15 6-6 6 6 6"/>',
 close:'<path d="M6 6l12 12M18 6 6 18"/>',
 cards:'<rect x="3" y="6" width="14" height="14" rx="2.5"/><path d="M7 3h11.5A2.5 2.5 0 0 1 21 5.5V17"/>',
 bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
 check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 x:'<path d="M7 7l10 10M17 7 7 17"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
 quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 pin:'<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>'
};
const icon=(n,cls='i')=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('class',cls);s.setAttribute('aria-hidden','true');s.innerHTML=ICONS[n];return s};
const store={get(k,d){try{const v=localStorage.getItem('esv:'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('esv:'+k,JSON.stringify(v))}catch(e){}}};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow=()=>matchMedia('(max-width:1080px)').matches;
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);

/* ===== State ===== */
const S={
 tab:'start',
 cur:store.get('cur',{}),
 visited:store.get('visited',{}),
 helpTab:store.get('helpTab','text1'),
 settings:Object.assign({size:19,lh:1.75,font:'system',easy:false,rate:.95},store.get('settings',{})),
 solved:store.get('solved',{}),
 reading:false
};
const TABMETA=[{id:'start',label:'Start'},...TABS.map(t=>({id:t.id,label:t.short})),{id:'hilfe',label:'Hilfe zu Aufgaben'},{id:'glossar',label:'Glossar'}];
const SECTION_TAB={};TABS.forEach(t=>t.sections.forEach(s=>SECTION_TAB[s.id]=t));

/* ===== Speech ===== */
const Speech=(()=>{let voice=null,current=null;
 function pick(){if(!('speechSynthesis'in window))return;const vs=speechSynthesis.getVoices().filter(v=>/^de/i.test(v.lang));voice=vs.find(v=>/premium|enhanced|anna|helena|petra|google/i.test(v.name))||vs[0]||null}
 if('speechSynthesis'in window){pick();speechSynthesis.onvoiceschanged=pick}
 return{ok:()=> 'speechSynthesis'in window,
  say(text,{onend,owner}={}){if(!('speechSynthesis'in window))return false;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='de-DE';if(voice)u.voice=voice;u.rate=S.settings.rate;current=owner||null;u.onend=()=>{if(current===owner){current=null;onend&&onend()}};u.onerror=()=>{if(current===owner)current=null};speechSynthesis.speak(u);return true},
  stop(){current=null;if('speechSynthesis'in window)speechSynthesis.cancel()},
  owner:()=>current}})();

/* ===== Glossary matching ===== */
const G=GLOSSARY.map((g,i)=>({id:'g'+i,term:g[0],art:g[1],forms:g[2],expl:g[3],tabs:new Set()}));
const FORM2G=new Map();G.forEach(g=>g.forms.forEach(f=>FORM2G.set(f,g)));
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const GRX=new RegExp('(^|[^\\p{L}\\d])('+[...FORM2G.keys()].sort((a,b)=>b.length-a.length).map(esc).join('|')+')(?![\\p{L}\\d])','gu');

function words(text,parent){text.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t))parent.append(t);else parent.append(h('span',{class:'w'},t))})}
function richText(str,parent,used,tabId){
 str.split(/(\*\*[^*]+\*\*)/).forEach(seg=>{
  if(!seg)return;
  let target=parent;
  if(/^\*\*.*\*\*$/.test(seg)){seg=seg.slice(2,-2);target=h('strong');parent.append(target)}
  let last=0;GRX.lastIndex=0;let m;
  while((m=GRX.exec(seg))){
   const start=m.index+m[1].length, form=m[2], g=FORM2G.get(form);
   if(start>last)words(seg.slice(last,start),target);
   g.tabs.add(tabId);
   if(!used.has(g.id)){used.add(g.id);const t=h('span',{class:'term',role:'button',tabindex:'0','data-g':g.id,'aria-label':form+' – Erklärung anzeigen'});words(form,t);target.append(t)}
   else words(form,target);
   last=start+form.length;
  }
  if(last<seg.length)words(seg.slice(last),target);
 });
}

/* ===== Build tabs ===== */
const tabsEl=$('#tabs');
TABMETA.forEach(t=>tabsEl.append(h('button',{role:'tab',id:'tab-'+t.id,'aria-selected':'false','aria-controls':'view-'+t.id,onclick:()=>go(t.id)},t.label)));
function moveThumb(seg){const th=$('.thumb',seg),sel=$('[aria-selected="true"]',seg);if(!th||!sel)return;th.style.width=sel.offsetWidth+'px';th.style.transform=`translateX(${sel.offsetLeft}px)`}

const main=$('#main');
const views={};

function buildStart(){
 const v=h('section',{class:'view',id:'view-start',role:'tabpanel','aria-labelledby':'tab-start'});
 v.append(
  h('div',{class:'hero'},h('div',{class:'kicker'},'Workshop zur Pogromnacht · 9. November 1938'),h('h1',null,'Erinnern statt vergessen'),
    h('p',null,'Hier findest du die Texte und Quellen aus dem Workshop. Die Arbeitsaufträge bekommst du auf Papier. Diese Seite hilft dir beim Lesen und Verstehen.')),
  h('div',{class:'note'},icon('info'),h('div',null,h('b',null,'Bevor du anfängst: '),'Die Texte beschreiben Gewalt gegen Menschen, auch in Hörde, ganz in unserer Nähe. Wenn dich etwas belastet, mach eine Pause und sprich mit deiner Lehrkraft.')),
  h('h2',{class:'sect-title'},'Texte und Quellen'),
  (()=>{const c=h('div',{class:'cards',id:'start-cards'});TABS.forEach(t=>c.append(h('button',{class:'tcard','data-tab':t.id,onclick:()=>go(t.id)},h('div',{class:'kicker'},t.kicker),h('h3',null,t.title),h('p',null,t.intro),h('div',{class:'prog'},h('div',{class:'bar'},h('span',{style:'width:0%'})),h('span',{class:'pt'},'')))));return c})(),
  h('h2',{class:'sect-title'},'So helfen dir die Werkzeuge'),
  (()=>{const c=h('div',{class:'tools'});[
   ['lines','Lesemodus','Eine Zeile leuchtet auf, der Rest wird blasser. Tippe auf „Weiter“, wenn du die Zeile gelesen hast.'],
   ['book','Unterstrichene Wörter',h('span',null,'Tippe auf ein ',h('span',{class:'demo-term'},'unterstrichenes Wort'),'. Dann siehst du eine Erklärung in einfacher Sprache.')],
   ['easy','Kurz gesagt','Über jedem Abschnitt steht dann eine kurze Zusammenfassung in einfacher Sprache. Der Originaltext bleibt.'],
   ['pin','Lernlandkarte','Oben in jedem Text siehst du alle Abschnitte als Punkte. Tippe auf einen Punkt, um dorthin zu springen. So siehst du, wie weit du schon bist.'],
   ['cards','Hilfe zu Aufgaben','Im Reiter „Hilfe zu Aufgaben“ gibt es zu jedem Auftrag einen Tipp, eine Wortbox und ein Satzgeländer.'],
   ['quiz','Selbstcheck','Unter jedem Abschnitt kannst du prüfen, ob du ihn verstanden hast.'],
   ['speak','Vorlesen','Lass dir einen Abschnitt, eine Zeile oder ein Wort vorlesen.']
  ].forEach(([ic,b,p])=>c.append(h('div',{class:'toolcard'},h('span',{class:'ic'},icon(ic)),h('b',null,b),h('p',null,p))));return c})()
 );
 return v;
}

function buildTextView(t){
 const v=h('section',{class:'view',id:'view-'+t.id,role:'tabpanel','aria-labelledby':'tab-'+t.id,hidden:true});
 v.append(h('header',{class:'view-head'},h('div',{class:'kicker'},t.kicker),h('h1',null,t.title),h('p',null,t.intro)));
 const map=h('nav',{class:'lmap',id:'map-'+t.id,'aria-label':'Lernlandkarte'});
 const track=h('ol',{class:'lmap-track'});
 let lastG=null;
 t.sections.forEach((s,i)=>{
  const cap=s.g&&s.g!==lastG?GROUPS[s.g]:null;lastG=s.g||lastG;
  const label=s.m?s.m.replace('M',''):String(i+1);
  track.append(h('li',{class:'stop'+(cap?' gstart':''),'data-sec':s.id},
   cap?h('span',{class:'gcap'},cap):null,
   h('button',{type:'button',class:'dot',title:(s.m?s.m+' · ':'')+s.h,'aria-label':(s.m||('Abschnitt '+(i+1)))+': '+s.h,onclick:()=>setSection(t.id,s.id,true)},h('span',{class:'dn'},label))));
 });
 const capRow=h('div',{class:'lmap-cap'},h('span',{class:'lmap-now'}),h('span',{class:'lmap-prog'}));
 map.append(h('div',{class:'lmap-scroll'},track),capRow);
 const reader=h('article',{class:'reader',id:'reader-'+t.id});
 reader.append(h('div',{class:'ruler'}));
 t.sections.forEach((s,i)=>{const sec=buildSection(s,t);
  const prev=t.sections[i-1],next=t.sections[i+1];
  sec.append(h('div',{class:'secnav'},
   prev?h('button',{class:'tool',type:'button',onclick:()=>setSection(t.id,prev.id,true)},icon('left'),'Zurück'):h('span'),
   next?h('button',{class:'tool primary',type:'button',onclick:()=>setSection(t.id,next.id,true)},h('span',null,'Weiter: ',h('span',{class:'lbl-long'},next.h)),icon('right'))
       :h('button',{class:'tool primary',type:'button',onclick:()=>{S.helpTab=t.id;go('hilfe')}},'Zur Hilfe zu Aufgaben',icon('right'))));
  reader.append(sec)});
 if(t.ref)reader.append(h('p',{class:'reader-ref'},t.ref));
 v.append(map,reader);
 return v;
}
function setSection(tabId,secId,scroll=false){
 const t=TABS.find(x=>x.id===tabId);if(!t)return;
 if(!t.sections.some(s=>s.id===secId))secId=t.sections[0].id;
 if(S.reading)Reader.stop();Speech.stop();if(speakingBtn){setSpeakIcon(speakingBtn,false);speakingBtn=null}
 S.cur[tabId]=secId;S.visited[secId]=true;store.set('cur',S.cur);store.set('visited',S.visited);
 const r=$('#reader-'+tabId);
 $$('.sec',r).forEach(s=>s.hidden=s.dataset.sec!==secId);
 updateMap(tabId);
 if(document.body.classList.contains('times'))markTimes(true);
 if(scroll&&S.tab===tabId){const m=$('#map-'+tabId);const y=m.getBoundingClientRect().top+scrollY-topH()-8;if(scrollY>y)window.scrollTo({top:y,behavior:reduced()?'auto':'smooth'})}
}
function secDone(s){return s.quiz&&s.quiz.every((q,i)=>S.solved[qid(s,i)])}
function updateMap(tabId){
 const t=TABS.find(x=>x.id===tabId);const m=$('#map-'+tabId);if(!m)return;
 const cur=S.cur[tabId];const stops=$$('.stop',m);
 stops.forEach((li,i)=>{const s=t.sections[i];const b=$('.dot',li);
  li.classList.toggle('visited',!!S.visited[s.id]);li.classList.toggle('current',s.id===cur);
  li.classList.toggle('done',!!secDone(s));
  li.classList.toggle('linked',i>0&&!!S.visited[s.id]&&!!S.visited[t.sections[i-1].id]);
  if(s.id===cur)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
  const dn=$('.dn',b);dn.replaceChildren(secDone(s)&&s.id!==cur?icon('check'):(s.m?s.m.replace('M',''):String(i+1)));
 });
 const i=t.sections.findIndex(s=>s.id===cur),s=t.sections[i];
 $('.lmap-now',m).replaceChildren(h('b',null,(s.m||('Abschnitt '+(i+1)))),' · ',s.g?GROUPS[s.g]+' · ':'',s.h);
 const n=t.sections.filter(x=>S.visited[x.id]).length;
 $('.lmap-prog',m).textContent=n+' von '+t.sections.length+' gelesen';
 const sc=$('.lmap-scroll',m),cb=stops[i];if(cb&&sc.scrollWidth>sc.clientWidth)sc.scrollLeft=Math.max(0,cb.offsetLeft-(sc.clientWidth-cb.offsetWidth)/2);
}

function buildSection(s,t){
 const used=new Set();
 const sec=h('section',{class:'sec',id:'sec-'+s.id,'data-sec':s.id,'data-group':s.g||null,'aria-labelledby':'h-'+s.id});
 const speakBtn=h('button',{class:'icon-btn','aria-label':'Abschnitt vorlesen',title:'Abschnitt vorlesen'},icon('speak'));
 speakBtn.addEventListener('click',()=>toggleSectionSpeech(s,speakBtn));
 sec.append(h('div',{class:'sec-head'},s.m?h('span',{class:'tag'},s.m):null,h('h2',{id:'h-'+s.id},s.h),Speech.ok()?speakBtn:null));
 sec.append(h('div',{class:'easy'},h('b',null,'Kurz gesagt'),h('span',null,s.easy)));
 if(s.img){const im=IMG[s.img.k];sec.append(h('figure',{class:'fig'+(im.h>im.w?' contain':'')},h('img',{src:im.src,width:im.w,height:im.h,alt:s.img.cap,loading:'lazy'}),h('figcaption',null,s.img.cap,h('small',null,s.img.ref))))}
 const src=h('div',{class:'src'});
 s.p.forEach((para,i)=>{const p=h('p',{class:'src-p'+(s.doc&&s.doc.includes(i)?' doc':'')});richText(para,p,used,t.id);src.append(p)});
 sec.append(src);
 if(s.ref)sec.append(h('p',{class:'ref'},'Quelle: '+s.ref));
 if(s.quiz)sec.append(buildQuiz(s));
 return sec;
}

/* ===== Quiz ===== */
function qid(s,i){return s.id+':'+i}
function buildQuiz(s){
 const d=h('details',{class:'check'});
 const pill=h('span',{class:'pill'});
 d.append(h('summary',null,icon('right','i chev'),'Habe ich den Abschnitt verstanden?',pill));
 const box=h('div',{class:'qs'});
 function render(){
  box.replaceChildren();
  s.quiz.forEach((q,i)=>{
   const [text,opts,ans,why]=q;const id=qid(s,i);
   const fs=h('fieldset',{class:'q'},h('legend',null,(i+1)+'. '+text));
   const wrap=h('div',{class:'opts'});const fb=h('div',{class:'fb',hidden:true,role:'status'});
   const order=opts===TF?opts.map((o,j)=>j):shuffle(opts.map((o,j)=>j));
   order.forEach(j=>{
    const b=h('button',{class:'opt',type:'button'},h('span',{class:'mark'}),h('span',null,opts[j]));
    b.addEventListener('click',()=>{
     if(j===ans){b.classList.add('right');b.querySelector('.mark').append(icon('check'));$$('.opt',wrap).forEach(x=>x.disabled=true);fb.className='fb good';fb.replaceChildren(h('b',null,'Richtig!'),why);S.solved[id]=true;store.set('solved',S.solved);update()}
     else{b.classList.add('wrong');b.disabled=true;b.querySelector('.mark').append(icon('x'));fb.className='fb bad';fb.replaceChildren(h('b',null,'Noch nicht. Versuch es noch einmal.'),h('button',{class:'link',type:'button',onclick:()=>showSections([s.id])},'Im Text nachlesen'))}
     fb.hidden=false;
    });
    wrap.append(b);
   });
   if(S.solved[id]){const rb=[...wrap.children].find(x=>x.lastChild.textContent===opts[ans]);rb.classList.add('right');rb.querySelector('.mark').append(icon('check'));$$('.opt',wrap).forEach(x=>x.disabled=true);fb.className='fb good';fb.replaceChildren(h('b',null,'Richtig!'),why);fb.hidden=false}
   fs.append(wrap,fb);box.append(fs);
  });
  box.append(h('div',{class:'qs-foot'},h('button',{class:'textbtn',type:'button',onclick:()=>{s.quiz.forEach((q,i)=>delete S.solved[qid(s,i)]);store.set('solved',S.solved);render();update()}},'Noch einmal üben')));
 }
 function update(){const n=s.quiz.filter((q,i)=>S.solved[qid(s,i)]).length;pill.textContent=n===s.quiz.length?'✓ '+n+' von '+n:n+' von '+s.quiz.length;pill.classList.toggle('done',n===s.quiz.length);updateProgress();const tt=SECTION_TAB[s.id];if(tt&&$('#map-'+tt.id))updateMap(tt.id)}
 d.addEventListener('toggle',()=>{if(d.open&&!box.childElementCount)render();if(S.reading)Reader.recompute()},{passive:true});
 d.append(box);update();return d;
}
function updateProgress(){
 $$('#start-cards .tcard').forEach(c=>{const t=TABS.find(x=>x.id===c.dataset.tab);let tot=0,ok=0;t.sections.forEach(s=>(s.quiz||[]).forEach((q,i)=>{tot++;if(S.solved[qid(s,i)])ok++}));$('.bar span',c).style.width=(tot?ok/tot*100:0)+'%';$('.pt',c).textContent='Selbstcheck '+ok+'/'+tot});
}

/* ===== Help cards ===== */
function buildHelpView(){
 const v=h('section',{class:'view',id:'view-hilfe',role:'tabpanel','aria-labelledby':'tab-hilfe',hidden:true});
 v.append(h('header',{class:'view-head'},h('div',{class:'kicker'},'Hilfe zu Aufgaben'),h('h1',null,'Hilfe zu den Arbeitsaufträgen'),h('p',null,'Zu jedem Auftrag auf deinem Blatt gibt es drei Hilfen: einen Tipp, eine Wortbox und ein Satzgeländer. Nimm nur so viel Hilfe, wie du brauchst.')));
 const seg=h('div',{class:'seg',role:'tablist','aria-label':'Text wählen'},h('span',{class:'thumb'}));
 TABS.forEach(t=>seg.append(h('button',{role:'tab','data-t':t.id,'aria-selected':'false',onclick:()=>setHelpTab(t.id)},t.short)));
 v.append(h('div',{class:'helpbar'},seg));
 TABS.forEach(t=>{const g=h('div',{class:'helpgrid','data-t':t.id,hidden:true});g.append(h('h2',{class:'sect-title',style:'grid-column:1/-1;margin:0'},t.title,h('span',{style:'color:var(--text-2);font-weight:500'},' · '+t.kicker)));t.help.forEach(c=>g.append(buildHelpCard(c,t)));v.append(g)});
 v.append(h('p',{class:'hint',style:'margin-top:16px'},'Tippe auf ein Wort oder einen Satzanfang, um ihn zu hören.'));
 return v;
}
function setHelpTab(id){
 S.helpTab=id;store.set('helpTab',id);const v=views.hilfe;
 $$('.helpbar button',v).forEach(b=>b.setAttribute('aria-selected',String(b.dataset.t===id)));
 $$('.helpgrid',v).forEach(g=>g.hidden=g.dataset.t!==id);
 const seg=$('.helpbar .seg',v);moveThumb(seg);const gb=$('[aria-selected="true"]',seg);if(gb&&seg.scrollWidth>seg.clientWidth)seg.scrollLeft=Math.max(0,gb.offsetLeft-(seg.clientWidth-gb.offsetWidth)/2);
}
function frameNode(str){const li=h('li');str.split(/(…)/).forEach(p=>{if(p==='…')li.append(h('span',{class:'gap','aria-label':'Lücke'},'…'));else if(p)li.append(p)});li.addEventListener('click',()=>Speech.say(str.replace(/…/g,' ')));return li}
function buildHelpCard(c,t){
 const card=h('div',{class:'hcard'});
 card.append(h('div',{class:'hq'},h('span',{class:'n'},c.n),h('p',null,c.q)));
 const seg=h('div',{class:'seg hseg',role:'tablist','aria-label':'Hilfe zu Auftrag '+c.n},h('span',{class:'thumb'}));
 const body=h('div',{class:'hbody',hidden:true});
 const kinds=[['tip','Tipp'],['words','Wortbox'],['frames','Satzgeländer']];
 kinds.forEach(([k,l])=>{const b=h('button',{role:'tab','aria-selected':'false'},l);b.addEventListener('click',()=>{const same=b.getAttribute('aria-selected')==='true';$$('button',seg).forEach(x=>x.setAttribute('aria-selected','false'));if(same){body.hidden=true;$('.thumb',seg).style.width='0';return}b.setAttribute('aria-selected','true');moveThumb(seg);show(k)});seg.append(b)});
 function show(k){
  body.hidden=false;body.replaceChildren();body.style.animation='none';void body.offsetWidth;body.style.animation='';
  if(k==='tip'){body.append(h('p',null,c.tip));const acts=h('div',{class:'hactions'});
   c.where.forEach(id=>{const s=t.sections.find(x=>x.id===id);acts.append(h('button',{class:'tool',onclick:()=>showSections([id])},icon('pin'),(s.m?s.m:'Abschnitt '+(t.sections.indexOf(s)+1))+': '+s.h))});
   if(c.times){const tb=h('button',{class:'tool','aria-pressed':String(document.body.classList.contains('times'))},icon('clock'),'Zeitangaben markieren');tb.addEventListener('click',()=>{const on=!document.body.classList.contains('times');markTimes(on);$$('[data-times]').forEach(x=>x.setAttribute('aria-pressed',String(on)))});tb.dataset.times='1';acts.append(tb)}
   if(acts.childElementCount)body.append(acts)}
  if(k==='words'){const ch=h('div',{class:'chips'});c.words.forEach(w=>{const b=h('button',{class:'chip'},w);b.addEventListener('click',()=>{b.classList.add('talk');Speech.say(w.replace(/[„“»«]/g,''),{owner:b,onend:()=>b.classList.remove('talk')});setTimeout(()=>b.classList.remove('talk'),1600)});ch.append(b)});body.append(ch)}
  if(k==='frames'){const ul=h('ul',{class:'frames'});c.frames.forEach(f=>ul.append(frameNode(f)));body.append(ul)}
 }
 card.append(seg,body);return card;
}
const TIME_RX=/^[„(]?(\d{1,2}[.:]\d{2}|\d{2}\.\d{2}\.\d{4}|Uhr|Abend|Abends|Nacht|Nachts|nachts|Morgen|Morgenstunden|Mittag|Minuten|Stunden|Mittwoch|November|Frühschicht|Nachtschicht|darauf|Tags|kurze|Kurz|kurz|später|Dienstschluss|Anschluss)[.,;:“)]*$/;
function markTimes(on){document.body.classList.toggle('times',on);$$('[data-times]').forEach(x=>x.setAttribute('aria-pressed',String(on)));$$('#reader-hoerde .src .w').forEach(w=>{if(on&&TIME_RX.test(w.textContent))w.classList.add('time');else w.classList.remove('time')})}

/* ===== Navigation ===== */
function go(id,{push=true}={}){
 if(!views[id])id='start';
 if(S.reading)Reader.stop();
 Speech.stop();hidePop();closePanel();
 S.tab=id;
 Object.entries(views).forEach(([k,v])=>v.hidden=k!==id);
 $$('#tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.id==='tab-'+id)));
 moveThumb(tabsEl);
 const sel=$('#tab-'+id);if(sel){const ts=tabsEl;ts.scrollLeft=Math.max(0,sel.offsetLeft-(ts.clientWidth-sel.offsetWidth)/2)}
 const isText=TABS.some(t=>t.id===id);
 $('#toolbar').hidden=!isText;
 if(isText){S.helpTab=id;setSection(id,S.cur[id]||TABS.find(t=>t.id===id).sections[0].id)}
 if(id==='hilfe')setHelpTab(S.helpTab);
 $$('.seg',views[id]).forEach(moveThumb);
 if(push&&location.hash!=='#'+id){try{history.replaceState(null,'','#'+id)}catch(e){location.hash=id}}
 window.scrollTo({top:0,behavior:'auto'});
 measureTop();
}
function topH(){return $('#top').getBoundingClientRect().height}
function measureTop(){document.documentElement.style.setProperty('--top-h',Math.round(topH()+16)+'px')}
function scrollToEl(el,top=false){const y=el.getBoundingClientRect().top+scrollY-topH()-(top?16:24);window.scrollTo({top:Math.max(0,y),behavior:reduced()?'auto':'smooth'})}
function showSections(ids){
 const t=SECTION_TAB[ids[0]];if(!t)return;
 if(S.tab!==t.id)go(t.id);
 setSection(t.id,ids[0]);
 requestAnimationFrame(()=>{const s=$('#sec-'+ids[0]);scrollToEl(s);s.classList.add('flash');setTimeout(()=>s.classList.remove('flash'),2200)});
}
/* ===== Section speech ===== */
let speakingBtn=null;
function toggleSectionSpeech(s,btn){
 if(speakingBtn===btn){Speech.stop();setSpeakIcon(btn,false);speakingBtn=null;return}
 if(speakingBtn)setSpeakIcon(speakingBtn,false);
 speakingBtn=btn;setSpeakIcon(btn,true);
 const text=(S.settings.easy?'Kurz gesagt. '+s.easy+' ':'')+s.p.join(' ').replace(/\*\*/g,'');
 Speech.say(text,{owner:btn,onend:()=>{setSpeakIcon(btn,false);if(speakingBtn===btn)speakingBtn=null}});
}
function setSpeakIcon(btn,on){btn.replaceChildren(icon(on?'stop':'speak'));btn.setAttribute('aria-label',on?'Vorlesen stoppen':'Abschnitt vorlesen')}

/* ===== Reading mode (line ruler) ===== */
const Reader=(()=>{let lines=[],idx=0,reader=null,ruler=null,auto=false,ro=null;
 const bar=$('#readbar'),count=$('#rb-count');
 function visibleSpans(){return $$('.sec:not([hidden]) .src .w',reader)}
 function recompute(reset=false){
  if(!reader)return;
  const keep=!reset&&lines[idx]?lines[idx].spans[0]:null;
  lines=[];let cur=null;
  for(const s of visibleSpans()){const r=s.getBoundingClientRect();const p=s.closest('p');
   if(!cur||p!==cur.p||Math.abs(r.top-cur.t)>r.height*.5){cur={p,t:r.top,top:r.top+scrollY,bottom:r.bottom+scrollY,left:r.left,right:r.right,spans:[s]};lines.push(cur)}
   else{cur.spans.push(s);cur.bottom=Math.max(cur.bottom,r.bottom+scrollY);cur.left=Math.min(cur.left,r.left);cur.right=Math.max(cur.right,r.right)}}
  lines.forEach((l,i)=>l.spans.forEach(s=>s._line=i));
  if(keep&&keep._line!=null&&visibleSpans().includes(keep))idx=keep._line;
  else if(reset)idx=firstVisible();
  idx=Math.min(idx,Math.max(0,lines.length-1));
  draw(false);
 }
 function firstVisible(){const y=scrollY+topH()+20;const i=lines.findIndex(l=>l.top>=y);return i<0?0:i}
 function draw(scroll=true){
  $$('.w.on',reader).forEach(w=>w.classList.remove('on'));
  const l=lines[idx];if(!l)return;
  l.spans.forEach(s=>s.classList.add('on'));
  const rr=reader.getBoundingClientRect();
  const top=l.top-(rr.top+scrollY)-5, left=l.left-rr.left-8;
  ruler.style.transform=`translate(${left}px,${top}px)`;ruler.style.width=(l.right-l.left+16)+'px';ruler.style.height=(l.bottom-l.top+10)+'px';
  count.textContent='Zeile '+(idx+1)+' / '+lines.length;
  $('#rb-prev').disabled=idx===0;
  if(scroll){const vy=l.top-scrollY;const th=topH();if(vy<th+40||vy>innerHeight*.62)window.scrollTo({top:l.top-th-Math.max(80,(innerHeight-th)*.32),behavior:reduced()?'auto':'smooth'})}
 }
 function step(d){if(!lines.length)return;const n=idx+d;if(n<0||n>=lines.length){if(n>=lines.length){count.textContent='Ende ✓';stopAuto()}return}idx=n;draw();if(auto)speakLine()}
 function lineText(){return lines[idx]?lines[idx].spans.map(s=>s.textContent).join(' '):''}
 function speakLine(){Speech.say(lineText(),{owner:'reader',onend:()=>{if(auto){if(idx<lines.length-1){idx++;draw();speakLine()}else{stopAuto();count.textContent='Ende ✓'}}}})}
 function stopAuto(){auto=false;const b=$('#rb-speak');b.setAttribute('aria-pressed','false');b.replaceChildren(icon('speak'));if(Speech.owner()==='reader')Speech.stop()}
 function start(){
  const t=TABS.find(x=>x.id===S.tab);if(!t)return;
  reader=$('#reader-'+t.id);ruler=$('.ruler',reader);S.reading=true;
  hidePop();
  reader.classList.add('reading');bar.classList.add('show');
  const b=$('#btn-read');b.setAttribute('aria-pressed','true');
  recompute(true);draw(true);
  ro=new ResizeObserver(()=>recompute());ro.observe(reader);
 }
 function stop(){if(!reader)return;stopAuto();S.reading=false;reader.classList.remove('reading');$$('.w.on',reader).forEach(w=>w.classList.remove('on'));bar.classList.remove('show');$('#btn-read').setAttribute('aria-pressed','false');if(ro)ro.disconnect();reader=null}
 document.addEventListener('click',e=>{if(!S.reading||!reader)return;const w=e.target.closest('.src .w');if(!w||!reader.contains(w)||e.target.closest('.term'))return;if(w._line!=null){idx=w._line;draw(false)}});
 $('#rb-prev').append(icon('up'));$('#rb-next').append(icon('down'),h('span',null,'Weiter'));$('#rb-speak').append(icon('speak'));$('#rb-close').append(icon('close'));
 $('#rb-prev').addEventListener('click',()=>step(-1));
 $('#rb-next').addEventListener('click',()=>step(1));
 $('#rb-close').addEventListener('click',stop);
 $('#rb-speak').addEventListener('click',e=>{if(!Speech.ok()){count.textContent='Kein Vorlesen';return}auto=!auto;const b=e.currentTarget;b.setAttribute('aria-pressed',String(auto));b.replaceChildren(icon(auto?'stop':'speak'));if(auto)speakLine();else stopAuto()});
 return{start,stop,step,recompute,get on(){return S.reading}};
})();

/* ===== Glossary popover ===== */
const pop=$('#pop');let popTerm=null,popPinned=false,hoverT=null,leaveT=null;
function showPop(el,pinned){
 const g=G.find(x=>x.id===el.dataset.g);if(!g)return;
 if(popTerm)popTerm.classList.remove('open');
 popTerm=el;popPinned=pinned;el.classList.add('open');
 pop.replaceChildren(
  h('div',{class:'lbl'},'Worterklärung'),
  h('h3',null,g.term,g.art?h('small',null,g.art):null),
  h('p',null,g.expl),
  h('div',{class:'pa'},
   Speech.ok()?h('button',{type:'button',onclick:()=>Speech.say(g.term+'. '+g.expl)},icon('speak'),'Vorlesen'):null,
   h('button',{type:'button',onclick:()=>{hidePop();openGlossary(g.id)}},icon('book'),'Im Glossar')));
 const r=el.getClientRects()[0]||el.getBoundingClientRect();
 pop.style.left='0px';pop.style.top='0px';pop.classList.add('show');
 const pw=pop.offsetWidth,ph=pop.offsetHeight;
 let x=Math.min(Math.max(12,r.left+r.width/2-pw/2),innerWidth-pw-12);
 let below=r.bottom+10+ph<innerHeight-12;let y=below?r.bottom+10:r.top-ph-10;y=Math.max(topH()+6,y);
 pop.style.left=x+'px';pop.style.top=y+'px';
 pop.style.setProperty('--ox',(r.left+r.width/2-x)+'px');pop.style.setProperty('--oy',below?'0px':'100%');
}
function hidePop(){pop.classList.remove('show');if(popTerm)popTerm.classList.remove('open');popTerm=null;popPinned=false}
const hoverable=matchMedia('(hover:hover) and (pointer:fine)');
document.addEventListener('pointerover',e=>{if(!hoverable.matches)return;const t=e.target.closest('.term');if(t){clearTimeout(leaveT);if(t!==popTerm){clearTimeout(hoverT);hoverT=setTimeout(()=>showPop(t,false),180)}}else if(e.target.closest('#pop')){clearTimeout(leaveT)}});
document.addEventListener('pointerout',e=>{if(!hoverable.matches)return;const from=e.target.closest('.term,#pop');if(!from)return;const to=e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.term,#pop');if(to===from||(to&&to.id==='pop'&&popTerm)||(to===popTerm))return;clearTimeout(hoverT);if(!popPinned)leaveT=setTimeout(hidePop,220)});
document.addEventListener('click',e=>{
 const t=e.target.closest('.term');
 if(t){e.preventDefault();if(popTerm===t&&popPinned){hidePop()}else showPop(t,true);return}
 if(!e.target.closest('#pop'))hidePop();
 if(!e.target.closest('#panel,#btn-settings'))closePanel();
});
document.addEventListener('keydown',e=>{
 const t=e.target.closest&&e.target.closest('.term');
 if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showPop(t,true);return}
 if(e.key==='Escape'){if(pop.classList.contains('show'))hidePop();else if($('#panel').classList.contains('show'))closePanel();else if(S.reading)Reader.stop();return}
 if(S.reading&&!e.target.closest('input,textarea')){
  if(['ArrowDown','PageDown'].includes(e.key)||(e.key===' '&&!e.target.closest('button'))||(e.key==='Enter'&&!e.target.closest('button'))){e.preventDefault();Reader.step(1)}
  else if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();Reader.step(-1)}
 }
});
addEventListener('scroll',()=>{if(pop.classList.contains('show')&&!popPinned)hidePop()},{passive:true});

function closeSheet(){}

/* ===== Settings panel ===== */
const panel=$('#panel');
function applySettings(){const st=S.settings;const r=document.documentElement.style;r.setProperty('--read-size',st.size+'px');r.setProperty('--read-lh',st.lh);document.body.classList.toggle('font-hyper',st.font==='hyper');document.body.classList.toggle('show-easy',!!st.easy);$('#btn-easy').setAttribute('aria-pressed',String(!!st.easy));store.set('settings',st);if(S.reading)requestAnimationFrame(()=>Reader.recompute())}
function buildPanel(){
 const st=S.settings;
 const size=h('input',{type:'range',id:'set-size',min:16,max:28,step:1,value:st.size,oninput:e=>{st.size=+e.target.value;applySettings()}});
 const lh=h('input',{type:'range',id:'set-lh',min:1.5,max:2.3,step:.05,value:st.lh,oninput:e=>{st.lh=+e.target.value;applySettings()}});
 const rate=h('input',{type:'range',id:'set-rate',min:.6,max:1.3,step:.05,value:st.rate,oninput:e=>{st.rate=+e.target.value;store.set('settings',st)}});
 const fseg=h('div',{class:'seg',role:'radiogroup','aria-label':'Schriftart'},h('span',{class:'thumb'}));
 [['system','Standard'],['hyper','Lesefreundlich']].forEach(([k,l])=>fseg.append(h('button',{role:'radio','aria-selected':String(st.font===k),'aria-checked':String(st.font===k),style:k==='hyper'?'font-family:"Atkinson Hyperlegible",sans-serif':'',onclick:e=>{st.font=k;$$('button',fseg).forEach(b=>{b.setAttribute('aria-selected',String(b===e.currentTarget));b.setAttribute('aria-checked',String(b===e.currentTarget))});moveThumb(fseg);applySettings()}},l)));
 panel.replaceChildren(h('h3',null,'Darstellung'),
  h('div',{class:'row'},h('label',{for:'set-size'},'Schriftgröße'),size),
  h('div',{class:'row'},h('label',{for:'set-lh'},'Zeilenabstand'),lh),
  h('div',{class:'row'},h('label',null,'Schrift'),fseg),
  Speech.ok()?h('div',{class:'row'},h('label',{for:'set-rate'},'Vorlesetempo'),rate):null,
  h('p',{class:'sample'},'Am 9. November 1938 brannte die Hörder Synagoge.'));
 requestAnimationFrame(()=>moveThumb(fseg));
}
function openPanel(){buildPanel();panel.classList.add('show');$('#btn-settings').setAttribute('aria-expanded','true')}
function closePanel(){panel.classList.remove('show');$('#btn-settings').setAttribute('aria-expanded','false')}
$('#btn-settings').append(icon('aa'));
$('#btn-settings').addEventListener('click',()=>panel.classList.contains('show')?closePanel():openPanel());

/* ===== Toolbar ===== */
$('#btn-read').append(icon('lines'),h('span',null,'Lesemodus'));
$('#btn-easy').append(icon('easy'),h('span',null,'Kurz gesagt'));
$('#btn-helps').append(icon('cards'),h('span',null,'Hilfe',h('span',{class:'lbl-long'},' zu Aufgaben')));
$('#btn-read').addEventListener('click',()=>S.reading?Reader.stop():Reader.start());
$('#btn-easy').addEventListener('click',()=>{S.settings.easy=!S.settings.easy;applySettings()});
$('#btn-helps').addEventListener('click',()=>{S.helpTab=S.tab;go('hilfe')});

/* ===== Glossary view ===== */
function buildGlossary(){
 const v=h('section',{class:'view',id:'view-glossar',role:'tabpanel','aria-labelledby':'tab-glossar',hidden:true});
 v.append(h('header',{class:'view-head'},h('div',{class:'kicker'},'Alle Begriffe · leichte Sprache'),h('h1',null,'Glossar'),h('p',null,'Alle unterstrichenen Wörter aus den Texten. Du kannst suchen oder nach Text filtern.')));
 const input=h('input',{type:'search',id:'gsearch',placeholder:'Begriff suchen','aria-label':'Begriff suchen',autocomplete:'off'});
 const fseg=h('div',{class:'seg',role:'tablist','aria-label':'Nach Text filtern'},h('span',{class:'thumb'}));
 let filter='all';
 [['all','Alle'],...TABS.map(t=>[t.id,t.short])].forEach(([k,l])=>fseg.append(h('button',{role:'tab','aria-selected':String(k==='all'),onclick:e=>{filter=k;$$('button',fseg).forEach(b=>b.setAttribute('aria-selected',String(b===e.currentTarget)));moveThumb(fseg);render()}},l)));
 v.append(h('div',{class:'gtools'},h('label',{class:'search'},icon('search'),input),fseg));
 const list=h('div',{class:'glist',id:'glist'});v.append(list);
 const sorted=[...G].sort((a,b)=>a.term.replace(/[„“»«]/g,'').localeCompare(b.term.replace(/[„“»«]/g,''),'de'));
 function render(){
  const q=input.value.trim().toLowerCase();list.replaceChildren();
  const items=sorted.filter(g=>g.tabs.size&&(filter==='all'||g.tabs.has(filter))&&(!q||g.term.toLowerCase().includes(q)||g.expl.toLowerCase().includes(q)));
  if(!items.length){list.append(h('p',{class:'empty'},'Kein Begriff gefunden.'));return}
  items.forEach(g=>list.append(h('article',{class:'gitem',id:'gl-'+g.id},
   h('header',null,h('h3',null,g.term),g.art?h('small',null,g.art):null,Speech.ok()?h('button',{class:'icon-btn','aria-label':g.term+' vorlesen',onclick:()=>Speech.say(g.term+'. '+g.expl)},icon('speak')):null),
   h('p',null,g.expl),h('span',{class:'where'},'Vorkommen: '+[...g.tabs].map(id=>TABS.find(t=>t.id===id).short).join(' · ')))));
 }
 input.addEventListener('input',render);
 v._render=render;v._seg=fseg;
 return v;
}
function openGlossary(id){go('glossar');const v=views.glossar;$('#gsearch').value='';v._render();requestAnimationFrame(()=>{const el=$('#gl-'+id);if(el){scrollToEl(el);el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),2200)}})}

/* ===== Init ===== */
views.start=buildStart();main.append(views.start);
TABS.forEach(t=>{views[t.id]=buildTextView(t);main.append(views[t.id])});
views.hilfe=buildHelpView();main.append(views.hilfe);
views.glossar=buildGlossary();main.append(views.glossar);views.glossar._render();
applySettings();updateProgress();
const initial=(location.hash||'').slice(1);
go(TABMETA.some(t=>t.id===initial)?initial:'start',{push:false});
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id!==S.tab&&views[id])go(id,{push:false})});
let rT;addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(()=>{measureTop();moveThumb(tabsEl);$$('.seg').forEach(moveThumb);TABS.forEach(t=>updateMap(t.id))},120)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{moveThumb(tabsEl);$$('.seg').forEach(moveThumb);if(S.reading)Reader.recompute()});
requestAnimationFrame(()=>{measureTop();moveThumb(tabsEl);$$('.seg',views[S.tab]).forEach(moveThumb)});

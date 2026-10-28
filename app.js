const KEY='tcTracker.v1',$=s=>document.querySelector(s);
let A=[];try{A=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(A))}catch(e){}};
let view='themes',theme=null,filt='all';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>v===''||v==null||isNaN(+v)?0:+v;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const nowT=()=>new Date().toTimeString().slice(0,5);
const mins=a=>{if(!a.start||!a.end)return 0;const[h1,m1]=a.start.split(':'),[h2,m2]=a.end.split(':');let d=(+h2*60+ +m2)-(+h1*60+ +m1);return d<0?d+1440:d};
const cat=a=>a.trans?'mock':'dr';
const tagOf=a=>!a.trans?'':a.err>10?'<span class="tag r">WORK HARD</span>':'<span class="tag g">You\u2019ll select in 2026 Skill test</span>';
const fmtD=d=>new Date(d+'T00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const f1=n=>(Math.round(n*10)/10).toString();
const tcDone=tc=>A.filter(a=>a.tc===tc).length;

document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{view=b.dataset.v;theme=null;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));render()});
function render(){view==='themes'?(theme?renderEx():renderThemes()):renderDash();scrollTo(0,0)}

function renderThemes(){
  $('#main').innerHTML='<p class="m">'+THEMES.length+' themes. Tap a theme to open its exercises.</p><div class="grid">'+THEMES.map(t=>{
    const d=t.tcs.filter(tc=>tcDone(tc)).length,p=Math.round(d/t.tcs.length*100);
    return `<div class="card" data-t="${t.no}"><small>Theme ${t.no}</small><b>${esc(t.name)}</b><small>${d} / ${t.tcs.length} exercises attempted</small><div class="bar"><i style="width:${p}%"></i></div></div>`}).join('')+'</div>';
  document.querySelectorAll('[data-t]').forEach(c=>c.onclick=()=>{theme=THEMES.find(t=>t.no==c.dataset.t);render()});
}
function renderEx(){
  $('#main').innerHTML=`<button id="back">\u2190 All themes</button><h2>Theme ${theme.no}: ${esc(theme.name)}</h2><div class="grid">`+theme.tcs.map(tc=>{
    const[v,t]=TCS[tc],n=tcDone(tc);
    return `<div class="card ${n?'done':''}" data-x="${tc}"><small>Volume ${v} \u00b7 TC ${tc} \u00b7 Theme ${theme.no}</small><b>${esc(t)}</b><small>${n?n+' attempt'+(n>1?'s':'')+' logged':'Not attempted'}</small></div>`}).join('')+'</div>';
  $('#back').onclick=()=>{theme=null;render()};
  document.querySelectorAll('[data-x]').forEach(c=>c.onclick=()=>openForm(+c.dataset.x));
}

/* ---------- popup form ---------- */
const step=(id,v=0)=>`<div class="step"><button type="button" data-s="${id}" data-d="-1">\u2212</button><input id="${id}" inputmode="numeric" value="${v||''}" placeholder="0"><button type="button" data-s="${id}" data-d="1">+</button></div>`;
const dec=(id,ph)=>`<input id="${id}" inputmode="decimal" placeholder="${ph}">`;
const sec=(id,label,inner)=>`<div class="blk"><label class="ck"><input type="checkbox" id="${id}"> ${label}</label><div class="sub" id="s_${id}" hidden>${inner}</div></div>`;
const cnt=(id)=>`<span class="lbl">How many times</span>${step(id,1)}`;
function openForm(tc){
  const[v,t]=TCS[tc],th=theme||THEMES.find(x=>x.tcs.includes(tc));
  $('#sheet').innerHTML=`<small class="m">Volume ${v} \u00b7 TC ${tc} \u00b7 Theme ${th.no}</small><h2 style="margin:4px 0 14px">${esc(t)}</h2>
  <div class="row"><div><span class="lbl">Date</span><input type="date" id="date" value="${today()}"></div></div>
  <div class="row"><div><span class="lbl">Start time</span><input type="time" id="start" value="${nowT()}"></div><div><span class="lbl">End time</span><input type="time" id="end"></div></div>
  <div class="row"><button type="button" id="ns">Start = now</button><button type="button" id="ne">End = now</button></div>
  <div class="row"><label class="ck"><input type="checkbox" id="seen"> Seen</label><label class="ck"><input type="checkbox" id="unseen"> Unseen</label></div>
  ${sec('practice','Practice',cnt('pN'))}
  ${sec('reading','Reading (practice work)',cnt('rN'))}
  ${sec('dict','Dictation',`<span class="lbl">How many times</span>${step('dN',1)}<div id="dsp" class="row"></div>`)}
  ${sec('dread','Reading (dictation work)',cnt('drN'))}
  ${sec('trans','Transcription',`<div class="row"><div><span class="lbl">Typing speed (WPM)</span>${dec('speed','0')}</div><div><span class="lbl">Error percentage (%)</span>${dec('err','0')}</div></div><div class="row"><div><span class="lbl">Half mistakes</span>${dec('half','0')}</div><div><span class="lbl">Full mistakes</span>${dec('full','0')}</div></div>`)}
  <div class="row"><button type="button" id="cancel">Cancel</button><button type="button" id="saveBtn" style="background:#fff;color:#000;font-weight:700">Save</button></div>`;
  $('#modal').hidden=false;
  const sh=$('#sheet');
  sh.querySelectorAll('.blk>label input').forEach(c=>c.onchange=()=>{$('#s_'+c.id).hidden=!c.checked;if(c.id==='dict')dsp()});
  sh.onclick=e=>{const b=e.target.closest('[data-s]');if(b){const i=$('#'+b.dataset.s);i.value=Math.max(0,num(i.value)+ +b.dataset.d);if(b.dataset.s==='dN')dsp()}};
  $('#dN').oninput=dsp;$('#ns').onclick=()=>$('#start').value=nowT();$('#ne').onclick=()=>$('#end').value=nowT();
  $('#cancel').onclick=()=>$('#modal').hidden=true;
  $('#seen').onchange=()=>{if($('#seen').checked)$('#unseen').checked=false};$('#unseen').onchange=()=>{if($('#unseen').checked)$('#seen').checked=false};
  function dsp(){const n=Math.min(20,num($('#dN').value)),old=[...document.querySelectorAll('.dsp')].map(i=>i.value);
    $('#dsp').innerHTML=Array.from({length:n},(_,i)=>`<div><span class="lbl">Dictation ${i+1} speed (WPM)</span><input class="dsp" inputmode="numeric" value="${old[i]||''}" placeholder="0"></div>`).join('')}
  $('#saveBtn').onclick=()=>{
    const g=id=>$('#'+id),c=id=>g(id).checked;
    const a={id:Date.now(),tc,vol:v,title:t,themeNo:th.no,themeName:th.name,date:g('date').value||today(),start:g('start').value,end:g('end').value,
      seen:c('seen'),unseen:c('unseen'),practice:c('practice'),pN:c('practice')?num(g('pN').value):0,reading:c('reading'),rN:c('reading')?num(g('rN').value):0,
      dict:c('dict'),dN:c('dict')?num(g('dN').value):0,dSpeeds:c('dict')?[...document.querySelectorAll('.dsp')].map(i=>num(i.value)):[],
      dread:c('dread'),drN:c('dread')?num(g('drN').value):0,trans:c('trans'),speed:num(g('speed').value),err:num(g('err').value),half:num(g('half').value),full:num(g('full').value)};
    if(!a.trans)a.speed=a.err=a.half=a.full=0;
    A.push(a);save();$('#modal').hidden=true;render();
  };
}

/* ---------- review card ---------- */
function review(id){
  const a=A.find(x=>x.id===id);if(!a)return;
  const kv=(k,v)=>`<div><span>${k}</span>${v}</div>`,yn=b=>b?'Yes':'No';
  $('#sheet').innerHTML=`<div id="rc" class="rc"><small class="m">Volume ${a.vol} \u00b7 TC ${a.tc} \u00b7 Theme ${a.themeNo}</small><h3>${esc(a.title)}</h3>${tagOf(a)}
  <div class="kv">${kv('Date',fmtD(a.date))}${kv('Time',(a.start||'-')+' to '+(a.end||'-')+' ('+mins(a)+' min)')}${kv('Status',a.seen?'Seen':a.unseen?'Unseen':'Not marked')}${kv('Category',cat(a)==='mock'?'Complete Mock':'Dictation & Reading')}
  ${kv('Practice',a.practice?a.pN+' time(s)':'No')}${kv('Reading (practice)',a.reading?a.rN+' time(s)':'No')}
  ${kv('Dictation',a.dict?a.dN+' time(s)'+(a.dSpeeds.some(x=>x)?' \u00b7 '+a.dSpeeds.map(x=>x+' WPM').join(', '):''):'No')}${kv('Reading (dictation)',a.dread?a.drN+' time(s)':'No')}
  ${a.trans?kv('Typing speed',a.speed+' WPM')+kv('Error',a.err+'%')+kv('Half mistakes',a.half)+kv('Full mistakes',a.full):kv('Transcription',yn(false))}</div></div>
  <div class="row" style="margin-top:14px"><button id="png">Save as PNG</button><button id="jpg">Save as JPG</button><button id="del">Delete</button><button id="x">Close</button></div>`;
  $('#modal').hidden=false;$('#sheet').onclick=null;
  const dl=async t=>{if(!window.html2canvas)return alert('Image export needs an internet connection.');const c=await html2canvas($('#rc'),{backgroundColor:'#000',scale:2});const l=document.createElement('a');l.download=`TC${a.tc}_${a.date}.${t==='png'?'png':'jpg'}`;l.href=c.toDataURL(t==='png'?'image/png':'image/jpeg',.95);l.click()};
  $('#png').onclick=()=>dl('png');$('#jpg').onclick=()=>dl('jpg');$('#x').onclick=()=>$('#modal').hidden=true;
  $('#del').onclick=()=>{if(confirm('Delete this attempt?')){A=A.filter(x=>x.id!==id);save();$('#modal').hidden=true;render()}};
}
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').hidden=true};

/* ---------- dashboard ---------- */
const cols=(items,o={})=>{const mx=Math.max(...items.map(i=>i.v+(i.v2||0)),1);return '<div class="cols">'+items.map(i=>`<div class="col"><em>${i.v2!=null?i.v+'/'+i.v2:f1(i.v)}</em>${i.v2!=null?`<i class="r" style="height:${i.v2/mx*85}%"></i>`:''}<i class="${i.c||''}" style="height:${i.v/mx*85}%;${i.v2!=null?'opacity:.85':''}"></i><span>${i.l}</span></div>`).join('')+'</div>'};
const box=(t,inner)=>`<div class="box"><h3>${t}</h3>${inner||'<p class="m">No data yet.</p>'}</div>`;
const mondayOf=d=>{const x=new Date(d+'T00:00');x.setDate(x.getDate()-((x.getDay()+6)%7));return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const lbl=d=>new Date(d+'T00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'});
function lastN(n,step,keyFn,labelFn){const out=[],d=new Date();for(let i=n-1;i>=0;i--){const x=new Date(d);step(x,i);out.push(keyFn(x))}return out.map(k=>({k,l:labelFn(k)}))}
const ds=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
function renderDash(){
  const T=A.filter(a=>a.trans),mocks=T.length;
  const list=A.filter(a=>filt==='all'||(filt==='seen'&&a.seen)||(filt==='unseen'&&a.unseen)||(filt==='dr'&&cat(a)==='dr')||(filt==='mock'&&cat(a)==='mock')).sort((a,b)=>(b.date+b.start).localeCompare(a.date+a.start));
  const days=lastN(14,(x,i)=>x.setDate(x.getDate()-i),ds,k=>lbl(k)).map(o=>({l:o.l,v:A.filter(a=>a.date===o.k).length}));
  const wk=lastN(8,(x,i)=>x.setDate(x.getDate()-i*7),d=>mondayOf(ds(d)),lbl).map(o=>({l:o.l,v:A.filter(a=>mondayOf(a.date)===o.k).length}));
  const mo=lastN(6,(x,i)=>{x.setDate(1);x.setMonth(x.getMonth()-i)},d=>ds(d).slice(0,7),k=>new Date(k+'-01T00:00').toLocaleDateString('en-GB',{month:'short',year:'2-digit'})).map(o=>({l:o.l,v:A.filter(a=>a.date.slice(0,7)===o.k).length}));
  const tm=lastN(14,(x,i)=>x.setDate(x.getDate()-i),ds,lbl).map(o=>({l:o.l,v:A.filter(a=>a.date===o.k).reduce((s,a)=>s+mins(a),0)}));
  const srt=[...T].sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  const errT=srt.slice(-15).map(a=>({l:'TC'+a.tc,v:a.err,c:a.err>10?'r':'g'}));
  const mist=srt.slice(-12).map(a=>({l:'TC'+a.tc,v:a.half,v2:a.full}));
  const spd=srt.slice(-15).map(a=>({l:'TC'+a.tc,v:a.speed}));
  const hi=[...T].sort((a,b)=>b.err-a.err).slice(0,5),lo=[...T].sort((a,b)=>a.err-b.err).slice(0,5);
  const li=a=>`<div class="li"><span>TC ${a.tc} \u00b7 ${esc(a.title)}</span><b>${a.err}%</b></div>`;
  const dsAll=A.flatMap(a=>a.dSpeeds).filter(x=>x>0);
  const ds7=new Set(A.map(a=>a.date));let streak=0;{const d=new Date();if(!ds7.has(ds(d)))d.setDate(d.getDate()-1);while(ds7.has(ds(d))){streak++;d.setDate(d.getDate()-1)}}
  const vols=[...new Set(Object.values(TCS).map(x=>x[0]))].sort((a,b)=>a-b).map(v=>{const all=Object.keys(TCS).filter(k=>TCS[k][0]===v),d=all.filter(k=>tcDone(+k)).length;return{l:'V'+v,v:Math.round(d/all.length*100)}});
  const thp=THEMES.map(t=>({t,d:t.tcs.filter(tc=>tcDone(tc)).length})).filter(x=>x.d).sort((a,b)=>b.d/b.t.tcs.length-a.d/a.t.tcs.length).slice(0,6);
  const bands=[['0-5%',0,5],['5-10%',5,10],['10-20%',10,20],['20%+',20,1e9]].map(([l,a,b])=>({l,v:T.filter(x=>x.err>=a&&x.err<b).length,c:a>=10?'r':'g'}));
  const uniq=new Set(A.map(a=>a.tc)).size,tot=Object.keys(TCS).length;
  const F=[['all','All'],['seen','Seen'],['unseen','Unseen'],['dr','Only Dictation and Reading'],['mock','Complete Mock']];
  $('#main').innerHTML=`<div class="stats">
   <div class="stat"><b>${A.length}</b><span class="m">Total attempts</span></div><div class="stat"><b>${mocks}</b><span class="m">Complete mocks</span></div>
   <div class="stat"><b>${uniq}/${tot}</b><span class="m">Unique exercises done</span></div><div class="stat"><b>${f1(avg(T.map(a=>a.err)))}%</b><span class="m">Average error</span></div>
   <div class="stat"><b>${f1(avg(T.map(a=>a.speed)))}</b><span class="m">Average typing WPM</span></div><div class="stat"><b>${f1(avg(dsAll))}</b><span class="m">Average dictation WPM</span></div>
   <div class="stat"><b>${f1(A.reduce((s,a)=>s+mins(a),0)/60)} h</b><span class="m">Total time</span></div><div class="stat"><b>${streak}</b><span class="m">Day streak</span></div>
   <div class="stat"><b>${T.filter(a=>a.err<=10).length}</b><span class="m">Mocks under 10%</span></div><div class="stat"><b>${A.reduce((s,a)=>s+a.pN+a.rN+a.dN+a.drN,0)}</b><span class="m">Total practice rounds</span></div></div>
  <h2>Analytics</h2><div class="charts">
   ${box('Daily progress: attempts, last 14 days',cols(days))}${box('Weekly progress: attempts',cols(wk))}${box('Monthly progress: attempts',cols(mo))}${box('Daily study time (minutes)',cols(tm))}
   ${mocks?box('Error percentage trend (green under 10%, red above)',cols(errT)):''}${mocks?box('Mistakes chart (half / full)',cols(mist)):''}${mocks?box('Typing speed trend (WPM)',cols(spd)):''}${mocks?box('Error distribution (mocks)',cols(bands)):''}
   ${box('Highest error percentage',hi.map(li).join(''))}${box('Lowest error percentage',lo.map(li).join(''))}
   ${box('Volume coverage (% of exercises done)',cols(vols))}${box('Top themes by progress',thp.map(x=>`<div class="li"><span>T${x.t.no} \u00b7 ${esc(x.t.name.slice(0,34))}</span><b>${x.d}/${x.t.tcs.length}</b></div>`).join(''))}
   ${box('Mistake totals',`<div class="li"><span>Half mistakes</span><b>${T.reduce((s,a)=>s+a.half,0)}</b></div><div class="li"><span>Full mistakes</span><b>${T.reduce((s,a)=>s+a.full,0)}</b></div><div class="li"><span>Best typing speed</span><b>${Math.max(0,...T.map(a=>a.speed))} WPM</b></div><div class="li"><span>Best dictation speed</span><b>${Math.max(0,...dsAll)} WPM</b></div>`)}
  </div><h2>Attempted tests</h2><div class="filters">${F.map(([k,n])=>`<button data-f="${k}" class="${filt===k?'on':''}">${n}</button>`).join('')}</div>
  <div class="grid">${list.map(a=>`<div class="card" data-r="${a.id}"><small>Vol ${a.vol} \u00b7 TC ${a.tc} \u00b7 Theme ${a.themeNo} \u00b7 ${fmtD(a.date)}</small><b>${esc(a.title)}</b>${tagOf(a)||'<span class="chip">Dictation &amp; Reading</span>'}${a.trans?`<div class="chips"><span class="chip">${a.speed} WPM</span><span class="chip">${a.err}% error</span></div>`:''}</div>`).join('')||'<p class="m">No attempts in this filter.</p>'}</div>
  <h2>Backup</h2><div class="row"><button id="exp">Export JSON</button><button id="imp">Import JSON</button></div>`;
  document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{filt=b.dataset.f;renderDash()});
  document.querySelectorAll('[data-r]').forEach(c=>c.onclick=()=>review(+c.dataset.r));
  $('#exp').onclick=()=>{const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([JSON.stringify(A)],{type:'application/json'}));l.download='tc-tracker-backup.json';l.click()};
  $('#imp').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=async()=>{try{const d=JSON.parse(await i.files[0].text());if(Array.isArray(d)){A=d;save();renderDash()}}catch(e){alert('Invalid file')}};i.click()};
}
render();

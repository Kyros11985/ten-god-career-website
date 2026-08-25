function init(){
  'use strict';
  // ---------- Manual date inputs ----------
  const yInput = document.getElementById('y');
  const mInput = document.getElementById('m');
  const dInput = document.getElementById('d');

  // 若 DOM 仍未解析到这三个输入，直接退出（防御性）
  if(!yInput || !mInput || !dInput){ return; }

  function daysInMonth(y,m){ return new Date(y,m,0).getDate(); }

  function updateDateLabel(){
    const y=yInput.value.trim(), m=mInput.value.trim(), d=dInput.value.trim();
    if(!y||!m||!d){ document.getElementById('dateShown').textContent='Please enter year, month and day.'; document.getElementById('btnDiagnose').disabled=true; return; }
    if(+d>daysInMonth(+y,+m)){ document.getElementById('dateShown').textContent='Invalid day for selected month.'; document.getElementById('btnDiagnose').disabled=true; return; }
    document.getElementById('dateShown').textContent='Selected: '+y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');
    document.getElementById('btnDiagnose').disabled=false;
  }
  yInput.addEventListener('input',updateDateLabel);
  mInput.addEventListener('input',updateDateLabel);
  dInput.addEventListener('input',updateDateLabel);

  document.getElementById('yr').textContent=new Date().getFullYear();

  // ---------- Device id ----------
  const DEV_KEY='tgcd_device_id';
  function getDeviceId(){ let id=localStorage.getItem(DEV_KEY); if(!id){id='dev_'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem(DEV_KEY,id);} return id; }
  const HIST_KEY='tgcd_history_v1';

  // ---------- Diagnose ----------
  const btn=document.getElementById('btnDiagnose');
  let lastResult=null;
  btn.addEventListener('click',function(){
    const y=+yInput.value,m=+mInput.value,d=+dInput.value;
    if(!window.BaziEN || typeof window.BaziEN.analyze!=='function'){ alert('Diagnosis engine is still loading. Please refresh and try again.'); return; }
    const gender=document.getElementById('gender').value;
    const hourIndex=+document.getElementById('hour').value;
    const nickname=document.getElementById('nickname').value.trim()||('Guest_'+Math.floor(Math.random()*900+100));
    const city=document.getElementById('city').value.trim();
    let report; try{ report=window.BaziEN.analyze({year:y,month:m,day:d,gender,hourIndex}); }
    catch(e){ alert('Analysis failed: '+e.message); return; }
    report.nickname=nickname; report.city=city; report.gender=gender; report.createdAt=Date.now();
    lastResult=report;
    renderReport(report);
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('records').classList.add('hidden');
    document.getElementById('result').scrollIntoView({behavior:'smooth'});
  });

  // ---------- renderReport（保持你现有实现不变）----------
  function el(t,a,c){const e=document.createElement(t);if(a)for(const k in a){if(k==='class')e.className=a[k];else if(k==='html')e.innerHTML=a[k];else e.setAttribute(k,a[k]);}if(c)c.forEach(x=>e.appendChild(x));return e;}
  function tag(cls,text){return '<span class="tag '+cls+'">'+text+'</span>';}
  function renderReport(r){
    document.getElementById('reportMeta').textContent=(r.nickname||'')+(r.city?' · '+r.city:'')+' · Born '+[r.input.year,(r.input.month<10?'0'+r.input.month:r.input.month),(r.input.day<10?'0'+r.input.day:r.input.day)].join('-')+(r.hourKnown?'':' · hour unknown');
    const kpiRow=document.getElementById('kpiRow'); kpiRow.innerHTML=''; const dm=r.dayMaster;
    [{v:dm.name+' ('+dm.element+')',l:'Day Master'},{v:r.strength,l:'Strength'},{v:r.favorable.join(' / ')||'—',l:'Favorable Elements'},{v:r.topGods.join(' · ')||'—',l:'Top Career Energies'}].forEach(k=>kpiRow.appendChild(el('div',{class:'kpi'},[el('div',{class:'v',html:k.v}),el('div',{class:'l',html:k.l})])));
    const pb=document.getElementById('pillarsBox'); pb.innerHTML='';
    [['Year',r.pillars.year],['Month',r.pillars.month],['Day',r.pillars.day],['Hour',r.pillars.hour||null]].forEach(([lab,p])=>{const d=el('div',{class:'pillar'});d.appendChild(el('div',{class:'label',html:lab}));if(!p){d.appendChild(el('div',{class:'stem',html:'—'}));d.appendChild(el('div',{class:'branch',html:'unknown'}));}else{d.appendChild(el('div',{class:'stem',html:p.stem}));d.appendChild(el('div',{class:'branch',html:p.branch}));d.appendChild(el('div',{class:'rel',html:(p.rel||'')+' · '+(lab==='Day'?'Self':'')}));}pb.appendChild(d);});
    const eb=document.getElementById('elementBox'); eb.innerHTML=''; const maxEl=Math.max(1,Math.max.apply(null,Object.values(r.elements).map(v=>Math.ceil(v))));
    Object.keys(r.elements).forEach(e=>{const v=r.elements[e];const pct=Math.round(v/maxEl*100);const row=el('div',{class:'score-row'});row.appendChild(el('div',{class:'name',html:e+' <span style="color:#7c889f">('+v+')</span>'}));const bar=el('div',{class:'bar',style:'flex:1'});bar.appendChild(el('i',{style:'width:'+pct+'%'}));row.appendChild(bar);row.appendChild(el('div',{class:'val',html:r.favorable.includes(e)?'★':''}));eb.appendChild(row);});
    const cb=document.getElementById('careerBox'); cb.innerHTML=''; r.topGods.forEach(g=>cb.appendChild(el('div',{class:'career-card'},[el('h4',{html:g+' Energy'}),el('p',{html:r.careerDB[g]||''})]))); while(cb.children.length<3)cb.appendChild(el('div',{class:'career-card'},[el('p',{html:'&nbsp;'})]));
    let indText='',avoidText=''; r.favorable.forEach(f=>{if(r.industry[f])indText+='• '+f+' — '+r.industry[f]+'\n';if(r.avoid[f])avoidText+='• '+f+' — '+r.avoid[f]+'\n';});
    document.getElementById('industryText').textContent=indText||'See your favorable elements above for tailored industry hints.';
    document.getElementById('avoidText').textContent=avoidText||'Avoid roles that are purely repetitive, high-leverage speculation, or heavily heat/confinement based.';
    const sb=document.getElementById('sideBox'); sb.innerHTML=''; r.sideBiz.forEach(s=>sb.appendChild(el('div',{class:'career-card'},[el('h4',{html:s.tag+' <span style="color:#7c889f;font-size:12px">match '+s.match+'%</span>'}),el('p',{html:s.text})])));
    const tb=document.getElementById('timelineBox'); tb.innerHTML=''; r.timing2026.forEach(t=>tb.appendChild(el('div',{class:'tl-item '+t.color},[el('div',{class:'tl-tag',html:tag(t.color==='green'?'tag-green':t.color==='yellow'?'tag-gold':'tag-blue',t.tag)+' <b>'+t.month+'</b>'}),el('div',{html:t.note,style:'color:#a7b3c7;font-size:13px;margin-top:4px'})])));
  }

  // ---------- Save / History ----------
  document.getElementById('btnSave').addEventListener('click',function(){if(!lastResult)return;const list=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');const rec={id:'rec_'+Date.now(),deviceId:getDeviceId(),nickname:lastResult.nickname,city:lastResult.city,gender:lastResult.gender,date:[lastResult.input.year,lastResult.input.month,lastResult.input.day].join('-'),hourKnown:lastResult.hourKnown,dayMaster:lastResult.dayMaster.name+'/'+lastResult.dayMaster.element,strength:lastResult.strength,favorable:lastResult.favorable.join('/'),topGods:lastResult.topGods.join('·'),createdAt:lastResult.createdAt};list.unshift(rec);localStorage.setItem(HIST_KEY,JSON.stringify(list));alert('Saved to My Records (this device only).');});
  document.getElementById('btnNew').addEventListener('click',function(){document.getElementById('diagnose').scrollIntoView({behavior:'smooth'});});
  function loadHistory(){const all=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');const mine=all.filter(r=>!r.deviceId||r.deviceId===getDeviceId());const box=document.getElementById('historyList');box.innerHTML='';if(!mine.length){box.appendChild(el('div',{class:'empty'},[el('div',{class:'big',html:'🕳️'}),el('div',{html:'No records on this device yet.'})]));return;}mine.forEach(r=>{const item=el('div',{class:'history-item'});item.appendChild(el('div',{},[el('div',{class:'who',html:(r.nickname||'Guest')+' <span style="color:#7c889f;font-weight:400">· '+r.date+'</span>'}),el('div',{class:'meta',html:'Day Master '+r.dayMaster+' · '+r.strength+' · favorable '+r.favorable})]));item.appendChild(el('div',{class:'meta',html:new Date(r.createdAt).toLocaleString()}));box.appendChild(item);});}
  document.querySelectorAll('a[href="#records"]').forEach(a=>a.addEventListener('click',function(e){e.preventDefault();loadHistory();document.getElementById('records').classList.remove('hidden');document.getElementById('result').classList.add('hidden');document.getElementById('records').scrollIntoView({behavior:'smooth'});}));
  document.querySelectorAll('a[href="#diagnose"]').forEach(a=>a.addEventListener('click',function(e){e.preventDefault();document.getElementById('diagnose').scrollIntoView({behavior:'smooth'});}));
  document.querySelectorAll('a[href="#about"]').forEach(a=>a.addEventListener('click',function(e){e.preventDefault();document.getElementById('about').scrollIntoView({behavior:'smooth'});}));

  // ---------- Default values ----------
  yInput.value=2001; mInput.value=7; dInput.value=7; updateDateLabel();
}
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); }
else { init(); }

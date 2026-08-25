if (!y || !m || !d) {
  const dateShown = document.getElementById('dateShown');
  if(dateShown) dateShown.textContent = 'Please enter year, month and day.';
  const btnDiagnose = document.getElementById('btnDiagnose');
  if(btnDiagnose) btnDiagnose.disabled = true;
  return;
}

const mm = m.padStart(2, '0');
const dd = d.padStart(2, '0');
const dateShown = document.getElementById('dateShown');
if(dateShown) dateShown.textContent = 'Selected: ' + y + '-' + mm + '-' + dd;
const btnDiagnose = document.getElementById('btnDiagnose');
if(btnDiagnose) btnDiagnose.disabled = false;
let report;
try{ 
  // 守卫 BaziEN
  if(typeof BaziEN === 'undefined') throw new Error('BaziEN library not loaded. Check js/bazi.js path.');
  report = BaziEN.analyze({year:y, month:m, day:d, gender, hourIndex}); 
}
catch(e){ 
  alert('Analysis failed: ' + e.message); 
  return; 
}

report.nickname = nickname; 
report.city = city; 
report.gender = gender; 
report.createdAt = Date.now();
lastResult = report;

renderReport(report);

const resultEl = document.getElementById('result');
const recordsEl = document.getElementById('records');
if(resultEl) resultEl.classList.remove('hidden');
if(recordsEl) recordsEl.classList.add('hidden');
resultEl.scrollIntoView({behavior:'smooth'});
});
// KPI
const kpiRow = document.getElementById('kpiRow');
if(kpiRow) {
  kpiRow.innerHTML = '';
  const dm = r.dayMaster;
  [
    {v: dm.name+' ('+dm.element+')', l: 'Day Master'},
    {v: r.strength, l: 'Strength'},
    {v: r.favorable.join(' / ')||'—', l: 'Favorable Elements'},
    {v: r.topGods.join(' · ')||'—', l: 'Top Career Energies'}
  ].forEach(k => { 
    const d = el('div', {class: 'kpi'}, [el('div', {class: 'v', html: k.v}), el('div', {class: 'l', html: k.l})]); 
    kpiRow.appendChild(d); 
  });
}

// Pillars
const pb = document.getElementById('pillarsBox');
if(pb) {
  pb.innerHTML = '';
  const order = [['Year', r.pillars.year], ['Month', r.pillars.month], ['Day', r.pillars.day], ['Hour', r.pillars.hour||null]];
  order.forEach(([label, p]) => {
    const div = el('div', {class: 'pillar'});
    div.appendChild(el('div', {class: 'label', html: label}));
    if(!p){ 
      div.appendChild(el('div', {class: 'stem', html: '—'})); 
      div.appendChild(el('div', {class: 'branch', html: 'unknown'})); 
    } else { 
      div.appendChild(el('div', {class: 'stem', html: p.stem})); 
      div.appendChild(el('div', {class: 'branch', html: p.branch})); 
      div.appendChild(el('div', {class: 'rel', html: (p.rel||'')+' · '+(label==='Day'?'Self':'')})); 
    }
    pb.appendChild(div);
  });
}

// Elements
const eb = document.getElementById('elementBox');
if(eb) {
  eb.innerHTML = '';
  const maxEl = Math.max(1, Math.max.apply(null, Object.values(r.elements).map(v => Math.ceil(v))));
  Object.keys(r.elements).forEach(e => {
    const v = r.elements[e]; const pct = Math.round(v/maxEl*100);
    const row = el('div', {class: 'score-row'}); 
    row.appendChild(el('div', {class: 'name', html: e+' <span style="color:#7c889f">('+v+')</span>'}));
    const bar = el('div', {class: 'bar', style: 'flex:1'}); 
    bar.appendChild(el('i', {style: 'width:'+pct+'%'}));
    row.appendChild(bar); 
    row.appendChild(el('div', {class: 'val', html: r.favorable.includes(e)?'★':''}));
    eb.appendChild(row);
  });
}

// Career
const cb = document.getElementById('careerBox');
if(cb) {
  cb.innerHTML = '';
  r.topGods.forEach(g => {
    const card = el('div', {class: 'career-card'}); 
    card.appendChild(el('h4', {html: g+' Energy'})); 
    card.appendChild(el('p', {html: r.careerDB[g]||''})); 
    cb.appendChild(card);
  });
  while(cb.children.length < 3){ 
    const c = el('div', {class: 'career-card'}); 
    c.appendChild(el('p', {html: '&nbsp;'})); 
    cb.appendChild(c); 
  }
}

const indText = document.getElementById('industryText');
const avoidText = document.getElementById('avoidText');
let indTextStr = '', avoidTextStr = '';
const fav = r.favorable;
fav.forEach(f => { 
  if(r.industry[f]) indTextStr += '• '+f+' — '+r.industry[f]+'
    // Side business
const sb = document.getElementById('sideBox');
if(sb) {
  sb.innerHTML = '';
  r.sideBiz.forEach(s => {
    const card = el('div', {class: 'career-card'}); 
    card.appendChild(el('h4', {html: s.tag + ' <span style="color:#7c889f;font-size:12px">match '+s.match+'%</span>'})); 
    card.appendChild(el('p', {html: s.text})); 
    sb.appendChild(card);
  });
}

// Timeline
const tb = document.getElementById('timelineBox');
if(tb) {
  tb.innerHTML = '';
  r.timing2026.forEach(t => {
    const item = el('div', {class: 'tl-item ' + t.color});
    item.appendChild(el('div', {}, [
      el('div', {html: tag(t.color==='green'?'tag-green':t.color==='yellow'?'tag-gold':'tag-blue', t.tag) + ' <b>' + t.month + '</b>', class: 'tl-tag'}),
      el('div', {html: t.note, style: 'color:#a7b3c7;font-size:13px;margin-top:4px'})
    ]));
    tb.appendChild(item);
  });
}
  box.innerHTML = '';
if(!mine.length){ 
  box.appendChild(el('div', {class: 'empty'}, [el('div', {class: 'big', html: '🕳️'}), el('div', {html: 'No records on this device yet.'})])); 
  return; 
}
mine.forEach(r => {
  const item = el('div', {class: 'history-item'});
  item.appendChild(el('div', {}, [
    el('div', {class: 'who', html: (r.nickname || 'Guest')+' <span style="color:#7c889f;font-weight:400">· '+r.date+'</span>'}),
    el('div', {class: 'meta', html: 'Day Master '+r.dayMaster+' · '+r.strength+' · favorable '+r.favorable})
  ]));
  item.appendChild(el('div', {class: 'meta', html: new Date(r.createdAt).toLocaleString()}));
  box.appendChild(item);
});

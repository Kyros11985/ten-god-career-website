// Ten-God Career Diagnosis — English website app
// Keeps the three <select> date pickers (no manual input fields).
// Sets NO default sample birth date or city.
(function () {
  'use strict';

  // ---------- Device id (privacy: records per device) ----------
  var DEV_KEY = 'tgcd_device_id';
  function getDeviceId() {
    var id = localStorage.getItem(DEV_KEY);
    if (!id) { id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(DEV_KEY, id); }
    return id;
  }
  var HIST_KEY = 'tgcd_history_v1';

  // ---------- Date pickers (year 1960-2030) ----------
  var ySel = document.getElementById('y');
  var mSel = document.getElementById('m');
  var dSel = document.getElementById('d');

  var YEAR_START = 1960, YEAR_END = 2030;

  function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

  function refreshDays() {
    if (!ySel || !mSel || !dSel) return;
    var y = +ySel.value, m = +mSel.value;
    if (!y || !m) return;
    var max = daysInMonth(y, m);
    var cur = +dSel.value || 1;
    dSel.innerHTML = '';
    for (var d = 1; d <= max; d++) { dSel.add(new Option(d < 10 ? '0' + d : d, d)); }
    dSel.value = Math.min(cur, max);
    updateDateLabel();
  }

  function updateDateLabel() {
    if (!ySel || !mSel || !dSel) return;
    var dateShown = document.getElementById('dateShown');
    var btn = document.getElementById('btnDiagnose');
    if (!ySel.value || !mSel.value || !dSel.value) {
      if (dateShown) dateShown.textContent = 'Please select year, month and day.';
      if (btn) btn.disabled = true;
      return;
    }
    var y = ySel.value, mm = mSel.value < 10 ? '0' + mSel.value : mSel.value, dd = dSel.value < 10 ? '0' + dSel.value : dSel.value;
    if (dateShown) dateShown.textContent = 'Selected: ' + y + '-' + mm + '-' + dd;
    if (btn) btn.disabled = false;
  }

  // populate year/month, wire events, but do NOT pre-select any sample date
  if (ySel && mSel && dSel) {
    for (var y = YEAR_END; y >= YEAR_START; y--) { ySel.add(new Option(y, y)); }
    for (var m = 1; m <= 12; m++) { mSel.add(new Option(m < 10 ? '0' + m : m, m)); }
    ySel.addEventListener('change', refreshDays);
    mSel.addEventListener('change', refreshDays);
    dSel.addEventListener('change', updateDateLabel);
    updateDateLabel(); // start with button disabled (no sample date)
  }

  // Footer year
  var yrEl = document.getElementById('yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  // ---------- Diagnose ----------
  var btn = document.getElementById('btnDiagnose');
  var lastResult = null;

  if (btn) {
    btn.addEventListener('click', function () {
      if (!ySel || !mSel || !dSel) { alert('Date controls not found.'); return; }
      var y = +ySel.value, m = +mSel.value, d = +dSel.value;
      if (!y || !m || !d) { alert('Please select year, month and day first.'); return; }
      var gender = document.getElementById('gender') ? document.getElementById('gender').value : '';
      var hourIndex = document.getElementById('hour') ? +document.getElementById('hour').value : -1;
      var nickname = document.getElementById('nickname') ? (document.getElementById('nickname').value.trim() || ('Guest_' + Math.floor(Math.random() * 900 + 100))) : 'Guest';
      var city = document.getElementById('city') ? document.getElementById('city').value.trim() : '';

      if (typeof BaziEN === 'undefined' || typeof BaziEN.analyze !== 'function') {
        alert('Diagnosis engine is still loading. Please refresh the page and try again.');
        return;
      }

      var report;
      try { report = BaziEN.analyze({ year: y, month: m, day: d, gender: gender, hourIndex: hourIndex }); }
      catch (e) { alert('Analysis failed: ' + e.message); return; }

      report.nickname = nickname;
      report.city = city;
      report.gender = gender;
      report.createdAt = Date.now();
      lastResult = report;
      renderReport(report);

      var resultEl = document.getElementById('result');
      var recordsEl = document.getElementById('records');
      if (resultEl) resultEl.classList.remove('hidden');
      if (recordsEl) recordsEl.classList.add('hidden');
      if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ---------- DOM helpers ----------
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) { for (var k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); } }
    if (children) children.forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function tag(cls, text) { return '<span class="tag ' + cls + '">' + text + '</span>'; }

  function renderReport(r) {
    var reportMeta = document.getElementById('reportMeta');
    if (reportMeta) reportMeta.textContent = (r.nickname || '') + (r.city ? (' · ' + r.city) : '') + ' · Born ' + [r.input.year, r.input.month < 10 ? '0' + r.input.month : r.input.month, r.input.day < 10 ? '0' + r.input.day : r.input.day].join('-') + (r.hourKnown ? '' : ' · hour unknown');

    var kpiRow = document.getElementById('kpiRow');
    if (kpiRow) {
      kpiRow.innerHTML = '';
      var dm = r.dayMaster;
      [{ v: dm.name + ' (' + dm.element + ')', l: 'Day Master' }, { v: r.strength, l: 'Strength' }, { v: r.favorable.join(' / ') || '—', l: 'Favorable Elements' }, { v: r.topGods.join(' · ') || '—', l: 'Top Career Energies' }].forEach(function (k) {
        kpiRow.appendChild(el('div', { class: 'kpi' }, [el('div', { class: 'v', html: k.v }), el('div', { class: 'l', html: k.l })]));
      });
    }

    var pb = document.getElementById('pillarsBox');
    if (pb) {
      pb.innerHTML = '';
      [['Year', r.pillars.year], ['Month', r.pillars.month], ['Day', r.pillars.day], ['Hour', r.pillars.hour || null]].forEach(function (item) {
        var label = item[0], p = item[1];
        var div = el('div', { class: 'pillar' });
        div.appendChild(el('div', { class: 'label', html: label }));
        if (!p) { div.appendChild(el('div', { class: 'stem', html: '—' })); div.appendChild(el('div', { class: 'branch', html: 'unknown' })); }
        else { div.appendChild(el('div', { class: 'stem', html: p.stem })); div.appendChild(el('div', { class: 'branch', html: p.branch })); div.appendChild(el('div', { class: 'rel', html: (p.rel || '') + ' · ' + (label === 'Day' ? 'Self' : '') })); }
        pb.appendChild(div);
      });
    }

    var eb = document.getElementById('elementBox');
    if (eb) {
      eb.innerHTML = '';
      var vals = Object.values(r.elements).map(function (v) { return Math.ceil(v); });
      var maxEl = Math.max(1, Math.max.apply(null, vals));
      Object.keys(r.elements).forEach(function (e) {
        var v = r.elements[e], pct = Math.round(v / maxEl * 100);
        var row = el('div', { class: 'score-row' });
        row.appendChild(el('div', { class: 'name', html: e + ' <span style="color:#7c889f">(' + v + ')</span>' }));
        var bar = el('div', { class: 'bar', style: 'flex:1' }); bar.appendChild(el('i', { style: 'width:' + pct + '%' }));
        row.appendChild(bar);
        row.appendChild(el('div', { class: 'val', html: r.favorable.indexOf(e) >= 0 ? '★' : '' }));
        eb.appendChild(row);
      });
    }

    var cb = document.getElementById('careerBox');
    if (cb) {
      cb.innerHTML = '';
      r.topGods.forEach(function (g) { cb.appendChild(el('div', { class: 'career-card' }, [el('h4', { html: g + ' Energy' }), el('p', { html: r.careerDB[g] || '' })])); });
      while (cb.children.length < 3) { cb.appendChild(el('div', { class: 'career-card' }, [el('p', { html: '&nbsp;' })])); }
    }
    var indText = document.getElementById('industryText'), avoidText = document.getElementById('avoidText');
    var iStr = '', aStr = '';
    r.favorable.forEach(function (f) { if (r.industry[f]) iStr += '• ' + f + ' — ' + r.industry[f] + '\n'; if (r.avoid[f]) aStr += '• ' + f + ' — ' + r.avoid[f] + '\n'; });
    if (indText) indText.textContent = iStr || 'See your favorable elements above for tailored industry hints.';
    if (avoidText) avoidText.textContent = aStr || 'Avoid roles that are purely repetitive, high-leverage speculation, or heavily heat/confinement based.';

    var sb = document.getElementById('sideBox');
    if (sb) {
      sb.innerHTML = '';
      r.sideBiz.forEach(function (s) { sb.appendChild(el('div', { class: 'career-card' }, [el('h4', { html: s.tag + ' <span style="color:#7c889f;font-size:12px">match ' + s.match + '%</span>' }), el('p', { html: s.text })])); });
    }

    var tb = document.getElementById('timelineBox');
    if (tb) {
      tb.innerHTML = '';
      r.timing2026.forEach(function (t) {
        tb.appendChild(el('div', { class: 'tl-item ' + t.color }, [
          el('div', { class: 'tl-tag', html: tag(t.color === 'green' ? 'tag-green' : t.color === 'yellow' ? 'tag-gold' : 'tag-blue', t.tag) + ' <b>' + t.month + '</b>' }),
          el('div', { html: t.note, style: 'color:#a7b3c7;font-size:13px;margin-top:4px' })
        ]));
      });
    }
  }

  // ---------- Save / History ----------
  var btnSave = document.getElementById('btnSave');
  if (btnSave) {
    btnSave.addEventListener('click', function () {
      if (!lastResult) return;
      var list = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
      list.unshift({ id: 'rec_' + Date.now(), deviceId: getDeviceId(), nickname: lastResult.nickname, city: lastResult.city, gender: lastResult.gender, date: [lastResult.input.year, lastResult.input.month, lastResult.input.day].join('-'), hourKnown: lastResult.hourKnown, dayMaster: lastResult.dayMaster.name + '/' + lastResult.dayMaster.element, strength: lastResult.strength, favorable: lastResult.favorable.join('/'), topGods: lastResult.topGods.join('·'), createdAt: lastResult.createdAt });
      localStorage.setItem(HIST_KEY, JSON.stringify(list));
      alert('Saved to My Records (this device only).');
    });
  }
  var btnNew = document.getElementById('btnNew');
  if (btnNew) btnNew.addEventListener('click', function () { var d = document.getElementById('diagnose'); if (d) d.scrollIntoView({ behavior: 'smooth' }); });

  function loadHistory() {
    var box = document.getElementById('historyList');
    if (!box) return;
    var mine = JSON.parse(localStorage.getItem(HIST_KEY) || '[]').filter(function (r) { return !r.deviceId || r.deviceId === getDeviceId(); });
    box.innerHTML = '';
    if (!mine.length) { box.appendChild(el('div', { class: 'empty' }, [el('div', { class: 'big', html: '🕳️' }), el('div', { html: 'No records on this device yet.' })])); return; }
    mine.forEach(function (r) {
      var item = el('div', { class: 'history-item' });
      item.appendChild(el('div', {}, [el('div', { class: 'who', html: (r.nickname || 'Guest') + ' <span style="color:#7c889f;font-weight:400">· ' + r.date + '</span>' }), el('div', { class: 'meta', html: 'Day Master ' + r.dayMaster + ' · ' + r.strength + ' · favorable ' + r.favorable })]));
      item.appendChild(el('div', { class: 'meta', html: new Date(r.createdAt).toLocaleString() }));
      box.appendChild(item);
    });
  }
  document.querySelectorAll('a[href="#records"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); loadHistory(); var r = document.getElementById('records'), res = document.getElementById('result'); if (r) r.classList.remove('hidden'); if (res) res.classList.add('hidden'); if (r) r.scrollIntoView({ behavior: 'smooth' }); }); });
  document.querySelectorAll('a[href="#diagnose"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var d = document.getElementById('diagnose'); if (d) d.scrollIntoView({ behavior: 'smooth' }); }); });
  document.querySelectorAll('a[href="#about"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var ab = document.getElementById('about'); if (ab) ab.scrollIntoView({ behavior: 'smooth' }); }); });
})();

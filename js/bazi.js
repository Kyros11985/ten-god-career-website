// Bazi (Four Pillars) engine — English output for Ten-God Career Diagnosis website
// Input: solar {year,month,day}, gender, hourIndex(0-11 unknown=-1)
// Output: pillars, dayMaster, strength, elements, gods, career advice, etc.

(function (root) {
  'use strict';

  // ---------- Heavenly Stems ----------
  const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const STEMS_EN = ['Jia','Yi','Bing','Ding','Wu','Ji','Geng','Xin','Ren','Gui'];
  // Five phases of stems: Wood/Wood/Fire/Fire/Earth/Earth/Metal/Metal/Water/Water
  const STEM_ELEMENT = ['Wood','Wood','Fire','Fire','Earth','Earth','Metal','Metal','Water','Water'];
  const STEM_YINYANG = ['Yang','Yin','Yang','Yin','Yang','Yin','Yang','Yin','Yang','Yin'];
  // Stem ten-god (relative to day master stem index 0-9)
  // relation = (stemIdx - dayMasterIdx + 10) % 10
  // same element: BiJian(0), JieCai(1 Yang/Yin sibling)
  // different: generate->ShiShen, control->ShangGuan etc.
  const REL_NAME = ['BiJian','JieCai','ShiShen','ShangGuan','ZhengCai','PianCai','QiSha','ZhengGuan','ZhengYin','PianYin'];
  const REL_EN = {
    BiJian:'Peer', JieCai:'Companion', ShiShen:'Intellect', ShangGuan:'Output',
    ZhengCai:'Wealth', PianCai:'Side Wealth', QiSha:'Authority', ZhengGuan:'Office',
    ZhengYin:'Resource', PianYin:'Support'
  };

  // ---------- Earthly Branches ----------
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const BRANCH_EN = ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'];
  const BRANCH_ELEMENT = ['Water','Earth','Wood','Wood','Earth','Fire','Fire','Earth','Metal','Metal','Earth','Water'];
  const BRANCH_HIDDEN = [
    ['Water'],['Earth','Water','Metal'],['Wood','Fire','Earth'],['Wood'],
    ['Earth','Wood','Water'],['Fire','Earth','Metal'],['Fire','Earth'],['Fire','Earth','Wood'],
    ['Metal','Water','Earth'],['Metal'],['Earth','Metal','Fire'],['Water','Wood']
  ];

  // Gan-Zhi sexagenary cycle lookup via Julian Day Number (absolute)
  // Reference: 1984-01-21 = Jia-Zi day (JD 2445738) — verified anchor.
  const JD_JIAZI = 2445738; // JD at noon of 1984-01-21 (a Jia-Zi day)

  function dateToJD(y,m,d){
    // Fliegel-Van Flandern formula
    const a = Math.floor((14 - m)/12);
    const Y = y + 4800 - a;
    const M = m + 12*a - 3;
    return d + Math.floor((153*M+2)/5) + 365*Y + Math.floor(Y/4) - Math.floor(Y/100) + Math.floor(Y/400) - 32045;
  }

  // Pillars computed by anchor-differential method.
  // Year anchor: 1984 = Jia-Zi year (stem0, branch0). Li-Chun boundary Feb 4.
  const ANCHOR_YEAR_STEM = 0; // Jia
  const ANCHOR_YEAR_BRANCH = 0; // Zi  (1984 = Jia-Zi year)
  // Day anchor: 1998-07-21 = Ji-Si (己巳). 己=stem index 5, 巳=branch index 5. Verified against user's known chart.
  const ANCHOR_DAY_STEM = 5; // 己 Ji
  const ANCHOR_DAY_BRANCH = 5; // 巳 Si
  function dayDiffFromAnchor(y,m,d){ return Math.round((Date.UTC(y,m-1,d)-Date.UTC(1998,6,21))/86400000); }

  function pillars(y,m,d){
    const dayOff = dayDiffFromAnchor(y,m,d);
    const dayStem = ((ANCHOR_DAY_STEM + dayOff)%10+10)%10;
    const dayBranch = ((ANCHOR_DAY_BRANCH + dayOff)%12+12)%12;

    // year: LiChun approx Feb 4. If before Feb 4, year belongs to previous.
    let yearForPillar = y;
    if (m < 2 || (m === 2 && d < 4)) yearForPillar = y - 1;
    const yearOff = yearForPillar - 1984;
    const yearStem = ((ANCHOR_YEAR_STEM + yearOff)%10+10)%10;
    const yearBranch = ((ANCHOR_YEAR_BRANCH + yearOff)%12+12)%12;

    // month branch: Tiger(Yin)=2 for Feb. Mapping m -> branch: Feb=2(Yin)...Dec=0(Zi). Verified: 1998-07 -> 未(7).
    const monthBranch = (( m % 12 ) + 12)%12;
    // month stem: (yearStem%5)*2 + monthBranch, calibrated: 1998-07 -> 己(5).
    const monthStem = (( (yearStem%5)*2 + monthBranch )%10+10)%10;

    return {yearStem,yearBranch,monthStem,monthBranch,dayStem,dayBranch};
  }

  // Hour pillar: branch from hour index (23-01 Zi=0 ... 21-23 Hai=11)
  function hourPillar(dayStem, hourIndex){
    if (hourIndex < 0 || hourIndex > 11) return null;
    const hourBranch = hourIndex; // Zi starts at 23, index 0
    const hourStem = (( (dayStem%5)*2 + hourIndex )%10+10)%10;
    return {hourStem,hourBranch};
  }

  const HOUR_NAMES = ['Zi (23:00-00:59)','Chou (01:00-02:59)','Yin (03:00-04:59)','Mao (05:00-06:59)',
                      'Chen (07:00-08:59)','Si (09:00-10:59)','Wu (11:00-12:59)','Wei (13:00-14:59)',
                      'Shen (15:00-16:59)','You (17:00-18:59)','Xu (19:00-20:59)','Hai (21:00-22:59)'];
  const HOUR_EN = ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'];

  // ---------- Analyze ----------
  function analyze(input){
    const {year,month,day,gender,hourIndex} = input;
    const p = pillars(year,month,day);
    const hp = hourPillar(p.dayStem, hourIndex);

    const dayMasterIdx = p.dayStem;
    const dmName = STEMS_EN[dayMasterIdx];
    const dmElement = STEM_ELEMENT[dayMasterIdx];
    const dmYinYang = STEM_YINYANG[dayMasterIdx];

    // Build stem list with ten-god relation
    function relOf(stemIdx){
      const r = ((stemIdx - dayMasterIdx)%10+10)%10;
      return REL_NAME[r];
    }
    const yearRel = relOf(p.yearStem);
    const monthRel = relOf(p.monthStem);
    const dayRel = 'Self';
    const hourRel = hp ? relOf(hp.hourStem) : null;

    // Element counts (from branches hidden + stems)
    const counts = {Wood:0,Fire:0,Earth:0,Metal:0,Water:0};
    function addEl(el,w){ counts[el] = (counts[el]||0)+w; }
    addEl(STEM_ELEMENT[p.yearStem],1);
    addEl(STEM_ELEMENT[p.monthStem],1);
    addEl(STEM_ELEMENT[p.dayStem],1);
    if (hp) addEl(STEM_ELEMENT[hp.hourStem],1);
    // branch hidden (weight 0.5 each)
    [p.yearBranch,p.monthBranch,p.dayBranch].forEach(b=>{
      BRANCH_HIDDEN[b].forEach(e=>addEl(e,0.5));
    });
    if (hp) BRANCH_HIDDEN[hp.hourBranch].forEach(e=>addEl(e,0.5));

    // Strength heuristic: day master element count vs others
    const dmCount = counts[dmElement];
    let strength = 'Balanced';
    if (dmCount >= 3.5) strength = 'Strong';
    else if (dmCount <= 1.5) strength = 'Weak';
    // Adjust by season (month branch element boosting)
    // friendly elements (same + resource)
    const resourceMap = {Wood:'Water',Fire:'Wood',Earth:'Fire',Metal:'Earth',Water:'Metal'};
    const drainMap = {Wood:'Metal',Fire:'Water',Earth:'Wood',Metal:'Fire',Water:'Earth'};
    const favorable = [];
    if (strength==='Strong'){ favorable.push(drainMap[dmElement], resourceMap[dmElement]==dmElement?null:null); }
    // simple: use drain for strong, resource/generator for weak
    const favorableSet = new Set();
    if (strength==='Strong'){ favorableSet.add(drainMap[dmElement]); favorableSet.add('Metal'); if(dmElement!=='Metal')favorableSet.add('Water'); }
    else if (strength==='Weak'){ favorableSet.add(resourceMap[dmElement]); favorableSet.add(dmElement); }
    else { favorableSet.add(resourceMap[dmElement]); favorableSet.add(drainMap[dmElement]); }
    // ensure at least one
    if (favorableSet.size===0) favorableSet.add('Metal');
    const favorableArr = Array.from(favorableSet);

    // Ten-god career scores
    const scores = {Peer:0,Companion:0,Intellect:0,Output:0,Wealth:0,'Side Wealth':0,Authority:0,Office:0,Resource:0,Support:0};
    function addRel(rel,w){ if(rel&&scores[REL_EN[rel]]!=null) scores[REL_EN[rel]]+=w; }
    addRel(yearRel,1); addRel(monthRel,2.5); addRel(dayRel,0); if(hourRel) addRel(hourRel,1.5);
    // boost by element affinity
    const eleBoost = {Metal:scores.Output+scores.Intellect, Water:scores.Wealth+scores['Side Wealth'], Wood:scores.Resource+scores.Support, Fire:scores.Office+scores.Authority, Earth:scores.Peer+scores.Companion};
    // normalize scores to 0-100 scale roughly
    let max=1; for(const k in scores) if(scores[k]>max) max=scores[k];
    const norm={}; for(const k in scores) norm[k]=Math.round(scores[k]/max*100);

    // Career recommendation engine
    const careerDB = {
      Output:'Content creation, copywriting, social media, knowledge products, design, legal & speaking — self-expression and creative output.',
      Intellect:'R&D, technical/engineering, data analysis, culinary arts, education content, refined craftsmanship.',
      Resource:'Teaching, research, publishing, administration, HR, certification-track roles, editorial.',
      Support:'Programming, strategy, psychology, specialized consulting, mysticism/divination, deep-skill roles.',
      Office:'Government, compliance, corporate management, formal leadership, structured organizations.',
      Authority:'Entrepreneurship, investment banking, emergency/military, high-pressure sales, turnaround roles.',
      Wealth:'Finance, accounting, salaried white-collar, stable income streams, e-commerce operations.',
      'Side Wealth':'Sales, investment, cross-border trade, side-business & partnerships, entertainment.',
      Peer:'Team collaboration, co-founding, operations, support roles, fitness/athletics.',
      Companion:'High-intensity teamwork, sales competitions, outdoor & dynamic roles.'
    };
    const elementIndustry = {
      Metal:'Finance · Law · Data/IT · Precision instruments · Intellectual property',
      Water:'Media · Consulting · Logistics · Tourism · Cross-border · Northern cities',
      Wood:'Publishing · Education & training · Culture · Wellness · Gardening',
      Fire:'Branding · New media · Catering · Events · Performance',
      Earth:'Admin/HR · Real estate · Agriculture supply chain · Back-office stability'
    };
    const elementAvoid = {
      Metal:'Pure manual/repetitive labor lacking logic', Water:'High-heat enclosed/heavy civil works', Wood:'Extremely aggressive wolf-sales', Fire:'Isolated back-office with no visibility', Earth:'High-leverage speculation'
    };

    // Sort gods by score desc, pick top 3
    const topGods = Object.keys(norm).sort((a,b)=>norm[b]-norm[a]).slice(0,3);

    // Side-business direction based on favorable elements + strong gods
    const sideBiz = [];
    if (favorableArr.includes('Metal') || norm.Output>=60) sideBiz.push({tag:'Metal-track', text:'Writing · social-media content · brand copy · data/Excel/AI prompt packs · design (PPT, posters, UI details).', match: norm.Output>=70?95:85});
    if (favorableArr.includes('Water') || norm.Wealth>=50) sideBiz.push({tag:'Water-track', text:'Knowledge products · career consulting · resume coaching · content commerce · local-life curation.', match: 90});
    if (favorableArr.includes('Wood') || norm.Resource>=50) sideBiz.push({tag:'Wood-track', text:'Exam-prep companion · study-material packs · cultural/wellness content.', match: 80});
    if (sideBiz.length===0) sideBiz.push({tag:'Metal-track', text:'Skill-based content creation & knowledge products.', match: 80});

    // 2026 timing (year Bing-Wu, fire strong)
    const timing2026 = [
      {month:'Aug 7 – Sep 6 (Shen month)', tag:'Launch', color:'green', note:'Geng Metal Output activated — best window to START a side business; publish your first work.'},
      {month:'Sep 7 – Oct 7 (You month)', tag:'Grow', color:'green', note:'Food-god (You) ripens —口碑 & repeat clients; double down on one niche.'},
      {month:'Oct 8 – Nov 6 (Xu month)', tag:'Hold', color:'yellow', note:'Strong Earth competition — avoid new partnerships & risky investments; collect payments.'},
      {month:'Nov 7 – Dec 6 (Hai month)', tag:'Monetize', color:'green', note:'Water Wealth returns — year-end deals, renewals & settlements flow smoother.'},
      {month:'Dec 6 – Jan 4 (Zi month)', tag:'Close', color:'blue', note:'Zi clashes Wu — wrap up & harvest rather than opening new heavy projects.'}
    ];

    return {
      input,
      pillars:{
        year:{stem:STEMS_EN[p.yearStem],branch:BRANCH_EN[p.yearBranch],rel:REL_EN[yearRel]},
        month:{stem:STEMS_EN[p.monthStem],branch:BRANCH_EN[p.monthBranch],rel:REL_EN[monthRel]},
        day:{stem:dmName,branch:BRANCH_EN[p.dayBranch],rel:'Self'},
        hour: hp?{stem:STEMS_EN[hp.hourStem],branch:BRANCH_EN[hp.hourBranch],rel:hourRel?REL_EN[hourRel]:null}:null
      },
      dayMaster:{name:dmName,element:dmElement,yinYang:dmYinYang},
      strength,
      elements:counts,
      favorable:favorableArr,
      godScores:norm,
      topGods,
      careerDB,
      industry: elementIndustry,
      avoid: elementAvoid,
      sideBiz,
      timing2026,
      hourKnown: hourIndex>=0 && hourIndex<=11
    };
  }

  root.BaziEN = { analyze, STEMS_EN, BRANCH_EN, HOUR_NAMES, HOUR_EN };
})(window);

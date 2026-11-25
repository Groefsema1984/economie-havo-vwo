// ===== Schermen =====
const app = ()=>$('#app');
let scherm='home', Q=null;
function melding(t,ms=2600){const m=document.createElement('div');m.className='melding';m.textContent=t;document.body.appendChild(m);setTimeout(()=>m.remove(),ms)}
function zetThema(){document.body.className='th-'+(S&&S.thema||'standaard')}

function go(s,arg){ scherm=s; oefenActief=(s==='quiz'); window.scrollTo(0,0); const f=SCHERMEN[s]; app().innerHTML=f(arg); if(SCHERMEN[s+'_na']) SCHERMEN[s+'_na'](arg); nav(); }
// Foto's: Unsplash (gratis te gebruiken onder de Unsplash-licentie), geladen via images.unsplash.com
const FOTO={start:'1522202176988-66273c2fd55f',A:'1554224154-26032ffc0d07',B:'1483985988355-763728e1935b',C:'1601631547725-a42f63b10ac8',D:'1556742049-0cfed4f6a45d',E:'1550133881-13e70aa00bae',
 F:'1531058240690-006c446962d8',G:'1434030216411-0b793f4b4173',H:'1777065851469-71aef898a26f',I:'1611974789855-9c2a0a7236a3',J:'1577968681068-2d3e2521f7af',examen:'1606326608690-4e0281b1e588',
 sprint:'1704265586142-db3e17d0dea0',vaardig:'1611974789855-9c2a0a7236a3',herhaal:'1434030216411-0b793f4b4173',docent:'1509062522246-3755977927d7',collectie:'1785780224428-7b690d3d58bd',account:'1522071820081-009f0129c71c'};
const foto=(k,w=1400)=>FOTO[k]?`background-image:url('https://images.unsplash.com/photo-${FOTO[k]}?w=${w}&q=70&auto=format&fit=crop')`:'';
const VOET=()=>`<footer class="voettekst"><div class="in"><b>vellesan <span class="o">college</span></b><span>Economie havo/vwo · oefenapp per syllabusdomein</span><span style="margin-left:auto">Foto's: Unsplash</span></div></footer>`;
const initialen=n=>(n||'?').split(' ').filter(Boolean).map(x=>x[0]).filter(c=>/\p{L}/u.test(c)).slice(0,2).join('').toUpperCase()||'?';
function nav(){
  document.body.dataset.scherm=scherm; const vk=$('.logo .vak'); if(vk) vk.textContent=vakLabel();
  const m=$('#menu'), p=$('#profiel'); if(!m) return;
  if(!S||!S.naam||scherm==='quiz'||scherm==='welkom'){ m.innerHTML=''; p.innerHTML=''; return }
  const exOpen=exVragen().length>0;
  const items=[['home','Start'],['leren','Leren'],exOpen?['examen','Eindexamen']:null,['vaardig','Vaardigheden'],['herhaal','Herhalen'+(S.herhaal.length?` (${S.herhaal.length})`:'')],['collectie','Collectie'],['account','Account']].filter(Boolean);
  const actief=scherm==='wereld'||scherm==='resultaat'?'home':scherm;
  m.innerHTML=items.map(([s,t])=>`<button class="${actief===s?'aan':''}" onclick="go('${s}')">${t}</button>`).join('');
  p.innerHTML=`<button class="profiel" onclick="go('account')"><span class="avatar">${esc(initialen(S.naam))}</span><span>${esc(S.naam)}</span></button>`+(exOpen?`<button class="ikoonknop" onclick="startSprint()">⚡<span class="t">Sprint</span></button>`:'');
}
function kop(titel,terug){ return `<div class="foto paginakop" style="${foto(scherm,1400)}"><div class="bovenin">${terug?`<button class="terug" onclick="${terug}">‹ Terug</button>`:''}<span class="chip">🪙 ${munten()}</span><span class="chip">⭐ ${S.xp}</span><span class="chip">⏱️ ${minuten(S.tijd)} min</span></div><span class="eyebrow" style="color:var(--acc)">${esc(vakLabel())}</span><h1>${titel}</h1></div>` }

// --- voortgang per wereld ---
function wereldStand(w){
  const lvs=lvsVoor(w).filter(speelbaar); if(!lvs.length) return null;
  const echte=lvs.filter(l=>l.vragen.length);
  return {klaar:echte.filter(l=>(S.lv[l.id]||{}).best>=MEDAIL[0].min).length, totaal:echte.length, pct:Math.round(lvs.reduce((s,l)=>s+Math.min((S.lv[l.id]||{}).best||0,VRAGEN_PER_LEVEL),0)/(lvs.length*VRAGEN_PER_LEVEL)*100), diploma:!!(S.toets[w]&&S.toets[w].klaar)};
}
// Een level gaat open als het vorige level met vragen in hetzelfde hoofdstuk (hfd) brons heeft. Rekenlabs zijn altijd open.
function levelOpen(w,i){ const lvs=lvsVoor(w).filter(speelbaar); const l=lvs[i]; if(!l||l.id.endsWith('.r')) return true;
  const vorige=lvs.slice(0,i).filter(x=>!x.id.endsWith('.r')&&x.vragen.length&&(x.hfd||'')===(l.hfd||'')).pop();
  return !vorige||((S.lv[vorige.id]||{}).best||0)>=MEDAIL[0].min }
function toetsOpen(w){ const lvs=lvsVoor(w).filter(l=>l.vragen.length); return lvs.length>0&&lvs.every(l=>((S.lv[l.id]||{}).best||0)>=MEDAIL[0].min) }

const SCHERMEN = {
welkom(){
  const opties=KLASSEN.map(k=>`<option value="${esc(k)}">${esc(klasLabel(k))}</option>`).join('');
  return `<section class="foto held" style="${foto('start',1800)}"><div class="in"><div>
    <span class="eyebrow">Vellesan College · Economie havo en vwo</span>
    <h1>Oefen slim voor je eindexamen economie</h1>
    <p>Alle domeinen van de syllabus, eindexamentraining en uitleg bij elke fout. Je oefent op je eigen tempo, net zo lang tot het goed zit.</p>
    <button class="knop groot" onclick="document.getElementById('aanmelden').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#wNaam').focus(),400)">Start met oefenen</button>
    <ul class="usp"><li>Alle syllabusdomeinen</li><li>Havo en vwo</li><li>Je voortgang blijft bewaard</li></ul></div></div></section>
   <div class="wrap" id="aanmelden" style="max-width:1000px"><div class="welkom-grid">
   <div class="kaart"><span class="eyebrow" style="color:var(--knop)">Eerste keer</span><h3 style="margin:6px 0 0">Ik ben nieuw</h3>
    <label class="label">Je voor- en achternaam</label><input type="text" id="wNaam" autocomplete="name">
    <label class="label">Je klas</label><select id="wKlas">${opties}</select>
    <div class="voet"><button class="knop vol" id="wMaak" onclick="nieuwAccount()">Account maken</button></div></div>
   ${serverModus()?`<div class="kaart"><span class="eyebrow" style="color:var(--knop)">Terugkomen</span><h3 style="margin:6px 0 0">Ik heb al een account</h3>
    <p class="zacht" style="margin:6px 0 0;font-size:15px">Nieuwe iPad, of de app opnieuw geopend? Vul je speler-ID en herstelcode in. Je voortgang komt terug.</p>
    <label class="label">Speler-ID</label><input type="text" id="hId" autocapitalize="characters" placeholder="bijv. H5-K7QD">
    <label class="label">Herstelcode (6 cijfers)</label><input type="text" id="hCode" inputmode="numeric" maxlength="6">
    <div class="voet"><button class="knop zacht vol" onclick="herstelAccount()">Herstel mijn voortgang</button></div></div>`:
   `<div class="kaart"><h3 style="margin-top:0">Testmodus</h3><p class="zacht" style="margin:0">De voortgang staat alleen op dit apparaat.</p></div>`}</div>
   <p class="zacht mid" style="font-size:14px;margin-top:24px">Tip voor de iPad: open de link in Safari, tik op het deel-icoon en kies "Zet op beginscherm". Open de app daarna altijd vanaf het beginscherm.</p></div>${VOET()}`;
},
code(){
  if(!S||!S.id||!S.code) return `<div class="wrap" style="max-width:560px"><div class="kaart mid"><div class="groot">⚠️</div>
   <h2 style="margin-top:0">Je gegevens zijn nog niet binnen</h2><p>Er ging iets mis bij het maken van je account. Kijk onder <b>Account</b> of je speler-ID en herstelcode er staan. Staan ze er niet, vraag je docent om je gegevens op te zoeken.</p>
   <div class="voet" style="justify-content:center"><button class="knop" onclick="go('account')">Naar Account</button></div></div></div>`;
  return `<div class="wrap" style="max-width:560px"><div class="kaart mid"><div class="groot">🔐</div>
   <h2 style="margin-top:0">Bewaar deze gegevens goed</h2><p>Hiermee haal je je voortgang terug op een andere iPad of als de app gewist is. <b>Maak nu een screenshot.</b></p>
   <p class="zacht" style="margin-bottom:2px">Speler-ID</p><div class="code">${esc(S.id)}</div>
   <p class="zacht" style="margin-bottom:2px">Herstelcode</p><div class="code">${esc(S.code)}</div>
   <p class="zacht" style="font-size:14px">Je vindt ze later ook onder Account. Je docent kan ze ook opzoeken.</p>
   <div class="voet" style="justify-content:center"><button class="knop" onclick="go('home')">Ik heb een screenshot gemaakt</button></div></div></div>`;
},
home(){
  const exOpen = exVragen().length>0;
  const nh=S.herhaal.length;
  const stand=Object.fromEntries(WERELDEN.map(w=>[w.id,wereldStand(w.id)]));
  const dipl=WERELDEN.filter(w=>stand[w.id]&&stand[w.id].diploma).length, nOpen=WERELDEN.filter(w=>stand[w.id]).length;
  // waar ging de leerling mee bezig? laatst gespeelde level, anders eerste hoofdstuk zonder diploma
  const lk=Object.keys(S.lv).filter(k=>!k.startsWith('ex')).pop();
  let vw=lk?WERELDEN.find(w=>lk.startsWith(w.id+'.')):null; if(vw&&stand[vw.id]&&stand[vw.id].diploma) vw=null;
  vw=vw||WERELDEN.find(w=>stand[w.id]&&!stand[w.id].diploma)||WERELDEN[0];
  const vst=stand[vw.id]; const vlvs=lvsVoor(vw.id).filter(speelbaar); const vi=vlvs.findIndex((l,i)=>levelOpen(vw.id,i)&&!(((S.lv[l.id]||{}).best||0)>=MEDAIL[0].min)&&!l.id.endsWith('.r'));
  const vl=vi>=0?vlvs[vi]:null; const begonnen=vst&&vst.pct>0;
  const kaarten=WERELDEN.map(w=>{const st=stand[w.id]; const open=!!st;
    return `<button class="foto fotokaart ${open?'':'dicht'}" style="--k:${w.kleur};${foto(w.id,700)}" onclick="${open?`go('wereld','${w.id}')`:`melding('Domein ${w.nr} komt binnenkort')`}">
      <span class="nr">Domein ${w.nr}</span>${open&&st.diploma?'<span class="status">🎓</span>':''}<h3>${esc(w.naam)}</h3>
      <p>${open?(st.diploma?'Diploma behaald':`${st.klaar} van ${st.totaal} levels · ${st.pct}%`):'Komt binnenkort'}</p>
      ${open?`<div class="balk"><i style="width:${st.pct}%"></i></div>`:''}</button>`}).join('');
  // week-streak
  const nu=new Date(), ma=new Date(nu); ma.setDate(nu.getDate()-((nu.getDay()+6)%7));
  const dagId=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const dagen=['M','D','W','D','V','Z','Z'].map((l,i)=>{const d=new Date(ma); d.setDate(ma.getDate()+i); const id=dagId(d); const ja=(S.dag||{})[id]>0;
    return `<span>${l}<i class="${ja?'ja':''} ${id===vandaag()?'nu':''}">${ja?'✓':d.getDate()}</i></span>`}).join('');
  let streak=0; for(let i=0;i<60;i++){ const id=weekId(new Date(Date.now()-i*7*864e5)); if((S.week||{})[id]>0) streak++; else if(i>0) break; }
  const ok=exOpen?exVragen().filter(beheerst).length:0;
  const badges=BADGES.map(b=>`<span class="${S.badges.includes(b.id)?'':'nee'}" title="${esc(b.n)}">${b.i}</span>`).join('');
  return `<div class="wrap"><div class="dash">
   <aside class="links">
    <div class="kaart profielkaart"><div class="bg"></div><div class="avatar">${esc(initialen(S.naam))}</div>
     <h2>${esc(S.naam)}</h2><div class="klas">${esc(vakLabel())}</div>
     <div class="cijfers"><div><small>Minuten</small><span class="getal">${minuten(S.tijd)}</span></div><div><small>Diploma's</small><span class="getal">${dipl}/${nOpen}</span></div><div><small>Kaarten</small><span class="getal">${S.kaarten.length}</span></div></div>
     <div class="blok"><small>Je streak</small><div class="streak"><div class="vlam">🔥<b>${streak}</b>${streak===1?'week':'weken'}</div><div class="dagen">${dagen}</div></div></div>
     <div class="blok mijlpaal"><small>Punten en munten</small><b>⭐ ${S.xp}</b> &nbsp; <b>🪙 ${munten()}</b></div>
     <button class="linkrij" onclick="go('vaardig')"><span>Je vaardigheden per domein</span><span>›</span></button></div>
   </aside>
   <main>
    <button class="foto uitgelicht" style="${foto(vw.id,1400)}" onclick="${vl?`startLevel('${vw.id}','${vl.id}')`:`go('wereld','${vw.id}')`}">
     <span class="eyebrow">${begonnen?'Ga verder':'Begin hier'} · Domein ${vw.nr}</span>
     <h2>${esc(vw.naam)}</h2>
     <p>${vl?`Volgende level: <b>${esc(vl.naam)}</b> · ${esc(vl.kort)}`:'Bekijk je levels en de eindtoets.'}</p>
     <span class="knop">${vl?'Verder oefenen':'Naar domein '+vw.nr}</span></button>
    <div class="sectie">Alle domeinen</div>
    <div class="fotogrid">${kaarten}</div>
   </main>
   <aside class="rechts">
    <div class="kaart"><h3 class="zijkop">Je uitdagingen</h3>
     ${exOpen?`<button class="uitdaging" onclick="go('examen')"><span class="thumb" style="${foto('examen',200)}"><span>🎓</span></span><span><b>Eindexamentrainer</b><small>${ok} van ${exVragen().length} examenvragen beheerst</small></span></button>
     <button class="uitdaging" onclick="startSprint()"><span class="thumb" style="${foto('sprint',200)}"><span>⚡</span></span><span><b>Examensprint</b><small>15 vragen tegen de klok · record ${(S.sprint||{}).best||0}</small></span></button>`:''}
     <button class="uitdaging" onclick="go('flits')"><span class="thumb" style="${foto('collectie',200)}"><span>🃏</span></span><span><b>Flitskaarten</b><small>${fkDue().length?fkDue().length+' begrippen om te herhalen':'Leer de begrippen met herhaling op afstand'}</small></span></button>
     <button class="uitdaging" onclick="go('proef')"><span class="thumb" style="${foto('herhaal',200)}"><span>⏱️</span></span><span><b>Proeftoets</b><small>Per hoofdstuk, op tijd, met een cijfer</small></span></button>
     <button class="uitdaging" onclick="startSlim()"><span class="thumb" style="${foto('vaardig',200)}"><span>🎯</span></span><span><b>Slim oefenen</b><small>Extra vragen over je zwakste onderwerpen</small></span></button>
     <button class="uitdaging" onclick="go('herhaal')"><span class="thumb" style="${foto('herhaal',200)}"><span>🔁</span></span><span><b>Herhaalronde</b><small>${nh?nh+' vragen om opnieuw te doen':'Geen foute vragen, goed bezig!'}</small></span></button>
    </div>
    <div class="kaart"><h3 class="zijkop">Je badges</h3><div class="badges">${badges}</div>
     <div class="voet" style="justify-content:flex-start;margin-top:16px"><button class="knop zacht klein" onclick="go('collectie')">Collectie bekijken</button></div></div>
    <div class="kaart"><h3 class="zijkop" style="margin-bottom:6px">Docent</h3><p class="zacht" style="margin:0 0 12px;font-size:15px">Overzicht van de groep, alleen met docentcode.</p><button class="knop zacht klein" onclick="go('docent')">🔑 Docentendashboard</button></div>
   </aside>
  </div></div>${VOET()}`;
},
wereld(w){
  const W=WERELDEN.find(x=>x.id===w), lvs=lvsVoor(w).filter(speelbaar), st=wereldStand(w);
  const t=S.toets[w]||{}; const tOpen=toetsOpen(w);
  const kaarten=Object.keys((LEVELS[w]||{}).begrippen||{}); const heb=kaarten.filter(k=>S.kaarten.includes(k)).length;
  const vi=lvs.findIndex((l,i)=>levelOpen(w,i)&&!(((S.lv[l.id]||{}).best||0)>=MEDAIL[0].min)&&!l.id.endsWith('.r')); const vl=vi>=0?lvs[vi]:null;
  const actie=(l,i)=>levelOpen(w,i)?`startLevel('${w}','${l.id}')`:`melding('Haal eerst brons in het vorige level')`;
  const paneel=lvs.map((l,i)=>{const r=S.lv[l.id]||{}; const m=r.best!=null?medaille(r.best):null; return `<button onclick="${actie(l,i)}"><span>${levelOpen(w,i)?(m?m.e:'○'):'🔒'}</span><span>${esc(l.naam)}</span></button>`}).join('');
  const kaart=(l,i)=>{const r=S.lv[l.id]||{}; const open=levelOpen(w,i); const m=r.best!=null?medaille(r.best):null;
    return `<button class="levelkaart ${open?'':'dicht'}" onclick="${actie(l,i)}"><span class="boven"><span>${l.id.endsWith('.r')?'Rekenlab':l.hfd?'Level':'Start'}${l.niv?' · '+NIVEAUS[l.niv]:''}</span><span>${open?(m?m.e:'⚪'):'🔒'}</span></span>
      <h3>${esc(l.naam)}</h3><p>${esc(l.kort)}</p>${typeof lagenRegel==='function'?lagenRegel(l):''}
      <span class="onder"><span>${r.best!=null?`Beste score ${r.best}/${VRAGEN_PER_LEVEL}`:open?'Nog niet gespeeld':'Op slot'}</span><span>${open?(r.best!=null?'Opnieuw ›':'Start ›'):''}</span></span></button>`};
  // levels gegroepeerd: eerst de basis (startset en rekenlab), dan per hoofdstuk van Economie Integraal
  const groepen=[]; lvs.forEach((l,i)=>{ const g=l.hfd||''; let x=groepen.find(y=>y.g===g); if(!x){ x={g,h:[]}; groepen.push(x) } x.h.push(kaart(l,i)) });
  groepen.sort((a,b)=>(a.g?1:0)-(b.g?1:0));
  const heeftHfd=groepen.some(x=>x.g);
  const blokken=groepen.map(x=>`<div class="sectie">${x.g?esc(x.g):'Basis: startset en rekenlab'}</div><div class="levels">${x.h.join('')}</div>`).join('')+
    (heeftHfd?'':`<div class="kaart" style="margin-top:14px"><p class="zacht" style="margin:0">📚 Hier komen later de hoofdstukken van <b>Economie Integraal</b> voor dit domein. Tot die tijd oefen je met de startset en het rekenlab.</p></div>`);
  return `<section class="foto held" style="--k:${W.kleur};${foto(w,1800)}"><div class="in">
    <div class="paneel"><h4>In dit domein</h4>${paneel}</div>
    <div><button class="terug" onclick="go('home')">‹ Alle domeinen</button><br><br>
     <span class="eyebrow">Domein ${W.nr}</span><h1>${esc(W.naam)}</h1>
     ${vl?`<button class="knop groot" onclick="startLevel('${w}','${vl.id}')">Start: ${esc(vl.naam)}</button>`:tOpen&&!t.klaar?`<button class="knop groot" onclick="startToets('${w}')">Start de domeintoets</button>`:''}</div></div></section>
   <div class="wrap" style="--k:${W.kleur};padding-top:0">
    <div class="statstrook"><div><small>Levels brons of beter</small><span class="getal">${st.klaar}/${st.totaal}</span></div><div><small>Voortgang</small><span class="getal">${st.pct}%</span></div><div><small>Begrippenkaarten</small><span class="getal">${heb}/${kaarten.length}</span></div><div><small>Domeintoets</small><span class="getal">${t.klaar?'🎓 Gehaald':tOpen?'Open':'Op slot'}</span></div></div>
    ${blokken}
    <div class="toetsblok"><span class="ic">${t.klaar?'🎓':(tOpen?'📝':'🔒')}</span><div style="flex:1"><h3>Domeintoets ${W.nr}: ${esc(W.naam)}</h3><p>${t.klaar?`Diploma behaald. De eerste keer had je ${t.eerste} van ${t.tot||TOETS_VRAGEN} goed.`:tOpen?`Vragen uit het hele domein. Je oefent door tot alles goed is.`:'Gaat open als je bij alle levels minstens brons hebt.'}</p></div>
     ${tOpen?`<button class="knop" onclick="startToets('${w}')">${t.klaar?'Opnieuw':'Start'}</button>`:''}</div>
   </div>${VOET()}`;
},
uitleg(a){ const l=lvsVoor(a.w).find(x=>x.id===a.lid); const W=WERELDEN.find(x=>x.id===a.w);
  return `<div class="wrap" style="max-width:860px;--k:${W.kleur}"><div class="top" style="display:flex;gap:12px;align-items:center;margin-bottom:12px"><button class="terug" onclick="go('wereld','${a.w}')">‹ Terug</button><span class="zacht" style="font-size:14px">${esc(l.hfd||'Domein '+W.nr)}</span></div>
   <div class="kaart"><span class="eyebrow" style="color:var(--acc)">Uitleg</span><h2 style="margin:4px 0 6px">${esc(l.naam)}</h2>${l.doel?`<p class="zacht" style="margin:0 0 10px"><i>${esc(l.doel)}</i></p>`:''}
   ${l.uitleg.map(u=>`<div style="border-top:1px solid var(--lijn);padding:12px 0"><b>${esc(u.t)}</b><div style="white-space:pre-line;margin-top:4px">${esc(u.x)}</div></div>`).join('')}
   <div class="voet"><button class="knop" onclick="startLevel('${a.w}','${a.lid}',1)">Start met oefenen (${Math.min(l.vragen.length,VRAGEN_PER_LEVEL)} opgaven)</button></div></div></div>`;
},
quiz(){ return `<div class="wrap" style="max-width:860px;--k:${Q.kleur||'var(--acc)'}" id="qz"></div>` },
quiz_na(){ tekenVraag() },
resultaat(r){ return r },
vaardig(){
  const doms=DOMEINEN.map(d=>{const sc=domeinScore(d.id); const ets=Object.keys(EINDTERMEN).filter(k=>EINDTERMEN[k].d===d.id);
    const n=alleVragen().filter(v=>ets.includes(v.e)).length+(d.id==='rek'?1:0);
    const kl=sc==null?'var(--lijn)':sc>=75?'var(--goed)':sc>=50?'var(--goud)':'var(--fout)';
    const sub=ets.map(k=>{const s=etScore(k); const has=alleVragen().some(v=>v.e===k)||(GENS&&Object.keys(GENS).some(g=>maakGen(g).e===k));
       if(!has) return ''; const c=s==null?'var(--lijn)':s>=75?'var(--goed)':s>=50?'var(--goud)':'var(--fout)';
       return `<button class="lv" onclick="startEindterm('${k}')"><span class="med" style="font-size:14px;color:${c}">●</span><span style="flex:1"><b style="font-weight:600">${esc(EINDTERMEN[k].t)}</b><small>${s==null?'Nog niet genoeg geoefend':'Score '+s}</small></span><span class="zacht">›</span></button>`}).join('');
    return `<div class="kaart" style="margin-bottom:12px"><div class="domein" style="border:0"><span style="font-size:26px">${d.icoon}</span><div><b>${d.naam}</b><div class="balk" style="margin-top:6px"><i style="width:${sc||0}%;background:${kl}"></i></div></div><span class="pct">${sc==null?'–':sc}</span></div>
     ${n?`<button class="knop zacht vol" style="margin:6px 0" onclick="startDomein('${d.id}')">Oefen ${d.naam.toLowerCase()}</button>`:'<p class="zacht" style="margin:4px 0">Komt erbij met de volgende hoofdstukken.</p>'}${sub}</div>`}).join('');
  return `<div class="wrap">${kop('Vaardigheden','go(\'home\')')}<div class="kaart" style="margin-bottom:12px"><b>🎯 Slim oefenen</b><p class="zacht" style="margin:4px 0 8px">10 vragen uit de onderwerpen waar je nu het zwakst in bent${zwaksteOnderwerpen(4).length?': '+zwaksteOnderwerpen(4).map(k=>esc(EINDTERMEN[k].t)).join(', '):''}.</p><button class="knop" onclick="startSlim()">Start slim oefenen</button></div><p class="zacht">Je score per onderdeel telt je laatste 20 antwoorden. Recente antwoorden tellen zwaarder. Groen is 75 of hoger.</p>${doms}</div>`;
},
herhaal(){
  const n=S.herhaal.length;
  return `<div class="wrap">${kop('Herhaalronde','go(\'home\')')}<div class="kaart mid"><div class="groot">🔁</div>
   <p>${n?`Er staan <b>${n}</b> vragen klaar die je eerder fout had. Een vraag verdwijnt als je hem twee keer goed hebt.`:'Je hebt geen foute vragen openstaan.'}</p>
   ${n?`<button class="knop" onclick="startHerhaal()">Start herhaalronde</button>`:''}</div>
   <div class="kaart" style="margin-top:12px"><b>📕 Foutenschrift</b><p class="zacht" style="margin:4px 0 8px">Al je fouten per leerdoel, zodat je ziet waar je specifiek aan moet werken.</p><button class="knop zacht" onclick="go('fouten')">Open je foutenschrift</button></div></div>`;
},
collectie(){
  const blok=WERELDEN.filter(w=>LEVELS[w.id]&&Object.keys(LEVELS[w.id].begrippen||{}).length).map(w=>{const b=LEVELS[w.id].begrippen; const ks=Object.keys(b).sort((a,c)=>a.localeCompare(c,'nl'));
    return `<div class="sectie">Domein ${w.nr} · ${esc(w.naam)} · ${ks.filter(k=>S.kaarten.includes(k)).length} van ${ks.length} kaarten</div><div class="kaarten">${ks.map(k=>S.kaarten.includes(k)?`<div class="bk"><b>${esc(k)}</b>${esc(b[k])}${(()=>{const g=typeof laagVan==='function'?laagVan(k):null; return g?`<small class="laag ${g}" style="display:block;margin-top:6px">${LAGEN[g].i} ${LAGEN[g].n}</small>`:''})()}</div>`:`<div class="bk nee"><b>?</b>.</div>`).join('')}</div>`}).join('');
  const bad=BADGES.map(x=>{const heb=S.badges.includes(x.id); return `<div class="bk" style="${heb?'':'opacity:.4'}"><b>${x.i} ${esc(x.n)}</b>${esc(x.o)}</div>`}).join('');
  const markt=THEMAS.map(t=>{const heb=S.gekocht.includes(t.id); return `<div class="bk"><b>${t.i} ${esc(t.n)}</b>${heb?(S.thema===t.id?'In gebruik':`<button class="knop zacht" style="min-height:38px;padding:6px 12px;margin-top:6px" onclick="kiesThema('${t.id}')">Gebruik</button>`):`<button class="knop" style="min-height:38px;padding:6px 12px;margin-top:6px" onclick="koopThema('${t.id}')">🪙 ${t.p}</button>`}</div>`}).join('');
  return `<div class="wrap">${kop('Collectie','go(\'home\')')}<p class="zacht">Elke begrippenvraag die je goed hebt levert een kaart op. Verzamel ze allemaal!</p>
   <div class="sectie">Badges</div><div class="kaarten">${bad}</div><div class="sectie">Markt: kleuren voor je app</div><div class="kaarten">${markt}</div>${blok}</div>`;
},
account(){
  const st=serverModus()?(syncStatus==='ok'?`<span class="sync ok">✔ Opgeslagen op de server${syncTijd?' om '+new Date(syncTijd).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}):''}</span>`:syncStatus==='fout'?`<span class="sync fout">Nog niet opgeslagen op de server (${esc(syncFout)}). Dit gebeurt vanzelf als er internet is.</span>`:'<span class="sync">Nog niet gesynchroniseerd</span>'):'<span class="sync">Testmodus: alleen op dit apparaat</span>';
  return `<div class="wrap" style="max-width:640px">${kop('Account','go(\'home\')')}
   <div class="kaart"><p style="margin-top:0"><b>${esc(S.naam)}</b> · ${esc(S.klas)}</p>
    <p class="zacht" style="margin-bottom:2px">Speler-ID</p><div class="code">${esc(S.id||'–')}</div>
    <p class="zacht" style="margin-bottom:2px">Herstelcode</p><div class="code">${esc(S.code||'–')}</div>
    <p id="syncStat" style="margin-top:12px">${st}</p>
    ${serverModus()?`<button class="knop zacht" onclick="sync().then(()=>go('account'))">Nu opslaan</button>`:''}</div>
   <div class="sectie">Reservekopie</div><div class="kaart"><p class="zacht" style="margin-top:0">Extra zekerheid: bewaar een bestand met je voortgang, of zet er een terug.</p>
    <div class="voet" style="justify-content:flex-start"><button class="knop zacht" onclick="exportBestand()">Bewaar bestand</button>
    <label class="knop zacht">Zet bestand terug<input type="file" accept=".json,application/json" style="display:none" onchange="importBestand(this.files[0])"></label></div></div>
   <p class="zacht" style="font-size:13px">Versie ${VERSIE}</p></div>`;
},
docent(){
  return `<div class="wrap">${kop('Docent','go(\'home\')')}<div class="kaart" style="max-width:420px">
   ${serverModus()?`<label class="label" style="margin-top:0">Docentcode</label><input type="password" id="dCode" inputmode="numeric">
   <div class="voet"><button class="knop" onclick="laadDocent()">Open overzicht</button></div>`:`<p style="margin-top:0">Het klassenoverzicht werkt zodra de server is gekoppeld. Nu zie je alleen dit apparaat.</p><button class="knop" onclick="toonDocent({spelers:[samenvatLokaal()]})">Toon dit apparaat</button>`}</div><div id="dOut"></div></div>`;
}
};

// ===== Account =====
let accountBezig=false, WEES=null;   // WEES = voortgang op dit apparaat zonder speler-ID
function neemWeesMee(){ if(!WEES) return; const k={id:S.id,code:S.code,naam:S.naam,klas:S.klas}; S=Object.assign(mergeStaat(S,WEES),k); WEES=null }
async function nieuwAccount(){
  if(accountBezig) return;                       // nog een tik terwijl de server bezig is: negeren
  const naam=$('#wNaam').value.trim().replace(/\s+/g,' '), klas=$('#wKlas').value;
  if(naam.length<3||!naam.includes(' ')){ melding('Vul je voor- én achternaam in'); return }
  const st=nieuweStaat(); st.naam=naam; st.klas=klas;
  if(serverModus()){
    accountBezig=true; const knop=$('#wMaak'); if(knop){ knop.disabled=true; knop.textContent='Account wordt gemaakt… even geduld' }
    try{
      const j=await api('nieuw',{naam,klas});
      if(!j.id||!j.code) throw new Error('de server gaf geen speler-ID terug');
      st.id=String(j.id); st.code=String(j.code); S=st; neemWeesMee(); bewaar(false);
      await sync(); S.id=S.id||st.id; S.code=S.code||st.code;   // id en code nooit kwijtraken door de sync
      go('code');
    }catch(e){ S=null; melding('Het account is niet gemaakt. Probeer het opnieuw. ('+e.message+')',5000); if(knop){ knop.disabled=false; knop.textContent='Account maken' } }
    finally{ accountBezig=false }
  } else { st.id='LOKAAL-'+Math.random().toString(36).slice(2,6).toUpperCase(); S=st; bewaar(false); go('home') }
}
async function herstelAccount(){
  const id=$('#hId').value.trim().toUpperCase(), code=$('#hCode').value.trim();
  if(!id||!/^\d{6}$/.test(code)){ melding('Vul je speler-ID en de 6 cijfers in'); return }
  try{ const j=await api('herstel',{id,code}); S=Object.assign(nieuweStaat(),j.staat); S.id=id; S.code=code; neemWeesMee(); bewaar(false); zetThema(); melding('Welkom terug, je voortgang is hersteld!'); go('home') }
  catch(e){ melding(e.message,4000) }
}
function exportBestand(){
  const b=new Blob([JSON.stringify(S)],{type:'application/json'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download=`EconomieHV_${S.klas}_${S.naam.replace(/\s+/g,'_')}_${vandaag()}.json`; a.click();
}
function importBestand(f){ if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const x=JSON.parse(r.result); if(!x.naam) throw 0; S=S?mergeStaat(S,x):Object.assign(nieuweStaat(),x); bewaar(); melding('Voortgang teruggezet'); go('home') }catch(e){ melding('Dit bestand kan ik niet lezen') } }; r.readAsText(f) }

// ===== Badges en markt =====
const BADGES=[
 {id:'start',i:'🌱',n:'Eerste stap',o:'Je eerste level gespeeld'},
 {id:'brons5',i:'🥉',n:'Op stoom',o:'5 levels brons of beter'},
 {id:'goud3',i:'🥇',n:'Goudzoeker',o:'3 levels met goud'},
 {id:'diploma',i:'🎓',n:'Geslaagd',o:'Een eindtoets helemaal goed afgerond'},
 {id:'kaart20',i:'🃏',n:'Verzamelaar',o:'20 begrippenkaarten'},
 {id:'uur',i:'⏱️',n:'Doorzetter',o:'60 minuten geoefend'},
 {id:'reken',i:'🧮',n:'Rekenwonder',o:'Goud in een rekenlab'},
 {id:'herhaal',i:'🔁',n:'Foutloos',o:'Herhaalronde leeg gemaakt'}
];
function checkBadges(){
  const nieuw=[]; const geef=id=>{ if(!S.badges.includes(id)){ S.badges.push(id); nieuw.push(BADGES.find(b=>b.id===id)) } };
  const lv=Object.entries(S.lv);
  if(lv.length) geef('start');
  if(lv.filter(([k,r])=>r.best>=6).length>=5) geef('brons5');
  if(lv.filter(([k,r])=>r.best>=8).length>=3) geef('goud3');
  if(Object.values(S.toets).some(t=>t.klaar)) geef('diploma');
  if(S.kaarten.length>=20) geef('kaart20');
  if(S.tijd>=3600) geef('uur');
  if(lv.some(([k,r])=>k.endsWith('.r')&&r.best>=8)) geef('reken');
  return nieuw;
}
const THEMAS=[{id:'standaard',i:'🟠',n:'Vellesan',p:0},{id:'zee',i:'🌊',n:'Zee',p:40},{id:'bos',i:'🌲',n:'Bos',p:40},{id:'snoep',i:'🍬',n:'Snoep',p:60},{id:'nacht',i:'🌙',n:'Nacht',p:100}];
function koopThema(id){ const t=THEMAS.find(x=>x.id===id); if(munten()<t.p){ melding(`Je hebt ${t.p} munten nodig`); return } S.mUit+=t.p; S.gekocht.push(id); S.thema=id; bewaar(); zetThema(); go('collectie') }
function kiesThema(id){ S.thema=id; bewaar(); zetThema(); go('collectie') }

// ===== Oefenen: rondes starten =====
function vragenVoorLevel(l){
  const vaste=shuffle(l.vragen); const gens=(l.gens||[]);
  let set;
  if(!vaste.length&&!gens.length) return [];
  if(!vaste.length) set=Array.from({length:VRAGEN_PER_LEVEL},()=>maakGen(pick(gens)));
  else { const nGen=Math.min(gens.length?2:0,VRAGEN_PER_LEVEL); set=vaste.slice(0,VRAGEN_PER_LEVEL-nGen).concat(Array.from({length:nGen},()=>maakGen(pick(gens)))); }
  return shuffle(set);
}
function startLevel(w,lid,direct){ const l=lvsVoor(w).find(x=>x.id===lid); if(!l||!speelbaar(l)){ melding('Dit level heeft nog geen vragen'); return }
  if(l.uitleg&&l.uitleg.length&&!direct){ go('uitleg',{w,lid}); return } const W=WERELDEN.find(x=>x.id===w);
  Q={modus:'level',titel:l.naam,w,lid,kleur:W.kleur,vragen:vragenVoorLevel(l),i:0,res:[],terug:`go('wereld','${w}')`}; go('quiz') }
function startToets(w){ const W=WERELDEN.find(x=>x.id===w); const lvs=lvsVoor(w).filter(l=>l.vragen.length);
  const per=Math.max(3,Math.ceil((TOETS_VRAGEN-2)/Math.max(1,lvs.length))); let pool=[]; lvs.forEach(l=>pool.push(...shuffle(l.vragen.filter(v=>v.t!=='open')).slice(0,per).map(v=>Object.assign({l:l.id},v)))); pool=shuffle(pool).slice(0,TOETS_VRAGEN-2);
  const gens=[...new Set(lvsVoor(w).flatMap(l=>l.gens||[]))]; if(gens.length) pool.push(maakGen(pick(gens)),maakGen(pick(gens)));
  Q={modus:'toets',titel:`Domeintoets ${W.nr}`,w,kleur:W.kleur,vragen:shuffle(pool),i:0,res:[],ronde:1,terug:`go('wereld','${w}')`}; go('quiz') }
function startHerhaal(){ const v=shuffle(S.herhaal).slice(0,10).map(vraagById).filter(Boolean); if(!v.length){go('herhaal');return}
  Q={modus:'herhaal',titel:'Herhaalronde',vragen:v,i:0,res:[],terug:"go('herhaal')"}; go('quiz') }
function startEindterm(k){ let v=shuffle(alleVragen().filter(x=>x.e===k&&vrNiv(x)&&(typeof laagTelt!=='function'||laagTelt(x.lg)))).slice(0,8); const g=Object.keys(GENS).filter(n=>maakGen(n).e===k);
  while(v.length<6&&g.length) v.push(maakGen(pick(g))); if(!v.length){melding('Hier zijn nog geen vragen voor');return}
  Q={modus:'et',titel:EINDTERMEN[k].t,vragen:shuffle(v),i:0,res:[],terug:"go('vaardig')"}; go('quiz') }
function startDomein(d){ const ets=Object.keys(EINDTERMEN).filter(k=>EINDTERMEN[k].d===d);
  // zwakste eindtermen vaker: sorteer op score
  let v=alleVragen().filter(x=>ets.includes(x.e)&&vrNiv(x)); v=shuffle(v).sort((a,b)=>(etScore(a.e)??50)-(etScore(b.e)??50)).slice(0,10);
  if(d==='A'||v.length<6){ const g=Object.keys(GENS).filter(n=>ets.includes(maakGen(n).e)); while(v.length<10&&g.length) v.push(maakGen(pick(g))) }
  if(!v.length){melding('Hier zijn nog geen vragen voor');return}
  const D=DOMEINEN.find(x=>x.id===d); Q={modus:'domein',titel:D.naam,kleur:D.kleur,vragen:shuffle(v),i:0,res:[],terug:"go('vaardig')"}; go('quiz') }

// ===== Adaptief oefenen =====
// Na een fout antwoord krijgt de leerling een extra vraag over hetzelfde onderwerp (steunvraag), maximaal 3 per ronde.
// Steunvragen tellen niet mee voor de medaille van een level, wel voor de vaardigheidsscore.
const STEUN_MAX=3, STEUN_MODI=['level','et','domein','herhaal','slim'];
const autoNakijk = v => ['mc','wo','ex','reken','koppel'].includes(v.t);
function steunvraag(v){
  if(!Q||!STEUN_MODI.includes(Q.modus)||!v.e||(Q.nSteun||0)>=STEUN_MAX) return;
  const al=new Set(Q.vragen.map(x=>x.id));
  const recentGoed=x=>{const r=S.vr[x.id]; return r&&r.g>0&&r.t&&Date.now()-r.t<3*864e5};
  let kand=alleVragen().filter(x=>x.e===v.e&&vrNiv(x)&&autoNakijk(x)&&!al.has(x.id));
  kand=shuffle(kand).sort((a,b)=>(recentGoed(a)?1:0)-(recentGoed(b)?1:0));
  let nw=kand[0];
  if(!nw){ const g=Object.keys(GENS).filter(n=>{try{return maakGen(n).e===v.e}catch(e){return false}}); if(g.length) nw=maakGen(pick(g)) }
  if(!nw) return;
  nw=Object.assign({},nw,{_steun:true}); delete nw._mix;
  Q.vragen.splice(Math.min(Q.i+2,Q.vragen.length),0,nw); Q.nSteun=(Q.nSteun||0)+1;
  const fb=$('#fb'); if(fb) fb.insertAdjacentHTML('beforeend',`<p class="zacht" style="font-size:14px;margin:6px 0 0">➕ Je krijgt zo een extra vraag over ${esc((EINDTERMEN[v.e]||{}).t||'dit onderwerp')}.</p>`);
}
// Slim oefenen: 10 vragen uit de onderwerpen waar de leerling het zwakst op scoort (plus foute vragen uit de herhaalronde)
function zwaksteOnderwerpen(n){
  const metVragen=new Set(alleVragen().filter(x=>vrNiv(x)&&autoNakijk(x)&&x.e).map(x=>x.e));
  const gespeeld=Object.keys(S.et).filter(k=>metVragen.has(k)&&EINDTERMEN[k]);
  return gespeeld.map(k=>[k,etScore(k)??60]).filter(x=>x[1]<80).sort((a,b)=>a[1]-b[1]).slice(0,n).map(x=>x[0]);
}
function startSlim(){
  const ets=zwaksteOnderwerpen(4);
  let v=S.herhaal.map(vraagById).filter(x=>x&&autoNakijk(x)&&vrNiv(x)); v=shuffle(v).slice(0,3);
  const al=new Set(v.map(x=>x.id));
  ets.forEach((k,i)=>{ const per=i===0?3:2; shuffle(alleVragen().filter(x=>x.e===k&&vrNiv(x)&&autoNakijk(x)&&!al.has(x.id))).slice(0,per).forEach(x=>{v.push(x);al.add(x.id)}) });
  if(v.length<5){ melding('Oefen eerst een paar levels. Daarna weet de app waar je extra oefening nodig hebt.',4000); return }
  Q={modus:'slim',titel:'Slim oefenen',vragen:shuffle(v).slice(0,10),i:0,res:[],terug:"go('vaardig')"}; go('quiz') }

// ===== Quiz-engine =====
let antw=null;
function tekenVraag(){
  const v=Q.vragen[Q.i]; antw=null; Q.fase='vraag';
  if(v.t==='mc'&&!v._mix){ const ord=shuffle(v.o.map((_,i)=>i)); v._mix=ord }
  const bol=Q.vragen.map((x,i)=>`<i class="${i<Q.res.length?((Q.modus==='toets'||Q.geenFb)?'nu':(Q.res[i]?'g':'f')):(i===Q.i?'nu':'')}"></i>`).join('');
  let body='';
  if(v.t==='mc') body=`<div class="opties">${v._mix.map((oi,k)=>`<button class="optie" data-k="${oi}" onclick="kies(this,${oi})"><span class="l">${'ABCD'[k]}</span><span>${esc(v.o[oi])}</span></button>`).join('')}</div>`;
  else if(v.t==='ex') body=`${v.bron?`<div class="kaart" style="margin-bottom:12px;font-size:15px;white-space:pre-wrap">${esc(v.bron)}</div>`:''}<div class="opties">${v.o.map((o,k)=>`<button class="optie" data-k="${k}" onclick="kies(this,${k})"><span class="l">${'ABCDE'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  else if(v.t==='wo') body=`<div class="opties" style="grid-template-columns:1fr 1fr"><button class="optie" data-k="true" onclick="kies(this,true)"><span class="l">✔</span><span>Waar</span></button><button class="optie" data-k="false" onclick="kies(this,false)"><span class="l">✘</span><span>Niet waar</span></button></div>`;
  else if(v.t==='koppel'){ if(!v._r) v._r=shuffle([...new Set(v.p.map(p=>p[1]))]); antw=v.p.map(()=>'');
    body=`<div class="koppel">${v.p.map((p,i)=>`<b>${esc(p[0])}</b><select data-i="${i}" onchange="antw[${i}]=this.value;$('#ok').disabled=antw.some(x=>!x)"><option value="">Kies…</option>${v._r.map(r=>`<option>${esc(r)}</option>`).join('')}</select>`).join('')}</div>`; }
  else if(v.t==='open') body=`<textarea id="oIn" rows="5" style="width:100%;font:inherit;padding:10px;border-radius:12px;border:1px solid var(--lijn)" placeholder="Schrijf je antwoord op, zoals op het examen." oninput="antw=this.value"></textarea><p class="zacht" style="font-size:14px">Daarna zie je het antwoordmodel en geef je jezelf punten.${v.pnt?` Maximaal ${v.pnt} punt${v.pnt>1?'en':''}.`:''}</p>`;
  else if(v.t==='reken') body=`<div class="reken">${v.eh==='€'?'€':''}<input type="text" id="rIn" inputmode="decimal" autocomplete="off" oninput="antw=this.value;$('#ok').disabled=!this.value.trim()" onkeydown="if(event.key==='Enter'&&!$('#ok').disabled)controleer()">${v.eh==='%'?'%':''}</div><p class="zacht" style="font-size:14px">Gebruik een komma voor decimalen. ${v.eh==='€'?'Rond af op 2 decimalen.':'Rond af op 1 decimaal.'}</p>`;
  $('#qz').innerHTML=`<div class="top"><button class="terug" onclick="if(confirm('Stoppen? Deze ronde telt dan niet mee.'))${Q.terug.replace(/"/g,'&quot;')}">‹ Stop</button><h1 style="font-size:18px">${esc(Q.titel)}</h1><span class="chip">${Q.i+1} / ${Q.vragen.length}</span></div>
   <div class="voortgang">${bol}</div><div class="kaart">${v._steun?`<p class="chip" style="display:inline-block;margin:0 0 8px">➕ Extra oefenvraag</p>`:''}${v.ctx?`<div class="zacht vctx" style="margin-top:0;font-size:14px">${fmt(v.ctx)}</div>`:''}<div class="vraag${v.q.length>180||v.q.includes('\n')?' lang':''}">${v.q.includes('\n')||v.q.length>180?fmt(v.q,true):esc(v.q)}</div>${body}<div id="fb"></div>
   <div class="voet"><button class="knop" id="ok" disabled onclick="controleer()">Controleer</button></div></div>`;
  if(v.t==='reken') setTimeout(()=>$('#rIn')&&$('#rIn').focus(),50);
  if(v.t==='open') $('#ok').disabled=false, $('#ok').textContent='Toon antwoordmodel';
}
function kies(el,k){ if(Q.fase!=='vraag') return; document.querySelectorAll('.optie').forEach(x=>x.classList.remove('kies')); el.classList.add('kies'); antw=k; $('#ok').disabled=false }
function juistTekst(v){
  if(v.t==='mc'||v.t==='ex') return v.o[v.a]; if(v.t==='wo') return v.a?'Waar':'Niet waar';
  if(v.t==='open') return v.model||'';
  if(v.t==='reken') return v.eh==='€'?eur(v.a):(nl1(v.a)+(v.eh==='%'?'%':'')); if(v.t==='koppel') return v.p.map(p=>p[0]+' → '+p[1]).join(' · ');
}
// open vraag: eerst het antwoordmodel tonen, dan punten toekennen.
// Met deelscores vinkt de leerling per deelscore aan wat goed is; een rekenuitkomst die in het antwoord staat, vinkt de computer alvast aan.
// Zonder deelscores kiest de leerling 0 t/m het maximum aantal punten.
function controleer(){
  if(Q.fase!=='vraag') return; const v=Q.vragen[Q.i];
  if(v.t==='open'&&antw!==true&&antw!==false&&!(antw&&antw.max)){ Q.fase='zelf'; const tekst=String(antw||''); const i=$('#oIn'); if(i) i.readOnly=true;
    const ds=v.pnt?deelscoresVan(v):null; let nakijk='';
    if(ds){ nakijk=`<p style="margin:14px 0 6px"><b>Vink aan wat er in jouw antwoord goed is:</b></p><div class="deelscores">${ds.map((d,k)=>{ const g=uitkomstVan(d.t); const auto=bevatGetal(tekst,g);
        return `<label class="deel"><input type="checkbox" data-p="${d.p}" ${auto?'checked':''} onchange="telDeel()"><span>${esc(d.t.replace(/^(Een juist antwoord bevat|Een juiste (berekening|uitleg|verklaring) is|Uit het antwoord moet blijken)( dat)?:?\s*/i,''))} <b class="zacht">(${d.p}p)</b>${auto?`<br><small class="auto">🤖 De computer vond ${esc(g)} in je antwoord</small>`:''}</span></label>` }).join('')}</div>
        <div class="voet" style="justify-content:flex-start;align-items:center"><button class="knop" id="dsOk" onclick="geefPunten(telDeel())">Klaar met nakijken</button><span id="dsTot" class="zacht"></span></div>` }
    else if(v.pnt>1){ nakijk=`<p style="margin:14px 0 6px"><b>Hoeveel punten geef je jezelf?</b></p><div class="voet" style="justify-content:flex-start;flex-wrap:wrap">${Array.from({length:v.pnt+1},(_,k)=>v.pnt-k).map(k=>`<button class="knop${k===v.pnt?'':' zacht'}" onclick="geefPunten(${k})">${k} punt${k===1?'':'en'}</button>`).join('')}</div>` }
    else nakijk=`<p style="margin:14px 0 6px"><b>Kijk je antwoord na. Had je het goed?</b></p><div class="voet" style="justify-content:flex-start"><button class="knop" onclick="geefPunten(1)">✔ Goed</button><button class="knop zacht" onclick="geefPunten(0)">✘ Nog niet goed</button></div>`;
    $('#fb').innerHTML=`<div class="fb"><b>Antwoordmodel</b>${v.pnt?` <span class="zacht">(${v.pnt} punt${v.pnt>1?'en':''})</span>`:''}<div style="margin-top:6px">${fmt(ds?String(v.model).split(/\n\s*Puntenverdeling:?/)[0]:v.model)}</div>${nakijk}</div>`;
    if(ds) telDeel(); $('#ok').style.display='none'; return }
  afronden(v);
}
function telDeel(){ let p=0; document.querySelectorAll('.deelscores input').forEach(x=>{ if(x.checked) p+=+x.dataset.p }); const t=$('#dsTot'); if(t) t.textContent=`${p} van ${Q.vragen[Q.i].pnt} punten`; return p }
function geefPunten(p){ if(Q.fase!=='zelf') return; const v=Q.vragen[Q.i]; const max=v.pnt||1; antw={p,max}; v._pt=antw; Q.pt=(Q.pt||0)+p; Q.ptMax=(Q.ptMax||0)+max; Q.fase='vraag'; $('#ok').style.display=''; afronden(v) }
function zelfOordeel(g){ geefPunten(g?(Q.vragen[Q.i].pnt||1):0) }
function afronden(v){
  const goed=nakijken(v,antw); Q.res.push(goed); const nk=registreer(v,goed); if(nk) Q.kaartGemeld=(Q.kaartGemeld||[]).concat(nk); Q.fase='fb';
  const toets=Q.modus==='toets'||!!Q.geenFb;
  if(!toets){
    if(v.t==='mc'||v.t==='wo'||v.t==='ex') document.querySelectorAll('.optie').forEach(x=>{ const k=x.dataset.k; const isJ=String(v.a)===k; if(isJ) x.classList.add('goed'); else if(x.classList.contains('kies')) x.classList.add('fout') });
    if(v.t==='koppel') document.querySelectorAll('.koppel select').forEach(s=>{ s.classList.add(s.value===v.p[s.dataset.i][1]?'goed':'fout'); s.disabled=true });
    if(v.t==='reken'){ const i=$('#rIn'); i.classList.add(goed?'goed':'fout'); i.disabled=true }
    if(v.t==='open') $('#fb').innerHTML=`<div class="fb ${goed?'goed':'fout'}"><b>${v._pt&&v._pt.max>1?`${v._pt.p} van ${v._pt.max} punten. `:''}${goed?'Mooi!':'Deze komt terug in je herhaalronde.'}</b><div style="margin-top:6px">${fmt(v.model)}</div>${v.u?'<br>'+esc(v.u):''}</div>`; else
    $('#fb').innerHTML=`<div class="fb ${goed?'goed':'fout'}"><b>${goed?pick(['Goed zo!','Klopt!','Top!','Helemaal goed!']):'Niet goed.'}</b> ${goed?'':'Het juiste antwoord: <b>'+esc(juistTekst(v))+'</b>. '}${v.u?'<br>'+esc(v.u):''}${nk?`<br>🃏 Nieuwe kaart: <b>${esc(v.b)}</b>`:''}</div>`;
  }
  if(!goed) steunvraag(v);
  document.querySelectorAll('.optie').forEach(x=>x.disabled=true);
  const laatste=Q.i===Q.vragen.length-1; const ok=$('#ok'); ok.disabled=false; ok.textContent=laatste?'Bekijk resultaat':'Volgende'; ok.onclick=volgende;
  if(toets) volgende(); else bewaar();
}
function volgende(){ if(Q.i<Q.vragen.length-1){ Q.i++; tekenVraag() } else klaar() }

function klaar(){
  oefenActief=false; let n=Q.res.filter(Boolean).length, tot=Q.vragen.length; let extra='', titel='', icoon='🎉';
  const nS=Q.vragen.filter(v=>v._steun).length;
  if(nS){ n=Q.res.filter((g,i)=>g&&!Q.vragen[i]._steun).length; tot=tot-nS; const sg=Q.res.filter((g,i)=>g&&Q.vragen[i]._steun).length; extra+=`<p class="zacht">Extra oefenvragen: ${sg} van ${nS} goed.</p>` }
  if(Q.ptMax) extra+=`<p>✍️ Open vragen: <b>${Q.pt} van ${Q.ptMax} punten</b></p>`;
  if(Q.modus==='level'){
    const n8=Math.round(n/tot*VRAGEN_PER_LEVEL); // score omgerekend naar 8, zodat levels met meer of minder vragen eerlijk tellen
    const oud=(S.lv[Q.lid]||{}).best; const r=S.lv[Q.lid]||{best:0,n:0}; r.n++; r.best=Math.max(r.best||0,n8); r.laatst=n8; S.lv[Q.lid]=r;
    const m=medaille(n8), mOud=oud!=null?medaille(oud):null;
    if(m&&(!mOud||m.min>mOud.min)){ const bon=m.m-(mOud?mOud.m:0); S.mVerd+=bon; extra+=`<p>${m.e} Nieuwe medaille: <b>${m.n}</b>! +${bon} munten</p>` }
    icoon=m?m.e:'💪'; titel=m?`${n} van ${tot} goed`:`${n} van ${tot} goed. Voor brons heb je ${Math.ceil(MEDAIL[0].min/VRAGEN_PER_LEVEL*tot)} goed nodig.`;
  } else if(Q.modus==='toets'){
    return toetsUitslag();
  } else if(Q.modus==='herhaal'){ if(!S.herhaal.length) { S.badges.includes('herhaal')||S.badges.push('herhaal') } titel=`${n} van ${tot} goed`; extra=`<p class="zacht">Nog ${S.herhaal.length} vragen in je herhaalronde.</p>` }
  else if(Q.modus==='sprint'){ const s=S.sprint||{best:0}; const nieuwRec=n>(s.best||0); s.best=Math.max(s.best||0,n); s.n=(s.n||0)+1; S.sprint=s; titel=`${n} van ${tot} goed`; extra=`<p>${nieuwRec?'🏆 Nieuw record!':'Je record: '+s.best}</p>` }
  else titel=`${n} van ${tot} goed`;
  const nb=checkBadges(); nb.forEach(b=>extra+=`<p>${b.i} Nieuwe badge: <b>${esc(b.n)}</b></p>`);
  if(Q.kaartGemeld&&Q.kaartGemeld.length) extra+=`<p>🃏 ${Q.kaartGemeld.length} nieuwe begrippenkaart${Q.kaartGemeld.length>1?'en':''}</p>`;
  bewaar(); sync();
  const fout=Q.vragen.filter((v,i)=>!Q.res[i]);
  app().innerHTML=`<div class="wrap" style="max-width:640px"><div class="kaart mid"><div class="groot">${icoon}</div><h2 style="margin:0 0 6px">${titel}</h2>${extra}
   <div class="voet" style="justify-content:center"><button class="knop zacht" onclick="${Q.terug.replace(/"/g,'&quot;')}">Terug</button>${Q.modus==='level'?`<button class="knop" onclick="startLevel('${Q.w}','${Q.lid}')">Nog een keer</button>`:''}</div></div>
   ${fout.length?`<div class="sectie">Deze had je fout</div><div class="kaart">${fout.map(v=>`<div class="rij" style="display:block"><b>${esc(v.q)}</b><br><span class="zacht">Juist: ${esc(juistTekst(v))}</span></div>`).join('')}</div>`:''}</div>`;
  scherm='resultaat'; nav();
}
function toetsUitslag(){
  const n=Q.res.filter(Boolean).length, tot=Q.vragen.length; const t=S.toets[Q.w]||{n:0}; const W=WERELDEN.find(x=>x.id===Q.w);
  if(Q.ronde===1){ t.n=(t.n||0)+1; t.laatsteEerste=n; if(t.eerste==null){ t.eerste=n; t.tot=tot } t.beste=Math.max(t.beste||0,n) }
  const fout=Q.vragen.filter((v,i)=>!Q.res[i]);
  // waar moet je nog mee oefenen: per level
  const perLevel={}; fout.forEach(v=>{ const l=v.l||(v.gen?'rekenen':'?'); perLevel[l]=(perLevel[l]||0)+1 });
  const naam=id=>{const l=(LEVELS[Q.w]||[]).find(x=>x.id===id); return l?l.naam:'Rekenen'};
  let html;
  if(!fout.length){
    t.klaar=1; S.toets[Q.w]=t; S.mVerd+=30; checkBadges(); bewaar(); sync();
    html=`<div class="kaart mid"><div class="groot">🎓</div><h2 style="margin:0">Alles goed!</h2><p>Je hebt de domeintoets ${W.nr} (${esc(W.naam)}) afgerond en je diploma verdiend. +30 munten</p>
     ${Q.ronde>1?`<p class="zacht">Je had de eerste keer ${t.laatsteEerste} van ${t.tot||tot} goed en hebt doorgezet tot alles klopte.</p>`:''}<div class="voet" style="justify-content:center"><button class="knop" onclick="go('wereld','${Q.w}')">Terug naar domein ${W.nr}</button></div></div>`;
  } else {
    S.toets[Q.w]=t; bewaar(); sync();
    html=`<div class="kaart mid"><div class="groot">📝</div><h2 style="margin:0">${n} van ${tot} goed</h2><p>Nog <b>${fout.length}</b> te gaan. Bekijk de uitleg en maak die vragen opnieuw tot alles goed is.</p>
     <div class="voet" style="justify-content:center"><button class="knop" onclick="toetsOpnieuw()">Oefen de ${fout.length} foute vragen</button></div></div>
     <div class="sectie">Hier moet je nog mee oefenen</div><div class="kaart">${Object.entries(perLevel).map(([l,c])=>`<div class="rij"><span style="flex:1">${esc(naam(l))}</span><b>${c} fout</b></div>`).join('')}</div>
     <div class="sectie">Uitleg bij je fouten</div><div class="kaart">${fout.map(v=>`<div class="rij" style="display:block"><b>${esc(v.q)}</b><br>Juist: <b>${esc(juistTekst(v))}</b>${v.u?`<br><span class="zacht">${esc(v.u)}</span>`:''}</div>`).join('')}</div>`;
    Q.fout=fout;
  }
  app().innerHTML=`<div class="wrap" style="max-width:680px">${html}</div>`; scherm='resultaat'; nav();
}
function toetsOpnieuw(){ const v=Q.fout.map(x=>x.gen?maakGen(x.id.slice(4)):x); v.forEach(x=>delete x._mix); Q=Object.assign(Q,{vragen:shuffle(v),i:0,res:[],ronde:Q.ronde+1}); go('quiz') }

// ===== Docent =====
function samenvatLokaal(){ return samenvat(S) }
function samenvat(s){ // zelfde berekening als op de server
  const dom={}; DOMEINEN.forEach(d=>{ const sc=Object.keys(EINDTERMEN).filter(k=>EINDTERMEN[k].d===d.id).map(k=>{const et=(s.et||{})[k]; if(!et||et.r.length<3) return null; let a=0,w=0; et.r.forEach((x,i)=>{a+=x*(i+1);w+=i+1}); return Math.round(a/w*100)}).filter(x=>x!==null); dom[d.id]=sc.length?Math.round(sc.reduce((a,b)=>a+b,0)/sc.length):null });
  const fout={}; Object.entries(s.vr||{}).forEach(([k,r])=>{ if(r.f) fout[k]=r.f });
  return {id:s.id,naam:s.naam,klas:s.klas,code:s.code,laatst:s.upd,tijd:s.tijd||0,tijdWeek:(s.week||{})[weekId()]||0,xp:s.xp||0,lv:s.lv||{},toets:s.toets||{},dom,fout,et:s.et||{},vr:s.vr||{},week:s.week||{},dag:s.dag||{},nk:(s.kaarten||[]).length,badges:s.badges||[],sprint:s.sprint||null,kv:s.kv||(typeof kernStand==='function'&&s===S?kernStand():null),lmodus:s.lmodus||null,herhaal:(s.herhaal||[]).length,aangemaakt:s.aangemaakt||0,munten:(s.mVerd||0)-(s.mUit||0)};
}
async function laadDocent(){ const c=$('#dCode').value.trim(); try{ const j=await api('overzicht',{docentcode:c}); toonDocent(j) }catch(e){ melding(e.message,4000) } }
let D=null, dKlas='alle', dSort='week';
function toonDocent(j){ D=j; tekenDocent() }
// ===== Start =====
function start(){
  laad(); zetThema();
  toonSyncStatus=()=>{ const el=$('#syncStat'); if(el&&scherm==='account') go('account') };
  if(serverModus()&&S&&S.naam&&!S.id){ WEES=S; S=null }   // account zonder speler-ID (mislukt aanmaken): opnieuw koppelen
  if(!S||!S.naam){ go('welkom'); if(WEES) melding('Je account is niet goed aangemaakt. Vul hieronder je speler-ID en herstelcode in (je docent kan ze opzoeken) of maak opnieuw een account. Je voortgang op deze iPad blijft bewaard.',9000) }
  else { go('home'); if(serverModus()) sync(); }
}

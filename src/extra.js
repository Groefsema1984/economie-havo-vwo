// ===== Extra leermiddelen =====
// 1 flitskaarten met herhaling op afstand, 2 formulekaart en rekenhulp, 3 grafiekvragen (klikken in een grafiek),
// 4 proeftoets per hoofdstuk, 6 een heel examen op tijd. (5, het klassenoverzicht, staat in docent.js.)
const DAG=864e5;
Object.assign(FOTO,{fouten:FOTO.herhaal,leren:FOTO.vaardig,flits:FOTO.collectie,flitsen:FOTO.collectie,formules:FOTO.A,proef:FOTO.herhaal,exvol:FOTO.examen});

// ---------- Leren: overzicht van alle extra's ----------
SCHERMEN.leren = function(){
  const due=fkDue().length, nieuw=fkNieuw().length;
  const exOpen=exVragen().length>0;
  const tegel=(ic,t,s,on)=>`<button class="uitdaging" onclick="${on}"><span class="thumb" style="background:var(--bg);display:grid;place-items:center;font-size:28px">${ic}</span><span><b>${t}</b><small>${s}</small></span></button>`;
  return `<div class="wrap" style="max-width:760px">${kop('Leren en toetsen',"go('home')")}<div class="kaart">
   ${tegel('🃏','Flitskaarten',due?`${due} begrippen om nu te herhalen`:`${nieuw} nieuwe begrippen om te leren`,"go('flits')")}
   ${tegel('📕','Foutenschrift',(()=>{const g=foutGroepen(S.vr,S.herhaal).filter(x=>x.open);return g.length?`${g.reduce((a,x)=>a+x.open,0)} fouten open bij ${g.length} leerdoelen`:'Al je fouten per leerdoel, zodat je weet waar je aan moet werken'})(),"go('fouten')")}
   ${tegel('🧮','Formulekaart en rekenhulp','Alle formules met een uitgewerkt voorbeeld en een rekenhulp',"go('formules')")}
   ${tegel('📈','Grafiektraining','Klik in de grafiek: evenwicht, surplus, maximumprijs, accijns',"startGrafiek()")}
   ${tegel('⏱️','Proeftoets per hoofdstuk','Toets op tijd met een cijfer, zonder hulp tussendoor',"go('proef')")}
   ${exOpen?tegel('🎓','Examen op tijd','Een heel oud examen in 3 uur, daarna nakijken en een cijfer',"exTab='tijd';go('examen')"):''}
  </div></div>${VOET()}`;
};

// ---------- 1. Flitskaarten ----------
// Leitner-systeem: elke kaart zit in een bak (0 t/m 6). Wist je hem, dan gaat hij een bak verder en komt hij later terug.
// S.fk[begrip] = [bak, tijdstip waarop hij weer aan de beurt is] (een array, zodat de server de nieuwste versie houdt)
const FK_INT=[0,1,3,7,14,30,60];
function alleBegrippen(d){ const out=[], gezien=new Set(); WERELDEN.forEach(w=>{ if(d&&d!==w.id) return; const b=(LEVELS[w.id]||{}).begrippen||{};
  Object.keys(b).forEach(k=>{ if(!gezien.has(k)){ gezien.add(k); out.push({k,def:b[k],w:w.id}) } }) }); return out }
function fkStaat(){ if(!S.fk||Array.isArray(S.fk)) S.fk={}; return S.fk }
function fkDue(d){ const fk=fkStaat(), nu=Date.now(); return alleBegrippen(d).filter(x=>fk[x.k]&&fk[x.k][1]<=nu) }
function fkNieuw(d){ const fk=fkStaat(); return shuffle(alleBegrippen(d).filter(x=>!fk[x.k])).sort((a,b)=>(S.kaarten.includes(b.k)?1:0)-(S.kaarten.includes(a.k)?1:0)) }
let FK=null, fkOm=false;
function startFlits(d){ const due=shuffle(fkDue(d)).slice(0,30); const nw=fkNieuw(d).slice(0,Math.max(0,Math.min(10,30-due.length)));
  const lijst=due.concat(nw); if(!lijst.length){ melding('Hier zijn nu geen kaarten om te oefenen'); return }
  FK={d,lijst,i:0,om:false,ok:0,bijna:0,nee:0}; go('flitsen') }
SCHERMEN.flits = function(){
  const fk=fkStaat();
  const rij=(d,naam,ic)=>{ const al=alleBegrippen(d); if(!al.length) return ''; const due=fkDue(d).length, nw=al.filter(x=>!fk[x.k]).length, vast=al.filter(x=>fk[x.k]&&fk[x.k][0]>=4).length;
    return `<button class="lv" onclick="startFlits(${d?`'${d}'`:''})"><span class="med">${ic}</span><span style="flex:1"><b>${esc(naam)}</b><small>${due?`<b style="color:var(--fout)">${due} om te herhalen</b> · `:''}${nw} nieuw · ${vast} van ${al.length} zitten vast</small><div class="balk" style="margin-top:6px"><i style="width:${Math.round(vast/al.length*100)}%"></i></div></span><span class="zacht">›</span></button>` };
  return `<div class="wrap" style="max-width:760px">${kop('Flitskaarten',"go('leren')")}
   <div class="kaart" style="margin-bottom:14px"><p style="margin:0">Je ziet een begrip. Bedenk de betekenis, draai de kaart om en zeg eerlijk of je hem wist. Kaarten die je weet komen later terug (na 1, 3, 7, 14, 30 en 60 dagen), kaarten die je niet weet komen meteen nog een keer.</p>
   <label class="label" style="margin-top:10px"><input type="checkbox" ${fkOm?'checked':''} onchange="fkOm=this.checked"> Andersom oefenen: je ziet de betekenis en noemt het begrip</label></div>
   <div class="kaart">${rij('','Alle domeinen door elkaar','🃏')}${WERELDEN.map(w=>rij(w.id,'Domein '+w.nr+' · '+w.naam,w.icoon)).join('')}</div></div>${VOET()}`;
};
SCHERMEN.flitsen = function(){
  if(!FK) return SCHERMEN.flits();
  const x=FK.lijst[FK.i]; const voor=fkOm?x.def:x.k, achter=fkOm?x.k:x.def; const W=WERELDEN.find(w=>w.id===x.w)||{};
  return `<div class="wrap" style="max-width:640px"><div class="top" style="display:flex;align-items:center;gap:10px;margin:8px 0 14px"><button class="terug" onclick="fkKlaar()">‹ Stop</button><b style="flex:1">Flitskaarten</b><span class="chip">${FK.i+1} / ${FK.lijst.length}</span></div>
   <button class="flitskaart ${FK.om?'om':''}" style="--k:${W.kleur||'var(--acc)'}" onclick="fkDraai()"><small>${esc(W.icoon||'')} Domein ${esc(x.w)} · ${fkOm?'Welk begrip is dit?':'Wat betekent dit begrip?'}</small>
    <span class="voor">${esc(voor)}</span>${FK.om?`<span class="achter">${esc(achter)}</span>`:'<span class="zacht" style="font-size:14px">Tik om de kaart om te draaien</span>'}</button>
   ${FK.om?`<div class="fkknoppen"><button class="knop zacht" onclick="fkAntw(0)">✘ Wist ik niet</button><button class="knop zacht" onclick="fkAntw(1)">≈ Twijfel</button><button class="knop" onclick="fkAntw(2)">✔ Wist ik</button></div>`:''}</div>`;
};
function fkDraai(){ if(!FK||FK.om) return; FK.om=true; go('flitsen') }
function fkAntw(s){
  const x=FK.lijst[FK.i], fk=fkStaat(), r=fk[x.k]||[0,0], nu=Date.now();
  if(s===2){ const b=Math.min(r[0]+1,6); fk[x.k]=[b,nu+FK_INT[b]*DAG]; FK.ok++; S.xp+=2; if(!S.kaarten.includes(x.k)) S.kaarten.push(x.k) }
  else if(s===1){ fk[x.k]=[Math.max(1,r[0]),nu+DAG]; FK.bijna++ }
  else { fk[x.k]=[0,nu]; FK.nee++; x.n=(x.n||0)+1; if(x.n<3) FK.lijst.push(x) }
  FK.i++; FK.om=false; bewaar(false);
  if(FK.i>=FK.lijst.length) fkKlaar(); else go('flitsen');
}
function fkKlaar(){ if(!FK) return go('flits'); const f=FK; FK=null; bewaar(); checkBadges();
  if(!f.ok&&!f.bijna&&!f.nee) return go('flits');
  go('flits'); melding(`Klaar: ${f.ok} gekend, ${f.bijna} twijfel, ${f.nee} nog niet. Morgen weer even herhalen!`,4500) }

// ---------- 2. Formulekaart en rekenhulp ----------
const _g = s => parseGetal(s);
const FORMULES = [
 {d:'A',n:'Procentuele verandering',f:'(nieuw − oud) / oud × 100%',u:'Altijd delen door de oude waarde. Een daling geeft een negatief getal.',
  vb:'Een treinkaartje gaat van € 8,00 naar € 7,60.\n(7,60 − 8,00) / 8,00 × 100% = −5,0%',in:[['oud','Oude waarde'],['nw','Nieuwe waarde']],
  r:x=>`(${nl1(x.nw)} − ${nl1(x.oud)}) / ${nl1(x.oud)} × 100% = <b>${nl1((x.nw-x.oud)/x.oud*100)}%</b>`,g:['procVerandering']},
 {d:'A',n:'Procentpunt',f:'nieuw percentage − oud percentage',u:'Gaat de werkloosheid van 4% naar 3%, dan daalt hij met 1 procentpunt. In procenten is dat (3 − 4) / 4 × 100% = −25%.',
  vb:'Werkloosheid van 4% naar 3%:\nverschil = −1 procentpunt\nprocentuele verandering = −25%',in:[['oud','Oud percentage'],['nw','Nieuw percentage']],
  r:x=>`Verschil: <b>${nl1(x.nw-x.oud)} procentpunt</b>. Procentuele verandering: (${nl1(x.nw)} − ${nl1(x.oud)}) / ${nl1(x.oud)} × 100% = <b>${nl1((x.nw-x.oud)/x.oud*100)}%</b>`,g:['procentpunt']},
 {d:'A',n:'Indexcijfer',f:'waarde nu / waarde in het basisjaar × 100',u:'Het basisjaar is 100. Verschil tussen twee indexcijfers in procenten: (115 − 110) / 110 × 100% = 4,5%, dus niet 5%.',
  vb:'Basisjaar € 50, nu € 45.\n45 / 50 × 100 = 90 (een daling van 10%)',in:[['b','Waarde basisjaar'],['nu','Waarde nu']],
  r:x=>`${nl1(x.nu)} / ${nl1(x.b)} × 100 = <b>${nl1(x.nu/x.b*100)}</b>`,g:['index','indexVerschil']},
 {d:'A',n:'Reëel indexcijfer',f:'nominaal indexcijfer / prijsindexcijfer × 100',u:'Reëel betekent: gecorrigeerd voor prijsstijgingen. Onder 100 is de koopkracht gedaald.',
  vb:'Loonindex 106, prijsindex 111.\n106 / 111 × 100 = 95,5: de koopkracht is 4,5% gedaald.',in:[['nom','Nominaal indexcijfer'],['pr','Prijsindexcijfer']],
  r:x=>`${nl1(x.nom)} / ${nl1(x.pr)} × 100 = <b>${nl1(x.nom/x.pr*100)}</b>`,g:['reeelIndex']},
 {d:'H',n:'Reële groei',f:'(100 + nominale groei) / (100 + inflatie) × 100 − 100',u:'Rekenen met indexcijfers is exact. Bij benadering geldt: reële groei ≈ nominale groei − inflatie.',
  vb:'Nominaal bbp +6%, prijzen +5%.\n106 / 105 × 100 = 101,0, dus 1,0% reële groei.',in:[['nom','Nominale groei (%)'],['inf','Inflatie (%)']],
  r:x=>`(100 + ${nl1(x.nom)}) / (100 + ${nl1(x.inf)}) × 100 = ${nl1((100+x.nom)/(100+x.inf)*100)}, dus <b>${nl1((100+x.nom)/(100+x.inf)*100-100)}%</b>`,g:['reeleGroei']},
 {d:'B',n:'Budgetlijn',f:'budget = P₁ × Q₁ + P₂ × Q₂ · maximaal = budget / prijs',u:'Het snijpunt met een as krijg je door het hele budget aan één product te besteden.',
  vb:'Budget € 120, pizza € 15.\n120 / 15 = 8 pizza\'s als je niets anders koopt.',in:[['bud','Budget (€)'],['p','Prijs per stuk (€)']],
  r:x=>`${eur(x.bud)} / ${eur(x.p)} = <b>${nl1(x.bud/x.p)}</b> stuks`,g:['budgetMax']},
 {d:'B',n:'Alternatieve kosten',f:'wat je opgeeft / wat je ervoor krijgt',u:'Het land of de persoon met de laagste alternatieve kosten heeft het comparatieve voordeel.',
  vb:'Per uur 5 fietsen óf 15 stoelen.\n1 fiets kost 15 / 5 = 3 stoelen.',in:[['op','Wat je opgeeft (aantal)'],['kr','Wat je krijgt (aantal)']],
  r:x=>`${nl1(x.op)} / ${nl1(x.kr)} = <b>${nl1(x.op/x.kr)}</b>`,g:['altKosten','comparatief']},
 {d:'C',n:'Wisselkoers',f:'bedrag in euro = bedrag in vreemde valuta / koers (bij € 1 = koers)',u:'Staat de koers als € 1 = $ 1,10, dan deel je dollars door 1,10 om euro\'s te krijgen en vermenigvuldig je euro\'s met 1,10 voor dollars.',
  vb:'€ 1 = $ 1,10, product kost $ 45.\n45 / 1,10 = € 40,91',in:[['bedr','Bedrag in vreemde valuta'],['k','Koers (€ 1 = …)']],
  r:x=>`${nl1(x.bedr)} / ${String(x.k).replace('.',',')} = <b>${eur(x.bedr/x.k)}</b>`,g:['wisselkoers']},
 {d:'D',n:'Prijselasticiteit van de vraag',f:'Ev = %Δ gevraagde hoeveelheid / %Δ prijs',u:'Ev tussen 0 en −1: inelastisch, een prijsstijging verhoogt de omzet. Ev kleiner dan −1: elastisch, een prijsstijging verlaagt de omzet.',
  vb:'Prijs +4%, gevraagde hoeveelheid −5%.\nEv = −5 / 4 = −1,25: elastisch.',in:[['q','%Δ hoeveelheid'],['p','%Δ prijs']],
  r:x=>{const e=x.q/x.p; return `${nl1(x.q)} / ${nl1(x.p)} = <b>${String(Math.round(e*100)/100).replace('.',',')}</b> · ${Math.abs(e)>1?'elastisch':Math.abs(e)<1?'inelastisch':'precies −1 (omzet maximaal)'}`},g:['elasticiteit','grafTOmax']},
 {d:'D',n:'Marktevenwicht',f:'Qv = Qa, los P op',u:'Vul de evenwichtsprijs daarna in een van de twee functies in voor de evenwichtshoeveelheid.',
  vb:'Qv = −5P + 90 en Qa = 3P + 42.\n−5P + 90 = 3P + 42 → 8P = 48 → P = 6\nQ = −5 × 6 + 90 = 60',in:[['a','Qv: getal voor P (bijv. −5)'],['b','Qv: constante (bijv. 90)'],['c','Qa: getal voor P (bijv. 3)'],['e','Qa: constante (bijv. 42)']],
  r:x=>{const P=(x.e-x.b)/(x.a-x.c); return `${nl1(x.a)}P + ${nl1(x.b)} = ${nl1(x.c)}P + ${nl1(x.e)} → P = <b>${String(Math.round(P*100)/100).replace('.',',')}</b>, Q = <b>${String(Math.round((x.a*P+x.b)*100)/100).replace('.',',')}</b>`},g:['evenwicht','grafEvenwicht']},
 {d:'D',n:'Consumenten- en producentensurplus',f:'CS = ½ × (hoogste prijs vraaglijn − marktprijs) × Q · PS = ½ × (marktprijs − laagste prijs aanbodlijn) × Q',u:'Het consumentensurplus is de driehoek onder de vraaglijn en boven de prijs. Het producentensurplus is de driehoek boven de aanbodlijn en onder de prijs.',
  vb:'Vraaglijn begint bij € 14, aanbodlijn bij € 2, evenwicht P = € 8 en Q = 60.\nCS = ½ × (14 − 8) × 60 = € 180\nPS = ½ × (8 − 2) × 60 = € 180',in:[['pv','Hoogste prijs vraaglijn'],['pa','Laagste prijs aanbodlijn'],['p','Marktprijs'],['q','Hoeveelheid']],
  r:x=>`CS = ½ × (${nl1(x.pv)} − ${nl1(x.p)}) × ${nl1(x.q)} = <b>${eur(.5*(x.pv-x.p)*x.q)}</b> · PS = ½ × (${nl1(x.p)} − ${nl1(x.pa)}) × ${nl1(x.q)} = <b>${eur(.5*(x.p-x.pa)*x.q)}</b>`,g:['grafCS','grafPS','grafAccijns']},
 {d:'D',n:'Kosten, opbrengst en winst',f:'TO = P × Q · TK = TCK + GVK × Q · TW = TO − TK',u:'TCK zijn de constante kosten, GVK de gemiddelde variabele kosten per stuk.',
  vb:'P = € 15, Q = 4.000, GVK = € 5, TCK = € 5.000.\nTO = € 60.000, TK = € 25.000, TW = € 35.000',in:[['p','Prijs (P)'],['q','Afzet (Q)'],['gvk','GVK'],['tck','TCK']],
  r:x=>{const to=x.p*x.q, tk=x.tck+x.gvk*x.q; return `TO = ${eur(to)} · TK = ${eur(tk)} · TW = <b>${eur(to-tk)}</b>`},g:['winst']},
 {d:'D',n:'Break-evenafzet',f:'Q = TCK / (P − GVK)',u:'Bij deze afzet is de winst precies nul. P − GVK is de dekkingsbijdrage per product.',
  vb:'TCK € 30.000, P € 20, GVK € 5.\n30.000 / (20 − 5) = 2.000 stuks',in:[['tck','TCK'],['p','Prijs (P)'],['gvk','GVK']],
  r:x=>`${gt(x.tck)} / (${nl1(x.p)} − ${nl1(x.gvk)}) = <b>${nl1(x.tck/(x.p-x.gvk))}</b> stuks`,g:['breakEven']},
 {d:'D',n:'Winstmaximalisatie (MO = MK)',f:'bij P = aQ + b geldt TO = aQ² + bQ en MO = 2aQ + b',u:'De winst is maximaal waar MO = MK. Vul de hoeveelheid in de prijsafzetfunctie in voor de prijs.',
  vb:'P = −0,5Q + 40 en MK = 12.\nMO = −Q + 40 = 12 → Q = 28, P = −0,5 × 28 + 40 = € 26',in:[['a','a (helling, bijv. −0,5)'],['b','b (constante, bijv. 40)'],['mk','MK']],
  r:x=>{const q=(x.mk-x.b)/(2*x.a); return `2 × ${nl1(x.a)}Q + ${nl1(x.b)} = ${nl1(x.mk)} → Q = <b>${nl1(q)}</b>, P = <b>${eur(x.a*q+x.b)}</b>`},g:['monopolie']},
 {d:'E',n:'Eindwaarde',f:'eindwaarde = K × (1 + r)ⁿ',u:'Rente op rente: elk jaar krijg je ook rente over de rente van eerdere jaren.',
  vb:'€ 2.000, 5% rente, 5 jaar.\n2.000 × 1,05⁵ = € 2.552,56',in:[['k','Bedrag nu (K)'],['r','Rente (%)'],['n','Aantal jaren']],
  r:x=>`${eur(x.k)} × ${nl1(1+x.r/100).replace(/,(\d)$/,',$10')}^${x.n} = <b>${eur(x.k*Math.pow(1+x.r/100,x.n))}</b>`,g:['eindwaarde']},
 {d:'E',n:'Contante waarde',f:'contante waarde = E / (1 + r)ⁿ',u:'Wat is een bedrag in de toekomst nu waard? Je rekent terug met de rente.',
  vb:'€ 5.000 over 10 jaar, rente 5%.\n5.000 / 1,05¹⁰ = € 3.069,57',in:[['e','Bedrag later (E)'],['r','Rente (%)'],['n','Aantal jaren']],
  r:x=>`${eur(x.e)} / (1 + ${nl1(x.r/100)})^${x.n} = <b>${eur(x.e/Math.pow(1+x.r/100,x.n))}</b>`,g:['contanteWaarde']},
 {d:'E',n:'Reële rente',f:'reële rente ≈ nominale rente − inflatie',u:'Exact: (1 + nominale rente) / (1 + inflatie) − 1. Bij lage percentages scheelt dat weinig.',
  vb:'Nominale rente 6%, inflatie 2%.\nReëel ≈ 6 − 2 = 4%',in:[['i','Nominale rente (%)'],['p','Inflatie (%)']],
  r:x=>`≈ ${nl1(x.i)} − ${nl1(x.p)} = <b>${nl1(x.i-x.p)}%</b> (exact ${nl1(((1+x.i/100)/(1+x.p/100)-1)*100)}%)`,g:['reeleRente']},
 {d:'G',n:'Verwachte schade',f:'verwachte schade = kans × schadebedrag',u:'Dit is de zuivere premie. De echte premie is hoger door kosten en winst van de verzekeraar.',
  vb:'Kans 1 op 250, schade € 25.000.\n1/250 × 25.000 = € 100',in:[['k','Kans (bijv. 0,004)'],['s','Schade (€)']],
  r:x=>`${String(x.k).replace('.',',')} × ${eur(x.s)} = <b>${eur(x.k*x.s)}</b>`,g:['verwachteSchade']},
 {d:'H',n:'Arbeidsproductiviteit',f:'productie / arbeid (werknemers of uren)',u:'Stijgt de productie sneller dan de inzet van arbeid, dan stijgt de arbeidsproductiviteit.',
  vb:'250.000 producten, 50 werknemers.\n250.000 / 50 = 5.000 per werknemer',in:[['p','Productie'],['a','Arbeid']],
  r:x=>`${gt(x.p)} / ${gt(x.a)} = <b>${nl1(x.p/x.a)}</b>`,g:['productiviteit']},
 {d:'H',n:'Bbp per inwoner',f:'bbp / aantal inwoners',u:'Let op de nullen: miljard = 10⁹, miljoen = 10⁶.',
  vb:'Bbp € 1.000 miljard, 17 miljoen inwoners.\n1.000 × 10⁹ / 17 × 10⁶ = € 58.824',in:[['b','Bbp (miljard €)'],['i','Inwoners (miljoen)']],
  r:x=>`${nl1(x.b)} miljard / ${nl1(x.i)} miljoen = <b>${eur(x.b*1e9/(x.i*1e6))}</b>`,g:['bbpPerInwoner']},
 {d:'I',n:'Werkloosheidspercentage',f:'werklozen / beroepsbevolking × 100%',u:'De beroepsbevolking is werkenden plus werklozen.',
  vb:'500.000 werklozen, beroepsbevolking 9,5 miljoen.\n500.000 / 9.500.000 × 100% = 5,3%',in:[['w','Werklozen'],['b','Beroepsbevolking']],
  r:x=>`${gt(x.w)} / ${gt(x.b)} × 100% = <b>${nl1(x.w/x.b*100)}%</b>`,g:['werkloosheid']},
 {d:'I',n:'Inflatie',f:'(CPI nu − CPI vorig jaar) / CPI vorig jaar × 100%',u:'Inflatie is de procentuele stijging van het algemeen prijspeil.',
  vb:'CPI van 118 naar 122.\n(122 − 118) / 118 × 100% = 3,4%',in:[['o','CPI vorig jaar'],['n','CPI nu']],
  r:x=>`(${nl1(x.n)} − ${nl1(x.o)}) / ${nl1(x.o)} × 100% = <b>${nl1((x.n-x.o)/x.o*100)}%</b>`,g:['inflatieCpi']},
 {d:'I',n:'Begrotingssaldo in % bbp',f:'saldo / bbp × 100%',u:'Een tekort is negatief. De EU-norm is een tekort van maximaal 3% van het bbp.',
  vb:'Tekort € 25 miljard, bbp € 1.100 miljard.\n−25 / 1.100 × 100% = −2,3%',in:[['s','Saldo (− bij tekort)'],['b','Bbp']],
  r:x=>`${nl1(x.s)} / ${nl1(x.b)} × 100% = <b>${nl1(x.s/x.b*100)}%</b>`,g:['begrotingssaldo']},
];
let fDom='';
SCHERMEN.formules = function(){
  const doms=DOMEINEN.filter(d=>FORMULES.some(f=>f.d===d.id));
  const chips=[['','Alle']].concat(doms.map(d=>[d.id,d.icoon+' '+d.naam])).map(([k,t])=>`<button class="knop ${fDom===k?'':'zacht'} klein" onclick="fDom='${k}';go('formules')">${esc(t)}</button>`).join('');
  const kaarten=FORMULES.map((f,i)=>[f,i]).filter(([f])=>!fDom||f.d===fDom).map(([f,i])=>`<div class="kaart formule">
    <span class="eyebrow" style="color:var(--zacht)">${esc((DOMEINEN.find(d=>d.id===f.d)||{}).naam||'')}</span><h3 style="margin:2px 0 8px">${esc(f.n)}</h3>
    <div class="fbox">${esc(f.f)}</div><p style="margin:8px 0">${esc(f.u)}</p>
    <details><summary>Uitgewerkt voorbeeld</summary><div class="vb">${esc(f.vb)}</div></details>
    <details><summary>Rekenhulp</summary><div class="rh">${f.in.map(([k,l])=>`<label>${esc(l)}<input type="text" inputmode="decimal" data-k="${k}" oninput="rekenhulp(${i},this)"></label>`).join('')}</div><p class="rhUit zacht" id="rh${i}">Vul alle velden in.</p></details>
    ${f.g.length?`<button class="knop zacht klein" style="margin-top:8px" onclick="startFormule(${i})">Oefen met ${f.g.some(g=>g.startsWith('graf'))?'sommen en grafieken':'6 sommen'}</button>`:''}</div>`).join('');
  return `<div class="wrap">${kop('Formulekaart',"go('leren')")}
   <div class="kaart" style="margin-bottom:12px"><p style="margin:0 0 10px">Alle formules die je voor het examen moet kennen, met een uitgewerkt voorbeeld. Met de rekenhulp controleer je je eigen berekening. Oefen daarna met sommen die steeds andere getallen hebben.</p>
   <div class="voet" style="justify-content:flex-start;flex-wrap:wrap;margin:0">${chips}</div><div class="voet" style="justify-content:flex-start;margin:10px 0 0"><button class="knop" onclick="startFormule(-1)">Oefen 10 sommen door elkaar${fDom?' (dit domein)':''}</button></div></div>
   <div class="formules">${kaarten}</div></div>${VOET()}`;
};
function rekenhulp(i,el){ const f=FORMULES[i]; const box=el.closest('.rh'); const x={}; let ok=true;
  box.querySelectorAll('input').forEach(inp=>{ const g=_g(inp.value); if(isNaN(g)) ok=false; x[inp.dataset.k]=g });
  const uit=$('#rh'+i); if(!ok){ uit.innerHTML='Vul alle velden in.'; return }
  let t; try{ t=f.r(x) }catch(e){ t='' } uit.innerHTML=/NaN|Infinity/.test(t)||!t?'Deze getallen kunnen niet (delen door nul?)':t; uit.classList.remove('zacht') }
function startFormule(i){
  const lijst=i>=0?FORMULES[i].g:FORMULES.filter(f=>!fDom||f.d===fDom).flatMap(f=>f.g);
  const n=i>=0?6:10; const v=[]; for(let k=0;k<n;k++) v.push(maakGen(lijst[k%lijst.length]));
  Q={modus:'formule',titel:i>=0?FORMULES[i].n:'Formules oefenen',vragen:shuffle(v),i:0,res:[],terug:"go('formules')"}; go('quiz') }

// ---------- 3. Grafiekvragen: klik op een punt, lijn of gebied ----------
// Vraag- en aanbodlijn als prijsfuncties: vraag P = pv − bv·Q, aanbod P = pa + ba·Q. De leerling klikt; we rekenen in SVG-pixels.
const GR={x0:46,y0:250,w:300,h:226};
function grafMarkt(){
  const Qe=pick([40,50,60]), Pe=pick([6,8,10]), k1=pick([4,6,8]), k2=pick([2,3,4]);
  const m={Qe,Pe,pv:Pe+k1,bv:k1/Qe,pa:Pe-k2,ba:k2/Qe}; m.Qmax=Math.ceil(m.pv/m.bv/10)*10; m.Pmax=m.pv+2; return m }
function grafSvg(m,extra,opts){ opts=opts||{};
  const sx=q=>GR.x0+q/m.Qmax*GR.w, sy=p=>GR.y0-p/m.Pmax*GR.h;
  const lijn=(f,kl,lab,stip)=>{ const pts=[]; for(let q=0;q<=m.Qmax;q+=m.Qmax/60){ const p=f(q); if(p>=0&&p<=m.Pmax) pts.push(sx(q).toFixed(1)+','+sy(p).toFixed(1)) }
    const l=pts[pts.length-1].split(','); return `<polyline points="${pts.join(' ')}" fill="none" stroke="${kl}" stroke-width="3" ${stip?'stroke-dasharray="7 5"':''}/>${lab&&!opts.zonderLabel?`<text x="${+l[0]+4}" y="${+l[1]-4}" font-size="13" font-weight="700" fill="${kl}">${lab}</text>`:''}` };
  let raster=''; for(let p=2;p<=m.Pmax;p+=2) raster+=`<line x1="${GR.x0}" x2="${GR.x0+GR.w}" y1="${sy(p)}" y2="${sy(p)}" class="rast"/><text x="${GR.x0-6}" y="${sy(p)+4}" text-anchor="end" font-size="11" class="as">${p}</text>`;
  const stap=m.Qmax>100?20:10; for(let q=stap;q<=m.Qmax;q+=stap) raster+=`<line y1="${GR.y0}" y2="${GR.y0-GR.h}" x1="${sx(q)}" x2="${sx(q)}" class="rast"/><text x="${sx(q)}" y="${GR.y0+15}" text-anchor="middle" font-size="11" class="as">${q}</text>`;
  const lijnen=(m.vraag!==false?lijn(q=>m.pv-m.bv*q,'#2f7de0','V'):'')+(m.aanbod!==false?lijn(q=>m.pa+m.ba*q,'#e07a2f','A'):'')+(m.t?lijn(q=>m.pa+m.t+m.ba*q,'#e07a2f','A + accijns',true):'');
  return `<svg id="graf" viewBox="0 0 360 280" onclick="grafKlik(event)" role="img" aria-label="Marktdiagram">${raster}
   <line x1="${GR.x0}" y1="${GR.y0}" x2="${GR.x0+GR.w+6}" y2="${GR.y0}" class="ax"/><line x1="${GR.x0}" y1="${GR.y0}" x2="${GR.x0}" y2="${GR.y0-GR.h-8}" class="ax"/>
   <text x="${GR.x0+4}" y="${GR.y0-GR.h-10}" font-size="12" class="as">P (€)</text><text x="${GR.x0+GR.w}" y="${GR.y0+28}" font-size="12" text-anchor="end" class="as">Q (× 1.000)</text>
   ${lijnen}${extra||''}<g id="grafOpl"></g><g id="grafMark"></g></svg>`;
}
const grafPt=(m,q,p)=>[GR.x0+q/m.Qmax*GR.w, GR.y0-p/m.Pmax*GR.h];
function inDriehoek(p,a,b,c){ const s=(p1,p2,p3)=>(p1[0]-p3[0])*(p2[1]-p3[1])-(p2[0]-p3[0])*(p1[1]-p3[1]); const d1=s(p,a,b),d2=s(p,b,c),d3=s(p,c,a); return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0)) }
const dichtbij=(p,q,r)=>Math.hypot(p[0]-q[0],p[1]-q[1])<=(r||16);
const oplPunt=(xy)=>`<circle cx="${xy[0]}" cy="${xy[1]}" r="9" fill="none" stroke="var(--goed)" stroke-width="3"/>`;
const oplVlak=(pts)=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="color-mix(in srgb,var(--goed) 35%,transparent)" stroke="var(--goed)" stroke-width="2"/>`;
Object.assign(GENS,{
  grafEvenwicht(){ const m=grafMarkt(); const e=grafPt(m,m.Qe,m.Pe);
    return {t:'klik',e:'D.vraag',q:'Hieronder zie je de vraaglijn (V) en de aanbodlijn (A) op een markt. Klik op het marktevenwicht.',svg:grafSvg(m),raak:p=>dichtbij(p,e),opl:oplPunt(e),
      juist:`het snijpunt van V en A (P = € ${m.Pe}, Q = ${m.Qe}.000)`,u:'Het evenwicht ligt waar vraag en aanbod gelijk zijn: het snijpunt van de vraaglijn en de aanbodlijn.'} },
  grafCS(){ const m=grafMarkt(); const a=grafPt(m,0,m.pv),b=grafPt(m,0,m.Pe),c=grafPt(m,m.Qe,m.Pe);
    return {t:'klik',e:'D.heffing',q:'Klik in het gebied dat het consumentensurplus aangeeft bij het marktevenwicht.',svg:grafSvg(m),raak:p=>inDriehoek(p,a,b,c),opl:oplVlak([a,b,c]),
      juist:'de driehoek onder de vraaglijn en boven de evenwichtsprijs',u:`Consumentensurplus = ½ × (${m.pv} − ${m.Pe}) × ${m.Qe}.000 = ${eur(.5*(m.pv-m.Pe)*m.Qe*1000)}. Consumenten hadden meer willen betalen dan de marktprijs.`} },
  grafPS(){ const m=grafMarkt(); const a=grafPt(m,0,m.pa),b=grafPt(m,0,m.Pe),c=grafPt(m,m.Qe,m.Pe);
    return {t:'klik',e:'D.heffing',q:'Klik in het gebied dat het producentensurplus aangeeft bij het marktevenwicht.',svg:grafSvg(m),raak:p=>inDriehoek(p,a,b,c),opl:oplVlak([a,b,c]),
      juist:'de driehoek boven de aanbodlijn en onder de evenwichtsprijs',u:`Producentensurplus = ½ × (${m.Pe} − ${m.pa}) × ${m.Qe}.000 = ${eur(.5*(m.Pe-m.pa)*m.Qe*1000)}. Producenten krijgen meer dan de prijs waarvoor ze minimaal wilden leveren.`} },
  grafPrijsbeleid(){ const m=grafMarkt(); const max=Math.random()<.5; const Pm=max?Math.max(m.pa+1,m.Pe-pick([1,2])):m.Pe+pick([1,2]);
    const qa=(Pm-m.pa)/m.ba, qv=(m.pv-Pm)/m.bv, q=max?qa:qv; const xy=grafPt(m,q,Pm);
    const st=`<line x1="${GR.x0}" x2="${GR.x0+GR.w}" y1="${xy[1]}" y2="${xy[1]}" stroke="#d64f7a" stroke-width="2" stroke-dasharray="6 5"/><text x="${GR.x0+GR.w}" y="${xy[1]-5}" text-anchor="end" font-size="12" fill="#d64f7a" font-weight="700">${max?'maximumprijs':'minimumprijs'}</text>`;
    return {t:'klik',e:'D.falen',q:`De overheid stelt een ${max?'maximumprijs':'minimumprijs'} in (de stippellijn). Klik op het punt dat aangeeft hoeveel er dan op de markt wordt verhandeld.`,svg:grafSvg(m,st),raak:p=>dichtbij(p,xy),opl:oplPunt(xy),
      juist:`het snijpunt van de stippellijn met de ${max?'aanbodlijn':'vraaglijn'} (Q = ${nl1(q).replace(/,0$/,'')}.000)`,
      u:max?'Bij een maximumprijs onder het evenwicht willen producenten minder leveren: de aanbodlijn bepaalt hoeveel er verhandeld wordt. Er ontstaat een tekort.':'Bij een minimumprijs boven het evenwicht willen consumenten minder kopen: de vraaglijn bepaalt hoeveel er verhandeld wordt. Er ontstaat een overschot.'} },
  grafAccijns(){ const m=grafMarkt(); m.t=pick([2,3,4]); const q=(m.pv-m.pa-m.t)/(m.bv+m.ba), p=m.pv-m.bv*q; const xy=grafPt(m,q,p);
    return {t:'klik',e:'D.heffing',q:`De overheid heft een accijns van € ${m.t} per product. De aanbodlijn verschuift daardoor omhoog (stippellijn). Klik op het nieuwe marktevenwicht.`,svg:grafSvg(m),raak:p2=>dichtbij(p2,xy),opl:oplPunt(xy),
      juist:`het snijpunt van de vraaglijn met de nieuwe aanbodlijn (P ≈ € ${nl1(p)})`,u:`De accijns komt bovenop de prijs waarvoor producenten willen leveren. Het nieuwe evenwicht ligt op de vraaglijn, bij een hogere prijs en een lagere hoeveelheid. De consument betaalt een deel van de accijns.`} },
  grafLijn(){ const m=grafMarkt(); const aanbod=Math.random()<.5; const f=aanbod?(q=>m.pa+m.ba*q):(q=>m.pv-m.bv*q);
    const raak=p=>{ for(let q=0;q<=m.Qmax;q+=m.Qmax/200){ const P=f(q); if(P>=0&&P<=m.Pmax&&dichtbij(p,grafPt(m,q,P),12)) return true } return false };
    const opl=`<polyline points="${Array.from({length:61},(_,i)=>i*m.Qmax/60).filter(q=>f(q)>=0&&f(q)<=m.Pmax).map(q=>grafPt(m,q,f(q)).join(',')).join(' ')}" fill="none" stroke="var(--goed)" stroke-width="7" opacity=".5"/>`;
    return {t:'klik',e:'D.vraag',q:`De namen staan er niet bij. Klik op de ${aanbod?'aanbodlijn':'vraaglijn'}.`,svg:grafSvg(m,'',{zonderLabel:true}),raak,opl,
      juist:aanbod?'de stijgende lijn':'de dalende lijn',u:aanbod?'De aanbodlijn stijgt: bij een hogere prijs willen producenten meer leveren.':'De vraaglijn daalt: bij een hogere prijs vragen consumenten minder.'} },
  grafTOmax(){ const m=grafMarkt(); m.aanbod=false; const q=m.pv/m.bv/2, p=m.pv/2; const xy=grafPt(m,q,p);
    return {t:'klik',e:'D.elas',q:'Hieronder staat alleen de vraaglijn. Klik op het punt van de vraaglijn waar de totale omzet (P × Q) het grootst is.',svg:grafSvg(m),raak:p2=>dichtbij(p2,xy,18),opl:oplPunt(xy),
      juist:`het midden van de vraaglijn (P = € ${nl1(p)}, Q = ${nl1(q).replace(/,0$/,'')}.000)`,u:'In het midden van een rechte vraaglijn is de prijselasticiteit −1. Daarboven is de vraag elastisch, daaronder inelastisch. De omzet is daar maximaal.'} },
});
const GRAF_GENS=['grafEvenwicht','grafCS','grafPS','grafPrijsbeleid','grafAccijns','grafLijn','grafTOmax'];
function grafKlik(ev){ if(!Q||Q.fase!=='vraag') return; const v=Q.vragen[Q.i]; if(v.t!=='klik') return;
  const svg=$('#graf'); const pt=svg.createSVGPoint(); pt.x=ev.clientX; pt.y=ev.clientY; const p=pt.matrixTransform(svg.getScreenCTM().inverse());
  antw=[p.x,p.y]; $('#grafMark').innerHTML=`<circle cx="${p.x}" cy="${p.y}" r="7" fill="var(--knop)" stroke="#fff" stroke-width="2"/>`; $('#ok').disabled=false }
function startGrafiek(){ const v=shuffle(GRAF_GENS.concat(pick([GRAF_GENS]))).slice(0,8).map(maakGen); Q={modus:'formule',titel:'Grafiektraining',vragen:v,i:0,res:[],terug:"go('leren')"}; go('quiz') }
const _nakijkenG=nakijken; nakijken=function(v,a){ if(v.t==='klik') return !!a&&v.raak(a); return _nakijkenG(v,a) };
const _juistG=juistTekst; juistTekst=function(v){ return v.t==='klik'?v.juist:_juistG(v) };

// ---------- 4. Proeftoets per hoofdstuk ----------
const PROEF_N=15;
function proefGroepen(){ const out=[]; WERELDEN.forEach(w=>{ const m={}; lvsVoor(w.id).filter(l=>l.hfd).forEach(l=>{ (m[l.hfd]=m[l.hfd]||[]).push(l) });
  Object.entries(m).forEach(([hfd,lvs])=>{ const n=lvs.reduce((a,l)=>a+l.vragen.filter(autoNakijk).length,0); if(n>=8) out.push({key:w.id+'|'+hfd,w:w.id,hfd,lvs,n}) }) }); return out }
function startProef(key){ const g=proefGroepen().find(x=>x.key===key); if(!g){ melding('Deze toets is er niet'); return }
  let pool=shuffle(g.lvs.flatMap(l=>l.vragen.filter(autoNakijk).map(v=>Object.assign({w:g.w,l:l.id},v)))).slice(0,PROEF_N);
  const gens=[...new Set(g.lvs.flatMap(l=>l.gens||[]))]; if(gens.length&&pool.length>=PROEF_N) pool.splice(-2,2,maakGen(pick(gens)),maakGen(pick(gens)));
  pool.forEach(v=>delete v._mix);
  Q={modus:'proef',geenFb:true,titel:'Proeftoets · '+g.hfd,key,w:g.w,vragen:shuffle(pool),i:0,res:[],terug:"go('proef')",start:Date.now(),eind:Date.now()+pool.length*75*1000};
  go('quiz'); startKlok() }
let klokTimer=null;
function startKlok(){ clearInterval(klokTimer); klokTimer=setInterval(()=>{ if(scherm!=='quiz'||!Q||!Q.eind||Q.modus==='sprint'){ clearInterval(klokTimer); return }
  const s=Math.max(0,Math.round((Q.eind-Date.now())/1000)); const el=$('#klok'); if(el){ el.textContent=`⏱️ ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; el.classList.toggle('bijna',s<60) }
  if(s<=0){ clearInterval(klokTimer); Q.tijdOp=true; while(Q.res.length<Q.vragen.length) Q.res.push(false); klaar() } },1000) }
const _tekenVraagX=tekenVraag;
tekenVraag=function(){ _tekenVraagX(); const v=Q.vragen[Q.i];
  if(Q.eind&&Q.modus!=='sprint'){ const t=$('#qz .top .chip'); if(t) t.insertAdjacentHTML('beforebegin','<span class="chip" id="klok">⏱️</span>') }
  if(v.t==='klik'){ $('#fb').insertAdjacentHTML('beforebegin',`<div class="graf">${v.svg}</div><p class="zacht" style="font-size:14px;margin:4px 0 0">Tik of klik in de grafiek. Je kunt je keuze aanpassen tot je op Controleer drukt.</p>`) } };
const _afrondenX=afronden;
afronden=function(v){ const g=v.t==='klik'?$('#grafOpl'):null; _afrondenX(v); if(g&&g.isConnected&&!Q.geenFb) g.innerHTML=v.opl };
const _klaarX=klaar;
klaar=function(){ clearInterval(klokTimer); if(Q&&Q.modus==='proef') return proefUitslag(); return _klaarX() };
const cijferVan=(p,max)=>Math.max(1,Math.min(10,Math.round((1+9*p/Math.max(1,max))*10)/10));
const cijferTxt=c=>c.toFixed(1).replace('.',',');
function proefUitslag(){
  oefenActief=false; const n=Q.res.filter(Boolean).length, tot=Q.vragen.length, c=cijferVan(n,tot);
  if(!S.pt) S.pt={}; const r=S.pt[Q.key]||{b:0,n:0}; r.n++; r.b=Math.max(r.b||0,c); r.l=c; r.t=Date.now(); S.pt[Q.key]=r;
  if(c>=5.5) S.mVerd+=c>=8?10:5; checkBadges(); bewaar(); sync();
  const fout=Q.vragen.filter((v,i)=>!Q.res[i]); const per={}; fout.forEach(v=>{ const k=(EINDTERMEN[v.e]||{}).t||'Overig'; per[k]=(per[k]||0)+1 });
  const min=Math.round((Math.min(Date.now(),Q.eind)-Q.start)/60000);
  app().innerHTML=`<div class="wrap" style="max-width:680px"><div class="kaart mid"><div class="cijfer ${c>=5.5?'vold':'onv'}">${cijferTxt(c)}</div>
    <h2 style="margin:6px 0">${n} van ${tot} goed</h2><p class="zacht">${esc(Q.titel.replace('Proeftoets · ',''))} · ${Q.tijdOp?'de tijd was om':`klaar in ${min} minuten`} · je beste cijfer ${cijferTxt(r.b)}</p>
    ${c>=5.5?'<p>Voldoende! '+(c>=8?'+10':'+5')+' munten</p>':'<p>Nog niet voldoende. Kijk hieronder waar het misging en oefen die onderwerpen.</p>'}
    <div class="voet" style="justify-content:center"><button class="knop zacht" onclick="go('proef')">Terug</button><button class="knop" onclick="startProef('${esc(Q.key)}')">Nieuwe proeftoets</button>${fout.length?`<button class="knop zacht" onclick="startHerhaal()">Oefen je fouten</button>`:''}</div></div>
   ${fout.length?`<div class="sectie">Hier ging het mis</div><div class="kaart">${Object.entries(per).sort((a,b)=>b[1]-a[1]).map(([k,x])=>`<div class="rij"><span style="flex:1">${esc(k)}</span><b>${x} fout</b></div>`).join('')}</div>
   <div class="sectie">Uitleg bij je fouten</div><div class="kaart">${fout.map(v=>`<div class="rij" style="display:block"><b>${esc(v.q)}</b><br>Juist: <b>${esc(juistTekst(v))}</b>${v.u?`<br><span class="zacht">${esc(v.u)}</span>`:''}</div>`).join('')}</div>`:''}</div>`;
  scherm='resultaat'; nav();
}
SCHERMEN.proef = function(){
  const gr=proefGroepen(); const pt=S.pt||{};
  const blok=WERELDEN.map(w=>{ const l=gr.filter(g=>g.w===w.id); if(!l.length) return '';
    return `<div class="sectie">${w.icoon} Domein ${w.nr} · ${esc(w.naam)}</div><div class="kaart">${l.map(g=>{ const r=pt[g.key];
      return `<button class="lv" onclick="startProef('${esc(g.key)}')"><span class="med">${r?(r.b>=5.5?'✅':'📝'):'⏱️'}</span><span style="flex:1"><b>${esc(g.hfd)}</b><small>${Math.min(PROEF_N,g.n)} vragen · ${Math.round(Math.min(PROEF_N,g.n)*1.25)} minuten${r?` · beste cijfer ${cijferTxt(r.b)} · laatste ${cijferTxt(r.l)} · ${r.n}× gemaakt`:''}</small></span>${r?`<span class="cijfer klein ${r.b>=5.5?'vold':'onv'}">${cijferTxt(r.b)}</span>`:'<span class="zacht">›</span>'}</button>` }).join('')}</div>` }).join('');
  return `<div class="wrap" style="max-width:760px">${kop('Proeftoets per hoofdstuk',"go('leren')")}
   <div class="kaart" style="margin-bottom:6px"><p style="margin:0">Een toets zoals in de klas: ${PROEF_N} vragen uit één hoofdstuk, ongeveer 1 minuut per vraag. Je ziet pas aan het eind wat goed en fout was. Je krijgt een cijfer van 1 tot 10. Foute vragen komen in je herhaalronde.</p></div>
   ${blok||'<div class="kaart"><p class="zacht" style="margin:0">Er zijn nog geen hoofdstukken met genoeg vragen voor jouw niveau.</p></div>'}</div>${VOET()}`;
};

// ---------- 6. Examen op tijd ----------
// Een heel examen op één pagina, met 180 minuten (zoals het echte centraal examen). Daarna kijkt de leerling alles na met het
// antwoordmodel (meerkeuze gaat vanzelf) en krijgt een cijferschatting. S.exvol = het examen dat bezig is, S.exr = uitslagen.
const EX_MIN=180;
const exvVragen = c => exVragen().filter(v=>v.ex===c&&!/\.\d+\.\d+$/.test(v.id)).sort((a,b)=>a.nr-b.nr);
const exvMax = l => l.reduce((a,v)=>a+(v.pnt||1),0);
let exvTimer=null, exvSave=null;
function exTijdLijst(){ const r=S.exr||{};
  return `<div class="kaart" style="margin-bottom:12px"><p style="margin:0">Maak een heel examen onder examenomstandigheden: alle vragen op één pagina en ${EX_MIN} minuten, net als op de echte examendag. Je antwoorden worden steeds bewaard, maar de klok loopt door. Na het inleveren kijk je alles na met het antwoordmodel en krijg je een cijferschatting.</p></div>
   <div class="kaart">${exLijst().map(({c})=>{ const l=exvVragen(c); const x=r[c]; const bezig=S.exvol&&S.exvol.c===c;
     return `<button class="lv" onclick="go('exvol','${c}')"><span class="med">${bezig?'✍️':x?'✅':'🎓'}</span><span style="flex:1"><b>Examen ${exNaam(c)}</b><small>${l.length} vragen · ${exvMax(l)} punten${bezig?' · <b>bezig</b>':''}${x?` · laatste keer ${x.p} van ${x.m} punten, cijfer ± ${cijferTxt(x.cf)}`:''}</small></span>${x?`<span class="cijfer klein ${x.cf>=5.5?'vold':'onv'}">${cijferTxt(x.cf)}</span>`:'<span class="zacht">›</span>'}</button>` }).join('')}</div>`; }
SCHERMEN.exvol = function(c){
  c=c||(S.exvol||{}).c; const l=exvVragen(c||''); if(!l.length) return `<div class="wrap">${kop('Examen op tijd',"go('examen')")}<div class="kaart"><p style="margin:0">Dit examen is niet gevonden.</p></div></div>`;
  const E=S.exvol&&S.exvol.c===c?S.exvol:null;
  if(!E) return `<div class="wrap" style="max-width:680px">${kop('Examen '+exNaam(c),"exTab='tijd';go('examen')")}<div class="kaart">
    <p style="margin-top:0"><b>${l.length} vragen · ${exvMax(l)} punten · ${EX_MIN} minuten</b></p>
    <ul><li>Je ziet alle vragen op één pagina, met de teksten en bronnen erbij.</li><li>Schrijf je antwoorden zoals op het echte examen. Ze worden steeds bewaard, ook als je de app sluit.</li><li>De klok loopt door, ook als je even weggaat. Is de tijd om, dan wordt het examen ingeleverd.</li><li>Daarna kijk je alles na met het antwoordmodel en krijg je een cijferschatting.</li></ul>
    ${S.exvol?`<p class="zacht">Let op: je bent nog bezig met examen ${exNaam(S.exvol.c)}. Als je dit examen start, vervalt dat.</p>`:''}
    <label class="label"><input type="checkbox" id="exvExtra"> Ik heb recht op extra tijd (30 minuten)</label>
    <div class="voet"><button class="knop" onclick="exvStart('${c}')">Start het examen</button></div></div></div>`;
  if(E.fase==='uitslag') return exvUitslag(c,l,E);
  const nakijk=E.fase==='nakijken';
  let vorigeCtx='', vorigeTitel='';
  const blokken=l.map((v,i)=>{ let h='';
    if(v.titel&&v.titel!==vorigeTitel){ h+=`<h2 class="exvOpgave">${esc(v.titel)}</h2>`; vorigeTitel=v.titel }
    if(v.ctx&&v.ctx!==vorigeCtx){ h+=`<div class="exvCtx">${fmt(v.ctx)}</div>`; vorigeCtx=v.ctx }
    const imgs=(v.img||[]).map(s=>`<button class="knop zacht klein" onclick="exvImg(${i},'${s}')">${s.includes('-b-')?'📊 Informatiebron':'📄 Examenpagina'}</button>`).join(' ');
    const a=E.antw[v.id];
    let inv;
    if(v.t==='ex') inv=`<div class="opties">${v.o.map((o,k)=>`<button class="optie ${a===k?'kies':''} ${nakijk?(k===v.a?'goed':a===k?'fout':''):''}" ${nakijk?'disabled':''} onclick="exvMc(${i},${k})"><span class="l">${'ABCDE'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
    else inv=nakijk?`<div class="exvMijn">${a?esc(a):'<span class="zacht">Geen antwoord gegeven.</span>'}</div>`:`<textarea rows="4" oninput="exvTyp(${i},this.value)" placeholder="Je antwoord">${esc(a||'')}</textarea>`;
    return h+`<div class="kaart exvVraag" id="exv${i}"><div class="exvKop"><b>Vraag ${v.nr}</b><span class="zacht">${v.pnt||1}p</span>${nakijk?`<span class="exvPnt" id="exvP${i}"></span>`:''}</div>
      ${imgs?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${imgs}</div><div id="exvImg${i}"></div>`:''}
      <div class="vraag lang">${fmt(v.q,true)}</div>${inv}${nakijk?exvNakijkBlok(v,i,E):''}</div>`; }).join('');
  const nB=l.filter(v=>E.antw[v.id]!=null&&E.antw[v.id]!=='').length;
  const balk=nakijk?`<div class="exvBalk"><b>Nakijken</b><span id="exvTot"></span><span style="flex:1"></span><button class="knop klein" onclick="exvKlaar('${c}')">Klaar met nakijken</button></div>`
    :`<div class="exvBalk"><b id="exKlok">⏱️</b><span class="zacht" id="exvN">${nB} van ${l.length} beantwoord</span><span style="flex:1"></span><button class="knop zacht klein" onclick="go('home')">Pauze</button><button class="knop klein" onclick="if(confirm('Weet je zeker dat je wilt inleveren?'))exvInleveren()">Inleveren</button></div>`;
  return `<div class="wrap" style="max-width:860px"><div class="exvTitel"><span class="eyebrow">Centraal examen</span><h1>Economie ${exNaam(c)}</h1>${nakijk?'<p>Kijk elke vraag na met het antwoordmodel. Meerkeuzevragen zijn al nagekeken. Vink per deelscore aan wat er in je antwoord staat, of kies het aantal punten.</p>':''}</div>${balk}${blokken}
   <div class="voet" style="justify-content:center;margin:20px 0">${nakijk?`<button class="knop" onclick="exvKlaar('${c}')">Klaar met nakijken</button>`:`<button class="knop" onclick="if(confirm('Weet je zeker dat je wilt inleveren?'))exvInleveren()">Inleveren</button>`}</div></div>`;
};
SCHERMEN.exvol_na = function(){ const E=S.exvol; clearInterval(exvTimer); if(!E) return;
  if(E.fase==='maken'){ const tik=()=>{ if(scherm!=='exvol'){ clearInterval(exvTimer); return } const s=Math.max(0,Math.round((E.eind-Date.now())/1000)); const el=$('#exKlok');
      if(el){ el.textContent=`⏱️ ${Math.floor(s/3600)}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; el.classList.toggle('bijna',s<600) }
      if(s<=0){ clearInterval(exvTimer); melding('De tijd is om. Je examen is ingeleverd.',4000); exvInleveren() } };
    tik(); exvTimer=setInterval(tik,1000) }
  if(E.fase==='nakijken') exvTel() };
function exvStart(c){ const extra=$('#exvExtra')&&$('#exvExtra').checked; S.exvol={c,start:Date.now(),eind:Date.now()+(EX_MIN+(extra?30:0))*60000,antw:{},pnt:{},fase:'maken'}; bewaar(); go('exvol',c) }
function exvBewaar(){ clearTimeout(exvSave); exvSave=setTimeout(()=>bewaar(false),800) }
function exvTyp(i,t){ const E=S.exvol; const v=exvVragen(E.c)[i]; E.antw[v.id]=t; exvBewaar(); exvTelB() }
function exvMc(i,k){ const E=S.exvol; if(E.fase!=='maken') return; const v=exvVragen(E.c)[i]; E.antw[v.id]=k; document.querySelectorAll(`#exv${i} .optie`).forEach((b,j)=>b.classList.toggle('kies',j===k)); exvBewaar(); exvTelB() }
function exvTelB(){ const E=S.exvol, l=exvVragen(E.c); const el=$('#exvN'); if(el) el.textContent=`${l.filter(v=>E.antw[v.id]!=null&&E.antw[v.id]!=='').length} van ${l.length} beantwoord` }
function exvImg(i,s){ const b=$('#exvImg'+i); if(!b) return; if(b.dataset.s===s){ b.innerHTML=''; b.dataset.s=''; return } b.dataset.s=s;
  b.innerHTML=`<div style="overflow:auto;max-height:70vh;border:1px solid var(--lijn);border-radius:12px;margin-bottom:10px;background:#fff"><img src="${EX_IMG}${s}.jpg" alt="Examenpagina" style="width:100%;display:block"></div>` }
function exvInleveren(){ const E=S.exvol; if(!E) return; clearInterval(exvTimer); E.fase='nakijken'; E.ingeleverd=Date.now();
  exvVragen(E.c).forEach(v=>{ if(v.t==='ex') E.pnt[v.id]=E.antw[v.id]===v.a?(v.pnt||1):0 }); bewaar(); go('exvol',E.c) }
function exvNakijkBlok(v,i,E){
  if(v.t==='ex') return `<div class="fb ${E.antw[v.id]===v.a?'goed':'fout'}"><b>${E.antw[v.id]===v.a?'Goed':'Fout'}.</b> Het juiste antwoord is ${'ABCDE'[v.a]}.</div>`;
  const ds=v.pnt?deelscoresVan(v):null; const tekst=String(E.antw[v.id]||''); const p=E.pnt[v.id];
  let ui;
  if(ds){ const gekozen=E.deel&&E.deel[v.id];
    ui=`<div class="deelscores">${ds.map((d,k)=>{ const g=uitkomstVan(d.t); const auto=bevatGetal(tekst,g); const aan=gekozen?gekozen.includes(k):auto;
      return `<label class="deel"><input type="checkbox" ${aan?'checked':''} onchange="exvDeel(${i})"><span>${esc(d.t.replace(/^(Een juist antwoord bevat|Een juiste (berekening|uitleg|verklaring) is|Uit het antwoord moet blijken)( dat)?:?\s*/i,''))} <b class="zacht">(${d.p}p)</b>${auto?`<br><small class="auto">🤖 De computer vond ${esc(g)} in je antwoord</small>`:''}</span></label>` }).join('')}</div>`;
    if(p==null){ E.pnt[v.id]=ds.reduce((a,d,k)=>a+(bevatGetal(tekst,uitkomstVan(d.t))?d.p:0),0) } }
  else ui=`<div class="voet" style="justify-content:flex-start;flex-wrap:wrap;margin-top:8px">${Array.from({length:(v.pnt||1)+1},(_,k)=>k).map(k=>`<button class="knop klein ${p===k?'':'zacht'}" onclick="exvPunt(${i},${k})">${k} punt${k===1?'':'en'}</button>`).join('')}</div>`;
  return `<details class="exvModel" open><summary>Antwoordmodel</summary><div>${fmt(ds?String(v.model).split(/\n\s*Puntenverdeling:?/)[0]:v.model)}</div></details>${ui}`;
}
function exvDeel(i){ const E=S.exvol, v=exvVragen(E.c)[i]; const ds=deelscoresVan(v); const box=$('#exv'+i); const aan=[...box.querySelectorAll('.deelscores input')].map((x,k)=>x.checked?k:-1).filter(k=>k>=0);
  E.deel=E.deel||{}; E.deel[v.id]=aan; E.pnt[v.id]=aan.reduce((a,k)=>a+ds[k].p,0); exvBewaar(); exvTel() }
function exvPunt(i,k){ const E=S.exvol, v=exvVragen(E.c)[i]; E.pnt[v.id]=k; $('#exv'+i).querySelectorAll('.voet .knop').forEach((b,j)=>b.classList.toggle('zacht',j!==k)); exvBewaar(); exvTel() }
function exvTel(){ const E=S.exvol, l=exvVragen(E.c); let p=0, open=0; l.forEach((v,i)=>{ const x=E.pnt[v.id]; if(x==null) open++; else p+=x; const el=$('#exvP'+i); if(el) el.innerHTML=x==null?'<span class="zacht">nog nakijken</span>':`<b>${x} van ${v.pnt||1}</b>` });
  const t=$('#exvTot'); if(t) t.innerHTML=`${p} van ${exvMax(l)} punten${open?` · nog ${open} vragen nakijken`:''}`; return {p,open} }
function exvKlaar(c){ const E=S.exvol, l=exvVragen(c); const {p,open}=exvTel(); if(open&&!confirm(`Je hebt ${open} vragen nog niet nagekeken. Die tellen als 0 punten. Toch afronden?`)) return;
  const m=exvMax(l), cf=cijferVan(p,m);
  l.forEach(v=>{ const x=E.pnt[v.id]||0, mx=v.pnt||1; const kopie=Object.assign({},v); if(v.t==='open') kopie._pt={p:x,max:mx}; registreer(kopie,x>=mx) });
  if(!S.exr) S.exr={}; const minuten=Math.round(((E.ingeleverd||Date.now())-E.start)/60000);
  S.exr[c]={p,m,cf,t:Date.now(),min:minuten}; E.fase='uitslag'; E.p=p; E.m=m; E.cf=cf; E.min=minuten;
  S.mVerd+=cf>=5.5?25:10; checkBadges(); bewaar(); sync(); go('exvol',c) }
function exvUitslag(c,l,E){
  const perD={}; l.forEach(v=>{ const d=perD[v.d]||(perD[v.d]={p:0,m:0}); d.p+=E.pnt[v.id]||0; d.m+=v.pnt||1 });
  const doms=Object.entries(perD).map(([d,x])=>{ const D=DOMEINEN.find(y=>y.id===d)||{naam:d,icoon:''}; const pc=Math.round(x.p/x.m*100); return `<div class="domein"><span>${D.icoon}</span><div><small>${esc(D.naam)} · ${x.p} van ${x.m}</small><div class="balk"><i style="width:${pc}%;background:${pc>=75?'var(--goed)':pc>=50?'var(--goud)':'var(--fout)'}"></i></div></div><span class="pct">${pc}</span></div>` }).join('');
  return `<div class="wrap" style="max-width:680px">${kop('Examen '+exNaam(c),"exTab='tijd';go('examen')")}<div class="kaart mid"><div class="cijfer ${E.cf>=5.5?'vold':'onv'}">${cijferTxt(E.cf)}</div>
   <h2 style="margin:6px 0">${E.p} van ${E.m} punten</h2><p class="zacht">Gemaakt in ${E.min} minuten. Cijferschatting met normering N = 1,0. De echte normering verschilt per examen, meestal tussen 0,8 en 1,5.</p>
   <div class="voet" style="justify-content:center"><button class="knop zacht" onclick="S.exvol=null;bewaar();exTab='tijd';go('examen')">Terug naar de examens</button><button class="knop" onclick="S.exvol=null;bewaar();startHerhaal()">Oefen je fouten</button></div></div>
   <div class="sectie">Punten per domein</div><div class="kaart">${doms}</div></div>`;
}

// ---------- Foutenschrift ----------
// Alle vragen die de leerling ooit fout had, gegroepeerd per leerdoel (eindterm/onderwerp). 'Open' = nog niet weggewerkt:
// staat nog in de herhaalronde (leerling) of vaker fout dan goed (docent). Rekensommen met wisselende getallen tellen per soort.
function foutGroepen(vr, herhaal){
  const g={};
  Object.entries(vr||{}).forEach(([id,r])=>{ if(!r||!r.f) return; let v;
    if(id.startsWith('gen.')){ try{ v=maakGen(id.slice(4)) }catch(e){ return } } else v=vraagById(id);
    if(!v||!v.e) return; const open=herhaal&&!v.gen?herhaal.includes(id):r.f>(r.g||0);
    (g[v.e]=g[v.e]||{e:v.e,items:[]}).items.push({id,v,r,open}) });
  return Object.values(g).map(x=>{ x.items.sort((a,b)=>(b.open-a.open)||(b.r.f-a.r.f)); x.open=x.items.filter(i=>i.open).length; x.tot=x.items.length; return x })
    .sort((a,b)=>b.open-a.open||b.tot-a.tot);
}
const ldNaam = e => (EINDTERMEN[e]||{}).t||e;
const ldDomein = e => DOMEINEN.find(d=>d.id===(EINDTERMEN[e]||{}).d)||{icoon:'',naam:''};
let fsAlles=false;
SCHERMEN.fouten = function(){
  const gr=foutGroepen(S.vr,S.herhaal).filter(x=>fsAlles||x.open);
  const nOpen=gr.reduce((a,x)=>a+x.open,0);
  const item=i=>{ const v=i.v; const q=v.gen?'Rekensom: '+v.q:v.q;
    return `<div class="rij fsItem" style="display:block"><div style="display:flex;gap:8px;align-items:baseline"><span>${i.open?'🔴':'✅'}</span><span style="flex:1">${esc(q.length>260?q.slice(0,260)+'…':q)}</span></div>
     <div class="zacht" style="font-size:13px;margin:2px 0 0 26px">${i.r.f}× fout${i.r.g?' · '+i.r.g+'× goed':''}${v.w==='ex'&&v.jaar?` · examen ${v.jaar} tijdvak ${v.tv} vraag ${v.nr}`:''}${i.open?'':' · weggewerkt'}</div>
     <div style="margin:4px 0 0 26px;font-size:14px">${v.t==='open'?`<details><summary style="cursor:pointer;color:var(--acc);font-weight:700">Antwoordmodel</summary>${fmt(v.model||'')}</details>`:`Juist: <b>${esc(v.gen?'(steeds andere getallen)':String(juistTekst(v)))}</b>${v.u?`<br><span class="zacht">${esc(v.u)}</span>`:''}`}</div></div>` };
  const blok=gr.map(x=>{ const D=ldDomein(x.e), sc=etScore(x.e);
    const items=x.items.filter(i=>fsAlles||i.open);
    return `<div class="kaart fsLd" style="margin-bottom:12px"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span style="font-size:26px">${D.icoon}</span>
      <span style="flex:1;min-width:200px"><span class="zacht" style="font-size:13px">${esc(D.naam)} · leerdoel</span><br><b>${esc(ldNaam(x.e))}</b></span>
      <span style="text-align:right"><b style="color:${x.open?'var(--fout)':'var(--goed)'}">${x.open} open</b><br><span class="zacht" style="font-size:13px">${x.tot} ooit fout${sc!=null?' · score '+sc:''}</span></span></div>
      <div class="voet" style="justify-content:flex-start;flex-wrap:wrap;margin:10px 0 4px">${x.open?`<button class="knop klein" onclick="startFoutLd('${x.e}')">Oefen deze foute vragen</button>`:''}<button class="knop zacht klein" onclick="${x.e.startsWith('EX.')?`startExDomein('${x.e.slice(3)}')`:`startEindterm('${x.e}')`}">Nieuwe vragen over dit leerdoel</button></div>
      <details ${gr.length<=3?'open':''}><summary style="cursor:pointer;font-weight:700">Bekijk de ${items.length} vragen</summary>${items.map(item).join('')}</details></div>` }).join('');
  return `<div class="wrap" style="max-width:860px">${kop('Foutenschrift',"go('leren')")}
   <div class="kaart" style="margin-bottom:14px"><p style="margin:0 0 8px">Hier staan alle vragen die je fout had, per leerdoel. Bovenaan staan de leerdoelen waar je nog de meeste fouten open hebt: daar moet je dus specifiek aan werken. Een fout is weggewerkt als je de vraag daarna twee keer goed hebt.</p>
   <p style="margin:0 0 10px"><b>${nOpen}</b> fouten nog open, verdeeld over <b>${gr.filter(x=>x.open).length}</b> leerdoelen.</p>
   <div class="voet" style="justify-content:flex-start;flex-wrap:wrap;margin:0"><label class="label" style="margin:0"><input type="checkbox" ${fsAlles?'checked':''} onchange="fsAlles=this.checked;go('fouten')"> Ook weggewerkte fouten tonen</label><span style="flex:1"></span><button class="knop zacht klein" onclick="document.querySelectorAll('.fsLd details').forEach(d=>d.open=true);window.print()">Afdrukken</button></div></div>
   ${blok||'<div class="kaart"><p class="zacht" style="margin:0">Nog geen fouten. Goed bezig, of nog niet genoeg geoefend!</p></div>'}</div>${VOET()}`;
};
function startFoutLd(e){ const gr=foutGroepen(S.vr,S.herhaal).find(x=>x.e===e); if(!gr) return;
  const v=gr.items.filter(i=>i.open).map(i=>i.v.gen?maakGen(i.id.slice(4)):i.v).slice(0,12).map(x=>{ const c=Object.assign({},x); delete c._mix; return c });
  Q={modus:'herhaal',titel:'Foutenschrift · '+ldNaam(e),vragen:shuffle(v),i:0,res:[],terug:"go('fouten')"}; go('quiz') }
// voor het docentendashboard: compact overzicht per leerdoel
function foutenschriftDocent(s){ const gr=foutGroepen(s.vr); if(!gr.length) return '<p class="zacht" style="margin:0">Nog geen fouten.</p>';
  return gr.slice(0,15).map(x=>{ const D=ldDomein(x.e); const sc=etPct((s.et||{})[x.e]);
    return `<details class="rij" style="display:block"><summary style="cursor:pointer;display:flex;gap:10px;align-items:center"><span>${D.icoon}</span><span style="flex:1;font-size:14px">${esc(ldNaam(x.e))}</span><b style="color:${x.open?'var(--fout)':'var(--goed)'}">${x.open} open</b><span class="zacht" style="font-size:13px;min-width:70px;text-align:right">${x.tot} ooit fout</span>${dc(sc)}</summary>
     ${x.items.slice(0,8).map(i=>`<div style="font-size:13px;margin:4px 0 0 30px">${i.open?'🔴':'✅'} ${esc((i.v.gen?'Rekensom: ':'')+(i.v.q.length>180?i.v.q.slice(0,180)+'…':i.v.q))} <span class="zacht">(${i.r.f}× fout${i.r.g?', '+i.r.g+'× goed':''})</span></div>`).join('')}</details>` }).join('') }

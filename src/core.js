// ===== Instellingen =====
// URL van het Apps Script (web-app, eindigt op /exec). Leeg = alleen opslag op dit apparaat (testmodus).
const DATA_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbwV3G5c62GrNdCaRJ1mYkD1U4AVyC-K48KHPt3GDfSP5Ib6zwaP4p4VNVuECXmM9faPzA/exec";
const KLASSEN = ['H4','H5','V4','V5','V6'];  // klassen waaruit leerlingen kiezen (eerste letter H = havo, V = vwo)
const KEY = 'ecohv-v1';                  // opslagsleutel op het apparaat
const VERSIE = '0.1';
const VRAGEN_PER_LEVEL = 8;
const MEDAIL = [{n:'brons',e:'🥉',min:6,m:5},{n:'zilver',e:'🥈',min:7,m:10},{n:'goud',e:'🥇',min:8,m:20}];
const TOETS_VRAGEN = 15;
const IDLE_MS = 90*1000;                 // na 90 s zonder tikken telt oefentijd niet meer

// ===== Niveau en levels =====
const niveauVan = klas => /^v/i.test(String(klas||'')) ? 'v' : 'h';
const niv = () => niveauVan(S&&S.klas);
const klasLabel = k => { const m=/^([HV])(\d)$/i.exec(k||''); return m ? m[2]+' '+(m[1].toUpperCase()==='V'?'vwo':'havo') : (k||'') };
const vakLabel = () => 'Economie '+(S&&S.klas?klasLabel(S.klas):'havo/vwo');
const speelbaar = l => l.vragen.length>0 || (l.gens||[]).length>0;
// alle levels van een wereld voor een niveau (n leeg = alle niveaus). Een level of vraag met niv:'v' is alleen voor vwo.
function lvsVoor(w, n=niv()){ return (LEVELS[w]||[]).filter(l=>!n||!l.niv||l.niv===n).map(l=>{ if(!n||!l.vragen.some(v=>v.niv)) return l; return Object.assign({},l,{vragen:l.vragen.filter(v=>!v.niv||v.niv===n)}) }) }

// ===== Hulpfuncties =====
const $ = (s,el=document)=>el.querySelector(s);
// Opmaak van vraag-, context- en antwoordtekst: regels met ' | ' worden een tabel, '- …' / '• …' een lijst, de rest alinea's.
// De opdrachtzin (Bereken…, Leg uit…) wordt vet.
const OPDRACHT=/^(Bereken|Leg|Verklaar|Toon|Geef|Noem|Beargumenteer|Laat|Bepaal|Licht|Onderbouw|Schrijf|Beschrijf|Welke|Wat|Waarom|Hoe|Is |Zal |Zijn |Heeft |Kies|Vul|Teken|Ga |Maak|Vergelijk)/;
const NOOT=/^(Opmerking|Aanvulling|indien )/;
function fmt(t, opdracht){
  if(t==null||t==='') return ''; const L=String(t).split('\n'); let out='', i=0;
  const rij=l=>/\S \| \S/.test(l), item=l=>/^\s*[-•−–]\s+/.test(l);
  while(i<L.length){ const l=L[i];
    if(rij(l)&&i+1<L.length&&rij(L[i+1])){ const rows=[]; while(i<L.length&&rij(L[i])) rows.push(L[i++].split('|').map(c=>c.trim()));
      out+=`<div class="vtabel"><table>${rows.map((r,k)=>`<tr>${r.map(c=>k===0?`<th>${esc(c)}</th>`:`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`; continue }
    if(item(l)){ const it=[]; while(i<L.length&&item(L[i])){ const bol=/^\s*•/.test(L[i]); let x=L[i++].replace(/^\s*[-•−–]\s+/,'');
        // bij '•'-deelscores horen de regels eronder (berekeningen) nog bij hetzelfde punt
        while(bol&&i<L.length&&L[i].trim()&&!item(L[i])&&!NOOT.test(L[i].trim())&&!/\(\dp?\)\s*$/.test(x)) x+=' '+L[i++].trim();
        it.push(x) }
      out+=`<ul class="vlijst">${it.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`; continue }
    const x=l.trim(); i++; if(!x) continue;
    if(/^Tabel\b|^(Doe het als volgt|Puntenverdeling)/.test(x)) out+=`<p class="vkop">${esc(x)}</p>`;
    else if(NOOT.test(x)) out+=`<p class="vnoot">${esc(x)}</p>`;
    else out+=`<p${opdracht&&OPDRACHT.test(x)?' class="vopdracht"':''}>${esc(x)}</p>`;
  }
  return `<div class="vtekst">${out}</div>`;
}
// Deelscores uit het antwoordmodel: '• … (1p)' of '• … (1)'. Alleen bruikbaar als ze samen precies het maximum geven.
function deelscoresVan(v){ const ds=[];
  const L=String(v.model||'').split('\n');
  for(let i=0;i<L.length;i++){ if(!/^\s*•/.test(L[i])) continue; let x=L[i];
    while(!/\(\dp?\)\s*$/.test(x)&&i+1<L.length&&L[i+1].trim()&&!/^\s*[•−–-]\s/.test(L[i+1])&&!NOOT.test(L[i+1].trim())) x+=' '+L[++i].trim();
    const m=x.match(/^\s*•\s*(.+?)\s*\((\d)p?\)\s*$/); if(m) ds.push({t:m[1],p:+m[2]}) }
  return ds.length>1&&ds.reduce((a,b)=>a+b.p,0)===v.pnt?ds:null }
// getal waarop een rekenstap uitkomt (na het laatste '='), om in het antwoord van de leerling te zoeken
const normGetal = x => String(x).replace(/−/g,'-').replace(/(\d)\.(?=\d{3}\b)/g,'$1');
function uitkomstVan(t){ const m=[...normGetal(t).matchAll(/=\s*(?:€|\$)?\s*(-?\d+(?:,\d+)?)/g)]; return m.length?m[m.length-1][1]:null }
function bevatGetal(tekst,g){ if(!g||!tekst) return false; const re=new RegExp('(^|[^\\d,])'+g.replace('-','-?').replace(',','[,.]')+'(?![\\d])'); return re.test(normGetal(tekst)) }

const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const duiz = s => s.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const eur = x => '€ '+(x<0?'−':'')+(()=>{const [h,d]=Math.abs(x).toFixed(2).split('.'); return duiz(h)+','+d})();
const gt = x => (x<0?'−':'')+duiz(String(Math.round(Math.abs(x))));
const nl1 = x => { const [h,d]=Math.abs(x).toFixed(1).split('.'); return (x<=-0.05?'−':'')+duiz(h)+','+d };
const vandaag = ()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function weekId(d=new Date()){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const dn=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-dn);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return t.getUTCFullYear()+'-W'+String(Math.ceil(((t-y)/864e5+1)/7)).padStart(2,'0')}
const minuten = s => Math.round((s||0)/60);
function parseGetal(s){ if(s==null) return NaN; s=String(s).trim().replace(/[−–]/g,'-').replace(/[€%\s]/g,''); if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s=s.replace(/\./g,''); s=s.replace(',','.'); return s===''?NaN:Number(s) }

// ===== Toestand van de leerling =====
// Alles wat alleen kan groeien (tijd, aantallen, medailles) wordt bij samenvoegen met max/union gecombineerd,
// zodat een oud apparaat nooit nieuwe voortgang kan overschrijven.
function nieuweStaat(){
  return {v:1, id:'', code:'', naam:'', klas:'', upd:0, aangemaakt:Date.now(),
    xp:0, mVerd:0, mUit:0, tijd:0, dag:{}, week:{},
    lv:{}, toets:{}, vr:{}, et:{}, kaarten:[], badges:[], gekocht:['standaard'], thema:'standaard', herhaal:[], hgoed:{}}
}
let S = null;

const UNION = new Set(['kaarten','badges','gekocht']);
function merge(a,b){
  // b is de nieuwste (hoogste upd) bij gelijke velden die niet kunnen groeien
  if(a===undefined||a===null) return b; if(b===undefined||b===null) return a;
  if(typeof a==='number'&&typeof b==='number') return Math.max(a,b);
  if(Array.isArray(a)&&Array.isArray(b)) return b;
  if(typeof a==='object'&&typeof b==='object'){
    const o={}; for(const k of new Set([...Object.keys(a),...Object.keys(b)])){
      if(UNION.has(k)&&Array.isArray(a[k])&&Array.isArray(b[k])) o[k]=[...new Set([...a[k],...b[k]])];
      else if(k==='et') o[k]=mergeEt(a[k],b[k]);
      else o[k]=merge(a[k],b[k]);
    } return o;
  }
  return b;
}
function mergeEt(a,b){ // per eindterm een lijstje recente resultaten; neem de langste/nieuwste
  a=a||{}; b=b||{}; const o={};
  for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const x=a[k]||{n:0,r:[]},y=b[k]||{n:0,r:[]};o[k]=(y.n>=x.n)?y:x}
  return o;
}
function mergeStaat(oud,nieuw){ // oud en nieuw in willekeurige volgorde
  const [x,y] = (oud.upd||0)<=(nieuw.upd||0)?[oud,nieuw]:[nieuw,oud];
  const m = merge(x,y); m.upd=Math.max(x.upd||0,y.upd||0); return m;
}

function laad(){
  try{ const r=localStorage.getItem(KEY); if(r) S=Object.assign(nieuweStaat(),JSON.parse(r)); }catch(e){ S=null }
  if(!S){ try{ const r=localStorage.getItem(KEY+'-reserve'); if(r) S=Object.assign(nieuweStaat(),JSON.parse(r)); }catch(e){} }
}
let vuil=false;
function bewaar(sync=true){
  S.upd=Date.now();
  try{ const oud=localStorage.getItem(KEY); if(oud) localStorage.setItem(KEY+'-reserve',oud); localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){}
  if(sync){ vuil=true; planSync(); }
}
const munten = ()=>Math.max(0,(S.mVerd||0)-(S.mUit||0));

// ===== Server (Apps Script) =====
const serverModus = ()=>!!DATA_ENDPOINT_URL;
let syncStatus = 'lokaal', syncTimer=null, bezig=false;
async function api(actie, data){
  const r = await fetch(DATA_ENDPOINT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({actie},data))});
  const j = await r.json(); if(!j.ok) throw new Error(j.fout||'Serverfout'); return j;
}
function planSync(ms=4000){ if(!serverModus()||!S||!S.id) return; clearTimeout(syncTimer); syncTimer=setTimeout(sync,ms) }
async function sync(){
  if(!serverModus()||!S||!S.id||bezig) return; bezig=true;
  try{
    const j = await api('sync',{id:S.id, code:S.code, staat:S});
    const terug = j.staat; S = mergeStaat(S, terug); S.id=terug.id||S.id; S.code=S.code||terug.code;
    try{ localStorage.setItem(KEY,JSON.stringify(S)) }catch(e){}
    vuil=false; syncStatus='ok'; syncTijd=Date.now();
  }catch(e){ syncStatus='fout'; syncFout=e.message; planSync(60000) }
  bezig=false; toonSyncStatus && toonSyncStatus();
}
let syncTijd=0, syncFout='';
let toonSyncStatus=null;
window.addEventListener('online',()=>planSync(500));
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'&&vuil) sync(); });

// ===== Oefentijd =====
let laatsteTik=Date.now(), oefenActief=false;
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>laatsteTik=Date.now(),{passive:true}));
setInterval(()=>{
  if(!S||!oefenActief||document.visibilityState!=='visible'||Date.now()-laatsteTik>IDLE_MS) return;
  S.tijd=(S.tijd||0)+5; const d=vandaag(), w=weekId();
  S.dag[d]=(S.dag[d]||0)+5; S.week[w]=(S.week[w]||0)+5;
  if(S.tijd%60===0) bewaar(); else { try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){} }
},5000);

// ===== Rekengeneratoren (elke keer nieuwe getallen) =====
// Vorm: {t:'reken', e:onderwerp, q:vraag, a:antwoord, eh:'€'|'%'|'', u:uitleg}. Geld op 2 decimalen, de rest op 1 decimaal.
const r1 = x => Math.round(x*10)/10, r2 = x => Math.round(x*100)/100;
const GENS = {
  // --- A Vaardigheden ---
  procVerandering(){ const oud=pick([8,12,15,20,24,40,50,80]), f=pick([1.05,1.08,1.1,1.15,1.2,0.9,0.85,0.95]); const nieuw=r2(oud*f), p=r1((nieuw-oud)/oud*100); const wat=pick(['Een bioscoopkaartje','Een pizza','Een treinkaartje','Een knipbeurt']); return {t:'reken', e:'A.proc', q:`${wat} kostte ${eur(oud)} en kost nu ${eur(nieuw)}. Met hoeveel procent is de prijs veranderd? (een daling is negatief)`, a:p, eh:'%', u:`((nieuw − oud) / oud) × 100% = ((${nl1(nieuw)} − ${nl1(oud)}) / ${nl1(oud)}) × 100% = ${nl1(p)}%.`} },
  procentpunt(){ const x=pick([4,5,8,10]), y=x+pick([-2,-1,1,2,3]); const p=r1((y-x)/x*100); return {t:'reken', e:'A.proc', q:`De werkloosheid gaat van ${x}% naar ${y}% van de beroepsbevolking. Met hoeveel procent is het werkloosheidspercentage veranderd? (dus niet in procentpunten, een daling is negatief)`, a:p, eh:'%', u:`Het verschil is ${y-x} procentpunt. In procenten: (${y} − ${x}) / ${x} × 100% = ${nl1(p)}%.`} },
  indexVerschil(){ const i1=pick([104,108,110,112,115,120]), i2=i1+pick([3,5,6,8,10,12]); const p=r1((i2-i1)/i1*100); return {t:'reken', e:'A.index', q:`Het prijsindexcijfer (2015 = 100) is in 2020 ${i1} en in 2024 ${i2}. Met hoeveel procent zijn de prijzen gestegen tussen 2020 en 2024?`, a:p, eh:'%', u:`Niet ${i2-i1}%! Reken: (${i2} − ${i1}) / ${i1} × 100% = ${nl1(p)}%.`} },
  index(){ const b=pick([20,25,40,50,80,200]), f=pick([1.04,1.1,1.12,1.25,0.9,1.3]); const v=r2(b*f), ix=r1(v/b*100); return {t:'reken', e:'A.index', q:`Een product kostte in het basisjaar ${eur(b)} en nu ${eur(v)}. Wat is het indexcijfer nu? (zonder %)`, a:ix, eh:'', u:`Indexcijfer = (nu / basisjaar) × 100 = (${nl1(v)} / ${b}) × 100 = ${nl1(ix)}.`} },
  reeelIndex(){ const L=pick([104,106,108,110,112,115]), P=pick([102,103,105,107,109,111,114]); const R=r1(L/P*100); return {t:'reken', e:'A.reeel', q:`Het indexcijfer van het nominale loon is ${L} en het prijsindexcijfer is ${P} (zelfde basisjaar = 100). Bereken het indexcijfer van het reële loon.`, a:R, eh:'', u:`Reëel = nominaal / prijs × 100 = ${L} / ${P} × 100 = ${nl1(R)}. ${R<100?'De koopkracht is gedaald.':'De koopkracht is gestegen.'}`} },
  // --- B Schaarste ---
  budgetMax(){ const px=pick([8,12,15,20,25]), k=pick([6,8,10,12,15]), I=px*k; const wat=pick(['bioscoopkaartjes','concertkaartjes','boeken','pizza\'s']); return {t:'reken', e:'B.budget', q:`Je hebt een budget van ${eur(I)}. Een van je ${wat} kost ${eur(px)}. Hoeveel kun je er maximaal kopen als je niets anders koopt? (dat is het snijpunt van je budgetlijn met de as)`, a:k, eh:'', u:`Budget / prijs = ${eur(I)} / ${eur(px)} = ${k}.`} },
  altKosten(){ const px=pick([6,9,12,15,20]), py=pick([3,4,5,6,8]); const a=r1(px/py); return {t:'reken', e:'B.keuze', q:`Een sportschoolbezoek kost ${eur(px)} en een kop koffie ${eur(py)}. Wat zijn de alternatieve kosten van één sportschoolbezoek, uitgedrukt in koppen koffie?`, a, eh:'', u:`Alternatieve kosten = wat je opgeeft: ${eur(px)} / ${eur(py)} = ${nl1(a)} koppen koffie.`} },
  // --- C Ruil ---
  comparatief(){ const x=pick([2,4,5,10]), y=pick([3,6,8,12,15]); const a=r1(y/x); return {t:'reken', e:'C.spec', q:`Een werknemer in land P maakt per uur ${x} fietsen óf ${y} stoelen. Wat zijn in land P de alternatieve kosten van 1 fiets, uitgedrukt in stoelen?`, a, eh:'', u:`Voor 1 fiets geef je ${y} / ${x} = ${nl1(a)} stoelen op. Het land met de laagste alternatieve kosten heeft het comparatieve voordeel.`} },
  wisselkoers(){ const k=pick([1.05,1.08,1.1,1.12,1.2,1.25]), p=pick([30,45,60,80,120,250]); const a=r2(p/k); return {t:'reken', e:'C.intl', q:`De wisselkoers is € 1 = $ ${String(k).replace('.',',')}. Een Amerikaans product kost $ ${p}. Hoeveel euro is dat?`, a, eh:'€', u:`Dollars delen door de koers: ${p} / ${String(k).replace('.',',')} = ${eur(a)}.`} },
  // --- D Markt ---
  elasticiteit(){ const dp=pick([2,4,5,8,10]), dq=-pick([2,3,4,5,6,8,10,12,15,20]); const a=r1(dq/dp); return {t:'reken', e:'D.elas', q:`De prijs van een product stijgt met ${dp}%. De gevraagde hoeveelheid daalt daardoor met ${-dq}%. Bereken de prijselasticiteit van de vraag.`, a, eh:'', u:`Ev = %Δ gevraagde hoeveelheid / %Δ prijs = ${dq} / ${dp} = ${nl1(a)}. ${Math.abs(a)>1?'Elastisch: de vraag reageert sterk.':Math.abs(a)<1?'Inelastisch: de vraag reageert zwak.':'Precies 1: proportioneel.'}`} },
  evenwicht(){ const P=pick([4,5,6,8,10,12]), a=pick([2,4,5,10]), c=pick([2,3,5,6]), Q=pick([40,60,80,100,120]); const b=Q+a*P, d=c*P-Q; const qa=d>=0?`${c}P − ${d}`:`${c}P + ${-d}`; return {t:'reken', e:'D.vraag', q:`Op een markt geldt: Qv = −${a}P + ${b} en Qa = ${qa} (P in euro's). Bereken de evenwichtsprijs.`, a:P, eh:'€', u:`Stel Qv = Qa: −${a}P + ${b} = ${qa}. Dan ${a+c}P = ${b+d}, dus P = ${eur(P)}. De evenwichtshoeveelheid is ${Q}.`} },
  breakEven(){ const p=pick([12,15,20,25,30]), gvk=pick([4,5,6,8,10]); const n=pick([500,800,1000,1200,2000]); const tck=n*(p-gvk); return {t:'reken', e:'D.kosten', q:`Een bedrijf heeft ${eur(tck)} constante kosten. De prijs is ${eur(p)} per stuk en de variabele kosten zijn ${eur(gvk)} per stuk. Bij welke afzet is de winst precies nul (break-evenafzet)?`, a:n, eh:'', u:`Break-evenafzet = TCK / (P − GVK) = ${gt(tck)} / (${p} − ${gvk}) = ${gt(n)} stuks.`} },
  monopolie(){ const b=pick([40,50,60,80,100]), c=pick([10,12,16,20,24]); const Q=b-c, P=r2(-0.5*Q+b); return {t:'reken', e:'D.vorm', q:`Een monopolist heeft de prijsafzetfunctie P = −0,5Q + ${b} (Q in duizenden). De marginale kosten zijn constant ${eur(c)}. Bij welke Q is de winst maximaal?`, a:Q, eh:'', u:`TO = P × Q = −0,5Q² + ${b}Q, dus MO = −Q + ${b}. MO = MK geeft −Q + ${b} = ${c}, dus Q = ${Q} (duizend). De prijs is dan ${eur(P)}.`} },
  winst(){ const p=pick([8,10,15,20]), q=pick([1000,2000,2500,4000]), gvk=pick([3,4,5,6]), tck=pick([5000,8000,10000,12000]); const w=p*q-(tck+gvk*q); return {t:'reken', e:'D.kosten', q:`Prijs ${eur(p)}, afzet ${gt(q)} stuks, variabele kosten ${eur(gvk)} per stuk en constante kosten ${eur(tck)}. Bereken de winst (een verlies is negatief).`, a:w, eh:'€', u:`TO = ${p} × ${gt(q)} = ${eur(p*q)}. TK = ${gt(tck)} + ${gvk} × ${gt(q)} = ${eur(tck+gvk*q)}. Winst = TO − TK = ${eur(w)}.`} },
  // --- E Ruilen over de tijd ---
  eindwaarde(){ const K=pick([1000,2000,2500,5000]), r=pick([2,3,4,5]), n=pick([2,3,5,10]); const a=r2(K*Math.pow(1+r/100,n)); return {t:'reken', e:'E.waarde', q:`Je zet ${eur(K)} op een spaarrekening met ${r}% rente per jaar (rente op rente). Hoeveel staat er na ${n} jaar op de rekening?`, a, eh:'€', u:`Eindwaarde = K × (1 + r)ⁿ = ${gt(K)} × ${String(1+r/100).replace('.',',')}^${n} = ${eur(a)}.`} },
  contanteWaarde(){ const E=pick([1000,5000,10000,20000]), r=pick([2,3,4,5]), n=pick([2,3,5,10]); const a=r2(E/Math.pow(1+r/100,n)); return {t:'reken', e:'E.waarde', q:`Over ${n} jaar ontvang je ${eur(E)}. De rente is ${r}% per jaar. Wat is de contante waarde van dat bedrag nu?`, a, eh:'€', u:`Contante waarde = E / (1 + r)ⁿ = ${gt(E)} / ${String(1+r/100).replace('.',',')}^${n} = ${eur(a)}.`} },
  reeleRente(){ const n=pick([2,3,4,4.5,5,6]), i=pick([1,1.5,2,2.5,3,4,7]); const a=r1(n-i); return {t:'reken', e:'E.rente', q:`De nominale rente is ${nl1(n)}% en de inflatie is ${nl1(i)}%. Hoe hoog is de reële rente bij benadering? (negatief kan)`, a, eh:'%', u:`Reële rente ≈ nominale rente − inflatie = ${nl1(n)} − ${nl1(i)} = ${nl1(a)}%.`} },
  // --- G Risico en informatie ---
  verwachteSchade(){ const N=pick([50,100,200,250,500]), S0=pick([1000,2000,5000,10000,25000]); const a=r2(S0/N); return {t:'reken', e:'G.risico', q:`De kans dat je fiets in een jaar gestolen wordt is 1 op ${N}. Een nieuwe fiets kost ${eur(S0)}. Hoe groot is de verwachte schade per jaar?`, a, eh:'€', u:`Verwachte schade = kans × schade = 1/${N} × ${gt(S0)} = ${eur(a)}. Dit is de 'zuivere' premie, zonder kosten en winst van de verzekeraar.`} },
  // --- H Welvaart en groei ---
  reeleGroei(){ const n=pick([3,4,5,6,7,8]), p=pick([1,2,3,4,5]); const a=r1(((1+n/100)/(1+p/100)-1)*100); return {t:'reken', e:'H.groei', q:`Het nominale bbp groeit met ${n}% en het prijspeil stijgt met ${p}%. Bereken de reële groei van het bbp met indexcijfers (1 decimaal).`, a, eh:'%', u:`Reëel = ${100+n} / ${100+p} × 100 = ${nl1(a+100)}. De reële groei is dus ${nl1(a)}%.`} },
  productiviteit(){ const w=pick([40,50,80,100,125]), f=pick([1.02,1.04,1.05,1.08]); const P0=pick([2,4,5])*w*1000; const P1=Math.round(P0*f); const a=r1((P1/w-P0/w)/(P0/w)*100); return {t:'reken', e:'H.groei', q:`Een fabriek met ${w} werknemers maakte vorig jaar ${gt(P0)} producten en dit jaar ${gt(P1)}, met evenveel werknemers. Met hoeveel procent is de arbeidsproductiviteit gestegen?`, a, eh:'%', u:`Productiviteit = productie / werknemers: ${gt(P0/w)} → ${nl1(P1/w)}. Stijging = ${nl1(a)}%.`} },
  bbpPerInwoner(){ const bbp=pick([800,900,1000,1100]), inw=pick([16,17,17.5,18,20]); const a=Math.round(bbp*1e9/(inw*1e6)); return {t:'reken', e:'H.bbp', q:`Het bbp van een land is € ${bbp} miljard en het land heeft ${nl1(inw).replace(/,0$/,'')} miljoen inwoners. Bereken het bbp per inwoner in hele euro's.`, a, eh:'€', u:`${bbp} miljard / ${nl1(inw).replace(/,0$/,'')} miljoen = ${eur(a)} per inwoner. Let op de nullen: miljard = 10⁹, miljoen = 10⁶.`} },
  // --- I Goede tijden, slechte tijden ---
  werkloosheid(){ const bb=pick([9.5,9.8,10,10.2]), wl=pick([350,380,420,450,500,600]); const a=r1(wl/(bb*1000)*100); return {t:'reken', e:'I.werk', q:`De beroepsbevolking is ${nl1(bb)} miljoen personen en er zijn ${wl}.000 werklozen. Bereken het werkloosheidspercentage.`, a, eh:'%', u:`Werklozen / beroepsbevolking × 100% = ${wl}.000 / ${nl1(bb)} miljoen × 100% = ${nl1(a)}%.`} },
  inflatieCpi(){ const c1=pick([110,115,118,120,125]), c2=c1+pick([2,3,4,5,8,10]); const a=r1((c2-c1)/c1*100); return {t:'reken', e:'I.infl', q:`De consumentenprijsindex (CPI) was vorig jaar ${c1} en is dit jaar ${c2}. Hoe hoog is de inflatie?`, a, eh:'%', u:`Inflatie = (${c2} − ${c1}) / ${c1} × 100% = ${nl1(a)}%.`} },
  begrotingssaldo(){ const bbp=pick([900,1000,1050,1100]), s=-pick([10,20,25,30,35,40,50]); const a=r1(s/bbp*100); return {t:'reken', e:'I.beleid', q:`De overheid heeft een begrotingstekort van € ${-s} miljard. Het bbp is € ${gt(bbp)} miljard. Hoe groot is het begrotingssaldo in procenten van het bbp? (tekort is negatief)`, a, eh:'%', u:`Saldo / bbp × 100% = −${-s} / ${gt(bbp)} × 100% = ${nl1(a)}%. De EU-norm is een tekort van maximaal 3%.`} }
};
Object.assign(GENS, GENS_EXTRA);
function maakGen(naam){ const v=GENS[naam](); v.id='gen.'+naam; v.gen=true; return v }

// ===== Vragenbank =====
function alleVragen(){ const out=[]; for(const w in LEVELS){ for(const l of LEVELS[w]) for(const v of l.vragen) out.push(Object.assign({w,l:l.id,lniv:l.niv},v)); } if(typeof EXAMEN!=='undefined') for(const v of EXAMEN.vragen) out.push(Object.assign({w:'ex'},v)); return out }
const vrNiv = v => (!v.niv||v.niv===niv()) && (!v.lniv||v.lniv===niv());
let _vmap=null; function vraagById(id){ if(!_vmap){_vmap={}; for(const v of alleVragen()) _vmap[v.id]=v} return _vmap[id] }

function nakijken(v, antw){
  if(v.t==='mc'||v.t==='ex') return antw===v.a;
  if(v.t==='wo') return antw===v.a;
  if(v.t==='open') return antw===true||(!!antw&&antw.max>0&&antw.p>=antw.max);
  if(v.t==='koppel') return v.p.every((p,i)=>antw[i]===p[1]);
  if(v.t==='reken'){ const x=parseGetal(antw); if(isNaN(x)) return false; const tol = v.eh==='€'?0.011:0.051; return Math.abs(x-v.a)<=tol }
  return false;
}
// kaarten die een vraag oplevert: het begrip b, en bij koppelvragen elk begrip uit de paren dat een kaart is
let _alleKaarten=null;
function kaartenVan(v){ if(!_alleKaarten){ _alleKaarten=new Set(); for(const w in LEVELS) Object.keys(LEVELS[w].begrippen||{}).forEach(k=>_alleKaarten.add(k)) }
  const c=[v.b].concat(v.t==='koppel'?v.p.flat():[]); return [...new Set(c.filter(k=>k&&_alleKaarten.has(k)))] }
function registreer(v, goed){
  if(!v.gen){ const r=S.vr[v.id]||{g:0,f:0}; goed?r.g++:r.f++; r.t=Date.now(); S.vr[v.id]=r; }
  else { const k=v.id; const r=S.vr[k]||{g:0,f:0}; goed?r.g++:r.f++; S.vr[k]=r; }
  if(v._pt&&!v.gen){ S.vr[v.id].pt=v._pt.p; S.vr[v.id].max=v._pt.max }
  if(v.e){ const et=S.et[v.e]||{n:0,r:[]}; et.r=et.r.concat(v._pt?Math.round(v._pt.p/v._pt.max*100)/100:(goed?1:0)).slice(-20); et.n++; S.et[v.e]=et; }
  let nieuweKaart=false;
  if(goed){ S.xp+=10; S.mVerd+=1; const nw=kaartenVan(v).filter(k=>!S.kaarten.includes(k)); if(nw.length){ S.kaarten.push(...nw); nieuweKaart=nw } }
  // herhaalronde: foute vragen komen terug, na 2× goed verdwijnen ze
  if(!v.gen){
    if(!goed){ if(!S.herhaal.includes(v.id)) S.herhaal.push(v.id); S.hgoed[v.id]=0; }
    else if(S.herhaal.includes(v.id)){ S.hgoed[v.id]=(S.hgoed[v.id]||0)+1; if(S.hgoed[v.id]>=2){ S.herhaal=S.herhaal.filter(x=>x!==v.id); delete S.hgoed[v.id]; } }
  }
  return nieuweKaart;
}
function etScore(code){ const et=S.et[code]; if(!et||et.r.length<3) return null; let s=0,w=0; et.r.forEach((x,i)=>{const g=i+1; s+=x*g; w+=g}); return Math.round(s/w*100) }
function domeinScore(d){ const sc=Object.keys(EINDTERMEN).filter(k=>EINDTERMEN[k].d===d).map(etScore).filter(x=>x!==null); return sc.length?Math.round(sc.reduce((a,b)=>a+b,0)/sc.length):null }
function medaille(score){ let m=null; for(const x of MEDAIL) if(score>=x.min) m=x; return m }

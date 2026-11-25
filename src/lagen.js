// ===== Lagen: kern (examen), methode (toets) en verdieping =====
// Elk begrip heeft per niveau een laag (BEGRIP_LAAG, gemaakt door tools/hoofdstukken.py uit hoofdstukken/lagen.txt).
//  k = kern: examenstof, altijd in flitskaarten en eindtermoefeningen, weegt het zwaarst
//  m = methode: nodig voor de schooltoets, komt terug bij het hoofdstuk, de proeftoets en in de toetsmodus
//  v = verdieping: alleen als de leerling 'verdieping' aanzet
// Oefenmodus: 'examen' (alleen kern) of 'toets' (kern en methode). De docent zet een standaard per klas (S.kmodus,
// komt van de server), de leerling kan die zelf aanpassen (S.lmodus: 'klas', 'examen' of 'toets').
const LAGEN = { k:{n:'Kern',i:'🎯',u:'examenstof'}, m:{n:'Methode',i:'📘',u:'voor de toets'}, v:{n:'Verdieping',i:'🔭',u:'extra'} };
const LAAG_GEWICHT = { k:3, m:2, v:1 };
function _laagKaart(){ return typeof BEGRIP_LAAG!=='undefined' ? BEGRIP_LAAG : {h:{},v:{}} }
// laag van een begrip voor het niveau van de leerling; null = begrip hoort niet bij dit niveau
function laagVan(k, n=niv()){ const L=_laagKaart(); if(L[n]&&L[n][k]) return L[n][k]; const ander=n==='v'?'h':'v'; return (L[ander]&&L[ander][k]) ? null : 'm' }
const standaardModus = () => /^(H5|V6)$/i.test(kijkKlas()||'') ? 'examen' : 'toets';
function klasModus(){ return (S&&(S.kmodus==='examen'||S.kmodus==='toets')) ? S.kmodus : standaardModus() }
function oefenModus(){ return (S&&(S.lmodus==='examen'||S.lmodus==='toets')) ? S.lmodus : klasModus() }
const verdiepingAan = () => !!(S&&S.verd===1);
// telt een vraag of begrip mee in examengerichte onderdelen (flitskaarten, eindtermen)?
function laagTelt(lg){ if(!lg||lg==='k') return true; if(lg==='v') return verdiepingAan(); return oefenModus()==='toets' }
function zetModus(m){ S.lmodus=m; bewaar(); go(scherm, typeof arg!=='undefined'?arg:undefined) }
function zetVerdieping(aan){ S.verd=aan?1:0; bewaar(); go(scherm, typeof arg!=='undefined'?arg:undefined) }
const modusNaam = m => m==='examen' ? 'Examenmodus' : 'Toetsmodus';

// keuzeblok voor de leerling (op Leren en bij de flitskaarten)
function modusKeuze(){
  const m=oefenModus(), eigen=S.lmodus==='examen'||S.lmodus==='toets';
  const knop=(w,t,s)=>`<button class="knop ${m===w?'':'zacht'} klein" onclick="zetModus('${w}')" title="${esc(s)}">${t}</button>`;
  return `<div class="kaart modus" style="margin-bottom:14px"><b>Oefenmodus: ${modusNaam(m)}</b>
   <p class="zacht" style="margin:4px 0 10px;font-size:14px">${m==='examen'?'Je oefent alleen de kernbegrippen: de stof van het centraal examen.':'Je oefent de kernbegrippen én de begrippen uit de methode die je voor de schooltoets nodig hebt.'}
   ${eigen?`Je docent heeft voor je klas ${modusNaam(klasModus()).toLowerCase()} ingesteld.`:'Dit is de instelling voor je klas.'}</p>
   <div class="voet" style="justify-content:flex-start;gap:8px;margin:0">${knop('examen','🎯 Examenmodus','Alleen kernbegrippen')}${knop('toets','📘 Toetsmodus','Kern en methode')}
   ${eigen?`<button class="knop zacht klein" onclick="zetModus('klas')">Volg mijn klas</button>`:''}</div>
   <label class="label" style="margin-top:10px"><input type="checkbox" ${verdiepingAan()?'checked':''} onchange="zetVerdieping(this.checked)"> ${LAGEN.v.i} Ook verdieping (extra stof die niet in toets of examen komt)</label></div>`;
}

// ---- begrippen voor flitskaarten: alleen van het eigen niveau en uit de lagen die meetellen ----
// d = domein-id, leeg = alles, of 'P:<hoofdstuk-sleutel>' voor de begrippen van één hoofdstuk (kern en methode).
const _alleBegrippenBasis = alleBegrippen;
alleBegrippen = function(d, alle){
  if(d&&String(d).startsWith('P:')){ const h=hfdGroepen().find(x=>x.key===d.slice(2)); if(!h) return [];
    const namen=new Set(h.bg); return _alleBegrippenBasis(h.w).filter(x=>namen.has(x.k)).map(x=>Object.assign(x,{lg:laagVan(x.k)})).filter(x=>alle||x.lg!=='v'||verdiepingAan()) }
  return _alleBegrippenBasis(d).map(x=>Object.assign(x,{lg:laagVan(x.k)})).filter(x=>x.lg&&(alle||laagTelt(x.lg)));
};
// hoofdstukken van het eigen niveau met hun begrippen
function hfdGroepen(){ const out=[]; WERELDEN.forEach(w=>{ _lvsBasis(w.id).filter(l=>l.hfd&&l.bg).forEach(l=>{ const key=l.id.replace(/\.\d+$/,'');
  let g=out.find(x=>x.key===key); if(!g){ g={key,w:w.id,hfd:l.hfd,bg:[]}; out.push(g) } l.bg.forEach(b=>{ if(!g.bg.includes(b)) g.bg.push(b) }) }) });
  return out.sort((a,b)=>(parseInt(a.hfd.replace(/\D+/,''))||0)-(parseInt(b.hfd.replace(/\D+/,''))||0)) }
// stand van de kernbegrippen: [vast (bak 4 of hoger), totaal]
function kernStand(){ const fk=fkStaat(); const k=_alleBegrippenBasis().filter(x=>laagVan(x.k)==='k'); return [k.filter(x=>fk[x.k]&&fk[x.k][0]>=4).length, k.length] }

// ---- levels: verdiepingsvragen alleen als de leerling dat wil ----
const _lvsBasis = lvsVoor;
lvsVoor = function(w, n){ const r=_lvsBasis(w, n); if(verdiepingAan()) return r;
  return r.map(l=>l.vragen.some(v=>v.lg==='v') ? Object.assign({},l,{vragen:l.vragen.filter(v=>v.lg!=='v')}) : l) };
// vragen kiezen voor een level: kernvragen hebben een grotere kans (gewogen trekking zonder terugleggen)
vragenVoorLevel = function(l){
  const gens=(l.gens||[]); if(!l.vragen.length&&!gens.length) return [];
  const gw=v=>v.lg ? (v.lg==='m'&&oefenModus()==='examen' ? 1 : LAAG_GEWICHT[v.lg]) : LAAG_GEWICHT.k;
  const vaste=l.vragen.map(v=>({v,s:Math.pow(Math.random(),1/gw(v))})).sort((a,b)=>b.s-a.s).map(x=>x.v);
  let set; if(!vaste.length) set=Array.from({length:VRAGEN_PER_LEVEL},()=>maakGen(pick(gens)));
  else { const nGen=Math.min(gens.length?2:0,VRAGEN_PER_LEVEL); set=vaste.slice(0,VRAGEN_PER_LEVEL-nGen).concat(Array.from({length:nGen},()=>maakGen(pick(gens)))) }
  return shuffle(set);
};
// regel op een levelkaart: hoeveel kern-, methode- en verdiepingsbegrippen
function lagenRegel(l){ if(!l||!l.bg||!l.bg.length) return ''; const t={k:0,m:0,v:0}; l.bg.forEach(b=>{ const g=laagVan(b,l.niv||niv()); if(g) t[g]++ });
  const delen=['k','m','v'].filter(g=>t[g]).map(g=>`<span class="laag ${g}" title="${LAGEN[g].u}">${LAGEN[g].i} ${t[g]} ${LAGEN[g].n.toLowerCase()}</span>`);
  return delen.length?`<span class="lagen">${delen.join('')}</span>`:'' }

// label bij een begrippenvraag in de quiz
const _tekenVraagL = tekenVraag;
tekenVraag = function(){ _tekenVraagL(); const v=Q&&Q.vragen[Q.i]; if(!v||!v.lg) return;
  const t=$('#qz .top .chip'); if(t) t.insertAdjacentHTML('beforebegin',`<span class="chip laag ${v.lg}" title="${LAGEN[v.lg].u}">${LAGEN[v.lg].i} ${LAGEN[v.lg].n}</span>`) };

// stand van de kernbegrippen meesturen naar de server (voor het docentendashboard)
const _syncL = sync;
sync = async function(){ try{ if(S&&S.id) S.kv=kernStand() }catch(e){} return _syncL.apply(this, arguments) };

// ---- docent: modus per klas ----
async function dZetKlasModus(klas, modus){
  let c=''; try{ c=sessionStorage.getItem(DOC_KEY)||'' }catch(e){}
  if(!c){ melding('Log opnieuw in met je docentcode'); return }
  try{ const j=await api('klasmodus',{docentcode:c,klas,modus}); D.klasmodus=j.klasmodus||{}; melding(`${klas}: ${modus?modusNaam(modus):'standaard'} ingesteld. Leerlingen krijgen dit bij hun volgende synchronisatie.`,4000); tekenDocent() }
  catch(e){ melding(e.message==='Onbekende actie'?'De server kent deze instelling nog niet. Zet eerst de nieuwe Code.gs online (Implementeren → Nieuwe versie).':e.message,6000) }
}
function dKlasModusBlok(k, l){
  const huidig=((D&&D.klasmodus)||{})[k]||'', std=/^(H5|V6)$/i.test(k)?'examen':'toets';
  const kv=l.filter(s=>Array.isArray(s.kv)&&s.kv[1]); const pct=kv.length?Math.round(kv.reduce((a,s)=>a+s.kv[0]/s.kv[1],0)/kv.length*100):null;
  const opt=(w,t)=>`<option value="${w}" ${huidig===w?'selected':''}>${t}</option>`;
  return `<div class="kaart" style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:12px;align-items:center">
   <span><b>Oefenmodus ${esc(k)}</b><br><small class="zacht">Examenmodus = alleen kernbegrippen. Toetsmodus = kern en methode. Leerlingen kunnen het zelf nog aanpassen.</small></span>
   <select onchange="dZetKlasModus('${esc(k)}',this.value)" style="margin-left:auto">${opt('',`Standaard (${modusNaam(std).toLowerCase()})`)}${opt('examen','Examenmodus')}${opt('toets','Toetsmodus')}</select>
   ${pct!=null?`<span class="chip" title="Gemiddeld deel van de kernbegrippen dat bij de flitskaarten vastzit (bak 4 of hoger)">🎯 kernbegrippen vast: ${pct}%</span>`:''}</div>`;
}

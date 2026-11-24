// ===== Adaptieve examensprint + examenanalyse =====
// De sprint kiest 15 examenvragen met een gewicht per vraag:
//  gewicht = hoe vaak het onderwerp op het examen terugkomt (aandeel punten, per niveau)
//          × hoe zwak de leerling op dat onderwerp scoort (fouten op examenvragen tellen zwaarder)
//          × hoe de leerling deze vraag zelf deed (nieuw 1, fout 2, beheerst 0,25).
// Alles komt uit S.vr (examenvragen), dat al met de server wordt gesynchroniseerd: Code.gs hoeft niet te veranderen.
const _exTagCache = {};
const _exOndRe = {};
const exOndRe = o => _exOndRe[o.id] || (_exOndRe[o.id]=new RegExp(o.zoek,'i'));
function exTags(v){
  if(_exTagCache[v.id]) return _exTagCache[v.id];
  if(typeof EX_ONDERWERPEN==='undefined') return [];
  const kern=[v.q,v.model,(v.o||[]).join(' ')].join(' ');
  let t=EX_ONDERWERPEN.filter(o=>exOndRe(o).test(kern));
  if(!t.length) t=EX_ONDERWERPEN.filter(o=>exOndRe(o).test([v.titel,v.ctx].join(' ')));
  return _exTagCache[v.id]=t;
}
const exPunten = v => v.t==='open'?(v.pnt||1):1;
// aandeel van elk onderwerp in de examenpunten van dit niveau (som 1)
const _exGew = {};
function exGewicht(n=niv()){
  if(_exGew[n]) return _exGew[n];
  const g={}; let tot=0;
  exVragen(n).forEach(v=>{ const t=exTags(v), p=exPunten(v); tot+=p; if(!t.length){ g._geen=(g._geen||0)+p; return } t.forEach(o=>g[o.id]=(g[o.id]||0)+p/t.length) });
  for(const k in g) g[k]/=tot||1;
  const ex=new Set(exVragen(n).map(v=>v.ex)).size, inEx={};
  exVragen(n).forEach(v=>exTags(v).forEach(o=>(inEx[o.id]=inEx[o.id]||new Set()).add(v.ex)));
  return _exGew[n]={g,ex,inEx};
}
// score van de leerling per onderwerp (op basis van examenvragen)
function exOndScore(){
  const s={};
  exVragen().forEach(v=>{ const r=S.vr[v.id]; if(!r) return; const t=exTags(v); t.forEach(o=>{ const a=s[o.id]=s[o.id]||{g:0,f:0,n:0}; a.g+=r.g/t.length; a.f+=r.f/t.length; a.n++ }) });
  return s;
}
const exFoutkans = a => a? (a.f+1)/(a.g+a.f+2) : 0.5;   // 0..1, onbekend = 0,5
function exSprintGewicht(v,G,sc){
  const t=exTags(v);
  const ond = t.length ? t.reduce((s,o)=>s+(G.g[o.id]||0)*(0.4+1.6*exFoutkans(sc[o.id])),0)/t.length : (G.g._geen||0.02)*0.5;
  const r=S.vr[v.id]; const eigen = !r ? 1 : (r.g>=r.f&&r.g>0 ? 0.25 : 2);
  return ond*eigen;
}
function kiesGewogen(lijst,gew,n,mag){
  const pool=lijst.map((v,i)=>({v,w:Math.max(gew[i],1e-6)})), uit=[];
  while(uit.length<n&&pool.length){
    const som=pool.reduce((s,x)=>s+x.w,0); let r=Math.random()*som, i=0;
    while(i<pool.length-1&&(r-=pool[i].w)>0) i++;
    const [x]=pool.splice(i,1); if(!mag||mag(x.v,uit)) uit.push(x.v);
  }
  return uit;
}
startSprint = function(){
  if(!exVragen().length){ melding('Er zijn nog geen examenvragen'); return }
  const G=exGewicht(), sc=exOndScore(), lijst=exVragen();
  const gew=lijst.map(v=>exSprintGewicht(v,G,sc));
  // spreiding: hoogstens 2 vragen uit dezelfde opgave en 4 met hetzelfde hoofdonderwerp
  const v=kiesGewogen(lijst,gew,15,(x,uit)=>{ const opg=x.ex+'|'+x.titel, h=(exTags(x)[0]||{}).id;
    return uit.filter(y=>y.ex+'|'+y.titel===opg).length<2 && (!h||uit.filter(y=>(exTags(y)[0]||{}).id===h).length<4) });
  v.sort((a,b)=>a.ex<b.ex?-1:a.ex>b.ex?1:a.nr-b.nr);
  exSet(v,'Examensprint',{modus:'sprint',eind:Date.now()+20*60*1000});
  clearInterval(sprintTimer); sprintTimer=setInterval(()=>{ if(scherm!=='quiz'||Q.modus!=='sprint'){clearInterval(sprintTimer);return}
    const s=Math.max(0,Math.round((Q.eind-Date.now())/1000)); const el=$('#klok'); if(el) el.textContent=`⏱️ ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    if(s<=0){ clearInterval(sprintTimer); while(Q.res.length<Q.vragen.length){ Q.res.push(false) } klaar() } },1000);
};

// --- Scherm: examenanalyse (wat komt vaak terug, en hoe sta jij ervoor) ---
SCHERMEN.exanalyse = function(){
  const G=exGewicht(), sc=exOndScore();
  const rijen=EX_ONDERWERPEN.map(o=>({o,g:G.g[o.id]||0,ex:(G.inEx[o.id]||new Set()).size,s:sc[o.id]})).sort((a,b)=>b.g-a.g);
  const max=rijen[0]?rijen[0].g:1;
  const doms=DOMEINEN.map(d=>{ const v=exVragen().filter(x=>x.d===d.id); const p=v.reduce((s,x)=>s+exPunten(x),0); return {d,p} }).filter(x=>x.p);
  const tp=doms.reduce((s,x)=>s+x.p,0);
  const rij=r=>{ const pct=Math.round(r.g*100), sc=r.s&&(r.s.g+r.s.f)>=1?Math.round(r.s.g/(r.s.g+r.s.f)*100):null;
    return `<div style="margin:0 0 12px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:15px">${esc(r.o.t)}</b><span class="zacht" style="font-size:14px;white-space:nowrap">${pct}% · ${r.ex}/${G.ex}</span></div>
     <div class="balk" style="margin-top:4px"><i style="width:${Math.round(r.g/max*100)}%"></i></div>
     <small class="zacht">${sc===null?'Nog niet geoefend':`Jij: ${sc}% goed`}${sc!==null&&sc<60?' · krijgt extra aandacht in de sprint':''}</small></div>` };
  return `<div class="wrap">${kop('Wat komt vaak terug?',"go('examen')")}
   <div class="kaart" style="margin-bottom:14px"><p style="margin:0">Analyse van alle ${G.ex} centrale examens ${NIVEAUS[niv()]} van 2018 tot en met 2026. Per onderwerp zie je welk deel van de examenpunten erover ging en in hoeveel examens het voorkwam. De examensprint kiest vaker vragen over onderwerpen die vaak terugkomen, en nog vaker over onderwerpen waar jij fouten maakt.</p>
   <div class="voet" style="justify-content:flex-start"><button class="knop" onclick="startSprint()">⚡ Start examensprint</button></div></div>
   <div class="kaart" style="margin-bottom:14px"><h3 style="margin:0 0 10px">Per onderwerp</h3>${rijen.map(rij).join('')}</div>
   <div class="kaart"><h3 style="margin:0 0 10px">Per domein</h3>${doms.sort((a,b)=>b.p-a.p).map(x=>`<div style="margin:0 0 10px"><div style="display:flex;justify-content:space-between"><b style="font-size:15px">${x.d.icoon} ${esc(x.d.naam)}</b><span class="zacht" style="font-size:14px">${Math.round(x.p/tp*100)}%</span></div><div class="balk" style="margin-top:4px"><i style="width:${Math.round(x.p/doms[0].p*100)}%;background:${x.d.kleur}"></i></div></div>`).join('')}</div></div>`;
};
// ingang in de eindexamentrainer, naast de kaart Begrippencombinaties
const _spExamenScherm = SCHERMEN.examen;
SCHERMEN.examen = function(){
  const html=_spExamenScherm.apply(this,arguments);
  if(!exVragen().length||typeof EX_ONDERWERPEN==='undefined') return html;
  const kaart=`<button class="lv kaart" style="margin-bottom:14px;width:100%" onclick="go('exanalyse')"><span class="med">📊</span><span style="flex:1;text-align:left"><b>Wat komt vaak terug?</b><small>Analyse van alle examens 2018-2026 en jouw score per onderwerp. De examensprint oefent vooral de onderwerpen die vaak terugkomen en waar jij nog fouten maakt.</small></span><span class="zacht">›</span></button>`;
  const i=html.indexOf('<div class="voet"'); return i>0?html.slice(0,i)+kaart+html.slice(i):html;
};

// ===== Docentendashboard =====
// Haalt alle leerlingen op via de server (actie 'overzicht') en toont ze in tabbladen.
// Werkt ook met een oudere server: velden die ontbreken worden overgeslagen.
let dTab='overzicht', dSel=null, dWereld='alle';
const DOC_KEY='ecohv-docent';

SCHERMEN.docent = function(){
  let opgeslagen=''; try{ opgeslagen=sessionStorage.getItem(DOC_KEY)||'' }catch(e){}
  if(serverModus()&&opgeslagen&&!D) setTimeout(()=>laadDocent(opgeslagen),0);
  return `<div class="wrap" style="max-width:1200px">${kop('Docentendashboard','go(\'home\')')}
   ${D?'':`<div class="kaart" style="max-width:420px">
   ${serverModus()?`<label class="label" style="margin-top:0">Docentcode</label><input type="password" id="dCode" inputmode="numeric" onkeydown="if(event.key==='Enter')laadDocent()">
   <div class="voet"><button class="knop" onclick="laadDocent()">Open dashboard</button></div>`:`<p style="margin-top:0">Het klassenoverzicht werkt zodra de server is gekoppeld. Nu zie je alleen dit apparaat.</p><button class="knop" onclick="toonDocent({spelers:[samenvatLokaal()]})">Toon dit apparaat</button>`}</div>`}
   <div id="dOut"></div></div>`;
};

async function laadDocent(code){
  const c=code||($('#dCode')?$('#dCode').value.trim():'');
  if(!c){ melding('Vul je docentcode in'); return }
  const o=$('#dOut'); if(o) o.innerHTML='<p class="zacht">Gegevens ophalen…</p>';
  try{ const j=await api('overzicht',{docentcode:c}); try{sessionStorage.setItem(DOC_KEY,c)}catch(e){} toonDocent(j) }
  catch(e){ try{sessionStorage.removeItem(DOC_KEY)}catch(x){} if(o) o.innerHTML=''; melding(e.message,4000) }
}
function toonDocent(j){ D=j; D.opgehaald=Date.now(); go('docent'); tekenDocent() }
function dVernieuw(){ let c=''; try{c=sessionStorage.getItem(DOC_KEY)||''}catch(e){} if(c) laadDocent(c); else { D=null; go('docent') } }
function dUitloggen(){ try{sessionStorage.removeItem(DOC_KEY)}catch(e){} D=null; dSel=null; go('docent') }

// ---- berekeningen ----
const etPct = et => { if(!et||!et.r||et.r.length<3) return null; let a=0,w=0; et.r.forEach((x,i)=>{a+=x*(i+1);w+=i+1}); return Math.round(a/w*100) };
// levels met vragen; met een leerling erbij alleen de levels van zijn niveau (havo/vwo)
const dLvs = (w,s) => lvsVoor(w, s?niveauVan(s.klas):'').filter(speelbaar);
const dWerelden = () => WERELDEN.filter(w=>dLvs(w.id).length);
const alleLevels = s => dWerelden().flatMap(w=>dLvs(w.id,s).map(l=>({w:w.id,l})));
const bronsN = s => alleLevels(s).filter(x=>((s.lv||{})[x.l.id]||{}).best>=MEDAIL[0].min).length;
const diplomaN = s => Object.values(s.toets||{}).filter(t=>t.klaar).length;
const exBeheerst = (s,lijst) => (lijst||exVragen(niveauVan(s.klas))).filter(v=>{const r=(s.vr||{})[v.id]; return r&&r.g>0&&r.g>=r.f}).length;
const dagenSinds = t => t? Math.floor((Date.now()-t)/864e5) : null;
function laatsteWeken(n){ const out=[]; for(let i=n-1;i>=0;i--){ const d=new Date(Date.now()-i*7*864e5); out.push({id:weekId(d), l:'wk '+weekId(d).split('-W')[1].replace(/^0/,'')}) } return out }
function laatsteDagen(n){ const out=[]; for(let i=n-1;i>=0;i--){ const d=new Date(Date.now()-i*864e5); const id=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); out.push({id, l:String(d.getDate()), t:d.toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'})}) } return out }
const kleurScore = v => v==null?'var(--lijn)':v>=75?'var(--goed)':v>=50?'var(--goud)':'var(--fout)';
const dc = v => v==null?'<span class="zacht">–</span>':`<b style="color:${kleurScore(v)}">${v}</b>`;
const datumKort = t => t? new Date(t).toLocaleDateString('nl-NL',{day:'numeric',month:'short'}) : '–';

// eenvoudige staafgrafiek (één reeks, minuten); tooltip via title
function staven(items, eenheid){
  const max=Math.max(1,...items.map(x=>x.v));
  return `<div style="display:flex;align-items:flex-end;gap:6px;height:150px;padding-top:18px;border-bottom:1px solid var(--lijn)">
   ${items.map(x=>`<div title="${esc(x.t||x.l)}: ${x.v} ${eenheid}" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0">
     <span style="font-size:11px;color:var(--zacht);margin-bottom:2px">${x.v||''}</span>
     <div style="width:100%;max-width:38px;height:${Math.round(x.v/max*100)}%;min-height:${x.v?2:0}px;background:var(--acc);border-radius:4px 4px 0 0"></div></div>`).join('')}</div>
   <div style="display:flex;gap:6px">${items.map(x=>`<span style="flex:1;text-align:center;font-size:11px;color:var(--zacht);min-width:0;overflow:hidden;white-space:nowrap">${esc(x.l)}</span>`).join('')}</div>`;
}
function balk(v, label, extra){ return `<div class="domein"><span>${label}</span><div class="balk" title="${v==null?'nog geen score':v+'%'}"><i style="width:${v||0}%;background:${kleurScore(v)}"></i></div><span class="pct">${v==null?'–':v}</span></div>${extra||''}` }
const tegel = (getal, label, sub) => `<div class="kaart" style="padding:14px"><div style="font-size:28px;font-weight:800;line-height:1.1">${getal}</div><div style="font-weight:700;font-size:14px">${label}</div>${sub?`<div class="zacht" style="font-size:13px">${sub}</div>`:''}</div>`;

// ---- hoofdscherm ----
function tekenDocent(){
  const o=$('#dOut'); if(!o||!D) return;
  const klassen=[...new Set(D.spelers.map(s=>s.klas))].sort();
  const sp=D.spelers.filter(s=>dKlas==='alle'||s.klas===dKlas);
  const tabs=[['overzicht','Overzicht'],['klas','Klassikaal'],['leerlingen','Leerlingen'],['vragen','Vragen'],['eindtermen','Eindtermen'],['examen','Examentrainer']];
  const kopbalk=`<div class="voet" style="justify-content:flex-start;margin:0 0 12px;align-items:center">
    <select style="max-width:170px" onchange="dKlas=this.value;dSel=null;tekenDocent()"><option value="alle">Alle groepen</option>${klassen.map(k=>`<option ${k===dKlas?'selected':''}>${esc(k)}</option>`).join('')}</select>
    ${tabs.map(([k,t])=>`<button class="knop ${dTab===k&&!dSel?'':'zacht'}" style="min-height:44px;padding:8px 14px" onclick="dTab='${k}';dSel=null;tekenDocent()">${t}</button>`).join('')}
    <span style="flex:1"></span>
    <span class="zacht" style="font-size:13px">Opgehaald ${new Date(D.opgehaald||Date.now()).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}</span>
    <button class="knop zacht" style="min-height:44px;padding:8px 14px" onclick="dVernieuw()">↻ Vernieuwen</button>
    <button class="knop zacht" style="min-height:44px;padding:8px 14px" onclick="dCsv()">CSV</button>
    <button class="knop zacht" style="min-height:44px;padding:8px 14px" onclick="window.print()">Afdrukken</button>
    <button class="knop zacht" style="min-height:44px;padding:8px 14px" onclick="dUitloggen()">Uitloggen</button>
    ${typeof startDemo==='function'?`<select style="max-width:230px;min-height:44px;font-weight:700" onchange="if(this.value)startDemo(this.value)"><option value="">👁 Bekijk als leerling…</option>${KLASSEN.map(k=>`<option value="${k}">${esc(klasLabel(k))}</option>`).join('')}</select>`:''}</div>`;
  let inhoud;
  if(dSel){ const s=D.spelers.find(x=>x.id===dSel); inhoud=s?dLeerling(s):'' }
  else inhoud = {overzicht:dOverzicht,klas:dKlassikaal,leerlingen:dLeerlingen,vragen:dVragen,eindtermen:dEindtermen,examen:dExamen}[dTab](sp);
  o.innerHTML=kopbalk+(sp.length||dSel?inhoud:'<div class="kaart"><p class="zacht" style="margin:0">Nog geen leerlingen in deze groep.</p></div>');
}

function dOverzicht(sp){
  const n=sp.length, actief=sp.filter(s=>(s.tijdWeek||0)>0).length;
  const gemWeek=n?Math.round(sp.reduce((a,s)=>a+(s.tijdWeek||0),0)/n/60):0;
  const gemBrons=n?Math.round(sp.reduce((a,s)=>a+bronsN(s)/Math.max(1,alleLevels(s).length),0)/n*100):0;
  const dipl=sp.reduce((a,s)=>a+diplomaN(s),0);
  const heeftVr=sp.some(s=>s.vr); const exN=exVragen('').length;
  const gemEx=heeftVr&&n?Math.round(sp.reduce((a,s)=>a+exBeheerst(s),0)/n):null;
  const weken=laatsteWeken(8).map(w=>({l:w.l,t:'Week '+w.id.split('-W')[1],v:Math.round(sp.reduce((a,s)=>a+((s.week||{})[w.id]||0),0)/60)}));
  const dagen=laatsteDagen(14).map(d=>({l:d.l,v:Math.round(sp.reduce((a,s)=>a+((s.dag||{})[d.id]||0),0)/60)}));
  const heeftDag=sp.some(s=>s.dag&&Object.keys(s.dag).length);
  // aandacht
  const stil=sp.filter(s=>{const d=dagenSinds(s.laatst); return d==null||d>=7}).sort((a,b)=>(a.laatst||0)-(b.laatst||0));
  const zwak=[]; sp.forEach(s=>DOMEINEN.forEach(d=>{const v=(s.dom||{})[d.id]; if(v!=null&&v<50) zwak.push({s,d,v})})); zwak.sort((a,b)=>a.v-b.v);
  const veelHerhaal=sp.filter(s=>(s.herhaal||0)>=10).sort((a,b)=>b.herhaal-a.herhaal);
  const domGem=DOMEINEN.map(d=>{const l=sp.map(s=>(s.dom||{})[d.id]).filter(v=>v!=null); return {d,v:l.length?Math.round(l.reduce((a,b)=>a+b,0)/l.length):null,n:l.length}});
  const wereldStandKlas=dWerelden().map(w=>{const lv=dLvs(w.id); const pct=n?Math.round(sp.reduce((a,s)=>a+lv.filter(l=>((s.lv||{})[l.id]||{}).best>=MEDAIL[0].min).length,0)/(n*lv.length)*100):0; const dip=sp.filter(s=>((s.toets||{})[w.id]||{}).klaar).length; return {w,pct,dip}});
  const lnk=s=>`<a href="#" onclick="dSel='${esc(s.id)}';tekenDocent();return false" style="color:var(--acc);font-weight:700">${esc(s.naam)}</a>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-bottom:14px">
     ${tegel(n,'leerlingen',`${actief} actief deze week`)}
     ${tegel(gemWeek+' min','gem. oefentijd deze week','per leerling')}
     ${tegel(gemBrons+'%','levels brons of beter','gemiddeld over alle domeinen')}
     ${tegel(dipl,'diploma\'s behaald','eindtoetsen helemaal goed')}
     ${gemEx!=null&&exN?tegel(gemEx,'examenvragen beheerst','gemiddeld per leerling'):''}</div>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px">
    <div class="kaart"><b>Oefentijd van de groep per week</b> <span class="zacht" style="font-size:13px">(minuten, alle leerlingen samen)</span>${staven(weken,'min')}</div>
    ${heeftDag?`<div class="kaart"><b>Oefentijd per dag</b> <span class="zacht" style="font-size:13px">(laatste 14 dagen, minuten)</span>${staven(dagen,'min')}</div>`:''}
    <div class="kaart"><b>Gemiddelde score per domein</b>${domGem.map(x=>balk(x.v,x.d.icoon,'')).join('')}<p class="zacht" style="font-size:12px;margin:6px 0 0">${domGem.map(x=>`${x.d.icoon} ${x.d.naam} (${x.n} lln)`).join(' · ')}</p></div>
    <div class="kaart"><b>Voortgang per domein</b> <span class="zacht" style="font-size:13px">(% levels brons · diploma's)</span>${wereldStandKlas.map(x=>`<div class="domein" style="grid-template-columns:34px 1fr 90px"><span>${x.w.icoon}</span><div class="balk" title="H${x.w.nr} ${esc(x.w.naam)}: ${x.pct}%"><i style="width:${x.pct}%;background:${x.w.kleur}"></i></div><span class="pct" style="font-weight:600;font-size:14px">${x.pct}% · 🎓${x.dip}</span></div>`).join('')}</div>
   </div>
   <div class="sectie">Aandacht nodig</div>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">
    <div class="kaart"><b>Al een week niet geoefend</b>${stil.length?stil.slice(0,12).map(s=>`<div class="rij">${lnk(s)}<span style="flex:1"></span><span class="zacht" style="font-size:13px">${s.laatst?dagenSinds(s.laatst)+' dagen':'nooit'}</span></div>`).join(''):'<p class="zacht">Iedereen is deze week actief geweest.</p>'}</div>
    <div class="kaart"><b>Lage domeinscores (onder 50)</b>${zwak.length?zwak.slice(0,12).map(x=>`<div class="rij">${lnk(x.s)}<span style="flex:1;font-size:14px">${x.d.icoon} ${x.d.naam}</span>${dc(x.v)}</div>`).join(''):'<p class="zacht">Geen scores onder de 50.</p>'}</div>
    <div class="kaart"><b>Veel foute vragen open (10 of meer)</b>${veelHerhaal.length?veelHerhaal.slice(0,12).map(s=>`<div class="rij">${lnk(s)}<span style="flex:1"></span><span class="zacht" style="font-size:13px">${s.herhaal} in herhaalronde</span></div>`).join(''):'<p class="zacht">Niemand heeft een lange herhaallijst.</p>'}</div>
   </div>`;
}

// Klassikaal: per klas de onderwerpen waar de groep het zwakst op scoort, de vaakst foute vragen en de toetscijfers.
// Bedoeld om te kiezen wat je in de les nog eens klassikaal behandelt.
function dKlassikaal(sp){
  const klassen=[...new Set(sp.map(s=>s.klas))].sort();
  const lnk=s=>`<a href="#" onclick="dSel='${esc(s.id)}';tekenDocent();return false" style="color:var(--acc)">${esc(s.naam)}</a>`;
  const gem=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:null;
  return klassen.map(k=>{ const l=sp.filter(s=>s.klas===k); const minN=Math.max(2,Math.ceil(l.length*0.25));
    const ond=Object.keys(EINDTERMEN).map(c=>{ const sc=l.map(s=>({s,v:etPct((s.et||{})[c])})).filter(x=>x.v!=null); return {c,n:sc.length,v:sc.length?Math.round(sc.reduce((a,x)=>a+x.v,0)/sc.length):null,laag:sc.filter(x=>x.v<50).map(x=>x.s)} })
      .filter(x=>x.n>=minN).sort((a,b)=>a.v-b.v).slice(0,6);
    const tel={}; l.forEach(s=>Object.entries(s.vr||{}).forEach(([id,r])=>{ if(id.startsWith('gen.')) return; const t=tel[id]||(tel[id]={g:0,f:0,ll:new Set()}); t.g+=r.g||0; t.f+=r.f||0; if(r.f) t.ll.add(s.id) }));
    const vr=Object.entries(tel).filter(([id,t])=>t.ll.size>=minN&&vraagById(id)).map(([id,t])=>({v:vraagById(id),t,p:Math.round(t.f/(t.g+t.f)*100)})).sort((a,b)=>b.t.ll.size-a.t.ll.size||b.p-a.p).slice(0,6);
    const pt={}; l.forEach(s=>Object.entries(s.pt||{}).forEach(([key,r])=>{ (pt[key]=pt[key]||[]).push(r.l!=null?r.l:r.b) }));
    const ptl=Object.entries(pt).map(([key,a])=>({key,n:a.length,c:gem(a)})).sort((a,b)=>a.c-b.c);
    const exr=l.flatMap(s=>Object.entries(s.exr||{}).map(([c,r])=>({s,c,r}))).sort((a,b)=>b.r.t-a.r.t);
    return `<div class="sectie">${esc(k)} · ${l.length} leerlingen</div>${typeof dKlasModusBlok==='function'?dKlasModusBlok(k,l):''}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px">
     <div class="kaart"><b>Zwakste onderwerpen van de klas</b> <span class="zacht" style="font-size:13px">(gemiddelde score, minstens ${minN} lln)</span>
      ${ond.length?ond.map(x=>`<div class="rij" style="display:block">${balk(x.v,`<span style="font-size:14px">${esc(EINDTERMEN[x.c].t)}</span>`).replace('class="domein"','class="domein" style="grid-template-columns:minmax(150px,1.3fr) 1fr 44px;border:0;padding:0"')}
        <div class="zacht" style="font-size:13px">${x.n} lln met score${x.laag.length?` · onder 50: ${x.laag.slice(0,8).map(lnk).join(', ')}${x.laag.length>8?' en '+(x.laag.length-8)+' meer':''}`:''}</div></div>`).join(''):'<p class="zacht">Nog te weinig gegevens.</p>'}</div>
     <div class="kaart"><b>Vragen die veel leerlingen fout hadden</b>
      ${vr.length?vr.map(x=>`<div class="rij" style="display:block"><b style="color:var(--fout)">${x.t.ll.size} lln fout</b> <span class="zacht" style="font-size:13px">· ${x.p}% van de pogingen fout · ${esc((EINDTERMEN[x.v.e]||{}).t||'')}</span><div style="font-size:14px;margin-top:2px">${esc(x.v.q.length>220?x.v.q.slice(0,220)+'…':x.v.q)}</div><div class="zacht" style="font-size:13px">Juist: ${esc(String(juistTekst(x.v)||'').slice(0,160))}</div></div>`).join(''):'<p class="zacht">Nog te weinig gegevens.</p>'}</div>
     <div class="kaart"><b>Proeftoetsen</b> <span class="zacht" style="font-size:13px">(gemiddeld laatste cijfer)</span>
      ${ptl.length?ptl.map(x=>`<div class="rij"><span style="flex:1;font-size:14px">${esc(x.key.split('|')[1])}</span><span class="zacht" style="font-size:13px">${x.n} lln</span><b style="min-width:40px;text-align:right;color:${x.c>=5.5?'var(--goed)':'var(--fout)'}">${String(x.c).replace('.',',')}</b></div>`).join(''):'<p class="zacht">Nog geen proeftoetsen gemaakt (of de server heeft de nieuwste Code.gs nog niet).</p>'}
      <div style="margin-top:12px"><b>Examens op tijd</b></div>
      ${exr.length?exr.slice(0,10).map(x=>`<div class="rij">${lnk(x.s)}<span style="flex:1;font-size:13px" class="zacht">${esc(exNaam(x.c))}</span><span style="font-size:13px">${x.r.p}/${x.r.m}</span><b style="min-width:40px;text-align:right;color:${x.r.cf>=5.5?'var(--goed)':'var(--fout)'}">${String(x.r.cf).replace('.',',')}</b></div>`).join(''):'<p class="zacht">Nog geen examens op tijd gemaakt.</p>'}</div>
    </div>`; }).join('')||'<div class="kaart"><p class="zacht" style="margin:0">Nog geen leerlingen.</p></div>';
}

function dLeerlingen(sp){
  const exN=exVragen('').length;
  const rijen=sp.map(s=>({s,totLv:alleLevels(s).length,brons:bronsN(s),dipl:diplomaN(s),ex:s.vr?exBeheerst(s):null}));
  const k={week:(a,b)=>(b.s.tijdWeek||0)-(a.s.tijdWeek||0),tijd:(a,b)=>(b.s.tijd||0)-(a.s.tijd||0),naam:(a,b)=>a.s.naam.localeCompare(b.s.naam,'nl'),voortgang:(a,b)=>b.brons-a.brons,examen:(a,b)=>(b.ex||0)-(a.ex||0),laatst:(a,b)=>(b.s.laatst||0)-(a.s.laatst||0)};
  rijen.sort(k[dSort]||k.week);
  const th=(key,t)=>`<th style="cursor:pointer;${dSort===key?'color:var(--acc)':''}" onclick="dSort='${key}';tekenDocent()">${t}${dSort===key?' ▾':''}</th>`;
  return `<p class="zacht" style="margin:0 0 8px;font-size:14px">Klik op een kolomkop om te sorteren en op een naam voor alle details.</p>
   <div class="kaart tabelwrap"><table><thead><tr><th>#</th>${th('naam','Leerling')}<th>Groep</th>${th('week','Deze week')}${th('tijd','Totaal')}${th('voortgang','Levels')}<th>Diploma\'s</th>${exN?th('examen','Examen'):''}${DOMEINEN.map(d=>`<th title="${d.naam}">${d.icoon}</th>`).join('')}${th('laatst','Laatst')}<th>ID · code</th></tr></thead><tbody>
   ${rijen.map((r,i)=>{const s=r.s; return `<tr style="cursor:pointer" onclick="dSel='${esc(s.id)}';tekenDocent()"><td>${dSort==='naam'?'':i+1}</td><td><b style="color:var(--acc)">${esc(s.naam)}</b></td><td>${esc(s.klas)}</td><td>${minuten(s.tijdWeek)} min</td><td>${minuten(s.tijd)} min</td>
     <td style="min-width:110px"><div class="balk" title="${r.brons} van ${r.totLv}"><i style="width:${Math.round(r.brons/Math.max(1,r.totLv)*100)}%"></i></div><span style="font-size:12px" class="zacht">${r.brons}/${r.totLv}</span></td>
     <td>${r.dipl?'🎓 '+r.dipl:'–'}</td>${exN?`<td>${r.ex==null?'–':r.ex+'/'+exVragen(niveauVan(s.klas)).length}</td>`:''}${DOMEINEN.map(d=>`<td>${dc((s.dom||{})[d.id])}</td>`).join('')}
     <td style="font-size:13px">${datumKort(s.laatst)}</td><td style="font-size:12px">${esc(s.id||'')}<br>${esc(s.code||'')}</td></tr>`}).join('')}
   </tbody></table></div>`;
}

function dLeerling(s){
  const weken=laatsteWeken(8).map(w=>({l:w.l,t:'Week '+w.id.split('-W')[1],v:Math.round(((s.week||{})[w.id]||0)/60)}));
  const dagen=laatsteDagen(14).map(d=>({l:d.l,v:Math.round(((s.dag||{})[d.id]||0)/60)}));
  const exN=exVragen(niveauVan(s.klas)).length;
  const werelden=dWerelden().map(w=>{ const t=(s.toets||{})[w.id];
    const lv=dLvs(w.id,s).map(l=>{const r=(s.lv||{})[l.id]; const m=r&&r.best!=null?medaille(r.best):null; return `<span title="${esc(l.naam)}: ${r&&r.best!=null?'beste '+r.best+'/'+VRAGEN_PER_LEVEL:'nog niet gespeeld'}" style="display:inline-block;min-width:34px;text-align:center;padding:4px 6px;border-radius:8px;border:1px solid var(--lijn);font-size:13px;margin:2px">${m?m.e:(r&&r.best!=null?r.best:'·')}</span>`}).join('');
    return `<div class="rij" style="flex-wrap:wrap"><span style="width:34px;font-size:22px">${w.icoon}</span><span style="flex:1;min-width:160px"><b>${w.nr} ${esc(w.naam)}</b><br><span class="zacht" style="font-size:13px">Domeintoets: ${t?(t.eerste!=null?'eerste poging '+t.eerste+'/'+(t.tot||TOETS_VRAGEN):'gestart')+(t.klaar?' · 🎓 diploma':' · nog niet alles goed'):'nog niet gemaakt'}</span></span><span>${lv}</span></div>` }).join('');
  const etRijen=DOMEINEN.map(d=>{ const codes=Object.keys(EINDTERMEN).filter(k=>EINDTERMEN[k].d===d.id); const r=codes.map(k=>({k,v:etPct((s.et||{})[k]),n:((s.et||{})[k]||{}).n||0})).filter(x=>x.n);
    return `<div style="margin-bottom:10px"><b>${d.icoon} ${d.naam}</b> ${dc((s.dom||{})[d.id])}${r.length?r.map(x=>`<div class="domein" style="grid-template-columns:1fr 120px 46px;font-size:14px"><span>${esc(EINDTERMEN[x.k].t)} <span class="zacht">(${x.n}×)</span></span><div class="balk"><i style="width:${x.v||0}%;background:${kleurScore(x.v)}"></i></div><span class="pct">${x.v==null?'–':x.v}</span></div>`).join(''):'<div class="zacht" style="font-size:13px">Nog niet geoefend.</div>'}</div>` }).join('');
  const fout=Object.entries(s.vr||{}).filter(([k,r])=>!k.startsWith('gen.')&&r.f>0).map(([k,r])=>({k,r,v:vraagById(k)})).filter(x=>x.v).sort((a,b)=>(b.r.f-b.r.g)-(a.r.f-a.r.g)||b.r.f-a.r.f).slice(0,10);
  const foutOud=!s.vr&&s.fout?Object.entries(s.fout).filter(([k])=>!k.startsWith('gen.')).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,f])=>({k,r:{f,g:0},v:vraagById(k)})).filter(x=>x.v):[];
  const exRijen=exN&&s.vr?exLijst(niveauVan(s.klas)).map(({c,v})=>{const b=exBeheerst(s,v); const gemaakt=v.filter(x=>(s.vr||{})[x.id]).length; return `<div class="domein" style="grid-template-columns:150px 1fr 70px;font-size:14px"><span>${exNaam(c)}</span><div class="balk" title="${gemaakt} gemaakt, ${b} beheerst"><i style="width:${Math.round(b/v.length*100)}%"></i></div><span class="pct">${b}/${v.length}</span></div>`}).join(''):'';
  return `<button class="terug" onclick="dSel=null;tekenDocent()">‹ Terug naar ${dTab==='overzicht'?'het overzicht':'de lijst'}</button>
   <div class="kaart" style="margin:8px 0 14px"><div style="display:flex;flex-wrap:wrap;gap:8px 24px;align-items:baseline"><h2 style="margin:0">${esc(s.naam)}</h2><span>${esc(s.klas)}</span><span class="zacht">ID ${esc(s.id||'')} · herstelcode ${esc(s.code||'–')}</span><span class="zacht">Account sinds ${datumKort(s.aangemaakt)} · laatst actief ${datumKort(s.laatst)}</span></div></div>
   <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:14px">
    ${tegel(minuten(s.tijdWeek)+' min','deze week')}${tegel(minuten(s.tijd)+' min','totaal geoefend')}
    ${tegel(bronsN(s)+'/'+alleLevels(s).length,'levels brons+')}${tegel(diplomaN(s)+'/'+dWerelden().length,'diploma\'s')}
    ${exN&&s.vr?tegel(exBeheerst(s)+'/'+exN,'examenvragen beheerst'):''}${s.sprint?tegel((s.sprint.best||0)+'/15','sprintrecord',(s.sprint.n||0)+' sprints'):''}
    ${Array.isArray(s.kv)&&s.kv[1]?tegel(s.kv[0]+'/'+s.kv[1],'kernbegrippen vast','oefenmodus: '+(s.lmodus==='examen'||s.lmodus==='toets'?s.lmodus+' (eigen keuze)':'volgt de klas')):''}${s.herhaal!=null?tegel(s.herhaal,'in herhaalronde','foute vragen nog open'):''}${s.nk!=null?tegel(s.nk,'begrippenkaarten',(s.badges||[]).length+' badges · '+(s.munten||0)+' munten'):''}</div>
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px">
    <div class="kaart"><b>Oefentijd per week</b> <span class="zacht" style="font-size:13px">(minuten)</span>${staven(weken,'min')}</div>
    ${s.dag?`<div class="kaart"><b>Oefentijd per dag</b> <span class="zacht" style="font-size:13px">(laatste 14 dagen)</span>${staven(dagen,'min')}</div>`:''}
   </div>
   <div class="sectie">Domeinen en levels</div><div class="kaart"><p class="zacht" style="margin:0 0 6px;font-size:13px">Per level de beste medaille (🥉 6, 🥈 7, 🥇 8 van 8). Een getal is een beste score zonder medaille, een punt is nog niet gespeeld.</p>${werelden}</div>
   <div class="sectie">Vaardigheden per eindterm</div><div class="kaart">${etRijen}</div>
   <div class="sectie">Vragen die het vaakst fout gingen</div><div class="kaart">${(fout.length?fout:foutOud).length?(fout.length?fout:foutOud).map(x=>`<div class="rij" style="display:block"><b>${x.r.f}× fout${x.r.g?', '+x.r.g+'× goed':''}</b> · <span class="zacht" style="font-size:13px">${esc(x.v.w==='ex'?'Examen '+x.v.jaar+' tv'+x.v.tv+' vraag '+x.v.nr:(WERELDEN.find(w=>w.id===x.v.w)||{}).naam||'')}</span><br>${esc(x.v.q)}<br><span class="zacht">Juist: ${esc(juistTekst(x.v))}</span></div>`).join(''):'<p class="zacht">Nog geen foute vragen.</p>'}</div>
   ${exRijen?`<div class="sectie">Examentrainer per examen</div><div class="kaart">${exRijen}</div>`:''}
   ${s.vr?`<div class="sectie">Foutenschrift per leerdoel</div><div class="kaart"><p class="zacht" style="margin:0 0 6px;font-size:13px">Leerdoelen met de meeste fouten die nog open staan (vaker fout dan goed). Klik op een regel voor de vragen.</p>${foutenschriftDocent(s)}</div>`:''}`;
}

function dVragen(sp){
  const tel={}; sp.forEach(s=>{ const bron=s.vr||Object.fromEntries(Object.entries(s.fout||{}).map(([k,f])=>[k,{f,g:0}]));
    Object.entries(bron).forEach(([k,r])=>{ if(k.startsWith('gen.')) return; const t=tel[k]||(tel[k]={g:0,f:0,ll:0,llF:0}); t.g+=r.g||0; t.f+=r.f||0; t.ll++; if(r.f>(r.g||0)) t.llF++ }) });
  const wereldOpt=[['alle','Alle domeinen']].concat(dWerelden().map(w=>[w.id,w.nr+' '+w.naam]),exVragen('').length?[['ex','Examenvragen']]:[]);
  let lijst=Object.entries(tel).map(([k,t])=>({k,t,v:vraagById(k)})).filter(x=>x.v&&(dWereld==='alle'||x.v.w===dWereld)&&(x.t.g+x.t.f)>=2);
  lijst.forEach(x=>x.p=Math.round(x.t.f/(x.t.g+x.t.f)*100)); lijst.sort((a,b)=>b.p-a.p||b.t.f-a.t.f);
  const rekengen={}; sp.forEach(s=>Object.entries(s.vr||{}).forEach(([k,r])=>{ if(!k.startsWith('gen.')) return; const t=rekengen[k]||(rekengen[k]={g:0,f:0}); t.g+=r.g||0; t.f+=r.f||0 }));
  const gl=Object.entries(rekengen).filter(([k,t])=>t.g+t.f>=3).map(([k,t])=>({k,t,p:Math.round(t.f/(t.g+t.f)*100),voorb:(()=>{try{return maakGen(k.slice(4)).q}catch(e){return k}})()})).sort((a,b)=>b.p-a.p).slice(0,12);
  return `<div class="voet" style="justify-content:flex-start;margin:0 0 10px"><select style="max-width:300px" onchange="dWereld=this.value;tekenDocent()">${wereldOpt.map(([k,t])=>`<option value="${k}" ${k===dWereld?'selected':''}>${esc(t)}</option>`).join('')}</select></div>
   <div class="kaart"><b>Moeilijkste vragen</b> <span class="zacht" style="font-size:13px">(percentage fout van alle pogingen, minstens 2 pogingen)</span>
   ${lijst.length?lijst.slice(0,25).map(x=>`<div class="rij" style="display:block"><div style="display:flex;gap:10px;align-items:center"><b style="min-width:52px;color:${kleurScore(100-x.p)}">${x.p}% fout</b><div class="balk" style="flex:1;max-width:220px"><i style="width:${x.p}%;background:var(--fout)"></i></div><span class="zacht" style="font-size:13px">${x.t.f} fout · ${x.t.g} goed · ${x.t.ll} lln${x.t.llF?' · '+x.t.llF+' vaker fout dan goed':''}</span></div>
     <div style="margin-top:4px">${esc(x.v.q)}</div><div class="zacht" style="font-size:14px">Juist: ${esc(juistTekst(x.v))} · ${esc(x.v.w==='ex'?'Examen '+x.v.jaar+' tv'+x.v.tv+' vraag '+x.v.nr:(WERELDEN.find(w=>w.id===x.v.w)||{}).naam||'')} · ${esc((EINDTERMEN[x.v.e]||{}).t||'')}</div></div>`).join(''):'<p class="zacht">Nog te weinig gegevens.</p>'}</div>
   ${gl.length&&dWereld==='alle'?`<div class="sectie">Rekensommen met wisselende getallen</div><div class="kaart">${gl.map(x=>`<div class="rij"><b style="min-width:52px;color:${kleurScore(100-x.p)}">${x.p}% fout</b><span style="flex:1;font-size:14px">${esc(x.voorb)}</span><span class="zacht" style="font-size:13px">${x.t.f+x.t.g} pogingen</span></div>`).join('')}</div>`:''}`;
}

function dEindtermen(sp){
  const codes=Object.keys(EINDTERMEN).filter(k=>!k.startsWith('EX.'));
  const gem=k=>{const l=sp.map(s=>etPct((s.et||{})[k])).filter(v=>v!=null); return l.length?Math.round(l.reduce((a,b)=>a+b,0)/l.length):null};
  const cel=v=>`<td title="${v==null?'nog geen score':v+'%'}" style="text-align:center;padding:6px 4px;background:${v==null?'transparent':`color-mix(in srgb,${kleurScore(v)} 22%,var(--kaart))`};font-size:13px">${v==null?'<span class="zacht">·</span>':v}</td>`;
  const kop=DOMEINEN.map(d=>{const c=codes.filter(k=>EINDTERMEN[k].d===d.id); return `<th colspan="${c.length}" style="text-align:center;border-left:2px solid var(--lijn)">${d.icoon} ${d.naam}</th>`}).join('');
  const kop2=DOMEINEN.flatMap(d=>codes.filter(k=>EINDTERMEN[k].d===d.id).map((k,i)=>`<th title="${esc(EINDTERMEN[k].t)}" style="text-align:center;font-size:11px;${i===0?'border-left:2px solid var(--lijn)':''}">${k}</th>`)).join('');
  const volg=DOMEINEN.flatMap(d=>codes.filter(k=>EINDTERMEN[k].d===d.id));
  const lijst=sp.slice().sort((a,b)=>a.naam.localeCompare(b.naam,'nl'));
  return `<p class="zacht" style="margin:0 0 8px;font-size:14px">Score per eindterm (0 tot 100) op basis van de laatste 20 antwoorden, vanaf 3 antwoorden. Groen 75+, geel 50-74, rood onder 50. Houd de muis op een code voor de omschrijving.</p>
   <div class="kaart tabelwrap"><table style="font-size:13px"><thead><tr><th></th>${kop}</tr><tr><th>Leerling</th>${kop2}</tr></thead><tbody>
    <tr style="font-weight:800"><td>Groepsgemiddelde</td>${volg.map(k=>cel(gem(k))).join('')}</tr>
    ${lijst.map(s=>`<tr><td style="white-space:nowrap"><a href="#" onclick="dSel='${esc(s.id)}';tekenDocent();return false" style="color:var(--acc)">${esc(s.naam)}</a></td>${volg.map(k=>cel(etPct((s.et||{})[k]))).join('')}</tr>`).join('')}
   </tbody></table></div>
   <div class="sectie">Eindtermen van zwak naar sterk</div><div class="kaart">${volg.map(k=>({k,v:gem(k)})).filter(x=>x.v!=null).sort((a,b)=>a.v-b.v).map(x=>balk(x.v,`<span style="font-size:13px">${esc(EINDTERMEN[x.k].t)} <span class="zacht">(${x.k})</span></span>`)).join('').replace(/class="domein"/g,'class="domein" style="grid-template-columns:minmax(160px,1.4fr) 1fr 52px"')||'<p class="zacht">Nog geen gegevens.</p>'}</div>`;
}

function dExamen(sp){
  if(!exVragen('').length) return '<div class="kaart"><p style="margin:0">Er staan nog geen examenvragen in de app.</p></div>';
  if(!sp.some(s=>s.vr)) return '<div class="kaart"><p style="margin:0">Voor dit overzicht heeft de server de nieuwste versie van Code.gs nodig. Zie de stappen in de handleiding.</p></div>';
  const ex=exLijst('');
  const rij=s=>`<tr><td style="white-space:nowrap"><a href="#" onclick="dSel='${esc(s.id)}';tekenDocent();return false" style="color:var(--acc)">${esc(s.naam)}</a></td><td>${exBeheerst(s)}</td><td>${s.sprint?s.sprint.best+'/15':'–'}</td>${ex.map(({v})=>{const b=exBeheerst(s,v), g=v.filter(x=>(s.vr||{})[x.id]).length; const p=g?Math.round(b/v.length*100):null; return `<td title="${g} van ${v.length} gemaakt, ${b} beheerst" style="text-align:center;background:${p==null?'transparent':`color-mix(in srgb,${kleurScore(p)} 22%,var(--kaart))`}">${g?b+'/'+v.length:'<span class="zacht">·</span>'}</td>`}).join('')}</tr>`;
  const domein=DOMEINEN.filter(d=>exVragen('').some(x=>x.d===d.id)).map(d=>{const l=sp.map(s=>{const v=exVragen(niveauVan(s.klas)).filter(x=>x.d===d.id); return v.length?exBeheerst(s,v)/v.length*100:0}); return {d,v:Math.round(l.reduce((a,b)=>a+b,0)/Math.max(1,l.length))}});
  return `<div class="kaart" style="margin-bottom:14px"><b>Gemiddeld beheerst per domein</b>${domein.map(x=>balk(x.v,x.d.icoon)).join('')}</div>
   <div class="kaart tabelwrap"><table style="font-size:13px"><thead><tr><th>Leerling</th><th>Beheerst</th><th>Sprint</th>${ex.map(({c})=>`<th style="text-align:center;font-size:11px">${2000+ +c.slice(0,2)}<br>tv${c[3]}</th>`).join('')}</tr></thead>
   <tbody>${sp.slice().sort((a,b)=>exBeheerst(b)-exBeheerst(a)).map(rij).join('')}</tbody></table></div>`;
}

function dCsv(){
  if(!D) return; const sp=D.spelers.filter(s=>dKlas==='alle'||s.klas===dKlas);
  const kop=['Naam','Groep','ID','Herstelcode','Minuten deze week','Minuten totaal','Levels brons','Diplomas','Examen beheerst'].concat(DOMEINEN.map(d=>d.naam),['Laatst actief']);
  const r=sp.map(s=>[s.naam,s.klas,s.id,s.code,minuten(s.tijdWeek),minuten(s.tijd),bronsN(s),diplomaN(s),s.vr?exBeheerst(s):''].concat(DOMEINEN.map(d=>(s.dom||{})[d.id]??''),[s.laatst?new Date(s.laatst).toLocaleDateString('nl-NL'):'']));
  const csv='﻿'+[kop].concat(r).map(x=>x.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`economiehv_${dKlas}_${vandaag()}.csv`; a.click();
}

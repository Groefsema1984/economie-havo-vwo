// ===== Casustrainer per hoofdstuk =====
// Casussen (data-casussen.js) gaan per hoofdstuk open na de proeftoets (voldoende) of als alle levels van het hoofdstuk brons hebben.
// In de docentweergave en voor een docentaccount (S.alles) staat alles open.
// Uitslag per casus in S.cs[id] = {b: beste %, l: laatste %, n: aantal keer}. Per vraag registreert de app zoals overal (S.vr, S.et),
// dus fouten komen in het foutenschrift en de herhaalronde, en de scores tellen mee in het docentendashboard.
const CASUS_DOM='D';
const csHfdNrs = () => [...new Set(CASUSSEN.map(c=>c.hfd))].sort((a,b)=>a-b);
function csHfd(nr){ const n=niv(); const lvs=(LEVELS[CASUS_DOM]||[]).filter(l=>l.niv===n&&l.id.startsWith(`${CASUS_DOM}.${n}${nr}.`));
  return {nr, lvs, naam:(lvs[0]||{}).hfd||('Hoofdstuk '+nr), key:CASUS_DOM+'|'+((lvs[0]||{}).hfd||'')} }
function csOpen(nr){ if(typeof allesOpen==='function'&&allesOpen()) return true; const h=csHfd(nr); const pt=((S.pt||{})[h.key]||{}).b||0;
  return pt>=5.5 || (h.lvs.length>0&&h.lvs.every(l=>((S.lv[l.id]||{}).best||0)>=MEDAIL[0].min)) }
const csVan = nr => CASUSSEN.filter(c=>c.hfd===nr&&(!c.niv||c.niv===niv()));
const csFig = c => typeof c.fig==='function'?c.fig():(c.fig||'');
function csVragen(c){ return c.vragen.filter(v=>!v.niv||v.niv===niv()).map((v,k)=>Object.assign({id:`cs.${c.id}.${k+1}`,w:CASUS_DOM,ctx:c.ctx,cs:c.id,titel:c.titel},v)) }

// vijfde casus: echte examenopgaven van het eigen niveau, waarvan de meeste vragen over dit hoofdstuk gaan
const _csEx={};
function csExamens(nr){ const k=niv()+nr; if(_csEx[k]) return _csEx[k];
  const re=new RegExp(CASUS_EXAMEN[nr]||'$^','i'), m={};
  exVragen().filter(v=>!/\.\d+\.\d+$/.test(v.id)).forEach(v=>{ const s=v.ex+'|'+(v.titel||''); (m[s]=m[s]||[]).push(v) });
  return (_csEx[k]=Object.values(m).map(v=>{ v.sort((a,b)=>a.nr-b.nr); const r=v.filter(x=>re.test((x.q||'')+' '+(x.model||'')+' '+(x.o||[]).join(' '))).length;
      return {v, ex:v[0].ex, titel:v[0].titel||'Examenopgave', jaar:v[0].jaar, score:r/v.length, r} })
    .filter(o=>o.v.length>=3&&o.r>=2&&o.score>=0.5).sort((a,b)=>(b.score-a.score)||(b.jaar-a.jaar)).slice(0,6));
}
function csResultaat(id){ const r=(S.cs||{})[id]; return r?`${r.b}%`:'' }

function startCasus(id){ const c=CASUSSEN.find(x=>x.id===id); if(!c) return; if(!csOpen(c.hfd)){ melding('Deze casus gaat open na de proeftoets van dit hoofdstuk'); return }
  Q={modus:'casus',casus:id,titel:'Casus · '+c.titel,kleur:'#2f7de0',vragen:csVragen(c),i:0,res:[],terug:`go('casussen',${c.hfd})`,hulp:c.lv==='toets'}; go('quiz') }
function startCasusEx(nr,i){ if(!csOpen(nr)) return; const o=csExamens(nr)[i||0]; if(!o) return;
  Q={modus:'casus',casus:'ex.'+o.ex+'.'+o.v[0].nr,titel:'Examenopgave · '+o.titel,kleur:'#1f2430',vragen:o.v.map(v=>Object.assign({},v)),i:0,res:[],terug:`go('casussen',${nr})`}; go('quiz') }

// quiz: figuur bij de context, hulpstap-knop, tolerantie bij rekenvragen
const _nakijkenCs=nakijken; nakijken=function(v,a){ if(v.t==='reken'&&v.tol!=null){ const x=parseGetal(a); return !isNaN(x)&&Math.abs(x-v.a)<=v.tol+1e-9 } return _nakijkenCs(v,a) };
const _tekenCs=tekenVraag; tekenVraag=function(){ _tekenCs(); if(!Q||Q.modus!=='casus') return; const v=Q.vragen[Q.i]; if(!v||!v.cs) return;
  const c=CASUSSEN.find(x=>x.id===v.cs), f=c?csFig(c):''; const ctx=$('#qz .vctx');
  if(f){ const h=`<div class="graf" style="margin:8px 0">${f}</div>`; if(ctx) ctx.insertAdjacentHTML('afterend',h); else $('#qz .vraag').insertAdjacentHTML('beforebegin',h) }
  if(v.hint) $('#fb').insertAdjacentHTML('beforebegin',`<p style="margin:8px 0 0" id="csHint"><button class="knop zacht klein" onclick="csHint()">💡 Hulpstap</button></p>`) };
function csHint(){ const v=Q&&Q.vragen[Q.i], el=$('#csHint'); if(v&&v.hint&&el) el.innerHTML=`<span style="display:inline-block;background:var(--bg);padding:6px 10px;border-radius:10px;font-size:15px">💡 ${esc(v.hint)}</span>` }
const _klaarCs=klaar; klaar=function(){ if(!Q||Q.modus!=='casus') return _klaarCs();
  let p=0,m=0; Q.vragen.forEach((v,i)=>{ if(v._steun) return; if(v.t==='open'&&v._pt){ p+=v._pt.p; m+=v._pt.max } else { m+=1; if(Q.res[i]) p+=1 } });
  const pct=m?Math.round(p/m*100):0; S.cs=S.cs||{}; const r=S.cs[Q.casus]||{b:0,n:0}; const eerste=!r.n||r.b<70; r.n++; r.l=pct; r.b=Math.max(r.b||0,pct); r.t=Date.now(); S.cs[Q.casus]=r;
  if(pct>=70&&eerste) S.mVerd+=5;
  const nr=(CASUSSEN.find(c=>c.id===Q.casus)||{}).hfd; const terug=Q.terug; _klaarCs();
  const k=document.querySelector('.kaart.mid h2'); if(k) k.insertAdjacentHTML('afterend',`<p><b>Casusscore: ${pct}%</b>${pct>=70?' · casus gehaald ✅':' · haal 70% om de casus af te ronden'}${pct>=70&&eerste?' · +5 munten':''}</p>`);
};
// casusvragen ook vindbaar voor foutenschrift en herhaalronde
const _alleVragenCs=alleVragen; alleVragen=function(){ const out=_alleVragenCs(); CASUSSEN.forEach(c=>c.vragen.forEach((v,k)=>{ out.push(Object.assign({id:`cs.${c.id}.${k+1}`,w:CASUS_DOM,ctx:c.ctx,cs:c.id,titel:c.titel},v)) })); return out };

// ---------- schermen ----------
function csRij(c,open){ const r=(S.cs||{})[c.id];
  return `<button class="lv" onclick="${open?`startCasus('${c.id}')`:`melding('Gaat open na de proeftoets van dit hoofdstuk')`}" ${open?'':'style="opacity:.6"'}><span class="med">${open?(r&&r.b>=70?'✅':c.ic):'🔒'}</span><span style="flex:1"><b>${esc(c.titel)}</b><small>${esc(c.sub)} · ${c.lv==='toets'?'toetsniveau, met hulpstappen':'examenniveau'} · ${csVragen(c).length} vragen${r?` · beste score ${r.b}%`:''}</small></span><span class="zacht">${open?'›':''}</span></button>` }
function csBlok(nr,kort){ const h=csHfd(nr), open=csOpen(nr), l=csVan(nr); if(!l.length) return ''; const ex=csExamens(nr);
  const exr=ex[0]?(S.cs||{})['ex.'+ex[0].ex+'.'+ex[0].v[0].nr]:null;
  const exRij=ex.length?`<button class="lv" onclick="${open?`startCasusEx(${nr},0)`:`melding('Gaat open na de proeftoets van dit hoofdstuk')`}" ${open?'':'style="opacity:.6"'}><span class="med">${open?(exr&&exr.b>=70?'✅':'🎓'):'🔒'}</span><span style="flex:1"><b>Echte examenopgave: ${esc(ex[0].titel)}</b><small>Centraal examen ${exNaam(ex[0].ex)} · ${ex[0].v.length} vragen · eindexamenniveau${exr?` · beste score ${exr.b}%`:''}</small></span><span class="zacht">${open?'›':''}</span></button>
    ${open&&ex.length>1&&!kort?`<p class="zacht" style="font-size:14px;margin:6px 0 0">Meer examenopgaven over dit hoofdstuk: ${ex.slice(1).map((o,i)=>`<a href="#" onclick="startCasusEx(${nr},${i+1});return false">${esc(o.titel)} (${exNaam(o.ex)})</a>`).join(' · ')}</p>`:''}`:'';
  const klaar=l.filter(c=>((S.cs||{})[c.id]||{}).b>=70).length;
  return `<div class="kaart" style="margin-top:10px"><h3 class="zijkop" style="margin:0 0 4px">🧩 Casussen ${esc(h.naam.replace(/ · .*/,''))}${kort?'':' · '+esc(h.naam.replace(/^[^·]*· /,''))}</h3>
   <p class="zacht" style="margin:0 0 8px;font-size:14px">${open?`Grote opgaven met context, bronnen en open vragen, oplopend naar eindexamenniveau. ${klaar} van ${l.length} gehaald.`:'🔒 Gaat open als je de proeftoets van dit hoofdstuk voldoende hebt gemaakt, of brons hebt op alle levels van dit hoofdstuk.'}</p>
   ${l.map(c=>csRij(c,open)).join('')}${exRij}</div>`;
}
SCHERMEN.casussen=function(nr){
  const nrs=csHfdNrs(); setTimeout(()=>{ if(nr){ const el=document.getElementById('cs'+nr); if(el) el.scrollIntoView({block:'start'}) } },30);
  return `<div class="wrap" style="max-width:780px">${kop('Casussen per hoofdstuk',"go('leren')")}
   <div class="kaart"><p style="margin:0">Na het oefenen van een hoofdstuk ga je verder met <b>casussen</b>: grote opgaven met een context, tabellen en figuren, zoals in de toets en op het eindexamen. Per hoofdstuk zijn er vier casussen die moeilijker worden, en als laatste een echte examenopgave. Bij de casussen op toetsniveau kun je een hulpstap opvragen. Open vragen kijk je zelf na met het antwoordmodel.</p>
   <p class="zacht" style="margin:8px 0 0;font-size:14px">Een hoofdstuk gaat open als je de proeftoets voldoende hebt gemaakt, of brons hebt op alle levels. Een casus is gehaald bij 70% van de punten. Voorlopig voor het domein Markt (hoofdstuk 2 t/m 6).</p></div>
   ${nrs.map(n=>`<div id="cs${n}">${csBlok(n)}</div>`).join('')}</div>${VOET()}`;
};
// in het domein: casusblok onder elk hoofdstuk
function casusBlokVoor(w,hfd){ if(w!==CASUS_DOM||!hfd) return ''; const m=/Hoofdstuk\s+(\d+)/.exec(hfd); return m&&csVan(+m[1]).length?csBlok(+m[1],true):'' }
// tegel bij Leren en toetsen
const _lerenCs=SCHERMEN.leren; SCHERMEN.leren=function(){ return _lerenCs().replace(/(<button class="uitdaging" onclick="go\('proef'\)")/, `<button class="uitdaging" onclick="go('casussen')"><span class="thumb" style="background:var(--bg);display:grid;place-items:center;font-size:28px">🧩</span><span><b>Casussen per hoofdstuk</b><small>Grote opgaven met bronnen, op weg naar het examenniveau</small></span></button>$1`) };

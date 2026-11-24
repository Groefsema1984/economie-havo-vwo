// ===== Eindexamentrainer =====
// Per domein een onderwerp 'EX.X' voor examenvragen (alleen zichtbaar zodra er vragen zijn)
DOMEINEN.forEach(d=>{ EINDTERMEN['EX.'+d.id]={d:d.id,t:'Examenvragen '+d.naam.toLowerCase()} });
// Alleen de examenvragen van het eigen niveau (havo of vwo)
const exVragen = (n=niv()) => (typeof EXAMEN==='undefined'?[]:EXAMEN.vragen).filter(v=>!n||v.niv===n);
const exDomeinen = () => DOMEINEN.filter(d=>exVragen().some(v=>v.d===d.id));
const EX_IMG = 'examens/img/';
const exNaam = c => { const m=/^([hv])(\d\d)-(\d)$/.exec(c)||[]; return `${NIVEAUS[m[1]]||''} ${2000+ +m[2]} tijdvak ${m[3]}` };
function exLijst(n){ const m={}; exVragen(n).forEach(v=>{ (m[v.ex]=m[v.ex]||[]).push(v) }); return Object.keys(m).sort().reverse().map(c=>({c,v:m[c]})) }
const beheerst = v => { const r=S.vr[v.id]; return r && r.g>0 && (r.t? true:true) && r.g>=r.f };
let exTab='jaar';

SCHERMEN.examen = function(){
  const tot=exVragen().length, ok=exVragen().filter(beheerst).length;
  if(!tot) return `<div class="wrap">${kop('Eindexamentrainer',"go('home')")}<div class="kaart"><p style="margin:0">Er staan nog geen examenvragen voor ${NIVEAUS[niv()]} klaar. Ze komen hier zodra ze zijn toegevoegd.</p></div></div>`;
  const tabs=[['jaar','Per examen'],['domein','Per domein'],['tijd','Op tijd maken'],['print','Printen']].map(([k,t])=>`<button class="knop ${exTab===k?'':'zacht'}" onclick="exTab='${k}';go('examen')">${t}</button>`).join('');
  let inhoud='';
  if(exTab==='jaar') inhoud=`<div class="kaart">${exLijst().map(({c,v})=>{const b=v.filter(beheerst).length; return `<button class="lv" onclick="startExamen('${c}')"><span class="med">${b===v.length?'🏆':'📄'}</span><span style="flex:1"><b>Examen ${exNaam(c)}</b><small>${v.length} vragen · ${b} beheerst</small><div class="balk" style="margin-top:6px"><i style="width:${Math.round(b/v.length*100)}%"></i></div></span><span class="zacht">›</span></button>`}).join('')}</div>`;
  else if(exTab==='domein') inhoud=`<div class="kaart">${exDomeinen().map(d=>{const v=exVragen().filter(x=>x.d===d.id); const b=v.filter(beheerst).length; return `<button class="lv" onclick="startExDomein('${d.id}')"><span class="med">${d.icoon}</span><span style="flex:1"><b>${d.naam}</b><small>${v.length} vragen · ${b} beheerst · 10 per ronde, je zwakke vragen eerst</small><div class="balk" style="margin-top:6px"><i style="width:${Math.round(b/v.length*100)}%;background:${d.kleur}"></i></div></span><span class="zacht">›</span></button>`}).join('')}
     <button class="lv" onclick="startExMix()"><span class="med">🎲</span><span style="flex:1"><b>Alles door elkaar</b><small>10 willekeurige examenvragen</small></span><span class="zacht">›</span></button></div>`;
  else if(exTab==='tijd') inhoud=exTijdLijst();
  else inhoud=`<div class="kaart"><p style="margin-top:0">Kies wat je wilt printen. Je krijgt de vragen met de examenpagina's en bronnen, een antwoordblad en een antwoordenlijst voor de docent.</p>
     <label class="label">Examen</label><select id="prSel"><option value="">Alle examens per domein…</option>${exLijst().map(({c,v})=>`<option value="${c}">Examen ${exNaam(c)} (${v.length} vragen)</option>`).join('')}</select>
     <label class="label">Of een domein</label><select id="prDom"><option value="">–</option>${exDomeinen().map(d=>`<option value="${d.id}">${d.naam}</option>`).join('')}</select>
     <label class="label"><input type="checkbox" id="prAntw"> Antwoorden toevoegen (docentversie)</label>
     <div class="voet"><button class="knop" onclick="printExamen()">Maak printversie</button></div></div>`;
  return `<div class="wrap">${kop('Eindexamentrainer',"go('home')")}
   <div class="kaart" style="margin-bottom:14px"><b>${ok} van ${tot}</b> examenvragen beheerst<div class="balk" style="margin-top:8px"><i style="width:${Math.round(ok/tot*100)}%"></i></div>
   <p class="zacht" style="margin:8px 0 0;font-size:14px">Vragen uit de centrale examens economie ${NIVEAUS[niv()]}. Bij open vragen kijk je zelf na met het antwoordmodel. Een vraag is beheerst als je hem vaker goed dan fout hebt. Sprintrecord: ${(S.sprint||{}).best||0} van 15.</p></div>
   <div class="voet" style="justify-content:flex-start;margin-bottom:12px">${tabs}<button class="knop zacht" onclick="startSprint()">⚡ Examensprint</button></div>${inhoud}</div>`;
};

function exSet(v,titel,extra){ Q=Object.assign({modus:'examen',titel,kleur:'#1f2430',vragen:v,i:0,res:[],terug:"go('examen')"},extra||{}); go('quiz') }
function startExamen(c){ exSet(exVragen().filter(v=>v.ex===c).sort((a,b)=>a.nr-b.nr),'Examen '+exNaam(c)) }
function zwakFirst(v){ return shuffle(v).sort((a,b)=>{const s=x=>{const r=S.vr[x.id]; return r?(r.g-r.f):-0.5}; return s(a)-s(b)}) }
function startExDomein(d){ exSet(zwakFirst(exVragen().filter(v=>v.d===d)).slice(0,10),'Examen · '+DOMEINEN.find(x=>x.id===d).naam) }
function startExMix(){ exSet(shuffle(exVragen()).slice(0,10),'Examenvragen door elkaar') }
let sprintTimer=null;
function startSprint(){
  if(!exVragen().length){ melding('Er zijn nog geen examenvragen'); return }
  exSet(shuffle(exVragen()).slice(0,15),'Examensprint',{modus:'sprint',eind:Date.now()+20*60*1000});
  clearInterval(sprintTimer); sprintTimer=setInterval(()=>{ if(scherm!=='quiz'||Q.modus!=='sprint'){clearInterval(sprintTimer);return}
    const s=Math.max(0,Math.round((Q.eind-Date.now())/1000)); const el=$('#klok'); if(el) el.textContent=`⏱️ ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    if(s<=0){ clearInterval(sprintTimer); while(Q.res.length<Q.vragen.length){ Q.res.push(false) } klaar() } },1000);
}

// Extra opmaak bij examenvragen: context, afbeeldingen en bron
const _tekenVraag = tekenVraag;
tekenVraag = function(){
  _tekenVraag();
  const v=Q.vragen[Q.i];
  if(Q.modus==='sprint'){ const t=$('#qz .top .chip'); if(t) t.insertAdjacentHTML('beforebegin','<span class="chip" id="klok">⏱️</span>') }
  if(v.w!=='ex'&&!v.ex) return;
  const kaart=$('#qz .kaart');
  const kopTxt=`<p class="zacht" style="margin-top:0;font-size:13px">Examen ${v.jaar} tijdvak ${v.tv} · vraag ${v.nr}${v.titel?' · '+esc(v.titel):''}</p>`;
  const oud=kaart.querySelector(':scope > .vctx'); if(oud&&v.ctx) oud.remove();
  const ctx=v.ctx?`<div style="font-size:15px;background:var(--bg);border-radius:12px;padding:10px 12px;margin-bottom:12px">${fmt(v.ctx)}</div>`:'';
  const imgs=(v.img||[]).map((s,i)=>`<button class="knop zacht" style="min-height:40px;padding:6px 12px;font-size:14px" onclick="toonImg('${s}')">${s.includes('-b-')?'📊 Informatiebron':'📄 Examenpagina'}</button>`).join(' ');
  kaart.insertAdjacentHTML('afterbegin',kopTxt+ctx+(imgs?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">${imgs}</div><div id="imgBox"></div>`:''));
  if(!$('#qz .vraag .vtekst')) $('#qz .vraag').style.whiteSpace='pre-line';
  // toon bij een bron-vraag direct de eerste informatiebron, anders de examenpagina als er een figuur in staat
  const bron=(v.img||[]).find(s=>s.includes('-b-')); const fig=/grafiek|figuur|tabel|afbeelding|hieronder|lijn |oppervlakte|curve/i.test(v.q+' '+(v.o||[]).join(' '));
  if(bron) toonImg(bron); else if(fig&&(v.img||[]).length) toonImg(v.img[0]);
};
function toonImg(s){ const b=$('#imgBox'); if(!b) return; if(b.dataset.s===s){ b.innerHTML=''; b.dataset.s=''; return }
  b.dataset.s=s; b.innerHTML=`<div style="overflow:auto;max-height:70vh;border:1px solid var(--lijn);border-radius:12px;margin-bottom:12px;background:#fff"><img src="${EX_IMG}${s}.jpg" alt="Examenpagina" style="width:100%;display:block" onerror="this.parentNode.innerHTML='<p style=&quot;padding:12px&quot;>Afbeelding niet beschikbaar zonder internet.</p>'"></div>` }

// Resultaat van een examenronde
const _klaar = klaar;
klaar = function(){
  if(Q.modus==='examen'){ const n=Q.res.filter(Boolean).length; S.mVerd+=n>=Math.ceil(Q.vragen.length*0.7)?5:0 }
  _klaar();
};

// ===== Printen =====
function printExamen(){
  const c=$('#prSel').value, d=$('#prDom').value, antw=$('#prAntw').checked;
  let v = c ? exVragen().filter(x=>x.ex===c).sort((a,b)=>a.nr-b.nr) : d ? exVragen().filter(x=>x.d===d).sort((a,b)=>a.ex<b.ex?-1:a.ex>b.ex?1:a.nr-b.nr) : null;
  if(!v){ melding('Kies een examen of een domein'); return }
  const titel = c ? 'Examen economie '+exNaam(c) : 'Examenvragen '+DOMEINEN.find(x=>x.id===d).naam;
  const imgs=[...new Set(v.flatMap(x=>x.img||[]))];
  const w=window.open('','_blank'); if(!w){ melding('Sta pop-ups toe om te printen'); return }
  const L='ABCDE';
  w.document.write(`<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>${esc(titel)}</title><style>
   body{font:14px/1.45 Arial,sans-serif;color:#000;margin:24px} h1{font-size:20px} .v{break-inside:avoid;margin:0 0 18px} .v b{display:block}
   .ctx{color:#333;font-size:13px;margin:4px 0;white-space:pre-line} .o{margin-left:18px} img{width:100%;max-width:720px;display:block;margin:8px 0;break-inside:avoid}
   .pb{break-before:page} table{border-collapse:collapse} td,th{border:1px solid #999;padding:4px 10px}
   .knop{position:fixed;top:10px;right:10px;padding:10px 16px;font-size:16px} @media print{.knop{display:none}}</style></head><body>
   <button class="knop" onclick="print()">Printen</button><h1>${esc(titel)}</h1><p>Naam: ______________________ Klas: ______ </p>
   ${v.map((x,i)=>`<div class="v"><b>${i+1}. (${x.jaar} tv${x.tv}, vraag ${x.nr}${x.titel?' · '+esc(x.titel):''})</b>${x.ctx?`<div class="ctx">${esc(x.ctx)}</div>`:''}<div style="white-space:pre-line">${esc(x.q)}</div>${x.t==='open'?'<div style="height:90px;border-bottom:1px dotted #999"></div>':(x.o||[]).map((o,k)=>`<div class="o">${L[k]}&nbsp; ${esc(o)}</div>`).join('')}</div>`).join('')}
   <div class="pb"><h1>Examenpagina's en informatiebronnen</h1>${imgs.map(s=>`<p style="font-size:12px;margin:12px 0 0">${s.replace('-o-',' · examen p. ').replace('-b-',' · bijlage p. ')}</p><img src="${location.href.replace(/[^/]*$/,'')}${EX_IMG}${s}.jpg">`).join('')}</div>
   <div class="pb"><h1>Antwoordblad</h1><table><tr><th>Vraag</th><th>Antwoord</th></tr>${v.map((x,i)=>`<tr><td>${i+1}</td><td style="width:${antw&&x.t==='open'?'auto':'120px'};white-space:pre-line">${antw?(x.t==='open'?esc(x.model||''):L[x.a]):''}</td></tr>`).join('')}</table></div>
   </body></html>`);
  w.document.close();
}

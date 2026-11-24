// ===== Vaste begrippencombinaties: markeren in antwoordmodellen + oefenen =====
// Data staat in data-combinaties.js (COMBINATIES). Dit bestand voegt toe:
//  1. in elk antwoordmodel van een examenvraag de sleutelwoorden markeren + een kader met de vaste combinatie(s);
//  2. een scherm 'combi' (Begrippencombinaties) met uitleg per begrip, oefenrondes en examenvragen per combinatie.
const cbNiv = c => c.niv==='hv' || c.niv===niv();
const cbLijst = () => (typeof COMBINATIES==='undefined'?[]:COMBINATIES).filter(cbNiv);
const _cbRe = {}; const cbRe = (c,k) => _cbRe[c.id+k] || (_cbRe[c.id+k]=new RegExp(c[k],'i'));
// welke combinaties horen bij een examenvraag (vraag + antwoordmodel), alleen voor het niveau van de vraag
function cbVanVraag(v){
  if(!v||typeof COMBINATIES==='undefined') return [];
  if(v._cb) return v._cb;
  const t=(v.q||'')+' '+(v.model||'');
  return v._cb=COMBINATIES.filter(c=>(c.niv==='hv'||c.niv===v.niv)&&cbRe(c,'zoek').test(t));
}
// examenvragen (open) per combinatie, voor het eigen niveau
function cbExamen(c,n=niv()){ return exVragen(n).filter(v=>v.t==='open'&&cbVanVraag(v).includes(c)) }

document.head.insertAdjacentHTML('beforeend',`<style>
 mark.cbm{background:rgba(240,138,9,.28);color:inherit;border-radius:4px;padding:0 2px}
 .cbkader{margin-top:10px;border:2px solid #f08a09;border-radius:12px;padding:10px 12px;background:rgba(240,138,9,.07);font-size:15px}
 .cbkader .cbitem{margin-top:8px} .cbkader .cbkort{font-weight:700} .cbkader ol{margin:4px 0 0;padding-left:22px}
 .cbkaart small{display:block}
</style>`);
// --- 1. Markeren in het antwoordmodel ---
let _cbModel=null;
function cbModelVraag(t){
  if(!_cbModel){ _cbModel=new Map(); (typeof EXAMEN==='undefined'?[]:EXAMEN.vragen).forEach(v=>{ if(!v.model) return;
    const m=String(v.model); _cbModel.set(m,v); _cbModel.set(m.split(/\n\s*Puntenverdeling:?/)[0],v) }) }
  return _cbModel.get(String(t));
}
function cbMarkeer(html,cs){
  if(!cs.length) return html;
  const re=new RegExp('('+cs.map(c=>c.mark).join('|')+')','gi');
  return html.split(/(<[^>]+>)/).map(s=>s.startsWith('<')?s:s.replace(re,'<mark class="cbm">$1</mark>')).join('');
}
function cbKader(cs){
  if(!cs.length) return '';
  return `<div class="cbkader"><b>🔑 Vaste combinatie${cs.length>1?'s':''} in deze vraag</b>${cs.map(c=>`<div class="cbitem"><div class="cbkort">${esc(c.kort)}</div><ol>${c.el.map(e=>`<li>${esc(e)}</li>`).join('')}</ol></div>`).join('')}<button class="knop zacht" style="min-height:36px;padding:4px 12px;font-size:14px;margin-top:6px" onclick="cbOpen('${cs[0].id}')">Oefen deze combinatie${cs.length>1?'s':''}</button></div>`;
}
const _fmtCb = fmt;
fmt = function(t,opdracht){
  const html=_fmtCb(t,opdracht); if(opdracht||t==null) return html;
  const v=cbModelVraag(t); if(!v) return html;
  const cs=cbVanVraag(v); return cbMarkeer(html,cs)+cbKader(cs);
};

// --- 2. Oefenvragen maken ---
const cbSchoon = s => String(s).replace(/^\(|\)$/g,'').replace(/^\((.*?)\)\s*/,'$1 ');
function cbOefenvragen(c){
  const alle=cbLijst(), anderen=alle.filter(x=>x.id!==c.id), out=[];
  // a. examenstijl: schrijf de combinatie op en kijk na per element (deelscores)
  out.push({id:`cb.${c.id}.open`,gen:true,t:'open',niv:null,q:`Examentraining: wat moet er in je antwoord staan als je "${c.b.toLowerCase()}" moet uitleggen? Schrijf de vaste combinatie op met alle elementen die een corrector wil zien.`,
    model:c.el.map(e=>`• ${e} (1p)`).join('\n')+`\nLet op: ${c.vk}`,pnt:c.el.length,_cbid:c.id});
  // b. meerkeuze: welk element hoort erbij?
  c.el.forEach((e,k)=>{ if(k>1) return; const f=shuffle(c.fout.slice()).slice(0,3);
    out.push({id:`cb.${c.id}.mc${k}`,gen:true,t:'mc',q:`Welk element hoort in een goed antwoord bij "${c.b}"?`,o:[cbSchoon(e)].concat(f),a:0,u:c.kort,_cbid:c.id}) });
  // c. waar / niet waar
  out.push({id:`cb.${c.id}.wo1`,gen:true,t:'wo',q:`Bij "${c.b}" hoort in het correctiemodel: ${cbSchoon(pick(c.fout))}.`,a:false,u:c.kort,_cbid:c.id});
  out.push({id:`cb.${c.id}.wo2`,gen:true,t:'wo',q:`Bij "${c.b}" hoort in het correctiemodel: ${cbSchoon(pick(c.el))}.`,a:true,u:c.kort,_cbid:c.id});
  // d. koppelen: begrip ↔ combinatie (met drie andere begrippen)
  if(anderen.length>=3){ const set=[c].concat(shuffle(anderen.slice()).slice(0,3));
    out.push({id:`cb.${c.id}.kop`,gen:true,t:'koppel',q:'Koppel elk begrip aan de vaste combinatie uit het correctiemodel.',p:shuffle(set.map(x=>[x.b,x.kort.replace(/^[^=]*=\s*/,'')])),_cbid:c.id}) }
  return out;
}
function cbScore(c){ let g=0,f=0; for(const k in S.vr) if(k.startsWith('cb.'+c.id+'.')){ g+=S.vr[k].g; f+=S.vr[k].f } return {g,f,n:g+f} }
const cbBeheerst = c => { const s=cbScore(c); return s.g>=3&&s.g>=2*s.f };
function cbSet(v,titel){ Q={modus:'combi',titel,kleur:'#1f2430',vragen:v,i:0,res:[],terug:"go('combi')"}; go('quiz') }
function cbStartEen(id){ const c=COMBINATIES.find(x=>x.id===id); cbSet(shuffle(cbOefenvragen(c)),c.b) }
function cbStartMix(){
  // zwakste combinaties eerst, uit elke combinatie één of twee vragen
  const cs=cbLijst().slice().sort((a,b)=>{const s=x=>{const r=cbScore(x); return r.n?r.g/r.n:-1}; return s(a)-s(b)}).slice(0,8);
  const v=[]; cs.forEach((c,i)=>{ const q=cbOefenvragen(c).filter(x=>x.t!=='open'); const types=shuffle([...new Set(q.map(x=>x.t))]); types.slice(0,i<2?2:1).forEach(t=>v.push(pick(q.filter(x=>x.t===t)))) });
  cbSet(shuffle(v).slice(0,10),'Begrippencombinaties door elkaar');
}
function cbStartExamen(id){
  const c=id&&COMBINATIES.find(x=>x.id===id);
  const pool=c?cbExamen(c):exVragen().filter(v=>v.t==='open'&&cbVanVraag(v).length);
  if(!pool.length){ melding('Hier staan nog geen examenvragen bij'); return }
  exSet(zwakFirst(pool).slice(0,10),c?'Examenvragen · '+c.b:'Examenvragen met vaste combinaties',{terug:"go('combi')"});
}
// toelichting na een gemaakte oefenvraag: toon de hele combinatie
const _cbControleer = controleer;
controleer = function(){
  _cbControleer.apply(this,arguments);
  const v=Q&&Q.vragen&&Q.vragen[Q.i]; if(!v||!v._cbid||Q.fase==='zelf') return;
  const fb=$('#fb'); if(fb&&!fb.querySelector('.cbkader')) fb.insertAdjacentHTML('beforeend',cbKader([COMBINATIES.find(x=>x.id===v._cbid)]).replace(/<button[^]*<\/button>/,''));
};

// --- 3. Scherm ---
let cbOpenId=null;
function cbOpen(id){ cbOpenId=id; go('combi') }
SCHERMEN.combi = function(){
  const L=cbLijst(), ok=L.filter(cbBeheerst).length;
  const kaart=c=>{ const nh=cbExamen(c,'h').length, nv=cbExamen(c,'v').length, n=niv()==='v'?nv:nh, s=cbScore(c), open=cbOpenId===c.id;
    const exs=[...new Set(cbExamen(c).map(v=>v.ex))].sort().map(e=>`${2000+ +e.slice(1,3)}-${e.slice(4)}`);
    return `<div class="kaart cbkaart" id="cb-${c.id}"><button class="lv" style="border:0;padding:0" onclick="cbOpenId=cbOpenId==='${c.id}'?null:'${c.id}';go('combi')"><span class="med">${cbBeheerst(c)?'🏆':'🔑'}</span><span style="flex:1;text-align:left"><b>${esc(c.b)}</b><small>${esc(c.kort)}</small><small>${n} examenvra${n===1?'ag':'gen'} ${NIVEAUS[niv()]}${s.n?` · ${s.g} goed, ${s.f} fout`:''}</small></span><span class="zacht">${open?'⌃':'›'}</span></button>
     ${open?`<div style="margin-top:10px"><p style="margin:0 0 4px"><b>Dit moet in je antwoord:</b></p><ol style="margin:0 0 8px;padding-left:22px">${c.el.map(e=>`<li>${esc(e)}</li>`).join('')}</ol>
       <p class="vnoot" style="margin:0 0 8px">⚠️ ${esc(c.vk)}</p>${exs.length?`<p class="zacht" style="font-size:13px;margin:0 0 8px">Kwam voor in de examens ${NIVEAUS[niv()]}: ${exs.join(', ')}</p>`:''}
       <div class="voet" style="justify-content:flex-start"><button class="knop" onclick="cbStartEen('${c.id}')">Oefen</button>${n?`<button class="knop zacht" onclick="cbStartExamen('${c.id}')">Examenvragen (${n})</button>`:''}</div></div>`:''}</div>` };
  setTimeout(()=>{ if(cbOpenId){ const e=document.getElementById('cb-'+cbOpenId); if(e) e.scrollIntoView({block:'center'}) } },30);
  return `<div class="wrap">${kop('Begrippencombinaties',"go('examen')")}
   <div class="kaart" style="margin-bottom:14px"><b>${ok} van ${L.length}</b> combinaties beheerst<div class="balk" style="margin-top:8px"><i style="width:${L.length?Math.round(ok/L.length*100):0}%"></i></div>
   <p class="zacht" style="margin:8px 0 0;font-size:14px">In de correctievoorschriften van het eindexamen komen steeds dezelfde vaste combinaties terug. Je krijgt pas de punten als je álle elementen noemt. Voorbeeld: economische groei = toename van de productie / het bbp. Deze lijst komt uit alle examens ${NIVEAUS[niv()]} van 2018 tot en met 2026.</p></div>
   <div class="voet" style="justify-content:flex-start;margin-bottom:12px"><button class="knop" onclick="cbStartMix()">🎯 Oefen door elkaar</button><button class="knop zacht" onclick="cbStartExamen()">📄 Examenvragen met combinaties</button></div>
   ${L.map(kaart).join('')}</div>`;
};
// ingang vanuit de eindexamentrainer
const _cbExamenScherm = SCHERMEN.examen;
SCHERMEN.examen = function(){
  const html=_cbExamenScherm.apply(this,arguments);
  if(!exVragen().length||!cbLijst().length) return html;
  const kaart=`<button class="lv kaart" style="margin-bottom:14px;width:100%" onclick="cbOpenId=null;go('combi')"><span class="med">🔑</span><span style="flex:1;text-align:left"><b>Begrippencombinaties</b><small>De vaste combinaties uit de correctiemodellen (bijv. principaal-agent = tegengestelde belangen + asymmetrische informatie). Train ze, dan haal je meer punten.</small></span><span class="zacht">›</span></button>`;
  const i=html.indexOf('<div class="voet"'); return i>0?html.slice(0,i)+kaart+html.slice(i):html.replace(/<\/div>$/,kaart+'</div>');
};

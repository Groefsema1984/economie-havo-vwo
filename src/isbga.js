// ===== IS-MB-GA-model (alleen vwo) =====
// Sinds 2023 zit er in elk centraal examen economie vwo een opgave met het IS-MB-GA-model.
// Hier staan die opgaven apart, met een korte uitleg. Lijst met de hand samengesteld uit de examens.
const ISMBGA = [
  {ex:'v26-2',nrs:[15,16]},{ex:'v26-1',nrs:[12,13]},{ex:'v25-2',nrs:[24,25]},{ex:'v25-1',nrs:[23,24,25]},
  {ex:'v24-2',nrs:[11,12,13,14,15]},{ex:'v24-1',nrs:[18,19,20,21]},{ex:'v23-2',nrs:[21,22,23,24,25]},{ex:'v23-1',nrs:[21,22,23,24]},
];
// voorloper: hetzelfde idee met een GV-curve (gevraagde productie) in plaats van IS en MB
const ISMBGA_VOOR = [{ex:'v21-2',nrs:[16,17,18,19,20]},{ex:'v19-1',nrs:[6,7,8,9]}];

const isbgaOpg = lijst => lijst.map(o=>Object.assign({},o,{v:exVragen('v').filter(x=>x.ex===o.ex&&o.nrs.includes(Math.floor(x.nr))).sort((a,b)=>a.nr-b.nr)})).filter(o=>o.v.length);
const isbgaAlle = () => isbgaOpg(ISMBGA).flatMap(o=>o.v);

function isbgaFiguur(){
  const as='stroke="currentColor" stroke-width="1.5" fill="none"', t='fill="currentColor" font-size="13"';
  return `<svg viewBox="0 0 300 330" style="max-width:300px;width:100%;color:var(--tekst,#1f2430)" role="img" aria-label="IS-MB-GA-model: boven de IS-curve en de MB-lijn, onder de GA-curve">
   <path d="M40 10 V150 H285" ${as}/><text x="8" y="18" ${t}>r</text><text x="275" y="168" ${t}>Y</text>
   <path d="M70 30 L250 140" stroke="#2a6fdb" stroke-width="2.5" fill="none"/><text x="252" y="136" fill="#2a6fdb" font-size="13" font-weight="700">IS</text>
   <path d="M40 85 H270" stroke="#d1495b" stroke-width="2.5" fill="none"/><text x="262" y="78" fill="#d1495b" font-size="13" font-weight="700">MB</text>
   <path d="M160 10 V320" stroke="currentColor" stroke-dasharray="4 4" opacity=".5"/>
   <path d="M40 180 V320 H285" ${as}/><text x="8" y="188" ${t}>π</text><text x="275" y="315" ${t}>Y</text>
   <path d="M60 300 Q160 270 250 195" stroke="#2e9e6b" stroke-width="2.5" fill="none"/><text x="236" y="190" fill="#2e9e6b" font-size="13" font-weight="700">GA</text>
   <text x="150" y="168" ${t}>Y*</text><circle cx="160" cy="85" r="4" fill="currentColor"/><circle cx="160" cy="268" r="4" fill="currentColor"/></svg>`;
}

function isbgaLijst(){
  const opg=isbgaOpg(ISMBGA), alle=opg.flatMap(o=>o.v), b=alle.filter(beheerst).length, p=alle.reduce((a,v)=>a+(v.pnt||1),0);
  const knop='style="min-height:36px;padding:4px 12px;font-size:14px"';
  const rij=o=>{ const bo=o.v.filter(beheerst).length, po=o.v.reduce((a,v)=>a+(v.pnt||1),0);
    return `<button class="lv" onclick="startIsbga('${o.ex}')"><span class="med">${bo===o.v.length?'🏆':'📈'}</span><span style="flex:1"><b>${esc(o.v[0].titel||'Opgave')}</b><small>Examen ${exNaam(o.ex)} · vraag ${o.nrs[0]} t/m ${o.nrs[o.nrs.length-1]} · ${po} punten · ${bo} van ${o.v.length} beheerst</small></span><span class="zacht">›</span></button>` };
  const voor=isbgaOpg(ISMBGA_VOOR);
  return `<div class="kaart"><p style="margin-top:0"><b>Vaste prik sinds 2023.</b> In alle ${opg.length} centrale examens vwo vanaf 2023 zit een opgave met het IS-MB-GA-model, samen ${p} punten. Hier staan ze bij elkaar: ${alle.length} vragen, ${b} beheerst.</p>
   <div class="balk" style="margin-bottom:12px"><i style="width:${Math.round(b/(alle.length||1)*100)}%"></i></div>
   <div class="voet" style="justify-content:flex-start;gap:8px;flex-wrap:wrap;margin:0"><button class="knop" ${knop} onclick="startIsbgaMix()">🎯 Oefen 10 vragen, zwakste eerst</button><button class="knop zacht" ${knop} onclick="isbgaUitleg=!isbgaUitleg;go('examen')">📖 ${isbgaUitleg?'Verberg de uitleg':'Lees eerst de uitleg'}</button></div></div>
   ${isbgaUitleg?isbgaTheorie():''}
   <div class="sectie">Per examenopgave (vragen in volgorde)</div><div class="kaart">${opg.map(rij).join('')}</div>
   ${voor.length?`<div class="sectie">Voorloper: het GV-GA-model</div><div class="kaart"><p class="zacht" style="margin-top:0;font-size:14px">In 2019 en 2021 werd hetzelfde idee gevraagd met een GV-curve (gevraagde productie) in plaats van IS en MB. Goede extra oefening voor het redeneren met inflatie en de output gap.</p>${voor.map(rij).join('')}</div>`:''}`;
}
let isbgaUitleg=false;

function isbgaTheorie(){
  return `<div class="kaart"><h3 style="margin-top:0">Het IS-MB-GA-model in het kort</h3>
   <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start"><div style="flex:0 1 300px">${isbgaFiguur()}</div><div style="flex:1 1 260px;font-size:15px">
   <p style="margin-top:0">Het model heeft twee figuren boven elkaar met dezelfde horizontale as: de <b>productie Y</b>. Bij <b>Y*</b> is de output gap nul: de economie draait op haar evenwichtsniveau.</p>
   <p><b style="color:#2a6fdb">IS-curve</b> (boven, reële rente r tegen Y). Bij een lagere reële rente gaan investeringen en consumptie omhoog, dus de bestedingen en de productie stijgen. Daarom daalt de curve. De IS verschuift als de bestedingen veranderen om een andere reden dan de rente: overheidsbestedingen, belastingen, export, of het vertrouwen van consumenten en producenten. Meer bestedingen: IS naar rechts.</p>
   <p><b style="color:#d1495b">MB-lijn</b> (boven). De centrale bank kiest de reële rente: een horizontale lijn. Ligt de inflatie boven het doel van ongeveer 2%, dan verhoogt de centrale bank de rente (MB omhoog). Ligt de inflatie eronder, dan verlaagt ze de rente (MB omlaag). Het snijpunt van IS en MB geeft de productie.</p>
   <p><b style="color:#2e9e6b">GA-curve</b> (onder, inflatie π tegen Y). Produceert de economie meer dan Y*, dan wordt de arbeidsmarkt krap, stijgen de lonen sneller en gaat de inflatie omhoog. Daarom stijgt de curve. Bij Y* is de inflatie gelijk aan de verwachte inflatie. Veranderen de inflatieverwachtingen, of is er een aanbodschok zoals duurdere energie, dan verschuift de GA.</p></div></div>
   <h3>Zo redeneer je in stappen</h3>
   <ol style="font-size:15px;padding-left:20px;margin-bottom:0">
    <li>Wat verandert er, en welke curve verschuift daardoor? Bestedingen → IS. Rentebesluit → MB. Verwachtingen of kosten → GA.</li>
    <li>Wat gebeurt er met Y in de bovenste figuur (nieuw snijpunt IS en MB)?</li>
    <li>Wat betekent die Y voor de inflatie? Lees af op de GA in de onderste figuur.</li>
    <li>Hoe reageert de centrale bank op die inflatie? MB omhoog of omlaag, en wat doet dat weer met Y?</li>
    <li>Blijft de inflatie lang hoog, dan stijgen de inflatieverwachtingen en schuift de GA omhoog. Op den duur eindigt de economie weer bij Y*, met een stabiele inflatie.</li></ol>
   <h3>Vaak gevraagd</h3>
   <ul style="font-size:15px;padding-left:20px;margin-bottom:0">
    <li><b>Hoe steil is de GA?</b> Een flexibele arbeidsmarkt (lonen passen zich snel aan) geeft een steilere GA: een kleine output gap geeft dan al veel inflatie.</li>
    <li><b>Hoe steil is de IS?</b> Reageren de bestedingen sterk op de rente, dan is de IS vlak en werkt een renteverandering van de centrale bank sterk door op Y. Reageren ze weinig, dan is de IS steil en werkt monetair beleid zwak.</li>
    <li><b>Dilemma voor de centrale bank:</b> bij een aanbodschok (GA omhoog) stijgt de inflatie terwijl de productie niet groeit. Renteverhoging remt de inflatie maar maakt de output gap negatiever.</li>
    <li><b>Teken je antwoord:</b> geef bij een verschuiving met een pijl de richting aan en zet het nieuwe evenwicht in beide figuren.</li></ul></div>`;
}

function startIsbga(c){ const o=isbgaOpg(ISMBGA.concat(ISMBGA_VOOR)).find(x=>x.ex===c); if(o) exSet(o.v,'IS-MB-GA · '+exNaam(c),{terug:"exTab='isbga';go('examen')"}) }
function startIsbgaMix(){ exSet(zwakFirst(isbgaAlle()).slice(0,10),'IS-MB-GA-model',{terug:"exTab='isbga';go('examen')"}) }

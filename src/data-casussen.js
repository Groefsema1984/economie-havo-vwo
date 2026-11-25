// ===== Casussen per hoofdstuk (domein D Markt) =====
// Na de proeftoets van een hoofdstuk (of brons op alle levels) gaan 5 casussen open: 4 eigen casussen die oplopen
// van toetsniveau met hulpstappen naar examenniveau, en als vijfde een echte examenopgave over hetzelfde onderwerp.
// Een casus = context met bronnen (tabel of figuur) + 3 tot 6 vragen. Typen zoals elders: reken, mc, koppel, open (zelf nakijken).
// Bedrijven, getallen en teksten zijn eigen werk; opbouw naar het voorbeeld van de grote opgaven in de methode en het examen.
// Velden casus: id, hfd (hoofdstuknummer), niv ('' = havo en vwo), lv ('toets' = met hulpstappen, 'examen'), ic, titel, sub, ctx, fig (svg)
// Velden vraag: zoals overal, plus hint (hulpstap) en niv ('v' = alleen vwo).
const cR=(q,a,eh,u,x)=>Object.assign({t:'reken',q,a,eh,u},x||{});
const cM=(q,goed,fout,u,x)=>Object.assign({t:'mc',q,o:[goed].concat(fout),a:0,u},x||{});
const cO=(q,pnt,model,x)=>Object.assign({t:'open',q,pnt,model},x||{});
const cK=(q,p,u,x)=>Object.assign({t:'koppel',q,p,u},x||{});

// eenvoudige lijnenfiguur: lijnen [{p:[[x,y],..],k:kleur,l:label}], assen met labels, optionele stippellijnen
function casusFig(o){
  const W=360,H=240,L=46,B=200,T=14,Rr=340, sx=x=>L+(x/o.xmax)*(Rr-L), sy=y=>B-(y/o.ymax)*(B-T);
  let g=`<path d="M${L} ${T-4} V${B} H${Rr+6}" stroke="currentColor" fill="none" stroke-width="1.4"/>`;
  g+=`<text x="${L-6}" y="${T}" text-anchor="end" font-size="11" fill="currentColor">${o.ylab}</text><text x="${Rr+4}" y="${B+16}" text-anchor="end" font-size="11" fill="currentColor">${o.xlab}</text>`;
  (o.yt||[]).forEach(v=>{ g+=`<text x="${L-5}" y="${sy(v)+4}" text-anchor="end" font-size="10" fill="currentColor">${String(v).replace('.',',')}</text><path d="M${L-3} ${sy(v)} H${L}" stroke="currentColor"/>` });
  (o.xt||[]).forEach(v=>{ g+=`<text x="${sx(v)}" y="${B+14}" text-anchor="middle" font-size="10" fill="currentColor">${v}</text><path d="M${sx(v)} ${B} V${B+3}" stroke="currentColor"/>` });
  (o.stip||[]).forEach(([x,y])=>{ g+=`<path d="M${L} ${sy(y)} H${sx(x)} V${B}" stroke="currentColor" stroke-dasharray="3 3" opacity=".55" fill="none"/>` });
  (o.lijnen||[]).forEach(l=>{ g+=`<polyline points="${l.p.map(([x,y])=>sx(x)+','+sy(y)).join(' ')}" fill="none" stroke="${l.k}" stroke-width="2.4"/>`;
    const [x,y]=l.p[l.p.length-1]; g+=`<text x="${sx(x)+4}" y="${sy(y)+(l.dy||0)}" font-size="12" font-weight="700" fill="${l.k}">${l.l}</text>` });
  return `<svg viewBox="0 0 ${W} ${H}" style="max-width:420px;width:100%;color:var(--ink,#1f2430)" role="img" aria-label="${o.titel||'Figuur'}">${g}</svg>${o.titel?`<p class="zacht" style="font-size:13px;margin:2px 0 0">${o.titel}</p>`:''}`;
}
const cBL='#2a6fdb', cRD='#d1495b', cGR='#2e9e6b';

const CASUSSEN=[
// ---------------- Hoofdstuk 2 · Consumentengedrag ----------------
{id:'d2a',hfd:2,niv:'',lv:'toets',ic:'🎫',titel:'Kaartjes voor het schoolfeest',sub:'Betalingsbereidheid en consumentensurplus',
 ctx:`De leerlingenraad verkoopt kaartjes voor het schoolfeest. In een vriendengroep van vijf heeft iedereen een andere betalingsbereidheid. De prijs van een kaartje is € 50.
Leerling | Betalingsbereidheid
Anna | € 90
Bram | € 75
Chris | € 60
Dewi | € 45
Eva | € 30`,
 vragen:[
  cR('Hoeveel leerlingen uit deze groep kopen een kaartje bij een prijs van € 50?',3,'','Anna, Bram en Chris hebben een betalingsbereidheid van € 50 of meer.',{e:'D.vraag',hint:'Iemand koopt als de betalingsbereidheid minstens zo hoog is als de prijs.'}),
  cR('Bereken het totale consumentensurplus van deze groep bij een prijs van € 50.',75,'€','(90 − 50) + (75 − 50) + (60 − 50) = 40 + 25 + 10 = € 75.',{e:'D.vraag',hint:'Consumentensurplus per koper = betalingsbereidheid − prijs. Tel alleen de kopers op.'}),
  cR('De prijs stijgt naar € 70. Bereken het nieuwe consumentensurplus van de groep.',25,'€','Alleen Anna (90) en Bram (75) kopen nog: (90 − 70) + (75 − 70) = 20 + 5 = € 25.',{e:'D.vraag'}),
  cO('Het consumentensurplus daalt bij de prijsstijging om twee redenen. Leg beide redenen uit met de gegevens uit de tabel.',2,`• Kopers die blijven kopen (Anna en Bram) betalen € 20 meer, dus hun surplus daalt (1p)
• Chris koopt niet meer, omdat zijn betalingsbereidheid (€ 60) lager is dan de nieuwe prijs; zijn surplus van € 10 verdwijnt helemaal (1p)`,{e:'D.vraag'}),
 ]},
{id:'d2b',hfd:2,niv:'',lv:'toets',ic:'📺',titel:'Streamingdienst verhoogt de prijs',sub:'Prijselasticiteit en omzet',
 ctx:`Streamingdienst Flixa verhoogt het abonnement van € 10 naar € 12 per maand. Het aantal abonnees daalt daarna van 2,0 miljoen naar 1,8 miljoen. Andere factoren blijven gelijk.`,
 vragen:[
  cR('Bereken de procentuele verandering van de prijs.',20,'%','(12 − 10) / 10 × 100% = 20%.',{e:'D.elas',hint:'Procentuele verandering = (nieuw − oud) / oud × 100%.'}),
  cR('Bereken de procentuele verandering van het aantal abonnees.',-10,'%','(1,8 − 2,0) / 2,0 × 100% = −10%.',{e:'D.elas',hint:'Let op het minteken: het aantal abonnees daalt.'}),
  cR('Bereken de prijselasticiteit van de vraag.',-0.5,'','Ev = %ΔQ / %ΔP = −10 / 20 = −0,5.',{e:'D.elas',hint:'Prijselasticiteit = procentuele verandering van de gevraagde hoeveelheid gedeeld door procentuele verandering van de prijs.'}),
  cM('Hoe noem je deze vraag?','Prijsinelastisch',['Prijselastisch','Volkomen inelastisch','Inkomensinelastisch'],'De absolute waarde van Ev (0,5) ligt tussen 0 en 1: de afzet reageert minder dan evenredig op de prijs.',{e:'D.elas'}),
  cR('Bereken de procentuele verandering van de omzet van Flixa.',8,'%','Oud: 2,0 mln × € 10 = € 20 mln. Nieuw: 1,8 mln × € 12 = € 21,6 mln. (21,6 − 20) / 20 × 100% = +8%.',{e:'D.elas'}),
  cO('Leg met de prijselasticiteit uit waarom de omzet van Flixa stijgt.',2,`• De vraag is prijsinelastisch: het aantal abonnees daalt procentueel minder (10%) dan de prijs stijgt (20%) (1p)
• Omzet = prijs × afzet; het prijseffect is groter dan het afzeteffect, dus de omzet stijgt (1p)`,{e:'D.elas'}),
 ]},
{id:'d2c',hfd:2,niv:'',lv:'toets',ic:'🛒',titel:'Inkomen en de boodschappenkar',sub:'Inkomenselasticiteit en soorten goederen',
 ctx:`Een supermarktketen onderzoekt wat er gebeurt met de verkopen als het inkomen van haar klanten stijgt. In een jaar waarin het gemiddelde reële inkomen met 5% steeg, veranderde de afzet zo:
Product | Verandering afzet
Biologische groente | +8%
Huismerk pasta | −2%
Brood | +1%`,
 vragen:[
  cR('Bereken de inkomenselasticiteit van biologische groente.',1.6,'','Ei = %ΔQ / %ΔY = 8 / 5 = 1,6.',{e:'D.elas',hint:'Inkomenselasticiteit = procentuele verandering van de afzet gedeeld door procentuele verandering van het inkomen.'}),
  cK('Koppel elk product aan het soort goed.',[['Biologische groente','Luxe goed (Ei > 1)'],['Huismerk pasta','Inferieur goed (Ei < 0)'],['Brood','Noodzakelijk goed (0 < Ei < 1)']],'Bio: Ei = 1,6. Huismerk pasta: Ei = −2 / 5 = −0,4. Brood: Ei = 1 / 5 = 0,2.',{e:'D.elas'}),
  cR('Bereken de inkomenselasticiteit van huismerk pasta.',-0.4,'','Ei = −2 / 5 = −0,4.',{e:'D.elas'}),
  cO('Economen verwachten volgend jaar een recessie, waarin het reële inkomen met 3% daalt. Leg uit hoe het aandeel van huismerkproducten in de totale verkoop van de supermarkt dan verandert.',2,`• Bij een daling van het inkomen stijgt de vraag naar inferieure goederen zoals huismerk pasta (1p)
• De vraag naar luxe goederen zoals biologische groente daalt meer dan evenredig, dus het aandeel huismerk in de verkoop stijgt (1p)`,{e:'D.elas'}),
 ]},
{id:'d2d',hfd:2,niv:'',lv:'examen',ic:'🚲',titel:'Deelfietsen in de stad',sub:'Vraagfunctie, surplus en de keuze van de gemeente',
 ctx:`De gemeente Rivierstad biedt deelfietsen aan. Uit onderzoek blijkt dat voor de vraag naar ritten per dag geldt:
Qv = −400P + 2.400
Qv = aantal ritten per dag, P = prijs per rit in euro's.
De huidige prijs is € 2 per rit. De gemeente wil dat er meer gefietst wordt, maar wil ook meer opbrengst om de fietsen te onderhouden.`,
 fig:()=>casusFig({xmax:2600,ymax:7,xlab:'Q (ritten)',ylab:'P (€)',xt:[800,1600,2400],yt:[2,4,6],stip:[[1600,2]],lijnen:[{p:[[0,6],[2400,0]],k:cBL,l:'V',dy:-6}],titel:'Figuur 1 · De vraaglijn naar deelfietsritten'}),
 vragen:[
  cR('Bereken het aantal ritten per dag bij de huidige prijs.',1600,'','Qv = −400 × 2 + 2.400 = 1.600 ritten.',{e:'D.vraag'}),
  cR('Bereken het consumentensurplus per dag bij de huidige prijs.',3200,'€','De vraaglijn snijdt de prijsas bij P = 6 (Qv = 0). Surplus = ½ × 1.600 × (6 − 2) = € 3.200.',{e:'D.vraag',hint:'Het consumentensurplus is de driehoek tussen de vraaglijn en de prijs. Bepaal eerst bij welke prijs Qv = 0.'}),
  cR('De gemeente overweegt de prijs te verhogen naar € 2,50. Bereken de prijselasticiteit van de vraag bij deze prijsverhoging.',-0.5,'','Qv wordt −400 × 2,5 + 2.400 = 1.400. %ΔQ = (1.400 − 1.600) / 1.600 = −12,5%. %ΔP = 25%. Ev = −12,5 / 25 = −0,5.',{e:'D.elas'}),
  cO('De wethouder zegt: "Met een lagere prijs krijgen we meer ritten én meer opbrengst." Leg uit dat dit hier niet klopt.',2,`• Bij een lagere prijs stijgt het aantal ritten (1p)
• Maar de vraag is prijsinelastisch (Ev = −0,5): het aantal ritten stijgt procentueel minder dan de prijs daalt, dus de opbrengst daalt (1p)`,{e:'D.elas'}),
  cR('Na een prijsverhoging van de buskaartjes met 10% stijgt het aantal deelfietsritten met 3%. Bereken de kruislingse prijselasticiteit.',0.3,'','Ek = %ΔQ fietsritten / %ΔP bus = 3 / 10 = 0,3. Positief: substituten.',{e:'D.elas',niv:'v'}),
  cM('Het regent een week lang en er worden bij elke prijs minder ritten gevraagd. Wat gebeurt er in figuur 1?','De vraaglijn verschuift naar links',['Er is een beweging langs de vraaglijn naar boven','De vraaglijn wordt steiler maar verschuift niet','De vraaglijn verschuift naar rechts'],'Het weer is een andere factor dan de prijs: bij elke prijs wordt minder gevraagd, dus de hele lijn verschuift naar links.',{e:'D.vraag'}),
 ]},

// ---------------- Hoofdstuk 3 · Producentengedrag ----------------
{id:'d3a',hfd:3,niv:'',lv:'toets',ic:'🥖',titel:'Bakkerij De Korrel',sub:'Kosten, break-even en winst',
 ctx:`Bakkerij De Korrel bakt alleen broden. Per week zijn de constante kosten € 3.000 (huur, oven, verzekering). De variabele kosten zijn € 1,20 per brood (meel, energie, verpakking). Een brood kost in de winkel € 3,20. Gewoonlijk verkoopt de bakker 2.000 broden per week.`,
 vragen:[
  cR('Bereken de totale kosten per week bij 2.000 broden.',5400,'€','TK = TCK + TVK = 3.000 + 2.000 × 1,20 = € 5.400.',{e:'D.kosten',hint:'Totale kosten = constante kosten + variabele kosten per stuk × aantal.'}),
  cR('Bereken de gemiddelde totale kosten (GTK) per brood bij 2.000 broden.',2.7,'€','GTK = 5.400 / 2.000 = € 2,70.',{e:'D.kosten'}),
  cR('Bereken de break-evenafzet per week.',1500,'','Break-even: TCK / (P − GVK) = 3.000 / (3,20 − 1,20) = 1.500 broden.',{e:'D.kosten',hint:'Elk brood levert P − GVK op als bijdrage aan de constante kosten. Hoeveel broden heb je nodig voor € 3.000?'}),
  cR('Bereken de winst per week bij 2.000 broden.',1000,'€','TO = 2.000 × 3,20 = 6.400. Winst = 6.400 − 5.400 = € 1.000.',{e:'D.kosten'}),
  cR('De bakker verlaagt de prijs naar € 3,00 en verkoopt dan 2.200 broden per week. Bereken de nieuwe winst.',960,'€','TO = 2.200 × 3 = 6.600. TK = 3.000 + 2.200 × 1,20 = 5.640. Winst = € 960.',{e:'D.kosten'}),
  cO('Geef de bakker advies over de prijsverlaging. Gebruik je berekeningen en noem ook een reden die niet uit de cijfers volgt.',2,`• Afwijzen: de winst daalt van € 1.000 naar € 960 (1p)
• Een juiste andere overweging, bijvoorbeeld: meer klanten kopen er misschien ook gebak bij, of de bakker moet langer werken voor minder winst (1p)`,{e:'D.kosten'}),
 ]},
{id:'d3b',hfd:3,niv:'',lv:'toets',ic:'🍓',titel:'Aardbeienkwekers',sub:'Aanbodlijn en producentensurplus',
 ctx:`Op de markt voor aardbeien in de Betuwe geldt voor het collectieve aanbod:
Qa = 50P − 100
Qa = aangeboden hoeveelheid in duizenden bakjes per week, P = prijs per bakje in euro's.
De marktprijs is € 4 per bakje.`,
 fig:()=>casusFig({xmax:160,ymax:5,xlab:'Q (×1.000)',ylab:'P (€)',xt:[50,100,150],yt:[2,4],stip:[[100,4]],lijnen:[{p:[[0,2],[150,5]],k:cRD,l:'A'}],titel:'Figuur 1 · De aanbodlijn van aardbeien'}),
 vragen:[
  cR('Bereken de aangeboden hoeveelheid bij een prijs van € 4 (in duizenden bakjes).',100,'','Qa = 50 × 4 − 100 = 100 (duizend bakjes).',{e:'D.vraag'}),
  cR('Bij welke prijs wordt er niets meer aangeboden?',2,'€','0 = 50P − 100 → P = € 2.',{e:'D.vraag',hint:'Vul Qa = 0 in en los P op.'}),
  cR('Bereken het producentensurplus per week in euro\'s.',100000,'€','PS = ½ × 100.000 × (4 − 2) = € 100.000.',{e:'D.vraag',hint:'Het producentensurplus is de driehoek tussen de prijs en de aanbodlijn. Let op: Q is in duizenden.',tol:1}),
  cO('Leg uit waarom de aanbodlijn van de kwekers samen omhoog loopt.',2,`• Bij een hogere prijs is het ook voor kwekers met hogere kosten (per bakje) winstgevend om te produceren / de marginale kosten stijgen bij meer productie (1p)
• Daardoor wordt bij een hogere prijs een grotere hoeveelheid aangeboden (1p)`,{e:'D.vraag'}),
  cM('De lonen van aardbeienplukkers stijgen. Wat gebeurt er met de aanbodlijn?','Die verschuift naar links (omhoog)',['Die verschuift naar rechts (omlaag)','Die blijft liggen; de vraaglijn verschuift','Er is een beweging langs de aanbodlijn'],'Hogere kosten: bij elke prijs wordt minder aangeboden.',{e:'D.vraag'}),
 ]},
{id:'d3c',hfd:3,niv:'',lv:'examen',ic:'🏭',titel:'Fietsenfabriek Trapper',sub:'MO = MK en maximale winst',
 ctx:`Fietsenfabriek Trapper verkoopt e-bikes op een markt met veel aanbieders. De prijs is € 400 per fiets (exclusief kosten van de dealer). Voor de totale kosten per maand geldt:
TK = 0,5Q² + 100Q + 20.000
TK = totale kosten in euro's, Q = aantal fietsen per maand.`,
 vragen:[
  cM('Welke formule geldt voor de marginale kosten (MK)?','MK = Q + 100',['MK = 0,5Q + 100','MK = Q² + 100','MK = 100'],'MK is de afgeleide van TK: 0,5 × 2 × Q + 100 = Q + 100.',{e:'D.kosten'}),
  cR('Bereken bij welke productie de winst maximaal is.',300,'','MO = P = 400. MO = MK → 400 = Q + 100 → Q = 300.',{e:'D.kosten',hint:'Bij een vaste prijs is de marginale opbrengst gelijk aan de prijs. Stel MO = MK.'}),
  cR('Bereken de maximale totale winst per maand.',25000,'€','TO = 400 × 300 = 120.000. TK = 0,5 × 90.000 + 30.000 + 20.000 = 95.000. Winst = € 25.000.',{e:'D.kosten'}),
  cO('Een manager stelt voor 350 fietsen per maand te maken, "want dan verkopen we meer". Leg uit waarom de winst dan lager is dan bij 300 fietsen.',2,`• Bij productie boven 300 zijn de marginale kosten hoger dan de marginale opbrengst (bijvoorbeeld bij 350: MK = 450 > MO = 400) (1p)
• Elke extra fiets kost dan meer dan hij opbrengt, dus de totale winst daalt (1p)`,{e:'D.kosten'}),
  cM('De huur van de fabriek stijgt met € 5.000 per maand. Wat gebeurt er met de winstmaximaliserende productie?','Die blijft 300, want de marginale kosten veranderen niet',['Die daalt, want de kosten stijgen','Die stijgt, om de hogere kosten terug te verdienen','Die wordt 0, want er wordt verlies gemaakt'],'Huur is een constante kost en zit niet in MK. De winst daalt wel met € 5.000.',{e:'D.kosten'}),
 ]},
{id:'d3d',hfd:3,niv:'',lv:'examen',ic:'🏋️',titel:'Sportschool kiest een formule',sub:'Break-even, capaciteit en risico',
 ctx:`Sportschool FitPunt heeft per jaar € 180.000 constante kosten. De variabele kosten zijn € 60 per lid per jaar. Een lidmaatschap kost € 300 per jaar. Er is plaats voor maximaal 1.000 leden; nu zijn er 900.
De eigenaar overweegt een budgetformule:
- contributie € 240 per jaar
- verwacht aantal leden: 1.200
- daarvoor is een uitbreiding nodig, waardoor de constante kosten € 30.000 per jaar hoger worden; de nieuwe capaciteit is 1.250 leden`,
 vragen:[
  cR('Bereken de break-evenafzet (aantal leden) in de huidige situatie.',750,'','180.000 / (300 − 60) = 750 leden.',{e:'D.kosten'}),
  cR('Bereken de winst in de huidige situatie.',36000,'€','900 × (300 − 60) − 180.000 = 216.000 − 180.000 = € 36.000.',{e:'D.kosten'}),
  cR('Bereken de verwachte winst bij de budgetformule.',6000,'€','1.200 × (240 − 60) − 210.000 = 216.000 − 210.000 = € 6.000.',{e:'D.kosten'}),
  cR('Bereken de break-evenafzet bij de budgetformule (rond af naar boven op hele leden).',1167,'','210.000 / (240 − 60) = 1.166,7 → 1.167 leden.',{e:'D.kosten'}),
  cO('Geef de eigenaar een onderbouwd advies over de budgetformule. Gebruik twee argumenten uit je berekeningen.',3,`• Afwijzen: de verwachte winst daalt van € 36.000 naar € 6.000 (1p)
• De break-evenafzet (1.167) ligt dicht bij het verwachte aantal leden (1.200) en de capaciteit (1.250): als er iets minder leden komen, is er al verlies (1p)
• Het risico neemt dus toe, terwijl de winst daalt (1p)`,{e:'D.kosten'}),
 ]},

// ---------------- Hoofdstuk 4 · Volledige mededinging ----------------
{id:'d4a',hfd:4,niv:'',lv:'toets',ic:'🌷',titel:'De markt voor tulpenbollen',sub:'Marktevenwicht en prijsmechanisme',
 ctx:`Op de veiling worden dagelijks tulpenbollen verhandeld door veel kwekers en veel inkopers. Alle bollen van een soort zijn gelijk en iedereen ziet de prijzen op het veilingscherm. Voor één soort geldt:
Qv = −2P + 120
Qa = 4P − 60
Q in miljoenen bollen, P in eurocent per bol.`,
 fig:()=>casusFig({xmax:130,ymax:65,xlab:'Q (mln)',ylab:'P (ct)',xt:[30,60,90,120],yt:[15,30,45,60],stip:[[60,30]],lijnen:[{p:[[0,60],[120,0]],k:cBL,l:'V',dy:-6},{p:[[0,15],[120,45]],k:cRD,l:'A'}],titel:'Figuur 1 · Vraag en aanbod van tulpenbollen'}),
 vragen:[
  cM('Welk kenmerk van volledige mededinging staat NIET in de tekst?','Vrije toe- en uittreding',['Homogene producten','Een transparante markt','Veel aanbieders en vragers'],'Homogeen (gelijke bollen), transparant (veilingscherm) en veel aanbieders en vragers staan erin. Over toe- en uittreding staat niets.',{e:'D.vorm'}),
  cR('Bereken de evenwichtsprijs in eurocent.',30,'','−2P + 120 = 4P − 60 → 6P = 180 → P = 30 cent.',{e:'D.vraag',hint:'In evenwicht geldt Qv = Qa. Zet de twee formules gelijk aan elkaar.'}),
  cR('Bereken de evenwichtshoeveelheid in miljoenen bollen.',60,'','Qv = −2 × 30 + 120 = 60 miljoen.',{e:'D.vraag'}),
  cR('Stel dat de prijs op de veiling 35 cent is. Bereken het aanbodoverschot in miljoenen bollen.',30,'','Qa = 4 × 35 − 60 = 80. Qv = −2 × 35 + 120 = 50. Overschot = 30 miljoen.',{e:'D.vraag'}),
  cO('Leg uit hoe het prijsmechanisme ervoor zorgt dat het overschot bij 35 cent verdwijnt.',2,`• Bij een aanbodoverschot daalt de prijs, omdat kwekers hun bollen anders niet verkopen (1p)
• Door de lagere prijs stijgt de gevraagde hoeveelheid en daalt de aangeboden hoeveelheid, tot Qv = Qa bij 30 cent (1p)`,{e:'D.vraag'}),
 ]},
{id:'d4b',hfd:4,niv:'',lv:'toets',ic:'🍅',titel:'Tuinders en de marktprijs',sub:'Bedrijfsevenwicht en de marginale producent',
 ctx:`De markt voor trostomaten is een markt van volledige mededinging. De marktprijs is € 0,80 per kilo. Drie tuinders produceren op hun maximale capaciteit van 500.000 kilo per jaar. Hun gemiddelde totale kosten (GTK) zijn:
Tuinder | GTK per kilo
Akker | € 0,60
Bloem | € 0,78
Claes | € 0,90`,
 vragen:[
  cM('Waarom kan Claes zijn prijs niet verhogen om zijn verlies goed te maken?','Hij is hoeveelheidsaanpasser: tegen een hogere prijs koopt niemand zijn tomaten',['De overheid verbiedt een hogere prijs','Zijn kosten zijn te laag','Hij is prijszetter, maar mag het niet'],'Bij volledige mededinging zijn producten homogeen en is de markt transparant; vragers kopen dan bij een ander.',{e:'D.vorm'}),
  cR('Bereken de winst van Akker per jaar.',100000,'€','(0,80 − 0,60) × 500.000 = € 100.000.',{e:'D.kosten',hint:'Winst = (prijs − GTK) × afzet.'}),
  cR('Bereken het resultaat van Claes per jaar (een verlies vul je in met een minteken).',-50000,'€','(0,80 − 0,90) × 500.000 = −€ 50.000.',{e:'D.kosten'}),
  cM('Wie is de marginale producent?','Bloem',['Akker','Claes','Geen van drieën'],'De marginale producent heeft de hoogste kosten van de aanbieders die nog net kunnen blijven: Bloem (GTK € 0,78 < € 0,80). Claes maakt verlies.',{e:'D.vorm'}),
  cO('De vraag naar tomaten stijgt sterk en de marktprijs gaat naar € 1,00. Leg uit wat er op lange termijn met de prijs gebeurt.',2,`• De hoge winsten trekken nieuwe aanbieders aan / bestaande tuinders breiden uit, dus het marktaanbod stijgt (aanbodlijn naar rechts) (1p)
• Daardoor daalt de prijs weer, tot er geen bijzondere winst meer is voor de marginale producent (1p)`,{e:'D.vorm'}),
 ]},
{id:'d4c',hfd:4,niv:'',lv:'examen',ic:'☕',titel:'Koffiebonen en het surplus',sub:'Consumenten-, producenten- en totaal surplus',
 ctx:`Op de markt voor koffiebonen met keurmerk geldt:
Qv = −10P + 500
Qa = 10P − 100
Q in duizenden kilo's per maand, P in euro's per kilo.`,
 fig:()=>casusFig({xmax:520,ymax:55,xlab:'Q (×1.000 kg)',ylab:'P (€)',xt:[100,200,300,400,500],yt:[10,30,50],stip:[[200,30]],lijnen:[{p:[[0,50],[500,0]],k:cBL,l:'V',dy:-6},{p:[[0,10],[450,55]],k:cRD,l:'A'}],titel:'Figuur 1 · De markt voor koffiebonen'}),
 vragen:[
  cR('Bereken de evenwichtsprijs.',30,'€','−10P + 500 = 10P − 100 → 20P = 600 → P = € 30.',{e:'D.vraag'}),
  cR('Bereken het consumentensurplus per maand in duizenden euro\'s.',2000,'','Q = 200. Vraaglijn snijdt de prijsas bij 50. CS = ½ × 200 × (50 − 30) = 2.000 (duizend euro).',{e:'D.vraag',tol:0.5}),
  cR('Bereken het totale surplus per maand in duizenden euro\'s.',4000,'','PS = ½ × 200 × (30 − 10) = 2.000. Totaal = 2.000 + 2.000 = 4.000 (duizend euro).',{e:'D.vraag',tol:0.5}),
  cO('Door een goede oogst verschuift de aanbodlijn naar rechts. Leg uit wat er gebeurt met het consumentensurplus.',2,`• De evenwichtsprijs daalt en de evenwichtshoeveelheid stijgt (1p)
• Bestaande kopers betalen minder en er komen kopers bij, dus het consumentensurplus stijgt (1p)`,{e:'D.vraag'}),
  cM('Waarom is het totale surplus bij volledige mededinging maximaal?','Alle ruil waarbij de betalingsbereidheid hoger is dan de kosten van de aanbieder vindt plaats',['Omdat de producenten geen winst maken','Omdat de prijs zo laag mogelijk is','Omdat de overheid de prijs vaststelt'],'Er wordt geproduceerd tot het punt waar de vraaglijn de aanbodlijn snijdt: er is geen welvaartsverlies.',{e:'D.vraag'}),
 ]},
{id:'d4d',hfd:4,niv:'',lv:'examen',ic:'🎄',titel:'Kerstbomen in december',sub:'Verschuiving van de vraag en het producentensurplus',
 ctx:`Kerstbomen worden verkocht door veel kwekers. In november geldt:
Qv = −5P + 400
Qa = 10P − 80
Q in duizenden bomen, P in euro's per boom.
In december stijgt de vraag: Qv wordt −5P + 460. Het aanbod blijft gelijk.
Een krant kopt: "Kwekers verhogen in december de prijzen om meer te verdienen."`,
 fig:()=>casusFig({xmax:440,ymax:95,xlab:'Q (×1.000)',ylab:'P (€)',xt:[100,200,300,400],yt:[20,40,60,80],stip:[[240,32],[280,36]],lijnen:[{p:[[0,80],[400,0]],k:cBL,l:'V nov',dy:-6},{p:[[0,92],[430,6]],k:'#7a4fd6',l:'V dec',dy:-6},{p:[[0,8],[400,48]],k:cRD,l:'A'}],titel:'Figuur 1 · De kerstbomenmarkt in november en december'}),
 vragen:[
  cR('Bereken de evenwichtsprijs in november.',32,'€','−5P + 400 = 10P − 80 → 15P = 480 → P = € 32 (Q = 240).',{e:'D.vraag'}),
  cR('Bereken de evenwichtsprijs in december.',36,'€','−5P + 460 = 10P − 80 → 15P = 540 → P = € 36 (Q = 280).',{e:'D.vraag'}),
  cR('Bereken met hoeveel procent de prijs stijgt.',12.5,'%','(36 − 32) / 32 × 100% = 12,5%.',{e:'D.vraag'}),
  cR('Bereken hoeveel het producentensurplus in december hoger is dan in november (in duizenden euro\'s).',1040,'','Aanbodlijn snijdt de prijsas bij P = 8. Nov: ½ × 240 × 24 = 2.880. Dec: ½ × 280 × 28 = 3.920. Verschil 1.040 (duizend euro).',{e:'D.vraag',tol:0.5}),
  cO('Leg uit dat de kop in de krant niet klopt.',3,`• Bij volledige mededinging kan een individuele kweker de prijs niet bepalen: hij is hoeveelheidsaanpasser (1p)
• De vraag stijgt, waardoor er bij de oude prijs van € 32 een vraagoverschot ontstaat (1p)
• Door het vraagoverschot stijgt de marktprijs (prijsmechanisme) en bieden kwekers langs de aanbodlijn meer aan (1p)`,{e:'D.vorm'}),
 ]},

// ---------------- Hoofdstuk 5 · Economische macht ----------------
{id:'d5a',hfd:5,niv:'',lv:'toets',ic:'🏷️',titel:'Vier markten, vier marktvormen',sub:'Marktvormen herkennen en prijszetting',
 ctx:`Vier korte berichten:
- 1. In Nederland is er per regio maar één netbeheerder die elektriciteitskabels mag aanleggen.
- 2. In de binnenstad zitten twintig kappers. Elke kapper heeft een eigen stijl en vaste klanten.
- 3. Drie grote telecombedrijven delen samen bijna de hele markt voor mobiel internet.
- 4. Tarwe wordt op de wereldmarkt verhandeld door duizenden boeren en handelaren tegen één prijs.`,
 vragen:[
  cK('Koppel elk bericht aan de marktvorm.',[['1. Netbeheerder','Monopolie'],['2. Kappers','Monopolistische concurrentie'],['3. Telecom','Oligopolie'],['4. Tarwe','Volledige mededinging']],'Eén aanbieder = monopolie; veel aanbieders met heterogene producten = monopolistische concurrentie; enkele grote aanbieders = oligopolie; veel aanbieders met een homogeen product = volledige mededinging.',{e:'D.vorm'}),
  cO('Leg uit waarom een kapper zijn prijs iets kan verhogen zonder al zijn klanten te verliezen.',2,`• Het product is heterogeen: klanten vinden de stijl of de kapper zelf belangrijk (klantenbinding) (1p)
• Daardoor kiezen niet alle klanten meteen een andere kapper; de kapper heeft een eigen dalende afzetlijn (1p)`,{e:'D.vorm'}),
  cM('Wat is typisch voor een oligopolie zoals bij de telecombedrijven?','Bedrijven houden rekening met de reactie van de concurrenten',['Elk bedrijf is hoeveelheidsaanpasser','Er is vrije toetreding zonder kosten','Er is maar één aanbieder'],'Bij weinig aanbieders heeft een prijsverlaging van de een direct gevolgen voor de ander: onderlinge afhankelijkheid.',{e:'D.vorm'}),
  cO('Noem een toetredingsdrempel bij de markt voor mobiel internet en leg uit waarom die de concurrentie beperkt.',2,`• Een juiste drempel, bijvoorbeeld: hoge kosten voor een eigen netwerk / dure frequentievergunningen (1p)
• Nieuwe aanbieders kunnen daardoor moeilijk toetreden, dus blijven er weinig aanbieders met marktmacht (1p)`,{e:'D.vorm'}),
 ]},
{id:'d5b',hfd:5,niv:'',lv:'examen',ic:'💊',titel:'Een monopolist met een patent',sub:'MO = MK, prijs, winst en welvaartsverlies',
 ctx:`Farmaceut Medix heeft een patent op een nieuw medicijn en is daardoor monopolist. Voor de vraag geldt:
P = −0,02Q + 100
De marginale kosten zijn constant: MK = 20. De constante kosten zijn € 40.000 per maand.
P in euro's per verpakking, Q aantal verpakkingen per maand.`,
 fig:()=>casusFig({xmax:5200,ymax:105,xlab:'Q',ylab:'P (€)',xt:[2000,4000],yt:[20,60,100],stip:[[2000,60]],lijnen:[{p:[[0,100],[5000,0]],k:cBL,l:'GO',dy:-6},{p:[[0,100],[2500,0]],k:cGR,l:'MO'},{p:[[0,20],[5000,20]],k:cRD,l:'MK',dy:-6}],titel:'Figuur 1 · Afzetlijn (GO), MO en MK van Medix'}),
 vragen:[
  cM('Welke formule geldt voor de marginale opbrengst?','MO = −0,04Q + 100',['MO = −0,02Q + 100','MO = −0,01Q + 100','MO = 100'],'TO = P × Q = −0,02Q² + 100Q. MO = −0,04Q + 100: twee keer zo steil als de afzetlijn.',{e:'D.vorm'}),
  cR('Bereken de afzet waarbij de winst van Medix maximaal is.',2000,'','MO = MK → −0,04Q + 100 = 20 → Q = 2.000.',{e:'D.vorm',hint:'Een monopolist maximaliseert de winst waar MO = MK.'}),
  cR('Bereken de prijs die Medix vraagt.',60,'€','P = −0,02 × 2.000 + 100 = € 60.',{e:'D.vorm',hint:'Vul de afzet in de vraagfunctie (afzetlijn) in, niet in de MO-formule.'}),
  cR('Bereken de maximale winst per maand.',40000,'€','(60 − 20) × 2.000 − 40.000 = € 40.000.',{e:'D.vorm'}),
  cR('Als het patent afloopt, komt er volledige mededinging en wordt P = MK. Bereken het welvaartsverlies dat bij het monopolie optreedt.',40000,'€','Bij P = 20: Q = (100 − 20) / 0,02 = 4.000. Welvaartsverlies = ½ × (4.000 − 2.000) × (60 − 20) = € 40.000.',{e:'D.vorm'}),
  cO('Leg uit waarom de overheid toch patenten geeft, ook al ontstaat er welvaartsverlies.',2,`• Zonder patent kunnen concurrenten het medicijn direct namaken en verdient de uitvinder de hoge ontwikkelkosten niet terug (1p)
• Het patent stimuleert dus innovatie: zonder patent zou het medicijn er misschien helemaal niet komen (1p)`,{e:'D.falen'}),
 ]},
{id:'d5c',hfd:5,niv:'',lv:'examen',ic:'🎬',titel:'Studentenkorting in de bioscoop',sub:'Prijsdiscriminatie',
 ctx:`Bioscoop Lumen verkoopt op een gewone avond 300 kaartjes van € 12. De bioscoop voert een studentenkorting in: met een geldige studentenpas kost een kaartje € 8. De marginale kosten per bezoeker (schoonmaak, personeel) zijn € 1. Er zijn genoeg lege stoelen.
Verwachting: er komen 100 studenten extra die anders niet zouden komen. Van de 300 bezoekers die al kwamen, zijn er 40 student; zij gaan ook € 8 betalen.`,
 vragen:[
  cM('Welke twee voorwaarden moeten gelden voor prijsdiscriminatie?','De markten zijn te scheiden en de prijsgevoeligheid verschilt per groep',['Er is volledige mededinging en het product is homogeen','De overheid geeft toestemming en de kosten zijn gelijk','Alle klanten hebben dezelfde betalingsbereidheid'],'Doorverkoop moet onmogelijk zijn (studentenpas) en studenten moeten prijsgevoeliger zijn.',{e:'D.prijsdisc'}),
  cR('Bereken hoeveel de winst stijgt door de 100 extra studenten.',700,'€','100 × (8 − 1) = € 700.',{e:'D.prijsdisc'}),
  cR('Bereken hoeveel winst de bioscoop misloopt doordat de 40 studenten die al kwamen nu € 8 betalen.',160,'€','40 × (12 − 8) = € 160.',{e:'D.prijsdisc'}),
  cR('Bereken de totale verandering van de winst per avond.',540,'€','700 − 160 = € 540.',{e:'D.prijsdisc'}),
  cO('Leg uit waarom de studentenpas nodig is voor het succes van deze korting.',2,`• Met de pas kan de bioscoop de groepen scheiden: alleen studenten krijgen de lage prijs (1p)
• Zonder controle zou iedereen € 8 betalen en daalt de opbrengst van de groep die € 12 wil betalen (1p)`,{e:'D.prijsdisc'}),
 ]},
{id:'d5d',hfd:5,niv:'',lv:'examen',ic:'🏗️',titel:'Een kartel in de bouw',sub:'Kartels, ACM en welvaart',
 ctx:`De Autoriteit Consument en Markt (ACM) heeft vier wegenbouwers betrapt. Ze spraken af wie welke aanbesteding van de provincie zou winnen; de anderen schreven bewust te hoog in. De ACM legt een boete op van 10% van de jaaromzet. De vier bedrijven hadden samen een jaaromzet van € 45 miljoen.`,
 vragen:[
  cR('Bereken de totale boete in miljoenen euro\'s.',4.5,'','10% × 45 = 4,5 miljoen.',{e:'D.falen'}),
  cM('Welke vorm van concurrentiebeperking is dit?','Een kartel (marktverdeling en prijsafspraak)',['Een fusie','Prijsdiscriminatie','Een patent'],'Bedrijven die zelfstandig blijven maar afspraken maken over prijs of markt vormen een kartel.',{e:'D.vorm'}),
  cO('Leg uit wat dit kartel betekent voor de welvaart van de provincie en haar inwoners.',2,`• De provincie betaalt een hogere prijs dan bij echte concurrentie, dus belastinggeld wordt duurder besteed / het consumentensurplus daalt (1p)
• Er gaat welvaart verloren, omdat minder of duurder wordt gebouwd dan bij concurrentie / het surplus verschuift naar de bouwers (1p)`,{e:'D.falen'}),
  cO('Kartels vallen vaak uit elkaar, ook zonder ACM. Leg uit waarom.',2,`• Elk lid kan extra winst maken door stiekem net onder de afgesproken prijs in te schrijven (1p)
• Als de leden dat van elkaar verwachten, houdt niemand zich aan de afspraak (het kartel is instabiel) (1p)`,{e:'D.vorm'}),
 ]},

// ---------------- Hoofdstuk 6 · Overheidsingrijpen ----------------
{id:'d6a',hfd:6,niv:'',lv:'toets',ic:'🏠',titel:'Een maximumhuur',sub:'Maximumprijs en tekort',
 ctx:`In een studentenstad geldt voor de markt van studentenkamers:
Qv = −2P + 2.400
Qa = P − 300
Q = aantal kamers, P = huur per maand in euro's.
De gemeente stelt een maximumhuur in van € 750 per maand.`,
 fig:()=>casusFig({xmax:1300,ymax:1300,xlab:'Q (kamers)',ylab:'P (€)',xt:[450,600,900],yt:[300,750,900,1200],stip:[[600,900]],lijnen:[{p:[[0,1200],[1300,550]],k:cBL,l:'V',dy:-6},{p:[[0,300],[900,1200]],k:cRD,l:'A'},{p:[[0,750],[1300,750]],k:'#888',l:'max',dy:-6}],titel:'Figuur 1 · De markt voor studentenkamers'}),
 vragen:[
  cR('Bereken de evenwichtshuur zonder maximum.',900,'€','−2P + 2.400 = P − 300 → 3P = 2.700 → P = € 900 (Q = 600).',{e:'D.vraag'}),
  cR('Bereken het aantal kamers dat wordt aangeboden bij de maximumhuur.',450,'','Qa = 750 − 300 = 450.',{e:'D.falen',hint:'Vul de maximumprijs in de aanbodfunctie in.'}),
  cR('Bereken het tekort aan kamers bij de maximumhuur.',450,'','Qv = −2 × 750 + 2.400 = 900. Tekort = 900 − 450 = 450.',{e:'D.falen'}),
  cM('Welk gevolg past bij dit tekort?','Er ontstaan wachtlijsten en een zwarte markt',['Er komen veel lege kamers','De huur stijgt tot € 900','Verhuurders gaan meer kamers bouwen'],'Bij een tekort zoeken vragers andere manieren om aan een kamer te komen.',{e:'D.falen'}),
  cO('Geef een reden voor de gemeente om een maximumhuur in te stellen en een nadeel ervan.',2,`• Reden: kamers betaalbaar houden voor studenten met een laag inkomen (1p)
• Nadeel: er worden minder kamers aangeboden (450 in plaats van 600), dus minder studenten vinden een kamer / welvaartsverlies (1p)`,{e:'D.falen'}),
 ]},
{id:'d6b',hfd:6,niv:'',lv:'toets',ic:'🥛',titel:'Een minimumprijs voor melk',sub:'Minimumprijs, overschot en kosten voor de overheid',
 ctx:`Een land wil de inkomens van melkveehouders beschermen. Op de markt voor melk geldt:
Qv = −100P + 200
Qa = 150P − 50
Q in miljoenen liters per maand, P in euro's per liter.
De overheid stelt een minimumprijs in van € 1,20 en koopt het overschot op.`,
 vragen:[
  cR('Bereken de evenwichtsprijs.',1,'€','−100P + 200 = 150P − 50 → 250P = 250 → P = € 1,00.',{e:'D.vraag'}),
  cR('Bereken het overschot bij de minimumprijs (in miljoenen liters).',50,'','Qa = 150 × 1,2 − 50 = 130. Qv = −100 × 1,2 + 200 = 80. Overschot = 50 miljoen liter.',{e:'D.falen',hint:'Bereken bij € 1,20 de aangeboden en de gevraagde hoeveelheid.'}),
  cR('Bereken wat het opkopen van het overschot de overheid per maand kost (in miljoenen euro\'s).',60,'','50 miljoen × € 1,20 = € 60 miljoen.',{e:'D.falen'}),
  cM('Wat gebeurt er met het consumentensurplus door de minimumprijs?','Het daalt',['Het stijgt','Het blijft gelijk','Het verschuift naar de overheid zonder te veranderen'],'Consumenten betalen meer en kopen minder.',{e:'D.falen'}),
  cO('Leg uit waarom deze minimumprijs welvaartsverlies veroorzaakt.',2,`• Er wordt meer geproduceerd (130) dan consumenten willen kopen tegen die prijs; de productiekosten van het overschot zijn hoger dan wat het oplevert (1p)
• Daarnaast betaalt de belastingbetaler voor het opkopen, terwijl consumenten minder kopen dan in evenwicht (1p)`,{e:'D.falen'}),
 ]},
{id:'d6c',hfd:6,niv:'',lv:'examen',ic:'🥤',titel:'Een suikertaks op frisdrank',sub:'Accijns: doorberekening, opbrengst en welvaartsverlies',
 ctx:`De regering wil dat mensen minder suikerhoudende frisdrank drinken en voert een accijns in van € 0,50 per fles. Op de markt voor frisdrank gold vóór de accijns:
Qv = −40P + 160
Qa = 40P − 40
Q in miljoenen flessen per maand, P in euro's per fles.
Door de accijns wordt de aanbodfunctie: Qa = 40P − 60.`,
 fig:()=>casusFig({xmax:170,ymax:4.3,xlab:'Q (mln)',ylab:'P (€)',xt:[50,60,100],yt:[1,2.5,2.75,4],stip:[[60,2.5],[50,2.75]],lijnen:[{p:[[0,4],[160,0]],k:cBL,l:'V',dy:-6},{p:[[0,1],[120,4]],k:cRD,l:'A'},{p:[[0,1.5],[100,4]],k:'#7a4fd6',l:'A+acc'}],titel:'Figuur 1 · De frisdrankmarkt met en zonder accijns'}),
 vragen:[
  cR('Bereken de evenwichtsprijs zonder accijns.',2.5,'€','−40P + 160 = 40P − 40 → 80P = 200 → P = € 2,50 (Q = 60).',{e:'D.heffing'}),
  cR('Bereken de nieuwe prijs met accijns.',2.75,'€','−40P + 160 = 40P − 60 → 80P = 220 → P = € 2,75 (Q = 50).',{e:'D.heffing'}),
  cR('Bereken welk percentage van de accijns wordt doorberekend aan de consument.',50,'%','(2,75 − 2,50) / 0,50 × 100% = 50%.',{e:'D.heffing',hint:'Vergelijk de prijsstijging voor de consument met de accijns per fles.'}),
  cR('Bereken de accijnsopbrengst voor de overheid per maand (in miljoenen euro\'s).',25,'','50 miljoen flessen × € 0,50 = € 25 miljoen.',{e:'D.heffing'}),
  cR('Bereken het welvaartsverlies per maand (in miljoenen euro\'s).',2.5,'','½ × (60 − 50) × 0,50 = 2,5 miljoen.',{e:'D.heffing'}),
  cO('Een politicus zegt: "Deze taks levert veel geld op, maar helpt weinig voor de gezondheid." Leg uit dat beide delen van deze uitspraak samenhangen met de prijselasticiteit van de vraag.',2,`• Hoe prijsinelastischer de vraag, hoe minder de consumptie daalt door de hogere prijs (hier van 60 naar 50 miljoen flessen) (1p)
• Omdat er veel blijft verkocht, is de accijnsopbrengst hoog; het doel (minder suiker) wordt dus maar beperkt bereikt (1p)`,{e:'D.heffing'}),
 ]},
{id:'d6d',hfd:6,niv:'',lv:'examen',ic:'✈️',titel:'Een vliegtaks tegen vervuiling',sub:'Externe effecten en een heffing',
 ctx:`Vliegen veroorzaakt CO₂-uitstoot en geluidsoverlast. Die externe kosten zijn volgens onderzoekers € 30 per vliegticket. Voor korte vakantievluchten vanaf een regionaal vliegveld geldt:
Qv = −0,5P + 150
Qa = P − 30
Q in duizenden tickets per jaar, P in euro's per ticket.
De overheid overweegt een heffing van € 30 per ticket. De aanbodfunctie wordt dan Qa = P − 60.`,
 vragen:[
  cR('Bereken de hoeveelheid tickets zonder heffing (in duizenden).',90,'','−0,5P + 150 = P − 30 → 1,5P = 180 → P = 120, Q = 90.',{e:'D.falen'}),
  cR('Bereken de hoeveelheid tickets met heffing (in duizenden).',80,'','−0,5P + 150 = P − 60 → 1,5P = 210 → P = 140, Q = 80.',{e:'D.falen'}),
  cR('Bereken welk percentage van de heffing in de ticketprijs wordt doorberekend.',66.7,'%','De prijs stijgt van € 120 naar € 140: 20 / 30 × 100% = 66,7%.',{e:'D.heffing'}),
  cO('Leg uit waarom deze heffing de welvaart kan verhogen, terwijl een accijns normaal juist welvaartsverlies geeft.',3,`• Zonder heffing zitten de externe kosten niet in de prijs, dus wordt er meer gevlogen dan maatschappelijk wenselijk (overproductie) (1p)
• De heffing is gelijk aan de externe kosten: de vervuiler betaalt en de externe kosten worden in de prijs verwerkt (internaliseren) (1p)
• De hoeveelheid daalt naar het maatschappelijk optimum (80 duizend), waardoor het welvaartsverlies door het externe effect verdwijnt (1p)`,{e:'D.falen'}),
  cM('Welke andere maatregel pakt hetzelfde externe effect aan?','Verhandelbare emissierechten voor luchtvaartmaatschappijen',['Een maximumprijs voor tickets','Een subsidie op vliegtickets','Een minimumloon voor piloten'],'Emissierechten geven de uitstoot een prijs, net als een heffing.',{e:'D.falen'}),
 ]},
];

// echte examenopgave als vijfde casus: zoekwoorden per hoofdstuk (op vraag + antwoordmodel)
const CASUS_EXAMEN={
  2:'elastic|betalingsbereid|consumentensurplus|vraaglijn|inferieur|luxe goed',
  3:'constante kosten|variabele kosten|break-?even|\\bGTK\\b|\\bGVK\\b|\\bMK\\b|marginale kosten|totale winst',
  4:'volledige mededinging|volkomen concurrentie|evenwichtsprijs|marktevenwicht|surplus|aanbodlijn|homogeen',
  5:'monopol|oligopol|kartel|prijsdiscriminatie|\\bMO\\b|marginale opbrengst|marktmacht|toetreding',
  6:'accijns|heffing|subsidie|minimumprijs|maximumprijs|extern\\w* effect|quotum|doorberek',
};

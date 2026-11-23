// ===== Domein D: Markt =====
const BEGRIPPEN_D = {
  'Marktevenwicht':'De prijs waarbij de gevraagde en de aangeboden hoeveelheid gelijk zijn.',
  'Prijselasticiteit':'De procentuele verandering van de gevraagde hoeveelheid gedeeld door de procentuele verandering van de prijs.',
  'Consumentensurplus':'Wat consumenten maximaal willen betalen min wat ze werkelijk betalen.',
  'Volkomen concurrentie':'Veel aanbieders en vragers, homogeen product, doorzichtige markt en vrije toetreding.',
  'Monopolie':'Eén aanbieder op de markt.',
  'Oligopolie':'Enkele grote aanbieders die rekening houden met elkaars gedrag.',
  'Marginale opbrengst':'De extra opbrengst van één extra verkochte eenheid.',
  'Extern effect':'Een gevolg van productie of consumptie voor anderen, dat niet in de prijs zit.',
  'Maximumprijs':'Een door de overheid vastgestelde prijs waar niet boven mag worden verkocht.'
};
LEVELS.D = [
 {id:'D.0', naam:'Startset: de markt', kort:'Vraag en aanbod, elasticiteit, marktvormen, marktfalen', vragen:[
  {id:'D.0.01', t:'mc', e:'D.vraag', q:'De prijs van een product stijgt. Wat gebeurt er volgens de vraaglijn?', o:['De gevraagde hoeveelheid daalt: een beweging langs de vraaglijn','De vraaglijn verschuift naar links','De vraaglijn verschuift naar rechts','De gevraagde hoeveelheid stijgt'], a:0, u:'Een prijsverandering van het product zelf geeft een beweging langs de lijn, geen verschuiving.'},
  {id:'D.0.02', t:'mc', e:'D.vraag', b:'Marktevenwicht', q:'Het inkomen van consumenten stijgt (het gaat om een normaal goed). Wat is het gevolg?', o:['De vraaglijn verschuift naar rechts en de evenwichtsprijs stijgt','De vraaglijn verschuift naar links en de evenwichtsprijs daalt','De aanbodlijn verschuift naar rechts','Er is een beweging langs de vraaglijn'], a:0, u:'Bij elke prijs wordt meer gevraagd. Bij gelijk aanbod stijgt de evenwichtsprijs.'},
  {id:'D.0.03', t:'mc', e:'D.falen', b:'Maximumprijs', q:'De overheid stelt een maximumprijs vast onder de evenwichtsprijs. Wat ontstaat er?', o:['Een vraagoverschot (tekort)','Een aanbodoverschot','Een nieuw evenwicht bij een hogere prijs','Niets, de markt past zich aan'], a:0, u:'Bij de lage prijs willen meer mensen kopen dan er wordt aangeboden.'},
  {id:'D.0.04', t:'mc', e:'D.elas', b:'Prijselasticiteit', q:'De prijselasticiteit van de vraag is −0,4. De aanbieder verhoogt de prijs. Wat gebeurt er met de omzet?', o:['De omzet stijgt','De omzet daalt','De omzet blijft gelijk','Dat kun je niet weten'], a:0, u:'De vraag is inelastisch (tussen 0 en −1): de afzet daalt relatief minder dan de prijs stijgt.'},
  {id:'D.0.05', t:'mc', e:'D.vorm', b:'Volkomen concurrentie', q:'Veel aanbieders, een homogeen product, een volledig doorzichtige markt en vrije toetreding. Welke marktvorm is dit?', o:['Volkomen concurrentie','Monopolistische concurrentie','Oligopolie','Monopolie'], a:0, u:'Dit zijn precies de kenmerken van volkomen concurrentie.'},
  {id:'D.0.06', t:'wo', e:'D.vorm', q:'Bij volkomen concurrentie kan een aanbieder de marktprijs niet beïnvloeden: hij is een hoeveelheidsaanpasser.', a:true, u:'Hij is te klein. De prijs komt tot stand op de markt.'},
  {id:'D.0.07', t:'mc', e:'D.kosten', b:'Marginale opbrengst', q:'Bij welke afzet maakt een bedrijf maximale winst?', o:['Waar de marginale opbrengst gelijk is aan de marginale kosten','Waar de omzet het hoogst is','Waar de gemiddelde kosten het laagst zijn','Waar de prijs het hoogst is'], a:0, u:'MO = MK: tot dat punt levert een extra eenheid meer op dan hij kost.'},
  {id:'D.0.08', t:'mc', e:'D.falen', b:'Extern effect', q:'Een fabriek vervuilt een rivier. Vissers stroomafwaarts lijden daardoor schade. Wat is dit?', o:['Een negatief extern effect','Een positief extern effect','Een collectief goed','Asymmetrische informatie'], a:0, u:'De schade voor de vissers zit niet in de kosten en de prijs van de fabriek.'},
  {id:'D.0.09', t:'mc', e:'D.falen', q:'Hoe kan de overheid een negatief extern effect in de prijs laten meetellen?', o:['Met een heffing per eenheid ter grootte van de externe kosten','Met een subsidie aan de vervuiler','Met een maximumprijs','Door de markt vrij te laten'], a:0, u:'Zo betaalt de vervuiler de externe kosten en daalt de productie naar het maatschappelijk gewenste niveau.'},
  {id:'D.0.10', t:'koppel', e:'D.vorm', b:'Oligopolie', q:'Koppel de marktvorm aan de omschrijving.', p:[['Monopolie','Eén aanbieder'],['Oligopolie','Enkele grote aanbieders die op elkaar letten'],['Monopolistische concurrentie','Veel aanbieders met heterogene producten']], u:'Bij een oligopolie is er onderlinge afhankelijkheid.'},
  {id:'D.0.11', t:'mc', e:'D.vraag', b:'Consumentensurplus', q:'Wat is het consumentensurplus?', o:['Wat consumenten maximaal willen betalen min wat ze werkelijk betalen','De winst van de aanbieders','Het aanbodoverschot op een markt','De omzet min de kosten'], a:0, u:'In de grafiek: de oppervlakte tussen de vraaglijn en de marktprijs.'}
 ], gens:['elasticiteit','evenwicht']},
 {id:'D.r', naam:'Rekenlab markt', kort:'Evenwicht, elasticiteit, winst en MO = MK', vragen:[], gens:['evenwicht','elasticiteit','breakEven','winst','monopolie']}
];
LEVELS.D.begrippen = BEGRIPPEN_D;

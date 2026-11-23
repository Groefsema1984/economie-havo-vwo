// ===== Domein F: Samenwerken en onderhandelen =====
const BEGRIPPEN_F = {
  'Gevangenendilemma':'Ieder kiest de voor zichzelf beste strategie, maar samen komen ze slechter uit dan bij samenwerking.',
  'Dominante strategie':'Een strategie die altijd het beste is, wat de ander ook doet.',
  'Nash-evenwicht':'Geen enkele speler wordt beter van het als enige veranderen van zijn strategie.',
  'Principaal-agentprobleem':'De uitvoerder (agent) heeft andere belangen en meer informatie dan de opdrachtgever (principaal).',
  'Collectief goed':'Een goed dat niet-rivaliserend en niet-uitsluitbaar is, zoals een dijk.',
  'Free rider':'Iemand die profiteert van een goed zonder eraan mee te betalen.',
  'Kartel':'Afspraken tussen bedrijven om de onderlinge concurrentie te beperken.'
};
LEVELS.F = [
 {id:'F.0', naam:'Startset: samenwerken', kort:'Speltheorie, principaal-agent, meeliften', vragen:[
  {id:'F.0.01', t:'mc', e:'F.spel', b:'Gevangenendilemma', q:'Wat is kenmerkend voor het gevangenendilemma?', o:['Ieder kiest voor zichzelf de beste strategie, maar samen komen ze slechter uit dan bij samenwerking','De spelers maken bindende afspraken','Eén speler wint altijd alles','Samenwerken is voor beide spelers de dominante strategie'], a:0, u:'Individueel rationeel gedrag leidt tot een collectief slechtere uitkomst.'},
  {id:'F.0.02', t:'mc', e:'F.spel', b:'Dominante strategie', q:'Wat is een dominante strategie?', o:['Een strategie die altijd het beste is, wat de ander ook doet','De strategie van de sterkste speler','De strategie die de hoogste totale opbrengst geeft','De strategie die als eerste wordt gekozen'], a:0, u:'Je hoeft dan niet te weten wat de ander doet.'},
  {id:'F.0.03', t:'mc', e:'F.spel', b:'Nash-evenwicht', q:'Wat is een Nash-evenwicht?', o:['Geen speler wordt beter van het als enige veranderen van strategie','De uitkomst met de hoogste totale opbrengst','Een uitkomst waarbij beide spelers evenveel krijgen','Een afspraak tussen de spelers'], a:0, u:'Een Nash-evenwicht hoeft niet de beste uitkomst voor de groep te zijn.'},
  {id:'F.0.04', t:'wo', e:'F.spel', q:'Bij een spel dat vaak wordt herhaald, is samenwerking makkelijker vol te houden dan bij een spel dat één keer wordt gespeeld.', a:true, u:'Wie vals speelt, kan in volgende rondes worden gestraft.'},
  {id:'F.0.05', t:'mc', e:'F.pa', b:'Principaal-agentprobleem', q:'Wat is het principaal-agentprobleem?', o:['De uitvoerder heeft andere belangen en meer informatie dan de opdrachtgever','De opdrachtgever betaalt te weinig','Twee bedrijven maken prijsafspraken','Consumenten weten niet wat ze willen'], a:0, u:'Bijvoorbeeld een manager (agent) die niet altijd in het belang van de aandeelhouders (principaal) handelt.'},
  {id:'F.0.06', t:'mc', e:'F.pa', q:'Welke maatregel helpt tegen het principaal-agentprobleem?', o:['Een beloning die afhangt van het resultaat','Een vast salaris zonder controle','Minder informatie geven aan de principaal','Een maximumprijs'], a:0, u:'Zo worden de belangen van agent en principaal beter op elkaar afgestemd.'},
  {id:'F.0.07', t:'mc', e:'F.coll', b:'Free rider', q:'Waarom komt een dijk niet vanzelf via de markt tot stand?', o:['Niemand kan worden uitgesloten van de bescherming, dus iedereen wil meeliften','Dijken zijn te goedkoop','Er is geen vraag naar dijken','De overheid verbiedt het'], a:0, u:'Een dijk is een collectief goed: niet-uitsluitbaar en niet-rivaliserend.'},
  {id:'F.0.08', t:'koppel', e:'F.coll', b:'Collectief goed', q:'Koppel het begrip aan de omschrijving.', p:[['Collectief goed','Niet-rivaliserend en niet-uitsluitbaar'],['Free rider','Profiteert zonder mee te betalen'],['Kartel','Afspraken om de concurrentie te beperken']], u:'Een kartel is vaak een gevangenendilemma: ieder lid heeft er belang bij de afspraak te breken.'}
 ], gens:[]}
];
LEVELS.F.begrippen = BEGRIPPEN_F;

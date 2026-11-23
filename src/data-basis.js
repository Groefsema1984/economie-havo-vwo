// ===== Basisgegevens: domeinen (examenprogramma economie havo/vwo), onderwerpen en werelden =====
// Elk syllabusdomein is een "wereld" in de app. Binnen een wereld komen de levels: eerst een startset,
// later per hoofdstuk van Economie Integraal (zie de data-X.js bestanden en de HANDLEIDING).

// Niveau van een leerling volgt uit de eerste letter van de klas: H = havo, V = vwo.
const NIVEAUS = {h:'havo', v:'vwo'};

const DOMEINEN = [
  {id:'A', naam:'Vaardigheden en rekenen', kleur:'#d64f7a', icoon:'🧮'},
  {id:'B', naam:'Schaarste', kleur:'#e07a2f', icoon:'⚖️'},
  {id:'C', naam:'Ruil', kleur:'#d9a521', icoon:'🔄'},
  {id:'D', naam:'Markt', kleur:'#2f7de0', icoon:'🏪'},
  {id:'E', naam:'Ruilen over de tijd', kleur:'#2fa7c9', icoon:'⏳'},
  {id:'F', naam:'Samenwerken en onderhandelen', kleur:'#7a4fd6', icoon:'🤝'},
  {id:'G', naam:'Risico en informatie', kleur:'#a24fd6', icoon:'🎲'},
  {id:'H', naam:'Welvaart en groei', kleur:'#1f9e6e', icoon:'📈'},
  {id:'I', naam:'Goede tijden, slechte tijden', kleur:'#5a9e1f', icoon:'🌦️'},
  {id:'J', naam:'Onderzoek en experiment', kleur:'#6b7280', icoon:'🔬'}
];

// Onderwerpen per domein. De code begint altijd met de domeinletter en een punt (de server rekent zo de
// domeinscore uit). Het zijn werktitels, geen officiële syllabuscodes: pas ze gerust aan of voeg er toe.
const EINDTERMEN = {
  'A.proc':{d:'A', t:'Procenten, procentpunten en procentuele verandering'},
  'A.index':{d:'A', t:'Indexcijfers en basisjaar'},
  'A.reeel':{d:'A', t:'Nominaal en reëel'},
  'A.grafiek':{d:'A', t:'Grafieken, tabellen en formules'},
  'B.keuze':{d:'B', t:'Schaarste, keuzes en alternatieve kosten'},
  'B.budget':{d:'B', t:'Budgetlijn en consumentenkeuze'},
  'B.prod':{d:'B', t:'Productiemogelijkheden (transformatiecurve)'},
  'C.spec':{d:'C', t:'Specialisatie en comparatief voordeel'},
  'C.geld':{d:'C', t:'Geld en ruil'},
  'C.intl':{d:'C', t:'Internationale handel en wisselkoersen'},
  'D.vraag':{d:'D', t:'Vraag, aanbod en marktevenwicht'},
  'D.elas':{d:'D', t:'Elasticiteit'},
  'D.kosten':{d:'D', t:'Kosten, opbrengsten en winst'},
  'D.vorm':{d:'D', t:'Marktvormen'},
  'D.falen':{d:'D', t:'Marktfalen en overheidsingrijpen'},
  'E.rente':{d:'E', t:'Sparen, lenen en rente'},
  'E.waarde':{d:'E', t:'Contante waarde en eindwaarde'},
  'E.pensioen':{d:'E', t:'Pensioen en vergrijzing'},
  'E.overheid':{d:'E', t:'Overheidsschuld en generaties'},
  'F.spel':{d:'F', t:'Speltheorie'},
  'F.pa':{d:'F', t:'Principaal en agent'},
  'F.coll':{d:'F', t:'Collectieve goederen en meeliften'},
  'G.risico':{d:'G', t:'Risico en verzekeren'},
  'G.info':{d:'G', t:'Asymmetrische informatie'},
  'G.soczek':{d:'G', t:'Sociale zekerheid'},
  'H.bbp':{d:'H', t:'Bbp en welvaart'},
  'H.groei':{d:'H', t:'Economische groei en productiviteit'},
  'H.verdeling':{d:'H', t:'Inkomensverdeling'},
  'I.conj':{d:'I', t:'Conjunctuur en bestedingen'},
  'I.infl':{d:'I', t:'Inflatie, geld en de ECB'},
  'I.werk':{d:'I', t:'Werkloosheid en arbeidsmarkt'},
  'I.beleid':{d:'I', t:'Begrotings- en conjunctuurbeleid'},
  'J.onderzoek':{d:'J', t:'Onderzoek en experiment'}
};

// De werelden = de syllabusdomeinen. nr is de domeinletter.
const WERELDEN = DOMEINEN.map(d=>({id:d.id, nr:d.id, naam:d.naam, icoon:d.icoon, kleur:d.kleur}));

// Wordt per domein gevuld door de data-X.js bestanden
const LEVELS = {}; const GENS_EXTRA = {};   // wereldId -> [{id, naam, kort, hfd?, niv?, vragen:[...], gens:[...]}]

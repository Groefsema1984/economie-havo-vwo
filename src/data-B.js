// ===== Domein B: Schaarste =====
const BEGRIPPEN_B = {
  'Schaarste':'Er is minder beschikbaar dan mensen willen hebben, dus je moet kiezen.',
  'Alternatieve kosten':'De opbrengst van het beste alternatief dat je opgeeft door een keuze.',
  'Budgetlijn':'Alle combinaties van twee goederen die je precies met je budget kunt kopen.',
  'Transformatiecurve':'Alle combinaties van twee goederen die een land maximaal kan maken met de beschikbare productiefactoren.',
  'Productiefactoren':'Arbeid, kapitaal, natuur en ondernemerschap.'
};
LEVELS.B = [
 {id:'B.0', naam:'Startset: schaarste en keuzes', kort:'Alternatieve kosten, budgetlijn, transformatiecurve', vragen:[
  {id:'B.0.01', t:'mc', e:'B.keuze', b:'Schaarste', q:'Wanneer is een goed schaars?', o:['Als er minder van beschikbaar is dan mensen willen hebben','Als het duur is','Als er weinig van wordt verkocht','Als de overheid het verdeelt'], a:0, u:'Schaarste gaat over de spanning tussen behoeften en beschikbare middelen, niet over de prijs.'},
  {id:'B.0.02', t:'mc', e:'B.keuze', b:'Alternatieve kosten', q:'Lisa studeert 4 uur voor een toets in plaats van te werken voor € 12 per uur. Wat zijn de alternatieve kosten van het studeren?', o:['€ 48 aan loon dat ze misloopt','€ 0, want studeren is gratis','€ 12','Het cijfer dat ze haalt'], a:0, u:'Alternatieve kosten = de opbrengst van het beste alternatief: 4 × € 12 = € 48.'},
  {id:'B.0.03', t:'wo', e:'B.keuze', q:'Een goed dat je gratis krijgt, kan niet schaars zijn.', a:false, u:'Ook gratis onderwijs of gratis zorg kost productiefactoren die je niet ergens anders kunt inzetten.'},
  {id:'B.0.04', t:'mc', e:'B.budget', b:'Budgetlijn', q:'Je inkomen stijgt en de prijzen blijven gelijk. Wat gebeurt er met je budgetlijn?', o:['Die verschuift evenwijdig naar buiten','Die draait om het snijpunt met de verticale as','Die verschuift evenwijdig naar binnen','Die verandert niet'], a:0, u:'Je kunt van beide goederen meer kopen in dezelfde verhouding: evenwijdige verschuiving naar buiten.'},
  {id:'B.0.05', t:'mc', e:'B.budget', q:'De prijs van het goed op de horizontale as daalt. Wat gebeurt er met de budgetlijn?', o:['Die draait naar buiten om het snijpunt met de verticale as','Die verschuift evenwijdig naar buiten','Die draait naar binnen om het snijpunt met de horizontale as','Die verandert niet'], a:0, u:'Van het goed op de horizontale as kun je nu meer kopen. Het snijpunt met de verticale as blijft gelijk.'},
  {id:'B.0.06', t:'mc', e:'B.prod', b:'Transformatiecurve', q:'Wat laat een transformatiecurve zien?', o:['Alle combinaties van twee goederen die een land maximaal kan produceren','Hoe de prijs verandert als de vraag stijgt','Hoeveel een consument kan kopen met zijn inkomen','Hoe de productie groeit door de tijd'], a:0, u:'De curve is de grens van wat met alle productiefactoren maximaal kan.'},
  {id:'B.0.07', t:'wo', e:'B.prod', q:'Een punt binnen de transformatiecurve betekent dat de productiefactoren niet volledig worden benut.', a:true, u:'Bijvoorbeeld door werkloosheid of stilstaande machines.'},
  {id:'B.0.08', t:'mc', e:'B.prod', q:'Waardoor verschuift de transformatiecurve naar buiten?', o:['Door technologische vooruitgang','Door een hogere werkloosheid','Door een andere keuze tussen de twee goederen','Door hogere prijzen'], a:0, u:'Meer of betere productiefactoren vergroten wat maximaal gemaakt kan worden.'},
  {id:'B.0.09', t:'koppel', e:'B.keuze', b:'Productiefactoren', q:'Koppel de productiefactor aan de omschrijving.', p:[['Arbeid','Inspanning van mensen'],['Kapitaal','Machines, gebouwen en gereedschap'],['Natuur','Grond en grondstoffen'],['Ondernemerschap','Productie organiseren en risico nemen']], u:'Dit zijn de vier productiefactoren.'}
 ], gens:['altKosten','budgetMax']},
 {id:'B.r', naam:'Rekenlab schaarste', kort:'Alternatieve kosten en budget', vragen:[], gens:['altKosten','budgetMax']}
];
LEVELS.B.begrippen = BEGRIPPEN_B;

// ===== Domein I: Goede tijden, slechte tijden =====
const BEGRIPPEN_I = {
  'Conjunctuur':'De schommelingen van de economische groei rond de trend.',
  'Hoogconjunctuur':'Periode met hoge bestedingen, hoge groei en lage werkloosheid.',
  'Multiplier':'Een extra besteding leidt via extra inkomen tot nog meer bestedingen.',
  'ECB':'Europese Centrale Bank. Hoofddoel: prijsstabiliteit (inflatie rond 2%).',
  'Conjuncturele werkloosheid':'Werkloosheid door te weinig bestedingen in een laagconjunctuur.',
  'Structurele werkloosheid':'Werkloosheid doordat vraag en aanbod van arbeid niet bij elkaar passen.',
  'Anticyclisch beleid':'De overheid remt in een hoogconjunctuur en stimuleert in een laagconjunctuur.',
  'Automatische stabilisatoren':'Belastingen en uitkeringen die de conjunctuur vanzelf dempen.',
  'Bestedingsinflatie':'Prijsstijging doordat de vraag groter is dan wat bedrijven kunnen leveren.'
};
LEVELS.I = [
 {id:'I.0', naam:'Startset: conjunctuur en beleid', kort:'Conjunctuur, inflatie, werkloosheid, beleid', vragen:[
  {id:'I.0.01', t:'mc', e:'I.conj', b:'Hoogconjunctuur', q:'Welke combinatie hoort bij een hoogconjunctuur?', o:['Hoge bestedingen, lage werkloosheid en oplopende inflatie','Lage bestedingen, hoge werkloosheid en lage inflatie','Hoge werkloosheid en hoge groei','Dalende lonen en dalende prijzen'], a:0, u:'De economie draait op volle toeren, met druk op lonen en prijzen.'},
  {id:'I.0.02', t:'mc', e:'I.conj', b:'Multiplier', q:'Wat is het multipliereffect?', o:['Een extra besteding leidt via extra inkomen tot nog meer bestedingen','De overheid verdubbelt elke investering','De prijs stijgt sneller dan de lonen','Banken scheppen geld door krediet te geven'], a:0, u:'Het nationaal inkomen stijgt meer dan de oorspronkelijke extra besteding.'},
  {id:'I.0.03', t:'mc', e:'I.infl', b:'ECB', q:'Wat is het hoofddoel van de ECB?', o:['Prijsstabiliteit: een inflatie rond 2% op middellange termijn','Volledige werkgelegenheid','Een zo hoog mogelijke economische groei','Een sterke euro ten opzichte van de dollar'], a:0, u:'De ECB stuurt vooral met de rente.'},
  {id:'I.0.04', t:'mc', e:'I.infl', q:'De ECB verhoogt de rente. Wat is het bedoelde effect?', o:['Minder lenen en besteden, waardoor de inflatie daalt','Meer lenen en besteden, waardoor de inflatie stijgt','Een lagere werkloosheid','Een hogere staatsschuld'], a:0, u:'Lenen wordt duurder en sparen aantrekkelijker, dus de bestedingen dalen.'},
  {id:'I.0.05', t:'mc', e:'I.werk', b:'Conjuncturele werkloosheid', q:'Wat is conjuncturele werkloosheid?', o:['Werkloosheid door te weinig bestedingen in een laagconjunctuur','Werkloosheid doordat opleidingen niet passen bij de vacatures','Werkloosheid in het seizoen','Werkloosheid door wisselen van baan'], a:0, u:'Die verdwijnt als de bestedingen weer aantrekken.'},
  {id:'I.0.06', t:'mc', e:'I.werk', b:'Structurele werkloosheid', q:'Er zijn veel vacatures in de zorg, maar ook veel werklozen met een heel andere opleiding. Welke werkloosheid is dit?', o:['Structurele werkloosheid','Conjuncturele werkloosheid','Frictiewerkloosheid','Seizoenswerkloosheid'], a:0, u:'Vraag en aanbod van arbeid passen kwalitatief niet bij elkaar.'},
  {id:'I.0.07', t:'mc', e:'I.beleid', b:'Anticyclisch beleid', q:'Wat doet de overheid bij anticyclisch begrotingsbeleid in een laagconjunctuur?', o:['Meer uitgeven of belasting verlagen, ook als het begrotingstekort stijgt','Bezuinigen om het tekort te verkleinen','De rente verhogen','Niets, de markt herstelt zich vanzelf'], a:0, u:'De overheid vult de te lage bestedingen aan.'},
  {id:'I.0.08', t:'wo', e:'I.beleid', b:'Automatische stabilisatoren', q:'WW-uitkeringen dempen de conjunctuur, zonder dat de overheid een nieuw besluit hoeft te nemen.', a:true, u:'In een laagconjunctuur stijgen de uitkeringen vanzelf, waardoor de bestedingen minder dalen.'},
  {id:'I.0.09', t:'koppel', e:'I.infl', b:'Bestedingsinflatie', q:'Koppel het begrip aan de omschrijving.', p:[['Bestedingsinflatie','De vraag is groter dan wat bedrijven kunnen leveren'],['Kosteninflatie','De productiekosten stijgen'],['Loon-prijsspiraal','Hogere prijzen leiden tot hogere looneisen en weer hogere prijzen']], u:'Bij bestedingsinflatie remt een renteverhoging het meest.'}
 ], gens:['werkloosheid','inflatieCpi']},
 {id:'I.r', naam:'Rekenlab conjunctuur', kort:'Werkloosheid, inflatie, begrotingssaldo', vragen:[], gens:['werkloosheid','inflatieCpi','begrotingssaldo']}
];
LEVELS.I.begrippen = BEGRIPPEN_I;

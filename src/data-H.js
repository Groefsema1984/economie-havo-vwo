// ===== Domein H: Welvaart en groei =====
const BEGRIPPEN_H = {
  'Bbp':'Bruto binnenlands product: de totale toegevoegde waarde die in een land in een jaar wordt geproduceerd.',
  'Toegevoegde waarde':'Productiewaarde min de ingekochte goederen en diensten.',
  'Arbeidsproductiviteit':'De productie per werkende of per gewerkt uur.',
  'Lorenzcurve':'Grafiek die laat zien welk deel van het inkomen naar welk deel van de huishoudens gaat.',
  'Gini-coëfficiënt':'Maat voor inkomensongelijkheid: 0 is volledig gelijk, 1 is volledig ongelijk.',
  'Primair inkomen':'Inkomen uit productie: loon, winst, rente en huur.',
  'Secundair inkomen':'Primair inkomen na belastingen, premies en uitkeringen.',
  'Progressief tarief':'Hoe hoger je inkomen, hoe groter het deel dat je aan belasting betaalt.'
};
LEVELS.H = [
 {id:'H.0', naam:'Startset: welvaart en groei', kort:'Bbp, groei, productiviteit, inkomensverdeling', vragen:[
  {id:'H.0.01', t:'mc', e:'H.bbp', b:'Bbp', q:'Wat meet het bbp?', o:['De totale toegevoegde waarde die in een land in een jaar wordt geproduceerd','De totale omzet van alle bedrijven','Het totale vermogen van alle inwoners','De totale uitgaven van de overheid'], a:0, u:'Je telt de toegevoegde waarde, zodat ingekochte producten niet dubbel meetellen.'},
  {id:'H.0.02', t:'mc', e:'H.bbp', q:'Waarom is het bbp geen perfecte maatstaf voor welvaart?', o:['Onbetaald werk en schade aan het milieu tellen niet mee','Het bbp telt ook de export mee','Het bbp wordt elk jaar opnieuw berekend','Het bbp telt alleen diensten mee'], a:0, u:'Welvaart in ruime zin omvat ook vrije tijd, gezondheid, natuur en onbetaalde arbeid.'},
  {id:'H.0.03', t:'mc', e:'H.groei', b:'Arbeidsproductiviteit', q:'Wat is op lange termijn de belangrijkste bron van economische groei per inwoner?', o:['Een stijgende arbeidsproductiviteit','Een hogere inflatie','Meer overheidsschuld','Een lagere rente'], a:0, u:'Meer productie per werkende, vooral door technologie, kennis en kapitaal.'},
  {id:'H.0.04', t:'wo', e:'H.groei', q:'Reële groei is nominale groei gecorrigeerd voor prijsstijgingen.', a:true, u:'Reëel indexcijfer = nominaal indexcijfer / prijsindexcijfer × 100.'},
  {id:'H.0.05', t:'mc', e:'H.verdeling', b:'Lorenzcurve', q:'Hoe verder de Lorenzcurve van de diagonaal ligt, ...', o:['hoe ongelijker het inkomen is verdeeld','hoe gelijker het inkomen is verdeeld','hoe hoger het gemiddelde inkomen is','hoe lager het bbp is'], a:0, u:'De diagonaal is de lijn van volledige gelijkheid.'},
  {id:'H.0.06', t:'mc', e:'H.verdeling', b:'Gini-coëfficiënt', q:'Welke Gini-coëfficiënt hoort bij een volledig gelijke inkomensverdeling?', o:['0','1','0,5','100'], a:0, u:'0 = iedereen evenveel, 1 = één persoon heeft alles.'},
  {id:'H.0.07', t:'mc', e:'H.verdeling', b:'Progressief tarief', q:'Welke maatregel maakt de secundaire inkomensverdeling gelijker?', o:['Een progressief belastingtarief','Een vlaktaks met één tarief','Een hogere btw','Een lagere bijstand'], a:0, u:'Hoge inkomens betalen relatief meer belasting.'},
  {id:'H.0.08', t:'koppel', e:'H.verdeling', b:'Secundair inkomen', q:'Koppel het begrip aan de omschrijving.', p:[['Primair inkomen','Inkomen uit productie: loon, winst, rente, huur'],['Secundair inkomen','Na belastingen, premies en uitkeringen'],['Toegevoegde waarde','Productiewaarde min ingekochte goederen en diensten']], u:'Herverdeling gaat van primaire naar secundaire inkomensverdeling.'}
 ], gens:['reeleGroei','productiviteit']},
 {id:'H.r', naam:'Rekenlab welvaart en groei', kort:'Reële groei, productiviteit, bbp per inwoner', vragen:[], gens:['reeleGroei','productiviteit','bbpPerInwoner']}
];
LEVELS.H.begrippen = BEGRIPPEN_H;

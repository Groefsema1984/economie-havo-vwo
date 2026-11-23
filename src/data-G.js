// ===== Domein G: Risico en informatie =====
const BEGRIPPEN_G = {
  'Risicomijdend':'Je kiest liever een zekere kleine uitgave dan een kleine kans op een groot verlies.',
  'Averechtse selectie':'Door verborgen informatie trekt een verzekering vooral mensen met een hoog risico aan.',
  'Moreel risico':'Na het afsluiten van een verzekering ga je minder voorzichtig doen (moral hazard).',
  'Eigen risico':'Het deel van de schade dat je zelf betaalt.',
  'Asymmetrische informatie':'De ene partij weet meer dan de andere.',
  'Signaleren':'De partij met meer informatie laat met een signaal (garantie, diploma) zien wat de kwaliteit is.',
  'Volksverzekering':'Sociale verzekering voor alle inwoners, zoals de AOW.',
  'Werknemersverzekering':'Sociale verzekering voor werknemers, zoals de WW.'
};
LEVELS.G = [
 {id:'G.0', naam:'Startset: risico en informatie', kort:'Verzekeren, averechtse selectie, moreel risico', vragen:[
  {id:'G.0.01', t:'mc', e:'G.risico', b:'Risicomijdend', q:'Waarom sluiten mensen een verzekering af?', o:['Ze betalen liever een vaste premie dan dat ze een kleine kans lopen op een groot verlies','Omdat de premie lager is dan de verwachte schade','Omdat ze dan altijd geld terugkrijgen','Omdat verzekeren altijd verplicht is'], a:0, u:'Risicomijdende mensen betalen zelfs iets meer dan de verwachte schade om zekerheid te krijgen.'},
  {id:'G.0.02', t:'mc', e:'G.info', b:'Averechtse selectie', q:'Een verzekeraar vraagt iedereen dezelfde premie. Vooral mensen met een hoog risico sluiten de verzekering af. Hoe heet dit?', o:['Averechtse selectie','Moreel risico','Signaleren','Eigen risico'], a:0, u:'Het ontstaat vóór het afsluiten, doordat de verzekeraar het risico van de klant niet kent.'},
  {id:'G.0.03', t:'mc', e:'G.info', b:'Moreel risico', q:'Na het afsluiten van een fietsverzekering zet Tim zijn fiets niet meer op slot. Hoe heet dit?', o:['Moreel risico','Averechtse selectie','Signaleren','Een extern effect'], a:0, u:'Het gedrag verandert ná het afsluiten van de verzekering.'},
  {id:'G.0.04', t:'mc', e:'G.info', b:'Eigen risico', q:'Welke maatregel beperkt moreel risico het best?', o:['Een eigen risico','Een lagere premie','Een verbod op verzekeren','Iedereen dezelfde premie'], a:0, u:'Als je zelf meebetaalt aan de schade, blijf je voorzichtiger.'},
  {id:'G.0.05', t:'mc', e:'G.info', q:'Welke maatregel helpt tegen averechtse selectie bij de basiszorgverzekering?', o:['Een verplichte verzekering voor iedereen','Een hoger eigen risico','Een vrije keuze om je niet te verzekeren','Een hogere premie voor jongeren'], a:0, u:'Als iedereen verplicht meedoet, kunnen de lage risico\'s niet wegblijven.'},
  {id:'G.0.06', t:'wo', e:'G.info', b:'Asymmetrische informatie', q:'Asymmetrische informatie betekent dat de ene partij meer weet dan de andere.', a:true, u:'Bijvoorbeeld de verkoper van een tweedehands auto tegenover de koper.'},
  {id:'G.0.07', t:'mc', e:'G.info', b:'Signaleren', q:'Een verkoper van tweedehands auto\'s geeft een jaar garantie. Waarom?', o:['Om te laten zien dat de auto goed is en zo het informatieverschil te verkleinen','Omdat dat wettelijk verplicht is','Om moreel risico bij de koper te vergroten','Om de prijs te verlagen'], a:0, u:'Een garantie is een geloofwaardig signaal: een slechte auto zou de verkoper veel geld kosten.'},
  {id:'G.0.08', t:'koppel', e:'G.soczek', b:'Volksverzekering', q:'Koppel de regeling aan de omschrijving.', p:[['AOW','Volksverzekering voor ouderen'],['WW','Werknemersverzekering bij werkloosheid'],['Bijstand','Vangnet als je geen ander inkomen hebt']], u:'De bijstand is een sociale voorziening, betaald uit belastingen.'},
  {id:'G.0.09', t:'mc', e:'G.soczek', b:'Werknemersverzekering', q:'Wat is het verschil tussen een volksverzekering en een werknemersverzekering?', o:['Een volksverzekering geldt voor alle inwoners, een werknemersverzekering alleen voor werknemers','Een volksverzekering is vrijwillig','Een werknemersverzekering betaal je uit belastingen','Er is geen verschil'], a:0, u:'AOW: volksverzekering. WW en WIA: werknemersverzekeringen.'}
 ], gens:['verwachteSchade']},
 {id:'G.r', naam:'Rekenlab risico', kort:'Verwachte schade en premie', vragen:[], gens:['verwachteSchade']}
];
LEVELS.G.begrippen = BEGRIPPEN_G;

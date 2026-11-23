// ===== Domein C: Ruil =====
const BEGRIPPEN_C = {
  'Comparatief voordeel':'Een product maken met lagere alternatieve kosten dan een ander.',
  'Absoluut voordeel':'Een product met minder productiefactoren (efficiënter) maken dan een ander.',
  'Specialisatie':'Je toeleggen op wat je relatief het beste kunt en de rest ruilen.',
  'Ruilmiddel':'Functie van geld: je gebruikt het om te betalen.',
  'Ruilvoet':'De verhouding tussen de exportprijzen en de importprijzen van een land (× 100).',
  'Protectionisme':'Het eigen bedrijfsleven beschermen tegen buitenlandse concurrentie, bijvoorbeeld met invoerheffingen.',
  'Appreciatie':'Een waardestijging van een munt ten opzichte van een andere munt.'
};
LEVELS.C = [
 {id:'C.0', naam:'Startset: ruil en specialisatie', kort:'Comparatief voordeel, geld, handel', vragen:[
  {id:'C.0.01', t:'mc', e:'C.spec', b:'Comparatief voordeel', q:'Wanneer heeft een land een comparatief voordeel in een product?', o:['Als het dat product met de laagste alternatieve kosten kan maken','Als het dat product met de minste arbeid kan maken','Als het van dat product het meest exporteert','Als het dat product het goedkoopst kan importeren'], a:0, u:'Comparatief = vergeleken met de alternatieve kosten. Met de minste arbeid is een absoluut voordeel.'},
  {id:'C.0.02', t:'wo', e:'C.spec', b:'Absoluut voordeel', q:'Een land dat in alle producten een absoluut voordeel heeft, kan niet profiteren van handel.', a:false, u:'Ook dan kunnen beide landen winnen als ze zich specialiseren in hun comparatieve voordeel.'},
  {id:'C.0.03', t:'mc', e:'C.spec', b:'Specialisatie', q:'Wat is een gevolg van specialisatie?', o:['Een hogere productiviteit, maar ook meer afhankelijkheid van anderen','Een lagere productiviteit','Minder ruil','Minder afhankelijkheid van anderen'], a:0, u:'Wie zich specialiseert wordt er beter in, maar moet de rest ruilen.'},
  {id:'C.0.04', t:'mc', e:'C.geld', b:'Ruilmiddel', q:'Welke is GEEN functie van geld?', o:['Productiefactor','Ruilmiddel','Rekeneenheid','Spaarmiddel'], a:0, u:'Geld is ruilmiddel, rekeneenheid en spaarmiddel (oppotmiddel).'},
  {id:'C.0.05', t:'mc', e:'C.geld', q:'Wat is het grootste nadeel van ruilen zonder geld (ruilhandel)?', o:['Je moet iemand vinden die precies wil hebben wat jij aanbiedt, en andersom','Je moet altijd btw betalen','Er is geen rente','Je kunt niet specialiseren'], a:0, u:'Dat heet de dubbele behoeftecoïncidentie. Geld lost dat op.'},
  {id:'C.0.06', t:'mc', e:'C.intl', b:'Appreciatie', q:'De euro stijgt in waarde ten opzichte van de dollar. Wat is een gevolg?', o:['Europese producten worden duurder voor Amerikanen','Europese producten worden goedkoper voor Amerikanen','Amerikaanse producten worden duurder voor Europeanen','Er verandert niets aan de handel'], a:0, u:'Amerikanen moeten meer dollars betalen voor één euro, dus Europese export wordt voor hen duurder.'},
  {id:'C.0.07', t:'wo', e:'C.intl', b:'Protectionisme', q:'Een invoerheffing beschermt binnenlandse producenten, maar binnenlandse consumenten betalen meer.', a:true, u:'Geïmporteerde producten worden duurder, dus binnenlandse producenten kunnen ook hogere prijzen vragen.'},
  {id:'C.0.08', t:'koppel', e:'C.intl', b:'Ruilvoet', q:'Koppel het begrip aan de omschrijving.', p:[['Ruilvoet','Exportprijzen ten opzichte van importprijzen'],['Protectionisme','De eigen producenten beschermen'],['Specialisatie','Je toeleggen op wat je relatief het best kunt']], u:'Een stijgende ruilvoet betekent: voor dezelfde export kun je meer importeren.'}
 ], gens:['comparatief','wisselkoers']},
 {id:'C.r', naam:'Rekenlab ruil', kort:'Alternatieve kosten en wisselkoersen', vragen:[], gens:['comparatief','wisselkoers']}
];
LEVELS.C.begrippen = BEGRIPPEN_C;

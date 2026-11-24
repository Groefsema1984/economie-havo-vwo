// ===== Examenonderwerpen: fijnere indeling van de examenvragen dan het domein =====
// Een vraag kan bij meer onderwerpen horen. 'zoek' werkt op vraag + antwoordmodel; levert dat niets op, dan op opgavetitel + context.
// Gebruikt door de examenanalyse en de adaptieve examensprint (sprint.js).
const EX_ONDERWERPEN = [
 {id:'markt', t:'Marktvormen, kosten en winst', d:'D', zoek:'volkomen concurrentie|volledige mededinging|monopol|oligopol|MO\\s*=\\s*MK|marginale (kosten|opbrengst)|\\bMK\\b|\\bMO\\b|\\bGTK\\b|\\bGVK\\b|break-?even|totale winst|constante kosten|vaste kosten|variabele kosten'},
 {id:'surplus', t:'Consumenten- en producentensurplus, marktwerking', d:'D', zoek:'surplus|betalingsbereidheid|leveringsbereidheid|evenwichtsprijs|marktevenwicht|aanbodlijn|vraaglijn|collectieve vraag|collectief aanbod'},
 {id:'elas', t:'Elasticiteiten', d:'D', zoek:'elastic|prijsgevoelig'},
 {id:'overheidmarkt', t:'Overheid op de markt (heffing, subsidie, prijsregulering)', d:'D', zoek:'accijns|heffing|subsidie|minimumprijs|maximumprijs|quotum|prijsplafond|mededinging|ACM|kartel'},
 {id:'extern', t:'Externe effecten en collectieve goederen', d:'D', zoek:'extern\\w* effect|maatschappelijke kosten|collectie\\w* go|meelift|rivaliser|emissierecht|vervuil'},
 {id:'spel', t:'Speltheorie', d:'F', zoek:'dominante strategie|gevangenendilemma|nash|spelboom|matrix|pay-?off|zelfbinding|geloofwaardig|herhaald spel'},
 {id:'pa', t:'Principaal-agent en onderhandelen', d:'F', zoek:'principaal|agent\\b|onderhandel|cao|vakbond'},
 {id:'verzek', t:'Verzekeren: averechtse selectie, moral hazard, premie', d:'G', zoek:'verzeker|premie|eigen risico|averechtse selectie|moral hazard|asymmetrisch'},
 {id:'risico', t:'Risico, verwachte waarde en rendement', d:'G', zoek:'verwacht\\w* (schade|waarde|rendement)|risico-?avers|risicomijdend|risico-?neutraal|kans op|beleggen|aandelen|obligatie|rendement'},
 {id:'sparen', t:'Sparen, lenen en rente (ruilen over de tijd)', d:'E', zoek:'sparen|spaar|lening|lenen|hypothe|ruilen over de tijd|tijdsvoorkeur|annuïteit|contante waarde|eindwaarde|krediet|studieschuld'},
 {id:'pensioen', t:'Pensioen, vergrijzing en sociale zekerheid', d:'E', zoek:'pensioen|AOW|vergrijzing|omslagstelsel|kapitaaldekking|uitkering|sociale zekerheid|solidariteit'},
 {id:'inkverd', t:'Inkomensverdeling en belastingen', d:'H', zoek:'nivell|lorenz|gini|inkomensverdeling|inkomensverschil|belastingtarief|schijf|heffingskorting|progressie|progressief|degressief|proportioneel|belastingdruk|primair inkomen|secundair inkomen'},
 {id:'groei', t:'Economische groei, productiviteit en welvaart', d:'H', zoek:'economische groei|arbeidsproductiviteit|productiecapaciteit|structurele groei|welvaart|\\bbbp\\b|menselijk kapitaal|innovatie'},
 {id:'arbeid', t:'Arbeidsmarkt en werkloosheid', d:'H', zoek:'werkloos|arbeidsmarkt|vraag naar arbeid|aanbod van arbeid|beroepsbevolking|participatie|minimumloon|loonkosten|lonen'},
 {id:'handel', t:'Internationale handel en betalingsbalans', d:'C', zoek:'export|import|handel|protectionis|invoerheffing|importheffing|lopende rekening|betalingsbalans|specialisatie|comparatie|concurrentiepositie'},
 {id:'wk', t:'Wisselkoersen', d:'I', zoek:'wisselkoers|koers van de|koersdaling|koersstijging|apprecia|deprecia|revaluatie|devaluatie|valuta'},
 {id:'conj', t:'Conjunctuur en bestedingen', d:'I', zoek:'conjunct|bestedingen|effectieve vraag|multiplier|geaggregeerde vraag|hoogconjunctuur|laagconjunctuur|recessie|output gap'},
 {id:'infl', t:'Inflatie, koopkracht en deflatie', d:'I', zoek:'inflatie|deflatie|koopkracht|prijspeil|prijsindex|\\bCPI\\b|reële? (rente|inkomen|loon|lonen|waarde)'},
 {id:'monetair', t:'Geld, banken en monetair beleid', d:'I', zoek:'monetair|centrale bank|\\bECB\\b|\\bFED\\b|beleidsrente|geldschepping|geldhoeveelheid|MB-?curve|GA-?curve'},
 {id:'overheid', t:'Overheidsfinanciën en begrotingsbeleid', d:'I', zoek:'begroting|overheidstekort|financieringstekort|staatsschuld|overheidsschuld|schuldquote|\\bEMU\\b|anticyclisch|procyclisch|overheidsuitgaven|belastingontvangsten'},
];

// ===== Domein E: Ruilen over de tijd =====
const BEGRIPPEN_E = {
  'Rente':'De vergoeding voor het (tijdelijk) afstaan van geld.',
  'Contante waarde':'Wat een bedrag in de toekomst nu waard is, rekening houdend met de rente.',
  'Eindwaarde':'Wat een bedrag nu, inclusief rente op rente, later waard is.',
  'Omslagstelsel':'De werkenden van nu betalen de uitkeringen van de gepensioneerden van nu (zoals de AOW).',
  'Kapitaaldekkingsstelsel':'Je spaart via een pensioenfonds zelf voor je eigen pensioen.',
  'Vergrijzing':'Het aandeel ouderen in de bevolking stijgt.'
};
LEVELS.E = [
 {id:'E.0', naam:'Startset: ruilen over de tijd', kort:'Sparen, lenen, rente, pensioen', vragen:[
  {id:'E.0.01', t:'mc', e:'E.rente', b:'Rente', q:'Waarom vraagt een bank rente als ze geld uitleent?', o:['Als vergoeding voor het uitstellen van eigen bestedingen en voor het risico','Omdat de overheid dat verplicht','Om de inflatie te verlagen','Omdat geld anders zijn waarde verliest'], a:0, u:'Wie uitleent kan het geld nu niet zelf gebruiken en loopt het risico dat het niet terugkomt.'},
  {id:'E.0.02', t:'mc', e:'E.rente', q:'De inflatie wordt veel hoger dan verwacht. Wie profiteert daarvan?', o:['Iemand met een lening tegen een vaste rente','Iemand met een spaarrekening tegen een vaste rente','Een gepensioneerde met een vast pensioen','Niemand'], a:0, u:'De schuld wordt reëel minder waard. De reële rente is lager dan verwacht.'},
  {id:'E.0.03', t:'wo', e:'E.waarde', b:'Contante waarde', q:'Bij een positieve rente is € 1.000 vandaag meer waard dan € 1.000 over vijf jaar.', a:true, u:'Je kunt die € 1.000 nu wegzetten en er rente over krijgen.'},
  {id:'E.0.04', t:'mc', e:'E.pensioen', b:'Omslagstelsel', q:'Wat is het omslagstelsel?', o:['De werkenden van nu betalen de uitkeringen van de gepensioneerden van nu','Iedereen spaart zelf voor zijn eigen pensioen','De werkgever betaalt het hele pensioen','Gepensioneerden betalen de uitkeringen van werklozen'], a:0, u:'De AOW is een voorbeeld van een omslagstelsel.'},
  {id:'E.0.05', t:'mc', e:'E.pensioen', b:'Vergrijzing', q:'Waarom komt het omslagstelsel onder druk te staan door vergrijzing?', o:['Er komen meer gepensioneerden per werkende','De rente daalt','Er komen meer werkenden per gepensioneerde','De pensioenfondsen beleggen slechter'], a:0, u:'Minder werkenden moeten de uitkeringen van meer ouderen betalen.'},
  {id:'E.0.06', t:'mc', e:'E.pensioen', b:'Kapitaaldekkingsstelsel', q:'Wat past bij het kapitaaldekkingsstelsel?', o:['Je bouwt via een pensioenfonds je eigen pensioen op, dat wordt belegd','De werkenden van nu betalen jouw pensioen','De overheid betaalt het pensioen uit belastingen','Je krijgt pensioen zonder ooit premie te betalen'], a:0, u:'Het aanvullend pensioen via een pensioenfonds werkt (vooral) met kapitaaldekking.'},
  {id:'E.0.07', t:'wo', e:'E.overheid', q:'Als de overheid nu geld leent, moeten later belastingbetalers de rente en de aflossing betalen.', a:true, u:'Een staatsschuld verschuift lasten naar de toekomst.'},
  {id:'E.0.08', t:'koppel', e:'E.waarde', b:'Eindwaarde', q:'Koppel het begrip aan de omschrijving.', p:[['Contante waarde','Wat een toekomstig bedrag nu waard is'],['Eindwaarde','Wat een bedrag nu later waard is, met rente op rente'],['Lenen','Nu besteden en later betalen']], u:'Contante waarde: delen door (1 + r)ⁿ. Eindwaarde: vermenigvuldigen met (1 + r)ⁿ.'}
 ], gens:['eindwaarde','contanteWaarde']},
 {id:'E.r', naam:'Rekenlab ruilen over de tijd', kort:'Eindwaarde, contante waarde, reële rente', vragen:[], gens:['eindwaarde','contanteWaarde','reeleRente']}
];
LEVELS.E.begrippen = BEGRIPPEN_E;

// ===== Domein A: Vaardigheden en rekenen =====
// Vraagvormen: mc (meerkeuze), wo (waar/niet waar), koppel (paren), reken (getal invullen), open (zelf nakijken met antwoordmodel)
// e = onderwerp (zie EINDTERMEN in data-basis.js), b = begrippenkaart bij een goed antwoord, niv:'v' = alleen vwo
const BEGRIPPEN_A = {
  'Procentpunt':'Het verschil tussen twee percentages. Van 2% naar 3% is +1 procentpunt (en +50%).',
  'Indexcijfer':'Verhoudingsgetal ten opzichte van een basisjaar (= 100). Zonder %-teken.',
  'Basisjaar':'Het jaar waarin het indexcijfer 100 is.',
  'Nominaal':'In lopende euro\'s, niet gecorrigeerd voor prijsveranderingen.',
  'Reëel':'Gecorrigeerd voor prijsveranderingen: wat je er werkelijk voor kunt kopen.',
  'Koopkracht':'De hoeveelheid goederen en diensten die je met je inkomen kunt kopen.'
};
LEVELS.A = [
 {id:'A.0', naam:'Startset: rekenregels', kort:'Procenten, indexcijfers, reëel', vragen:[
  {id:'A.0.01', t:'mc', e:'A.proc', b:'Procentpunt', q:'De rente stijgt van 2% naar 3%. Welke uitspraak is juist?', o:['De rente stijgt met 1 procentpunt, dat is 50%','De rente stijgt met 1%, dat is 50 procentpunt','De rente stijgt met 1 procentpunt, dat is 1%','De rente stijgt met 50 procentpunt'], a:0, u:'Het verschil tussen twee percentages is in procentpunten (3 − 2 = 1). In procenten: 1 / 2 × 100% = 50%.'},
  {id:'A.0.02', t:'mc', e:'A.proc', q:'Een prijs stijgt eerst met 10% en daarna nog eens met 10%. Met hoeveel procent is de prijs in totaal gestegen?', o:['21%','20%','10%','11%'], a:0, u:'1,10 × 1,10 = 1,21. Dat is een stijging van 21%.'},
  {id:'A.0.03', t:'wo', e:'A.proc', q:'Een prijsdaling van 20% wordt precies ongedaan gemaakt door daarna een prijsstijging van 20%.', a:false, u:'Van 100 naar 80 is −20%. Terug naar 100 is +20/80 = +25%.'},
  {id:'A.0.04', t:'wo', e:'A.index', b:'Indexcijfer', q:'Een prijsindexcijfer van 95 betekent dat de prijzen sinds het basisjaar met 5% zijn gedaald.', a:true, u:'Het basisjaar is 100. 95 is 5% lager.'},
  {id:'A.0.05', t:'mc', e:'A.index', b:'Basisjaar', q:'Het prijsindexcijfer in 2024 is 130 (2015 = 100). Een product kostte in 2015 € 40 en steeg even hard als het gemiddelde. Wat kost het in 2024?', o:['€ 52','€ 70','€ 43','€ 30,77'], a:0, u:'€ 40 × 130 / 100 = € 52.'},
  {id:'A.0.06', t:'mc', e:'A.reeel', b:'Reëel', q:'Je nominale inkomen stijgt met 3% en de prijzen stijgen met 5%. Wat gebeurt er met je reële inkomen?', o:['Dat daalt met ongeveer 2%','Dat stijgt met ongeveer 2%','Dat stijgt met 8%','Dat blijft gelijk'], a:0, u:'Reëel = 103 / 105 × 100 = 98,1. Dus ongeveer 2% minder koopkracht.'},
  {id:'A.0.07', t:'koppel', e:'A.reeel', q:'Koppel het begrip aan de omschrijving.', p:[['Nominaal','In lopende euro\'s'],['Reëel','Gecorrigeerd voor prijsveranderingen'],['Koopkracht','Wat je met je inkomen kunt kopen']], u:'Reëel = nominaal gecorrigeerd voor de inflatie.'},
  {id:'A.0.08', t:'mc', e:'A.grafiek', q:'In een grafiek staan indexcijfers op de verticale as. Wat kun je daaruit NIET direct aflezen?', o:['Het bedrag in euro\'s','Of de waarde ten opzichte van het basisjaar is gestegen','In welk jaar de waarde het hoogst was','Welk jaar het basisjaar is'], a:0, u:'Een indexcijfer is een verhouding. Voor bedragen heb je ook de waarde in het basisjaar nodig.'}
 ], gens:['procVerandering','indexVerschil','reeelIndex']},
 {id:'A.r', naam:'Rekenlab vaardigheden', kort:'Procenten, procentpunten, indexcijfers, reëel', vragen:[], gens:['procVerandering','procentpunt','indexVerschil','index','reeelIndex']}
];
LEVELS.A.begrippen = BEGRIPPEN_A;

/* ===== Zo voeg je later een hoofdstuk van Economie Integraal toe (kopieer en vul in) =====
LEVELS.A.push(
 {id:'A.h1.1', hfd:'Hoofdstuk 1 · Titel uit Economie Integraal', naam:'§1.1 Titel', kort:'Korte omschrijving', vragen:[
   {id:'A.h1.1.01', t:'mc', e:'A.proc', q:'Vraag?', o:['Juist','Fout','Fout','Fout'], a:0, u:'Uitleg'},
 ], gens:[]}
);
*/

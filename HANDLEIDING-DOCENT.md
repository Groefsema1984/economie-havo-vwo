# Handleiding docent · Economie havo/vwo oefenapp

## Wat zit erin (versie 0.1, raamwerk)

- Eén app voor havo 4, havo 5, vwo 4, vwo 5 en vwo 6. De leerling kiest bij de start zijn klas (H4, H5, V4, V5, V6).
  De eerste letter bepaalt het niveau: H = havo, V = vwo. De app toont dan alleen de levels en examenvragen van dat niveau.
- Startscherm met de tien syllabusdomeinen als werelden:
  A Vaardigheden en rekenen · B Schaarste · C Ruil · D Markt · E Ruilen over de tijd · F Samenwerken en onderhandelen ·
  G Risico en informatie · H Welvaart en groei · I Goede tijden, slechte tijden · J Onderzoek en experiment.
- Per domein nu een **startset** met basisbegrippen (8 tot 11 vragen) en een **rekenlab** met sommen die steeds nieuwe getallen
  krijgen (elasticiteit, evenwicht, break-even, MO = MK, contante waarde, reële groei, werkloosheid, enzovoort).
  Domein J is nog leeg en staat op "Komt binnenkort".
- Op elke domeinpagina is plek voor de **hoofdstukken van Economie Integraal**. Die worden apart gegroepeerd zodra ze erin staan.
- Alles van de mavo-app werkt hier ook: medailles (brons 6/8, zilver 7/8, goud 8/8), domeintoets met diploma, herhaalronde,
  vaardigheden per onderwerp (0-100), begrippenkaarten, badges, munten, thema's en het docentendashboard met oefentijd,
  scores per domein, moeilijkste vragen, eindtermentabel, examentrainer en CSV.
- **Eindexamentrainer**: klaar voor havo- en vwo-examens, per examen, per domein, als sprint en om te printen. Nieuw is de
  vraagvorm **open vraag**: de leerling schrijft een antwoord, ziet daarna het antwoordmodel (correctievoorschrift) en kijkt zelf na.
  Er staan nog geen examenvragen in; de trainer verschijnt in het menu zodra ze zijn toegevoegd.

Let op: de onderwerpen per domein (bijvoorbeeld "D.elas Elasticiteit") zijn werktitels, geen officiële syllabuscodes.
Ze staan in `src/data-basis.js` en zijn makkelijk aan te passen of uit te breiden.

## Inhoud toevoegen

Elk domein heeft een eigen bestand: `src/data-A.js` t/m `src/data-J.js`. Een hoofdstuk van Economie Integraal toevoegen
gaat zo (onderaan `data-A.js` staat een voorbeeld om te kopiëren):

```js
LEVELS.D.push(
 {id:'D.h2.1', hfd:'Hoofdstuk 2 · Marktvormen', naam:'§2.1 Volkomen concurrentie', kort:'Korte omschrijving', vragen:[
   {id:'D.h2.1.01', t:'mc', e:'D.vorm', q:'Vraag?', o:['Juist','Fout','Fout','Fout'], a:0, u:'Uitleg'},
 ], gens:['elasticiteit']},
);
```

- `hfd` is de kop waaronder het level staat. Levels met dezelfde `hfd` gaan na elkaar open (brons nodig); elk hoofdstuk begint open.
- `niv:'v'` op een level of vraag = alleen vwo, `niv:'h'` = alleen havo. Zonder `niv` is het voor beide.
- Vraagvormen: `mc` (meerkeuze), `wo` (waar/niet waar), `koppel` (paren), `reken` (via een generator) en `open` (met `model` en `pnt`).

Het makkelijkst: stuur Claude de lesstof van een hoofdstuk en vraag om de levels te maken.

## Server installeren (eenmalig, ongeveer 10 minuten, gratis)

Dit is een **eigen** Sheet, los van de mavo-app, zodat de leerlingen en het dashboard gescheiden blijven.

1. Ga naar sheets.google.com en maak een nieuwe lege spreadsheet, bijvoorbeeld "Economie havo/vwo – server". Deel hem met niemand.
2. Kies **Extensies > Apps Script**. Verwijder de voorbeeldcode en plak de inhoud van `server/Code.gs`. Klik op Opslaan.
3. Pas bovenaan `CFG` aan: `DOCENT_CODE` (jouw code voor het docentenscherm, bijvoorbeeld 4 cijfers) en eventueel `KLASSEN`.
   Wil je andere klasnamen (bijvoorbeeld H5A, H5B), zet ze dan ook in `src/core.js` bij `KLASSEN`. Laat ze met H of V beginnen.
4. Kies de functie **setup** en klik op **Uitvoeren**. Geef toestemming (Geavanceerd > Ga naar … > Toestaan).
5. **Implementeren > Nieuwe implementatie > Web-app**. Uitvoeren als: *Ikzelf*. Toegang: *Iedereen*. Kopieer de URL (eindigt op `/exec`).
6. Stuur de URL naar Claude. Die zet hem in de app (`DATA_ENDPOINT_URL`) en zet de nieuwe versie online.

Zonder server-URL draait de app in testmodus: alles staat dan alleen op het apparaat.

## Zo raakt er niets kwijt, op de iPad en privacy

Dit werkt precies zoals bij de mavo-app: speler-ID en herstelcode (6 cijfers), direct opslaan op het apparaat, synchroniseren met
de Sheet, nooit een oudere stand over een nieuwere. De app gebruikt een andere opslagsleutel dan de mavo-app, dus beide apps
kunnen naast elkaar op dezelfde iPad staan.

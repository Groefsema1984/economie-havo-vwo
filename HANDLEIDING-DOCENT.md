# Handleiding docent · Economie havo/vwo oefenapp

## Wat zit erin

- Eén app voor havo 4, havo 5, vwo 4, vwo 5 en vwo 6. De leerling kiest bij de start zijn klas (H4, H5, V4, V5, V6).
  De eerste letter bepaalt het niveau: H = havo, V = vwo. De app toont dan alleen de levels en examenvragen van dat niveau.
- Startscherm met de tien syllabusdomeinen als werelden:
  A Vaardigheden en rekenen · B Schaarste · C Ruil · D Markt · E Ruilen over de tijd · F Samenwerken en onderhandelen ·
  G Risico en informatie · H Welvaart en groei · I Goede tijden, slechte tijden · J Onderzoek en experiment.
- Per domein nu een **startset** met basisbegrippen (8 tot 11 vragen) en een **rekenlab** met sommen die steeds nieuwe getallen
  krijgen (elasticiteit, evenwicht, break-even, MO = MK, contante waarde, reële groei, werkloosheid, enzovoort).
  Domein J is nog leeg en staat op "Komt binnenkort".
- Per domein staan de **hoofdstukken van Economie Integraal** als aparte groep: havo H1 t/m H17 en vwo H1 t/m H18 (havo H1 en H10 t/m H17 en vwo H1 en H9 t/m H14 komen uit de samenvattingen die op 24 november in de Drive zijn gezet; uitleg, begrippen en vragen zijn daarop gebaseerd en door Claude uitgeschreven, lees ze na).
  Elke paragraaf is een level met eerst uitleg en daarna vragen. Welke hoofdstukken nog ontbreken staat in het overzicht in Claude Docs.
- Alles van de mavo-app werkt hier ook: medailles (brons 6/8, zilver 7/8, goud 8/8), domeintoets met diploma, herhaalronde,
  vaardigheden per onderwerp (0-100), begrippenkaarten, badges, munten, thema's en het docentendashboard met oefentijd,
  scores per domein, moeilijkste vragen, eindtermentabel, examentrainer en CSV.
- **Eindexamentrainer**: klaar voor havo- en vwo-examens, per examen, per domein, als sprint en om te printen. Nieuw is de
  vraagvorm **open vraag**: de leerling schrijft een antwoord, ziet daarna het antwoordmodel (correctievoorschrift) en kijkt zelf na.
  Er staan **alle centrale examens van 2018 t/m 2026** in, voor havo (tijdvak 1 en 2) en vwo (tijdvak 1, 2 en in 2021 en 2022
  ook tijdvak 3). 2020 ontbreekt omdat er toen geen centraal examen was. Samen zijn dat ruim 1.200 examenvragen.
  Aanvullingen en errata van het CvTE zijn verwerkt. Invulvragen ("Kies uit ...") zijn daarnaast opgeknipt in losse
  meerkeuzevragen per open plek, zodat leerlingen die ook automatisch nagekeken kunnen oefenen.
  Figuren, grafieken en bronnen uit de bijlage zitten nog niet in de app: bij zo'n vraag staat de hint om het examen erbij te pakken.

- **Adaptief oefenen**:
  - Bij een fout antwoord krijgt de leerling in dezelfde ronde een extra vraag over hetzelfde onderwerp. Dat zijn er maximaal 3 per ronde.
    Dit gebeurt in levels, bij oefenen per onderwerp of domein en in de herhaalronde. Bij domeintoetsen, examens en de sprint gebeurt het niet.
    Deze extra vragen tellen niet mee voor de medaille, maar wel voor de vaardigheidsscore.
  - **Slim oefenen** (op Start en onder Vaardigheden) kiest 10 vragen uit de onderwerpen waar de leerling het zwakst scoort, plus een paar foute vragen uit de herhaalronde.
  - "Oefen dit domein" geeft voorrang aan de zwakste onderwerpen.

- **Leren** (nieuw menu-item) bundelt vijf extra's:
  - **Foutenschrift**: alle vragen die de leerling fout had, per leerdoel (onderwerp/eindterm), met bovenaan de leerdoelen met de
    meeste open fouten. Per leerdoel: de foute vragen opnieuw oefenen of nieuwe vragen over dat leerdoel. Ook af te drukken.
    In het docentendashboard staat bij elke leerling een foutenschrift per leerdoel.
  - **Flitskaarten**: alle begrippen per domein. De leerling draait de kaart om en kiest Wist ik niet, Twijfel of Wist ik.
    Gekende kaarten komen terug na 1, 3, 7, 14, 30 en 60 dagen (herhaling op afstand). Ook andersom te oefenen (betekenis → begrip).
  - **Formulekaart en rekenhulp**: 22 formules per domein met uitleg, een uitgewerkt voorbeeld, een rekenhulp om de eigen berekening
    te controleren en een knop om te oefenen met sommen die steeds andere getallen krijgen.
  - **Grafiektraining**: de leerling klikt in een marktdiagram op het evenwicht, het consumenten- of producentensurplus, de verhandelde
    hoeveelheid bij een maximum- of minimumprijs, het nieuwe evenwicht na een accijns, de vraag- of aanbodlijn en het punt van maximale omzet.
    Deze grafiekvragen komen ook voor bij oefenen per onderwerp onder Vaardigheden.
  - **Proeftoets per hoofdstuk**: 15 automatisch na te kijken vragen uit één hoofdstuk, ongeveer 75 seconden per vraag, zonder
    tussentijdse feedback. Daarna een cijfer (1 + 9 × score) met uitleg bij de fouten. Foute vragen gaan naar de herhaalronde.
  - **Examen op tijd** (ook onder Eindexamen → Op tijd maken): een heel oud examen op één pagina met 180 minuten (eventueel +30 min extra tijd).
    Antwoorden worden steeds bewaard, de klok loopt door. Na inleveren kijkt de leerling na met het antwoordmodel (meerkeuze gaat vanzelf,
    deelscores met rekenuitkomsten worden alvast aangevinkt) en krijgt een cijferschatting met N = 1,0 en de punten per domein.
- **Docentendashboard → Klassikaal**: per klas de zwakste onderwerpen (met de namen van leerlingen onder de 50), de vragen die de
  meeste leerlingen fout hadden, de gemiddelde proeftoetscijfers per hoofdstuk en de laatst gemaakte examens op tijd.
  Voor de proeftoets- en examencijfers in het dashboard moet de nieuwste `server/Code.gs` in Apps Script staan
  (plakken, opslaan, Implementeren → Implementaties beheren → bewerken → Nieuwe versie). De rest werkt ook zonder.

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

Het makkelijkst: stuur Claude de lesstof van een hoofdstuk en vraag om de levels te maken. De hoofdstukken staan als
tekstbestand in `hoofdstukken/` (uitleg in `hoofdstukken/LEESMIJ.txt`) en worden met `python3 tools/hoofdstukken.py` omgezet.

## Examens toevoegen

De examens komen uit de pdf's van examenblad.nl (opgaven, correctievoorschrift en eventueel aanvulling of erratum).
De tekst daarvan staat in `bron-ruw/`. `python3 tools/examen_pdf.py` leest alles in en schrijft `src/data-examen.js`
opnieuw; daarna `python3 tools/bibliotheek.py && python3 src/build.py`. Een nieuw examen (bijvoorbeeld 2027) toevoegen
is dus: de drie pdf-teksten in `bron-ruw/` zetten en deze drie commando's draaien. Formules die in het pdf onleesbaar
zijn, worden met de hand verbeterd in de lijst `CORRECTIES` bovenin `tools/examen_pdf.py`.

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

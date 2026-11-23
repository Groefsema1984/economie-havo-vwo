# Economie havo/vwo · oefenapp

Interactieve oefenapp voor economie havo 4-5 en vwo 4-6, ingedeeld per syllabusdomein (A t/m J), met eindexamentrainer.
Werkt hetzelfde als de app voor economie 4 mavo: levels met medailles, domeintoetsen, herhaalronde, vaardigheden per onderwerp,
collectie, speler-ID met herstelcode en een docentendashboard.

- App: `index.html` (één bestand, wordt gebouwd uit `src/` met `python3 src/build.py`)
- Inhoud per domein: `src/data-A.js` t/m `src/data-J.js`, examenvragen in `src/data-examen.js`
- Server: `server/Code.gs` (Google Apps Script + Google Sheet, een eigen Sheet los van de mavo-app)
- Uitleg voor de docent: [HANDLEIDING-DOCENT.md](HANDLEIDING-DOCENT.md)

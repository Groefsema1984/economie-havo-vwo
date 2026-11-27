# Economie havo/vwo · oefenapp

Interactieve oefenapp voor economie havo 4-5 en vwo 4-6, ingedeeld per syllabusdomein (A t/m J), met eindexamentrainer.
Werkt hetzelfde als de app voor economie 4 mavo: levels met medailles, domeintoetsen, herhaalronde, vaardigheden per onderwerp,
collectie, speler-ID met herstelcode en een docentendashboard.

- App: `index.html` (één bestand, wordt gebouwd uit `src/` met `python3 src/build.py`)
- Inhoud per domein: `src/data-A.js` t/m `src/data-J.js`
- Flitskaarten, formulekaart, grafiekvragen, proeftoets en examen op tijd: `src/extra.js` (klassenoverzicht in `src/docent.js`)
- Lagen kern / methode / verdieping en examen- of toetsmodus: `src/lagen.js`, indeling in `hoofdstukken/lagen.txt`
- Hoofdstukken Economie Integraal: `hoofdstukken/*.txt` → `tools/hoofdstukken.py`
- Examens havo en vwo 2018-2026 (compleet): `bron-ruw/` → `tools/examen_pdf.py` → `src/data-examen.js` (invulvragen per open plek: hele tekst met eerdere plekken ingevuld; alleen die tekst bijwerken zonder bron-ruw: `tools/invul_context.py`)
- Bronnen bij examenvragen: examen-pdf's in `bron-ruw/pdf/` (h18-1-o.pdf, -b = bijlage, -u = uitwerkbijlage) → `tools/examen_bronnen.py` → `examens/img/*.jpg` + `src/data-exbronnen.js`
- Losse oefenopgaven en eerder bewerkte examenvragen: `bibliotheek/*.txt` → `tools/bibliotheek.py`
- Server: `server/Code.gs` (Google Apps Script + Google Sheet, een eigen Sheet los van de mavo-app)
- Uitleg voor de docent: [HANDLEIDING-DOCENT.md](HANDLEIDING-DOCENT.md)

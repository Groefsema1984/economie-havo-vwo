/**
 * Economie havo/vwo oefenapp – server (Google Apps Script)
 * Bewaart de voortgang van iedere leerling centraal in deze Google Sheet.
 * Installatie: zie HANDLEIDING-DOCENT.md, stap "Server installeren".
 */
const CFG = {
  DOCENT_CODE: 'VERANDER-MIJ', // code voor het docentenscherm in de app (zelf wijzigen!)
  KLASSEN: ['H4', 'H5', 'V4', 'V5', 'V6'], // toegestane klassen (gelijk aan KLASSEN in de app; H.. = havo, V.. = vwo)
  MAX_MISLUKT: 10             // na zoveel foute herstelpogingen wordt herstellen geblokkeerd
};

const SP_KOP = ['Speler-ID', 'Naam', 'Klas', 'Herstelcode', 'Aangemaakt', 'Laatst gezien', 'Oefentijd totaal (min)',
  'Oefentijd deze week (min)', 'XP', 'Levels brons+', 'Domeintoetsen klaar', 'A Vaardigheden', 'B Schaarste', 'C Ruil',
  'D Markt', 'E Ruilen over de tijd', 'F Samenwerken en onderhandelen', 'G Risico en informatie', 'H Welvaart en groei',
  'I Goede tijden, slechte tijden', 'J Onderzoek en experiment', 'Mislukte herstelpogingen'];
const DOMEIN_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const KOL_MISLUKT = SP_KOP.length; // laatste kolom

// ---------- Installatie ----------
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sp = blad_('Spelers', SP_KOP);
  blad_('Data', ['Speler-ID', 'Bijgewerkt', 'Staat (deel 1)', 'Staat (deel 2)', 'Staat (deel 3)', 'Staat (deel 4)']);
  blad_('Logboek', ['Tijd', 'Speler-ID', 'Naam', 'Klas', 'Actie', 'XP', 'Oefentijd (min)']);
  [sp, ss.getSheetByName('Data'), ss.getSheetByName('Logboek')].forEach(function (b) {
    const p = b.protect().setDescription('Alleen docent en script');
    p.removeEditors(p.getEditors()); if (p.canDomainEdit()) p.setDomainEdit(false);
  });
  const s1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('Blad1');
  if (s1 && ss.getSheets().length > 1) ss.deleteSheet(s1);
}
function blad_(naam, kop) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let b = ss.getSheetByName(naam);
  if (!b) b = ss.insertSheet(naam);
  b.getRange(1, 1, 1, kop.length).setValues([kop]).setFontWeight('bold');
  b.setFrozenRows(1);
  return b;
}

// ---------- Web-app ----------
function doGet() { return uit_({ ok: true, app: 'economie-havo-vwo' }); }
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    switch (d.actie) {
      case 'nieuw': return uit_(nieuw_(d));
      case 'herstel': return uit_(herstel_(d));
      case 'sync': return uit_(sync_(d));
      case 'overzicht': return uit_(overzicht_(d));
      default: return uit_({ ok: false, fout: 'Onbekende actie' });
    }
  } catch (err) {
    return uit_({ ok: false, fout: String(err.message || err) });
  } finally { try { lock.releaseLock(); } catch (x) {} }
}
function uit_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// ---------- Acties ----------
function nieuw_(d) {
  const naam = String(d.naam || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  const klas = String(d.klas || '');
  if (naam.length < 3) throw new Error('Vul je naam in');
  if (CFG.KLASSEN.indexOf(klas) < 0) throw new Error('Onbekende klas');
  const sp = sheet_('Spelers'); const ids = kolom_(sp, 1); const codes = kolom_(sp, 4).map(String);
  let id; do { id = klas.toUpperCase() + '-' + rndTekst_(4); } while (ids.indexOf(id) >= 0);
  let code; do { code = String(Math.floor(100000 + Math.random() * 900000)); } while (codes.indexOf(code) >= 0);
  const nu = new Date();
  sp.appendRow([id, naam, klas, "'" + code, nu, nu, 0, 0, 0, 0, 0].concat(DOMEIN_IDS.map(function () { return ''; }), [0]));
  log_(id, naam, klas, 'nieuw', 0, 0);
  return { ok: true, id: id, code: code };
}

function herstel_(d) {
  const r = zoek_(d.id); if (!r) throw new Error('Dit speler-ID bestaat niet. Controleer je invoer.');
  controleerCode_(r, d.code);
  const staat = leesStaat_(r.id) || {};
  staat.id = r.id; staat.code = String(d.code);
  log_(r.id, r.naam, r.klas, 'herstel', staat.xp || 0, Math.round((staat.tijd || 0) / 60));
  return { ok: true, staat: staat };
}

function sync_(d) {
  const r = zoek_(d.id); if (!r) throw new Error('Onbekend speler-ID');
  controleerCode_(r, d.code);
  const binnen = d.staat || {};
  const oud = leesStaat_(r.id);
  const nieuw = oud ? mergeStaat_(oud, binnen) : binnen;
  nieuw.id = r.id; nieuw.naam = r.naam; nieuw.klas = r.klas; // naam en klas bepaalt de server
  delete nieuw.code;                                          // code niet in de data opslaan
  schrijfStaat_(r.id, nieuw);
  // samenvatting in Spelers
  const sam = samenvat_(nieuw);
  const sp = sheet_('Spelers');
  const rij = [new Date(), Math.round(sam.tijd / 60), Math.round(sam.tijdWeek / 60), sam.xp, sam.brons, sam.toetsen]
    .concat(DOMEIN_IDS.map(function (k) { return sam.dom[k]; })).map(function (x) { return x === null ? '' : x; });
  sp.getRange(r.rij, 6, 1, rij.length).setValues([rij]);
  const terug = JSON.parse(JSON.stringify(nieuw)); terug.code = String(d.code);
  return { ok: true, staat: terug };
}

function overzicht_(d) {
  if (String(d.docentcode) !== String(CFG.DOCENT_CODE)) { Utilities.sleep(1500); throw new Error('Onjuiste docentcode'); }
  const sp = sheet_('Spelers'); const rijen = sp.getLastRow() > 1 ? sp.getRange(2, 1, sp.getLastRow() - 1, 4).getValues() : [];
  const data = {}; const db = sheet_('Data');
  if (db.getLastRow() > 1) db.getRange(2, 1, db.getLastRow() - 1, 6).getValues().forEach(function (x) {
    try { data[x[0]] = JSON.parse(String(x[2]) + String(x[3]) + String(x[4]) + String(x[5])); } catch (e) {}
  });
  const spelers = rijen.filter(function (x) { return x[0]; }).map(function (x) {
    const s = data[x[0]] || {}; s.id = x[0]; s.naam = x[1]; s.klas = x[2];
    const sam = samenvat_(s); sam.code = String(x[3]).replace(/^'/, ''); return sam;
  });
  return { ok: true, spelers: spelers };
}

// ---------- Opslag ----------
function sheet_(n) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n); }
function kolom_(b, k) { return b.getLastRow() > 1 ? b.getRange(2, k, b.getLastRow() - 1, 1).getValues().map(function (r) { return r[0]; }) : []; }
function zoek_(id) {
  id = String(id || '').toUpperCase(); if (!id) return null;
  const sp = sheet_('Spelers'); const ids = kolom_(sp, 1); const i = ids.map(function (x) { return String(x).toUpperCase(); }).indexOf(id); if (i < 0) return null;
  const rij = i + 2; const v = sp.getRange(rij, 1, 1, KOL_MISLUKT).getValues()[0];
  return { rij: rij, id: String(v[0]), naam: v[1], klas: v[2], code: String(v[3]).replace(/^'/, ''), mislukt: Number(v[KOL_MISLUKT - 1]) || 0 };
}
function controleerCode_(r, code) {
  const sp = sheet_('Spelers');
  if (r.mislukt >= CFG.MAX_MISLUKT) throw new Error('Te veel foute pogingen. Vraag je docent om je account vrij te geven.');
  if (String(code) !== r.code) {
    sp.getRange(r.rij, KOL_MISLUKT).setValue(r.mislukt + 1); Utilities.sleep(1000);
    throw new Error('De herstelcode klopt niet.');
  }
  if (r.mislukt) sp.getRange(r.rij, KOL_MISLUKT).setValue(0);
}
function leesStaat_(id) {
  const db = sheet_('Data'); const ids = kolom_(db, 1); const i = ids.map(function (x) { return String(x).toUpperCase(); }).indexOf(id); if (i < 0) return null;
  const v = db.getRange(i + 2, 3, 1, 4).getValues()[0];
  try { return JSON.parse(v.join('')); } catch (e) { return null; }
}
function schrijfStaat_(id, staat) {
  const db = sheet_('Data'); const ids = kolom_(db, 1); let i = ids.indexOf(id);
  const json = JSON.stringify(staat); const N = 45000; const delen = [];
  for (let k = 0; k < 4; k++) delen.push(json.slice(k * N, (k + 1) * N));
  if (json.length > 4 * N) throw new Error('Voortgang te groot om op te slaan');
  const rij = [id, new Date()].concat(delen);
  if (i < 0) db.appendRow(rij); else db.getRange(i + 2, 1, 1, 6).setValues([rij]);
}
function log_(id, naam, klas, actie, xp, min) { sheet_('Logboek').appendRow([new Date(), id, naam, klas, actie, xp, min]); }
function rndTekst_(n) { const t = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < n; i++) s += t[Math.floor(Math.random() * t.length)]; return s; }

// ---------- Samenvoegen (zelfde regels als in de app: voortgang kan alleen groeien) ----------
const UNION = { kaarten: 1, badges: 1, gekocht: 1 };
function merge_(a, b) {
  if (a === undefined || a === null) return b; if (b === undefined || b === null) return a;
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (Array.isArray(a) && Array.isArray(b)) return b;
  if (typeof a === 'object' && typeof b === 'object') {
    const o = {}; const ks = Object.keys(a).concat(Object.keys(b));
    ks.forEach(function (k) {
      if (k in o) return;
      if (UNION[k] && Array.isArray(a[k]) && Array.isArray(b[k])) { const u = a[k].slice(); b[k].forEach(function (x) { if (u.indexOf(x) < 0) u.push(x); }); o[k] = u; }
      else if (k === 'et') o[k] = mergeEt_(a[k], b[k]);
      else o[k] = merge_(a[k], b[k]);
    });
    return o;
  }
  return b;
}
function mergeEt_(a, b) {
  a = a || {}; b = b || {}; const o = {};
  Object.keys(a).concat(Object.keys(b)).forEach(function (k) { const x = a[k] || { n: 0, r: [] }, y = b[k] || { n: 0, r: [] }; o[k] = (y.n >= x.n) ? y : x; });
  return o;
}
function mergeStaat_(p, q) {
  const xy = (p.upd || 0) <= (q.upd || 0) ? [p, q] : [q, p];
  const m = merge_(xy[0], xy[1]); m.upd = Math.max(xy[0].upd || 0, xy[1].upd || 0); return m;
}

// ---------- Samenvatting voor docent ----------
function weekId_(d) {
  d = d || new Date(); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return t.getUTCFullYear() + '-W' + ('0' + Math.ceil(((t - y) / 864e5 + 1) / 7)).slice(-2);
}
// onderwerpcodes beginnen met de domeinletter ('D.elas'), examenvragen met 'EX.' ('EX.D')
function etDomein_(k) { const d = k.indexOf('EX.') === 0 ? k.slice(3, 4) : k.split('.')[0]; return DOMEIN_IDS.indexOf(d) >= 0 ? d : null; }
function samenvat_(s) {
  const per = {}; DOMEIN_IDS.forEach(function (d) { per[d] = []; });
  const et = s.et || {};
  Object.keys(et).forEach(function (k) {
    const r = et[k].r || []; if (r.length < 3) return; let a = 0, w = 0;
    r.forEach(function (x, i) { a += x * (i + 1); w += i + 1; });
    const d = etDomein_(k); if (d) per[d].push(Math.round(a / w * 100));
  });
  const dom = {}; DOMEIN_IDS.forEach(function (d) { const l = per[d]; dom[d] = l.length ? Math.round(l.reduce(function (x, y) { return x + y; }, 0) / l.length) : null; });
  const fout = {}; Object.keys(s.vr || {}).forEach(function (k) { if (s.vr[k].f) fout[k] = s.vr[k].f; });
  const lv = s.lv || {}; const toets = s.toets || {};
  return { id: s.id, naam: s.naam, klas: s.klas, laatst: s.upd || 0, tijd: s.tijd || 0, tijdWeek: (s.week || {})[weekId_()] || 0,
    xp: s.xp || 0, lv: lv, toets: toets, dom: dom, fout: fout, et: et,
    vr: s.vr || {}, week: s.week || {}, dag: s.dag || {}, nk: (s.kaarten || []).length, badges: s.badges || [],
    sprint: s.sprint || null, pt: s.pt || {}, exr: s.exr || {}, herhaal: (s.herhaal || []).length, aangemaakt: s.aangemaakt || 0, munten: (s.mVerd || 0) - (s.mUit || 0),
    brons: Object.keys(lv).filter(function (k) { return lv[k].best >= 6; }).length,
    toetsen: Object.keys(toets).filter(function (k) { return toets[k].klaar; }).length };
}

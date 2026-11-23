"""Zet complete centrale examens (opgavenboekje + correctievoorschrift, als tekst uit de pdf's) om naar src/data-examen.js.

Invoer: bron-ruw/02_EXAMENCONTEXT_{HAVO|VWO}_ECO_{jaar}_TIJDVAK_{n}_OPGAVEN.pdf.md en ..._CORRECTIEVOORSCHRIFT.pdf.md
(haal ze met tools/uit_transcript.py uit het sessietranscript nadat ze met de Drive-connector zijn gelezen).

Per examenvraag:
- een open vraag met de context van de opgave en het antwoord uit het correctievoorschrift;
- invulvragen ('Kies uit: bij (1) ... / ...') worden daarnaast gesplitst in losse meerkeuzevragen, één per open plek;
- vragen waarvoor 'altijd de scorepunten worden toegekend' (fout in het examen) worden overgeslagen.
Vragen met 'Gebruik bron ...' verwijzen naar de bijlage, die (nog) niet in de app staat: dat wordt bij de vraag gemeld.
"""
import glob, json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TV = {1: 'I', 2: 'II', 3: 'III'}

# grove indeling naar syllabusdomein op trefwoorden (eerste treffer wint, volgorde telt)
DOMEIN_WOORDEN = [
    ('F', ['spel', 'speler', 'strategie', 'nash', 'gevangenendilemma', 'beslisboom', 'onderhandel', 'meelift', 'cao', 'vakbond', 'collectief goed', 'collectieve goederen', 'ultimatum', 'sociale norm', 'verdelingsvoorstel', 'kartel', 'prijsafspra', 'herhaald', 'samenwerk']),
    ('G', ['verzeker', 'risico', 'premie', 'moral hazard', 'averechtse', 'asymmetrische', 'aandelen', 'obligatie', 'beleggen']),
    ('E', ['pensioen', 'dekkingsgraad', 'omslagstelsel', 'kapitaaldekking', 'contante waarde', 'sparen', 'lenen', 'hypothe', 'generatie', 'staatsschuld', 'overheidsschuld', 'houdbaarheid', 'grijze druk', 'vergrijzing', 'ruilen over de tijd', 'ruilt over de tijd']),
    ('I', ['inflatie', 'conjunctuur', 'werkloos', 'ecb', 'centrale bank', 'bestedingen', 'begrotingstekort', 'begrotingssaldo', 'koopkracht', 'rente', 'beroepsbevolking', 'deflatie', 'laagconjunctuur', 'hoogconjunctuur', 'prijspeil', 'werkgelegenheid', 'arbeidsaanbod']),
    ('H', ['bbp', 'toegevoegde waarde', 'welvaart', 'groei', 'inkomensverdeling', 'lorenz', 'nivell', 'belasting', 'arbeidsproductiviteit', 'arbeidsjaren']),
    ('C', ['export', 'import', 'wisselkoers', 'handel', 'comparatie', 'protectie', 'invoerrecht']),
    ('D', ['markt', 'prijs', 'elasticiteit', 'omzet', 'winst', 'kosten', 'surplus', 'monopol', 'oligopol', 'concurrentie', 'accijns', 'extern', 'substitut', 'complementair', 'marktvorm', 'mededinging', 'minimumprijs', 'maximumprijs', 'consumentensurplus', 'producentensurplus', 'aanbodlijn', 'vraaglijn', 'emissie', 'co2', 'vervuil', 'milieu']),
]

def domein(vraag, context=''):
    """domein met de meeste trefwoorden; de vraag zelf telt drie keer zo zwaar als de context"""
    q, c = vraag.lower(), context.lower()
    score = {d: 3 * sum(q.count(w) for w in ws) + sum(c.count(w) for w in ws) for d, ws in DOMEIN_WOORDEN}
    beste = max(score.values())
    if not beste: return 'D'
    return next(d for d, _ in DOMEIN_WOORDEN if score[d] == beste)

def schoon(s):
    s = re.sub(r'\\([-\[\]_*#])', r'\1', s)
    s = re.sub(r'[A-Z]{2}-\d{4}-[a-z]-\d\d-\d-[ocb]\s+\d+\s*/?\s*\d*\s*(lees verder|einde)?\s*►*', ' ', s)
    s = re.sub(r'lees verder\s*►+|einde\s*►+|∎', ' ', s)
    s = re.sub(r'\n(?=[a-zà-ü(€0-9])', ' ', s)   # afgebroken regels aan elkaar
    return re.sub(r'[ \t]+', ' ', s).strip()

def opgaven(tekst):
    """-> lijst van (opgavetitel, context, nr, punten, vraagtekst)"""
    t = schoon(tekst)
    t = t[t.find('Opgave 1'):] if 'Opgave 1' in t else t
    uit = []
    for blok in re.split(r'(?=Opgave \d+ )', t):
        m = re.match(r'Opgave (\d+) (.+?)(?:\n|$)', blok)
        if not m: continue
        titel = m.group(2).strip()
        rest = blok[m.end():]
        # vraagkop: '2p 5 Leg uit ...'
        delen = re.split(r'(?:^|\s)(\d)p (\d{1,2}) ', rest)
        ctx = delen[0]
        for i in range(1, len(delen) - 2, 3):
            pnt, nr, body = int(delen[i]), int(delen[i + 1]), delen[i + 2]
            # de vraag loopt tot de eerste lege regel; wat daarna komt is context voor de volgende vraag
            stukken = re.split(r'\n\s*\n', body.strip(), maxsplit=1)
            # pdf-tekst zet soms een lege regel midden in de vraag: plak door zolang de zin niet af is
            while len(stukken) > 1 and not re.search(r'[.?!:)]\s*$', stukken[0]):
                verder = re.split(r'\n\s*\n', stukken[1], maxsplit=1)
                stukken = [stukken[0] + ' ' + verder[0]] + verder[1:]
            # 'Leg je antwoord uit.' / 'Ga als volgt te werk: ...' na een lege regel hoort nog bij de vraag
            if len(stukken) > 1 and re.match(r'(Leg je|Licht je|Motiveer|Ga als volgt|Doe het als volgt|Gebruik hierbij|Rond (je|af)|Geef (daarbij|hierbij)|Noteer)', stukken[1].strip()):
                verder = re.split(r'\n\s*\n', stukken[1], maxsplit=1)
                stukken = [stukken[0] + '\n' + verder[0].strip()] + verder[1:]
            vraag = stukken[0]
            if 'Kies uit' in body and 'Kies uit' not in vraag:   # invulvraag: tekst + 'Kies uit' horen erbij
                km = re.search(r'Kies uit:.*?(?=\n\s*\n|$)', body, re.S)
                vraag = body[:km.end()] if km else vraag
                naloop = body[km.end():] if km else ''
            else:
                naloop = stukken[1] if len(stukken) > 1 else ''
            # 'Gebruik bron 1.' staat vlak vóór de vraagkop: haal het uit de context naar de vraag
            gm = re.search(r'(Gebruik [^\n]*?\.)\s*$', ctx.strip())
            gebruik = gm.group(1) if gm else ''
            if gm: ctx = ctx.strip()[:gm.start()]
            c = re.sub(r'\s+', ' ', ctx).strip()
            if not c and uit and uit[-1]['opgave'] == titel: c = uit[-1]['ctx']
            uit.append({'opgave': titel, 'ctx': c, 'nr': nr, 'pnt': pnt,
                        'q': (gebruik + '\n' if gebruik else '') + vraag.strip()})
            ctx = naloop
    return uit

def antwoorden(tekst):
    t = schoon(tekst)
    t = t[t.find('4 Beoordelingsmodel'):] if '4 Beoordelingsmodel' in t else t
    t = re.split(r'\n5 Aanleveren scores', t)[0]
    uit = {}
    for m in re.finditer(r'(?:^|\s)(\d{1,2}) maximumscore (\d)\s*(.*?)(?=\s\d{1,2} maximumscore \d|\n[ \t]*Opgave \d+ |\Z)', t, re.S):
        a = m.group(3)
        a = re.sub(r'Vraag Antwoord Scores', ' ', a)
        a = re.sub(r'\s*\n\s*', '\n', a).strip()
        a = re.sub(r' (\d)\n', r' (\1p)\n', a + '\n').strip()   # deelscore achter een bullet
        uit[int(m.group(1))] = a
    return uit

def splits_invul(v, antw):
    """Invulvraag -> meerkeuzevragen per open plek. Geeft [] als het niet eenduidig lukt."""
    km = re.search(r'Kies uit:(.*)$', v['q'], re.S)
    if not km: return []
    kies = km.group(1)
    opties = {}
    for m in re.finditer(r'bij \((\d)\)\s*(.*?)(?=bij \(\d\)|$)', kies, re.S):
        o = [re.sub(r'\s+', ' ', x).strip(' .') for x in re.split(r'\s/\s', m.group(2).strip()) if x.strip(' .\n')]
        if len(o) >= 2: opties[int(m.group(1))] = o
    juist = {int(m.group(1)): m.group(2).strip(' .') for m in re.finditer(r'\((\d)\)\s*([^()\n•]+?)(?=\s*\(\dp\)|\s*\(\d\)|\s+\d\s*$|\s+\d\n|\n|$|\s+indien|\s+of\s)', antw)}
    dubbel = {k for k in range(1, 10) if len(re.findall(r'\(%d\)' % k, antw)) > 1}   # meerdere goede antwoordsets
    tekst = re.sub(r'\s+', ' ', v['q'][:km.start()])
    zinnen = re.split(r'(?<=[.!?])\s+|\s-\s|^-\s', tekst)
    uit = []
    for k, o in sorted(opties.items()):
        if k in dubbel: continue
        j = juist.get(k, '')
        idx = next((i for i, x in enumerate(o) if x.lower() == j.lower()), None)
        if idx is None: idx = next((i for i, x in enumerate(o) if j and (j.lower().startswith(x.lower()) or x.lower().startswith(j.lower()))), None)
        if idx is None: return []   # niet eenduidig: dan alleen de open vraag
        zin = next((z for z in zinnen if f'({k})' in z), '')
        zin = re.sub(r'(?:…|\.\.\.)\s*\(%d\)\s*(?:…|\.\.\.)' % k, '…', zin).strip(' -')
        zin = re.sub(r'…\s*\((\d)\)\s*…', r'…(\1)…', zin)
        zin = re.sub(r'^Maak [^:]*:\s*', '', zin)
        uit.append({'k': k, 'zin': zin, 'o': o, 'a': idx})
    return uit

def main():
    vragen, rapport = [], []
    bib = {}
    pad = os.path.join(ROOT, 'src', 'data-bibliotheek.js')
    if os.path.exists(pad):   # domein van examenvragen die al in de bibliotheek staan
        for m in re.finditer(r'"id": "(ex\.[hv]\d\d-\d\.\d+)",[^}]*?"d": "([A-J])"', open(pad, encoding='utf-8').read()):
            bib[m.group(1)] = m.group(2)
    for f in sorted(glob.glob(os.path.join(ROOT, 'bron-ruw', '02_EXAMENCONTEXT_*_OPGAVEN.pdf.md'))):
        m = re.search(r'_(HAVO|VWO)_ECO_(\d{4})_TIJDVAK_(\d)_OPGAVEN', f)
        niv, jaar, tv = m.group(1)[0].lower(), int(m.group(2)), int(m.group(3))
        cvp = f.replace('_OPGAVEN.pdf.md', '_CORRECTIEVOORSCHRIFT.pdf.md')
        if not os.path.exists(cvp): rapport.append(f'{os.path.basename(f)}: correctievoorschrift ontbreekt'); continue
        ex = f'{niv}{jaar % 100:02d}-{tv}'
        ops = opgaven(open(f, encoding='utf-8').read()); cv = antwoorden(open(cvp, encoding='utf-8').read())
        n_open = n_mc = 0
        for v in ops:
            a = cv.get(v['nr'])
            if not a: rapport.append(f'{ex} vraag {v["nr"]}: geen antwoord gevonden'); continue
            if 'altijd worden toegekend' in a: continue
            eid = f'ex.{ex}.{v["nr"]}'
            d = bib.get(eid) or domein(v['q'], v['opgave'] + ' ' + v['ctx'])
            basis = {'niv': niv, 'ex': ex, 'jaar': jaar, 'tv': tv, 'titel': v['opgave'], 'd': d, 'e': 'EX.' + d}
            q = v['q']
            if re.search(r'Gebruik[^.]*\bbron', q): q += '\n(De bron staat in de bijlage van het examen. Die zit nog niet in de app: pak het examen erbij.)'
            elif re.search(r'Gebruik[^.]*\b(figuur|tabel|grafiek)', q): q += '\n(De figuur of tabel staat in het examen zelf. Die zit nog niet in de app: pak het examen erbij.)'
            vragen.append(dict(basis, id=eid, t='open', nr=v['nr'], ctx=v['ctx'], q=q, model=a, pnt=v['pnt'])); n_open += 1
            for s in splits_invul(v, a):
                vragen.append(dict(basis, id=f'{eid}.{s["k"]}', t='ex', nr=v['nr'] + s['k'] / 10, ctx=v['ctx'],
                                   q=f'Vraag {v["nr"]}, open plek ({s["k"]}): kies het juiste woord.\n{s["zin"]}', o=s['o'], a=s['a'],
                                   u=f'Juist is: {s["o"][s["a"]]}.'))
                n_mc += 1
        rapport.append(f'{ex}: {n_open} open vragen, {n_mc} meerkeuzevragen uit invulvragen')
    kop = open(os.path.join(ROOT, 'src', 'data-examen.js'), encoding='utf-8').read().split('const EXAMEN')[0]
    out = kop + 'const EXAMEN = {vragen:[]};\n// AUTOMATISCH GEMAAKT door tools/examen_pdf.py uit de complete examens (opgaven + correctievoorschrift).\n'
    out += f'EXAMEN.vragen.push(...{json.dumps(vragen, ensure_ascii=False, indent=0)});\n'
    open(os.path.join(ROOT, 'src', 'data-examen.js'), 'w', encoding='utf-8').write(out)
    print('\n'.join(rapport))

if __name__ == '__main__': sys.exit(main())

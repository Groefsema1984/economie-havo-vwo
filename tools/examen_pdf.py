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
    ('I', ['inflatie', 'conjunctuur', 'werkloos', 'ecb', 'centrale bank', 'bestedingen', 'begrotingstekort', 'begrotingssaldo', 'koopkracht', 'rente', 'beroepsbevolking', 'deflatie', 'laagconjunctuur', 'hoogconjunctuur', 'prijspeil', 'werkgelegenheid', 'arbeidsaanbod', 'procyclisch', 'anticyclisch', 'conjunctu']),
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

# formules die in het pdf onleesbaar zijn: (examen, vraag, kapot, goed)
CORRECTIES = [('v21-2', 23, 'koersstijging= , ×100%', 'koersstijging = (41,71 − 35) / 35 × 100%'),
              ('v19-2', 9, '(44% van 12 300) + 173\n= € 25,42.', '((44% van € 300) + € 173) / 12 = € 25,42 per maand.'),
              ('v19-2', 16, '602 + 252 + 82 + 72 = 4.338', '60² + 25² + 8² + 7² = 4.338'),
              ('v19-2', 16, 'HHI > 602 > 2.000', 'HHI > 60² > 2.000'),
              ('v19-2', 17, 'PNetshop = 347,50\n75 = € 4,63 2', 'PNetshop = 347,50 / 75 = € 4,63 (2p)'),
              ('v19-2', 17, '• 4,63 − 6,95\n6,95x 100%', '• (4,63 − 6,95) / 6,95 × 100%'),
              ('v18-1', 15, '564,3 667,7\n− 491,1\nx 100%', '(564,3 − 491,1) / 667,7 × 100%'),
              ('v18-1', 18, '66,67\n200 × 100%', '66,67 / 200 × 100%'),
              ('v18-1', 22, '480 200.000 × 100%', '480 / 200.000 × 100%'),
              ('v18-2', 1, '9 × 1,03524 = 9 × 2,283328', '9 × 1,035²⁴ = 9 × 2,283328'),
              ('v18-2', 1, '100 × 1,013224 = 136,99 20,55 136,99 × 100%', '100 × 1,0132²⁴ = 136,99; 20,55 / 136,99 × 100%'),
              ('v18-2', 6, '105,0 100 99,2 105,9 × = 104,5 × 100 94,7 110,4 = − × 94,7 99,2 100% -4,5% 99,2 =', '2009: 105,0 / 105,9 × 100 = 99,2; 2014: 104,5 / 110,4 × 100 = 94,7; (94,7 − 99,2) / 99,2 × 100% = −4,5%'),
              ('v18-2', 8, '→ 1,0126 1,0027 1,01 1,0255 2,55% × × = stijging 2,55 100% 24,5% 110,4 100 × = −', '1,0126 × 1,0027 × 1,01 = 1,0255 → stijging 2,55%; 2,55 / (110,4 − 100) × 100% = 24,5%'),
              ('v18-2', 15, '110.000\n150.000 × 100% = 73,33% tot 190.000\n200.000 × 100%', '110.000 / 150.000 × 100% = 73,33% tot 190.000 / 200.000 × 100%'),
              ('v18-2', 17, '( 106,5\n74,5 − 1) × 100%', '(106,5 / 74,5 − 1) × 100%'),
              ('v19-2', 23, '1,01885 = 1,0976 1,0976 1,0562 = 1,039', '1,0188⁵ = 1,0976; 1,0976 / 1,0562 = 1,039')]

def schoon(s):
    s = re.sub(r'\\([-\[\]_*#!<>=+.&])', r'\1', s)
    s = re.sub(r'[A-Za-z]{2}-\d{4}-[a-z](?:-\d\d-\d)?-[ocb](?:-[AE])?\s+\d+\s*/?\s*\d*\s*(lees verder|einde)?\s*►*', ' ', s)
    s = re.sub(r'[A-Za-z]{2}-\d{4}-[a-z]-\d\d-\d-[ocb]-[AE]\d?\b', ' ', s)   # voetregel van aanvulling/erratum
    s = re.sub(r"(?:(?<=[a-zà-ü]{3})|(?<=[A-Z]))- (?!en\b|of\b|tot\b|t/m\b)(?=[a-zà-ü]{3})", "-", s)   # afbreekstreepje aan regeleinde: 'principaal- agent'
    s = re.sub(r'ð[\x80-\xbf]*¥', '×', s)   # kapotte wiskunde-x uit het pdf
    s = re.sub(r'lees verder\s*►+|einde\s*►+|∎', ' ', s)
    s = re.sub(r'Let op: de laatste vragen van dit examen staan op de volgende pagina\.|Ga verder op de volgende pagina\.', ' ', s)
    s = re.sub(r'\s*\n\s*(?=/ )', ' ', s)   # '… monopolie\n\n/ oligopolie'
    s = re.sub(r'(?<!\n)\n(?=[a-zà-ü(€0-9])', ' ', s)   # afgebroken regels aan elkaar (niet over een witregel)
    return re.sub(r'[ \t]+', ' ', s).strip()

def opgaven(tekst):
    """-> lijst van (opgavetitel, context, nr, punten, vraagtekst)"""
    t = re.split(r'\n\s*erratumblad', tekst)[0]
    t = re.sub(r'(?<=[a-zà-ü,])[ \t]*\n\s*\n(?=[a-zà-ü])(?!uit )', ' ', t)   # zin loopt door over een witregel
    t = schoon(t)
    t = re.sub(r'(?m)^[ \t]*(Opgave \d+)[ \t]*\n\s*', r'\1 ', t)   # oude examens: titel op de regel na 'Opgave 1'
    if 'Opgave 1' in t:
        voor, t = t[:t.find('Opgave 1')], t[t.find('Opgave 1'):]
        # paginaopmaak: soms staan de eerste vragen vóór de kop 'Opgave 1' -> achter de inleiding van opgave 1 zetten
        vm = re.search(r'(?:^|\s)\dp \d{1,2} ', voor)
        if vm:
            losse = voor[vm.start():].strip()
            em = re.search(r'(?:^|\s)\dp \d{1,2} ', t)
            t = t[:em.start()] + '\n\n' + losse + '\n\n' + t[em.start():] if em else t + '\n\n' + losse
    uit = []
    for blok in re.split(r'(?=Opgave \d+ )', t):
        m = re.match(r'Opgave (\d+) (.+?)(?:\n|$)', blok)
        if not m: continue
        titel = m.group(2).strip()
        rest = blok[m.end():]
        if len(titel) > 70:   # titel en eerste zin op één regel: 'Zekerheidszoekers in de zorg Sinds 2006 is ...'
            mm = re.match(r'(.{3,60}?[?!])\s+(.*)$', titel) or re.match(r'(\S+(?:\s+[a-zà-ü0-9…][^\s]*)+)\s+([A-Z].*)$', titel)
            if mm and len(mm.group(1)) <= 60: titel, rest = mm.group(1), mm.group(2) + '\n' + rest
        # vraagkop: '2p 5 Leg uit ...'
        delen = re.split(r'(?:^|\s)(\d)p (\d{1,2}) ', rest)
        ctx = delen[0]
        for i in range(1, len(delen) - 2, 3):
            pnt, nr, body = int(delen[i]), int(delen[i + 1]), delen[i + 2]
            # de vraag loopt tot de eerste lege regel; wat daarna komt is context voor de volgende vraag
            stukken = re.split(r'\n\s*\n', body.strip(), maxsplit=1)
            # pdf-tekst zet soms een lege regel midden in de vraag: plak door zolang de zin niet af is
            while len(stukken) > 1 and 'Kies uit' not in stukken[0] and (not re.search(r'[.?!:)]\s*$', stukken[0])
                    or re.search(r'\)\s*$', stukken[0]) and re.match(r'\s*[a-zà-ü]', stukken[1]) and not re.match(r'\s*uit ', stukken[1])):
                verder = re.split(r'\n\s*\n', stukken[1], maxsplit=1)
                stukken = [stukken[0] + ' ' + verder[0]] + verder[1:]
            # 'Leg je antwoord uit.' / 'Ga als volgt te werk: ...' na een lege regel hoort nog bij de vraag
            if len(stukken) > 1 and (re.search(r':\s*$', stukken[0]) and re.match(r'\s*\\?-\s', stukken[1]) or re.search(r'onderstaande (tabel|zinnen|tekst)|als volgt', stukken[0]) and re.match(r'\s*[a-zà-ü]', stukken[1]) and not re.match(r'\s*uit ', stukken[1]) or re.search(r'(?:^|\s)A\s.+\sB\s.+\sC\s', re.split(r'\n\s*\n', stukken[1])[0], re.S) and pnt == 1 or re.match(r'(Betrek|Leg je|Licht je|Motiveer|Ga als volgt|Doe (het|dit) als volgt|Gebruik hierbij|Rond (je|af)|Geef (daarbij|hierbij)|Noem daarbij|Noteer)', stukken[1].strip())):
                verder = re.split(r'\n\s*\n', stukken[1], maxsplit=1)
                stukken = [stukken[0] + '\n' + verder[0].strip()] + verder[1:]
                while len(stukken) > 1 and 'Kies uit' not in stukken[0] and (not re.search(r'[.?!:)]\s*$', stukken[0]) and (re.match(r'\s*[a-zà-ü(]', stukken[1]) or re.search(r'\b(en|of|de|het|een|van)\s*$', stukken[0]))
                        or re.search(r'\)\s*$', stukken[0]) and re.match(r'\s*[a-zà-ü]', stukken[1]) and not re.match(r'\s*uit ', stukken[1])
                        or re.search(r':\s*$', stukken[0]) and re.match(r'\s*\\?-\s', stukken[1])):   # zin of opsomming loopt nog door
                    verder = re.split(r'\n\s*\n', stukken[1], maxsplit=1)
                    stukken = [stukken[0] + ' ' + verder[0]] + verder[1:]
            vraag = stukken[0]
            if 'Kies uit' in body and 'Kies uit' not in vraag:   # invulvraag: tekst + 'Kies uit' horen erbij
                km = re.search(r'Kies uit:.*?(?=\n\s*\n|$)', body, re.S)
                vraag = body[:km.end()] if km else vraag
                naloop = body[km.end():] if km else ''
            else:
                naloop = stukken[1] if len(stukken) > 1 else ''
            # pdf zonder witregel: '… juist is. De DNB-econoom simuleert …' -> context van de volgende vraag
            zm = None if 'Kies uit' in vraag else re.search(r'(?<=[.?]) (?=(?:De|Het|Daarnaast|Volgens) [^\n:“(]{80,}$)', vraag, re.S)
            if zm: vraag, naloop = vraag[:zm.start()], vraag[zm.end():] + '\n\n' + naloop
            if 'Kies uit' in vraag:   # keuzelijst loopt door na een witregel: '… / primaire\n\ninkomens bij (2) …'
                while True:
                    d = re.split(r'\n\s*\n', naloop.lstrip('\n'), maxsplit=1)
                    if not d[0].strip() or not (re.match(r'\s*[a-zà-ü/]', d[0]) and (len(d[0].strip()) < 60 or re.search(r'\bbij \(\d\)', d[0]))): break
                    vraag = vraag.rstrip() + ' ' + d[0].strip(); naloop = d[1] if len(d) > 1 else ''
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

def deelscores(a):
    """'… lager is 1' aan het eind van een regel -> '… lager is (1p)'; niet bij 'grafiek 3' of 'indien … juist 2'"""
    a = re.sub(r'(?m)^(•.{20,}) (\d) of$', r'\1 \2\nof', a)
    return '\n'.join(re.sub(r' (\d)$', r' (\1p)', r) if (len(r) > 25 or r.startswith('•') or re.search(r'= -?[\d,.]+%? \d$', r)) and 'indien' not in r and not r.endswith(' 0') else r for r in a.split('\n')).strip()

def antwoorden(tekst):
    t = schoon(tekst)
    t = t[t.find('4 Beoordelingsmodel'):] if '4 Beoordelingsmodel' in t else t
    t = re.split(r'\n\s*5 Aanleveren scores', t)[0]
    uit = {}
    for m in re.finditer(r'(?:^|\s)(\d{1,2}) maximumscore (\d)\s*(.*?)(?=\s\d{1,2} maximumscore \d|\n[ \t]*Opgave \d+\b|\Z)', t, re.S):
        a = m.group(3)
        a = re.sub(r'(?m)Vraag Antwoord Scores|^[ \t]*(?:Vraag|Antwoord|Scores|Scores Vraag)[ \t]*$', ' ', a)   # kopregels van de pagina
        a = re.sub(r'\s*\n\s*', '\n', a).strip()
        a = re.sub(r'\n(\d)(?=\n(?:•|of\b)|$)', r' \1', a)   # score op een eigen regel
        a = re.sub(r'•\n', '• ', a)   # opsommingsteken los op een regel
        a = deelscores(a)
        uit[int(m.group(1))] = a
    for m in re.finditer(r'(?:^|\n)\s*(\d{1,2}) ([A-F])\s*(?=\n)', t):   # meerkeuzevraag: '23 C'
        uit.setdefault(int(m.group(1)), 'MC:' + m.group(2))
    return uit

def splits_invul(v, antw):
    """Invulvraag -> meerkeuzevragen per open plek. Geeft [] als het niet eenduidig lukt."""
    km = re.search(r'Kies uit:(.*)$', v['q'], re.S)
    if not km: return []
    if 'één of meer' in km.group(1): return []   # meerdere letters goed: geen meerkeuzevraag
    kies = km.group(1)
    opties = {}
    for m in re.finditer(r'(?:[Bb]ij )?\((\d)\)\s*(.*?)(?=(?:[Bb]ij )?\(\d\)|$)', kies, re.S):
        o = [re.sub(r'\s+', ' ', x).strip(' .') for x in re.split(r'\s/\s|(?<=[a-zà-ü])/(?=[a-zà-ü])', m.group(2).strip()) if x.strip(' .\n')]
        if len(o) >= 2: opties[int(m.group(1))] = o
    antw = re.split(r'\b[Ii]ndien\b|Opmerking|\n\(\d\) en \(\d\)|•\s*\(\d\) en \(\d\)|•\s*\(\d\) juist', antw)[0]   # alleen het modelantwoord, niet de puntentelling
    juist = {int(m.group(1)): re.sub(r'\s+bij$', '', m.group(2).strip(' .')) for m in re.finditer(r'\((\d)\):?\s*([^()\n•]+?)(?=\s*\(\dp\)|\s*\(\d\)|\s+\d\s*$|\s+\d\n|\n|$|\s+indien|\s+of\s)', antw)}
    dubbel = {k for k in range(1, 10) if len(re.findall(r'\(%d\)' % k, antw)) > 1}   # meerdere goede antwoordsets
    tekst = re.sub(r'\s+', ' ', v['q'][:km.start()])
    if '(1)' not in tekst: tekst = re.sub(r'\s+', ' ', v['ctx']) + ' ' + tekst   # de zinnen staan soms boven de vraag
    tekst = re.sub(r'(?:…|\.\.\.)\s*\((\d)\)\s*(?:…|\.\.\.)', r'…(\1)…', tekst)   # '...(1)…' geen zinseinde
    zinnen = re.split(r'(?<=[.!?])\s+|\s-\s|^-\s', tekst)
    uit = []
    for k, o in sorted(opties.items()):
        if k in dubbel: continue
        j = juist.get(k, '')
        nm = lambda x: re.sub(r'\s+', ' ', x.replace('−', '-').replace('–', '-')).lower().strip(' -')
        idx = next((i for i, x in enumerate(o) if nm(x) == nm(j)), None)
        if idx is None: idx = next((i for i, x in enumerate(o) if j and (j.lower().startswith(x.lower()) or x.lower().startswith(j.lower()))), None)
        if idx is None: return []   # niet eenduidig: dan alleen de open vraag
        zi = next((i for i, z in enumerate(zinnen) if f'({k})' in z), None)
        zin = zinnen[zi] if zi is not None else ''
        if zi and len(zin) < 50: zin = zinnen[zi - 1] + ' ' + zin   # korte zin: vorige zin erbij voor de context
        zin = re.sub(r'(?:…|\.\.\.)\s*\(%d\)\s*(?:…|\.\.\.)' % k, '…', zin).strip(' -')
        zin = re.sub(r'(?:…|\.\.\.)\s*\((\d)\)\s*(?:…|\.\.\.)', r'…(\1)…', zin)
        zin = re.sub(r'^Maak [^:]*:\s*', '', zin)
        zin = re.sub(r'\s+Maak (?:de|van|onderstaande)[^.]*?(?:correct|juist)[^.]*\.?', '', zin)
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
        if not m: continue   # los erratumblad: wordt hieronder bij het examen gezocht
        niv, jaar, tv = m.group(1)[0].lower(), int(m.group(2)), int(m.group(3))
        cvp = f.replace('_OPGAVEN.pdf.md', '_CORRECTIEVOORSCHRIFT.pdf.md')
        if not os.path.exists(cvp): rapport.append(f'{os.path.basename(f)}: correctievoorschrift ontbreekt'); continue
        ex = f'{niv}{jaar % 100:02d}-{tv}'
        cvtekst = open(cvp, encoding='utf-8').read()
        optekst = open(f, encoding='utf-8').read()
        # vwo: erratum en aanvulling staan in losse bestanden; plak ze achter opgaven / correctievoorschrift
        for x in sorted(glob.glob(f.replace('_OPGAVEN.pdf.md', '_*.pdf.md'))):
            if x in (f, cvp) or not re.search(r'AANVUL|ERRAT', os.path.basename(x).upper()): continue
            xt = open(x, encoding='utf-8').read()
            if any(c in cvtekst + optekst for c in re.findall(r'[A-Z]{2}-\d{4}-[a-z]-\d\d-\d-[ocb]-[AE]\d?\b', xt)): continue   # staat al in het pdf
            if 'OPGAVEN' in os.path.basename(x).upper(): optekst += '\n\n' + xt
            else: cvtekst += '\n\n' + xt
        ops = opgaven(optekst); cv = antwoorden(cvtekst)
        # erratum: 'in de inleiding voor vraag 21 moet ... het woord X vervangen worden door: Y'
        # of: 'moet de laatste zin voorafgaand aan vraag 27 <oude zin> vervangen worden door: <nieuwe zin>'
        for m in re.finditer(r'vraag (\d+)[^\n]*\n\s*\n(.+?)\n\s*\n\s*vervangen worden door:\s*\n\s*\n(.+?)\n', optekst):
            oud, nieuw = (re.sub(r'\s+', ' ', schoon(x)).strip() for x in m.group(2, 3))
            for v in ops:
                if v['nr'] == int(m.group(1)): v['ctx'] = v['ctx'].replace(oud, nieuw); v['q'] = v['q'].replace(oud, nieuw)
        # erratum: 'bij vraag 25 moeten de woorden boven de vraag vervangen worden door: Gebruik ...'
        for m in re.finditer(r'bij vraag (\d+) moeten de woorden boven de vraag vervangen worden door:\s*(.+)', schoon(optekst)):
            for v in ops:
                if v['nr'] == int(m.group(1)): v['q'] = re.sub(r'^Gebruik[^\n]*', m.group(2).strip().rstrip(':') + '.', v['q'])
        # aanvulling op het correctievoorschrift: 'bij vraag 13 moeten altijd 2 scorepunten worden toegekend' -> vraag overslaan
        altijd = {int(x) for x in re.findall(r'bij vraag (\d+) moet(?:en)? altijd', schoon(cvtekst))}
        vervangen = set()
        # aanvulling 'bij vraag 15 moet: ... worden vervangen door: ...' -> nieuw antwoordmodel
        for m in re.finditer(r'vraag (\d+),?(?: bij de \w+ deelscore,?)? moet:?(?:\s*,?\s*bij (?:de|het) (?:\w+ )?(?:Opmerkingen?|deelscore|voorbeeldantwoord|opsommingsstreepje),?)*\s*(?!worden toegevoegd)([^\n]*?(?:\n(?!\s*(?:en )?Op pagina)[^\n]*)*?)\s*(?:worden vervangen|vervangen worden) door:\s*(.*?)(?=\n\s*en\s*\n|\n\s*en Op pagina|\n\s*Toelichting|\n\s*Op pagina|\n\s*NB |\n\s*Ik verzoek|\Z)', schoon(cvtekst), re.S):
            n = int(m.group(1))
            oud, a = (deelscores(re.sub(r'\s*\n\s*', '\n', x).strip()) for x in m.group(2, 3))
            pat = r'\s+'.join(map(re.escape, oud.split()))
            if n in cv and re.search(pat, cv[n]):   # alleen het genoemde stuk vervangen
                cv[n] = re.sub(pat, lambda _: a, cv[n], count=1); vervangen.add(n)
            elif re.match(r'(Een voorbeeld|Voorbeelden)', oud):
                cv[n] = a; vervangen.add(n)
        for m in re.finditer(r'bij vraag (\d+),? moet de Opmerking geschrapt worden', schoon(cvtekst)):
            n = int(m.group(1))
            if n in cv: cv[n] = re.sub(r'\nOpmerking [^\n]*', '', cv[n]); vervangen.add(n)
        # overige aanvullingen ('bij vraag 20 moet naast ... ook ... goed gerekend worden') -> achter het antwoordmodel
        ai = cvtekst.find('aanvulling op het correctievoorschrift 20')
        if ai >= 0:
            av = schoon(cvtekst[ai:])
            for m in re.finditer(r'(?:bij )?vraag (\d+)\b(.*?)(?=Op pagina \d+|\n\s*Ik verzoek|\Z)', av, re.S):
                n, x = int(m.group(1)), m.group(2)
                if 'altijd' in x or n in vervangen or n not in cv: continue
                x = re.split(r'\n\s*Toelichting', x)[0]
                x = re.sub(r'\s+', ' ', x).strip(' :,.').removesuffix(' en')
                cv[n] += '\nAanvulling: bij vraag %d %s.' % (n, x)
        n_open = n_mc = 0
        for v in ops:
            a = cv.get(v['nr'])
            if not a: rapport.append(f'{ex} vraag {v["nr"]}: geen antwoord gevonden'); continue
            if 'altijd worden toegekend' in a or v['nr'] in altijd: continue
            if re.search(r':\s*$', a) and len(a) < 80: rapport.append(f'{ex} vraag {v["nr"]}: antwoord is een tekening, overgeslagen'); continue
            a = re.sub(r'((?:arcering|tekening|schets|grafiek)(?: is)?:)[ \t]*(?=\n|$)', r'\1 (zie de tekening in het correctievoorschrift)', a)
            if re.search(r':\s*$', a): a += ' (zie het correctievoorschrift)'
            for e_, n_, oud_, nieuw_ in CORRECTIES:
                if e_ == ex and n_ == v['nr']: a = a.replace(oud_, nieuw_)
            eid = f'ex.{ex}.{v["nr"]}'
            d = bib.get(eid) or domein(v['q'], v['opgave'] + ' ' + v['ctx'])
            basis = {'niv': niv, 'ex': ex, 'jaar': jaar, 'tv': tv, 'titel': v['opgave'], 'd': d, 'e': 'EX.' + d}
            q = v['q']
            if re.search(r'Gebruik[^.]*\bbron', q): q += '\n(De bron staat in de bijlage van het examen. Die zit nog niet in de app: pak het examen erbij.)'
            elif re.search(r'Gebruik[^.]*\b(figuur|tabel|grafiek)', q) or re.search(r'\b(figuur|grafiek|spelboom)\b', q, re.I): q += '\n(De figuur of tabel staat in het examen zelf. Die zit nog niet in de app: pak het examen erbij.)'
            if re.fullmatch(r'[A-F]', a.strip()): a = 'MC:' + a.strip()
            if a.startswith('MC:'):   # echte meerkeuzevraag uit het examen
                mm = re.search(r'^(.*?)\s+A\s+(.+?)\s+B\s+(.+?)(?:\s+C\s+(.+?))?(?:\s+D\s+(.+?))?(?:\s+E\s+(.+?))?\s*$', v['q'], re.S)
                if not mm: rapport.append(f'{ex} vraag {v["nr"]}: meerkeuzevraag niet te lezen'); continue
                o = [re.sub(r'\s+', ' ', x).strip(' .') for x in mm.groups()[1:] if x]
                vragen.append(dict(basis, id=eid, t='ex', nr=v['nr'], ctx=v['ctx'], q=re.sub(r'[ \t]*\n\s*', '\n', mm.group(1)).strip(), o=o,
                                   a='ABCDEF'.index(a[3]), u=f'Juist is {a[3]}: {o["ABCDEF".index(a[3])]}.')); n_mc += 1
                continue
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

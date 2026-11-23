"""Zet leerdoelbestanden uit de Oefentool-bibliotheek (Drive, ECO-XXX-NN ....md) om naar het bibliotheekformaat.

Gebruik: python3 tools/drive2bib.py bron-ruw/ECO-*.md
Schrijft per thema een bestand bibliotheek/<thema>.txt. Leerdoelen die al in een ander bibliotheekbestand staan
(met de hand bewerkt, zoals G-verzekeren.txt) worden overgeslagen.
"""
import glob, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# leerdoel -> (domein, onderwerp, thema, niv of '')
KAART = {
    'ALGEM-01': ('I', 'I.saldi', 'Kringloop en saldi'), 'ALGEM-02': ('I', 'I.saldi', 'Kringloop en saldi'),
    'ALGEM-03': ('H', 'H.bbp', 'Bbp en welvaart'), 'ALGEM-06': ('H', 'H.bbp', 'Bbp en welvaart'), 'ALGEM-07': ('H', 'H.bbp', 'Bbp en welvaart'),
    'ALGEM-04': ('H', 'H.groei', 'Economische groei'), 'ALGEM-05': ('H', 'H.groei', 'Economische groei'), 'GROEI-01': ('H', 'H.groei', 'Economische groei'),
    'ALGEM-08': ('H', 'H.verdeling', 'Inkomensverdeling'), 'ALGEM-09': ('H', 'H.verdeling', 'Inkomensverdeling'),
    'ALGEM-10': ('H', 'H.belasting', 'Belastingen'), 'ALGEM-11': ('H', 'H.belasting', 'Belastingen'),
    'ALGEM-12': ('H', 'H.belasting', 'Belastingen'), 'BELAS-01': ('H', 'H.belasting', 'Belastingen'),
    'BELAS-02': ('D', 'D.heffing', 'Accijns en surplus'), 'BELAS-03': ('D', 'D.heffing', 'Accijns en surplus'), 'BELAS-04': ('D', 'D.heffing', 'Accijns en surplus'),
    'ELAST-01': ('D', 'D.elas', 'Elasticiteit'), 'ELAST-02': ('D', 'D.elas', 'Elasticiteit'), 'ELAST-03': ('D', 'D.elas', 'Elasticiteit'),
    'ELAST-04': ('D', 'D.elas', 'Elasticiteit'), 'ELAST-06': ('D', 'D.elas', 'Elasticiteit'),
    'FINAN-01': ('G', 'G.finan', 'Lenen en beleggen'), 'FINAN-02': ('G', 'G.finan', 'Lenen en beleggen'),
    'INFOR-01': ('G', 'G.info', 'Informatieproblemen'), 'INFOR-02': ('G', 'G.info', 'Informatieproblemen'),
    'MARKT-01': ('D', 'D.vorm', 'Marktvormen'), 'MARKT-02': ('D', 'D.vorm', 'Marktvormen'), 'MARKT-03': ('D', 'D.vorm', 'Marktvormen'),
    'MARKT-05': ('D', 'D.vraag', 'Vraag, aanbod en surplus'), 'MARKT-06': ('D', 'D.vraag', 'Vraag, aanbod en surplus'),
    'MARKT-07': ('D', 'D.vraag', 'Vraag, aanbod en surplus'),
    'PRIJS-01': ('D', 'D.prijsdisc', 'Prijsdiscriminatie'), 'PRIJS-02': ('D', 'D.prijsdisc', 'Prijsdiscriminatie'),
    'PROTE-01': ('C', 'C.intl', 'Internationale handel'), 'PROTE-02': ('C', 'C.intl', 'Internationale handel'),
    'WISSE-01': ('C', 'C.intl', 'Internationale handel'),
    'SPELT-01': ('F', 'F.spel', 'Speltheorie'), 'SPELT-02': ('F', 'F.spel', 'Speltheorie'), 'SPELT-03': ('F', 'F.spel', 'Speltheorie'),
    'SPELT-04': ('F', 'F.spel', 'Speltheorie'), 'SPELT-05': ('F', 'F.spel', 'Speltheorie'), 'SPELT-06': ('F', 'F.spel', 'Speltheorie'),
}
GENS = {'ELAST-01': 'elasticiteit', 'ELAST-02': 'elasticiteit', 'MARKT-01': 'monopolie', 'ALGEM-04': 'reeleGroei',
        'ALGEM-14': 'verwachteSchade', 'MARKT-03': 'evenwicht', 'GROEI-01': 'productiviteit'}

def schoon(s):
    s = s.replace('\\', '').replace('**', '').replace(' ', ' ')
    s = re.sub(r'<small>.*?</small>', '', s)
    s = re.sub(r'(?<!\w)\*(?!\s)([^*\n]+?)\*(?!\w)', r'\1', s)
    return re.sub(r'[ \t]+\n', '\n', s).strip()

def tabel(r):
    m = re.match(r'^(Tabel[^|]*):\s*([^:|]*\|.*)$', r)
    if not m: return r
    rijen = [x.strip() for x in re.split(r'\s/\s(?=[^|]*\|)', m.group(2))]
    return m.group(1) + ':\n' + '\n'.join(rijen)

def secties(t, niveau):
    pat = r'^' + '#' * niveau + r' (?!#)'
    return re.split(pat, t, flags=re.M)

def parse(pad):
    t = schoon(open(pad, encoding='utf-8').read())
    t = re.sub(r'\n{2,}', '\n\n', t)
    m = re.search(r'^# (ECO-([A-Z]+-\d+)) (.*)$', t, re.M)
    code, kort, naam = m.group(1), m.group(2), m.group(3).strip()
    doel = re.search(r'^\*?(Ik kan .*?)\*?\s*$', t, re.M)
    doel = doel.group(1).strip('* ') if doel else ''
    delen = {}
    for s in secties(t, 2)[1:]:
        kop, _, body = s.partition('\n'); delen[kop.strip()] = body
    # uitleg
    uitleg, gezien = [], set()
    for item in re.split(r'^- ', delen.get('Lesmateriaal', ''), flags=re.M)[1:]:
        kop, _, body = item.partition('\n')
        tm = re.match(r'(.*?) \((uitleg|begrippen|[^)]*)\)', kop.strip())
        titel = (tm.group(1) if tm else kop).strip()
        body = '\n'.join(r.strip() for r in body.split('\n') if r.strip())
        sleutel = re.sub(r'\W', '', titel.lower())[:25]
        if not body or sleutel in gezien: continue
        gezien.add(sleutel); uitleg.append((titel, body))
    uitleg = uitleg[:3]
    # examenvragen
    exam = []
    for item in re.split(r'^- ', delen.get('Examenvragen', ''), flags=re.M)[1:]:
        em = re.match(r'(havo|vwo) (\d{4})-(I{1,3}) vraag (\d+) \((\d+)p\):\s*(.*)', item.strip(), re.S)
        if not em: continue
        q, _, a = em.group(6).partition('Antwoord:')
        q = ' '.join(q.split()); a = ' '.join(a.split())
        if not a: continue
        exam.append((f'{em.group(1)} {em.group(2)}-{em.group(3)} {em.group(4)} {em.group(5)}p', q, a))
    # oefenopgaven
    opg = []
    for s in secties(delen.get('Goedgekeurde oefenopgaven', ''), 3)[1:]:
        kop, _, body = s.partition('\n')
        om = re.match(r'(IT-\d+)\s+(.*?)\s*\((?:stap \d+, )?(\d+)p\)', kop.strip())
        if not om: continue
        regels = [r.strip() for r in body.split('\n') if r.strip()]
        vraag, opties, juist, cv, voorbeeld = [], None, None, '', ''
        for r in regels:
            if r.startswith('CV:'): cv = r[3:].strip()
            elif r.startswith('Voorbeeldantwoord:'): voorbeeld = r[18:].strip()
            elif r.startswith('Opties:'):
                jm = re.search(r'\(juist:\s*([A-E])\)\s*$', r)
                juist = jm.group(1) if jm else None
                body2 = re.sub(r'\(juist:.*$', '', r[7:]).strip()
                opties = [x.strip() for x in re.split(r'\s/\s(?=[A-E]\s)', body2)]
            elif cv or voorbeeld: continue
            else: vraag.append(tabel(re.sub(r'^Vraag:\s*', '', r)))
        if not vraag or not (cv or voorbeeld): continue
        model = voorbeeld or cv
        if cv and voorbeeld:
            stukken = [x.strip() for x in re.split(r'(?<=\(\d\));\s*', re.sub(r'^Maximumscore \d+\s*', '', cv, flags=re.I)) if x.strip()]
            model += '\nPuntenverdeling:\n' + '\n'.join('• ' + x for x in stukken)
        opg.append((om.group(1), om.group(3), om.group(2), '\n'.join(vraag), opties, juist, model))
    return code, kort, naam, doel, uitleg, exam, opg

def main(paden):
    bestaand = set()
    for f in glob.glob(os.path.join(ROOT, 'bibliotheek', '*.txt')):
        if f.endswith('-auto.txt'): continue
        bestaand |= set(re.findall(r'^# LEERDOEL (ECO-\S+)', open(f, encoding='utf-8').read(), re.M))
    per_thema = {}
    for p in sorted(paden):
        code, kort, naam, doel, uitleg, exam, opg = parse(p)
        if code in bestaand or kort not in KAART: print('overgeslagen', code); continue
        d, e, thema = KAART[kort]
        uit = [f'# LEERDOEL {code}', f'domein: {d}', f'onderwerp: {e}', f'thema: {thema}', f'naam: {naam}', f'doel: {doel}']
        if kort in GENS: uit.append(f'gens: {GENS[kort]}')
        uit.append('')
        for titel, body in uitleg: uit += [f'## UITLEG {titel}', body, '']
        for it, pnt, titel, vraag, opties, juist, model in opg:
            uit += [f'## OPGAVE {it} {pnt}p | {titel}', vraag]
            if opties and juist and len(opties) >= 2:
                uit += [f'### OPTIES {juist}'] + opties
            uit += ['### ANTWOORD', model, '']
        for kop, q, a in exam: uit += [f'## EXAMEN {kop}', q, '### ANTWOORD', a, '']
        per_thema.setdefault((d, thema), []).append('\n'.join(uit))
        print(code, len(uitleg), 'uitleg,', len(opg), 'opgaven,', len(exam), 'examen')
    for (d, thema), blokken in per_thema.items():
        naam = f'{d}-' + re.sub(r'\W+', '-', thema.lower()).strip('-') + '-auto.txt'
        pad = os.path.join(ROOT, 'bibliotheek', naam)
        oud = open(pad, encoding='utf-8').read() if os.path.exists(pad) else ''
        codes = set(re.findall(r'^# LEERDOEL (ECO-\S+)', oud, re.M))
        nieuw = [b for b in blokken if re.match(r'# LEERDOEL (\S+)', b).group(1) not in codes]
        # vervang bestaande blokken met dezelfde code door de nieuwe versie
        delen = {re.match(r'# LEERDOEL (\S+)', b).group(1): b for b in re.split(r'\n(?=# LEERDOEL )', oud.strip()) if b.strip()}
        for b in blokken: delen[re.match(r'# LEERDOEL (\S+)', b).group(1)] = b
        open(pad, 'w', encoding='utf-8').write('\n\n'.join(delen[k] for k in sorted(delen)) + '\n')

if __name__ == '__main__': main(sys.argv[1:])

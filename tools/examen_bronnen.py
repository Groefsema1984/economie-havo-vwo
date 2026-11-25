#!/usr/bin/env python3
"""Bronnen bij de examenvragen: zet de pagina's van de examens om in afbeeldingen en koppelt ze aan de vragen.

Invoer: bron-ruw/pdf/<code>-<soort>.pdf (gitignored), met code zoals h18-1 of v24-2 en soort
  o = opgavenboekje, b = bijlage (bronnenboekje), u = uitwerkbijlage.
Uitvoer:
  examens/img/<code>-<soort>-<pagina>.jpg
  src/data-exbronnen.js  met  EX_BRON = {'h18-1': {8: ['h18-1-b-3', 'h18-1-o-4'], ...}, ...}

Per vraag:
  - met bronnenboekje: de pagina's van die opgave uit de bijlage, plus de pagina van de vraag zelf;
  - zonder bronnenboekje (vwo, havo 2026): de pagina's van het opgavenboekje vanaf het begin van de opgave
    tot en met de pagina van de vraag (daar staan de figuren en tabellen);
  - de pagina van de uitwerkbijlage als de vraag daarin staat.
Gebruik: python3 tools/examen_bronnen.py  (daarna python3 src/build.py)
"""
import glob, json, os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, 'bron-ruw', 'pdf')
IMG = os.path.join(ROOT, 'examens', 'img')
DPI, KWALITEIT = 130, 60

def paginas(pdf):
    n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
    return [subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), '-layout', pdf, '-'], capture_output=True, text=True).stdout
            for p in range(1, n + 1)]

def opgave_per_pagina(teksten):
    """per pagina: lijst van opgaven die op die pagina staan (doorlopend vanaf de vorige pagina)"""
    uit, huidig = [], None
    for t in teksten:
        hier = [] if huidig is None else [huidig]
        for m in re.finditer(r'^\s*Opgave\s+(\d+)\b', t, re.M):
            huidig = int(m.group(1))
            if huidig not in hier: hier.append(huidig)
        if re.search(r'erratum', t, re.I) and not hier: hier = []
        uit.append(hier)
    return uit

def render(pdf, p, naam):
    doel = os.path.join(IMG, naam + '.jpg')
    if os.path.exists(doel) and os.path.getmtime(doel) > os.path.getmtime(pdf): return
    basis = os.path.join(IMG, '_tmp')
    subprocess.run(['pdftoppm', '-f', str(p), '-l', str(p), '-r', str(DPI), '-jpeg', '-jpegopt', f'quality={KWALITEIT}',
                    '-singlefile', pdf, basis], check=True)
    os.replace(basis + '.jpg', doel)

def main():
    os.makedirs(IMG, exist_ok=True)
    codes = sorted({re.match(r'([hv]\d\d-\d)-o\.pdf$', os.path.basename(f)).group(1) for f in glob.glob(os.path.join(PDF, '*-o.pdf'))})
    alles, nodig = {}, set()
    for c in codes:
        o = os.path.join(PDF, f'{c}-o.pdf'); b = os.path.join(PDF, f'{c}-b.pdf'); u = os.path.join(PDF, f'{c}-u.pdf')
        ot = paginas(o); oop = opgave_per_pagina(ot)
        vraag_pag, vraag_opg = {}, {}
        for i, t in enumerate(ot):
            opg = None
            for r in t.split('\n'):
                m = re.match(r'^\s*Opgave\s+(\d+)\b', r)
                if m: opg = int(m.group(1))
                m = re.match(r'^\s*\d\s*p\s+(\d{1,2})\s', r)
                if m:
                    nr = int(m.group(1)); vraag_pag.setdefault(nr, i + 1)
                    vraag_opg.setdefault(nr, opg if opg is not None else (oop[i][-1] if oop[i] else None))
        start = {}
        for i, lijst in enumerate(oop):
            for g in lijst: start.setdefault(g, i + 1)
        bpag = {}
        if os.path.exists(b):
            for i, lijst in enumerate(opgave_per_pagina(paginas(b))):
                if i == 0: continue                      # voorblad
                for g in lijst: bpag.setdefault(g, []).append(i + 1)
        upag = {}
        if os.path.exists(u):
            for i, t in enumerate(paginas(u)):
                for m in re.finditer(r'^\s{2,}(\d{1,2})(?:\s{3,}|\s*$)', t, re.M):
                    nr = int(m.group(1))
                    if nr in vraag_pag: upag.setdefault(nr, i + 1)
        per = {}
        for nr in sorted(vraag_pag):
            g, p = vraag_opg.get(nr), vraag_pag[nr]
            lijst = []
            if bpag.get(g):
                lijst += [f'{c}-b-{x}' for x in bpag[g]] + [f'{c}-o-{p}']
            else:
                van = start.get(g, p)
                lijst += [f'{c}-o-{x}' for x in range(min(van, p), p + 1)]
            if nr in upag: lijst.append(f'{c}-u-{upag[nr]}')
            per[nr] = lijst; nodig.update(lijst)
        alles[c] = per
        print(f'{c}: {len(per)} vragen, bijlage {"ja" if bpag else "nee"}, uitwerkbijlage {len(upag)}')
    for naam in sorted(nodig):
        c, s, p = re.match(r'([hv]\d\d-\d)-(\w)-(\d+)$', naam).groups()
        render(os.path.join(PDF, f'{c}-{s}.pdf'), int(p), naam)
    for f in glob.glob(os.path.join(IMG, '*.jpg')):
        if os.path.basename(f)[:-4] not in nodig: os.remove(f)
    with open(os.path.join(ROOT, 'src', 'data-exbronnen.js'), 'w', encoding='utf-8') as f:
        f.write('// AUTOMATISCH GEMAAKT door tools/examen_bronnen.py. Per examen en vraagnummer de examenpagina\'s met bronnen.\n')
        f.write('// -b- = bronnenboekje, -o- = opgavenboekje, -u- = uitwerkbijlage. Afbeeldingen staan in examens/img/.\n')
        f.write('const EX_BRON = ' + json.dumps(alles, separators=(',', ':')) + ';\n')
    print(len(nodig), 'pagina\'s')

if __name__ == '__main__':
    main()

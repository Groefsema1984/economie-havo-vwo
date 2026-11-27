#!/usr/bin/env python3
"""Zet bij de gesplitste invulvragen (t:'ex', nr zoals 28.5) in src/data-examen.js de hele tekst van de opgave neer:
eerdere open plekken ingevuld met het goede woord, de gevraagde plek als ____(k)____, latere plekken open.
Werkt op de bestaande data, dus zonder bron-ruw/. tools/examen_pdf.py doet hetzelfde bij een nieuwe import.
Gebruik: python3 tools/invul_context.py  (daarna python3 src/build.py)
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from examen_pdf import invul_bron, invul_tekst, invul_vraag

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD = os.path.join(ROOT, 'src', 'data-examen.js')

def main():
    s = open(PAD, encoding='utf-8').read()
    m = re.search(r'EXAMEN\.vragen\.push\(\.\.\.(\[.*\])\);\s*$', s, re.S)
    vragen = json.loads(m.group(1))
    per_id = {v['id']: v for v in vragen}
    n = 0
    for v in vragen:
        mm = re.fullmatch(r'(ex\.[hv]\d\d-\d\.\d+)\.(\d)', v['id'])
        if not mm or v['t'] != 'ex': continue
        ouder = per_id[mm.group(1)]; k = int(mm.group(2))
        zussen = [x for x in vragen if x['id'].startswith(ouder['id'] + '.') and x['t'] == 'ex']
        goed = {int(x['id'].rsplit('.', 1)[1]): x['o'][x['a']] for x in zussen}
        tekst, uit_ctx = invul_bron(ouder)
        v['q'] = invul_vraag(ouder['nr'], k, invul_tekst(tekst, k, goed))
        v['ctx'] = '' if uit_ctx else ouder['ctx']
        n += 1
    out = s[:m.start(1)] + json.dumps(vragen, ensure_ascii=False, indent=0) + s[m.end(1):]
    open(PAD, 'w', encoding='utf-8').write(out)
    print(f'{n} invulvragen bijgewerkt')

if __name__ == '__main__': main()

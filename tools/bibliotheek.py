"""Zet de leerdoelen in bibliotheek/*.txt om naar src/data-bibliotheek.js.

Formaat per leerdoel (zie bibliotheek/LEESMIJ.txt):
  # LEERDOEL ECO-VERZE-04
  domein: G            onderwerp: G.risico     thema: Verzekeren
  naam: ...            doel: Ik kan ...        niv: h|v (optioneel)
  ## UITLEG titel      -> tekst
  ## OPGAVE IT-00308 2p | titel   -> tekst, daarna ### ANTWOORD -> antwoordmodel
  ## EXAMEN havo 2018-II 17 2p    -> tekst, daarna ### ANTWOORD -> antwoord uit het correctievoorschrift
"""
import glob, json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TV = {'I': 1, 'II': 2, 'III': 3}

def blokken(tekst):
    doelen = []
    for deel in re.split(r'^# LEERDOEL ', tekst, flags=re.M)[1:]:
        kop, *rest = deel.split('\n', 1)
        body = rest[0] if rest else ''
        meta = {}
        regels = body.split('\n')
        i = 0
        while i < len(regels) and not regels[i].startswith('## '):
            m = re.match(r'^(\w+):\s*(.*)$', regels[i].strip())
            if m: meta[m.group(1)] = m.group(2).strip()
            i += 1
        secties = re.split(r'^## ', '\n'.join(regels[i:]), flags=re.M)[1:]
        doelen.append((kop.strip(), meta, secties))
    return doelen

def splits_antwoord(s):
    kop, _, inhoud = s.partition('\n')
    v, _, a = inhoud.partition('### ANTWOORD')
    return kop.strip(), v.strip(), a.strip()

def main():
    levels, examen, fouten = {}, {}, []
    for f in sorted(glob.glob(os.path.join(ROOT, 'bibliotheek', '*.txt'))):
        if os.path.basename(f).upper().startswith('LEESMIJ'): continue
        for code, meta, secties in blokken(open(f, encoding='utf-8').read()):
            d = meta['domein']; e = meta['onderwerp']; kort = code.replace('ECO-', '').replace('-', '')
            lid = f'{d}.{kort}'
            lvl = {'id': lid, 'hfd': 'Thema ' + meta['thema'], 'naam': meta['naam'], 'kort': meta.get('kort', meta.get('doel', '')),
                   'doel': meta.get('doel', ''), 'bron': code, 'uitleg': [], 'vragen': [], 'gens': []}
            if meta.get('niv'): lvl['niv'] = meta['niv']
            if meta.get('gens'): lvl['gens'] = [g.strip() for g in meta['gens'].split(',') if g.strip()]
            exvr = []
            for s in secties:
                kop, vraag, antw = splits_antwoord(s)
                if kop.startswith('UITLEG'):
                    lvl['uitleg'].append({'t': kop[6:].strip(), 'x': vraag})
                elif kop.startswith('OPGAVE'):
                    m = re.match(r'OPGAVE\s+(\S+)\s+(\d+)p\s*\|\s*(.*)', kop)
                    if not m or not antw: fouten.append(f'{code}: opgave zonder kop/antwoord: {kop}'); continue
                    v = {'id': f'{lid}.{m.group(1).replace("-", "")}', 't': 'open', 'e': e, 'titel': m.group(3),
                         'q': vraag, 'model': antw, 'pnt': int(m.group(2))}
                    if '### OPTIES' in vraag:  # meerkeuze: ### OPTIES <juiste letter>, daarna regels 'A tekst'
                        q, _, opt = vraag.partition('### OPTIES')
                        kop2, _, rest = opt.strip().partition('\n')
                        opties = [re.sub(r'^[A-E]\s+', '', r.strip()) for r in rest.strip().split('\n') if r.strip()]
                        v.update(t='mc', q=q.strip(), o=opties, a='ABCDE'.index(kop2.strip()), u=antw)
                        del v['model']
                    lvl['vragen'].append(v)
                elif kop.startswith('EXAMEN'):
                    m = re.match(r'EXAMEN\s+(havo|vwo)\s+(\d{4})-(I{1,3})\s+(\d+)\s+(\d+)p', kop)
                    if not m or not antw: fouten.append(f'{code}: examenvraag onleesbaar: {kop}'); continue
                    niv = m.group(1)[0]; jaar = int(m.group(2)); tv = TV[m.group(3)]; nr = int(m.group(4))
                    ex = f'{niv}{jaar % 100:02d}-{tv}'; eid = f'ex.{ex}.{nr}'
                    v = {'id': eid, 't': 'open', 'niv': niv, 'ex': ex, 'jaar': jaar, 'tv': tv, 'nr': nr, 'd': d, 'e': 'EX.' + d,
                         'titel': meta['naam'], 'q': vraag, 'model': antw, 'pnt': int(m.group(5))}
                    if eid not in examen: examen[eid] = v
                    exvr.append(v)
            if not lvl['vragen']:  # geen eigen oefenopgaven: oefen met de examenvragen van dit leerdoel
                lvl['vragen'] = [dict(v, id=f'{lid}.{v["id"][3:].replace("-", "").replace(".", "")}', e=e, t='open',
                                      q=f'(Examen {"havo" if v["niv"]=="h" else "vwo"} {v["jaar"]}-{"I"*v["tv"]}, vraag {v["nr"]})\n' + v['q'])
                                 for v in exvr][:12]
                for v in lvl['vragen']:
                    for k in ('niv', 'ex', 'jaar', 'tv', 'nr', 'd'): v.pop(k, None)
                if len({x['niv'] for x in exvr}) == 1 and 'niv' not in lvl: lvl['niv'] = exvr[0]['niv']
            if not lvl['uitleg']: del lvl['uitleg']
            levels.setdefault(d, []).append(lvl)
    out = ['// AUTOMATISCH GEMAAKT door tools/bibliotheek.py uit bibliotheek/*.txt. Niet met de hand wijzigen.',
           '// Bron: Oefentool_Bibliotheek "Economie havo-vwo" (Google Drive): uitleg, goedgekeurde oefenopgaven en examenvragen per leerdoel.']
    for d in sorted(levels):
        lv = sorted(levels[d], key=lambda l: (l['hfd'], l['bron']))
        out.append(f'LEVELS.{d}.push(...{json.dumps(lv, ensure_ascii=False, indent=0)});')
    ex = sorted(examen.values(), key=lambda v: (v['ex'], v['nr']))
    out.append(f'EXAMEN.vragen.push(...{json.dumps(ex, ensure_ascii=False, indent=0)});')
    open(os.path.join(ROOT, 'src', 'data-bibliotheek.js'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    n = sum(len(l['vragen']) for v in levels.values() for l in v)
    print(f'{sum(len(v) for v in levels.values())} leerdoelen, {n} oefenvragen, {len(ex)} examenvragen')
    for f in fouten: print('LET OP:', f)
    return 1 if fouten else 0

if __name__ == '__main__': sys.exit(main())

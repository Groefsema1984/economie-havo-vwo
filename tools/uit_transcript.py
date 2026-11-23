# Haalt Drive-bestandsinhoud (read_file_content) uit het sessietranscript en bewaart die als ruwe bron.
import json,sys,os,re
src=sys.argv[1]; out=sys.argv[2]; n=0
def walk(o):
    if isinstance(o,dict):
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)
    elif isinstance(o,str):
        if '"fileContent"' in o: yield o
for line in open(src):
    try: rec=json.loads(line)
    except: continue
    for s in walk(rec):
        try: d=json.loads(s)
        except: continue
        t=d.get('title',''); c=d.get('fileContent','')
        if not c: continue
        safe=re.sub(r'[^A-Za-z0-9_.-]+','_',t)[:90]
        p=os.path.join(out,safe+'.md')
        if not os.path.exists(p) or len(open(p).read())<len(c):
            open(p,'w').write(c); n+=1
print(n,'bestanden')

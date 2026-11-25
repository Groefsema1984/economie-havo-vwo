import os,sys
d=os.path.dirname(os.path.abspath(__file__))
r=lambda f:open(os.path.join(d,f),encoding='utf-8').read()
# Volgorde is belangrijk: eerst de basis, dan de domeinen A t/m J, dan de examens en de app zelf.
domeinen=['data-%s.js'%x for x in 'ABCDEFGHIJ']
js_files=['data-basis.js']+domeinen+['data-examen.js','data-exbronnen.js','data-hoofdstukken.js','data-bibliotheek.js','core.js','ui.js','examen.js','docent.js','extra.js','lagen.js']
js='\n'.join(r(f) for f in js_files if os.path.exists(os.path.join(d,f)))
out=r('shell.html').replace('/*CSS*/',r('app.css')).replace('/*JS*/',js)
url=os.environ.get('ENDPOINT','')
if url: out=out.replace('const DATA_ENDPOINT_URL = "";','const DATA_ENDPOINT_URL = "%s";'%url)
dest=sys.argv[1] if len(sys.argv)>1 else os.path.join(d,'..','index.html')
open(dest,'w',encoding='utf-8').write(out); print(dest,len(out))

// ===== Automatisch bijwerken =====
// GitHub Pages laat browsers de pagina tot 10 minuten bewaren. De app vraagt daarom bij het openen en bij terugkomen
// in de app het bouwnummer op (version.json, nooit uit de cache). Is er een nieuwere versie, dan laadt de app die meteen.
const BOUW = '/*BOUW*/';
async function checkUpdate(){
  if(location.protocol==='file:'||!BOUW||BOUW.startsWith('/*')) return;
  if(typeof scherm!=='undefined'&&(scherm==='quiz'||scherm==='exvol')) return;   // niet midden in een oefening
  try{
    const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'}); if(!r.ok) return;
    const j=await r.json(); if(!j.bouw||j.bouw===BOUW) return;
    const u=new URL(location.href); if(u.searchParams.get('v')===j.bouw) return;   // al geprobeerd: geen lus
    u.searchParams.set('v',j.bouw); location.replace(u.toString());
  }catch(e){}
}
checkUpdate();
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') checkUpdate() });

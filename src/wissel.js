// ===== Uitloggen en docentweergave =====
// Uitloggen: de voortgang staat op de server; met speler-ID en herstelcode haal je hem terug.
// Docentweergave: de docent bekijkt de leerlingomgeving van een klas (havo of vwo) zonder eigen account.
// Een account dat al op het apparaat stond wordt zolang apart bewaard (KEY_EIGEN) en komt terug bij "Stop".
const KEY_EIGEN = KEY + '-eigen';
const lsLees = k => { try{ return localStorage.getItem(k) }catch(e){ return null } };
const lsWeg = k => { try{ localStorage.removeItem(k) }catch(e){} };

function startDemo(klas){
  if(S&&S.naam&&!S.demo){ try{ localStorage.setItem(KEY_EIGEN, JSON.stringify(S)) }catch(e){ melding('Kan het account op dit apparaat niet apart zetten.'); return } }
  S=nieuweStaat(); S.naam='Docent'; S.klas=klas; S.demo=1; bewaar(false); zetThema();
  melding(`Docentweergave ${klasLabel(klas)}. Wisselen of stoppen doe je onder Account.`,4000); go('home');
}
function wisselDemo(klas){ if(!S||!S.demo) return; S.klas=klas; bewaar(false); go('account') }
function stopDemo(){
  const eigen=lsLees(KEY_EIGEN); lsWeg(KEY_EIGEN);
  if(eigen){ try{ S=Object.assign(nieuweStaat(),JSON.parse(eigen)); bewaar(false); zetThema(); go('home'); if(serverModus()) sync(); return }catch(e){} }
  S=null; lsWeg(KEY); lsWeg(KEY+'-reserve'); go('welkom');
}

let uitlogStap=false;
// oud lokaal account (van voor de server), of een account dat de server niet kent: voortgang kan niet naar de server, dus niet op de sync wachten
const geenServerAccount = () => !S||!S.id||!S.code||/^LOKAAL-/i.test(S.id);
async function uitloggen(){
  if(!uitlogStap){ uitlogStap=true; go('account'); return }
  if(serverModus()&&S&&!geenServerAccount()){ await sync(); if(syncStatus!=='ok'&&!/Onbekend speler-ID/i.test(syncFout||'')){ melding('Je voortgang is nog niet opgeslagen op de server. Zorg voor internet en probeer het opnieuw.',5000); return } }
  uitlogStap=false; S=null; lsWeg(KEY); lsWeg(KEY+'-reserve'); lsWeg(KEY_EIGEN); go('welkom'); melding('Je bent uitgelogd.');
}

// Alles open: in de docentweergave en voor een docentaccount (S.alles, zet je in de Data-tab van de server)
const allesOpen = () => !!(S&&(S.demo||S.alles));
const _levelOpenW=levelOpen; levelOpen=function(w,i){ return allesOpen()||_levelOpenW(w,i) };
const _toetsOpenW=toetsOpen; toetsOpen=function(w){ return allesOpen()||_toetsOpenW(w) };
function wisselDocKlas(klas){ if(!S||!S.alles) return; S.dklas=klas; bewaar(); go('account') }

function klasKnoppen(huidig, actie){
  return KLASSEN.map(k=>`<button class="knop ${k===huidig?'':'zacht'} klein" onclick="${actie}('${k}')">${esc(klasLabel(k))}</button>`).join(' ');
}

const _accountScherm = SCHERMEN.account;
SCHERMEN.account = function(){
  if(S&&S.demo) return `<div class="wrap" style="max-width:640px">${kop('Docentweergave','go(\'home\')')}
   <div class="kaart"><p style="margin-top:0">Je bekijkt de leerlingomgeving van <b>${esc(klasLabel(S.klas))}</b>. Wat je hier oefent wordt niet opgeslagen op de server.</p>
    <p class="zacht" style="margin-bottom:6px">Wissel van klas</p><div class="voet" style="justify-content:flex-start;gap:8px;flex-wrap:wrap;margin:0">${klasKnoppen(S.klas,'wisselDemo')}</div>
    <div class="voet" style="justify-content:flex-start;margin-top:16px"><button class="knop" onclick="stopDemo()">Stop docentweergave</button></div></div></div>`;
  let h=_accountScherm();
  if(S&&S.alles) h=h.replace(/(<div class="sectie">|<p class="zacht" style="font-size:13px">Versie)/, `<div class="kaart" style="border:2px solid var(--acc)"><p style="margin-top:0"><b>👩‍🏫 Docentaccount.</b> Alle levels, toetsen en casussen staan open. Je bekijkt nu <b>${esc(klasLabel(kijkKlas()))}</b>.</p>
    <p class="zacht" style="margin-bottom:6px">Wissel van klas</p><div class="voet" style="justify-content:flex-start;gap:8px;flex-wrap:wrap;margin:0">${klasKnoppen(kijkKlas(),'wisselDocKlas')}</div></div>$1`);
  const blok = uitlogStap
    ? `<div class="kaart" style="border:2px solid var(--fout)"><h3 style="margin-top:0">Weet je het zeker?</h3>
       ${geenServerAccount()||/Onbekend speler-ID/i.test(syncFout||'')?'<p>Dit account staat niet op de server. Na het uitloggen is de voortgang op dit apparaat weg en kun je die niet terughalen.</p>':'<p>Schrijf eerst je gegevens op. Zonder speler-ID en herstelcode kun je je voortgang niet terughalen.</p>'}
       <p style="font-size:18px">Speler-ID <b>${esc(S.id||'–')}</b> · Herstelcode <b>${esc(S.code||'–')}</b></p>
       <div class="voet" style="justify-content:flex-start;gap:8px"><button class="knop" style="background:var(--fout)" onclick="uitloggen()">Ja, uitloggen</button><button class="knop zacht" onclick="uitlogStap=false;go('account')">Annuleer</button></div></div>`
    : `<div class="kaart"><p class="zacht" style="margin-top:0">Wil iemand anders deze iPad gebruiken? Log dan uit. Je voortgang blijft op de server bewaard.</p><button class="knop zacht" onclick="uitloggen()">Uitloggen</button></div>`;
  return h.replace(/(<p class="zacht" style="font-size:13px">Versie)/, `<div class="sectie">Uitloggen</div>${blok}$1`);
};

// docentendashboard: knop om de leerlingomgeving te bekijken (alleen na de docentcode)
const _docentScherm = SCHERMEN.docent;
SCHERMEN.docent = function(){
  let h=_docentScherm(); if(!D) return h;
  return h.replace(/<\/div>$/, `<div class="kaart" style="margin-top:16px"><h3 class="zijkop" style="margin-bottom:6px">Leerlingomgeving bekijken</h3>
   <p class="zacht" style="margin:0 0 10px;font-size:15px">Laat zien wat een klas ziet. Een account op dit apparaat blijft bewaard en komt terug als je stopt.</p>
   <div class="voet" style="justify-content:flex-start;gap:8px;flex-wrap:wrap;margin:0">${klasKnoppen('','startDemo')}</div></div></div>`);
};

// in de docentweergave: duidelijke knop bovenin om te wisselen
const _navW = nav;
nav = function(){ _navW(); const p=$('#profiel'); if(p&&S&&(S.demo||S.alles)&&p.innerHTML&&!p.querySelector('.demoWissel'))
  p.insertAdjacentHTML('afterbegin',`<button class="knop zacht klein demoWissel" style="margin-right:8px" onclick="go('account')" title="Wissel van klas">👩‍🏫 ${esc(klasLabel(kijkKlas()))} · wissel</button>`) };

// welkomscherm: ingang voor de docent (zonder account)
const _welkomScherm = SCHERMEN.welkom;
SCHERMEN.welkom = function(){ return _welkomScherm().replace('<p class="zacht mid" style="font-size:14px;margin-top:24px">Tip voor de iPad',
  '<p class="mid" style="margin-top:20px"><button class="knop zacht klein" onclick="go(\'docent\')">🔑 Docent</button></p><p class="zacht mid" style="font-size:14px;margin-top:24px">Tip voor de iPad') };

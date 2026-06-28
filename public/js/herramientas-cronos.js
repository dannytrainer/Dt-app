// CRONÓMETROS
// ═══════════════════════════════
// SISTEMA DE SONIDO GLOBAL
// ═══════════════════════════════
let _dtAudioCtx=null;
let _dtSonando=false;
async function _dtGetCtx(){
  if(!_dtAudioCtx)_dtAudioCtx=new(window.AudioContext||window.webkitAudioContext)();
  if(_dtAudioCtx.state==='suspended')await _dtAudioCtx.resume();
  return _dtAudioCtx;
}
function dtSonido(tipo){
  if(!_dtAudioCtx)_dtAudioCtx=new(window.AudioContext||window.webkitAudioContext)();
  const ctx=_dtAudioCtx;
  if(ctx.state==='suspended')ctx.resume();
  const pips={inicio:[{f:880,t:0,d:0.08}],descanso:[{f:660,t:0,d:0.08},{f:660,t:0.12,d:0.08}],fin:[{f:880,t:0,d:0.08},{f:880,t:0.12,d:0.08},{f:1100,t:0.24,d:0.12}]};
  (pips[tipo]||pips.inicio).forEach(p=>{
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=p.f;o.type='sine';
    g.gain.setValueAtTime(1.5,ctx.currentTime+p.t);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+p.t+p.d);
    o.start(ctx.currentTime+p.t);o.stop(ctx.currentTime+p.t+p.d+0.05);
  });
}

let _dtSonidoConfig={
  crono:{inicio:'campana'},
  timer:{inicio:'alarma',fin:'doble_pip'},
  hiit:{inicio:'silbato',descanso:'doble_pip',preparacion:'pip',final:'descenso'}
};
let _cronoTab='individual';
let _cronoIndividual={ms:0,running:false,interval:null,sonido:false};
let _cronoMulti=[];

function renderCronometros(c){
  c.innerHTML=`
  <div style="display:flex;gap:8px;margin-bottom:14px">
    <button id="ctab-individual" onclick="switchCronoTab('individual')" style="flex:1;padding:10px;border-radius:8px;border:1px solid #e31e24;background:#e31e24;color:var(--texto);font-weight:700;font-size:13px;cursor:pointer">⏱️ Individual</button>
    <button id="ctab-multi" onclick="switchCronoTab('multi')" style="flex:1;padding:10px;border-radius:8px;border:1px solid #333;background:var(--card);color:var(--texto-secundario);font-weight:700;font-size:13px;cursor:pointer">👥 Múltiple</button>
  </div>
  <div id="crono-individual-panel"></div>
  <div id="crono-multi-panel" style="display:none"></div>`;
  renderCronoIndividual();
  renderCronoMultiPanel();
}

function switchCronoTab(tab){
  _cronoTab=tab;
  document.getElementById('ctab-individual').style.background=tab==='individual'?'#e31e24':'#111';
  document.getElementById('ctab-individual').style.color=tab==='individual'?'#fff':'#666';
  document.getElementById('ctab-individual').style.borderColor=tab==='individual'?'#e31e24':'#333';
  document.getElementById('ctab-multi').style.background=tab==='multi'?'#e31e24':'#111';
  document.getElementById('ctab-multi').style.color=tab==='multi'?'#fff':'#666';
  document.getElementById('ctab-multi').style.borderColor=tab==='multi'?'#e31e24':'#333';
  document.getElementById('crono-individual-panel').style.display=tab==='individual'?'block':'none';
  document.getElementById('crono-multi-panel').style.display=tab==='multi'?'block':'none';
}

function fmtCrono(ms){
  const h=Math.floor(ms/3600000);
  const m=Math.floor((ms%3600000)/60000);
  const s=Math.floor((ms%60000)/1000);
  const cs=Math.floor((ms%1000)/10);
  return (h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(cs).padStart(2,'0');
}

function renderCronoIndividual(){
  const p=document.getElementById('crono-individual-panel');
  if(!p)return;
  p.innerHTML=`
  <div style="text-align:center;padding:30px 0 20px">
    <div id="crono-display" style="font-size:52px;font-weight:700;color:var(--texto);font-family:monospace;letter-spacing:2px;text-shadow:0 0 20px rgba(227,30,36,0.3)">${fmtCrono(_cronoIndividual.ms)}</div>
    <div style="display:flex;justify-content:center;gap:12px;margin-top:24px">
      <button id="crono-btn-start" onclick="cronoStart()" style="background:#e31e24;color:var(--texto);border:none;border-radius:50%;width:64px;height:64px;font-size:24px;cursor:pointer;box-shadow:0 0 15px rgba(227,30,36,0.4)">▶️</button>
      <button onclick="cronoReset()" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:50%;width:64px;height:64px;font-size:24px;cursor:pointer">🔄</button>
    </div>
    <div style="margin-top:20px;display:flex;align-items:center;justify-content:center;gap:8px">
      <span style="font-size:12px;color:var(--texto-secundario)">Sonido</span>
      <div onclick="cronoToggleSonido()" id="crono-sonido-btn" style="width:44px;height:24px;background:${_cronoIndividual.sonido?'#e31e24':'#333'};border-radius:12px;cursor:pointer;position:relative;transition:background 0.2s">
        <div style="position:absolute;top:2px;left:${_cronoIndividual.sonido?'22':'2'}px;width:20px;height:20px;background:#fff;border-radius:50%;transition:left 0.2s"></div>
      </div>
    </div>
  </div>`;
}

function cronoStart(){
  if(_cronoIndividual.running){
    clearInterval(_cronoIndividual.interval);
    _cronoIndividual.running=false;
    document.getElementById('crono-btn-start').textContent='▶️';
    document.getElementById('crono-btn-start').style.boxShadow='none';
  } else {
    const start=Date.now()-_cronoIndividual.ms;
    _cronoIndividual.interval=setInterval(()=>{
      _cronoIndividual.ms=Date.now()-start;
      const d=document.getElementById('crono-display');
      if(d)d.textContent=fmtCrono(_cronoIndividual.ms);
    },50);
    if(_cronoIndividual.sonido)dtSonarEvento('crono','inicio');
    _cronoIndividual.running=true;
    document.getElementById('crono-btn-start').textContent='⏸️';
    document.getElementById('crono-btn-start').style.boxShadow='0 0 15px rgba(227,30,36,0.4)';
  }
}

function cronoReset(){
  clearInterval(_cronoIndividual.interval);
  _cronoIndividual.ms=0;
  _cronoIndividual.running=false;
  const d=document.getElementById('crono-display');
  if(d)d.textContent=fmtCrono(0);
  const b=document.getElementById('crono-btn-start');
  if(b){b.textContent='▶️';b.style.boxShadow='none';}
}

function cronoToggleSonido(){
  _cronoIndividual.sonido=!_cronoIndividual.sonido;
  renderCronoIndividual();
}

// MULTI CRONÓMETRO
function renderCronoMultiPanel(){
  const p=document.getElementById('crono-multi-panel');
  if(!p)return;
  const grid=_cronoMulti.map((c,i)=>`
  <div style="background:var(--card);border:1px solid ${c.running?'#e31e24':'#222'};border-radius:10px;padding:12px;position:relative;transition:border-color 0.3s">
    <button onclick="cronoMultiEliminar(${i})" style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--texto-tenue);font-size:16px;cursor:pointer">✖</button>
    <input value="${c.nombre}" onchange="_cronoMulti[${i}].nombre=this.value" style="background:none;border:none;border-bottom:1px solid #333;color:#e31e24;font-size:11px;font-weight:700;text-transform:uppercase;width:80%;outline:none;margin-bottom:8px">
    <div style="font-size:28px;font-weight:700;color:var(--texto);font-family:monospace;text-align:center;margin:8px 0" id="cm-display-${i}">${fmtCrono(c.ms)}</div>
    <div style="display:flex;justify-content:center;gap:8px">
      <button onclick="cronoMultiToggle(${i})" style="background:${c.running?'#3a0000':'#1a1a1a'};color:${c.running?'#e31e24':'#fff'};border:1px solid ${c.running?'#e31e24':'#333'};border-radius:6px;padding:8px 14px;cursor:pointer;font-size:16px">${c.running?'⏸️':'▶️'}</button>
      <button onclick="cronoMultiReset(${i})" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:6px;padding:8px 14px;cursor:pointer;font-size:16px">🔄</button>
    </div>
  </div>`).join('');
  p.innerHTML=`
  <div style="display:flex;gap:6px;margin-bottom:12px">
    <button onclick="cronoMultiTodos('start')" style="flex:1;background:var(--gris);color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">▶️ Todos</button>
    <button onclick="cronoMultiTodos('pause')" style="flex:1;background:var(--gris);color:#ff9800;border:1px solid #ff9800;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">⏸️ Todos</button>
    <button onclick="cronoMultiTodos('reset')" style="flex:1;background:var(--gris);color:var(--texto-secundario);border:1px solid #333;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">🔄 Todos</button>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px" id="crono-multi-grid">${grid}</div>
  <button onclick="cronoMultiAgregar()" style="width:100%;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:12px;font-weight:700;font-size:13px;cursor:pointer;margin-top:12px">➕ Añadir cronómetro</button>`;
}

function cronoMultiAgregar(){
  _cronoMulti.push({nombre:'Cronómetro '+(+_cronoMulti.length+1),ms:0,running:false,interval:null});
  renderCronoMultiPanel();
}

function cronoMultiEliminar(i){
  clearInterval(_cronoMulti[i].interval);
  _cronoMulti.splice(i,1);
  renderCronoMultiPanel();
}

function cronoMultiToggle(i){
  const c=_cronoMulti[i];
  if(c.running){
    clearInterval(c.interval);
    c.running=false;
  } else {
    const start=Date.now()-c.ms;
    c.interval=setInterval(()=>{
      c.ms=Date.now()-start;
      const d=document.getElementById('cm-display-'+i);
      if(d)d.textContent=fmtCrono(c.ms);
    },50);
    dtSonarEvento('crono','inicio');
    c.running=true;
  }
  renderCronoMultiPanel();
}

function cronoMultiReset(i){
  clearInterval(_cronoMulti[i].interval);
  _cronoMulti[i].ms=0;
  _cronoMulti[i].running=false;
  renderCronoMultiPanel();
}

function cronoMultiTodos(accion){
  _cronoMulti.forEach((c,i)=>{
    if(accion==='start'&&!c.running){
      dtSonarEvento('crono','inicio');
      const start=Date.now()-c.ms;
      c.interval=setInterval(()=>{
        c.ms=Date.now()-start;
        const d=document.getElementById('cm-display-'+i);
        if(d)d.textContent=fmtCrono(c.ms);
      },50);
      c.running=true;
    } else if(accion==='pause'&&c.running){
      clearInterval(c.interval);
      c.running=false;
    } else if(accion==='reset'){
      clearInterval(c.interval);
      c.ms=0;c.running=false;
    }
  });
  renderCronoMultiPanel();
}
function volverHerramientas(){
  if (window._encDesdeRutina) {
    window._encDesdeRutina = false;
    tcTab('rutina');
    return;
  }
  if (window._sonidosDesdeConfig) {
    window._sonidosDesdeConfig = false;
    document.getElementById('herramienta-panel').style.display='none';
    const paginaAntes = window._paginaAntesSonidos || 'inicio';
    showPage(paginaAntes);
    setTimeout(()=>abrirConfig(), 100);
    return;
  }
  document.getElementById('herramienta-panel').style.display='none';
  document.querySelector('#page-logs .st').style.display='block';
  document.querySelector('#page-logs .st').nextElementSibling.style.display='grid';
}
async function cargarLogs(){
const res=await fetch('/api/logs');
const logs=await res.json();
const fechas=Object.keys(logs).sort().reverse();
document.getElementById('lista-logs').innerHTML=fechas.length?fechas.map(f=>`
<div class="card">
<div style="font-weight:700;color:var(--rojo);margin-bottom:8px">📅 ${f}</div>
${Object.entries(logs[f]).map(([n,e])=>`
<div class="li"><span>${n}</span>
<span class="${e==='enviado'?'lok':'ler'}">${e==='enviado'?'✅ Enviado':'❌ Error'}</span>
</div>`).join('')}
</div>`).join(''):'<p style="color:var(--texto-secundario);text-align:center;padding:20px">Sin historial</p>';
}

let _usuariosEnviar=[];
function toggleMenu(id){
  const menu = document.getElementById(id);
  const arrow = document.getElementById(id+'-arrow');
  const abierto = menu.style.display === 'block';
  // Cerrar todos los menús abiertos
  document.querySelectorAll('[id^="menu-"]').forEach(m => {
    if(m.tagName === 'DIV') m.style.display = 'none';
  });
  document.querySelectorAll('[id$="-arrow"]').forEach(a => a.style.transform = '');
  // Abrir o cerrar el actual
  if(!abierto){
    menu.style.display = 'block';
    if(arrow) arrow.style.transform = 'rotate(180deg)';
  }
  // Cerrar al tocar fuera
  setTimeout(()=>{
    document.addEventListener('click', function cerrar(e){
      if(!menu.contains(e.target) && !e.target.closest('[onclick*="toggleMenu"]')){
        menu.style.display = 'none';
        if(arrow) arrow.style.transform = '';
        document.removeEventListener('click', cerrar);
      }
    });
  }, 100);
}

async function descargarHTMLRutina(){
  const id = document.getElementById('enviar-cliente').value;
  if(!id){ toast('Selecciona un cliente primero'); return; }
  try{
    const r = await fetch('/api/rutinas/'+id);
    const rutina = await r.json();
    const usuario = _usuariosEnviar.find(u=>u.id===id||u.id==='cli_'+id);
    const nombre = usuario ? usuario.nombre : 'Cliente';
    const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
    const nombDias = {'lunes':'Lunes','martes':'Martes','miercoles':'Miércoles','jueves':'Jueves','viernes':'Viernes','sabado':'Sábado','domingo':'Domingo'};
    let bloques = '';
    dias.forEach(d=>{
      const ejs = rutina[d];
      if(!ejs||!ejs.length) return;
      bloques += '<div style="margin-bottom:20px"><h3 style="color:#e31e24;border-bottom:2px solid #e31e24;padding-bottom:6px">'+nombDias[d]+'</h3>';
      ejs.forEach(e=>{
        bloques += '<div style="background:#1a1a1a;border-radius:8px;padding:12px;margin-bottom:8px">';
        bloques += '<div style="font-weight:700;color:#fff;font-size:15px">'+e.nombre+'</div>';
        if(e.series||e.reps) bloques += '<div style="color:#aaa;font-size:13px;margin-top:4px">'+[e.series?e.series+' series':'',e.reps?e.reps+' reps':''].filter(Boolean).join(' × ')+'</div>';
        if(e.peso) bloques += '<div style="color:#ffd700;font-size:13px">Peso: '+e.peso+'</div>';
        if(e.notas) bloques += '<div style="color:#888;font-size:12px;margin-top:4px;font-style:italic">'+e.notas+'</div>';
        bloques += '</div>';
      });
      bloques += '</div>';
    });
    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rutina '+nombre+'</title></head><body style="background:#111;color:#fff;font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#e31e24">💪 Rutina de '+nombre+'</h2>'+bloques+'<p style="color:#555;font-size:11px;text-align:center;margin-top:30px">Generado por DT-APP</p></body></html>';
    const blob = new Blob([html], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rutina_'+nombre.replace(/\s+/g,'_')+'.html';
    a.click();
    URL.revokeObjectURL(url);
    toast('✅ HTML descargado');
  } catch(e){
    toast('Error al generar HTML');
  }
}

function cargarSelectEnviar(){
  fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)).then(r=>r.json()).then(u=>{
    _usuariosEnviar=u;
    _difusionSeleccionados=new Set();
    _difusionIniciado=false;
    cargarDifusion();
  });
}
function _renderDrop(dropId,hiddenId,inputId,q){
  const drop=document.getElementById(dropId);
  const f=_usuariosEnviar.filter(u=>u.nombre.toLowerCase().includes(q.toLowerCase()));
  drop.innerHTML=f.map(u=>`<div onclick="seleccionarEnviar('${dropId}','${hiddenId}','${inputId}','${u.nombre}','${u.id}')" style="padding:10px 12px;font-size:13px;color:var(--texto);cursor:pointer;border-bottom:1px solid #222">${u.nombre}</div>`).join('');
  drop.style.display=f.length?'block':'none';
}
function seleccionarEnviar(dropId,hiddenId,inputId,nombre,id){
  document.getElementById(hiddenId).value=id;
  document.getElementById(inputId).value=nombre;
  document.getElementById(dropId).style.display='none';
}
function mostrarDrop1(){_renderDrop('drop-enviar1','enviar-cliente','buscar-enviar1',document.getElementById('buscar-enviar1').value);}
function filtrarEnviar1(){mostrarDrop1();}
function mostrarDrop2(){_renderDrop('drop-enviar2','enviar-cliente-dia','buscar-enviar2',document.getElementById('buscar-enviar2').value);}
function filtrarEnviar2(){mostrarDrop2();}
document.addEventListener('click',e=>{
  if(!e.target.closest('#buscar-enviar1')&&!e.target.closest('#drop-enviar1'))document.getElementById('drop-enviar1').style.display='none';
  if(!e.target.closest('#buscar-enviar2')&&!e.target.closest('#drop-enviar2'))document.getElementById('drop-enviar2').style.display='none';
});

async function desbloquearDiaEntrenamiento() {
  const id = document.getElementById('enviar-cliente-dia').value;
  const dia = document.getElementById('enviar-dia-select').value;
  if (!id) { toast('Selecciona un cliente', false); return; }
  if (!dia) { toast('Selecciona un día', false); return; }
  const res = await fetch('/api/usuarios/' + id + '/desbloquear-dia', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({dia})
  });
  const data = await res.json();
  if (data.ok) {
    toast('🔓 Día ' + dia + ' desbloqueado para el cliente');
  } else {
    toast('❌ Error al desbloquear', false);
  }
}

async function compartirTextoNativo(texto, titulo){
  if (!texto || !texto.trim()) { toast('No hay contenido para compartir', false); return; }
  if (navigator.share) {
    try {
      await navigator.share({ title: titulo || 'DT-APP', text: texto });
    } catch(e) {
      // Usuario canceló o no soportado, no mostrar error
    }
  } else {
    try {
      await navigator.clipboard.writeText(texto);
      toast('📋 Copiado (compartir no disponible en este navegador)');
    } catch(e) {
      toast('Error al compartir', false);
    }
  }
}

async function copiarDiaRutina(){
  const id = document.getElementById('enviar-cliente-dia').value;
  const dia = document.getElementById('enviar-dia-select').value;
  if(!id){ toast('Selecciona un cliente', false); return; }
  try {
    const res = await fetch('/api/enviar-dia/'+id+'/'+dia+'/texto');
    const data = await res.json();
    if(!data.texto){ toast('No hay rutina para ese día', false); return; }
    await navigator.clipboard.writeText(data.texto);
    toast('📋 Rutina copiada al portapapeles');
  } catch(e){
    toast('Error al copiar', false);
    logFrontend('copiarDiaRutina', e.message || 'Error al copiar rutina', e.stack || '');
  }
}

async function compartirDiaRutina(){
  const id = document.getElementById('enviar-cliente-dia').value;
  const dia = document.getElementById('enviar-dia-select').value;
  if(!id){ toast('Selecciona un cliente', false); return; }
  try {
    const res = await fetch('/api/enviar-dia/'+id+'/'+dia+'/texto');
    const data = await res.json();
    if(!data.texto){ toast('No hay rutina para ese día', false); return; }
    await compartirTextoNativo(data.texto, 'Rutina del día');
  } catch(e){
    toast('Error al compartir', false);
  }
}

async function enviarDiaRutina(){
const id=document.getElementById('enviar-cliente-dia').value;
const dia=document.getElementById('enviar-dia-select').value;
if(!id){toast('Selecciona un cliente',false);return;}
const res=await fetch('/api/enviar-dia/'+id+'/'+dia,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
const data=await res.json();
toast(data.ok?'✅ Día enviado':'❌ Error',data.ok);
}

async function enviarRutinaCompleta(){
const id=document.getElementById('enviar-cliente').value;
if(!id){toast('Selecciona un cliente',false);return;}
const res=await fetch('/api/enviar-rutina/'+id,{method:'POST'});
const data=await res.json();
toast(data.ok?'✅ Rutina enviada':'❌ Error',data.ok);
}

async function mostrarTarjetaPremium(){
  if(!entEsPremium()){mostrarCandadoPremium('El Informe Premium requiere Plan Premium.');return;}
  const id = document.getElementById("enviar-cliente").value;
  if(!id){toast("Selecciona un cliente",false);return;}
  const u = await fetch('/api/usuarios/'+id).then(r=>r.json()).catch(()=>null);
  const nombre = u && u.nombre ? u.nombre : 'Cliente';
  const link = 'https://dt-app.net/api/informe/'+id+'/html';

  const modal = document.createElement('div');
  modal.id = 'modal-tarjeta-premium';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;animation:fadeInModal 0.3s ease';
  modal.innerHTML = `
    <style>
      @keyframes fadeInModal { from{opacity:0} to{opacity:1} }
      @keyframes cardPop { from{opacity:0;transform:scale(0.92) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
      @keyframes shine { 0%{transform:translateX(-100%) rotate(25deg)} 100%{transform:translateX(250%) rotate(25deg)} }
    </style>
    <div style="max-width:420px;width:100%;animation:cardPop 0.4s ease">
      <div style="position:relative;width:100%;aspect-ratio:1.6;border-radius:18px;overflow:hidden;aspect-ratio:1586/992;background:url('/img/tarjeta-premium.png') center/100% 100% no-repeat;box-shadow:0 12px 40px rgba(255,215,0,0.25)">
        <div style="position:absolute;top:0;left:-30%;width:35%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);animation:shine 1.8s ease-in-out 0.3s 1"></div>
        <div style="position:absolute;left:10%;top:46%;width:48%;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(13px,3.6vw,19px);letter-spacing:1px;color:#3d2e0a;text-shadow:1px 1px 1px rgba(255,255,255,0.35),-1px -1px 1px rgba(0,0,0,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nombre.toUpperCase()}</div>
        </div>
        <div style="position:absolute;left:8.5%;bottom:14.5%;width:83%;">
          <div style="font-family:'DM Mono',monospace,monospace;font-size:clamp(7px,2vw,10px);letter-spacing:0.3px;color:#3d2e0a;text-shadow:1px 1px 1px rgba(255,255,255,0.3),-1px -1px 1px rgba(0,0,0,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${link}</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:12px;color:#ccc;line-height:1.5">
        Cada vez que actualices su rutina o medidas, ${nombre.split(' ')[0]} podrá verlo desde este mismo link, en cualquier momento.
      </div>
      <div style="display:flex;gap:10px;margin-top:16px">
        <button onclick="navigator.clipboard.writeText('${link}');toast('📋 Link copiado')" style="flex:1;padding:13px;border:none;border-radius:10px;background:linear-gradient(135deg,#b8860b,#ffd700,#b8860b);color:#000;font-size:13px;font-weight:800;cursor:pointer">📋 Copiar link</button>
        <button onclick="window.open('${link}','_blank')" style="flex:1;padding:13px;border-radius:10px;border:1px solid rgba(255,215,0,0.4);background:rgba(255,215,0,0.08);color:#ffd700;font-size:13px;font-weight:700;cursor:pointer">👁️ Ver</button>
      </div>
      <button onclick="document.getElementById('modal-tarjeta-premium').remove()" style="display:block;margin:16px auto 0;background:transparent;border:none;color:#888;font-size:12px;cursor:pointer">Cerrar</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.remove(); });
}

async function enviarInformePremium(){
  if(!entEsPremium()){mostrarCandadoPremium('El Informe Premium requiere Plan Premium.');return;}
  const id=document.getElementById("enviar-cliente").value;
  if(!id){toast("Selecciona un cliente",false);return;}
  if(!confirm("Enviar informe premium por WhatsApp?")){return;}
  const res=await fetch("/api/informe/"+id+"/enviar",{method:"POST"});
  const data=await res.json();
  toast(data.ok?"Informe enviado":"Error: "+data.error,data.ok);
}
async function descargarInformeArchivo(){
  if(!entEsPremium()){mostrarCandadoPremium('El Informe Premium requiere Plan Premium.');return;}
  const id=document.getElementById("enviar-cliente").value;
  if(!id){toast("Selecciona un cliente",false);return;}
  window.location.href="/api/informe/"+id+"/descargar";
}

async function descargarInformePremium(){
  if(!entEsPremium()){mostrarCandadoPremium('El Informe Premium requiere Plan Premium.');return;}
  const id=document.getElementById("enviar-cliente").value;
  if(!id){toast("Selecciona un cliente",false);return;}
  window.open("/api/informe/"+id+"/html","_blank");
}
let _difusionSeleccionados=new Set();
let _difusionIniciado=false;
function cargarDifusion(){
  const lista=document.getElementById('difusion-lista');
  const buscar=document.getElementById('buscar-difusion');
  if(!lista)return;
  if(!_difusionIniciado && _usuariosEnviar.length>0){
    _usuariosEnviar.forEach(u=>_difusionSeleccionados.add(u.telefono));
    _difusionIniciado=true;
  }
  const q=buscar?buscar.value.toLowerCase():'';
  const filtrados=_usuariosEnviar.filter(u=>u.nombre.toLowerCase().includes(q));
  lista.innerHTML=filtrados.map(u=>{
    const sel=_difusionSeleccionados.has(u.telefono)?'checked':'';
    return `<label style="display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid #222;border-radius:8px;padding:8px;cursor:pointer"><input type="checkbox" class="difusion-check" data-tel="${u.telefono}" data-nombre="${u.nombre}" ${sel} onchange="toggleDifusion(this)" style="accent-color:#e31e24;width:16px;height:16px"><span style="font-size:13px;color:var(--texto)">${u.nombre}</span></label>`;
  }).join('');
}
function toggleDifusion(el){
  if(el.checked) _difusionSeleccionados.add(el.getAttribute('data-tel'));
  else _difusionSeleccionados.delete(el.getAttribute('data-tel'));
}
function difusionSelTodos(){
  _usuariosEnviar.forEach(u=>_difusionSeleccionados.add(u.telefono));
  cargarDifusion();
}
function difusionDeselTodos(){
  _difusionSeleccionados.clear();
  cargarDifusion();
}
async function enviarDifusion(){
  const mensaje = document.getElementById('mensaje-custom').value.trim();
  if(!mensaje){toast('Escribe un mensaje',false);return;}
  const seleccionados = [...document.querySelectorAll('.difusion-check:checked')];
  if(!seleccionados.length){toast('Selecciona al menos un cliente',false);return;}
  let ok=0, fail=0;
  for(const ch of seleccionados){
    const telefono = ch.getAttribute('data-tel');
    const nombre = ch.getAttribute('data-nombre');
    try{
      const res = await fetch('/api/enviar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telefono,mensaje,entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)})});
      const data = await res.json();
      if(data.ok) ok++; else fail++;
    }catch(e){ fail++; }
  }
  toast('✅ Enviados: '+ok+(fail?' | ❌ Fallidos: '+fail:''), ok>0);
  if(ok>0) document.getElementById('mensaje-custom').value='';
}
cargarClientes();
cargarDifusion();
setInterval(async()=>{
try{
const r=await fetch('/api/status');
const d=await r.json();
const s=document.getElementById('statusWA');
if(d.conectado){s.textContent='🟢 Online';s.className='sdot son';}
else{s.textContent='⚫ Offline';s.className='sdot soff';}
}catch(e){}
},3000);
function abrirModalPausa(){
  document.getElementById('modal-pausa').style.display='flex';
}
function cerrarModalPausa(){
  document.getElementById('modal-pausa').style.display='none';
}
async function ejecutarPausaGlobal(dias){
  let hasta = dias === -1 ? 'indefinido' : new Date(Date.now() + dias*86400000).toISOString().split('T')[0];
  await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({envios_pausados_hasta: hasta, entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)})});
  cerrarModalPausa();
  actualizarBtnPausaGlobal(hasta);
}
async function reactivarEnviosGlobal(){
  await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({envios_pausados_hasta: null, entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)})});
  actualizarBtnPausaGlobal(null);
}
function actualizarBtnPausaGlobal(hasta){
  const btn = document.getElementById('btn-pausa-global');
  const icono = document.getElementById('icono-pausa-global');
  const lbl = document.getElementById('lbl-pausa-global');
  if(!hasta || hasta === null){
    btn.style.borderColor='#333';
    btn.style.color='#aaa';
    btn.style.background='#1a1a1a';
    icono.textContent='⏸️';
    lbl.textContent='Pausar envíos globalmente';
    btn.onclick = abrirModalPausa;
  } else {
    btn.style.borderColor='#e31e24';
    btn.style.color='#e31e24';
    btn.style.background='#2a0000';
    icono.textContent='🔴';
    lbl.textContent = hasta === 'indefinido' ? 'Envíos pausados — Toca para reactivar' : 'Pausado hasta '+hasta+' — Toca para reactivar';
    btn.onclick = reactivarEnviosGlobal;
  }
}
async function cargarEstadoPausaGlobal(){
  const r = await fetch('/api/config');
  const cfg = await r.json();
  const hasta = cfg.envios_pausados_hasta || null;
  actualizarBtnPausaGlobal(hasta);
}
function filtrarClientes(){
  const q=document.getElementById('buscador-clientes').value.toLowerCase();
  document.querySelectorAll('#lista-clientes>div').forEach(d=>{
    d.style.display=d.innerText.toLowerCase().includes(q)?'block':'none';
  });
}
function filtrarRutinas(){
  const q=document.getElementById('buscador-rutinas').value.toLowerCase();
  document.querySelectorAll('#lista-rutinas-clientes>div').forEach(d=>{
    d.style.display=d.innerText.toLowerCase().includes(q)?'block':'none';
  });
}

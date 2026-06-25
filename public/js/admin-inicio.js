// ── TICKER EDITOR ──
let _tickerTaps = 0, _tickerTimer = null;
function tickerTap() {
  _tickerTaps++;
  clearTimeout(_tickerTimer);
  _tickerTimer = setTimeout(() => { _tickerTaps = 0; }, 2000);
  if (_tickerTaps >= 7) {
    _tickerTaps = 0;
    abrirTickerEditor();
  }
}

async function cargarTicker() {
  try {
    const frases = await fetch('/api/ticker').then(r => r.json());
    const inner = document.getElementById('ticker-inner');
    if (!inner) return;
    if (!frases.length) return;
    let items = [];
    frases.forEach(f => {
      for (let i = 0; i < (f.prioridad || 1); i++) items.push(f);
    });
    const txt = items.map(f => f.texto).join('   ·   ');
    inner.style.animation = 'none';
    inner.style.transform = 'translateX(0)';
    inner.innerHTML = txt + '   ·   ';
    const anchoTexto = inner.scrollWidth;
    const anchoContenedor = inner.parentElement.offsetWidth;
    let pos = anchoContenedor;
    inner.style.position = 'absolute';
    inner.style.left = pos + 'px';
    if (window._tickerInterval) clearInterval(window._tickerInterval);
    const velocidad = 0.5;
    window._tickerInterval = setInterval(() => {
      pos -= velocidad;
      if (pos < -anchoTexto) pos = anchoContenedor;
      inner.style.left = pos + 'px';
    }, 16);
  } catch(e) {}
}


async function abrirTickerEditor() {
  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  if (sesion.id !== 'ent_001') return;
  let frases = await fetch('/api/ticker').then(r => r.json()).catch(() => []);
  
  const modal = document.createElement('div');
  modal.id = 'modal-ticker-editor';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;flex-direction:column;padding:20px;overflow-y:auto';
  
  function renderModal() {
    modal.innerHTML = '<div style="max-width:480px;margin:0 auto;width:100%">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">' +
      '<div style="font-size:16px;font-weight:900;color:#e31e24">📡 Editor Ticker</div>' +
      '<button onclick="tickerCerrar()" style="background:#333;border:none;border-radius:8px;color:#fff;padding:6px 12px;cursor:pointer">✕ Cerrar</button></div>' +
      '<div style="background:#1a1a1a;border-radius:14px;padding:14px;margin-bottom:16px">' +
      '<div style="font-size:11px;color:#e31e24;font-weight:800;margin-bottom:10px;text-transform:uppercase">➕ Nueva frase</div>' +
      '<textarea id="ticker-nueva-frase" placeholder="Escribe la frase..." style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:13px;resize:none;height:60px;box-sizing:border-box"></textarea>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">' +
      '<div><div style="font-size:10px;color:#666;margin-bottom:4px">Velocidad (seg)</div>' +
      '<input type="range" id="ticker-vel" min="10" max="60" value="28" style="width:100%"><div id="ticker-vel-label" style="font-size:11px;color:#888;text-align:center">28s</div></div>' +
      '<div><div style="font-size:10px;color:#666;margin-bottom:4px">Prioridad</div>' +
      '<div style="display:flex;gap:4px">' +
      '<button onclick="tickerSetPrio(1)" id="prio-1" style="flex:1;padding:6px;border-radius:8px;border:none;background:#e31e24;color:#fff;font-size:11px;font-weight:700;cursor:pointer">1x</button>' +
      '<button onclick="tickerSetPrio(2)" id="prio-2" style="flex:1;padding:6px;border-radius:8px;border:none;background:#333;color:#fff;font-size:11px;font-weight:700;cursor:pointer">2x</button>' +
      '<button onclick="tickerSetPrio(3)" id="prio-3" style="flex:1;padding:6px;border-radius:8px;border:none;background:#333;color:#fff;font-size:11px;font-weight:700;cursor:pointer">3x</button>' +
      '</div></div></div>' +
      '<button onclick="tickerAgregarFrase()" style="width:100%;margin-top:10px;background:#e31e24;border:none;border-radius:10px;padding:10px;color:#fff;font-size:13px;font-weight:700;cursor:pointer">➕ Agregar frase</button></div>' +
      '<div style="font-size:11px;color:#666;font-weight:800;text-transform:uppercase;margin-bottom:8px">Frases actuales (' + frases.length + ')</div>' +
      frases.map((f, i) => '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:12px;margin-bottom:8px">' +
        '<div style="font-size:13px;color:#fff;margin-bottom:8px">' + f.texto + '</div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
        '<div style="font-size:10px;color:#666">⚡ ' + f.velocidad + 's</div>' +
        '<div style="font-size:10px;color:#666">🔁 ' + f.prioridad + 'x</div>' +
        '<button onclick="tickerEliminar(' + i + ')" style="margin-left:auto;background:rgba(227,30,36,0.15);border:1px solid rgba(227,30,36,0.3);border-radius:8px;padding:4px 10px;color:#e31e24;font-size:11px;cursor:pointer">🗑️ Eliminar</button>' +
        '</div></div>').join('') +
      '</div>';
    
    const velInput = document.getElementById('ticker-vel');
    if (velInput) velInput.oninput = function() {
      document.getElementById('ticker-vel-label').textContent = this.value + 's';
    };
  }
  
  window._tickerPrio = 1;
  window.tickerCerrar = function() { const m = document.getElementById("modal-ticker-editor"); if(m) m.remove(); };
  window.tickerSetPrio = function(p) {
    window._tickerPrio = p;
    [1,2,3].forEach(n => {
      const b = document.getElementById('prio-' + n);
      if (b) b.style.background = n === p ? '#e31e24' : '#333';
    });
  };
  
  window.tickerAgregarFrase = async function() {
    const txt = document.getElementById('ticker-nueva-frase').value.trim();
    if (!txt) return;
    const vel = parseInt(document.getElementById('ticker-vel').value);
    frases.push({ texto: txt, velocidad: vel, prioridad: window._tickerPrio });
    await fetch('/api/ticker', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(frases) });
    cargarTicker();
    renderModal();
  };
  
  window.tickerEliminar = async function(idx) {
    frases.splice(idx, 1);
    await fetch('/api/ticker', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(frases) });
    cargarTicker();
    renderModal();
  };
  
  document.body.appendChild(modal);
  renderModal();
}


function navToggleFunciones(btn){
  const menu=document.getElementById('menu-funciones');
  if(!menu)return;
  const abierto=menu.style.display==='block';
  navCerrarMenus();
  if(!abierto){
    menu.style.display='block';
    btn.style.color='#e31e24';
  }
}

function navToggleHerramientas(btn){
  const menu=document.getElementById('nav-menu-herramientas');
  if(!menu)return;
  const abierto=menu.style.display==='block';
  navCerrarMenus();
  if(!abierto){
    menu.style.display='block';
    btn.style.color='#e31e24';
  }
}

function navCerrarMenus(){
  const menu=document.getElementById('menu-funciones');
  if(menu)menu.style.display='none';
  const mh=document.getElementById('nav-menu-herramientas');
  if(mh)mh.style.display='none';
  const btn=document.getElementById('btn-nav-funciones');
  if(btn)btn.style.color='#666';
}


// ═══════════════════════════════
// PANTALLA INICIO
// ═══════════════════════════════
// ═══════════════════════════════
// PANTALLA INICIO
// ═══════════════════════════════

let _vencIdx=0;
let _vencidos=[];
function enviarPagoWA(idx){
  const u=_vencidos[idx];
  if(!u)return;
  const msgTexto = (u.msg_pago && u.msg_pago.trim()) ? u.msg_pago : 'El día de hoy se venció tu plan de entrenamiento.';
  const msg=encodeURIComponent(msgTexto);
  window.open('https://wa.me/'+u.telefono.replace(/\D/g,'')+'?text='+msg,'_blank');
}
async function cargarInicio(){
  try{
    const usuarios=await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json());
    const activos=usuarios.filter(u=>u.activo);
    const person=activos.filter(u=>u.tipo==='personalizado').length;
    const asesor=activos.filter(u=>u.tipo==='asesorado').length;
    const pausados=usuarios.filter(u=>!u.activo).length;
    document.getElementById('hi-stat-activos').textContent=activos.length;
    document.getElementById('hi-stat-person').textContent=person;
    document.getElementById('hi-stat-asesor').textContent=asesor;
    document.getElementById('hi-stat-pausados').textContent=pausados;
    const badge=document.getElementById('hi-badge-clientes');
    // Badge ahora muestra mensajes no leídos
    fetch('/api/chat/no-leidos/entrenador').then(r=>r.json()).then(data=>{
      badge.textContent=data.total;
      badge.style.display=data.total>0?'block':'none';
    }).catch(()=>{ badge.style.display='none'; });
    const hoy=new Date();
    _vencIdx=0;_vencidos=[];
    const vencidos=activos.filter(u=>u.estado_pago==='vencido');
    _vencidos=vencidos;
    const proximos=activos.filter(u=>{
      if(!u.dia_pago||u.estado_pago==='vencido')return false;
      const dia=parseInt(u.dia_pago);
      // Fecha de pago este mes
      let d=new Date(hoy.getFullYear(),hoy.getMonth(),dia);
      let diff=Math.ceil((d-hoy)/(1000*60*60*24));
      // Si ya pasó este mes, revisar el mes siguiente
      if(diff<-3){
        d=new Date(hoy.getFullYear(),hoy.getMonth()+1,dia);
        diff=Math.ceil((d-hoy)/(1000*60*60*24));
      }
      return diff>=0&&diff<=3;
    });
    _vencidos=vencidos;
    let cobrosHtml='';
    if(vencidos.length===0&&proximos.length===0){
      cobrosHtml='<div style="background:rgba(76,175,80,0.08);border:1px solid rgba(76,175,80,0.2);border-radius:14px;padding:16px;display:flex;align-items:center;gap:12px"><div style="font-size:28px">✅</div><div><div style="font-size:13px;color:#4caf50;font-weight:700">Todo al día</div><div style="font-size:11px;color:var(--texto-tenue);margin-top:2px">Sin cobros pendientes</div></div></div>';
    }
    vencidos.forEach((u,_vi)=>{
      const ini=u.nombre?u.nombre.charAt(0).toUpperCase():'?';
      const av=u.foto?'<img src="'+u.foto+'" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #e31e24">':'<div style="width:38px;height:38px;border-radius:50%;background:rgba(227,30,36,0.2);border:2px solid #e31e24;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#e31e24">'+ini+'</div>';
      cobrosHtml+='<div style="background:rgba(227,30,36,0.06);border:1px solid rgba(227,30,36,0.2);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:8px">'+av+'<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;color:var(--texto)">'+u.nombre+'</div><div style="font-size:10px;color:#e31e24;font-weight:700;margin-top:1px">🔴 Cobro vencido</div></div><div style="background:#e31e24;border-radius:10px;padding:7px 12px;font-size:11px;font-weight:700;color:#fff;cursor:pointer;white-space:nowrap;flex-shrink:0" id="wa-btn-'+_vi+'">📲 WA</div></div>';
    });
    proximos.forEach((u,_pi)=>{
      const ini=u.nombre?u.nombre.charAt(0).toUpperCase():'?';
      const av=u.foto?'<img src="'+u.foto+'" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #ff9800">':'<div style="width:38px;height:38px;border-radius:50%;background:rgba(255,152,0,0.2);border:2px solid #ff9800;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#ff9800">'+ini+'</div>';
      cobrosHtml+='<div style="background:rgba(255,152,0,0.06);border:1px solid rgba(255,152,0,0.2);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:8px">'+av+'<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;color:var(--texto)">'+u.nombre+'</div><div style="font-size:10px;color:#ff9800;font-weight:700;margin-top:1px">⚠️ Vence día '+u.dia_pago+'</div></div><div style="background:#ff9800;border-radius:10px;padding:7px 12px;font-size:11px;font-weight:700;color:#fff;cursor:pointer;white-space:nowrap;flex-shrink:0" id="prox-btn-'+_pi+'">📲 WA</div></div>';
    });

    document.getElementById('hi-cobros').innerHTML=cobrosHtml;
    proximos.forEach((_u,_pi)=>{
      const bp=document.getElementById('prox-btn-'+_pi);
      if(bp)bp.onclick=()=>{
        const msgTexto = (_u.msg_proximo && _u.msg_proximo.trim()) ? _u.msg_proximo : ('Hola '+_u.nombre+' 👋, te recuerdo que tu plan vence pronto. Comunícate conmigo para renovarlo. ¡Gracias! 💪');
        const msg=encodeURIComponent(msgTexto);
        window.open('https://wa.me/'+_u.telefono.replace(/\D/g,'')+'?text='+msg,'_blank');
      };
    });
    vencidos.forEach((_u,_i)=>{
      const b=document.getElementById('wa-btn-'+_i);
      if(b)b.onclick=()=>enviarPagoWA(_i);
    });
    const items=[];
    if(activos.length>0)items.push('👥 '+activos.length+' clientes activos');
    if(vencidos.length>0)items.push('🔴 Cobro vencido: '+vencidos.map(u=>u.nombre).join(', '));
    if(proximos.length>0)items.push('⚠️ Próximo cobro: '+proximos.map(u=>u.nombre).join(', '));
    items.push('📅 '+new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'}));
    // ticker manejado por cargarTicker()
  
  try{
    const _eid2=(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id)||'ent_001';
    const _hdata=await fetch('/api/horarios?entrenador_id='+_eid2).then(r=>r.json());
    _horariosData={recurrentes:_hdata.recurrentes||[],unicos:_hdata.unicos||[]};
    setTimeout(renderMiniCal, 300);
  }catch(_e){console.error('miniCal',_e);}
}catch(e){console.error('cargarInicio',e);}
}
async function cargarClientes(){
const res=await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001'));
const usuarios=await res.json();
const lista=document.getElementById('lista-clientes');
const empty=document.getElementById('empty-clientes');
if(!usuarios.length){lista.innerHTML='';empty.style.display='block';return;}
empty.style.display='none';
window._usuariosCargados=usuarios;
const sActivos=usuarios.filter(u=>u.activo).length;
const sPersonalizados=usuarios.filter(u=>u.activo&&u.tipo==='personalizado').length;
const sAsesorados=usuarios.filter(u=>u.activo&&u.tipo==='asesorado').length;
const sPausados=usuarios.filter(u=>!u.activo).length;
document.getElementById('stat-activos').textContent=sActivos;
document.getElementById('stat-personalizados').textContent=sPersonalizados;
document.getElementById('stat-asesorados').textContent=sAsesorados;
document.getElementById('stat-pausados').textContent=sPausados;
lista.innerHTML=usuarios.map(u=>{
const ep=u.estado_pago||'aldia';
const epColor=ep==='vencido'?'#e31e24':ep==='proximo'?'#ff9800':'#4caf50';
const epTexto=ep==='vencido'?'🔴 Vencido':ep==='proximo'?'⚠️ Próximo pago':'✅ Al día';
const tipoTexto=u.tipo==='personalizado'?'💪 Personalizado':'📋 Asesorado';
return`<div onclick="abrirPerfilCliente('${u.id}')" style="background:var(--card);border:1px solid #222;border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px">
<div style="flex-shrink:0">${avatarHTML(u)}</div>
<div style="flex:1;min-width:0">
  <div style="font-size:15px;font-weight:700;color:var(--texto);margin-bottom:4px">${u.nombre}</div>
  <div style="font-size:11px;color:#666;margin-bottom:6px">🗓️ Día ${u.dia_pago||'-'}</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap">
    <span style="font-size:10px;font-weight:700;color:#888;background:#1a1a1a;border-radius:20px;padding:3px 8px">${tipoTexto}</span>
    <span style="font-size:10px;font-weight:700;color:${epColor};background:${epColor}18;border-radius:20px;padding:3px 8px">${epTexto}</span>
  </div>
</div>
<label class="toggle" onclick="event.stopPropagation()"><input type="checkbox" ${u.activo?'checked':''} onchange="toggleActivo('${u.id}',this.checked)"><span class="slider"></span></label>
</div>`;
}).join('');
}

async function abrirPerfilCliente(id){
  _ultimoClienteId=id;
  const u=window._usuariosCargados.find(x=>x.id===id);
  if(!u)return;
  window._perfilClienteActual=u;
  const ep=u.estado_pago||'aldia';
  const epColor=ep==='vencido'?'#e31e24':ep==='proximo'?'#ff9800':'#4caf50';
  const epTexto=ep==='vencido'?'🔴 Vencido':ep==='proximo'?'⚠️ Próximo pago':'✅ Al día';
  const tipoTexto=u.tipo==='personalizado'?'💪 Personalizado':'📋 Asesorado';
  const pg=document.getElementById('page-perfil-cliente');
  pg.innerHTML=`
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
    <button onclick="showPage('clientes')" style="background:none;border:none;color:#e31e24;font-size:22px;cursor:pointer;padding:0">←</button>
    <div style="flex:1;font-size:15px;font-weight:700;color:var(--texto)">${u.nombre}</div>
    <label class="toggle"><input type="checkbox" ${u.activo?'checked':''} onchange="toggleActivo('${u.id}',this.checked)"><span class="slider"></span></label>
  </div>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
    ${avatarHTML(u)}
    <div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px">
        <span style="font-size:10px;font-weight:700;color:${epColor};background:${epColor}18;border-radius:20px;padding:3px 10px">${epTexto}</span>
        <span style="font-size:10px;font-weight:700;color:#888;background:#1a1a1a;border-radius:20px;padding:3px 10px">${tipoTexto}</span>
      </div>
      <div style="font-size:11px;color:#666">🗓️ Día ${u.dia_pago||'-'} &nbsp;📱 ${u.telefono}</div>
    </div>
  </div>
  <div style="display:flex;gap:0;background:#1a1a1a;border-radius:12px;padding:4px;margin-bottom:16px;overflow-x:auto">
    <button id="ptab-datos" onclick="perfilTab('datos')" style="flex:1;background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:11px;font-weight:700;padding:8px 4px;cursor:pointer;white-space:nowrap">📋 Datos</button>
    <button id="ptab-medidas" onclick="perfilTab('medidas')" style="flex:1;background:none;border:none;color:#666;font-size:11px;font-weight:700;padding:8px 4px;cursor:pointer;white-space:nowrap">📏 Medidas</button>
    <button id="ptab-tests" onclick="perfilTab('tests')" style="flex:1;background:none;border:none;color:#666;font-size:11px;font-weight:700;padding:8px 4px;cursor:pointer;white-space:nowrap">💪 Tests</button>
    <button id="ptab-rutina" onclick="perfilTab('rutina')" style="flex:1;background:none;border:none;color:#666;font-size:11px;font-weight:700;padding:8px 4px;cursor:pointer;white-space:nowrap">🏋️ Rutina / 🍖 Alimentación</button>
  </div>
  <div id="perfil-contenido"></div>`;
  document.body.classList.add('en-perfil');
  showPage('perfil-cliente');
  perfilTab('datos');
}

function perfilTab(tab){
  if(window._perfilCambiando) return;
  window._perfilCambiando=true;
  setTimeout(()=>window._perfilCambiando=false, 600);

  ['datos','medidas','tests','rutina'].forEach(t=>{
    const b=document.getElementById('ptab-'+t);
    if(b){b.style.background=t===tab?'#e31e24':'none';b.style.color=t===tab?'#fff':'#666';}
  });
  const u=window._perfilClienteActual;
  if(!u)return;
  // Cerrar modales anteriores
  ['modal-cliente','modal-medidas','modal-tests','modal-rutina'].forEach(id=>{
    const m=document.getElementById(id);
    if(m){m.classList.remove('open');m.classList.remove('modo-perfil');}
  });
  const _abrirConModo=(modalId,fn)=>{
    const m=document.getElementById(modalId);
    if(m)m.classList.add('modo-perfil');
    fn();
  };
  if(tab==='datos'){
    _abrirConModo('modal-cliente',()=>editarCliente(u.id));
  } else if(tab==='medidas'){
    _abrirConModo('modal-medidas',()=>abrirMedidasYSubir(u.id,u.nombre));
  } else if(tab==='tests'){
    _abrirConModo('modal-tests',()=>abrirTestsYSubir(u.id,u.nombre));
  } else if(tab==='rutina'){
    _abrirConModo('modal-rutina',()=>abrirRutina(u.id,u.nombre));
  }
}



function selEstado(e){
document.getElementById('cliente-estado-pago').value=e;
['aldia','proximo','vencido'].forEach(x=>{
const b=document.getElementById('btn-'+x);
b.className='eb'+(x===e?' s'+x.slice(0,2):'');
if(x==='aldia'&&e==='aldia')b.className='eb sal';
if(x==='proximo'&&e==='proximo')b.className='eb spr';
if(x==='vencido'&&e==='vencido')b.className='eb sve';
});
}

var _ultimoClienteId=null;

async function marcarSesionRapida(id,btn){
  try{
    const res=await fetch('/api/usuarios/'+id+'/sesion',{method:'POST'});
    const data=await res.json();
    btn.textContent='✅';
    btn.style.background='#1a3a1a';
    btn.style.color='#4caf50';
    setTimeout(()=>{btn.textContent='+1 💪';btn.style.background='';btn.style.color='';},2000);
    toast('💪 Sesión: Total '+data.sesiones_total+' | Ciclo '+data.sesiones_ciclo);
    _ultimoClienteId=id;
  }catch(e){toast('Error',false);}
}

async function abrirMedidasYSubir(id,nombre){
  _ultimoClienteId=id;
  _reordenarLista();
  await abrirMedidas(id,nombre);
}

async function abrirTestsYSubir(id,nombre){
  _ultimoClienteId=id;
  _reordenarLista();
  await abrirTests(id,nombre);
}

function _reordenarLista(){
  if(!_ultimoClienteId||!window._usuariosCargados)return;
  const idx=window._usuariosCargados.findIndex(u=>u.id===_ultimoClienteId);
  if(idx>0){
    const u=window._usuariosCargados.splice(idx,1)[0];
    window._usuariosCargados.unshift(u);
  }
}

function _renderListaLocal(){
  if(!window._usuariosCargados)return;
  const lista=document.getElementById('lista-clientes');
  if(!lista)return;
  lista.innerHTML=window._usuariosCargados.map(u=>{
    const ep=u.estado_pago||'aldia';
    const epColor=ep==='vencido'?'#e31e24':ep==='proximo'?'#ff9800':'#4caf50';
    const epTexto=ep==='vencido'?'🔴 Vencido':ep==='proximo'?'⚠️ Próximo pago':'✅ Al día';
    const tipoTexto=u.tipo==='personalizado'?'💪 Personalizado':'📋 Asesorado';
    return`<div onclick="abrirPerfilCliente('${u.id}')" style="background:var(--card);border:1px solid #222;border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px">
<div style="flex-shrink:0">${avatarHTML(u)}</div>
<div style="flex:1;min-width:0">
  <div style="font-size:15px;font-weight:700;color:var(--texto);margin-bottom:4px">${u.nombre}</div>
  <div style="font-size:11px;color:#666;margin-bottom:6px">🗓️ Día ${u.dia_pago||'-'}</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap">
    <span style="font-size:10px;font-weight:700;color:#888;background:#1a1a1a;border-radius:20px;padding:3px 8px">${tipoTexto}</span>
    <span style="font-size:10px;font-weight:700;color:${epColor};background:${epColor}18;border-radius:20px;padding:3px 8px">${epTexto}</span>
  </div>
</div>
<label class="toggle" onclick="event.stopPropagation()"><input type="checkbox" ${u.activo?'checked':''} onchange="toggleActivo('${u.id}',this.checked)"><span class="slider"></span></label>
</div>`;
  }).join('');
}

async function abrirTests(id,nombre){
  window.clienteTestsId=id;
  document.getElementById("modal-tests-titulo").textContent="🏋️ Tests - "+nombre;
  document.getElementById("modal-tests").classList.add("open");
await renderTests(id);
}
async function abrirModalCliente(){
  if (!entEsPremium()) {
    const eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001');
    const usuarios = await fetch('/api/usuarios?entrenador_id=' + eid).then(r=>r.json()).catch(()=>[]);
    const activos = usuarios.filter(u => u.activo !== false).length;
    if (activos >= 3) {
      mostrarCandadoPremium('Has alcanzado el limite de 3 clientes del Plan Gratis. Activa Premium para clientes ilimitados.');
      return;
    }
  }
document.getElementById('cliente-id').value='';
document.getElementById('cliente-nombre').value='';
document.getElementById('cliente-telefono').value='';
document.getElementById('cliente-pago').value='';
document.getElementById('cliente-pago2').value='';
document.getElementById('cliente-tipo-pago').value='mensual';
document.getElementById('pago2-box').style.display='none';
selEstado('aldia');
document.getElementById('modal-titulo').textContent='➕ Nuevo cliente';
document.getElementById('modal-cliente').classList.add('open');
}

async function editarCliente(id){
const res=await fetch('/api/usuarios/'+id);
const u=await res.json();
document.getElementById('cliente-id').value=u.id;
document.getElementById('cliente-nombre').value=u.nombre;
document.getElementById('cliente-telefono').value=u.telefono;
document.getElementById('cliente-email').value=u.email||'';
document.getElementById('cliente-tipo').value=u.tipo;
document.getElementById('cliente-pago').value=u.dia_pago||'';
document.getElementById('cliente-pago2').value=u.dia_pago2||'';
document.getElementById('cliente-tipo-pago').value=u.tipo_pago||'mensual';
document.getElementById('pago2-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';
document.getElementById('cliente-msg-q1').value=u.msg_q1||'';
document.getElementById('cliente-msg-q2').value=u.msg_q2||'';
document.getElementById('msg-quincena1-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';
document.getElementById('msg-quincena2-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';
selEstado(u.estado_pago||'aldia');
const up=u.perfil||{};
if(document.getElementById('cliente-fnac')) document.getElementById('cliente-fnac').value=up.fecha_nacimiento||'';
if(document.getElementById('cliente-altura')) document.getElementById('cliente-altura').value=up.altura||'';
if(document.getElementById('cliente-sexo')) document.getElementById('cliente-sexo').value=up.sexo||'M';
if(document.getElementById('cliente-objetivo')) document.getElementById('cliente-objetivo').value=up.etiqueta||'perdida';
if(document.getElementById('cliente-notas')) document.getElementById('cliente-notas').value=up.notas||'';
if(document.getElementById('cliente-condiciones')) document.getElementById('cliente-condiciones').value=up.condiciones_medicas||'';
if(document.getElementById('cliente-alimentacion')) document.getElementById('cliente-alimentacion').value=up.preferencias_alimentarias||'';
document.getElementById('modal-titulo').textContent='✏️ Editar cliente';
document.getElementById('modal-cliente').classList.add('open');
}

function cerrarModal(){document.getElementById('modal-cliente').classList.remove('open');}

async function guardarCliente(){
const id=document.getElementById('cliente-id').value;
const datos={
entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null),
nombre:document.getElementById('cliente-nombre').value.trim(),
telefono:document.getElementById('cliente-telefono').value.replace(/\D/g,''),
email:document.getElementById('cliente-email').value.trim(),
tipo:document.getElementById('cliente-tipo').value,
tipo_pago:document.getElementById('cliente-tipo-pago').value,
dia_pago:parseInt(document.getElementById('cliente-pago').value)||null,
dia_pago2:parseInt(document.getElementById('cliente-pago2').value)||null,
estado_pago:document.getElementById('cliente-estado-pago').value,

};
// Manejar destino grupo
if(window._destinoWA==='grupo'){
  const link=document.getElementById('cliente-grupo-link')?document.getElementById('cliente-grupo-link').value.trim():'';
  if(!link){toast('Pega el link del grupo',false);return;}
  const codigo=link.split('/').pop();
  datos.telefono='grupo:'+codigo;
  datos.es_grupo=true;
}
if(!datos.nombre||!datos.telefono){toast('Completa nombre y teléfono',false);return;}
const perfilDatos={
  fecha_nacimiento:document.getElementById('cliente-fnac')?document.getElementById('cliente-fnac').value:'',
  altura:document.getElementById('cliente-altura')?document.getElementById('cliente-altura').value:'',
  sexo:document.getElementById('cliente-sexo')?document.getElementById('cliente-sexo').value:'M',
  etiqueta:document.getElementById('cliente-objetivo')?document.getElementById('cliente-objetivo').value:'',
  notas:document.getElementById('cliente-notas')?document.getElementById('cliente-notas').value.trim():'',
  condiciones_medicas:document.getElementById('cliente-condiciones')?document.getElementById('cliente-condiciones').value.trim():'',
  preferencias_alimentarias:document.getElementById('cliente-alimentacion')?document.getElementById('cliente-alimentacion').value.trim():''
};
if(id){
await fetch('/api/usuarios/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)});
await fetch('/api/usuarios/'+id+'/perfil-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(perfilDatos)});
toast('✅ Cliente actualizado');
}else{
const nuevo=await fetch('/api/usuarios',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)}).then(r=>r.json());
if(nuevo.id) await fetch('/api/usuarios/'+nuevo.id+'/perfil-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(perfilDatos)});
toast('✅ Cliente agregado');
}
cerrarModal();cargarClientes();
}

async function eliminarCliente(id){
if(!confirm('¿Eliminar este cliente?'))return;
await fetch('/api/usuarios/'+id,{method:'DELETE'});
toast('🗑️ Cliente eliminado');cargarClientes();showPage('clientes');
}

async function toggleActivo(id,activo){
await fetch('/api/usuarios/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({activo})});
toast(activo?'✅ Activado':'⏸️ Pausado');cargarClientes();
}


function avatarHTML(u){
  const iniciales = (u.nombre||'?').split(' ').slice(0,2).map(n=>n[0]?n[0].toUpperCase():'').join('') || '?';
  if(u.foto){
    return `<div class="avatar" onclick="cambiarFoto('${u.id}')"><img src="${u.foto}" onerror="this.parentElement.innerHTML='${iniciales}'"></div>`;
  }
  return `<div class="avatar" onclick="cambiarFoto('${u.id}')">${iniciales}</div>`;
}

async function cambiarFoto(id){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
          if(file.size > 5 * 1024 * 1024){ toast('⚠️ Imagen muy grande. Máximo 5MB', false); return; }
    const fd = new FormData();
    fd.append('foto', file);
    const res = await fetch('/api/foto-cliente/'+id, {method:'POST', body:fd});
    const data = await res.json();
    if(data.ok){ toast('✅ Foto actualizada'); cargarClientes(); }
    else toast('❌ Error al subir foto', false);
  };
  input.click();
}



async function cargarRutinasClientes(){
const res=await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001'));
const usuarios=await res.json();
document.getElementById('lista-rutinas-clientes').innerHTML=usuarios.map(u=>`
<div class="card" onclick="abrirRutina('${u.id}','${u.nombre}')" style="cursor:pointer">
<div style="display:flex;align-items:center;gap:12px">
${avatarHTML(u)}
<div style="flex:1"><div style="font-weight:700">${u.nombre}</div>
<div style="font-size:12px;color:#777">Toca para editar rutina</div></div>
<span style="color:#e31e24;font-size:22px">›</span>
</div></div>`).join('');
}

function switchRutinaTab(tab){
  const esEnt = tab === 'entrenamiento';
  document.getElementById('panel-entrenamiento').style.display = esEnt ? 'block' : 'none';
  document.getElementById('panel-alimentacion').style.display = esEnt ? 'none' : 'block';
  document.getElementById('tab-entrenamiento').style.background = esEnt ? 'var(--rojo)' : 'transparent';
  document.getElementById('tab-entrenamiento').style.color = esEnt ? '#fff' : '#666';
  document.getElementById('tab-alimentacion').style.background = esEnt ? 'transparent' : 'var(--rojo)';
  document.getElementById('tab-alimentacion').style.color = esEnt ? '#666' : '#fff';
  document.getElementById('btns-rutina').style.display = esEnt ? 'flex' : 'none';
  if(!esEnt) mostrarRecomendacionesMacros();
}
async function abrirRutina(id,nombre,tabInicial){
window._clienteActual=id;
window.clienteMedidasId=id;
document.getElementById('rutina-cliente-id').value=id;
document.getElementById('rutina-titulo').textContent='📋 '+nombre;
// Si va a abrir alimentación, ocultar entrenamiento antes del render
if(tabInicial==='alimentacion'){
  const pe=document.getElementById('panel-entrenamiento');
  if(pe) pe.style.display='none';
}
const res=await fetch('/api/rutinas/'+id);
rutinaActual=await res.json();
diaSeleccionado='lunes';
renderDiasTabs();renderRutinaForm();
switchRutinaTab(tabInicial||'entrenamiento');
document.getElementById('modal-rutina').classList.add('open');
cargarAlimentacion(id);
}

async function cargarAlimentacion(id){
  try {
    const r = await fetch('/api/alimentacion/'+id);
    if(!r.ok) return;
    const d = await r.json();
    if(!d) return;
    if(d.peso_actual)   document.getElementById('ali-peso-actual').value   = d.peso_actual;
    if(d.peso_objetivo) document.getElementById('ali-peso-objetivo').value = d.peso_objetivo;
    if(d.proteina)      document.getElementById('ali-proteina').value      = d.proteina;
    if(d.carbos)        document.getElementById('ali-carbos').value        = d.carbos;
    if(d.grasas)        document.getElementById('ali-grasas').value        = d.grasas;
    if(d.comidas)       document.getElementById('ali-comidas').value       = d.comidas;
    if(d.pretreno){
      document.getElementById('ali-pretreno-check').checked = true;
      document.getElementById('ali-pretreno-pos').style.display = 'block';
      if(d.pretreno_pos) document.getElementById('ali-pretreno-pos').value = d.pretreno_pos;
    }
    if(d.nivel_eco) selectEco(d.nivel_eco);
    // Cargar objetivo desde perfil del usuario
    try {
      const ru = await fetch('/api/usuarios/' + id);
      const du = await ru.json();
      const etiqueta = du && du.perfil ? du.perfil.etiqueta : '';
      const selObj = document.getElementById('ali-objetivo');
      if(selObj && etiqueta) selObj.value = etiqueta;
    } catch(e) {}
    mostrarRecomendacionesMacros();
    if(d.medico)   d.medico.forEach(item   => { const el = [...document.querySelectorAll('#chips-medico button')].find(b=>b.textContent===item);   if(el) toggleChip(el,'medico',item); });
    if(d.vida)     d.vida.forEach(item     => { const el = [...document.querySelectorAll('#chips-vida button')].find(b=>b.textContent===item);     if(el) toggleChip(el,'vida',item); });
    if(d.alergias) d.alergias.forEach(item => { const el = [...document.querySelectorAll('#chips-alergia button')].find(b=>b.textContent===item); if(el) toggleChip(el,'alergia',item); });
    calcularMacros();
  } catch(e) { console.log('Sin datos de alimentación aún'); }
}

function renderDiasTabs(){
document.getElementById('dias-tabs').innerHTML=DIAS.map(d=>
`<button class="${d===diaSeleccionado?'active':''}" onclick="seleccionarDia('${d}')">${d.charAt(0).toUpperCase()+d.slice(1)}</button>`
).join('');
}

function seleccionarDia(dia){
const rec=document.getElementById('rec-'+diaSeleccionado);
const rut=document.getElementById('rut-'+diaSeleccionado);
if(rec){if(!rutinaActual[diaSeleccionado])rutinaActual[diaSeleccionado]={};rutinaActual[diaSeleccionado].recordatorio=rec.value;if(rut)rutinaActual[diaSeleccionado].rutina=rut.value;}
guardarEjsActuales();diaSeleccionado=dia;renderDiasTabs();renderRutinaForm();
}

function renderRutinaForm(){
const d=rutinaActual[diaSeleccionado]||{recordatorio:'',rutina:'',ejercicios:[]};
const cardios=Array.isArray(d.cardio)&&d.cardio.length>0?d.cardio:[];
setTimeout(()=>{
  if(cardios.length>0){
    const p=document.getElementById('panel-cardio');
    if(p) p.style.display='block';
  }
  renderCardios(cardios);
},50);
const ejs=d.ejercicios||[];
let h='';
ejs.forEach((e,i)=>{h+=`<div id="rut-drag-ej-${i}" draggable="true" ondragstart="rutDragStart(event,${i},'ej')" ondragover="rutDragOver(event,${i},'ej')" ondrop="rutDrop(event,${i},'ej')" ondragend="rutDragEnd(event)" style="background:var(--fondo);border:1px solid #222;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab"><div style="display:flex;gap:6px;margin-bottom:6px"><span ontouchstart="rutTouchStart(event,${i},'ej')" ontouchmove="rutTouchMove(event)" ontouchend="rutTouchEnd(event)" style="color:var(--texto-tenue);font-size:16px;padding:6px 4px;cursor:grab;touch-action:none">☰</span><input type="text" value="${e.nombre||''}" placeholder="Ejercicio" id="ej-${i}-n" style="flex:1;background:var(--card);border:1px solid #333;border-radius:6px;padding:8px;color:var(--texto);font-size:13px;outline:none"><button onclick="eliminarEjercicio(${i})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:6px 10px;cursor:pointer">🗑️</button></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">${[['series','S','4'],['reps','Reps','8-10'],['rir','RIR','1-2'],['desc','DESC','60s'],['var','VAR','V1']].map(([f,label,ph])=>`<div><div style="font-size:9px;color:var(--texto-secundario);text-align:center;margin-bottom:2px">${label}</div><input type="text" id="ej-${i}-${f}" value="${e[f]||''}" placeholder="${ph}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:6px;padding:6px;color:var(--texto);font-size:12px;text-align:center;outline:none"></div>`).join('')}</div></div>`;});
document.getElementById('rutina-form').innerHTML=`<div class="ig"><label>🏷️ Título</label><textarea id="rec-${diaSeleccionado}" placeholder="Escribe el título del dia...">${d.recordatorio||''}</textarea></div><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">📋 Ejercicios</div><div id="lista-ejs">${h}</div><button onclick="agregarEjercicio()" style="width:100%;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar ejercicio</button><div style="margin-top:10px"><button onclick="toggleCardio()" style="width:100%;background:var(--fondo);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer">🏃 Cardio</button><div id="panel-cardio" style="display:none;background:var(--fondo);border:1px solid #222;border-radius:8px;padding:10px;margin-top:6px"><div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:8px">🏃 CARDIO</div><div id="lista-cardio"></div><button onclick="agregarCardio()" style="width:100%;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar momento de cardio</button></div></div><div style="margin-top:10px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700">📝 Notas</div><button id="chip-presencial" onclick="togglePresencial()" style="padding:5px 12px;border-radius:20px;border:1px solid #333;background:${d.presencial?'#e31e24':'#1a1a1a'};color:${d.presencial?'#fff':'#666'};font-size:10px;font-weight:700;cursor:pointer">🏟️ Presencial</button></div><textarea id="rut-${diaSeleccionado}" placeholder="Notas adicionales..." style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;min-height:80px">${d.rutina||''}</textarea></div>`;
}

function guardarEjsActuales(){
const dia=diaSeleccionado;
if(!rutinaActual[dia])rutinaActual[dia]={recordatorio:'',rutina:'',ejercicios:[]};
const recEl=document.getElementById('rec-'+dia);
const rutEl=document.getElementById('rut-'+dia);
if(recEl)rutinaActual[dia].recordatorio=recEl.value;
if(rutEl)rutinaActual[dia].rutina=rutEl.value;
const lista=document.getElementById('lista-ejs');
if(!lista)return;
const n=lista.querySelectorAll('[id$="-n"]').length;
const ejs=[];
for(let i=0;i<n;i++){
ejs.push({
nombre:document.getElementById('ej-'+i+'-n')?.value||'',
series:document.getElementById('ej-'+i+'-series')?.value||'',
reps:document.getElementById('ej-'+i+'-reps')?.value||'',
rir:document.getElementById('ej-'+i+'-rir')?.value||'',
desc:document.getElementById('ej-'+i+'-desc')?.value||'',
var:document.getElementById('ej-'+i+'-var')?.value||''
});
}
rutinaActual[dia].ejercicios=ejs;
  const listaCardio=document.getElementById('lista-cardio');
  if(listaCardio){
    const n=listaCardio.querySelectorAll('[id$="-cm"]').length;
    const cardios=[];
    for(let i=0;i<n;i++){
      cardios.push({
        momento:document.getElementById('c-'+i+'-cm')?.value||'',
        ejercicio:document.getElementById('c-'+i+'-ce')?.value||'',
        tiempo:document.getElementById('c-'+i+'-ct')?.value||'',
        notas:document.getElementById('c-'+i+'-cn')?.value||''
      });
    }
    rutinaActual[dia].cardio=cardios;
  }
}

function agregarEjercicio(){
guardarEjsActuales();
const dia=diaSeleccionado;
if(!rutinaActual[dia].ejercicios)rutinaActual[dia].ejercicios=[];
rutinaActual[dia].ejercicios.push({nombre:'',series:'',reps:'',rir:'',desc:'',var:''});
renderRutinaForm();
}

function eliminarEjercicio(idx){
guardarEjsActuales();
rutinaActual[diaSeleccionado].ejercicios.splice(idx,1);
renderRutinaForm();
}
function toggleCardio(){
  guardarEjsActuales();
  const p=document.getElementById('panel-cardio');
  p.style.display=p.style.display==='none'?'block':'none';
}
function renderCardios(arr){
  const lista=document.getElementById('lista-cardio');
  if(!lista)return;
  lista.innerHTML=arr.map((c,i)=>`<div id="rut-drag-cardio-${i}" draggable="true" ondragstart="rutDragStart(event,${i},'cardio')" ondragover="rutDragOver(event,${i},'cardio')" ondrop="rutDrop(event,${i},'cardio')" ondragend="rutDragEnd(event)" style="background:var(--card);border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span ontouchstart="rutTouchStart(event,${i},'cardio')" ontouchmove="rutTouchMove(event)" ontouchend="rutTouchEnd(event)" style="font-size:16px;color:var(--texto-tenue);cursor:grab;touch-action:none">☰</span><span style="font-size:11px;color:#e31e24;font-weight:700">MOMENTO ${i+1}</span><button onclick="eliminarCardio(${i})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑️</button></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Momento</div><input type="text" id="c-${i}-cm" value="${c.momento||''}" placeholder="Ej: Calentamiento, Final..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Ejercicio</div><input type="text" id="c-${i}-ce" value="${c.ejercicio||''}" placeholder="Ej: Bici, Elíptica..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Tiempo (min)</div><input type="number" id="c-${i}-ct" value="${c.tiempo||''}" placeholder="Ej: 20" style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Notas</div><textarea id="c-${i}-cn" placeholder="Observaciones..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;min-height:55px;box-sizing:border-box">${c.notas||''}</textarea></div></div>`).join('');
}
function agregarCardio(){
  guardarEjsActuales();
  const dia=diaSeleccionado;
  if(!Array.isArray(rutinaActual[dia].cardio)) rutinaActual[dia].cardio=[];
  rutinaActual[dia].cardio.push({momento:'',ejercicio:'',tiempo:'',notas:''});
  renderCardios(rutinaActual[dia].cardio);
  const p=document.getElementById('panel-cardio');
  if(p) p.style.display='block';
}
function eliminarCardio(idx){
  guardarEjsActuales();
  if(Array.isArray(rutinaActual[diaSeleccionado].cardio)){
    rutinaActual[diaSeleccionado].cardio.splice(idx,1);
    renderCardios(rutinaActual[diaSeleccionado].cardio);
  }
}

function cerrarModalRutina(){guardarEjsActuales();document.getElementById('modal-rutina').classList.remove('open');}

function togglePresencial(){
  const dia = diaSeleccionado;
  if(!rutinaActual[dia]) rutinaActual[dia]={recordatorio:'',rutina:'',ejercicios:[]};
  rutinaActual[dia].presencial = !rutinaActual[dia].presencial;
  const chip = document.getElementById('chip-presencial');
  if(chip){
    chip.style.background = rutinaActual[dia].presencial ? '#e31e24' : '#1a1a1a';
    chip.style.color = rutinaActual[dia].presencial ? '#fff' : '#666';
    chip.style.borderColor = rutinaActual[dia].presencial ? '#e31e24' : '#333';
  }
}
async function guardarRutina(){
guardarEjsActuales();
const rec=document.getElementById('rec-'+diaSeleccionado);
const rut=document.getElementById('rut-'+diaSeleccionado);
if(rec)rutinaActual[diaSeleccionado]={...rutinaActual[diaSeleccionado],recordatorio:rec.value,rutina:rut?.value||''};
const id=document.getElementById('rutina-cliente-id').value;
await fetch('/api/rutinas/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rutinaActual)});
toast('✅ Rutina guardada');cerrarModalRutina();
}

async function cargarFestivos(){
const res=await fetch('/api/festivos');
const festivos=await res.json();
document.getElementById('lista-festivos').innerHTML=festivos.length?festivos.map(f=>`
<div class="fi">
<div><div style="font-weight:700">${f.nombre}</div>
<div style="font-size:12px;color:var(--texto-secundario)">${f.fecha}</div></div>
<button class="btn bp" style="padding:6px 12px;font-size:12px" onclick="eliminarFestivo('${f.fecha}')">🗑️</button>
</div>`).join(''):'<p style="color:var(--texto-secundario);text-align:center;padding:20px">No hay festivos</p>';
}

async function agregarFestivo(){
const fecha=document.getElementById('festivo-fecha').value;
const nombre=document.getElementById('festivo-nombre').value.trim();
if(!fecha||!nombre){toast('Completa los campos',false);return;}
await fetch('/api/festivos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fecha,nombre})});
document.getElementById('festivo-fecha').value='';
document.getElementById('festivo-nombre').value='';
toast('✅ Festivo agregado');cargarFestivos();
}

async function eliminarFestivo(fecha){
await fetch('/api/festivos/'+fecha,{method:'DELETE'});
toast('🗑️ Eliminado');cargarFestivos();
}

function showHerramienta(nombre){
  document.getElementById('herramienta-panel').style.display='block';
  document.querySelector('#page-logs .st').style.display='none';
  document.querySelector('#page-logs .st').nextElementSibling.style.display='none';
  const c=document.getElementById('herramienta-contenido');
  if(nombre==='enciclopedia') renderEnciclopedia(c);
  else if(nombre==='cronometros') renderCronometros(c);
  else if(nombre==='temporizadores') renderTemporizadores(c);
  else if(nombre==='hiit') renderHiit(c);
  else if(nombre==='calculadoras') renderCalculadoras(c);
  else if(nombre==='sonidos') renderSonidos(c);
  else if(nombre==='competencias') renderCompetencias(c);
  else if(nombre==='ruleta') renderRuleta(c);
  else if(nombre==='juegos') renderJuegos(c);
  else c.innerHTML='<p style="color:var(--texto-secundario);text-align:center;padding:40px">🚧 Próximamente: '+nombre+'</p>';
}


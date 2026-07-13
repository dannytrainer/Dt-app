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


function navToggleTools(btn){
  const menu=document.getElementById('nav-menu-herramientas');
  if(!menu)return;
  const abierto=menu.style.display==='block';
  navCerrarMenus();
  if(!abierto){
    menu.style.display='block';
    btn.style.color='#e31e24';
  }
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

function navToggleTools(btn){
  const menu=document.getElementById('menu-tools');
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
  const mt=document.getElementById('menu-tools');
  if(mt)mt.style.display='none';
  const btn=document.getElementById('btn-nav-funciones');
  if(btn)btn.style.color='#666';
  const btnT=document.getElementById('btn-nav-tools');
  if(btnT)btnT.style.color='#666';
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
    const usuarios=await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)).then(r=>r.json());
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
    const _eid2=(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id)||null;
    const _hdata=await fetch('/api/horarios?entrenador_id='+_eid2).then(r=>r.json());
    _horariosData={recurrentes:_hdata.recurrentes||[],unicos:_hdata.unicos||[]};
    setTimeout(renderMiniCal, 300);
  }catch(_e){console.error('miniCal',_e);}
}catch(e){console.error('cargarInicio',e);}
}
async function cargarClientes(){
const _ses=JSON.parse(localStorage.getItem('dt_sesion')||'{}');
const _gd=JSON.parse(localStorage.getItem('dt_google_data')||'{}');
let _eid=_ses.id;
if(!_eid){
  const _rol=localStorage.getItem('dt_rol')||'entrenador';
  const _roles=_ses.roles||_gd.roles||[];
  const _re=_roles.find(x=>x.rol===_rol);
  if(_re&&_re.id) _eid=_re.id;
}
if(!_eid && _ses.email){
  try{
    const _r=await fetch('/api/auth/roles?email='+encodeURIComponent(_ses.email)).then(r=>r.json());
    const _re=(_r.roles||[]).find(x=>x.rol==='entrenador');
    if(_re&&_re.id){_eid=_re.id;_ses.id=_eid;localStorage.setItem('dt_sesion',JSON.stringify(_ses));}
  }catch(e){}
}
// Si no hay _eid, usar el ID guardado al entrar a la app
if(!_eid && window._entrenadorId) _eid=window._entrenadorId;
const res=await fetch('/api/usuarios?entrenador_id=' + (_eid||null));
const usuarios=await res.json();
const lista=document.getElementById('lista-clientes');
const empty=document.getElementById('empty-clientes');
if(!usuarios.length){lista.innerHTML='';empty.style.display='block';return;}
empty.style.display='none';
window._usuariosCargados=usuarios;
const _ordenAsc=window._ordenClientesAsc||false;
window._usuariosCargados=usuarios;
const sActivos=usuarios.filter(u=>u.activo).length;
const sPersonalizados=usuarios.filter(u=>u.activo&&u.tipo==='personalizado').length;
const sAsesorados=usuarios.filter(u=>u.activo&&u.tipo==='asesorado').length;
const sPausados=usuarios.filter(u=>!u.activo).length;
const sProximo=usuarios.filter(u=>u.activo&&u.estado_pago==='proximo').length;
const sVencido=usuarios.filter(u=>u.activo&&u.estado_pago==='vencido').length;
const chipsDefs=[
  {id:'todos',label:'Todos',n:usuarios.length},
  {id:'activos',label:'🟢 Activos',n:sActivos},
  {id:'pausados',label:'⏸️ Pausados',n:sPausados},
  {id:'personalizado',label:'💪 Personaliz.',n:sPersonalizados},
  {id:'asesorado',label:'📋 Asesorados',n:sAsesorados},
  {id:'proximo',label:'⚠️ Próximo',n:sProximo},
  {id:'vencido',label:'🔴 Vencido',n:sVencido}
];
const chipSel=window._chipClienteSel||'todos';
const chipsEl=document.getElementById('chips-clientes');
if(chipsEl){
  chipsEl.innerHTML=chipsDefs.map(c=>`<div onclick="filtrarClientesPorChip('${c.id}')" style="display:inline-block;font-size:11px;font-weight:700;padding:6px 12px;border-radius:20px;cursor:pointer;${chipSel===c.id?'background:#e31e24;color:#fff':'background:var(--card);color:var(--texto-medio);border:1px solid #333'}">${c.label} ${c.n}</div>`).join('');
}
function _cumpleChip(u){
  if(chipSel==='todos') return true;
  if(chipSel==='activos') return !!u.activo;
  if(chipSel==='pausados') return !u.activo;
  if(chipSel==='personalizado') return u.activo&&u.tipo==='personalizado';
  if(chipSel==='asesorado') return u.activo&&u.tipo==='asesorado';
  if(chipSel==='proximo') return u.activo&&u.estado_pago==='proximo';
  if(chipSel==='vencido') return u.activo&&u.estado_pago==='vencido';
  return true;
}
usuarios.sort((a,b)=>{
  const pa=_cumpleChip(a)?0:1;
  const pb=_cumpleChip(b)?0:1;
  if(pa!==pb) return pa-pb;
  const ta=a.fecha_registro?new Date(a.fecha_registro).getTime():0;
  const tb=b.fecha_registro?new Date(b.fecha_registro).getTime():0;
  return _ordenAsc?(ta-tb):(tb-ta);
});
lista.innerHTML=usuarios.map(u=>{
const ep=u.estado_pago||'aldia';
const epColor=ep==='vencido'?'#e31e24':ep==='proximo'?'#ff9800':'#4caf50';
const epTexto=ep==='vencido'?'🔴 Vencido':ep==='proximo'?'⚠️ Próximo pago':'✅ Al día';
const tipoTexto=u.tipo==='personalizado'?'💪 Personalizado':'📋 Asesorado';
return`<div onclick="abrirPerfilCliente('${u.id}')" data-search="${dtClienteTextoBusqueda(u).replace(/"/g,'&quot;')}" style="background:var(--card);border:1px solid #222;border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px">
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
    <button id="ptab-medidas" onclick="perfilTab('medidas')" style="flex:1;background:none;border:none;color:#666;font-size:11px;font-weight:700;padding:8px 4px;cursor:pointer;white-space:nowrap">📈 Seguimiento</button>
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

  ['datos','medidas','rutina'].forEach(t=>{
    const b=document.getElementById('ptab-'+t);
    if(b){b.style.background=t===tab?'#e31e24':'none';b.style.color=t===tab?'#fff':'#666';}
  });
  const u=window._perfilClienteActual;
  if(!u)return;
  ['modal-cliente','modal-medidas','modal-rutina'].forEach(id=>{
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
  } else if(tab==='rutina'){
    _abrirConModo('modal-rutina',()=>abrirRutina(u.id,u.nombre));
  }
}

async function showMedidasSubTab(sub, id){
  window._medidasSubTab = sub;

  ['peso','perimetros','tests'].forEach(s=>{
    const b=document.getElementById('medsub-'+s);
    if(b){
      b.className = 'btn ' + (s===sub ? 'br' : 'bg');
    }
  });

  const secPeso=document.getElementById('msec-peso');
  const secPerimetros=document.getElementById('msec-medidas');
  const secTests=document.getElementById('msec-tests-wrap');
  if(secPeso) secPeso.style.display = (sub==='peso') ? '' : 'none';
  if(secPerimetros) secPerimetros.style.display = (sub==='perimetros') ? '' : 'none';
  if(secTests) secTests.style.display = (sub==='tests') ? '' : 'none';

  const u=window._perfilClienteActual;
  const nombre = u ? u.nombre : '';

  if(sub==='peso'){
    await showMTabLoad('peso', id);
  } else if(sub==='perimetros'){
    await showMTabLoad('medidas', id);
  } else if(sub==='tests'){
    await abrirTestsYSubirInterno(id, nombre);
  }
}

async function abrirTestsYSubirInterno(id, nombre){
  _ultimoClienteId=id;
  _reordenarLista();
  await abrirTests(id,nombre);
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
    return`<div onclick="abrirPerfilCliente('${u.id}')" data-search="${dtClienteTextoBusqueda(u).replace(/"/g,'&quot;')}" style="background:var(--card);border:1px solid #222;border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px">
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
  await renderTests(id);
}
async function abrirModalCliente(){
  if (!entEsPremium()) {
    const eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null);
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
if(document.getElementById('cliente-cedula')) document.getElementById('cliente-cedula').value='';
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
if(document.getElementById('cliente-cedula')) document.getElementById('cliente-cedula').value=u.cedula||'';
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
if(document.getElementById('cliente-nivel-entrenamiento')) document.getElementById('cliente-nivel-entrenamiento').value=up.nivel_entrenamiento||'';
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
cedula:document.getElementById('cliente-cedula')?document.getElementById('cliente-cedula').value.trim():'',
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
  nivel_entrenamiento:document.getElementById('cliente-nivel-entrenamiento')?document.getElementById('cliente-nivel-entrenamiento').value:'',
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
const res=await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null));
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
renderDiasTabs();renderRutinaForm();renderMoverDia();
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

function _dtOrdenDefault(d){
  const nEj=(d.ejercicios||[]).length;
  const nCar=(d.cardio||[]).length;
  const orden=[];
  for(let i=0;i<nEj;i++)orden.push('ej'+i);
  for(let i=0;i<nCar;i++)orden.push('cardio'+i);
  return orden;
}
function _dtObtenerOrden(d){
  const nEj=(d.ejercicios||[]).length;
  const nCar=(d.cardio||[]).length;
  if(Array.isArray(d.orden)&&d.orden.length===nEj+nCar)return d.orden;
  return _dtOrdenDefault(d);
}
function renderRutinaForm(){
const d=rutinaActual[diaSeleccionado]||{recordatorio:'',rutina:'',ejercicios:[]};
const ejs=d.ejercicios||[];
const cardios=d.cardio||[];
const orden=_dtObtenerOrden(d);
let h='';
orden.forEach((token)=>{
  const tipo=token.replace(/[0-9]+$/,'');
  const idx=parseInt(token.replace(/^[a-z]+/,''),10);
  if(tipo==='ej'){
    const e=ejs[idx];
    if(!e)return;
    h+=`<div id="rut-drag-ej-${idx}" data-tipo="ej" data-idx="${idx}" draggable="true" ondragstart="rutDragStart(event,${idx},'ej')" ondragover="rutDragOver(event,${idx},'ej')" ondrop="rutDrop(event,${idx},'ej')" ondragend="rutDragEnd(event)" style="background:var(--fondo);border:1px solid #222;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab"><div style="display:flex;gap:6px;margin-bottom:6px"><span ontouchstart="rutTouchStart(event,${idx},'ej')" ontouchmove="rutTouchMove(event)" ontouchend="rutTouchEnd(event)" style="color:var(--texto-tenue);font-size:16px;padding:6px 4px;cursor:grab;touch-action:none">☰</span><div style="flex:1;position:relative"><input type="text" value="${e.nombre||''}" placeholder="Ejercicio" id="ej-${idx}-n" oninput="entAutoComplete(this,${idx})" style="width:100%;background:var(--card);border:1px solid #333;border-radius:6px;padding:8px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"><div id="enc-suggest-${idx}" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--fondo);border:1px solid #444;border-radius:0 0 8px 8px;z-index:9999;max-height:200px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,0.4)"></div></div><button onclick="entVerEjercicio(${idx})" style="background:#111;color:#ccc;border:1px solid #333;border-radius:6px;padding:6px 8px;cursor:pointer;font-size:13px">👁️</button><button onclick="eliminarEjercicio(${idx})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:6px 10px;cursor:pointer">🗑️</button></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">${[['series','S','4'],['reps','Reps','8-10'],['rir','RIR','1-2'],['desc','DESC','60s'],['var','VAR','V1']].map(([f,label,ph])=>`<div><div style="font-size:9px;color:var(--texto-secundario);text-align:center;margin-bottom:2px">${label}</div><input type="text" id="ej-${idx}-${f}" value="${e[f]||''}" placeholder="${ph}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:6px;padding:6px;color:var(--texto);font-size:12px;text-align:center;outline:none"></div>`).join('')}</div></div>`;
  } else {
    const c=cardios[idx];
    if(!c)return;
    h+=`<div id="rut-drag-cardio-${idx}" data-tipo="cardio" data-idx="${idx}" draggable="true" ondragstart="rutDragStart(event,${idx},'cardio')" ondragover="rutDragOver(event,${idx},'cardio')" ondrop="rutDrop(event,${idx},'cardio')" ondragend="rutDragEnd(event)" style="background:var(--card);border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span ontouchstart="rutTouchStart(event,${idx},'cardio')" ontouchmove="rutTouchMove(event)" ontouchend="rutTouchEnd(event)" style="font-size:16px;color:var(--texto-tenue);cursor:grab;touch-action:none">☰</span><span style="font-size:11px;color:#e31e24;font-weight:700">🏃 CARDIO</span><button onclick="eliminarCardio(${idx})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑️</button></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Momento</div><input type="text" id="c-${idx}-cm" value="${c.momento||''}" placeholder="Ej: Calentamiento, Final..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Ejercicio</div><input type="text" id="c-${idx}-ce" value="${c.ejercicio||''}" placeholder="Ej: Bici, Elíptica..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Tiempo (min)</div><input type="number" id="c-${idx}-ct" value="${c.tiempo||''}" placeholder="Ej: 20" style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Notas</div><textarea id="c-${idx}-cn" placeholder="Observaciones..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;min-height:55px;box-sizing:border-box">${c.notas||''}</textarea></div></div>`;
  }
});
document.getElementById('rutina-form').innerHTML=`<div class="ig"><label>🏷️ Título</label><textarea id="rec-${diaSeleccionado}" placeholder="Escribe el título del dia...">${d.recordatorio||''}</textarea></div><div style="margin-top:8px"><label style="font-size:10px;color:var(--texto-secundario);text-transform:uppercase;letter-spacing:1px;font-weight:700">⏱️ Tiempo máximo</label><select id="tmax-${diaSeleccionado}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:13px;outline:none;margin-top:4px"><option value="0" ${!d.tiempo_max_min?'selected':''}>Sin límite</option><option value="30" ${d.tiempo_max_min==30?'selected':''}>30 min</option><option value="45" ${d.tiempo_max_min==45?'selected':''}>45 min</option><option value="60" ${d.tiempo_max_min==60?'selected':''}>1 hora</option><option value="90" ${d.tiempo_max_min==90?'selected':''}>1h 30</option><option value="120" ${d.tiempo_max_min==120?'selected':''}>2 horas</option><option value="150" ${d.tiempo_max_min==150?'selected':''}>2h 30</option></select></div><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">📋 Elementos</div><div id="lista-ejs">${h}</div><div id="selector-tipo-elemento" style="display:none;gap:8px;margin-top:6px"><button onclick="agregarElemento('ej')" style="flex:1;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer">💪 Fuerza</button><button onclick="agregarElemento('cardio')" style="flex:1;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer">🏃 Cardio</button></div><button id="btn-agregar-elemento" onclick="mostrarSelectorElemento()" style="width:100%;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar elemento</button><div style="margin-top:10px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700">📝 Notas</div><button id="chip-presencial" onclick="togglePresencial()" style="padding:5px 12px;border-radius:20px;border:1px solid #333;background:${d.presencial?'#e31e24':'#1a1a1a'};color:${d.presencial?'#fff':'#666'};font-size:10px;font-weight:700;cursor:pointer">🏟️ Presencial</button></div><textarea id="rut-${diaSeleccionado}" placeholder="Notas adicionales..." style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;min-height:80px">${d.rutina||''}</textarea></div>`;
}

function mostrarSelectorElemento(){
  const sel=document.getElementById('selector-tipo-elemento');
  const btn=document.getElementById('btn-agregar-elemento');
  if(sel){sel.style.display='flex';}
  if(btn){btn.style.display='none';}
}

function guardarEjsActuales(){
const dia=diaSeleccionado;
if(!rutinaActual[dia])rutinaActual[dia]={recordatorio:'',rutina:'',ejercicios:[]};
const recEl=document.getElementById('rec-'+dia);
const rutEl=document.getElementById('rut-'+dia);
if(recEl)rutinaActual[dia].recordatorio=recEl.value;
if(rutEl)rutinaActual[dia].rutina=rutEl.value;
const tmaxEl=document.getElementById('tmax-'+dia);
if(tmaxEl)rutinaActual[dia].tiempo_max_min=parseInt(tmaxEl.value)||0;
const lista=document.getElementById('lista-ejs');
if(!lista)return;
const nEj=lista.querySelectorAll('[id$="-n"]').length;
const ejs=[];
for(let i=0;i<nEj;i++){
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
const nCar=lista.querySelectorAll('[id$="-cm"]').length;
const cardios=[];
for(let i=0;i<nCar;i++){
cardios.push({
momento:document.getElementById('c-'+i+'-cm')?.value||'',
ejercicio:document.getElementById('c-'+i+'-ce')?.value||'',
tiempo:document.getElementById('c-'+i+'-ct')?.value||'',
notas:document.getElementById('c-'+i+'-cn')?.value||''
});
}
rutinaActual[dia].cardio=cardios;
const orden=[];
lista.querySelectorAll('[data-tipo]').forEach(function(el){
orden.push(el.getAttribute('data-tipo')+el.getAttribute('data-idx'));
});
if(orden.length===ejs.length+cardios.length){
rutinaActual[dia].orden=orden;
}
}

function agregarElemento(tipo){
guardarEjsActuales();
const dia=diaSeleccionado;
if(!rutinaActual[dia].ejercicios)rutinaActual[dia].ejercicios=[];
if(!Array.isArray(rutinaActual[dia].cardio))rutinaActual[dia].cardio=[];
if(!Array.isArray(rutinaActual[dia].orden))rutinaActual[dia].orden=_dtObtenerOrden(rutinaActual[dia]);
let nuevoToken;
if(tipo==='ej'){
rutinaActual[dia].ejercicios.push({nombre:'',series:'',reps:'',rir:'',desc:'',var:''});
nuevoToken='ej'+(rutinaActual[dia].ejercicios.length-1);
} else {
rutinaActual[dia].cardio.push({momento:'',ejercicio:'',tiempo:'',notas:''});
nuevoToken='cardio'+(rutinaActual[dia].cardio.length-1);
}
rutinaActual[dia].orden.push(nuevoToken);
const sel=document.getElementById('selector-tipo-elemento');
const btn=document.getElementById('btn-agregar-elemento');
if(sel)sel.style.display='none';
if(btn)btn.style.display='block';
renderRutinaForm();
}

function eliminarEjercicio(idx){
guardarEjsActuales();
const dia=diaSeleccionado;
rutinaActual[dia].ejercicios.splice(idx,1);
if(!Array.isArray(rutinaActual[dia].orden))rutinaActual[dia].orden=_dtObtenerOrden(rutinaActual[dia]);
rutinaActual[dia].orden=rutinaActual[dia].orden
.filter(function(t){return t!==('ej'+idx);})
.map(function(t){
if(t.charAt(0)==='e'){
const n=parseInt(t.replace(/^[a-z]+/,''),10);
if(n>idx)return 'ej'+(n-1);
}
return t;
});
renderRutinaForm();
}

function eliminarCardio(idx){
guardarEjsActuales();
const dia=diaSeleccionado;
if(Array.isArray(rutinaActual[dia].cardio)){
rutinaActual[dia].cardio.splice(idx,1);
if(!Array.isArray(rutinaActual[dia].orden))rutinaActual[dia].orden=_dtObtenerOrden(rutinaActual[dia]);
rutinaActual[dia].orden=rutinaActual[dia].orden
.filter(function(t){return t!==('cardio'+idx);})
.map(function(t){
if(t.indexOf('cardio')===0){
const n=parseInt(t.replace(/^[a-z]+/,''),10);
if(n>idx)return 'cardio'+(n-1);
}
return t;
});
renderRutinaForm();
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


function showHerramientaNav(nombre){
  showPage('logs');
  setTimeout(()=>{
    const panel=document.getElementById('herramienta-panel');
    if(panel)panel.style.display='block';
    showHerramienta(nombre);
  },300);
}

function showHerramienta(nombre){
  document.getElementById('herramienta-panel').style.display='block';
  const st=document.querySelector('#page-logs .st');
  if(st){st.style.display='none';if(st.nextElementSibling)st.nextElementSibling.style.display='none';}
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



// ── AUTOCOMPLETE EJERCICIOS ─────────────────────────────
function encNombreLimpio(nombre) {
  return nombre.replace(/^[A-Z]\d+\s+/i, '').trim();
}

function entAutoComplete(input, i) {
  const q = input.value.trim().toLowerCase();
  const cont = document.getElementById('enc-suggest-' + i);
  if (!cont) return;
  if (q.length < 2) { cont.style.display = 'none'; return; }
  const lista = window._encEjercicios || [];
  if (!lista.length) {
    fetch('/api/enciclopedia').then(function(r){return r.json();}).then(function(data){
      if (Array.isArray(data)) { window._encEjercicios = data; entAutoComplete(input, i); }
    });
    return;
  }
  const matches = lista.filter(function(e) {
    const limpio = encNombreLimpio(e.nombre).toLowerCase();
    const completo = e.nombre.toLowerCase();
    return limpio.includes(q) || completo.includes(q);
  }).slice(0, 6);
  if (matches.length === 0) { cont.style.display = 'none'; return; }
  cont.innerHTML = matches.map(function(e) {
    const limpio = encNombreLimpio(e.nombre);
    return '<div onclick="entSeleccionarEj(' + i + ',\'' + limpio.replace(/'/g,"\\'") + '\')" style="padding:10px 14px;border-bottom:1px solid #333;cursor:pointer;font-size:13px;color:var(--texto)">' + limpio + '</div>';
  }).join('');
  cont.style.display = 'block';
}

function entSeleccionarEj(i, nombre) {
  const inp = document.getElementById('ej-' + i + '-n');
  if (inp) inp.value = nombre;
  const cont = document.getElementById('enc-suggest-' + i);
  if (cont) cont.style.display = 'none';
}

function entVerEjercicio(i) {
  const inp = document.getElementById('ej-' + i + '-n');
  if (!inp || !inp.value.trim()) { alert('Escribe el nombre del ejercicio primero'); return; }
  fetch('/api/enciclopedia/buscar-match/' + encodeURIComponent(inp.value.trim()))
    .then(function(r){ return r.json(); })
    .then(function(res) {
      if (res.encontrado) {
        const ej = res.ejercicio;
        const cargar = function() {
          const cont = document.getElementById('modal-enc-ficha-contenido');
          if (!cont) return;
          window._encEjercicios = window._encEjercicios || [];
          if (!window._encEjercicios.find(function(x){ return x.id === ej.id; })) {
            window._encEjercicios.push(ej);
          }
          window._encGrupos = window._encGrupos || [];
          cont.innerHTML = '';
          var modal = document.getElementById('modal-enc-ficha');
          modal.classList.add('open');
          encAbrirFichaModal(ej.id);
        };
        cargar();
      } else {
        alert('No se encontró ejercicio para: ' + inp.value.trim());
      }
    })
    .catch(function(){ alert('Error al buscar ejercicio'); });
}

function encAbrirFichaModal(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;
  var cont = document.getElementById('modal-enc-ficha-contenido');
  if (!cont) return;
  var gr = (window._encGrupos||[]).find(function(g){return g.id===e.grupo;});
  var nc = e.nivel==='principiante'?'#64b5f6':e.nivel==='avanzado'?'#e31e24':'#4caf50';
  var nb = e.nivel==='principiante'?'#1a2a3a':e.nivel==='avanzado'?'#3a1a1a':'#1a3a1a';
  var html = '';
  if (e.video_youtube) {
    html += '<div style="position:relative;width:100%;padding-bottom:56.25%;margin-bottom:12px;border-radius:10px;overflow:hidden"><iframe src="' + e.video_youtube + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>';
  } else if (e.imagen_inicio || e.imagen_fin || e.imagen) {
    var img1 = e.imagen_inicio || e.imagen || '';
    var img2 = e.imagen_fin || e.imagen2 || e.imagen_inicio || e.imagen || '';
    var filtro = (e.invertir === false || e.grupo === 'estiramientos') ? 'none' : 'invert(1)';
    html += '<div style="background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:12px;text-align:center;padding:16px;position:relative">';
    html += '<img id="enc-modal-anim-img" src="' + img1 + '" style="max-width:100%;height:280px;width:auto;object-fit:contain;filter:' + filtro + '" data-img1="' + img1 + '" data-img2="' + img2 + '">';
    html += '<div style="position:absolute;bottom:6px;right:8px;font-size:10px;color:#e31e24;font-weight:700;opacity:0.7">DT-APP</div></div>';
    if (img1 !== img2) {
      setTimeout(function() {
        var img = document.getElementById('enc-modal-anim-img');
        if (!img) return;
        var toggle = false;
        setInterval(function() {
          if (!document.getElementById('enc-modal-anim-img')) return;
          toggle = !toggle;
          img.src = toggle ? img.dataset.img2 : img.dataset.img1;
        }, 1500);
      }, 100);
    }
  }
  html += '<div style="margin-bottom:14px">';
  html += '<div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">' + (gr?gr.icon+' ':'') + e.grupo + (e.subgrupo?' - '+e.subgrupo:'') + '</div>';
  html += '<div style="font-size:22px;font-weight:900;color:#fff;text-transform:uppercase;line-height:1.1;margin-bottom:8px">' + e.nombre + '</div>';
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  if (e.nivel) html += '<span style="padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;background:' + nb + ';color:' + nc + '">' + e.nivel + '</span>';
  if (e.equipamiento) html += '<span style="padding:3px 8px;border-radius:4px;font-size:11px;background:#1e1e1e;color:var(--texto-medio);border:1px solid #333">' + e.equipamiento + '</span>';
  html += '</div></div>';
  if ((e.musculos_principales||[]).length > 0 || (e.musculos_secundarios||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Musculos</div><div style="display:flex;flex-wrap:wrap;gap:6px">';
    (e.musculos_principales||[]).forEach(function(m){html += '<span style="padding:4px 10px;border-radius:6px;font-size:12px;background:rgba(227,30,36,0.15);border:1px solid rgba(227,30,36,0.4);color:#ff6b6b">&#11088; ' + m + '</span>';});
    (e.musculos_secundarios||[]).forEach(function(m){html += '<span style="padding:4px 10px;border-radius:6px;font-size:12px;background:var(--gris);border:1px solid var(--borde);color:var(--texto-suave)">' + m + '</span>';});
    html += '</div></div>';
  }
  if ((e.ejecucion||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Ejecucion</div>';
    e.ejecucion.forEach(function(paso,i){
      html += '<div style="display:flex;gap:10px;margin-bottom:10px"><div style="width:24px;height:24px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">' + (i+1) + '</div><div style="font-size:13px;color:var(--texto-suave);line-height:1.5">' + paso + '</div></div>';
    });
    html += '</div>';
  }
  if ((e.errores_comunes||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Errores comunes</div>';
    e.errores_comunes.forEach(function(err){
      html += '<div style="display:flex;gap:8px;margin-bottom:8px"><span style="color:#ffab40;font-size:14px;flex-shrink:0">&#9888;</span><div style="font-size:13px;color:var(--texto-suave);line-height:1.5">' + err + '</div></div>';
    });
    html += '</div>';
  }
  if ((e.variantes||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Variantes</div><div style="display:flex;gap:8px;flex-wrap:wrap">';
    e.variantes.forEach(function(v){
      var ve = (window._encEjercicios||[]).find(function(x){return x.id===v;});
      html += '<div style="padding:6px 12px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;font-size:12px;color:#fff">' + (ve?ve.nombre:v) + '</div>';
    });
    html += '</div></div>';
  }
  cont.innerHTML = html;
}


function renderMoverDia(){
  const panel = document.getElementById('mover-dia-panel');
  if(!panel) return;
  const opciones = DIAS.map(d=>`<option value="${d}">${d.charAt(0).toUpperCase()+d.slice(1)}</option>`).join('');
  panel.innerHTML = `<button onclick="toggleMoverDia()" style="width:100%;text-align:left;background:var(--card);color:var(--texto-secundario);border:1px solid #2a2a2a;border-radius:8px;font-size:11px;padding:8px 10px;cursor:pointer">🔄 Mover contenido entre días</button>
  <div id="mover-dia-contenido" style="display:none;gap:6px;align-items:center;background:var(--card);border:1px solid #2a2a2a;border-radius:8px;padding:8px;margin-top:4px">
    <select id="mover-dia-origen" style="flex:1;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:6px;color:var(--texto);font-size:12px">${opciones}</select>
    <span style="font-size:11px;color:var(--texto-secundario);margin:0 4px">↔</span>
    <select id="mover-dia-destino" style="flex:1;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:6px;color:var(--texto);font-size:12px">${opciones}</select>
    <button onclick="intercambiarContenidoDias()" style="background:var(--rojo);color:#fff;border:none;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;margin-left:6px">Intercambiar</button>
  </div>`;
}

function toggleMoverDia(){
  const c = document.getElementById('mover-dia-contenido');
  if(!c) return;
  c.style.display = (c.style.display === 'none') ? 'flex' : 'none';
}

function intercambiarContenidoDias(){
  const diaA = document.getElementById('mover-dia-origen').value;
  const diaB = document.getElementById('mover-dia-destino').value;
  if(diaA === diaB){ toast('⚠️ Elegí dos días distintos', false); return; }
  const temp = rutinaActual[diaA] || {recordatorio:'',rutina:'',ejercicios:[]};
  rutinaActual[diaA] = rutinaActual[diaB] || {recordatorio:'',rutina:'',ejercicios:[]};
  rutinaActual[diaB] = temp;
  diaSeleccionado = diaB;
  renderDiasTabs();
  renderRutinaForm();
  toast('✅ Contenido intercambiado entre ' + diaA + ' y ' + diaB, true);
}

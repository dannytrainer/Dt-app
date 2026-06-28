// ═══════════════════════════════
// GOOGLE AUTH FLOW
// ═══════════════════════════════
// ═══════════════════════════════
function checkGoogleLogin() {
  // Si ya tiene sesión activa, entrar directo
  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  const rol = localStorage.getItem('dt_rol');
  if (sesion.email && rol) {
    if (sesion.id && sesion.rol) {
      if(sesion.rol==='entrenador') mostrarApp();
      else mostrarTerminalCliente(sesion.usuario_id||sesion.id);
      return true;
    }
    // Sesión sin roles — buscarlos
    
    fetch('/api/auth/roles?email=' + encodeURIComponent(sesion.email))
      .then(r=>r.json()).then(d => {
        d.nombre = d.nombre || sesion.nombre || sesion.email;
        const s = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
        s.roles = d.roles;
        const _re = d.roles.find(r => r.rol === localStorage.getItem('dt_rol'));
        if(_re) s.id = _re.id || s.id;
        if(_re) s.nombre = _re.nombre || s.nombre;
        localStorage.setItem('dt_sesion', JSON.stringify(s));
        setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
        mostrarSeleccionRol(d);
      }).catch(() => {
        if (rol === 'entrenador') mostrarApp();
      });
    return true;
    if (rol === 'entrenador') { mostrarApp(); return true; }
    if (rol === 'cliente') {
      const id = localStorage.getItem('dt_cliente_id') || sesion.usuario_id;
      if (id) {
        const tc = document.getElementById('terminal-cliente-app');
        if (tc && tc.style.display === 'flex') return true;
        mostrarTerminalCliente(id); return true;
      }
    }
  }
  // Si viene de Google login reciente
  const data = localStorage.getItem('dt_google_data');
  if (!data) return false;
  const d = JSON.parse(data);
  mostrarSeleccionRol(d);
  return true;
}

function mostrarSeleccionRol(d) {
  const nb = document.getElementById("nav-bottom"); if(nb) nb.style.display="none";
  const panel = document.getElementById('pantalla-seleccion-rol');
  if (!panel) return;
  // Ocultar todo lo demás
  ['pantalla-rol','pantalla-login-entrenador','pantalla-login-cliente','app-entrenador','terminal-cliente-app'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('sel-bienvenida').textContent = '¡Hola, ' + (d.nombre || 'Usuario') + '!';
  const cont = document.getElementById('sel-botones');
  cont.innerHTML = '';
  // Último rol usado — entrar directo si ya existe
  const ultimoRol = localStorage.getItem('dt_ultimo_rol');
  if (ultimoRol && !d._skipAutoRol) {
    const rolAuto = d.roles.find(r => r.rol === ultimoRol);
    if (rolAuto) {
      seleccionarRolGoogle(Object.assign({}, rolAuto, {email: d.email, nombre: d.nombre}));
      return;
    }
  }
  d.roles.forEach(r => {
    const btn = document.createElement('button');
    const esUltimo = ultimoRol === r.rol;
    btn.style.cssText = 'width:100%;background:' + (r.rol==='entrenador'?'linear-gradient(135deg,#e31e24,#a01018)':'linear-gradient(135deg,#1a1a1a,#111)') + ';border:2px solid ' + (esUltimo?'#e31e24':'#2a2a2a') + ';border-radius:16px;color:#fff;font-size:15px;font-weight:700;padding:18px 16px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(0,0,0,0.3)';
    btn.innerHTML = (r.rol==='entrenador' ? '🏋️ <div><div style="font-size:15px">Entrenador</div><div style="font-size:11px;opacity:0.7;font-weight:400">Panel de gestión</div></div>' : '👤 <div><div style="font-size:15px">Cliente</div><div style="font-size:11px;opacity:0.7;font-weight:400">Mi entrenamiento</div></div>');
    if (esUltimo) btn.innerHTML += '<span style="margin-left:auto;font-size:10px;opacity:0.7">último usado</span>';
    btn.onclick = function(){ seleccionarRolGoogle(Object.assign({}, r, {email: d.email, nombre: d.nombre})); };
    cont.appendChild(btn);
  });
  panel.style.display = 'flex';
}

async function seleccionarRolGoogle(r) {
  const googleData = JSON.parse(localStorage.getItem('dt_google_data') || '{}');
  const sesionActual = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  const data = Object.assign({}, googleData);
  // Si googleData vacío, usar sesionActual o r
  if(!data.roles && sesionActual.roles) data.roles = sesionActual.roles;
  if(!data.roles && r.roles) data.roles = r.roles;
  if(!data.email && sesionActual.email) data.email = sesionActual.email;
  if(!data.email && r.email) data.email = r.email;
  if(!data.nombre && sesionActual.nombre) data.nombre = sesionActual.nombre;
  if(!data.nombre && r.nombre) data.nombre = r.nombre;
  let rolData = r;
  // Si es usuario nuevo o no tiene ese rol, crearlo en el backend
  if (!r.id) {
    try {
      const res = await fetch('/api/auth/crear-perfil', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: data.email, nombre: data.nombre, rol: r.rol })
      });
      const d = await res.json();
      if (d.ok) rolData = d;
    } catch(e) { console.error('Error creando perfil:', e); }
  }
  const _idFinal = rolData.id || (data.roles||[]).find(x=>x.rol===rolData.rol)?.id || r.id || (r.roles||[]).find(x=>x.rol===rolData.rol)?.id;
localStorage.setItem('dt_sesion', JSON.stringify({ok:true, rol:rolData.rol, id:_idFinal, email:data.email||r.email||'', nombre:rolData.nombre||data.nombre, usuario_id:rolData.usuario_id||_idFinal, roles:(data.roles&&data.roles.length?data.roles:(r.roles||[]))}));
  setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
  localStorage.setItem('dt_rol', rolData.rol);
  localStorage.setItem('dt_ultimo_rol', rolData.rol);
  if (rolData.rol === 'cliente') localStorage.setItem('dt_cliente_id', rolData.usuario_id || rolData.id);
  localStorage.removeItem('dt_google_data');
  const panel = document.getElementById('pantalla-seleccion-rol');
  if (panel) panel.style.display = 'none';
  window._tcCargando = false;
  if (rolData.rol === 'entrenador') mostrarApp();
  else mostrarTerminalCliente(rolData.usuario_id || rolData.id);
}

function cerrarSesionGoogle() {
  // Salir → volver a selección de rol (no cerrar sesión Google)
  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  const email = sesion.email;
  const nombre = sesion.nombre;
  ['dt_rol','dt_ultimo_rol','dt_cliente_id','dt_cliente_tel'].forEach(k => localStorage.removeItem(k));
  const _s=JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  delete _s.rol;
  localStorage.setItem('dt_sesion',JSON.stringify(_s));
  if(email) fetch('/api/auth/roles?email='+encodeURIComponent(email)).then(r=>r.json()).then(d=>{
    d.nombre=d.nombre||nombre;
    d._skipAutoRol=true;
    localStorage.setItem('dt_google_data',JSON.stringify(d));
    mostrarSeleccionRol(d);
  }).catch(()=>location.reload());
  else location.reload();

}
function cambiarRol() {
  // Ocultar terminales
  ['app-entrenador','tc-main','terminal-cliente'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  // Si tiene roles en sesion, usarlos directamente
  if (sesion.roles && sesion.roles.length > 1) {
    mostrarSeleccionRol({nombre: sesion.nombre, email: sesion.email||'', roles: sesion.roles});
    return;
  }
  // Si tiene email, buscar en backend
  if (sesion.email) {
    fetch('/api/auth/roles?email=' + encodeURIComponent(sesion.email))
      .then(r => r.json())
      .then(d => {
        if (d.roles && d.roles.length > 0) {
          mostrarSeleccionRol(d);
        } else {
          mostrarPantalla('pantalla-rol');
        }
      }).catch(() => mostrarPantalla('pantalla-rol'));
    return;
  }
  mostrarPantalla('pantalla-rol');
}

async function tcVincularEntrenador() {
  var codigo = document.getElementById('tc-vinc-codigo');
  var st = document.getElementById('tc-vinc-status');
  if (!codigo) { toast('⚠️ No se encontró el campo de código',false); return; }
  var cod = codigo.value.trim().toUpperCase();
  if (!cod) { st.style.color='#e31e24'; st.textContent='Ingresá el código del entrenador'; return; }
  st.style.color='#aaa'; st.textContent='Verificando...';
  try {
    var uid = localStorage.getItem('dt_cliente_id');
    var sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
    var clienteId = uid || sesion.id || sesion.usuario_id;
    if (!clienteId) { st.style.color='#e31e24'; st.textContent='Error: sesión no válida'; return; }
    var r = await fetch('/api/cuentas/vincular', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ cliente_id: clienteId, codigo: cod })
    });
    var d = await r.json();
    if (d.ok) {
      st.style.color='#4caf50';
      st.textContent='✓ Vinculado con ' + d.entrenador_nombre;
      codigo.value = '';
      setTimeout(() => {
        var panel = document.getElementById('tc-config-panel');
        if (panel) panel.remove();
      }, 1500);
    } else {
      st.style.color='#e31e24';
      st.textContent = d.error || 'Código inválido';
    }
  } catch(e) {
    st.style.color='#e31e24';
    st.textContent='Error de conexión';
  }
}


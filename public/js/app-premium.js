// ═══════════════════════════════
// PREMIUM ENTRENADOR
// ═══════════════════════════════
// ── PREMIUM ENTRENADOR ──
let _entConfig = null;

async function cargarConfigEntrenador() {
  const eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null);
  try {
    const cfg = await fetch('/api/config?entrenador_id=' + eid).then(r=>r.json());
    _entConfig = cfg;
    const hoy = new Date().toISOString().split('T')[0];
    _entConfig._esPremium = cfg.premium_entrenador && cfg.premium_entrenador_hasta && cfg.premium_entrenador_hasta >= hoy;
  } catch(e) { _entConfig = { _esPremium: false }; }
}

function entEsPremium() {
  if (!_entConfig) return false;
  const hoy = new Date().toISOString().split('T')[0];
  return _entConfig.premium_entrenador && _entConfig.premium_entrenador_hasta && _entConfig.premium_entrenador_hasta >= hoy;
}

function mostrarCandadoPremium(mensaje) {
  const m = mensaje || 'Esta función requiere Plan Premium';
  var existing = document.getElementById('modal-ent-premium');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.id = 'modal-ent-premium';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  el.innerHTML = '<div style="background:#111;border:2px solid #e31e24;border-radius:20px;padding:28px 20px;text-align:center;max-width:320px">' +
    '<div style="font-size:36px;margin-bottom:12px">🔒</div>' +
    '<div style="font-size:18px;font-weight:900;color:#fff;margin-bottom:8px">Plan Premium</div>' +
    '<div style="font-size:13px;color:var(--texto-medio);line-height:1.6;margin-bottom:16px">' + m + '<br><br>Activa Premium por solo <span style="color:#e31e24;font-weight:700">$39.999/mes</span>.</div>' +
    '<button onclick="document.getElementById(\'modal-ent-premium\').remove();entPagarPremiumModal();" style="width:100%;padding:12px;border-radius:10px;border:none;background:#e31e24;color:#fff;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:10px">💳 Pagar $39.999/mes</button>' +
    '<button onclick="this.parentNode.parentNode.remove()" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:transparent;color:#888;font-size:13px;cursor:pointer">Ahora no</button>' +
    '</div>';
  document.body.appendChild(el);
}

function entPagarPremiumModal() {
  var s = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  var uid = s.id || null;
  if (!uid) { toast('⚠️ Inicia sesión primero',false); return; }
  fetch('/api/wompi/crear-pago', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ plan: 'entrenador_mensual', entrenador_id: uid })
  }).then(r => r.json()).then(d => {
    if (!d.ok) { toast('❌ Error al generar pago',false); return; }
    var f = document.createElement('form');
    f.method = 'GET';
    f.action = 'https://checkout.wompi.co/p/';
    f.target = '_blank';
    Object.entries({'public-key': d.pub_key, 'currency': 'COP', 'amount-in-cents': d.amount_in_cents, 'reference': d.reference, 'signature:integrity': d.firma, 'redirect-url': d.redirect_url}).forEach(([k,v]) => {
      var i = document.createElement('input');
      i.type = 'hidden'; i.name = k; i.value = v;
      f.appendChild(i);
    });
    document.body.appendChild(f);
    f.submit();
    document.body.removeChild(f);
  }).catch(e => alert('Error: ' + e.message));
}
function mostrarApp() {
  cargarConfigEntrenador();
  actualizarNombreEntrenador();
  // Guardar ID del entrenador en variable global para uso en cargarClientes
  const _sApp = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  if (_sApp.id) window._entrenadorId = _sApp.id;
  setTimeout(()=>{ if(typeof showPage==='function') showPage('inicio'); }, 600);
  ['pantalla-rol','pantalla-login-entrenador','pantalla-login-cliente'].forEach(p => {
    document.getElementById(p).style.display = 'none';
  });
  document.getElementById('app-entrenador').style.display = 'block';
  const ef = document.getElementById('chat-ent-fab');
  if (ef) { ef.style.display = 'flex'; ef.style.background = 'rgba(227,30,36,0.45)'; }
  actualizarBadgeEntrenador();
}

function mostrarTerminalCliente(tel) {
  window._tcCargando = false;
  ['pantalla-rol','pantalla-login-entrenador','pantalla-login-cliente','pantalla-seleccion-rol','app-entrenador'].forEach(p => {
    const el = document.getElementById(p);
    if (el) el.style.display = 'none';
  });
  const ef = document.getElementById('chat-ent-fab');
  if (ef) ef.style.display = 'none';
  iniciarTerminalCliente();
}

function regSelRol(rol) {
  document.getElementById('reg-btn-ent').style.background = rol === 'entrenador' ? '#1a0000' : '#111';
  document.getElementById('reg-btn-ent').style.borderColor = rol === 'entrenador' ? '#e31e24' : '#333';
  document.getElementById('reg-btn-ent').style.color = rol === 'entrenador' ? '#fff' : '#888';
  document.getElementById('reg-btn-cli').style.background = rol === 'cliente' ? '#1a0000' : '#111';
  document.getElementById('reg-btn-cli').style.borderColor = rol === 'cliente' ? '#e31e24' : '#333';
  document.getElementById('reg-btn-cli').style.color = rol === 'cliente' ? '#fff' : '#888';
  document.getElementById('reg-codigo-div').style.display = rol === 'cliente' ? 'block' : 'none';
  document.getElementById('reg-tel-div').style.display = rol === 'cliente' ? 'block' : 'none';
  document.getElementById('reg-btn-ent').dataset.rol = rol;
}

async function hacerRegistro() {
  const nombre = document.getElementById('reg-nombre').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();
  const rol = document.getElementById('reg-btn-ent').dataset.rol || 'entrenador';
  const codigo = document.getElementById('reg-codigo').value.trim();
  const telefono = document.getElementById('reg-telefono').value.trim();
  const error = document.getElementById('reg-error');
  error.style.display = 'none';

  if (!nombre || !email || !pass) {
    error.textContent = 'Completa todos los campos';
    error.style.display = 'block';
    return;
  }
  if (rol === 'cliente' && !telefono) {
    error.textContent = 'Ingresa tu número de teléfono';
    error.style.display = 'block';
    return;
  }

  try {
    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({nombre, email, password: pass, rol, codigo_entrenador: codigo, telefono})
    });
    const data = await res.json();
    if (data.ok) {
      data.roles = data.roles || [{rol:'entrenador',id:data.id},{rol:'cliente',id:data.usuario_id||null}];
      localStorage.setItem('dt_sesion', JSON.stringify(data));
      setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
      localStorage.setItem(ROL_KEY, data.rol);
      document.getElementById('pantalla-registro').style.display = 'none';
      mostrarSeleccionRol({nombre: data.nombre||data.email, email: data.email, roles: data.roles});
    } else {
      error.textContent = data.error || 'Error al registrarse';
      error.style.display = 'block';
    }
  } catch(e) {
    error.textContent = 'Error de conexión';
    error.style.display = 'block';
  }
}

function actualizarNombreEntrenador() {
  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  const nombre = sesion.nombre || 'Entrenador';
  const els = ['nombre-entrenador', 'span-nombre-cfg', 'informe-nombre-ent'];
  els.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = nombre;
  });
  const inp = document.getElementById('cfg-nombre');
  if (inp && !inp.value) inp.value = nombre;
}

function loginUnificado() {
  const email = document.getElementById('login-email-unif').value.trim();
  const pass = document.getElementById('login-pass-unif').value.trim();
  const error = document.getElementById('error-login-unif');
  error.style.display = 'none';
  if (!email || !pass) { error.textContent = 'Completa todos los campos'; error.style.display = 'block'; return; }
  fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email, password: pass})
  }).then(r=>r.json()).then(data => {
    if (data.ok) {
      data.roles = data.roles || [{rol:'entrenador',id:data.id},{rol:'cliente',id:data.usuario_id||null}];
      localStorage.setItem('dt_sesion', JSON.stringify(data));
      setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
      localStorage.setItem(ROL_KEY, data.rol);
      if (data.usuario_id) localStorage.setItem('dt_cliente_id', data.usuario_id);
      localStorage.removeItem('dt_login_intentos');
      // Guardar ID en variable global para uso posterior
      if (data.id) window._entrenadorId = data.id;
      mostrarSeleccionRol({nombre: data.nombre||data.email, email: data.email, roles: data.roles});
    } else {
      // Contador de intentos
      const intentos = parseInt(localStorage.getItem('dt_login_intentos') || '0') + 1;
      localStorage.setItem('dt_login_intentos', intentos);
      const restantes = 10 - intentos;
      if (data.error && data.error.includes('Demasiados')) {
        error.textContent = '🔒 Cuenta bloqueada 15 minutos por demasiados intentos fallidos.';
        localStorage.removeItem('dt_login_intentos');
      } else if (restantes <= 3 && restantes > 0) {
        error.textContent = '⚠️ Contraseña incorrecta. Te quedan ' + restantes + ' intentos antes de bloquearte 15 minutos.';
      } else {
        error.textContent = data.error || 'Correo o contraseña incorrectos';
      }
      error.style.display = 'block';
    }
  }).catch(() => {
    error.textContent = 'Error de conexión';
    error.style.display = 'block';
  });
}

function volverRol() {
  mostrarPantalla('pantalla-rol');
}

function salirARol() {
  const _b1 = document.getElementById('tc-chat-badge'); if (_b1) _b1.style.display = 'none';
  const _b2 = document.getElementById('chat-ent-badge'); if (_b2) _b2.style.display = 'none';
  if (typeof _tcPollingBadge !== 'undefined' && _tcPollingBadge) { clearInterval(_tcPollingBadge); _tcPollingBadge = null; }
  if (typeof _entPollingBadge !== 'undefined' && _entPollingBadge) { clearInterval(_entPollingBadge); _entPollingBadge = null; }
  // Ocultar todos los terminales
  ['app-entrenador','tc-main','terminal-cliente','terminal-cliente-app'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  ['dt_rol','dt_cliente_tel','dt_cliente_id','dt_ultimo_rol'].forEach(k => localStorage.removeItem(k));
  if (sesion.email) {
    fetch('/api/auth/roles?email=' + encodeURIComponent(sesion.email))
      .then(r=>r.json()).then(d => {
        d.email = d.email || sesion.email;
        d.nombre = d.nombre || sesion.nombre || sesion.email;
        mostrarSeleccionRol(d);
      }).catch(() => mostrarPantalla('pantalla-rol'));
  } else {
    mostrarPantalla('pantalla-rol');
  }
}

function cerrarSesion() {
  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  const email = sesion.email;
  const nombre = sesion.nombre;
  ['dt_rol','dt_cliente_tel','dt_cliente_id','dt_sesion','dt_ultimo_rol'].forEach(k => localStorage.removeItem(k));
  if (email) {
    fetch('/api/auth/roles?email=' + encodeURIComponent(email))
      .then(r => r.json())
      .then(d => {
        if (!d.roles) d.roles = [];
        if (!d.roles.find(r => r.rol === 'entrenador')) d.roles.push({rol:'entrenador', id:null, nombre: nombre});
        if (!d.roles.find(r => r.rol === 'cliente')) d.roles.push({rol:'cliente', id:null, nombre: nombre});
        d.nombre = d.nombre || nombre;
        localStorage.setItem('dt_google_data', JSON.stringify(d));
        ['app-entrenador','tc-main','terminal-cliente','terminal-cliente-app'].forEach(id => { const el = document.getElementById(id); if(el) el.style.display='none'; });
        mostrarSeleccionRol(d);
      }).catch(() => location.reload());
  } else {
    location.reload();
  }
}

window.addEventListener('DOMContentLoaded', initRol);


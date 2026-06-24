// ═══════════════════════════════
// IMAGEN Y VOZ CHAT
// ═══════════════════════════════
// ======== IMAGEN Y VOZ CHAT ========
function comprimirImagen(file, callback) {
  const canvas = document.createElement('canvas');
  const img = new Image();
  const reader = new FileReader();
  reader.onload = function(e) {
    img.onload = function() {
      const maxW = 800;
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function tcEnviarImagen(input) {
  const uid = _tcUsuario && _tcUsuario.id;
  if (!input.files[0] || !uid) return;
  comprimirImagen(input.files[0], async function(base64) {
    await fetch('/api/chat/' + uid, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'cliente',tipo:'imagen',contenido:base64})});
    tcCargarMensajes();
  });
  input.value = '';
}

async function chatEntEnviarImagen(input) {
  if (!input.files[0] || !_chatEntClienteId) return;
  comprimirImagen(input.files[0], async function(base64) {
    await fetch('/api/chat/' + _chatEntClienteId, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'entrenador',tipo:'imagen',contenido:base64})});
    cargarMensajesEntrenador();
  });
  input.value = '';
}

async function tcEnviarVideo(input) {
  const uid = _tcUsuario && _tcUsuario.id;
  if (!input.files[0] || !uid) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    await fetch('/api/chat/' + uid, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'cliente',tipo:'video',contenido:e.target.result})});
    tcCargarMensajes();
  };
  reader.readAsDataURL(input.files[0]);
  input.value = '';
}

async function chatEntEnviarVideo(input) {
  if (!input.files[0] || !_chatEntClienteId) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    await fetch('/api/chat/' + _chatEntClienteId, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'entrenador',tipo:'video',contenido:e.target.result})});
    cargarMensajesEntrenador();
  };
  reader.readAsDataURL(input.files[0]);
  input.value = '';
}

function tcToggleMenu() {
  const m = document.getElementById('tc-chat-menu');
  if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function chatEntToggleMenu() {
  const m = document.getElementById('chat-ent-menu');
  if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

let _tcMediaRec = null, _tcAudioChunks = [];
async function tcIniciarVoz() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    _tcAudioChunks = [];
    _tcMediaRec = new MediaRecorder(stream);
    _tcMediaRec.ondataavailable = e => _tcAudioChunks.push(e.data);
    _tcMediaRec.onstop = async () => {
      const blob = new Blob(_tcAudioChunks, {type:'audio/webm'});
      const reader = new FileReader();
      reader.onload = async function(e) {
        const uid = _tcUsuario && _tcUsuario.id;
        await fetch('/api/chat/' + uid, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'cliente',tipo:'audio',contenido:e.target.result})});
        tcCargarMensajes();
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t=>t.stop());
    };
    _tcMediaRec.start();
    const btn = document.getElementById('tc-chat-plus');
    if (btn) { btn.textContent = '⏹'; btn.onclick = tcDetenerVoz; btn.style.background = '#e31e24'; }
  } catch(e) { toast('❌ No se pudo acceder al micrófono',false); }
}

function tcDetenerVoz() {
  if (_tcMediaRec) _tcMediaRec.stop();
  const btn = document.getElementById('tc-chat-plus');
  if (btn) { btn.textContent = '+'; btn.onclick = tcToggleMenu; btn.style.background = '#1a1a1a'; }
}

let _entMediaRec = null, _entAudioChunks = [];
async function chatEntIniciarVoz() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    _entAudioChunks = [];
    _entMediaRec = new MediaRecorder(stream);
    _entMediaRec.ondataavailable = e => _entAudioChunks.push(e.data);
    _entMediaRec.onstop = async () => {
      const blob = new Blob(_entAudioChunks, {type:'audio/webm'});
      const reader = new FileReader();
      reader.onload = async function(e) {
        await fetch('/api/chat/' + _chatEntClienteId, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'entrenador',tipo:'audio',contenido:e.target.result})});
        cargarMensajesEntrenador();
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t=>t.stop());
    };
    _entMediaRec.start();
    const btn = document.getElementById('chat-ent-plus');
    if (btn) { btn.textContent = '⏹'; btn.onclick = chatEntDetenerVoz; btn.style.background = '#e31e24'; }
  } catch(e) { toast('❌ No se pudo acceder al micrófono',false); }
}

function chatEntDetenerVoz() {
  if (_entMediaRec) _entMediaRec.stop();
  const btn = document.getElementById('chat-ent-plus');
  if (btn) { btn.textContent = '+'; btn.onclick = chatEntToggleMenu; btn.style.background = '#1a1a1a'; }
}

let _chatEntClienteId = null;

async function abrirChatEntrenador() {
  const panel = document.getElementById('chat-ent-panel');
  if (!panel) return;
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  document.getElementById('chat-ent-lista').style.display = 'flex';
  document.getElementById('chat-ent-lista').style.flexDirection = 'column';
  document.getElementById('chat-ent-individual').style.display = 'none';
  if (!window._adminUsuarios || window._adminUsuarios.length === 0) {
    window._adminUsuarios = await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json()).catch(()=>[]);
  }
  cargarListaChatClientes();
}

function cerrarChatEntrenador() {
  const panel = document.getElementById('chat-ent-panel');
  if (panel) panel.style.display = 'none';
  actualizarBadgeEntrenador();
}

function volverListaChat() {
  document.getElementById('chat-ent-lista').style.display = 'flex';
  document.getElementById('chat-ent-lista').style.flexDirection = 'column';
  document.getElementById('chat-ent-individual').style.display = 'none';
  cargarListaChatClientes();
}

async function cargarListaChatClientes() {
  const usuarios = window._adminUsuarios || [];
  const noLeidos = await fetch('/api/chat/no-leidos/entrenador').then(r=>r.json()).catch(()=>({total:0,porCliente:{}}));
  const cont = document.getElementById('chat-ent-clientes');
  if (!cont) return;
  const buscar = (document.getElementById('chat-ent-buscar')||{}).value || '';
  const filtrados = usuarios.filter(u => u.activo && u.nombre.toLowerCase().includes(buscar.toLowerCase()));
  filtrados.sort((a,b) => (noLeidos.porCliente[b.id]||0) - (noLeidos.porCliente[a.id]||0));
  cont.innerHTML = filtrados.map(u => {
    const nl = noLeidos.porCliente[u.id] || 0;
    return '<div onclick="abrirChatCliente(\'' + u.id + '\',\'' + u.nombre.replace(/'/g,"\\'") + '\')" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #2a2a2a;cursor:pointer"><div style="width:40px;height:40px;border-radius:50%;background:var(--gris);border:2px solid ' + (nl>0?'#e31e24':'var(--borde)') + ';display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">👤</div><div style="flex:1"><div style="font-size:14px;font-weight:700;color:var(--texto)">' + u.nombre + '</div></div>' + (nl>0?'<div style="background:#e31e24;color:#fff;font-size:11px;font-weight:900;padding:3px 8px;border-radius:10px">' + nl + '</div>':'<div style="font-size:18px;color:#333">›</div>') + '</div>';
  }).join('') || '<div style="text-align:center;color:#333;padding:30px;font-size:13px">Sin clientes</div>';
}

function filtrarChatClientes() { cargarListaChatClientes(); }

async function abrirChatCliente(id, nombre) {
  _chatEntClienteId = id;
  document.getElementById('chat-ent-lista').style.display = 'none';
  document.getElementById('chat-ent-individual').style.display = 'flex';
  document.getElementById('chat-ent-individual').style.flexDirection = 'column';
  document.getElementById('chat-ent-nombre').textContent = nombre;
  await fetch('/api/chat/' + id + '/leer', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'entrenador'})}).catch(()=>{});
  cargarMensajesEntrenador();
}

async function cargarMensajesEntrenador() {
  if (!_chatEntClienteId) return;
  const msgs = await fetch('/api/chat/' + _chatEntClienteId).then(r=>r.json()).catch(()=>[]);
  const cont = document.getElementById('chat-ent-mensajes');
  if (!cont) return;
  if (msgs.length === 0) { cont.innerHTML = '<div style="text-align:center;color:#333;font-size:13px;margin-top:40px">Sin mensajes aún.</div>'; return; }
  cont.innerHTML = msgs.map(m => {
    const esE = m.autor === 'entrenador';
    const hora = new Date(m.fecha).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});
    let bodyE;
    if (m.tipo === 'imagen') bodyE = '<img src="' + m.contenido + '" style="max-width:100%;border-radius:8px;display:block"/>';
    else if (m.tipo === 'audio') bodyE = '<audio controls src="' + m.contenido + '" style="max-width:100%"></audio>';
    else if (m.tipo === 'video') bodyE = '<video controls src="' + m.contenido + '" style="max-width:100%;border-radius:8px"></video>';
    else if (m.tipo === 'reporte') bodyE = m.contenido;
    else bodyE = '<div style="font-size:13px;color:var(--texto)">' + m.contenido + '</div>';
    const esReporteE = m.tipo === 'reporte';
    const padE = (m.tipo==='imagen'||m.tipo==='video') ? '4px' : esReporteE ? '0' : '10px 14px';
    const bgE = esReporteE ? '#1a0000' : (esE?'#e31e24':'var(--gris2)');
    return '<div style="display:flex;justify-content:' + (esE?'flex-end':'flex-start') + '"><div style="max-width:85%;background:' + bgE + ';border-radius:14px;padding:' + padE + '">' + bodyE + '<div style="font-size:10px;color:var(--texto-medio);margin-top:4px;text-align:right;padding:0 4px">' + hora + '</div></div></div>';
  }).join('');
  cont.scrollTop = cont.scrollHeight;
}

async function chatEntEnviar() {
  const input = document.getElementById('chat-ent-input');
  if (!input || !_chatEntClienteId) return;
  const texto = input.value.trim();
  if (!texto) return;
  input.value = '';
  await fetch('/api/chat/' + _chatEntClienteId, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'entrenador',tipo:'texto',contenido:texto})});
  cargarMensajesEntrenador();
}

async function actualizarBadgeEntrenador() {
  const data = await fetch('/api/chat/no-leidos/entrenador').then(r=>r.json()).catch(()=>({total:0}));
  const badge = document.getElementById('chat-ent-badge');
  if (badge) { badge.textContent = data.total; badge.style.display = data.total > 0 ? 'block' : 'none'; }
}

var _entPollingBadge = setInterval(actualizarBadgeEntrenador, 30000);

// ======== VOZ MEJORADA ========
let _tcGrabando = false;
let _tcTimerVoz = null;
let _tcSegVoz = 0;

async function tcIniciarVoz() {
  if (_tcGrabando) {
    // Si ya está grabando, detener y enviar
    tcEnviarAudio();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    _tcAudioChunks = [];
    _tcMediaRec = new MediaRecorder(stream);
    _tcMediaRec.ondataavailable = e => _tcAudioChunks.push(e.data);
    _tcMediaRec.onstop = async () => {
      const blob = new Blob(_tcAudioChunks, {type:'audio/webm'});
      const reader = new FileReader();
      reader.onload = async function(e) {
        const uid = _tcUsuario && _tcUsuario.id;
        await fetch('/api/chat/' + uid, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'cliente',tipo:'audio',contenido:e.target.result})});
        tcCargarMensajes();
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t=>t.stop());
    };
    _tcMediaRec.start();
    _tcGrabando = true;
    _tcSegVoz = 0;

    // Mostrar indicador en el input
    const input = document.getElementById('tc-chat-input');
    if (input) { input.placeholder = '🔴 Grabando... 0s — toca ➤ para enviar'; input.style.color = '#e31e24'; }
    _tcTimerVoz = setInterval(() => {
      _tcSegVoz++;
      if (input) input.placeholder = '🔴 Grabando... ' + _tcSegVoz + 's — toca ➤ para enviar';
    }, 1000);

  } catch(e) { toast('❌ No se pudo acceder al micrófono',false); }
}

async function tcEnviarAudio() {
  if (!_tcGrabando || !_tcMediaRec) return;
  clearInterval(_tcTimerVoz);
  _tcGrabando = false;
  _tcMediaRec.stop();
  const input = document.getElementById('tc-chat-input');
  if (input) { input.placeholder = 'Escribe un mensaje...'; input.style.color = '#fff'; }
}

// Interceptar botón enviar para enviar audio si está grabando
const _origTcEnviarMensaje = window.tcEnviarMensaje;
window.tcEnviarMensaje = async function() {
  if (_tcGrabando) { await tcEnviarAudio(); return; }
  if (_origTcEnviarMensaje) await _origTcEnviarMensaje();
};

// Entrenador - misma lógica
let _entGrabando = false;
let _entTimerVoz = null;
let _entSegVoz = 0;

async function chatEntIniciarVoz() {
  if (_entGrabando) { chatEntEnviarAudio(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    _entAudioChunks = [];
    _entMediaRec = new MediaRecorder(stream);
    _entMediaRec.ondataavailable = e => _entAudioChunks.push(e.data);
    _entMediaRec.onstop = async () => {
      const blob = new Blob(_entAudioChunks, {type:'audio/webm'});
      const reader = new FileReader();
      reader.onload = async function(e) {
        await fetch('/api/chat/' + _chatEntClienteId, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'entrenador',tipo:'audio',contenido:e.target.result})});
        cargarMensajesEntrenador();
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t=>t.stop());
    };
    _entMediaRec.start();
    _entGrabando = true;
    _entSegVoz = 0;
    const input = document.getElementById('chat-ent-input');
    if (input) { input.placeholder = '🔴 Grabando... 0s — toca ➤ para enviar'; input.style.color = '#e31e24'; }
    _entTimerVoz = setInterval(() => {
      _entSegVoz++;
      if (input) input.placeholder = '🔴 Grabando... ' + _entSegVoz + 's — toca ➤ para enviar';
    }, 1000);
  } catch(e) { toast('❌ No se pudo acceder al micrófono',false); }
}

async function chatEntEnviarAudio() {
  if (!_entGrabando || !_entMediaRec) return;
  clearInterval(_entTimerVoz);
  _entGrabando = false;
  _entMediaRec.stop();
  const input = document.getElementById('chat-ent-input');
  if (input) { input.placeholder = 'Escribe un mensaje...'; input.style.color = '#fff'; }
}

const _origChatEntEnviar = window.chatEntEnviar;
window.chatEntEnviar = async function() {
  if (_entGrabando) { await chatEntEnviarAudio(); return; }
  if (_origChatEntEnviar) await _origChatEntEnviar();
};

// Video comprimido - reemplaza tcEnviarVideo
async function tcEnviarVideo(input) {
  const uid = _tcUsuario && _tcUsuario.id;
  if (!input.files[0] || !uid) return;
  const file = input.files[0];
  if (file.size > 30 * 1024 * 1024) { toast('⚠️ Video muy grande. Máximo 30MB',false); input.value=''; return; }
  const reader = new FileReader();
  reader.onload = async function(e) {
    await fetch('/api/chat/' + uid, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'cliente',tipo:'video',contenido:e.target.result})});
    tcCargarMensajes();
  };
  reader.readAsDataURL(file);
  input.value = '';
}

async function chatEntEnviarVideo(input) {
  if (!input.files[0] || !_chatEntClienteId) return;
  const file = input.files[0];
  if (file.size > 30 * 1024 * 1024) { toast('⚠️ Video muy grande. Máximo 30MB',false); input.value=''; return; }
  const reader = new FileReader();
  reader.onload = async function(e) {
    await fetch('/api/chat/' + _chatEntClienteId, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({autor:'entrenador',tipo:'video',contenido:e.target.result})});
    cargarMensajesEntrenador();
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function getDeviceId() {
  let did = localStorage.getItem('dt_device_id');
  if (!did) {
    // Generar fingerprint basado en características del dispositivo
    const nav = window.navigator;
    const screen = window.screen;
    const fp = [
      nav.userAgent,
      nav.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency || '',
      nav.deviceMemory || ''
    ].join('|');
    // Hash simple
    let hash = 0;
    for (let i = 0; i < fp.length; i++) {
      hash = ((hash << 5) - hash) + fp.charCodeAt(i);
      hash |= 0;
    }
    did = 'fp_' + Math.abs(hash) + '_' + Date.now().toString(36);
    localStorage.setItem('dt_device_id', did);
  }
  return did;
}

async function tcActivarPremiumConfig() {
  var codigo = document.getElementById('tc-cod-premium').value.trim().toUpperCase();
  if (!codigo) { toast('⚠️ Ingresa el código',false); return; }
  var uid = localStorage.getItem('dt_cliente_id');
  if (!uid) { toast('⚠️ Error: no hay usuario',false); return; }
  const sesion = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  const email = sesion.email || '';
  try {
    const deviceId = getDeviceId();
    const resConv = await fetch('/api/convenio/activar', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ codigo, email, tipo: 'cliente', userId: uid, deviceId })
    });
    const dConv = await resConv.json();
    if (dConv.ok) {
      _tcUsuario.premium = true;
      _tcUsuario.premium_hasta = dConv.hasta;
      // Guardar en servidor
      if (uid) await fetch('/api/usuarios/' + uid, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({premium:true, premium_hasta:dConv.hasta})}).catch(()=>{});
      var hasta = dConv.hasta ? '<div style="font-size:11px;color:var(--texto-medio);margin-top:4px">Activo hasta: ' + dConv.hasta + '</div>' : '';
      document.getElementById('tc-cod-premium').parentNode.innerHTML = '<div style="color:#4caf50;font-weight:700">✅ Premium activo</div>' + hasta;
      toast('✅ ¡Premium activado! Hasta: '+dConv.hasta);
      return;
    }
    const res = await fetch('/api/premium/activar', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({codigo, userId: uid})
    });
    const d = await res.json();
    if (d.ok) {
      toast('✅ ¡Premium activado! Recarga la app');
      _tcUsuario.premium = true;
      var hasta2 = d.hasta ? '<div style="font-size:11px;color:var(--texto-medio);margin-top:4px">Activo hasta: ' + d.hasta + '</div>' : '';
      document.getElementById('tc-cod-premium').parentNode.innerHTML = '<div style="color:#4caf50;font-weight:700">✅ Premium activo</div>' + hasta2;
    } else {
      toast(dConv.error || d.msg || '❌ Código inválido',false);
    }
  } catch(e) { alert('Error: ' + e.message); }
}

function tcAbrirContactoAporte() {
  var msg = 'Hola, quiero aportar $12.000 para apoyar mi entrenamiento.';
  var wa = 'https://wa.me/?text=' + encodeURIComponent(msg);
  window.open(wa, '_blank');
}

function entPagarPremium() {
  var sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  var userId = sesion.id || null;
  
  if (!userId) toast('❌ Error: no userId',false); return;
  fetch('/api/wompi/crear-pago', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ plan: 'entrenador_mensual', entrenador_id: userId })
  }).then(r => r.json()).then(data => {
    
  }).catch(e => alert('ERROR: ' + e.message));
}
function tcPagarPremium() {
  var userId = (_tcUsuario && _tcUsuario.id) ? _tcUsuario.id : null;
  if (!userId) toast('❌ Error: no se pudo identificar tu cuenta',false); return;
  fetch('/api/wompi/crear-pago', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ plan: 'cliente_mensual', cliente_id: userId })
  }).then(r => r.json()).then(data => {
    if (!data.ok) toast('❌ Error al generar pago',false); return;
    var form = document.createElement('form');
    form.method = 'GET';
    form.action = 'https://checkout.wompi.co/p/';
    form.target = '_blank';
    var campos = {
      'public-key': data.pub_key,
      'currency': 'COP',
      'amount-in-cents': data.amount_in_cents,
      'reference': data.reference,
      'signature:integrity': data.firma,
      'redirect-url': data.redirect_url
    };
    Object.entries(campos).forEach(([k,v]) => {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }).catch(() => alert('Error de conexión'));
}
function tcAportarDesarrollador() {
  var msg = 'Hola, tengo una sugerencia para DT-APP 💡: ';
  var wa = 'https://wa.me/573006197897?text=' + encodeURIComponent(msg);
  window.open(wa, '_blank');
}


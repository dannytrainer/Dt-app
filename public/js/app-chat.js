// ═══════════════════════════════
// CHAT CLIENTE
// ═══════════════════════════════
let _tcChatAbierto = false;

function tcToggleChat() {
  _tcChatAbierto = !_tcChatAbierto;
  const panel = document.getElementById('tc-chat-panel');
  if (panel) {
    panel.style.display = _tcChatAbierto ? 'flex' : 'none';
    if (_tcChatAbierto) tcCargarMensajes();
  }
}

async function tcCargarMensajes() {
  const uid = _tcUsuario && _tcUsuario.id;
  if (!uid) return;
  // Marcar como leídos
  await fetch('/api/chat/' + uid + '/leer', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({autor: 'cliente'})
  }).catch(()=>{});
  // Ocultar badge
  const badge = document.getElementById('tc-chat-badge');
  if (badge) badge.style.display = 'none';

  const msgs = await fetch('/api/chat/' + uid).then(r=>r.json()).catch(()=>[]);
  const cont = document.getElementById('tc-chat-mensajes');
  if (!cont) return;
  if (msgs.length === 0) {
    cont.innerHTML = '<div style="text-align:center;color:#333;font-size:13px;margin-top:40px">Sin mensajes aún.<br>¡Escribe algo a tu entrenador!</div>';
    return;
  }
  cont.innerHTML = msgs.map(m => {
    const esCliente = m.autor === 'cliente';
    const hora = new Date(m.fecha).toLocaleTimeString('es-CO', {hour:'2-digit',minute:'2-digit'});
    let body;
    if (m.tipo === 'imagen') body = '<img src="' + m.contenido + '" style="max-width:100%;border-radius:8px;display:block"/>';
    else if (m.tipo === 'audio') body = '<audio controls src="' + m.contenido + '" style="max-width:100%;border-radius:8px"></audio>';
    else if (m.tipo === 'video') body = '<video controls src="' + m.contenido + '" style="max-width:100%;border-radius:8px"></video>';
    else if (m.tipo === 'reporte') body = m.contenido;
    else body = '<div style="font-size:13px;color:#fff;line-height:1.5">' + m.contenido + '</div>';
    const esReporte = m.tipo === 'reporte';
    const pad = (m.tipo==='imagen'||m.tipo==='video') ? '4px' : esReporte ? '0' : '10px 14px';
    const bgColor = esReporte ? '#1a0000' : (esCliente?'#e31e24':'#1a1a1a');
    const borderR = esCliente?'14px 14px 4px 14px':'14px 14px 14px 4px';
    return '<div style="display:flex;justify-content:' + (esCliente?'flex-end':'flex-start') + '">' +
      '<div style="max-width:85%;background:' + bgColor + ';border-radius:' + borderR + ';padding:' + pad + '">' +
      body +
      '<div style="font-size:10px;color:' + (esCliente?'rgba(255,255,255,0.6)':'#444') + ';margin-top:4px;text-align:right;padding:0 4px">' + hora + '</div>' +
      '</div></div>';
  }).join('');
  cont.scrollTop = cont.scrollHeight;
}

async function tcEnviarMensaje() {
  const input = document.getElementById('tc-chat-input');
  const uid = _tcUsuario && _tcUsuario.id;
  if (!input || !uid) return;
  const texto = input.value.trim();
  if (!texto) return;
  input.value = '';
  await fetch('/api/chat/' + uid, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({autor: 'cliente', tipo: 'texto', contenido: texto})
  });
  // Esperar 3 segundos antes de verificar badge para evitar falso positivo
  setTimeout(() => {
    tcIniciarPollingBadge();
    tcVerificarMensajesNuevos();
  }, 3000);
  tcCargarMensajes();
}

async function tcVerificarMensajesNuevos() {
  const uid = _tcUsuario && _tcUsuario.id;
  if (!uid) return;
  const panel = document.getElementById('tc-chat-panel');
  const panelVisible = panel && panel.style.display !== 'none';
  if (panelVisible) return; // si el chat está abierto no mostrar badge
  const msgs = await fetch('/api/chat/' + uid).then(r=>r.json()).catch(()=>[]);
  const noLeidos = msgs.filter(m => m.autor === 'entrenador' && m.leidoCliente === false).length;
  const todosEntrenador = msgs.filter(m => m.autor === 'entrenador');
  console.log('[BADGE] mensajes entrenador:', todosEntrenador.length, '| no leidos:', noLeidos, '| detalle:', todosEntrenador.map(m => ({id:m.id, leidoCliente:m.leidoCliente})));
  const badge = document.getElementById('tc-chat-badge');
  if (badge) {
    badge.textContent = noLeidos;
    badge.style.display = noLeidos > 0 ? 'block' : 'none';
  }
}
// ---- FIN CHAT CLIENTE ----

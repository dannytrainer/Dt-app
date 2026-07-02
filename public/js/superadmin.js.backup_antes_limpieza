async function abrirSuperAdmin() {
  let panel = document.getElementById('superadmin-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'superadmin-panel';
    panel.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:var(--fondo);z-index:99999;overflow-y:auto;';
    document.body.appendChild(panel);
  }
  panel.style.display = 'block';
  panel.innerHTML = '<div style="padding:16px"><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><button onclick="document.getElementById(&quot;superadmin-panel&quot;).style.display=&quot;none&quot;" style="background:var(--gris);border:none;border-radius:8px;color:var(--texto);padding:8px 12px;font-size:13px;cursor:pointer">← Volver</button><div style="font-size:16px;font-weight:900;color:#e31e24">⚙️ SUPERADMIN</div></div><div style="display:flex;gap:8px;margin-bottom:16px"><button id="sa-tab-convenios" onclick="saTabConvenios()" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;background:#e31e24;color:#fff">⚙️ Convenios</button><button id="sa-tab-logs" onclick="saTabLogs()" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;background:var(--gris);color:var(--texto)">🔴 Logs</button></div><div id="sa-contenido">Cargando...</div></div>';
  await cargarSuperAdmin();
}

async function cargarSuperAdmin() {
  const [entrenadores, codigos, usuariosRes] = await Promise.all([
    fetch('/api/superadmin/entrenadores').then(r=>r.json()).catch(()=>[]),
    fetch('/api/premium/codigos').then(r=>r.json()).catch(()=>[]),
    fetch('/api/usuarios').then(r=>r.json()).catch(()=>[])
  ]);
  const totalEnt = entrenadores.length;
  const entPremium = entrenadores.filter(e=>e.premium).length;
  const totalCli = usuariosRes.length;
  const cliPremium = usuariosRes.filter(u=>u.premium).length;
  const codsDisp = codigos.filter(c=>!c.usado).length;

  let html = '<div style="display:flex;flex-direction:column;gap:12px">';

  // 4 contadores
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  html += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#e31e24">'+totalEnt+'</div><div style="font-size:11px;color:var(--texto-medio)">Entrenadores</div></div>';
  html += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#f0a500">'+entPremium+'</div><div style="font-size:11px;color:var(--texto-medio)">Entrenadores Premium</div></div>';
  html += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#4a9eff">'+totalCli+'</div><div style="font-size:11px;color:var(--texto-medio)">Clientes</div></div>';
  html += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#4caf50">'+cliPremium+'</div><div style="font-size:11px;color:var(--texto-medio)">Clientes Premium</div></div>';
  html += '</div>';

  // Buscador
  html += '<div style="background:var(--card);border-radius:12px;padding:14px">';
  html += '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:10px">🔍 Buscar usuario por email</div>';
  html += '<div style="display:flex;gap:8px">';
  html += '<input id="sa-buscar-email" type="email" placeholder="correo@ejemplo.com" style="flex:1;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none">';
  html += '<button onclick="saBuscarUsuario()" style="background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;padding:10px 16px;cursor:pointer">Buscar</button>';
  html += '</div>';
  html += '<div id="sa-resultado-busqueda" style="margin-top:10px"></div>';
  html += '</div>';

  // Generar código
  html += '<div style="background:var(--card);border-radius:12px;padding:14px">';
  html += '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:10px">🎟️ Generar código de convenio</div>';
  html += '<input id="sa-codigo-manual" type="text" placeholder="Nombre del convenio (ej: FUERZA-CASTILLO)" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box;margin-bottom:8px;text-transform:uppercase">';
  html += '<select id="sa-duracion" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;margin-bottom:8px"><option value="7">7 días</option><option value="15">15 días</option><option value="30">30 días</option><option value="60">2 meses</option><option value="90">3 meses</option><option value="180">6 meses</option><option value="365">1 año</option><option value="0">Permanente</option></select>';
  html += '<select id="sa-tipo-codigo" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;margin-bottom:8px"><option value="cliente">👤 Para clientes</option><option value="entrenador">🏋️ Para entrenadores</option></select>';
  html += '<select id="sa-modalidad" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;margin-bottom:8px"><option value="convenio">🔄 Convenio (múltiples usos, uno por cuenta)</option><option value="unico">1️⃣ Un solo uso total</option></select>';
  html += '<button onclick="saGenerarCodigo()" style="width:100%;background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;padding:11px;cursor:pointer">Crear código de convenio</button>';
  html += '<div id="sa-codigo-resultado" style="margin-top:8px;text-align:center;font-size:13px;color:#4caf50"></div>';
  html += '</div>';

  // Códigos únicos pendientes
  const unicosPendientes = codigos.filter(c => c.es_unico && c.activo && !c.usado);
  if (unicosPendientes.length > 0) {
    html += '<div style="background:var(--card);border-radius:12px;padding:14px">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:10px">1️⃣ Códigos únicos pendientes</div>';
    unicosPendientes.forEach(function(c) {
      const tipoColor = c.tipo === 'entrenador' ? '#f0a500' : '#4a9eff';
      const tipoLabel = c.tipo === 'entrenador' ? '🏋️ Entrenador' : '👤 Cliente';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #222">';
      html += '<div style="flex:1">';
      html += '<div style="font-size:14px;font-weight:700;color:#f0a500;font-family:monospace">'+c.codigo+'</div>';
      html += '<div style="font-size:11px;color:var(--texto-medio);margin-top:2px"><span style="color:'+tipoColor+'">'+tipoLabel+'</span> · '+(c.permanente||c.dias>=99999?'Permanente':c.dias+' días')+'</div>';
      html += '</div>';
      html += '<button onclick="saBorrarConvenio(this)" data-codigo="'+c.codigo+'" style="background:#3a1a1a;border:none;border-radius:6px;color:#e31e24;font-size:11px;padding:5px 8px;cursor:pointer;margin-left:8px">Borrar</button>';
      html += '</div>';
    });
    html += '</div>';
  }

  // Convenios
  const convenios = codigos.filter(c => c.es_convenio);
  if (convenios.length > 0) {
    html += '<div style="background:var(--card);border-radius:12px;padding:14px">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:8px">🤝 Convenios activos</div>';
    html += '<input oninput="saFiltrarConvenios(this.value)" placeholder="🔍 Buscar convenio..." style="width:100%;background:var(--gris);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:10px">';
    html += '<div id="sa-lista-convenios">';
    convenios.forEach(function(c) {
      const hoy = new Date().toISOString().split('T')[0];
      const hoyStr = hoy;
      const usosCli = usuariosRes.filter(u => u.codigo_convenio === c.codigo && u.premium_hasta && u.premium_hasta >= hoyStr).length;
      const usosEnt = entrenadores.filter(e => e.codigo_convenio === c.codigo && e.premium_hasta && e.premium_hasta >= hoyStr).length;
      const usosTotal = usosCli + usosEnt;
      const tipoColor = c.tipo === 'entrenador' ? '#f0a500' : '#4a9eff';
      const tipoLabel = c.tipo === 'entrenador' ? '🏋️ Entrenador' : '👤 Cliente';
      html += '<div class="sa-convenio-row" style="padding:8px 0;border-bottom:1px solid #222">';
      html += '<div style="display:flex;justify-content:space-between;align-items:start">';
      html += '<div style="flex:1">';
      html += '<div style="font-size:14px;font-weight:700;color:#e31e24;font-family:monospace">'+c.codigo+'</div>';
      html += '<div style="font-size:11px;color:var(--texto-medio);margin-top:2px"><span style="color:'+tipoColor+'">'+tipoLabel+'</span> · '+(c.permanente||c.dias>=99999?'Permanente':c.dias+' días')+' · <span style="color:#4caf50">'+usosTotal+' usuarios activos</span></div>';
      html += '<div style="margin-top:4px"><span style="background:'+(c.activo?'#1a3a1a':'#3a1a1a')+';color:'+(c.activo?'#4caf50':'#e31e24')+';font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px">'+(c.activo?'✅ Activo':'🔴 Inactivo')+'</span></div>';
      html += '</div>';
      html += '<button onclick="saBorrarConvenio(this)" data-codigo="'+c.codigo+'" style="background:#3a1a1a;border:none;border-radius:6px;color:#e31e24;font-size:11px;padding:5px 8px;cursor:pointer;margin-left:8px">Borrar</button>';
      html += '</div></div>';
    });
    html += '</div></div>';
  }

  html += '</div>';
  document.getElementById('sa-contenido').innerHTML = html;
}


function saTabConvenios() {
  document.getElementById('sa-tab-convenios').style.background = '#e31e24';
  document.getElementById('sa-tab-convenios').style.color = '#fff';
  document.getElementById('sa-tab-logs').style.background = 'var(--gris)';
  document.getElementById('sa-tab-logs').style.color = 'var(--texto)';
  cargarSuperAdmin();
}

function saTabLogs() {
  document.getElementById('sa-tab-logs').style.background = '#e31e24';
  document.getElementById('sa-tab-logs').style.color = '#fff';
  document.getElementById('sa-tab-convenios').style.background = 'var(--gris)';
  document.getElementById('sa-tab-convenios').style.color = 'var(--texto)';
  cargarLogsPanel('todos');
}


async function cargarLogsPanel(filtro) {
  filtro = filtro || "todos";
  const cont = document.getElementById("sa-contenido");
  cont.innerHTML = "<div style=\"text-align:center;padding:40px;color:var(--texto-medio)\">Cargando logs...</div>";
  const data = await fetch("/api/superadmin/logs").then(function(r){return r.json();}).catch(function(){return {logs:[]};});
  const logs = data.logs || [];

  const traducciones = [
    { patron: "getaddrinfo ENOTFOUND web.whatsapp", nombre: "WhatsApp sin conexion", desc: "WhatsApp intento conectarse pero no habia internet." },
    { patron: "getaddrinfo ENOTFOUND", nombre: "Sin conexion a internet", desc: "El servidor intento conectarse a un servicio externo sin exito." },
    { patron: "printQRInTerminal", nombre: "Aviso de WhatsApp desactualizado", desc: "Una opcion de configuracion de WhatsApp quedo obsoleta. No afecta el funcionamiento." },
    { patron: "Cannot read prop", nombre: "Dato faltante en el servidor", desc: "El servidor intento leer un dato que no existia." },
    { patron: "ENOENT", nombre: "Archivo no encontrado", desc: "El servidor busco un archivo que no existe." },
    { patron: "SyntaxError", nombre: "Error de codigo", desc: "Hay un error de sintaxis en el codigo o en un archivo JSON." },
    { patron: "ECONNREFUSED", nombre: "Conexion rechazada", desc: "Un servicio externo rechazo la conexion." },
    { patron: "connection errored", nombre: "Error de conexion", desc: "Fallo una conexion con un servicio externo." },
    { patron: "Unexpected token", nombre: "Datos corruptos recibidos", desc: "Se recibio una respuesta que no se pudo interpretar." },
    { patron: "timeout", nombre: "Tiempo de espera agotado", desc: "Una operacion tardo demasiado y fue cancelada." }
  ];

  function traducir(log) {
    var texto = (log.mensaje || "") + " " + (log.detalle || "");
    for (var j = 0; j < traducciones.length; j++) {
      if (texto.indexOf(traducciones[j].patron) !== -1) {
        return { nombre: traducciones[j].nombre, desc: traducciones[j].desc };
      }
    }
    if (log.nivel === "ERROR") return { nombre: "Error del servidor", desc: log.mensaje };
    if (log.nivel === "AVISO") return { nombre: "Aviso del sistema", desc: log.mensaje };
    return { nombre: "Evento del sistema", desc: log.mensaje };
  }

  function formatFecha(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return d.toLocaleDateString("es-CO", {day:"numeric", month:"short"}) + " · " + d.toLocaleTimeString("es-CO", {hour:"2-digit", minute:"2-digit"});
  }

  var errores = logs.filter(function(l){return l.nivel==="ERROR";}).length;
  var avisos = logs.filter(function(l){return l.nivel==="AVISO";}).length;
  var filtrados = filtro==="errores" ? logs.filter(function(l){return l.nivel==="ERROR";}) : filtro==="avisos" ? logs.filter(function(l){return l.nivel==="AVISO";}) : logs;

  var fBg = function(f){ return filtro===f ? "#e31e24" : "var(--gris)"; };
  var fCo = function(f){ return filtro===f ? "#fff" : "var(--texto)"; };

  var html = "<div style=\"display:flex;flex-direction:column;gap:10px\">";
  html += "<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px\">";
  html += "<div style=\"background:var(--card);border-radius:10px;padding:12px;text-align:center\"><div style=\"font-size:22px;font-weight:900;color:#e31e24\">" + errores + "</div><div style=\"font-size:10px;color:var(--texto-medio)\">Errores</div></div>";
  html += "<div style=\"background:var(--card);border-radius:10px;padding:12px;text-align:center\"><div style=\"font-size:22px;font-weight:900;color:#f0a500\">" + avisos + "</div><div style=\"font-size:10px;color:var(--texto-medio)\">Avisos</div></div>";
  html += "<div style=\"background:var(--card);border-radius:10px;padding:12px;text-align:center\"><div style=\"font-size:22px;font-weight:900;color:#4a9eff\">" + logs.length + "</div><div style=\"font-size:10px;color:var(--texto-medio)\">Total</div></div>";
  html += "</div>";
  html += "<div style=\"display:flex;gap:6px\">";
  html += "<button onclick=\"cargarLogsPanel(\'todos\')\" style=\"flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:" + fBg("todos") + ";color:" + fCo("todos") + "\">Todos</button>";
  html += "<button onclick=\"cargarLogsPanel(\'errores\')\" style=\"flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:" + fBg("errores") + ";color:" + fCo("errores") + "\">Errores</button>";
  html += "<button onclick=\"cargarLogsPanel(\'avisos\')\" style=\"flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:" + fBg("avisos") + ";color:" + fCo("avisos") + "\">Avisos</button>";
  html += "</div>";

  if (filtrados.length === 0) {
    html += "<div style=\"text-align:center;padding:40px;color:var(--texto-medio)\">Sin registros en esta categoria</div>";
  } else {
    for (var i = 0; i < filtrados.length; i++) {
      var log = filtrados[i];
      var t = traducir(log);
      var color = log.nivel==="ERROR" ? "#e31e24" : log.nivel==="AVISO" ? "#f0a500" : "#4a9eff";
      var emoji = log.nivel==="ERROR" ? "ERROR" : log.nivel==="AVISO" ? "AVISO" : "INFO";
      var idLog = "logdet" + i;
      html += "<div style=\"background:var(--card);border-radius:12px;padding:14px\">";
      html += "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:6px\">";
      html += "<span style=\"background:" + color + "22;color:" + color + ";font-size:10px;font-weight:900;padding:3px 8px;border-radius:6px\">" + emoji + "</span>";
      html += "<span style=\"font-size:11px;color:var(--texto-medio)\">" + formatFecha(log.fecha) + "</span>";
      html += "</div>";
      html += "<div style=\"font-size:14px;font-weight:700;color:var(--texto);margin-bottom:4px\">" + t.nombre + "</div>";
      html += "<div style=\"font-size:12px;color:var(--texto-medio);margin-bottom:8px\">" + t.desc + "</div>";
      if (log.detalle) {
        html += "<button onclick=\"var x=document.getElementById('" + idLog + "');x.style.display=x.style.display==='none'?'block':'none';\" style=\"background:var(--gris);border:none;border-radius:6px;color:var(--texto-medio);font-size:11px;padding:5px 10px;cursor:pointer\">Ver detalle tecnico</button>";
        html += "<pre id=\"" + idLog + "\" style=\"display:none;margin-top:8px;font-size:10px;color:#aaa;white-space:pre-wrap;word-break:break-all;background:#111;padding:8px;border-radius:6px\">" + (log.detalle||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</pre>";
      }
      html += "</div>";
    }
  }
  html += "</div>";
  cont.innerHTML = html;
}


async function logFrontend(origen, mensaje, detalle) {
  try {
    await fetch('/api/log/frontend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origen: origen, mensaje: mensaje, detalle: detalle || '' })
    });
  } catch(e) {
    console.warn('logFrontend fallo:', e);
  }
}

async function saBuscarUsuario() {
  const email = document.getElementById('sa-buscar-email').value.trim().toLowerCase();
  const div = document.getElementById('sa-resultado-busqueda');
  if (!email) { div.innerHTML = '<div style="color:#e31e24;font-size:12px">Ingresa un email</div>'; return; }
  div.innerHTML = '<div style="color:#888;font-size:12px">Buscando...</div>';
  const [entrenadores, usuariosRes] = await Promise.all([
    fetch('/api/superadmin/entrenadores').then(r=>r.json()).catch(()=>[]),
    fetch('/api/usuarios').then(r=>r.json()).catch(()=>[])
  ]);
  const ent = entrenadores.find(e=>e.email.toLowerCase()===email);
  const cli = usuariosRes.find(u=>(u.email||'').toLowerCase()===email);
  if (!ent && !cli) { div.innerHTML = '<div style="color:#e31e24;font-size:12px">No se encontró ningún usuario con ese email</div>'; return; }
  
  const selectorDias = '<select id="sa-dias-premium" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:8px;color:var(--texto);font-size:12px;margin-top:8px;margin-bottom:6px"><option value="7">7 días</option><option value="15">15 días</option><option value="30" selected>30 días</option><option value="60">2 meses</option><option value="90">3 meses</option><option value="180">6 meses</option><option value="365">1 año</option><option value="99999">Permanente</option></select>';

  let html = '';
  if (ent) {
    html += '<div style="background:var(--gris);border-radius:10px;padding:12px;margin-bottom:8px">';
    html += '<div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:4px">🏋️ Entrenador</div>';
    html += '<div style="font-size:14px;font-weight:700;color:var(--texto)">'+ent.nombre+'</div>';
    html += '<div style="font-size:11px;color:var(--texto-medio)">'+ent.email+' · '+ent.total_clientes+' clientes</div>';
    if (ent.premium) html += '<div style="font-size:11px;color:#f0a500;margin-top:4px">⭐ Premium hasta '+ent.premium_hasta+'</div>';
    else html += '<div style="font-size:11px;color:#888;margin-top:4px">Sin premium activo</div>';
    html += selectorDias.replace('id="sa-dias-premium"','id="sa-dias-ent"');
    html += '<button onclick="saActivarPremiumEnt(this)" data-id="'+ent.id+'" data-nombre="'+ent.nombre+'" style="width:100%;background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:8px;cursor:pointer">⭐ Activar Premium Entrenador</button>';
    html += '</div>';
  }
  if (cli) {
    html += '<div style="background:var(--gris);border-radius:10px;padding:12px">';
    html += '<div style="font-size:11px;color:#4a9eff;font-weight:700;text-transform:uppercase;margin-bottom:4px">👤 Cliente</div>';
    html += '<div style="font-size:14px;font-weight:700;color:var(--texto)">'+cli.nombre+'</div>';
    html += '<div style="font-size:11px;color:var(--texto-medio)">'+cli.email+'</div>';
    if (cli.premium) html += '<div style="font-size:11px;color:#4caf50;margin-top:4px">✅ Premium hasta '+cli.premium_hasta+'</div>';
    else html += '<div style="font-size:11px;color:#888;margin-top:4px">Sin premium activo</div>';
    html += selectorDias.replace('id="sa-dias-premium"','id="sa-dias-cli"');
    html += '<button onclick="saActivarPremiumCli(this)" data-id="'+cli.id+'" data-nombre="'+cli.nombre+'" style="width:100%;background:#4a9eff;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:8px;cursor:pointer">⭐ Activar Premium Cliente</button>';
    html += '</div>';
  }
  div.innerHTML = html;
}

async function saActivarPremiumEnt(btn) {
  const id = btn.getAttribute('data-id');
  const nombre = btn.getAttribute('data-nombre');
  await saActivarPremium(id, 'entrenador', nombre);
}

async function saActivarPremiumCli(btn) {
  const id = btn.getAttribute('data-id');
  const nombre = btn.getAttribute('data-nombre');
  await saActivarPremium(id, 'cliente', nombre);
}

async function saActivarPremium(id, tipo, nombre) {
  const selectorId = tipo === 'entrenador' ? 'sa-dias-ent' : 'sa-dias-cli';
  const sel = document.getElementById(selectorId);
  const dias = sel ? parseInt(sel.value) : 30;
  const diasTexto = dias >= 99999 ? 'permanente' : dias + ' días';
  if (!confirm('¿Activar premium ' + diasTexto + ' a ' + nombre + '?')) return;
  const endpoint = tipo === 'entrenador' ? '/api/premium/activar-entrenador-directo' : '/api/premium/activar-cliente-directo';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({id, dias})
  }).then(r=>r.json()).catch(()=>({ok:false}));
  if (res.ok) {
    toast('✅ Premium activado hasta '+res.hasta);
    saBuscarUsuario();
  } else {
    alert('❌ Error: ' + (res.error||'desconocido'));
  }
}

async function saGenerarCodigo() {
  const codigoManual = document.getElementById('sa-codigo-manual').value.trim().toUpperCase();
  const duracion = document.getElementById('sa-duracion').value;
  const tipo = document.getElementById('sa-tipo-codigo').value;
  const modalidad = document.getElementById('sa-modalidad').value;
  const permanente = duracion === '0';
  const div = document.getElementById('sa-codigo-resultado');
  if (!codigoManual) { div.innerHTML = '❌ Debes escribir un nombre'; return; }
  const res = await fetch('/api/premium/generar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      codigo_manual: codigoManual,
      dias: permanente ? 99999 : parseInt(duracion),
      permanente: permanente,
      es_convenio: modalidad === 'convenio',
      es_unico: modalidad === 'unico',
      tipo: tipo,
      activo: true
    })
  }).then(r=>r.json()).catch(()=>({ok:false}));
  if (res.ok) {
    const label = modalidad === 'convenio' ? 'Convenio creado' : 'Código único creado';
    div.innerHTML = '✅ '+label+': <b style="font-family:monospace;color:#e31e24">'+res.codigo+'</b>';
    document.getElementById('sa-codigo-manual').value = '';
    await cargarSuperAdmin();
  } else {
    div.innerHTML = '❌ '+(res.error||'Error al generar');
  }
}

async function saBorrarConvenio(btn) {
  const codigo = btn.getAttribute('data-codigo');
  if (!confirm('¿Borrar convenio ' + codigo + '? Los usuarios que ya lo activaron mantienen su premium.')) return;
  await fetch('/api/premium/codigos/' + encodeURIComponent(codigo), {method:'DELETE'});
  await cargarSuperAdmin();
}

async function saBorrarCodigo(codigo) {
  if (!confirm('¿Borrar código '+codigo+'?')) return;
  await fetch('/api/premium/codigos/'+encodeURIComponent(codigo), {method:'DELETE'});
  await cargarSuperAdmin();
}

function saFiltrarConvenios(texto) {
  const filas = document.querySelectorAll('.sa-convenio-row');
  const q = texto.toLowerCase();
  filas.forEach(function(f) {
    const cod = f.querySelector('div[style*="monospace"]');
    if (cod) f.style.display = cod.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}


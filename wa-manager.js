// wa-manager.js — DT-APP Gestor WhatsApp v2
// REGLAS: nunca borra telefono ni auth por errores. Solo al desconectar voluntariamente.

const { fork } = require('child_process');
const path = require('path');
const fs   = require('fs');

const BASE_DIR      = __dirname;
const LOG_FILE      = path.join(BASE_DIR, 'logs', 'wa.log');
const INTENTOS_FILE = path.join(BASE_DIR, 'data', 'wa_intentos.json');
const CUENTAS_FILE  = path.join(BASE_DIR, 'data', 'cuentas.json');
const MAX_INTENTOS_POR_HORA = 5;

const waSessions = {};

function log(msg) {
  const linea = '[' + new Date().toISOString() + '] [wa-manager] ' + msg;
  console.log(linea);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, linea + '\n');
  } catch(e) {}
}

function cargarJSON(ruta, def) {
  try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch { return def; }
}
function guardarJSON(ruta, datos) {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
}

function registrarIntento(entId) {
  const datos = cargarJSON(INTENTOS_FILE, {});
  const ahora = Date.now();
  const ventana = 60 * 60 * 1000;
  if (!datos[entId]) datos[entId] = [];
  datos[entId] = datos[entId].filter(t => ahora - t < ventana);
  datos[entId].push(ahora);
  guardarJSON(INTENTOS_FILE, datos);
  return datos[entId].length;
}

function intentosEnUltimaHora(entId) {
  const datos = cargarJSON(INTENTOS_FILE, {});
  const ahora = Date.now();
  const ventana = 60 * 60 * 1000;
  if (!datos[entId]) return 0;
  return datos[entId].filter(t => ahora - t < ventana).length;
}

function obtenerEntrenador(entId) {
  const c = cargarJSON(CUENTAS_FILE, { entrenadores: [], clientes: [] });
  return c.entrenadores.find(e => e.id === entId) || null;
}

function actualizarEntrenador(entId, campos) {
  const c = cargarJSON(CUENTAS_FILE, { entrenadores: [], clientes: [] });
  const idx = c.entrenadores.findIndex(e => e.id === entId);
  if (idx !== -1) {
    Object.assign(c.entrenadores[idx], campos);
    guardarJSON(CUENTAS_FILE, c);
  }
}

function conectarWhatsApp(entId) {
  if (!entId) { log('conectarWhatsApp sin entId'); return { ok: false, error: 'entId requerido' }; }

  const intentosHora = intentosEnUltimaHora(entId);
  if (intentosHora >= MAX_INTENTOS_POR_HORA) {
    log('Limite por hora para ' + entId + ' (' + intentosHora + ' intentos)');
    return { ok: false, error: 'Demasiados intentos en la ultima hora. Espera unos minutos.' };
  }

  const sesionActiva = waSessions[entId];
  if (sesionActiva && sesionActiva.proceso && sesionActiva.conectado) {
    log('Ya conectado para ' + entId);
    return { ok: true, yaConectado: true };
  }

  if (sesionActiva && sesionActiva.proceso) {
    log('Proceso previo no conectado para ' + entId + ', reemplazando...');
    sesionActiva.detenido = true;
    try { sesionActiva.proceso.send({ tipo: 'detener' }); } catch(e) {}
    try { sesionActiva.proceso.kill(); } catch(e) {}
  }

  const ent      = obtenerEntrenador(entId);
  const telefono = ent ? ent.telefono : null;

  registrarIntento(entId);

  waSessions[entId] = {
    proceso: null, conectado: false, pairingCode: null,
    qrCode: null, estadoVisual: 'desconectado', pendientes: {}, detenido: false
  };
  const sess = waSessions[entId];

  const env = { ...process.env, ENT_ID: entId };
  if (telefono) env.ENT_TELEFONO = telefono;

  const worker = fork(path.join(BASE_DIR, 'wa-worker.js'), [], { env, silent: false });
  sess.proceso = worker;
  log('Worker lanzado para ' + entId + (telefono ? ' tel:' + telefono : ' (modo QR)'));
  actualizarEntrenador(entId, { wa_estado: 'desconectado' });

  worker.on('message', (msg) => {
    if (msg.tipo === 'estado') {
      sess.conectado = msg.conectado;
      if (!msg.conectado) sess.qrCode = null;
    }
    if (msg.tipo === 'estado_visual') {
      sess.estadoVisual = msg.estado;
      actualizarEntrenador(entId, { wa_estado: msg.estado });
    }
    if (msg.tipo === 'codigo') {
      sess.pairingCode = msg.codigo;
      actualizarEntrenador(entId, { wa_pairing_code: msg.codigo });
    }
    if (msg.tipo === 'qr') {
      sess.qrCode = msg.qr;
    }
    if (msg.tipo === 'estado' && msg.conectado) {
      sess.pairingCode = null;
      sess.qrCode      = null;
      actualizarEntrenador(entId, {
        wa_estado: 'conectado',
        wa_pairing_code: null,
        wa_ultima_conexion: new Date().toISOString()
      });
      log('Conexion exitosa para ' + entId);
    }
    if (msg.tipo === 'logout') {
      actualizarEntrenador(entId, { wa_estado: 'desconectado', wa_pairing_code: null });
    }
    if (msg.tipo === 'limite_alcanzado') {
      sess.estadoVisual = 'error';
      actualizarEntrenador(entId, { wa_estado: 'error' });
    }
    if (msg.tipo === 'log_error') {
      log('Error worker ' + entId + ': cod=' + msg.statusCode + ' motivo=' + msg.motivo);
    }
    if (msg.tipo === 'resultado') {
      const cb = sess.pendientes[msg.id];
      if (cb) { cb(msg.ok); delete sess.pendientes[msg.id]; }
    }
  });

  worker.on('exit', (code) => {
    log('Worker ' + entId + ' termino (codigo ' + code + ')');
    sess.proceso   = null;
    sess.conectado = false;
    if (!sess.detenido) {
      log('Worker ' + entId + ' termino inesperadamente. Reconectar manualmente.');
      sess.estadoVisual = 'error';
      actualizarEntrenador(entId, { wa_estado: 'error' });
    }
  });

  return { ok: true };
}

function desconectarWhatsApp(entId) {
  if (!entId) return;
  const sess = waSessions[entId];
  if (sess) {
    sess.detenido = true;
    if (sess.proceso) {
      try { sess.proceso.send({ tipo: 'detener' }); } catch(e) {}
      try { sess.proceso.kill(); } catch(e) {}
    }
  }
  delete waSessions[entId];

  const authDir = path.join(BASE_DIR, 'auth_' + entId);
  if (fs.existsSync(authDir)) {
    try {
      fs.rmSync(authDir, { recursive: true, force: true });
      log('Auth borrada para ' + entId + ' (desconexion voluntaria)');
    } catch(e) {
      log('No se pudo borrar auth de ' + entId + ': ' + e.message);
    }
  }

  actualizarEntrenador(entId, { wa_estado: 'desconectado', wa_pairing_code: null });
  log('Entrenador ' + entId + ' desconectado. Telefono conservado.');
}

function guardarTelefono(entId, telefono) {
  if (!entId || !telefono) return { ok: false, error: 'entId y telefono requeridos' };
  const tel = telefono.replace(/\D/g, '');
  actualizarEntrenador(entId, { telefono: tel });
  log('Telefono guardado para ' + entId + ': ' + tel);
  return { ok: true, telefono: tel };
}

function obtenerEstado(entId) {
  const sess = waSessions[entId];
  const ent  = obtenerEntrenador(entId);
  return {
    ok:               true,
    conectado:        sess ? sess.conectado    : false,
    pairingCode:      sess ? sess.pairingCode  : (ent ? ent.wa_pairing_code : null),
    qrCode:           sess ? sess.qrCode       : null,
    estadoVisual:     sess ? sess.estadoVisual : (ent ? ent.wa_estado : 'desconectado'),
    telefono:         ent  ? ent.telefono      : null,
    tieneCredenciales: fs.existsSync(path.join(BASE_DIR, 'auth_' + entId, 'creds.json')),
    ultimaConexion:   ent  ? ent.wa_ultima_conexion : null
  };
}

async function enviarMensaje(telefono, mensaje, entId) {
  if (!entId) { log('enviarMensaje sin entId'); return false; }
  const sess = waSessions[entId];
  if (!sess || !sess.proceso || !sess.conectado) {
    log('enviarMensaje: ' + entId + ' no conectado.');
    return false;
  }
  return new Promise((resolve) => {
    const id = Date.now() + '_' + Math.random();
    sess.pendientes[id] = resolve;
    sess.proceso.send({ tipo: 'enviar', id, telefono, mensaje });
    setTimeout(() => { if (sess.pendientes[id]) { delete sess.pendientes[id]; resolve(false); } }, 15000);
  });
}

async function enviarDocumento(entId, telefono, buffer, mimetype, fileName) {
  if (!entId) return false;
  const sess = waSessions[entId];
  if (!sess || !sess.proceso || !sess.conectado) return false;
  return new Promise((resolve) => {
    const id = Date.now() + '_' + Math.random();
    sess.pendientes[id] = resolve;
    sess.proceso.send({ tipo: 'enviarDoc', id, telefono, buffer, mimetype, fileName });
    setTimeout(() => { if (sess.pendientes[id]) { delete sess.pendientes[id]; resolve(false); } }, 15000);
  });
}

module.exports = {
  conectarWhatsApp,
  desconectarWhatsApp,
  guardarTelefono,
  obtenerEstado,
  enviarMensaje,
  enviarDocumento,
  waSessions
};

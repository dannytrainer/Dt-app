const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');

const BASE_DIR = path.join(__dirname, '..');
const WA_V2_DIR = __dirname;
const ESTADO_FILE = path.join(BASE_DIR, 'data', 'wa_estado.json');
const INTENTOS_FILE = path.join(BASE_DIR, 'data', 'wa_intentos.json');
const LOG_FILE = path.join(BASE_DIR, 'logs', 'wa_supervisor.log');

const MAX_INTENTOS = 5;
const BACKOFFS = [3000, 6000, 12000, 24000, 60000];
const TIMEOUT_ACK = 8000;

const sesiones = {};

function log(msg) {
  const linea = '[' + new Date().toISOString() + '] [supervisor] ' + msg;
  console.log(linea);
  try {
    fs.mkdirSync(path.join(BASE_DIR, 'logs'), { recursive: true });
    fs.appendFileSync(LOG_FILE, linea + '\n');
  } catch (e) {}
}

function leerJSON(archivo, porDefecto) {
  try { return JSON.parse(fs.readFileSync(archivo, 'utf8')); } catch (e) { return porDefecto; }
}

function escribirEstadoGlobal() {
  const snapshot = {};
  for (const entId in sesiones) {
    const s = sesiones[entId];
    snapshot[entId] = {
      estado: s.estado,
      pairingCode: s.pairingCode,
      intentos: s.intentos,
      requiereAtencion: !!s.requiereAtencion,
      actualizado: new Date().toISOString()
    };
  }
  try {
    fs.mkdirSync(path.join(BASE_DIR, 'data'), { recursive: true });
    fs.writeFileSync(ESTADO_FILE, JSON.stringify(snapshot, null, 2));
  } catch (e) { log('Error escribiendo wa_estado.json: ' + e.message); }
}

function registrarIntento(entId, resultado) {
  const historial = leerJSON(INTENTOS_FILE, {});
  if (!historial[entId]) historial[entId] = [];
  historial[entId].push({ timestamp: new Date().toISOString(), resultado });
  if (historial[entId].length > 50) historial[entId] = historial[entId].slice(-50);
  try {
    fs.mkdirSync(path.join(BASE_DIR, 'data'), { recursive: true });
    fs.writeFileSync(INTENTOS_FILE, JSON.stringify(historial, null, 2));
  } catch (e) {}
}

function nuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function crearSesion(entId, authFolder) {
  sesiones[entId] = {
    proceso: null,
    estado: 'SIN_INICIAR',
    pairingCode: null,
    qrCode: null,
    intentos: 0,
    requiereAtencion: false,
    authFolder: authFolder,
    pendientes: {}
  };
  return sesiones[entId];
}

function enviarComando(entId, mensaje) {
  return new Promise((resolve, reject) => {
    const sess = sesiones[entId];
    if (!sess || !sess.proceso) { reject(new Error('Worker no existe para ' + entId)); return; }
    const id = nuevoId();
    mensaje.id = id;
    let recibioAck = false;

    const timeout = setTimeout(() => {
      if (!recibioAck) {
        delete sess.pendientes[id];
        reject(new Error('timeout esperando ACK de ' + mensaje.tipo));
      }
    }, TIMEOUT_ACK);

    sess.pendientes[id] = {
      onAck: () => { recibioAck = true; },
      onResultado: (resultado) => {
        clearTimeout(timeout);
        delete sess.pendientes[id];
        resolve(resultado);
      }
    };

    try {
      sess.proceso.send(mensaje);
    } catch (e) {
      clearTimeout(timeout);
      delete sess.pendientes[id];
      reject(e);
    }
  });
}

function levantarWorker(entId, telefono, authFolder) {
  const sess = sesiones[entId] || crearSesion(entId, authFolder);
  sess.authFolder = authFolder;

  if (sess.proceso) {
    try { sess.proceso.kill(); } catch (e) {}
  }

  const env = { ...process.env, ENT_ID: entId, AUTH_FOLDER: authFolder };
  if (telefono) env.ENT_TELEFONO = telefono;

  const worker = fork(path.join(WA_V2_DIR, 'wa-worker-v2.js'), [], { env, silent: false });
  sess.proceso = worker;

  worker.on('message', (msg) => manejarMensajeWorker(entId, msg));

  worker.on('exit', (code) => {
    log('Worker de ' + entId + ' termino con codigo ' + code);
    sess.proceso = null;
    if (sess.estado !== 'DETENIDO') {
      sess.estado = 'DESCONECTADO_TEMPORAL';
      escribirEstadoGlobal();
      programarReconexion(entId);
    }
  });

  worker.send({ id: nuevoId(), tipo: 'iniciar' });
  return sess;
}

function manejarMensajeWorker(entId, msg) {
  const sess = sesiones[entId];
  if (!sess || !msg || !msg.tipo) return;

  if (msg.tipo === 'ack') {
    const pendiente = sess.pendientes[msg.id];
    if (pendiente) pendiente.onAck();
    return;
  }

  if (msg.tipo === 'resultado') {
    const pendiente = sess.pendientes[msg.id];
    if (pendiente) pendiente.onResultado(msg);
    return;
  }

  if (msg.tipo === 'transicion_estado') {
    sess.estado = msg.estadoNuevo;
    log(entId + ': ' + msg.estadoAnterior + ' -> ' + msg.estadoNuevo);
    if (msg.estadoNuevo === 'CONECTADO') {
      sess.intentos = 0;
      sess.requiereAtencion = false;
      registrarIntento(entId, 'conectado');
    }
    escribirEstadoGlobal();
    return;
  }

  if (msg.tipo === 'codigo') {
    sess.pairingCode = msg.codigo;
    escribirEstadoGlobal();
    return;
  }

  if (msg.tipo === 'qr') {
    sess.qrCode = msg.qr;
    return;
  }

  if (msg.tipo === 'sesion_invalida') {
    log(entId + ': sesion invalida, motivo=' + msg.motivo);
    registrarIntento(entId, 'sesion_invalida:' + msg.motivo);
    decidirTrasSesionInvalida(entId, msg.motivo);
    return;
  }

  if (msg.tipo === 'error_fatal') {
    log(entId + ': error fatal: ' + msg.error);
    sess.requiereAtencion = true;
    escribirEstadoGlobal();
    return;
  }
}

function programarReconexion(entId) {
  const sess = sesiones[entId];
  if (!sess) return;

  if (sess.intentos >= MAX_INTENTOS) {
    sess.requiereAtencion = true;
    log(entId + ': se alcanzo el limite de ' + MAX_INTENTOS + ' intentos, requiere atencion manual');
    escribirEstadoGlobal();
    return;
  }

  const espera = BACKOFFS[Math.min(sess.intentos, BACKOFFS.length - 1)];
  sess.intentos += 1;
  log(entId + ': reintentando en ' + espera + 'ms (intento ' + sess.intentos + '/' + MAX_INTENTOS + ')');

  setTimeout(() => {
    if (sesiones[entId] && sesiones[entId].estado !== 'CONECTADO' && sesiones[entId].estado !== 'DETENIDO') {
      levantarWorker(entId, null, sess.authFolder);
    }
  }, espera);
}

function decidirTrasSesionInvalida(entId, motivo) {
  const sess = sesiones[entId];
  if (!sess) return;

  if (sess.intentos < MAX_INTENTOS) {
    programarReconexion(entId);
  } else {
    sess.requiereAtencion = true;
    log(entId + ': sesion invalida persistente (' + motivo + '), requiere decision manual. NO se borra auth automaticamente.');
    escribirEstadoGlobal();
  }
}

// ===== API publica que usaran las rutas HTTP en index.js =====

async function conectar(entId, telefono, authFolder) {
  const carpeta = authFolder || path.join(BASE_DIR, 'auth_' + entId);
  levantarWorker(entId, telefono, carpeta);
  return { ok: true, entId, estado: 'CONECTANDO' };
}

async function desconectar(entId) {
  const sess = sesiones[entId];
  if (!sess || !sess.proceso) return { ok: false, error: 'No hay sesion activa' };
  try {
    await enviarComando(entId, { tipo: 'detener' });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function estado(entId) {
  const sess = sesiones[entId];
  if (!sess) return { ok: true, estado: 'SIN_INICIAR', pairingCode: null };
  return { ok: true, estado: sess.estado, pairingCode: sess.pairingCode, requiereAtencion: !!sess.requiereAtencion };
}

async function enviar(entId, telefono, mensaje) {
  return enviarComando(entId, { tipo: 'enviar', telefono, mensaje });
}

async function enviarDoc(entId, telefono, buffer, mimetype, fileName) {
  return enviarComando(entId, { tipo: 'enviarDoc', telefono, buffer, mimetype, fileName });
}

async function limpiarSesion(entId) {
  return enviarComando(entId, { tipo: 'limpiar_sesion' });
}

module.exports = { conectar, desconectar, estado, enviar, enviarDoc, limpiarSesion };

// whatsapp/worker.js
// Dueno exclusivo del socket de Baileys para UN entrenador.
// Reglas duras:
//  - Nunca decide reconectar solo (solo informa y espera orden del padre).
//  - Nunca borra credenciales solo (solo reporta 'sesion_invalida').
//  - Toda accion pedida por el padre responde con ACK inmediato + resultado despues.

const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');

const { ESTADOS, CMD, EVT, CONFIG } = require('./constants');
const { crearMaquina } = require('./state-machine');
const { crearLoggerWorker } = require('./logger');

const entId = process.env.ENT_ID;
const telefonoInicial = process.env.ENT_TELEFONO || null;
const authFolder = process.env.AUTH_FOLDER || path.join(__dirname, '..', 'auth_' + entId);

if (!entId) {
  console.log('ERROR FATAL: falta ENT_ID en el entorno. El worker no puede arrancar.');
  process.exit(1);
}

const log = crearLoggerWorker(entId);

let sock = null;
let pairingCode = null;
let detenido = false;

function enviarPadre(msg) {
  try {
    if (process.send) process.send(msg);
  } catch (e) {
    log('IPC cerrado, no se pudo enviar: ' + e.message);
  }
}

const maquina = crearMaquina(log, ESTADOS.INICIANDO);
maquina.onTransicion(function (anterior, nuevo, detalle) {
  enviarPadre({ tipo: EVT.TRANSICION_ESTADO, entId, estadoAnterior: anterior, estadoNuevo: nuevo, detalle: detalle || null, timestamp: Date.now() });
});

async function iniciarSocket(telefono) {
  if (!maquina.transicionar(ESTADOS.CONECTANDO)) return;

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  let waVersion;
  try {
    const v = await fetchLatestBaileysVersion();
    waVersion = v.version;
    log('Version WA detectada: ' + waVersion.join('.') + (v.isLatest ? ' (al dia)' : ' (hay una mas nueva)'));
  } catch (e) {
    log('No se pudo consultar version WA, se usa la de la libreria: ' + e.message);
  }

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['DT-APP', 'Chrome', '1.0'],
    qrTimeout: CONFIG.QR_TIMEOUT_MS,
    ...(waVersion ? { version: waVersion } : {})
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered && telefono && !pairingCode) {
    maquina.transicionar(ESTADOS.ESPERANDO_PAIRING);
    setTimeout(async function () {
      try {
        const code = await sock.requestPairingCode(telefono.replace(/\D/g, ''));
        pairingCode = code;
        enviarPadre({ tipo: EVT.CODIGO, entId, codigo: code });
        log('Pairing code generado: ' + code);
      } catch (e) {
        log('Error generando pairing code: ' + e.message);
        enviarPadre({ tipo: EVT.ERROR_FATAL, entId, error: e.message });
      }
    }, CONFIG.PAIRING_DELAY_MS);
  }

  sock.ev.on('connection.update', function (update) {
    const connection = update.connection;
    const lastDisconnect = update.lastDisconnect;
    const qr = update.qr;

    if (qr) {
      enviarPadre({ tipo: EVT.QR, entId, qr });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output ? lastDisconnect.error.output.statusCode : null;
      const fueDeslogueado = statusCode === DisconnectReason.loggedOut;
      const registrado = sock && sock.authState && sock.authState.creds && sock.authState.creds.registered;
      const motivo = (lastDisconnect && lastDisconnect.error) ? lastDisconnect.error.message : 'desconocido';

      pairingCode = null;
      log('Conexion cerrada. statusCode=' + statusCode + ' motivo=' + motivo);

      if (detenido) {
        maquina.transicionar(ESTADOS.DETENIDO, 'cierre solicitado');
        return;
      }

      if (fueDeslogueado) {
        maquina.transicionar(ESTADOS.SESION_INVALIDA, 'logged_out');
        enviarPadre({ tipo: EVT.SESION_INVALIDA, entId, motivo: 'logged_out' });
      } else if (!registrado) {
        maquina.transicionar(ESTADOS.SESION_INVALIDA, 'registro_incompleto');
        enviarPadre({ tipo: EVT.SESION_INVALIDA, entId, motivo: 'registro_incompleto' });
      } else {
        maquina.transicionar(ESTADOS.DESCONECTADO_TEMPORAL, 'statusCode=' + statusCode);
      }
    }

    if (connection === 'open') {
      maquina.transicionar(ESTADOS.CONECTADO);
      pairingCode = null;
      log('Conectado correctamente');
    }
  });
}

process.on('message', async function (msg) {
  if (!msg || !msg.tipo) return;

  if (msg.tipo === CMD.DETENER) {
    detenido = true;
    enviarPadre({ tipo: EVT.ACK, id: msg.id, de: CMD.DETENER });
    try { if (sock && sock.end) sock.end(); } catch (e) {}
    maquina.transicionar(ESTADOS.DETENIDO, 'orden del padre');
    setTimeout(function () { process.exit(0); }, 300);
    return;
  }

  if (detenido) return;

  if (msg.tipo === CMD.INICIAR || msg.tipo === CMD.RECONECTAR) {
    enviarPadre({ tipo: EVT.ACK, id: msg.id, de: msg.tipo });
    await iniciarSocket(msg.telefono || telefonoInicial);
    return;
  }

  if (msg.tipo === CMD.LIMPIAR_SESION) {
    enviarPadre({ tipo: EVT.ACK, id: msg.id, de: CMD.LIMPIAR_SESION });
    try {
      fs.rmSync(authFolder, { recursive: true, force: true });
      log('Sesion limpiada por orden explicita del padre');
      enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: true });
    } catch (e) {
      enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: false, error: e.message });
    }
    return;
  }

  if (msg.tipo === CMD.ESTADO) {
    enviarPadre({ tipo: EVT.ACK, id: msg.id, de: CMD.ESTADO });
    enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: { estado: maquina.obtenerEstado(), pairingCode: pairingCode } });
    return;
  }

  if (msg.tipo === CMD.ENVIAR || msg.tipo === CMD.ENVIAR_DOC) {
    enviarPadre({ tipo: EVT.ACK, id: msg.id, de: msg.tipo });
    if (maquina.obtenerEstado() !== ESTADOS.CONECTADO || !sock) {
      enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: false, error: 'No conectado' });
      return;
    }
    try {
      let jid;
      if (String(msg.telefono).startsWith('grupo:')) {
        const codigo = msg.telefono.replace('grupo:', '');
        const info = await sock.groupGetInviteInfo(codigo);
        jid = info.id;
      } else if (String(msg.telefono).endsWith('@g.us')) {
        jid = msg.telefono;
      } else {
        jid = msg.telefono.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      }
      if (msg.tipo === CMD.ENVIAR_DOC) {
        const buffer = Buffer.from(msg.buffer, 'base64');
        await sock.sendMessage(jid, { document: buffer, mimetype: msg.mimetype || 'application/pdf', fileName: msg.fileName || 'documento.pdf' });
      } else {
        await sock.sendMessage(jid, { text: msg.mensaje });
      }
      enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: true });
    } catch (e) {
      enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: false, error: e.message });
    }
    return;
  }

  if (msg.tipo === CMD.GRUPO_INFO) {
    enviarPadre({ tipo: EVT.ACK, id: msg.id, de: CMD.GRUPO_INFO });
    if (maquina.obtenerEstado() !== ESTADOS.CONECTADO || !sock) {
      enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: null });
      return;
    }
    try {
      const info = await sock.groupGetInviteInfo(msg.codigo);
      enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: info });
    } catch (e) {
      enviarPadre({ tipo: EVT.RESULTADO, id: msg.id, ok: null });
    }
    return;
  }
});

log('Worker iniciado. entId=' + entId + ' authFolder=' + authFolder + ' esperando comando iniciar...');

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

const entId = process.env.ENT_ID;
const telefono = process.env.ENT_TELEFONO || null;
const authFolder = process.env.AUTH_FOLDER || path.join(__dirname, '..', 'auth_' + entId);

let sock = null;
let estado = 'INICIANDO';
let pairingCode = null;
let detenido = false;

function log(msg) {
  const linea = '[' + new Date().toISOString() + '] [worker:' + entId + '] ' + msg;
  console.log(linea);
  try {
    fs.mkdirSync(path.join(__dirname, '..', 'logs'), { recursive: true });
    fs.appendFileSync(path.join(__dirname, '..', 'logs', 'wa_ent_' + entId + '.log'), linea + '\n');
  } catch (e) {}
}

function enviarPadre(msg) {
  try { if (process.send) process.send(msg); } catch (e) { log('IPC cerrado: ' + e.message); }
}

function cambiarEstado(nuevo, detalle) {
  const anterior = estado;
  estado = nuevo;
  log('Transicion: ' + anterior + ' -> ' + nuevo + (detalle ? ' (' + detalle + ')' : ''));
  enviarPadre({ tipo: 'transicion_estado', entId, estadoAnterior: anterior, estadoNuevo: nuevo, timestamp: Date.now() });
}

async function iniciarSocket() {
  cambiarEstado('CONECTANDO');
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  let waVersion;
  try {
    const v = await fetchLatestBaileysVersion();
    waVersion = v.version;
    log('Version WA: ' + waVersion.join('.') + (v.isLatest ? ' (al dia)' : ' (hay mas nueva)'));
  } catch (e) {
    log('No se pudo consultar version WA: ' + e.message);
  }

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['DT-APP', 'Chrome', '1.0'],
    qrTimeout: 300000,
    ...(waVersion ? { version: waVersion } : {})
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered && telefono && !pairingCode) {
    cambiarEstado('ESPERANDO_PAIRING');
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(telefono.replace(/\D/g, ''));
        pairingCode = code;
        enviarPadre({ tipo: 'codigo', entId, codigo: code });
        log('Pairing code generado: ' + code);
      } catch (e) {
        log('Error generando pairing code: ' + e.message);
        enviarPadre({ tipo: 'error_fatal', entId, error: e.message });
      }
    }, 3000);
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) enviarPadre({ tipo: 'qr', entId, qr });

    if (connection === 'close') {
      const statusCode = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output ? lastDisconnect.error.output.statusCode : null;
      const fueDeslogueado = statusCode === DisconnectReason.loggedOut;
      const registrado = sock && sock.authState && sock.authState.creds && sock.authState.creds.registered;

      pairingCode = null;

      if (fueDeslogueado) {
        cambiarEstado('SESION_INVALIDA', 'logged out por WhatsApp');
        enviarPadre({ tipo: 'sesion_invalida', entId, motivo: 'logged_out' });
      } else if (!registrado) {
        cambiarEstado('SESION_INVALIDA', 'cierre antes de completar registro');
        enviarPadre({ tipo: 'sesion_invalida', entId, motivo: 'registro_incompleto' });
      } else {
        cambiarEstado('DESCONECTADO_TEMPORAL', 'statusCode=' + statusCode);
      }
    }

    if (connection === 'open') {
      cambiarEstado('CONECTADO');
      pairingCode = null;
      log('Conectado correctamente');
    }
  });
}

process.on('message', async (msg) => {
  if (!msg || !msg.tipo) return;

  if (msg.tipo === 'detener') {
    detenido = true;
    cambiarEstado('DETENIDO');
    enviarPadre({ tipo: 'ack', id: msg.id, de: 'detener' });
    try { if (sock && sock.end) sock.end(); } catch (e) {}
    setTimeout(() => process.exit(0), 300);
    return;
  }

  if (detenido) return;

  if (msg.tipo === 'iniciar' || msg.tipo === 'reconectar') {
    enviarPadre({ tipo: 'ack', id: msg.id, de: msg.tipo });
    await iniciarSocket();
    return;
  }

  if (msg.tipo === 'limpiar_sesion') {
    enviarPadre({ tipo: 'ack', id: msg.id, de: 'limpiar_sesion' });
    try {
      fs.rmSync(authFolder, { recursive: true, force: true });
      log('Sesion limpiada por orden explicita del padre');
      enviarPadre({ tipo: 'resultado', id: msg.id, ok: true });
    } catch (e) {
      enviarPadre({ tipo: 'resultado', id: msg.id, ok: false, error: e.message });
    }
    return;
  }

  if (msg.tipo === 'estado') {
    enviarPadre({ tipo: 'ack', id: msg.id, de: 'estado' });
    enviarPadre({ tipo: 'resultado', id: msg.id, ok: { estado: estado, pairingCode: pairingCode } });
    return;
  }

  if (msg.tipo === 'enviar' || msg.tipo === 'enviarDoc') {
    enviarPadre({ tipo: 'ack', id: msg.id, de: msg.tipo });
    if (estado !== 'CONECTADO' || !sock) {
      enviarPadre({ tipo: 'resultado', id: msg.id, ok: false, error: 'No conectado' });
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
      if (msg.tipo === 'enviarDoc') {
        const buffer = Buffer.from(msg.buffer, 'base64');
        await sock.sendMessage(jid, { document: buffer, mimetype: msg.mimetype || 'application/pdf', fileName: msg.fileName || 'documento.pdf' });
      } else {
        await sock.sendMessage(jid, { text: msg.mensaje });
      }
      enviarPadre({ tipo: 'resultado', id: msg.id, ok: true });
    } catch (e) {
      enviarPadre({ tipo: 'resultado', id: msg.id, ok: false, error: e.message });
    }
    return;
  }

  if (msg.tipo === 'grupoInfo') {
    enviarPadre({ tipo: 'ack', id: msg.id, de: 'grupoInfo' });
    if (estado !== 'CONECTADO' || !sock) {
      enviarPadre({ tipo: 'resultado', id: msg.id, ok: null });
      return;
    }
    try {
      const info = await sock.groupGetInviteInfo(msg.codigo);
      enviarPadre({ tipo: 'resultado', id: msg.id, ok: info });
    } catch (e) {
      enviarPadre({ tipo: 'resultado', id: msg.id, ok: null });
    }
    return;
  }
});

cambiarEstado('INICIANDO');

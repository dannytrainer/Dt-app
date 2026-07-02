// debug-directo.js
// Prueba MINIMA y TEMPORAL, sin worker.js ni supervisor.
// Objetivo: ver el error completo que devuelve WhatsApp, con logger detallado.
// No toca ningun archivo del sistema. Se puede borrar despues de usarlo.

const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');

const TELEFONO = process.argv[2];
if (!TELEFONO) {
  console.log('Uso: node debug-directo.js 573001234567');
  process.exit(1);
}

const AUTH_FOLDER = path.join(__dirname, 'debug-auth-temp');

async function iniciar() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  console.log('Version WA usada:', version.join('.'));
  console.log('Iniciando socket con logger en modo debug...');
  console.log('');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['DT-APP', 'Chrome', '1.0'],
    logger: pino({ level: 'debug' }),
    version: version
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(TELEFONO.replace(/\D/g, ''));
        console.log('');
        console.log('###### CODIGO: ' + code + ' ######');
        console.log('');
      } catch (e) {
        console.log('ERROR pidiendo pairing code:', e);
      }
    }, 3000);
  }

  sock.ev.on('connection.update', (update) => {
    console.log('');
    console.log('===== connection.update completo =====');
    console.log(JSON.stringify(update, (key, value) => {
      if (Buffer.isBuffer(value)) return '<buffer omitido>';
      return value;
    }, 2));

    if (update.connection === 'close') {
      console.log('');
      console.log('===== ERROR COMPLETO (todas las propiedades) =====');
      const err = update.lastDisconnect && update.lastDisconnect.error;
      if (err) {
        console.log('message:', err.message);
        console.log('isBoom:', err.isBoom);
        if (err.output) {
          console.log('output.statusCode:', err.output.statusCode);
          console.log('output.payload:', JSON.stringify(err.output.payload, null, 2));
        }
        if (err.data) {
          console.log('data completo:', JSON.stringify(err.data, null, 2));
        }
      } else {
        console.log('No hay objeto de error (conexion cerrada sin error explicito)');
      }
      process.exit(0);
    }
    if (update.connection === 'open') {
      console.log('CONECTADO. Dejando correr para confirmar estabilidad.');
    }
  });
}

iniciar().catch(e => console.log('ERROR FATAL:', e));

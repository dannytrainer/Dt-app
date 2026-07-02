// whatsapp/test-worker-solo.js
// Prueba AISLADA de worker.js, sin supervisor.
// Objetivo unico: confirmar que el worker por si solo puede generar
// pairing code y conectar. Si esto falla, el problema es Baileys/WhatsApp,
// no nuestra arquitectura.

const path = require('path');
const { fork } = require('child_process');
const { CMD, EVT } = require('./constants');

const ENT_ID = 'ent_test';
const TELEFONO = process.argv[2];
const AUTH_FOLDER = path.join(__dirname, '..', 'wa-v2-auth-test');

if (!TELEFONO) {
  console.log('Uso: node whatsapp/test-worker-solo.js 573001234567');
  process.exit(1);
}

console.log('=== PRUEBA AISLADA DEL WORKER (sin supervisor) ===');
console.log('entId:', ENT_ID);
console.log('telefono:', TELEFONO);
console.log('authFolder:', AUTH_FOLDER);
console.log('');
console.log('IMPORTANTE: no cierres esta terminal ni la interrumpas con Ctrl+C');
console.log('hasta que veas CONECTADO o un error claro.');
console.log('');

const env = Object.assign({}, process.env, { ENT_ID: ENT_ID, ENT_TELEFONO: TELEFONO, AUTH_FOLDER: AUTH_FOLDER });
const worker = fork(path.join(__dirname, 'worker.js'), [], { env: env, silent: false });

worker.on('message', function (msg) {
  if (msg.tipo === EVT.TRANSICION_ESTADO) {
    console.log('[ESTADO] ' + msg.estadoAnterior + ' -> ' + msg.estadoNuevo + (msg.detalle ? ' (' + msg.detalle + ')' : ''));
    if (msg.estadoNuevo === 'CONECTADO') {
      console.log('');
      console.log('CONECTADO CORRECTAMENTE. Dejando correr 30s para confirmar estabilidad...');
      setTimeout(function () {
        console.log('Prueba completa. Puedes Ctrl+C ahora si quieres.');
      }, 30000);
    }
    if (msg.estadoNuevo === 'SESION_INVALIDA' || msg.estadoNuevo === 'DESCONECTADO_TEMPORAL') {
      console.log('');
      console.log('La conexion no se completo. Esto es informacion util, no un fallo de la prueba.');
    }
  } else if (msg.tipo === EVT.CODIGO) {
    console.log('');
    console.log('CODIGO DE EMPAREJAMIENTO: ' + msg.codigo);
    console.log('Ve a WhatsApp > Dispositivos vinculados > Vincular con numero de telefono');
    console.log('');
  } else if (msg.tipo === EVT.ACK) {
    console.log('[ACK] ' + msg.de);
  } else if (msg.tipo === EVT.SESION_INVALIDA) {
    console.log('[SESION_INVALIDA] motivo=' + msg.motivo);
  } else if (msg.tipo === EVT.ERROR_FATAL) {
    console.log('[ERROR_FATAL] ' + msg.error);
  } else {
    console.log('[MSG]', JSON.stringify(msg));
  }
});

worker.on('exit', function (code) {
  console.log('Worker termino con codigo ' + code);
});

setTimeout(function () {
  console.log('Enviando comando: iniciar');
  worker.send({ id: 'test1', tipo: CMD.INICIAR });
}, 500);

process.on('SIGINT', function () {
  console.log('\nCerrando prueba de forma controlada...');
  worker.send({ id: 'test-stop', tipo: CMD.DETENER });
  setTimeout(function () { process.exit(0); }, 1000);
});

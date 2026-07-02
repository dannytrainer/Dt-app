// whatsapp/logger.js
// Un log por entrenador (worker) + un log de supervisor.
// Formato de linea simple y legible, no JSON, para lectura rapida en Termux.

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');

function asegurarCarpeta() {
  try { fs.mkdirSync(LOGS_DIR, { recursive: true }); } catch (e) {}
}

function timestamp() {
  return new Date().toISOString();
}

function crearLogger(nombre) {
  const archivo = path.join(LOGS_DIR, 'wa_' + nombre + '.log');
  return function log(msg) {
    const linea = '[' + timestamp() + '] [' + nombre + '] ' + msg;
    console.log(linea);
    asegurarCarpeta();
    try {
      fs.appendFileSync(archivo, linea + '\n');
    } catch (e) {
      console.log('No se pudo escribir en ' + archivo + ': ' + e.message);
    }
  };
}

// Logger para el supervisor (uno solo, comun a todos los entrenadores)
const logSupervisor = crearLogger('supervisor');

// Logger por entrenador, uno distinto por cada worker
function crearLoggerWorker(entId) {
  return crearLogger('ent_' + entId);
}

module.exports = { crearLoggerWorker, logSupervisor };

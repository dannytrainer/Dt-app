// whatsapp/state-machine.js
// Define las transiciones validas entre estados del worker.
// Si el codigo intenta una transicion no permitida, se rechaza y se loguea,
// en vez de dejar que el estado quede inconsistente silenciosamente.

const { ESTADOS } = require('./constants');

// Mapa: desde que estado se puede pasar a cuales otros
const TRANSICIONES_VALIDAS = {
  [ESTADOS.INICIANDO]: [ESTADOS.CONECTANDO, ESTADOS.ESPERANDO_AUTH],
  [ESTADOS.ESPERANDO_AUTH]: [ESTADOS.CONECTANDO, ESTADOS.ESPERANDO_PAIRING],
  [ESTADOS.ESPERANDO_PAIRING]: [ESTADOS.CONECTANDO, ESTADOS.SESION_INVALIDA, ESTADOS.DETENIDO],
  [ESTADOS.CONECTANDO]: [ESTADOS.CONECTADO, ESTADOS.ESPERANDO_PAIRING, ESTADOS.DESCONECTADO_TEMPORAL, ESTADOS.SESION_INVALIDA, ESTADOS.DETENIDO],
  [ESTADOS.CONECTADO]: [ESTADOS.DESCONECTADO_TEMPORAL, ESTADOS.SESION_INVALIDA, ESTADOS.DETENIDO],
  [ESTADOS.DESCONECTADO_TEMPORAL]: [ESTADOS.CONECTANDO, ESTADOS.DETENIDO],
  [ESTADOS.SESION_INVALIDA]: [ESTADOS.CONECTANDO, ESTADOS.DETENIDO],
  [ESTADOS.DETENIDO]: []
};

function transicionValida(desde, hacia) {
  if (!TRANSICIONES_VALIDAS.hasOwnProperty(desde)) return false;
  return TRANSICIONES_VALIDAS[desde].includes(hacia);
}

// Pequena maquina de estados con verificacion incorporada.
// uso: const maquina = crearMaquina(logFn); maquina.transicionar(ESTADOS.CONECTANDO)
function crearMaquina(logFn, estadoInicial) {
  let estadoActual = estadoInicial || ESTADOS.INICIANDO;
  const listeners = [];

  return {
    obtenerEstado() {
      return estadoActual;
    },
    onTransicion(fn) {
      listeners.push(fn);
    },
    transicionar(nuevoEstado, detalle) {
      if (nuevoEstado === estadoActual) {
        return true; // no-op, no es un error
      }
      if (!transicionValida(estadoActual, nuevoEstado)) {
        if (logFn) logFn('Transicion RECHAZADA: ' + estadoActual + ' -> ' + nuevoEstado + ' (no es una transicion valida)');
        return false;
      }
      const anterior = estadoActual;
      estadoActual = nuevoEstado;
      if (logFn) logFn('Transicion: ' + anterior + ' -> ' + nuevoEstado + (detalle ? ' (' + detalle + ')' : ''));
      listeners.forEach(function (fn) {
        try { fn(anterior, nuevoEstado, detalle); } catch (e) {}
      });
      return true;
    }
  };
}

module.exports = { transicionValida, crearMaquina, TRANSICIONES_VALIDAS };

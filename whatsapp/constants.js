// whatsapp/constants.js
// Fuente unica de verdad para estados y tipos de mensaje IPC.
// Ningun otro archivo debe usar strings sueltos para esto.

const ESTADOS = {
  INICIANDO: 'INICIANDO',
  ESPERANDO_AUTH: 'ESPERANDO_AUTH',
  ESPERANDO_PAIRING: 'ESPERANDO_PAIRING',
  CONECTANDO: 'CONECTANDO',
  CONECTADO: 'CONECTADO',
  DESCONECTADO_TEMPORAL: 'DESCONECTADO_TEMPORAL',
  SESION_INVALIDA: 'SESION_INVALIDA',
  DETENIDO: 'DETENIDO'
};

// Mensajes que el padre puede enviar al worker
const CMD = {
  INICIAR: 'iniciar',
  RECONECTAR: 'reconectar',
  LIMPIAR_SESION: 'limpiar_sesion',
  ENVIAR: 'enviar',
  ENVIAR_DOC: 'enviarDoc',
  GRUPO_INFO: 'grupoInfo',
  ESTADO: 'estado',
  DETENER: 'detener'
};

// Mensajes que el worker puede enviar al padre
const EVT = {
  ACK: 'ack',
  TRANSICION_ESTADO: 'transicion_estado',
  CODIGO: 'codigo',
  QR: 'qr',
  RESULTADO: 'resultado',
  SESION_INVALIDA: 'sesion_invalida',
  ERROR_FATAL: 'error_fatal'
};

const CONFIG = {
  MAX_INTENTOS_RECONEXION: 5,
  BACKOFFS_MS: [3000, 6000, 12000, 24000, 60000],
  TIMEOUT_ACK_MS: 8000,
  TIMEOUT_RESULTADO_MS: 15000,
  QR_TIMEOUT_MS: 300000,
  PAIRING_DELAY_MS: 3000
};

module.exports = { ESTADOS, CMD, EVT, CONFIG };

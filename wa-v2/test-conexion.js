const path = require('path');
const supervisor = require('./wa-supervisor');

const ENT_ID = 'ent_test';
const TELEFONO = process.argv[2];
const AUTH_FOLDER = path.join(__dirname, 'auth_test');

if (!TELEFONO) {
  console.log('Uso: node wa-v2/test-conexion.js 573001234567');
  process.exit(1);
}

console.log('=== PRUEBA DE CONEXION wa-v2 ===');
console.log('Entrenador de prueba:', ENT_ID);
console.log('Telefono:', TELEFONO);
console.log('Carpeta auth:', AUTH_FOLDER);
console.log('');

let ultimoEstado = null;
let ultimoCodigo = null;

supervisor.conectar(ENT_ID, TELEFONO, AUTH_FOLDER).then(() => {
  console.log('Supervisor: worker lanzado, esperando eventos...');
  console.log('');
});

const intervalo = setInterval(async () => {
  const info = await supervisor.estado(ENT_ID);
  if (info.estado !== ultimoEstado) {
    console.log('[' + new Date().toLocaleTimeString() + '] Estado: ' + info.estado);
    ultimoEstado = info.estado;
  }
  if (info.pairingCode && info.pairingCode !== ultimoCodigo) {
    console.log('');
    console.log('🔑🔑🔑 CODIGO DE EMPAREJAMIENTO: ' + info.pairingCode + ' 🔑🔑🔑');
    console.log('Ingresalo en WhatsApp > Dispositivos vinculados > Vincular con numero de telefono');
    console.log('');
    ultimoCodigo = info.pairingCode;
  }
  if (info.estado === 'CONECTADO') {
    console.log('');
    console.log('✅✅✅ CONECTADO CORRECTAMENTE ✅✅✅');
    console.log('Dejando correr 30s mas para confirmar estabilidad...');
    setTimeout(() => {
      console.log('Prueba finalizada. El proceso sigue vivo, puedes Ctrl+C cuando quieras.');
      clearInterval(intervalo);
    }, 30000);
  }
  if (info.requiereAtencion) {
    console.log('');
    console.log('⚠️ REQUIERE ATENCION: se agotaron los reintentos automaticos.');
    clearInterval(intervalo);
  }
}, 2000);

process.on('SIGINT', () => {
  console.log('\nCerrando prueba...');
  supervisor.desconectar(ENT_ID).finally(() => process.exit(0));
});

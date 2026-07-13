// Corre UNA VEZ POR SEMANA (cron). Persiste el contador real de sobrecarga por cliente/músculo.
// La UI y proyeccion.js NUNCA deben llamar esto directamente — usan evaluarSoloLectura (alertas.js).
const fs = require('fs');
const path = require('path');
const { calcularEstimuloSemanal } = require('./estimulo');
const { evaluarYPersistir } = require('./alertas');

const usuarios = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'usuarios.json'), 'utf8'));

for (const cliente of usuarios) {
  try {
    const { estimulo } = calcularEstimuloSemanal(cliente.id);
    for (const musculo of Object.keys(estimulo)) {
      evaluarYPersistir(cliente.id, musculo, estimulo[musculo]);
    }
    console.log(`✓ ${cliente.nombre || cliente.id}: ${Object.keys(estimulo).length} músculos actualizados`);
  } catch (e) {
    console.error(`✗ ${cliente.id}: ${e.message}`);
  }
}

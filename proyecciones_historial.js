const fs = require('fs');
const path = require('path');

const ARCHIVO = path.join(__dirname, 'data', 'proyecciones_historial.json');

function leer() {
  try { return JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')); } catch { return {}; }
}

function guardar(data) {
  fs.writeFileSync(ARCHIVO, JSON.stringify(data, null, 2));
}

// Guarda un snapshot de la proyección hecha HOY, por cliente y perímetro.
// Deduplicado por fecha: si ya se guardó un snapshot hoy para ese cliente+perímetro,
// lo reemplaza (no acumula duplicados si el entrenador abre la pantalla varias veces al día).
// Esto es la base para D2/D3 (comparar proyectado vs. medido realmente, y ajustar).
function registrarSnapshot(clienteId, perimetro, datos) {
  const data = leer();
  if (!data[clienteId]) data[clienteId] = {};
  if (!data[clienteId][perimetro]) data[clienteId][perimetro] = [];

  const hoy = new Date().toISOString().split('T')[0];
  const historialPerimetro = data[clienteId][perimetro];

  const snapshot = {
    fecha: hoy,
    nivel: datos.nivel,
    fuenteEstimulo: datos.fuenteEstimulo,
    estimuloGlobal: datos.estimuloGlobal,
    estimuloEfectivo: datos.estimuloEfectivo,
    proyeccionAproximada: datos.proyeccionAproximada,
    // Guardamos la proyección de 3 meses como referencia principal (la más cercana en el tiempo,
    // la más útil para comparar contra la siguiente medida real que se tome).
    cmMinFinal3m: datos.proy3 && datos.proy3.cmMinFinal,
    cmMaxFinal3m: datos.proy3 && datos.proy3.cmMaxFinal,
  };

  const idxHoy = historialPerimetro.findIndex(s => s.fecha === hoy);
  if (idxHoy >= 0) {
    historialPerimetro[idxHoy] = snapshot;
  } else {
    historialPerimetro.push(snapshot);
  }

  guardar(data);
  return snapshot;
}

function obtenerHistorial(clienteId, perimetro) {
  const data = leer();
  return (data[clienteId] && data[clienteId][perimetro]) || [];
}

module.exports = { registrarSnapshot, obtenerHistorial, leer };

if (require.main === module) {
  const id = process.argv[2] || 'cli_1778377049231';
  console.log('Historial de snapshots para', id, ':');
  console.log(JSON.stringify(leer()[id] || {}, null, 2));
}

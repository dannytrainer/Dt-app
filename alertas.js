const fs = require('fs');
const path = require('path');
const { evaluarSobrecarga } = require('./proyeccion/hipertrofia');

const ARCHIVO = path.join(__dirname, 'data', 'alertas_sobrecarga.json');

function leer() {
  try { return JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')); } catch { return {}; }
}

function guardar(data) {
  fs.writeFileSync(ARCHIVO, JSON.stringify(data, null, 2));
}

// Se llama UNA vez por semana por cliente (desde el recálculo semanal — ver recalculo_semanal.js).
// Lee cuántas semanas seguidas lleva ese músculo sobre el umbral, actualiza el contador,
// lo guarda, y devuelve el resultado (igual que evaluarSobrecarga, pero con memoria real).
// ⚠️ NO llamar desde la UI ni desde proyectarCliente() — tiene side-effect de escritura.
function evaluarYPersistir(clienteId, musculo, estimuloEfectivoSemanal, nivel = 'principiante') {
  const data = leer();
  if (!data[clienteId]) data[clienteId] = {};
  const contadorPrevio = data[clienteId][musculo] || 0;
  const resultado = evaluarSobrecarga(estimuloEfectivoSemanal, contadorPrevio, nivel);
  data[clienteId][musculo] = resultado.semanasConsecutivas;
  guardar(data);
  return resultado;
}

// Solo LECTURA — para la UI y para proyectarCliente(). No escribe nada.
// Usa el contador YA persistido (de la última corrida semanal real) para calcular
// el estado actual, sin incrementarlo ni guardarlo. Seguro de llamar tantas veces
// como se quiera (cada carga de pantalla, cada proyección a 3/6/12 meses, etc.)
function evaluarSoloLectura(clienteId, musculo, estimuloEfectivoSemanal, nivel = 'principiante') {
  const data = leer();
  const contadorPersistido = (data[clienteId] && data[clienteId][musculo]) || 0;
  // No incrementa: solo evalúa si el estímulo actual está sobre el umbral,
  // usando el contador que ya existe en disco como base de lectura.
  return evaluarSobrecarga(estimuloEfectivoSemanal, Math.max(contadorPersistido - 1, 0), nivel);
}

module.exports = { evaluarYPersistir, evaluarSoloLectura, leer };

if (require.main === module) {
  const [,, clienteId, musculo, estimuloArg] = process.argv;
  if (!clienteId || !musculo || !estimuloArg) {
    console.log('Uso: node alertas.js <clienteId> <musculo> <estimulo>');
    process.exit(1);
  }
  console.log(evaluarYPersistir(clienteId, musculo, parseFloat(estimuloArg)));
}

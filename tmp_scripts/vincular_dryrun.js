const fs = require('fs');

function normalizar(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const rutinas = JSON.parse(fs.readFileSync('data/rutinas.json', 'utf8'));
const enciclopedia = JSON.parse(fs.readFileSync('data/enciclopedia.json', 'utf8'));

// enciclopedia puede ser array directo o {ejercicios:[...]}
const listaEnc = Array.isArray(enciclopedia) ? enciclopedia : (enciclopedia.ejercicios || []);
const encNormalizados = listaEnc.map(e => ({ id: e.id, nombre: e.nombre, norm: normalizar(e.nombre) }));

let totalEjercicios = 0;
let totalVinculados = 0;
let totalYaVinculados = 0;
let totalSinCoincidencia = 0;
const propuestas = [];

Object.keys(rutinas).forEach(clienteId => {
  const cliente = rutinas[clienteId];
  if (!cliente || typeof cliente !== 'object') return;
  Object.keys(cliente).forEach(dia => {
    const d = cliente[dia];
    if (!d || !Array.isArray(d.ejercicios)) return;
    d.ejercicios.forEach(ej => {
      totalEjercicios++;
      if (ej.enciclopedia_id) { totalYaVinculados++; return; }
      const normEj = normalizar(ej.nombre);
      const match = encNormalizados.find(e => e.norm === normEj);
      if (match) {
        totalVinculados++;
        propuestas.push({ clienteId, dia, ejercicio: ej.nombre, enc_id: match.id, enc_nombre: match.nombre });
      } else {
        totalSinCoincidencia++;
      }
    });
  });
});

console.log('=== RESUMEN ===');
console.log('Total ejercicios en rutinas:', totalEjercicios);
console.log('Ya vinculados:', totalYaVinculados);
console.log('Coincidencias encontradas (exacta, sin tildes/mayúsculas):', totalVinculados);
console.log('Sin coincidencia:', totalSinCoincidencia);
console.log('');
console.log('=== PROPUESTAS DE VINCULACIÓN ===');
propuestas.forEach(p => {
  console.log(p.clienteId, '|', p.dia, '|', p.ejercicio, '->', p.enc_nombre, '(' + p.enc_id + ')');
});

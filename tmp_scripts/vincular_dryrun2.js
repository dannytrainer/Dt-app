const fs = require('fs');

function normalizar(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/^[a-z]\d{1,3}\s+/, '') // quitar código tipo "g10 ", "p06 ", "r05 " al inicio
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const rutinas = JSON.parse(fs.readFileSync('data/rutinas.json', 'utf8'));
const enciclopedia = JSON.parse(fs.readFileSync('data/enciclopedia.json', 'utf8'));
const listaEnc = Array.isArray(enciclopedia) ? enciclopedia : (enciclopedia.ejercicios || []);
const encNormalizados = listaEnc.map(e => ({ id: e.id, nombre: e.nombre, norm: normalizar(e.nombre) }));

let totalEjercicios = 0, totalYaVinculados = 0, totalExacto = 0, totalSinCoincidencia = 0;
const propuestasExactas = [];
const sinCoincidencia = [];

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
        totalExacto++;
        propuestasExactas.push({ clienteId, dia, ejercicio: ej.nombre, enc_id: match.id, enc_nombre: match.nombre });
      } else {
        totalSinCoincidencia++;
        sinCoincidencia.push(clienteId + ' | ' + dia + ' | ' + ej.nombre);
      }
    });
  });
});

console.log('=== RESUMEN ===');
console.log('Total ejercicios en rutinas:', totalEjercicios);
console.log('Ya vinculados:', totalYaVinculados);
console.log('Coincidencias EXACTAS (ignorando código prefijo):', totalExacto);
console.log('Sin coincidencia:', totalSinCoincidencia);
console.log('');
console.log('=== PROPUESTAS EXACTAS ===');
propuestasExactas.forEach(p => console.log(p.clienteId, '|', p.dia, '|', p.ejercicio, '->', p.enc_nombre, '(' + p.enc_id + ')'));
console.log('');
console.log('=== SIN COINCIDENCIA (primeros 40) ===');
sinCoincidencia.slice(0, 40).forEach(s => console.log(s));

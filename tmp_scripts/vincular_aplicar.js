const fs = require('fs');

function normalizar(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/^[a-z]\d{1,3}\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const rutinas = JSON.parse(fs.readFileSync('data/rutinas.json', 'utf8'));
const enciclopedia = JSON.parse(fs.readFileSync('data/enciclopedia.json', 'utf8'));
const listaEnc = Array.isArray(enciclopedia) ? enciclopedia : (enciclopedia.ejercicios || []);
const encNormalizados = listaEnc.map(e => ({ id: e.id, nombre: e.nombre, norm: normalizar(e.nombre) }));

let vinculados = 0;

Object.keys(rutinas).forEach(clienteId => {
  const cliente = rutinas[clienteId];
  if (!cliente || typeof cliente !== 'object') return;
  Object.keys(cliente).forEach(dia => {
    const d = cliente[dia];
    if (!d || !Array.isArray(d.ejercicios)) return;
    d.ejercicios.forEach(ej => {
      if (ej.enciclopedia_id) return;
      const normEj = normalizar(ej.nombre);
      const match = encNormalizados.find(e => e.norm === normEj);
      if (match) {
        ej.enciclopedia_id = match.id;
        vinculados++;
      }
    });
  });
});

fs.writeFileSync('data/rutinas.json', JSON.stringify(rutinas, null, 2), 'utf8');
console.log('Ejercicios vinculados y guardados:', vinculados);

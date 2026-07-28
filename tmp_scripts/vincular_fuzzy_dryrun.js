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

function palabras(s) {
  return new Set(normalizar(s).split(' ').filter(w => w.length > 2));
}

function similitud(setA, setB) {
  let interseccion = 0;
  setA.forEach(w => { if (setB.has(w)) interseccion++; });
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : interseccion / union;
}

const rutinas = JSON.parse(fs.readFileSync('data/rutinas.json', 'utf8'));
const enciclopedia = JSON.parse(fs.readFileSync('data/enciclopedia.json', 'utf8'));
const listaEnc = Array.isArray(enciclopedia) ? enciclopedia : (enciclopedia.ejercicios || []);
const encPalabras = listaEnc.map(e => ({ id: e.id, nombre: e.nombre, palabras: palabras(e.nombre) }));

const EXCLUIR_CLIENTE = 'cli_1778216541791'; // "Yo"

const propuestas = [];

Object.keys(rutinas).forEach(clienteId => {
  if (clienteId === EXCLUIR_CLIENTE) return;
  const cliente = rutinas[clienteId];
  if (!cliente || typeof cliente !== 'object') return;
  Object.keys(cliente).forEach(dia => {
    const d = cliente[dia];
    if (!d || !Array.isArray(d.ejercicios)) return;
    d.ejercicios.forEach(ej => {
      if (ej.enciclopedia_id) return;
      const pEj = palabras(ej.nombre);
      let mejor = null, mejorScore = 0;
      encPalabras.forEach(e => {
        const score = similitud(pEj, e.palabras);
        if (score > mejorScore) { mejorScore = score; mejor = e; }
      });
      if (mejor && mejorScore >= 0.5) {
        propuestas.push({ clienteId, dia, ejercicio: ej.nombre, enc_id: mejor.id, enc_nombre: mejor.nombre, score: mejorScore.toFixed(2) });
      }
    });
  });
});

console.log('Propuestas encontradas (score >= 0.5):', propuestas.length);
console.log('');
propuestas.forEach(p => console.log(p.clienteId, '|', p.dia, '|', p.ejercicio, '->', p.enc_nombre, '(' + p.enc_id + ')', 'score=' + p.score));

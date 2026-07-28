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
const usuarios = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
const enciclopedia = JSON.parse(fs.readFileSync('data/enciclopedia.json', 'utf8'));
const listaEnc = Array.isArray(enciclopedia) ? enciclopedia : (enciclopedia.ejercicios || []);
const encPalabras = listaEnc.map(e => ({ id: e.id, nombre: e.nombre, grupo: e.grupo || '?', palabras: palabras(e.nombre) }));
const listaU = Array.isArray(usuarios) ? usuarios : Object.values(usuarios);
const nombrePorId = {};
listaU.forEach(u => { nombrePorId[u.id] = u.nombre; });

const EXCLUIR_CLIENTE = 'cli_1778216541791';
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
        propuestas.push({
          clienteNombre: nombrePorId[clienteId] || clienteId,
          dia, ejercicio: ej.nombre,
          enc_nombre: mejor.nombre, enc_grupo: mejor.grupo, enc_id: mejor.id,
          score: mejorScore
        });
      }
    });
  });
});

fs.writeFileSync('tmp_scripts/propuestas.json', JSON.stringify(propuestas, null, 2));

propuestas.forEach((p, i) => {
  console.log((i+1) + '. [' + p.clienteNombre + ' / ' + p.dia + ']');
  console.log('   Rutina dice: "' + p.ejercicio + '"');
  console.log('   Propuesta: "' + p.enc_nombre + '" (grupo: ' + p.enc_grupo + ') — id: ' + p.enc_id);
  console.log('');
});

const fs = require('fs');
const rutinas = JSON.parse(fs.readFileSync('data/rutinas.json', 'utf8'));
const usuarios = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
const listaU = Array.isArray(usuarios) ? usuarios : Object.values(usuarios);
const nombrePorId = {};
listaU.forEach(u => { nombrePorId[u.id] = u.nombre; });

const conteo = {};
Object.keys(rutinas).forEach(clienteId => {
  const cliente = rutinas[clienteId];
  if (!cliente || typeof cliente !== 'object') return;
  Object.keys(cliente).forEach(dia => {
    const d = cliente[dia];
    if (!d || !Array.isArray(d.ejercicios)) return;
    d.ejercicios.forEach(ej => {
      if (ej.enciclopedia_id) return;
      conteo[clienteId] = (conteo[clienteId] || 0) + 1;
    });
  });
});

Object.keys(conteo).forEach(id => {
  console.log(id, '|', nombrePorId[id] || '(sin nombre)', '|', conteo[id], 'sin vincular');
});

const fs = require('fs');
const path = 'public/js/app-pesos.js';
let c = fs.readFileSync(path, 'utf8');

const buscar = `function tcGuardarPesos() {
  var uid = (_tcUsuario && _tcUsuario.id) || 'x';
  if (!_tcEjercicios) return;`;
const nuevo = `function tcGuardarPesos() {
  alert('DEBUG: entro a tcGuardarPesos, _tcEjercicios.length=' + (_tcEjercicios ? _tcEjercicios.length : 'undefined'));
  var uid = (_tcUsuario && _tcUsuario.id) || 'x';
  if (!_tcEjercicios) return;`;

if (c.includes(buscar)) {
  c = c.replace(buscar, nuevo);
  fs.writeFileSync(path, c, 'utf8');
  console.log('Debug de inicio agregado');
} else {
  console.log('NO SE ENCONTRO - revisar formato exacto');
}

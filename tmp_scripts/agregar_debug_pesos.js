const fs = require('fs');
const path = 'public/js/app-pesos.js';
let c = fs.readFileSync(path, 'utf8');

const buscar = `      if (ej.enciclopedia_id) {`;
const nuevo = `      alert('DEBUG tcGuardarPesos: ej=' + ej.nombre + ' enciclopedia_id=' + ej.enciclopedia_id);
      if (ej.enciclopedia_id) {`;

if (c.includes(buscar)) {
  c = c.replace(buscar, nuevo);
  fs.writeFileSync(path, c, 'utf8');
  console.log('Debug agregado correctamente');
} else {
  console.log('NO SE ENCONTRO el texto a reemplazar - revisar manualmente');
}

const fs = require('fs');
const archivo = 'public/index.html';
let contenido = fs.readFileSync(archivo, 'utf8');

const original = '<script src="js/app-terminal.js"></script>';
const nuevo = '<script src="js/app-terminal.js?v=' + Date.now() + '"></script>';

if (!contenido.includes(original)) {
  console.log('❌ NO SE ENCONTRÓ el texto original exacto. No se modificó nada.');
  process.exit(1);
}
if (contenido.split(original).length - 1 !== 1) {
  console.log('❌ El texto aparece más de una vez. No se modificó nada.');
  process.exit(1);
}
contenido = contenido.replace(original, nuevo);
fs.writeFileSync(archivo, contenido);
console.log('✅ Cache buster agregado.');

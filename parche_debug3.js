const fs = require('fs');
const archivo = 'public/js/app-terminal.js';
let contenido = fs.readFileSync(archivo, 'utf8');

const original = `      if (txt) txt.textContent = h+':'+m+':'+s;
      _tcCheckTiempoLimite();`;

const nuevo = `      if (txt) txt.textContent = h+':'+m+':'+s;
      document.title = 'RESTA:' + restanteSeg + 's';
      _tcCheckTiempoLimite();`;

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
console.log('✅ Debug de título agregado.');

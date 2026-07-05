const fs = require('fs');
const archivo = 'public/js/admin-inicio.js';
let contenido = fs.readFileSync(archivo, 'utf8');

const original = `<option value="0" \${!d.tiempo_max_min?'selected':''}>Sin límite</option>`;
const nuevo = `<option value="0" \${!d.tiempo_max_min?'selected':''}>Sin límite</option><option value="2" \${d.tiempo_max_min==2?'selected':''}>2 min (PRUEBA)</option>`;

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
console.log('✅ Opción de 2 minutos agregada para prueba.');

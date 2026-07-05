const fs = require('fs');
const archivo = 'public/js/app-terminal.js';
let contenido = fs.readFileSync(archivo, 'utf8');

const original = `  banner.style.display = 'flex';
  _tcCierrePorTiempoEjecutado = false;`;

const nuevo = `  banner.style.display = 'flex';
  _tcCierrePorTiempoEjecutado = false;
  console.log('DEBUG _tcDia:', _tcDia, '_tcRutina existe:', !!_tcRutina, 'tiempo_max_min:', _tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].tiempo_max_min);
  const _debugTxt = document.getElementById('tc-timer-rutina-txt');
  if (_debugTxt) _debugTxt.title = 'dia=' + _tcDia + ' tmax=' + (_tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].tiempo_max_min);`;

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
console.log('✅ Debug temporal agregado.');

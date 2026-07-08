const fs = require('fs');
const path = process.env.HOME + '/Dt-app/public/js/app-terminal.js';
const nuevo = fs.readFileSync(process.env.HOME + '/Dt-app/fix_dia_pendiente.js', 'utf8');
let contenido = fs.readFileSync(path, 'utf8');
const inicioMarcador = 'let _tcCierrePorTiempoEjecutado = false;';
const finMarcador = 'function tcMostrarBannerTimer(';
const idxInicio = contenido.indexOf(inicioMarcador);
const idxFin = contenido.indexOf(finMarcador);
if (idxInicio === -1 || idxFin === -1 || idxFin <= idxInicio) {
  console.log('ERROR: no se encontraron los marcadores. No se modificó nada.');
  process.exit(1);
}
const resultado = contenido.slice(0, idxInicio) + nuevo + '\n' + contenido.slice(idxFin);
fs.writeFileSync(path, resultado, 'utf8');
console.log('OK: archivo reemplazado correctamente.');

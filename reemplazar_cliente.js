const fs = require('fs');
const path = process.env.HOME + '/Dt-app/public/js/app-terminal.js';
const nuevo = fs.readFileSync(process.env.HOME + '/Dt-app/nuevo_render_cliente.js', 'utf8');
let contenido = fs.readFileSync(path, 'utf8');
const marcadorInicio = "ejercicios.length + ' ejercicios</div>';";
const marcadorFin = 'if (notas) {';
const idxMarcadorInicio = contenido.indexOf(marcadorInicio);
if (idxMarcadorInicio === -1) {
  console.log('ERROR: no se encontró el marcador de inicio. No se modificó nada.');
  process.exit(1);
}
const idxInicioLinea = contenido.lastIndexOf('\n', idxMarcadorInicio) + 1;
const idxFin = contenido.indexOf(marcadorFin, idxMarcadorInicio);
if (idxFin === -1) {
  console.log('ERROR: no se encontró el marcador de fin. No se modificó nada.');
  process.exit(1);
}
const resultado = contenido.slice(0, idxInicioLinea) + nuevo + '\n  ' + contenido.slice(idxFin);
fs.writeFileSync(path, resultado, 'utf8');
console.log('OK: archivo reemplazado correctamente.');

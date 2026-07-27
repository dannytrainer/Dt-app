const fs = require('fs');
const path = 'public/js/herramientas-enc.js';
let contenido = fs.readFileSync(path, 'utf8');

const buscar = "if (semanas.length === 0) { cont2.innerHTML = ''; return; }";
if (!contenido.includes(buscar)) { console.log("ERROR: no encontrado"); process.exit(1); }

const reemplazo = "if (semanas.length === 0) { cont2.innerHTML = '<div style=\"color:orange;font-size:11px\">DEBUG vacio: uid=' + uid + ' encId=' + encId + '</div>'; return; }";

contenido = contenido.replace(buscar, reemplazo);
fs.writeFileSync(path, contenido);
console.log("OK");

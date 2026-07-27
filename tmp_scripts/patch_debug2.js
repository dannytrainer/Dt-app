const fs = require('fs');
const path = 'public/js/herramientas-enc.js';
let contenido = fs.readFileSync(path, 'utf8');

const buscar = "    if (!uid || !enModoCliente) return;\n    fetch('/api/historial-pesos/' + uid + '/' + encId)";
if (!contenido.includes(buscar)) { console.log("ERROR: no encontrado"); process.exit(1); }

const reemplazo = "    if (!uid || !enModoCliente) { var c0=document.getElementById('enc-progreso-peso'); if(c0) c0.innerHTML='<div style=\"color:red;font-size:11px\">DEBUG enc: uid=' + uid + ' enModoCliente=' + enModoCliente + ' tcApp=' + (tcApp?tcApp.style.display:'no-existe') + '</div>'; return; }\n    fetch('/api/historial-pesos/' + uid + '/' + encId)";

contenido = contenido.replace(buscar, reemplazo);
fs.writeFileSync(path, contenido);
console.log("OK");

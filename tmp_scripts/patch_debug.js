const fs = require('fs');
const path = 'public/js/admin-inicio.js';
let contenido = fs.readFileSync(path, 'utf8');

const buscar = "if (!uid) return;\n    fetch('/api/historial-pesos/' + uid + '/' + encId).then(function(r){return r.json();}).then(function(res){\n      var cont2 = document.getElementById('enc-progreso-peso');\n      if (!cont2) return;\n      var semanas = res.semanas || [];\n      if (semanas.length === 0) { cont2.innerHTML = ''; return; }";

if (!contenido.includes(buscar)) {
  console.log("ERROR: no se encontró el texto exacto");
  process.exit(1);
}

const reemplazo = "if (!uid) { var c0=document.getElementById('enc-progreso-peso'); if(c0) c0.innerHTML='<div style=\"color:red;font-size:12px\">DEBUG: no hay uid</div>'; return; }\n    fetch('/api/historial-pesos/' + uid + '/' + encId).then(function(r){return r.json();}).then(function(res){\n      var cont2 = document.getElementById('enc-progreso-peso');\n      if (!cont2) return;\n      var semanas = res.semanas || [];\n      if (semanas.length === 0) { cont2.innerHTML = '<div style=\"color:orange;font-size:12px\">DEBUG: uid=' + uid + ' encId=' + encId + ' semanas vacio. res=' + JSON.stringify(res) + '</div>'; return; }";

contenido = contenido.replace(buscar, reemplazo);
fs.writeFileSync(path, contenido);
console.log("OK: parche debug aplicado");

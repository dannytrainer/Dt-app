const fs = require('fs');
const path = 'public/js/app-utilidades.js';
let lineas = fs.readFileSync(path, 'utf8').split('\n');

function agregarDebug(idx, etiqueta) {
  const linea = lineas[idx];
  if (linea.trim() !== "if (!uid || !enModoCliente) return;") {
    console.log("ERROR en línea " + (idx+1) + ": " + JSON.stringify(linea));
    return false;
  }
  lineas[idx] = "    if (!uid || !enModoCliente) { var c0=document.getElementById('enc-progreso-peso'); if(c0) c0.innerHTML='<div style=\"color:red;font-size:11px\">DEBUG " + etiqueta + ": uid=' + uid + ' enModoCliente=' + enModoCliente + '</div>'; return; }";
  return true;
}

// índices 0-based
agregarDebug(1444, "utilidades-A");
agregarDebug(1859, "utilidades-B");

fs.writeFileSync(path, lineas.join('\n'));
console.log("Listo");

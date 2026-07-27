const fs = require('fs');
const archivos = ['public/js/herramientas-enc.js', 'public/js/app-utilidades.js'];

const buscar = "var uid = (typeof _tcUsuario !== 'undefined' && _tcUsuario && _tcUsuario.id) || null;\n    if (!uid) return;";
const reemplazo = "var tcApp = document.getElementById('terminal-cliente-app');\n    var enModoCliente = tcApp && tcApp.style.display !== 'none';\n    var uid = (typeof _tcUsuario !== 'undefined' && _tcUsuario && _tcUsuario.id) || null;\n    if (!uid || !enModoCliente) return;";

archivos.forEach(function(path) {
  let contenido = fs.readFileSync(path, 'utf8');
  const partes = contenido.split(buscar);
  const ocurrencias = partes.length - 1;
  console.log(path + ": " + ocurrencias + " ocurrencias encontradas");
  if (ocurrencias > 0) {
    contenido = partes.join(reemplazo);
    fs.writeFileSync(path, contenido);
    console.log(path + ": parche aplicado");
  }
});

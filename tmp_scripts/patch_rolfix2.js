const fs = require('fs');
const archivos = ['public/js/herramientas-enc.js', 'public/js/app-utilidades.js'];

const buscar = "var enModoCliente = tcApp && tcApp.style.display !== 'none';";
const reemplazo = "var enModoCliente = tcApp && tcApp.style.display === 'flex';";

archivos.forEach(function(path) {
  let contenido = fs.readFileSync(path, 'utf8');
  const partes = contenido.split(buscar);
  const ocurrencias = partes.length - 1;
  console.log(path + ": " + ocurrencias + " ocurrencias encontradas");
  if (ocurrencias > 0) {
    contenido = partes.join(reemplazo);
    fs.writeFileSync(path, contenido);
  }
});

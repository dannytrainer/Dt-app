const fs = require('fs');
let c = fs.readFileSync('rutas_historial.js', 'utf8');
c = c.replace(
  "h[req.params.id].peso.push(",
  "if (!h[req.params.id]) h[req.params.id] = { peso: [], medidas: [] };\n  h[req.params.id].peso.push("
);
c = c.replace(
  "h[req.params.id].medidas.push(",
  "if (!h[req.params.id]) h[req.params.id] = { peso: [], medidas: [] };\n  h[req.params.id].medidas.push("
);
fs.writeFileSync('rutas_historial.js', c);
console.log('ok');

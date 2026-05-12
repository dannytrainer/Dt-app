const fs = require('fs');
let c = fs.readFileSync('public/medidas.js', 'utf8');
c = c.replace(
  "onclick=\"compartirProgreso('${id}','${nombre}')\"",
  "onclick=\"compartirProgreso(window.clienteMedidasId,window.clienteMedidasNombre)\""
);
fs.writeFileSync('public/medidas.js', c);
console.log('ok');

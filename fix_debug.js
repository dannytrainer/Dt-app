const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  "onclick=\"abrirMedidas('${u.id}','${u.nombre}')\"",
  "onclick=\"console.log('click medidas');abrirMedidas('${u.id}','${u.nombre}')\""
);
fs.writeFileSync('public/index.html', c);
console.log('ok');

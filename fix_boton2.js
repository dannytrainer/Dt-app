const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  "onclick=\"abrirRutina('${u.id}','${u.nombre}')\">📋 Rutina</button>",
  "onclick=\"abrirMedidas('${u.id}','${u.nombre}')\">📊 Medidas</button>"
);
fs.writeFileSync('public/index.html', c);
console.log('ok');

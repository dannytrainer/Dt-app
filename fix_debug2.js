const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace("onclick=\"console.log('click medidas');abrirMedidas(", "onclick=\"abrirMedidas(");
fs.writeFileSync('public/index.html', c);
console.log('ok');

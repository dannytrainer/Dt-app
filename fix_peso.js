const fs = require('fs');
let c = fs.readFileSync('public/medidas.js', 'utf8');
c = c.replace(
  "showMTab('perfil');\n    await renderPerfil(id);",
  "showMTab('perfil');\n    await renderPerfil(id);\n    renderPeso(id);"
);
fs.writeFileSync('public/medidas.js', c);
console.log('ok');

const fs = require('fs');
let c = fs.readFileSync('public/medidas.js', 'utf8');
c = c.replace(
  "showMTab('peso');\n    await renderPeso(id);",
  "showMTab('perfil');\n    await renderPerfil(id);"
);
fs.writeFileSync('public/medidas.js', c);
console.log('ok4');

const fs = require('fs');
let c = fs.readFileSync('public/medidas.js', 'utf8');
c = c.replace(
  "if (t === 'analisis') await renderAnalisis(id);",
  "if (t === 'analisis') await renderAnalisis(id);\n  if (t === 'tests') await renderTests(id);"
);
c = c.replace(
  "['perfil','peso','medidas','analisis'].forEach(x => {",
  "['perfil','peso','medidas','analisis','tests'].forEach(x => {"
);
fs.writeFileSync('public/medidas.js', c);
console.log('ok3');

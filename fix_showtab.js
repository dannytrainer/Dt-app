const fs = require('fs');
let c = fs.readFileSync('public/medidas.js', 'utf8');
c = c.replace(
  "['peso','medidas','analisis'].forEach(x => {",
  "['perfil','peso','medidas','analisis'].forEach(x => {"
);
c = c.replace(
  "if (t === 'medidas') await renderMedidas(id);",
  "if (t === 'perfil') await renderPerfil(id);\n  if (t === 'medidas') await renderMedidas(id);"
);
fs.writeFileSync('public/medidas.js', c);
console.log('ok3');

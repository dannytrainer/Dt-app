const fs = require('fs');
let html = fs.readFileSync('./public/index.html','utf8');

html = html.replace(
  'function mostrarRecomendacionesMacros() {\n  const sel = document.getElementById(\'ali-objetivo\');',
  'function mostrarRecomendacionesMacros() {\n  const sel = document.getElementById(\'ali-objetivo\');\n  console.log("OBJETIVO ACTUAL:", sel ? sel.value : "NO ENCONTRADO");'
);

fs.writeFileSync('./public/index.html', html);
console.log('OK');

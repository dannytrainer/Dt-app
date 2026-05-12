const fs = require('fs');
let c = fs.readFileSync('public/medidas.js', 'utf8');
c = c.replace(
  "function showMTab(t) {",
  "async function showMTabLoad(t, id) {\n  showMTab(t);\n  if(t==='medidas') await renderMedidas(id);\n  if(t==='analisis') await renderAnalisis(id);\n}\nfunction showMTab(t) {"
);
c = c.replace(
  /onclick="showMTab\('peso'\)"/g,
  'onclick="showMTabLoad(\'peso\',window.clienteMedidasId)"'
);
c = c.replace(
  /onclick="showMTab\('medidas'\)"/g,
  'onclick="showMTabLoad(\'medidas\',window.clienteMedidasId)"'
);
c = c.replace(
  /onclick="showMTab\('analisis'\)"/g,
  'onclick="showMTabLoad(\'analisis\',window.clienteMedidasId)"'
);
fs.writeFileSync('public/medidas.js', c);
console.log('ok');

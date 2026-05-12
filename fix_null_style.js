const fs = require('fs');
let c = fs.readFileSync('public/medidas.js', 'utf8');
c = c.replace(
  "function showMTab(t) {\n  ['perfil','peso','medidas','analisis','tests'].forEach(x => {\n    document.getElementById('msec-'+x).style.display = x===t ? 'block' : 'none';",
  "function showMTab(t) {\n  ['perfil','peso','medidas','analisis','tests'].forEach(x => {\n    const el=document.getElementById('msec-'+x);\n    if(el) el.style.display = x===t ? 'block' : 'none';"
);
c = c.replace(
  "const btn = document.getElementById('mtab-'+x);\n    btn.className = 'btn ' + (x===t ? 'br' : 'bg');\n    btn.style.flex = '1';\n    btn.style.fontSize = '12px';",
  "const btn = document.getElementById('mtab-'+x);\n    if(btn){btn.className = 'btn ' + (x===t ? 'br' : 'bg');\n    btn.style.flex = '1';\n    btn.style.fontSize = '12px';}"
);
fs.writeFileSync('public/medidas.js', c);
console.log('ok1');

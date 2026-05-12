const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  '<button id="mtab-peso" class="btn br" style="flex:1;font-size:12px" onclick="showMTabLoad(\'peso\',window.clienteMedidasId)">⚖️ Peso</button>',
  '<button id="mtab-perfil" class="btn bg" style="flex:1;font-size:12px" onclick="showMTabLoad(\'perfil\',window.clienteMedidasId)">👤 Perfil</button>\n<button id="mtab-peso" class="btn br" style="flex:1;font-size:12px" onclick="showMTabLoad(\'peso\',window.clienteMedidasId)">⚖️ Peso</button>'
);
c = c.replace(
  '<div id="msec-peso"></div>',
  '<div id="msec-perfil" style="display:none"></div>\n<div id="msec-peso"></div>'
);
fs.writeFileSync('public/index.html', c);
console.log('ok1');

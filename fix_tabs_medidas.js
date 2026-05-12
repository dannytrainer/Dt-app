const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  '<div style="display:flex;gap:6px;margin-bottom:16px">\n<button id="mtab-perfil" class="btn bg" style="flex:1;font-size:12px" onclick="showMTabLoad(\'perfil\',window.clienteMedidasId)">👤 Perfil</button>\n<button id="mtab-peso" class="btn br" style="flex:1;font-size:12px" onclick="showMTabLoad(\'peso\',window.clienteMedidasId)">⚖️ Peso</button>\n<button id="mtab-medidas" class="btn bg" style="flex:1;font-size:12px" onclick="showMTabLoad(\'medidas\',window.clienteMedidasId)">📏 Medidas</button>\n<button id="mtab-analisis" class="btn bg" style="flex:1;font-size:12px" onclick="showMTabLoad(\'analisis\',window.clienteMedidasId)">📊 Análisis</button>\n</div>',
  '<div style="display:flex;gap:4px;margin-bottom:16px;overflow-x:auto">\n<button id="mtab-perfil" class="btn bg" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showMTabLoad(\'perfil\',window.clienteMedidasId)">👤 Perfil</button>\n<button id="mtab-peso" class="btn br" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showMTabLoad(\'peso\',window.clienteMedidasId)">⚖️ Peso</button>\n<button id="mtab-medidas" class="btn bg" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showMTabLoad(\'medidas\',window.clienteMedidasId)">📏 Medidas</button>\n<button id="mtab-analisis" class="btn bg" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showMTabLoad(\'analisis\',window.clienteMedidasId)">📊 Análisis</button>\n<button id="mtab-tests" class="btn bg" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showMTabLoad(\'tests\',window.clienteMedidasId)">🏋️ Tests</button>\n</div>'
);
c = c.replace(
  '<div id="msec-analisis" style="display:none"></div>',
  '<div id="msec-analisis" style="display:none"></div>\n<div id="msec-tests" style="display:none"></div>'
);
fs.writeFileSync('public/index.html', c);
console.log('ok2');

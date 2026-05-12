const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

// Quitar los modales que quedaron fuera del html
c = c.replace(/<div class="modal" id="modal-medidas">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="modal" id="modal-historial">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');

// Insertarlos antes del </body>
const modales = `
<div class="modal" id="modal-medidas">
<div class="mc" style="padding-bottom:40px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
<div class="mt" id="modal-medidas-titulo">📊 Medidas</div>
<button class="btn bg" style="padding:6px 14px" onclick="document.getElementById('modal-medidas').classList.remove('open')">✕</button>
</div>
<div style="display:flex;gap:6px;margin-bottom:16px">
<button id="mtab-peso" class="btn br" style="flex:1;font-size:12px" onclick="showMTabLoad('peso',window.clienteMedidasId)">⚖️ Peso</button>
<button id="mtab-medidas" class="btn bg" style="flex:1;font-size:12px" onclick="showMTabLoad('medidas',window.clienteMedidasId)">📏 Medidas</button>
<button id="mtab-analisis" class="btn bg" style="flex:1;font-size:12px" onclick="showMTabLoad('analisis',window.clienteMedidasId)">📊 Análisis</button>
</div>
<div id="msec-peso"></div>
<div id="msec-medidas" style="display:none"></div>
<div id="msec-analisis" style="display:none"></div>
</div>
</div>
<div class="modal" id="modal-historial">
<div class="mc">
<div id="historial-contenido"></div>
<button class="btn bg" style="width:100%;margin-top:16px" onclick="document.getElementById('modal-historial').classList.remove('open')">Cerrar</button>
</div>
</div>`;

c = c.replace('<script src="/medidas.js"></script>', modales + '\n<script src="/medidas.js"></script>');
fs.writeFileSync('public/index.html', c);
console.log('ok');

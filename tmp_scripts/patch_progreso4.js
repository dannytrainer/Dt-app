const fs = require('fs');
const path = 'public/js/app-utilidades.js';
let lineas = fs.readFileSync(path, 'utf8').split('\n');

const idx = 1437; // línea 1438, índice 0-based

if (lineas[idx].trim() !== 'cont.innerHTML = html;') {
  console.log("ERROR: la línea " + (idx+1) + " no es la esperada. Contenido real:", JSON.stringify(lineas[idx]));
  process.exit(1);
}

const nuevoBloque = [
  '  html += \'<div id="enc-progreso-peso" style="margin-bottom:16px"></div>\';',
  '  cont.innerHTML = html;',
  '',
  '  (function(encId){',
  "    var uid = (typeof _tcUsuario !== 'undefined' && _tcUsuario && _tcUsuario.id) || null;",
  '    if (!uid) return;',
  "    fetch('/api/historial-pesos/' + uid + '/' + encId).then(function(r){return r.json();}).then(function(res){",
  "      var cont2 = document.getElementById('enc-progreso-peso');",
  '      if (!cont2) return;',
  '      var semanas = res.semanas || [];',
  "      if (semanas.length === 0) { cont2.innerHTML = ''; return; }",
  '      var ultima = semanas[semanas.length - 1];',
  '      var h = \'<div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">\\uD83D\\uDCC8 Tu progreso</div>\';',
  '      h += \'<div style="background:#1a1a1a;border-radius:10px;padding:12px;display:flex;gap:10px">\';',
  '      h += \'<div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:900;color:#fff">\' + ultima.peso + \'<span style="font-size:11px;color:var(--texto-medio)"> \' + ultima.unidad + \'</span></div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Ultimo peso</div></div>\';',
  '      h += \'<div style="flex:1;text-align:center;border-left:1px solid #2a2a2a"><div style="font-size:20px;font-weight:900;color:#e31e24">\' + (res.rm_estimado ? Math.round(res.rm_estimado) : \'-\') + \'<span style="font-size:11px;color:var(--texto-medio)"> kg</span></div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">RM estimado</div></div>\';',
  "      h += '</div>';",
  '      cont2.innerHTML = h;',
  '    }).catch(function(){});',
  '  })(e.id);'
];

lineas.splice(idx, 1, ...nuevoBloque);
fs.writeFileSync(path, lineas.join('\n'));
console.log("OK: parche aplicado, se insertaron " + nuevoBloque.length + " líneas");

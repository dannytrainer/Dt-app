const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  '<div style="display:flex;gap:8px;margin-top:8px">\n<button class="btn bg" style="flex:1" onclick="cerrarModal()">Cancelar</button>',
  '<div class="ig" id="msg-mensual-box"><label>Mensaje recordatorio de pago</label><textarea id="cliente-msg-pago" placeholder="Ej: Hola, habla Daniel. Mañana es tu fecha de pago 🙌" style="min-height:60px"></textarea></div>\n<div class="ig" id="msg-quincena1-box" style="display:none"><label>Mensaje primera quincena</label><textarea id="cliente-msg-q1" placeholder="Ej: Hola, mañana es tu primera quincena 👋" style="min-height:60px"></textarea></div>\n<div class="ig" id="msg-quincena2-box" style="display:none"><label>Mensaje segunda quincena</label><textarea id="cliente-msg-q2" placeholder="Ej: Hola, mañana vence tu segunda quincena 🙌" style="min-height:60px"></textarea></div>\n<div style="display:flex;gap:8px;margin-top:8px">\n<button class="btn bg" style="flex:1" onclick="cerrarModal()">Cancelar</button>'
);
fs.writeFileSync('public/index.html', c);
console.log('ok5');

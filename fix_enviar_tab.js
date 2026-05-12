const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  '<div id="page-enviar" class="page">\n<p class="st">Envío manual</p>\n<div class="card">\n<div class="ig"><label>Cliente</label><select id="enviar-cliente"></select></div>\n<button class="btn br" style="width:100%" onclick="enviarRutinaCompleta()">💪 Enviar rutina completa</button>\n</div>\n<div class="card" style="margin-top:8px">\n<div class="ig"><label>Enviar mensaje a</label><select id="enviar-cliente2"></select></div>\n<div class="ig"><label>Mensaje</label><textarea id="mensaje-custom" placeholder="Escribe el mensaje personalizado..."></textarea></div>\n<button class="btn br" style="width:100%" onclick="enviarMensajeCustom()">📤 Enviar mensaje</button>\n</div>\n</div>',
  `<div id="page-enviar" class="page">
<p class="st">Envío manual</p>
<div class="card">
<div class="ig"><label>Cliente</label><select id="enviar-cliente"></select></div>
<button class="btn br" style="width:100%" onclick="enviarRutinaCompleta()">💪 Enviar rutina completa</button>
</div>
<div class="card" style="margin-top:8px">
<div class="ig"><label>Cliente</label><select id="enviar-cliente-dia"></select></div>
<div class="ig"><label>Día</label>
<select id="enviar-dia-select" style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:11px;color:#f0f0f0;font-size:14px;outline:none">
<option value="lunes">Lunes</option>
<option value="martes">Martes</option>
<option value="miercoles">Miércoles</option>
<option value="jueves">Jueves</option>
<option value="viernes">Viernes</option>
<option value="sabado">Sábado</option>
<option value="domingo">Domingo</option>
</select></div>
<button class="btn br" style="width:100%" onclick="enviarDiaRutina()">📤 Enviar día de rutina</button>
</div>
<div class="card" style="margin-top:8px">
<div class="ig"><label>Enviar mensaje a</label><select id="enviar-cliente2"></select></div>
<div class="ig"><label>Mensaje</label><textarea id="mensaje-custom" placeholder="Escribe el mensaje personalizado..."></textarea></div>
<button class="btn br" style="width:100%" onclick="enviarMensajeCustom()">📤 Enviar mensaje</button>
</div>
</div>`
);
c = c.replace(
  'async function enviarRutinaCompleta(){',
  `async function enviarDiaRutina(){
const id=document.getElementById('enviar-cliente-dia').value;
const dia=document.getElementById('enviar-dia-select').value;
if(!id){toast('Selecciona un cliente',false);return;}
const res=await fetch('/api/enviar-dia/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dia})});
const data=await res.json();
toast(data.ok?'✅ Día enviado':'❌ Error',data.ok);
}

async function enviarRutinaCompleta(){`
);
c = c.replace(
  "const opts=usuarios.map(u=>`<option value=\"${u.id}\" data-tel=\"${u.telefono}\">${u.nombre}</option>`).join('');\ndocument.getElementById('enviar-cliente').innerHTML=opts;\ndocument.getElementById('enviar-cliente2').innerHTML=opts;",
  "const opts=usuarios.map(u=>`<option value=\"${u.id}\" data-tel=\"${u.telefono}\">${u.nombre}</option>`).join('');\ndocument.getElementById('enviar-cliente').innerHTML=opts;\ndocument.getElementById('enviar-cliente-dia').innerHTML=opts;\ndocument.getElementById('enviar-cliente2').innerHTML=opts;"
);
fs.writeFileSync('public/index.html', c);
console.log('ok4');

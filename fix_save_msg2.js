const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  "dia_pago2:parseInt(document.getElementById('cliente-pago2').value)||null,\nestado_pago:document.getElementById('cliente-estado-pago').value",
  "dia_pago2:parseInt(document.getElementById('cliente-pago2').value)||null,\nestado_pago:document.getElementById('cliente-estado-pago').value,\nmsg_pago:document.getElementById('cliente-msg-pago').value||'',\nmsg_q1:document.getElementById('cliente-msg-q1').value||'',\nmsg_q2:document.getElementById('cliente-msg-q2').value||''"
);
fs.writeFileSync('public/index.html', c);
console.log('ok');

const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  'estado_pago:document.getElementById("cliente-estado-pago").value',
  'estado_pago:document.getElementById("cliente-estado-pago").value,\nmsg_pago:document.getElementById("cliente-msg-pago").value,\nmsg_q1:document.getElementById("cliente-msg-q1").value,\nmsg_q2:document.getElementById("cliente-msg-q2").value'
);
fs.writeFileSync('public/index.html', c);
console.log('ok7');

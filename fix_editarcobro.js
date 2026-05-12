const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  "document.getElementById('pago2-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';",
  "document.getElementById('pago2-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';\ndocument.getElementById('cliente-msg-pago').value=u.msg_pago||'';\ndocument.getElementById('cliente-msg-q1').value=u.msg_q1||'';\ndocument.getElementById('cliente-msg-q2').value=u.msg_q2||'';\ndocument.getElementById('msg-mensual-box').style.display=(u.tipo_pago==='quincenal')?'none':'block';\ndocument.getElementById('msg-quincena1-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';\ndocument.getElementById('msg-quincena2-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';"
);
fs.writeFileSync('public/index.html', c);
console.log('ok8');

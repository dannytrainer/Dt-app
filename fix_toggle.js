const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  'function togglePago2(){\nconst t=document.getElementById("cliente-tipo-pago").value;\ndocument.getElementById("pago2-box").style.display=t==="quincenal"?"block":"none";\n}',
  'function togglePago2(){\nconst t=document.getElementById("cliente-tipo-pago").value;\ndocument.getElementById("pago2-box").style.display=t==="quincenal"?"block":"none";\ndocument.getElementById("msg-mensual-box").style.display=t==="mensual"?"block":"none";\ndocument.getElementById("msg-quincena1-box").style.display=t==="quincenal"?"block":"none";\ndocument.getElementById("msg-quincena2-box").style.display=t==="quincenal"?"block":"none";\n}'
);
fs.writeFileSync('public/index.html', c);
console.log('ok6');

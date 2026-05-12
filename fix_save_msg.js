const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
console.log('Buscando estado_pago en guardar...');
const idx = c.indexOf('estado_pago:document.getElementById("cliente-estado-pago").value');
console.log('Encontrado en posicion:', idx);
console.log('Contexto:', c.substring(idx, idx+200));

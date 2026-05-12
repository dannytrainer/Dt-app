const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

// Verificar si los campos existen
console.log('msg_pago en guardar:', c.includes('cliente-msg-pago'));
console.log('msg_pago en editar:', c.includes('u.msg_pago'));

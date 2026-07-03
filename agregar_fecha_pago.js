const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.js');
let contenido = fs.readFileSync(file, 'utf8');

const buscar = `if(idx !== -1){ usuarios[idx].estado_pago = 'aldia'; guardarJSON('usuarios.json', usuarios); }`;
const reemplazo = `if(idx !== -1){ usuarios[idx].estado_pago = 'aldia'; usuarios[idx].fecha_ultimo_pago = new Date().toISOString().split('T')[0]; guardarJSON('usuarios.json', usuarios); }`;

if (!contenido.includes(buscar)) {
  console.error('❌ No se encontró el texto exacto a reemplazar. No se modificó nada.');
  process.exit(1);
}

contenido = contenido.replace(buscar, reemplazo);
fs.writeFileSync(file, contenido);
console.log('✅ Campo fecha_ultimo_pago agregado.');

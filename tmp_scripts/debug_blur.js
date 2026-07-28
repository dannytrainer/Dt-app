const fs = require('fs');
const path = 'public/js/app-pesos.js';
let c = fs.readFileSync(path, 'utf8');

const buscar = `inp.addEventListener('blur', function(){ this.style.borderColor='#333'; tcGuardarPesos(); });`;
const nuevo = `inp.addEventListener('blur', function(){ alert('DEBUG: blur disparado en input, valor=' + this.value); this.style.borderColor='#333'; tcGuardarPesos(); });`;

if (c.includes(buscar)) {
  c = c.replace(buscar, nuevo);
  fs.writeFileSync(path, c, 'utf8');
  console.log('OK, debug agregado en el listener de blur');
} else {
  console.log('NO SE ENCONTRO el texto exacto');
}

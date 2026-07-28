const fs = require('fs');
const path = 'public/js/app-pesos.js';
let c = fs.readFileSync(path, 'utf8');
let count = 0;

const a = `inp.addEventListener('blur', function(){ alert('DEBUG: blur disparado en input, valor=' + this.value); this.style.borderColor='#333'; tcGuardarPesos(); });`;
const aNew = `inp.addEventListener('blur', function(){ this.style.borderColor='#333'; tcGuardarPesos(); });`;
if (c.includes(a)) { c = c.replace(a, aNew); count++; }

const b = `  alert('DEBUG: entro a tcGuardarPesos, _tcEjercicios.length=' + (_tcEjercicios ? _tcEjercicios.length : 'undefined'));
`;
if (c.includes(b)) { c = c.replace(b, ''); count++; }

const d = `      alert('DEBUG tcGuardarPesos: ej=' + ej.nombre + ' enciclopedia_id=' + ej.enciclopedia_id);
`;
if (c.includes(d)) { c = c.replace(d, ''); count++; }

fs.writeFileSync(path, c, 'utf8');
console.log('Reemplazos hechos:', count, 'de 3');

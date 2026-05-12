const fs = require('fs');

const file = 'index.js';

let code = fs.readFileSync(file, 'utf8');

// corregir error de join roto
code = code.replace(/lineas\.join\('\s*\n?/g, "lineas.join('\\n')");

fs.writeFileSync(file, code);

console.log('✔ index.js corregido');

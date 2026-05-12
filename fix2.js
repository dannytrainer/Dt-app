const fs = require('fs');

const file = 'index.js';

let code = fs.readFileSync(file, 'utf8');

// arreglar join roto
code = code.replace(/lineas\.join\([^\)]*\)/g, "lineas.join('\\n')");

// limpiar basura extra
code = code.replace(/lineas\.join\('\\n'\)\'+/g, "lineas.join('\\n')");

fs.writeFileSync(file, code);

console.log('✔ Fix 2 aplicado correctamente');

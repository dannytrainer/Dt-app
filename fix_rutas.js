const fs = require('fs');
let c = fs.readFileSync('rutas_historial.js', 'utf8');
if (!c.includes('module.exports')) {
  c = 'module.exports = function(app, fs) {\n' + c + '\n};';
  fs.writeFileSync('rutas_historial.js', c);
  console.log('ok - agregado module.exports');
} else {
  console.log('ya tiene module.exports');
}

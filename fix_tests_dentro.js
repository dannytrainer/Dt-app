const fs = require('fs');
let c = fs.readFileSync('rutas_historial.js', 'utf8');
c = c.replace(
  "\napp.get('/api/tests/:id'",
  "\n// tests routes\napp.get('/api/tests/:id'"
);
const lastClose = c.lastIndexOf('};');
const testsStart = c.indexOf('// tests routes');
if (testsStart > lastClose) {
  const testsCode = c.substring(testsStart);
  c = c.substring(0, testsStart);
  c = c.substring(0, c.lastIndexOf('};')) + testsCode + '\n};';
}
fs.writeFileSync('rutas_historial.js', c);
console.log('ok');

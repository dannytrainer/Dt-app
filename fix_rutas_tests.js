const fs = require('fs');
let c = fs.readFileSync('rutas_historial.js', 'utf8');
c = c.replace(
  "\napp.get('/api/tests/:id'",
  "\n};\n\nmodule.exports.__tests = function(app, fs) {\napp.get('/api/tests/:id'"
);
c = c.replace(
  "fs.writeFileSync('data/tests.json', JSON.stringify(h, null, 2));\n  res.json({ ok: true });\n});\nEOF",
  "fs.writeFileSync('data/tests.json', JSON.stringify(h, null, 2));\n  res.json({ ok: true });\n});\n};"
);
fs.writeFileSync('rutas_historial.js', c);
console.log('ok');

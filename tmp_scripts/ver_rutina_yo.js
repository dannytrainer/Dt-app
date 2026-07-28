const fs = require('fs');
const r = JSON.parse(fs.readFileSync('data/rutinas.json','utf8'));
const cliente = r['cli_1778216541791'];
console.log('Dias:', Object.keys(cliente).join(', '));
console.log('');
Object.keys(cliente).forEach(dia => {
  const d = cliente[dia];
  if (!d || !Array.isArray(d.ejercicios)) return;
  console.log('--- ' + dia + ' ---');
  d.ejercicios.forEach(ej => {
    console.log(' ', ej.nombre, '|', ej.enciclopedia_id || '(SIN VINCULAR)');
  });
});

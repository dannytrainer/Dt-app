const fs = require('fs');
const r = JSON.parse(fs.readFileSync('data/rutinas.json','utf8'));
const cliente = r['cli_1782753782424'];
if (!cliente) { console.log('Sin rutina guardada para este cliente'); process.exit(0); }
console.log('Dias presentes en la rutina:', Object.keys(cliente).join(', '));
console.log('');
Object.keys(cliente).forEach(dia => {
  const d = cliente[dia];
  console.log('--- ' + dia + ' ---');
  if (!d) { console.log('  (sin datos)'); return; }
  if (!Array.isArray(d.ejercicios)) { console.log('  (sin campo ejercicios)'); return; }
  if (d.ejercicios.length === 0) { console.log('  (0 ejercicios)'); return; }
  d.ejercicios.forEach(ej => {
    console.log(' ', ej.nombre, '|', ej.enciclopedia_id || '(SIN VINCULAR)');
  });
});

const fs = require('fs');
const enciclopedia = JSON.parse(fs.readFileSync('data/enciclopedia.json', 'utf8'));
const lista = Array.isArray(enciclopedia) ? enciclopedia : (enciclopedia.ejercicios || []);

function buscar(termino) {
  console.log('--- Buscando: "' + termino + '" ---');
  lista.filter(e => (e.nombre||'').toLowerCase().includes(termino.toLowerCase()))
    .forEach(e => console.log('  ', e.nombre, '| id:', e.id, '| grupo:', e.grupo));
  console.log('');
}

buscar('dominadas');
buscar('hip thrust');
buscar('empuje de cadera');
buscar('abduccion');
buscar('abducción');
buscar('sentadilla');

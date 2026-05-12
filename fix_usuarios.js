const fs = require('fs');
let u = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
u = u.map(x => {
  delete x.peso;
  delete x.medidas;
  delete x.sesiones;
  return x;
});
fs.writeFileSync('data/usuarios.json', JSON.stringify(u, null, 2));
console.log('ok');

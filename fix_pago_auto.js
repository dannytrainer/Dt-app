const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');
c = c.replace(
  "cron.schedule('* * * * *', async () => {",
  `cron.schedule('* * * * *', async () => {
  // Auto actualizar estado de pago
  try {
    const hoy2 = new Date();
    const diaHoy = hoy2.getDate();
    let usuarios2 = JSON.parse(fs.readFileSync(path.join(__dirname,'data','usuarios.json'),'utf8'));
    let cambio = false;
    usuarios2 = usuarios2.map(u => {
      if (!u.activo) return u;
      const diasAntes = 3;
      const esDiaPago = u.dia_pago === diaHoy;
      const esProximo = u.dia_pago === diaHoy + diasAntes || (u.tipo_pago === 'quincenal' && u.dia_pago2 === diaHoy + diasAntes);
      const esVencido = u.dia_pago < diaHoy && u.estado_pago !== 'aldia';
      if (esDiaPago && u.estado_pago !== 'vencido') { u.estado_pago = 'vencido'; cambio = true; }
      else if (esProximo && u.estado_pago === 'aldia') { u.estado_pago = 'proximo'; cambio = true; }
      return u;
    });
    if (cambio) fs.writeFileSync(path.join(__dirname,'data','usuarios.json'), JSON.stringify(usuarios2, null, 2));
  } catch(e) {}
`
);
fs.writeFileSync('index.js', c);
console.log('ok1');

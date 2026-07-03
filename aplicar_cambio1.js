const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.js');
let contenido = fs.readFileSync(file, 'utf8');

const inicio = '// Auto actualizar estado de pago';
const fin = '// Verificar premium de entrenadores';

const idxInicio = contenido.indexOf(inicio);
const idxFin = contenido.indexOf(fin);

if (idxInicio === -1 || idxFin === -1 || idxFin < idxInicio) {
  console.error('❌ No se encontraron los marcadores esperados. No se modificó nada.');
  process.exit(1);
}

const nuevoBloque = `// Auto actualizar estado de pago (usando fechas reales)
  try {
    const hoyDate0 = new Date();
    const hoySoloFecha = new Date(hoyDate0.getFullYear(), hoyDate0.getMonth(), hoyDate0.getDate());

    function fechaCorte(diaPago, year, month) {
      const ultimoDia = new Date(year, month + 1, 0).getDate();
      const dia = Math.min(diaPago, ultimoDia);
      return new Date(year, month, dia);
    }

    let usuarios2 = JSON.parse(fs.readFileSync(path.join(__dirname,'data','usuarios.json'),'utf8'));
    let cambio = false;
    usuarios2 = usuarios2.map(u => {
      if (!u.activo || !u.dia_pago) return u;
      const diaPago = parseInt(u.dia_pago);

      const corteEsteMes = fechaCorte(diaPago, hoySoloFecha.getFullYear(), hoySoloFecha.getMonth());

      let cicloPasado;
      if (corteEsteMes <= hoySoloFecha) {
        cicloPasado = corteEsteMes;
      } else {
        const mesAnt = hoySoloFecha.getMonth() - 1;
        const y = mesAnt < 0 ? hoySoloFecha.getFullYear() - 1 : hoySoloFecha.getFullYear();
        const m = (mesAnt + 12) % 12;
        cicloPasado = fechaCorte(diaPago, y, m);
      }
      const diasDesdeCorte = Math.floor((hoySoloFecha - cicloPasado) / 86400000);

      let cicloProximo;
      if (corteEsteMes >= hoySoloFecha) {
        cicloProximo = corteEsteMes;
      } else {
        const mesSig = hoySoloFecha.getMonth() + 1;
        const y = mesSig > 11 ? hoySoloFecha.getFullYear() + 1 : hoySoloFecha.getFullYear();
        const m = mesSig % 12;
        cicloProximo = fechaCorte(diaPago, y, m);
      }
      const diasHastaCorte = Math.floor((cicloProximo - hoySoloFecha) / 86400000);

      if (diasDesdeCorte >= 0 && diasDesdeCorte < 3) {
        if (u.estado_pago !== 'vencido') { u.estado_pago = 'vencido'; u.push_cobro_pendiente = true; cambio = true; }
      } else if (diasDesdeCorte >= 3) {
        if (u.activo) { u.activo = false; cambio = true; }
        if (u.estado_pago !== 'vencido') { u.estado_pago = 'vencido'; cambio = true; }
      } else if (diasHastaCorte > 0 && diasHastaCorte <= 3) {
        if (u.estado_pago === 'aldia') { u.estado_pago = 'proximo'; u.push_cobro_pendiente = true; cambio = true; }
      } else if (u.estado_pago !== 'aldia') {
        u.estado_pago = 'aldia'; cambio = true;
      }

      if (u.estado_pago === 'aldia') {
        if (u.msg_cobro_enviado) { u.msg_cobro_enviado = false; cambio = true; }
        if (u.push_vencido_enviado) { u.push_vencido_enviado = false; cambio = true; }
        if (u.push_proximo_enviado) { u.push_proximo_enviado = false; cambio = true; }
        if (u.push_cobro_pendiente) { u.push_cobro_pendiente = false; cambio = true; }
      }
      return u;
    });
    if (cambio) fs.writeFileSync(path.join(__dirname,'data','usuarios.json'), JSON.stringify(usuarios2, null, 2));

    `;

contenido = contenido.slice(0, idxInicio) + nuevoBloque + contenido.slice(idxFin);
fs.writeFileSync(file, contenido);
console.log('✅ Reemplazo aplicado.');

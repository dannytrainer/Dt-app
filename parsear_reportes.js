const fs = require('fs');
const path = require('path');

function extraerReportesCliente(clienteId) {
  const chats = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/chats.json'), 'utf8'));
  const clave = chats[clienteId] ? clienteId : Object.keys(chats).find(k => k.includes(clienteId));
  const data = chats[clave];
  const msgs = Array.isArray(data) ? data : (data && data.mensajes) || [];

  const reportes = msgs.filter(m => m.tipo === 'reporte' && m.autor === 'cliente');

  return reportes.map(m => {
    const html = m.contenido;

    const totales = [...html.matchAll(/font-weight:900;[^>]*>(\d+)\/(\d+)<\/div><div[^>]*>(\w+)<\/div>/g)];
    const ejerciciosTot = totales.find(t => t[3] === 'Ejercicios');
    const seriesTot = totales.find(t => t[3] === 'Series');

    const porEjercicio = [...html.matchAll(
      /color:#fff">([^<]+)<\/div>.*?font-weight:700">(\d+)\/(\d+) series/g
    )].map(([, nombre, hechas, total]) => ({
      nombre: nombre.trim(), seriesHechas: +hechas, seriesTotal: +total,
    }));

    const fechaMatch = html.match(/📅 (\d{4}-\d{1,2}-\d{1,2})/);

    return {
      fecha: fechaMatch ? fechaMatch[1] : m.fecha.split('T')[0],
      ejerciciosHechos: ejerciciosTot ? +ejerciciosTot[1] : null,
      ejerciciosTotal: ejerciciosTot ? +ejerciciosTot[2] : null,
      seriesHechas: seriesTot ? +seriesTot[1] : null,
      seriesTotal: seriesTot ? +seriesTot[2] : null,
      porEjercicio,
    };
  });
}

module.exports = { extraerReportesCliente };

if (require.main === module) {
  const id = process.argv[2] || 'cli_1778216541791';
  const r = extraerReportesCliente(id);
  console.log('Reportes encontrados:', r.length);
  console.log(JSON.stringify(r[0], null, 2));
}

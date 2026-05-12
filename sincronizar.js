const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function sincronizarFestivos() {
  try {
    const anio = new Date().getFullYear();
    const res = await axios.get('https://date.nager.at/api/v3/PublicHolidays/' + anio + '/CO');
    const ruta = path.join(__dirname, 'data', 'festivos.json');
    let festivos = [];
    try { festivos = JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch {}
    const existentes = festivos.map(f => f.fecha);
    let nuevos = 0;
    for (const f of res.data) {
      if (!existentes.includes(f.date)) {
        festivos.push({ fecha: f.date, nombre: f.localName });
        nuevos++;
      }
    }
    fs.writeFileSync(ruta, JSON.stringify(festivos, null, 2));
    console.log('Festivos sincronizados:', nuevos, 'nuevos');
  } catch(e) {
    console.log('Error:', e.message);
  }
}

sincronizarFestivos();

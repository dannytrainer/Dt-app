module.exports = function(app, fs) {

app.get('/api/historial/:id', (req, res) => {
  try {
    const h = JSON.parse(fs.readFileSync('data/historial.json', 'utf8'));
    const reg = h[req.params.id] || {};
    res.json({
      peso: reg.peso || [],
      medidas: reg.medidas || [],
      tomas: reg.tomas || [],
      pendiente_eliminar: reg.pendiente_eliminar || null
    });
  } catch { res.json({ peso: [], medidas: [], tomas: [], pendiente_eliminar: null }); }
});

// ═══ TOMAS MENSUALES (Historial - Fase 1) ═══
const MAX_TOMAS = 12;

function generarTomaSnapshot(id, fs) {
  const calc = require('./calculos');
  let h = {};
  try { h = JSON.parse(fs.readFileSync('data/historial.json', 'utf8')); } catch {}
  if (!h[id]) h[id] = { peso: [], medidas: [] };
  if (!h[id].tomas) h[id].tomas = [];

  const u = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
  const usuario = u.find(x => x.id === id);
  const perfil = usuario ? (usuario.perfil || {}) : {};

  const pesos = h[id].peso || [];
  const pesoActual = pesos.length ? pesos[pesos.length - 1].valor : null;
  const medidas = h[id].medidas || [];
  const medActual = medidas.length ? medidas[medidas.length - 1] : {};

  const pctGrasa = calc.calcularPorcentajeGrasa(medActual, perfil.sexo, perfil.edad);
  const pctMagra = pctGrasa ? Math.round((100 - pctGrasa) * 10) / 10 : null;
  const kgGrasa = pctGrasa && pesoActual ? Math.round((pctGrasa / 100) * pesoActual * 10) / 10 : null;
  const kgMusculo = kgGrasa && pesoActual ? Math.round((pesoActual - kgGrasa) * 10) / 10 : null;
  const proporciones = calc.calcularProporciones(medActual);
  const salud = calc.calcularSaludMetabolica(medActual, perfil.altura);

  // Resumen de tests: último registro de cada tipo
  let testsResumen = {};
  try {
    const testsData = JSON.parse(fs.readFileSync('data/tests.json', 'utf8'));
    const registros = (testsData[id] && testsData[id].registros) || [];
    ['fuerza', 'resist', 'especifico'].forEach(tipo => {
      const delTipo = registros.filter(r => r.tipo === tipo);
      if (delTipo.length) testsResumen[tipo] = delTipo[delTipo.length - 1];
    });
  } catch (e) { /* sin tests disponibles */ }

  const path = require('path');
  const dirActual = path.join(__dirname, 'data', 'fotos', id, 'actual');
  const dirToma = path.join(__dirname, 'data', 'fotos', id, 'tomas', new Date().toISOString().split('T')[0]);
  const fotos = { frontal: null, lateral: null };
  ['frontal', 'lateral'].forEach(tipo => {
    try {
      const exts = ['jpg', 'jpeg', 'png', 'webp'];
      for (const ext of exts) {
        const origen = path.join(dirActual, tipo + '.' + ext);
        if (fs.existsSync(origen)) {
          fs.mkdirSync(dirToma, { recursive: true });
          const destino = path.join(dirToma, tipo + '.' + ext);
          fs.copyFileSync(origen, destino);
          fotos[tipo] = `data/fotos/${id}/tomas/${new Date().toISOString().split('T')[0]}/${tipo}.${ext}`;
          break;
        }
      }
    } catch (e) { /* sin foto disponible, se omite */ }
  });

  const toma = {
    fecha: new Date().toISOString().split('T')[0],
    peso: pesoActual,
    medidas: medActual,
    perfil: { sexo: perfil.sexo, edad: perfil.edad, altura: perfil.altura, objetivo: perfil.objetivo },
    analisis_congelado: { pctGrasa, pctMagra, kgGrasa, kgMusculo, proporciones, salud },
    tests_resumen: testsResumen,
    fotos
  };

  if (h[id].tomas.length < MAX_TOMAS) {
    h[id].tomas.push(toma);
    h[id].pendiente_eliminar = null;
  } else {
    h[id].pendiente_eliminar = toma;
  }

  fs.writeFileSync('data/historial.json', JSON.stringify(h, null, 2));
  return { ok: true, toma, pendiente: h[id].tomas.length >= MAX_TOMAS && h[id].pendiente_eliminar };
}

app.post('/api/historial/:id/generar-toma-test', (req, res) => {
  try {
    const resultado = generarTomaSnapshot(req.params.id, fs);
    res.json(resultado);
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/historial/:id/resolver-pendiente', (req, res) => {
  try {
    const { indiceEliminar } = req.body;
    let h = {};
    try { h = JSON.parse(fs.readFileSync('data/historial.json', 'utf8')); } catch {}
    const reg = h[req.params.id];
    if (!reg || !reg.pendiente_eliminar) return res.status(400).json({ ok: false, error: 'No hay toma pendiente' });
    if (indiceEliminar < 0 || indiceEliminar >= reg.tomas.length) return res.status(400).json({ ok: false, error: 'Índice inválido' });

    reg.tomas.splice(indiceEliminar, 1);
    reg.tomas.push(reg.pendiente_eliminar);
    reg.pendiente_eliminar = null;

    fs.writeFileSync('data/historial.json', JSON.stringify(h, null, 2));
    res.json({ ok: true, tomas: reg.tomas });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/historial/:id/peso', (req, res) => {
  let h = {};
  try { h = JSON.parse(fs.readFileSync('data/historial.json', 'utf8')); } catch {}
  if (!h[req.params.id]) h[req.params.id] = { peso: [], medidas: [] };
  h[req.params.id].peso.push({ fecha: new Date().toISOString().split('T')[0], ...req.body });
  fs.writeFileSync('data/historial.json', JSON.stringify(h, null, 2));
  res.json({ ok: true });
});

app.post('/api/historial/:id/medidas', (req, res) => {
  let h = {};
  try { h = JSON.parse(fs.readFileSync('data/historial.json', 'utf8')); } catch {}
  if (!h[req.params.id]) h[req.params.id] = { peso: [], medidas: [] };
  const calc = require('./calculos');
  const u = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
  const usuario = u.find(x => x.id === req.params.id);
  const perfil = usuario ? (usuario.perfil || {}) : {};
  const pctGrasa = calc.calcularPorcentajeGrasa(req.body, perfil.sexo, perfil.edad);
  const pesos = h[req.params.id].peso || [];
  const pesoActual = pesos.length ? pesos[pesos.length-1].valor : null;
  const kgGrasa = pctGrasa && pesoActual ? Math.round((pctGrasa/100)*pesoActual*10)/10 : null;
  const kgMusculo = kgGrasa && pesoActual ? Math.round((pesoActual-kgGrasa)*10)/10 : null;
  const entrada = { fecha: new Date().toISOString().split('T')[0], ...req.body, analisis: { pctGrasa, kgGrasa, kgMusculo } };
  h[req.params.id].medidas.push(entrada);
  fs.writeFileSync('data/historial.json', JSON.stringify(h, null, 2));
  res.json({ ok: true });
});

app.post('/api/usuarios/:id/sesion', (req, res) => {
  let u = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
  const idx = u.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  u[idx].sesiones_total = (u[idx].sesiones_total || 0) + 1;
  u[idx].sesiones_ciclo = (u[idx].sesiones_ciclo || 0) + 1;
  fs.writeFileSync('data/usuarios.json', JSON.stringify(u, null, 2));
  res.json({ sesiones_total: u[idx].sesiones_total, sesiones_ciclo: u[idx].sesiones_ciclo });
});

app.post('/api/usuarios/:id/perfil', (req, res) => {
  let u = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
  const idx = u.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  u[idx].perfil = { ...(u[idx].perfil || {}), ...req.body };
  fs.writeFileSync('data/usuarios.json', JSON.stringify(u, null, 2));
  res.json({ ok: true });
});

app.get('/api/calculos/:id', (req, res) => {
  try {
    const calc = require('./calculos');
    const u = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
    const usuario = u.find(x => x.id === req.params.id);
    let h = {};
    try { h = JSON.parse(fs.readFileSync('data/historial.json', 'utf8')); } catch {}
    const hist = h[req.params.id] || { peso: [], medidas: [] };
    const medActual = hist.medidas.length ? hist.medidas[hist.medidas.length-1] : {};
    const perfil = usuario ? (usuario.perfil || {}) : {};
    const pctGrasa = calc.calcularPorcentajeGrasa(medActual, perfil.sexo, perfil.edad);
    const pesos = hist.peso;
    const pesoActual = pesos.length ? pesos[pesos.length-1].valor : null;
    const kgGrasa = pctGrasa && pesoActual ? Math.round((pctGrasa/100)*pesoActual*10)/10 : null;
    const kgMusculo = kgGrasa && pesoActual ? Math.round((pesoActual-kgGrasa)*10)/10 : null;
    const proporciones = calc.calcularProporciones(medActual);
    const salud = calc.calcularSaludMetabolica(medActual, perfil.altura);
    res.json({ pctGrasa, pctMagra: pctGrasa ? Math.round((100-pctGrasa)*10)/10 : null, kgGrasa, kgMusculo, proporciones, salud });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ═══ COMPETENCIAS EXTERNAS ═══
app.get('/api/competencias', (req, res) => {
  try {
    const entId = req.query.entrenador_id || 'ent_001';
    let data = JSON.parse(fs.readFileSync('data/competencias.json', 'utf8'));
    res.json(data.filter(c => c.entrenador_id === entId));
  } catch { res.json([]); }
});

app.post('/api/competencias', (req, res) => {
  try {
    let data = [];
    try { data = JSON.parse(fs.readFileSync('data/competencias.json', 'utf8')); } catch {}
    const nueva = { ...req.body, id: Date.now().toString(), creada: new Date().toISOString().split('T')[0], participantes: [] };
    data.push(nueva);
    fs.writeFileSync('data/competencias.json', JSON.stringify(data, null, 2));
    res.json({ ok: true, id: nueva.id });
  } catch(e) { res.json({ ok: false, error: e.message }); }
});

app.put('/api/competencias/:id', (req, res) => {
  try {
    let data = JSON.parse(fs.readFileSync('data/competencias.json', 'utf8'));
    const idx = data.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.json({ ok: false });
    data[idx] = { ...data[idx], ...req.body };
    fs.writeFileSync('data/competencias.json', JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false, error: e.message }); }
});

app.delete('/api/competencias/:id', (req, res) => {
  try {
    let data = JSON.parse(fs.readFileSync('data/competencias.json', 'utf8'));
    data = data.filter(c => c.id !== req.params.id);
    fs.writeFileSync('data/competencias.json', JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false, error: e.message }); }
});

app.get('/api/tests/:id', (req, res) => {
  try {
    const h = JSON.parse(fs.readFileSync('data/tests.json', 'utf8'));
    res.json(h[req.params.id] || { registros: [] });
  } catch { res.json({ registros: [] }); }
});

app.post('/api/tests/:id', (req, res) => {
  let h = {};
  try { h = JSON.parse(fs.readFileSync('data/tests.json', 'utf8')); } catch {}
  if (!h[req.params.id]) h[req.params.id] = { registros: [] };
  h[req.params.id].registros.push(req.body);
  fs.writeFileSync('data/tests.json', JSON.stringify(h, null, 2));
  res.json({ ok: true });
});

};

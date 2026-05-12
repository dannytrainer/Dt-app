module.exports = function(app, fs) {

app.get('/api/historial/:id', (req, res) => {
  try {
    const h = JSON.parse(fs.readFileSync('data/historial.json', 'utf8'));
    res.json(h[req.params.id] || { peso: [], medidas: [] });
  } catch { res.json({ peso: [], medidas: [] }); }
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

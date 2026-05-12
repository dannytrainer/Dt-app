const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');

const viejoEnvio = c.substring(
  c.indexOf("app.post('/api/enviar-rutina/:id'"),
  c.indexOf("conectarWhatsApp();")
);

const nuevoEnvio = `app.post('/api/enviar-rutina/:id', async (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const rutinas = cargarJSON('rutinas.json');
  const usuario = usuarios.find(u => u.id === req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  const rutina = rutinas[req.params.id];
  if (!rutina) return res.status(404).json({ error: 'Sin rutina' });
  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const emojis = {lunes:'🔥',martes:'⚡',miercoles:'💪',jueves:'🔥',viernes:'⚡',sabado:'💪',domingo:'🌟'};
  let texto = '💪 *Rutina de ' + usuario.nombre + '*\n\n';
  for (const dia of dias) {
    const d = rutina[dia];
    if (!d) continue;
    const ejs = d.ejercicios && d.ejercicios.filter(e=>e.nombre).length > 0 ? d.ejercicios : null;
    if (!ejs && !d.rutina) continue;
    const tit = dia.charAt(0).toUpperCase()+dia.slice(1);
    const borde = '═'.repeat(22);
    texto += '╔' + borde + '╗\n';
    const titulo = (emojis[dia]||'💪') + ' ' + tit.toUpperCase();
    const pad = Math.max(0, 22 - titulo.length);
    texto += '║ ' + titulo + ' '.repeat(pad) + ' ║\n';
    texto += '╚' + borde + '╝\n\n';
    if (ejs) {
      for (const e of ejs) {
        if (!e.nombre) continue;
        texto += '┌─────────────────────┐\n';
        texto += '│ ' + e.nombre.substring(0,19).padEnd(19) + ' │\n';
        texto += '├─────────────────────┤\n';
        if (e.series) texto += '│ S: ' + String(e.series).padEnd(17) + ' │\n';
        if (e.reps) texto += '│ R: ' + String(e.reps).padEnd(17) + ' │\n';
        if (e.rir) texto += '│ RIR: ' + String(e.rir).padEnd(15) + ' │\n';
        if (e.desc) texto += '│ DESC: ' + String(e.desc).padEnd(14) + ' │\n';
        if (e.var) texto += '│ VAR: ' + String(e.var).padEnd(15) + ' │\n';
        texto += '└─────────────────────┘\n\n';
      }
    } else if (d.rutina) {
      texto += d.rutina + '\n\n';
    }
    if (d.rutina && ejs) texto += '📝 ' + d.rutina + '\n\n';
  }
  const resultado = await enviarMensaje(usuario.telefono, texto);
  res.json({ ok: resultado });
});

app.post('/api/enviar-dia/:id', async (req, res) => {
  const { dia } = req.body;
  const usuarios = cargarJSON('usuarios.json');
  const rutinas = cargarJSON('rutinas.json');
  const usuario = usuarios.find(u => u.id === req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  const rutina = rutinas[req.params.id];
  if (!rutina || !rutina[dia]) return res.status(404).json({ error: 'Sin rutina para ese dia' });
  const emojis = {lunes:'🔥',martes:'⚡',miercoles:'💪',jueves:'🔥',viernes:'⚡',sabado:'💪',domingo:'🌟'};
  const d = rutina[dia];
  const ejs = d.ejercicios && d.ejercicios.filter(e=>e.nombre).length > 0 ? d.ejercicios : null;
  const tit = dia.charAt(0).toUpperCase()+dia.slice(1);
  const borde = '═'.repeat(22);
  let texto = '╔' + borde + '╗\n';
  const titulo = (emojis[dia]||'💪') + ' ' + tit.toUpperCase();
  const pad = Math.max(0, 22 - titulo.length);
  texto += '║ ' + titulo + ' '.repeat(pad) + ' ║\n';
  texto += '╚' + borde + '╝\n\n';
  if (ejs) {
    for (const e of ejs) {
      if (!e.nombre) continue;
      texto += '┌─────────────────────┐\n';
      texto += '│ ' + e.nombre.substring(0,19).padEnd(19) + ' │\n';
      texto += '├─────────────────────┤\n';
      if (e.series) texto += '│ S: ' + String(e.series).padEnd(17) + ' │\n';
      if (e.reps) texto += '│ R: ' + String(e.reps).padEnd(17) + ' │\n';
      if (e.rir) texto += '│ RIR: ' + String(e.rir).padEnd(15) + ' │\n';
      if (e.desc) texto += '│ DESC: ' + String(e.desc).padEnd(14) + ' │\n';
      if (e.var) texto += '│ VAR: ' + String(e.var).padEnd(15) + ' │\n';
      texto += '└─────────────────────┘\n\n';
    }
  } else if (d.rutina) {
    texto += d.rutina + '\n\n';
  }
  if (d.rutina && ejs) texto += '📝 ' + d.rutina + '\n\n';
  const resultado = await enviarMensaje(usuario.telefono, texto);
  res.json({ ok: resultado });
});

`;

c = c.slice(0, c.indexOf("app.post('/api/enviar-rutina/:id'")) + nuevoEnvio + c.slice(c.indexOf("conectarWhatsApp();"));
fs.writeFileSync('index.js', c);
console.log('ok3');

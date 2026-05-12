const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');

c = c.replace(
  `app.post('/api/enviar-rutina/:id', async (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const rutinas = cargarJSON('rutinas.json');
  const usuario = usuarios.find(u => u.id === req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  const rutina = rutinas[req.params.id];
  if (!rutina) return res.status(404).json({ error: 'Sin rutina' });
  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  let texto = 'Rutina completa de ' + usuario.nombre + ':\\n\\n';
  for (const dia of dias) {
    if (rutina[dia] && rutina[dia].rutina) texto += dia.toUpperCase() + '\\n' + rutina[dia].rutina + '\\n\\n';
  }
  const resultado = await enviarMensaje(usuario.telefono, texto);
  res.json({ ok: resultado });
});`,
  `app.post('/api/enviar-rutina/:id', async (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const rutinas = cargarJSON('rutinas.json');
  const usuario = usuarios.find(u => u.id === req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  const rutina = rutinas[req.params.id];
  if (!rutina) return res.status(404).json({ error: 'Sin rutina' });
  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const emojis = {lunes:'🔥',martes:'⚡',miercoles:'💪',jueves:'🔥',viernes:'⚡',sabado:'💪',domingo:'🌟'};
  let texto = '💪 *Rutina de ' + usuario.nombre + '*\\n\\n';
  for (const dia of dias) {
    const d = rutina[dia];
    if (!d) continue;
    const ejs = d.ejercicios && d.ejercicios.filter(e=>e.nombre).length > 0 ? d.ejercicios : null;
    if (!ejs && !d.rutina) continue;
    const tit = dia.charAt(0).toUpperCase()+dia.slice(1);
    texto += '\\u0060\\u0060\\u0060\\n';
    const borde = '═'.repeat(28);
    texto += '╔' + borde + '╗\\n';
    const titulo = (emojis[dia]||'💪') + ' ' + tit.toUpperCase();
    const pad = Math.max(0, 28 - titulo.length);
    const lpad = Math.floor(pad/2);
    const rpad = pad - lpad;
    texto += '║' + ' '.repeat(lpad) + titulo + ' '.repeat(rpad) + '║\\n';
    texto += '╚' + borde + '╝\\n\\n';
    if (ejs) {
      const COL_EJ = 16; const COL_S = 3; const COL_R = 7; const COL_RIR = 3;
      texto += '| ' + 'EJERCICIO'.padEnd(COL_EJ) + ' | ' + 'S'.padEnd(COL_S) + ' | ' + 'REPS'.padEnd(COL_R) + ' |' + 'RIR'.padEnd(COL_RIR) + '|\\n';
      texto += '|' + '-'.repeat(COL_EJ+2) + '|' + '-'.repeat(COL_S+2) + '|' + '-'.repeat(COL_R+2) + '|' + '-'.repeat(COL_RIR+1) + '|\\n';
      for (const e of ejs) {
        if (!e.nombre) continue;
        const nom = e.nombre.length > COL_EJ ? e.nombre.substring(0,COL_EJ-1)+'.' : e.nombre;
        const ser = ((e.series||'')+(e.drop==='D'?'+D':'')).padEnd(COL_S);
        const rep = (e.reps||'').padEnd(COL_R);
        const rir = (e.rir||'').padEnd(COL_RIR);
        texto += '| ' + nom.padEnd(COL_EJ) + ' | ' + ser + ' | ' + rep + ' |' + rir + '|\\n';
      }
    } else {
      texto += d.rutina + '\\n';
    }
    if (d.rutina && ejs) texto += '\\n📝 ' + d.rutina + '\\n';
    texto += '\\u0060\\u0060\\u0060\\n\\n';
  }
  const resultado = await enviarMensaje(usuario.telefono, texto);
  res.json({ ok: resultado });
});`
);

fs.writeFileSync('index.js', c);
console.log('ok4');

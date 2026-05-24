const multer = require('multer');
const storage = multer.diskStorage({
  destination:(req,file,cb)=>cb(null,'./public/'),
  filename:(req,file,cb)=>cb(null,'logo_trainer.png')
});
const upload = multer({storage,limits:{fileSize:5*1024*1024}});
const storageFoto = multer.diskStorage({
  destination:(req,file,cb)=>{
    const id = req.params ? req.params.id : 'tmp';
    const dir = require('path').join(__dirname,'data/fotos',id);
    require('fs').mkdirSync(dir,{recursive:true});
    cb(null,dir);
  },
  filename:(req,file,cb)=>{
    const ext = file.originalname.split('.').pop();
    cb(null,'perfil.'+ext);
  }
});
const uploadFoto = multer({storage:storageFoto,limits:{fileSize:5*1024*1024}});
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/data/fotos', express.static(path.join(__dirname,'data/fotos')));

const cargarJSON = (archivo, def=[]) => {
  const ruta = path.join(__dirname, 'data', archivo);
  try{return JSON.parse(fs.readFileSync(ruta, 'utf8'));}catch{return def;}
};

const guardarJSON = (archivo, datos) => {
  const ruta = path.join(__dirname, 'data', archivo);
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
};

let sock;
module.exports = { getSock: () => sock };

async function conectarWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  sock = makeWASocket({ auth: state, printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'close') { global.waConectado=false;
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) conectarWhatsApp();
    }
    if (connection === 'open') { console.log('✅ WhatsApp conectado!'); global.waConectado=true; }
  });
}

async function enviarMensaje(telefono, mensaje) {
  if(global.waConectado===false) return false;
  try {
    const jid = telefono + '@s.whatsapp.net';
    await sock.sendMessage(jid, { text: mensaje });
    return true;
  } catch (e) {
    console.log('Error enviando:', e.message);
    return false;
  }
}

const DIAS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

// Backup automático cada noche a las 2am
cron.schedule('0 2 * * *', () => {
  try {
    const fecha = new Date().toISOString().split('T')[0];
    const origen = path.join(__dirname, 'data');
    const destino = path.join(__dirname, 'backups', fecha);
    fs.mkdirSync(destino, { recursive: true });
    const archivos = fs.readdirSync(origen).filter(f => f.endsWith('.json'));
    archivos.forEach(archivo => {
      fs.copyFileSync(path.join(origen, archivo), path.join(destino, archivo));
    });
    // Eliminar backups de más de 7 días
    const backupsDir = path.join(__dirname, 'backups');
    const carpetas = fs.readdirSync(backupsDir);
    carpetas.forEach(carpeta => {
      const fechaCarpeta = new Date(carpeta);
      const dias = (new Date() - fechaCarpeta) / (1000 * 60 * 60 * 24);
      if (dias > 7) fs.rmSync(path.join(backupsDir, carpeta), { recursive: true });
    });
    console.log('✅ Backup completado:', fecha);
  } catch(e) {
    console.error('❌ Error en backup:', e.message);
  }
});

cron.schedule('* * * * *', async () => {
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

  // Envío automático de rutinas y recordatorio de pago
  try {
    const ahora = new Date();
    const horaActual = ahora.getHours().toString().padStart(2,'0') + ':' + ahora.getMinutes().toString().padStart(2,'0');
    const DIAS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    const diaActual = DIAS[ahora.getDay()];
    const hoy = ahora.toISOString().split('T')[0];
    const festivos = cargarJSON('festivos.json');
    const usuarios = cargarJSON('usuarios.json');
    const rutinas = cargarJSON('rutinas.json');
    const logs = cargarJSON('logs.json');
    if (!logs[hoy]) logs[hoy] = {};

    if (festivos.find(f => f.fecha === hoy)) {
      guardarJSON('logs.json', logs);
      return;
    }

    // Respetar pausa global
    const cfg = cargarJSON('config.json');
    const pausadoHasta = cfg.envios_pausados_hasta || null;
    if (pausadoHasta) {
      if (pausadoHasta === 'indefinido') return;
      if (new Date(pausadoHasta) >= new Date(hoy)) return;
    }

    for (const usuario of usuarios) {
      if (!usuario.activo) continue;
      const [hh,mm] = usuario.hora_envio.split(':').map(Number);
      const limiteMin = hh*60+mm;
      const ahoraMin = ahora.getHours()*60+ahora.getMinutes();
      if (ahoraMin !== limiteMin) continue;
      const rutinaUsuario = rutinas[usuario.id];
      if (!rutinaUsuario || !rutinaUsuario[diaActual]) continue;
      if (!rutinaUsuario || !rutinaUsuario[diaActual]) continue;
              if (logs[hoy][usuario.id]) continue;
              const d = rutinaUsuario[diaActual];
              let lineas = [];
              lineas.push('*Rutina de ' + usuario.nombre + '*');
              lineas.push('');
              lineas.push('🔥 ' + diaActual.toUpperCase());
              lineas.push('');
              if (d.recordatorio) { lineas.push('📝 ' + d.recordatorio); lineas.push(''); }
              const ejs = d.ejercicios && d.ejercicios.filter(e=>e.nombre).length > 0 ? d.ejercicios : null;
              if (ejs) {
                ejs.forEach(e => {
                  if (e.nombre) {
                    lineas.push('┌───────────────────┐');
                    lineas.push('│ ' + e.nombre.substring(0,17).padEnd(17) + '│');
                    lineas.push('├───────────────────┤');
                    lineas.push('│ Series: ' + (e.series||'-').toString().padEnd(11) + '│');
                    lineas.push('│ Reps:   ' + (e.reps||'-').toString().padEnd(11) + '│');
                    lineas.push('│ RIR:    ' + (e.rir||'-').toString().padEnd(11) + '│');
                    lineas.push('│ DESC:   ' + (e.desc||'-').toString().padEnd(11) + '│');
                    lineas.push('│ VAR:    ' + (e.var||'').toString().padEnd(11) + '│');
                    lineas.push('└───────────────────┘');
                    lineas.push('');
                  }
                });
              }
              if (d.rutina) { lineas.push('📌 ' + d.rutina); lineas.push(''); }
              if (Array.isArray(d.cardio) && d.cardio.length > 0) {
                lineas.push('🏃 CARDIO');
                d.cardio.forEach(cx => {
                  if (cx.ejercicio) lineas.push('• ' + cx.ejercicio);
                  if (cx.tiempo) lineas.push('  Tiempo: ' + cx.tiempo + ' min');
                });
                lineas.push('');
              }
              const mensaje = lineas.join('\n');
              if (!mensaje.trim()) continue;
              const resultado = await enviarMensaje(usuario.telefono, mensaje);
              logs[hoy][usuario.id] = resultado ? 'enviado' : 'error';
              guardarJSON('logs.json', logs);
    }

    // Recordatorio de pago
    for (const usuario of usuarios) {
      if (!usuario.activo) continue;
      const [hh,mm] = usuario.hora_envio.split(':').map(Number);
      const limiteMin = hh*60+mm;
      const ahoraMin = ahora.getHours()*60+ahora.getMinutes();
      if (ahoraMin !== limiteMin) continue;
      const manana = new Date(ahora);
      manana.setDate(manana.getDate() + 1);
      const diaman = manana.getDate();
      if (diaman === usuario.dia_pago) {
        const msg = usuario.msg_pago || ('Hola ' + usuario.nombre + ', recuerda que mañana es tu fecha de pago.');
        await enviarMensaje(usuario.telefono, msg);
      } else if (usuario.tipo_pago === 'quincenal' && diaman === usuario.dia_pago2) {
        const msg = usuario.msg_q2 || ('Hola ' + usuario.nombre + ', recuerda que mañana es tu segunda quincena.');
        await enviarMensaje(usuario.telefono, msg);
      }
    }

    guardarJSON('logs.json', logs);
  } catch(e) {
    console.error('Cron envios:', e);
    try {
      const logErr = path.join(__dirname, 'data', 'errores.log');
      const linea = new Date().toISOString() + ' | CRON ERROR: ' + e.message + '\n';
      fs.appendFileSync(logErr, linea);
    } catch(e2) {}
  }
});

app.get('/api/usuarios', (req, res) => res.json(cargarJSON('usuarios.json')));
app.get('/api/usuarios/:id', (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const u = usuarios.find(x => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  res.json(u);
});
app.post('/api/usuarios', (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const nuevo = { id: Date.now().toString(), activo: true, ...req.body };
  usuarios.push(nuevo);
  const carpetaFotos = path.join(__dirname, 'data/fotos', nuevo.id);
  fs.mkdirSync(path.join(carpetaFotos, 'antes'), { recursive: true });
  fs.mkdirSync(path.join(carpetaFotos, 'despues'), { recursive: true });
  guardarJSON('usuarios.json', usuarios);
  res.json(nuevo);
});
// ---- CHAT INTERNO ----
app.get('/api/chat/:id', (req, res) => {
  const chats = cargarJSON('chats.json', {});
  res.json(chats[req.params.id] || []);
});

app.post('/api/chat/:id', (req, res) => {
  const { mensaje, tipo, autor, contenido } = req.body;
  const chats = cargarJSON('chats.json', {});
  if (!chats[req.params.id]) chats[req.params.id] = [];
  const msg = {
    id: Date.now().toString(),
    autor, // 'cliente' o 'entrenador'
    tipo: tipo || 'texto', // 'texto', 'imagen', 'voz'
    contenido: contenido || mensaje,
    fecha: new Date().toISOString(),
    leido: false // se marca leído cuando el destinatario abre el chat
  };
  chats[req.params.id].push(msg);
  guardarJSON('chats.json', chats);
  res.json({ ok: true, msg });
});

app.post('/api/chat/:id/leer', (req, res) => {
  const { autor } = req.body;
  const chats = cargarJSON('chats.json', {});
  if (chats[req.params.id]) {
    chats[req.params.id] = chats[req.params.id].map(m => {
      if (m.autor !== autor) m.leido = true;
      return m;
    });
    guardarJSON('chats.json', chats);
  }
  res.json({ ok: true });
});

app.get('/api/chat/no-leidos/entrenador', (req, res) => {
  const chats = cargarJSON('chats.json', {});
  let total = 0;
  const porCliente = {};
  Object.keys(chats).forEach(id => {
    const noLeidos = chats[id].filter(m => m.autor === 'cliente' && !m.leido).length;
    if (noLeidos > 0) { porCliente[id] = noLeidos; total += noLeidos; }
  });
  res.json({ total, porCliente });
});
// ---- FIN CHAT ----

// ---- CHAT INTERNO ----
app.get('/api/chat/:id', (req, res) => {
  const chats = cargarJSON('chats.json', {});
  res.json(chats[req.params.id] || []);
});

app.post('/api/chat/:id', (req, res) => {
  const { mensaje, tipo, autor, contenido } = req.body;
  const chats = cargarJSON('chats.json', {});
  if (!chats[req.params.id]) chats[req.params.id] = [];
  const msg = {
    id: Date.now().toString(),
    autor, // 'cliente' o 'entrenador'
    tipo: tipo || 'texto', // 'texto', 'imagen', 'voz'
    contenido: contenido || mensaje,
    fecha: new Date().toISOString(),
    leido: false // se marca leído cuando el destinatario abre el chat
  };
  chats[req.params.id].push(msg);
  guardarJSON('chats.json', chats);
  res.json({ ok: true, msg });
});

app.post('/api/chat/:id/leer', (req, res) => {
  const { autor } = req.body;
  const chats = cargarJSON('chats.json', {});
  if (chats[req.params.id]) {
    chats[req.params.id] = chats[req.params.id].map(m => {
      if (m.autor !== autor) m.leido = true;
      return m;
    });
    guardarJSON('chats.json', chats);
  }
  res.json({ ok: true });
});

app.get('/api/chat/no-leidos/entrenador', (req, res) => {
  const chats = cargarJSON('chats.json', {});
  let total = 0;
  const porCliente = {};
  Object.keys(chats).forEach(id => {
    const noLeidos = chats[id].filter(m => m.autor === 'cliente' && !m.leido).length;
    if (noLeidos > 0) { porCliente[id] = noLeidos; total += noLeidos; }
  });
  res.json({ total, porCliente });
});
// ---- FIN CHAT ----

app.post('/api/usuarios/:id/desbloquear-dia', (req, res) => {
  const { dia } = req.body;
  if (!dia) return res.status(400).json({ error: 'Falta dia' });
  const usuarios = cargarJSON('usuarios.json');
  const idx = usuarios.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  if (!usuarios[idx].dias_desbloqueados) usuarios[idx].dias_desbloqueados = {};
  const fecha = new Date().toISOString().split('T')[0];
  if (!usuarios[idx].dias_desbloqueados[dia]) usuarios[idx].dias_desbloqueados[dia] = [];
  if (!usuarios[idx].dias_desbloqueados[dia].includes(fecha)) {
    usuarios[idx].dias_desbloqueados[dia].push(fecha);
  }
  guardarJSON('usuarios.json', usuarios);
  res.json({ ok: true });
});

app.post('/api/usuarios/:id/perfil-cliente', (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const idx = usuarios.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  const { nombre, fecha_nacimiento, altura, etiqueta } = req.body;
  if (nombre) usuarios[idx].nombre = nombre;
  if (!usuarios[idx].perfil) usuarios[idx].perfil = {};
  if (fecha_nacimiento) usuarios[idx].perfil.fecha_nacimiento = fecha_nacimiento;
  if (altura) usuarios[idx].perfil.altura = altura;
  if (etiqueta) usuarios[idx].perfil.etiqueta = etiqueta;
  guardarJSON('usuarios.json', usuarios);
  res.json({ ok: true });
});

app.put('/api/usuarios/:id', (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const idx = usuarios.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  usuarios[idx] = { ...usuarios[idx], ...req.body };
  guardarJSON('usuarios.json', usuarios);
  res.json(usuarios[idx]);
});
app.delete('/api/usuarios/:id', (req, res) => {
  let usuarios = cargarJSON('usuarios.json');
  usuarios = usuarios.filter(u => u.id !== req.params.id);
  guardarJSON('usuarios.json', usuarios);
  res.json({ ok: true });
});
app.get('/api/rutinas/:id', (req, res) => {
  const rutinas = cargarJSON('rutinas.json');
  res.json(rutinas[req.params.id] || {});
});
app.post('/api/rutinas/:id', (req, res) => {
  const rutinas = cargarJSON('rutinas.json');
  rutinas[req.params.id] = req.body;
  guardarJSON('rutinas.json', rutinas);
  res.json({ ok: true });
});
app.get('/api/festivos', (req, res) => res.json(cargarJSON('festivos.json')));
app.post('/api/festivos', (req, res) => {
  const festivos = cargarJSON('festivos.json');
  festivos.push(req.body);
  guardarJSON('festivos.json', festivos);
  res.json({ ok: true });
});
app.delete('/api/festivos/:fecha', (req, res) => {
  let festivos = cargarJSON('festivos.json');
  festivos = festivos.filter(f => f.fecha !== req.params.fecha);
  guardarJSON('festivos.json', festivos);
  res.json({ ok: true });
});
app.get('/api/hiit', (req, res) => res.json(cargarJSON('hiit.json')));
app.post('/api/hiit', (req, res) => {
  const data = cargarJSON('hiit.json');
  const circuito = req.body;
  if(!circuito.id) circuito.id = Date.now();
  const idx = data.findIndex(c => c.id === circuito.id);
  if(idx >= 0) data[idx] = circuito;
  else data.push(circuito);
  guardarJSON('hiit.json', data);
  res.json({ok:true});
});
app.delete('/api/hiit/:id', (req, res) => {
  let data = cargarJSON('hiit.json');
  data = data.filter(c => String(c.id) !== req.params.id);
  guardarJSON('hiit.json', data);
  res.json({ok:true});
});


// SUBIR LOGO
app.post('/api/config/logo', upload.single('logo'), (req, res) => {
  if(!req.file) return res.status(400).json({error:'No file'});
  const cfg = cargarJSON('config.json');
  cfg.logo_entrenador = '/logo_trainer.png';
  guardarJSON('config.json', cfg);
  res.json({ok:true, path:'/logo_trainer.png'});
});

// ADMINISTRATIVO
app.get('/api/admin', (req, res) => res.json(cargarJSON('administrativo.json')));
app.get('/api/admin/:id', (req, res) => {
  const data = cargarJSON('administrativo.json');
  res.json(data.clientes[req.params.id] || {});
});
app.post('/api/admin/:id', (req, res) => {
  const data = cargarJSON('administrativo.json');
  if(!data.clientes[req.params.id]) data.clientes[req.params.id] = {precio:0,moneda:'COP',pagos:[]};
  const {msg_pago, ...resto} = req.body;
  Object.assign(data.clientes[req.params.id], resto);
  guardarJSON('administrativo.json', data);
  // Guardar msg_pago en usuarios.json
  if(msg_pago !== undefined){
    const usuarios = cargarJSON('usuarios.json');
    const idx = usuarios.findIndex(u => String(u.id) === String(req.params.id));
    if(idx !== -1){ usuarios[idx].msg_pago = msg_pago; guardarJSON('usuarios.json', usuarios); }
  }
  res.json({ok:true});
});
app.post('/api/admin/:id/pago', (req, res) => {
  const data = cargarJSON('administrativo.json');
  if(!data.clientes[req.params.id]) data.clientes[req.params.id] = {precio:0,moneda:'COP',pagos:[]};
  data.clientes[req.params.id].pagos.push({...req.body, fecha: new Date().toISOString().split('T')[0]});
  guardarJSON('administrativo.json', data);
  // Actualizar estado_pago en usuarios.json
  const usuarios = cargarJSON('usuarios.json');
  const idx = usuarios.findIndex(u => u.id === req.params.id);
  if(idx !== -1){ usuarios[idx].estado_pago = 'aldia'; guardarJSON('usuarios.json', usuarios); }
  res.json({ok:true});
});
app.post('/api/admin/config/update', (req, res) => {
  const data = cargarJSON('administrativo.json');
  Object.assign(data.config, req.body);
  guardarJSON('administrativo.json', data);
  res.json({ok:true});
});
// CONFIG
app.get('/api/config', (req, res) => res.json(cargarJSON('config.json')));
app.post('/api/config', (req, res) => {
  const cfg = cargarJSON('config.json');
  Object.assign(cfg, req.body);
  guardarJSON('config.json', cfg);
  res.json({ok:true});
});

app.post('/api/foto-cliente/:id', uploadFoto.single('foto'), (req, res) => {
  try {
    const id = req.params.id;
    const ext = req.file.originalname.split('.').pop();
    const carpeta = path.join(__dirname, 'data/fotos', id);
    if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta, { recursive: true });
    const dest = path.join(carpeta, 'perfil.' + ext);
    fs.renameSync(req.file.path, dest);
    const usuarios = cargarJSON('usuarios.json');
    const u = usuarios.find(x => x.id === id);
    if(u) { u.foto = 'data/fotos/'+id+'/perfil.'+ext; guardarJSON('usuarios.json', usuarios); }
    res.json({ok:true, foto: u.foto});
  } catch(e) { res.status(500).json({ok:false}); }
});

app.get('/data/fotos/:file', (req, res) => {
  const p = path.join(__dirname, 'data/fotos', req.params.file);
  if(fs.existsSync(p)) res.sendFile(p);
  else res.status(404).end();
});


// ===== ALIMENTACION =====
app.get('/api/alimentacion/:id', (req, res) => {
  const data = cargarJSON('alimentacion.json');
  res.json(data[req.params.id] || {});
});

app.post('/api/alimentacion/:id', (req, res) => {
  const data = cargarJSON('alimentacion.json');
  data[req.params.id] = req.body;
  guardarJSON('alimentacion.json', data);
  res.json({ ok: true });
});


app.get('/api/alimentacion/:id/semana', (req, res) => {
  try {
    const { generarPlanSemanal } = require('./generar_plan.js');
    const semana = generarPlanSemanal(req.params.id);
    res.json(semana);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/alimentacion/:id/plan', (req, res) => {
  try {
    const { generarPlanAlimentario } = require('./generar_plan.js');
    const plan = generarPlanAlimentario(req.params.id);
    // Guardar plan generado en alimentacion.json
    const data = cargarJSON('alimentacion.json');
    if (!data[req.params.id]) data[req.params.id] = {};
    data[req.params.id].plan_generado = plan;
    data[req.params.id].plan_fecha = new Date().toISOString();
    guardarJSON('alimentacion.json', data);
    res.json(plan);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/horarios', (req, res) => res.json(cargarJSON('horarios.json')));
app.post('/api/horarios', (req, res) => {
  guardarJSON('horarios.json', req.body);
  res.json({ok:true});
});

app.get('/api/status',(req,res)=>res.json({conectado:global.waConectado||false}));
app.get('/api/logs', (req, res) => res.json(cargarJSON('logs.json')));
app.post('/api/enviar', async (req, res) => {
  const { telefono, mensaje } = req.body;
  const resultado = await enviarMensaje(telefono, mensaje);
  res.json({ ok: resultado });
});
app.post('/api/enviar-rutina/:id', async (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const rutinas = cargarJSON('rutinas.json');
  const usuario = usuarios.find(u => u.id === req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  const rutina = rutinas[req.params.id];
  if (!rutina) return res.status(404).json({ error: 'Sin rutina' });
  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const emojis = {lunes:'🔥',martes:'⚡',miercoles:'💪',jueves:'🔥',viernes:'⚡',sabado:'💪',domingo:'🌟'};
  let lineas = ['*Rutina de ' + usuario.nombre + '*', ''];
  for (const dia of dias) {
    const d = rutina[dia];
    if (!d) continue;
    const ejs = d.ejercicios && d.ejercicios.filter(e=>e.nombre).length > 0 ? d.ejercicios : null;
    if (!ejs && !d.rutina) continue;
    const tit = dia.charAt(0).toUpperCase()+dia.slice(1);
    lineas.push('╔════════════════════╗');
    lineas.push('║ ' + emojis[dia] + ' ' + tit.toUpperCase().padEnd(18) + '║');
    lineas.push('╚════════════════════╝');
    if (d.recordatorio) {
      lineas.push('📝 ' + d.recordatorio);
    }
    if (ejs && ejs.length > 0) {
      ejs.forEach((e) => {
        if (e.nombre) {
          lineas.push('┌───────────────────┐');
          lineas.push('│ ' + e.nombre.substring(0,17).padEnd(17) + '│');
          lineas.push('├───────────────────┤');
          lineas.push('│ Serie: ' + (e.series || '').padEnd(14) + '│');
          lineas.push('│ Rep: ' + (e.reps || '').padEnd(14) + '│');
          lineas.push('│ Rir: ' + (e.rir || '').padEnd(12) + '│');
          lineas.push('│ Desc: ' + (e.desc || '').padEnd(11) + '│');
          lineas.push('│ Var: ' + (e.var || '').padEnd(13) + '│');
          lineas.push('└───────────────────┘');
        }
      });
    }
    if (d.rutina) {
      lineas.push('📌 ' + d.rutina);
    }
    if (Array.isArray(d.cardio) && d.cardio.length > 0) {
      lineas.push('╔════════════════════╗');
      lineas.push('║ 🏃 CARDIO          ║');
      lineas.push('╚════════════════════╝');
      d.cardio.forEach(c => {
        if (c.momento || c.ejercicio || c.tiempo) {
          lineas.push('┌───────────────────┐');
          if (c.momento) lineas.push('│ Momento: ' + c.momento);
          if (c.ejercicio) lineas.push('│ Ejercicio: ' + c.ejercicio);
          if (c.tiempo) lineas.push('│ Tiempo: ' + c.tiempo + ' min');
          if (c.notas) lineas.push('│ Notas: ' + c.notas);
          lineas.push('└───────────────────┘');
        }
      });
    }
    lineas.push('');
  }
  let texto = lineas.join('\n');
  const resultado = await enviarMensaje(usuario.telefono, texto);
  res.json({ ok: resultado });
});
app.post('/api/enviar-dia/:id/:dia', async (req, res) => {
  const usuarios = cargarJSON('usuarios.json');
  const rutinas = cargarJSON('rutinas.json');

  const usuario = usuarios.find(u => u.id === req.params.id);

  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const rutina = rutinas[req.params.id];

  if (!rutina) {
    return res.status(404).json({ error: 'Rutina no encontrada' });
  }

  const dia = req.params.dia.toLowerCase();

  if (!rutina[dia]) {
    return res.status(404).json({ error: 'Día no encontrado' });
  }

  const d = rutina[dia];

  let lineas = [];

  lineas.push(`*Rutina de ${usuario.nombre}*`);
  lineas.push('');
  lineas.push(`🔥 ${dia.toUpperCase()}`);
  lineas.push('');

  if (d.recordatorio) {
    lineas.push(`📝 ${d.recordatorio}`);
    lineas.push('');
  }

  if (d.ejercicios && d.ejercicios.length > 0) {
    d.ejercicios.forEach(e => {
lineas.push('┌───────────────────┐');
lineas.push(`│ ${e.nombre || ''}`.padEnd(20) + '│');
lineas.push('├───────────────────┤');
lineas.push(`│ Series: ${e.series || ''}`.padEnd(20) + '│');
lineas.push(`│ Reps: ${e.reps || ''}`.padEnd(20) + '│');
lineas.push(`│ RIR: ${e.rir || ''}`.padEnd(20) + '│');
lineas.push(`│ DESC: ${e.desc || ''}`.padEnd(20) + '│');
lineas.push(`│ VAR: ${e.var || ''}`.padEnd(20) + '│');
lineas.push('└───────────────────┘');
lineas.push('');    });
  }

  if (d.rutina) {
    lineas.push(`📌 ${d.rutina}`);
  }

  if (Array.isArray(d.cardio) && d.cardio.length > 0) {
    lineas.push('');
    lineas.push('╔════════════════════╗');
    lineas.push('║ 🏃 CARDIO          ║');
    lineas.push('╚════════════════════╝');
    d.cardio.forEach(c => {
      if (c.momento || c.ejercicio || c.tiempo) {
        lineas.push('┌───────────────────┐');
        if (c.momento) lineas.push('│ Momento: ' + c.momento);
        if (c.ejercicio) lineas.push('│ Ejercicio: ' + c.ejercicio);
        if (c.tiempo) lineas.push('│ Tiempo: ' + c.tiempo + ' min');
        if (c.notas) lineas.push('│ Notas: ' + c.notas);
        lineas.push('└───────────────────┘');
      }
    });
  }

  const texto = lineas.join('\n');

  const resultado = await enviarMensaje(usuario.telefono, texto);

  res.json({ ok: resultado });
});
require("./sincronizar");
require("./rutas_historial")(app, fs);
conectarWhatsApp();
app.listen(3000, () => console.log('Interfaz en http://localhost:3000'));
require('./rutas_informe')(app, fs);
app.post('/api/informe/:id/enviar', async (req, res) => {
  try {
    const id = req.params.id;
    const usuarios = JSON.parse(fs.readFileSync('./data/usuarios.json', 'utf8'));
    const usuario = usuarios.find(u => u.id == id || u.telefono == id);
    if (!usuario) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });

    const telefono = usuario.telefono.replace(/[^0-9]/g, '');
    const jid = telefono + '@s.whatsapp.net';
    const nombre = usuario.nombre || 'Cliente';

    const http = require('http');
    const htmlContent = await new Promise((resolve, reject) => {
      const req2 = http.request({ hostname: 'localhost', port: 3000, path: '/api/informe/' + id + '/html', method: 'GET' }, (res2) => {
        let data = '';
        res2.on('data', chunk => data += chunk);
        res2.on('end', () => resolve(data));
      });
      req2.on('error', reject);
      req2.end();
    });

    const buffer = Buffer.from(htmlContent, 'utf-8');
    await sock.sendMessage(jid, {
      document: buffer,
      mimetype: 'text/html',
      fileName: 'Informe-Premium-' + nombre.replace(/ /g, '-') + '.html'
    });
    res.json({ ok: true, mensaje: 'Informe enviado a ' + nombre });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


// SUBIR FOTO COMPARATIVA (antes/después)
const storageFotoComp = multer.diskStorage({
  destination:(req,file,cb)=>{
    const {id,tipo} = req.params;
    const dir = path.join(__dirname,'data/fotos',id,tipo);
    fs.mkdirSync(dir,{recursive:true});
    cb(null,dir);
  },
  filename:(req,file,cb)=>{
    const ext = file.originalname.split('.').pop();
    cb(null,'foto.'+ext);
  }
});
const uploadFotoComp = multer({storage:storageFotoComp,limits:{fileSize:5*1024*1024}});

app.post('/api/foto-comparativa/:id/:tipo', uploadFotoComp.single('foto'), (req, res) => {
  try {
    const {id, tipo} = req.params;
    if (!['antes','despues'].includes(tipo)) return res.status(400).json({ok:false,error:'Tipo inválido'});
    res.json({ok:true, path:`data/fotos/${id}/${tipo}/foto.${req.file.originalname.split('.').pop()}`});
  } catch(e) { res.status(500).json({ok:false,error:e.message}); }
});

// Vinculación cliente
app.post('/api/vincular', (req, res) => {
  const { id, codigo } = req.body;
  const cfg = cargarJSON('config.json');
  if (codigo !== cfg.codigo_vinculacion) return res.json({ ok: false, error: 'Código incorrecto' });
  const usuarios = cargarJSON('usuarios.json');
  const u = usuarios.find(u => u.id === id);
  if (!u) return res.json({ ok: false, error: 'Usuario no encontrado' });
  u.vinculado = true;
  guardarJSON('usuarios.json', usuarios);
  res.json({ ok: true });
});

app.get('/api/codigo-entrenador', (req, res) => {
  const cfg = cargarJSON('config.json');
  res.json({ codigo: cfg.codigo_vinculacion });
});

// Habilitar dia en app para cliente
app.post('/api/habilitar-dia/:id', (req, res) => {
  const { dia } = req.body;
  const usuarios = cargarJSON('usuarios.json');
  const u = usuarios.find(u => u.id === req.params.id);
  if (!u) return res.json({ ok: false });
  if (!u.dias_habilitados) u.dias_habilitados = [];
  if (!u.dias_habilitados.includes(dia)) u.dias_habilitados.push(dia);
  guardarJSON('usuarios.json', usuarios);
  res.json({ ok: true });
});

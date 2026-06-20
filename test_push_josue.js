const webpush = require('web-push');
const fs = require('fs');

const contenido = fs.readFileSync('./index.js', 'utf8');
const match = contenido.match(/setVapidDetails\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/);
webpush.setVapidDetails(match[1], match[2], match[3]);

const subs = JSON.parse(fs.readFileSync('./data/push_suscripciones.json'));
const sub = subs['ent_1781193469799'];

if (!sub) { console.log('Sin suscripcion — Josue no ha entrado aun'); process.exit(); }

webpush.sendNotification(sub, JSON.stringify({
  titulo: '🏋️ DT App',
  mensaje: 'Notificación de prueba — ¿te llegó esto Josué?'
})).then(() => console.log('OK enviada')).catch(e => console.log('Error:', e.message));

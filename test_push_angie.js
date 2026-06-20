const webpush = require('web-push');
const fs = require('fs');

const contenido = fs.readFileSync('./index.js', 'utf8');
const match = contenido.match(/setVapidDetails\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/);
if (!match) { console.log('No encontre VAPID'); process.exit(); }

webpush.setVapidDetails(match[1], match[2], match[3]);

const subs = JSON.parse(fs.readFileSync('./data/push_suscripciones.json'));
const sub = subs['ent_1781660142511'];

if (!sub) { console.log('No tiene suscripcion'); process.exit(); }

webpush.sendNotification(sub, JSON.stringify({
  titulo: '🏋️ DT App',
  mensaje: 'Prueba de notificación — ¿te llegó esto?'
})).then(() => console.log('OK enviada')).catch(e => console.log('Error:', e.message));

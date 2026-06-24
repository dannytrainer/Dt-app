// ═══════════════════════════════
// 🔔 NOTIFICACIONES PUSH
// ═══════════════════════════════
async function iniciarNotificacionesPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    const permiso = await Notification.requestPermission();
    if (permiso !== 'granted') return;
    const vapidResp = await fetch('/api/push/vapidkey');
    const { publicKey } = await vapidResp.json();
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey
    });
    const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
    const userId = sesion.id || null;
    if (userId) {
      await fetch('/api/push/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, suscripcion: sub })
      });
      console.log('✅ Notificaciones push activadas');
    }
  } catch(e) {
    console.log('Push error:', e);
  }
}

window.addEventListener('load', () => {
  function intentarPush(intentos) {
    const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
    if (sesion.id) {
      iniciarNotificacionesPush();
    } else if (intentos > 0) {
      setTimeout(() => intentarPush(intentos - 1), 5000);
    }
  }
  setTimeout(() => intentarPush(6), 3000);
});

// También llamar después del login
window.activarPushTrasLogin = iniciarNotificacionesPush;

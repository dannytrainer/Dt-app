self.addEventListener('push', function(event) {
  const data = event.data ? JSON.parse(event.data.text()) : {};
  const titulo = data.titulo || 'DT-APP';
  const mensaje = data.mensaje || 'Tienes una notificación';
  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: mensaje,
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://dt-app.net'));
});

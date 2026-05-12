const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');
c = c.replace(
  `    const recordatorio = rutinaUsuario[diaActual].recordatorio || '';
    const rutinaDia = rutinaUsuario[diaActual].rutina || '';
    const mensaje = recordatorio + (rutinaDia ? '\\n\\n' + rutinaDia : '');
    if (!mensaje.trim()) continue;
    const resultado = await enviarMensaje(usuario.telefono, mensaje);
    logs[hoy][usuario.id] = resultado ? 'enviado' : 'error';

    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);
    const diaman = manana.getDate();
    if (diaman === usuario.dia_pago) {
      const msg = usuario.msg_pago || ('Hola ' + usuario.nombre + ', recuerda que manana es tu fecha de pago.');
      await enviarMensaje(usuario.telefono, msg);
    } else if (usuario.tipo_pago === 'quincenal' && diaman === usuario.dia_pago2) {
      const msg = usuario.msg_q2 || ('Hola ' + usuario.nombre + ', recuerda que manana es tu segunda quincena.');
      await enviarMensaje(usuario.telefono, msg);
    }`,
  `    const recordatorio = rutinaUsuario[diaActual].recordatorio || '';
    const rutinaDia = rutinaUsuario[diaActual].rutina || '';
    const mensaje = recordatorio + (rutinaDia ? '\\n\\n' + rutinaDia : '');
    if (!mensaje.trim()) continue;
    const resultado = await enviarMensaje(usuario.telefono, mensaje);
    logs[hoy][usuario.id] = resultado ? 'enviado' : 'error';`
);

c = c.replace(
  "  guardarJSON('logs.json', logs);",
  `  // Recordatorio de pago (independiente de rutina)
  for (const usuario of usuarios) {
    if (!usuario.activo) continue;
    if (usuario.hora_envio !== horaActual) continue;
    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);
    const diaman = manana.getDate();
    if (diaman === usuario.dia_pago) {
      const msg = usuario.msg_pago || ('Hola ' + usuario.nombre + ', recuerda que manana es tu fecha de pago.');
      await enviarMensaje(usuario.telefono, msg);
    } else if (usuario.tipo_pago === 'quincenal' && diaman === usuario.dia_pago2) {
      const msg = usuario.msg_q2 || ('Hola ' + usuario.nombre + ', recuerda que manana es tu segunda quincena.');
      await enviarMensaje(usuario.telefono, msg);
    }
  }
  guardarJSON('logs.json', logs);`
);

fs.writeFileSync('index.js', c);
console.log('ok');

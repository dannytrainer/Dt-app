const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');
c = c.replace(
  "const manana = new Date(ahora);\n    manana.setDate(manana.getDate() + 1);\n    const diaman = manana.getDate();\n    if (diaman === usuario.dia_pago || (usuario.tipo_pago===\"quincenal\" && diaman === usuario.dia_pago2)) {\n      await enviarMensaje(usuario.telefono, \"Hola \" + usuario.nombre + \", recuerda que manana es tu fecha de pago.\");\n    }",
  "const manana = new Date(ahora);\n    manana.setDate(manana.getDate() + 1);\n    const diaman = manana.getDate();\n    if (diaman === usuario.dia_pago) {\n      const msg = usuario.msg_pago || ('Hola ' + usuario.nombre + ', recuerda que manana es tu fecha de pago.');\n      await enviarMensaje(usuario.telefono, msg);\n    } else if (usuario.tipo_pago === 'quincenal' && diaman === usuario.dia_pago2) {\n      const msg = usuario.msg_q2 || ('Hola ' + usuario.nombre + ', recuerda que manana es tu segunda quincena.');\n      await enviarMensaje(usuario.telefono, msg);\n    }"
);
fs.writeFileSync('index.js', c);
console.log('ok9');

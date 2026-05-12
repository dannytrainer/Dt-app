const fs = require('fs');
let c = fs.readFileSync('index.js', 'utf8');
c = c.replace(
  'if (shouldReconnect) require("./sincronizar");\nrequire(\'./rutas_historial\')(app, fs);\nconectarWhatsApp();',
  'if (shouldReconnect) conectarWhatsApp();'
);
c = c.replace(
  'conectarWhatsApp();\napp.listen',
  'require("./sincronizar");\nrequire("./rutas_historial")(app, fs);\nconectarWhatsApp();\napp.listen'
);
fs.writeFileSync('index.js', c);
console.log('ok');

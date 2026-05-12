const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

// 1. Cambiar Historial por Herramientas en nav
c = c.replace(
  "<button onclick=\"showPage('logs')\">📊 Historial</button>",
  "<button onclick=\"showPage('herramientas')\">🔧 Herramientas</button>"
);

// 2. Agregar página herramientas vacía
c = c.replace(
  '<div id="page-logs" class="page">',
  '<div id="page-herramientas" class="page"><p class="st">Próximamente</p></div>\n<div id="page-logs" class="page">'
);

// 3. Agregar herramientas al showPage
c = c.replace(
  "if(p==='logs')cargarLogs();",
  "if(p==='logs')cargarLogs();\nif(p==='herramientas'){};"
);

// 4. Quitar botón Rutina de tarjeta cliente
c = c.replace(
  `<button class="btn bg" style="flex:1;font-size:12px" onclick="abrirRutina('\${u.id}','\${u.nombre}')">📋 Rutina</button>\n`,
  ''
);

fs.writeFileSync('public/index.html', c);
console.log('ok1');

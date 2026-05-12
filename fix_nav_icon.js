const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  "<button onclick=\"showPage('herramientas')\">🔧 Herramientas</button>",
  "<button onclick=\"showPage('herramientas')\">⏱️ Herramientas</button>"
);
fs.writeFileSync('public/index.html', c);
console.log('ok1');

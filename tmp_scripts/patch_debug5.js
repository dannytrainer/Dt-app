const fs = require('fs');
const path = 'public/js/herramientas-enc.js';
let contenido = fs.readFileSync(path, 'utf8');

const buscar = "      cont2.innerHTML = h;\n    }).catch(function(){});";
if (!contenido.includes(buscar)) { console.log("ERROR: no encontrado"); process.exit(1); }

const reemplazo = "      cont2.innerHTML = h;\n    }).catch(function(err){ var c1=document.getElementById('enc-progreso-peso'); if(c1) c1.innerHTML = '<div style=\"color:yellow;font-size:11px\">DEBUG error fetch: ' + err + '</div>'; });";

contenido = contenido.replace(buscar, reemplazo);
fs.writeFileSync(path, contenido);
console.log("OK");

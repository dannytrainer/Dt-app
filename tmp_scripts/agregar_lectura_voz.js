const fs = require('fs');

// 1) Funcion global de lectura de voz en app-utilidades.js
const pathUtil = 'public/js/app-utilidades.js';
let cUtil = fs.readFileSync(pathUtil, 'utf8');
const funcionVoz = `

function tcLeerPasos(pasos, btnId) {
  if (!('speechSynthesis' in window)) { alert('Tu navegador no soporta lectura de voz'); return; }
  var btn = document.getElementById(btnId);
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    if (btn) btn.innerHTML = '\\uD83D\\uDD0A Escuchar pasos';
    return;
  }
  if (!pasos || pasos.length === 0) return;
  if (btn) btn.innerHTML = '\\u23F9 Detener lectura';
  var idx = 0;
  function leerSiguiente() {
    if (idx >= pasos.length) { if (btn) btn.innerHTML = '\\uD83D\\uDD0A Escuchar pasos'; return; }
    var texto = 'Paso ' + (idx + 1) + '. ' + pasos[idx];
    var u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES';
    u.rate = 0.8;
    u.onend = function(){ idx++; leerSiguiente(); };
    u.onerror = function(){ if (btn) btn.innerHTML = '\\uD83D\\uDD0A Escuchar pasos'; };
    window.speechSynthesis.speak(u);
  }
  leerSiguiente();
}
`;
if (!cUtil.includes('function tcLeerPasos')) {
  cUtil += funcionVoz;
  fs.writeFileSync(pathUtil, cUtil, 'utf8');
  console.log('OK: tcLeerPasos agregada en app-utilidades.js');
} else {
  console.log('YA EXISTIA tcLeerPasos, no se toco');
}

// 2) Boton en herramientas-enc.js (comillas dobles en el html)
const pathEnc = 'public/js/herramientas-enc.js';
let cEnc = fs.readFileSync(pathEnc, 'utf8');
const buscarEnc = `  if ((e.ejecucion||[]).length > 0) {
    html += "<div style=\\"margin-bottom:16px\\"><div style=\\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\\">Ejecucion</div>";`;
const nuevoEnc = `  if ((e.ejecucion||[]).length > 0) {
    window._tcPasosLectura = e.ejecucion;
    html += "<div style=\\"margin-bottom:16px\\"><div style=\\"display:flex;align-items:center;justify-content:space-between;margin-bottom:8px\\"><div style=\\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase\\">Ejecucion</div><button id=\\"btn-leer-tts\\" onclick=\\"tcLeerPasos(window._tcPasosLectura,'btn-leer-tts')\\" style=\\"background:var(--gris);border:1px solid var(--borde);border-radius:20px;color:var(--texto);font-size:11px;font-weight:700;padding:5px 12px;cursor:pointer\\">\uD83D\uDD0A Escuchar pasos</button></div>";`;
if (cEnc.includes(buscarEnc)) {
  cEnc = cEnc.replace(buscarEnc, nuevoEnc);
  fs.writeFileSync(pathEnc, cEnc, 'utf8');
  console.log('OK aplicado en herramientas-enc.js');
} else {
  console.log('NO SE ENCONTRO en herramientas-enc.js');
}

// 3) Boton en admin-inicio.js (comillas simples en el html)
const pathAdmin = 'public/js/admin-inicio.js';
let cAdmin = fs.readFileSync(pathAdmin, 'utf8');
const buscarAdmin = `  if ((e.ejecucion||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Ejecucion</div>';`;
const nuevoAdmin = `  if ((e.ejecucion||[]).length > 0) {
    window._tcPasosLectura = e.ejecucion;
    html += '<div style="margin-bottom:16px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase">Ejecucion</div><button id="btn-leer-tts2" onclick="tcLeerPasos(window._tcPasosLectura,\\'btn-leer-tts2\\')" style="background:var(--gris);border:1px solid var(--borde);border-radius:20px;color:var(--texto);font-size:11px;font-weight:700;padding:5px 12px;cursor:pointer">\uD83D\uDD0A Escuchar pasos</button></div>';`;
if (cAdmin.includes(buscarAdmin)) {
  cAdmin = cAdmin.replace(buscarAdmin, nuevoAdmin);
  fs.writeFileSync(pathAdmin, cAdmin, 'utf8');
  console.log('OK aplicado en admin-inicio.js');
} else {
  console.log('NO SE ENCONTRO en admin-inicio.js');
}

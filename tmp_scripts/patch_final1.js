const fs = require('fs');
const path = 'public/js/admin-inicio.js';
let contenido = fs.readFileSync(path, 'utf8');

const buscar = `  (function(encId){
    var uid = (typeof _tcUsuario !== 'undefined' && _tcUsuario && _tcUsuario.id) || null;
    if (!uid) { var c0=document.getElementById('enc-progreso-peso'); if(c0) c0.innerHTML='<div style="color:red;font-size:12px">DEBUG: no hay uid</div>'; return; }
    fetch('/api/historial-pesos/' + uid + '/' + encId).then(function(r){return r.json();}).then(function(res){
      var cont2 = document.getElementById('enc-progreso-peso');
      if (!cont2) return;
      var semanas = res.semanas || [];
      if (semanas.length === 0) { cont2.innerHTML = '<div style="color:orange;font-size:12px">DEBUG: uid=' + uid + ' encId=' + encId + ' semanas vacio. res=' + JSON.stringify(res) + '</div>'; return; }`;

const reemplazo = `  (function(encId){
    var tcApp = document.getElementById('terminal-cliente-app');
    var enModoCliente = tcApp && tcApp.style.display === 'flex';
    var uid = (typeof _tcUsuario !== 'undefined' && _tcUsuario && _tcUsuario.id) || null;
    if (!uid || !enModoCliente) return;
    fetch('/api/historial-pesos/' + uid + '/' + encId).then(function(r){return r.json();}).then(function(res){
      var cont2 = document.getElementById('enc-progreso-peso');
      if (!cont2) return;
      var semanas = res.semanas || [];
      if (semanas.length === 0) { cont2.innerHTML = ''; return; }`;

if (!contenido.includes(buscar)) { console.log("ERROR: no encontrado"); process.exit(1); }
contenido = contenido.replace(buscar, reemplazo);
fs.writeFileSync(path, contenido);
console.log("OK");

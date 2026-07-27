const fs = require('fs');
const path = 'public/js/herramientas-enc.js';
let contenido = fs.readFileSync(path, 'utf8');

const buscar = `  (function(encId){
    var tcApp = document.getElementById('terminal-cliente-app');
    var enModoCliente = tcApp && tcApp.style.display === 'flex';
    var uid = (typeof _tcUsuario !== 'undefined' && _tcUsuario && _tcUsuario.id) || null;
    if (!uid || !enModoCliente) { var c0=document.getElementById('enc-progreso-peso'); if(c0) c0.innerHTML='<div style="color:red;font-size:11px">DEBUG enc: uid=' + uid + ' enModoCliente=' + enModoCliente + ' tcApp=' + (tcApp?tcApp.style.display:'no-existe') + '</div>'; return; }
    fetch('/api/historial-pesos/' + uid + '/' + encId).then(function(r){return r.json();}).then(function(res){
      var cont2 = document.getElementById('enc-progreso-peso');
      if (!cont2) return;
      var semanas = res.semanas || [];
      if (semanas.length === 0) { cont2.innerHTML = '<div style="color:orange;font-size:11px">DEBUG vacio: uid=' + uid + ' encId=' + encId + '</div>'; return; }`;

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

const buscarCatch = `}).catch(function(err){ var c1=document.getElementById('enc-progreso-peso'); if(c1) c1.innerHTML = '<div style="color:yellow;font-size:11px">DEBUG error fetch: ' + err + '</div>'; });`;
const reemplazoCatch = `}).catch(function(){});`;
if (!contenido.includes(buscarCatch)) { console.log("ERROR: catch no encontrado"); process.exit(1); }
contenido = contenido.replace(buscarCatch, reemplazoCatch);

fs.writeFileSync(path, contenido);
console.log("OK");

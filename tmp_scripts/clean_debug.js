const fs = require('fs');
const path = 'public/js/herramientas-enc.js';
let c = fs.readFileSync(path, 'utf8');
let count = 0;

const a = `if (!uid || !enModoCliente) { var c0=cont.querySelector('#enc-progreso-peso'); if(c0) c0.innerHTML='<div style="color:red;font-size:11px">DEBUG enc: uid=' + uid + ' enModoCliente=' + enModoCliente + '</div>'; return; }`;
const aNew = `if (!uid || !enModoCliente) { return; }`;
if (c.includes(a)) { c = c.replace(a, aNew); count++; }

const b = `if (semanas.length === 0) { cont2.innerHTML = '<div style="color:orange;font-size:11px">DEBUG vacio: uid=' + uid + ' encId=' + encId + '</div>'; return; }`;
const bNew = `if (semanas.length === 0) { cont2.innerHTML = ''; return; }`;
if (c.includes(b)) { c = c.replace(b, bNew); count++; }

const d = `}).catch(function(err){ var c1=cont.querySelector('#enc-progreso-peso'); if(c1) c1.innerHTML = '<div style="color:yellow;font-size:11px">DEBUG error: ' + err + '</div>'; });`;
const dNew = `}).catch(function(err){});`;
if (c.includes(d)) { c = c.replace(d, dNew); count++; }

fs.writeFileSync(path, c, 'utf8');
console.log('Reemplazos hechos:', count, 'de 3');

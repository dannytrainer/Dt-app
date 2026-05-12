const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
const idx = c.indexOf('async function guardarRutina()');
const end = c.indexOf('\n}', idx) + 2;
const nuevo = `async function guardarRutina(){
guardarEjsActuales();
const rec=document.getElementById('rec-'+diaSeleccionado);
const rut=document.getElementById('rut-'+diaSeleccionado);
if(rec)rutinaActual[diaSeleccionado]={...rutinaActual[diaSeleccionado],recordatorio:rec.value,rutina:rut?.value||''};
const id=document.getElementById('rutina-cliente-id').value;
await fetch('/api/rutinas/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rutinaActual)});
toast('✅ Rutina guardada');cerrarModalRutina();
}`;
c = c.slice(0, idx) + nuevo + c.slice(end);
fs.writeFileSync('public/index.html', c);
console.log('ok');

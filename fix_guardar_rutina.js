const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

c = c.replace(
  `async function guardarRutina(){
const rec=document.getElementById('rec-'+diaSeleccionado);
const rut=document.getElementById('rut-'+diaSeleccionado);
if(rec)rutinaActual[diaSeleccionado]={...rutinaActual[diaSeleccionado],recordatorio:rec.value,rutina:rut?.value||''};
const id=document.getElementById('rutina-cliente-id').value;
await fetch('/api/rutinas/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rutinaActual)});
toast('✅ Rutina guardada');cerrarModalRutina();
}`,
  `async function guardarRutina(){
  guardarEjerciciosActuales();
  const rec=document.getElementById('rec-'+diaSeleccionado);
  const rut=document.getElementById('rut-'+diaSeleccionado);
  if(rec) rutinaActual[diaSeleccionado]={...rutinaActual[diaSeleccionado],recordatorio:rec.value,rutina:rut?.value||''};
  const id=document.getElementById('rutina-cliente-id').value;
  await fetch('/api/rutinas/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rutinaActual)});
  toast('✅ Rutina guardada');cerrarModalRutina();
}`
);

fs.writeFileSync('public/index.html', c);
console.log('ok3');

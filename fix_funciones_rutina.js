const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

c = c.replace(
  'function seleccionarDia(dia){',
  `function agregarEjercicio(){
  const dia = diaSeleccionado;
  if (!rutinaActual[dia]) rutinaActual[dia] = {recordatorio:'',rutina:'',ejercicios:[]};
  if (!rutinaActual[dia].ejercicios) rutinaActual[dia].ejercicios = [];
  guardarEjerciciosActuales();
  rutinaActual[dia].ejercicios.push({nombre:'',series:'',reps:'',rir:'',drop:''});
  renderRutinaForm();
}

function eliminarEjercicio(idx){
  const dia = diaSeleccionado;
  guardarEjerciciosActuales();
  rutinaActual[dia].ejercicios.splice(idx,1);
  renderRutinaForm();
}

function guardarEjerciciosActuales(){
  const dia = diaSeleccionado;
  if (!rutinaActual[dia]) rutinaActual[dia] = {recordatorio:'',rutina:'',ejercicios:[]};
  const lista = document.getElementById('lista-ejercicios-'+dia);
  if (!lista) return;
  const items = lista.querySelectorAll('[id^="ej-"][id$="-nombre"]');
  const ejs = [];
  items.forEach((el,i) => {
    ejs.push({
      nombre: document.getElementById('ej-'+i+'-nombre')?.value||'',
      series: document.getElementById('ej-'+i+'-series')?.value||'',
      reps: document.getElementById('ej-'+i+'-reps')?.value||'',
      rir: document.getElementById('ej-'+i+'-rir')?.value||'',
      drop: document.getElementById('ej-'+i+'-drop')?.value||''
    });
  });
  rutinaActual[dia].ejercicios = ejs;
}

function seleccionarDia(dia){`
);

c = c.replace(
  'if(rec)rutinaActual[diaSeleccionado]={recordatorio:rec.value,rutina:rut.value};',
  'guardarEjerciciosActuales();\nconst rec=document.getElementById(\'rec-\'+diaSeleccionado);\nconst rut=document.getElementById(\'rut-\'+diaSeleccionado);\nif(rec)rutinaActual[diaSeleccionado]={...rutinaActual[diaSeleccionado],recordatorio:rec.value,rutina:rut?.value||\'\'};'
);

fs.writeFileSync('public/index.html', c);
console.log('ok2');

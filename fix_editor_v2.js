const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
const idx = c.indexOf('function renderRutinaForm()');
const end = c.indexOf('function cerrarModalRutina()');
const nuevo = `function renderRutinaForm(){
const d=rutinaActual[diaSeleccionado]||{recordatorio:'',rutina:'',ejercicios:[]};
const ejs=d.ejercicios||[];
let h='';
ejs.forEach((e,i)=>{h+=\`<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:10px;margin-bottom:6px"><div style="display:flex;gap:6px;margin-bottom:6px"><input type="text" value="\${e.nombre||''}" placeholder="Ejercicio" id="ej-\${i}-n" style="flex:1;background:#111;border:1px solid #333;border-radius:6px;padding:8px;color:#fff;font-size:13px;outline:none"><button onclick="eliminarEjercicio(\${i})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:6px 10px;cursor:pointer">🗑️</button></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">\${[['series','S','4'],['reps','Reps','8-10'],['rir','RIR','1-2'],['desc','DESC','60s'],['var','VAR','V1']].map(([f,label,ph])=>\`<div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:2px">\${label}</div><input type="text" id="ej-\${i}-\${f}" value="\${e[f]||''}" placeholder="\${ph}" style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:6px;color:#fff;font-size:12px;text-align:center;outline:none"></div>\`).join('')}</div></div>\`;});
document.getElementById('rutina-form').innerHTML=\`<div class="ig"><label>💬 Recordatorio</label><textarea id="rec-\${diaSeleccionado}" placeholder="Escribe el recordatorio...">\${d.recordatorio||''}</textarea></div><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">📋 Ejercicios</div><div id="lista-ejs">\${h}</div><button onclick="agregarEjercicio()" style="width:100%;background:#1a1a1a;color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar ejercicio</button><div class="ig" style="margin-top:10px"><label>📝 Notas</label><textarea id="rut-\${diaSeleccionado}" placeholder="Notas adicionales...">\${d.rutina||''}</textarea></div>\`;}

function guardarEjsActuales(){
const dia=diaSeleccionado;
if(!rutinaActual[dia])rutinaActual[dia]={recordatorio:'',rutina:'',ejercicios:[]};
const recEl=document.getElementById('rec-'+dia);
const rutEl=document.getElementById('rut-'+dia);
if(recEl)rutinaActual[dia].recordatorio=recEl.value;
if(rutEl)rutinaActual[dia].rutina=rutEl.value;
const lista=document.getElementById('lista-ejs');
if(!lista)return;
const n=lista.querySelectorAll('[id$="-n"]').length;
const ejs=[];
for(let i=0;i<n;i++){
ejs.push({
nombre:document.getElementById('ej-'+i+'-n')?.value||'',
series:document.getElementById('ej-'+i+'-series')?.value||'',
reps:document.getElementById('ej-'+i+'-reps')?.value||'',
rir:document.getElementById('ej-'+i+'-rir')?.value||'',
desc:document.getElementById('ej-'+i+'-desc')?.value||'',
var:document.getElementById('ej-'+i+'-var')?.value||''
});
}
rutinaActual[dia].ejercicios=ejs;
}

function agregarEjercicio(){
guardarEjsActuales();
const dia=diaSeleccionado;
if(!rutinaActual[dia].ejercicios)rutinaActual[dia].ejercicios=[];
rutinaActual[dia].ejercicios.push({nombre:'',series:'',reps:'',rir:'',desc:'',var:''});
renderRutinaForm();
}

function eliminarEjercicio(idx){
guardarEjsActuales();
rutinaActual[diaSeleccionado].ejercicios.splice(idx,1);
renderRutinaForm();
}

`;
c = c.slice(0, idx) + nuevo + c.slice(end);
fs.writeFileSync('public/index.html', c);
console.log('ok2');

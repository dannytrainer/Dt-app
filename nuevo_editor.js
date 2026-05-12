const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

const viejo = `function renderRutinaForm(){
const d=rutinaActual[diaSeleccionado]||{recordatorio:'',rutina:''};
document.getElementById('rutina-form').innerHTML=\`
<div class="ig"><label>💬 Recordatorio del día</label>
<textarea id="rec-\${diaSeleccionado}" placeholder="Escribe el recordatorio del día...">\${d.recordatorio}</textarea></div>
<div class="ig"><label>📋 Rutina completa (envío manual)</label>
<textarea id="rut-\${diaSeleccionado}" placeholder="Ej: Sentadilla 4x12&#10;Prensa 3x15&#10;Curl 3x12">\${d.rutina}</textarea></div>\`;}`;

const nuevo = `function renderRutinaForm(){
const d=rutinaActual[diaSeleccionado]||{recordatorio:'',rutina:'',ejercicios:[]};
const ejs=d.ejercicios||[];
let ejsHtml='';
ejs.forEach((e,i)=>{
ejsHtml+=\`<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:10px;margin-bottom:6px">
<div style="display:flex;gap:6px;margin-bottom:6px">
<input type="text" value="\${e.nombre||''}" placeholder="Ejercicio" id="ej-\${i}-nombre" style="flex:1;background:#111;border:1px solid #333;border-radius:6px;padding:8px;color:#fff;font-size:13px;outline:none">
<button onclick="eliminarEjercicio(\${i})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:6px 10px;cursor:pointer">🗑️</button>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr;gap:4px">
<div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:2px">Series</div><input type="text" id="ej-\${i}-series" value="\${e.series||''}" placeholder="4" style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:6px;color:#fff;font-size:12px;text-align:center;outline:none"></div>
<div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:2px">Reps</div><input type="text" id="ej-\${i}-reps" value="\${e.reps||''}" placeholder="8-10" style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:6px;color:#fff;font-size:12px;text-align:center;outline:none"></div>
<div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:2px">RIR</div><input type="text" id="ej-\${i}-rir" value="\${e.rir||''}" placeholder="1-2" style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:6px;color:#fff;font-size:12px;text-align:center;outline:none"></div>
<div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:2px">DESC</div><input type="text" id="ej-\${i}-desc" value="\${e.desc||''}" placeholder="60s" style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:6px;color:#fff;font-size:12px;text-align:center;outline:none"></div>
<div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:2px">VAR</div><input type="text" id="ej-\${i}-var" value="\${e.var||''}" placeholder="V1" style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:6px;color:#fff;font-size:12px;text-align:center;outline:none"></div>
<div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:2px">Drop</div><select id="ej-\${i}-drop" style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:6px;color:#fff;font-size:12px;outline:none"><option value="" \${!e.drop?'selected':''}>—</option><option value="D" \${e.drop==='D'?'selected':''}>+D</option></select></div>
</div></div>\`;
});
document.getElementById('rutina-form').innerHTML=\`
<div class="ig"><label>💬 Recordatorio del día</label>
<textarea id="rec-\${diaSeleccionado}" placeholder="Escribe el recordatorio del día...">\${d.recordatorio}</textarea></div>
<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">📋 Ejercicios</div>
<div id="lista-ejs">\${ejsHtml}</div>
<button onclick="agregarEjercicio()" style="width:100%;background:#1a1a1a;color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar ejercicio</button>
<div class="ig" style="margin-top:10px"><label>📝 Notas adicionales</label>
<textarea id="rut-\${diaSeleccionado}" placeholder="Notas, indicaciones especiales...">\${d.rutina||''}</textarea></div>\`;}

function guardarEjsActuales(){
const dia=diaSeleccionado;
if(!rutinaActual[dia])rutinaActual[dia]={recordatorio:'',rutina:'',ejercicios:[]};
const lista=document.getElementById('lista-ejs');
if(!lista)return;
const n=lista.querySelectorAll('[id$="-nombre"]').length;
const ejs=[];
for(let i=0;i<n;i++){
ejs.push({
nombre:document.getElementById('ej-'+i+'-nombre')?.value||'',
series:document.getElementById('ej-'+i+'-series')?.value||'',
reps:document.getElementById('ej-'+i+'-reps')?.value||'',
rir:document.getElementById('ej-'+i+'-rir')?.value||'',
desc:document.getElementById('ej-'+i+'-desc')?.value||'',
var:document.getElementById('ej-'+i+'-var')?.value||'',
drop:document.getElementById('ej-'+i+'-drop')?.value||''
});
}
rutinaActual[dia].ejercicios=ejs;
}

function agregarEjercicio(){
guardarEjsActuales();
const dia=diaSeleccionado;
if(!rutinaActual[dia].ejercicios)rutinaActual[dia].ejercicios=[];
rutinaActual[dia].ejercicios.push({nombre:'',series:'',reps:'',rir:'',desc:'',var:'',drop:''});
renderRutinaForm();
}

function eliminarEjercicio(idx){
guardarEjsActuales();
rutinaActual[diaSeleccionado].ejercicios.splice(idx,1);
renderRutinaForm();
}`;

if (c.includes('function renderRutinaForm()')) {
  c = c.replace(viejo, nuevo);
  if (!c.includes('agregarEjercicio')) {
    const idx = c.lastIndexOf('function renderRutinaForm()');
    const end = c.indexOf('\n}', idx) + 2;
    c = c.slice(0, end) + '\n' + nuevo.split('function renderRutinaForm()')[1].split('function guardarEjsActuales')[0] + 'function guardarEjsActuales' + nuevo.split('function guardarEjsActuales')[1] + c.slice(end);
  }
}

fs.writeFileSync('public/index.html', c);
console.log('ok');

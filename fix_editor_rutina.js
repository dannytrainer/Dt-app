const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

c = c.replace(
  'function renderRutinaForm(){\nconst d=rutinaActual[diaSeleccionado]||{recordatorio:\'\',rutina:\'\'};\ndocument.getElementById(\'rutina-form\').innerHTML=`\n<div class="ig"><label>💬 Recordatorio del día</label>\n<textarea id="rec-${diaSeleccionado}" placeholder="Escribe el recordatorio del día...">${d.recordatorio}</textarea></div>\n<div class="ig"><label>📋 Rutina completa (envío manual)</label>\n<textarea id="rut-${diaSeleccionado}" placeholder="Ej: Sentadilla 4x12&#10;Prensa 3x15&#10;Curl 3x12">${d.rutina}</textarea></div>`;',
  `function renderRutinaForm(){
const d=rutinaActual[diaSeleccionado]||{recordatorio:'',rutina:'',ejercicios:[]};
const ejs = d.ejercicios||[];
document.getElementById('rutina-form').innerHTML=\`
<div class="ig"><label>💬 Recordatorio del día</label>
<textarea id="rec-\${diaSeleccionado}" placeholder="Escribe el recordatorio del día...">\${d.recordatorio}</textarea></div>
<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">📋 Ejercicios del día</div>
<div id="lista-ejercicios-\${diaSeleccionado}">
\${ejs.map((e,i)=>\`
<div style="background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:10px;margin-bottom:6px" id="ej-\${i}">
  <div style="display:flex;gap:6px;margin-bottom:6px">
    <input type="text" value="\${e.nombre||''}" placeholder="Ejercicio" id="ej-\${i}-nombre"
      style="flex:2;background:#111;border:1px solid #333;border-radius:6px;padding:8px;color:#fff;font-size:13px;outline:none">
    <button onclick="eliminarEjercicio(\${i})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:8px;cursor:pointer;font-size:13px">🗑️</button>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px">
    <div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:3px">Series</div>
    <input type="text" value="\${e.series||''}" placeholder="4" id="ej-\${i}-series"
      style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:12px;text-align:center;outline:none"></div>
    <div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:3px">Reps</div>
    <input type="text" value="\${e.reps||''}" placeholder="8-10" id="ej-\${i}-reps"
      style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:12px;text-align:center;outline:none"></div>
    <div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:3px">RIR</div>
    <input type="text" value="\${e.rir||''}" placeholder="1-2" id="ej-\${i}-rir"
      style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:12px;text-align:center;outline:none"></div>
    <div><div style="font-size:9px;color:#555;text-align:center;margin-bottom:3px">Drop</div>
    <select id="ej-\${i}-drop" style="width:100%;background:#111;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:12px;outline:none">
      <option value="" \${!e.drop?'selected':''}>No</option>
      <option value="D" \${e.drop==='D'?'selected':''}>+D</option>
    </select></div>
  </div>
</div>\`).join('')}
</div>
<button onclick="agregarEjercicio()" style="width:100%;background:#1a1a1a;color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar ejercicio</button>
<div class="ig" style="margin-top:12px"><label>📝 Notas del día (opcional)</label>
<textarea id="rut-\${diaSeleccionado}" placeholder="Notas adicionales, indicaciones especiales...">\${d.rutina||''}</textarea></div>
\`;}`
);

fs.writeFileSync('public/index.html', c);
console.log('ok1');

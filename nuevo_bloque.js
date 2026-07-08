function _dtOrdenDefault(d){
  const nEj=(d.ejercicios||[]).length;
  const nCar=(d.cardio||[]).length;
  const orden=[];
  for(let i=0;i<nEj;i++)orden.push('ej'+i);
  for(let i=0;i<nCar;i++)orden.push('car'+i);
  return orden;
}
function _dtObtenerOrden(d){
  const nEj=(d.ejercicios||[]).length;
  const nCar=(d.cardio||[]).length;
  if(Array.isArray(d.orden)&&d.orden.length===nEj+nCar)return d.orden;
  return _dtOrdenDefault(d);
}
function renderRutinaForm(){
const d=rutinaActual[diaSeleccionado]||{recordatorio:'',rutina:'',ejercicios:[]};
const ejs=d.ejercicios||[];
const cardios=d.cardio||[];
const orden=_dtObtenerOrden(d);
let h='';
orden.forEach((token)=>{
  const tipo=token.replace(/[0-9]+$/,'');
  const idx=parseInt(token.replace(/^[a-z]+/,''),10);
  if(tipo==='ej'){
    const e=ejs[idx];
    if(!e)return;
    h+=`<div id="rut-drag-ej-${idx}" data-tipo="ej" data-idx="${idx}" draggable="true" ondragstart="rutDragStart(event,${idx},'ej')" ondragover="rutDragOver(event,${idx},'ej')" ondrop="rutDrop(event,${idx},'ej')" ondragend="rutDragEnd(event)" style="background:var(--fondo);border:1px solid #222;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab"><div style="display:flex;gap:6px;margin-bottom:6px"><span ontouchstart="rutTouchStart(event,${idx},'ej')" ontouchmove="rutTouchMove(event)" ontouchend="rutTouchEnd(event)" style="color:var(--texto-tenue);font-size:16px;padding:6px 4px;cursor:grab;touch-action:none">☰</span><div style="flex:1;position:relative"><input type="text" value="${e.nombre||''}" placeholder="Ejercicio" id="ej-${idx}-n" oninput="entAutoComplete(this,${idx})" style="width:100%;background:var(--card);border:1px solid #333;border-radius:6px;padding:8px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"><div id="enc-suggest-${idx}" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--fondo);border:1px solid #444;border-radius:0 0 8px 8px;z-index:9999;max-height:200px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,0.4)"></div></div><button onclick="entVerEjercicio(${idx})" style="background:#111;color:#ccc;border:1px solid #333;border-radius:6px;padding:6px 8px;cursor:pointer;font-size:13px">👁️</button><button onclick="eliminarEjercicio(${idx})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:6px 10px;cursor:pointer">🗑️</button></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">${[['series','S','4'],['reps','Reps','8-10'],['rir','RIR','1-2'],['desc','DESC','60s'],['var','VAR','V1']].map(([f,label,ph])=>`<div><div style="font-size:9px;color:var(--texto-secundario);text-align:center;margin-bottom:2px">${label}</div><input type="text" id="ej-${idx}-${f}" value="${e[f]||''}" placeholder="${ph}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:6px;padding:6px;color:var(--texto);font-size:12px;text-align:center;outline:none"></div>`).join('')}</div></div>`;
  } else {
    const c=cardios[idx];
    if(!c)return;
    h+=`<div id="rut-drag-cardio-${idx}" data-tipo="cardio" data-idx="${idx}" draggable="true" ondragstart="rutDragStart(event,${idx},'cardio')" ondragover="rutDragOver(event,${idx},'cardio')" ondrop="rutDrop(event,${idx},'cardio')" ondragend="rutDragEnd(event)" style="background:var(--card);border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span ontouchstart="rutTouchStart(event,${idx},'cardio')" ontouchmove="rutTouchMove(event)" ontouchend="rutTouchEnd(event)" style="font-size:16px;color:var(--texto-tenue);cursor:grab;touch-action:none">☰</span><span style="font-size:11px;color:#e31e24;font-weight:700">🏃 CARDIO</span><button onclick="eliminarCardio(${idx})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑️</button></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Momento</div><input type="text" id="c-${idx}-cm" value="${c.momento||''}" placeholder="Ej: Calentamiento, Final..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Ejercicio</div><input type="text" id="c-${idx}-ce" value="${c.ejercicio||''}" placeholder="Ej: Bici, Elíptica..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Tiempo (min)</div><input type="number" id="c-${idx}-ct" value="${c.tiempo||''}" placeholder="Ej: 20" style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Notas</div><textarea id="c-${idx}-cn" placeholder="Observaciones..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;min-height:55px;box-sizing:border-box">${c.notas||''}</textarea></div></div>`;
  }
});
document.getElementById('rutina-form').innerHTML=`<div class="ig"><label>🏷️ Título</label><textarea id="rec-${diaSeleccionado}" placeholder="Escribe el título del dia...">${d.recordatorio||''}</textarea></div><div style="margin-top:8px"><label style="font-size:10px;color:var(--texto-secundario);text-transform:uppercase;letter-spacing:1px;font-weight:700">⏱️ Tiempo máximo</label><select id="tmax-${diaSeleccionado}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:13px;outline:none;margin-top:4px"><option value="0" ${!d.tiempo_max_min?'selected':''}>Sin límite</option><option value="30" ${d.tiempo_max_min==30?'selected':''}>30 min</option><option value="45" ${d.tiempo_max_min==45?'selected':''}>45 min</option><option value="60" ${d.tiempo_max_min==60?'selected':''}>1 hora</option><option value="90" ${d.tiempo_max_min==90?'selected':''}>1h 30</option><option value="120" ${d.tiempo_max_min==120?'selected':''}>2 horas</option><option value="150" ${d.tiempo_max_min==150?'selected':''}>2h 30</option></select></div><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">📋 Elementos</div><div id="lista-ejs">${h}</div><div id="selector-tipo-elemento" style="display:none;gap:8px;margin-top:6px"><button onclick="agregarElemento('ej')" style="flex:1;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer">💪 Fuerza</button><button onclick="agregarElemento('cardio')" style="flex:1;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer">🏃 Cardio</button></div><button id="btn-agregar-elemento" onclick="mostrarSelectorElemento()" style="width:100%;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar elemento</button><div style="margin-top:10px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700">📝 Notas</div><button id="chip-presencial" onclick="togglePresencial()" style="padding:5px 12px;border-radius:20px;border:1px solid #333;background:${d.presencial?'#e31e24':'#1a1a1a'};color:${d.presencial?'#fff':'#666'};font-size:10px;font-weight:700;cursor:pointer">🏟️ Presencial</button></div><textarea id="rut-${diaSeleccionado}" placeholder="Notas adicionales..." style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;min-height:80px">${d.rutina||''}</textarea></div>`;
}

function mostrarSelectorElemento(){
  const sel=document.getElementById('selector-tipo-elemento');
  const btn=document.getElementById('btn-agregar-elemento');
  if(sel){sel.style.display='flex';}
  if(btn){btn.style.display='none';}
}

function guardarEjsActuales(){
const dia=diaSeleccionado;
if(!rutinaActual[dia])rutinaActual[dia]={recordatorio:'',rutina:'',ejercicios:[]};
const recEl=document.getElementById('rec-'+dia);
const rutEl=document.getElementById('rut-'+dia);
if(recEl)rutinaActual[dia].recordatorio=recEl.value;
if(rutEl)rutinaActual[dia].rutina=rutEl.value;
const tmaxEl=document.getElementById('tmax-'+dia);
if(tmaxEl)rutinaActual[dia].tiempo_max_min=parseInt(tmaxEl.value)||0;
const lista=document.getElementById('lista-ejs');
if(!lista)return;
const nEj=lista.querySelectorAll('[id$="-n"]').length;
const ejs=[];
for(let i=0;i<nEj;i++){
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
const nCar=lista.querySelectorAll('[id$="-cm"]').length;
const cardios=[];
for(let i=0;i<nCar;i++){
cardios.push({
momento:document.getElementById('c-'+i+'-cm')?.value||'',
ejercicio:document.getElementById('c-'+i+'-ce')?.value||'',
tiempo:document.getElementById('c-'+i+'-ct')?.value||'',
notas:document.getElementById('c-'+i+'-cn')?.value||''
});
}
rutinaActual[dia].cardio=cardios;
const orden=[];
lista.querySelectorAll('[data-tipo]').forEach(function(el){
orden.push(el.getAttribute('data-tipo')+el.getAttribute('data-idx'));
});
if(orden.length===ejs.length+cardios.length){
rutinaActual[dia].orden=orden;
}
}

function agregarElemento(tipo){
guardarEjsActuales();
const dia=diaSeleccionado;
if(!rutinaActual[dia].ejercicios)rutinaActual[dia].ejercicios=[];
if(!Array.isArray(rutinaActual[dia].cardio))rutinaActual[dia].cardio=[];
if(!Array.isArray(rutinaActual[dia].orden))rutinaActual[dia].orden=_dtObtenerOrden(rutinaActual[dia]);
let nuevoToken;
if(tipo==='ej'){
rutinaActual[dia].ejercicios.push({nombre:'',series:'',reps:'',rir:'',desc:'',var:''});
nuevoToken='ej'+(rutinaActual[dia].ejercicios.length-1);
} else {
rutinaActual[dia].cardio.push({momento:'',ejercicio:'',tiempo:'',notas:''});
nuevoToken='car'+(rutinaActual[dia].cardio.length-1);
}
rutinaActual[dia].orden.push(nuevoToken);
const sel=document.getElementById('selector-tipo-elemento');
const btn=document.getElementById('btn-agregar-elemento');
if(sel)sel.style.display='none';
if(btn)btn.style.display='block';
renderRutinaForm();
}

function eliminarEjercicio(idx){
guardarEjsActuales();
const dia=diaSeleccionado;
rutinaActual[dia].ejercicios.splice(idx,1);
delete rutinaActual[dia].orden;
renderRutinaForm();
}

function eliminarCardio(idx){
guardarEjsActuales();
const dia=diaSeleccionado;
if(Array.isArray(rutinaActual[dia].cardio)){
rutinaActual[dia].cardio.splice(idx,1);
delete rutinaActual[dia].orden;
renderRutinaForm();
}
}


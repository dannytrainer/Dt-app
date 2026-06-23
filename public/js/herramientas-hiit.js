// HIIT / CIRCUITOS
// ═══════════════════════════════
let _hiitCircuitos=[];
async function hiitCargar(){
  try{
    const r=await fetch('/api/hiit');
    const todos=await r.json();
    _hiitCircuitos=todos.filter(x=>x.tipo!=='intervalo');
    _intervCircuitos=todos.filter(x=>x.tipo==='intervalo');
  }catch(e){}
}
hiitCargar();
let _hiitActual=null;
let _hiitEjecutando=null;

// ── estado intervalos simples ────────────────────────────────────────────────
let _intervTab = 'lista'; // lista | nuevo | ejecutar
let _intervActual = null;
let _intervEjecutando = null;
let _intervCircuitos = [];
let _intervViendoEjecucion = false;

// ── TAB ACTIVO Y VISTAS INDEPENDIENTES ──────────────────────────────────────
let _hiitTab = 'circuitos';          // 'circuitos' | 'intervalos'
let _hiitVistaCircuito = 'lista';    // vista actual del módulo circuitos
let _hiitVistaIntervalo = 'lista';   // vista actual del módulo intervalos

function renderHiit(c){
  c.innerHTML=`
  <div id="hiit-panel">
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button id="btn-tab-circuitos" onclick="_hiitCambiarTab('circuitos')" style="flex:1;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">🔥 Circuitos</button>
      <button id="btn-tab-intervalos" onclick="_hiitCambiarTab('intervalos')" style="flex:1;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">⏱️ Intervalos</button>
    </div>
    <div id="hiit-contenido"></div>
  </div>`;
  _hiitCambiarTab(_hiitTab);
}

function _hiitCambiarTab(tab) {
  _hiitTab = tab;
  // Estilos tabs
  var btnC = document.getElementById('btn-tab-circuitos');
  var btnI = document.getElementById('btn-tab-intervalos');
  if (btnC) {
    btnC.style.background = tab==='circuitos' ? '#e31e24' : '#1a1a1a';
    btnC.style.color = '#fff';
    btnC.style.border = tab==='circuitos' ? '1px solid #e31e24' : '1px solid #333';
  }
  if (btnI) {
    btnI.style.background = tab==='intervalos' ? '#4a9eff' : '#1a1a1a';
    btnI.style.color = tab==='intervalos' ? '#fff' : '#4a9eff';
    btnI.style.border = tab==='intervalos' ? '1px solid #4a9eff' : '1px solid #4a9eff';
  }
  var c = document.getElementById('hiit-contenido');
  if (!c) return;
  if (tab === 'circuitos') {
    hiitMostrar(_hiitVistaCircuito);
  } else {
    intervMostrar(_hiitVistaIntervalo);
  }
}

function hiitMostrar(vista){
  _hiitVistaCircuito = vista;
  const c=document.getElementById('hiit-contenido');
  if(!c)return;
  if(vista==='lista') hiitRenderLista(c);
  else if(vista==='nuevo'){_hiitActual=hiitNuevoCircuito();hiitRenderEditor(c);}
  else if(vista==='editor') hiitRenderEditor(c);
  else if(vista==='ejecutar') hiitRenderEjecucion(c);
}

// ── INTERVALOS SIMPLES ───────────────────────────────────────────────────────
function intervMostrar(vista) {
  _hiitVistaIntervalo = vista;
  const c = document.getElementById('hiit-contenido');
  if (!c) return;
  if (vista==='lista')     intervRenderLista(c);
  else if (vista==='nuevo')   { _intervActual = intervNuevo(); intervRenderEditor(c); }
  else if (vista==='editor')  intervRenderEditor(c);
  else if (vista==='ejecutar') intervRenderEjecucion(c);
}

function intervNuevo() {
  return {
    id: Date.now(),
    nombre: 'Intervalos',
    preparacion: 10,
    trabajo: 30,
    descanso: 15,
    rondas: 8,
    sets: 1,
    descEntreSets: 60,
    finalizacion: 5
  };
}

function intervRenderLista(c) {
  var html = '';
  if (!_intervCircuitos.length) {
    html = '<div style="text-align:center;padding:40px;color:var(--texto-secundario)">Sin intervalos aún.<br>Crea el primero 👆</div>';
  } else {
    html = _intervCircuitos.map(function(iv, i) {
      var total = iv.preparacion + (iv.trabajo + iv.descanso) * iv.rondas + iv.finalizacion;
      return '<div style="background:var(--fondo);border:1px solid #2a0000;border-radius:12px;padding:14px;margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-size:14px;font-weight:700;color:var(--texto)">' + iv.nombre + '</div>' +
        '<div style="font-size:11px;color:var(--texto-secundario)">~' + Math.ceil(total/60) + ' min</div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:10px">' +
        '⚡ ' + iv.trabajo + 's · 😮 ' + iv.descanso + 's · ' + iv.rondas + ' rondas' +
        ((iv.sets&&iv.sets>1) ? ' · ' + iv.sets + ' sets' : '') +
        '</div>' +
        '<div style="display:flex;gap:6px">' +
        '<button onclick="_intervActual=JSON.parse(JSON.stringify(_intervCircuitos[' + i + ']));intervMostrar(\'ejecutar\')" style="flex:2;background:#e31e24;color:var(--texto);border:none;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">▶️ Iniciar</button>' +
        '<button onclick="_intervActual=JSON.parse(JSON.stringify(_intervCircuitos[' + i + ']));intervMostrar(\'editor\')" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:12px;cursor:pointer">✏️ Editar</button>' +
        '<button onclick="intervEliminar(' + i + ')" style="flex:1;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:8px;font-size:12px;cursor:pointer">🗑️</button>' +
        '</div>' +
        '</div>';
    }).join('');
  }
  c.innerHTML =
    '<button onclick="intervMostrar(\'nuevo\')" style="width:100%;background:#0a0a1a;color:#e31e24;border:1px solid #e31e24;border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:12px">➕ Nuevo intervalo</button>' +
    html;
}

function intervRenderEditor(c) {
  var iv = _intervActual;
  c.innerHTML =
    '<button onclick="intervMostrar(\'lista\')" style="background:var(--gris2);border:1px solid #333;border-radius:8px;color:var(--texto-medio);font-size:11px;font-weight:700;padding:5px 12px;cursor:pointer;margin-bottom:10px">← Volver</button>' +
    '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px">' +
    '<div>' +
    '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px">Nombre</div>' +
    '<input value="' + iv.nombre + '" onchange="_intervActual.nombre=this.value" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:14px;font-weight:700;box-sizing:border-box">' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    _intervCampo('Preparación (seg)', iv.preparacion, '_intervActual.preparacion=parseInt(this.value)||0') +
    _intervCampo('Trabajo (seg) ⚡', iv.trabajo, '_intervActual.trabajo=parseInt(this.value)||1') +
    _intervCampo('Descanso (seg) 😮', iv.descanso, '_intervActual.descanso=parseInt(this.value)||0') +
    _intervCampo('Rondas 🔁', iv.rondas, '_intervActual.rondas=parseInt(this.value)||1') +
    _intervCampo('Sets 🔄', iv.sets||1, '_intervActual.sets=parseInt(this.value)||1') +
    _intervCampo('Desc. entre sets (seg)', iv.descEntreSets||0, '_intervActual.descEntreSets=parseInt(this.value)||0') +
    _intervCampo('Finalización (seg)', iv.finalizacion, '_intervActual.finalizacion=parseInt(this.value)||0') +
    '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:12px">' +
    '' +
    '<button onclick="intervGuardar()" style="flex:2;background:#4a9eff;color:var(--texto);border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer">💾 Guardar</button>' +
    '<button onclick="intervMostrar(\'ejecutar\')" style="flex:2;background:#e31e24;color:var(--texto);border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer">▶️ Iniciar</button>' +
    '</div>';
}

function _intervCampo(label, val, onchange) {
  return '<div>' +
    '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px">' + label + '</div>' +
    '<input type="number" min="0" value="' + val + '" onchange="' + onchange + '" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:20px;text-align:center;font-family:monospace;box-sizing:border-box">' +
    '</div>';
}

async function intervGuardar() {
  var iv = _intervActual;
  if (!iv.nombre.trim()) { toast('⚠️ Ponle un nombre',false); return; }
  iv.tipo = 'intervalo';
  if (!iv.id) iv.id = Date.now();
  if(!entEsPremium()){mostrarCandadoPremium('Guardar intervalos requiere Plan Premium.');return;}
  await fetch('/api/hiit', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(iv)});
  var idx = _intervCircuitos.findIndex(function(x){return x.id===iv.id;});
  if (idx >= 0) _intervCircuitos[idx] = iv;
  else _intervCircuitos.push(iv);
  toast('💾 Intervalo guardado');
  intervMostrar('lista');
}

async function intervEliminar(i) {
  var iv = _intervCircuitos[i];
  if (!iv) return;
  await fetch('/api/hiit/' + iv.id, {method:'DELETE'});
  _intervCircuitos.splice(i, 1);
  toast('🗑️ Eliminado');
  intervMostrar('lista');
}

// ── EJECUCIÓN INTERVALOS ─────────────────────────────────────────────────────
function intervRenderEjecucion(c) {
  _intervViendoEjecucion = true;
  if (_intervEjecutando) {
    clearInterval(_intervEjecutando.interval);
    _intervEjecutando = null;
  }
  var iv = _intervActual;
  _intervEjecutando = {
    iv: iv,
    fase: 'preparacion',  // preparacion | trabajo | descanso | desc_sets | finalizacion | fin
    rondaActual: 1,
    setActual: 1,
    resto: iv.preparacion || iv.trabajo,
    total: iv.preparacion || iv.trabajo,
    running: false,
    interval: null
  };
  if (!_intervEjecutando.resto) {
    _intervEjecutando.fase = 'trabajo';
    _intervEjecutando.resto = iv.trabajo;
    _intervEjecutando.total = iv.trabajo;
  }
  intervRenderFrame(c);
}

function intervRenderFrame(c) {
  var ej = _intervEjecutando;
  if (!ej) return;
  var iv = ej.iv;
  var colores = {preparacion:'#ffd700', trabajo:'#e31e24', descanso:'#4caf50', finalizacion:'#4a9eff', fin:'#555'};
  var labels  = {preparacion:'⏳ Preparación', trabajo:'⚡ Trabajo', descanso:'😮‍💨 Descanso', finalizacion:'🏁 Finalización', fin:'✅ ¡Listo!'};
  var col = colores[ej.fase] || '#fff';
  var lbl = labels[ej.fase]  || '';
  var pct = ej.total > 0 ? Math.round((ej.resto / ej.total) * 100) : 0;
  var mins = Math.floor(ej.resto/60);
  var secs = ej.resto % 60;
  var display = (mins>0?mins+'m ':'') + secs + 's';

  c.innerHTML =
    '<div style="text-align:center;padding:10px 0">' +
    '<button onclick="intervMostrar(\'lista\')" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:7px 14px;font-size:12px;cursor:pointer;margin-bottom:16px">← Salir</button>' +
    '<div style="font-size:13px;font-weight:700;color:' + col + ';margin-bottom:8px;letter-spacing:1px">' + lbl + '</div>' +
    '<div style="font-size:70px;font-weight:700;color:var(--texto);font-family:monospace;line-height:1;margin-bottom:8px;text-shadow:0 0 30px ' + col + '66">' + display + '</div>' +
    (ej.fase==='trabajo'||ej.fase==='descanso' ?
      '<div style="font-size:14px;color:var(--texto-secundario);margin-bottom:12px">Ronda ' + ej.rondaActual + '/' + iv.rondas +
      ((iv.sets&&iv.sets>1) ? ' · Set ' + ej.setActual + '/' + iv.sets : '') + '</div>'
    : ej.fase==='desc_sets' ?
      '<div style="font-size:14px;color:#e31e24;margin-bottom:12px">Descanso entre sets · Set ' + ej.setActual + '/' + iv.sets + '</div>'
    : '<div style="margin-bottom:12px"></div>') +
    '<div style="background:var(--card);border-radius:8px;height:8px;margin:0 20px 20px;overflow:hidden">' +
    '<div style="height:100%;width:' + pct + '%;background:' + col + ';border-radius:8px;transition:width 0.9s linear"></div>' +
    '</div>' +
    (ej.fase !== 'fin' ?
      '<button onclick="intervToggle()" style="background:' + (ej.running?'#333':'#e31e24') + ';color:var(--texto);border:none;border-radius:50%;width:72px;height:72px;font-size:28px;cursor:pointer;box-shadow:0 0 20px ' + col + '44">' + (ej.running?'⏸️':'▶️') + '</button>'
    : '<button onclick="intervMostrar(\'lista\')" style="background:#4a9eff;color:var(--texto);border:none;border-radius:12px;padding:16px 32px;font-size:16px;font-weight:700;cursor:pointer">👊 Volver</button>') +
    '</div>';
}

function intervToggle() {
  var ej = _intervEjecutando;
  if (!ej) return;
  if (!ej.running && _hiitEjecutando) {
    if (!confirm('Hay un circuito en curso. ¿Detenerlo y continuar?')) return;
    clearInterval(_hiitEjecutando.interval);
    _hiitEjecutando = null;
  }
  var c = document.getElementById('hiit-contenido');
  if (ej.running) {
    clearInterval(ej.interval);
    ej.running = false;
    intervRenderFrame(c);
    return;
  }
  ej.running = true;
  dtSonarEvento('hiit', ej.fase==='trabajo'?'inicio':ej.fase==='descanso'?'descanso':'preparacion');
  intervRenderFrame(c);
  ej.interval = setInterval(function(){
    ej.resto--;
    if (ej.resto <= 0) {
      var iv2 = ej.iv;
      var totalSets = iv2.sets || 1;
      if (ej.fase === 'preparacion') {
        ej.fase = 'trabajo';
        ej.resto = iv2.trabajo;
        ej.total = iv2.trabajo;
        dtSonarEvento('hiit','inicio');
      } else if (ej.fase === 'trabajo') {
        if (iv2.descanso > 0 && ej.rondaActual < iv2.rondas) {
          ej.fase = 'descanso';
          ej.resto = iv2.descanso;
          ej.total = iv2.descanso;
          dtSonarEvento('hiit','descanso');
        } else if (ej.rondaActual < iv2.rondas) {
          ej.rondaActual++;
          ej.fase = 'trabajo';
          ej.resto = iv2.trabajo;
          ej.total = iv2.trabajo;
          dtSonarEvento('hiit','inicio');
        } else {
          if (ej.setActual < totalSets) {
            if (iv2.descEntreSets > 0) {
              ej.fase = 'desc_sets';
              ej.resto = iv2.descEntreSets;
              ej.total = iv2.descEntreSets;
              dtSonarEvento('hiit','descanso');
            } else {
              ej.setActual++;
              ej.rondaActual = 1;
              ej.fase = 'trabajo';
              ej.resto = iv2.trabajo;
              ej.total = iv2.trabajo;
              dtSonarEvento('hiit','inicio');
            }
          } else {
            if (iv2.finalizacion > 0) {
              ej.fase = 'finalizacion';
              ej.resto = iv2.finalizacion;
              ej.total = iv2.finalizacion;
              dtSonarEvento('hiit','final');
            } else {
              ej.fase = 'fin';
              ej.resto = 0;
              clearInterval(ej.interval);
              ej.running = false;
              dtSonarEvento('hiit','final');
            }
          }
        }
      } else if (ej.fase === 'descanso') {
        ej.rondaActual++;
        ej.fase = 'trabajo';
        ej.resto = iv2.trabajo;
        ej.total = iv2.trabajo;
        dtSonarEvento('hiit','inicio');
      } else if (ej.fase === 'desc_sets') {
        ej.setActual++;
        ej.rondaActual = 1;
        ej.fase = 'trabajo';
        ej.resto = iv2.trabajo;
        ej.total = iv2.trabajo;
        dtSonarEvento('hiit','inicio');
      } else if (ej.fase === 'finalizacion') {
        ej.fase = 'fin';
        ej.resto = 0;
        clearInterval(ej.interval);
        ej.running = false;
        dtSonarEvento('hiit','final');
      }
    }
    if (_hiitTab === 'intervalos' && _hiitVistaIntervalo === 'ejecutar') {
      var c2 = document.getElementById('hiit-contenido');
      if (c2) intervRenderFrame(c2);
    }
  }, 1000);
}

function hiitNuevoCircuito(){
  return {
    id:Date.now(),
    nombre:'Nuevo circuito',
    series:3,
    preparacion:5,
    bloques:[
      {tipo:'ejercicio',nombre:'Ejercicio 1',tiempo:60},
      {tipo:'descanso',nombre:'Descanso',tiempo:15}
    ],
    descFinSerie:60,
    descFinCircuito:600
  };
}

function hiitRenderLista(c){
  var btnNuevo = '<button onclick="hiitMostrar(\'nuevo\')" style="width:100%;background:#0a1a0a;color:#4caf50;border:1px solid #4caf50;border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:12px">➕ Nuevo circuito</button>';
  if(_hiitCircuitos.length===0){
    c.innerHTML=btnNuevo+`<div style="text-align:center;padding:40px 0;color:var(--texto-tenue)">
      <div style="font-size:40px;margin-bottom:12px">🔥</div>
      <div style="font-size:14px">No tienes circuitos guardados</div>
      <div style="font-size:12px;margin-top:6px">Toca ➕ para crear uno</div>
    </div>`;
    return;
  }
  c.innerHTML=btnNuevo+_hiitCircuitos.map((ci,i)=>`
  <div style="background:var(--card);border:1px solid #222;border-radius:12px;padding:14px;margin-bottom:10px">
    <div style="font-size:15px;font-weight:700;color:var(--texto);margin-bottom:4px">${ci.nombre}</div>
    <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:10px">${ci.series} series · ${ci.bloques.length} bloques · Prep: ${ci.preparacion}s</div>
    <div style="display:flex;gap:8px">
      <button onclick="_hiitActual=JSON.parse(JSON.stringify(_hiitCircuitos[${i}]));hiitMostrar('editor')" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:12px;cursor:pointer">✏️ Editar</button>
      <button onclick="hiitIniciar(${i})" style="flex:1;background:#e31e24;color:var(--texto);border:none;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">▶️ Iniciar</button>
      <button onclick="hiitEliminar(${i})" style="background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:8px;font-size:12px;cursor:pointer">🗑️</button>
    </div>
  </div>`).join('');
}

function hiitRenderEditor(c){
  const ci=_hiitActual;
  let html=`
  <button onclick="hiitMostrar('lista')" style="background:var(--gris2);border:1px solid #333;border-radius:8px;color:var(--texto-medio);font-size:11px;font-weight:700;padding:5px 12px;cursor:pointer;margin-bottom:10px">← Volver</button>
  <div style="margin-bottom:12px">
    <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">Nombre del circuito</div>
    <input value="${ci.nombre}" onchange="_hiitActual.nombre=this.value" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:14px;font-weight:700">
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
    <div>
      <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">Series</div>
      <input type="number" min="1" value="${ci.series}" onchange="_hiitActual.series=parseInt(this.value)||1" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:16px;text-align:center;font-family:monospace">
    </div>
    <div>
      <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">Preparación (s)</div>
      <input type="number" min="0" value="${ci.preparacion}" onchange="_hiitActual.preparacion=parseInt(this.value)||0" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:16px;text-align:center;font-family:monospace">
    </div>
  </div>
  <div style="background:var(--card);border:1px solid #1e1e1e;border-radius:12px;padding:12px;margin-bottom:12px">
    <div style="font-size:13px;font-weight:700;color:#e31e24;margin-bottom:10px">📋 Bloques</div>
    ${ci.bloques.map((b,i)=>`
    <div draggable="true" ondragstart="hiitDragStart(event,${i})" ondragover="hiitDragOver(event,${i})" ondrop="hiitDrop(event,${i})" ondragend="hiitDragEnd()" id="hiit-bloque-${i}" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;background:var(--gris);border-radius:8px;padding:8px;cursor:grab">
      <div style="font-size:16px;color:var(--texto-tenue);cursor:grab">☰</div>
      <div style="font-size:18px">${b.tipo==='ejercicio'?'💪':'😮‍💨'}</div>
      <input value="${b.nombre}" onchange="_hiitActual.bloques[${i}].nombre=this.value" style="flex:1;background:none;border:none;border-bottom:1px solid #333;color:var(--texto);font-size:12px;outline:none;padding:2px">
      <input type="number" min="1" value="${b.tiempo}" onchange="_hiitActual.bloques[${i}].tiempo=parseInt(this.value)||1" style="width:52px;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:6px;padding:4px;font-size:13px;text-align:center;font-family:monospace">
      <span style="font-size:10px;color:var(--texto-tenue)">s</span>
      <button onclick="_hiitActual.bloques.splice(${i},1);hiitMostrar('editor')" style="background:none;border:none;color:var(--texto-tenue);font-size:16px;cursor:pointer">✖</button>
    </div>`).join('')}
    <div style="display:flex;gap:8px;margin-top:8px">
      <button onclick="_hiitActual.bloques.push({tipo:'ejercicio',nombre:'Ejercicio',tiempo:60});hiitMostrar('editor')" style="flex:1;background:var(--gris);color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:8px;font-size:12px;cursor:pointer">➕ 💪 Ejercicio</button>
      <button onclick="_hiitActual.bloques.push({tipo:'descanso',nombre:'Descanso',tiempo:15});hiitMostrar('editor')" style="flex:1;background:var(--gris);color:#ff9800;border:1px solid #ff9800;border-radius:8px;padding:8px;font-size:12px;cursor:pointer">➕ 😮‍💨 Descanso</button>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
    <div>
      <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">🔚 Desc. fin de serie (s)</div>
      <input type="number" min="0" value="${ci.descFinSerie}" onchange="_hiitActual.descFinSerie=parseInt(this.value)||0" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:16px;text-align:center;font-family:monospace">
    </div>
    <div>
      <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">🏁 Desc. fin circuito (s)</div>
      <input type="number" min="0" value="${ci.descFinCircuito}" onchange="_hiitActual.descFinCircuito=parseInt(this.value)||0" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:16px;text-align:center;font-family:monospace">
    </div>
  </div>
  <div style="display:flex;gap:8px">
    <button onclick="hiitGuardar()" style="flex:1;background:#e31e24;color:var(--texto);border:none;border-radius:8px;padding:12px;font-size:13px;font-weight:700;cursor:pointer">💾 Guardar</button>
    <button onclick="hiitIniciarActual()" style="flex:1;background:#4caf50;color:var(--texto);border:none;border-radius:8px;padding:12px;font-size:13px;font-weight:700;cursor:pointer">▶️ Iniciar</button>

  </div>`;
  c.innerHTML=html;
}

let _hiitDragIdx=null;
function hiitDragStart(e,i){
  _hiitDragIdx=i;
  e.target.style.opacity='0.4';
}
function hiitDragOver(e,i){
  e.preventDefault();
  document.querySelectorAll('[id^="hiit-bloque-"]').forEach(el=>el.style.borderTop='');
  const el=document.getElementById('hiit-bloque-'+i);
  if(el)el.style.borderTop='2px solid #e31e24';
}
function hiitDrop(e,i){
  e.preventDefault();
  if(_hiitDragIdx===null||_hiitDragIdx===i)return;
  const bloques=_hiitActual.bloques;
  const item=bloques.splice(_hiitDragIdx,1)[0];
  bloques.splice(i,0,item);
  _hiitDragIdx=null;
  hiitMostrar('editor');
}
function hiitDragEnd(){
  _hiitDragIdx=null;
  document.querySelectorAll('[id^="hiit-bloque-"]').forEach(el=>{
    el.style.opacity='1';
    el.style.borderTop='';
  });
}

async function hiitGuardar(){
  if(!entEsPremium()){mostrarCandadoPremium('Guardar circuitos requiere Plan Premium.');return;}
  const _eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001');
  _hiitActual.entrenador_id = _eid;
  await fetch('/api/hiit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(_hiitActual)});
  await hiitCargar();
  toast('💾 Circuito guardado');
  hiitMostrar('lista');
}

async function hiitEliminar(i){
  const id=_hiitCircuitos[i].id;
  await fetch('/api/hiit/'+id,{method:'DELETE'});
  await hiitCargar();
  hiitRenderLista(document.getElementById('hiit-contenido'));
  toast('🗑️ Eliminado');
}

function hiitIniciar(i){
  if (_intervEjecutando && _intervEjecutando.fase !== 'fin') {
    if (!confirm('Hay un intervalo en curso. ¿Detenerlo y continuar?')) return;
    clearInterval(_intervEjecutando.interval);
    _intervEjecutando = null;
  }
  _hiitActual=JSON.parse(JSON.stringify(_hiitCircuitos[i]));
  hiitIniciarActual();
}

function hiitIniciarActual(){
  // Construir secuencia de bloques
  const ci=_hiitActual;
  const seq=[];
  for(let s=0;s<ci.series;s++){
    if(ci.preparacion>0) seq.push({tipo:'preparacion',nombre:'⚡ Preparación',tiempo:ci.preparacion,serie:s+1});
    ci.bloques.forEach(b=>seq.push({...b,serie:s+1}));
    if(s<ci.series-1&&ci.descFinSerie>0) seq.push({tipo:'descFinSerie',nombre:'🔚 Descanso fin de serie',tiempo:ci.descFinSerie,serie:s+1});
  }
  if(ci.descFinCircuito>0) seq.push({tipo:'descFinCircuito',nombre:'🏁 Descanso final',tiempo:ci.descFinCircuito,serie:ci.series});
  _hiitEjecutando={ci,seq,idx:0,resto:seq[0].tiempo,total:seq[0].tiempo,running:false,interval:null};
  hiitMostrar('ejecutar');
}

function hiitRenderEjecucion(c){
  if(!_hiitEjecutando){hiitMostrar('lista');return;}
  const e=_hiitEjecutando;
  const bloque=e.seq[e.idx];
  const siguiente=e.seq[e.idx+1];
  const pct=e.total>0?Math.round((e.resto/e.total)*100):0;
  const colores={ejercicio:'#e31e24',descanso:'#ff9800',preparacion:'#2196f3',descFinSerie:'#9c27b0',descFinCircuito:'#4caf50'};
  const color=colores[bloque.tipo]||'#fff';
  c.innerHTML=`
  <div style="text-align:center;padding:10px 0">
    <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">Serie ${bloque.serie} de ${e.ci.series} · Bloque ${e.idx+1} de ${e.seq.length}</div>
    <div style="font-size:22px;font-weight:700;color:${color};margin-bottom:8px;letter-spacing:1px">${bloque.nombre}</div>
    <div style="font-size:80px;font-weight:700;color:var(--texto);font-family:monospace;text-shadow:0 0 30px ${color}66;line-height:1">${fmtTimer(e.resto)}</div>
    <div style="margin:12px auto;width:90%;height:8px;background:var(--gris2);border-radius:4px">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 1s linear"></div>
    </div>
    ${siguiente?`<div style="font-size:22px;font-weight:700;margin-bottom:16px;padding:12px;background:var(--card);border-radius:10px;border-left:4px solid ${colores[siguiente.tipo]||'#444'};color:${colores[siguiente.tipo]||'#aaa'}">➡️ ${siguiente.nombre}<br><span style="font-size:16px;opacity:0.8">${fmtTimer(siguiente.tiempo)}</span></div>`:'<div style="font-size:22px;font-weight:700;color:#4caf50;margin-bottom:16px;padding:12px;background:var(--card);border-radius:10px">🏁 Último bloque</div>'}
    <div style="display:flex;justify-content:center;gap:12px">
      <button onclick="hiitToggle()" style="background:${e.running?'#333':'#e31e24'};color:var(--texto);border:none;border-radius:50%;width:64px;height:64px;font-size:24px;cursor:pointer">${e.running?'⏸️':'▶️'}</button>
      <button onclick="hiitDetener()" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:50%;width:64px;height:64px;font-size:20px;cursor:pointer">⏹️</button>
    </div>
  </div>`;
}

function hiitToggle(){
  const e=_hiitEjecutando;
  if(!e)return;
  if(e.running){
    clearInterval(e.interval);
    e.running=false;
    hiitRenderEjecucion(document.getElementById('hiit-contenido'));
  } else {
    e.running=true;
    hiitSonarBloque(e.seq[e.idx].tipo);
    e.interval=setInterval(()=>{
      e.resto--;
      if(e.resto<=0){
        e.idx++;
        if(e.idx>=e.seq.length){
          clearInterval(e.interval);
          e.running=false;
          _hiitEjecutando=null;
          dtSonarEvento('hiit','final');
          toast('🏁 ¡Circuito completado!');
          hiitMostrar('lista');
          return;
        }
        const sig=e.seq[e.idx];
        e.resto=sig.tiempo;
        e.total=sig.tiempo;
        hiitSonarBloque(sig.tipo);
      }
      hiitRenderEjecucion(document.getElementById('hiit-contenido'));
    },1000);
    hiitRenderEjecucion(document.getElementById('hiit-contenido'));
  }
}

function hiitSonarBloque(tipo){
  if(tipo==='preparacion') dtSonarEvento('hiit','preparacion');
  else if(tipo==='ejercicio') dtSonarEvento('hiit','inicio');
  else if(tipo==='descanso'||tipo==='descFinSerie') dtSonarEvento('hiit','descanso');
  else if(tipo==='descFinCircuito') dtSonarEvento('hiit','final');
}

function hiitDetener(){
  if(_hiitEjecutando){
    clearInterval(_hiitEjecutando.interval);
    _hiitEjecutando=null;
  }
  hiitMostrar('lista');
}

// ═══════════════════════════════
// CONFIGURADOR DE SONIDOS
// ═══════════════════════════════
const _dtSonidosDisponibles={
  'pip':        {label:'1 Pip',        fn:()=>{dtSonidoRaw([{f:880,t:0,d:0.08}])}},
  'doble_pip':  {label:'2 Pips',       fn:()=>{dtSonidoRaw([{f:660,t:0,d:0.08},{f:660,t:0.12,d:0.08}])}},
  'triple_pip': {label:'3 Pips',       fn:()=>{dtSonidoRaw([{f:880,t:0,d:0.08},{f:880,t:0.12,d:0.08},{f:1100,t:0.24,d:0.12}])}},
  'campana':    {label:'Campana',      fn:()=>{dtSonidoRaw([{f:880,t:0,d:0.8,v:1.2},{f:1760,t:0,d:0.4,v:0.4}])}},
  'alarma':     {label:'Alarma',       fn:()=>{dtSonidoRawAlt()}},
  'triple_campana':{label:'3 Pips + Campana', fn:()=>{dtSonidoRaw([{f:880,t:0,d:0.08},{f:880,t:0.12,d:0.08},{f:1100,t:0.24,d:0.08},{f:1320,t:0.4,d:0.7,v:0.8}])}},
  'descenso':   {label:'Descenso',     fn:()=>{dtSonidoSlide(1200,300,0,0.6)}},
  'silbato':    {label:'Silbato',      fn:()=>{dtSonidoSilbato()}},
  'gym':        {label:'Potente Gym',  fn:()=>{dtSonidoRaw([{f:80,t:0,d:0.3,tipo:'sawtooth',v:1.0},{f:1200,t:0.05,d:0.15,v:1.5},{f:1400,t:0.2,d:0.1,v:0.8}])}}
};

async function dtSonidoRaw(pips){
  if(_dtSonando)return;
  _dtSonando=true;
  setTimeout(()=>{_dtSonando=false;},400);
  const c=await _dtGetCtx();
  pips.forEach(p=>{
    const o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);
    o.frequency.value=p.f;o.type=p.tipo||'sine';
    g.gain.setValueAtTime(p.v||1.5,c.currentTime+p.t);
    g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+p.t+p.d);
    o.start(c.currentTime+p.t);o.stop(c.currentTime+p.t+p.d+0.05);
  });
}
async function dtSonidoRawAlt(){
  const c=await _dtGetCtx();
  for(let i=0;i<4;i++){
    const o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);
    o.frequency.value=i%2===0?880:660;o.type='square';
    g.gain.setValueAtTime(0.6,c.currentTime+i*0.18);
    g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.18+0.14);
    o.start(c.currentTime+i*0.18);o.stop(c.currentTime+i*0.18+0.19);
  }
}
async function dtSonidoSlide(f1,f2,inicio,dur){
  const c=await _dtGetCtx();
  const o=c.createOscillator(),g=c.createGain();
  o.connect(g);g.connect(c.destination);o.type='sine';
  o.frequency.setValueAtTime(f1,c.currentTime+inicio);
  o.frequency.linearRampToValueAtTime(f2,c.currentTime+inicio+dur);
  g.gain.setValueAtTime(1.3,c.currentTime+inicio);
  g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+inicio+dur);
  o.start(c.currentTime+inicio);o.stop(c.currentTime+inicio+dur+0.05);
}
async function dtSonidoSilbato(){
  const c=await _dtGetCtx();
  [0,0.35].forEach(t=>{
    const o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);o.type='sine';
    o.frequency.setValueAtTime(2800,c.currentTime+t);
    o.frequency.linearRampToValueAtTime(3200,c.currentTime+t+0.05);
    o.frequency.linearRampToValueAtTime(2800,c.currentTime+t+0.25);
    g.gain.setValueAtTime(1.4,c.currentTime+t);
    g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+t+0.28);
    o.start(c.currentTime+t);o.stop(c.currentTime+t+0.3);
  });
}

async function dtSonido(tipo){
  await _dtGetCtx();
  const key=tipo==='inicio'?'pip':tipo==='descanso'?'doble_pip':'triple_pip';
  if(_dtSonidosDisponibles[key])_dtSonidosDisponibles[key].fn();
}

function dtSonarEvento(seccion,evento){
  const key=_dtSonidoConfig[seccion]&&_dtSonidoConfig[seccion][evento];
  if(key&&_dtSonidosDisponibles[key])_dtSonidosDisponibles[key].fn();
}

function renderSonidos(c){
  const secs=[
    {id:'crono',label:'⏱️ Cronómetro',eventos:[{id:'inicio',label:'Inicio'}]},
    {id:'timer',label:'⏳ Temporizador',eventos:[{id:'inicio',label:'Inicio'},{id:'fin',label:'Fin / Tiempo cumplido'}]},
    {id:'hiit',label:'🔥 HIIT',eventos:[{id:'inicio',label:'Inicio de serie'},{id:'descanso',label:'Inicio de descanso'},{id:'preparacion',label:'Preparación (cuenta regresiva)'},{id:'final',label:'Final de rutina'}]}
  ];
  let html='<div style="padding-bottom:20px"><p style="color:var(--texto-secundario);font-size:12px;margin-bottom:16px">Elige el sonido para cada momento. Toca 🔊 para escucharlo.</p>';
  secs.forEach(function(s){
    html+='<div style="background:var(--card);border:1px solid #1e1e1e;border-radius:12px;padding:14px;margin-bottom:12px">';
    html+='<div style="font-size:14px;font-weight:700;color:#e31e24;margin-bottom:12px">'+s.label+'</div>';
    s.eventos.forEach(function(e){
      const cur=(_dtSonidoConfig[s.id]&&_dtSonidoConfig[s.id][e.id])||'pip';
      let opts='';
      Object.keys(_dtSonidosDisponibles).forEach(function(k){
        opts+='<option value="'+k+'"'+(cur===k?' selected':'')+'>'+_dtSonidosDisponibles[k].label+'</option>';
      });
      html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
      html+='<div style="font-size:11px;color:var(--texto-medio);width:110px;flex-shrink:0">'+e.label+'</div>';
      html+='<select data-sec="'+s.id+'" data-evt="'+e.id+'" onchange="_dtSonidoConfig[this.dataset.sec][this.dataset.evt]=this.value" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:7px;font-size:12px">'+opts+'</select>';
      html+='<button data-sec="'+s.id+'" data-evt="'+e.id+'" onclick="_dtSonidosDisponibles[_dtSonidoConfig[this.dataset.sec][this.dataset.evt]].fn()" style="background:var(--gris);border:1px solid #333;border-radius:8px;padding:8px;font-size:16px;cursor:pointer">🔊</button>';
      html+='</div>';
    });
    html+='</div>';
  });
  html+='</div>';
  html+='<div style="margin-top:16px;background:var(--card);border:1px solid #1e1e1e;border-radius:12px;padding:14px">';
  html+='<div style="font-size:14px;font-weight:700;color:#e31e24;margin-bottom:10px">🔔 Notificaciones del sistema</div>';
  html+='<p style="font-size:12px;color:var(--texto-secundario);margin-bottom:12px">Permite recibir avisos cuando un temporizador termina, incluso si la app está en segundo plano.</p>';
  html+='<button onclick="dtPedirNotificaciones()" id="btn-notif" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:13px;font-weight:700;cursor:pointer">🔔 Activar notificaciones</button>';
  html+='</div>';
  c.innerHTML=html;
  dtActualizarBtnNotif();
}

function dtActualizarBtnNotif(){
  const btn=document.getElementById('btn-notif');
  if(!btn)return;
  if(!('Notification' in window)){btn.textContent='❌ No soportado en este navegador';btn.disabled=true;return;}
  if(Notification.permission==='granted'){btn.textContent='✅ Notificaciones activadas';btn.style.borderColor='#4caf50';btn.style.color='#4caf50';btn.disabled=true;}
  else if(Notification.permission==='denied'){btn.textContent='❌ Bloqueadas — actívalas en ajustes del navegador';btn.style.color='#e31e24';btn.disabled=true;}
}

function dtPedirNotificaciones(){
  if(!('Notification' in window)){toast('❌ Tu navegador no soporta notificaciones');return;}
  Notification.requestPermission().then(p=>{
    if(p==='granted')toast('✅ Notificaciones activadas');
    else if(p==='denied')toast('❌ Notificaciones bloqueadas');
    else toast('⚠️ Permiso no concedido');
    dtActualizarBtnNotif();
  });
}

function dtNotificar(titulo,cuerpo){
  if(Notification.permission==='granted'){
    new Notification(titulo,{body:cuerpo,icon:'/icon.png',badge:'/icon.png'});
  }
}




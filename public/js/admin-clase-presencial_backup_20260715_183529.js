// ============================================================
// admin-clase-presencial.js — Clase Presencial
// Segundo "cliente" del mismo motor de ejecución de rutinas.
// Todo el estado de sesión vive en localStorage del entrenador.
// El progreso final se reporta al chat exactamente igual que
// lo hace app-terminal.js (tipo: 'reporte'), sin rutas nuevas.
// Respeta el orden real intercalado (cardio/ejercicios) igual
// que _tcOrdenDia en app-terminal.js.
// ============================================================

let _cpClientes = {};
let _cpRutinasCache = {};
let _cpDescansoTimers = {};
let _cpTodosClientes = [];
let _cpModalClienteElegido = null;

function cpEntrenadorId() {
  return (JSON.parse(localStorage.getItem('dt_sesion') || '{}').id) || null;
}
function cpClaveClase() {
  return 'cp-clase-activa-' + cpEntrenadorId();
}
function cpClaveRecientes() {
  return 'cp-recientes-' + cpEntrenadorId();
}

function cpCargarClase() {
  try {
    const d = JSON.parse(localStorage.getItem(cpClaveClase()));
    _cpClientes = (d && d.clientes) || {};
  } catch (e) { _cpClientes = {}; }
}
function cpGuardarClase() {
  localStorage.setItem(cpClaveClase(), JSON.stringify({ clientes: _cpClientes }));
}
function cpAgregarReciente(cliente) {
  try {
    let recientes = JSON.parse(localStorage.getItem(cpClaveRecientes()) || '[]');
    recientes = recientes.filter(function(r){ return r.id !== cliente.id; });
    recientes.unshift({ id: cliente.id, nombre: cliente.nombre });
    recientes = recientes.slice(0, 8);
    localStorage.setItem(cpClaveRecientes(), JSON.stringify(recientes));
  } catch (e) {}
}
function cpObtenerRecientes() {
  try { return JSON.parse(localStorage.getItem(cpClaveRecientes()) || '[]'); }
  catch (e) { return []; }
}

const CP_DIAS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
const CP_DIAS_LABEL = {domingo:'Domingo',lunes:'Lunes',martes:'Martes',miercoles:'Miércoles',jueves:'Jueves',viernes:'Viernes',sabado:'Sábado'};

function cpDiaHoyAutomatico() {
  return CP_DIAS[new Date().getDay()];
}
function cpDiaEfectivo(cliId) {
  const sel = (_cpClientes[cliId] || {}).rutina_seleccionada;
  if (!sel || sel === 'automatica') return cpDiaHoyAutomatico();
  return sel;
}

// ---------- Orden intercalado (igual que _tcOrdenDia) ----------
function cpObtenerOrden(diaData) {
  if (diaData.orden && diaData.orden.length > 0) return diaData.orden;
  const orden = [];
  const ejercicios = diaData.ejercicios || [];
  const cardio = diaData.cardio || [];
  for (let i = 0; i < ejercicios.length; i++) orden.push('ej' + i);
  for (let i = 0; i < cardio.length; i++) orden.push('cardio' + i);
  return orden;
}

async function cpCargarRutinaCliente(cliId) {
  const res = await fetch('/api/rutinas/' + cliId);
  const data = await res.json();
  _cpRutinasCache[cliId] = data || {};
  return _cpRutinasCache[cliId];
}

async function cpAgregarClienteAClase(cliente, rutinaSeleccionada) {
  if (_cpClientes[cliente.id]) return;
  _cpClientes[cliente.id] = {
    nombre: cliente.nombre,
    rutina_seleccionada: rutinaSeleccionada || 'automatica',
    expandida: false,
    estado: 'sin_iniciar',
    series: {},
    seriesFallidas: {},
    pesos: {},
    unidades: {},
    cardio: {}
  };
  cpGuardarClase();
  cpAgregarReciente(cliente);
  await cpCargarRutinaCliente(cliente.id);
  cpRenderGrid();
}

function cpQuitarClienteDeClase(cliId) {
  delete _cpClientes[cliId];
  delete _cpRutinasCache[cliId];
  cpGuardarClase();
  cpRenderGrid();
}

function cpCambiarRutinaSeleccionada(cliId, nuevaSeleccion) {
  if (!_cpClientes[cliId]) return;
  _cpClientes[cliId].rutina_seleccionada = nuevaSeleccion;
  cpGuardarClase();
  cpRenderGrid();
}

function cpToggleTarjeta(cliId) {
  if (!_cpClientes[cliId]) return;
  _cpClientes[cliId].expandida = !_cpClientes[cliId].expandida;
  cpGuardarClase();
  cpRenderGrid();
}

// ---------- Peso por serie individual ----------
function cpObtenerPesoInput(cliId, ejIdx, serieIdx) {
  const input = document.getElementById('cp-peso-' + cliId + '-' + ejIdx + '-' + serieIdx);
  return input ? input.value : '';
}

function cpToggleUnidad(cliId, ejIdx) {
  const c = _cpClientes[cliId];
  if (!c) return;
  const actual = c.unidades[ejIdx] || 'kg';
  c.unidades[ejIdx] = actual === 'kg' ? 'lb' : 'kg';
  cpGuardarClase();
  cpRenderGrid();
}

function cpSerie(cliId, ejIdx, descanso, totalSeries) {
  const c = _cpClientes[cliId];
  if (!c) return;
  const completadas = c.series[ejIdx] || 0;
  if (completadas >= totalSeries) return;

  const peso = cpObtenerPesoInput(cliId, ejIdx, completadas);
  if (!c.pesos[ejIdx]) c.pesos[ejIdx] = [];
  c.pesos[ejIdx][completadas] = peso || '';

  c.series[ejIdx] = completadas + 1;
  c.estado = 'descansando';
  cpGuardarClase();
  cpRenderGrid();

  if (descanso > 0) {
    cpIniciarDescanso(cliId, ejIdx, descanso);
  } else {
    c.estado = 'entrenando';
    cpGuardarClase();
  }
}

function cpDeshacerSerie(cliId, ejIdx) {
  const c = _cpClientes[cliId];
  if (!c) return;
  const completadas = c.series[ejIdx] || 0;
  if (completadas <= 0) return;
  c.series[ejIdx] = completadas - 1;
  if (c.pesos[ejIdx]) c.pesos[ejIdx][completadas - 1] = undefined;
  cpGuardarClase();
  cpRenderGrid();
}

function cpIniciarDescanso(cliId, ejIdx, segundos) {
  const key = cliId + '_' + ejIdx;
  if (_cpDescansoTimers[key]) clearInterval(_cpDescansoTimers[key]);

  let restante = segundos;
  const c = _cpClientes[cliId];
  c.descansoRestante = restante;

  _cpDescansoTimers[key] = setInterval(function () {
    restante--;
    if (!_cpClientes[cliId]) { clearInterval(_cpDescansoTimers[key]); return; }
    _cpClientes[cliId].descansoRestante = restante;
    if (restante <= 0) {
      clearInterval(_cpDescansoTimers[key]);
      delete _cpDescansoTimers[key];
      _cpClientes[cliId].descansoRestante = 0;
      _cpClientes[cliId].estado = 'entrenando';
      cpGuardarClase();
      cpRenderGrid();
      return;
    }
    cpActualizarSoloDescanso(cliId, restante);
  }, 1000);
}

function cpActualizarSoloDescanso(cliId, restante) {
  const el = document.getElementById('cp-descanso-' + cliId);
  if (el) el.textContent = cpFormatoMMSS(restante);
}

function cpFormatoMMSS(seg) {
  const mm = String(Math.floor(seg / 60)).padStart(2, '0');
  const ss = String(seg % 60).padStart(2, '0');
  return mm + ':' + ss;
}

const CP_ESTADO_COLOR = {
  sin_iniciar: '#666',
  entrenando:  '#4caf50',
  descansando: '#ffc107',
  cardio:      '#2196f3',
  finalizada:  '#4caf50'
};

// ---------- Cardio ----------
function cpToggleCardio(cliId, idx) {
  const c = _cpClientes[cliId];
  if (!c) return;
  c.cardio[idx] = !c.cardio[idx];
  cpGuardarClase();
  cpRenderGrid();
}

async function cpFinalizarRutina(cliId) {
  const c = _cpClientes[cliId];
  const rutina = _cpRutinasCache[cliId];
  if (!c || !rutina) return;

  const dia = cpDiaEfectivo(cliId);
  const diaData = rutina[dia] || {};
  const ejercicios = diaData.ejercicios || [];
  const cardios = diaData.cardio || [];
  const orden = cpObtenerOrden(diaData);

  let completados = 0, totalSeries = 0, seriesHechas = 0, cardiosHechos = 0;
  let filas = '';

  orden.forEach(function(clave) {
    if (clave.indexOf('ej') === 0) {
      const i = parseInt(clave.replace('ej', ''));
      const ej = ejercicios[i];
      if (!ej) return;
      const totalS = parseInt(ej.series) || 3;
      const hechas = parseInt(c.series[i]) || 0;
      totalSeries += totalS;
      seriesHechas += hechas;
      if (hechas >= totalS) completados++;

      const bars = Array.from({ length: totalS }, function(_, s) {
        if (s >= hechas) return '⭕';
        return c.seriesFallidas[i + '-' + s] ? '🟠' : '🟢';
      }).join('');

      const pesosEj = c.pesos[i] || [];
      const unidadEj = c.unidades[i] || 'kg';
      const pesosValidos = pesosEj.filter(function(p){ return p; });
      const pesosTexto = pesosValidos.length > 0 ? ' · ' + pesosValidos.join('/') + ' ' + unidadEj : '';

      filas += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #2a2a2a">'
        + '<div><div style="font-size:12px;font-weight:700;color:#fff">' + (ej.nombre || 'Ejercicio') + '</div>'
        + '<div style="font-size:10px;color:#aaaaaa;margin-top:1px">' + (ej.reps ? ej.reps + ' reps' : '') + (ej.rir ? ' · RIR ' + ej.rir : '') + pesosTexto + '</div></div>'
        + '<div style="text-align:right"><div style="font-size:13px;letter-spacing:2px">' + bars + '</div>'
        + '<div style="font-size:10px;color:' + (hechas >= totalS ? '#4caf50' : '#e31e24') + ';font-weight:700">' + hechas + '/' + totalS + ' series</div></div>'
        + '</div>';
    } else if (clave.indexOf('cardio') === 0) {
      const ci = parseInt(clave.replace('cardio', ''));
      const cx = cardios[ci];
      if (!cx) return;
      const hecho = !!c.cardio[ci];
      if (hecho) cardiosHechos++;
      filas += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #2a2a2a">'
        + '<div><div style="font-size:12px;font-weight:700;color:#4fc3f7">🏃 ' + (cx.momento || 'Cardio') + '</div>'
        + '<div style="font-size:10px;color:#aaaaaa">' + (cx.ejercicio || '') + (cx.tiempo ? ' · ' + cx.tiempo + ' min' : '') + '</div></div>'
        + '<div style="font-size:13px">' + (hecho ? '🟢 Hecho' : '⭕ No hecho') + '</div>'
        + '</div>';
    }
  });

  const completo = completados === ejercicios.length && ejercicios.length > 0 && (cardios.length === 0 || cardiosHechos === cardios.length);
  const tituloDia = diaData.recordatorio || '';
  const notasGenerales = diaData.rutina || '';

  const html = '<div style="font-family:sans-serif;max-width:340px">'
    + '<div style="background:' + (completo ? '#0a1a0a' : '#1a0a00') + ';border:1px solid ' + (completo ? '#4caf50' : '#e31e24') + ';border-radius:12px;padding:12px 14px;margin-bottom:6px">'
    + (tituloDia ? '<div style="font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;opacity:0.85">🏷️ ' + tituloDia + '</div>' : '')
    + '<div style="font-size:11px;font-weight:700;color:#e31e24;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🏋 Registrado en Clase Presencial</div>'
    + '<div style="font-size:15px;font-weight:900;color:' + (completo ? '#4caf50' : '#ff9800') + ';margin-bottom:6px">' + (completo ? '🏆 Rutina completada' : '⚠️ Rutina incompleta') + '</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<div style="background:rgba(0,0,0,0.06);border-radius:8px;padding:6px 10px;text-align:center;flex:1"><div style="font-size:16px;font-weight:900;color:#4caf50">' + completados + '/' + ejercicios.length + '</div><div style="font-size:9px;color:#aaaaaa;text-transform:uppercase">Ejercicios</div></div>'
    + '<div style="background:rgba(0,0,0,0.06);border-radius:8px;padding:6px 10px;text-align:center;flex:1"><div style="font-size:16px;font-weight:900;color:#4caf50">' + seriesHechas + '/' + totalSeries + '</div><div style="font-size:9px;color:#aaaaaa;text-transform:uppercase">Series</div></div>'
    + (cardios.length > 0 ? '<div style="background:rgba(0,0,0,0.06);border-radius:8px;padding:6px 10px;text-align:center;flex:1"><div style="font-size:16px;font-weight:900;color:#4caf50">' + cardiosHechos + '/' + cardios.length + '</div><div style="font-size:9px;color:#aaaaaa;text-transform:uppercase">Cardio</div></div>' : '')
    + '</div></div>'
    + '<div style="background:#7a1015;border:1px solid #a32028;border-radius:10px;padding:10px 14px;margin-bottom:4px">'
    + filas
    + '</div>'
    + (notasGenerales ? '<div style="background:#141414;border:1px dashed #333;border-radius:10px;padding:10px 14px;margin-bottom:4px"><div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">📝 Notas</div><div style="font-size:12px;color:#ccc;line-height:1.5;white-space:pre-line">' + notasGenerales + '</div></div>' : '')
    + '<div style="font-size:10px;color:#999;text-align:right;padding:2px 4px">📅 ' + new Date().toISOString().slice(0, 10) + '</div>'
    + '</div>';

  try {
    await fetch('/api/chat/' + cliId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor: 'cliente', tipo: 'reporte', contenido: html })
    });
  } catch (e) {
    console.error('Error enviando reporte de Clase Presencial:', e);
  }

  c.estado = 'finalizada';
  cpGuardarClase();
  cpRenderGrid();
}

function cpResumenClase() {
  const ids = Object.keys(_cpClientes);
  const contar = function(estado) { return ids.filter(function(id){ return _cpClientes[id].estado === estado; }).length; };
  return {
    total: ids.length,
    entrenando: contar('entrenando'),
    descansando: contar('descansando'),
    finalizadas: contar('finalizada')
  };
}

// ============================================================
// CSS
// ============================================================
function cpInyectarEstilos() {
  if (document.getElementById('cp-estilos')) return;
  const style = document.createElement('style');
  style.id = 'cp-estilos';
  style.textContent = ".cp-barra{background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#aaa}"
    + ".cp-barra b{color:#fff}"
    + ".cp-vacio{text-align:center;padding:50px 20px;color:#888}"
    + ".cp-vacio .ico{font-size:40px;margin-bottom:10px;opacity:.5}"
    + ".cp-btn-add{width:100%;background:linear-gradient(180deg,#e31e24,#a81620);color:#fff;border:none;border-radius:10px;padding:14px;font-size:15px;font-weight:800;cursor:pointer}"
    + ".cp-grid{display:grid;grid-template-columns:1fr;gap:12px}"
    + "@media(min-width:520px){.cp-grid.cp-multi{grid-template-columns:1fr 1fr}}"
    + ".cp-card{background:#1c1c1c;border:1px solid #2a2a2a;border-left:3px solid #e31e24;border-radius:14px;padding:14px;position:relative}"
    + ".cp-card.expandida{grid-column:1/-1}"
    + ".cp-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}"
    + ".cp-nombre{font-size:15px;font-weight:800;display:flex;align-items:center;gap:6px}"
    + ".cp-estado-dot{width:9px;height:9px;border-radius:50%;display:inline-block}"
    + ".cp-dia{font-size:11px;color:#999;margin-top:2px}"
    + ".cp-kebab{background:none;border:none;color:#999;font-size:18px;padding:2px 6px}"
    + ".cp-progreso-track{height:5px;background:#111;border-radius:4px;overflow:hidden;margin:8px 0}"
    + ".cp-progreso-fill{height:100%;background:#e31e24}"
    + ".cp-btn-abrir{width:100%;background:#111;border:1px solid #2a2a2a;color:#fff;border-radius:8px;padding:9px;font-size:12.5px;font-weight:700;cursor:pointer}"
    + ".cp-descanso-badge{background:#2a1d00;border:1px solid #ffc107;color:#ffc107;border-radius:8px;padding:6px 10px;text-align:center;font-size:13px;font-weight:800;margin-bottom:8px}"
    + ".cp-notas-generales{background:#141414;border:1px dashed #333;border-radius:10px;padding:10px 12px;margin-bottom:10px}"
    + ".cp-notas-generales .t{font-size:9px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}"
    + ".cp-notas-generales .c{font-size:11.5px;color:#bbb;line-height:1.5;white-space:pre-line}"
    + ".cp-ex-block{border-radius:10px;margin-bottom:8px;background:#141414;border:1px solid #2a2a2a}"
    + ".cp-ex-head{padding:10px 12px;cursor:pointer;display:flex;justify-content:space-between;align-items:center}"
    + ".cp-ex-nombre{font-size:13px;font-weight:700}"
    + ".cp-ex-meta{font-size:10.5px;color:#888;margin-top:2px}"
    + ".cp-ex-done{background:#0a1f0d;border-color:#2d6e35}"
    + ".cp-ex-done .cp-ex-nombre{color:#4caf50}"
    + ".cp-stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:0 12px 10px}"
    + ".cp-stat{background:#0f0f0f;border-radius:8px;padding:8px 4px;text-align:center}"
    + ".cp-stat .v{font-size:14px;font-weight:800;color:#fff}"
    + ".cp-stat .l{font-size:8px;color:#888;text-transform:uppercase}"
    + ".cp-unidad-row{display:flex;justify-content:flex-start;padding:0 12px 6px}"
    + ".cp-unidad-toggle{background:#0f0f0f;border:1px solid #2a2a2a;color:#e31e24;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:800;cursor:pointer}"
    + ".cp-serie-col{display:flex;gap:6px;padding:0 12px 10px;overflow-x:auto}"
    + ".cp-serie-item{flex-shrink:0;width:56px;text-align:center}"
    + ".cp-serie-peso{width:100%;background:#0f0f0f;border:1px solid #2a2a2a;color:#fff;border-radius:6px;padding:5px 2px;font-size:11px;text-align:center;margin-bottom:4px}"
    + ".cp-serie-peso:disabled{opacity:.4}"
    + ".cp-bombilla{font-size:22px;cursor:pointer;opacity:.35;display:block}"
    + ".cp-serie-label{font-size:8px;color:#666;margin-top:2px}"
    + ".cp-btn-serie{width:calc(100% - 24px);margin:0 12px 12px;background:#e31e24;color:#fff;border:none;border-radius:8px;padding:11px;font-size:13.5px;font-weight:800;cursor:pointer}"
    + ".cp-btn-serie:disabled{background:#333;color:#777}"
    + ".cp-btn-finalizar{width:100%;background:transparent;border:1px solid #e31e24;color:#e31e24;border-radius:8px;padding:11px;font-size:12.5px;font-weight:700;cursor:pointer;margin-top:4px}"
    + ".cp-cardio-block{background:#0d1b2a;border:1px solid #1c3f5f;border-radius:10px;padding:10px 12px;margin-bottom:8px}"
    + ".cp-cardio-block.hecho{background:#0a1f0d;border-color:#2d6e35}"
    + ".cp-cardio-top{display:flex;justify-content:space-between;align-items:center;cursor:pointer}"
    + ".cp-cardio-nombre{font-size:13px;font-weight:700;color:#fff}"
    + ".cp-cardio-meta{font-size:10.5px;color:#888}"
    + ".cp-cardio-notas{font-size:10.5px;color:#7fb8d8;font-style:italic;margin-top:6px;border-top:1px solid #1c3f5f;padding-top:6px}"
    + ".cp-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:999;display:flex;align-items:flex-end}"
    + ".cp-modal{width:100%;max-width:520px;margin:0 auto;background:#1c1c1c;border-radius:18px 18px 0 0;padding:18px;max-height:82vh;overflow-y:auto}"
    + ".cp-search{background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:11px 14px;font-size:16px;color:#fff;width:100%;margin-bottom:12px}"
    + ".cp-cli-item{display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid #2a2a2a;cursor:pointer}"
    + ".cp-avatar{width:34px;height:34px;border-radius:50%;background:#111;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#999;flex-shrink:0}"
    + ".cp-select{width:100%;background:#111;border:1px solid #2a2a2a;color:#fff;border-radius:8px;padding:11px;font-size:14px;margin:10px 0}"
    + ".cp-hint{font-size:11px;color:#777;line-height:1.5;margin-bottom:14px}"
    + ".cp-btn-confirmar{width:100%;background:#e31e24;color:#fff;border:none;border-radius:10px;padding:13px;font-size:14px;font-weight:800;cursor:pointer}"
    + ".cp-seccion-label{font-size:10px;color:#777;text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin:12px 0 6px}";
  style.textContent += "body.modo-claro .cp-barra{background:#fff!important;border-color:#ccc!important;color:#333!important}";
  style.textContent += "body.modo-claro .cp-barra b{color:#111!important}";
  style.textContent += "body.modo-claro .cp-card{background:#fff!important;border-color:#ddd!important}";
  style.textContent += "body.modo-claro .cp-dia{color:#666!important}";
  style.textContent += "body.modo-claro .cp-kebab{color:#666!important}";
  style.textContent += "body.modo-claro .cp-progreso-track{background:#e0e0e0!important}";
  style.textContent += "body.modo-claro .cp-btn-abrir{background:#f0f0f0!important;border-color:#ccc!important;color:#111!important}";
  style.textContent += "body.modo-claro .cp-notas-generales{background:#f5f5f5!important;border-color:#ccc!important}";
  style.textContent += "body.modo-claro .cp-notas-generales .t{color:#666!important}";
  style.textContent += "body.modo-claro .cp-notas-generales .c{color:#333!important}";
  style.textContent += "body.modo-claro .cp-ex-block{background:#f5f5f5!important;border-color:#ddd!important}";
  style.textContent += "body.modo-claro .cp-ex-nombre{color:#111!important}";
  style.textContent += "body.modo-claro .cp-ex-meta{color:#666!important}";
  style.textContent += "body.modo-claro .cp-stat{background:#eee!important}";
  style.textContent += "body.modo-claro .cp-stat .v{color:#111!important}";
  style.textContent += "body.modo-claro .cp-stat .l{color:#666!important}";
  style.textContent += "body.modo-claro .cp-unidad-toggle{background:#eee!important;border-color:#ccc!important}";
  style.textContent += "body.modo-claro .cp-serie-peso{background:#fff!important;border-color:#ccc!important;color:#111!important}";
  style.textContent += "body.modo-claro .cp-serie-label{color:#666!important}";
  style.textContent += "body.modo-claro .cp-cardio-block{background:#e8f0f7!important;border-color:#b0cfe0!important}";
  style.textContent += "body.modo-claro .cp-cardio-nombre{color:#111!important}";
  style.textContent += "body.modo-claro .cp-cardio-meta{color:#555!important}";
  style.textContent += "body.modo-claro .cp-modal{background:#fff!important}";
  style.textContent += "body.modo-claro .cp-search{background:#f0f0f0!important;border-color:#ccc!important;color:#111!important}";
  style.textContent += "body.modo-claro .cp-cli-item{border-color:#ddd!important}";
  style.textContent += "body.modo-claro .cp-avatar{background:#e0e0e0!important;color:#555!important}";
  style.textContent += "body.modo-claro .cp-select{background:#f0f0f0!important;border-color:#ccc!important;color:#111!important}";
  style.textContent += "body.modo-claro .cp-hint{color:#777!important}";
  style.textContent += "body.modo-claro .cp-seccion-label{color:#777!important}";
  style.textContent += "body.modo-claro .cp-vacio{color:#777!important}";
  document.head.appendChild(style);
}

// ============================================================
// RENDER PRINCIPAL
// ============================================================
function cpRenderGrid() {
  cpInyectarEstilos();
  const cont = document.getElementById('clase-presencial-contenido');
  if (!cont) return;

  const ids = Object.keys(_cpClientes);
  const resumen = cpResumenClase();

  let html = '';

  if (ids.length === 0) {
    html += '<div class="cp-vacio"><div class="ico">🏋</div>'
      + '<div>No hay clientes activos en esta clase.</div></div>'
      + '<button class="cp-btn-add" onclick="cpAbrirModalAgregar()">➕ Agregar cliente</button>';
    cont.innerHTML = html;
    return;
  }

  html += '<div class="cp-barra">🏋 <b>' + resumen.total + '</b> clientes · <b>' + resumen.entrenando + '</b> entrenando · <b>' + resumen.descansando + '</b> descanso · <b>' + resumen.finalizadas + '</b> terminó</div>';

  html += '<div class="cp-grid ' + (ids.length > 2 ? 'cp-multi' : '') + '">';
  ids.forEach(function(cliId) {
    html += cpHtmlTarjeta(cliId);
  });
  html += '</div>';

  html += '<button class="cp-btn-add" style="margin-top:14px" onclick="cpAbrirModalAgregar()">➕ Agregar cliente</button>';

  cont.innerHTML = html;
}

function cpHtmlTarjeta(cliId) {
  const c = _cpClientes[cliId];
  const rutina = _cpRutinasCache[cliId] || {};
  const dia = cpDiaEfectivo(cliId);
  const diaData = rutina[dia] || {};
  const ejercicios = diaData.ejercicios || [];
  const cardios = diaData.cardio || [];
  const orden = cpObtenerOrden(diaData);

  const totalEj = ejercicios.length;
  let ejCompletados = 0;
  ejercicios.forEach(function(ej, i) {
    const totalS = parseInt(ej.series) || 3;
    if ((c.series[i] || 0) >= totalS) ejCompletados++;
  });
  const pct = totalEj > 0 ? Math.round(ejCompletados / totalEj * 100) : 0;
  const color = CP_ESTADO_COLOR[c.estado] || '#666';

  let html = '<div class="cp-card ' + (c.expandida ? 'expandida' : '') + '">';
  html += '<div class="cp-card-top">'
    + '<div><div class="cp-nombre"><span class="cp-estado-dot" style="background:' + color + '"></span>' + c.nombre + '</div>'
    + '<div class="cp-dia">📅 ' + (c.rutina_seleccionada === 'automatica' ? 'Automática (' + CP_DIAS_LABEL[dia] + ')' : CP_DIAS_LABEL[c.rutina_seleccionada]) + '</div></div>'
    + '<button class="cp-kebab" onclick="cpAbrirMenuTarjeta(event,\'' + cliId + '\')">⋮</button>'
    + '</div>';

  if (c.estado === 'descansando') {
    html += '<div class="cp-descanso-badge">⏱ Descanso <span id="cp-descanso-' + cliId + '">' + cpFormatoMMSS(c.descansoRestante || 0) + '</span></div>';
  }

  if (!c.expandida) {
    html += '<div style="font-size:11px;color:#999;margin-bottom:4px">' + (totalEj > 0 ? ejCompletados + '/' + totalEj + ' ejercicios' : 'Sin rutina para ' + CP_DIAS_LABEL[dia]) + '</div>';
    html += '<div class="cp-progreso-track"><div class="cp-progreso-fill" style="width:' + pct + '%"></div></div>';
    html += '<button class="cp-btn-abrir" onclick="cpToggleTarjeta(\'' + cliId + '\')">▶ Abrir rutina</button>';
  } else {
    const notasGenerales = diaData.rutina || '';
    if (notasGenerales) {
      html += '<div class="cp-notas-generales"><div class="t">📝 Notas</div><div class="c">' + notasGenerales + '</div></div>';
    }

    if (orden.length === 0) {
      html += '<div style="font-size:12px;color:#888;padding:10px 0">Este cliente no tiene rutina cargada para ' + CP_DIAS_LABEL[dia] + '.</div>';
    } else {
      orden.forEach(function(clave) {
        if (clave.indexOf('ej') === 0) {
          const i = parseInt(clave.replace('ej', ''));
          if (ejercicios[i]) html += cpHtmlEjercicio(cliId, ejercicios[i], i);
        } else if (clave.indexOf('cardio') === 0) {
          const ci = parseInt(clave.replace('cardio', ''));
          if (cardios[ci]) html += cpHtmlCardio(cliId, cardios[ci], ci);
        }
      });
    }
    html += '<button class="cp-btn-finalizar" onclick="cpFinalizarRutina(\'' + cliId + '\')">⏹ Finalizar rutina</button>';
    html += '<button class="cp-btn-abrir" style="margin-top:8px" onclick="cpToggleTarjeta(\'' + cliId + '\')">Contraer</button>';
  }

  html += '</div>';
  return html;
}

function cpHtmlCardio(cliId, cx, idx) {
  const c = _cpClientes[cliId];
  const hecho = !!c.cardio[idx];
  let html = '<div class="cp-cardio-block ' + (hecho ? 'hecho' : '') + '">';
  html += '<div class="cp-cardio-top" onclick="cpToggleCardio(\'' + cliId + '\',' + idx + ')">'
    + '<div><div class="cp-cardio-nombre">' + (hecho ? '✅ ' : '🏃 ') + (cx.momento || 'Cardio') + '</div>'
    + '<div class="cp-cardio-meta">' + (cx.ejercicio || '') + (cx.tiempo ? ' · ' + cx.tiempo + ' min' : '') + '</div></div>'
    + '<div style="font-size:18px">' + (hecho ? '🟢' : '⭕') + '</div>'
    + '</div>';
  if (cx.notas) {
    html += '<div class="cp-cardio-notas">' + cx.notas + '</div>';
  }
  html += '</div>';
  return html;
}

function cpHtmlEjercicio(cliId, ej, i) {
  const c = _cpClientes[cliId];
  const totalS = parseInt(ej.series) || 3;
  const hechas = parseInt(c.series[i]) || 0;
  const completado = hechas >= totalS;
  const desc = parseInt(ej.desc) || 0;
  const unidad = c.unidades[i] || 'kg';

  let html = '<div class="cp-ex-block ' + (completado ? 'cp-ex-done' : '') + '">';
  html += '<div class="cp-ex-head" onclick="cpToggleEjercicio(\'' + cliId + '\',' + i + ')">'
    + '<div><div class="cp-ex-nombre">' + (completado ? '✅ ' : '') + (ej.nombre || 'Ejercicio') + (ej.var ? ' <span style="background:#e31e24;color:#fff;font-size:9px;font-weight:800;padding:2px 6px;border-radius:5px;vertical-align:middle">' + ej.var + '</span>' : '') + '</div>'
    + '<div class="cp-ex-meta">' + (ej.series || '—') + ' series · ' + (ej.reps || '—') + ' reps' + (ej.rir ? ' · RIR ' + ej.rir : '') + '</div></div>'
    + '</div>';

  const abierto = c.ejercicioAbierto === i;
  if (abierto) {
    html += '<div class="cp-stat-row">'
      + '<div class="cp-stat"><div class="v">' + (ej.series || '—') + '</div><div class="l">Series</div></div>'
      + '<div class="cp-stat"><div class="v">' + (ej.reps || '—') + '</div><div class="l">Reps</div></div>'
      + '<div class="cp-stat"><div class="v" style="color:#e31e24">' + (ej.rir || '—') + '</div><div class="l">RIR</div></div>'
      + '<div class="cp-stat"><div class="v">' + (desc || '—') + 's</div><div class="l">Desc</div></div>'
      + '</div>';

    html += '<div class="cp-unidad-row"><button class="cp-unidad-toggle" onclick="cpToggleUnidad(\'' + cliId + '\',' + i + ')">Peso en ' + unidad + '</button></div>';

    html += '<div class="cp-serie-col">';
    const pesosEj = c.pesos[i] || [];
    for (let s = 0; s < totalS; s++) {
      const hecha = s < hechas;
      const pesoGuardado = pesosEj[s] || '';
      html += '<div class="cp-serie-item">';
      if (hecha) {
        html += '<input class="cp-serie-peso" value="' + pesoGuardado + '" disabled>';
      } else if (s === hechas) {
        html += '<input type="number" inputmode="decimal" class="cp-serie-peso" id="cp-peso-' + cliId + '-' + i + '-' + s + '" placeholder="' + unidad + '">';
      } else {
        html += '<input class="cp-serie-peso" placeholder="—" disabled>';
      }
      html += '<span class="cp-bombilla" onclick="' + (hecha && s === hechas - 1 ? "cpDeshacerSerie('" + cliId + "'," + i + ")" : '') + '">' + (hecha ? '🟢' : '⭕') + '</span>';
      html += '<div class="cp-serie-label">S' + (s + 1) + '</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<button class="cp-btn-serie" ' + (completado ? 'disabled' : '') + ' onclick="cpSerie(\'' + cliId + '\',' + i + ',' + desc + ',' + totalS + ')">'
      + (completado ? '✅ Completado' : '✅ Serie ' + (hechas + 1) + ' de ' + totalS)
      + '</button>';
  }

  html += '</div>';
  return html;
}

function cpToggleEjercicio(cliId, idx) {
  const c = _cpClientes[cliId];
  if (!c) return;
  c.ejercicioAbierto = (c.ejercicioAbierto === idx) ? null : idx;
  cpRenderGrid();
}

// ============================================================
// MENÚ (⋮) de tarjeta
// ============================================================
function cpAbrirMenuTarjeta(ev, cliId) {
  ev.stopPropagation();
  document.querySelectorAll('.cp-menu-flotante').forEach(function(m){ m.remove(); });

  const menu = document.createElement('div');
  menu.className = 'cp-menu-flotante';
  menu.style.cssText = 'position:absolute;top:36px;right:10px;background:#141414;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;z-index:20;min-width:170px;box-shadow:0 8px 24px rgba(0,0,0,.5)';
  menu.innerHTML = '<button style="display:block;width:100%;text-align:left;background:none;border:none;color:#fff;padding:12px 14px;font-size:13px;border-bottom:1px solid #2a2a2a;cursor:pointer" onclick="cpAbrirCambioDia(\'' + cliId + '\');this.closest(\'.cp-menu-flotante\').remove()">🔄 Rutina seleccionada</button>'
    + '<button style="display:block;width:100%;text-align:left;background:none;border:none;color:#e31e24;padding:12px 14px;font-size:13px;cursor:pointer" onclick="cpQuitarClienteDeClase(\'' + cliId + '\');this.closest(\'.cp-menu-flotante\').remove()">✕ Quitar de la clase</button>';

  ev.target.closest('.cp-card-top').appendChild(menu);
}

document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('cp-kebab')) {
    document.querySelectorAll('.cp-menu-flotante').forEach(function(m){ m.remove(); });
  }
});

function cpAbrirCambioDia(cliId) {
  const actual = _cpClientes[cliId].rutina_seleccionada;
  let opciones = '<option value="automatica" ' + (actual==='automatica'?'selected':'') + '>Automática</option>';
  CP_DIAS.forEach(function(d) {
    opciones += '<option value="' + d + '" ' + (actual===d?'selected':'') + '>' + CP_DIAS_LABEL[d] + '</option>';
  });

  const overlay = document.createElement('div');
  overlay.className = 'cp-modal-bg';
  overlay.innerHTML = '<div class="cp-modal">'
    + '<div class="cp-seccion-label">Rutina seleccionada</div>'
    + '<select class="cp-select" id="cp-select-dia-cambio">' + opciones + '</select>'
    + '<div class="cp-hint">ℹ️ Esto solo define qué rutina se muestra durante esta clase. No modifica la programación semanal habitual del cliente.</div>'
    + '<button class="cp-btn-confirmar" onclick="cpConfirmarCambioDia(\'' + cliId + '\')">Guardar</button>'
    + '</div>';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

function cpConfirmarCambioDia(cliId) {
  const val = document.getElementById('cp-select-dia-cambio').value;
  cpCambiarRutinaSeleccionada(cliId, val);
  document.querySelectorAll('.cp-modal-bg').forEach(function(m){ m.remove(); });
}

// ============================================================
// MODAL: agregar cliente
// ============================================================
async function cpAbrirModalAgregar() {
  try {
    const eid = cpEntrenadorId();
    const res = await fetch('/api/usuarios?entrenador_id=' + eid);
    _cpTodosClientes = await res.json();
  } catch (e) {
    _cpTodosClientes = [];
  }

  cpRenderModalBusqueda('');
}

function cpRenderModalBusqueda(filtro) {
  document.querySelectorAll('.cp-modal-bg').forEach(function(m){ m.remove(); });

  const yaEnClase = Object.keys(_cpClientes);
  const disponibles = _cpTodosClientes.filter(function(c){ return !yaEnClase.includes(String(c.id)); });
  const recientesIds = cpObtenerRecientes().map(function(r){ return r.id; });
  const recientes = disponibles.filter(function(c){ return recientesIds.includes(c.id); });

  const filtrados = filtro
    ? disponibles.filter(function(c){ return dtClienteCoincide(c, filtro); })
    : disponibles;

  let html = '<div class="cp-modal">';
  html += '<div style="font-size:16px;font-weight:800;margin-bottom:12px">Agregar cliente</div>';
  html += '<input class="cp-search" placeholder="Buscar cliente..." oninput="cpRenderModalBusqueda(this.value)" value="' + (filtro || '') + '" autofocus>';

  if (!filtro && recientes.length > 0) {
    html += '<div class="cp-seccion-label">Recientes</div>';
    recientes.forEach(function(c){ html += cpHtmlItemCliente(c); });
  }

  html += '<div class="cp-seccion-label">Todos los clientes</div>';
  if (filtrados.length === 0) {
    html += '<div style="font-size:12px;color:#777;padding:10px 0">No se encontraron clientes.</div>';
  } else {
    filtrados.forEach(function(c){ html += cpHtmlItemCliente(c); });
  }

  html += '</div>';

  const overlay = document.createElement('div');
  overlay.className = 'cp-modal-bg';
  overlay.innerHTML = html;
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);

  const input = overlay.querySelector('.cp-search');
  if (input) { input.focus(); input.selectionStart = input.selectionEnd = input.value.length; }
}

function cpHtmlItemCliente(c) {
  const inicial = (c.nombre || '?').substring(0, 2).toUpperCase();
  const nombreEsc = (c.nombre || '').replace(/'/g, "\\'");
  return '<div class="cp-cli-item" onclick="cpElegirClienteParaAgregar(\'' + c.id + '\',\'' + nombreEsc + '\')">'
    + '<div class="cp-avatar">' + inicial + '</div>'
    + '<div>' + (c.nombre || 'Sin nombre') + '</div>'
    + '</div>';
}

function cpElegirClienteParaAgregar(id, nombre) {
  _cpModalClienteElegido = { id: id, nombre: nombre };
  cpRenderModalSeleccionDia();
}

function cpRenderModalSeleccionDia() {
  document.querySelectorAll('.cp-modal-bg').forEach(function(m){ m.remove(); });

  let opciones = '<option value="automatica">Automática</option>';
  CP_DIAS.forEach(function(d) { opciones += '<option value="' + d + '">' + CP_DIAS_LABEL[d] + '</option>'; });

  const overlay = document.createElement('div');
  overlay.className = 'cp-modal-bg';
  overlay.innerHTML = '<div class="cp-modal">'
    + '<div style="font-size:16px;font-weight:800;margin-bottom:14px">👤 ' + _cpModalClienteElegido.nombre + '</div>'
    + '<div class="cp-seccion-label">Rutina seleccionada</div>'
    + '<select class="cp-select" id="cp-select-dia-nuevo">' + opciones + '</select>'
    + '<div class="cp-hint">ℹ️ Esto solo define qué rutina se abre durante esta clase. No modifica la programación semanal habitual de ' + _cpModalClienteElegido.nombre + '.</div>'
    + '<button class="cp-btn-confirmar" onclick="cpConfirmarAgregarCliente()">Agregar a la clase</button>'
    + '</div>';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

async function cpConfirmarAgregarCliente() {
  const dia = document.getElementById('cp-select-dia-nuevo').value;
  await cpAgregarClienteAClase(_cpModalClienteElegido, dia);
  document.querySelectorAll('.cp-modal-bg').forEach(function(m){ m.remove(); });
  _cpModalClienteElegido = null;
}

// ============================================================
// Init de la página
// ============================================================
async function cpInitPagina() {
  cpCargarClase();
  const ids = Object.keys(_cpClientes);
  ids.forEach(function(cliId) {
    if (!_cpClientes[cliId].pesos) _cpClientes[cliId].pesos = {};
    if (!_cpClientes[cliId].unidades) _cpClientes[cliId].unidades = {};
    if (!_cpClientes[cliId].cardio) _cpClientes[cliId].cardio = {};
  });
  await Promise.all(ids.map(function(cliId){ return cpCargarRutinaCliente(cliId); }));
  cpRenderGrid();
}

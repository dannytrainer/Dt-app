
// ── TERMINAL CLIENTE ─────────────────────────────────────

let _tcDia = '';
let _tcUsuario = null;

function tcEsPremium() {
  return _tcUsuario && _tcUsuario.premium === true;
}

function tcMostrarPremium() {
  var el = document.createElement('div');
  el.id = 'modal-tc-premium';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  el.innerHTML = '<div style="background:#111;border:2px solid #e31e24;border-radius:20px;padding:28px 20px;text-align:center;max-width:320px">' +
    '<div style="font-size:36px;margin-bottom:12px">⭐</div>' +
    '<div style="font-size:18px;font-weight:900;color:#fff;margin-bottom:8px">Función Premium</div>' +
    '<div style="font-size:13px;color:var(--texto-medio);line-height:1.6;margin-bottom:16px">Desbloquea todo el potencial de DT-APP por solo <span style="color:#e31e24;font-weight:700">$9.999/mes</span>.</div>' +
    '<button onclick="document.getElementById(\'modal-tc-premium\').remove();tcPagarPremiumModal();" style="width:100%;padding:12px;border-radius:10px;border:none;background:#e31e24;color:#fff;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:10px">💳 Pagar $9.999/mes</button>' +
    '<button onclick="this.parentNode.parentNode.remove()" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:transparent;color:#888;font-size:13px;cursor:pointer">Ahora no</button>' +
    '</div>';
  document.body.appendChild(el);
}

function tcPagarPremiumModal() {
  var s = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  var uid = s.id || null;
  if (!uid) { toast('⚠️ Inicia sesión primero',false); return; }
  window.open('/premium-cliente.html?uid=' + encodeURIComponent(uid), '_blank');
}
let _tcRutina = null;
let _tcAlim = null;
const DIAS_ES = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

async function iniciarTerminalCliente() {
  if (window._tcCargando) return;
  window._tcCargando = true;
  const id = localStorage.getItem('dt_cliente_id');
  const tel = localStorage.getItem('dt_cliente_tel');
  if (!id) { window._tcCargando = false; cerrarSesion(); return; }

  // Ocultar app entrenador
  document.getElementById('app-entrenador').style.display = 'none';

  // Mostrar terminal
  const tc = document.getElementById('terminal-cliente-app');
  tc.style.display = 'flex';
  tc.style.flexDirection = 'column';

  // Cargar datos con soporte offline
  const _offlineKey = 'tc-offline-' + id;
  if (navigator.onLine) {
    const [usuRes, rutRes, aliRes] = await Promise.all([
      fetch('/api/usuarios/' + id).then(r=>r.json()).catch(()=>null),
      fetch('/api/rutinas/' + id).then(r=>r.json()).catch(()=>null),
      fetch('/api/alimentacion/' + id).then(r=>r.json()).catch(()=>null)
    ]);
    _tcUsuario = usuRes;
    _tcRutina = rutRes;
    _tcAlim = aliRes;
    if (_tcUsuario && _tcRutina) {
      localStorage.setItem(_offlineKey, JSON.stringify({ usuario: _tcUsuario, rutina: _tcRutina, alim: _tcAlim, ts: Date.now() }));
      const t = document.createElement('div');
      t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a3a1a;border:1px solid #4caf50;color:#4caf50;font-size:11px;font-weight:700;padding:8px 16px;border-radius:20px;z-index:99999;transition:opacity 1s';
      t.textContent = 'Rutina guardada para uso sin internet';
      document.body.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 1000); }, 3000);
    }
  } else {
    const cached = localStorage.getItem(_offlineKey);
    if (cached) {
      try {
        const d = JSON.parse(cached);
        _tcUsuario = d.usuario; _tcRutina = d.rutina; _tcAlim = d.alim;
        if (!document.getElementById('tc-offline-banner')) {
          const b = document.createElement('div');
          b.id = 'tc-offline-banner';
          b.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#7a4a00;color:#ffb74d;font-size:11px;font-weight:700;text-align:center;padding:6px;z-index:99999';
          b.textContent = 'Sin internet - Rutina cargada desde cache';
          document.body.appendChild(b);
        }
      } catch(e) { _tcUsuario = null; _tcRutina = null; _tcAlim = null; }
    } else {
      const b = document.createElement('div');
      b.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#3a0000;color:#e31e24;font-size:11px;font-weight:700;text-align:center;padding:6px;z-index:99999';
      b.textContent = 'Sin internet y sin datos guardados. Conectate una vez primero.';
      document.body.appendChild(b);
    }
  }

  // Verificar vencimiento premium
  if (_tcUsuario && _tcUsuario.premium && _tcUsuario.premium_hasta) {
    const hoy = new Date().toISOString().split('T')[0];
    if (_tcUsuario.premium_hasta < hoy) {
      _tcUsuario.premium = false;
      fetch('/api/usuarios/' + _tcUsuario.id, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ premium: false, premium_hasta: null })
      }).catch(()=>{});
    }
  }

  // Nombre en header
  if (_tcUsuario && _tcUsuario.nombre) {
    document.getElementById('tc-nombre-cliente').textContent = _tcUsuario.nombre;
  }

  // Dia actual
  _tcDia = DIAS_ES[new Date().getDay()];

  tcTab('rutina');
  window._tcCargando = false;
  // Badge al cargar
  setTimeout(tcVerificarMensajesNuevos, 1000);
  // Reanudar timer si estaba en curso
  const _tk = 'tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x');
  if (localStorage.getItem(_tk)) {
    tcMostrarBannerTimer();
  } else {
    const banner = document.getElementById('tc-banner-timer');
    if (banner) banner.style.display = 'none';
    if (_tcTimerRutina) { clearInterval(_tcTimerRutina); _tcTimerRutina = null; }
  }
}

function tcTab(tab) {
  
  ['rutina','alimentacion','tools','progreso','perfil'].forEach(t => {
    const btn = document.getElementById('tc-tab-' + t);
    if (!btn) return;
    btn.style.color = t === tab ? '#e31e24' : '#555';
    btn.style.borderBottom = t === tab ? '2px solid #e31e24' : '2px solid transparent';
  });

  const cont = document.getElementById('tc-contenido');

  if (tab === 'rutina') tcRenderRutina(cont);
  else if (tab === 'tools') tcRenderTools(cont);
  else if (tab === 'alimentacion') tcRenderAlimentacion(cont);
  else if (tab === 'progreso') { if(tcEsPremium()){tcRenderProgreso(cont);}else{cont.innerHTML='';tcMostrarPremium();} }
  else if (tab === 'perfil') tcRenderPerfil(cont);
}

function tcMostrarAyudaRutina(){
  const modal = document.createElement('div');
  modal.id = 'modal-ayuda-rutina';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';
  modal.innerHTML = `
    <div style="max-width:380px;width:100%;background:#111 !important;border-radius:18px;padding:22px;max-height:85vh;overflow-y:auto;border:1px solid #2a2a2a">
      <div style="font-size:18px;font-weight:900;color:#e31e24;margin-bottom:14px;text-align:center">Como funciona tu rutina?</div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:18px">
        <div style="display:flex;gap:10px;align-items:flex-start"><span style="background:#e31e24;color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</span><span style="font-size:13px;color:#e0e0e0;line-height:1.5">Toca <b>Iniciar rutina</b> para activar el cronometro del dia.</span></div>
        <div style="display:flex;gap:10px;align-items:flex-start"><span style="background:#e31e24;color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</span><span style="font-size:13px;color:#e0e0e0;line-height:1.5">Toca el boton <b>Serie X de Y</b> cada vez que termines una serie.</span></div>
        <div style="display:flex;gap:10px;align-items:flex-start"><span style="background:#e31e24;color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</span><span style="font-size:13px;color:#e0e0e0;line-height:1.5">Registra el <b>peso usado</b> en cada serie. Elige <b>kg o lb</b> por ejercicio. Se guarda automaticamente y aparece la proxima vez.</span></div>
        <div style="display:flex;gap:10px;align-items:flex-start"><span style="background:#e31e24;color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">4</span><span style="font-size:13px;color:#e0e0e0;line-height:1.5">Al completar todo, se envia un reporte a tu entrenador.</span></div>
      </div>
      <div style="background:#0d0d0d;border-radius:12px;padding:14px;margin-bottom:12px">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px">Indicadores del ejercicio</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:11px;font-weight:900;color:#fff;background:#1a1a1a;border-radius:6px;padding:3px 8px;min-width:44px;text-align:center">SERIES</span><span style="font-size:12px;color:#ccc">Cuantas veces repites el bloque</span></div>
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:11px;font-weight:900;color:#fff;background:#1a1a1a;border-radius:6px;padding:3px 8px;min-width:44px;text-align:center">REPS</span><span style="font-size:12px;color:#ccc">Repeticiones por serie</span></div>
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:11px;font-weight:900;color:#e31e24;background:#1a0000;border-radius:6px;padding:3px 8px;min-width:44px;text-align:center">RIR</span><span style="font-size:12px;color:#ccc">Repeticiones en reserva — esfuerzo que te queda</span></div>
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:11px;font-weight:900;color:#fff;background:#1a1a1a;border-radius:6px;padding:3px 8px;min-width:44px;text-align:center">DESC</span><span style="font-size:12px;color:#ccc">Segundos de pausa entre series</span></div>
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:11px;font-weight:900;color:#e31e24;background:#1a0000;border:1px solid #e31e24;border-radius:6px;padding:3px 8px;min-width:44px;text-align:center">VAR</span><span style="font-size:12px;color:#ccc">Variacion del ejercicio — tocalo para ir a las notas</span></div>
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:11px;font-weight:900;color:#888;background:#1a1a1a;border:1px solid #333;border-radius:6px;padding:3px 8px;min-width:44px;text-align:center">VER</span><span style="font-size:12px;color:#ccc">Abre el video o enciclopedia del ejercicio</span></div>
        </div>
      </div>
      <div style="background:#0d0d0d;border-radius:12px;padding:14px;margin-bottom:18px">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px">Significado de los circulos</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:18px">🟢</span><span style="font-size:12px;color:#ccc">Serie completada con exito</span></div>
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:18px">🟠</span><span style="font-size:12px;color:#ccc">Toca el verde otra vez si la serie fue fallida</span></div>
          <div style="display:flex;align-items:center;gap:10px"><span style="font-size:18px">⭕</span><span style="font-size:12px;color:#ccc">Serie aun no realizada</span></div>
        </div>
      </div>
      <button onclick="document.getElementById('modal-ayuda-rutina').remove()" style="width:100%;padding:13px;border:none;border-radius:10px;background:#e31e24;color:#fff;font-size:13px;font-weight:700;cursor:pointer">Entendido</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.remove(); });
}

function tcRenderRutina(cont) {
  
  // Verificar si cliente está pausado
  if (_tcUsuario && _tcUsuario.activo === false) {
    cont.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:32px 24px">' +
      '<div style="font-size:48px;margin-bottom:16px">⏸️</div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--texto);margin-bottom:10px">No tienes una rutina activa en este momento.</div>' +
      '<div style="font-size:13px;color:var(--texto-medio);line-height:1.6">Contáctate con tu entrenador para empezar o reanudar tu plan de entrenamiento.</div>' +
      '</div>';
    return;
  }
  // Solo dia actual visible
  const diaActual2 = DIAS_ES[new Date().getDay()];
  let diasHtml = '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:16px;scrollbar-width:none">';
  DIAS_ES.forEach(d => {
    const rec = _tcRutina && _tcRutina[d] && _tcRutina[d].recordatorio ? _tcRutina[d].recordatorio : '';
    const esHoy = d === diaActual2;
    const label = d.charAt(0).toUpperCase() + d.slice(1,3);
    if (esHoy) {
              window._tcRecs = window._tcRecs || {};
              window._tcRecs[d] = rec;
              diasHtml += '<div style="flex-shrink:0;padding:8px 14px;border-radius:20px;border:2px solid #e31e24;background:#e31e24;color:#fff;font-size:12px;font-weight:700;cursor:pointer" onclick="tcToggleRec(this,window._tcRecs[\'' + d + '\']);tcVerDia(\'' + d + '\')">&#x1F534; ' + label + '</div>';
            } else {
              window._tcRecs = window._tcRecs || {};
              window._tcRecs[d] = rec;
              diasHtml += '<div style="flex-shrink:0;padding:8px 14px;border-radius:20px;border:2px solid #1a1a1a;background:#111;color:var(--texto-medio);font-size:11px;font-weight:600;cursor:pointer" onclick="tcToggleRec(this,window._tcRecs[\'' + d + '\']);tcVerDia(\'' + d + '\')">&#9898; ' + label + '</div>';
            }
  });
  diasHtml += '</div>';
  cont.innerHTML = diasHtml + '<div id="tc-rec-dropdown" style="display:none;background:var(--card);border-left:3px solid #e31e24;border-radius:10px;padding:10px 14px;margin-bottom:10px;font-size:12px;color:var(--texto-suave)"></div><div id="tc-dia-contenido"></div>';
  // Verificar si rutina ya fue completada hoy
  const _uid2 = (_tcUsuario && _tcUsuario.id) || 'x';
  const _diaActualHoy2 = DIAS_ES[new Date().getDay()];
  const _fecha2 = new Date().toISOString().split('T')[0];
  const _desbloqueadoHoy = (_tcUsuario && _tcUsuario.dias_desbloqueados && _tcUsuario.dias_desbloqueados[_diaActualHoy2] && _tcUsuario.dias_desbloqueados[_diaActualHoy2].includes(_fecha2));
  if (_desbloqueadoHoy) {
    localStorage.removeItem('tc-rutina-completa-' + _uid2 + '-' + tcFechaHoy());
    fetch('/api/usuarios/' + _uid2 + '/limpiar-desbloqueo', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({dia: _diaActualHoy2})
    }).catch(()=>{});
  }
  // Limpiar también días desbloqueados manualmente
  if (_tcUsuario && _tcUsuario.dias_desbloqueados) {
    Object.keys(_tcUsuario.dias_desbloqueados).forEach(function(dia){
      if (_tcUsuario.dias_desbloqueados[dia].includes(_fecha2)) {
        localStorage.removeItem('tc-rutina-completa-' + _uid2 + '-' + tcFechaHoy() + '-' + dia);
      }
    });
  }
  const _resumenHoy = localStorage.getItem('tc-rutina-completa-' + _uid2 + '-' + tcFechaHoy());
  if (_resumenHoy && !_desbloqueadoHoy) {
    _tcRutinaCompletadaHoy = true;
    try {
      const r = JSON.parse(_resumenHoy);
      const hh = String(Math.floor(r.tiempo/3600)).padStart(2,'0');
      const mm = String(Math.floor((r.tiempo%3600)/60)).padStart(2,'0');
      const ss = String(r.tiempo%60).padStart(2,'0');
      let _html = '<div style="text-align:center;padding:30px 20px">';
      _html += '<div style="font-size:64px;margin-bottom:12px">🏆</div>';
      _html += '<div style="font-size:20px;font-weight:900;color:#4caf50;margin-bottom:8px">¡Rutina completada!</div>';
      _html += '<div style="font-size:13px;color:#888;margin-bottom:24px;line-height:1.6">Cada sesión te acerca más<br>a quien quieres ser. 💪</div>';
      _html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:16px;text-align:left;margin-bottom:12px">';
      _html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">📋 Resumen de hoy</div>';
      _html += '<div style="display:flex;gap:8px;margin-bottom:8px">';
      _html += '<div style="flex:1;background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:900;color:#4caf50">' + r.ejercicios + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Ejercicios</div></div>';
      _html += '<div style="flex:1;background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:900;color:#4caf50">' + r.series + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Series</div></div>';
      if (r.cardios > 0) _html += '<div style="flex:1;background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:900;color:#4caf50">' + r.cardios + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Cardios</div></div>';
      _html += '</div>';
      if (r.tiempo > 0) _html += '<div style="background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:900;color:#e31e24;font-family:monospace">' + hh + ':' + mm + ':' + ss + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Tiempo de rutina</div></div>';
      _html += '</div>';
      _html += '<div style="font-size:11px;color:#333;margin-top:8px">' + r.fecha + '</div>';
      _html += '</div>';
      cont.innerHTML = _html;
      localStorage.setItem('tc-estado-' + _uid2, 'resumen');
      return;
    } catch(e) {}
  }
  localStorage.setItem('tc-estado-' + ((_tcUsuario && _tcUsuario.id) || 'x'), 'rutina');
  tcVerDia(diaActual2);
}

let _tcSeriesCompletadas = {};
let _tcSeriesFallidas = {};
let _tcRutinaCompletadaHoy = false;
let _tcCardioCompletado = {};
let _tcEjercicios = [];
let _tcLog = [];

function tcToggleRec(el, rec) {
  const drop = document.getElementById('tc-rec-dropdown');
  if (!drop) return;
  if (drop.style.display === 'block' && drop._origen === el) {
    drop.style.display = 'none';
    drop._origen = null;
  } else {
    drop.style.display = 'block';
    drop._origen = el;
    drop.innerHTML = rec ? '💬 ' + rec : '(Sin título)';
  }
}

function tcVerDia(dia) {
  // Si rutina ya completada hoy, no mostrar rutina
  const _uid3 = (_tcUsuario && _tcUsuario.id) || 'x';
  const _diaCheck = DIAS_ES[new Date().getDay()];
  const _fechaCheck = new Date().toISOString().split('T')[0];
  const _desbCheck = (_tcUsuario && _tcUsuario.dias_desbloqueados && _tcUsuario.dias_desbloqueados[_diaCheck] && _tcUsuario.dias_desbloqueados[_diaCheck].includes(_fechaCheck));
  const _desbDiaViendo = (_tcUsuario && _tcUsuario.dias_desbloqueados && _tcUsuario.dias_desbloqueados[dia] && _tcUsuario.dias_desbloqueados[dia].includes(_fechaCheck));
  if (_desbCheck || _desbDiaViendo) {
    localStorage.removeItem('tc-rutina-completa-' + _uid3 + '-' + tcFechaHoy());
    localStorage.removeItem('tc-rutina-completa-' + _uid3 + '-' + tcFechaHoy() + '-' + dia);
  }
  const _resumenCheck = localStorage.getItem('tc-rutina-completa-' + _uid3 + '-' + tcFechaHoy());
  if (_resumenCheck && !_desbCheck && !_desbDiaViendo) return;
  const diaAnterior = _tcDia;
  _tcDia = dia;
  // Resetear solo si cambia de día
  if (diaAnterior !== dia) {
    _tcSeriesCompletadas = {};
    _tcSeriesFallidas = {};
    _tcCardioCompletado = {};
    _tcLog = [];
  }
  // Siempre intentar recuperar log del localStorage
  var _logKey = 'tc-log-' + ((_tcUsuario && _tcUsuario.id) || 'x') + '-' + tcFechaHoy() + '-' + dia;
  var _logGuardado = localStorage.getItem(_logKey);
  if (_logGuardado) try { _tcLog = JSON.parse(_logGuardado); } catch(e) { _tcLog = []; }
  tcCargarProgreso();
  try {
  const diaData = _tcRutina && _tcRutina[dia];
  const ejercicios = diaData && diaData.ejercicios ? diaData.ejercicios : [];
  const recordatorio = diaData && diaData.recordatorio ? diaData.recordatorio : '';
  const notas = diaData && diaData.rutina ? diaData.rutina : '';
  const cont = document.getElementById('tc-dia-contenido');

  const diaActualHoy = DIAS_ES[new Date().getDay()];
  if (dia !== diaActualHoy) {
    const u = _tcUsuario || {};
    const fecha = new Date().toISOString().split('T')[0];
    const desbloqueado = u.dias_desbloqueados && u.dias_desbloqueados[dia] && u.dias_desbloqueados[dia].includes(fecha);
    if (!desbloqueado) {
      cont.innerHTML = '';
      const drop = document.getElementById('tc-rec-dropdown');
      if (drop) {
        drop.style.display = recordatorio ? 'block' : 'none';
        drop.innerHTML = recordatorio ? '💬 ' + recordatorio : '';
      }
      return;
    }
  }
  // Es hoy: cerrar dropdown y mostrar rutina
  const dropHoy = document.getElementById('tc-rec-dropdown');
  if (dropHoy) { dropHoy.style.display = 'none'; dropHoy._origen = null; }


  const cardio = diaData && diaData.cardio ? diaData.cardio : [];
  const presencial = diaData && diaData.presencial;

  if (presencial) {
    cont.innerHTML = '<div style="text-align:center;padding:40px 20px"><div style="font-size:64px;margin-bottom:12px">🏟️</div><div style="font-size:18px;font-weight:900;color:#e31e24;margin-bottom:8px">Clase presencial</div><div style="font-size:13px;color:#888;line-height:1.6;padding:0 20px">' + (recordatorio || 'Hoy tienes clase presencial con tu entrenador.') + '</div></div>';
    return;
  }

  if (ejercicios.length === 0 && cardio.length === 0) {
    cont.innerHTML = '<div style="text-align:center;padding:40px 20px"><div style="font-size:48px;margin-bottom:12px">😴</div><div style="font-size:16px;font-weight:700;color:var(--texto-medio)">Día de descanso</div><div style="font-size:13px;color:#444;margin-top:6px">Recuperación y hidratación</div></div>';
    return;
  }

  let html = '';
  // Botón iniciar rutina
  const yaIniciada = localStorage.getItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x')) !== null;
  html += '<button onclick="tcIniciarRutina()" id="tc-btn-iniciar-rutina" style="width:100%;padding:10px;border-radius:10px;border:none;background:#0a0a0a;color:' + (yaIniciada?'#4caf50':'#e31e24') + ';font-size:13px;font-weight:700;cursor:pointer;border:1px solid ' + (yaIniciada?'#4caf50':'#e31e24') + ';margin-bottom:14px">' + (yaIniciada?'✅ Rutina en curso':'▶ Iniciar rutina') + '</button>';
  html += '<div style="text-align:center;margin-bottom:14px;margin-top:4px"><button onclick="tcMostrarAyudaRutina()" style="background:transparent;border:none;color:#888;font-size:11px;cursor:pointer;display:inline-flex;align-items:center;gap:4px"><span style="background:#333;color:#fff;width:16px;height:16px;border-radius:50%;font-size:10px;display:inline-flex;align-items:center;justify-content:center;font-weight:700">?</span> ¿Como funciona?</button></div>';

  if (recordatorio) {
    html += '<div style="background:var(--card);border-left:3px solid #e31e24;border-radius:10px;padding:12px 14px;margin-bottom:14px"><div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">🏷️ Título</div><div style="font-size:13px;color:var(--texto-suave);line-height:1.5">' + recordatorio + '</div></div>';
  }
  html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">📋 ' + ejercicios.length + ' ejercicios</div>';


  // CARDIO - mostrar antes de ejercicios
  if (cardio.length > 0) {
    html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">🏃 ' + cardio.length + ' bloques de cardio</div>';
    cardio.forEach((cx, ci) => {
      html += '<div style="background:#1a0000;border:1px solid #2a0000;border-radius:14px;padding:14px;margin-bottom:12px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
      html += '<div><div style="font-size:13px;font-weight:700;color:#e31e24">' + (cx.momento||'Cardio') + '</div>';
      html += '<div style="font-size:12px;color:var(--texto-suave);margin-top:2px">' + (cx.ejercicio||'') + '</div></div>';
      html += '<div style="display:flex;gap:6px;align-items:center">';
      html += '<div style="background:#1a0000;border-radius:8px;padding:6px 12px;text-align:center">';
      html += '<div style="font-size:16px;font-weight:900;color:#e31e24">' + (cx.tiempo||'—') + '</div>';
      html += '<div style="font-size:9px;color:#e31e24;text-transform:uppercase">min</div></div>';
      html += '<div id="tc-cardio-enc-btn-' + ci + '" style="display:none;background:#111;border:1px solid #333;border-radius:8px;padding:5px 8px;color:var(--texto-medio);font-size:11px;font-weight:700;cursor:pointer;align-items:center;gap:4px">&#128065;</div>';
      html += '</div>';
      html += '</div>';
      // buscar match cardio
      (function(cxi, cxej){ fetch('/api/enciclopedia/buscar-match/' + encodeURIComponent(cxej||'') + '?grupo=cardio', {method:'GET'}).then(function(r){return r.json();}).then(function(res){ if(res.encontrado){ var b=document.getElementById('tc-cardio-enc-btn-'+cxi); if(b){b.style.display='flex';b.onclick=function(){ if(tcEsPremium()){tcVerEnciclopedia(res.ejercicio.id);}else{tcMostrarPremium();} };}}}); })(ci, cx.ejercicio);
      if (cx.notas) html += '<div style="font-size:11px;color:var(--texto-medio);font-style:italic;border-top:1px solid #1a2a3a;padding-top:8px;margin-top:4px">' + cx.notas + '</div>';
      html += '<button id="tc-cardio-btn-' + ci + '" onclick="tcCardioHecho(' + ci + ')" style="width:100%;margin-top:10px;padding:7px 10px;border-radius:8px;border:none;background:#1a0000;color:#e31e24;font-size:12px;font-weight:700;cursor:pointer;border:1px solid #e31e24">✅ Cardio realizado</button>';
      html += '</div>';
    });
  }

  _tcEjercicios = ejercicios; // guardar para reporte
  ejercicios.forEach((ej, i) => {
    const series = parseInt(ej.series) || 3;
    if (_tcSeriesCompletadas[i] === undefined) _tcSeriesCompletadas[i] = 0;
    let bombillas = '';
    for (let s = 0; s < series; s++) {
      bombillas += '<span id="tc-bomb-' + i + '-' + s + '" onclick="tcDeshacerSerie(' + i + ',' + s + ')" style="font-size:22px;opacity:0.25;transition:.3s;cursor:pointer">⭕</span>';
    }
    html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px"><div><div style="font-size:15px;font-weight:700;color:#fff">' + (ej.nombre||'Ejercicio') + '</div><div style="font-size:11px;color:var(--texto-medio);margin-top:2px">' + (ej.grupo||'') + '</div></div>';
    html += ej.video ? '<a href="' + ej.video + '" target="_blank" style="background:#1a0000;border:1px solid #e31e24;border-radius:8px;padding:5px 10px;color:#e31e24;font-size:11px;font-weight:700;text-decoration:none">▶ Video</a>' : '';
    // Botón Ver enciclopedia
    fetch('/api/enciclopedia/buscar-match/' + encodeURIComponent(ej.nombre||''), {method:'GET'})
      .then(function(r){return r.json();})
      .then(function(res){
        if (res.encontrado) {
          var btn = document.getElementById('tc-enc-btn-' + i);
          if (btn) {
            btn.style.display = 'flex';
            btn.onclick = function(){ if(tcEsPremium()){tcVerEnciclopedia(res.ejercicio.id);}else{tcMostrarPremium();} };
          }
        }
      }).catch(function(){});
    html += '<div id="tc-enc-btn-' + i + '" style="display:none;background:#111;border:1px solid #333;border-radius:8px;padding:5px 10px;color:var(--texto-medio);font-size:11px;font-weight:700;cursor:pointer;align-items:center;gap:4px">&#128065; Ver</div>';
    html += '</div>';
    html += '<div style="display:flex;gap:6px;margin-bottom:12px">';
    html += '<div style="background:#1a1a1a;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px"><div style="font-size:16px;font-weight:900;color:#fff">' + (ej.series||'—') + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Series</div></div>';
    html += '<div style="background:#1a1a1a;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px"><div style="font-size:16px;font-weight:900;color:#fff">' + (ej.reps||'—') + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Reps</div></div>';
    html += '<div style="background:#1a1a1a;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px"><div style="font-size:16px;font-weight:900;color:#e31e24">' + (ej.rir||'—') + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">RIR</div></div>';
    html += '<div style="background:#1a1a1a;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px"><div style="font-size:16px;font-weight:900;color:#fff">' + (ej.desc ? ej.desc + ' seg' : '—') + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Desc</div></div>';
    if (ej.var) html += '<div onclick="tcScrollNotas()" style="background:#1a0000;border:1px solid #e31e24;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px;cursor:pointer"><div style="font-size:16px;font-weight:900;color:#e31e24">' + ej.var + '</div><div style="font-size:9px;color:#e31e24;text-transform:uppercase">VAR</div></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">' + bombillas + '</div>';
    html += '<button onclick="tcSerie(' + i + ',' + (parseInt(ej.desc)||0) + ',' + series + ')" id="tc-btn-serie-' + i + '" style="width:100%;padding:7px 10px;border-radius:8px;border:none;background:#e31e24;color:#fff;font-size:12px;font-weight:700;cursor:pointer">✅ Serie 1 de ' + series + '</button>';
    html += '</div>';
  });
  if (notas) {
    html += '<div id="tc-notas-generales" style="background:var(--card);border:1px dashed var(--borde);border-radius:10px;padding:12px 14px;margin-top:4px;transition:border 0.3s,box-shadow 0.3s"><div style="font-size:10px;color:var(--texto-medio);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">📝 Notas</div><div style="font-size:12px;color:var(--texto-medio);line-height:1.5">' + notas + '</div></div>';
  }
    html += '</div>';
  html += '<button onclick="tcDetenerRutina()" style="width:100%;padding:12px;border-radius:10px;border:1px solid #e31e24;background:#1a0000;color:#e31e24;font-size:13px;font-weight:700;cursor:pointer;margin-top:16px;margin-bottom:8px">⏹ Finalizar rutina</button>';
  cont.innerHTML = html;
  } catch(eee) { toast('❌ Error: '+eee.message,false); }
  // Restaurar progreso visual con delay para asegurar DOM listo
  setTimeout(() => {
  Object.keys(_tcSeriesCompletadas).forEach(ejIdx => {
    const completadas = parseInt(_tcSeriesCompletadas[ejIdx]) || 0;
    for (let s = 0; s < completadas; s++) {
      const bomb = document.getElementById('tc-bomb-' + ejIdx + '-' + s);
      if (bomb) { bomb.textContent = '🟢'; bomb.style.opacity = '1'; }
    }
    const btn = document.getElementById('tc-btn-serie-' + ejIdx);
    if (btn) {
      const match = btn.getAttribute('onclick') && btn.getAttribute('onclick').match(/,(\d+)\)$/);
      const totalSeries = match ? parseInt(match[1]) : 3;
      if (completadas >= totalSeries) {
        btn.textContent = '🏆 ¡Ejercicio completado!';
        btn.style.background = '#1a3a1a';
        btn.style.color = '#4caf50';
        btn.disabled = true;
      } else if (completadas > 0) {
        btn.textContent = '✅ Serie ' + (completadas+1) + ' de ' + totalSeries;
      }
    }
  });
  Object.keys(_tcCardioCompletado).forEach(ci => {
    if (_tcCardioCompletado[ci]) {
      const btn = document.getElementById('tc-cardio-btn-' + ci);
      if (btn) {
        btn.textContent = '☑️ Completado — tocar para deshacer';
        btn.style.background = '#0a1a0a';
        btn.style.color = '#4caf50';
        btn.style.border = '1px solid #4caf50';
      }
    }
  });
  tcInyectarPesos();
  }, 50);
}

let _tcTimer = null;
let _tcToast = null;

function tcFechaHoy() {
  const h = new Date();
  return h.getFullYear()+'-'+(h.getMonth()+1)+'-'+h.getDate();
}

function tcGuardarProgreso() {
  const uid = (_tcUsuario && _tcUsuario.id) || 'x';
  const key = 'tc-progreso-' + uid + '-' + tcFechaHoy() + '-' + (_tcDia||'');
  localStorage.setItem(key, JSON.stringify({
    series: _tcSeriesCompletadas,
    seriesFallidas: _tcSeriesFallidas,
    cardio: _tcCardioCompletado
  }));
}

function tcCargarProgreso() {
  const uid = (_tcUsuario && _tcUsuario.id) || 'x';
  const key = 'tc-progreso-' + uid + '-' + tcFechaHoy() + '-' + (_tcDia||'');
  try {
    const d = JSON.parse(localStorage.getItem(key));
    if (d) {
      _tcSeriesCompletadas = d.series || {};
      _tcSeriesFallidas = d.seriesFallidas || {};
      _tcCardioCompletado = d.cardio || {};
    }
  } catch(e) {}
}

function tcSerie(ejIdx, descanso, totalSeries) {
  if (!localStorage.getItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x'))) tcIniciarRutina();
  const completadas = _tcSeriesCompletadas[ejIdx] || 0;
  if (completadas >= totalSeries) return;
  const bomb = document.getElementById('tc-bomb-' + ejIdx + '-' + completadas);
  if (bomb) { bomb.textContent = '🟢'; bomb.style.opacity = '1'; bomb.style.transform = 'scale(1.3)'; setTimeout(()=>{bomb.style.transform='scale(1)'},300); }
  _tcSeriesCompletadas[ejIdx] = completadas + 1;
  tcGuardarProgreso();
  // Log cronológico
  const _ejNombre = (_tcEjercicios && _tcEjercicios[ejIdx]) ? (_tcEjercicios[ejIdx].nombre || 'Ejercicio') : 'Ejercicio';
  _tcLog.push({tipo:'serie', ejIdx, serieNum: completadas + 1, nombre: _ejNombre, ts: Date.now()});
  localStorage.setItem('tc-log-' + ((_tcUsuario && _tcUsuario.id) || 'x') + '-' + tcFechaHoy() + '-' + (_tcDia||''), JSON.stringify(_tcLog));
  const nuevas = _tcSeriesCompletadas[ejIdx];
  const btn = document.getElementById('tc-btn-serie-' + ejIdx);
  if (nuevas >= totalSeries) {
    btn.textContent = '🏆 ¡Ejercicio completado!';
    btn.style.background = '#1a3a1a';
    btn.style.color = '#4caf50';
    btn.disabled = true;
    setTimeout(() => {
      const btns = document.querySelectorAll('[id^="tc-btn-serie-"]');
      if (Array.from(btns).every(b => b.disabled) && btns.length > 0) {
        tcPararTimer();
        tcFelicitacion();
      }
    }, 300);
  } else {
    btn.textContent = '✅ Serie ' + (nuevas+1) + ' de ' + totalSeries;
  }
  if (_tcTimer) clearInterval(_tcTimer);
  if (_tcToast) _tcToast.remove();
  let seg = descanso;
  if (!seg || seg <= 0) return;
  _tcToast = document.createElement('div');
  _tcToast.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px';
  _tcToast.innerHTML = '<div style="font-size:13px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:2px">⏱ Descanso</div><div id="tc-timer-txt" style="font-size:80px;font-weight:900;color:#e31e24;font-family:monospace;line-height:1">' + seg + '</div><div style="font-size:13px;color:var(--texto-medio)">segundos</div><button onclick="tcPararTimer()" style="margin-top:12px;background:#1a1a1a;border:1px solid #333;border-radius:12px;color:var(--texto-medio);font-size:13px;font-weight:700;padding:10px 30px;cursor:pointer">■ Saltar descanso</button>';
  document.body.appendChild(_tcToast);
  _tcTimer = setInterval(() => {
    seg--;
    const txt = document.getElementById('tc-timer-txt');
    if (seg <= 0) {
      clearInterval(_tcTimer);
      dtSonarEvento('timer','fin');
      if (_tcToast) { _tcToast.style.borderColor='#4caf50'; _tcToast.innerHTML='<div style="font-size:20px;font-weight:900;color:#4caf50;text-align:center">✅ ¡A la siguiente serie!</div>'; setTimeout(()=>{if(_tcToast){_tcToast.remove();_tcToast=null;}},2000); }
    } else {
      if (txt) txt.textContent = seg;
    }
  }, 1000);
}

function tcCardioHecho(ci) {
  if (!localStorage.getItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x'))) tcIniciarRutina();
  const btn = document.getElementById('tc-cardio-btn-' + ci);
  if (!btn) return;
  if (_tcCardioCompletado[ci]) {
    _tcCardioCompletado[ci] = false;
    btn.textContent = '✅ Cardio realizado';
    btn.style.background = '#1a0000';
    btn.style.color = '#e31e24';
    btn.style.border = '1px solid #e31e24';
  } else {
    _tcCardioCompletado[ci] = true;
    btn.textContent = '☑️ Completado — tocar para deshacer';
    // Log cronológico
    const _cxNombre = (_tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].cardio && _tcRutina[_tcDia].cardio[ci]) ? (_tcRutina[_tcDia].cardio[ci].momento || 'Cardio') : 'Cardio';
    _tcLog.push({tipo:'cardio', ci, nombre: _cxNombre, ts: Date.now()});
    localStorage.setItem('tc-log-' + ((_tcUsuario && _tcUsuario.id) || 'x') + '-' + tcFechaHoy() + '-' + (_tcDia||''), JSON.stringify(_tcLog));
    btn.style.background = '#0a1a0a';
    btn.style.color = '#4caf50';
    btn.style.border = '1px solid #4caf50';
    // Verificar si toda la rutina está completa
    setTimeout(() => {
      const seriesBtns = document.querySelectorAll('[id^="tc-btn-serie-"]');
      const cardiosBtns = document.querySelectorAll('[id^="tc-cardio-btn-"]');
      const seriesOk = Array.from(seriesBtns).every(b => b.disabled);
      const cardiosOk = Array.from(cardiosBtns).every(b => b.disabled || b.textContent.includes('completado') || b.textContent.includes('Completado'));
      const total = seriesBtns.length + cardiosBtns.length;
      if (seriesOk && cardiosOk && total > 0) tcFelicitacion();
    }, 300);
  }
  tcGuardarProgreso();
}


let _tcTimerRutina = null;

function tcIniciarRutina() {
  const _timerKey = 'tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x');
  if (localStorage.getItem(_timerKey)) return;
  localStorage.setItem(_timerKey, Date.now());
  tcMostrarBannerTimer();
  const btn = document.getElementById('tc-btn-iniciar-rutina');
  if (btn) { btn.textContent = '✅ Rutina en curso'; btn.style.color = '#4caf50'; btn.style.border = '1px solid #4caf50'; }
}

function tcDetenerRutina() {
  const btns = document.querySelectorAll('[id^="tc-btn-serie-"]');
  const cardiosBtnsInc = document.querySelectorAll('[id^="tc-cardio-btn-"]');
  const incompletos = Array.from(btns).filter(b => !b.disabled).length + Array.from(cardiosBtnsInc).filter(b => !b.disabled && !b.textContent.includes('completado') && !b.textContent.includes('Completado')).length;
  if (incompletos > 0) {
    const div = document.createElement('div');
    div.id = 'tc-confirm-finalizar';
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:30px';
    div.innerHTML = '<div style="font-size:48px">⚠️</div><div style="font-size:16px;font-weight:900;color:#e31e24;text-align:center;line-height:1.6">Estás finalizando la rutina sin completar ' + incompletos + ' ejercicio' + (incompletos>1?'s':'') + '.<br><br>¿Tienes una emergencia o solo estás siendo mediocre con tus objetivos?</div><div style="display:flex;gap:12px;margin-top:8px;width:100%"><button onclick="tcConfirmarFinalizar()" style="flex:1;padding:12px;border-radius:10px;border:1px solid #e31e24;background:#1a0000;color:#e31e24;font-size:14px;font-weight:700;cursor:pointer">Sí, finalizar</button><button onclick="document.getElementById(&quot;tc-confirm-finalizar&quot;).remove()" style="flex:1;padding:12px;border-radius:10px;border:1px solid #4caf50;background:#0a1a0a;color:#4caf50;font-size:14px;font-weight:700;cursor:pointer">No, sigo</button></div>';
    document.body.appendChild(div);
    return;
  }
  tcConfirmarFinalizar();
}

function tcConfirmarFinalizar() {
  const conf = document.getElementById('tc-confirm-finalizar');
  if (conf) conf.remove();
  tcGuardarPesos();
  tcGuardarPesos();

  // Calcular resumen
  const btns = document.querySelectorAll('[id^="tc-btn-serie-"]');
  const cardiosBtnsCheck = document.querySelectorAll('[id^="tc-cardio-btn-"]');
  const seriesCompletadas = Array.from(btns).filter(b => b.disabled).length;
  const cardiosCompletados = Array.from(cardiosBtnsCheck).filter(b => b.disabled || b.textContent.includes('completado') || b.textContent.includes('Completado')).length;
  const completados = seriesCompletadas + cardiosCompletados;
  const totalEjercicios = btns.length + cardiosBtnsCheck.length;
  const faltantes = totalEjercicios - completados;
  const seriesHechas = Object.values(_tcSeriesCompletadas).reduce((a,b)=>a+parseInt(b||0),0);
  const totalSeries = Array.from(btns).reduce((acc,b) => {
    const m = b.getAttribute('onclick') && b.getAttribute('onclick').match(/,(\d+)\)$/);
    return acc + (m ? parseInt(m[1]) : 0);
  }, 0);
  const seriesFaltantes = totalSeries - seriesHechas;
  const cardiosBtns = document.querySelectorAll('[id^="tc-cardio-btn-"]');
  const cardiosHechos = Array.from(cardiosBtns).filter(b => b.disabled || b.textContent.includes('completado')).length;
  const cardioTotal = cardiosBtns.length;
  // Calcular minutos totales de cardio completado
  let minutosCardio = 0;
  cardiosBtns.forEach((b, ci) => {
    if (b.disabled || b.textContent.includes('completado')) {
      const cx = _tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].cardio && _tcRutina[_tcDia].cardio[ci];
      if (cx && cx.tiempo) minutosCardio += parseInt(cx.tiempo) || 0;
    }
  });
  const timerInicio = parseInt(localStorage.getItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x'))) || 0;
  const tiempoSeg = timerInicio ? Math.floor((Date.now() - timerInicio) / 1000) : 0;
  const hh = String(Math.floor(tiempoSeg/3600)).padStart(2,'0');
  const mm = String(Math.floor((tiempoSeg%3600)/60)).padStart(2,'0');
  const ss = String(tiempoSeg%60).padStart(2,'0');
  const completo = faltantes === 0;

  // Guardar en localStorage
  const uid = (_tcUsuario && _tcUsuario.id) || 'x';
  const resumen = {
    ejercicios: totalEjercicios,
    ejerciciosHechos: completados,
    series: totalSeries,
    seriesHechas,
    cardios: cardiosHechos,
    cardioTotal,
    minutosCardio,
    tiempo: tiempoSeg,
    completo,
    fecha: tcFechaHoy()
  };
  localStorage.setItem('tc-rutina-completa-' + uid + '-' + tcFechaHoy(), JSON.stringify(resumen));

  // Enviar reporte al chat
  if (_tcUsuario && _tcUsuario.id) {
    const uid2 = _tcUsuario.id;
    const rid = 'rep-' + Date.now();

    // Detalle por ejercicio
    let detalleRows = '';
    (_tcEjercicios || []).forEach((ej, i) => {
      const totalS = parseInt(ej.series) || 3;
      const hechas = parseInt(_tcSeriesCompletadas[i]) || 0;
      const pct = Math.round(hechas / totalS * 100);
      const bars = Array.from({length: totalS}, (_, s) => {
        if (s >= hechas) return '⭕';
        return _tcSeriesFallidas[i + '-' + s] ? '🟠' : '🟢';
      }).join('');
      detalleRows += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #2a2a2a">'
        + '<div><div style="font-size:12px;font-weight:700;color:#fff">' + (ej.nombre||'Ejercicio') + '</div>'
        + '<div style="font-size:10px;color:#aaaaaa;margin-top:1px">' + (ej.grupo||'') + (ej.reps ? ' · ' + ej.reps + ' reps' : '') + (ej.rir ? ' · RIR ' + ej.rir : '') + '</div></div>'
        + '<div style="text-align:right"><div style="font-size:13px;letter-spacing:2px">' + bars + '</div>'
        + '<div style="font-size:10px;color:' + (pct===100?'#4caf50':'#e31e24') + ';font-weight:700">' + hechas + '/' + totalS + ' series</div></div>'
        + '</div>';
    });

    // Cardio detalle
    let cardioRows = '';
    if (_tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].cardio) {
      _tcRutina[_tcDia].cardio.forEach((cx, ci) => {
        const hecho = !!_tcCardioCompletado[ci];
        cardioRows += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #2a2a2a">'
          + '<div><div style="font-size:12px;font-weight:700;color:#fff">' + (cx.momento||'Cardio') + '</div>'
          + '<div style="font-size:10px;color:#aaaaaa">' + (cx.ejercicio||'') + (cx.tiempo ? ' · ' + cx.tiempo + ' min' : '') + '</div></div>'
          + '<div style="font-size:13px">' + (hecho ? '🟢 Hecho' : '⭕ No hecho') + '</div>'
          + '</div>';
      });
    }

    const resumenLinea = (completo ? '🏆 Rutina completada' : '⚠️ Rutina incompleta')
      + ' · ' + completados + '/' + totalEjercicios + ' ejercicios'
      + ' · ' + seriesHechas + '/' + totalSeries + ' series'
      + (tiempoSeg > 0 ? ' · ⏱ ' + hh + ':' + mm + ':' + ss : '')
      + ' · 📅 ' + tcFechaHoy();

    const tituloDia = (_tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].recordatorio) ? _tcRutina[_tcDia].recordatorio : '';
    const html = '<div style="font-family:sans-serif;max-width:340px">'
      // Cabecera
      + '<div style="background:' + (completo?'#0a1a0a':'#1a0a00') + ';border:1px solid ' + (completo?'#4caf50':'#e31e24') + ';border-radius:12px;padding:12px 14px;margin-bottom:6px">'
      + (tituloDia ? '<div style="font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;opacity:0.85">🏷️ ' + tituloDia + '</div>' : '')
      + '<div style="font-size:15px;font-weight:900;color:' + (completo?'#4caf50':'#ff9800') + ';margin-bottom:6px">' + (completo?'🏆 Rutina completada':'⚠️ Rutina incompleta') + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '<div style="background:rgba(0,0,0,0.06);border-radius:8px;padding:6px 10px;text-align:center;flex:1"><div style="font-size:16px;font-weight:900;color:#4caf50">' + completados + '/' + totalEjercicios + '</div><div style="font-size:9px;color:#aaaaaa;text-transform:uppercase">Ejercicios</div></div>'
      + '<div style="background:rgba(0,0,0,0.06);border-radius:8px;padding:6px 10px;text-align:center;flex:1"><div style="font-size:16px;font-weight:900;color:#4caf50">' + seriesHechas + '/' + totalSeries + '</div><div style="font-size:9px;color:#aaaaaa;text-transform:uppercase">Series</div></div>'
      + (cardiosHechos > 0 ? '<div style="background:rgba(0,0,0,0.06);border-radius:8px;padding:6px 10px;text-align:center;flex:1"><div style="font-size:16px;font-weight:900;color:#4caf50">' + cardiosHechos + '/' + cardioTotal + '</div><div style="font-size:9px;color:#aaaaaa;text-transform:uppercase">Cardio</div></div>' : '')
      + (tiempoSeg > 0 ? '<div style="background:rgba(0,0,0,0.06);border-radius:8px;padding:6px 10px;text-align:center;flex:1"><div style="font-size:14px;font-weight:900;color:#e31e24;font-family:monospace">' + hh+':'+mm+':'+ss + '</div><div style="font-size:9px;color:#aaaaaa;text-transform:uppercase">Tiempo</div></div>' : '')
      + '</div></div>'
      // Botón desplegable
      + '<div onclick="(function(){var d=document.getElementById(\'' + rid + '\');d.style.display=d.style.display===\'none\'?\'block\':\'none\';})()" style="cursor:pointer;background:#7a1015;border:1px solid #a32028;border-radius:10px;padding:8px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
      + '<span style="font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:1px">📊 Ver detalle</span>'
      + '<span style="color:#fff;font-size:14px">▾</span></div>'
      // Detalle desplegable
      + '<div id="' + rid + '" style="display:none;background:#7a1015;border:1px solid #a32028;border-radius:10px;padding:10px 14px;margin-bottom:4px">'
      + detalleRows
      + (cardioRows ? '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:10px 0 4px">🏃 Cardio</div>' + cardioRows : '')
      + (_tcLog.length > 0 ? (()=>{
          const inicio = parseInt(localStorage.getItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x'))) || Date.now();
          let crono = '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:10px 0 4px">🕐 Cronología</div>';
          _tcLog.forEach(ev => {
            const seg = Math.floor((ev.ts - inicio) / 1000);
            const mm = String(Math.floor(seg/60)).padStart(2,'0');
            const ss = String(seg%60).padStart(2,'0');
            const icon = ev.tipo === 'cardio' ? '🏃' : '💪';
            const label = (() => {
              if (ev.tipo === 'cardio') return ev.nombre;
              const uid = ((_tcUsuario && _tcUsuario.id) || 'x');
              const nomEj = (ev.nombre||'').replace(/[^a-zA-Z0-9]/g,'_');
              const key = 'tc-pesos-' + uid + '-' + nomEj;
              try {
                const data = JSON.parse(localStorage.getItem(key)||'{}');
                const peso = data.pesos && data.pesos[ev.serieNum - 1];
                const unidad = data.unidad || 'kg';
                const pesoStr = peso ? ' (' + peso + ' ' + unidad + ')' : '';
                return ev.nombre + ' — Serie ' + ev.serieNum + pesoStr;
              } catch(e) { return ev.nombre + ' — Serie ' + ev.serieNum; }
            })();
            crono += '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #2a2a2a">'
              + '<div style="font-size:11px;color:#e0e0e0">' + icon + ' ' + label + '</div>'
              + '<div style="font-size:11px;font-weight:700;color:#aaaaaa;font-family:monospace">' + mm + ':' + ss + '</div>'
              + '</div>';
          });
          return crono;
        })() : '')
      + '</div>'
      + '<div style="font-size:10px;color:#999;text-align:right;padding:2px 4px">📅 ' + tcFechaHoy() + '</div>'
      + '</div>';

    const _payload = JSON.stringify({autor: 'cliente', tipo: 'reporte', contenido: html});
    if (navigator.onLine) {
      fetch('/api/chat/' + uid2, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: _payload
      }).catch(() => {
        const _cola = JSON.parse(localStorage.getItem('tc-sync-cola') || '[]');
        _cola.push({ url: '/api/chat/' + uid2, payload: _payload, ts: Date.now() });
        localStorage.setItem('tc-sync-cola', JSON.stringify(_cola));
      });
    } else {
      const _cola = JSON.parse(localStorage.getItem('tc-sync-cola') || '[]');
      _cola.push({ url: '/api/chat/' + uid2, payload: _payload, ts: Date.now() });
      localStorage.setItem('tc-sync-cola', JSON.stringify(_cola));
      const t = document.createElement('div');
      t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a2a3a;border:1px solid #2196f3;color:#2196f3;font-size:11px;font-weight:700;padding:8px 16px;border-radius:20px;z-index:99999';
      t.textContent = 'Informe guardado. Se enviara cuando vuelva el internet.';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 4000);
    }
  }

  // Registrar sesión si completó al menos algo
  if (completados > 0 && _tcUsuario && _tcUsuario.id) {
    fetch('/api/usuarios/' + _tcUsuario.id + '/sesion', {method:'POST'}).catch(()=>{});
  }

  // Detener timer
  localStorage.removeItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x'));
  if (_tcTimerRutina) clearInterval(_tcTimerRutina);
  const banner = document.getElementById('tc-banner-timer');
  if (banner) banner.style.display = 'none';

  // Mostrar pantalla resumen
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:30px;overflow-y:auto';
  let inner = '';
  if (completo) {
    inner += '<div style="font-size:64px">🏆</div>';
    inner += '<div style="font-size:22px;font-weight:900;color:#4caf50;text-align:center">¡Rutina completada!</div>';
    inner += '<div style="font-size:13px;color:#888;text-align:center;line-height:1.6">Cada sesión te acerca más a quien quieres ser. 💪</div>';
  } else {
    inner += '<div style="font-size:64px">⚠️</div>';
    inner += '<div style="font-size:22px;font-weight:900;color:#ff9800;text-align:center">Rutina incompleta</div>';
    inner += '<div style="font-size:13px;color:#888;text-align:center;line-height:1.6">La próxima vez da el 100%. Tu cuerpo lo agradecerá.</div>';
  }
  inner += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:16px;width:100%;max-width:340px;margin-top:8px">';
  inner += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">📋 Resumen</div>';
  inner += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  inner += '<div style="background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:900;color:#4caf50">' + completados + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Ejercicios hechos</div></div>';
  if (faltantes > 0) {
    inner += '<div style="background:#1a0000;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:900;color:#e31e24">' + faltantes + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Ejercicios faltantes</div></div>';
  }
  inner += '<div style="background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:900;color:#4caf50">' + seriesHechas + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Series hechas</div></div>';
  if (seriesFaltantes > 0) {
    inner += '<div style="background:#1a0000;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:900;color:#e31e24">' + seriesFaltantes + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Series faltantes</div></div>';
  }
  if (cardiosHechos > 0) {
    inner += '<div style="background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:900;color:#4caf50">' + cardiosHechos + '/' + cardioTotal + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Cardios</div></div>';
    if (minutosCardio > 0) inner += '<div style="background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:20px;font-weight:900;color:#e31e24">' + minutosCardio + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Min cardio</div></div>';
  }
  if (tiempoSeg > 0) {
    inner += '<div style="background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:900;color:#e31e24;font-family:monospace">' + hh+':'+mm+':'+ss + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Tiempo</div></div>';
  }
  inner += '</div></div>';
  inner += '<button onclick="this.parentElement.remove();tcMostrarResumenFinal()" style="margin-top:8px;background:' + (completo?'#1a3a1a':'#1a1a00') + ';border:1px solid ' + (completo?'#4caf50':'#ff9800') + ';border-radius:12px;color:' + (completo?'#4caf50':'#ff9800') + ';font-size:14px;font-weight:700;padding:12px 40px;cursor:pointer">' + (completo?'💪 ¡Listo!':'👊 Entendido') + '</button>';
  div.innerHTML = inner;
  document.body.appendChild(div);
}

function tcFelicitacion() {
  tcDetenerRutina();
}


function tcMostrarResumenFinal() {
  // Recargar la tab de rutina para mostrar pantalla de completado
  const cont = document.getElementById('tc-contenido');
  if (!cont) return;
  const uid = (_tcUsuario && _tcUsuario.id) || 'x';
  const resumenStr = localStorage.getItem('tc-rutina-completa-' + uid + '-' + tcFechaHoy());
  if (!resumenStr) return;
  try {
    const r = JSON.parse(resumenStr);
    const hh = String(Math.floor(r.tiempo/3600)).padStart(2,'0');
    const mm2 = String(Math.floor((r.tiempo%3600)/60)).padStart(2,'0');
    const ss = String(r.tiempo%60).padStart(2,'0');
    let html2 = '<div style="text-align:center;padding:30px 20px">';
    html2 += '<div style="font-size:64px;margin-bottom:12px">' + (r.completo?'🏆':'⚠️') + '</div>';
    html2 += '<div style="font-size:20px;font-weight:900;color:' + (r.completo?'#4caf50':'#ff9800') + ';margin-bottom:8px">' + (r.completo?'¡Rutina completada!':'Rutina finalizada') + '</div>';
    html2 += '<div style="font-size:13px;color:#888;margin-bottom:24px;line-height:1.6">' + (r.completo?'Cada sesión te acerca más a quien quieres ser. 💪':'Mañana es una nueva oportunidad.') + '</div>';
    html2 += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:16px;text-align:left;margin-bottom:12px">';
    html2 += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">📋 Resumen de hoy</div>';
    html2 += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    html2 += '<div style="flex:1;min-width:80px;background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:900;color:#4caf50">' + (r.ejerciciosHechos||r.ejercicios) + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Ejercicios</div></div>';
    if (r.ejercicios - (r.ejerciciosHechos||r.ejercicios) > 0) html2 += '<div style="flex:1;min-width:80px;background:#1a0000;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:900;color:#e31e24">' + (r.ejercicios-(r.ejerciciosHechos||r.ejercicios)) + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Faltantes</div></div>';
    html2 += '<div style="flex:1;min-width:80px;background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:900;color:#4caf50">' + (r.seriesHechas||r.series) + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Series</div></div>';
    if (r.cardios > 0) html2 += '<div style="flex:1;min-width:80px;background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:900;color:#4caf50">' + r.cardios + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Cardios</div></div>';
    if (r.tiempo > 0) html2 += '<div style="flex:1;min-width:80px;background:#1a1a1a;border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:900;color:#e31e24;font-family:monospace">' + hh+':'+mm2+':'+ss + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Tiempo</div></div>';
    html2 += '</div></div>';
    html2 += '<div style="font-size:11px;color:#333;margin-top:8px">' + r.fecha + '</div>';
    html2 += '</div>';
    var _dcont = document.getElementById('tc-dia-contenido');
    if (_dcont) { _dcont.innerHTML = html2; } else { cont.innerHTML = html2; }
    localStorage.setItem('tc-estado-' + ((_tcUsuario && _tcUsuario.id) || 'x'), 'resumen');
  } catch(e) {}
}

function tcMostrarBannerTimer() {
  const banner = document.getElementById('tc-banner-timer');
  if (!banner) return;
  banner.style.display = 'flex';
  if (_tcTimerRutina) clearInterval(_tcTimerRutina);
  _tcTimerRutina = setInterval(() => {
    const inicio = parseInt(localStorage.getItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x')));
    if (!inicio) { clearInterval(_tcTimerRutina); return; }
    const seg = Math.floor((Date.now() - inicio) / 1000);
    const h = String(Math.floor(seg/3600)).padStart(2,'0');
    const m = String(Math.floor((seg%3600)/60)).padStart(2,'0');
    const s = String(seg%60).padStart(2,'0');
    const txt = document.getElementById('tc-timer-rutina-txt');
    if (txt) txt.textContent = h+':'+m+':'+s;
  }, 1000);
}

// Arrancar banner si hay timer activo al cargar


// Polling mensajes nuevos cada 15 segundos
let _tcPollingBadge = null;
function tcSyncCola() {
  const cola = JSON.parse(localStorage.getItem('tc-sync-cola') || '[]');
  if (cola.length === 0) return;
  const pendiente = cola[0];
  fetch(pendiente.url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: pendiente.payload
  }).then(r => {
    if (r.ok) {
      const nuevaCola = JSON.parse(localStorage.getItem('tc-sync-cola') || '[]');
      nuevaCola.shift();
      localStorage.setItem('tc-sync-cola', JSON.stringify(nuevaCola));
      if (nuevaCola.length > 0) setTimeout(tcSyncCola, 2000);
      else {
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a3a1a;border:1px solid #4caf50;color:#4caf50;font-size:11px;font-weight:700;padding:8px 16px;border-radius:20px;z-index:99999';
        t.textContent = 'Informe enviado al entrenador';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
      }
    }
  }).catch(() => {});
}
window.addEventListener('online', () => {
  setTimeout(tcSyncCola, 1500);
  const banner = document.getElementById('tc-offline-banner');
  if (banner) banner.remove();
});

function tcIniciarPollingBadge() {
  if (_tcPollingBadge) clearInterval(_tcPollingBadge);
  _tcPollingBadge = setInterval(() => {
    if (_tcUsuario) tcVerificarMensajesNuevos();
  }, 15000);
}
tcIniciarPollingBadge();

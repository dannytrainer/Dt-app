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
// ---- FIN TIMER RUTINA ----



function tcScrollNotas() {
  const cont = document.getElementById("tc-contenido");
  if (cont) cont.scrollTop = cont.scrollHeight;
  const notas = document.getElementById("tc-notas-generales");
  if (!notas) return;
  let visible = true;
  let count = 0;
  const blink = setInterval(() => {
    visible = !visible;
    notas.style.border = visible ? "3px solid #e31e24" : "3px solid transparent";
    notas.style.boxShadow = visible ? "0 0 14px #e31e24" : "none";
    count++;
    if (count >= 6) {
      clearInterval(blink);
      notas.style.border = "1px dashed #2a2a2a";
      notas.style.boxShadow = "none";
    }
  }, 300);
}

function tcDeshacerSerie(ejIdx, serieIdx) {
  const completadas = _tcSeriesCompletadas[ejIdx] || 0;
  // Solo permite tocar la ultima serie completada
  if (serieIdx !== completadas - 1) return;
  const bomb = document.getElementById('tc-bomb-' + ejIdx + '-' + serieIdx);
  const key = ejIdx + '-' + serieIdx;
  const esFallida = !!_tcSeriesFallidas[key];

  if (!esFallida) {
    _tcSeriesFallidas[key] = true;
    if (bomb) { bomb.textContent = '\uD83D\uDFE0'; bomb.style.opacity = '1'; }
    tcGuardarProgreso();
    return;
  }

  delete _tcSeriesFallidas[key];
  if (bomb) { bomb.textContent = '⭕'; bomb.style.opacity = '0.25'; }
  _tcSeriesCompletadas[ejIdx] = completadas - 1;
  const btn = document.getElementById('tc-btn-serie-' + ejIdx);
  if (btn) {
    const match = btn.getAttribute('onclick') && btn.getAttribute('onclick').match(/,(\d+)\)$/);
    const totalSeries = match ? parseInt(match[1]) : 3;
    btn.textContent = '✅ Serie ' + completadas + ' de ' + totalSeries;
    btn.style.background = '#e31e24';
    btn.style.color = '#fff';
    btn.disabled = false;
  }
  tcGuardarProgreso();
}

function tcPararTimer() {
  if (_tcTimer) clearInterval(_tcTimer);
  if (_tcToast) { _tcToast.remove(); _tcToast = null; }
}

function tcRenderAlimentacion(cont) {
  if (!_tcAlim || !_tcAlim.plan_generado) {
    cont.innerHTML = `<div style="text-align:center;padding:40px 20px">
      <div style="font-size:48px;margin-bottom:12px">🍽️</div>
      <div style="font-size:16px;font-weight:700;color:var(--texto-medio)">Plan nutricional</div>
      <div style="font-size:13px;color:#444;margin-top:6px">Tu entrenador aún no ha generado tu plan</div>
    </div>`;
    return;
  }

  cont.innerHTML = '<div style="text-align:center;padding:40px 20px"><div style="font-size:32px">⏳</div><div style="font-size:13px;color:var(--texto-medio);margin-top:8px">Cargando planes...</div></div>';

  var id = _tcUsuario && _tcUsuario.id;
  if (!id) return;

  fetch('/api/alimentacion/' + id + '/semana')
    .then(function(r) { return r.json(); })
    .then(function(semana) {
      if (!semana || !Array.isArray(semana) || semana.length === 0) {
        cont.innerHTML = '<div style="text-align:center;padding:40px 20px"><div style="font-size:13px;color:var(--texto-medio)">No hay planes disponibles</div></div>';
        return;
      }
      window._tcPlanSemana = semana;
      tcRenderPlanDia(cont, semana, 0); 
    })
    .catch(function() {
      cont.innerHTML = '<div style="text-align:center;padding:40px 20px"><div style="font-size:13px;color:#e31e24">Error cargando el plan</div></div>';
    });
}

function tcRenderPlanDia(cont, semana, idx) {
  var letras = ['A','B','C','D','E','F','G'];
  var dia = semana[idx];
  var t = dia.totales;

  var tabs = '<div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px;scrollbar-width:none;-ms-overflow-style:none">';
  semana.forEach(function(d, i) {
    var activo = i === idx;
    if (!tcEsPremium() && i >= 2) {
      tabs += '<button onclick="tcMostrarPremium()" style="min-width:48px;padding:6px 8px;border-radius:8px;border:none;background:#1a1a1a;color:#e31e24;font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0">⭐</button>';
    } else {
      tabs += '<button onclick="tcRenderPlanDia(document.getElementById(\'tc-contenido\'),window._tcPlanSemana,' + i + ')" style="min-width:48px;padding:6px 8px;border-radius:8px;border:none;background:' + (activo ? '#e31e24' : '#1a1a1a') + ';color:' + (activo ? '#fff' : 'var(--texto-medio)') + ';font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0">Plan ' + letras[i] + '</button>';
    }
  });
  tabs += '</div>';

  var totales = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">';
  totales += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:var(--texto)">' + t.calorias + '</div><div style="font-size:10px;color:var(--texto-medio);text-transform:uppercase">🔥 Kcal/día</div></div>';
  totales += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#e31e24">' + t.proteina + 'g</div><div style="font-size:10px;color:var(--texto-medio);text-transform:uppercase">🥩 Proteína</div></div>';
  totales += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#f0a500">' + t.carbohidratos + 'g</div><div style="font-size:10px;color:var(--texto-medio);text-transform:uppercase">🌾 Carbos</div></div>';
  totales += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#4caf50">' + t.grasas + 'g</div><div style="font-size:10px;color:var(--texto-medio);text-transform:uppercase">🥑 Grasas</div></div>';
  totales += '</div>';

  var comidas = '';
  dia.comidas.forEach(function(comida) {
    var mr = comida.macros_reales;
    var ico = comida.nombre.indexOf('Desayuno')>=0?'🌅':comida.nombre.indexOf('Snack')>=0?'🍎':comida.nombre.indexOf('Almuerzo')>=0?'🍱':comida.nombre.indexOf('Cena')>=0?'🌙':comida.nombre.indexOf('Pre')>=0?'⚡':'🍽️';
    var h = '<div style="background:var(--card);border:1px solid var(--borde);border-radius:14px;margin-bottom:12px;overflow:hidden">';
    h += '<div style="background:var(--card2);padding:10px 14px;display:flex;justify-content:space-between;align-items:center">';
    h += '<div style="font-size:14px;font-weight:700;color:var(--texto)">' + ico + ' ' + comida.nombre + '</div>';
    h += '<div style="font-size:12px;color:#e31e24;font-weight:700">' + Math.round(mr.kcal) + ' kcal</div></div>';
    h += '<div style="padding:10px 14px">';
    comida.alimentos.forEach(function(a) {
      h += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #2a2a2a">';
      var colorAlim = document.body.classList.contains('modo-claro') ? '#111' : 'var(--texto-suave)';
    var colorDetalle = document.body.classList.contains('modo-claro') ? '#666' : 'var(--texto-medio)';
    h += '<div style="font-size:13px;color:' + colorAlim + '">' + a.nombre + (a.detalle ? ' <span style="color:' + colorDetalle + ';font-size:11px">(' + a.detalle + ')</span>' : '') + '</div>';
      h += '<div style="font-size:13px;font-weight:700;color:var(--texto)">' + (a.unidad ? a.unidad.texto : a.porcion_g + 'g') + '</div></div>';
    });
    h += '</div></div>';
    comidas += h;
  });

  cont.innerHTML = tabs + totales + comidas;
}
function tcRenderProgreso(cont) {
  cont.innerHTML = '<div style="text-align:center;padding:30px"><div style="font-size:32px">⏳</div></div>';
  const uid = _tcUsuario && _tcUsuario.id;
  if (!uid) return;

  Promise.all([
    fetch('/api/historial/' + uid).then(r=>r.json()).catch(()=>({})),
    fetch('/api/tests/' + uid).then(r=>r.json()).catch(()=>({}))
  ]).then(([hist, tests]) => {
    let html = '';

    const medidas = hist.medidas || [];
    const ultima = medidas[medidas.length - 1];
    if (ultima) {
      html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">';
      html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">📏 Medidas — ' + ultima.fecha + '</div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">';
      [['Cintura','cintura'],['Cadera','cadera'],['Pecho','pecho'],['Brazo','brazo'],['Pierna','pierna'],['Hombros','hombros']].forEach(function(c){
        if (ultima[c[1]]) html += '<div style="background:#1a1a1a;border-radius:8px;padding:8px 12px"><div style="font-size:18px;font-weight:900;color:#fff">' + ultima[c[1]] + '<span style="font-size:10px;color:var(--texto-medio)"> cm</span></div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">' + c[0] + '</div></div>';
      });
      html += '</div>';
      if (ultima.analisis) {
        html += '<div style="display:flex;gap:8px">';
        html += '<div style="flex:1;background:#1a0000;border:1px solid #e31e24;border-radius:8px;padding:8px;text-align:center"><div style="font-size:20px;font-weight:900;color:#e31e24">' + ultima.analisis.pctGrasa + '%</div><div style="font-size:9px;color:var(--texto-medio)">% Grasa</div></div>';
        html += '<div style="flex:1;background:#0a1a0a;border:1px solid #4caf50;border-radius:8px;padding:8px;text-align:center"><div style="font-size:20px;font-weight:900;color:#4caf50">' + ultima.analisis.kgMusculo + ' kg</div><div style="font-size:9px;color:var(--texto-medio)">Músculo</div></div>';
        html += '</div>';
      }
      html += '</div>';
    }

    const registros = tests.registros || [];
    const lastFuerza = registros.slice().reverse().find(function(r){return r.tipo==='fuerza';});
    const lastResist = registros.slice().reverse().find(function(r){return r.tipo==='resist';});
    const lastEspecif = registros.slice().reverse().find(function(r){return r.tipo==='especif';});

    if (lastFuerza) {
      html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">';
      html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">💪 Fuerza — ' + lastFuerza.fecha + '</div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      [['Pecho','pecho'],['Espalda','espalda'],['Femoral','femoral'],['Cuádriceps','cuad']].forEach(function(c){
        if (lastFuerza[c[1]]) {
          var sc = lastFuerza[c[1]].score||0;
          var col = sc>=80?'#4caf50':sc>=60?'#ff9800':'#e31e24';
          html += '<div style="background:#1a1a1a;border-radius:8px;padding:8px 12px"><div style="font-size:16px;font-weight:900;color:#fff">' + lastFuerza[c[1]].kg + 'kg <span style="font-size:11px;color:var(--texto-medio)">x' + lastFuerza[c[1]].reps + '</span></div><div style="font-size:10px;color:' + col + ';font-weight:700">' + sc + 'pts</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">' + c[0] + '</div></div>';
        }
      });
      html += '</div><div style="margin-top:8px;text-align:right;font-size:11px;color:#e31e24;font-weight:700">Score: ' + lastFuerza.scoreTotal + '/100</div></div>';
    }

    if (lastResist) {
      html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">';
      html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">🔄 Resistencia — ' + lastResist.fecha + '</div>';
      html += '<div style="display:flex;gap:8px">';
      [['Pushups','pushups'],['Dominadas','dominadas'],['Sentadilla','sentadilla']].forEach(function(c){
        if (lastResist[c[1]]) {
          var sc = lastResist[c[1]].score||0;
          var col = sc>=80?'#4caf50':sc>=60?'#ff9800':'#e31e24';
          html += '<div style="flex:1;background:#1a1a1a;border-radius:8px;padding:8px;text-align:center"><div style="font-size:18px;font-weight:900;color:#fff">' + lastResist[c[1]].valor + '</div><div style="font-size:10px;color:' + col + ';font-weight:700">' + sc + 'pts</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">' + c[0] + '</div></div>';
        }
      });
      html += '</div><div style="margin-top:8px;text-align:right;font-size:11px;color:#e31e24;font-weight:700">Score: ' + lastResist.scoreTotal + '/100</div></div>';
    }

    if (lastEspecif) {
      html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">';
      html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">⚡ Específico — ' + lastEspecif.fecha + '</div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      [['Cooper','cooper','m'],['Léger','leger','niv'],['Sit&Reach','sitreach','cm'],['Hombro','hombro','cm'],['Salto L','saltoL','cm'],['Salto V','saltoV','cm'],['Vel 30m','vel30','s']].forEach(function(c){
        if (lastEspecif[c[1]]) {
          var sc = lastEspecif[c[1]].score||0;
          var col = sc>=80?'#4caf50':sc>=60?'#ff9800':'#e31e24';
          html += '<div style="background:#1a1a1a;border-radius:8px;padding:8px 12px"><div style="font-size:16px;font-weight:900;color:#fff">' + lastEspecif[c[1]].valor + '<span style="font-size:10px;color:var(--texto-medio)"> ' + c[2] + '</span></div><div style="font-size:10px;color:' + col + ';font-weight:700">' + sc + 'pts</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">' + c[0] + '</div></div>';
        }
      });
      html += '</div><div style="margin-top:8px;text-align:right;font-size:11px;color:#e31e24;font-weight:700">Score: ' + lastEspecif.scoreTotal + '/100</div></div>';
    }

    if (!ultima && !lastFuerza && !lastResist && !lastEspecif) {
      html = '<div style="text-align:center;padding:40px 20px"><div style="font-size:48px;margin-bottom:12px">📊</div><div style="font-size:16px;font-weight:700;color:var(--texto-medio)">Sin datos aún</div></div>';
    }

    cont.innerHTML = html;
  });
}

function tcRenderPerfil(cont) {
  const u = _tcUsuario || {};
  const p = u.perfil || {};
  const fotoSrc = u.foto ? ('/' + u.foto) : null;
  const estadoColor = u.estado_pago === 'aldia' ? '#4caf50' : u.estado_pago === 'proximo' ? '#ff9800' : '#e31e24';
  const estadoTxt = u.estado_pago === 'aldia' ? '✅ Al día' : u.estado_pago === 'proximo' ? '⚠️ Próximo' : '🔴 Vencido';

  let html = '<div style="padding:20px 16px 40px">';

  // Foto y nombre
  html += '<div style="text-align:center;margin-bottom:20px">';
  if (fotoSrc) {
    html += '<img src="' + fotoSrc + '" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #e31e24;margin-bottom:10px"/>';
  } else {
    html += '<div style="width:90px;height:90px;border-radius:50%;background:#1a1a1a;border:3px solid #e31e24;display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 10px">👤</div>';
  }
  html += '<div style="font-size:22px;font-weight:900;color:#fff">' + (u.nombre||'') + '</div>';
  html += '<div style="font-size:12px;color:var(--texto-medio);margin-top:2px">' + (u.telefono||'') + '</div>';
  html += '</div>';

  // Datos editables por el cliente
  html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">✏️ Mis datos</div>';
  html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">';

  // Nombre
  html += '<div style="margin-bottom:12px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:4px">Nombre</div>';
  html += '<input id="tc-perfil-nombre" value="' + (u.nombre||'') + '" style="width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px 10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box"></div>';

  // Fecha nacimiento
  html += '<div style="margin-bottom:12px;max-width:100%;overflow:hidden"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:4px">Fecha de nacimiento</div>';
  html += '<input id="tc-perfil-fnac" type="date" value="' + (p.fecha_nacimiento||'') + '" style="width:100%;max-width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px 10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;transform:translateZ(0);-webkit-transform:translateZ(0)"></div>';

  // Estatura
  html += '<div style="margin-bottom:12px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:4px">Estatura (cm)</div>';
  html += '<input id="tc-perfil-altura" type="number" value="' + (p.altura||'') + '" style="width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px 10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box"></div>';

  // Objetivo
  html += '<div style="margin-bottom:4px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:4px">Objetivo</div>';
  html += '<select id="tc-perfil-objetivo" style="width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px 10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box">';
  const objetivos = [['','Seleccionar...'],['perdida','Pérdida de grasa'],['musculo','Ganar músculo'],['rendimiento','Rendimiento deportivo'],['salud','Salud general'],['otro','Otro']];
  objetivos.forEach(o => { html += '<option value="' + o[0] + '"' + (p.etiqueta===o[0]?' selected':'') + '>' + o[1] + '</option>'; });
  html += '</select></div>';
  html += '</div>';

  // Botón guardar datos editables
  html += '<button onclick="tcGuardarPerfilCliente()" style="width:100%;padding:12px;border-radius:10px;border:none;background:#e31e24;color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:16px">💾 Guardar cambios</button>';

  // Datos solo visibles
  html += '<div style="font-size:10px;color:var(--texto-medio);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">📋 Mi plan</div>';
  html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1a1a"><span style="font-size:13px;color:var(--texto-medio)">Tipo</span><span style="font-size:13px;color:#fff;font-weight:700">' + (u.tipo==='asesorado'?'📋 Asesorado':'🏟️ Personalizado') + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a1a1a"><span style="font-size:13px;color:var(--texto-medio)">Pago</span><span style="font-size:13px;font-weight:700;color:' + estadoColor + '">' + estadoTxt + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0"><span style="font-size:13px;color:var(--texto-medio)">Entrenador</span><span style="font-size:13px;color:#fff;font-weight:700" id="informe-nombre-ent"></span></div>';
  html += '</div>';

  // Observaciones (solo lectura)
  if (p.notas) {
    html += '<div style="font-size:10px;color:var(--texto-medio);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">📝 Observaciones del entrenador</div>';
    html += '<div style="background:var(--card);border:1px solid var(--borde);border-radius:14px;padding:14px;margin-bottom:12px"><div style="font-size:12px;color:var(--texto-medio);line-height:1.6">' + p.notas + '</div></div>';
  }

  // Condiciones médicas (solo lectura)
  if (p.condiciones_medicas) {
    html += '<div style="font-size:10px;color:var(--texto-medio);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🏥 Condiciones médicas</div>';
    html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px"><div style="font-size:12px;color:#888;line-height:1.6">' + p.condiciones_medicas + '</div></div>';
  }

  // Preferencias alimentarias (solo lectura)
  if (p.preferencias_alimentarias) {
    html += '<div style="font-size:10px;color:var(--texto-medio);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🥗 Preferencias alimentarias</div>';
    html += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px"><div style="font-size:12px;color:#888;line-height:1.6">' + p.preferencias_alimentarias + '</div></div>';
  }

    html += '<button onclick="cerrarSesionGoogle()" style="width:100%;padding:14px;border-radius:12px;border:1px solid #2a2a2a;background:#111;color:#666;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px">🚪 Cerrar sesión</button>';
  html += '</div>';
  cont.innerHTML = html;
}

function tcGuardarPerfilCliente() {
  const nombre = document.getElementById('tc-perfil-nombre').value.trim();
  const fnac = document.getElementById('tc-perfil-fnac').value;
  const altura = document.getElementById('tc-perfil-altura').value;
  const objetivo = document.getElementById('tc-perfil-objetivo').value;
  const uid = _tcUsuario && _tcUsuario.id;
  if (!uid) return;
  fetch('/api/usuarios/' + uid + '/perfil-cliente', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({nombre, fecha_nacimiento: fnac, altura, etiqueta: objetivo})
  }).then(r=>r.json()).then(data => {
    if (data.ok) {
      _tcUsuario.nombre = nombre;
      if (!_tcUsuario.perfil) _tcUsuario.perfil = {};
      _tcUsuario.perfil.fecha_nacimiento = fnac;
      _tcUsuario.perfil.altura = altura;
      _tcUsuario.perfil.etiqueta = objetivo;
      document.getElementById('tc-nombre-cliente').textContent = nombre;
      toast('✅ Datos guardados');
    }
  }).catch(()=>toast('❌ Error al guardar',false));
}

function tcRenderTools(cont) {
  var html = '';
  html += '<div style="padding:4px 0 16px 0">';
  html += '<div style="font-size:13px;color:#666;margin-bottom:16px;text-align:center;letter-spacing:1px;text-transform:uppercase">Herramientas</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
  html += '<div onclick="tcToolAbrirHerr(&quot;cronometros&quot;)" style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer"><div style="margin-bottom:8px"><img src="/images/icon-cronometro.png" style="width:72px;height:72px;object-fit:contain"></div><div style="font-size:13px;font-weight:700;color:#fff">Cron&oacute;metro</div><div style="font-size:10px;color:var(--texto-medio);margin-top:4px">Series y tiempos</div></div>';
  html += '<div onclick="tcEsPremium()?tcToolAbrirHerr(&apos;temporizadores&apos;):tcMostrarPremium()" style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer"><div style="margin-bottom:8px"><img src="/images/icon-temporizador.png" style="width:72px;height:72px;object-fit:contain"></div><div style="font-size:13px;font-weight:700;color:#fff">Temporizador</div><div style="font-size:10px;color:var(--texto-medio);margin-top:4px">Descansos</div></div>';
  html += '<div onclick="tcToolAbrirHerr(&apos;juegos&apos;)" style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer"><div style="margin-bottom:8px"><img src="/images/icon-juegos.png" style="width:72px;height:72px;object-fit:contain"></div><div style="font-size:13px;font-weight:700;color:#fff">Juegos</div><div style="font-size:10px;color:var(--texto-medio);margin-top:4px">Mientras esperas</div></div>';
  
  html += '<div onclick="tcEsPremium()?tcToolAbrirHerr(&apos;ruleta&apos;):tcMostrarPremium()" style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer"><div style="margin-bottom:8px"><img src="/images/icon-ruleta.png" style="width:72px;height:72px;object-fit:contain"></div><div style="font-size:13px;font-weight:700;color:#fff">Ruleta DT</div><div style="font-size:10px;color:var(--texto-medio);margin-top:4px">Ejercicio aleatorio</div></div>';
  html += '<div onclick="tcEsPremium()?tcToolAbrirHerr(&apos;conversores&apos;):tcMostrarPremium()" style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer"><div style="margin-bottom:8px"><img src="/images/icon-calculadoras.png" style="width:72px;height:72px;object-fit:contain"></div><div style="font-size:13px;font-weight:700;color:#fff">Conversores</div><div style="font-size:10px;color:var(--texto-medio);margin-top:4px">kg &middot; lb &middot; cm &middot; in</div></div>';
  html += '';
  html += '<div onclick="tcToolAbrirHerr(&quot;enciclopedia&quot;)" style="background:#111;border:1px solid #222;border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer;grid-column:1/-1"><div style="margin-bottom:8px"><img src="/images/Enciclopedialogo.png" style="width:56px;height:56px;object-fit:contain;border-radius:12px"></div><div style="font-size:13px;font-weight:700;color:#fff">Enciclopedia</div><div style="font-size:10px;color:var(--texto-medio);margin-top:4px">Ejercicios &middot; T&eacute;cnica &middot; Nutrici&oacute;n</div></div>';
  html += '</div></div>';
  cont.innerHTML = html;
}

function tcToolAbrirHerr(nombre) {
  const cont = document.getElementById('tc-contenido');
  if (!cont) return;

  var volverDestino = window._encDesdeRutina ? 'rutina' : 'tools';
  cont.innerHTML = '<div style="padding:4px 0"><button onclick="window._encDesdeRutina=false;tcTab(\'' + volverDestino + '\')" style="display:flex;align-items:center;gap:6px;background:transparent;border:none;color:#e31e24;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:16px;padding:0">← Volver</button><div id="tc-herr-contenido"></div></div>';
  const c = document.getElementById('tc-herr-contenido');

  if (nombre === 'enciclopedia') renderEnciclopedia(c);
  else if (nombre === 'cronometros') renderCronometros(c);
  else if (nombre === 'temporizadores') renderTemporizadores(c);
  else if (nombre === 'juegos') {
    renderJuegos(c);
    setTimeout(function(){
      var btns = c.querySelectorAll('[onclick]');
      btns.forEach(function(b){
        var oc = b.getAttribute('onclick');
        if(oc && oc.indexOf('herramienta-contenido') !== -1){
          b.setAttribute('onclick', oc.replace(/herramienta-contenido/g, 'tc-herr-contenido'));
        }
        if(oc && oc.indexOf('volverHerramientas') !== -1){
          b.setAttribute('onclick', "tcTab('tools')");
        }
      });
    }, 100);
    // Parchar funciones de juegos para usar contenedor cliente
    window._tcJuegosOrig = window._tcJuegosOrig || {};
    var juegos = ['renderTriqui','renderSnake','renderMemoria','renderHockey','renderInvaders'];
    juegos.forEach(function(fn){
      if(window[fn] && !window._tcJuegosOrig[fn]){
        window._tcJuegosOrig[fn] = window[fn];
        window[fn] = function(){
          var cj = document.getElementById('tc-herr-contenido');
          if(!cj) cj = document.getElementById('herramienta-contenido');
          window._tcJuegosOrig[fn](cj);
          setTimeout(function(){
            var volver = cj.querySelector('button');
            if(volver) volver.setAttribute('onclick', "tcToolAbrirHerr('juegos')");
          }, 100);
        };
      }
    });
  }
  else if (nombre === 'ruleta') renderRuleta(c);
  else if (nombre === 'competencias') {
    renderCompetencias(c);
    // Ocultar botones de edicion del entrenador
    setTimeout(function(){
      var btns = c.querySelectorAll('button');
      btns.forEach(function(b){
        if(b.textContent.indexOf('Competencia entre') !== -1 || b.textContent.indexOf('Tu Propia') !== -1) {
          b.parentNode.style.display = 'none';
        }
      });
    }, 100);
  }
  else if (nombre === 'conversores') tcRenderConversores(c);
  else if (nombre === 'enciclopedia') tcRenderEnciclopedia(c);
}

function tcRenderConversores(c) {
  var edad = 0;
  var fnac = null;
  if(window._tcUsuario) {
    fnac = (window._tcUsuario.perfil && window._tcUsuario.perfil.fecha_nacimiento) || window._tcUsuario.fecha_nacimiento || null;
    if(!fnac && window._tcUsuario.perfil && window._tcUsuario.perfil.edad) {
      edad = parseInt(window._tcUsuario.perfil.edad) || 0;
    }
  }
  // Sin fecha: frecuencia cardíaca mostrará mensaje de aviso
  if(fnac) {
    var hoy = new Date();
    var nac = new Date(fnac);
    edad = hoy.getFullYear() - nac.getFullYear();
    if(hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate())) edad--;
  }
  var fcmax = edad > 0 ? 220 - edad : null;

  var h = '<div style="display:flex;flex-direction:column;gap:12px">';

  // PESO
  h += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:16px">';
  h += '<div style="font-size:12px;font-weight:700;color:#e31e24;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Peso</div>';
  h += '<div style="display:flex;gap:8px;align-items:center">';
  h += '<input id="cv-kg" type="number" placeholder="kg" oninput="cvKgLb()" style="flex:1;min-width:0;background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px;color:#fff;font-size:15px;text-align:center">';
  h += '<span style="color:#555;font-weight:700;flex-shrink:0">&#8644;</span>';
  h += '<input id="cv-lb" type="number" placeholder="lb" oninput="cvLbKg()" style="flex:1;min-width:0;background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px;color:#fff;font-size:15px;text-align:center">';
  h += '</div>';
  h += '<div style="display:flex;justify-content:space-between;margin-top:6px">';
  h += '<span style="font-size:10px;color:#444">kilogramos</span><span style="font-size:10px;color:#444">libras</span>';
  h += '</div></div>';

  // ALTURA
  h += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:16px">';
  h += '<div style="font-size:12px;font-weight:700;color:#e31e24;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Altura</div>';
  h += '<div style="display:flex;gap:8px;align-items:center">';
  h += '<input id="cv-cm" type="number" placeholder="cm" oninput="cvCmIn()" style="flex:1;min-width:0;background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px;color:#fff;font-size:15px;text-align:center">';
  h += '<span style="color:#555;font-weight:700;flex-shrink:0">&#8644;</span>';
  h += '<input id="cv-in" type="number" placeholder="in" oninput="cvInCm()" style="flex:1;min-width:0;background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px;color:#fff;font-size:15px;text-align:center">';
  h += '</div>';
  h += '<div style="display:flex;justify-content:space-between;margin-top:6px">';
  h += '<span style="font-size:10px;color:#444">cent&iacute;metros</span><span style="font-size:10px;color:#444">pulgadas</span>';
  h += '</div>';
  h += '<div id="cv-cm-ft" style="text-align:center;margin-top:8px;font-size:12px;color:#666"></div>';
  h += '</div>';

  // DISTANCIA
  h += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:16px">';
  h += '<div style="font-size:12px;font-weight:700;color:#e31e24;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">&#128663; Distancia</div>';
  h += '<div style="display:flex;gap:8px;align-items:center">';
  h += '<input id="cv-km" type="number" placeholder="km" oninput="cvKmMi()" style="flex:1;min-width:0;background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px;color:#fff;font-size:15px;text-align:center">';
  h += '<span style="color:#555;font-weight:700;flex-shrink:0">&#8644;</span>';
  h += '<input id="cv-mi" type="number" placeholder="mi" oninput="cvMiKm()" style="flex:1;min-width:0;background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px;color:#fff;font-size:15px;text-align:center">';
  h += '</div>';
  h += '<div style="display:flex;justify-content:space-between;margin-top:6px">';
  h += '<span style="font-size:10px;color:#444">kil&oacute;metros</span><span style="font-size:10px;color:#444">millas</span>';
  h += '</div></div>';

  // FRECUENCIA CARDIACA
  h += '<div style="background:#111;border:1px solid #1a1a1a;border-radius:16px;padding:16px">';
  h += '<div style="font-size:12px;font-weight:700;color:#e31e24;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">&#128147; Frecuencia Cardiaca</div>';
  if(edad > 0) {
    h += '<div style="font-size:11px;color:var(--texto-medio);margin-bottom:12px">Edad: ' + edad + ' a&ntilde;os &middot; FCm&aacute;x: ' + fcmax + ' bpm</div>';
    var zonas = [
      {nombre:'Zona 1 &mdash; Recuperaci&oacute;n', pct:'50-60%', min:Math.round(fcmax*0.50), max:Math.round(fcmax*0.60), color:'#4caf50'},
      {nombre:'Zona 2 &mdash; Quema grasa',         pct:'60-70%', min:Math.round(fcmax*0.60), max:Math.round(fcmax*0.70), color:'#8bc34a'},
      {nombre:'Zona 3 &mdash; Aer&oacute;bica',     pct:'70-80%', min:Math.round(fcmax*0.70), max:Math.round(fcmax*0.80), color:'#ff9800'},
      {nombre:'Zona 4 &mdash; Anaer&oacute;bica',   pct:'80-90%', min:Math.round(fcmax*0.80), max:Math.round(fcmax*0.90), color:'#f44336'},
      {nombre:'Zona 5 &mdash; M&aacute;ximo',       pct:'90-100%',min:Math.round(fcmax*0.90), max:fcmax,                  color:'#e31e24'}
    ];
    zonas.forEach(function(z) {
      h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a1a">';
      h += '<div><div style="font-size:11px;font-weight:700;color:' + z.color + '">' + z.nombre + '</div>';
      h += '<div style="font-size:10px;color:var(--texto-medio)">' + z.pct + ' FCm&aacute;x</div></div>';
      h += '<div style="font-size:13px;font-weight:700;color:#fff">' + z.min + '-' + z.max + ' <span style="font-size:10px;color:var(--texto-medio)">bpm</span></div>';
      h += '</div>';
    });
  } else {
    h += '<div style="font-size:12px;color:var(--texto-medio);padding:8px 0">Agrega tu fecha de nacimiento en Perfil para ver tus zonas.</div>';
  }
  h += '</div>';

  h += '</div>';
  c.innerHTML = h;
}


function cvKgLb() {
  const v = parseFloat(document.getElementById('cv-kg').value);
  if (!isNaN(v)) document.getElementById('cv-lb').value = (v * 2.20462).toFixed(2);
}
function cvLbKg() {
  const v = parseFloat(document.getElementById('cv-lb').value);
  if (!isNaN(v)) document.getElementById('cv-kg').value = (v / 2.20462).toFixed(2);
}
function cvCmIn() {
  const v = parseFloat(document.getElementById('cv-cm').value);
  if (!isNaN(v)) {
    document.getElementById('cv-in').value = (v / 2.54).toFixed(2);
    const ft = Math.floor(v / 30.48);
    const inn = Math.round((v / 2.54) % 12);
    document.getElementById('cv-cm-ft').textContent = ft + ' ft ' + inn + ' in';
  }
}
function cvKmMi() {
  const v = parseFloat(document.getElementById('cv-km').value);
  if (!isNaN(v)) document.getElementById('cv-mi').value = (v * 0.621371).toFixed(3);
}
function cvMiKm() {
  const v = parseFloat(document.getElementById('cv-mi').value);
  if (!isNaN(v)) document.getElementById('cv-km').value = (v / 0.621371).toFixed(3);
}
function cvInCm() {
  const v = parseFloat(document.getElementById('cv-in').value);
  if (!isNaN(v)) {
    document.getElementById('cv-cm').value = (v * 2.54).toFixed(2);
    const ft = Math.floor(v / 12);
    const inn = Math.round(v % 12);
    document.getElementById('cv-cm-ft').textContent = ft + ' ft ' + inn + ' in';
  }
}

function tcRenderEnciclopedia(c) {
  renderEnciclopedia(c);
}

function tcVerEnciclopedia(id) {
  window._encDesdeRutina = true;
  tcTab('tools');
  setTimeout(function(){
    tcToolAbrirHerr('enciclopedia');
    setTimeout(function(){
      if (window._encEjercicios && window._encEjercicios.length > 0) {
        encAbrirFicha(id);
      } else {
        setTimeout(function(){ encAbrirFicha(id); }, 1500);
      }
    }, 500);
  }, 200);
}

function mostrarRecomendacionesMacros() {
  const sel = document.getElementById('ali-objetivo');
  console.log("OBJETIVO ACTUAL:", sel ? sel.value : "NO ENCONTRADO");
  const objetivo = sel ? sel.value : 'perdida';
  const recs = {
    'perdida':        { p:'2.0–2.5', c:'1.5–2.5', g:'0.8–1.0' },
    'musculo':        { p:'2.2–3.0', c:'3.5–5.0', g:'1.0–1.5' },
    'hipertrofia':    { p:'2.2–3.0', c:'3.5–5.0', g:'1.0–1.5' },
    'rendimiento':    { p:'1.8–2.5', c:'4.0–6.0', g:'1.0–1.3' },
    'rehabilitacion': { p:'2.0–2.5', c:'2.0–3.0', g:'1.0–1.2' },
    'salud':          { p:'1.6–2.0', c:'2.5–3.5', g:'0.8–1.2' },
  };
  const r = recs[objetivo] || recs['perdida'];
  const rp = document.getElementById('rec-proteina');
  const rc = document.getElementById('rec-carbos');
  const rg = document.getElementById('rec-grasas');
  if(rp) rp.textContent = '💡 Rec: ' + r.p + ' g/kg';
  if(rc) rc.textContent = '💡 Rec: ' + r.c + ' g/kg';
  if(rg) rg.textContent = '💡 Rec: ' + r.g + ' g/kg';
}

// Llamar cuando cambia el objetivo
document.addEventListener('DOMContentLoaded', function() {
  const sel = document.getElementById('cliente-objetivo');
  if(sel) sel.addEventListener('change', mostrarRecomendacionesMacros);
  const pa = document.getElementById('ali-peso-actual');
  if(pa) pa.addEventListener('input', mostrarRecomendacionesMacros);
  const po = document.getElementById('ali-peso-objetivo');
  if(po) po.addEventListener('input', mostrarRecomendacionesMacros);
});

var COLORES_RULETA = ['#cc0000','#111111','#cc0000','#111111','#cc0000','#111111','#cc0000','#111111','#cc0000','#111111'];

function renderRuleta(c) {
  window._ruletas = [];
  c.innerHTML = '<div style="padding:10px"><h3 style="color:var(--acento);margin:0 0 14px 0;font-size:16px">🎯 Ruleta DT</h3><div id="ruletas-container" style="display:flex;flex-direction:column;gap:20px"></div></div>';
  var itemsEj = JSON.parse(localStorage.getItem('ruleta_ejercicios')||'["Sentadillas","Flexiones","Burpees","Planchas","Zancadas"]');
  var itemsTi = JSON.parse(localStorage.getItem('ruleta_tiempos')||'["10 seg","20 seg","30 seg","1 min"]');
  window._ruletas = [
    { id: 'ejercicios', titulo: 'Ejercicios', items: itemsEj, dorado: 'Burpees', girando: false, angulo: 0, velocidad: 0, frameId: null },
    { id: 'tiempos', titulo: 'Tiempos', items: itemsTi, dorado: '1 min', girando: false, angulo: 0, velocidad: 0, frameId: null }
  ];
  renderTodasRuletas();
}

function agregarRuleta() {}

function eliminarRuleta(id) {
  var r = window._ruletas.find(function(x){ return x.id==id; });
  if (r && r.frameId) cancelAnimationFrame(r.frameId);
  window._ruletas = window._ruletas.filter(function(x){ return x.id!=id; });
  renderTodasRuletas();
}

function guardarRuleta(r) {
  localStorage.setItem('ruleta_' + r.id, JSON.stringify(r.items));
}

function renderTodasRuletas() {
  var cont = document.getElementById('ruletas-container');
  if (!cont) return;
  cont.innerHTML = '';
  window._ruletas.forEach(function(r, i) {
    var div = document.createElement('div');
    div.style.cssText = 'background:var(--gris);border-radius:14px;padding:14px;border:1px solid #333;';
    var esFija = r.id === 'ejercicios' || r.id === 'tiempos';
    var cerrar = !esFija ? '<button onclick="eliminarRuleta(\'' +r.id+ '\')" style="background:none;border:none;color:#e31e24;font-size:20px;cursor:pointer;line-height:1">×</button>' : '';
    var titulo = r.titulo ? r.titulo.toUpperCase() : ('RULETA ' + (i+1));
    div.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-size:14px;font-weight:700;color:#FFD700;letter-spacing:1px">🎰 '+titulo+'</span>'+cerrar+'</div>'
      + '<canvas id="cvs'+r.id+'" width="280" height="280" style="display:block;margin:0 auto"></canvas>'
      + '<div id="res'+r.id+'" style="text-align:center;min-height:30px;margin:12px 0;font-size:16px;font-weight:700;color:#FFD700;text-shadow:0 0 10px #FFD700"></div>'
      + '<div style="display:flex;gap:8px;margin-bottom:10px"><input id="inp'+r.id+'" type="text" placeholder="Nuevo ítem..." style="flex:1;padding:8px;border-radius:8px;border:1px solid #444;background:#1a1a1a;color:#fff;font-size:13px"><button onclick="agregarItem(\'' +r.id+ '\')" style="padding:8px 14px;background:#FFD700;color:#000;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer">+</button></div>'
      + '<div id="itms'+r.id+'" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>'
      + '<button onclick="girarRuleta(\'' +r.id+ '\')" style="width:100%;padding:13px;background:linear-gradient(135deg,#cc0000,#ff0000);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:1px;box-shadow:0 4px 15px rgba(204,0,0,0.4)">🎯 GIRAR</button>';
    cont.appendChild(div);
    dibujarRuleta(r);
    renderItems(r);
  });
  var btn = document.getElementById('btn-agregar-ruleta');
  if (btn) btn.style.display = window._ruletas.length >= 3 ? 'none' : 'block';
}

function agregarItem(id) {
  var r = window._ruletas.find(function(x){ return x.id==id; });
  if (!r) return;
  var inp = document.getElementById('inp'+id);
  var val = inp.value.trim();
  if (!val) return;
  r.items.push(val);
  inp.value = '';
  guardarRuleta(r);
  dibujarRuleta(r);
  renderItems(r);
}

function quitarItem(id, idx) {
  var r = window._ruletas.find(function(x){ return x.id==id; });
  if (!r || r.items.length <= 2) return;
  r.items.splice(idx, 1);
  guardarRuleta(r);
  dibujarRuleta(r);
  renderItems(r);
}

function renderItems(r) {
  var cont = document.getElementById('itms'+r.id);
  if (!cont) return;
  cont.innerHTML = r.items.map(function(item, i) {
    var x = r.items.length > 2 ? '<button onclick="quitarItem('+r.id+','+i+')" style="background:none;border:none;color:#888;cursor:pointer;font-size:11px;padding:0;margin-left:3px">✕</button>' : '';
    return '<span style="background:#1a1a1a;color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;display:inline-flex;align-items:center">'+item+x+'</span>';
  }).join('');
}

function dibujarRuleta(r) {
  var canvas = document.getElementById('cvs'+r.id);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var cx = 140, cy = 140, radio = 130;
  var n = r.items.length;
  var arco = 2 * Math.PI / n;
  ctx.clearRect(0, 0, 280, 280);
  r.items.forEach(function(item, i) {
    var ini = r.angulo + i * arco;
    var fin = ini + arco;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radio, ini, fin);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#cc0000' : '#111111';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ini + arco / 2);
    ctx.textAlign = 'right';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px sans-serif';
    var txt = item.length > 11 ? item.substring(0,10)+'…' : item;
    ctx.fillText(txt, radio - 8, 5);
    ctx.shadowBlur = 0;
    ctx.restore();
  });
  // Borde dorado exterior
  ctx.beginPath();
  ctx.arc(cx, cy, radio + 6, 0, 2*Math.PI);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Segundo aro dorado
  ctx.beginPath();
  ctx.arc(cx, cy, radio + 11, 0, 2*Math.PI);
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Centro dorado
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, 2*Math.PI);
  ctx.fillStyle = '#FFD700';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, 2*Math.PI);
  ctx.fillStyle = '#111';
  ctx.fill();
  // Puntero dorado apuntando hacia adentro
  ctx.beginPath();
  ctx.moveTo(cx + radio - 8, cy);
  ctx.lineTo(cx + radio + 18, cy - 12);
  ctx.lineTo(cx + radio + 18, cy + 12);
  ctx.closePath();
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
}

function girarRuleta(id) {
  var r = window._ruletas.find(function(x){ return x.id==id; });
  if (!r || r.girando) return;
  r.girando = true;
  document.getElementById('res'+id).textContent = '';
  r.velocidad = 0.22 + Math.random() * 0.18;
  var freno = 180 + Math.floor(Math.random() * 180);
  var frame = 0;
  function animar() {
    frame++;
    if (frame > freno) r.velocidad *= 0.97;
    r.angulo += r.velocidad;
    dibujarRuleta(r);
    if (r.velocidad < 0.003) {
      r.girando = false;
      var n = r.items.length;
      var arco = 2 * Math.PI / n;
      var angNorm = ((-r.angulo) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);
      var idx = Math.floor(angNorm / arco) % n;
      document.getElementById('res'+id).textContent = '🏆 ' + r.items[idx];
      return;
    }
    r.frameId = requestAnimationFrame(animar);
  }
  r.frameId = requestAnimationFrame(animar);
}

function renderEnciclopedia(c) {
  c.innerHTML = '<div style="padding:10px"><div style="position:relative;margin-bottom:10px"><input id="enc-buscar" type="text" placeholder="Buscar ejercicio..." style="width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:10px;color:#fff;font-size:14px;outline:none" oninput="encFiltrar()"></div><div id="enc-contenido"></div></div>';
  window._encGrupos = [
    {id:"pecho",   icon:'<img src="/images/Enciclopediapecho.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Pecho",   count:0},
    {id:"espalda", icon:'<img src="/images/Enciclopediaespalda.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Espalda", count:0},
    {id:"piernas", icon:'<img src="/images/Enciclopediapierna.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Piernas", count:0},
    {id:"hombros", icon:'<img src="/images/Enciclopediahombro.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Hombros", count:0},
    {id:"brazos",  icon:'<img src="/images/Enciclopediabrazo.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Brazos",  count:0},
    {id:"gluteos", icon:'<img src="/images/Enciclopediagluteo.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Gluteos", count:0},
    {id:"core",    icon:'<img src="/images/Enciclopediaabdomen.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Core",    count:0},
    {id:"cardio",  icon:'<img src="/images/Enciclopediacardio.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Cardio",  count:0},
  ];
  window._encFiltros = {grupo:null, equipamiento:null, nivel:null, texto:"", esPersonalizado:false};
  window._encEjercicios = [];
  encCargarEjercicios();
}

function encCargarEjercicios() {
  Promise.all([
    fetch("/api/enciclopedia").then(function(r){return r.json();}).catch(function(){return [];}),
    fetch("/api/glosario").then(function(r){return r.json();}).catch(function(){return [];})
  ]).then(function(res) {
    var oficiales = Array.isArray(res[0]) ? res[0] : [];
    window._encEjercicios = oficiales;
    var glosario = Array.isArray(res[1]) ? res[1] : [];
    window._encGlosarioCount = glosario.length;
    window._encGrupos.forEach(function(g) {
      g.count = window._encEjercicios.filter(function(e){return e.grupo===g.id;}).length;
    });
    encMostrarGrupos();
  });
}

function encAbrirAnatomia() {
  alert("Anatom\u00eda: proximamente disponible.");
}

function encMostrarGrupos() {
  window._encFiltros = {grupo:null, equipamiento:null, nivel:null, texto:"", esPersonalizado:false};
  var bi = document.getElementById("enc-buscar");
  if (bi) bi.value = "";
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var html = "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px\">";
  window._encGrupos.forEach(function(g) {
    html += "<div onclick=\"encSeleccionarGrupo(&quot;" + g.id + "&quot;)\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
    html += "<div style=\"font-size:28px;margin-bottom:6px\">" + g.icon + "</div>";
    html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">" + g.nombre + "</div>";
    html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">" + g.count + " ejercicios</div>";
    html += "</div>";
  });
  html += "</div>";
    html += "</div>";
  // Fila: Estiramientos y Tus ejercicios
  html += "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px\">";
  html += "<div onclick=\"encSeleccionarGrupo(&quot;estiramientos&quot;)\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
  html += "<div style=\"margin-bottom:6px\"><img src=\"/images/Enciclopediaestiramiento.png\" style=\"width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px\"></div>";
  html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">Estiramientos</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">" + (window._encEjercicios||[]).filter(function(e){return e.grupo==="estiramientos";}).length + " ejercicios</div>";
  html += "</div>";
  if (localStorage.getItem("dt_rol") !== "cliente") {
  html += "<div onclick=\"encAgregarPersonalizado()\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
  html += "<div style=\"margin-bottom:6px\"><img src=\"/images/Creardt.png\" style=\"width:56px;height:56px;object-fit:contain;border-radius:8px\"></div>";
  html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">Mis ejercicios</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:3px\" id=\"enc-custom-count\">0 / 10</div>";
  html += "</div>";
  }
  html += "</div>";

  // Fila: Glosario y Anatomia
  html += "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px\">";
  html += "<div onclick=\"encAbrirGlosario()\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
  html += "<div style=\"margin-bottom:6px\"><img src=\"/images/Glosariodt.png\" style=\"width:56px;height:56px;object-fit:contain;border-radius:8px\"></div>";
  html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">Glosario</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">" + (window._encGlosarioCount||0) + " términos</div>";
  html += "</div>";
  html += "<div onclick=\"encAbrirAnatomia()\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
  html += "<div style=\"margin-bottom:6px\"><img src=\"/images/Enciclopediaanatomia.png\" style=\"width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px\"></div>";
  html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">Anatom\u00eda</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">Pr\u00f3ximamente</div>";
  html += "</div>";
  html += "</div>";
  cont.innerHTML = html;
  var personalizados = (window._encEjercicios||[]).filter(function(e){return e.es_personalizado;});
  var el = document.getElementById("enc-custom-count");
  if (el) el.textContent = personalizados.length + " / 10";
}

function encSeleccionarGrupo(grupo) {
  window._encFiltros.grupo = grupo === "personalizado" ? null : grupo;
  window._encFiltros.esPersonalizado = grupo === "personalizado";
  encMostrarLista();
}

function encMostrarLista() {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var grupo = window._encGrupos.find(function(g){return g.id===window._encFiltros.grupo;});
  var titulo = window._encFiltros.esPersonalizado ? "&#11088; Mis Personalizados" : (grupo ? grupo.icon+" "+grupo.nombre : "Todos");
  var html = "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:10px\">";
  html += "<button onclick=\"encMostrarGrupos()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:15px;font-weight:700;color:#fff\">" + titulo + "</span></div>";
  html += "<div style=\"display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;margin-bottom:10px\">";
  var equipos = ["Todos","barra","mancuerna","maquina","peso corporal","cable"];
  var labels  = ["Todos","Barra","Mancuerna","Maquina","Peso corporal","Cable"];
  equipos.forEach(function(eq, i) {
    var val = eq === "Todos" ? "" : eq;
    var activo = (window._encFiltros.equipamiento||"") === val;
    var borde = activo ? "#e31e24" : "#2a2a2a";
    var bg = activo ? "#e31e24" : "#1a1a1a";
    var col = activo ? "#fff" : "#888";
    html += "<div onclick=\"encSetFiltro(&quot;equipamiento&quot;,&quot;" + val + "&quot;)\" style=\"flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px solid " + borde + ";background:" + bg + ";color:" + col + ";font-size:12px;font-weight:600;cursor:pointer\">" + labels[i] + "</div>";
  });
  html += "</div>";
  var resultados = encBuscar();
  if (resultados.length === 0) {
    html += "<div style=\"text-align:center;color:#666;padding:30px;font-size:13px\">No se encontraron ejercicios</div>";
  } else {
    resultados.forEach(function(e) {
      var nc = e.nivel==="principiante"?"#64b5f6":e.nivel==="avanzado"?"#e31e24":"#4caf50";
      var nb = e.nivel==="principiante"?"#1a2a3a":e.nivel==="avanzado"?"#3a1a1a":"#1a3a1a";
      var gr = window._encGrupos.find(function(g){return g.id===e.grupo;});
      html += "<div onclick=\"encAbrirFicha(&quot;" + e.id + "&quot;)\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;cursor:pointer\">";
      html += e.imagen ? "<div style=\"width:48px;height:48px;background:#1a1a1a;border-radius:8px;overflow:hidden;flex-shrink:0;border:1px solid #2a2a2a\"><img src=\"" + e.imagen + "\" style=\"width:100%;height:100%;object-fit:cover\"></div>" : "<div style=\"width:48px;height:48px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;border:1px solid #2a2a2a\">" + (gr?gr.icon:"&#128170;") + "</div>";
      html += "<div style=\"flex:1;min-width:0\">";
      html += "<div style=\"font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">" + e.nombre + "</div>";
      html += "<div style=\"display:flex;gap:6px;flex-wrap:wrap;margin-top:4px\">";
      if (e.nivel) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;background:" + nb + ";color:" + nc + "\">" + e.nivel + "</span>";
      if (e.equipamiento) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;background:#1e1e1e;color:var(--texto-medio);border:1px solid #333\">" + e.equipamiento + "</span>";
      if (e.es_personalizado) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;background:rgba(255,171,64,0.15);color:#e65100\">&#11088; Personalizado</span>";
      html += "</div></div><span style=\"color:#666;font-size:14px\">&#8250;</span></div>";
    });
  }
  cont.innerHTML = html;
}

function encBuscar() {
  var lista = window._encEjercicios || [];
  if (window._encFiltros.esPersonalizado) {
    lista = lista.filter(function(e){return e.es_personalizado;});
  } else if (window._encFiltros.grupo) {
    lista = lista.filter(function(e){return e.grupo===window._encFiltros.grupo;});
  }
  if (window._encFiltros.equipamiento) {
    lista = lista.filter(function(e){return e.equipamiento===window._encFiltros.equipamiento;});
  }
  if (window._encFiltros.texto && window._encFiltros.texto.trim()!=="") {
    var txt = window._encFiltros.texto.toLowerCase();
    lista = lista.filter(function(e){
      return e.nombre.toLowerCase().includes(txt) ||
        (e.musculos_principales||[]).some(function(m){return m.toLowerCase().includes(txt);}) ||
        (e.tags||[]).some(function(t){return t.toLowerCase().includes(txt);});
    });
  }
  return lista.sort(function(a,b){return a.nombre.localeCompare(b.nombre,"es");});
}

function encEditarFicha(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var html = "<div style=\"padding:10px\">";
  html += "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:16px\">";
  html += "<button onclick=\"encAbrirFicha(&quot;" + id + "&quot;)\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:14px;font-weight:700;color:#e31e24\">&#9998; Editando ejercicio</span>";
  html += "</div>";

  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">Nombre</div>";
  html += "<input id=\"enc-edit-nombre\" value=\"" + escHtml(e.nombre) + "\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none\">";
  html += "</div>";

  var grupos = ["pecho","espalda","hombros","brazos","piernas","gluteos","core","cardio"];
  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">Grupo</div>";
  html += "<select id=\"enc-edit-grupo\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box\">";
  grupos.forEach(function(g){ html += "<option value=\"" + g + "\"" + (e.grupo===g?" selected":"") + ">" + g.charAt(0).toUpperCase()+g.slice(1) + "</option>"; });
  html += "</select></div>";

  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">M&uacute;sculos principales (separados por coma)</div>";
  html += "<input id=\"enc-edit-musculos-p\" value=\"" + escHtml((e.musculos_principales||[]).join(', ')) + "\" placeholder=\"Ej: cuádriceps, glúteos\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box\">";
  html += "</div>";

  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">M&uacute;sculos secundarios (separados por coma)</div>";
  html += "<input id=\"enc-edit-musculos-s\" value=\"" + escHtml((e.musculos_secundarios||[]).join(', ')) + "\" placeholder=\"Ej: core, lumbares\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box\">";
  html += "</div>";

  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">Pasos de ejecucion</div>";
  window._encEditPasosCount = (e.ejecucion||[]).length;
  (e.ejecucion||[]).forEach(function(paso, i) {
    html += "<div id=\"enc-edit-wrap-" + i + "\" style=\"display:flex;gap:6px;margin-bottom:6px;align-items:flex-start\">";
    html += "<div style=\"width:22px;height:22px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:6px\">" + (i+1) + "</div>";
    html += "<textarea id=\"enc-edit-paso-" + i + "\" rows=\"2\" style=\"flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px;color:#fff;font-size:13px;outline:none;resize:none\">" + paso + "</textarea>";
    html += "<button onclick=\"encEliminarPasoEdit(" + i + ")\" style=\"background:#3a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;padding:6px 8px;cursor:pointer;font-size:12px;flex-shrink:0;margin-top:4px\">&#128465;</button>";
    html += "</div>";
  });
  html += "</div>";
  html += "<button onclick=\"encAgregarPasoEdit()\" style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:var(--texto-medio);padding:7px 14px;cursor:pointer;font-size:12px;margin-bottom:12px\">+ Agregar paso</button>";

  html += "<button onclick=\"encGuardarEdicionV2(&quot;" + id + "&quot;)\" style=\"width:100%;background:#e31e24;border:none;border-radius:10px;color:#fff;padding:12px;font-size:14px;font-weight:700;cursor:pointer\">&#10003; Guardar cambios</button>";
  html += "</div>";

  cont.innerHTML = html;
}


function encEliminarPasoEdit(i) {
  var wrap = document.getElementById("enc-edit-wrap-" + i);
  if (wrap) wrap.remove();
}

function encAgregarPasoEdit() {
  var i = window._encEditPasosCount || 0;
  var cont = document.getElementById("enc-contenido").querySelector("#enc-edit-wrap-" + (i-1));
  var div = document.createElement("div");
  div.id = "enc-edit-wrap-" + i;
  div.style.cssText = "display:flex;gap:6px;margin-bottom:6px;align-items:flex-start";
  div.innerHTML = "<div style=\"width:22px;height:22px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:6px\">" + (i+1) + "</div><textarea id=\"enc-edit-paso-" + i + "\" rows=\"2\" style=\"flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px;color:#fff;font-size:13px;outline:none;resize:none\"></textarea><button onclick=\"encEliminarPasoEdit(" + i + ")\" style=\"background:#3a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;padding:6px 8px;cursor:pointer;font-size:12px;flex-shrink:0;margin-top:4px\">&#128465;</button>";
  if (cont) cont.parentNode.insertBefore(div, cont.nextSibling);
  else document.getElementById("enc-contenido").appendChild(div);
  window._encEditPasosCount = i + 1;
}

function encGuardarEdicionV2(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;
  e.nombre = document.getElementById("enc-edit-nombre").value;
  e.grupo = document.getElementById("enc-edit-grupo").value;
  var mp = document.getElementById("enc-edit-musculos-p").value;
  var ms = document.getElementById("enc-edit-musculos-s").value;
  e.musculos_principales = mp.split(",").map(function(m){return m.trim();}).filter(Boolean);
  e.musculos_secundarios = ms.split(",").map(function(m){return m.trim();}).filter(Boolean);
  var pasos = [];
  var i = 0;
  while (document.getElementById("enc-edit-paso-" + i)) {
    var el = document.getElementById("enc-edit-paso-" + i);
    if (el && el.value.trim()) pasos.push(el.value.trim());
    i++;
  }
  e.ejecucion = pasos;
  fetch("/api/enciclopedia/editar/" + id, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nombre: e.nombre, grupo: e.grupo, ejecucion: e.ejecucion, musculos_principales: e.musculos_principales, musculos_secundarios: e.musculos_secundarios})
  }).then(function(r){return r.json();}).then(function(){
    encAbrirFicha(id);
  });
}

function encGuardarEdicion(id, numPasos) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;

  e.nombre = document.getElementById("enc-edit-nombre").value;
  var pasos = [];
  for (var i = 0; i < numPasos; i++) {
    var el = document.getElementById("enc-edit-paso-" + i);
    if (el) pasos.push(el.value);
  }
  e.ejecucion = pasos;

  fetch("/api/enciclopedia/editar/" + id, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nombre: e.nombre, ejecucion: e.ejecucion})
  }).then(function(r){return r.json();}).then(function(){
    encAbrirFicha(id);
  });
}


function encAgregarPersonalizado() {
  if(!entEsPremium()){mostrarCandadoPremium('Los ejercicios personalizados requieren Plan Premium.');return;}
  encGestionPersonalizados();
}

function encGestionPersonalizados() {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var personalizados = (window._encEjercicios||[]).filter(function(e){return e.es_personalizado;});
  var html = "<div style=\"padding:4px\">";
  html += "<div style=\"display:flex;align-items:center;justify-content:space-between;margin-bottom:16px\">";
  html += "<div style=\"display:flex;align-items:center;gap:8px\">";
  html += "<button onclick=\"encMostrarGrupos()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:15px;font-weight:700;color:#fff\">&#11088; Mis ejercicios</span>";
  html += "</div>";
  html += "<button onclick=\"encFormNuevoPersonalizado()\" style=\"background:#e31e24;border:none;border-radius:8px;color:#fff;padding:8px 14px;cursor:pointer;font-size:13px;font-weight:700\">+ Nuevo</button>";
  html += "</div>";
  if (personalizados.length === 0) {
    html += "<div style=\"text-align:center;padding:40px 20px;color:var(--texto-medio);font-size:13px\">No tienes ejercicios personalizados.<br>Toca <b style=\"color:#fff\">+ Nuevo</b> para crear uno.</div>";
  } else {
    personalizados.forEach(function(e) {
      var img = e.imagen_inicio || e.imagen_fin || "";
      html += "<div style=\"background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px\">";
      if (img) {
        html += "<img src=\"" + img + "\" style=\"width:48px;height:48px;border-radius:8px;object-fit:cover;background:#1a1a1a\">";
      } else {
        html += "<div style=\"width:48px;height:48px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px\">&#128170;</div>";
      }
      html += "<div style=\"flex:1;min-width:0\">";
      html += "<div style=\"font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">" + e.nombre + "</div>";
      html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">" + (e.grupo||"") + (e.equipamiento ? " &middot; " + e.equipamiento : "") + "</div>";
      html += "</div>";
      html += "<div style=\"display:flex;gap:6px\">";
      html += "<button onclick=\"encFormEditarPersonalizado(&quot;" + e.id + "&quot;)\" style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:13px\">&#9998;</button>";
      html += "<button onclick=\"encEliminarPersonalizado(&quot;" + e.id + "&quot;)\" style=\"background:#3a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;padding:6px 10px;cursor:pointer;font-size:13px\">&#128465;</button>";
      html += "</div>";
      html += "</div>";
    });
  }
  html += "</div>";
  cont.innerHTML = html;
}

function encFormNuevoPersonalizado() {
  encFormPersonalizado(null);
}

function encFormEditarPersonalizado(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  encFormPersonalizado(e);
}

function encFormPersonalizado(e) {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var esNuevo = !e;
  var grupos = ["pecho","espalda","hombros","brazos","piernas","gluteos","core","cardio"];
  var equipos = ["peso corporal","barra","mancuerna","maquina","cable","banda","kettlebell","otro"];
  var niveles = ["principiante","intermedio","avanzado"];
  var muscs = e && e.musculos_principales ? e.musculos_principales.join(", ") : "";
  var pasos = e && e.ejecucion && e.ejecucion.length > 0 ? e.ejecucion : ["","",""];
  window._encPasosCount = pasos.length;

  var html = "<div style=\"padding:4px\">";
  html += "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:16px\">";
  html += "<button onclick=\"encGestionPersonalizados()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:15px;font-weight:700;color:#e31e24\">" + (esNuevo ? "&#43; Nuevo ejercicio" : "&#9998; Editar ejercicio") + "</span>";
  html += "</div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">Nombre *</div>";
  html += "<input id=\"enc-p-nombre\" value=\"" + (e ? e.nombre : "") + "\" placeholder=\"Ej: Curl martillo inclinado\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\"></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">Grupo muscular</div>";
  html += "<select id=\"enc-p-grupo\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\">";
  grupos.forEach(function(g) {
    html += "<option value=\"" + g + "\"" + (e && e.grupo===g ? " selected" : "") + ">" + g.charAt(0).toUpperCase()+g.slice(1) + "</option>";
  });
  html += "</select></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">Equipamiento</div>";
  html += "<select id=\"enc-p-equipo\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\">";
  equipos.forEach(function(eq) {
    html += "<option value=\"" + eq + "\"" + (e && e.equipamiento===eq ? " selected" : "") + ">" + eq.charAt(0).toUpperCase()+eq.slice(1) + "</option>";
  });
  html += "</select></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">Nivel</div>";
  html += "<select id=\"enc-p-nivel\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\">";
  ["principiante","intermedio","avanzado"].forEach(function(n) {
    html += "<option value=\"" + n + "\"" + (e && e.nivel===n ? " selected" : "") + ">" + n.charAt(0).toUpperCase()+n.slice(1) + "</option>";
  });
  html += "</select></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">M&uacute;sculos principales (separados por coma)</div>";
  html += "<input id=\"enc-p-musculos\" value=\"" + muscs + "\" placeholder=\"Ej: b&iacute;ceps, braquial\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\"></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:6px;text-transform:uppercase\">Pasos de ejecuci&oacute;n</div>";
  html += "<div id=\"enc-p-pasos\">";
  pasos.forEach(function(paso, i) {
    html += "<div id=\"enc-paso-wrap-" + i + "\" style=\"display:flex;gap:6px;margin-bottom:6px;align-items:flex-start\">";
    html += "<div style=\"width:22px;height:22px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:6px;color:#fff\">" + (i+1) + "</div>";
    html += "<textarea id=\"enc-p-paso-" + i + "\" rows=\"2\" placeholder=\"Paso " + (i+1) + "...\" style=\"flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px;color:#fff;font-size:13px;outline:none;resize:none;box-sizing:border-box\">" + paso + "</textarea>";
    html += "<button onclick=\"encEliminarPaso(" + i + ")\" style=\"background:#3a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;padding:6px 8px;cursor:pointer;font-size:12px;flex-shrink:0;margin-top:4px\">&#128465;</button>";
    html += "</div>";
  });
  html += "</div>";
  html += "<button onclick=\"encAgregarPaso()\" style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:var(--texto-medio);padding:7px 14px;cursor:pointer;font-size:12px;margin-top:4px\">+ Agregar paso</button></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:6px;text-transform:uppercase\">Foto posici&oacute;n inicial</div>";
  if (e && e.imagen_inicio) html += "<img src=\"" + e.imagen_inicio + "\" style=\"width:100%;max-height:140px;object-fit:contain;border-radius:10px;background:#1a1a1a;margin-bottom:8px\">";
  html += "<input type=\"file\" id=\"enc-p-foto-inicio\" accept=\"image/*\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:var(--texto-medio);font-size:13px;box-sizing:border-box\"></div>";

  html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:10px;color:#666;margin-bottom:6px;text-transform:uppercase\">Foto posici&oacute;n final</div>";
  if (e && e.imagen_fin) html += "<img src=\"" + e.imagen_fin + "\" style=\"width:100%;max-height:140px;object-fit:contain;border-radius:10px;background:#1a1a1a;margin-bottom:8px\">";
  html += "<input type=\"file\" id=\"enc-p-foto-fin\" accept=\"image/*\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:var(--texto-medio);font-size:13px;box-sizing:border-box\"></div>";

  html += "<button onclick=\"encGuardarPersonalizado(" + (e ? "&quot;" + e.id + "&quot;" : "null") + ")\" style=\"width:100%;background:#e31e24;border:none;border-radius:10px;color:#fff;padding:14px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:20px\">&#10003; Guardar ejercicio</button>";
  html += "</div>";
  cont.innerHTML = html;
}


function encEliminarPaso(i) {
  var wrap = document.getElementById("enc-paso-wrap-" + i);
  if (wrap) wrap.remove();
}

function encAgregarPaso() {
  var i = window._encPasosCount || 0;
  var cont = document.getElementById("enc-p-pasos");
  if (!cont) return;
  var div = document.createElement("div");
  div.style.cssText = "display:flex;gap:6px;margin-bottom:6px;align-items:flex-start";
  div.innerHTML = "<div style=\"width:22px;height:22px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:6px;color:#fff\">" + (i+1) + "</div><textarea id=\"enc-p-paso-" + i + "\" rows=\"2\" placeholder=\"Paso " + (i+1) + "...\" style=\"flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px;color:#fff;font-size:13px;outline:none;resize:none;box-sizing:border-box\"></textarea>";
  cont.appendChild(div);
  window._encPasosCount = i + 1;
}

function encGuardarPersonalizado(id) {
  var nombre = document.getElementById("enc-p-nombre").value.trim();
  if (!nombre) { toast('⚠️ El nombre es obligatorio',false); return; }
  var grupo = document.getElementById("enc-p-grupo").value;
  var equipo = document.getElementById("enc-p-equipo").value;
  var nivel = document.getElementById("enc-p-nivel").value;
  var muscsRaw = document.getElementById("enc-p-musculos").value;
  var musculos = muscsRaw.split(",").map(function(m){return m.trim();}).filter(Boolean);
  var pasos = [];
  var i = 0;
  while (document.getElementById("enc-p-paso-" + i)) {
    var v = document.getElementById("enc-p-paso-" + i).value.trim();
    if (v) pasos.push(v);
    i++;
  }
  var datos = {nombre: nombre, grupo: grupo, equipamiento: equipo, nivel: nivel, musculos_principales: musculos, ejecucion: pasos};
  var url = id ? "/api/enciclopedia/personalizados/" + id : "/api/enciclopedia/personalizados";
  var method = id ? "PUT" : "POST";
  fetch(url, {method: method, headers: {"Content-Type":"application/json"}, body: JSON.stringify(datos)})
  .then(function(r){return r.json();})
  .then(function(data) {
    var ejercicioId = id || data.id || (data.ejercicio && data.ejercicio.id);
    var fotoInicio = document.getElementById("enc-p-foto-inicio");
    var fotoFin = document.getElementById("enc-p-foto-fin");
    var promesas = [];
    if (fotoInicio && fotoInicio.files && fotoInicio.files[0] && ejercicioId) {
      var fd1 = new FormData();
      fd1.append("foto", fotoInicio.files[0]);
      promesas.push(fetch("/api/enciclopedia/personalizados/" + ejercicioId + "/foto/inicio", {method:"POST", body: fd1}));
    }
    if (fotoFin && fotoFin.files && fotoFin.files[0] && ejercicioId) {
      var fd2 = new FormData();
      fd2.append("foto", fotoFin.files[0]);
      promesas.push(fetch("/api/enciclopedia/personalizados/" + ejercicioId + "/foto/fin", {method:"POST", body: fd2}));
    }
    Promise.all(promesas).then(function() {
      encCargarEjercicios();
      setTimeout(encGestionPersonalizados, 600);
    });
  })
  .catch(function(){ toast('❌ Error al guardar',false); });
}

function encEliminarPersonalizado(id) {
  if (!confirm("¿Eliminar este ejercicio?")) return;
  fetch("/api/enciclopedia/personalizados/" + id, {method:"DELETE"})
  .then(function(r){return r.json();})
  .then(function() {
    encCargarEjercicios();
    setTimeout(encGestionPersonalizados, 600);
  });
}


function encAbrirGlosario() {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  cont.innerHTML = "<div style=\"text-align:center;padding:20px;color:#666\">Cargando...</div>";
  fetch("/api/glosario").then(function(r){return r.json();}).then(function(data){
    window._glosario = data;
    encMostrarGlosario(null);
  });
}

function encMostrarGlosario(cat) {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var cats = [
    {id:null,label:"Todos",col:"#fff"},
    {id:"metodos",label:"Metodos",col:"#e31e24"},
    {id:"terminologia",label:"Terminos",col:"#64b5f6"},
    {id:"agarres",label:"Agarres",col:"#ffab40"},
    {id:"posiciones",label:"Posiciones",col:"#aed581"},
    {id:"patrones",label:"Patrones",col:"#ce93d8"},
    {id:"biomecánica",label:"Biomecanica",col:"#80deea"},
    {id:"planificacion",label:"Planif.",col:"#f48fb1"},
    {id:"nutricion",label:"Nutricion",col:"#a5d6a7"},
    {id:"lesiones",label:"Lesiones",col:"#ff8a65"},
    {id:"tests",label:"Tests",col:"#ffe082"}
  ];
  var html = "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:10px\">";
  html += "<button onclick=\"encMostrarGrupos()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:15px;font-weight:700;color:#64b5f6\">&#128218; Glosario</span></div>";
  html += "<div style=\"display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;margin-bottom:12px\">";
  cats.forEach(function(c) {
    var act = cat === c.id;
    html += "<div onclick=\"encMostrarGlosario(" + (c.id ? "'" + c.id + "'" : "null") + ")\" style=\"flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px solid " + (act?c.col:"#2a2a2a") + ";background:#111;color:" + (act?c.col:"#888") + ";font-size:12px;font-weight:600;cursor:pointer\">" + c.label + "</div>";
  });
  html += "</div>";
  var lista = window._glosario || [];
  if (cat) lista = lista.filter(function(t){return t.categoria===cat;});
  lista.forEach(function(t) {
    var ci = cats.find(function(c){return c.id===t.categoria;});
    var col = ci ? ci.col : "#aaa";
    html += "<div style=\"background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:12px 14px;margin-bottom:8px;\">";
    html += "<div onclick=\"var d=document.getElementById('gd" + t.id + "');d.style.display=d.style.display==='none'?'block':'none'\" style=\"display:flex;justify-content:space-between;align-items:center;cursor:pointer\">";
    html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">" + t.titulo + "</div>";
    html += "<span style=\"background:#1a1a1a;border:1px solid " + col + ";color:" + col + ";padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;flex-shrink:0;margin-left:8px\">" + (ci?ci.label:"") + "</span>";
    html += "</div>";
    html += "<div id=\"gd" + t.id + "\" style=\"display:none;font-size:13px;color:var(--texto-suave);line-height:1.6;margin-top:8px;border-top:1px solid #2a2a2a;padding-top:8px\">" + t.descripcion + (t.imagen ? "<br><img src=\"/images/glosario/" + t.imagen + "\" style=\"max-width:100%;border-radius:8px;margin-top:8px\" onerror=\"this.style.display='none'\">":"") + "</div>";
    html += "</div>";
  });
  cont.innerHTML = html;
}

function encSetFiltro(tipo, valor) {
  window._encFiltros[tipo] = valor === "" ? null : valor;
  encMostrarLista();
}

function encFiltrar() {
  var txt = document.getElementById("enc-buscar");
  if (!txt) return;
  window._encFiltros.texto = txt.value;
  if (txt.value.trim()!=="") {
    window._encFiltros.grupo = null;
    window._encFiltros.esPersonalizado = false;
    encMostrarLista();
  } else if (!window._encFiltros.grupo && !window._encFiltros.esPersonalizado) {
    encMostrarGrupos();
  } else {
    encMostrarLista();
  }
}

function encAbrirFicha(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var gr = window._encGrupos.find(function(g){return g.id===e.grupo;});
  var nc = e.nivel==="principiante"?"#64b5f6":e.nivel==="avanzado"?"#e31e24":"#4caf50";
  var nb = e.nivel==="principiante"?"#1a2a3a":e.nivel==="avanzado"?"#3a1a1a":"#1a3a1a";
  var html = "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:12px\">";
  var volverFn = window._encDesdeRutina ? "window._encDesdeRutina=false;tcTab('rutina')" : "encMostrarLista()";
  html += "<button onclick=\"" + volverFn + "\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:13px;color:#666;flex:1\">Ficha tecnica</span>"; var _sa=JSON.parse(localStorage.getItem("dt_sesion")||"{}"); if(_sa.email==="danielgaviriabotero@gmail.com"){html += "<button onclick='encEditarFicha(&quot;"+id+"&quot;)' style=\"background:#e31e24;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:12px\">✏️ Editar</button>";}
  
  html += "</div>";
  if (e.video_youtube) {
    html += "<div style=\"position:relative;width:100%;padding-bottom:56.25%;margin-bottom:12px;border-radius:10px;overflow:hidden\"><iframe src=\"" + e.video_youtube + "\" style=\"position:absolute;top:0;left:0;width:100%;height:100%;border:none\" allowfullscreen></iframe></div>";
  } else if (e.imagen_inicio || e.imagen_fin || e.imagen) {
    var img1 = e.imagen_inicio || e.imagen || "";
    var img2 = e.imagen_fin || e.imagen2 || e.imagen_inicio || e.imagen || "";
    var filtro = (e.invertir === false || e.grupo === "estiramientos") ? "none" : "invert(1)";
    html += "<div style=\"background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:12px;text-align:center;padding:16px;position:relative\">";
    html += "<img id=\"enc-anim-img\" src=\"" + img1 + "\" style=\"max-width:100%;height:350px;width:auto;object-fit:contain;object-position:center bottom;filter:" + filtro + "\" data-img1=\"" + img1 + "\" data-img2=\"" + img2 + "\">";
    html += "<div style=\"position:absolute;bottom:6px;right:8px;font-size:10px;color:#e31e24;font-weight:700;opacity:0.7\">DT-APP</div></div>";
    if (img1 !== img2) {
      setTimeout(function() {
        var img = document.getElementById("enc-anim-img");
        if (!img) return;
        var toggle = false;
        setInterval(function() {
          if (!document.getElementById("enc-anim-img")) return;
          toggle = !toggle;
          img.src = toggle ? img.dataset.img2 : img.dataset.img1;
        }, 1500);
      }, 100);
    }
  }
  html += "<div style=\"margin-bottom:14px\">";
  html += "<div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px\">" + (gr?gr.icon+" ":"") + e.grupo + (e.subgrupo?" - "+e.subgrupo:"") + "</div>";
  html += "<div style=\"font-size:22px;font-weight:900;color:#fff;text-transform:uppercase;line-height:1.1;margin-bottom:8px\">" + e.nombre + "</div>";
  html += "<div style=\"display:flex;gap:6px;flex-wrap:wrap\">";
  if (e.nivel) html += "<span style=\"padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;background:" + nb + ";color:" + nc + "\">" + e.nivel + "</span>";
  if (e.equipamiento) html += "<span style=\"padding:3px 8px;border-radius:4px;font-size:11px;background:#1e1e1e;color:var(--texto-medio);border:1px solid #333\">" + e.equipamiento + "</span>";
  html += "</div></div>";
  if ((e.musculos_principales||[]).length > 0 || (e.musculos_secundarios||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Musculos</div><div style=\"display:flex;flex-wrap:wrap;gap:6px\">";
    (e.musculos_principales||[]).forEach(function(m){html += "<span style=\"padding:4px 10px;border-radius:6px;font-size:12px;background:rgba(227,30,36,0.15);border:1px solid rgba(227,30,36,0.4);color:#ff6b6b\">&#11088; " + m + "</span>";});
    (e.musculos_secundarios||[]).forEach(function(m){html += "<span style=\"padding:4px 10px;border-radius:6px;font-size:12px;background:var(--gris);border:1px solid var(--borde);color:var(--texto-suave)\">" + m + "</span>";});
    html += "</div></div>";
  }
  if ((e.ejecucion||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Ejecucion</div>";
    e.ejecucion.forEach(function(paso,i){
      html += "<div style=\"display:flex;gap:10px;margin-bottom:10px\"><div style=\"width:24px;height:24px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px\">" + (i+1) + "</div><div style=\"font-size:13px;color:var(--texto-suave);line-height:1.5\">" + paso + "</div></div>";
    });
    html += "</div>";
  }
  if ((e.errores_comunes||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Errores comunes</div>";
    e.errores_comunes.forEach(function(err){
      html += "<div style=\"display:flex;gap:8px;margin-bottom:8px\"><span style=\"color:#ffab40;font-size:14px;flex-shrink:0\">&#9888;</span><div style=\"font-size:13px;color:var(--texto-suave);line-height:1.5\">" + err + "</div></div>";
    });
    html += "</div>";
  }
  if ((e.variantes||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Variantes</div><div style=\"display:flex;gap:8px;flex-wrap:wrap\">";
    e.variantes.forEach(function(v){
      var ve = (window._encEjercicios||[]).find(function(x){return x.id===v;});
      html += "<div onclick=\"encAbrirFicha(&quot;" + v + "&quot;)\" style=\"padding:6px 12px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;font-size:12px;color:#fff;cursor:pointer\">" + (ve?ve.nombre:v) + "</div>";
    });
    html += "</div></div>";
  }
  cont.innerHTML = html;
}

function entCerrarTerminos() {
  var p = document.getElementById("ent-terminos-panel");
  if (p) p.remove();
}
function entCerrarTerminosCompletos() {
  var p = document.getElementById("ent-terminos-full");
  if (p) p.remove();
}
function entVerTerminos() {
  var el = document.createElement("div");
  el.id = "ent-terminos-panel";
  el.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:#0a0a0a;z-index:100000;overflow-y:auto;display:flex;flex-direction:column";
  var h = "";
  h += "<div style='background:#111;border-bottom:2px solid #e31e24;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;position:sticky;top:0;z-index:2'>";
  h += "<button onclick='entCerrarTerminos()' style='background:transparent;border:none;color:#e31e24;font-size:20px;cursor:pointer'>&#8592;</button>";
  h += "<span style='font-size:15px;font-weight:700;color:#fff'>T&eacute;rminos y Condiciones</span></div>";
  h += "<div style='padding:20px;color:var(--texto-suave);font-size:13px;line-height:1.7;display:flex;flex-direction:column;gap:16px'>";
  h += "<div style='text-align:center;padding:16px;background:#111;border-radius:14px;border:1px solid #1a1a1a'>";
  h += "<div style='font-size:16px;font-weight:900;color:#e31e24;margin-bottom:4px'>DT-APP</div>";
  h += "<div style='font-size:11px;color:#555'>@dt_entrenamientos &middot; Gesti&oacute;n Deportiva Digital</div>";
  h += "<div style='font-size:10px;color:#333;margin-top:4px'>Colombia &middot; Mayo 2026</div></div>";
  h += "<div style='background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:16px'>";
  h += "<div style='font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px'>Resumen ejecutivo</div>";
  h += "<div style='font-size:12px;color:var(--texto-medio);line-height:1.8'>";
  h += "&#9679; DT-APP es herramienta de gesti&oacute;n deportiva. No es IPS ni provee servicios m&eacute;dicos.<br>";
  h += "&#9679; Los pagos entre cliente y entrenador son directos. DT-APP no intermedia.<br>";
  h += "&#9679; Los datos se almacenan localmente. DT-APP no tiene acceso a ellos.<br>";
  h += "&#9679; El entrenador es responsable del contenido que crea y sus certificaciones.<br>";
  h += "&#9679; DT-APP desaprueba planes gen&eacute;ricos sin fundamento t&eacute;cnico.<br>";
  h += "&#9679; Los planes alimentarios son orientativos y no reemplazan al nutricionista.";
  h += "</div></div>";
  h += "<button onclick='entVerTerminosCompletos()' style='background:#1a1a1a;border:1px solid #e31e24;border-radius:12px;color:#e31e24;font-size:13px;font-weight:700;cursor:pointer;padding:14px;width:100%'>&#128196; Ver documento legal completo</button>";
  h += "<div style='font-size:10px;color:#333;text-align:center'>Al usar DT-APP aceptas estos t&eacute;rminos.</div>";
  h += "</div>";
  el.innerHTML = h;
  document.body.appendChild(el);
}
function entVerTerminosCompletos() {
  var el = document.createElement("div");
  el.id = "ent-terminos-full";
  el.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:#0a0a0a;z-index:100001;overflow-y:auto;display:flex;flex-direction:column";
  var h = "";
  h += "<div style='background:#111;border-bottom:2px solid #e31e24;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;position:sticky;top:0;z-index:2'>";
  h += "<button onclick='entCerrarTerminosCompletos()' style='background:transparent;border:none;color:#e31e24;font-size:20px;cursor:pointer'>&#8592;</button>";
  h += "<span style='font-size:14px;font-weight:700;color:#fff'>Corpus Legal &middot; DT-APP</span></div>";
  h += "<div style='padding:20px;color:var(--texto-suave);font-size:12px;line-height:1.8;display:flex;flex-direction:column;gap:20px'>";
  h += "<div style='font-size:10px;color:var(--texto-medio);text-align:center'>DT-APP &middot; @dt_entrenamientos &middot; Colombia &middot; Mayo 2026<br>Marco: C&oacute;d. Comercio &middot; Ley 1480/2011 &middot; Ley 1581/2012 &middot; Decreto 1074/2015 &middot; Ley 527/1999</div>";
  h += "<div><div style='font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px'>1. T&eacute;rminos y Condiciones</div><div style='color:#aaa'>";
  h += "<b style='color:#fff'>Cl. 1.1.</b> Contrato de adhesi&oacute;n electr&oacute;nico v&aacute;lido conforme Ley 527/1999. El uso implica aceptaci&oacute;n incondicional.<br><br>";
  h += "<b style='color:#fff'>Cl. 1.2.</b> DT-APP es exclusivamente herramienta SaaS de gesti&oacute;n deportiva. No es IPS ni provee servicios m&eacute;dicos.<br><br>";
  h += "<b style='color:#fff'>Cl. 1.3.</b> Acceso restringido a mayores de 18 a&ntilde;os. Menores requieren autorizaci&oacute;n de representante legal.<br><br>";
  h += "<b style='color:#fff'>Cl. 1.4.</b> Pagos entre entrenador y cliente son directos. DT-APP no intermedia. Aportes al Plan Premium son voluntarios y no reembolsables.<br><br>";
  h += "<b style='color:#fff'>Cl. 1.5.</b> C&oacute;digo fuente y marcas protegidos por Ley 23/1982 y Ley 1915/2018. Licencia personal, revocable y no transferible.<br><br>";
  h += "<b style='color:#fff'>Cl. 1.6.</b> Prohibido usar la plataforma para fines ilegales o ajenos al acondicionamiento f&iacute;sico.</div></div>";
  h += "<div><div style='font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px'>2. Privacidad y Datos Personales</div><div style='color:#aaa'>";
  h += "<b style='color:#fff'>Cl. 2.1.</b> Cumple Ley 1581/2012 y Decreto 1074/2015.<br><br>";
  h += "<b style='color:#fff'>Cl. 2.2.</b> La informaci&oacute;n se almacena en infraestructura controlada por el Entrenador. DT-APP no comparte datos con terceros ni los utiliza con fines distintos a la prestaci&oacute;n del servicio.<br><br>";
  h += "<b style='color:#fff'>Cl. 2.3.</b> El Entrenador es Responsable del Tratamiento. DT-APP es proveedor tecnol&oacute;gico sin acceso a los datos.<br><br>";
  h += "<b style='color:#fff'>Cl. 2.4.</b> El Cliente autoriza al Entrenador a visualizar sus datos con fines deportivos. El Entrenador no podr&aacute; transferirlos a terceros.<br><br>";
  h += "<b style='color:#fff'>Cl. 2.5.</b> Solicitudes de supresi&oacute;n de datos deben dirigirse al Entrenador.<br><br>";
  h += "<b style='color:#fff'>Cl. 2.6.</b> Cada usuario es responsable de la seguridad de su dispositivo.</div></div>";
  h += "<div><div style='font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px'>3. Almacenamiento Local</div>";
  h += "<div style='color:#aaa'>DT-APP no implementa cookies de rastreo. Usa LocalStorage funcional para sesi&oacute;n, plantillas e historial deportivo. El usuario puede eliminar estos datos desde configuraci&oacute;n del dispositivo.</div></div>";
  h += "<div><div style='font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px'>4. Descargo de Responsabilidad</div><div style='color:#aaa'>";
  h += "<b style='color:#fff'>Cl. 4.1.</b> DT-APP no provee asesoramiento m&eacute;dico.<br><br>";
  h += "<b style='color:#fff'>Cl. 4.2.</b> El Cliente asume los riesgos de la pr&aacute;ctica f&iacute;sica. DT-APP no responde por lesiones.<br><br>";
  h += "<b style='color:#fff'>Cl. 4.3.</b> Los planes alimentarios son orientativos. No reemplazan al nutricionista certificado.<br><br>";
  h += "<b style='color:#fff'>Cl. 4.4.</b> Es responsabilidad del Cliente verificar certificaciones del Entrenador. DT-APP desaprueba planes gen&eacute;ricos sin fundamento t&eacute;cnico.<br><br>";
  h += "<b style='color:#fff'>Cl. 4.5.</b> Toda controversia se rige por leyes de Colombia. Jurisdicci&oacute;n: Medell&iacute;n.</div></div>";
  h += "<div style='font-size:10px;color:#333;text-align:center;padding:8px 0'>Al usar DT-APP aceptas la totalidad de este Corpus Legal.<br>DT-APP &middot; @dt_entrenamientos &middot; Colombia, 2026</div>";
  h += "</div>";
  el.innerHTML = h;
  document.body.appendChild(el);
}

function tcAbrirConfig() {
  if (document.getElementById('tc-config-panel')) { document.getElementById('tc-config-panel').remove(); return; }
  var tema = localStorage.getItem('dt_tema') === 'claro';
  var sonidos = localStorage.getItem('tc-sonidos') !== 'off';
  var uid = localStorage.getItem('dt_cliente_id');
  var el = document.createElement('div');
  el.id = 'tc-config-panel';
  el.style.position = 'fixed';
  el.style.top = '0';
  el.style.left = '0';
  el.style.right = '0';
  el.style.bottom = '0';
  el.style.background = 'var(--fondo)';
  el.style.zIndex = '99999';
  el.style.overflowY = 'auto';
  el.style.display = 'flex';
  el.style.flexDirection = 'column';

  var header = document.createElement('div');
  header.style.cssText = 'background:var(--card);backdrop-filter:blur(16px);border-bottom:2px solid #e31e24;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0';
  var btnVolver = document.createElement('button');
  btnVolver.innerHTML = '&#8592;';
  btnVolver.style.cssText = 'background:transparent;border:none;color:#e31e24;font-size:20px;cursor:pointer';
  btnVolver.onclick = function(){ document.getElementById('tc-config-panel').remove(); };
  var titulo = document.createElement('span');
  titulo.style.cssText = 'font-size:15px;font-weight:700;color:var(--texto)';
  titulo.textContent = 'Configuración';
  header.appendChild(btnVolver);
  header.appendChild(titulo);
  el.appendChild(header);

  var body = document.createElement('div');
  body.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:12px';

  function seccion(txt) {
    var d = document.createElement('div');
    d.style.cssText = 'font-size:11px;font-weight:700;color:#e31e24;text-transform:uppercase;letter-spacing:1px;margin-top:8px';
    d.innerHTML = txt;
    body.appendChild(d);
  }

  function fila(titulo, sub, btnTxt, btnBg, btnId, fnClick) {
    var d = document.createElement('div');
    d.style.cssText = 'background:var(--card);border:1px solid var(--borde);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center';
    var izq = document.createElement('div');
    var t = document.createElement('div');
    t.style.cssText = 'font-size:13px;font-weight:700;color:var(--texto)';
    t.innerHTML = titulo;
    izq.appendChild(t);
    if (sub) {
      var s = document.createElement('div');
      s.style.cssText = 'font-size:11px;color:var(--texto-medio)';
      s.innerHTML = sub;
      if (btnId) s.id = btnId + '-lbl';
      izq.appendChild(s);
    }
    d.appendChild(izq);
    var btn = document.createElement('button');
    btn.style.cssText = 'background:' + btnBg + ';border:1px solid #333;border-radius:20px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;padding:6px 16px';
    btn.innerHTML = btnTxt;
    if (btnId) btn.id = btnId;
    if (fnClick) btn.onclick = function(){ fnClick(btn); };
    d.appendChild(btn);
    body.appendChild(d);
  }

  function filaInfo(titulo, sub) {
    var d = document.createElement('div');
    d.style.cssText = 'background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center';
    var t = document.createElement('div');
    t.style.cssText = 'font-size:13px;font-weight:700;color:#fff';
    t.innerHTML = titulo;
    d.appendChild(t);
    var s = document.createElement('span');
    s.style.cssText = 'font-size:11px;color:' + (sub === 'ok' ? '#4caf50' : '#555');
    s.innerHTML = sub === 'ok' ? '&#10003;' : sub;
    d.appendChild(s);
    body.appendChild(d);
  }

  seccion('&#127912; Personalización');
  fila('Tema', tema?'Modo claro':'Modo oscuro', tema?'&#9728; Claro':'&#127769; Oscuro', tema?'#e31e24':'#1a1a1a', 'tc-cfg-tema-btn', tcToggleTema);
  fila('Sonidos', 'Beeps y alertas', sonidos?'&#128276; On':'&#128277; Off', sonidos?'#e31e24':'#1a1a1a', 'tc-cfg-sonido-btn', tcToggleSonidos);

  seccion('&#128279; Entrenador');

  // Tarjeta vinculación entrenador
  var dVinc = document.createElement('div');
  dVinc.style.cssText = 'background:var(--card);border:1px solid var(--borde);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px';
  dVinc.id = 'tc-vinc-card';

  fetch('/api/cuentas/cliente?id=' + uid)
    .then(r => r.json())
    .then(cli => {
      var entNombre = cli.entrenador_nombre || '';
      var entId = cli.entrenador_id || '';
      var html2 = '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:4px">&#127919; Entrenador vinculado</div>';
      if (entId) {
        html2 += '<div style="font-size:12px;color:#4caf50;margin-bottom:8px">&#10003; ' + (entNombre || entId) + '</div>';
        html2 += '<div style="font-size:11px;color:var(--texto-medio);margin-bottom:8px">¿Querés cambiar de entrenador?</div>';
      } else {
        html2 += '<div style="font-size:12px;color:#e31e24;margin-bottom:8px">&#9888; Sin entrenador asignado</div>';
      }
      html2 += '<input id="tc-vinc-codigo" type="text" placeholder="Código del entrenador" style="background:var(--fondo);border:1px solid var(--borde);border-radius:10px;padding:10px 12px;color:var(--texto);font-size:13px;outline:none;width:100%;box-sizing:border-box;text-transform:uppercase;letter-spacing:2px">';
      html2 += '<div id="tc-vinc-status" style="font-size:11px;text-align:center;min-height:14px"></div>';
      html2 += '<button onclick="tcVincularEntrenador()" style="background:#e31e24;border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;padding:11px;cursor:pointer;width:100%;box-sizing:border-box">' + (entId ? '&#128260; Cambiar entrenador' : '&#128279; Vincularme') + '</button>';
      dVinc.innerHTML = html2;
    }).catch(() => {
      dVinc.innerHTML = '<div style="font-size:12px;color:#555">No se pudo cargar info del entrenador</div>';
    });

  body.appendChild(dVinc);

  seccion('&#128179; Mi Cuenta');
  var pagoCont = document.createElement('div');
  pagoCont.id = 'tc-config-pago-ent';
  pagoCont.style.cssText = 'background:var(--card);border:1px solid var(--borde);border-radius:14px;padding:16px';
  pagoCont.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:4px">Pago al entrenador</div><div style="font-size:12px;color:var(--texto-medio)">Cargando...</div>';
  body.appendChild(pagoCont);
  // PLAN PREMIUM
  var premDiv = document.createElement('div');
  premDiv.style.cssText = 'background:var(--card);border:1px solid var(--borde);border-radius:14px;padding:16px';
  var premEstado = (_tcUsuario && _tcUsuario.premium) ? '✅ Activo' : '⭐ Activar';
  var premColor = (_tcUsuario && _tcUsuario.premium) ? '#4caf50' : '#e31e24';
  premDiv.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:8px">Plan Premium — $9.999/mes</div>' +
    '<div style="font-size:12px;color:var(--texto-medio);margin-bottom:12px">Acceso completo a la app</div>' +
    ((_tcUsuario && _tcUsuario.premium) ?
      '<div style="color:' + premColor + ';font-weight:700">✅ Premium activo</div>' +
      (_tcUsuario.premium_hasta ? '<div style="font-size:11px;color:var(--texto-medio);margin-top:4px">Activo hasta: ' + _tcUsuario.premium_hasta + '</div>' : '') :
      '<div style="margin-bottom:12px"><button onclick="var s=JSON.parse(localStorage.getItem(\'dt_sesion\')||\'{}\');var uid=s.id;if(!uid){alert(\'Error: inicia sesión\');return;}window.open(\'/premium-cliente.html?uid=\'+uid,\'_blank\')" style="width:100%;background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;padding:11px;box-sizing:border-box">💳 Ver planes Premium</button></div>' +
      '<div style="display:flex;gap:8px"><input id="tc-cod-premium" placeholder="¿Ya tienes un código? Ingrésalo" style="flex:1;background:var(--card);border:1px solid var(--borde);border-radius:8px;padding:8px 10px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"><button onclick="tcActivarPremiumConfig()" style="background:var(--gris);border:none;border-radius:8px;color:var(--texto);font-size:12px;font-weight:700;cursor:pointer;padding:8px 12px;flex-shrink:0">Activar</button></div>'
    );
  body.appendChild(premDiv);
  
  // APORTE AL ENTRENADOR
  var aportDiv = document.createElement('div');
  aportDiv.style.cssText = 'background:var(--card);border:1px solid var(--borde);border-radius:14px;padding:16px';
  aportDiv.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:8px">🏆 Apoya a tu entrenador</div>' +
    '<div style="font-size:12px;color:var(--texto-medio);line-height:1.6">Próximamente podrás aportar directamente a tu entrenador desde aquí.</div>' +
    '<div style="width:100%;margin-top:12px;background:var(--gris);border:1px solid var(--borde);border-radius:8px;color:var(--texto-medio);font-size:13px;font-weight:700;padding:10px;box-sizing:border-box;text-align:center">🔒 Próximamente</div>';
  body.appendChild(aportDiv);

  // APORTE AL DESARROLLADOR
  var devDiv = document.createElement('div');
  devDiv.style.cssText = 'background:var(--card);border:1px solid var(--borde);border-radius:14px;padding:16px';
  devDiv.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:8px">💡 Sugerencias para DT-APP</div>' +
    '<div style="font-size:12px;color:var(--texto-medio);line-height:1.6;margin-bottom:12px">¿Te gusta la app? Puedes apoyar su desarrollo con lo que quieras. Cada aporte ayuda a seguir mejorando.</div>' +
    '<button onclick="tcAportarDesarrollador()" style="width:100%;background:#0a1a2a;border:1px solid #2196f3;border-radius:8px;color:#2196f3;font-size:13px;font-weight:700;cursor:pointer;padding:10px;box-sizing:border-box">☕ 💡 Sugerencias</button>';
  body.appendChild(devDiv);

  seccion('&#128221; Información');
  fila('Términos y condiciones', null, '&#8250;', 'transparent', null, function(){ tcVerTerminos(); });
  filaInfo('DT-APP &middot; Versión 1.0', 'ok');

  el.appendChild(body);
  document.body.appendChild(el);

  if (uid) {
    fetch('/api/admin/' + uid + '?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(function(r){ return r.json(); }).then(function(d) {
      var box = document.getElementById('tc-config-pago-ent');
      var usr = window._tcUsuario || {};
      var estado = usr.estado_pago || 'aldia';
      var color = estado==='aldia'?'#4caf50':estado==='proximo'?'#ff9800':'#f44336';
      var label = estado==='aldia'?'&#9989; Al día':estado==='proximo'?'&#9888; Próximo':'&#10060; Vencido';
      var precio = (d && d.precio) ? d.precio + ' ' + (d.moneda||'') : '';
      box.innerHTML = '<div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">Pago al entrenador</div><div style="display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--texto-medio)">' + precio + '</span><span style="font-size:12px;font-weight:700;color:' + color + '">' + label + '</span></div>';
    }).catch(function(){});
  }
}

function tcCerrarTerminos() { var p = document.getElementById('tc-terminos-panel'); if(p) p.remove(); }

function tcVerTerminos() {
  var el = document.createElement('div');
  el.id = 'tc-terminos-panel';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#0a0a0a;z-index:100000;overflow-y:auto;display:flex;flex-direction:column';
  var header = document.createElement('div');
  header.style.cssText = 'background:#111;border-bottom:2px solid #e31e24;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;position:sticky;top:0;z-index:2';
  var btnV = document.createElement('button');
  btnV.innerHTML = '&#8592;';
  btnV.style.cssText = 'background:transparent;border:none;color:#e31e24;font-size:20px;cursor:pointer';
  btnV.onclick = tcCerrarTerminos;
  var tit = document.createElement('span');
  tit.style.cssText = 'font-size:15px;font-weight:700;color:#fff';
  tit.textContent = 'Términos y Condiciones';
  header.appendChild(btnV);
  header.appendChild(tit);
  el.appendChild(header);
  var cont = document.createElement('div');
  cont.style.cssText = 'padding:20px;color:var(--texto-suave);font-size:13px;line-height:1.7;display:flex;flex-direction:column;gap:16px';
  cont.innerHTML = '<div style="text-align:center;padding:16px;background:#111;border-radius:14px;border:1px solid #1a1a1a"><div style="font-size:16px;font-weight:900;color:#e31e24;margin-bottom:4px">DT-APP</div><div style="font-size:11px;color:var(--texto-medio)">@dt_entrenamientos &middot; Gestión Deportiva Digital</div><div style="font-size:10px;color:#333;margin-top:4px">Colombia &middot; Mayo 2026</div></div><div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:16px"><div style="font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px">Resumen ejecutivo</div><div style="font-size:12px;color:var(--texto-medio);line-height:1.8">&#9679; DT-APP es una herramienta de gestión deportiva. No es IPS ni provee servicios médicos.<br>&#9679; Los pagos entre cliente y entrenador son acuerdos directos. DT-APP no intermedia.<br>&#9679; Los datos se almacenan localmente. DT-APP no tiene acceso a ellos.<br>&#9679; El cliente asume los riesgos de la práctica física. Consulta un médico antes de entrenar.<br>&#9679; Verifica siempre las certificaciones de tu entrenador antes de contratarlo.<br>&#9679; Los planes alimentarios son orientativos y no reemplazan al nutricionista.</div></div>';
  var btnCompleto = document.createElement('button');
  btnCompleto.style.cssText = 'background:#1a1a1a;border:1px solid #e31e24;border-radius:12px;color:#e31e24;font-size:13px;font-weight:700;cursor:pointer;padding:14px;width:100%';
  btnCompleto.innerHTML = '&#128196; Ver documento legal completo';
  btnCompleto.onclick = tcVerCompletosTerminos;
  cont.appendChild(btnCompleto);
  var pie = document.createElement('div');
  pie.style.cssText = 'font-size:10px;color:#333;text-align:center';
  pie.textContent = 'Al usar DT-APP aceptas estos términos.';
  cont.appendChild(pie);
  el.appendChild(cont);
  document.body.appendChild(el);
}

function tcVerCompletosTerminos() {
  var el = document.createElement('div');
  el.id = 'tc-terminos-full';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#0a0a0a;z-index:100001;overflow-y:auto;display:flex;flex-direction:column';
  var header = document.createElement('div');
  header.style.cssText = 'background:#111;border-bottom:2px solid #e31e24;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;position:sticky;top:0;z-index:2';
  var btnV = document.createElement('button');
  btnV.innerHTML = '&#8592;';
  btnV.style.cssText = 'background:transparent;border:none;color:#e31e24;font-size:20px;cursor:pointer';
  btnV.onclick = function(){ document.getElementById('tc-terminos-full').remove(); };
  var tit = document.createElement('span');
  tit.style.cssText = 'font-size:14px;font-weight:700;color:#fff';
  tit.textContent = 'Corpus Legal · DT-APP';
  header.appendChild(btnV);
  header.appendChild(tit);
  el.appendChild(header);
  var cont = document.createElement('div');
  cont.style.cssText = 'padding:20px;color:var(--texto-suave);font-size:12px;line-height:1.8;display:flex;flex-direction:column;gap:20px';
  cont.innerHTML = '<div style="font-size:10px;color:var(--texto-medio);text-align:center">DT-APP &middot; @dt_entrenamientos &middot; Colombia &middot; Mayo 2026<br>Marco: Cód. Comercio &middot; Ley 1480/2011 &middot; Ley 1581/2012 &middot; Decreto 1074/2015 &middot; Ley 527/1999</div><div><div style="font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px">1. Términos y Condiciones</div><div style="color:var(--texto-medio)"><b style="color:#fff">Cl. 1.1.</b> Contrato de adhesión electrónico válido conforme Ley 527/1999 y Cód. Comercio. El uso implica aceptación incondicional.<br><br><b style="color:#fff">Cl. 1.2.</b> DT-APP es exclusivamente herramienta SaaS de gestión deportiva. No es IPS, no provee servicios médicos ni nutricionales clínicos.<br><br><b style="color:#fff">Cl. 1.3.</b> Acceso restringido a mayores de 18 años. Menores requieren autorización de representante legal.<br><br><b style="color:#fff">Cl. 1.4.</b> Pagos entre entrenador y cliente son directos y externos. DT-APP no intermedia. Aportes al Plan Premium son voluntarios y no reembolsables.<br><br><b style="color:#fff">Cl. 1.5.</b> Código fuente, diseños y marcas protegidos por Ley 23/1982, Ley 1915/2018 y Decisión Andina 486/2000. Licencia personal, revocable y no transferible.<br><br><b style="color:#fff">Cl. 1.6.</b> Prohibido usar la plataforma para difundir material ilegal, alterar su funcionamiento o fines ajenos al acondicionamiento físico.</div></div><div><div style="font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px">2. Privacidad y Datos Personales</div><div style="color:var(--texto-medio)"><b style="color:#fff">Cl. 2.1.</b> Cumple Ley 1581/2012 y Decreto 1074/2015.<br><br><b style="color:#fff">Cl. 2.2.</b> La información se almacena en infraestructura controlada por el Entrenador. DT-APP no comparte datos con terceros ni los utiliza con fines distintos a la prestación del servicio.<br><br><b style="color:#fff">Cl. 2.3.</b> El Entrenador es Responsable del Tratamiento. DT-APP es proveedor tecnológico sin acceso a los datos.<br><br><b style="color:#fff">Cl. 2.4.</b> Al vincularse, el Cliente autoriza al Entrenador a visualizar sus datos con fines deportivos. El Entrenador no podrá transferirlos a terceros.<br><br><b style="color:#fff">Cl. 2.5.</b> Solicitudes de supresión de datos deben dirigirse directamente al Entrenador.<br><br><b style="color:#fff">Cl. 2.6.</b> Cada usuario es responsable de la seguridad de su dispositivo.</div></div><div><div style="font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px">3. Almacenamiento Local</div><div style="color:var(--texto-medio)">DT-APP no implementa cookies de rastreo. Usa LocalStorage funcional para sesión, plantillas e historial deportivo. El usuario puede eliminar estos datos desde configuración del dispositivo.</div></div><div><div style="font-size:13px;font-weight:700;color:#e31e24;margin-bottom:8px">4. Descargo de Responsabilidad</div><div style="color:var(--texto-medio)"><b style="color:#fff">Cl. 4.1.</b> DT-APP no provee asesoramiento médico. No reemplaza consulta profesional.<br><br><b style="color:#fff">Cl. 4.2.</b> El Cliente asume voluntariamente los riesgos de la práctica física. DT-APP no responde por lesiones derivadas de ejecución incorrecta, preexistencias médicas o condiciones de instalaciones.<br><br><b style="color:#fff">Cl. 4.3.</b> Los planes alimentarios son orientativos. No reemplazan al nutricionista certificado.<br><br><b style="color:#fff">Cl. 4.4.</b> Es responsabilidad del Cliente verificar certificaciones del Entrenador. DT-APP desaprueba planes genéricos sin fundamento técnico.<br><br><b style="color:#fff">Cl. 4.5.</b> Toda controversia se rige por leyes de Colombia. Jurisdicción: tribunales de Medellín.</div></div><div style="font-size:10px;color:#333;text-align:center;padding:8px 0">Al usar DT-APP aceptas la totalidad de este Corpus Legal.<br>DT-APP &middot; @dt_entrenamientos &middot; Colombia, 2026</div>';
  el.appendChild(cont);
  document.body.appendChild(el);
}

function tcToggleTema(btn) {
  document.body.classList.toggle('modo-claro');
  var claro = document.body.classList.contains('modo-claro');
  localStorage.setItem('dt_tema', claro ? 'claro' : 'oscuro');
  localStorage.setItem('tema', claro ? 'claro' : 'oscuro');
  btn.innerHTML = claro ? '&#9728; Claro' : '&#127769; Oscuro';
  btn.style.background = claro ? '#e31e24' : '#1a1a1a';
  var lbl = document.getElementById('tc-cfg-tema-btn-lbl');
  if (lbl) lbl.textContent = claro ? 'Modo claro' : 'Modo oscuro';
}

function tcToggleSonidos(btn) {
  var sonidos = localStorage.getItem('tc-sonidos') !== 'off';
  localStorage.setItem('tc-sonidos', sonidos ? 'on' : 'off');
  btn.innerHTML = sonidos ? '&#128276; On' : '&#128277; Off';
  btn.style.background = sonidos ? '#e31e24' : '#1a1a1a';
}

// ═══════════════════════════════
function checkGoogleLogin() {
  // Si ya tiene sesión activa, entrar directo
  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  const rol = localStorage.getItem('dt_rol');
  if (sesion.email && rol) {
    if (sesion.roles && sesion.roles.length > 0) {
      mostrarSeleccionRol({nombre: sesion.nombre||sesion.email, email: sesion.email, roles: sesion.roles});
      return true;
    }
    // Sesión sin roles — buscarlos
    
    fetch('/api/auth/roles?email=' + encodeURIComponent(sesion.email))
      .then(r=>r.json()).then(d => {
        d.nombre = d.nombre || sesion.nombre || sesion.email;
        const s = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
        s.roles = d.roles;
        localStorage.setItem('dt_sesion', JSON.stringify(s));
        setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
        mostrarSeleccionRol(d);
      }).catch(() => {
        if (rol === 'entrenador') mostrarApp();
      });
    return true;
    if (rol === 'entrenador') { mostrarApp(); return true; }
    if (rol === 'cliente') {
      const id = localStorage.getItem('dt_cliente_id') || sesion.usuario_id;
      if (id) {
        const tc = document.getElementById('terminal-cliente-app');
        if (tc && tc.style.display === 'flex') return true;
        mostrarTerminalCliente(id); return true;
      }
    }
  }
  // Si viene de Google login reciente
  const data = localStorage.getItem('dt_google_data');
  if (!data) return false;
  const d = JSON.parse(data);
  mostrarSeleccionRol(d);
  return true;
}

function mostrarSeleccionRol(d) {
  const panel = document.getElementById('pantalla-seleccion-rol');
  if (!panel) return;
  // Ocultar todo lo demás
  ['pantalla-rol','pantalla-login-entrenador','pantalla-login-cliente','app-entrenador','terminal-cliente-app'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('sel-bienvenida').textContent = '¡Hola, ' + (d.nombre || 'Usuario') + '!';
  const cont = document.getElementById('sel-botones');
  cont.innerHTML = '';
  // Último rol usado — entrar directo si ya existe
  const ultimoRol = localStorage.getItem('dt_ultimo_rol');
  if (ultimoRol) {
    const rolAuto = d.roles.find(r => r.rol === ultimoRol);
    if (rolAuto) {
      seleccionarRolGoogle(Object.assign({}, rolAuto, {email: d.email, nombre: d.nombre}));
      return;
    }
  }
  d.roles.forEach(r => {
    const btn = document.createElement('button');
    const esUltimo = ultimoRol === r.rol;
    btn.style.cssText = 'width:100%;background:' + (r.rol==='entrenador'?'linear-gradient(135deg,#e31e24,#a01018)':'linear-gradient(135deg,#1a1a1a,#111)') + ';border:2px solid ' + (esUltimo?'#e31e24':'#2a2a2a') + ';border-radius:16px;color:#fff;font-size:15px;font-weight:700;padding:18px 16px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(0,0,0,0.3)';
    btn.innerHTML = (r.rol==='entrenador' ? '🏋️ <div><div style="font-size:15px">Entrenador</div><div style="font-size:11px;opacity:0.7;font-weight:400">Panel de gestión</div></div>' : '👤 <div><div style="font-size:15px">Cliente</div><div style="font-size:11px;opacity:0.7;font-weight:400">Mi entrenamiento</div></div>');
    if (esUltimo) btn.innerHTML += '<span style="margin-left:auto;font-size:10px;opacity:0.7">último usado</span>';
    btn.onclick = function(){ seleccionarRolGoogle(Object.assign({}, r, {email: d.email, nombre: d.nombre})); };
    cont.appendChild(btn);
  });
  panel.style.display = 'flex';
}

async function seleccionarRolGoogle(r) {
  const googleData = JSON.parse(localStorage.getItem('dt_google_data') || '{}');
  const sesionActual = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  const data = Object.assign({}, sesionActual, googleData);
  let rolData = r;
  // Si es usuario nuevo o no tiene ese rol, crearlo en el backend
  if (!r.id) {
    try {
      const res = await fetch('/api/auth/crear-perfil', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: data.email, nombre: data.nombre, rol: r.rol })
      });
      const d = await res.json();
      if (d.ok) rolData = d;
    } catch(e) { console.error('Error creando perfil:', e); }
  }
  localStorage.setItem('dt_sesion', JSON.stringify({ok:true, rol:rolData.rol, id:rolData.id, email:data.email||r.email||'', nombre:rolData.nombre||data.nombre, usuario_id:rolData.usuario_id||rolData.id, roles:data.roles||[]}));
  setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
  localStorage.setItem('dt_rol', rolData.rol);
  localStorage.setItem('dt_ultimo_rol', rolData.rol);
  if (rolData.rol === 'cliente') localStorage.setItem('dt_cliente_id', rolData.usuario_id || rolData.id);
  localStorage.removeItem('dt_google_data');
  const panel = document.getElementById('pantalla-seleccion-rol');
  if (panel) panel.style.display = 'none';
  window._tcCargando = false;
  if (rolData.rol === 'entrenador') mostrarApp();
  else mostrarTerminalCliente(rolData.usuario_id || rolData.id);
}

function cerrarSesionGoogle() {
  // Salir → volver a selección de rol (no cerrar sesión Google)
  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  const email = sesion.email;
  const nombre = sesion.nombre;
  ['dt_sesion','dt_rol','dt_ultimo_rol','dt_cliente_id','dt_cliente_tel'].forEach(k => localStorage.removeItem(k));
  if (email) {
    fetch('/api/auth/roles?email=' + encodeURIComponent(email))
      .then(r => r.json())
      .then(d => {
        d.nombre = d.nombre || nombre;
        localStorage.setItem('dt_google_data', JSON.stringify(d));
        ['app-entrenador','tc-main','terminal-cliente'].forEach(id => { const el = document.getElementById(id); if(el) el.style.display='none'; });

        mostrarSeleccionRol(d);
      }).catch(() => location.reload());
  } else {
    location.reload();
  }
}

function cambiarRol() {
  // Ocultar terminales
  ['app-entrenador','tc-main','terminal-cliente'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
  // Si tiene roles en sesion, usarlos directamente
  if (sesion.roles && sesion.roles.length > 1) {
    mostrarSeleccionRol({nombre: sesion.nombre, email: sesion.email||'', roles: sesion.roles});
    return;
  }
  // Si tiene email, buscar en backend
  if (sesion.email) {
    fetch('/api/auth/roles?email=' + encodeURIComponent(sesion.email))
      .then(r => r.json())
      .then(d => {
        if (d.roles && d.roles.length > 0) {
          mostrarSeleccionRol(d);
        } else {
          mostrarPantalla('pantalla-rol');
        }
      }).catch(() => mostrarPantalla('pantalla-rol'));
    return;
  }
  mostrarPantalla('pantalla-rol');
}

async function tcVincularEntrenador() {
  var codigo = document.getElementById('tc-vinc-codigo');
  var st = document.getElementById('tc-vinc-status');
  if (!codigo) { toast('⚠️ No se encontró el campo de código',false); return; }
  var cod = codigo.value.trim().toUpperCase();
  if (!cod) { st.style.color='#e31e24'; st.textContent='Ingresá el código del entrenador'; return; }
  st.style.color='#aaa'; st.textContent='Verificando...';
  try {
    var uid = localStorage.getItem('dt_cliente_id');
    var sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
    var clienteId = uid || sesion.id || sesion.usuario_id;
    if (!clienteId) { st.style.color='#e31e24'; st.textContent='Error: sesión no válida'; return; }
    var r = await fetch('/api/cuentas/vincular', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ cliente_id: clienteId, codigo: cod })
    });
    var d = await r.json();
    if (d.ok) {
      st.style.color='#4caf50';
      st.textContent='✓ Vinculado con ' + d.entrenador_nombre;
      codigo.value = '';
      setTimeout(() => {
        var panel = document.getElementById('tc-config-panel');
        if (panel) panel.remove();
      }, 1500);
    } else {
      st.style.color='#e31e24';
      st.textContent = d.error || 'Código inválido';
    }
  } catch(e) {
    st.style.color='#e31e24';
    st.textContent='Error de conexión';
  }
}

// ── SUPERADMIN ──────────────────────────────────────────
let _dtVersionTaps = 0;
let _dtVersionTimer = null;

function dtVersionTap() {
  _dtVersionTaps++;
  if (_dtVersionTaps >= 7) {
    _dtVersionTaps = 0;
    const sesion = JSON.parse(localStorage.getItem('dt_sesion') || '{}');
    if (sesion.email === 'danielgaviriabotero@gmail.com') {
      abrirSuperAdmin();
    }
  }
}

async function abrirSuperAdmin() {
  let panel = document.getElementById('superadmin-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'superadmin-panel';
    panel.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:var(--fondo);z-index:99999;overflow-y:auto;';
    document.body.appendChild(panel);
  }
  panel.style.display = 'block';
  panel.innerHTML = '<div style="padding:16px"><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><button onclick="document.getElementById(&quot;superadmin-panel&quot;).style.display=&quot;none&quot;" style="background:var(--gris);border:none;border-radius:8px;color:var(--texto);padding:8px 12px;font-size:13px;cursor:pointer">← Volver</button><div style="font-size:16px;font-weight:900;color:#e31e24">⚙️ SUPERADMIN</div></div><div style="display:flex;gap:8px;margin-bottom:16px"><button id="sa-tab-convenios" onclick="saTabConvenios()" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;background:#e31e24;color:#fff">⚙️ Convenios</button><button id="sa-tab-logs" onclick="saTabLogs()" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;background:var(--gris);color:var(--texto)">🔴 Logs</button></div><div id="sa-contenido">Cargando...</div></div>';
  await cargarSuperAdmin();
}

async function cargarSuperAdmin() {
  const [entrenadores, codigos, usuariosRes] = await Promise.all([
    fetch('/api/superadmin/entrenadores').then(r=>r.json()).catch(()=>[]),
    fetch('/api/premium/codigos').then(r=>r.json()).catch(()=>[]),
    fetch('/api/usuarios').then(r=>r.json()).catch(()=>[])
  ]);
  const totalEnt = entrenadores.length;
  const entPremium = entrenadores.filter(e=>e.premium).length;
  const totalCli = usuariosRes.length;
  const cliPremium = usuariosRes.filter(u=>u.premium).length;
  const codsDisp = codigos.filter(c=>!c.usado).length;

  let html = '<div style="display:flex;flex-direction:column;gap:12px">';

  // 4 contadores
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  html += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#e31e24">'+totalEnt+'</div><div style="font-size:11px;color:var(--texto-medio)">Entrenadores</div></div>';
  html += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#f0a500">'+entPremium+'</div><div style="font-size:11px;color:var(--texto-medio)">Entrenadores Premium</div></div>';
  html += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#4a9eff">'+totalCli+'</div><div style="font-size:11px;color:var(--texto-medio)">Clientes</div></div>';
  html += '<div style="background:var(--card);border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:900;color:#4caf50">'+cliPremium+'</div><div style="font-size:11px;color:var(--texto-medio)">Clientes Premium</div></div>';
  html += '</div>';

  // Buscador
  html += '<div style="background:var(--card);border-radius:12px;padding:14px">';
  html += '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:10px">🔍 Buscar usuario por email</div>';
  html += '<div style="display:flex;gap:8px">';
  html += '<input id="sa-buscar-email" type="email" placeholder="correo@ejemplo.com" style="flex:1;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none">';
  html += '<button onclick="saBuscarUsuario()" style="background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;padding:10px 16px;cursor:pointer">Buscar</button>';
  html += '</div>';
  html += '<div id="sa-resultado-busqueda" style="margin-top:10px"></div>';
  html += '</div>';

  // Generar código
  html += '<div style="background:var(--card);border-radius:12px;padding:14px">';
  html += '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:10px">🎟️ Generar código de convenio</div>';
  html += '<input id="sa-codigo-manual" type="text" placeholder="Nombre del convenio (ej: FUERZA-CASTILLO)" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box;margin-bottom:8px;text-transform:uppercase">';
  html += '<select id="sa-duracion" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;margin-bottom:8px"><option value="7">7 días</option><option value="15">15 días</option><option value="30">30 días</option><option value="60">2 meses</option><option value="90">3 meses</option><option value="180">6 meses</option><option value="365">1 año</option><option value="0">Permanente</option></select>';
  html += '<select id="sa-tipo-codigo" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;margin-bottom:8px"><option value="cliente">👤 Para clientes</option><option value="entrenador">🏋️ Para entrenadores</option></select>';
  html += '<select id="sa-modalidad" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;margin-bottom:8px"><option value="convenio">🔄 Convenio (múltiples usos, uno por cuenta)</option><option value="unico">1️⃣ Un solo uso total</option></select>';
  html += '<button onclick="saGenerarCodigo()" style="width:100%;background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;padding:11px;cursor:pointer">Crear código de convenio</button>';
  html += '<div id="sa-codigo-resultado" style="margin-top:8px;text-align:center;font-size:13px;color:#4caf50"></div>';
  html += '</div>';

  // Códigos únicos pendientes
  const unicosPendientes = codigos.filter(c => c.es_unico && c.activo && !c.usado);
  if (unicosPendientes.length > 0) {
    html += '<div style="background:var(--card);border-radius:12px;padding:14px">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:10px">1️⃣ Códigos únicos pendientes</div>';
    unicosPendientes.forEach(function(c) {
      const tipoColor = c.tipo === 'entrenador' ? '#f0a500' : '#4a9eff';
      const tipoLabel = c.tipo === 'entrenador' ? '🏋️ Entrenador' : '👤 Cliente';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #222">';
      html += '<div style="flex:1">';
      html += '<div style="font-size:14px;font-weight:700;color:#f0a500;font-family:monospace">'+c.codigo+'</div>';
      html += '<div style="font-size:11px;color:var(--texto-medio);margin-top:2px"><span style="color:'+tipoColor+'">'+tipoLabel+'</span> · '+(c.permanente||c.dias>=99999?'Permanente':c.dias+' días')+'</div>';
      html += '</div>';
      html += '<button onclick="saBorrarConvenio(this)" data-codigo="'+c.codigo+'" style="background:#3a1a1a;border:none;border-radius:6px;color:#e31e24;font-size:11px;padding:5px 8px;cursor:pointer;margin-left:8px">Borrar</button>';
      html += '</div>';
    });
    html += '</div>';
  }

  // Convenios
  const convenios = codigos.filter(c => c.es_convenio);
  if (convenios.length > 0) {
    html += '<div style="background:var(--card);border-radius:12px;padding:14px">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--texto);margin-bottom:8px">🤝 Convenios activos</div>';
    html += '<input oninput="saFiltrarConvenios(this.value)" placeholder="🔍 Buscar convenio..." style="width:100%;background:var(--gris);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:10px">';
    html += '<div id="sa-lista-convenios">';
    convenios.forEach(function(c) {
      const hoy = new Date().toISOString().split('T')[0];
      const hoyStr = hoy;
      const usosCli = usuariosRes.filter(u => u.codigo_convenio === c.codigo && u.premium_hasta && u.premium_hasta >= hoyStr).length;
      const usosEnt = entrenadores.filter(e => e.codigo_convenio === c.codigo && e.premium_hasta && e.premium_hasta >= hoyStr).length;
      const usosTotal = usosCli + usosEnt;
      const tipoColor = c.tipo === 'entrenador' ? '#f0a500' : '#4a9eff';
      const tipoLabel = c.tipo === 'entrenador' ? '🏋️ Entrenador' : '👤 Cliente';
      html += '<div class="sa-convenio-row" style="padding:8px 0;border-bottom:1px solid #222">';
      html += '<div style="display:flex;justify-content:space-between;align-items:start">';
      html += '<div style="flex:1">';
      html += '<div style="font-size:14px;font-weight:700;color:#e31e24;font-family:monospace">'+c.codigo+'</div>';
      html += '<div style="font-size:11px;color:var(--texto-medio);margin-top:2px"><span style="color:'+tipoColor+'">'+tipoLabel+'</span> · '+(c.permanente||c.dias>=99999?'Permanente':c.dias+' días')+' · <span style="color:#4caf50">'+usosTotal+' usuarios activos</span></div>';
      html += '<div style="margin-top:4px"><span style="background:'+(c.activo?'#1a3a1a':'#3a1a1a')+';color:'+(c.activo?'#4caf50':'#e31e24')+';font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px">'+(c.activo?'✅ Activo':'🔴 Inactivo')+'</span></div>';
      html += '</div>';
      html += '<button onclick="saBorrarConvenio(this)" data-codigo="'+c.codigo+'" style="background:#3a1a1a;border:none;border-radius:6px;color:#e31e24;font-size:11px;padding:5px 8px;cursor:pointer;margin-left:8px">Borrar</button>';
      html += '</div></div>';
    });
    html += '</div></div>';
  }

  html += '</div>';
  document.getElementById('sa-contenido').innerHTML = html;
}


function saTabConvenios() {
  document.getElementById('sa-tab-convenios').style.background = '#e31e24';
  document.getElementById('sa-tab-convenios').style.color = '#fff';
  document.getElementById('sa-tab-logs').style.background = 'var(--gris)';
  document.getElementById('sa-tab-logs').style.color = 'var(--texto)';
  cargarSuperAdmin();
}

function saTabLogs() {
  document.getElementById('sa-tab-logs').style.background = '#e31e24';
  document.getElementById('sa-tab-logs').style.color = '#fff';
  document.getElementById('sa-tab-convenios').style.background = 'var(--gris)';
  document.getElementById('sa-tab-convenios').style.color = 'var(--texto)';
  cargarLogsPanel('todos');
}


async function cargarLogsPanel(filtro) {
  filtro = filtro || "todos";
  const cont = document.getElementById("sa-contenido");
  cont.innerHTML = "<div style=\"text-align:center;padding:40px;color:var(--texto-medio)\">Cargando logs...</div>";
  const data = await fetch("/api/superadmin/logs").then(function(r){return r.json();}).catch(function(){return {logs:[]};});
  const logs = data.logs || [];

  const traducciones = [
    { patron: "getaddrinfo ENOTFOUND web.whatsapp", nombre: "WhatsApp sin conexion", desc: "WhatsApp intento conectarse pero no habia internet." },
    { patron: "getaddrinfo ENOTFOUND", nombre: "Sin conexion a internet", desc: "El servidor intento conectarse a un servicio externo sin exito." },
    { patron: "printQRInTerminal", nombre: "Aviso de WhatsApp desactualizado", desc: "Una opcion de configuracion de WhatsApp quedo obsoleta. No afecta el funcionamiento." },
    { patron: "Cannot read prop", nombre: "Dato faltante en el servidor", desc: "El servidor intento leer un dato que no existia." },
    { patron: "ENOENT", nombre: "Archivo no encontrado", desc: "El servidor busco un archivo que no existe." },
    { patron: "SyntaxError", nombre: "Error de codigo", desc: "Hay un error de sintaxis en el codigo o en un archivo JSON." },
    { patron: "ECONNREFUSED", nombre: "Conexion rechazada", desc: "Un servicio externo rechazo la conexion." },
    { patron: "connection errored", nombre: "Error de conexion", desc: "Fallo una conexion con un servicio externo." },
    { patron: "Unexpected token", nombre: "Datos corruptos recibidos", desc: "Se recibio una respuesta que no se pudo interpretar." },
    { patron: "timeout", nombre: "Tiempo de espera agotado", desc: "Una operacion tardo demasiado y fue cancelada." }
  ];

  function traducir(log) {
    var texto = (log.mensaje || "") + " " + (log.detalle || "");
    for (var j = 0; j < traducciones.length; j++) {
      if (texto.indexOf(traducciones[j].patron) !== -1) {
        return { nombre: traducciones[j].nombre, desc: traducciones[j].desc };
      }
    }
    if (log.nivel === "ERROR") return { nombre: "Error del servidor", desc: log.mensaje };
    if (log.nivel === "AVISO") return { nombre: "Aviso del sistema", desc: log.mensaje };
    return { nombre: "Evento del sistema", desc: log.mensaje };
  }

  function formatFecha(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return d.toLocaleDateString("es-CO", {day:"numeric", month:"short"}) + " · " + d.toLocaleTimeString("es-CO", {hour:"2-digit", minute:"2-digit"});
  }

  var errores = logs.filter(function(l){return l.nivel==="ERROR";}).length;
  var avisos = logs.filter(function(l){return l.nivel==="AVISO";}).length;
  var filtrados = filtro==="errores" ? logs.filter(function(l){return l.nivel==="ERROR";}) : filtro==="avisos" ? logs.filter(function(l){return l.nivel==="AVISO";}) : logs;

  var fBg = function(f){ return filtro===f ? "#e31e24" : "var(--gris)"; };
  var fCo = function(f){ return filtro===f ? "#fff" : "var(--texto)"; };

  var html = "<div style=\"display:flex;flex-direction:column;gap:10px\">";
  html += "<div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px\">";
  html += "<div style=\"background:var(--card);border-radius:10px;padding:12px;text-align:center\"><div style=\"font-size:22px;font-weight:900;color:#e31e24\">" + errores + "</div><div style=\"font-size:10px;color:var(--texto-medio)\">Errores</div></div>";
  html += "<div style=\"background:var(--card);border-radius:10px;padding:12px;text-align:center\"><div style=\"font-size:22px;font-weight:900;color:#f0a500\">" + avisos + "</div><div style=\"font-size:10px;color:var(--texto-medio)\">Avisos</div></div>";
  html += "<div style=\"background:var(--card);border-radius:10px;padding:12px;text-align:center\"><div style=\"font-size:22px;font-weight:900;color:#4a9eff\">" + logs.length + "</div><div style=\"font-size:10px;color:var(--texto-medio)\">Total</div></div>";
  html += "</div>";
  html += "<div style=\"display:flex;gap:6px\">";
  html += "<button onclick=\"cargarLogsPanel(\'todos\')\" style=\"flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:" + fBg("todos") + ";color:" + fCo("todos") + "\">Todos</button>";
  html += "<button onclick=\"cargarLogsPanel(\'errores\')\" style=\"flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:" + fBg("errores") + ";color:" + fCo("errores") + "\">Errores</button>";
  html += "<button onclick=\"cargarLogsPanel(\'avisos\')\" style=\"flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:" + fBg("avisos") + ";color:" + fCo("avisos") + "\">Avisos</button>";
  html += "</div>";

  if (filtrados.length === 0) {
    html += "<div style=\"text-align:center;padding:40px;color:var(--texto-medio)\">Sin registros en esta categoria</div>";
  } else {
    for (var i = 0; i < filtrados.length; i++) {
      var log = filtrados[i];
      var t = traducir(log);
      var color = log.nivel==="ERROR" ? "#e31e24" : log.nivel==="AVISO" ? "#f0a500" : "#4a9eff";
      var emoji = log.nivel==="ERROR" ? "ERROR" : log.nivel==="AVISO" ? "AVISO" : "INFO";
      var idLog = "logdet" + i;
      html += "<div style=\"background:var(--card);border-radius:12px;padding:14px\">";
      html += "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:6px\">";
      html += "<span style=\"background:" + color + "22;color:" + color + ";font-size:10px;font-weight:900;padding:3px 8px;border-radius:6px\">" + emoji + "</span>";
      html += "<span style=\"font-size:11px;color:var(--texto-medio)\">" + formatFecha(log.fecha) + "</span>";
      html += "</div>";
      html += "<div style=\"font-size:14px;font-weight:700;color:var(--texto);margin-bottom:4px\">" + t.nombre + "</div>";
      html += "<div style=\"font-size:12px;color:var(--texto-medio);margin-bottom:8px\">" + t.desc + "</div>";
      if (log.detalle) {
        html += "<button onclick=\"var x=document.getElementById('" + idLog + "');x.style.display=x.style.display==='none'?'block':'none';\" style=\"background:var(--gris);border:none;border-radius:6px;color:var(--texto-medio);font-size:11px;padding:5px 10px;cursor:pointer\">Ver detalle tecnico</button>";
        html += "<pre id=\"" + idLog + "\" style=\"display:none;margin-top:8px;font-size:10px;color:#aaa;white-space:pre-wrap;word-break:break-all;background:#111;padding:8px;border-radius:6px\">" + (log.detalle||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</pre>";
      }
      html += "</div>";
    }
  }
  html += "</div>";
  cont.innerHTML = html;
}


async function logFrontend(origen, mensaje, detalle) {
  try {
    await fetch('/api/log/frontend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origen: origen, mensaje: mensaje, detalle: detalle || '' })
    });
  } catch(e) {
    console.warn('logFrontend fallo:', e);
  }
}

async function saBuscarUsuario() {
  const email = document.getElementById('sa-buscar-email').value.trim().toLowerCase();
  const div = document.getElementById('sa-resultado-busqueda');
  if (!email) { div.innerHTML = '<div style="color:#e31e24;font-size:12px">Ingresa un email</div>'; return; }
  div.innerHTML = '<div style="color:#888;font-size:12px">Buscando...</div>';
  const [entrenadores, usuariosRes] = await Promise.all([
    fetch('/api/superadmin/entrenadores').then(r=>r.json()).catch(()=>[]),
    fetch('/api/usuarios').then(r=>r.json()).catch(()=>[])
  ]);
  const ent = entrenadores.find(e=>e.email.toLowerCase()===email);
  const cli = usuariosRes.find(u=>(u.email||'').toLowerCase()===email);
  if (!ent && !cli) { div.innerHTML = '<div style="color:#e31e24;font-size:12px">No se encontró ningún usuario con ese email</div>'; return; }
  
  const selectorDias = '<select id="sa-dias-premium" style="width:100%;background:var(--gris);border:1px solid var(--borde);border-radius:8px;padding:8px;color:var(--texto);font-size:12px;margin-top:8px;margin-bottom:6px"><option value="7">7 días</option><option value="15">15 días</option><option value="30" selected>30 días</option><option value="60">2 meses</option><option value="90">3 meses</option><option value="180">6 meses</option><option value="365">1 año</option><option value="99999">Permanente</option></select>';

  let html = '';
  if (ent) {
    html += '<div style="background:var(--gris);border-radius:10px;padding:12px;margin-bottom:8px">';
    html += '<div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:4px">🏋️ Entrenador</div>';
    html += '<div style="font-size:14px;font-weight:700;color:var(--texto)">'+ent.nombre+'</div>';
    html += '<div style="font-size:11px;color:var(--texto-medio)">'+ent.email+' · '+ent.total_clientes+' clientes</div>';
    if (ent.premium) html += '<div style="font-size:11px;color:#f0a500;margin-top:4px">⭐ Premium hasta '+ent.premium_hasta+'</div>';
    else html += '<div style="font-size:11px;color:#888;margin-top:4px">Sin premium activo</div>';
    html += selectorDias.replace('id="sa-dias-premium"','id="sa-dias-ent"');
    html += '<button onclick="saActivarPremiumEnt(this)" data-id="'+ent.id+'" data-nombre="'+ent.nombre+'" style="width:100%;background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:8px;cursor:pointer">⭐ Activar Premium Entrenador</button>';
    html += '</div>';
  }
  if (cli) {
    html += '<div style="background:var(--gris);border-radius:10px;padding:12px">';
    html += '<div style="font-size:11px;color:#4a9eff;font-weight:700;text-transform:uppercase;margin-bottom:4px">👤 Cliente</div>';
    html += '<div style="font-size:14px;font-weight:700;color:var(--texto)">'+cli.nombre+'</div>';
    html += '<div style="font-size:11px;color:var(--texto-medio)">'+cli.email+'</div>';
    if (cli.premium) html += '<div style="font-size:11px;color:#4caf50;margin-top:4px">✅ Premium hasta '+cli.premium_hasta+'</div>';
    else html += '<div style="font-size:11px;color:#888;margin-top:4px">Sin premium activo</div>';
    html += selectorDias.replace('id="sa-dias-premium"','id="sa-dias-cli"');
    html += '<button onclick="saActivarPremiumCli(this)" data-id="'+cli.id+'" data-nombre="'+cli.nombre+'" style="width:100%;background:#4a9eff;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:8px;cursor:pointer">⭐ Activar Premium Cliente</button>';
    html += '</div>';
  }
  div.innerHTML = html;
}

async function saActivarPremiumEnt(btn) {
  const id = btn.getAttribute('data-id');
  const nombre = btn.getAttribute('data-nombre');
  await saActivarPremium(id, 'entrenador', nombre);
}

async function saActivarPremiumCli(btn) {
  const id = btn.getAttribute('data-id');
  const nombre = btn.getAttribute('data-nombre');
  await saActivarPremium(id, 'cliente', nombre);
}

async function saActivarPremium(id, tipo, nombre) {
  const selectorId = tipo === 'entrenador' ? 'sa-dias-ent' : 'sa-dias-cli';
  const sel = document.getElementById(selectorId);
  const dias = sel ? parseInt(sel.value) : 30;
  const diasTexto = dias >= 99999 ? 'permanente' : dias + ' días';
  if (!confirm('¿Activar premium ' + diasTexto + ' a ' + nombre + '?')) return;
  const endpoint = tipo === 'entrenador' ? '/api/premium/activar-entrenador-directo' : '/api/premium/activar-cliente-directo';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({id, dias})
  }).then(r=>r.json()).catch(()=>({ok:false}));
  if (res.ok) {
    toast('✅ Premium activado hasta '+res.hasta);
    saBuscarUsuario();
  } else {
    alert('❌ Error: ' + (res.error||'desconocido'));
  }
}

async function saGenerarCodigo() {
  const codigoManual = document.getElementById('sa-codigo-manual').value.trim().toUpperCase();
  const duracion = document.getElementById('sa-duracion').value;
  const tipo = document.getElementById('sa-tipo-codigo').value;
  const modalidad = document.getElementById('sa-modalidad').value;
  const permanente = duracion === '0';
  const div = document.getElementById('sa-codigo-resultado');
  if (!codigoManual) { div.innerHTML = '❌ Debes escribir un nombre'; return; }
  const res = await fetch('/api/premium/generar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      codigo_manual: codigoManual,
      dias: permanente ? 99999 : parseInt(duracion),
      permanente: permanente,
      es_convenio: modalidad === 'convenio',
      es_unico: modalidad === 'unico',
      tipo: tipo,
      activo: true
    })
  }).then(r=>r.json()).catch(()=>({ok:false}));
  if (res.ok) {
    const label = modalidad === 'convenio' ? 'Convenio creado' : 'Código único creado';
    div.innerHTML = '✅ '+label+': <b style="font-family:monospace;color:#e31e24">'+res.codigo+'</b>';
    document.getElementById('sa-codigo-manual').value = '';
    await cargarSuperAdmin();
  } else {
    div.innerHTML = '❌ '+(res.error||'Error al generar');
  }
}

async function saBorrarConvenio(btn) {
  const codigo = btn.getAttribute('data-codigo');
  if (!confirm('¿Borrar convenio ' + codigo + '? Los usuarios que ya lo activaron mantienen su premium.')) return;
  await fetch('/api/premium/codigos/' + encodeURIComponent(codigo), {method:'DELETE'});
  await cargarSuperAdmin();
}

async function saBorrarCodigo(codigo) {
  if (!confirm('¿Borrar código '+codigo+'?')) return;
  await fetch('/api/premium/codigos/'+encodeURIComponent(codigo), {method:'DELETE'});
  await cargarSuperAdmin();
}

function saFiltrarConvenios(texto) {
  const filas = document.querySelectorAll('.sa-convenio-row');
  const q = texto.toLowerCase();
  filas.forEach(function(f) {
    const cod = f.querySelector('div[style*="monospace"]');
    if (cod) f.style.display = cod.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ── DESHABILITAR BOTÓN ATRÁS ──────────────────────
(function(){
  history.pushState(null, '');
  window.addEventListener('popstate', function(){
    history.pushState(null, '');
  });
})();

// ── PESOS POR SERIE ──────────────────────────────────────────
function tcInyectarPesos() {
  var uid = (_tcUsuario && _tcUsuario.id) || 'x';
  if (!_tcEjercicios) return;
  _tcEjercicios.forEach(function(ej, i) {
    var nomEj = (ej.nombre||'ej'+i).replace(/[^a-zA-Z0-9]/g,'_');
    var key = 'tc-pesos-' + uid + '-' + nomEj;
    var data = JSON.parse(localStorage.getItem(key)||'{}');
    var pesosGuardados = data.pesos || [];
    var unidad = data.unidad || 'kg';
    var series = parseInt(ej.series) || 3;
    var bomb0 = document.getElementById('tc-bomb-' + i + '-0');
    if (!bomb0) return;
    var contenedor = bomb0.parentElement;
    if (!contenedor) return;
    var wrapper = document.createElement('div');
    wrapper.id = 'tc-peso-wrap-' + i;
    var toggleHtml = '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">';
    toggleHtml += '<span style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px">Peso:</span>';
    toggleHtml += '<div style="display:flex;background:#1a1a1a;border-radius:20px;overflow:hidden;border:1px solid #333">';
    toggleHtml += '<button id="tc-kg-' + i + '" onclick="tcToggleUnidad(' + i + ',\'kg\')" style="background:' + (unidad==='kg'?'#e31e24':'transparent') + ';border:none;color:' + (unidad==='kg'?'#fff':'#666') + ';font-size:11px;font-weight:700;padding:4px 10px;cursor:pointer">kg</button>';
    toggleHtml += '<button id="tc-lb-' + i + '" onclick="tcToggleUnidad(' + i + ',\'lb\')" style="background:' + (unidad==='lb'?'#e31e24':'transparent') + ';border:none;color:' + (unidad==='lb'?'#fff':'#666') + ';font-size:11px;font-weight:700;padding:4px 10px;cursor:pointer">lb</button>';
    toggleHtml += '</div></div>';
    wrapper.innerHTML = toggleHtml;
    var fila1 = document.createElement('div');
    fila1.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap';
    var fila2 = document.createElement('div');
    fila2.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap';
    for (var s = 0; s < series; s++) {
      var bomb = document.getElementById('tc-bomb-' + i + '-' + s);
      if (!bomb) continue;
      var item = document.createElement('div');
      item.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px';
      var inp = document.createElement('input');
      inp.id = 'tc-peso-' + i + '-' + s;
      inp.type = 'number';
      inp.min = '0';
      inp.max = '999';
      inp.value = pesosGuardados[s] || '';
      inp.placeholder = '-';
      inp.style.cssText = 'width:42px;background:#1a1a1a;border:1px solid #333;border-radius:6px;color:#fff;font-size:12px;font-weight:700;text-align:center;padding:4px 2px;outline:none';
      inp.addEventListener('focus', function(){ this.style.borderColor='#e31e24'; });
      inp.addEventListener('blur', function(){ this.style.borderColor='#333'; tcGuardarPesos(); });
      item.appendChild(inp);
      item.appendChild(bomb);
      if (s < 5) { fila1.appendChild(item); }
      else { fila2.appendChild(item); }
    }
    wrapper.appendChild(fila1);
    if (series > 5) wrapper.appendChild(fila2);
    contenedor.parentElement.replaceChild(wrapper, contenedor);
  });
}

function tcToggleUnidad(ejIdx, unidad) {
  var kgBtn = document.getElementById('tc-kg-' + ejIdx);
  var lbBtn = document.getElementById('tc-lb-' + ejIdx);
  if (!kgBtn || !lbBtn) return;
  if (unidad === 'kg') {
    kgBtn.style.background = '#e31e24'; kgBtn.style.color = '#fff';
    lbBtn.style.background = 'transparent'; lbBtn.style.color = '#666';
  } else {
    lbBtn.style.background = '#e31e24'; lbBtn.style.color = '#fff';
    kgBtn.style.background = 'transparent'; kgBtn.style.color = '#666';
  }
  var uid = (_tcUsuario && _tcUsuario.id) || 'x';
  var ej = _tcEjercicios && _tcEjercicios[ejIdx];
  if (!ej) return;
  var nomEj = (ej.nombre||'ej'+ejIdx).replace(/[^a-zA-Z0-9]/g,'_');
  var key = 'tc-pesos-' + uid + '-' + nomEj;
  var data = JSON.parse(localStorage.getItem(key)||'{}');
  data.unidad = unidad;
  localStorage.setItem(key, JSON.stringify(data));
}

function tcGuardarPesos() {
  var uid = (_tcUsuario && _tcUsuario.id) || 'x';
  if (!_tcEjercicios) return;
  _tcEjercicios.forEach(function(ej, i) {
    var nomEj = (ej.nombre||'ej'+i).replace(/[^a-zA-Z0-9]/g,'_');
    var key = 'tc-pesos-' + uid + '-' + nomEj;
    var data = JSON.parse(localStorage.getItem(key)||'{}');
    var series = parseInt(ej.series) || 3;
    var pesos = [];
    for (var s = 0; s < series; s++) {
      var inp = document.getElementById('tc-peso-' + i + '-' + s);
      pesos.push(inp ? (inp.value||'') : '');
    }
    if (pesos.some(function(p){ return p !== ''; })) {
      data.pesos = pesos;
      localStorage.setItem(key, JSON.stringify(data));
    }
  });
}

function tcLimpiarRutinaHoy() {
  var uid = (_tcUsuario && _tcUsuario.id) || 'x';
  var fecha = tcFechaHoy();
  localStorage.removeItem('tc-rutina-completa-' + uid + '-' + fecha);
  localStorage.removeItem('tc-estado-' + uid);
  alert('✅ Listo, recarga la rutina');
}


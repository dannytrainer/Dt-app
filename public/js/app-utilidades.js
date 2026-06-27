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
  var cargar = function() {
    var ej = (window._encEjercicios||[]).find(function(x){ return x.id === id; });
    if (!ej) {
      fetch('/api/enciclopedia/buscar-match/' + encodeURIComponent(id))
        .then(function(r){ return r.json(); })
        .then(function(res){
          if (res.encontrado) {
            window._encEjercicios = window._encEjercicios || [];
            window._encEjercicios.push(res.ejercicio);
            tcVerEnciclopedia(id);
          }
        });
      return;
    }
    var cont = document.getElementById('modal-enc-ficha-contenido');
    if (!cont) return;
    var modal = document.getElementById('modal-enc-ficha');
    if (!modal) return;
    modal.classList.add('open');
    encAbrirFichaModal(id);
  };
  if (!window._encEjercicios || window._encEjercicios.length === 0) {
    fetch('/api/enciclopedia').then(function(r){ return r.json(); }).then(function(data){
      if (Array.isArray(data)) { window._encEjercicios = data; }
      cargar();
    });
  } else {
    cargar();
  }
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






function encAbrirFichaModal(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;
  var cont = document.getElementById('modal-enc-ficha-contenido');
  if (!cont) return;
  var gr = (window._encGrupos||[]).find(function(g){return g.id===e.grupo;});
  var nc = e.nivel==='principiante'?'#64b5f6':e.nivel==='avanzado'?'#e31e24':'#4caf50';
  var nb = e.nivel==='principiante'?'#1a2a3a':e.nivel==='avanzado'?'#3a1a1a':'#1a3a1a';
  var html = '';
  if (e.video_youtube) {
    html += '<div style="position:relative;width:100%;padding-bottom:56.25%;margin-bottom:12px;border-radius:10px;overflow:hidden"><iframe src="' + e.video_youtube + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>';
  } else if (e.imagen_inicio || e.imagen_fin || e.imagen) {
    var img1 = e.imagen_inicio || e.imagen || '';
    var img2 = e.imagen_fin || e.imagen2 || e.imagen_inicio || e.imagen || '';
    var filtro = (e.invertir === false || e.grupo === 'estiramientos') ? 'none' : 'invert(1)';
    html += '<div style="background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:12px;text-align:center;padding:16px;position:relative">';
    html += '<img id="enc-modal-anim-img" src="' + img1 + '" style="max-width:100%;height:280px;width:auto;object-fit:contain;filter:' + filtro + '" data-img1="' + img1 + '" data-img2="' + img2 + '">';
    html += '<div style="position:absolute;bottom:6px;right:8px;font-size:10px;color:#e31e24;font-weight:700;opacity:0.7">DT-APP</div></div>';
    if (img1 !== img2) {
      setTimeout(function() {
        var img = document.getElementById('enc-modal-anim-img');
        if (!img) return;
        var toggle = false;
        setInterval(function() {
          if (!document.getElementById('enc-modal-anim-img')) return;
          toggle = !toggle;
          img.src = toggle ? img.dataset.img2 : img.dataset.img1;
        }, 1500);
      }, 100);
    }
  }
  html += '<div style="margin-bottom:14px">';
  html += '<div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">' + (gr?gr.icon+' ':'') + e.grupo + (e.subgrupo?' - '+e.subgrupo:'') + '</div>';
  html += '<div style="font-size:22px;font-weight:900;color:#fff;text-transform:uppercase;line-height:1.1;margin-bottom:8px">' + e.nombre + '</div>';
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  if (e.nivel) html += '<span style="padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;background:' + nb + ';color:' + nc + '">' + e.nivel + '</span>';
  if (e.equipamiento) html += '<span style="padding:3px 8px;border-radius:4px;font-size:11px;background:#1e1e1e;color:var(--texto-medio);border:1px solid #333">' + e.equipamiento + '</span>';
  html += '</div></div>';
  if ((e.musculos_principales||[]).length > 0 || (e.musculos_secundarios||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Musculos</div><div style="display:flex;flex-wrap:wrap;gap:6px">';
    (e.musculos_principales||[]).forEach(function(m){html += '<span style="padding:4px 10px;border-radius:6px;font-size:12px;background:rgba(227,30,36,0.15);border:1px solid rgba(227,30,36,0.4);color:#ff6b6b">&#11088; ' + m + '</span>';});
    (e.musculos_secundarios||[]).forEach(function(m){html += '<span style="padding:4px 10px;border-radius:6px;font-size:12px;background:var(--gris);border:1px solid var(--borde);color:var(--texto-suave)">' + m + '</span>';});
    html += '</div></div>';
  }
  if ((e.ejecucion||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Ejecucion</div>';
    e.ejecucion.forEach(function(paso,i){
      html += '<div style="display:flex;gap:10px;margin-bottom:10px"><div style="width:24px;height:24px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">' + (i+1) + '</div><div style="font-size:13px;color:var(--texto-suave);line-height:1.5">' + paso + '</div></div>';
    });
    html += '</div>';
  }
  if ((e.errores_comunes||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Errores comunes</div>';
    e.errores_comunes.forEach(function(err){
      html += '<div style="display:flex;gap:8px;margin-bottom:8px"><span style="color:#ffab40;font-size:14px;flex-shrink:0">&#9888;</span><div style="font-size:13px;color:var(--texto-suave);line-height:1.5">' + err + '</div></div>';
    });
    html += '</div>';
  }
  if ((e.variantes||[]).length > 0) {
    html += '<div style="margin-bottom:16px"><div style="font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Variantes</div><div style="display:flex;gap:8px;flex-wrap:wrap">';
    e.variantes.forEach(function(v){
      var ve = (window._encEjercicios||[]).find(function(x){return x.id===v;});
      html += '<div style="padding:6px 12px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;font-size:12px;color:#fff">' + (ve?ve.nombre:v) + '</div>';
    });
    html += '</div></div>';
  }
  cont.innerHTML = html;
}

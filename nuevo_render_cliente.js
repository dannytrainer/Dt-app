  html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">📋 ' + ejercicios.length + ' ejercicios</div>';
  if (cardio.length > 0) {
    html += '<div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">🏃 ' + cardio.length + ' bloques de cardio</div>';
  }

  function _tcHtmlCardio(cx, ci) {
    let h = '<div style="background:#1a0000;border:1px solid #2a0000;border-radius:14px;padding:14px;margin-bottom:12px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h += '<div><div style="font-size:13px;font-weight:700;color:#e31e24">' + (cx.momento||'Cardio') + '</div>';
    h += '<div style="font-size:12px;color:var(--texto-suave);margin-top:2px">' + (cx.ejercicio||'') + '</div></div>';
    h += '<div style="display:flex;gap:6px;align-items:center">';
    h += '<div style="background:#1a0000;border-radius:8px;padding:6px 12px;text-align:center">';
    h += '<div style="font-size:16px;font-weight:900;color:#e31e24">' + (cx.tiempo||'—') + '</div>';
    h += '<div style="font-size:9px;color:#e31e24;text-transform:uppercase">min</div></div>';
    h += '<div id="tc-cardio-enc-btn-' + ci + '" style="display:none;background:#111;border:1px solid #333;border-radius:8px;padding:5px 8px;color:var(--texto-medio);font-size:11px;font-weight:700;cursor:pointer;align-items:center;gap:4px">&#128065;</div>';
    h += '</div>';
    h += '</div>';
    (function(cxi, cxej){ fetch('/api/enciclopedia/buscar-match/' + encodeURIComponent(cxej||'') + '?grupo=cardio', {method:'GET'}).then(function(r){return r.json();}).then(function(res){ if(res.encontrado){ var b=document.getElementById('tc-cardio-enc-btn-'+cxi); if(b){b.style.display='flex';b.onclick=function(){ if(tcEsPremium()){tcVerEnciclopedia(res.ejercicio.id);}else{tcMostrarPremium();} };}}}); })(ci, cx.ejercicio);
    if (cx.notas) h += '<div style="font-size:11px;color:var(--texto-medio);font-style:italic;border-top:1px solid #1a2a3a;padding-top:8px;margin-top:4px">' + cx.notas + '</div>';
    h += '<button id="tc-cardio-btn-' + ci + '" onclick="tcCardioHecho(' + ci + ')" style="width:100%;margin-top:10px;padding:7px 10px;border-radius:8px;border:none;background:#1a0000;color:#e31e24;font-size:12px;font-weight:700;cursor:pointer;border:1px solid #e31e24">✅ Cardio realizado</button>';
    h += '</div>';
    return h;
  }

  _tcEjercicios = ejercicios; // guardar para reporte

  function _tcHtmlEjercicio(ej, i) {
    const series = parseInt(ej.series) || 3;
    if (_tcSeriesCompletadas[i] === undefined) _tcSeriesCompletadas[i] = 0;
    let bombillas = '';
    for (let s = 0; s < series; s++) {
      bombillas += '<span id="tc-bomb-' + i + '-' + s + '" onclick="tcDeshacerSerie(' + i + ',' + s + ')" style="font-size:22px;opacity:0.25;transition:.3s;cursor:pointer">⭕</span>';
    }
    let h = '<div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:14px;margin-bottom:12px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px"><div><div style="font-size:15px;font-weight:700;color:#fff">' + (ej.nombre||'Ejercicio') + '</div><div style="font-size:11px;color:var(--texto-medio);margin-top:2px">' + (ej.grupo||'') + '</div></div>';
    h += ej.video ? '<a href="' + ej.video + '" target="_blank" style="background:#1a0000;border:1px solid #e31e24;border-radius:8px;padding:5px 10px;color:#e31e24;font-size:11px;font-weight:700;text-decoration:none">▶ Video</a>' : '';
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
    h += '<div id="tc-enc-btn-' + i + '" style="display:none;background:#111;border:1px solid #333;border-radius:8px;padding:5px 10px;color:var(--texto-medio);font-size:11px;font-weight:700;cursor:pointer;align-items:center;gap:4px">&#128065; Ver</div>';
    h += '</div>';
    h += '<div style="display:flex;gap:6px;margin-bottom:12px">';
    h += '<div style="background:#1a1a1a;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px"><div style="font-size:16px;font-weight:900;color:#fff">' + (ej.series||'—') + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Series</div></div>';
    h += '<div style="background:#1a1a1a;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px"><div style="font-size:16px;font-weight:900;color:#fff">' + (ej.reps||'—') + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Reps</div></div>';
    h += '<div style="background:#1a1a1a;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px"><div style="font-size:16px;font-weight:900;color:#e31e24">' + (ej.rir||'—') + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">RIR</div></div>';
    h += '<div style="background:#1a1a1a;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px"><div style="font-size:16px;font-weight:900;color:#fff">' + (ej.desc ? ej.desc + ' seg' : '—') + '</div><div style="font-size:9px;color:var(--texto-medio);text-transform:uppercase">Desc</div></div>';
    if (ej.var) h += '<div onclick="tcScrollNotas()" style="background:#1a0000;border:1px solid #e31e24;border-radius:8px;padding:6px 12px;text-align:center;flex:1;min-width:50px;cursor:pointer"><div style="font-size:16px;font-weight:900;color:#e31e24">' + ej.var + '</div><div style="font-size:9px;color:#e31e24;text-transform:uppercase">VAR</div></div>';
    h += '</div>';
    h += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">' + bombillas + '</div>';
    h += '<button onclick="tcSerie(' + i + ',' + (parseInt(ej.desc)||0) + ',' + series + ')" id="tc-btn-serie-' + i + '" style="width:100%;padding:7px 10px;border-radius:8px;border:none;background:#e31e24;color:#fff;font-size:12px;font-weight:700;cursor:pointer">✅ Serie 1 de ' + series + '</button>';
    h += '</div>';
    return h;
  }

  let _tcOrdenDia = (diaData && Array.isArray(diaData.orden) && diaData.orden.length === ejercicios.length + cardio.length) ? diaData.orden : null;
  if (!_tcOrdenDia) {
    _tcOrdenDia = [];
    for (let i = 0; i < cardio.length; i++) _tcOrdenDia.push('car' + i);
    for (let i = 0; i < ejercicios.length; i++) _tcOrdenDia.push('ej' + i);
  }
  _tcOrdenDia.forEach(function(token){
    const tipo = token.replace(/[0-9]+$/, '');
    const idx = parseInt(token.replace(/^[a-z]+/, ''), 10);
    if (tipo === 'ej') {
      if (ejercicios[idx]) html += _tcHtmlEjercicio(ejercicios[idx], idx);
    } else {
      if (cardio[idx]) html += _tcHtmlCardio(cardio[idx], idx);
    }
  });

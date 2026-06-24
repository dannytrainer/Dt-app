// ═══════════════════════════════
// PESOS POR SERIE
// ═══════════════════════════════
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


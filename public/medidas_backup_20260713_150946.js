function showMTab(t) {
  ['medidas','tests','analisis'].forEach(x => {
    const el=document.getElementById('msec-'+(x==='medidas' ? 'medidas-grupo' : x==='tests' ? 'tests-wrap' : x));
    if(el) el.style.display = x===t ? 'block' : 'none';
    const btn = document.getElementById('mtab-'+x);
    if(btn){btn.className = 'btn ' + (x===t ? 'br' : 'bg');
    btn.style.flex = '1';
    btn.style.fontSize = '12px';}
  });
  window._medidasSubTab = t;
}

function wrapAnalisisAccordions(id){
  const cont = document.getElementById('msec-analisis');
  if(!cont) return;
  const children = Array.from(cont.children);
  let html = '';
  children.forEach((child, i) => {
    const headerDiv = child.querySelector(':scope > div:first-child');
    const headerText = headerDiv ? headerDiv.textContent : ('Sección ' + (i+1));
    html += `<div class="acc-seg open" id="accseg-an-${i}">
      <div class="acc-seg-head" onclick="toggleAccSeg(this)" style="display:flex;justify-content:space-between;align-items:center;background:#0c0c0c;border:1px solid #1a1a1a;border-radius:10px;padding:12px 14px;margin-bottom:6px;cursor:pointer">
        <span style="font-size:13px;font-weight:700">${headerText}</span><span class="acc-seg-arrow" style="color:#e31e24;font-size:12px">▾</span>
      </div>
      <div class="acc-seg-body" style="margin-bottom:10px">${child.outerHTML}</div>
    </div>`;
  });

  html += `<div class="acc-seg" id="accseg-proyeccion">
    <div class="acc-seg-head" onclick="toggleAccSeg(this)" style="display:flex;justify-content:space-between;align-items:center;background:#0c0c0c;border:1px solid #1a1a1a;border-radius:10px;padding:12px 14px;margin-bottom:6px;cursor:pointer">
      <span style="font-size:13px;font-weight:700">🔮 Proyección</span><span class="acc-seg-arrow" style="color:#e31e24;font-size:12px">▾</span>
    </div>
    <div class="acc-seg-body" style="display:none;margin-bottom:10px">
      <div id="proyeccion-content-${id}" style="color:#888;font-size:12px;text-align:center;padding:14px">Cargando proyección...</div>
    </div>
  </div>`;

  html += `<div class="acc-seg" id="accseg-historial">
    <div class="acc-seg-head" onclick="toggleAccSeg(this)" style="display:flex;justify-content:space-between;align-items:center;background:#0c0c0c;border:1px solid #1a1a1a;border-radius:10px;padding:12px 14px;margin-bottom:6px;cursor:pointer">
      <span style="font-size:13px;font-weight:700">📜 Historial</span><span class="acc-seg-arrow" style="color:#e31e24;font-size:12px">▾</span>
    </div>
    <div class="acc-seg-body" style="display:none;margin-bottom:10px">
      <div id="historial-lista-${id}" style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;color:#888;font-size:12px;text-align:center">
        Cargando historial...
      </div>
    </div>
  </div>`;

  cont.innerHTML = html;
  renderHistorialLista(id);
  renderProyeccion(id);
}

let _historialTomasCache = {};
let _historialSeleccion = [];

let _historialPendienteCache = {};

async function renderHistorialLista(id) {
  const cont = document.getElementById('historial-lista-' + id);
  if (!cont) return;
  try {
    const hist = await fetch('/api/historial/' + id).then(r => r.json());
    const tomas = (hist.tomas || []).slice().reverse();
    _historialTomasCache[id] = tomas;
    _historialPendienteCache[id] = hist.pendiente_eliminar || null;
    _historialSeleccion = [];

    if (!tomas.length) {
      cont.innerHTML = '<div style="color:#555;font-size:12px;padding:10px">Aún no hay tomas registradas. Se generará automáticamente cada mes según la fecha de pago.</div>';
      return;
    }

    const banner = hist.pendiente_eliminar
      ? `<div style="background:#2a1a00;border:1px solid #ff9800;border-radius:10px;padding:12px;margin-bottom:10px">
          <div style="color:#ff9800;font-weight:700;font-size:12px;margin-bottom:4px">⚠️ Historial lleno (12/12)</div>
          <div style="color:#ccc;font-size:11px">Hay una toma nueva esperando (${hist.pendiente_eliminar.fecha}). Abrí cualquier toma abajo y elegí cuál eliminar para liberar espacio.</div>
        </div>`
      : '';

    cont.innerHTML = `${banner}<div id="historial-comparativa-${id}"></div><div id="historial-tarjetas-${id}"></div>`;
    pintarTarjetasHistorial(id);
  } catch (e) {
    cont.innerHTML = '<div style="color:#e31e24;font-size:12px">Error cargando historial</div>';
  }
}

function pintarTarjetasHistorial(id) {
  const tomas = _historialTomasCache[id] || [];
  const cont = document.getElementById('historial-tarjetas-' + id);
  if (!cont) return;

  let html = '';
  tomas.forEach((t, i) => {
    const cintura = t.medidas && t.medidas.cintura ? t.medidas.cintura + ' cm' : '—';
    const peso = t.peso != null ? t.peso + ' kg' : '—';
    const fFrontal = t.fotos && t.fotos.frontal ? t.fotos.frontal : null;
    const fLateral = t.fotos && t.fotos.lateral ? t.fotos.lateral : null;
    const idDetalle = 'toma-detalle-' + id + '-' + i;
    const seleccionada = _historialSeleccion.includes(i);
    const borde = seleccionada ? '1px solid #e31e24' : '1px solid #1a1a1a';

    html += `<div style="background:#0c0c0c;border:${borde};border-radius:10px;margin-bottom:8px;overflow:hidden">
      <div onclick="toggleSeleccionToma('${id}', ${i})" style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer">
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700;color:${seleccionada?'#e31e24':'#fff'}">📅 ${t.fecha}${seleccionada?' ✓':''}</div>
          <div style="font-size:11px;color:#888;margin-top:2px">⚖️ ${peso} &nbsp;📏 ${cintura}</div>
        </div>
        <div style="display:flex;gap:4px">
          ${fFrontal ? `<img src="${fFrontal}" style="width:34px;height:34px;border-radius:6px;object-fit:cover;border:1px solid #2a2a2a">` : ''}
          ${fLateral ? `<img src="${fLateral}" style="width:34px;height:34px;border-radius:6px;object-fit:cover;border:1px solid #2a2a2a">` : ''}
        </div>
      </div>
      <div id="${idDetalle}" style="display:none;padding:10px 12px;border-top:1px solid #1a1a1a">
        ${Object.entries(t.medidas || {}).filter(([k,v]) => k !== 'fecha' && k !== 'analisis' && v).map(([k,v]) => `
          <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px">
            <span style="color:#888;text-transform:capitalize">${k}</span>
            <span style="color:#fff;font-weight:700">${v}</span>
          </div>`).join('')}
        ${t.analisis_congelado && t.analisis_congelado.pctGrasa ? `
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1a1a1a;font-size:11px;color:#888">
            % Grasa: <span style="color:#fff;font-weight:700">${t.analisis_congelado.pctGrasa}%</span> &nbsp;
            Kg músculo: <span style="color:#fff;font-weight:700">${t.analisis_congelado.kgMusculo} kg</span>
          </div>` : ''}
        ${(fFrontal || fLateral) ? `
          <div style="display:flex;gap:8px;margin-top:8px">
            ${fFrontal ? `<img src="${fFrontal}" onclick="verFotoGrande(this.src)" style="flex:1;border-radius:8px;cursor:pointer;max-height:160px;object-fit:cover">` : ''}
            ${fLateral ? `<img src="${fLateral}" onclick="verFotoGrande(this.src)" style="flex:1;border-radius:8px;cursor:pointer;max-height:160px;object-fit:cover">` : ''}
          </div>` : ''}
        ${_historialPendienteCache[id] ? `
          <button onclick="event.stopPropagation();eliminarTomaPendiente('${id}', ${i})" style="width:100%;margin-top:10px;background:#2a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;font-size:11px;font-weight:700;padding:8px;cursor:pointer">🗑️ Eliminar esta y usar la nueva</button>` : ''}
      </div>
    </div>`;
  });

  cont.innerHTML = html;
}

async function eliminarTomaPendiente(id, indiceVisual) {
  const tomas = _historialTomasCache[id] || [];
  const total = tomas.length;
  // indiceVisual está en orden invertido (más reciente primero); el backend guarda en orden cronológico ascendente
  const indiceReal = total - 1 - indiceVisual;
  const toma = tomas[indiceVisual];
  if (!confirm('¿Eliminar la toma de ' + toma.fecha + ' para dar espacio a la nueva? Esta acción no se puede deshacer.')) return;

  try {
    const res = await fetch('/api/historial/' + id + '/resolver-pendiente', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ indiceEliminar: indiceReal })
    });
    const data = await res.json();
    if (data.ok) {
      toast('✅ Toma actualizada');
      renderHistorialLista(id);
    } else {
      toast('❌ ' + (data.error || 'Error al actualizar'), false);
    }
  } catch (e) {
    toast('❌ Error de conexión', false);
  }
}

function toggleSeleccionToma(id, i) {
  const idx = _historialSeleccion.indexOf(i);
  if (idx !== -1) {
    _historialSeleccion.splice(idx, 1);
  } else {
    _historialSeleccion.push(i);
    if (_historialSeleccion.length > 2) _historialSeleccion.shift();
  }

  pintarTarjetasHistorial(id);

  const contComp = document.getElementById('historial-comparativa-' + id);
  if (_historialSeleccion.length === 2) {
    pintarComparativaHistorial(id, contComp);
  } else if (contComp) {
    contComp.innerHTML = '';
    // Al tener solo 1 seleccionada, mostrar su detalle expandido
    const tomas = _historialTomasCache[id] || [];
    tomas.forEach((t, j) => {
      const det = document.getElementById('toma-detalle-' + id + '-' + j);
      if (det) det.style.display = (_historialSeleccion.length === 1 && _historialSeleccion[0] === j) ? 'block' : 'none';
    });
  }
}

function diffPeso(tA, tB) {
  const va = parseFloat(tA.peso);
  const vb = parseFloat(tB.peso);
  if (isNaN(va) || isNaN(vb)) return '<span style="color:#555">—</span>';
  const d = (vb - va);
  const color = d === 0 ? '#888' : (d < 0 ? '#4caf50' : '#e31e24');
  return `<span style="color:${color};font-weight:700">${d>0?'+':''}${d.toFixed(1)}</span>`;
}

function pintarComparativaHistorial(id, cont) {
  if (!cont) return;
  const tomas = _historialTomasCache[id] || [];
  const [iA, iB] = _historialSeleccion.slice().sort((a,b) => b-a);
  const tA = tomas[iA];
  const tB = tomas[iB];
  if (!tA || !tB) return;

  function diff(campo, invertido) {
    const va = parseFloat(tA.medidas && tA.medidas[campo]);
    const vb = parseFloat(tB.medidas && tB.medidas[campo]);
    if (isNaN(va) || isNaN(vb)) return '<span style="color:#555">—</span>';
    const d = (vb - va);
    const mejora = invertido ? d < 0 : d > 0;
    const color = d === 0 ? '#888' : (mejora ? '#4caf50' : '#e31e24');
    return `<span style="color:${color};font-weight:700">${d>0?'+':''}${d.toFixed(1)}</span>`;
  }

  function diffAnalisis(campo, invertido) {
    const va = parseFloat(tA.analisis_congelado && tA.analisis_congelado[campo]);
    const vb = parseFloat(tB.analisis_congelado && tB.analisis_congelado[campo]);
    if (isNaN(va) || isNaN(vb)) return '<span style="color:#555">—</span>';
    const d = (vb - va);
    const mejora = invertido ? d < 0 : d > 0;
    const color = d === 0 ? '#888' : (mejora ? '#4caf50' : '#e31e24');
    return `<span style="color:${color};font-weight:700">${d>0?'+':''}${d.toFixed(1)}</span>`;
  }

  const fA = tA.fotos || {};
  const fB = tB.fotos || {};

  cont.innerHTML = `<div style="background:#111;border:1px solid #e31e24;border-radius:10px;padding:14px;margin-bottom:12px">
    <div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">🔍 Comparativa: ${tA.fecha} vs ${tB.fecha}</div>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1;text-align:center">
        <div style="font-size:10px;color:#888;margin-bottom:4px">${tA.fecha}</div>
        <div style="font-size:9px;color:#666;text-transform:uppercase;margin-bottom:2px">Frontal</div>
        ${fA.frontal ? `<img src="${fA.frontal}" onclick="verFotoGrande(this.src)" style="width:100%;border-radius:8px;cursor:pointer;max-height:130px;object-fit:cover;margin-bottom:4px">` : '<div style="background:#1a1a1a;border-radius:8px;height:90px;display:flex;align-items:center;justify-content:center;color:#555;font-size:10px;margin-bottom:4px">Sin foto</div>'}
        <div style="font-size:9px;color:#666;text-transform:uppercase;margin-bottom:2px">Lateral</div>
        ${fA.lateral ? `<img src="${fA.lateral}" onclick="verFotoGrande(this.src)" style="width:100%;border-radius:8px;cursor:pointer;max-height:130px;object-fit:cover;margin-bottom:4px">` : '<div style="background:#1a1a1a;border-radius:8px;height:90px;display:flex;align-items:center;justify-content:center;color:#555;font-size:10px;margin-bottom:4px">Sin foto</div>'}
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:10px;color:#888;margin-bottom:4px">${tB.fecha}</div>
        <div style="font-size:9px;color:#666;text-transform:uppercase;margin-bottom:2px">Frontal</div>
        ${fB.frontal ? `<img src="${fB.frontal}" onclick="verFotoGrande(this.src)" style="width:100%;border-radius:8px;cursor:pointer;max-height:130px;object-fit:cover;margin-bottom:4px">` : '<div style="background:#1a1a1a;border-radius:8px;height:90px;display:flex;align-items:center;justify-content:center;color:#555;font-size:10px;margin-bottom:4px">Sin foto</div>'}
        <div style="font-size:9px;color:#666;text-transform:uppercase;margin-bottom:2px">Lateral</div>
        ${fB.lateral ? `<img src="${fB.lateral}" onclick="verFotoGrande(this.src)" style="width:100%;border-radius:8px;cursor:pointer;max-height:130px;object-fit:cover;margin-bottom:4px">` : '<div style="background:#1a1a1a;border-radius:8px;height:90px;display:flex;align-items:center;justify-content:center;color:#555;font-size:10px;margin-bottom:4px">Sin foto</div>'}
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515;font-size:12px">
      <span style="color:#888">Peso</span>
      <span>${tA.peso ?? '—'} → ${tB.peso ?? '—'} kg &nbsp;${diffPeso(tA, tB)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515;font-size:12px">
      <span style="color:#888">Cintura</span>
      <span>${(tA.medidas&&tA.medidas.cintura)??'—'} → ${(tB.medidas&&tB.medidas.cintura)??'—'} cm &nbsp;${diff('cintura', true)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515;font-size:12px">
      <span style="color:#888">% Grasa</span>
      <span>${(tA.analisis_congelado&&tA.analisis_congelado.pctGrasa)??'—'} → ${(tB.analisis_congelado&&tB.analisis_congelado.pctGrasa)??'—'}% &nbsp;${diffAnalisis('pctGrasa', true)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px">
      <span style="color:#888">Kg músculo</span>
      <span>${(tA.analisis_congelado&&tA.analisis_congelado.kgMusculo)??'—'} → ${(tB.analisis_congelado&&tB.analisis_congelado.kgMusculo)??'—'} kg &nbsp;${diffAnalisis('kgMusculo', false)}</span>
    </div>
  </div>`;
}

function toggleAccSeg(headerEl){
  const seg = headerEl.parentElement;
  seg.classList.toggle('open');
  const body = seg.querySelector('.acc-seg-body');
  const arrow = headerEl.querySelector('.acc-seg-arrow');
  if(body){
    body.style.display = seg.classList.contains('open') ? 'block' : 'none';
  }
  if(arrow){
    arrow.style.transform = seg.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

async function showMTabLoad(t, id) {
  showMTab(t);
  if (t === 'medidas') {
    await renderPerfil(id);
    await renderPeso(id);
    await renderMedidas(id);
  }
  if (t === 'tests') {
    if (typeof abrirTests === 'function') {
      const u = window._perfilClienteActual;
      await abrirTests(id, u ? u.nombre : '');
    }
  }
  if (t === 'analisis') { await renderAnalisis(id); wrapAnalisisAccordions(id); }
}

async function abrirMedidas(id, nombre) {
  try {
    window.clienteMedidasId = id;
    window.clienteMedidasNombre = nombre;
    document.getElementById('modal-medidas-titulo').textContent = 'Medidas de ' + nombre;
    // Cargar unidad del cliente
    const u = await fetch('/api/usuarios').then(r=>r.json());
    const usuario = u.find(x=>x.id===id);
    window._clienteUnidad = (usuario.perfil||{}).unidades || 'kg';
    window._perfilUnidad = window._clienteUnidad;
    showMTab('medidas');
    await renderPerfil(id);
    await renderPeso(id);
    await renderMedidas(id);
    document.getElementById('modal-medidas').classList.add('open');
  } catch(e) {
    alert('Error: ' + e.message);
  }
}

async function renderPeso(id) {
  const u = await fetch('/api/usuarios').then(r=>r.json());
  const usuario = u.find(x=>x.id===id);
  const hist = await fetch('/api/historial/'+id).then(r=>r.json());
  const pesos = hist.peso || [];
  const pesoActual = pesos.length ? pesos[pesos.length-1].valor : null;
  const pesoInicial = pesos.length ? pesos[0].valor : null;
  const cambio = pesoActual && pesoInicial ? (parseFloat(pesoActual)-parseFloat(pesoInicial)).toFixed(1) : null;
  const sesTotal = usuario.sesiones_total || 0;
  const sesCiclo = usuario.sesiones_ciclo || 0;

  document.getElementById('msec-peso').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div style="background:#111;border:1px solid #222;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:6px">Peso actual</div>
<div style="font-size:26px;font-weight:700;color:#fff">${mostrarPesoCliente(pesoActual)||'-'}<span style="font-size:12px;color:#555"> ${pesoClienteLabel()}</span></div>
<div style="font-size:12px;font-weight:700;margin-top:6px;color:${cambio<0?'#4caf50':cambio>0?'#e31e24':'#555'}">${cambio!==null?(parseFloat(cambio)>0?'▲ +':'▼ ')+mostrarPesoCliente(Math.abs(cambio))+' '+pesoClienteLabel():'-'}</div>
      </div>
      <div style="background:#111;border:1px solid #222;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:6px">Peso inicial</div>
<div style="font-size:26px;font-weight:700;color:#fff">${mostrarPesoCliente(pesoInicial)||'-'}<span style="font-size:12px;color:#555"> ${pesoClienteLabel()}</span></div>
      </div>
    </div>
    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:14px;margin-bottom:12px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div style="text-align:center">
          <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:4px">Sesiones totales</div>
          <div style="font-size:28px;font-weight:700;color:#fff">${sesTotal}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:10px;color:#e31e24;text-transform:uppercase;margin-bottom:4px">Este ciclo</div>
          <div style="font-size:28px;font-weight:700;color:#e31e24">${sesCiclo}</div>
        </div>
      </div>
      <button class="btn br" style="width:100%" onclick="sumarSesion('${id}')">+1 Sesión realizada</button>
    </div>
    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:14px;margin-bottom:12px">
      <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:10px">Registrar nuevo peso (${pesoClienteLabel()})</div>
      <div style="display:flex;gap:8px">
        <input type="number" id="m-peso-nuevo" placeholder="Ej: ${pesoClienteLabel()==='lb'?'165':'74.5'}" step="0.1" style="flex:1;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
        <button class="btn br" onclick="registrarPeso('${id}')">📥 Guardar</button>
      </div>
    </div>
    <div style="position:relative;margin-top:8px">
  <button onclick="toggleMenu(\'menu-progreso\')" style="width:100%;background:rgba(227,30,36,0.08);color:#e31e24;border:1px solid rgba(227,30,36,0.4);border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
    📤 Compartir progreso <span id="menu-progreso-arrow" style="font-size:10px;transition:transform 0.2s">▼</span>
  </button>
  <div id="menu-progreso" style="display:none;margin-top:6px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:var(--card);overflow:hidden">
    <button onclick="compartirProgreso(window.clienteMedidasId,window.clienteMedidasNombre);toggleMenu(\'menu-progreso\')" style="width:100%;padding:12px 16px;background:var(--fondo,#111);border:none;border-bottom:1px solid rgba(128,128,128,0.2);color:var(--texto);font-size:13px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px">
      📲 Enviar por WhatsApp
    </button>
    <button onclick="copiarProgreso(window.clienteMedidasId,window.clienteMedidasNombre);toggleMenu(\'menu-progreso\')" style="width:100%;padding:12px 16px;background:var(--fondo,#111);border:none;border-bottom:1px solid rgba(128,128,128,0.2);color:var(--texto);font-size:13px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px">
      📋 Copiar texto
    </button>
    <button onclick="compartirProgresoNativo(window.clienteMedidasId,window.clienteMedidasNombre);toggleMenu(\'menu-progreso\')" style="width:100%;padding:12px 16px;background:var(--fondo,#111);border:none;border-bottom:1px solid rgba(128,128,128,0.2);color:var(--texto);font-size:13px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px">
      📤 Compartir
    </button>
    <button onclick="verHistorialPeso('${id}');toggleMenu(\'menu-progreso\')" style="width:100%;padding:12px 16px;background:var(--fondo,#111);border:none;color:var(--texto);font-size:13px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px">
      👁️ Ver historial de peso
    </button>
  </div>
</div>
  `;
}

async function renderMedidas(id) {
  const hist = await fetch('/api/historial/'+id).then(r=>r.json());
  const medidas = hist.medidas || [];
  const medActual = medidas.length ? medidas[medidas.length-1] : {};
  const medInicial = medidas.length ? medidas[0] : {};

  const campos = [
    {k:'hombros',l:'Hombros',s:'Perímetros (cm)'},
    {k:'pecho',l:'Pecho'},
    {k:'brazo',l:'Brazo'},
    {k:'cintura',l:'Cintura'},
    {k:'cadera',l:'Cadera'},
    {k:'pierna',l:'Pierna'},
    {k:'pantorrilla',l:'Pantorrilla'},
    {k:'triceps',l:'Tríceps',s:'Pliegues (mm)'},
    {k:'subescapular',l:'Subescapular'},
    {k:'abdominal',l:'Abdominal'},
    {k:'suprailiaco',l:'Suprailiaco'}
  ];

  let html = '';
  let seccionActual = '';
  campos.forEach(c => {
    if (c.s) {
      html += `<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:12px 0 8px">${c.s}</div>`;
      seccionActual = c.s;
    }
    const actual = medActual[c.k];
    const inicial = medInicial[c.k];
    let cambio = '';
    if (actual && inicial) {
      const d = (parseFloat(actual)-parseFloat(inicial)).toFixed(1);
      cambio = `<span style="font-size:11px;font-weight:700;color:${d<0?'#4caf50':d>0?'#e31e24':'#555'}">${parseFloat(d)>0?'+':''}${d}</span>`;
    }
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:10px">
      <div style="flex:1">
        <div style="font-size:11px;color:#888">${c.l}</div>
        <div style="font-size:13px;color:#fff;margin-top:2px">${actual?actual+' ':' - '} ${cambio}</div>
      </div>
      <input type="number" id="med-${c.k}" placeholder="-" step="0.1" value="${actual||''}" style="width:65px;background:#0a0a0a;border:1px solid #333;border-radius:6px;padding:8px;color:#fff;font-size:13px;outline:none">
    </div>`;
  });

  document.getElementById('msec-medidas').innerHTML = html + `
    <button class="btn br" style="width:100%;margin-top:12px;margin-bottom:8px" onclick="registrarMedidas('${id}')">📥 Guardar medidas</button>
    <button class="btn bg" style="width:100%" onclick="verHistorialMedidas('${id}')">📋 Ver historial</button>
  `;
}

async function renderAnalisis(id) {
  const u = await fetch('/api/usuarios').then(r=>r.json());
  const usuario = u.find(x=>x.id===id);
  const calc = await fetch('/api/calculos/'+id).then(r=>r.json());

  function badge(nivel, texto) {
    const cfg = {ok:'background:#0a2a0a;color:#4caf50',warn:'background:#2a1a00;color:#ff9800',danger:'background:#2a0000;color:#e31e24'};
    return `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;${cfg[nivel]||cfg.ok}">${texto}</span>`;
  }

  let html = '';

  if (calc.pctGrasa) {
    html += `<div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">📊 Composición corporal</div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">% Grasa (Jackson & Pollock)</span><span style="font-size:13px;font-weight:700;color:#fff">${calc.pctGrasa}% ${calc.grasaZona ? badge(calc.grasaZona.nivel, calc.grasaZona.estado) : ''}</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">% Masa magra</span><span style="font-size:13px;font-weight:700;color:#fff">${calc.pctMagra}%</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">Kg de grasa</span><span style="font-size:13px;font-weight:700;color:#fff">${calc.kgGrasa} kg</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="font-size:12px;color:#888">Kg músculo estimado</span><span style="font-size:13px;font-weight:700;color:#fff">${calc.kgMusculo} kg</span></div>
    </div>`;
  }

  if (calc.proporciones && Object.keys(calc.proporciones).length) {
    const esFemenino = usuario.perfil && usuario.perfil.sexo === 'F';
    const labels = esFemenino
      ? {cintura_torax:'Cintura / Tórax',cintura_cadera:'Cintura / Cadera',pantorrilla_muslo:'Pantorrilla / Muslo',brazo_hombro:'Brazo / Hombro'}
      : {hombros_cintura:'Hombros / cintura',pecho_cintura:'Pecho / cintura',brazo_cintura:'Brazo / cintura'};
    const titulo = esFemenino ? '📐 Proporciones (Di Santo)' : '📐 Proporciones (Steve Reeves)';
    html += `<div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">${titulo}</div>
      ${Object.entries(calc.proporciones).map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #151515">
          <span style="font-size:12px;color:#888">${labels[k]||k}</span>
          <span style="font-size:13px;font-weight:700;color:#fff">${v.valor} ${badge(v.nivel,v.estado)}</span>
        </div>`).join('')}
    </div>`;
  }

  if (calc.salud && Object.keys(calc.salud).length) {
    const labels = {icc:'Índice cintura/cadera',ica:'Índice cintura/altura'};
    html += `<div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">❤️ Salud metabólica</div>
      ${Object.entries(calc.salud).map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #151515">
          <span style="font-size:12px;color:#888">${labels[k]||k}</span>
          <span style="font-size:13px;font-weight:700;color:#fff">${v.valor} ${badge(v.nivel,v.estado)}</span>
        </div>`).join('')}
    </div>`;
  }

  // Cambio desde ultima medicion
  const histLocal = await fetch('/api/historial/'+id).then(r=>r.json());
  const medidasLocal = histLocal.medidas || [];
  if (medidasLocal.length >= 2) {
    const actual = medidasLocal[medidasLocal.length-1].analisis || {};
    const anterior = medidasLocal[medidasLocal.length-2].analisis || {};
    if (actual.kgGrasa && anterior.kgGrasa && actual.kgMusculo && anterior.kgMusculo) {
      const difGrasa = (parseFloat(actual.kgGrasa) - parseFloat(anterior.kgGrasa)).toFixed(1);
      const difMusculo = (parseFloat(actual.kgMusculo) - parseFloat(anterior.kgMusculo)).toFixed(1);
      html += `<div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
        <div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">📈 Cambio desde última medición</div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515">
          <span style="font-size:12px;color:#888">Kg de grasa</span>
          <span style="font-size:13px;font-weight:700;color:${parseFloat(difGrasa)<0?'#4caf50':'#e31e24'}">${parseFloat(difGrasa)>0?'+':''}${difGrasa} kg</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0">
          <span style="font-size:12px;color:#888">Kg de músculo</span>
          <span style="font-size:13px;font-weight:700;color:${parseFloat(difMusculo)>0?'#4caf50':'#e31e24'}">${parseFloat(difMusculo)>0?'+':''}${difMusculo} kg</span>
        </div>
      </div>`;
    }
  }
  if (!calc.pctGrasa && (!usuario.perfil || !usuario.perfil.sexo)) {
    html = '<div style="background:#2a1a00;border:1px solid #ff9800;border-radius:10px;padding:16px;text-align:center"><div style="color:#ff9800;font-weight:700;margin-bottom:8px">⚠️ Falta información</div><div style="color:#ccc;font-size:13px">Ve a la pestaña <b>Perfil</b> y completa el <b>sexo</b> del cliente para calcular % de grasa correctamente.</div></div>';
  } else if (!html) {
    html = '<p style="color:#555;text-align:center;padding:30px">Registra pliegues y medidas<br>para ver el análisis</p>';
  }
  html += `<div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px"><div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">📸 Condición Actual</div><div style="display:flex;gap:10px"><div style="flex:1;text-align:center"><div style="font-size:10px;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Frontal</div><img src="data/fotos/${id}/actual/frontal.jpg?t=${Date.now()}" onclick="verFotoGrande(this.src)" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:100%;border-radius:8px;border:1px solid #2a2a2a;cursor:pointer;max-height:180px;object-fit:cover"><div style="display:none;background:#1a1a1a;border:1px dashed #333;border-radius:8px;height:120px;align-items:center;justify-content:center;flex-direction:column;gap:6px"><span style="font-size:24px">📷</span><span style="font-size:10px;color:#555">Sin foto</span></div><input type="file" accept="image/*" style="display:none" id="inp-frontal-${id}" onchange="subirFotoActual(this,'${id}','frontal')"><div style="display:flex;gap:6px;margin-top:8px"><button onclick="abrirCamara('${id}','frontal')" style="flex:1;background:#1a1a1a;border:1px solid #e31e24;border-radius:6px;color:#e31e24;font-size:11px;padding:6px 8px;cursor:pointer">📷 Cámara</button><button onclick="document.getElementById('inp-frontal-${id}').click()" style="flex:1;background:#1a1a1a;border:1px solid #333;border-radius:6px;color:#aaa;font-size:11px;padding:6px 8px;cursor:pointer">📤 Subir</button></div></div><div style="flex:1;text-align:center"><div style="font-size:10px;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">Lateral</div><img src="data/fotos/${id}/actual/lateral.jpg?t=${Date.now()}" onclick="verFotoGrande(this.src)" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:100%;border-radius:8px;border:1px solid #2a2a2a;cursor:pointer;max-height:180px;object-fit:cover"><div style="display:none;background:#1a1a1a;border:1px dashed #333;border-radius:8px;height:120px;align-items:center;justify-content:center;flex-direction:column;gap:6px"><span style="font-size:24px">📷</span><span style="font-size:10px;color:#555">Sin foto</span></div><input type="file" accept="image/*" style="display:none" id="inp-lateral-${id}" onchange="subirFotoActual(this,'${id}','lateral')"><div style="display:flex;gap:6px;margin-top:8px"><button onclick="abrirCamara('${id}','lateral')" style="flex:1;background:#1a1a1a;border:1px solid #e31e24;border-radius:6px;color:#e31e24;font-size:11px;padding:6px 8px;cursor:pointer">📷 Cámara</button><button onclick="document.getElementById('inp-lateral-${id}').click()" style="flex:1;background:#1a1a1a;border:1px solid #333;border-radius:6px;color:#aaa;font-size:11px;padding:6px 8px;cursor:pointer">📤 Subir</button></div></div></div></div>`;
  document.getElementById('msec-analisis').innerHTML = html;
}

async function sumarSesion(id) {
  const res = await fetch('/api/usuarios/'+id+'/sesion', {method:'POST'});
  const data = await res.json();
  toast('✅ Sesión: Total '+data.sesiones_total+' | Ciclo '+data.sesiones_ciclo);
  await renderPeso(id);
}

async function registrarPeso(id) {
  const val = document.getElementById('m-peso-nuevo').value;
  if (!val) { toast('Escribe el peso', false); return; }
  const valorKg = inputAPesoCliente(val);
  await fetch('/api/historial/'+id+'/peso', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:valorKg})});
  toast('✅ Peso registrado');
  await renderPeso(id);
}

async function registrarMedidas(id) {
  const campos = ['cintura','cadera','pecho','brazo','pierna','hombros','pantorrilla','triceps','subescapular','abdominal','suprailiaco'];
  const datos = {};
  campos.forEach(c => { const v=document.getElementById('med-'+c).value; if(v) datos[c]=parseFloat(v); });
  if (!Object.keys(datos).length) { toast('Ingresa al menos una medida', false); return; }
  await fetch('/api/historial/'+id+'/medidas', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)});
  toast('✅ Medidas guardadas');
  await renderMedidas(id);
}

async function verHistorialPeso(id) {
  const hist = await fetch('/api/historial/'+id).then(r=>r.json());
  const pesos = (hist.peso||[]).slice().reverse();
  const html = pesos.length ? pesos.map(p=>`
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1a1a1a">
      <span style="color:#888;font-size:13px">${p.fecha}</span>
      <span style="font-weight:700;color:#fff">${p.valor} kg</span>
    </div>`).join('') : '<p style="color:#555;text-align:center;padding:20px">Sin registros</p>';
  document.getElementById('historial-contenido').innerHTML = '<div style="font-weight:700;color:#e31e24;margin-bottom:12px">📋 Historial de peso</div>'+html;
  document.getElementById('modal-historial').classList.add('open');
}

async function verHistorialMedidas(id) {
  const hist = await fetch('/api/historial/'+id).then(r=>r.json());
  const medidas = (hist.medidas||[]).slice().reverse();
  const campos = ['cintura','cadera','pecho','brazo','pierna','hombros','pantorrilla','triceps','subescapular','abdominal','suprailiaco'];
  const labels = ['Cintura','Cadera','Pecho','Brazo','Pierna','Hombros','Pantorrilla','Tríceps','Subescapular','Abdominal','Suprailiaco'];
  const html = medidas.length ? medidas.map(m=>`
    <div style="background:#111;border-radius:8px;padding:12px;margin-bottom:8px">
      <div style="color:#e31e24;font-weight:700;margin-bottom:8px">${m.fecha}</div>
      ${campos.filter(c=>m[c]).map(c=>`
        <div style="display:flex;justify-content:space-between;padding:3px 0">
          <span style="color:#888;font-size:12px">${labels[campos.indexOf(c)]}</span>
          <span style="color:#fff;font-size:12px;font-weight:700">${m[c]}</span>
        </div>`).join('')}
    </div>`).join('') : '<p style="color:#555;text-align:center;padding:20px">Sin registros</p>';
  document.getElementById('historial-contenido').innerHTML = '<div style="font-weight:700;color:#e31e24;margin-bottom:12px">📋 Historial de medidas</div>'+html;
  document.getElementById('modal-historial').classList.add('open');
}
async function generarTextoProgreso(id, nombre) {
  const u = await fetch('/api/usuarios').then(r=>r.json());
  const usuario = u.find(x=>x.id===id);
  const hist = await fetch('/api/historial/'+id).then(r=>r.json());
  const pesos = hist.peso||[];
  const medidas = hist.medidas||[];
  const perfil = usuario.perfil||{};
  const pesoActual = pesos.length ? pesos[pesos.length-1].valor : null;
  const pesoInicial = pesos.length ? pesos[0].valor : null;
  const medActual = medidas.length ? medidas[medidas.length-1] : null;
  const medInicial = medidas.length ? medidas[0] : null;
  const soloPrimera = medidas.length < 2;

  let msg = '💪 *Progreso de ' + nombre + '*\n\n';

  if (perfil.fecha_inicio) {
    const semanas = Math.floor((new Date()-new Date(perfil.fecha_inicio))/(1000*60*60*24*7));
    msg += '⏱️ Tiempo: ' + semanas + ' semanas\n';
  }
  msg += '🏋️ Sesiones totales: ' + (usuario.sesiones_total||0) + '\n\n';

  // PESO
  if (pesoActual) {
    msg += '⚖️ *Peso*\n';
    msg += 'Actual: ' + mostrarPesoCliente(pesoActual) + ' ' + pesoClienteLabel();
    if (!soloPrimera && pesoInicial && pesoInicial !== pesoActual) {
      const cambio = (parseFloat(pesoActual)-parseFloat(pesoInicial)).toFixed(1);
      if (parseFloat(cambio)!==0) msg += ' (' + (parseFloat(cambio)>0?'+':'') + cambio + ' ' + pesoClienteLabel() + ')';
    }
    msg += '\n\n';
  }

  // PERÍMETROS
  const camposPerim = ['cintura','cadera','pecho','brazo','pierna','hombros','pantorrilla'];
  const labelsPerim = ['Cintura','Cadera','Pecho','Brazo','Pierna','Hombros','Pantorrilla'];
  if (medActual) {
    let lineasPerim = '';
    camposPerim.forEach((c,i)=>{
      const val = parseFloat(medActual[c]);
      if (!val || val===0) return;
      let linea = labelsPerim[i] + ': ' + val + ' cm';
      if (!soloPrimera && medInicial) {
        const ant = parseFloat(medInicial[c]);
        if (ant && ant!==0) {
          const d = (val - ant).toFixed(1);
          if (parseFloat(d)!==0) linea += ' (' + (parseFloat(d)>0?'+':'') + d + ' cm)';
        }
      }
      lineasPerim += linea + '\n';
    });
    if (lineasPerim) msg += '📏 *Perímetros*\n' + lineasPerim + '\n';
  }

  // PLIEGUES
  const camposPlieg = ['triceps','subescapular','abdominal','suprailiaco'];
  const labelsPlieg = ['Tríceps','Subescapular','Abdominal','Suprailiaco'];
  if (medActual) {
    let lineasPlieg = '';
    camposPlieg.forEach((c,i)=>{
      const val = parseFloat(medActual[c]);
      if (!val || val===0) return;
      let linea = labelsPlieg[i] + ': ' + val + ' mm';
      if (!soloPrimera && medInicial) {
        const ant = parseFloat(medInicial[c]);
        if (ant && ant!==0) {
          const d = (val - ant).toFixed(1);
          if (parseFloat(d)!==0) linea += ' (' + (parseFloat(d)>0?'+':'') + d + ' mm)';
        }
      }
      lineasPlieg += linea + '\n';
    });
    if (lineasPlieg) msg += '📐 *Pliegues*\n' + lineasPlieg + '\n';
  }

  // COMPOSICIÓN CORPORAL
  const analisis = medActual && medActual.analisis ? medActual.analisis : null;
  if (analisis && analisis.pctGrasa) {
    msg += '📊 *Composición corporal*\n';
    msg += '% Grasa: ' + analisis.pctGrasa + '%\n';
    const pctMagra = (100 - analisis.pctGrasa).toFixed(1);
    msg += '% Masa magra: ' + pctMagra + '%\n';
    if (analisis.kgGrasa) msg += 'Kg grasa: ' + analisis.kgGrasa + ' kg\n';
    if (analisis.kgMusculo) msg += 'Kg músculo estimado: ' + analisis.kgMusculo + ' kg\n';
  }

  return {texto: msg, telefono: usuario.telefono};
}

async function compartirProgreso(id, nombre) {
  const r = await generarTextoProgreso(id, nombre);
  if (!r.telefono) { toast('⚠️ Cliente sin teléfono registrado', false); return; }
  const tel = r.telefono.replace(/[^0-9]/g, '');
  const url = 'https://wa.me/'+tel+'?text='+encodeURIComponent(r.texto);
  window.open(url, '_blank');
}

async function copiarProgreso(id, nombre) {
  try {
    const r = await generarTextoProgreso(id, nombre);
    await navigator.clipboard.writeText(r.texto);
    toast('📋 Progreso copiado al portapapeles');
  } catch(e) {
    toast('Error al copiar', false);
  }
}

async function compartirProgresoNativo(id, nombre) {
  try {
    const r = await generarTextoProgreso(id, nombre);
    if (typeof compartirTextoNativo === 'function') {
      await compartirTextoNativo(r.texto, 'Progreso');
    }
  } catch(e) {
    toast('Error al compartir', false);
  }
}
async function renderPerfil(id) {
  const u = await fetch('/api/usuarios').then(r=>r.json());
  const usuario = u.find(x=>x.id===id);
  const perfil = usuario.perfil || {};
  const etiquetas = {hipertrofia:'💪 Hipertrofia',perdida:'🔥 Pérdida de grasa',rehabilitacion:'🩺 Rehabilitación'};

  document.getElementById('msec-perfil').innerHTML = `
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:12px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">👤 Datos del cliente</div>
      <div style="margin-bottom:12px">
        <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Fecha de inicio</div>
        <input type="date" id="p-fecha" value="${perfil.fecha_inicio||''}" style="width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div>
          <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Sexo</div>
          <select id="p-sexo" style="width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
            <option value="" ${!perfil.sexo?'selected':''}>Seleccionar</option>
            <option value="M" ${perfil.sexo==='M'?'selected':''}>Masculino</option>
            <option value="F" ${perfil.sexo==='F'?'selected':''}>Femenino</option>
          </select>
        </div>
        <div>
          <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Edad</div>
          <input type="number" id="p-edad" value="${perfil.edad||''}" placeholder="Años" style="width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
        </div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Altura (cm)</div>
        <input type="number" id="p-altura" value="${perfil.altura||''}" placeholder="Ej: 165" style="width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
      </div>
      <div style="margin-bottom:12px">
        <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Objetivo</div>
        <select id="p-etiqueta" style="width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
          <option value="hipertrofia" ${perfil.etiqueta==='hipertrofia'?'selected':''}>💪 Hipertrofia</option>
          <option value="perdida" ${perfil.etiqueta==='perdida'?'selected':''}>🔥 Pérdida de grasa</option>
          <option value="rehabilitacion" ${perfil.etiqueta==='rehabilitacion'?'selected':''}>🩺 Rehabilitación</option>
        </select>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Unidades</div>
        <div style="display:flex;gap:8px">
          <button id="p-unit-kg" onclick="seleccionarUnidad('kg','${id}')" style="flex:1;padding:10px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;border:2px solid ${(perfil.unidades||'kg')==='kg'?'#e31e24':'#333'};background:${(perfil.unidades||'kg')==='kg'?'#e31e24':'#1a1a1a'};color:#fff">⚖️ KG</button>
          <button id="p-unit-lb" onclick="seleccionarUnidad('lb','${id}')" style="flex:1;padding:10px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;border:2px solid ${(perfil.unidades||'kg')==='lb'?'#e31e24':'#333'};background:${(perfil.unidades||'kg')==='lb'?'#e31e24':'#1a1a1a'};color:#fff">🇺🇸 LB</button>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Notas / Lesiones</div>
        <textarea id="p-notas" placeholder="Observaciones, lesiones, limitaciones..." style="width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;min-height:80px;resize:vertical">${perfil.notas||''}</textarea>
      </div>
      <button class="btn br" style="width:100%" onclick="guardarPerfil('${id}')">💾 Guardar perfil</button>
    </div>
  `;
}

function seleccionarUnidad(u, id) {
  window._perfilUnidad = u;
  const kgBtn = document.getElementById('p-unit-kg');
  const lbBtn = document.getElementById('p-unit-lb');
  if (kgBtn) { kgBtn.style.background = u==='kg'?'#e31e24':'#1a1a1a'; kgBtn.style.borderColor = u==='kg'?'#e31e24':'#333'; }
  if (lbBtn) { lbBtn.style.background = u==='lb'?'#e31e24':'#1a1a1a'; lbBtn.style.borderColor = u==='lb'?'#e31e24':'#333'; }
  const tabActiva = document.querySelector('.mtab-btn.active');
  if (id) {
    const tabs = ['perfil','peso','medidas','analisis'];
    let tabActiva = 'peso';
    tabs.forEach(x => {
      const el = document.getElementById('msec-'+x);
      if (el && el.style.display !== 'none') tabActiva = x;
    });
    showMTabLoad(tabActiva, id);
  }
}

function getUnidadCliente() {
  return window._perfilUnidad || window._clienteUnidad || 'kg';
}

function pesoClienteLabel() {
  return getUnidadCliente() === 'lb' ? 'lb' : 'kg';
}

function mostrarPesoCliente(kg) {
  if (!kg && kg !== 0) return '-';
  if (getUnidadCliente() === 'lb') return Math.round(parseFloat(kg) * 2.2046 * 10) / 10;
  return kg;
}

function inputAPesoCliente(val) {
  if (!val && val !== 0) return null;
  if (getUnidadCliente() === 'lb') return Math.round(parseFloat(val) / 2.2046 * 100) / 100;
  return parseFloat(val);
}

async function guardarPerfil(id) {
  const datos = {
    fecha_inicio: document.getElementById('p-fecha').value,
    sexo: document.getElementById('p-sexo').value,
    edad: document.getElementById('p-edad').value,
    altura: document.getElementById('p-altura').value,
    etiqueta: document.getElementById('p-etiqueta').value,
    notas: document.getElementById('p-notas').value,
    unidades: window._perfilUnidad || 'kg'
  };
  await fetch('/api/usuarios/'+id+'/perfil', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)});
  toast('✅ Perfil guardado');
}

async function subirFotoComparativa(input, id, tipo) {
  if (!input.files[0]) return;
  const fd = new FormData();
  fd.append('foto', input.files[0]);
  fd.append('tipo', tipo);
  const res = await fetch('/api/foto-comparativa/' + id + '/' + tipo, {method:'POST', body:fd});
  if (res.ok) {
    toast('✅ Foto ' + tipo + ' guardada');
    showMTabLoad('analisis', id);
  } else {
    toast('❌ Error al subir foto', false);
  }
}

async function subirFotoActual(input, id, tipo) {
  if (!input.files[0]) return;
  const fd = new FormData();
  fd.append('foto', input.files[0]);
  fd.append('tipo', tipo);
  const res = await fetch('/api/foto-actual/' + id + '/' + tipo, {method:'POST', body:fd});
  if (res.ok) {
    toast('✅ Foto ' + tipo + ' guardada');
    showMTabLoad('analisis', id);
  } else {
    toast('❌ Error al subir foto', false);
  }
}

function verFotoGrande(src) {
  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.onclick = () => overlay.remove();
  const img = document.createElement('img');
  img.src = src;
  img.style = 'max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px';
  overlay.appendChild(img);
  document.body.appendChild(overlay);
}


async function renderProyeccion(id) {
  const cont = document.getElementById('proyeccion-content-' + id);
  if (!cont) return;
  try {
    const datos = await fetch('/api/proyeccion/' + id).then(r => r.json());
    if (datos.error) { cont.innerHTML = '<div style="color:#e31e24;font-size:12px">' + datos.error + '</div>'; return; }

    const colores = { ok: '#4caf50', warn: '#ff9800', danger: '#e31e24' };
    const fondos = { ok: '#0a2a0a', warn: '#2a1a00', danger: '#2a0000' };
    const nivelLabel = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };

    const fuenteBadge = datos.fuenteEstimulo === 'real'
      ? `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;background:#0a2a0a;color:#4caf50">✅ Datos reales (${datos.semanasHistorial} sem)</span>`
      : `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;background:#2a1a00;color:#ff9800">📋 Rutina planeada, sin reportes recientes</span>`;

    let html = `<div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">
        <span style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase">🔮 Resumen de proyección</span>
        ${fuenteBadge}
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">Nivel</span><span style="font-size:13px;font-weight:700;color:#fff">${nivelLabel[datos.nivel] || datos.nivel}</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="font-size:12px;color:#888">Estímulo global semanal</span><span style="font-size:13px;font-weight:700;color:#fff">${datos.estimuloGlobal} pts</span></div>
    </div>`;

    if (datos.alertas && datos.alertas.length) {
      // Color e ícono graduados por severidad — "observación" no debe verse como error,
      // "riesgo" sí debe llamar la atención de verdad.
      const colorPorNivelAlerta = { observacion: '#ffd54f', atencion: '#ff9800', riesgo: '#e31e24' };
      const iconoPorNivelAlerta = { observacion: 'ℹ️', atencion: '⚠️', riesgo: '🔴' };

      html += `<div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:14px;margin-bottom:10px">
        <div style="font-size:11px;color:#aaa;font-weight:700;text-transform:uppercase;margin-bottom:10px">📋 Observaciones</div>
        ${datos.alertas.map(a => {
          const c = colorPorNivelAlerta[a.nivelAlerta] || colorPorNivelAlerta.atencion;
          const icono = iconoPorNivelAlerta[a.nivelAlerta] || '⚠️';
          return `<div style="font-size:12px;color:#ccc;padding:6px 0;border-bottom:1px solid #1a1a1a">${icono} <b style="color:${c}">${a.musculo}:</b> ${a.mensaje}</div>`;
        }).join('')}
      </div>`;
    }

    const perimetros = datos.perimetros || {};
    Object.entries(perimetros).forEach(([nombre, p]) => {
      const riesgo = p.riesgo || 'ok';
      const medida = p.medidaActual != null ? p.medidaActual + ' cm' : 'Sin dato';
      const fila = (label, proy) => proy && proy.cmMinFinal != null
        ? `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">${label}</span><span style="font-size:13px;font-weight:700;color:${colores[riesgo]}">+${proy.cmMinFinal} a +${proy.cmMaxFinal} cm</span></div>`
        : `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">${label}</span><span style="font-size:12px;color:#555">Sin datos</span></div>`;

      const notaAproximada = p.proyeccionAproximada
        ? '<div style="font-size:10px;color:#ff9800;padding:4px 0;border-bottom:1px solid #151515">⚠️ Sin datos de RIR — se usó volumen total como aproximación</div>'
        : '';
      html += `<div style="background:#111;border:1px solid ${colores[riesgo]};border-radius:10px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">
          <span style="font-size:12px;font-weight:700;color:#fff">📐 ${nombre}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:${fondos[riesgo]};color:${colores[riesgo]};font-weight:700">${riesgo === 'danger' ? 'Alta carga' : riesgo === 'warn' ? 'Moderado' : 'Progreso esperado'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">Medida actual</span><span style="font-size:13px;font-weight:700;color:#fff">${medida}</span></div>
        ${notaAproximada}
        ${fila('3 meses', p.proy3)}
        ${fila('6 meses', p.proy6)}
        ${fila('12 meses', p.proy12)}
      </div>`;
    });

    if (!Object.keys(perimetros).length) {
      html += '<p style="color:#555;text-align:center;padding:20px;font-size:12px">Aún no hay estímulo de entrenamiento suficiente para proyectar.</p>';
    }

    cont.innerHTML = html;
  } catch (e) {
    cont.innerHTML = '<div style="color:#e31e24;font-size:12px">Error cargando proyección: ' + e.message + '</div>';
  }
}


// ═══ Cámara con guía de silueta (Condición Actual) ═══
let _camaraStream = null;
let _camaraClienteId = null;
let _camaraTipo = 'frontal';

async function abrirCamara(id, tipo) {
  _camaraClienteId = id;
  _camaraTipo = tipo;
  const modal = document.getElementById('modal-camara');
  const video = document.getElementById('camara-video');
  const errorDiv = document.getElementById('camara-error');
  const titulo = document.getElementById('camara-titulo');

  modal.style.display = 'flex';
  errorDiv.style.display = 'none';
  video.style.display = 'block';
  titulo.textContent = tipo === 'frontal' ? 'Foto Frontal' : 'Foto Lateral';
  cambiarTipoCamara(tipo);

  try {
    _camaraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1920 } },
      audio: false
    });
    video.srcObject = _camaraStream;
  } catch (e) {
    video.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.style.color = '#fff';
    errorDiv.textContent = '⚠️ No se pudo acceder a la cámara. Verifica los permisos, o usa la opción "Subir" en su lugar.';
    return;
  }

  // Listar lentes traseros disponibles (para poder alternar entre ellos si el zoom no está disponible)
  try {
    await listarLentesCamara();
  } catch (e) {
    console.error('No se pudieron listar lentes:', e);
  }

  // El zoom es una mejora opcional: si falla, no debe afectar la cámara ya funcionando
  try {
    configurarZoomCamara();
  } catch (e) {
    console.error('Zoom no disponible:', e);
  }
}

function cambiarTipoCamara(tipo) {
  _camaraTipo = tipo;
  const titulo = document.getElementById('camara-titulo');
  const guia = document.getElementById('camara-guia');
  const btnFrontal = document.getElementById('camara-toggle-frontal');
  const btnLateral = document.getElementById('camara-toggle-lateral');

  titulo.textContent = tipo === 'frontal' ? 'Foto Frontal' : 'Foto Lateral';
  guia.src = tipo === 'frontal' ? '/guias/silueta-frontal.png' : '/guias/silueta-lateral.png';

  if (tipo === 'frontal') {
    btnFrontal.style.background = '#e31e24'; btnFrontal.style.borderColor = '#e31e24'; btnFrontal.style.color = '#fff';
    btnLateral.style.background = 'rgba(0,0,0,0.5)'; btnLateral.style.borderColor = '#333'; btnLateral.style.color = '#aaa';
  } else {
    btnLateral.style.background = '#e31e24'; btnLateral.style.borderColor = '#e31e24'; btnLateral.style.color = '#fff';
    btnFrontal.style.background = 'rgba(0,0,0,0.5)'; btnFrontal.style.borderColor = '#333'; btnFrontal.style.color = '#aaa';
  }
}

function cerrarCamara() {
  const modal = document.getElementById('modal-camara');
  const video = document.getElementById('camara-video');
  if (_camaraStream) {
    _camaraStream.getTracks().forEach(track => track.stop());
    _camaraStream = null;
  }
  video.srcObject = null;
  modal.style.display = 'none';
}

async function capturarFotoCamara() {
  const video = document.getElementById('camara-video');
  const canvas = document.getElementById('camara-canvas');
  if (!video.videoWidth) { toast('⚠️ Cámara no lista, espera un momento', false); return; }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    const fd = new FormData();
    fd.append('foto', blob, _camaraTipo + '.jpg');
    fd.append('tipo', _camaraTipo);
    try {
      const res = await fetch('/api/foto-actual/' + _camaraClienteId + '/' + _camaraTipo, { method: 'POST', body: fd });
      if (res.ok) {
        toast('✅ Foto ' + _camaraTipo + ' guardada');
        cerrarCamara();
        showMTabLoad('analisis', _camaraClienteId);
      } else {
        toast('❌ Error al subir foto', false);
      }
    } catch (e) {
      toast('❌ Error de conexión', false);
    }
  }, 'image/jpeg', 0.9);
}

// ═══ Zoom de cámara (nativo si el hardware lo soporta, con rango real incluyendo <1x) ═══
let _camaraTrack = null;

function configurarZoomCamara() {
  const slider = document.getElementById('camara-zoom-slider');
  const valorTxt = document.getElementById('camara-zoom-valor');
  _camaraTrack = _camaraStream ? _camaraStream.getVideoTracks()[0] : null;

  if (_camaraTrack && typeof _camaraTrack.getCapabilities === 'function') {
    const caps = _camaraTrack.getCapabilities();
    if (caps.zoom) {
      // Rango REAL reportado por el hardware (puede incluir valores <1x, ej. 0.9x)
      slider.min = caps.zoom.min;
      slider.max = caps.zoom.max;
      slider.step = caps.zoom.step || 0.1;
      const settings = _camaraTrack.getSettings();
      const zoomActual = settings.zoom || caps.zoom.min;
      slider.value = zoomActual;
      valorTxt.textContent = parseFloat(zoomActual).toFixed(1) + 'x';
      slider.style.display = 'block';
      return;
    }
  }
  // Sin soporte real de zoom en este navegador/dispositivo: ocultamos el control
  // (confirmado que el navegador ignora el constraint incluso si se fuerza directamente)
  slider.style.display = 'none';
  document.getElementById('camara-zoom-valor').textContent = '';
}

// ═══ Tocar para enfocar (tap-to-focus) ═══
async function enfocarEnPunto(event) {
  if (!_camaraTrack || typeof _camaraTrack.getCapabilities !== 'function') return;
  const caps = _camaraTrack.getCapabilities();
  if (!caps.focusMode || !caps.focusMode.includes('single-shot')) return; // sin soporte, no hacemos nada

  const video = document.getElementById('camara-video');
  const rect = video.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;

  mostrarIndicadorEnfoque(clientX - rect.left, clientY - rect.top);

  try {
    const constraints = { advanced: [{ focusMode: 'single-shot' }] };
    if (caps.pointsOfInterest) {
      constraints.advanced[0].pointsOfInterest = [{ x, y }];
    }
    await _camaraTrack.applyConstraints(constraints);
  } catch (e) {
    // Si el navegador no acepta el refoque puntual, no rompemos nada, simplemente se ignora
  }
}

function mostrarIndicadorEnfoque(x, y) {
  let indicador = document.getElementById('camara-foco-indicador');
  if (!indicador) {
    indicador = document.createElement('div');
    indicador.id = 'camara-foco-indicador';
    indicador.style.cssText = 'position:absolute;width:64px;height:64px;border:2px solid #e31e24;border-radius:8px;pointer-events:none;z-index:4;transition:opacity 0.3s';
    document.getElementById('camara-video').parentElement.appendChild(indicador);
  }
  indicador.style.left = (x - 32) + 'px';
  indicador.style.top = (y - 32) + 'px';
  indicador.style.opacity = '1';
  clearTimeout(indicador._timeout);
  indicador._timeout = setTimeout(() => { indicador.style.opacity = '0'; }, 700);
}

async function aplicarZoomCamara(valor) {
  document.getElementById('camara-zoom-valor').textContent = parseFloat(valor).toFixed(1) + 'x';
  if (_camaraTrack) {
    try {
      await _camaraTrack.applyConstraints({ advanced: [{ zoom: parseFloat(valor) }] });
    } catch (e) {
      // Si el navegador rechaza el valor puntual, no rompemos la cámara, solo ignoramos ese ajuste
    }
  }
}

// ═══ Selector de lente físico (fallback cuando no hay zoom nativo) ═══
let _camaraLentesDisponibles = [];
let _camaraLenteIndiceActual = 0;

async function listarLentesCamara() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  _camaraLentesDisponibles = devices.filter(d => d.kind === 'videoinput');
  const btn = document.getElementById('camara-lente-btn');
  btn.style.display = _camaraLentesDisponibles.length > 1 ? 'block' : 'none';
}

async function cambiarLenteCamara() {
  if (_camaraLentesDisponibles.length < 2) return;
  _camaraLenteIndiceActual = (_camaraLenteIndiceActual + 1) % _camaraLentesDisponibles.length;
  const lente = _camaraLentesDisponibles[_camaraLenteIndiceActual];

  if (_camaraStream) {
    _camaraStream.getTracks().forEach(track => track.stop());
  }

  const video = document.getElementById('camara-video');
  try {
    _camaraStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: lente.deviceId }, width: { ideal: 1080 }, height: { ideal: 1920 } },
      audio: false
    });
    video.srcObject = _camaraStream;
    try { configurarZoomCamara(); } catch (e) {}
    toast('📷 Lente ' + (_camaraLenteIndiceActual + 1) + '/' + _camaraLentesDisponibles.length);
  } catch (e) {
    toast('❌ No se pudo cambiar de lente', false);
  }
}
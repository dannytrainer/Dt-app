function showMTab(t) {
  ['perfil','peso','medidas','analisis'].forEach(x => {
    const el=document.getElementById('msec-'+x);
    if(el) el.style.display = x===t ? 'block' : 'none';
    const btn = document.getElementById('mtab-'+x);
    if(btn){btn.className = 'btn ' + (x===t ? 'br' : 'bg');
    btn.style.flex = '1';
    btn.style.fontSize = '12px';}
  });
}

async function showMTabLoad(t, id) {
  showMTab(t);
  if (t === 'perfil') await renderPerfil(id);
  if (t === 'medidas') await renderMedidas(id);
  if (t === 'analisis') await renderAnalisis(id);
}

async function abrirMedidas(id, nombre) {
  try {
    window.clienteMedidasId = id;
    window.clienteMedidasNombre = nombre;
    document.getElementById('modal-medidas-titulo').textContent = 'Medidas de ' + nombre;
    showMTab('perfil');
    await renderPerfil(id);
    renderPeso(id);
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
        <div style="font-size:26px;font-weight:700;color:#fff">${pesoActual||'-'}<span style="font-size:12px;color:#555"> kg</span></div>
        <div style="font-size:12px;font-weight:700;margin-top:6px;color:${cambio<0?'#4caf50':cambio>0?'#e31e24':'#555'}">${cambio!==null?(parseFloat(cambio)>0?'▲ +':'▼ ')+cambio+' kg':'-'}</div>
      </div>
      <div style="background:#111;border:1px solid #222;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:6px">Peso inicial</div>
        <div style="font-size:26px;font-weight:700;color:#fff">${pesoInicial||'-'}<span style="font-size:12px;color:#555"> kg</span></div>
        <div style="font-size:12px;color:#555;margin-top:6px">${pesos.length ? pesos[0].fecha : '-'}</div>
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
      <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:10px">Registrar nuevo peso</div>
      <div style="display:flex;gap:8px">
        <input type="number" id="m-peso-nuevo" placeholder="Ej: 74.5" step="0.1" style="flex:1;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
        <button class="btn br" onclick="registrarPeso('${id}')">📥 Guardar</button>
      </div>
    </div>
    <button class="btn bg" style="width:100%;margin-bottom:8px" onclick="verHistorialPeso('${id}')">📋 Ver historial de peso</button>
    <button style="width:100%;background:#0a1a0a;color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:8px" onclick="compartirProgreso(window.clienteMedidasId,window.clienteMedidasNombre)">📤 Compartir progreso</button>
  `;
}

async function renderMedidas(id) {
  const hist = await fetch('/api/historial/'+id).then(r=>r.json());
  const medidas = hist.medidas || [];
  const medActual = medidas.length ? medidas[medidas.length-1] : {};
  const medInicial = medidas.length ? medidas[0] : {};

  const campos = [
    {k:'cintura',l:'Cintura',s:'Perímetros (cm)'},
    {k:'cadera',l:'Cadera'},
    {k:'pecho',l:'Pecho'},
    {k:'brazo',l:'Brazo'},
    {k:'pierna',l:'Pierna'},
    {k:'hombros',l:'Hombros'},
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
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">% Grasa (Jackson & Pollock)</span><span style="font-size:13px;font-weight:700;color:#fff">${calc.pctGrasa}%</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">% Masa magra</span><span style="font-size:13px;font-weight:700;color:#fff">${calc.pctMagra}%</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515"><span style="font-size:12px;color:#888">Kg de grasa</span><span style="font-size:13px;font-weight:700;color:#fff">${calc.kgGrasa} kg</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="font-size:12px;color:#888">Kg músculo estimado</span><span style="font-size:13px;font-weight:700;color:#fff">${calc.kgMusculo} kg</span></div>
    </div>`;
  }

  if (calc.proporciones && Object.keys(calc.proporciones).length) {
    const labels = {hombros_cintura:'Hombros / cintura',pecho_cintura:'Pecho / cintura',brazo_cintura:'Brazo / cintura'};
    html += `<div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">📐 Proporciones (Steve Reeves)</div>
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
  await fetch('/api/historial/'+id+'/peso', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:parseFloat(val)})});
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

async function compartirProgreso(id, nombre) {
  const u = await fetch('/api/usuarios').then(r=>r.json());
  const usuario = u.find(x=>x.id===id);
  const hist = await fetch('/api/historial/'+id).then(r=>r.json());
  const calc = await fetch('/api/calculos/'+id).then(r=>r.json());
  const pesos = hist.peso||[];
  const medidas = hist.medidas||[];
  const perfil = usuario.perfil||{};
  const pesoActual = pesos.length ? pesos[pesos.length-1].valor : null;
  const pesoInicial = pesos.length ? pesos[0].valor : null;
  const medActual = medidas.length ? medidas[medidas.length-1] : null;
  const medInicial = medidas.length ? medidas[0] : null;

  let msg = '💪 *Progreso de ' + nombre + '*\n\n';
  if (perfil.fecha_inicio) {
    const semanas = Math.floor((new Date()-new Date(perfil.fecha_inicio))/(1000*60*60*24*7));
    msg += '⏱️ Tiempo: ' + semanas + ' semanas\n';
  }
  msg += '🏋️ Sesiones totales: ' + (usuario.sesiones_total||0) + '\n\n';
  if (pesoInicial && pesoActual) {
    const cambio = (parseFloat(pesoActual)-parseFloat(pesoInicial)).toFixed(1);
    msg += '⚖️ *Peso*\nInicial: '+pesoInicial+' kg\nActual: '+pesoActual+' kg\nCambio: '+(parseFloat(cambio)>0?'+':'')+cambio+' kg\n\n';
  }
  if (medActual && medInicial) {
    const campos = ['cintura','cadera','pecho','brazo','pierna'];
    const labels = ['Cintura','Cadera','Pecho','Brazo','Pierna'];
    msg += '📏 *Medidas*\n';
    campos.forEach((c,i)=>{
      if(medActual[c]&&medInicial[c]){
        const d=(parseFloat(medActual[c])-parseFloat(medInicial[c])).toFixed(1);
        msg+=labels[i]+': '+(parseFloat(d)>0?'+':'')+d+' cm\n';
      }
    });
    msg+='\n';
  }
  if (calc.pctGrasa) msg += '📊 % Grasa: '+calc.pctGrasa+'%\n📊 % Masa magra: '+calc.pctMagra+'%\n';
  const histShare = await fetch('/api/historial/'+id).then(r=>r.json());
  const medidasShare = histShare.medidas || [];
  if (medidasShare.length >= 2) {
    const actShare = medidasShare[medidasShare.length-1].analisis || {};
    const antShare = medidasShare[medidasShare.length-2].analisis || {};
    if (actShare.kgGrasa && antShare.kgGrasa) {
      const dg = (parseFloat(actShare.kgGrasa)-parseFloat(antShare.kgGrasa)).toFixed(1);
      const dm = (parseFloat(actShare.kgMusculo)-parseFloat(antShare.kgMusculo)).toFixed(1);
      msg += '\n📈 *Última medición*\n';
      msg += 'Grasa: '+(parseFloat(dg)>0?'+':'')+dg+' kg\n';
      msg += 'Músculo: '+(parseFloat(dm)>0?'+':'')+dm+' kg\n';
    }
  }

  const res = await fetch('/api/enviar', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telefono:usuario.telefono,mensaje:msg})});
  const data = await res.json();
  toast(data.ok ? '✅ Progreso enviado' : '❌ Error', data.ok);
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
        <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Notas / Lesiones</div>
        <textarea id="p-notas" placeholder="Observaciones, lesiones, limitaciones..." style="width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;min-height:80px;resize:vertical">${perfil.notas||''}</textarea>
      </div>
      <button class="btn br" style="width:100%" onclick="guardarPerfil('${id}')">💾 Guardar perfil</button>
    </div>
  `;
}

async function guardarPerfil(id) {
  const datos = {
    fecha_inicio: document.getElementById('p-fecha').value,
    sexo: document.getElementById('p-sexo').value,
    edad: document.getElementById('p-edad').value,
    altura: document.getElementById('p-altura').value,
    etiqueta: document.getElementById('p-etiqueta').value,
    notas: document.getElementById('p-notas').value
  };
  await fetch('/api/usuarios/'+id+'/perfil', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)});
  toast('✅ Perfil guardado');
}

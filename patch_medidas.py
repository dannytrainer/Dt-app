with open('/data/data/com.termux/files/home/Dt-app/public/medidas.js', 'r', encoding='utf-8') as f:
    content = f.read()

# CAMBIO 1: Reordenar perímetros (superior → inferior)
old_campos = """  const campos = [
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
  ];"""

new_campos = """  const campos = [
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
  ];"""

# CAMBIO 2: Agregar selector unidades en renderPerfil
old_unidades_field = """      <div style="margin-bottom:12px">
        <div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:5px">Notas / Lesiones</div>
        <textarea id="p-notas" placeholder="Observaciones, lesiones, limitaciones..." style="width:100%;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;min-height:80px;resize:vertical">${perfil.notas||''}</textarea>
      </div>
      <button class="btn br" style="width:100%" onclick="guardarPerfil('${id}')">💾 Guardar perfil</button>"""

new_unidades_field = """      <div style="margin-bottom:12px">
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
      <button class="btn br" style="width:100%" onclick="guardarPerfil('${id}')">💾 Guardar perfil</button>"""

# CAMBIO 3: Agregar función seleccionarUnidad y actualizar guardarPerfil
old_guardar = """async function guardarPerfil(id) {
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
}"""

new_guardar = """function seleccionarUnidad(u, id) {
  window._perfilUnidad = u;
  const kgBtn = document.getElementById('p-unit-kg');
  const lbBtn = document.getElementById('p-unit-lb');
  if (kgBtn) { kgBtn.style.background = u==='kg'?'#e31e24':'#1a1a1a'; kgBtn.style.borderColor = u==='kg'?'#e31e24':'#333'; }
  if (lbBtn) { lbBtn.style.background = u==='lb'?'#e31e24':'#1a1a1a'; lbBtn.style.borderColor = u==='lb'?'#e31e24':'#333'; }
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
}"""

# CAMBIO 4: Al abrir medidas, cargar unidad del cliente
old_abrir = """async function abrirMedidas(id, nombre) {
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
}"""

new_abrir = """async function abrirMedidas(id, nombre) {
  try {
    window.clienteMedidasId = id;
    window.clienteMedidasNombre = nombre;
    document.getElementById('modal-medidas-titulo').textContent = 'Medidas de ' + nombre;
    // Cargar unidad del cliente
    const u = await fetch('/api/usuarios').then(r=>r.json());
    const usuario = u.find(x=>x.id===id);
    window._clienteUnidad = (usuario.perfil||{}).unidades || 'kg';
    window._perfilUnidad = window._clienteUnidad;
    showMTab('perfil');
    await renderPerfil(id);
    renderPeso(id);
    document.getElementById('modal-medidas').classList.add('open');
  } catch(e) {
    alert('Error: ' + e.message);
  }
}"""

# CAMBIO 5: renderPeso use unidad del cliente
old_peso_display = """<div style="font-size:26px;font-weight:700;color:#fff">${UNIDADES.mostrarPeso(pesoActual)||'-'}<span style="font-size:12px;color:#555"> ${UNIDADES.pesoLabel()}</span></div>
<div style="font-size:12px;font-weight:700;margin-top:6px;color:${cambio<0?'#4caf50':cambio>0?'#e31e24':'#555'}">${cambio!==null?(parseFloat(cambio)>0?'▲ +':'▼ ')+UNIDADES.mostrarPeso(Math.abs(cambio))+' '+UNIDADES.pesoLabel():'-'}</div>
      </div>
      <div style="background:#111;border:1px solid #222;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:6px">Peso inicial</div>
<div style="font-size:26px;font-weight:700;color:#fff">${UNIDADES.mostrarPeso(pesoInicial)||'-'}<span style="font-size:12px;color:#555"> ${UNIDADES.pesoLabel()}</span></div>"""

new_peso_display = """<div style="font-size:26px;font-weight:700;color:#fff">${mostrarPesoCliente(pesoActual)||'-'}<span style="font-size:12px;color:#555"> ${pesoClienteLabel()}</span></div>
<div style="font-size:12px;font-weight:700;margin-top:6px;color:${cambio<0?'#4caf50':cambio>0?'#e31e24':'#555'}">${cambio!==null?(parseFloat(cambio)>0?'▲ +':'▼ ')+mostrarPesoCliente(Math.abs(cambio))+' '+pesoClienteLabel():'-'}</div>
      </div>
      <div style="background:#111;border:1px solid #222;border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:6px">Peso inicial</div>
<div style="font-size:26px;font-weight:700;color:#fff">${mostrarPesoCliente(pesoInicial)||'-'}<span style="font-size:12px;color:#555"> ${pesoClienteLabel()}</span></div>"""

# CAMBIO 6: input de peso use label de unidad
old_peso_input = """      <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:10px">Registrar nuevo peso</div>
      <div style="display:flex;gap:8px">
        <input type="number" id="m-peso-nuevo" placeholder="Ej: 74.5" step="0.1" style="flex:1;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
        <button class="btn br" onclick="registrarPeso('${id}')">📥 Guardar</button>
      </div>"""

new_peso_input = """      <div style="font-size:10px;color:#666;text-transform:uppercase;margin-bottom:10px">Registrar nuevo peso (${pesoClienteLabel()})</div>
      <div style="display:flex;gap:8px">
        <input type="number" id="m-peso-nuevo" placeholder="Ej: ${pesoClienteLabel()==='lb'?'165':'74.5'}" step="0.1" style="flex:1;background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none">
        <button class="btn br" onclick="registrarPeso('${id}')">📥 Guardar</button>
      </div>"""

# CAMBIO 7: registrarPeso convierta si es lb
old_registrar_peso = """async function registrarPeso(id) {
  const val = document.getElementById('m-peso-nuevo').value;
  if (!val) { toast('Escribe el peso', false); return; }
  await fetch('/api/historial/'+id+'/peso', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:parseFloat(val)})});
  toast('✅ Peso registrado');
  await renderPeso(id);
}"""

new_registrar_peso = """async function registrarPeso(id) {
  const val = document.getElementById('m-peso-nuevo').value;
  if (!val) { toast('Escribe el peso', false); return; }
  const valorKg = inputAPesoCliente(val);
  await fetch('/api/historial/'+id+'/peso', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:valorKg})});
  toast('✅ Peso registrado');
  await renderPeso(id);
}"""

cambios = [
    (old_campos, new_campos, 'perímetros reordenados'),
    (old_unidades_field, new_unidades_field, 'selector unidades en perfil'),
    (old_guardar, new_guardar, 'guardarPerfil + funciones unidad'),
    (old_abrir, new_abrir, 'abrirMedidas carga unidad'),
    (old_peso_display, new_peso_display, 'display peso con unidad cliente'),
    (old_peso_input, new_peso_input, 'input peso label unidad'),
    (old_registrar_peso, new_registrar_peso, 'registrarPeso convierte lb'),
]

errores = []
for old, new, nombre in cambios:
    if old in content:
        content = content.replace(old, new, 1)
        print('OK - ' + nombre)
    else:
        print('ERROR - No encontré: ' + nombre)
        errores.append(nombre)

if not errores:
    with open('/data/data/com.termux/files/home/Dt-app/public/medidas.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('✅ medidas.js actualizado')
else:
    print('⚠️ No se guardó — corregir errores primero')

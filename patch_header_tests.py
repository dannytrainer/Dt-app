# ── PATCH 1: quitar botón global del header ──
with open('/data/data/com.termux/files/home/Dt-app/public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_btn = '<button class="btn bg btn-unidades" style="font-size:11px;padding:7px 10px" onclick="UNIDADES.toggle()">⚖️ KG / CM</button>'
new_btn = ''

if old_btn in html:
    html = html.replace(old_btn, new_btn, 1)
    with open('/data/data/com.termux/files/home/Dt-app/public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('OK - botón global eliminado')
else:
    print('ERROR - botón global no encontrado')

# ── PATCH 2: tests.js usa unidad del cliente ──
with open('/data/data/com.termux/files/home/Dt-app/public/tests.js', 'r', encoding='utf-8') as f:
    tests = f.read()

# Reemplazar display peso corporal en header de tests
old_peso_header = """<div style="font-size:10px;color:#888;margin-bottom:10px">Peso corporal: <span style="color:#e31e24;font-weight:700">${UNIDADES.mostrarPeso(pesoCorporal)} ${UNIDADES.pesoLabel()}</span> · <span style="color:#e31e24;font-weight:700">${sexo === 'M' ? 'Masculino' : 'Femenino'}</span></div>"""
new_peso_header = """<div style="font-size:10px;color:#888;margin-bottom:10px">Peso corporal: <span style="color:#e31e24;font-weight:700">${mostrarPesoCliente(pesoCorporal)} ${pesoClienteLabel()}</span> · <span style="color:#e31e24;font-weight:700">${sexo === 'M' ? 'Masculino' : 'Femenino'}</span></div>"""

# Reemplazar label kg en columna de fuerza
old_kg_label = """<div><div style="font-size:9px;color:#555;text-align:center">${key === 'triceps' ? (valKg < 0 ? 'asist' : 'lastre') : UNIDADES.pesoLabel()}</div>
          <input type="number" id="f-${key}-kg" value="${valKg}" placeholder="-" step="0.5" style="width:52px;background:#0a0a0a;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:13px;text-align:center;outline:none" oninput="actualizarFuerza('${key}')"></div>"""
new_kg_label = """<div><div style="font-size:9px;color:#555;text-align:center">${key === 'triceps' ? (valKg < 0 ? 'asist' : 'lastre') : pesoClienteLabel()}</div>
          <input type="number" id="f-${key}-kg" value="${valKg ? mostrarPesoCliente(valKg) : ''}" placeholder="-" step="0.5" style="width:52px;background:#0a0a0a;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:13px;text-align:center;outline:none" oninput="actualizarFuerza('${key}')"></div>"""

# Reemplazar display 1RM en filaFuerza
old_rm_display = """<div id="${key}-rm-label" style="font-size:11px;color:#888;margin-top:2px">${rm ? '1RM est: <span style=\\"color:#e31e24;font-weight:700\\">' + UNIDADES.mostrarPeso(rm) + ' ' + UNIDADES.pesoLabel() + '</span>' : ''}</div>"""
new_rm_display = """<div id="${key}-rm-label" style="font-size:11px;color:#888;margin-top:2px">${rm ? '1RM est: <span style=\\"color:#e31e24;font-weight:700\\">' + mostrarPesoCliente(rm) + ' ' + pesoClienteLabel() + '</span>' : ''}</div>"""

# Reemplazar display 1RM en actualizarFuerza
old_rm_update = """if (rmLabel) rmLabel.innerHTML = '1RM est: <span style="color:#e31e24;font-weight:700">' + UNIDADES.mostrarPeso(rmReal) + ' ' + UNIDADES.pesoLabel() + '</span>';"""
new_rm_update = """if (rmLabel) rmLabel.innerHTML = '1RM est: <span style="color:#e31e24;font-weight:700">' + mostrarPesoCliente(rmReal) + ' ' + pesoClienteLabel() + '</span>';"""

# En actualizarFuerza: convertir input lb→kg antes de calcular
old_actualizar = """function actualizarFuerza(key) {
  const kg = parseFloat(document.getElementById('f-' + key + '-kg')?.value);
  const reps = parseFloat(document.getElementById('f-' + key + '-reps')?.value);"""
new_actualizar = """function actualizarFuerza(key) {
  const kgRaw = parseFloat(document.getElementById('f-' + key + '-kg')?.value);
  const kg = inputAPesoCliente(kgRaw);
  const reps = parseFloat(document.getElementById('f-' + key + '-reps')?.value);"""

# En guardarTest fuerza: convertir kg input
old_guardar_fuerza = """    keys.forEach(k => {
      const kg = document.getElementById('f-' + k + '-kg')?.value;
      const reps = document.getElementById('f-' + k + '-reps')?.value;
      if (kg && reps) { const rm = epley(kg, reps); datos[k] = { kg: parseFloat(kg), reps: parseFloat(reps), rm, score: getScore('fuerza', k, rm, sexo, peso).score }; }
    });"""
new_guardar_fuerza = """    keys.forEach(k => {
      const kgRaw = document.getElementById('f-' + k + '-kg')?.value;
      const reps = document.getElementById('f-' + k + '-reps')?.value;
      if (kgRaw && reps) { const kg = inputAPesoCliente(kgRaw); const rm = epley(kg, reps); datos[k] = { kg: parseFloat(kg), reps: parseFloat(reps), rm, score: getScore('fuerza', k, rm, sexo, peso).score }; }
    });"""

# En renderTests: cargar unidad del cliente
old_render_tests = """  window._testsHistorial = histTests.registros || [];
  window._testsPeso = pesoCorporal;
  window._testsSexo = sexo;
  window._testsId = id;"""
new_render_tests = """  window._testsHistorial = histTests.registros || [];
  window._testsPeso = pesoCorporal;
  window._testsSexo = sexo;
  window._testsId = id;
  window._clienteUnidad = (perfil.unidades) || 'kg';
  window._perfilUnidad = window._clienteUnidad;"""

cambios = [
    (old_peso_header, new_peso_header, 'header peso tests'),
    (old_kg_label, new_kg_label, 'label kg columna fuerza'),
    (old_rm_display, new_rm_display, 'display 1RM filaFuerza'),
    (old_rm_update, new_rm_update, 'display 1RM actualizarFuerza'),
    (old_actualizar, new_actualizar, 'actualizarFuerza convierte lb'),
    (old_guardar_fuerza, new_guardar_fuerza, 'guardarTest convierte lb'),
    (old_render_tests, new_render_tests, 'renderTests carga unidad'),
]

errores = []
for old, new, nombre in cambios:
    if old in tests:
        tests = tests.replace(old, new, 1)
        print('OK - ' + nombre)
    else:
        print('ERROR - ' + nombre)
        errores.append(nombre)

if not errores:
    with open('/data/data/com.termux/files/home/Dt-app/public/tests.js', 'w', encoding='utf-8') as f:
        f.write(tests)
    print('✅ tests.js actualizado')
else:
    print('⚠️ No se guardó tests.js — errores: ' + str(errores))

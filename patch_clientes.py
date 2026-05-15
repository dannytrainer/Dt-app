with open('/data/data/com.termux/files/home/Dt-app/public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# CAMBIO 1: agregar botón +1 sesión y lógica de último consultado
old_card = """<div style="display:flex;gap:6px">
<button class="btn bg" style="flex:1;font-size:12px" onclick="editarCliente('${u.id}')">✏️ Editar</button>
<button class="btn bg" style="flex:1;font-size:12px" onclick="abrirMedidas('${u.id}','${u.nombre}')">📊 Medidas</button>
<button class="btn bg" style="flex:1;font-size:12px" onclick="abrirTests('${u.id}','${u.nombre}')">🏋️ Tests</button>
<button class="btn bp" style="font-size:12px;padding:10px 12px" onclick="eliminarCliente('${u.id}')">🗑️</button>
</div>"""

new_card = """<div style="display:flex;gap:6px;margin-bottom:6px">
<button class="btn bg" style="flex:1;font-size:12px" onclick="editarCliente('${u.id}')">✏️ Editar</button>
<button class="btn bg" style="flex:1;font-size:12px" onclick="marcarSesionRapida('${u.id}',this)">+1 💪</button>
<button class="btn bp" style="font-size:12px;padding:10px 12px" onclick="eliminarCliente('${u.id}')">🗑️</button>
</div>
<div style="display:flex;gap:6px">
<button class="btn bg" style="flex:1;font-size:12px" onclick="abrirMedidasYSubir('${u.id}','${u.nombre}')">📊 Medidas</button>
<button class="btn bg" style="flex:1;font-size:12px" onclick="abrirTestsYSubir('${u.id}','${u.nombre}')">🏋️ Tests</button>
</div>"""

# CAMBIO 2: agregar funciones nuevas antes del cierre de script principal
old_abrir_tests = """async function abrirTests(id,nombre){
  window.clienteTestsId=id;
  document.getElementById("modal-tests-titulo").textContent="🏋️ Tests - "+nombre;
  document.getElementById("modal-tests").classList.add("open");
await renderTests(id);"""

new_abrir_tests = """async function abrirTests(id,nombre){
  window.clienteTestsId=id;
  document.getElementById("modal-tests-titulo").textContent="🏋️ Tests - "+nombre;
  document.getElementById("modal-tests").classList.add("open");
await renderTests(id);"""

# CAMBIO 3: agregar funciones de sesión rápida y subir al tope
old_fn = """async function abrirTests(id,nombre){"""
new_fn = """var _ultimoClienteId=null;

async function marcarSesionRapida(id,btn){
  try{
    const res=await fetch('/api/usuarios/'+id+'/sesion',{method:'POST'});
    const data=await res.json();
    btn.textContent='✅';
    btn.style.background='#1a3a1a';
    btn.style.color='#4caf50';
    setTimeout(()=>{btn.textContent='+1 💪';btn.style.background='';btn.style.color='';},2000);
    toast('💪 Sesión: Total '+data.sesiones_total+' | Ciclo '+data.sesiones_ciclo);
    _ultimoClienteId=id;
  }catch(e){toast('Error',false);}
}

async function abrirMedidasYSubir(id,nombre){
  _ultimoClienteId=id;
  _reordenarLista();
  await abrirMedidas(id,nombre);
}

async function abrirTestsYSubir(id,nombre){
  _ultimoClienteId=id;
  _reordenarLista();
  await abrirTests(id,nombre);
}

function _reordenarLista(){
  if(!_ultimoClienteId||!window._usuariosCargados)return;
  const idx=window._usuariosCargados.findIndex(u=>u.id===_ultimoClienteId);
  if(idx>0){
    const u=window._usuariosCargados.splice(idx,1)[0];
    window._usuariosCargados.unshift(u);
  }
}

async function abrirTests(id,nombre){"""

cambios = [
    (old_card, new_card, 'botón +1 en tarjeta'),
    (old_fn, new_fn, 'funciones sesión rápida y reordenar'),
]

errores = []
for old, new, nombre in cambios:
    if old in content:
        content = content.replace(old, new, 1)
        print('OK - ' + nombre)
    else:
        print('ERROR - ' + nombre)
        errores.append(nombre)

if not errores:
    with open('/data/data/com.termux/files/home/Dt-app/public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('✅ index.html actualizado')
else:
    print('⚠️ No se guardó — errores: ' + str(errores))

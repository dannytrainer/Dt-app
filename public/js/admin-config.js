// ═══════════════════════════════
// CONFIG BOTTOM SHEET
// ═══════════════════════════════
// ═══════════════════════════════
// CONFIG BOTTOM SHEET
// ═══════════════════════════════


async function subirLogo(input){
  const file=input.files[0];
  if(!file)return;
  const form=new FormData();
  form.append('logo',file);
  try{
    const r=await fetch('/api/config/logo',{method:'POST',body:form});
    const d=await r.json();
    if(d.ok){
      document.getElementById('cfg-logo-preview').src=(d.path||'/logo_trainer.png')+'?t='+Date.now();
      toast('✅ Logo actualizado');
    }
  }catch(e){toast('❌ Error subiendo logo',false);}
}
async function guardarNombreEntrenador(){
  const nombre=document.getElementById('cfg-nombre').value.trim();
  if(!nombre)return;
  await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nombre_entrenador:nombre, entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)})});
  // Actualizar todos los elementos que muestran el nombre
  ['nombre-entrenador','span-nombre-cfg','informe-nombre-ent'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.textContent=nombre;
  });
  // Actualizar sesión local
  const sesion=JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  sesion.nombre=nombre;
  localStorage.setItem('dt_sesion', JSON.stringify(sesion));
  setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
  toast('✅ Nombre actualizado');
}
function toggleTema(){
  const claro = document.body.classList.toggle('modo-claro');
  document.getElementById('btn-tema').textContent = claro ? '☀️' : '🌙';
  localStorage.setItem('tema', claro ? 'claro' : 'oscuro');
  localStorage.setItem('dt_tema', claro ? 'claro' : 'oscuro');
  fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tema:claro?'claro':'oscuro', entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)})});
}
function cargarTema(){
  let tema = localStorage.getItem('dt_tema') || localStorage.getItem('tema');
  if (!tema) {
    tema = window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
  }
  if(tema === 'claro'){
    document.body.classList.add('modo-claro');
    const btn = document.getElementById('btn-tema');
    if(btn) btn.textContent = '☀️';
  } else {
    document.body.classList.remove('modo-claro');
    const btn = document.getElementById('btn-tema');
    if(btn) btn.textContent = '🌙';
  }
  localStorage.setItem('dt_tema', tema);
  localStorage.setItem('tema', tema);
}
async function guardarInstagram(){
  const ig=document.getElementById('cfg-instagram').value.trim();
  if(!ig)return;
  await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({instagram_entrenador:ig, entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)})});
  // Actualizar todos los elementos que muestran el IG
  ['span-ig-entrenador','informe-ig-ent','cfg-ig-display'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.textContent='@'+ig.replace('@','');
  });
  // Guardar en sesión local
  const sesion=JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  sesion.instagram=ig;
  localStorage.setItem('dt_sesion', JSON.stringify(sesion));
  setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
  toast('✅ Instagram guardado');
}
async function cargarNombreEntrenador(){
  try{
    const cfg=await fetch('/api/config?entrenador_id='+(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json());
    if(cfg.colores)aplicarColoresGuardados(cfg.colores);
    if(cfg.nombre_entrenador){
      document.getElementById('nombre-entrenador').textContent=cfg.nombre_entrenador;
      const inp=document.getElementById('cfg-nombre');
      if(inp)inp.value=cfg.nombre_entrenador;
    }
    if(cfg.instagram_entrenador){
      const inpIg=document.getElementById('cfg-instagram');
      if(inpIg)inpIg.value=cfg.instagram_entrenador;
    }
    if(cfg.logo_entrenador){
      const t='?t='+Date.now();
      const prev=document.getElementById('cfg-logo-preview');
      if(prev)prev.src=cfg.logo_entrenador+t;
    }
  }catch(e){console.error('cargarNombreEntrenador',e);}
}
function abrirConfig(){
  // Mostrar botón superadmin solo para Danny
  const _sesaCheck = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  const _btnSA = document.getElementById('btn-superadmin');
  if (_btnSA) _btnSA.style.display = _sesaCheck.email === 'danielgaviriabotero@gmail.com' ? 'block' : 'none';
  const sh=document.getElementById('config-sheet');
  sh.style.display='flex';
  cargarNombreEntrenador();
  cargarCodigoVinc();
  cargarEstadoWA();
  cargarEstadoWA();
  // Mostrar estado premium entrenador
  fetch('/api/config?entrenador_id='+(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json()).then(cfg => {
    const el = document.getElementById('cfg-premium-estado');
    if (!el) return;
    const activo = cfg.premium_entrenador;
    const hasta = cfg.premium_entrenador_hasta;
    const hoy = new Date().toISOString().split('T')[0];
    if (activo && hasta && hasta >= hoy) {
      el.style.color = '#4caf50';
      el.textContent = '✅ Premium activo — Vence: ' + hasta;
    } else if (activo && hasta && hasta < hoy) {
      el.style.color = '#e31e24';
      el.textContent = '❌ Premium vencido — Renovar para continuar';
    } else {
      el.style.color = '#555';
      el.textContent = 'Acceso completo a todas las funciones profesionales';
    }
  }).catch(()=>{});
}
async function validarCodigoPremium(){
  const input = document.getElementById('cfg-codigo-premium');
  const status = document.getElementById('cfg-codigo-status');
  const codigo = (input.value || '').trim().toUpperCase();
  if(!codigo){ status.style.color='#666'; status.textContent='Ingresa un código.'; return; }
  status.style.color='#888'; status.textContent='Verificando...';
  const sesion = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  const email = sesion.email || '';
  try {
    // Intentar primero como código de convenio
    const deviceId = getDeviceId();
    const resConv = await fetch('/api/convenio/activar', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ codigo, email, tipo: 'entrenador', deviceId })
    });
    const dConv = await resConv.json();
    if(dConv.ok){
      status.style.color='#4caf50';
      status.textContent='✅ Premium activado' + (dConv.hasta ? ' — Activo hasta: ' + dConv.hasta : '');
      input.value='';
      localStorage.setItem('dt_premium','1');
      localStorage.setItem('dt_premium_hasta', dConv.hasta || '');
      return;
    }
    // Si no es convenio, intentar código personal
    const res = await fetch('/api/premium/activar-entrenador', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ codigo })
    });
    const d = await res.json();
    if(d.ok){
      status.style.color='#4caf50';
      status.textContent='✅ Premium activado' + (d.hasta ? ' — Activo hasta: ' + d.hasta : '');
      input.value='';
      localStorage.setItem('dt_premium','1');
      localStorage.setItem('dt_premium_hasta', d.hasta || '');
    } else {
      status.style.color='#e31e24';
      status.textContent='❌ ' + (dConv.error || d.msg || 'Código inválido');
    }
  } catch(e) {
    status.style.color='#e31e24';
    status.textContent='❌ Error de conexión';
  }
}
function entToggleTema(btn) {
  document.body.classList.toggle("modo-claro");
  var claro = document.body.classList.contains("modo-claro");
  localStorage.setItem("dt_tema", claro ? "claro" : "oscuro");
  btn.innerHTML = claro ? "&#9728; Claro" : "&#127769; Oscuro";
  btn.style.background = claro ? "#e31e24" : "#1a1a1a";
  var lbl = document.getElementById("ent-cfg-tema-lbl");
  if (lbl) lbl.textContent = claro ? "Modo claro" : "Modo oscuro";
  // Actualizar fondo del panel config
  var sh = document.getElementById("config-sheet");
  if (sh) sh.style.background = claro ? "#f5f5f5" : "#050505";
}




function cerrarConfig(){
  const sh=document.getElementById('config-sheet');
  sh.style.display='none';
}

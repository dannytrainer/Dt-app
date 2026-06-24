const DIAS=['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
let rutinaActual={},diaSeleccionado='lunes';

function showPage(p){
const hPanel=document.getElementById('herramienta-panel');
if(hPanel&&hPanel.style.display!=='none'){
  hPanel.style.display='none';
  const st=document.querySelector('#page-logs .st');
  if(st){st.style.display='block';if(st.nextElementSibling)st.nextElementSibling.style.display='grid';}
}
desbloquearSwipe();
// Detener todos los loops de juegos
window._juegoActivo=false;
if(window._hk) window._hk.activo=false;
if(window._invActivo!==undefined) window._invActivo=false;
document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
document.getElementById('page-'+p).classList.add('active');
const nav=document.getElementById('nav-principal');
if(p==='inicio'){nav.style.display='flex';}
else{nav.style.display='flex';const navIdx=['inicio','clientes','rutinas','logs','enviar'].indexOf(p);if(navIdx>=0)document.querySelectorAll('.nav button')[navIdx].classList.add('active');}
document.getElementById('fab-btn').style.display=p==='clientes'?'flex':'none';
if(p==='inicio'){cargarInicio();cargarHorarios().then(()=>setTimeout(renderMiniCal,300));}
if(p==='clientes'){cargarClientes();cargarEstadoPausaGlobal();}
if(p==='rutinas')cargarRutinasClientes();
if(p==='festivos')cargarFestivos();
if(p==='logs')cargarLogs();
if(p==='enviar'){cargarSelectEnviar();cargarDifusion();}
if(p==='admin'){cargarAdmin();setTimeout(cargarCobroAutoEstado,500);}
if(p==='horarios')initHorarios();
}
function toast(msg,ok=true){
const t=document.getElementById('toast');
t.textContent=msg;
t.style.borderLeftColor=ok?'#4caf50':'#e31e24';
t.classList.add('show');
setTimeout(()=>t.classList.remove('show'),2500);
}

function togglePago2(){
const t=document.getElementById('cliente-tipo-pago').value;
document.getElementById('pago2-box').style.display=t==='quincenal'?'block':'none';
}

function epBadge(ep){
if(ep==='vencido')return '<span class="badge bv">🔴 Vencido</span>';
if(ep==='proximo')return '<span class="badge bpr">⚠️ Pago próximo</span>';
return '<span class="badge bal">✅ Al día</span>';
}






// ═══════════════════════════════

function cobroAutoActualizarUI(activo){
  const toggle = document.getElementById('cobro-auto-toggle');
  const dot = document.getElementById('cobro-auto-dot');
  if(toggle) toggle.style.background = activo ? '#e31e24' : '#333';
  if(dot) dot.style.left = activo ? '18px' : '2px';
}
async function cargarCobroAutoEstado(){
  try{
    const eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001');
    const cfg = await fetch('/api/config?entrenador_id='+eid).then(r=>r.json());
    const activo = cfg.cobro_auto_activo !== false;
    cobroAutoActualizarUI(activo);
  }catch(e){}
}
async function toggleCobroAuto(){
  const esPremium = typeof entEsPremium === 'function' ? entEsPremium() : false;
  if(!esPremium){
    toast('⭐ Función Premium — Activa tu plan para usarla.',false);
    return;
  }
  try{
    const eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001');
    const cfg = await fetch('/api/config?entrenador_id='+eid).then(r=>r.json());
    const nuevoEstado = cfg.cobro_auto_activo === false ? true : false;
    await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entrenador_id:eid, cobro_auto_activo:nuevoEstado})});
    cobroAutoActualizarUI(nuevoEstado);
  }catch(e){}
}


async function enviarCobroManual(id){
  console.log('enviarCobroManual id:', id);
  const u = (window._adminUsuarios||[]).find(x=>x.id==id || x.id=='cli_'+id || x.id.replace('cli_','')==String(id));
  console.log('usuario encontrado:', u ? u.nombre : 'NO');
  if(!u){ toast('❌ Cliente no encontrado',false); return; }
  const msg = document.getElementById('ac-msg') ? document.getElementById('ac-msg').value : (u.msg_pago||'');
  if(!msg){ toast('⚠️ Escribe un mensaje de cobro primero',false); return; }
  if(!u.telefono){ toast('⚠️ Cliente sin teléfono registrado',false); return; }
  try{
    const eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001');
    const res = await fetch('/api/enviar',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({telefono:u.telefono, mensaje:msg, entrenador_id:eid})
    });
    const d = await res.json();
    if(d.ok){ toast('✅ Mensaje enviado a '+u.nombre); }
    else{ toast('❌ '+(d.error||'No se pudo enviar'),false); }
  }catch(e){ toast('❌ Error de conexión',false); }
}

// MODULO ADMINISTRATIVO
// ═══════════════════════════════
const MONEDAS = ['COP','USD','EUR','GBP','MXN','ARS','BRL','PEN','CLP'];

async function cargarAdmin(){
  try{
    const [usuarios, adminData, configData] = await Promise.all([
      fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json()),
      fetch('/api/admin?entrenador_id='+(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json()),
      fetch('/api/config?entrenador_id='+(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json())
    ]);
    window._adminUsuarios = usuarios;
    window._adminData = adminData;
    if(!window._adminData.config) window._adminData.config = {};
    Object.assign(window._adminData.config, configData);
    showAdminTab('dashboard');
  }catch(e){console.error('cargarAdmin',e);}
}

function showAdminTab(tab){
  ['dashboard','clientes','promos','config'].forEach(t=>{
    const btn=document.getElementById('atab-'+t);
    if(btn){btn.style.background=t===tab?'var(--rojo)':'#2a2a2a';btn.style.color=t===tab?'#fff':'#888';}
  });
  const c=document.getElementById('admin-tab-content');
  if(tab==='dashboard') c.innerHTML=renderAdminDashboard();
  else if(tab==='clientes') c.innerHTML=renderAdminClientes();
  else if(tab==='config') {
    fetch('/api/config?entrenador_id='+(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json()).then(cfg=>{
      if(!window._adminData) window._adminData={};
      window._adminData.config = cfg;
      c.innerHTML=renderAdminConfig();
      cargarCodigoVinc();
    });
  }
}

function _adminPanelMetodos(met,pagos,color){
  let h='<div style="margin-top:10px;border-top:1px solid #2a2a2a;padding-top:10px">';
  const icons={efectivo:'💵',transferencia:'🏦',tarjeta:'💳',otro:'📦'};
  Object.keys(met).forEach(k=>{
    if(met[k]>0)h+='<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--texto-medio)">'+icons[k]+' '+k.charAt(0).toUpperCase()+k.slice(1)+'</span><span style="color:'+color+';font-weight:700">'+met[k].toLocaleString()+'</span></div>';
  });
  if(pagos.length){
    h+='<div style="margin-top:8px;font-size:11px;color:var(--texto-secundario);text-transform:uppercase;letter-spacing:1px">Detalle</div>';
    pagos.forEach(p=>{
      h+='<div style="background:var(--fondo);border-radius:8px;padding:7px;margin-top:4px"><div style="display:flex;justify-content:space-between"><span style="font-size:12px;color:var(--texto);font-weight:600">'+p.nombre+'</span><span style="font-size:12px;color:'+color+';font-weight:700">'+p.monto.toLocaleString()+' '+p.moneda+'</span></div><div style="font-size:10px;color:var(--texto-secundario);margin-top:2px">'+p.fecha+' · '+p.metodo+(p.novedad?' · '+p.novedad:'')+'</div></div>';
    });
  }
  h+='</div>';
  return h;
}

if(!window._chartInstances)window._chartInstances={};
function abrirComparativoModal(){
  var dash=window._dash||{};
  var meses=dash.meses||[];
  var existing=document.getElementById("modal-comparativo");
  if(existing){existing.remove();return;}
  var metAnt=dash.metodosMesAnt||{};
  var met=dash.metodos||{};
  var pagosMesAnt=dash.pagosMesAnt||[];
  var pagosMes=dash.pagosMes||[];
  var mesAnt=meses[dash.mesAnterior]||'Ant';
  var mesAct=meses[dash.mesActual]||'Act';
  var totalAnt=dash.totalMesAnt||0;
  var totalAct=dash.totalPagos||0;
  var diff=totalAct-totalAnt;
  var diffColor=diff>=0?'#4caf50':'#e31e24';
  var diffIcon=diff>=0?'▲':'▼';
  function fmt(n){return (n||0).toLocaleString();}
  function listapagos(arr,color){
    if(!arr||!arr.length)return '<div style="color:#666;font-size:12px;padding:8px">Sin pagos registrados</div>';
    var s='';
    arr.forEach(function(p){
      var ic=p.metodo==='transferencia'?'🏦':p.metodo==='tarjeta'?'💳':'💵';
      s+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a1a">';
      s+='<div><div style="font-size:13px;color:#fff;font-weight:600">'+p.nombre+'</div>';
      s+='<div style="font-size:11px;color:#666">'+p.fecha+' · '+ic+' '+p.metodo+'</div></div>';
      s+='<div style="font-size:13px;font-weight:700;color:'+color+'">'+fmt(p.monto)+' '+p.moneda+'</div></div>';
    });
    return s;
  }
  var modal=document.createElement('div');
  modal.id='modal-comparativo';
  modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0a0a;z-index:9999;overflow-y:auto;padding:16px;box-sizing:border-box';
  var h='';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">';
  h+='<div style="font-size:16px;font-weight:700;color:#fff">📊 Comparativo mensual</div>';
  h+='<button onclick="document.getElementById(\'modal-comparativo\').remove()" style="background:#2a2a2a;border:none;border-radius:8px;color:#fff;padding:8px 14px;font-size:13px;cursor:pointer">✕ Cerrar</button></div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">';
  h+='<div style="background:#111;border:1px solid #4a9eff44;border-radius:14px;padding:14px;text-align:center">';
  h+='<div style="font-size:11px;color:#4a9eff;font-weight:700;margin-bottom:6px">'+mesAnt+'</div>';
  h+='<div style="font-size:20px;font-weight:800;color:#fff">'+fmt(totalAnt)+'</div>';
  h+='<div style="font-size:10px;color:#666;margin-top:2px">'+pagosMesAnt.length+' pagos</div></div>';
  h+='<div style="background:#111;border:1px solid #e31e2444;border-radius:14px;padding:14px;text-align:center">';
  h+='<div style="font-size:11px;color:#e31e24;font-weight:700;margin-bottom:6px">'+mesAct+'</div>';
  h+='<div style="font-size:20px;font-weight:800;color:#fff">'+fmt(totalAct)+'</div>';
  h+='<div style="font-size:10px;color:#666;margin-top:2px">'+pagosMes.length+' pagos</div></div></div>';
  h+='<div style="background:#111;border-radius:14px;padding:14px;margin-bottom:20px;text-align:center">';
  h+='<div style="font-size:11px;color:#888;margin-bottom:4px">Diferencia</div>';
  h+='<div style="font-size:22px;font-weight:800;color:'+diffColor+'">'+diffIcon+' '+fmt(Math.abs(diff))+'</div></div>';
  h+='<div style="background:#111;border-radius:14px;padding:14px;margin-bottom:20px">';
  h+='<canvas id="chart-comp-modal" style="width:100%;max-height:200px"></canvas></div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">';
  var metodos=[['💵','efectivo'],['🏦','transferencia'],['💳','tarjeta'],['📦','otro']];
  metodos.forEach(function(m){
    var ic=m[0],key=m[1];
    h+='<div style="background:#111;border-radius:12px;padding:12px">';
    h+='<div style="font-size:11px;color:#888;margin-bottom:6px">'+ic+' '+key.charAt(0).toUpperCase()+key.slice(1)+'</div>';
    h+='<div style="font-size:12px;color:#4a9eff">'+mesAnt+': <b>'+fmt(metAnt[key]||0)+'</b></div>';
    h+='<div style="font-size:12px;color:#e31e24">'+mesAct+': <b>'+fmt(met[key]||0)+'</b></div></div>';
  });
  h+='</div>';
  h+='<div style="background:#111;border-radius:14px;padding:14px;margin-bottom:16px">';
  h+='<div style="font-size:13px;font-weight:700;color:#4a9eff;margin-bottom:10px">📅 Pagos '+mesAnt+'</div>';
  h+=listapagos(pagosMesAnt,'#4a9eff');
  h+='</div>';
  h+='<div style="background:#111;border-radius:14px;padding:14px;margin-bottom:16px">';
  h+='<div style="font-size:13px;font-weight:700;color:#e31e24;margin-bottom:10px">📅 Pagos '+mesAct+'</div>';
  h+=listapagos(pagosMes,'#e31e24');
  h+='</div>';
  modal.innerHTML=h;
  document.body.appendChild(modal);
  setTimeout(function(){
    var ctx=document.getElementById('chart-comp-modal');
    if(!ctx)return;
    new Chart(ctx,{
      type:'bar',
      data:{
        labels:['Efectivo','Transfer.','Tarjeta','Otro'],
        datasets:[
          {label:mesAnt,data:[metAnt.efectivo||0,metAnt.transferencia||0,metAnt.tarjeta||0,metAnt.otro||0],backgroundColor:'#4a9eff44',borderColor:'#4a9eff',borderWidth:2,borderRadius:6},
          {label:mesAct,data:[met.efectivo||0,met.transferencia||0,met.tarjeta||0,met.otro||0],backgroundColor:'#e31e2444',borderColor:'#e31e24',borderWidth:2,borderRadius:6}
        ]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#ccc',font:{size:11}}}},scales:{x:{ticks:{color:'#888'}},y:{ticks:{color:'#888',callback:function(v){return v.toLocaleString();}}}}}
    });
  },300);
}

function toggleDashPanel(id){
  const el=document.getElementById(id);
  if(!el)return;
  const visible=el.style.display==='none';
  el.style.display=visible?'block':'none';
  if(!visible)return;
  const dash=window._dash||{};
  if(id==='dp-cob'){
    const ctx=document.getElementById('chart-metodos');
    if(!ctx)return;
    if(window._chartInstances['metodos'])window._chartInstances['metodos'].destroy();
    const met=dash.metodos||{efectivo:0,transferencia:0,tarjeta:0,otro:0};
    const vals=[met.efectivo,met.transferencia,met.tarjeta,met.otro];
    if(vals.every(v=>v===0))return;
    window._chartInstances['metodos']=new Chart(ctx,{
      type:'doughnut',
      data:{labels:['💵 Efectivo','🏦 Transferencia','💳 Tarjeta','📦 Otro'],datasets:[{data:vals,backgroundColor:['#4caf50','#4a9eff','#ff9800','#9c27b0'],borderWidth:0}]},
      options:{plugins:{legend:{labels:{color:'#ccc',font:{size:11}}}},cutout:'65%'}
    });
  }
  if(id==='dp-ant'){
    const ctx=document.getElementById('chart-comparativo');
    if(!ctx)return;
    if(window._chartInstances['comp'])window._chartInstances['comp'].destroy();
    const met=dash.metodos||{};
    const metAnt=dash.metodosMesAnt||{};
    const meses=dash.meses||[];
    window._chartInstances['comp']=new Chart(ctx,{
      type:'bar',
      data:{
        labels:['Efectivo','Transfer.','Tarjeta','Otro'],
        datasets:[
          {label:meses[dash.mesAnterior]||'Ant',data:[metAnt.efectivo||0,metAnt.transferencia||0,metAnt.tarjeta||0,metAnt.otro||0],backgroundColor:'#4a9eff44',borderColor:'#4a9eff',borderWidth:2,borderRadius:6},
          {label:meses[dash.mesActual]||'Act',data:[met.efectivo||0,met.transferencia||0,met.tarjeta||0,met.otro||0],backgroundColor:'#e31e2444',borderColor:'#e31e24',borderWidth:2,borderRadius:6}
        ]
      },
      options:{plugins:{legend:{labels:{color:'#ccc',font:{size:11}}}},scales:{x:{ticks:{color:'#888'}},y:{ticks:{color:'#888',callback:function(v){return v.toLocaleString();}}}}}
    });
  }
  if(id==='dp-proy'){
    const ctx=document.getElementById('chart-proyeccion');
    if(!ctx)return;
    if(window._chartInstances['proy'])window._chartInstances['proy'].destroy();
    const clientes=dash.proyeccionClientes||[];
    window._chartInstances['proy']=new Chart(ctx,{
      type:'bar',
      data:{
        labels:clientes.map(c=>c.nombre.split(' ')[0]),
        datasets:[{label:'Precio plan',data:clientes.map(c=>c.precio),backgroundColor:'#4caf5044',borderColor:'#4caf50',borderWidth:2,borderRadius:6}]
      },
      options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#888',callback:function(v){return v>=1000000?(v/1000000).toFixed(1)+'M':v>=1000?(v/1000).toFixed(0)+'k':v;}}},y:{ticks:{color:'#ccc',font:{size:11}},grid:{lineWidth:0}}}}
    });
  }
}

function renderAdminDashboard(){
  const data=window._adminData||{clientes:{}};
  const usuarios=window._adminUsuarios||[];
  const hoy=new Date();
  const mesActual=hoy.getMonth();
  const anioActual=hoy.getFullYear();
  const mesAnterior=mesActual===0?11:mesActual-1;
  const anioAnterior=mesActual===0?anioActual-1:anioActual;
  const meses=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  let totalMes=0,totalMesAnt=0,totalPagos=0,totalDesc=0;
  const monedas={};
  const metodos={efectivo:0,transferencia:0,tarjeta:0,otro:0};
  const metodosMesAnt={efectivo:0,transferencia:0,tarjeta:0,otro:0};
  const pagosMes=[],pagosMesAnt=[],proyeccionClientes=[];
  usuarios.forEach(u=>{
    const d=data.clientes[u.id]||data.clientes[(u.id||'').replace('cli_','')]||{};
    const precio=d.precio||0;
    const moneda=d.moneda||'COP';
    if(!monedas[moneda])monedas[moneda]=0;
    if(u.activo){
      monedas[moneda]+=precio;
      totalMes+=precio;
      proyeccionClientes.push({nombre:u.nombre,precio,moneda});
    }
    (d.pagos||[]).forEach(p=>{
      const fp=new Date(p.fecha);
      if(fp.getMonth()===mesActual&&fp.getFullYear()===anioActual){
        totalPagos+=p.monto||0;
        const m=p.metodo||'efectivo';
        if(metodos[m]!==undefined)metodos[m]+=p.monto||0; else metodos.otro+=p.monto||0;
        if(p.descuento_valor)totalDesc+=p.descuento_tipo==='pct'?Math.round((d.precio||0)*p.descuento_valor/100):p.descuento_valor;
        pagosMes.push({nombre:u.nombre,monto:p.monto,moneda:p.moneda||moneda,metodo:p.metodo||'efectivo',fecha:p.fecha,novedad:p.novedad||''});
      }
      if(fp.getMonth()===mesAnterior&&fp.getFullYear()===anioAnterior){
        totalMesAnt+=p.monto||0;
        const m=p.metodo||'efectivo';
        if(metodosMesAnt[m]!==undefined)metodosMesAnt[m]+=p.monto||0; else metodosMesAnt.otro+=p.monto||0;
        pagosMesAnt.push({nombre:u.nombre,monto:p.monto,moneda:p.moneda||moneda,metodo:p.metodo||'efectivo',fecha:p.fecha});
      }
    });
  });
  window._dash={totalMes,totalMesAnt,totalPagos,totalDesc,monedas,metodos,metodosMesAnt,pagosMes,pagosMesAnt,proyeccionClientes,meses,mesActual,mesAnterior,anioActual,anioAnterior};
  window._chartInstances={};
  let html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">';
  html+='<div onclick="toggleDashPanel(\'dp-proy\')" style="background:rgba(76,175,80,0.10);border:1px solid rgba(76,175,80,0.25);border-radius:14px;padding:14px;cursor:pointer;overflow:hidden;min-width:0">';
  html+='<div style="font-size:10px;color:#4caf50;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Proyección mes</div>';
  html+='<div style="font-size:20px;font-weight:800;color:#4caf50">'+totalMes.toLocaleString()+'</div>';
  html+='<div style="font-size:10px;color:var(--texto-tenue);margin-top:2px">'+meses[mesActual]+' '+anioActual+' · toca ▾</div>';
  html+='<div id="dp-proy" style="display:none;margin-top:10px;border-top:1px solid #1e3a1e;padding-top:10px">';
  proyeccionClientes.forEach(cl=>{
    html+='<div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid #1e3a1e"><span style="color:var(--texto-medio)">'+cl.nombre+'</span><span style="color:#4caf50;font-weight:700;white-space:nowrap;margin-left:8px">'+cl.precio.toLocaleString()+' '+cl.moneda+'</span></div>';
  });
  if(totalDesc>0)html+='<div style="margin-top:6px;font-size:11px;color:#f0c040">🏷️ Inversión en retención: '+totalDesc.toLocaleString()+'</div>';
  html+='<div style="overflow-y:scroll;max-height:280px;margin-top:12px"><canvas id="chart-proyeccion" style="width:100%;height:'+(proyeccionClientes.length*36+30)+'px"></canvas></div>';
  html+='</div></div>';
  html+='<div onclick="toggleDashPanel(\'dp-cob\')" style="background:var(--card);border:1px solid rgba(227,30,36,0.25);border-radius:14px;padding:14px;cursor:pointer;overflow:hidden;min-width:0;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)">';
  html+='<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Cobrado este mes</div>';
  html+='<div style="font-size:20px;font-weight:800;color:#e31e24">'+totalPagos.toLocaleString()+'</div>';
  html+='<div style="font-size:10px;color:var(--texto-tenue);margin-top:2px">Toca para ver ▾</div>';
  html+='<div id="dp-cob" style="display:none">'+_adminPanelMetodos(metodos,pagosMes,"#e31e24")+'<canvas id="chart-metodos" style="margin-top:12px;max-height:180px"></canvas></div>';
  html+='</div>';
  html+='<div onclick="abrirComparativoModal()" style="background:#1a0000;border:1px solid #10203a;border-radius:14px;padding:14px;cursor:pointer;overflow:hidden;min-width:0">';
  html+='<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Mes anterior</div>';
  html+='<div style="font-size:20px;font-weight:800;color:#e31e24">'+totalMesAnt.toLocaleString()+'</div>';
  html+='<div style="font-size:10px;color:var(--texto-tenue);margin-top:2px">'+meses[mesAnterior]+' '+(mesActual===0?anioAnterior:anioActual)+' · toca ▾</div>';
  html+='<div id="dp-ant" style="display:none">'+_adminPanelMetodos(metodosMesAnt,pagosMesAnt,"#4a9eff")+'<canvas id="chart-comparativo" style="margin-top:12px;max-height:180px"></canvas></div>';
  html+='</div>';
  html+='<div style="background:var(--card);border:1px solid #2a2a2a;border-radius:14px;padding:14px">';
  html+='<div style="font-size:10px;color:var(--texto-medio);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Clientes activos</div>';
  const nActivos=usuarios.filter(u=>u.activo).length;
  const nTotal=usuarios.length;
  html+='<div style="font-size:20px;font-weight:800;color:var(--texto)">'+nActivos+'<span style="font-size:13px;color:var(--texto-secundario);font-weight:400">/'+nTotal+'</span></div>';
  html+='<div style="font-size:10px;color:var(--texto-tenue);margin-top:2px">Activos / Total registrados</div></div>';
  html+='</div>';

  // ═══ CHIP POTENCIAL ═══
  const pausados=(window._adminUsuarios||[]).filter(u=>!u.activo);
  const vencidos2=(window._adminUsuarios||[]).filter(u=>u.activo&&u.estado_pago==='vencido');
  let potencial=0;
  [...pausados,...vencidos2].forEach(u=>{
    const d=(window._adminData||{clientes:{}}).clientes[u.id]||{};
    potencial+=d.precio||0;
  });
  if(potencial>0){
    html+='<div style="background:var(--card);border:1px solid rgba(240,192,64,0.25);border-radius:14px;padding:14px;margin-top:10px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)">';
    html+='<div style="font-size:10px;color:#f0c040;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">💛 Potencial recuperable</div>';
    html+='<div style="font-size:20px;font-weight:800;color:#f0c040">'+potencial.toLocaleString()+'</div>';
    html+='<div style="font-size:10px;color:var(--texto-secundario);margin-top:2px">'+pausados.length+' pausados · '+vencidos2.length+' vencidos</div>';
    html+='</div>';
  }

  // ═══ RECOMENDACIONES ═══
  const recomendaciones=generarRecomendaciones(window._adminUsuarios||[],window._adminData||{},window._dash||{});
  if(recomendaciones.length){
    html+='<div style="margin-top:16px">';
    html+='<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1.5px;font-weight:800;margin-bottom:10px">🎯 Recomendaciones</div>';
    recomendaciones.forEach(r=>{
      html+='<div style="background:var(--card);border-left:3px solid '+r.color+';border-radius:0 12px 12px 0;padding:12px 14px;margin-bottom:8px">';
      html+='<div style="font-size:13px;color:var(--texto);font-weight:600;margin-bottom:4px">'+r.icono+' '+r.titulo+'</div>';
      html+='<div style="font-size:11px;color:var(--texto-medio);margin-bottom:8px">'+r.detalle+'</div>';
      if(r.mensaje){
        html+='<div style="background:var(--fondo);border-radius:8px;padding:8px;font-size:11px;color:var(--texto-medio);margin-bottom:8px;font-style:italic">'+r.mensaje+'</div>';
      }
      if(r.btnWA){
        html+='<button onclick="copiarMensaje(\''+r.btnWA.replace(/'/g,"\\'")+'\');" style="background:#1a3a1a;border:none;border-radius:8px;color:#4caf50;font-size:11px;font-weight:700;padding:7px 12px;cursor:pointer;margin-right:6px">📋 Copiar</button>';
      }
      html+='</div>';
    });
    html+='</div>';
  }

  // Panel promos al final
  html+='<div id="promo-panel" style="display:none;background:var(--gris);border-radius:14px;padding:14px;margin-top:12px">';
  html+='<div style="font-size:12px;color:#e91e63;font-weight:700;margin-bottom:8px">🎁 Promociones personalizadas</div>';
  html+='<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:10px">El motor las sugerirá según la condición. Tú decides si envías.</div>';
  const promosCustom=JSON.parse(localStorage.getItem('dt_promos_custom')||'[]');
  promosCustom.forEach((p,i)=>{
    html+='<div style="background:var(--card);border-radius:10px;padding:10px;margin-bottom:6px;border-left:3px solid #e91e63">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center">';
    html+='<span style="font-size:12px;color:var(--texto);font-weight:600">'+p.nombre+'</span>';
    html+='<div style="display:flex;gap:6px;align-items:center">';
    html+='<label class="switch"><input type="checkbox" '+(p.activa?'checked':'')+' onchange="togglePromoCustom('+i+',this.checked)"><span class="slider"></span></label>';
    html+='<button onclick="borrarPromoCustom('+i+')" style="background:#2a0a0a;border:1px solid #5a1a1a;border-radius:6px;color:#e31e24;font-size:11px;padding:3px 7px;cursor:pointer">🗑️</button>';
    html+='</div></div>';
    html+='<div style="font-size:10px;color:var(--texto-medio);margin-top:4px">'+(p.condicion==='nuevo'?'🆕 Nuevos':p.condicion==='pausado'?'⏸️ Pausados':p.condicion==='activo'?'✅ Activos':'👥 Todos')+' · '+p.descuento+'% off</div>';
  });
  html+='<div style="border-top:1px solid #2a2a2a;margin:10px 0"></div>';
  html+='<div style="font-size:11px;color:#e91e63;font-weight:700;margin-bottom:8px">➕ Nueva promoción</div>';
  html+='<input type="text" id="np-nombre" placeholder="Nombre (ej: Promo familia)" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:6px">';
  html+='<select id="np-condicion" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;margin-bottom:6px">';
  html+='<option value="nuevo">🆕 Nuevos clientes (< 30 días)</option>';
  html+='<option value="pausado">⏸️ Pausados</option>';
  html+='<option value="activo">✅ Activos</option>';
  html+='<option value="todos">👥 Todos</option>';
  html+='</select>';
  html+='<input type="number" id="np-descuento" placeholder="% descuento (ej: 20)" min="0" max="100" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:6px">';
  html+='<textarea id="np-mensaje" placeholder="Mensaje — usa {nombre} {precio} {descuento} {precio_con_descuento}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;min-height:70px;box-sizing:border-box;margin-bottom:6px"></textarea>';
  html+='<div style="font-size:10px;color:var(--texto-secundario);margin-bottom:8px">Variables: {nombre} {precio} {descuento} {precio_con_descuento}</div>';
  html+='<button onclick="guardarPromoCustom()" style="width:100%;background:#1a0a1a;border:1px solid #4a1a4a;border-radius:8px;color:#e91e63;font-size:12px;font-weight:700;padding:9px;cursor:pointer">💾 Guardar promoción</button>';
  html+='</div>';

  return html;
}
function renderAdminClientes(){
  const usuarios=window._adminUsuarios||[];
  const data=window._adminData||{clientes:{}};
  let html='<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:80px">';
  usuarios.forEach(u=>{
    const d=data.clientes[u.id]||data.clientes[(u.id+'').replace('cli_','')]||{precio:0,moneda:'COP',pagos:[]};
    const ultimoPago=d.pagos&&d.pagos.length?d.pagos[d.pagos.length-1].fecha:'Sin pagos';
    html+='<div class="admin-cliente-row" data-uid='+JSON.stringify(u.id)+' style="background:var(--card);border:1px solid #1e1e1e;border-radius:14px;padding:14px;cursor:pointer">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center">';
    html+='<div><div style="font-size:14px;font-weight:700;color:var(--texto)">'+u.nombre+'</div>';
    html+='<div style="font-size:11px;color:var(--texto-secundario);margin-top:2px">Último pago: '+ultimoPago+'</div></div>';
    html+='<div style="text-align:right"><div style="font-size:16px;font-weight:800;color:#4caf50">'+(d.precio||0).toLocaleString()+'</div>';
    html+='<div style="font-size:10px;color:var(--texto-secundario)">'+(d.moneda||'COP')+'</div></div></div></div>';
  });
  html+='</div>';
  setTimeout(()=>{
    document.querySelectorAll('.admin-cliente-row').forEach(el=>{
      el.onclick=()=>abrirAdminCliente(el.dataset.uid);
      el.style.cursor='pointer';
    });
  },50);
  return html;
}

function renderAdminConfig(){
  const cfg=(window._adminData||{}).config||{};
  const tab=window._configTab||'general';
  let html='<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:80px">';
  html+='<div style="display:flex;gap:6px;margin-bottom:4px">';
  [{id:'general',icon:'⚙️',lbl:'General'},{id:'vinculacion',icon:'🔗',lbl:'Vinculación'},{id:'whatsapp',icon:'💬',lbl:'WhatsApp'},{id:'premium',icon:'🔑',lbl:'Premium'}].forEach(t=>{
    const a=t.id===tab;
    html+='<button onclick="window._configTab=\''+t.id+'\';document.getElementById(\'admin-tab-content\').innerHTML=renderAdminConfig();if(\''+t.id+'\'===\'whatsapp\')cargarEstadoWA();else cargarCodigoVinc();" style="flex:1;padding:8px 2px;border-radius:10px;border:'+(a?'2px solid #e31e24':'1px solid #333')+';background:'+(a?'#1a0000':'#111')+';color:'+(a?'#e31e24':'#888')+';font-size:10px;font-weight:700;cursor:pointer">'+t.icon+'<br>'+t.lbl+'</button>';
  });
  html+='</div>';

  if(tab==='general'){
    html+='<div style="background:var(--gris);border-radius:14px;padding:16px">';
    html+='<div style="font-size:13px;color:var(--texto);font-weight:600;margin-bottom:10px">Moneda por defecto</div>';
    html+='<select id="admin-moneda-default" style="width:100%;background:var(--card);border:1px solid #333;border-radius:10px;padding:10px;color:var(--texto);font-size:13px">';
    MONEDAS.forEach(m=>{html+='<option value="'+m+'"'+(cfg.moneda_default===m?' selected':'')+'>'+m+'</option>';});
    html+='</select></div>';
    html+='<div style="background:var(--gris);border-radius:14px;padding:16px">';
    html+='<div style="font-size:13px;color:var(--texto);font-weight:600;margin-bottom:10px">Mensaje recordatorio por defecto</div>';
    html+='<textarea id="admin-msg-default" style="width:100%;background:var(--card);border:1px solid #333;border-radius:10px;padding:10px;color:var(--texto);font-size:12px;min-height:80px;box-sizing:border-box">'+(cfg.msg_default||'')+'</textarea></div>';
    html+='<div style="background:var(--gris);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:center">';
    html+='<div><div style="font-size:13px;color:var(--texto);font-weight:600">Mensaje prellenado en WhatsApp</div>';
    html+='<div style="font-size:11px;color:var(--texto-secundario);margin-top:2px">Abrir chat con mensaje o vacío</div></div>';
    html+='<label class="switch"><input type="checkbox" id="admin-prellenado"'+(cfg.msg_prellenado?' checked':'')+' onchange="guardarAdminConfig()"><span class="slider"></span></label></div>';
    html+='<button onclick="guardarAdminConfig()" style="width:100%;background:var(--rojo);border:none;border-radius:12px;color:var(--texto);font-size:14px;font-weight:700;padding:12px;cursor:pointer">💾 Guardar</button>';

  // Botón notificaciones push
  html+='<div style="background:var(--gris);border-radius:14px;padding:16px">';
  html+='<div style="font-size:13px;color:var(--texto);font-weight:600;margin-bottom:10px">🔔 Notificaciones push</div>';
  html+='<div id="push-estado-card" style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:14px;display:flex;justify-content:space-between;align-items:center">';
  html+='<div><div id="push-estado-txt" style="font-size:13px;color:var(--texto);font-weight:600">Verificando...</div>';
  html+='<div id="push-estado-sub" style="font-size:11px;color:var(--texto-secundario);margin-top:3px"></div></div>';
  html+='<button id="push-estado-btn" onclick="gestionarPushAdmin()" style="background:#333;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:8px 14px;cursor:pointer;display:none">...</button>';
  html+='</div></div>';
  setTimeout(()=>actualizarEstadoPushUI(), 100);
  }

  if(tab==='vinculacion'){
    const cod=cfg.codigo_vinculacion||'';
    html+='<div style="background:var(--gris);border-radius:14px;padding:16px">';
    html+='<div style="font-size:13px;color:var(--texto);font-weight:700;margin-bottom:6px">Código de vinculación</div>';
    html+='<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:12px">Comparte este código con tus clientes.</div>';
    html+='<div style="display:flex;align-items:center;gap:8px;background:var(--card);border:2px solid #e31e24;border-radius:12px;padding:10px 14px">';
    html+='<div id="admin-codigo-vinc-txt" style="flex:1;font-size:18px;font-weight:900;color:#e31e24;letter-spacing:4px;font-family:monospace;white-space:nowrap">'+(cod||'——')+'</div>';
    html+='<button onclick="copiarCodigoVinc()" style="background:#e31e24;border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer">📋 Copiar</button>';
    html+='</div></div>';
    html+='<div style="margin-top:10px"><div style="font-size:13px;color:var(--texto);font-weight:700;margin-bottom:10px">🎁 Promociones personalizadas</div>';
    html+='<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:12px">El motor las sugerirá según condición. Tú decides si envías.</div>';
    const promosCustom=JSON.parse(localStorage.getItem('dt_promos_custom')||'[]');
    promosCustom.forEach((p,i)=>{
      html+='<div style="background:var(--gris);border-radius:12px;padding:12px;margin-bottom:8px;border-left:3px solid #e91e63">';
      html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
      html+='<span style="font-size:13px;color:var(--texto);font-weight:600">'+p.nombre+'</span>';
      html+='<div style="display:flex;gap:8px;align-items:center">';
      html+='<label class="switch"><input type="checkbox" '+(p.activa?'checked':'')+' onchange="togglePromoCustom('+i+',this.checked)"><span class="slider"></span></label>';
      html+='<button onclick="borrarPromoCustom('+i+')" style="background:#2a0a0a;border:1px solid #5a1a1a;border-radius:8px;color:#e31e24;font-size:11px;padding:4px 8px;cursor:pointer">🗑️</button>';
      html+='</div></div>';
      html+='<div style="font-size:11px;color:var(--texto-medio)">'+(p.condicion==='nuevo'?'🆕 Nuevos':p.condicion==='pausado'?'⏸️ Pausados':p.condicion==='activo'?'✅ Activos':'👥 Todos')+' · '+p.descuento+'% off</div>';
      html+='<div style="font-size:11px;color:var(--texto-secundario);margin-top:4px;font-style:italic">'+p.mensaje.substring(0,60)+(p.mensaje.length>60?'...':'')+'</div>';
      html+='</div>';
    });
    html+='<div style="background:var(--gris);border-radius:14px;padding:14px;margin-top:10px">';
    html+='<div style="font-size:12px;color:#e91e63;font-weight:700;margin-bottom:10px">➕ Nueva promoción</div>';
    html+='<input type="text" id="np-nombre" placeholder="Nombre (ej: Promo julio)" style="width:100%;background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:8px">';
    html+='<select id="np-condicion" style="width:100%;background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;color:var(--texto);font-size:13px;margin-bottom:8px">';
    html+='<option value="nuevo">🆕 Nuevos clientes</option>';
    html+='<option value="pausado">⏸️ Pausados</option>';
    html+='<option value="activo">✅ Activos</option>';
    html+='<option value="todos">👥 Todos</option>';
    html+='</select>';
    html+='<div style="display:flex;gap:8px;margin-bottom:8px">';
    html+='<input type="number" id="np-descuento" placeholder="% descuento" min="0" max="100" style="flex:1;background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;color:var(--texto);font-size:13px;outline:none">';
    html+='<div style="display:flex;align-items:center;background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;font-size:11px;color:var(--texto-secundario)">% off</div>';
    html+='</div>';
    html+='<textarea id="np-mensaje" placeholder="Mensaje — usa {nombre}, {precio}, {descuento}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:10px;padding:10px;color:var(--texto);font-size:12px;min-height:80px;box-sizing:border-box;margin-bottom:8px"></textarea>';
    html+='<button onclick="guardarPromoCustom()" style="width:100%;background:#1a0a1a;border:1px solid #4a1a4a;border-radius:10px;color:#e91e63;font-size:13px;font-weight:700;padding:10px;cursor:pointer">💾 Guardar promoción</button>';
    html+='</div></div>';
  }

  if(tab==='whatsapp'){
    html+='<div style="background:var(--gris);border-radius:14px;padding:16px">';
    html+='<div style="font-size:13px;color:var(--texto);font-weight:700;margin-bottom:12px">💬 Conexión WhatsApp</div>';
    html+='<div id="wa-estado-box" style="background:var(--card);border-radius:12px;padding:16px;text-align:center;margin-bottom:12px">';
    html+='<div id="wa-estado-txt" style="font-size:15px;font-weight:700;color:#888">Verificando...</div>';
    html+='</div>';
    html+='<div id="wa-codigo-box" style="display:none;background:#0a0a0a;border:2px solid #e31e24;border-radius:12px;padding:16px;text-align:center;margin-bottom:12px">';
    html+='<div style="font-size:11px;color:var(--texto-medio);margin-bottom:8px">Ingresa este código en WhatsApp → Dispositivos vinculados → Vincular con número</div>';
    html+='<div style="font-size:10px;color:#ff9800;margin-top:6px">⏳ Ingresa el código rápido (antes de 30 seg). Si WhatsApp muestra un error al inicio, espera unos segundos: normalmente conecta igual.</div>';
    html+='<div id="wa-codigo-txt" style="font-size:32px;font-weight:900;color:#e31e24;letter-spacing:6px;font-family:monospace">——————</div>';
    html+='</div></div>';
  }

  if(tab==='premium'){
    const esPremium = esEntrenadorPremium();
    const hasta = (window._entConfig && window._entConfig.premium_entrenador_hasta) ? window._entConfig.premium_entrenador_hasta : '';
    html+='<div style="background:var(--gris);border-radius:14px;padding:16px">';
    html+='<div style="font-size:13px;color:var(--texto);font-weight:700;margin-bottom:8px">🔑 Plan Premium Entrenador</div>';
    if(esPremium){
      html+='<div style="color:#4caf50;font-weight:700;margin-bottom:8px">✅ Premium activo</div>';
      if(hasta) html+='<div style="font-size:11px;color:var(--texto-medio)">Activo hasta: '+hasta+'</div>';
    } else {
      html+='<div style="font-size:12px;color:var(--texto-secundario);margin-bottom:12px">Acceso completo a todas las funciones profesionales por $39.999/mes</div>';
      html+='<button onclick="entPagarPremium()" style="width:100%;background:#e31e24;border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;padding:11px;cursor:pointer;margin-bottom:12px;box-sizing:border-box">💳 Pagar Premium $39.999/mes</button>';
      html+='<div style="font-size:11px;color:var(--texto-medio);margin-bottom:8px;text-align:center">¿Ya tienes un código? Ingrésalo aquí</div>';
      html+='<div style="display:flex;gap:8px;align-items:center">';
      html+='<input id="cfg-codigo-premium" type="text" placeholder="INGRESA TU CÓDIGO..." style="flex:1;background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;letter-spacing:2px;text-transform:uppercase">';
      html+='<button onclick="validarCodigoPremium()" style="background:#333;border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;padding:10px 16px;cursor:pointer">Activar</button>';
      html+='</div>';
      html+='<div id="cfg-codigo-status" style="font-size:11px;margin-top:8px;text-align:center"></div>';
    }
    html+='</div>';
  }

  html+='</div>';
  html+='<div style="margin-top:16px;padding:14px;background:#0a1a2a;border:1px solid #2196f3;border-radius:12px">';
  html+='<div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px">💡 Sugerencias para DT-APP</div>';
  html+='<button onclick="entSugerencias()" style="width:100%;background:#0a1a2a;border:1px solid #2196f3;border-radius:8px;color:#2196f3;font-size:13px;font-weight:700;cursor:pointer;padding:10px;box-sizing:border-box">💡 Enviar sugerencia</button>';
  html+='</div>';
  return html;
}

function entSugerencias(){
  var msg = 'Hola, tengo una sugerencia para DT-APP 💡: ';
  var wa = 'https://wa.me/573006197897?text=' + encodeURIComponent(msg);
  window.open(wa, '_blank');
}

function togglePromoPanel(){
  // Quitar modal anterior si existe
  const existing=document.getElementById('modal-promos');
  if(existing){existing.remove();return;}

  const promosCustom=JSON.parse(localStorage.getItem('dt_promos_custom')||'[]');
  let inner='<div style="font-size:13px;color:#e91e63;font-weight:700;margin-bottom:8px">🎁 Promociones personalizadas</div>';
  inner+='<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:10px">El motor las sugerirá según condición. Tú decides si envías.</div>';
  promosCustom.forEach((p,i)=>{
    inner+='<div style="background:var(--fondo);border-radius:10px;padding:10px;margin-bottom:6px;border-left:3px solid #e91e63">';
    inner+='<div style="display:flex;justify-content:space-between;align-items:center">';
    inner+='<span style="font-size:12px;color:var(--texto);font-weight:600">'+p.nombre+'</span>';
    inner+='<div style="display:flex;gap:6px;align-items:center">';
    inner+='<label class="switch"><input type="checkbox" '+(p.activa?'checked':'')+' onchange="togglePromoCustom('+i+',this.checked)"><span class="slider"></span></label>';
    inner+='<button onclick="borrarPromoCustom('+i+')" style="background:#2a0a0a;border:1px solid #5a1a1a;border-radius:6px;color:#e31e24;font-size:11px;padding:3px 7px;cursor:pointer">🗑️</button>';
    inner+='</div></div>';
    inner+='<div style="font-size:10px;color:var(--texto-medio);margin-top:4px">'+(p.condicion==='nuevo'?'🆕 Nuevos':p.condicion==='pausado'?'⏸️ Pausados':p.condicion==='activo'?'✅ Activos':'👥 Todos')+' · '+p.descuento+'% off</div>';
    inner+='</div>';
  });
  inner+='<div style="border-top:1px solid #2a2a2a;margin:12px 0"></div>';
  inner+='<div style="font-size:11px;color:#e91e63;font-weight:700;margin-bottom:8px">➕ Nueva promoción</div>';
  inner+='<input type="text" id="np-nombre" placeholder="Nombre (ej: Promo familia)" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:6px">';
  inner+='<select id="np-condicion" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;margin-bottom:6px">';
  inner+='<option value="nuevo">🆕 Nuevos clientes (< 30 días)</option>';
  inner+='<option value="pausado">⏸️ Pausados</option>';
  inner+='<option value="activo">✅ Activos</option>';
  inner+='<option value="todos">👥 Todos</option>';
  inner+='</select>';
  inner+='<input type="number" id="np-descuento" placeholder="% descuento (ej: 20)" min="0" max="100" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:6px">';
  inner+='<textarea id="np-mensaje" placeholder="Mensaje — usa {nombre} {precio} {descuento} {precio_con_descuento}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:8px;color:var(--texto);font-size:12px;min-height:70px;box-sizing:border-box;margin-bottom:6px"></textarea>';
  inner+='<div style="font-size:10px;color:var(--texto-secundario);margin-bottom:8px">Variables: {nombre} {precio} {descuento} {precio_con_descuento}</div>';
  inner+='<button onclick="guardarPromoCustom()" style="width:100%;background:#1a0a1a;border:1px solid #4a1a4a;border-radius:8px;color:#e91e63;font-size:12px;font-weight:700;padding:9px;cursor:pointer">💾 Guardar promoción</button>';

  const modal=document.createElement('div');
  modal.id='modal-promos';
  modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#000a;z-index:9999;display:flex;align-items:flex-end';
  modal.innerHTML='<div style="background:var(--gris);border-radius:20px 20px 0 0;padding:20px;width:100%;max-height:85vh;overflow-y:auto;box-sizing:border-box">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'+
    '<span style="font-size:14px;color:var(--texto);font-weight:700">🎁 Promociones</span>'+
    '<button onclick="togglePromoPanel()" style="background:var(--gris2);border:none;border-radius:8px;color:var(--texto-medio);font-size:13px;padding:5px 10px;cursor:pointer">✕ Cerrar</button>'+
    '</div>'+inner+'</div>';
  document.body.appendChild(modal);
}

function guardarPromoCustom(){
  const nombre=document.getElementById('np-nombre').value.trim();
  const condicion=document.getElementById('np-condicion').value;
  const descuento=parseInt(document.getElementById('np-descuento').value)||0;
  const mensaje=document.getElementById('np-mensaje').value.trim();
  if(!nombre||!mensaje){toast('⚠️ Completa nombre y mensaje');return;}
  const promos=JSON.parse(localStorage.getItem('dt_promos_custom')||'[]');
  promos.push({nombre,condicion,descuento,mensaje,activa:true,fecha:new Date().toISOString().split('T')[0]});
  localStorage.setItem('dt_promos_custom',JSON.stringify(promos));
  toast('✅ Promoción guardada');
  showAdminTab('config');
}

function togglePromoCustom(i,activa){
  const promos=JSON.parse(localStorage.getItem('dt_promos_custom')||'[]');
  if(promos[i])promos[i].activa=activa;
  localStorage.setItem('dt_promos_custom',JSON.stringify(promos));
  toast(activa?'✅ Promoción activada':'⏸️ Promoción pausada');
}

function borrarPromoCustom(i){
  const promos=JSON.parse(localStorage.getItem('dt_promos_custom')||'[]');
  promos.splice(i,1);
  localStorage.setItem('dt_promos_custom',JSON.stringify(promos));
  toast('🗑️ Promoción eliminada');
  showAdminTab('config');
}

function toggleLockCodigo() {
  const bloqueado = localStorage.getItem('vinc-bloqueado') === '1';
  localStorage.setItem('vinc-bloqueado', bloqueado ? '0' : '1');
  const btn = document.getElementById('btn-lock-vinc');
  const btnGen = document.getElementById('btn-generar-vinc');
  if (btn) btn.textContent = bloqueado ? '🔓' : '🔒';
  if (btnGen) { btnGen.disabled = !bloqueado; btnGen.style.opacity = bloqueado ? '1' : '0.4'; }
  toast(bloqueado ? '🔓 Código desbloqueado' : '🔒 Código bloqueado');
}

async function generarCodigoVinc() {
  if (localStorage.getItem('vinc-bloqueado') === '1') { toast('🔒 Desbloquea primero el código'); return; }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let sufijo = '';
  for (let i = 0; i < 6; i++) sufijo += chars[Math.floor(Math.random() * chars.length)];
  const codigo = 'DT-' + sufijo;
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({codigo_vinculacion: codigo})
  });
  if (res.ok) {
    if (!window._adminData) window._adminData = {};
    if (!window._adminData.config) window._adminData.config = {};
    window._adminData.config.codigo_vinculacion = codigo;
    const el = document.getElementById('vinc-codigo-txt');
    if (el) el.textContent = codigo;
    toast('✅ Código generado: ' + codigo);
  }
}

function copiarCodigoVinc() {
  const el = document.getElementById('vinc-codigo-txt');
  if (!el || el.textContent === '——————') { toast('Primero genera un código'); return; }
  navigator.clipboard.writeText(el.textContent).then(() => toast('📋 Código copiado'));
}

// Cargar código guardado al abrir config
let _waQRInstance = null;
let _waQRTexto = null;

async function cargarEstadoWA() {
  const entId = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001');
  try {
    const res = await fetch('/api/wa/estado?entrenador_id=' + entId);
    const data = await res.json();
    const txt = document.getElementById('wa-estado-txt');
    const box = document.getElementById('wa-codigo-box');
    const cod = document.getElementById('wa-codigo-txt');
    const btnCon = document.getElementById('wa-btn-conectar');
    const btnQR = document.getElementById('wa-btn-qr');
    const btnDesc = document.getElementById('wa-btn-desconectar');
    const numTxt = document.getElementById('wa-numero-txt');
    const qrBox = document.getElementById('wa-qr-box');
    const qrCanvas = document.getElementById('wa-qr-canvas');
    if (numTxt) numTxt.textContent = (data.conectado && data.telefono) ? ('Número registrado: ' + data.telefono) : 'Sin número registrado';
    if (!txt) return;
    const btnReconectar = document.getElementById('wa-btn-reconectar');
    if (data.conectado) {
      txt.textContent = '✅ WhatsApp conectado';
      txt.style.color = '#4caf50';
      if (box) box.style.display = 'none';
      if (btnCon) btnCon.style.display = 'none';
      if (btnQR) btnQR.style.display = 'none';
      if (btnReconectar) btnReconectar.style.display = 'none';
      if (qrBox) qrBox.style.display = 'none';
      if (btnDesc) btnDesc.style.display = 'block';
      _waQRTexto = null;
    } else {
      txt.textContent = '🔴 No conectado';
      txt.style.color = '#e31e24';
      if (data.pairingCode && box && cod) {
        box.style.display = 'block';
        cod.textContent = data.pairingCode;
        if (btnCon) btnCon.style.display = 'none';
        if (btnQR) btnQR.style.display = 'none';
        if (btnReconectar) btnReconectar.style.display = 'none';
        if (qrBox) qrBox.style.display = 'none';
        if (btnDesc) btnDesc.style.display = 'block';
        _waQRTexto = null;
      } else if (data.qrCode && qrBox && qrCanvas) {
        if (box) box.style.display = 'none';
        if (btnCon) btnCon.style.display = 'block';
        if (btnQR) btnQR.style.display = 'none';
        if (btnReconectar) btnReconectar.style.display = 'none';
        qrBox.style.display = 'block';
        if (btnDesc) btnDesc.style.display = 'block';
        if (data.qrCode !== _waQRTexto && window.QRCode) {
          qrCanvas.innerHTML = '';
          _waQRInstance = new QRCode(qrCanvas, { text: data.qrCode, width: 200, height: 200 });
          _waQRTexto = data.qrCode;
        }
      } else {
        if (box) box.style.display = 'none';
        if (qrBox) qrBox.style.display = 'none';
        if (btnDesc) btnDesc.style.display = 'none';
        _waQRTexto = null;
        if (data.tieneCredenciales) {
          if (btnCon) btnCon.style.display = 'none';
          if (btnQR) btnQR.style.display = 'none';
          if (btnReconectar) btnReconectar.style.display = 'block';
        } else {
          if (btnCon) btnCon.style.display = 'block';
          if (btnQR) btnQR.style.display = 'block';
          if (btnReconectar) btnReconectar.style.display = 'none';
        }
      }
    }
  } catch(e) {
    const txt = document.getElementById('wa-estado-txt');
    if (txt) { txt.textContent = '⚠️ Error al verificar'; txt.style.color = '#ff9800'; }
  }
}

async function corregirNumeroWA() {
  const sesion = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  const entId = sesion.id || 'ent_001';
  const tel = prompt('Ingresa el número correcto de WhatsApp con código de país (ej: 573012345678):');
  if (!tel) return;
  const res = await fetch('/api/wa/corregir-numero', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ entrenador_id: entId, telefono: tel })
  });
  const data = await res.json();
  toast(data.ok ? '✅ Número corregido: ' + tel : (data.error || 'Error al corregir'));
  await cargarEstadoWA();
}

async function conectarMiWhatsApp() {
  const sesion = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  const entId = sesion.id || 'ent_001';
  alert('PASOS PARA CONECTAR:\n\n1. Abre WhatsApp y entra a Dispositivos vinculados\n2. Toca en Anadir dispositivo\n3. Toca "Vincular con numero de telefono" (debajo del escaner)\n4. Vuelve aqui y presiona OK, luego escribe tu numero con 57 adelante\n5. Te llegara una notificacion de WhatsApp de intento de vinculacion: aceptala\n6. Copia el codigo que aparece aqui y pegalo en WhatsApp\n\nPuede salir "vinculacion fallida" pero conecta en menos de 1 minuto. Espera sin cerrar.');
  const tel = prompt('Ingresa tu número de WhatsApp con código de país (ej: 573012345678):');
  if (!tel) return;
  const btn = document.getElementById('wa-btn-conectar');
  if (btn) { btn.textContent = '⏳ Conectando...'; btn.disabled = true; }
  const res = await fetch('/api/wa/conectar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ entrenador_id: entId, telefono: tel })
  });
  const data = await res.json();
  if (data.ok) {
    let _waPolling = setInterval(async () => { await cargarEstadoWA(); const s = waSessions && waSessions[entId]; if (document.getElementById("wa-estado-txt") && document.getElementById("wa-estado-txt").textContent.includes("✅")) clearInterval(_waPolling); }, 3000);
  } else {
    toast(data.error || 'Error al conectar');
    if (btn) { btn.textContent = '📲 Conectar WhatsApp'; btn.disabled = false; }
  }
}

async function reconectarMiWhatsApp() {
  const sesion = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  const entId = sesion.id || 'ent_001';
  const btn = document.getElementById('wa-btn-reconectar');
  if (btn) { btn.textContent = '⏳ Reconectando...'; btn.disabled = true; }
  const res = await fetch('/api/wa/conectar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ entrenador_id: entId })
  });
  const data = await res.json();
  if (data.ok) {
    let _waPolling = setInterval(async () => { await cargarEstadoWA(); if (document.getElementById("wa-estado-txt") && document.getElementById("wa-estado-txt").textContent.includes("✅")) clearInterval(_waPolling); }, 3000);
  } else {
    toast(data.error || 'Error al reconectar');
  }
  if (btn) { btn.textContent = '🔄 Reconectar'; btn.disabled = false; }
}

async function generarQRMiWhatsApp() {
  const sesion = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  const entId = sesion.id || 'ent_001';
  const btn = document.getElementById('wa-btn-qr');
  if (btn) { btn.textContent = '⏳ Generando...'; btn.disabled = true; }
  const res = await fetch('/api/wa/conectar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ entrenador_id: entId })
  });
  const data = await res.json();
  if (data.ok) {
    let _waPolling = setInterval(async () => { await cargarEstadoWA(); if (document.getElementById("wa-estado-txt") && document.getElementById("wa-estado-txt").textContent.includes("✅")) clearInterval(_waPolling); }, 3000);
  } else {
    toast(data.error || 'Error al generar QR');
  }
  if (btn) { btn.textContent = '📷 Generar código QR'; btn.disabled = false; }
}

async function desconectarMiWhatsApp() {
  const sesion = JSON.parse(localStorage.getItem('dt_sesion')||'{}');
  const entId = sesion.id || 'ent_001';
  if (!confirm('¿Seguro que quieres desconectar WhatsApp?')) return;
  const btn = document.getElementById('wa-btn-desconectar');
  if (btn) { btn.textContent = '⏳ Desconectando...'; btn.disabled = true; }
  const res = await fetch('/api/wa/desconectar', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ entrenador_id: entId })
  });
  const data = await res.json();
  toast(data.ok ? '✅ WhatsApp desconectado' : (data.error || 'Error al desconectar'));
  if (btn) { btn.textContent = '🛑 Desconectar'; btn.disabled = false; }
  await cargarEstadoWA();
}

function cargarCodigoVinc() {
  fetch('/api/config?entrenador_id='+(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json()).then(cfg=>{
    const el = document.getElementById('vinc-codigo-txt');
    if (el && cfg.codigo_vinculacion) el.textContent = cfg.codigo_vinculacion;
    const el2 = document.getElementById('admin-codigo-vinc-txt');
    if (el2 && cfg.codigo_vinculacion) el2.textContent = cfg.codigo_vinculacion;
  });
  const bloqueado = localStorage.getItem('vinc-bloqueado') === '1';
  const btn = document.getElementById('btn-lock-vinc');
  const btnGen = document.getElementById('btn-generar-vinc');
  if (btn) btn.textContent = bloqueado ? '🔒' : '🔓';
  if (btnGen) { btnGen.disabled = bloqueado; btnGen.style.opacity = bloqueado ? '0.4' : '1'; }
}

async function generarCodigoVinculacion() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) codigo += chars[Math.floor(Math.random() * chars.length)];
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({codigo_vinculacion: codigo})
  });
  if (res.ok) {
    if (!window._adminData) window._adminData = {};
    if (!window._adminData.config) window._adminData.config = {};
    window._adminData.config.codigo_vinculacion = codigo;
    showAdminTab('config');
    toast('✅ Código generado: ' + codigo);
  }
}

async function guardarAdminConfig(){
  const cfg={
    moneda_default:document.getElementById('admin-moneda-default').value,
    msg_default:document.getElementById('admin-msg-default').value.trim(),
    msg_prellenado:document.getElementById('admin-prellenado').checked,
    entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)
  };
  await fetch('/api/admin/config/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(cfg)});
  window._adminData.config=cfg;
  toast('✅ Configuración guardada');
}

async function abrirAdminCliente(id){
  const rawId=(id+'').replace('cli_','');
  const u=(window._adminUsuarios||[]).find(x=>String(x.id)===String(id));
  if(!u)return;
  const data=window._adminData||{clientes:{}};
  const d=data.clientes[id]||data.clientes[(id+'').replace('cli_','')]||{precio:0,moneda:'COP',pagos:[]};
  const cfg=data.config||{};
  const tipoPago=u.tipo_pago||'mensual';
  const diaPago=u.dia_pago||'';
  const diaPago2=u.dia_pago2||'';

  let html='<div style="padding:0 0 80px">';
  html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">';
  html+='<button onclick="showAdminTab(\'clientes\')" style="background:var(--gris);border:1px solid #2a2a2a;border-radius:10px;color:var(--texto-medio);font-size:14px;padding:7px 12px;cursor:pointer">‹ Volver</button>';
  html+='<span style="font-size:15px;font-weight:700;color:var(--texto)">'+u.nombre+'</span></div>';

  

  html+='<div style="background:var(--gris);border-radius:14px;padding:16px;margin-bottom:10px">';
  html+='<div style="font-size:12px;color:var(--texto-medio);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">💰 Precio del plan</div>';
  html+='<div style="display:flex;gap:8px">';
  html+='<input type="number" id="ac-precio" placeholder="ej: 200 = $200.000" value="'+(Math.round((d.precio||0)/1000))+'" style="flex:1;background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;color:var(--texto);font-size:14px;outline:none">';
  html+='<select id="ac-moneda" style="background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;color:var(--texto);font-size:13px">';
  MONEDAS.forEach(m=>{html+='<option value="'+m+'"'+(d.moneda===m?' selected':'')+'>'+m+'</option>';});
  html+='</select></div>';

  html+='<div style="background:var(--gris);border-radius:14px;padding:16px;margin-bottom:10px">';
  html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
  html+='<div style="font-size:12px;color:var(--texto-medio);text-transform:uppercase;letter-spacing:1px">💬 Mensaje de cobro</div>';
  html+='<div style="font-size:11px;color:#e31e24;font-weight:700">'+(tipoPago==='quincenal'?'📅 Quincenal — días '+diaPago+' y '+diaPago2:'📅 Mensual — día '+diaPago)+'</div></div>';
  html+='<textarea id="ac-msg" style="width:100%;background:var(--card);border:1px solid #333;border-radius:10px;padding:10px;color:var(--texto);font-size:12px;min-height:70px;box-sizing:border-box" placeholder="Mensaje 3 días antes (lo escribe el entrenador)...">'+(u.msg_proximo||u.msg_pago||'')+'</textarea>';
  html+='<div style="font-size:11px;color:var(--texto-medio);margin:8px 0 4px">💬 Mensaje de vencimiento (automático)</div>';
  html+='<div style="font-size:12px;color:#555;background:var(--card);border:1px solid #333;border-radius:10px;padding:10px;margin-bottom:0">El día de hoy se venció tu plan de entrenamiento.</div></div>';

  html+='<button onclick="guardarAdminCliente('+rawId+')" style="width:100%;background:var(--rojo);border:none;border-radius:12px;color:var(--texto);font-size:14px;font-weight:700;padding:12px;cursor:pointer;margin-bottom:8px">💾 Guardar</button>';
  html+='<button onclick="enviarCobroManual(&quot;'+id+'&quot;)" style="width:100%;background:var(--card);border:1px solid #25D366;border-radius:12px;color:#25D366;font-size:13px;font-weight:700;padding:11px;cursor:pointer;margin-bottom:10px">📲 Enviar cobro por WhatsApp</button>';

  html+='<div style="font-size:12px;color:var(--texto-medio);text-transform:uppercase;letter-spacing:1px;margin:16px 0 10px">📋 Registrar pago</div>';
  html+='<div style="background:var(--gris);border-radius:14px;padding:16px;margin-bottom:10px">';
  html+='<div style="display:flex;gap:8px;margin-bottom:8px">';
  html+='<input type="number" id="ac-monto" placeholder="ej: 350 = $350.000" style="flex:1;min-width:0;background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;color:var(--texto);font-size:13px;outline:none">';
  html+='<select id="ac-metodo" style="width:130px;flex-shrink:0;background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;color:var(--texto);font-size:13px">';
  html+='<option value="efectivo">💵 Efectivo</option><option value="transferencia">🏦 Transferencia</option><option value="tarjeta">💳 Tarjeta</option><option value="otro">📝 Otro</option>';
  html+='</select></div>';
  html+='<input type="text" id="ac-novedad" placeholder="📝 Novedades del pago (opcional)" style="width:100%;background:var(--card);border:1px solid #333;border-radius:10px;padding:9px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:8px">';
  html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer" onclick="toggleDescPanel()">';
  html+='<div style="width:18px;height:18px;border:2px solid #555;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px" id="ac-desc-check">+</div>';
  html+='<span style="font-size:12px;color:var(--texto-medio)">🏷️ Aplicar descuento</span></div>';
  html+='<div id="ac-desc-panel" style="display:none;background:var(--card);border:1px solid #333;border-radius:10px;padding:10px;margin-bottom:8px">';
  html+='<div style="display:flex;gap:8px;margin-bottom:6px">';
  html+='<select id="ac-desc-tipo" onchange="calcDescuento()" style="width:140px;background:var(--fondo);border:1px solid #333;border-radius:8px;padding:7px;color:var(--texto);font-size:12px">';
  html+='<option value="pct">% Porcentaje</option><option value="fijo">Valor fijo</option></select>';
  html+='<input type="number" id="ac-desc-valor" oninput="calcDescuento()" placeholder="0" style="flex:1;min-width:0;background:var(--fondo);border:1px solid #333;border-radius:8px;padding:7px;color:var(--texto);font-size:13px;outline:none">';
  html+='</div>';
  html+='<input type="text" id="ac-desc-motivo" placeholder="Motivo (ej: primer mes, referido)" style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:8px;padding:7px;color:var(--texto);font-size:12px;outline:none;box-sizing:border-box;margin-bottom:6px">';
  html+='<div id="ac-desc-info" style="font-size:12px;color:#4caf50;font-weight:700"></div>';
  html+='</div>';
  html+='<button onclick="registrarPago('+rawId+')" style="width:100%;background:#0f1a0f;border:1px solid #1e3a1e;border-radius:10px;color:#4caf50;font-size:13px;font-weight:700;padding:10px;cursor:pointer">✅ Registrar pago</button></div>';

  // Historial pagos
  if(d.pagos&&d.pagos.length){
    html+='<div style="font-size:12px;color:var(--texto-medio);text-transform:uppercase;letter-spacing:1px;margin:16px 0 10px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="toggleHistAdmin(\''+id+'\')" >📅 Ver historial <span id="hist-arr-'+id+'">▾</span></div>';
    html+='<div id="hist-'+id+'" style="display:none">';
    [...d.pagos].reverse().forEach(p=>{
      const tieneDesc=p.descuento_valor&&p.descuento_valor>0;
      html+='<div style="background:var(--card);border:1px solid #1e1e1e;border-radius:12px;padding:12px;margin-bottom:6px">';
      html+='<div style="display:flex;justify-content:space-between;align-items:center">';
      html+='<div><div style="font-size:13px;color:var(--texto);font-weight:600">'+(p.monto||0).toLocaleString()+' '+(p.moneda||d.moneda||'COP')+'</div>';
      html+='<div style="font-size:11px;color:var(--texto-secundario);margin-top:2px">'+p.fecha+' · '+(p.metodo||'efectivo')+(p.novedad?' · <span style="color:var(--texto-medio)">'+p.novedad+'</span>':'')+'</div></div>';
      html+='<div style="display:flex;gap:6px;align-items:center">';
      if(tieneDesc)html+='<span style="background:#1a1500;border:1px solid #3a3000;border-radius:6px;padding:2px 6px;font-size:10px;color:#f0c040">🏷️ DESC</span>';
      html+='<button onclick="window._reciboClienteId=\''+id+'\';window._reciboIdx='+([...d.pagos].reverse().indexOf(p))+';generarRecibo()" style="background:#1a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;font-size:11px;font-weight:700;padding:4px 8px;cursor:pointer">🧾</button>';
      html+='<span style="color:#4caf50;font-size:16px">✅</span></div></div>';
      if(tieneDesc){
        const descStr=p.descuento_tipo==='pct'?p.descuento_valor+'%':((p.descuento_valor/1000).toLocaleString()+' mil');
        html+='<div style="margin-top:6px;font-size:11px;color:#f0c040">🏷️ Descuento: '+descStr+(p.descuento_motivo?' — '+p.descuento_motivo:'')+'</div>';
      }
    html+='</div>';
      html+='</div>';
    });
  }
  html+='</div>';
  document.getElementById('admin-tab-content').innerHTML=html;
}

function calcDescuento(){
  const precio=parseFloat(document.getElementById('ac-precio')?document.getElementById('ac-precio').value:0)||0;
  const tipo=document.getElementById('ac-desc-tipo')?document.getElementById('ac-desc-tipo').value:'pct';
  const val=parseFloat(document.getElementById('ac-desc-valor')?document.getElementById('ac-desc-valor').value:0)||0;
  const montoEl=document.getElementById('ac-monto');
  const infoEl=document.getElementById('ac-desc-info');
  if(!montoEl)return;
  let final=precio;
  if(tipo==='pct') final=Math.round(precio*(1-val/100));
  else final=Math.max(0,precio-val);
  montoEl.value=final>0?final:'';
  if(infoEl) infoEl.textContent=final>0?'💰 Recomendado: '+(final).toLocaleString()+' mil':'';
}
function toggleDescPanel(){
  const p=document.getElementById('ac-desc-panel');
  if(p)p.style.display=p.style.display==='none'?'block':'none';
}

function toggleHistAdmin(id){
  const h=document.getElementById('hist-'+id);
  const a=document.getElementById('hist-arr-'+id);
  if(!h)return;
  const visible=h.style.display==='none';
  h.style.display=visible?'block':'none';
  if(a)a.textContent=visible?'▴':'▾';
}
async function guardarAdminCliente(id){
  const precio=(parseFloat(document.getElementById('ac-precio').value)||0)*1000;
  const moneda=document.getElementById('ac-moneda').value;
  const msg=document.getElementById('ac-msg').value.trim();
  const msgProximo=msg;
  const descTipo=document.getElementById('ac-desc-tipo').value;
  const descValorRaw=parseFloat(document.getElementById('ac-desc-valor').value)||0;
  const descValor=descTipo==='pct'?descValorRaw:descValorRaw*1000;
  const descMotivo=document.getElementById('ac-desc-motivo').value.trim();
  const _rawid=(id+'').replace('cli_','');
  await fetch('/api/admin/'+_rawid,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({precio,moneda,msg_proximo:msg,descuento_tipo:descTipo,descuento_valor:descValor,descuento_motivo:descMotivo,entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)})});
  if(!window._adminData.clientes[_rawid])window._adminData.clientes[_rawid]={pagos:[]};
  Object.assign(window._adminData.clientes[_rawid],{precio,moneda,descuento_tipo:descTipo,descuento_valor:descValor,descuento_motivo:descMotivo});
  const uIdx=(window._adminUsuarios||[]).findIndex(x=>String(x.id)===String(id));
  if(uIdx!==-1){window._adminUsuarios[uIdx].msg_proximo=msg;window._adminUsuarios[uIdx].precio=precio;window._adminUsuarios[uIdx].moneda=moneda;}
  if(typeof cargarInicio === 'function') cargarInicio();
  // Refrescar datos completos del módulo admin para que persista al navegar
  try {
    const eidR=(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001');
    const usuariosFrescos = await fetch('/api/usuarios?entrenador_id='+eidR).then(r=>r.json());
    window._adminUsuarios = usuariosFrescos;
  } catch(e) {}
  toast('✅ Cliente guardado');
  const acMsg=document.getElementById('ac-msg'); if(acMsg) acMsg.value=msg;
}

async function registrarPago(id){
  const monto=(parseFloat(document.getElementById('ac-monto').value)||0)*1000;
  const metodo=document.getElementById('ac-metodo').value;
  const _mid=(window._adminData.clientes[id])?id:(id+'').replace('cli_','');
  const moneda=(window._adminData.clientes[_mid]||{}).moneda||'COP';
  const novedad=document.getElementById('ac-novedad')?document.getElementById('ac-novedad').value.trim():'';
  const descPanel=document.getElementById('ac-desc-panel');
  const tieneDesc=descPanel&&descPanel.style.display!=='none';
  const descTipo=tieneDesc&&document.getElementById('ac-desc-tipo')?document.getElementById('ac-desc-tipo').value:'';
  const descValorRaw=tieneDesc&&document.getElementById('ac-desc-valor')?parseFloat(document.getElementById('ac-desc-valor').value)||0:0;
  const descValor=descTipo==='pct'?descValorRaw:descValorRaw*1000;
  const descMotivo=tieneDesc&&document.getElementById('ac-desc-motivo')?document.getElementById('ac-desc-motivo').value.trim():'';
  if(!monto){toast('❌ Ingresa un monto',false);return;}
  const pagoData={monto,metodo,moneda,novedad,descuento_tipo:descTipo,descuento_valor:descValor,descuento_motivo:descMotivo,entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)};
  await fetch('/api/admin/'+(id+'').replace('cli_','')+'/pago',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pagoData)});
  const _cid=(window._adminData.clientes[id])?id:(id+'').replace('cli_','');
  if(!window._adminData.clientes[_cid])window._adminData.clientes[_cid]={precio:0,moneda,pagos:[]};
  if(!window._adminData.clientes[_cid].pagos)window._adminData.clientes[_cid].pagos=[];
  window._adminData.clientes[_cid].pagos.push({...pagoData,fecha:new Date().toISOString().split('T')[0]});
  const uIdx = (window._adminUsuarios||[]).findIndex(x=>String(x.id)===String(id));
  if(uIdx !== -1) window._adminUsuarios[uIdx].estado_pago = 'aldia';
  toast('✅ Pago registrado');
  window._reciboClienteId = id;
  abrirAdminCliente(id);
}

function generarRecibo(){
  const id = window._reciboClienteId;
  if(!id) return;
  const u = (window._adminUsuarios||[]).find(x=>String(x.id)===String(id));
  const _rid = (id+'').replace('cli_','');
  const d = (window._adminData||{clientes:{}}).clientes[id]||(window._adminData||{clientes:{}}).clientes[_rid]||{};
  const pagos = d.pagos||[];
  const ridx = window._reciboIdx !== undefined ? window._reciboIdx : pagos.length-1;
  const p = pagos.length ? [...pagos].reverse()[ridx] : {};
  const nombreEntrenador = (window._configApp&&window._configApp.nombre_entrenador)||(window._config&&window._config.nombre_entrenador)||(window._adminData&&window._adminData.config&&window._adminData.config.nombre_entrenador)||'DT-APP';
  const logoSrc = (window._configApp&&window._configApp.logo_entrenador)||(window._config&&window._config.logo_entrenador)||(window._adminData&&window._adminData.config&&window._adminData.config.logo_entrenador)||'/logo_trainer.png';

  const W = 420, H = 820;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  function dibujar(){
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,W,H);

    // Banda roja superior
    ctx.fillStyle = '#e31e24';
    ctx.fillRect(0,0,W,100);

    // Nombre entrenador
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(nombreEntrenador, 110, 42);
    ctx.fillStyle = '#ffcccc';
    ctx.font = '12px Arial';
    ctx.fillText('RECIBO DE PAGO', 110, 62);

    // ID y fecha arriba derecha
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffcccc';
    ctx.font = '11px Arial';
    ctx.fillText('ID: ' + id, W-14, 42);
    ctx.fillText(p.fecha || new Date().toISOString().split('T')[0], W-14, 60);

    // Línea separadora
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20,118); ctx.lineTo(W-20,118);
    ctx.stroke();

    // DATOS DEL CLIENTE
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e31e24';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('DATOS DEL CLIENTE', 20, 140);

    ctx.fillStyle = '#111';
    ctx.font = 'bold 17px Arial';
    ctx.fillText(u ? u.nombre : '—', 20, 162);

    ctx.fillStyle = '#555';
    ctx.font = '12px Arial';
    ctx.fillText('Tel: ' + (u&&u.telefono ? u.telefono : '—'), 20, 182);

    const tipoPlan = u&&u.tipo ? u.tipo.charAt(0).toUpperCase()+u.tipo.slice(1) : '—';
    const tipoPago = u&&u.tipo_pago ? u.tipo_pago.charAt(0).toUpperCase()+u.tipo_pago.slice(1) : '—';
    ctx.fillText('Plan: ' + tipoPlan, 20, 200);
    ctx.fillText('Modalidad: ' + tipoPago, 20, 218);

    // Línea separadora
    ctx.strokeStyle = '#eeeeee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20,234); ctx.lineTo(W-20,234);
    ctx.stroke();

    // DETALLE DEL PAGO
    ctx.fillStyle = '#e31e24';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('DETALLE DEL PAGO', 20, 254);

    ctx.fillStyle = '#333';
    ctx.font = '13px Arial';
    const metodo = p.metodo ? p.metodo.charAt(0).toUpperCase()+p.metodo.slice(1) : '—';
    ctx.fillText('Método: ' + metodo, 20, 276);
    ctx.fillText('Moneda: ' + (p.moneda||d.moneda||'COP'), 20, 296);

    let yDet = 316;
    if(p.novedad){
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      const maxW = W-40;
      const words = ('Nota: '+p.novedad).split(' ');
      let line = '';
      words.forEach(function(w){
        const test = line + w + ' ';
        if(ctx.measureText(test).width > maxW && line !== ''){
          ctx.fillText(line, 20, yDet);
          yDet += 18;
          line = w + ' ';
        } else { line = test; }
      });
      if(line) { ctx.fillText(line, 20, yDet); yDet += 18; }
      yDet += 4;
    }

    if(p.descuento_valor && p.descuento_valor > 0){
      const ds = p.descuento_tipo==='pct'
        ? p.descuento_valor + '% de descuento'
        : (p.descuento_valor/1000).toLocaleString() + ' mil de descuento';
      const motivo = p.descuento_motivo ? ' — ' + p.descuento_motivo : '';
      ctx.fillStyle = '#b07000';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Descuento: ' + ds + motivo, 20, yDet);
      yDet += 20;
    }

    // Caja monto centrada
    const cajaY = yDet + 20;
    ctx.fillStyle = '#fff5f5';
    ctx.beginPath();
    ctx.roundRect(20, cajaY, W-40, 110, 14);
    ctx.fill();
    ctx.strokeStyle = '#e31e24';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#e31e24';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TOTAL PAGADO', W/2, cajaY+28);

    ctx.fillStyle = '#1a7a1a';
    ctx.font = 'bold 48px Arial';
    ctx.fillText((p.monto||0).toLocaleString(), W/2, cajaY+80);

    ctx.fillStyle = '#888';
    ctx.font = '13px Arial';
    ctx.fillText(p.moneda||d.moneda||'COP', W/2, cajaY+100);

    // Banda roja inferior
    ctx.fillStyle = '#e31e24';
    ctx.fillRect(0, H-110, W, 110);

    // Texto legal
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Recibo generado mediante DT-APP como herramienta de gestion.', W/2, H-62);
    ctx.fillStyle = '#ffcccc';
    ctx.font = '9px Arial';
    ctx.fillText('La responsabilidad del cobro y servicios corresponde', W/2, H-46);
    ctx.fillText('exclusivamente a tu entrenador personal.', W/2, H-32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Arial';
    ctx.fillText('DT-APP', W/2, H-18);
  }

  const img = new Image();
  img.onload = function(){
    dibujar();
    // Logo en banda superior
    ctx.drawImage(img, 8, 8, 85, 85);
    // Marca de agua centro (siempre logo DT-APP)
    const marcaAgua = new Image();
    marcaAgua.onload = function(){
      ctx.globalAlpha = 0.07;
      ctx.drawImage(marcaAgua, W/2-90, 320, 180, 180);
      ctx.globalAlpha = 1.0;
    };
    marcaAgua.src = '/icon.png';
    // Icono DT-APP en pie (solo el icono, centrado, encima del texto)
    const iconApp = new Image();
    iconApp.onload = function(){
      ctx.drawImage(iconApp, W/2-16, H-108, 32, 32);
      mostrarModalRecibo(canvas, u, p, d, nombreEntrenador);
    };
    iconApp.onerror = function(){
      mostrarModalRecibo(canvas, u, p, d, nombreEntrenador);
    };
    iconApp.src = '/icon.png';
  };
  img.onerror = function(){
    dibujar();
    mostrarModalRecibo(canvas, u, p, d, nombreEntrenador);
  };
  img.src = logoSrc + '?t=' + Date.now();
}

function mostrarModalRecibo(canvas, u, p, d, nombreEntrenador){
  const imgData = canvas.toDataURL('image/png');
  const nombreArchivo = 'recibo-'+(u?u.nombre.replace(/ /g,'-'):'cliente')+'-'+(p.fecha||'hoy')+'.png';
  const montoStr = (p.monto||0).toLocaleString();
  const monedaStr = p.moneda||d.moneda||'COP';
  const tel = u ? (u.telefono||'') : '';

  const old = document.getElementById('modal-recibo');
  if(old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-recibo';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000000cc;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;overflow-y:auto';

  const div = document.createElement('div');
  div.style.cssText = 'background:#111;border-radius:16px;padding:16px;width:100%;max-width:380px';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px';

  const titulo = document.createElement('span');
  titulo.style.cssText = 'color:#fff;font-weight:700;font-size:15px';
  titulo.textContent = 'Recibo generado';

  const btnX = document.createElement('button');
  btnX.textContent = 'X';
  btnX.style.cssText = 'background:#2a2a2a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer';
  btnX.onclick = function(){ document.getElementById('modal-recibo').remove(); };

  header.appendChild(titulo);
  header.appendChild(btnX);

  const imgEl = document.createElement('img');
  imgEl.src = imgData;
  imgEl.style.cssText = 'width:100%;border-radius:10px;margin-bottom:12px';

  const btns = document.createElement('div');
  btns.style.cssText = 'display:flex;gap:8px';

  const btnGuardar = document.createElement('a');
  btnGuardar.href = imgData;
  btnGuardar.download = nombreArchivo;
  btnGuardar.textContent = 'Guardar imagen';
  btnGuardar.style.cssText = 'flex:1;background:#1a3a1a;border:1px solid #4caf50;border-radius:10px;color:#4caf50;font-size:13px;font-weight:700;padding:10px;cursor:pointer;text-align:center;text-decoration:none';

  const btnWA = document.createElement('button');
  btnWA.textContent = 'Compartir WA';
  btnWA.style.cssText = 'flex:1;background:#1a2a1a;border:1px solid #25d366;border-radius:10px;color:#25d366;font-size:13px;font-weight:700;padding:10px;cursor:pointer';
  btnWA.onclick = function(){
    if(navigator.share){
      canvas.toBlob(function(blob){
        const file = new File([blob], nombreArchivo, {type:'image/png'});
        navigator.share({
          title: 'Recibo de pago',
          text: 'Recibo - '+nombreEntrenador,
          files: [file]
        }).catch(function(e){ console.log('share cancel',e); });
      });
    } else {
      const txt = 'Recibo de pago%0ANombre: '+encodeURIComponent(u?u.nombre:'')+'%0ATotal: '+encodeURIComponent(montoStr)+' '+encodeURIComponent(monedaStr)+'%0A'+encodeURIComponent(nombreEntrenador);
      const url = tel ? 'https://wa.me/'+tel+'?text='+txt : 'https://wa.me/?text='+txt;
      window.open(url,'_blank');
    }
  };

  btns.appendChild(btnGuardar);
  btns.appendChild(btnWA);
  div.appendChild(header);
  div.appendChild(imgEl);
  div.appendChild(btns);
  modal.appendChild(div);
  document.body.appendChild(modal);
}


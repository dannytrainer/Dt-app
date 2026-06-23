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
if(p==='inicio'){nav.style.display='none';}
else{nav.style.display='flex';const navIdx=['inicio','clientes','rutinas','logs','enviar'].indexOf(p);if(navIdx>=0)document.querySelectorAll('.nav button')[navIdx].classList.add('active');}
document.getElementById('fab-btn').style.display=p==='clientes'?'flex':'none';
if(p==='inicio')cargarInicio();
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
// MOTOR DE RECOMENDACIONES
// ═══════════════════════════════
function copiarMensaje(msg){
  navigator.clipboard.writeText(msg).then(()=>toast('📋 Mensaje copiado')).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=msg;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    toast('📋 Mensaje copiado');
  });
}

function proximaFechaEspecial(){
  const hoy=new Date();
  const anio=hoy.getFullYear();
  const fechas=[
    {nombre:'Día de las Madres', fecha:new Date(anio,4,segundoDomingo(anio,5)), msg:'🌸 ¡Se acerca el Día de las Madres! Tenemos un plan especial para ti. Este mes entrena con nosotros y celebra sintiéndote increíble. 💪'},
    {nombre:'Día del Padre', fecha:new Date(anio,5,tercerDomingo(anio,6)), msg:'💪 ¡Se acerca el Día del Padre! Regálate salud y fuerza. Tenemos un plan especial esperándote. 🏋️'},
    {nombre:'Amor y Amistad', fecha:new Date(anio,8,tercerSabado(anio,9)), msg:'❤️ ¡Septiembre es el mes del Amor y la Amistad! Comparte el bienestar — trae un amigo y obtén un beneficio especial. 🎁'},
    {nombre:'Halloween', fecha:new Date(anio,9,31), msg:'🎃 ¡Halloween se acerca! Transforma tu cuerpo antes de fin de año. Únete ahora con condiciones especiales. 👻'},
    {nombre:'Navidad', fecha:new Date(anio,11,25), msg:'🎄 ¡Navidad en camino! El mejor regalo eres tú mismo. Planes especiales de diciembre disponibles. ⭐'},
    {nombre:'Año Nuevo', fecha:new Date(anio+1,0,1), msg:'🎆 ¡El nuevo año se acerca! Empieza con el pie derecho — planes de enero con condiciones especiales. 💫'},
  ];
  const proximas=fechas.filter(f=>{
    const diff=(f.fecha-hoy)/(1000*60*60*24);
    return diff>=0&&diff<=15;
  });
  return proximas;
}

function segundoDomingo(anio,mes){
  let d=new Date(anio,mes-1,1);
  let dom=0,count=0;
  while(count<2){if(d.getDay()===0)count++;if(count<2)d.setDate(d.getDate()+1);}
  return d.getDate();
}
function tercerDomingo(anio,mes){
  let d=new Date(anio,mes-1,1);
  let count=0;
  while(count<3){if(d.getDay()===0)count++;if(count<3)d.setDate(d.getDate()+1);}
  return d.getDate();
}
function tercerSabado(anio,mes){
  let d=new Date(anio,mes-1,1);
  let count=0;
  while(count<3){if(d.getDay()===6)count++;if(count<3)d.setDate(d.getDate()+1);}
  return d.getDate();
}

function generarRecomendaciones(usuarios,adminData,dash){
  const rec=[];
  const hoy=new Date();
  const clientes=adminData.clientes||{};
  const cfg=adminData.config||{};
  const activos=usuarios.filter(u=>u.activo);
  const pausados=usuarios.filter(u=>!u.activo);

  // 1. Clientes pausados > 30 dias
  pausados.forEach(u=>{
    const d=clientes[u.id]||{};
    const precio=d.precio||0;
    const pagos=d.pagos||[];
    const ultimoPago=pagos.length?new Date(pagos[pagos.length-1].fecha):null;
    if(!ultimoPago){
      // Nunca ha pagado
      rec.push({
        icono:'🆕',
        titulo:u.nombre+' — aún no ha pagado su primera mensualidad',
        detalle:'Cliente registrado sin pagos. Verifica si ya inició o si está pendiente de cobro.',
        color:'#607d8b',
        mensaje:'Hola '+u.nombre+' 👋, quería saber cómo vas con tu plan. ¿Arrancamos? 💪',
        btnWA:'Hola '+u.nombre+' 👋, quería saber cómo vas con tu plan. ¿Arrancamos? 💪'
      });
    } else {
      const diasPausado=Math.floor((hoy-ultimoPago)/(1000*60*60*24));
      if(diasPausado>30){
        const desc=30;
        const precioDesc=Math.round(precio*(1-desc/100));
        const msg='Hola '+u.nombre+' 👋, te extrañamos en el gym! Tenemos un plan especial de regreso con '+desc+'% de descuento — solo '+(precioDesc>0?precioDesc.toLocaleString():'[precio]')+' este mes. ¿Volvemos? 💪';
        rec.push({
          icono:'⏸️',
          titulo:u.nombre+' lleva '+diasPausado+' días pausado',
          detalle:'Último pago: '+ultimoPago.toLocaleDateString('es-CO')+' · Precio: '+(precio>0?precio.toLocaleString()+' '+(d.moneda||'COP'):'sin registrar')+' · Plan retoma con '+desc+'% off'+(precioDesc>0?' = '+precioDesc.toLocaleString():''),
          color:'#ff9800',
          mensaje:msg,
          btnWA:msg
        });
      }
    }
  });

  // 2. Clientes vencidos - agrupar en una sola recomendacion
  const vencidosList=activos.filter(u=>u.estado_pago==='vencido');
  if(vencidosList.length===1){
    const u=vencidosList[0];
    const msg='Hola '+u.nombre+' 👋, te recuerdo que tienes un pago pendiente. Comunícate conmigo para ponernos al día. ¡Gracias! 💪';
    rec.push({icono:'🔴',titulo:u.nombre+' tiene pago vencido',detalle:'Día de pago: '+(u.dia_pago||'sin definir')+'. Envíale un recordatorio ahora.',color:'#e31e24',mensaje:msg,btnWA:msg});
  } else if(vencidosList.length>1){
    const nombres=vencidosList.map(u=>u.nombre).join(', ');
    const total=vencidosList.reduce((s,u)=>{const d=clientes[u.id]||{};return s+(d.precio||0);},0);
    rec.push({icono:'🔴',titulo:vencidosList.length+' clientes con pago vencido',detalle:nombres+'. Total en riesgo: '+(total>0?total.toLocaleString()+' COP':'calcular precios'),color:'#e31e24',mensaje:null,btnWA:null});
  }

  // 3. Fechas especiales proximas
  const especiales=proximaFechaEspecial();
  especiales.forEach(fe=>{
    const diff=Math.floor((fe.fecha-hoy)/(1000*60*60*24));
    const desc=diff<=7?20:15;
    const totalMesLocal=dash.totalMes||0;
    const clientesSinPrecio=activos.filter(u=>!(clientes[u.id]&&clientes[u.id].precio>0)).length;
    const potencialPromo=Math.round(totalMesLocal*desc/100);
    const propuesta=diff<=7
      ?'Lanza YA un '+desc+'% de descuento — quedan solo '+diff+' días. Podrías atraer '+(pausados.length>0?pausados.length+' clientes pausados':'nuevos clientes')+'.'
      :'Tienes '+diff+' días para preparar una promo de '+desc+'% de descuento'+(potencialPromo>0?' — inversión estimada: '+potencialPromo.toLocaleString()+' COP':'');
    rec.push({
      icono:'🎯',
      titulo:fe.nombre+' en '+diff+' día'+(diff===1?'':'s'),
      detalle:propuesta,
      color:'#9c27b0',
      mensaje:fe.msg,
      btnWA:fe.msg
    });
  });

  // 4. Cobrado < 50% proyeccion a mitad de mes
  const dia=hoy.getDate();
  const totalMes=dash.totalMes||0;
  const totalPagos=dash.totalPagos||0;
  if(dia>=15&&totalMes>0&&totalPagos<totalMes*0.5){
    rec.push({
      icono:'⚠️',
      titulo:'Solo has cobrado el '+Math.round(totalPagos/totalMes*100)+'% de tu proyección',
      detalle:'Llevas '+totalPagos.toLocaleString()+' de '+totalMes.toLocaleString()+' proyectados. Activa cobros pendientes.',
      color:'#ff9800',
      mensaje:null,
      btnWA:null
    });
  }

  // 5. Clientes sin precio registrado
  const sinPrecio=activos.filter(u=>!(clientes[u.id]&&clientes[u.id].precio>0));
  if(sinPrecio.length>0){
    rec.push({
      icono:'💰',
      titulo:sinPrecio.length+' clientes sin precio registrado',
      detalle:sinPrecio.map(u=>u.nombre).join(', ')+'. Registra sus precios para mejorar tus proyecciones.',
      color:'#4a9eff',
      mensaje:null,
      btnWA:null
    });
  }

  // MEJORA 2: Retención — clientes 3+ meses activos
  activos.forEach(u=>{
    const d=clientes[u.id]||{};
    const precio=d.precio||0;
    const pagos=d.pagos||[];
    if(pagos.length===0) return;
    const primerPago=new Date(pagos[0].fecha);
    const mesesActivo=Math.floor((hoy-primerPago)/(1000*60*60*24*30));
    if(mesesActivo>=3 && mesesActivo<6){
      const desc=10;
      const precioDesc=Math.round(precio*(1-desc/100));
      const msg='Hola '+u.nombre+' 💪, llevas '+mesesActivo+' meses entrenando y eso merece reconocimiento. Quiero ofrecerte un precio preferencial de '+precioDesc.toLocaleString()+' para que sigamos juntos mucho más. ¡Cuéntame!';
      rec.push({
        icono:'🏅',
        titulo:u.nombre+' lleva '+mesesActivo+' meses — fidelizar ahora',
        detalle:'Cliente activo desde '+primerPago.toLocaleDateString('es-CO')+'. Ofrecer '+desc+'% preferencial antes de los 6 meses = '+precioDesc.toLocaleString()+' '+(d.moneda||'COP'),
        color:'#4caf50',
        mensaje:msg,
        btnWA:msg
      });
    }
  });

  // MEJORA 3: Temporada baja — mes actual vs anterior
  const totalMesAct=dash.totalPagos||0;
  const totalMesAnt=dash.totalMesAnt||0;
  if(totalMesAnt>0 && totalMesAct<totalMesAnt*0.8){
    const caida=Math.round((1-totalMesAct/totalMesAnt)*100);
    rec.push({
      icono:'📉',
      titulo:'Este mes vas '+caida+'% por debajo del anterior',
      detalle:'Mes anterior: '+totalMesAnt.toLocaleString()+' → Este mes: '+totalMesAct.toLocaleString()+'. Momento ideal para campaña de reactivación.',
      color:'#ff5722',
      mensaje:null,
      btnWA:null
    });
  }

  // MEJORA 1: Propuestas 2x1 — clientes con horario similar
  const horarioMap={};
  activos.forEach(u=>{
    if(!u.horario) return;
    const h=u.horario.trim().toLowerCase();
    if(!horarioMap[h]) horarioMap[h]=[];
    horarioMap[h].push(u);
  });
  Object.entries(horarioMap).forEach(([horario,grupo])=>{
    if(grupo.length>=2){
      grupo.forEach(u=>{
        const d=clientes[u.id]||{};
        const precio=d.precio||0;
        const precioDesc=Math.round(precio*0.7);
        const msg='Hola '+u.nombre+' 👋, tengo una propuesta especial: si traes un amigo a tu horario ('+horario+') ambos pagan solo el 70% — quedarías en '+precioDesc.toLocaleString()+'. ¿Conoces a alguien? 💪';
        rec.push({
          icono:'👥',
          titulo:'2x1 para '+u.nombre+' (horario '+horario+')',
          detalle:grupo.length+' clientes en este horario. Sugerir traer amigo con 30% descuento = '+precioDesc.toLocaleString()+' '+(d.moneda||'COP'),
          color:'#00bcd4',
          mensaje:msg,
          btnWA:msg
        });
      });
    }
  });

  // MEJORA 5: Historial de promociones enviadas
  const promoHistorial=JSON.parse(localStorage.getItem('dt_promo_historial')||'[]');
  const hoyStr=hoy.toISOString().split('T')[0];
  const enviadas=promoHistorial.filter(p=>p.fecha===hoyStr);
  if(enviadas.length>0){
    rec.push({
      icono:'📊',
      titulo:'Hoy enviaste '+enviadas.length+' promoción'+(enviadas.length>1?'es':''),
      detalle:enviadas.map(p=>p.cliente+': '+p.tipo).join(' · '),
      color:'#607d8b',
      mensaje:null,
      btnWA:null
    });
  }

  // MEJORA 6: Promociones personalizadas — UNA tarjeta grupal por promo
  const promosPersonalizadas=JSON.parse(localStorage.getItem('dt_promos_custom')||'[]');
  promosPersonalizadas.filter(p=>p.activa).forEach(promo=>{
    let candidatos=[];
    if(promo.condicion==='nuevo'){
      candidatos=activos.filter(u=>{
        const d=clientes[u.id]||{};
        const pagos=d.pagos||[];
        if(pagos.length===0) return true;
        const primer=new Date(pagos[0].fecha);
        return Math.floor((hoy-primer)/(1000*60*60*24))<=30;
      });
    } else if(promo.condicion==='pausado'){
      candidatos=pausados;
    } else if(promo.condicion==='activo'){
      candidatos=activos;
    } else if(promo.condicion==='todos'){
      candidatos=[...activos,...pausados];
    }
    if(candidatos.length===0) return;
    const desc=promo.descuento||0;
    const potencial=candidatos.reduce((s,u)=>{
      const d=clientes[u.id]||{};
      return s+Math.round((d.precio||0)*(1-desc/100));
    },0);
    const msg=promo.mensaje
      .replace(/{nombre}/g,'[cliente]')
      .replace(/{descuento}/g,desc+'%')
      .replace(/{precio}/g,'[precio]')
      .replace(/{precio_con_descuento}/g,'[precio con descuento]');
    const condLabel=promo.condicion==='nuevo'?'nuevos':promo.condicion==='pausado'?'pausados':promo.condicion==='activo'?'activos':'total';
    rec.push({
      icono:'🎁',
      titulo:promo.nombre+' · '+candidatos.length+' clientes '+condLabel,
      detalle:desc+'% descuento · Potencial recuperable: '+(potencial>0?potencial.toLocaleString()+' COP':'calcular precios'),
      color:'#e91e63',
      mensaje:msg,
      btnWA:msg
    });
  });

  return rec;
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
  const d = (window._adminData||{clientes:{}}).clientes[id]||{};
  const pagos = d.pagos||[];
  const ridx = window._reciboIdx !== undefined ? window._reciboIdx : pagos.length-1;
  const p = pagos.length ? [...pagos].reverse()[ridx] : {};
  const nombreEntrenador = (window._configApp&&window._configApp.nombre_entrenador)||(window._config&&window._config.nombre_entrenador)||(window._adminData&&window._adminData.config&&window._adminData.config.nombre_entrenador)||'DT-APP';
  const logoSrc = '/logo_trainer.png';

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
    // Marca de agua centro
    ctx.globalAlpha = 0.07;
    ctx.drawImage(img, W/2-90, 320, 180, 180);
    ctx.globalAlpha = 1.0;
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
  img.src = logoSrc;
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

// ═══════════════════════════════
// COLORES PERSONALIZABLES
// ═══════════════════════════════
const _coloresConfig = {
  general: [
    {var:'--rojo', label:'Color acento', def:'#e31e24'},
    {var:'--fondo', label:'Fondo app', def:'#0a0a0a'},
    {var:'--card', label:'Fondo cards', def:'#111111'},
    {var:'--gris', label:'Fondo inputs', def:'#1a1a1a'},
  ],
  chips: [
    {var:'--chip-activos', label:'🟢 Activos', def:'#4caf50'},
    {var:'--chip-person', label:'💪 Personalizados', def:'#e31e24'},
    {var:'--chip-asesor', label:'📋 Asesorados', def:'#4a9eff'},
    {var:'--chip-pausados', label:'⏸️ Pausados', def:'#666666'},
  ],
  tests: [
    {var:'--test-fuerza', label:'💪 Fuerza', def:'#e31e24'},
    {var:'--test-resist', label:'🫁 Resistencia', def:'#4a9eff'},
    {var:'--test-especif', label:'⭐ Específico', def:'#9c27b0'},
  ]
};
let _tabColoresActual = 'general';

function mostrarTabColores(tab){
  _tabColoresActual = tab;
  ['general','chips','tests'].forEach(t=>{
    const btn = document.getElementById('tab-col-'+t);
    btn.style.background = t===tab ? 'var(--rojo)' : '#2a2a2a';
    btn.style.color = t===tab ? '#fff' : '#888';
  });
  const root = getComputedStyle(document.documentElement);
  const items = _coloresConfig[tab];
  let html = '';
  items.forEach(item=>{
    const val = root.getPropertyValue(item.var).trim() || item.def;
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #222">';
    html += '<span style="font-size:13px;color:var(--texto-suave)">'+item.label+'</span>';
    html += '<div style="display:flex;align-items:center;gap:8px">';
    html += '<span style="font-size:11px;color:var(--texto-secundario)">'+val+'</span>';
    html += '<input type="color" value="'+val+'" data-var="'+item.var+'" onchange="aplicarColor(this)" style="width:36px;height:36px;border:none;border-radius:8px;cursor:pointer;background:none;padding:0">';
    html += '</div></div>';
  });
  document.getElementById('tab-colores-content').innerHTML = html;
}

function aplicarColor(input){
  document.documentElement.style.setProperty(input.dataset.var, input.value);
}

async function guardarColores(){
  const root = getComputedStyle(document.documentElement);
  const colores = {};
  ['general','chips','tests'].forEach(tab=>{
    _coloresConfig[tab].forEach(item=>{
      colores[item.var] = document.documentElement.style.getPropertyValue(item.var) || root.getPropertyValue(item.var).trim() || item.def;
    });
  });
  await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({colores, entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)})});
  toast('✅ Colores guardados');
}

function aplicarColoresGuardados(colores){
  if(!colores) return;
  Object.entries(colores).forEach(([key,val])=>{
    document.documentElement.style.setProperty(key, val);
  });
}
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
      document.getElementById('cfg-logo-preview').src='/logo_trainer.png?t='+Date.now();
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
// ═══════════════════════════════
// PANTALLA INICIO
// ═══════════════════════════════

let _vencIdx=0;
let _vencidos=[];
function enviarPagoWA(idx){
  const u=_vencidos[idx];
  if(!u)return;
  const msgTexto = (u.msg_pago && u.msg_pago.trim()) ? u.msg_pago : 'El día de hoy se venció tu plan de entrenamiento.';
  const msg=encodeURIComponent(msgTexto);
  window.open('https://wa.me/'+u.telefono.replace(/\D/g,'')+'?text='+msg,'_blank');
}
async function cargarInicio(){
  try{
    const usuarios=await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001')).then(r=>r.json());
    const activos=usuarios.filter(u=>u.activo);
    const person=activos.filter(u=>u.tipo==='personalizado').length;
    const asesor=activos.filter(u=>u.tipo==='asesorado').length;
    const pausados=usuarios.filter(u=>!u.activo).length;
    document.getElementById('hi-stat-activos').textContent=activos.length;
    document.getElementById('hi-stat-person').textContent=person;
    document.getElementById('hi-stat-asesor').textContent=asesor;
    document.getElementById('hi-stat-pausados').textContent=pausados;
    const badge=document.getElementById('hi-badge-clientes');
    // Badge ahora muestra mensajes no leídos
    fetch('/api/chat/no-leidos/entrenador').then(r=>r.json()).then(data=>{
      badge.textContent=data.total;
      badge.style.display=data.total>0?'block':'none';
    }).catch(()=>{ badge.style.display='none'; });
    const hoy=new Date();
    _vencIdx=0;_vencidos=[];
    const vencidos=activos.filter(u=>u.estado_pago==='vencido');
    _vencidos=vencidos;
    const proximos=activos.filter(u=>{
      if(!u.dia_pago||u.estado_pago==='vencido')return false;
      const dia=parseInt(u.dia_pago);
      // Fecha de pago este mes
      let d=new Date(hoy.getFullYear(),hoy.getMonth(),dia);
      let diff=Math.ceil((d-hoy)/(1000*60*60*24));
      // Si ya pasó este mes, revisar el mes siguiente
      if(diff<-3){
        d=new Date(hoy.getFullYear(),hoy.getMonth()+1,dia);
        diff=Math.ceil((d-hoy)/(1000*60*60*24));
      }
      return diff>=0&&diff<=3;
    });
    _vencidos=vencidos;
    let cobrosHtml='';
    if(vencidos.length===0&&proximos.length===0){
      cobrosHtml='<div style="background:rgba(76,175,80,0.10);border:1px solid rgba(76,175,80,0.25);border-radius:16px;padding:20px;text-align:center;min-width:180px;flex-shrink:0"><div style="font-size:28px">✅</div><div style="font-size:13px;color:#4caf50;font-weight:700;margin-top:6px">Todo al día</div><div style="font-size:11px;color:var(--texto-tenue);margin-top:4px">Sin cobros pendientes</div></div>';
    }
    vencidos.forEach((u,_vi)=>{
      cobrosHtml+='<div style="background:rgba(227,30,36,0.08);border:1px solid rgba(227,30,36,0.25);border-radius:16px;padding:16px;min-width:190px;flex-shrink:0;backdrop-filter:blur(10px)"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:16px">🔴</span><span style="font-size:11px;font-weight:800;color:#e31e24;text-transform:uppercase;letter-spacing:.5px">Cobro vencido</span></div><div style="font-size:14px;color:var(--texto);font-weight:700;margin-bottom:4px">'+u.nombre+'</div><div style="font-size:11px;color:var(--texto-medio);margin-bottom:10px">'+(u.msg_pago||'Pago pendiente')+'</div><div style="background:rgba(227,30,36,0.15);border:1px solid rgba(227,30,36,0.3);border-radius:10px;padding:8px;text-align:center;font-size:12px;color:#e31e24;font-weight:700;cursor:pointer" id=\"wa-btn-'+ _vi +'\">📲 WhatsApp</div></div>';
    });
    proximos.forEach((u,_pi)=>{
      cobrosHtml+='<div style="background:rgba(255,152,0,0.08);border:1px solid rgba(255,152,0,0.30);border-radius:16px;padding:16px;min-width:190px;flex-shrink:0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:16px">⚠️</span><span style="font-size:11px;font-weight:800;color:#ff9800;text-transform:uppercase;letter-spacing:.5px">Próximo cobro</span></div><div style="font-size:14px;color:var(--texto);font-weight:600;margin-bottom:4px">'+u.nombre+'</div><div style="font-size:11px;color:var(--texto-medio);margin-bottom:10px">Vence día '+u.dia_pago+'</div><div style="background:rgba(255,152,0,0.15);border:1px solid rgba(255,152,0,0.30);border-radius:10px;padding:8px;text-align:center;font-size:12px;color:#ff9800;font-weight:700;cursor:pointer" id="prox-btn-'+_pi+'">📲 Recordar</div></div>';
    });
    document.getElementById('hi-cobros').innerHTML=cobrosHtml;
    proximos.forEach((_u,_pi)=>{
      const bp=document.getElementById('prox-btn-'+_pi);
      if(bp)bp.onclick=()=>{
        const msgTexto = (_u.msg_proximo && _u.msg_proximo.trim()) ? _u.msg_proximo : ('Hola '+_u.nombre+' 👋, te recuerdo que tu plan vence pronto. Comunícate conmigo para renovarlo. ¡Gracias! 💪');
        const msg=encodeURIComponent(msgTexto);
        window.open('https://wa.me/'+_u.telefono.replace(/\D/g,'')+'?text='+msg,'_blank');
      };
    });
    vencidos.forEach((_u,_i)=>{
      const b=document.getElementById('wa-btn-'+_i);
      if(b)b.onclick=()=>enviarPagoWA(_i);
    });
    const items=[];
    if(activos.length>0)items.push('👥 '+activos.length+' clientes activos');
    if(vencidos.length>0)items.push('🔴 Cobro vencido: '+vencidos.map(u=>u.nombre).join(', '));
    if(proximos.length>0)items.push('⚠️ Próximo cobro: '+proximos.map(u=>u.nombre).join(', '));
    items.push('📅 '+new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'}));
    const txt=items.join('   •   ');
    document.getElementById('ticker-inner').textContent=txt+'   •   '+txt;
  }catch(e){console.error('cargarInicio',e);}
}
async function cargarClientes(){
const res=await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001'));
const usuarios=await res.json();
const lista=document.getElementById('lista-clientes');
const empty=document.getElementById('empty-clientes');
if(!usuarios.length){lista.innerHTML='';empty.style.display='block';return;}
empty.style.display='none';
window._usuariosCargados=usuarios;
const sActivos=usuarios.filter(u=>u.activo).length;
const sPersonalizados=usuarios.filter(u=>u.activo&&u.tipo==='personalizado').length;
const sAsesorados=usuarios.filter(u=>u.activo&&u.tipo==='asesorado').length;
const sPausados=usuarios.filter(u=>!u.activo).length;
document.getElementById('stat-activos').textContent=sActivos;
document.getElementById('stat-personalizados').textContent=sPersonalizados;
document.getElementById('stat-asesorados').textContent=sAsesorados;
document.getElementById('stat-pausados').textContent=sPausados;
lista.innerHTML=usuarios.map(u=>{
const ep=u.estado_pago||'aldia';
const cc=ep==='vencido'?'card vencido':ep==='proximo'?'card proximo':'card';
return`<div class="${cc}">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
${avatarHTML(u)}
<div style="flex:1">
<div style="font-size:16px;font-weight:700;color:var(--texto)">${u.nombre}</div>
<div style="font-size:11px;color:#777;margin-top:2px">📱 ${u.telefono} &nbsp;🗓️ Día ${u.dia_pago||'-'}</div>
</div>
<label class="toggle"><input type="checkbox" ${u.activo?'checked':''} onchange="toggleActivo('${u.id}',this.checked)"><span class="slider"></span></label>
</div>
<div style="margin-bottom:10px">
<span class="badge ${u.activo?'ba':'bp2'}">${u.activo?'● Activo':'⏸ Pausado'}</span>
<span class="badge bti">${u.tipo}</span>
${epBadge(ep)}
</div>
<div style="display:flex;gap:5px">
<button class="btn bg" style="flex:1;font-size:11px;padding:8px 4px" onclick="editarCliente('${u.id}')">✏️ Editar</button>
<button class="btn bg" style="flex:1;font-size:11px;padding:8px 4px" onclick="abrirMedidasYSubir('${u.id}','${u.nombre}')">📊 Medidas</button>
<button class="btn bg" style="flex:1;font-size:11px;padding:8px 4px" onclick="abrirTestsYSubir('${u.id}','${u.nombre}')">🏋️ Tests</button>
<button class="btn bp" style="font-size:11px;padding:8px 10px" onclick="eliminarCliente('${u.id}')">🗑️</button>
</div>
</div>`;
}).join('');
}

function selEstado(e){
document.getElementById('cliente-estado-pago').value=e;
['aldia','proximo','vencido'].forEach(x=>{
const b=document.getElementById('btn-'+x);
b.className='eb'+(x===e?' s'+x.slice(0,2):'');
if(x==='aldia'&&e==='aldia')b.className='eb sal';
if(x==='proximo'&&e==='proximo')b.className='eb spr';
if(x==='vencido'&&e==='vencido')b.className='eb sve';
});
}

var _ultimoClienteId=null;

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

function _renderListaLocal(){
  if(!window._usuariosCargados)return;
  const lista=document.getElementById('lista-clientes');
  if(!lista)return;
  lista.innerHTML=window._usuariosCargados.map(u=>{
    const ep=u.estado_pago||'aldia';
    const cc=ep==='vencido'?'card vencido':ep==='proximo'?'card proximo':'card';
    return`<div class="${cc}">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
${avatarHTML(u)}
<div style="flex:1">
<div style="font-size:16px;font-weight:700;color:var(--texto)">${u.nombre}</div>
<div style="font-size:11px;color:#777;margin-top:2px">📱 ${u.telefono} &nbsp;🗓️ Día ${u.dia_pago||'-'}</div>
</div>
<label class="toggle"><input type="checkbox" ${u.activo?'checked':''} onchange="toggleActivo('${u.id}',this.checked)"><span class="slider"></span></label>
</div>
<div style="margin-bottom:10px">
<span class="badge ${u.activo?'ba':'bp2'}">${u.activo?'● Activo':'⏸ Pausado'}</span>
<span class="badge bti">${u.tipo}</span>
${epBadge(ep)}
</div>
<div style="display:flex;gap:5px">
<button class="btn bg" style="flex:1;font-size:11px;padding:8px 4px" onclick="editarCliente('${u.id}')">✏️ Editar</button>
<button class="btn bg" style="flex:1;font-size:11px;padding:8px 4px" onclick="abrirMedidasYSubir('${u.id}','${u.nombre}')">📊 Medidas</button>
<button class="btn bg" style="flex:1;font-size:11px;padding:8px 4px" onclick="abrirTestsYSubir('${u.id}','${u.nombre}')">🏋️ Tests</button>
<button class="btn bp" style="font-size:11px;padding:8px 10px" onclick="eliminarCliente('${u.id}')">🗑️</button>
</div>
</div>`;
  }).join('');
}

async function abrirTests(id,nombre){
  window.clienteTestsId=id;
  document.getElementById("modal-tests-titulo").textContent="🏋️ Tests - "+nombre;
  document.getElementById("modal-tests").classList.add("open");
await renderTests(id);
}
async function abrirModalCliente(){
  if (!entEsPremium()) {
    const eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001');
    const usuarios = await fetch('/api/usuarios?entrenador_id=' + eid).then(r=>r.json()).catch(()=>[]);
    const activos = usuarios.filter(u => u.activo !== false).length;
    if (activos >= 3) {
      mostrarCandadoPremium('Has alcanzado el limite de 3 clientes del Plan Gratis. Activa Premium para clientes ilimitados.');
      return;
    }
  }
document.getElementById('cliente-id').value='';
document.getElementById('cliente-nombre').value='';
document.getElementById('cliente-telefono').value='';
document.getElementById('cliente-pago').value='';
document.getElementById('cliente-pago2').value='';
document.getElementById('cliente-tipo-pago').value='mensual';
document.getElementById('pago2-box').style.display='none';
selEstado('aldia');
document.getElementById('modal-titulo').textContent='➕ Nuevo cliente';
document.getElementById('modal-cliente').classList.add('open');
}

async function editarCliente(id){
const res=await fetch('/api/usuarios/'+id);
const u=await res.json();
document.getElementById('cliente-id').value=u.id;
document.getElementById('cliente-nombre').value=u.nombre;
document.getElementById('cliente-telefono').value=u.telefono;
document.getElementById('cliente-email').value=u.email||'';
document.getElementById('cliente-tipo').value=u.tipo;
document.getElementById('cliente-pago').value=u.dia_pago||'';
document.getElementById('cliente-pago2').value=u.dia_pago2||'';
document.getElementById('cliente-tipo-pago').value=u.tipo_pago||'mensual';
document.getElementById('pago2-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';
document.getElementById('cliente-msg-q1').value=u.msg_q1||'';
document.getElementById('cliente-msg-q2').value=u.msg_q2||'';
document.getElementById('msg-quincena1-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';
document.getElementById('msg-quincena2-box').style.display=(u.tipo_pago==='quincenal')?'block':'none';
selEstado(u.estado_pago||'aldia');
const up=u.perfil||{};
if(document.getElementById('cliente-fnac')) document.getElementById('cliente-fnac').value=up.fecha_nacimiento||'';
if(document.getElementById('cliente-altura')) document.getElementById('cliente-altura').value=up.altura||'';
if(document.getElementById('cliente-sexo')) document.getElementById('cliente-sexo').value=up.sexo||'M';
if(document.getElementById('cliente-objetivo')) document.getElementById('cliente-objetivo').value=up.etiqueta||'perdida';
if(document.getElementById('cliente-notas')) document.getElementById('cliente-notas').value=up.notas||'';
if(document.getElementById('cliente-condiciones')) document.getElementById('cliente-condiciones').value=up.condiciones_medicas||'';
if(document.getElementById('cliente-alimentacion')) document.getElementById('cliente-alimentacion').value=up.preferencias_alimentarias||'';
document.getElementById('modal-titulo').textContent='✏️ Editar cliente';
document.getElementById('modal-cliente').classList.add('open');
}

function cerrarModal(){document.getElementById('modal-cliente').classList.remove('open');}

async function guardarCliente(){
const id=document.getElementById('cliente-id').value;
const datos={
entrenador_id:(JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null),
nombre:document.getElementById('cliente-nombre').value.trim(),
telefono:document.getElementById('cliente-telefono').value.replace(/\D/g,''),
email:document.getElementById('cliente-email').value.trim(),
tipo:document.getElementById('cliente-tipo').value,
tipo_pago:document.getElementById('cliente-tipo-pago').value,
dia_pago:parseInt(document.getElementById('cliente-pago').value)||null,
dia_pago2:parseInt(document.getElementById('cliente-pago2').value)||null,
estado_pago:document.getElementById('cliente-estado-pago').value,

};
// Manejar destino grupo
if(window._destinoWA==='grupo'){
  const link=document.getElementById('cliente-grupo-link')?document.getElementById('cliente-grupo-link').value.trim():'';
  if(!link){toast('Pega el link del grupo',false);return;}
  const codigo=link.split('/').pop();
  datos.telefono='grupo:'+codigo;
  datos.es_grupo=true;
}
if(!datos.nombre||!datos.telefono){toast('Completa nombre y teléfono',false);return;}
const perfilDatos={
  fecha_nacimiento:document.getElementById('cliente-fnac')?document.getElementById('cliente-fnac').value:'',
  altura:document.getElementById('cliente-altura')?document.getElementById('cliente-altura').value:'',
  sexo:document.getElementById('cliente-sexo')?document.getElementById('cliente-sexo').value:'M',
  etiqueta:document.getElementById('cliente-objetivo')?document.getElementById('cliente-objetivo').value:'',
  notas:document.getElementById('cliente-notas')?document.getElementById('cliente-notas').value.trim():'',
  condiciones_medicas:document.getElementById('cliente-condiciones')?document.getElementById('cliente-condiciones').value.trim():'',
  preferencias_alimentarias:document.getElementById('cliente-alimentacion')?document.getElementById('cliente-alimentacion').value.trim():''
};
if(id){
await fetch('/api/usuarios/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)});
await fetch('/api/usuarios/'+id+'/perfil-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(perfilDatos)});
toast('✅ Cliente actualizado');
}else{
const nuevo=await fetch('/api/usuarios',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)}).then(r=>r.json());
if(nuevo.id) await fetch('/api/usuarios/'+nuevo.id+'/perfil-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(perfilDatos)});
toast('✅ Cliente agregado');
}
cerrarModal();cargarClientes();
}

async function eliminarCliente(id){
if(!confirm('¿Eliminar este cliente?'))return;
await fetch('/api/usuarios/'+id,{method:'DELETE'});
toast('🗑️ Cliente eliminado');cargarClientes();
}

async function toggleActivo(id,activo){
await fetch('/api/usuarios/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({activo})});
toast(activo?'✅ Activado':'⏸️ Pausado');cargarClientes();
}


function avatarHTML(u){
  const iniciales = (u.nombre||'?').split(' ').slice(0,2).map(n=>n[0]?n[0].toUpperCase():'').join('') || '?';
  if(u.foto){
    return `<div class="avatar" onclick="cambiarFoto('${u.id}')"><img src="${u.foto}" onerror="this.parentElement.innerHTML='${iniciales}'"></div>`;
  }
  return `<div class="avatar" onclick="cambiarFoto('${u.id}')">${iniciales}</div>`;
}

async function cambiarFoto(id){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
          if(file.size > 5 * 1024 * 1024){ toast('⚠️ Imagen muy grande. Máximo 5MB', false); return; }
    const fd = new FormData();
    fd.append('foto', file);
    const res = await fetch('/api/foto-cliente/'+id, {method:'POST', body:fd});
    const data = await res.json();
    if(data.ok){ toast('✅ Foto actualizada'); cargarClientes(); }
    else toast('❌ Error al subir foto', false);
  };
  input.click();
}



async function cargarRutinasClientes(){
const res=await fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||'ent_001'));
const usuarios=await res.json();
document.getElementById('lista-rutinas-clientes').innerHTML=usuarios.map(u=>`
<div class="card" onclick="abrirRutina('${u.id}','${u.nombre}')" style="cursor:pointer">
<div style="display:flex;align-items:center;gap:12px">
${avatarHTML(u)}
<div style="flex:1"><div style="font-weight:700">${u.nombre}</div>
<div style="font-size:12px;color:#777">Toca para editar rutina</div></div>
<span style="color:#e31e24;font-size:22px">›</span>
</div></div>`).join('');
}

function switchRutinaTab(tab){
  const esEnt = tab === 'entrenamiento';
  document.getElementById('panel-entrenamiento').style.display = esEnt ? 'block' : 'none';
  document.getElementById('panel-alimentacion').style.display = esEnt ? 'none' : 'block';
  document.getElementById('tab-entrenamiento').style.background = esEnt ? 'var(--rojo)' : 'transparent';
  document.getElementById('tab-entrenamiento').style.color = esEnt ? '#fff' : '#666';
  document.getElementById('tab-alimentacion').style.background = esEnt ? 'transparent' : 'var(--rojo)';
  document.getElementById('tab-alimentacion').style.color = esEnt ? '#666' : '#fff';
  document.getElementById('btns-rutina').style.display = esEnt ? 'flex' : 'none';
  if(!esEnt) mostrarRecomendacionesMacros();
}
async function abrirRutina(id,nombre){
window._clienteActual=id;
window.clienteMedidasId=id;
document.getElementById('rutina-cliente-id').value=id;
document.getElementById('rutina-titulo').textContent='📋 '+nombre;
const res=await fetch('/api/rutinas/'+id);
rutinaActual=await res.json();
diaSeleccionado='lunes';
renderDiasTabs();renderRutinaForm();
switchRutinaTab('entrenamiento');
document.getElementById('modal-rutina').classList.add('open');
cargarAlimentacion(id);
}

async function cargarAlimentacion(id){
  try {
    const r = await fetch('/api/alimentacion/'+id);
    if(!r.ok) return;
    const d = await r.json();
    if(!d) return;
    if(d.peso_actual)   document.getElementById('ali-peso-actual').value   = d.peso_actual;
    if(d.peso_objetivo) document.getElementById('ali-peso-objetivo').value = d.peso_objetivo;
    if(d.proteina)      document.getElementById('ali-proteina').value      = d.proteina;
    if(d.carbos)        document.getElementById('ali-carbos').value        = d.carbos;
    if(d.grasas)        document.getElementById('ali-grasas').value        = d.grasas;
    if(d.comidas)       document.getElementById('ali-comidas').value       = d.comidas;
    if(d.pretreno){
      document.getElementById('ali-pretreno-check').checked = true;
      document.getElementById('ali-pretreno-pos').style.display = 'block';
      if(d.pretreno_pos) document.getElementById('ali-pretreno-pos').value = d.pretreno_pos;
    }
    if(d.nivel_eco) selectEco(d.nivel_eco);
    // Cargar objetivo desde perfil del usuario
    try {
      const ru = await fetch('/api/usuarios/' + id);
      const du = await ru.json();
      const etiqueta = du && du.perfil ? du.perfil.etiqueta : '';
      const selObj = document.getElementById('ali-objetivo');
      if(selObj && etiqueta) selObj.value = etiqueta;
    } catch(e) {}
    mostrarRecomendacionesMacros();
    if(d.medico)   d.medico.forEach(item   => { const el = [...document.querySelectorAll('#chips-medico button')].find(b=>b.textContent===item);   if(el) toggleChip(el,'medico',item); });
    if(d.vida)     d.vida.forEach(item     => { const el = [...document.querySelectorAll('#chips-vida button')].find(b=>b.textContent===item);     if(el) toggleChip(el,'vida',item); });
    if(d.alergias) d.alergias.forEach(item => { const el = [...document.querySelectorAll('#chips-alergia button')].find(b=>b.textContent===item); if(el) toggleChip(el,'alergia',item); });
    calcularMacros();
  } catch(e) { console.log('Sin datos de alimentación aún'); }
}

function renderDiasTabs(){
document.getElementById('dias-tabs').innerHTML=DIAS.map(d=>
`<button class="${d===diaSeleccionado?'active':''}" onclick="seleccionarDia('${d}')">${d.charAt(0).toUpperCase()+d.slice(1)}</button>`
).join('');
}

function seleccionarDia(dia){
const rec=document.getElementById('rec-'+diaSeleccionado);
const rut=document.getElementById('rut-'+diaSeleccionado);
if(rec){if(!rutinaActual[diaSeleccionado])rutinaActual[diaSeleccionado]={};rutinaActual[diaSeleccionado].recordatorio=rec.value;if(rut)rutinaActual[diaSeleccionado].rutina=rut.value;}
guardarEjsActuales();diaSeleccionado=dia;renderDiasTabs();renderRutinaForm();
}

function renderRutinaForm(){
const d=rutinaActual[diaSeleccionado]||{recordatorio:'',rutina:'',ejercicios:[]};
const cardios=Array.isArray(d.cardio)&&d.cardio.length>0?d.cardio:[];
setTimeout(()=>{
  if(cardios.length>0){
    const p=document.getElementById('panel-cardio');
    if(p) p.style.display='block';
  }
  renderCardios(cardios);
},50);
const ejs=d.ejercicios||[];
let h='';
ejs.forEach((e,i)=>{h+=`<div id="rut-drag-ej-${i}" draggable="true" ondragstart="rutDragStart(event,${i},'ej')" ondragover="rutDragOver(event,${i},'ej')" ondrop="rutDrop(event,${i},'ej')" ondragend="rutDragEnd(event)" style="background:var(--fondo);border:1px solid #222;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab"><div style="display:flex;gap:6px;margin-bottom:6px"><span ontouchstart="rutTouchStart(event,${i},'ej')" ontouchmove="rutTouchMove(event)" ontouchend="rutTouchEnd(event)" style="color:var(--texto-tenue);font-size:16px;padding:6px 4px;cursor:grab;touch-action:none">☰</span><input type="text" value="${e.nombre||''}" placeholder="Ejercicio" id="ej-${i}-n" style="flex:1;background:var(--card);border:1px solid #333;border-radius:6px;padding:8px;color:var(--texto);font-size:13px;outline:none"><button onclick="eliminarEjercicio(${i})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:6px 10px;cursor:pointer">🗑️</button></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">${[['series','S','4'],['reps','Reps','8-10'],['rir','RIR','1-2'],['desc','DESC','60s'],['var','VAR','V1']].map(([f,label,ph])=>`<div><div style="font-size:9px;color:var(--texto-secundario);text-align:center;margin-bottom:2px">${label}</div><input type="text" id="ej-${i}-${f}" value="${e[f]||''}" placeholder="${ph}" style="width:100%;background:var(--card);border:1px solid #333;border-radius:6px;padding:6px;color:var(--texto);font-size:12px;text-align:center;outline:none"></div>`).join('')}</div></div>`;});
document.getElementById('rutina-form').innerHTML=`<div class="ig"><label>🏷️ Título</label><textarea id="rec-${diaSeleccionado}" placeholder="Escribe el título del dia...">${d.recordatorio||''}</textarea></div><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">📋 Ejercicios</div><div id="lista-ejs">${h}</div><button onclick="agregarEjercicio()" style="width:100%;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar ejercicio</button><div style="margin-top:10px"><button onclick="toggleCardio()" style="width:100%;background:var(--fondo);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer">🏃 Cardio</button><div id="panel-cardio" style="display:none;background:var(--fondo);border:1px solid #222;border-radius:8px;padding:10px;margin-top:6px"><div style="font-size:10px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:8px">🏃 CARDIO</div><div id="lista-cardio"></div><button onclick="agregarCardio()" style="width:100%;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px">➕ Agregar momento de cardio</button></div></div><div style="margin-top:10px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700">📝 Notas</div><button id="chip-presencial" onclick="togglePresencial()" style="padding:5px 12px;border-radius:20px;border:1px solid #333;background:${d.presencial?'#e31e24':'#1a1a1a'};color:${d.presencial?'#fff':'#666'};font-size:10px;font-weight:700;cursor:pointer">🏟️ Presencial</button></div><textarea id="rut-${diaSeleccionado}" placeholder="Notas adicionales..." style="width:100%;background:var(--card);border:1px solid #333;border-radius:8px;padding:10px;color:var(--texto);font-size:13px;outline:none;min-height:80px">${d.rutina||''}</textarea></div>`;
}

function guardarEjsActuales(){
const dia=diaSeleccionado;
if(!rutinaActual[dia])rutinaActual[dia]={recordatorio:'',rutina:'',ejercicios:[]};
const recEl=document.getElementById('rec-'+dia);
const rutEl=document.getElementById('rut-'+dia);
if(recEl)rutinaActual[dia].recordatorio=recEl.value;
if(rutEl)rutinaActual[dia].rutina=rutEl.value;
const lista=document.getElementById('lista-ejs');
if(!lista)return;
const n=lista.querySelectorAll('[id$="-n"]').length;
const ejs=[];
for(let i=0;i<n;i++){
ejs.push({
nombre:document.getElementById('ej-'+i+'-n')?.value||'',
series:document.getElementById('ej-'+i+'-series')?.value||'',
reps:document.getElementById('ej-'+i+'-reps')?.value||'',
rir:document.getElementById('ej-'+i+'-rir')?.value||'',
desc:document.getElementById('ej-'+i+'-desc')?.value||'',
var:document.getElementById('ej-'+i+'-var')?.value||''
});
}
rutinaActual[dia].ejercicios=ejs;
  const listaCardio=document.getElementById('lista-cardio');
  if(listaCardio){
    const n=listaCardio.querySelectorAll('[id$="-cm"]').length;
    const cardios=[];
    for(let i=0;i<n;i++){
      cardios.push({
        momento:document.getElementById('c-'+i+'-cm')?.value||'',
        ejercicio:document.getElementById('c-'+i+'-ce')?.value||'',
        tiempo:document.getElementById('c-'+i+'-ct')?.value||'',
        notas:document.getElementById('c-'+i+'-cn')?.value||''
      });
    }
    rutinaActual[dia].cardio=cardios;
  }
}

function agregarEjercicio(){
guardarEjsActuales();
const dia=diaSeleccionado;
if(!rutinaActual[dia].ejercicios)rutinaActual[dia].ejercicios=[];
rutinaActual[dia].ejercicios.push({nombre:'',series:'',reps:'',rir:'',desc:'',var:''});
renderRutinaForm();
}

function eliminarEjercicio(idx){
guardarEjsActuales();
rutinaActual[diaSeleccionado].ejercicios.splice(idx,1);
renderRutinaForm();
}
function toggleCardio(){
  guardarEjsActuales();
  const p=document.getElementById('panel-cardio');
  p.style.display=p.style.display==='none'?'block':'none';
}
function renderCardios(arr){
  const lista=document.getElementById('lista-cardio');
  if(!lista)return;
  lista.innerHTML=arr.map((c,i)=>`<div id="rut-drag-cardio-${i}" draggable="true" ondragstart="rutDragStart(event,${i},'cardio')" ondragover="rutDragOver(event,${i},'cardio')" ondrop="rutDrop(event,${i},'cardio')" ondragend="rutDragEnd(event)" style="background:var(--card);border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin-bottom:6px;cursor:grab"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span ontouchstart="rutTouchStart(event,${i},'cardio')" ontouchmove="rutTouchMove(event)" ontouchend="rutTouchEnd(event)" style="font-size:16px;color:var(--texto-tenue);cursor:grab;touch-action:none">☰</span><span style="font-size:11px;color:#e31e24;font-weight:700">MOMENTO ${i+1}</span><button onclick="eliminarCardio(${i})" style="background:#3a0000;color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:12px">🗑️</button></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Momento</div><input type="text" id="c-${i}-cm" value="${c.momento||''}" placeholder="Ej: Calentamiento, Final..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Ejercicio</div><input type="text" id="c-${i}-ce" value="${c.ejercicio||''}" placeholder="Ej: Bici, Elíptica..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div style="margin-bottom:6px"><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Tiempo (min)</div><input type="number" id="c-${i}-ct" value="${c.tiempo||''}" placeholder="Ej: 20" style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;box-sizing:border-box"></div><div><div style="font-size:10px;color:var(--texto-medio);margin-bottom:3px">Notas</div><textarea id="c-${i}-cn" placeholder="Observaciones..." style="width:100%;background:var(--fondo);border:1px solid #333;border-radius:6px;padding:7px;color:var(--texto);font-size:13px;outline:none;min-height:55px;box-sizing:border-box">${c.notas||''}</textarea></div></div>`).join('');
}
function agregarCardio(){
  guardarEjsActuales();
  const dia=diaSeleccionado;
  if(!Array.isArray(rutinaActual[dia].cardio)) rutinaActual[dia].cardio=[];
  rutinaActual[dia].cardio.push({momento:'',ejercicio:'',tiempo:'',notas:''});
  renderCardios(rutinaActual[dia].cardio);
  const p=document.getElementById('panel-cardio');
  if(p) p.style.display='block';
}
function eliminarCardio(idx){
  guardarEjsActuales();
  if(Array.isArray(rutinaActual[diaSeleccionado].cardio)){
    rutinaActual[diaSeleccionado].cardio.splice(idx,1);
    renderCardios(rutinaActual[diaSeleccionado].cardio);
  }
}

function cerrarModalRutina(){guardarEjsActuales();document.getElementById('modal-rutina').classList.remove('open');}

function togglePresencial(){
  const dia = diaSeleccionado;
  if(!rutinaActual[dia]) rutinaActual[dia]={recordatorio:'',rutina:'',ejercicios:[]};
  rutinaActual[dia].presencial = !rutinaActual[dia].presencial;
  const chip = document.getElementById('chip-presencial');
  if(chip){
    chip.style.background = rutinaActual[dia].presencial ? '#e31e24' : '#1a1a1a';
    chip.style.color = rutinaActual[dia].presencial ? '#fff' : '#666';
    chip.style.borderColor = rutinaActual[dia].presencial ? '#e31e24' : '#333';
  }
}
async function guardarRutina(){
guardarEjsActuales();
const rec=document.getElementById('rec-'+diaSeleccionado);
const rut=document.getElementById('rut-'+diaSeleccionado);
if(rec)rutinaActual[diaSeleccionado]={...rutinaActual[diaSeleccionado],recordatorio:rec.value,rutina:rut?.value||''};
const id=document.getElementById('rutina-cliente-id').value;
await fetch('/api/rutinas/'+id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rutinaActual)});
toast('✅ Rutina guardada');cerrarModalRutina();
}

async function cargarFestivos(){
const res=await fetch('/api/festivos');
const festivos=await res.json();
document.getElementById('lista-festivos').innerHTML=festivos.length?festivos.map(f=>`
<div class="fi">
<div><div style="font-weight:700">${f.nombre}</div>
<div style="font-size:12px;color:var(--texto-secundario)">${f.fecha}</div></div>
<button class="btn bp" style="padding:6px 12px;font-size:12px" onclick="eliminarFestivo('${f.fecha}')">🗑️</button>
</div>`).join(''):'<p style="color:var(--texto-secundario);text-align:center;padding:20px">No hay festivos</p>';
}

async function agregarFestivo(){
const fecha=document.getElementById('festivo-fecha').value;
const nombre=document.getElementById('festivo-nombre').value.trim();
if(!fecha||!nombre){toast('Completa los campos',false);return;}
await fetch('/api/festivos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fecha,nombre})});
document.getElementById('festivo-fecha').value='';
document.getElementById('festivo-nombre').value='';
toast('✅ Festivo agregado');cargarFestivos();
}

async function eliminarFestivo(fecha){
await fetch('/api/festivos/'+fecha,{method:'DELETE'});
toast('🗑️ Eliminado');cargarFestivos();
}

function showHerramienta(nombre){
  document.getElementById('herramienta-panel').style.display='block';
  document.querySelector('#page-logs .st').style.display='none';
  document.querySelector('#page-logs .st').nextElementSibling.style.display='none';
  const c=document.getElementById('herramienta-contenido');
  if(nombre==='enciclopedia') renderEnciclopedia(c);
  else if(nombre==='cronometros') renderCronometros(c);
  else if(nombre==='temporizadores') renderTemporizadores(c);
  else if(nombre==='hiit') renderHiit(c);
  else if(nombre==='calculadoras') renderCalculadoras(c);
  else if(nombre==='sonidos') renderSonidos(c);
  else if(nombre==='competencias') renderCompetencias(c);
  else if(nombre==='ruleta') renderRuleta(c);
  else if(nombre==='juegos') renderJuegos(c);
  else c.innerHTML='<p style="color:var(--texto-secundario);text-align:center;padding:40px">🚧 Próximamente: '+nombre+'</p>';
}

// ═══════════════════════════════════════════
// 🎮 JUEGOS
// ═══════════════════════════════════════════
function bloquearSwipe() {
  document.body.setAttribute('data-swipe-bloqueado','1');
}
function desbloquearSwipe() {
  document.body.removeAttribute('data-swipe-bloqueado');
}
function _swipeBlockFn(e) {
  if(document.body.getAttribute('data-swipe-bloqueado')==='1') e.preventDefault();
}

function renderJuegos(c) {
  desbloquearSwipe();
  c.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:#e31e24;text-transform:uppercase;margin-bottom:12px">🎮 Juegos</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="card" onclick="renderTriqui(document.getElementById('herramienta-contenido'))" style="cursor:pointer;text-align:center;padding:16px 10px">
          <div style="font-size:28px;margin-bottom:6px">✕○</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">Triqui</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">2 jugadores</div>
        </div>
        <div class="card" onclick="renderSnake(document.getElementById('herramienta-contenido'))" style="cursor:pointer;text-align:center;padding:16px 10px">
          <div style="font-size:28px;margin-bottom:6px">🐍</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">Snake</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">Esquiva y crece</div>
        </div>
        <div class="card" onclick="renderMemoria(document.getElementById('herramienta-contenido'))" style="cursor:pointer;text-align:center;padding:16px 10px">
          <div style="font-size:28px;margin-bottom:6px">🧠</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">Memoria</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">Encuentra los pares</div>
        </div>
        <div class="card" onclick="renderHockey(document.getElementById('herramienta-contenido'))" style="cursor:pointer;text-align:center;padding:16px 10px">
          <div style="font-size:28px;margin-bottom:6px">🏒</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">DT Hockey</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">2 jugadores</div>
        </div>
        </div>
        <div class="card" onclick="(localStorage.getItem('dt_rol')==='cliente'&&!tcEsPremium())?tcMostrarPremium():renderInvaders(document.getElementById('herramienta-contenido'))" style="cursor:pointer;text-align:center;padding:16px 10px;grid-column:1/-1">
          <div style="font-size:28px;margin-bottom:6px">👾</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">DT Invaders ⭐</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">100 niveles — Derrota al Sedentario Supremo</div>
        </div>
      </div>
    </div>`;
}

function renderHockey(c) {
  bloquearSwipe();
  c.innerHTML = `
    <button onclick="renderJuegos(document.getElementById('herramienta-contenido'))" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:10px">← Juegos</button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="text-align:center;flex:1">
        <div id="hk-score1" style="font-size:32px;font-weight:700;color:#3b82f6">0</div>
        <div style="font-size:10px;color:var(--texto-secundario)">JUGADOR 1</div>
      </div>
      <div style="font-size:12px;color:var(--texto-secundario)">VS</div>
      <div style="text-align:center;flex:1">
        <div id="hk-score2" style="font-size:32px;font-weight:700;color:#e31e24">0</div>
        <div style="font-size:10px;color:var(--texto-secundario)">JUGADOR 2</div>
      </div>
    </div>
    <canvas id="hk-canvas" style="width:100%;border-radius:12px;display:block;background:#111;border:1px solid #333;touch-action:none"></canvas>
    <div style="text-align:center;margin-top:10px">
      <button onclick="hkReset()" style="background:var(--gris);color:var(--texto);border:none;border-radius:8px;padding:8px 20px;font-size:12px;cursor:pointer">🔄 Reiniciar</button>
    </div>`;
  hkInit();
}

var _hk = {};

function hkInit() {
  var canvas = document.getElementById('hk-canvas');
  if (!canvas) return;
  var W = canvas.offsetWidth;
  var H = Math.round(W * 1.7);
  canvas.width = W;
  canvas.height = H;
  var R = W * 0.07;
  _hk = {
    W: W, H: H, R: R,
    puck: { x: W/2, y: H/2, r: W*0.055, vx: 3, vy: 4 },
    p1: { x: W/2, y: H*0.82, r: R, color: '#3b82f6' },
    p2: { x: W/2, y: H*0.18, r: R, color: '#e31e24' },
    score: [0, 0],
    activo: true,
    goalH: W*0.3,
    postR: W*0.025
  };
  canvas.ontouchstart = hkTouch;
  canvas.ontouchmove = hkTouch;
  hkLoop();
}

function hkTouch(e) {
  e.preventDefault();
  var canvas = document.getElementById('hk-canvas');
  var rect = canvas.getBoundingClientRect();
  var scaleX = _hk.W / rect.width;
  var scaleY = _hk.H / rect.height;
  for (var i = 0; i < e.touches.length; i++) {
    var t = e.touches[i];
    var tx = (t.clientX - rect.left) * scaleX;
    var ty = (t.clientY - rect.top) * scaleY;
    if (ty > _hk.H * 0.5) {
      _hk.p1.x = Math.max(_hk.R, Math.min(_hk.W - _hk.R, tx));
      _hk.p1.y = Math.max(_hk.H * 0.55, Math.min(_hk.H - _hk.R, ty));
    } else {
      _hk.p2.x = Math.max(_hk.R, Math.min(_hk.W - _hk.R, tx));
      _hk.p2.y = Math.max(_hk.R, Math.min(_hk.H * 0.45, ty));
    }
  }
}

function hkLoop() {
  if (!document.getElementById('hk-canvas')) return;
  if (!_hk.activo) return;
  hkUpdate();
  hkDraw();
  requestAnimationFrame(hkLoop);
}

function hkUpdate() {
  var p = _hk.puck;
  p.x += p.vx;
  p.y += p.vy;
  if (p.x - p.r < 0) { p.x = p.r; p.vx = Math.abs(p.vx); }
  if (p.x + p.r > _hk.W) { p.x = _hk.W - p.r; p.vx = -Math.abs(p.vx); }
  // Gol arriba (jugador 2 recibe gol)
  if (p.y - p.r < 0) {
    var gx = _hk.W/2 - _hk.goalH/2;
    if (p.x > gx && p.x < gx + _hk.goalH) {
      _hk.score[0]++;
      document.getElementById('hk-score1').textContent = _hk.score[0];
      hkResetPuck(1);
    } else { p.y = p.r; p.vy = Math.abs(p.vy); }
    return;
  }
  // Gol abajo (jugador 1 recibe gol)
  if (p.y + p.r > _hk.H) {
    var gx = _hk.W/2 - _hk.goalH/2;
    if (p.x > gx && p.x < gx + _hk.goalH) {
      _hk.score[1]++;
      document.getElementById('hk-score2').textContent = _hk.score[1];
      hkResetPuck(-1);
    } else { p.y = _hk.H - p.r; p.vy = -Math.abs(p.vy); }
    return;
  }
  hkColision(_hk.p1);
  hkColision(_hk.p2);
}

function hkColision(player) {
  var p = _hk.puck;
  var dx = p.x - player.x;
  var dy = p.y - player.y;
  var dist = Math.sqrt(dx*dx + dy*dy);
  var minDist = p.r + player.r;
  if (dist < minDist && dist > 0) {
    var nx = dx/dist;
    var ny = dy/dist;
    var speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
    speed = Math.min(speed * 1.05, 14);
    p.vx = nx * speed;
    p.vy = ny * speed;
    p.x = player.x + nx * (minDist + 1);
    p.y = player.y + ny * (minDist + 1);
  }
}

function hkResetPuck(dir) {
  _hk.puck = { x: _hk.W/2, y: _hk.H/2, r: _hk.W*0.055, vx: (Math.random()-0.5)*6, vy: dir*4 };
}

function hkReset() {
  _hk.score = [0,0];
  document.getElementById('hk-score1').textContent = '0';
  document.getElementById('hk-score2').textContent = '0';
  hkResetPuck(1);
}

function hkDraw() {
  var canvas = document.getElementById('hk-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = _hk.W, H = _hk.H;
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, W, H);
  // Línea central
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.setLineDash([8,6]);
  ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
  ctx.setLineDash([]);
  // Círculo central
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(W/2, H/2, W*0.12, 0, Math.PI*2); ctx.stroke();
  // Porterías
  var gx = W/2 - _hk.goalH/2;
  ctx.strokeStyle = '#e31e24';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx + _hk.goalH, 0); ctx.stroke();
  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath(); ctx.moveTo(gx, H); ctx.lineTo(gx + _hk.goalH, H); ctx.stroke();
  // Disco gym (puck)
  var p = _hk.puck;
  ctx.fillStyle = '#888';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#555';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r*0.55, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#666';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r*0.2, 0, Math.PI*2); ctx.fill();
  // Jugadores
  [_hk.p1, _hk.p2].forEach(function(pl) {
    ctx.fillStyle = pl.color;
    ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI*2); ctx.stroke();
  });
}

function renderInvaders(c) {
  bloquearSwipe();
  if(_inv.loop) cancelAnimationFrame(_inv.loop);
  var reps = parseInt(localStorage.getItem('inv_monedas')||0);
  var nivelGuardado = parseInt(localStorage.getItem('inv_nivel')||1);
  var scoreGuardado = parseInt(localStorage.getItem('inv_score')||0);
  var mejor = parseInt(localStorage.getItem('inv_mejor')||0);
  c.innerHTML = `
    <button onclick="desbloquearSwipe();renderJuegos(document.getElementById('herramienta-contenido'));invStop();" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:12px">← Juegos</button>
    <div style="text-align:center;padding:16px 0 8px">
      <div style="font-size:28px;font-weight:900;color:#e31e24;letter-spacing:2px;text-shadow:0 0 20px #e31e2488">DT INVADERS</div>
      <div style="font-size:11px;color:#666;margin-top:4px;letter-spacing:1px">DERROTA AL SEDENTARIO SUPREMO</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0">
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:18px;font-weight:700;color:#e31e24">${nivelGuardado}</div>
        <div style="font-size:10px;color:#666;margin-top:2px">NIVEL</div>
      </div>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:18px;font-weight:700;color:#f59e0b">${reps} 💪</div>
        <div style="font-size:10px;color:#666;margin-top:2px">REPS</div>
      </div>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:18px;font-weight:700;color:#22c55e">${mejor}</div>
        <div style="font-size:10px;color:#666;margin-top:2px">MEJOR</div>
      </div>
    </div>
    <div style="background:#1a1a1a;border:1px solid #222;border-radius:12px;padding:12px;margin-bottom:16px">
      <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Mundo actual</div>
      <div id="inv-mundo-label" style="font-size:13px;font-weight:700;color:#e31e24"></div>
      <div style="display:flex;gap:4px;margin-top:8px">
        ${[1,2,3,4,5].map((m,i) => '<div style="flex:1;height:4px;border-radius:2px;background:'+(nivelGuardado>(i*20)?'#e31e24':'#333')+'"></div>').join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:#444;margin-top:4px">
        <span>Gym</span><span>Calle</span><span>Fast Food</span><span>Vicios</span><span>Final</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <button onclick="invIrTienda()" style="background:#1a1a1a;color:#f59e0b;border:1px solid #f59e0b;border-radius:10px;padding:14px;font-size:13px;font-weight:700;cursor:pointer">🏪 Tienda</button>
      <button onclick="invIrNiveles()" style="background:#1a1a1a;color:#3b82f6;border:1px solid #3b82f6;border-radius:10px;padding:14px;font-size:13px;font-weight:700;cursor:pointer">🗺️ Niveles</button>
    </div>
    <button onclick="invEmpezar()" style="width:100%;background:#e31e24;color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;letter-spacing:2px">▶ JUGAR — NIVEL ${nivelGuardado}</button>
    <div id="inv-contenido"></div>`;
  var mundo = Math.min(4, Math.floor((nivelGuardado-1)/20));
  var mundos = ['🏋️ Gym Novato','🚶 Calle','🍔 Fast Food','🥃 Vicios Avanzados','👹 Jefe Final'];
  var ml = document.getElementById('inv-mundo-label');
  if(ml) ml.textContent = mundos[mundo];
}

function invIrNiveles() {
  var c = document.getElementById('inv-contenido');
  if(!c) return;
  var nivelActual = parseInt(localStorage.getItem('inv_nivel')||1);
  var mundos = [
    {nombre:'Gym Novato', color:'#e31e24', desde:1, hasta:20},
    {nombre:'Calle', color:'#f59e0b', desde:21, hasta:40},
    {nombre:'Fast Food', color:'#22c55e', desde:41, hasta:60},
    {nombre:'Vicios', color:'#a855f7', desde:61, hasta:80},
    {nombre:'Jefe Final', color:'#fff', desde:81, hasta:100}
  ];
  var div = document.createElement('div');
  div.style.marginTop = '12px';

  var btnVolver = document.createElement('button');
  btnVolver.textContent = '← Inicio';
  btnVolver.style.cssText = 'background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:12px';
  btnVolver.onclick = function(){ c.innerHTML=''; };
  div.appendChild(btnVolver);

  mundos.forEach(function(m) {
    var sec = document.createElement('div');
    sec.style.marginBottom = '16px';
    var titulo = document.createElement('div');
    titulo.style.cssText = 'font-size:12px;font-weight:700;color:'+m.color+';margin-bottom:8px;display:flex;justify-content:space-between';
    titulo.innerHTML = '<span>'+m.nombre+'</span><span style="color:#555;font-weight:400">'+m.desde+'-'+m.hasta+'</span>';
    sec.appendChild(titulo);
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px';
    for(var n=m.desde; n<=m.hasta; n++) {
      var desbloqueado = n <= nivelActual;
      var esActual = n === nivelActual;
      var esJefe = n % 10 === 0;
      var celda = document.createElement('div');
      celda.style.cssText = 'background:'+(esActual?m.color:'#1a1a1a')+';border:1px solid '+(esActual?m.color:desbloqueado?'#333':'#1a1a1a')+';border-radius:8px;padding:6px 2px;text-align:center;cursor:'+(desbloqueado?'pointer':'default');
      celda.innerHTML = '<div style="font-size:14px">'+(esJefe?'👹':desbloqueado?'✅':'🔒')+'</div><div style="font-size:10px;color:'+(esActual?'#fff':desbloqueado?'#aaa':'#333')+';font-weight:'+(esActual?'700':'400')+'">'+n+'</div>';
      if(desbloqueado) {
        (function(nivel){ celda.onclick = function(){ invJugarNivel(nivel); }; })(n);
      }
      grid.appendChild(celda);
    }
    sec.appendChild(grid);
    div.appendChild(sec);
  });
  c.innerHTML = '';
  c.appendChild(div);
}

function invJugarNivel(n) {
  localStorage.setItem('inv_nivel', n);
  invEmpezar();
}

function invIrTienda(pestana) {
  pestana = pestana || 'upgrades';
  var c = document.getElementById('inv-contenido');
  if(!c) return;
  var reps = parseInt(localStorage.getItem('inv_monedas')||0);
  var upgrades = JSON.parse(localStorage.getItem('inv_upgrades')||'{}');
  var skins = JSON.parse(localStorage.getItem('inv_skins')||'{}');

  var div = document.createElement('div');
  div.style.marginTop = '12px';

  // Botón volver
  var btnV = document.createElement('button');
  btnV.textContent = '← Inicio';
  btnV.style.cssText = 'background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:12px';
  btnV.onclick = function(){ c.innerHTML=''; };
  div.appendChild(btnV);

  // Header reps
  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px';
  hdr.innerHTML = '<div style="font-size:15px;font-weight:700;color:#f59e0b">🏪 Tienda</div><div style="font-size:13px;color:#f59e0b;font-weight:700" id="inv-tienda-reps">'+reps+' 💪</div>';
  div.appendChild(hdr);

  // Pestañas
  var tabs = document.createElement('div');
  tabs.style.cssText = 'display:flex;gap:6px;margin-bottom:14px';
  ['upgrades','disparos','naves'].forEach(function(tab){
    var t = document.createElement('button');
    t.textContent = tab==='upgrades'?'⚔️ Mejoras':tab==='disparos'?'💥 Disparos':'🚀 Naves';
    t.style.cssText = 'flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;background:'+(pestana===tab?'#e31e24':'#1a1a1a')+';color:'+(pestana===tab?'#fff':'#666');
    t.onclick = (function(tb){ return function(){ invIrTienda(tb); }; })(tab);
    tabs.appendChild(t);
  });
  div.appendChild(tabs);

  var contenido = document.createElement('div');

  if(pestana === 'upgrades') {
    // UPGRADES PROGRESIVOS
    var progresivos = [
      {key:'disparo_vel', emoji:'⚡', nombre:'Velocidad disparo', desc:'Dispara más rápido', costo:40, max:5},
      {key:'vida_max', emoji:'❤️', nombre:'Vida máxima', desc:'+1 vida al iniciar nivel', costo:50, max:5},
      {key:'escudo', emoji:'🛡️', nombre:'Escudo pasivo', desc:'Cooldown menor entre escudos', costo:60, max:5},
      {key:'cobertura', emoji:'🧱', nombre:'Coberturas', desc:'+1 cobertura y +1 vida por cobertura', costo:45, max:5}
    ];
    var unicos = [
      {key:'doble_disparo', emoji:'👐', nombre:'Doble disparo', desc:'Dispara por ambas manos siempre', costo:300},
      {key:'barra_especial', emoji:'🏋️', nombre:'Barra 100kg', desc:'Poder especial — carga matando enemigos', costo:500}
    ];

    var sep1 = document.createElement('div');
    sep1.style.cssText = 'font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px';
    sep1.textContent = 'Mejoras progresivas';
    contenido.appendChild(sep1);

    progresivos.forEach(function(item){
      var nv = upgrades[item.key]||0;
      var costo = item.costo + nv*25;
      var puede = reps >= costo && nv < item.max;
      var fila = invCrearFilaTienda(item.emoji, item.nombre, item.desc, nv, item.max, costo, puede, item.key, false);
      contenido.appendChild(fila);
    });

    var sep2 = document.createElement('div');
    sep2.style.cssText = 'font-size:10px;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;margin:12px 0 8px';
    sep2.textContent = '⭐ Compra única';
    contenido.appendChild(sep2);

    unicos.forEach(function(item){
      var comprado = upgrades[item.key] >= 1;
      var puede = reps >= item.costo && !comprado;
      var fila = invCrearFilaTienda(item.emoji, item.nombre, item.desc, comprado?1:0, 1, item.costo, puede, item.key, true);
      contenido.appendChild(fila);
    });

  } else if(pestana === 'disparos') {
    var skinsDisp = [
      {key:'disp_rojo', emoji:'🔴', nombre:'Mancuerna Roja', desc:'Disparo clásico', costo:0},
      {key:'disp_verde', emoji:'🟢', nombre:'Mancuerna Verde', desc:'Disparo energético', costo:50},
      {key:'disp_azul', emoji:'🔵', nombre:'Mancuerna Azul', desc:'Disparo helado', costo:100},
      {key:'disp_rayo', emoji:'⚡', nombre:'Rayo Eléctrico', desc:'Disparo eléctrico', costo:200},
      {key:'disp_fuego', emoji:'🔥', nombre:'Llama de Fuego', desc:'Disparo ardiente', costo:300},
      {key:'disp_dorado', emoji:'⭐', nombre:'Mancuerna Dorada', desc:'Disparo élite', costo:500}
    ];
    var skinActiva = skins.disparo || 'disp_rojo';
    skinsDisp.forEach(function(sk){
      var comprado = sk.costo===0 || skins[sk.key];
      var activa = skinActiva === sk.key;
      var puede = reps >= sk.costo && !comprado;
      var fila = document.createElement('div');
      fila.style.cssText = 'background:'+(activa?'#1a0000':'#1a1a1a')+';border:1px solid '+(activa?'#e31e24':'#2a2a2a')+';border-radius:10px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px';
      var em = document.createElement('div');
      em.style.fontSize='24px'; em.textContent=sk.emoji;
      var inf = document.createElement('div');
      inf.style.flex='1';
      inf.innerHTML='<div style="font-size:13px;font-weight:700;color:#fff">'+sk.nombre+'</div><div style="font-size:10px;color:#666">'+sk.desc+'</div>';
      fila.appendChild(em); fila.appendChild(inf);
      if(activa){
        var act=document.createElement('div');
        act.style.cssText='font-size:10px;color:#e31e24;font-weight:700';
        act.textContent='ACTIVO'; fila.appendChild(act);
      } else if(comprado){
        var btn=document.createElement('button');
        btn.style.cssText='background:#333;color:#fff;border:none;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer';
        btn.textContent='Usar';
        (function(k){ btn.onclick=function(){ skins.disparo=k; localStorage.setItem('inv_skins',JSON.stringify(skins)); invIrTienda('disparos'); }; })(sk.key);
        fila.appendChild(btn);
      } else {
        var btn2=document.createElement('button');
        btn2.style.cssText='background:'+(puede?'#e31e24':'#2a2a2a')+';color:'+(puede?'#fff':'#555')+';border:none;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:'+(puede?'pointer':'not-allowed');
        btn2.textContent=sk.costo+' 💪';
        if(puede)(function(k,co){ btn2.onclick=function(){ var r=parseInt(localStorage.getItem('inv_monedas')||0); if(r<co)return; r-=co; localStorage.setItem('inv_monedas',r); skins[k]=true; skins.disparo=k; localStorage.setItem('inv_skins',JSON.stringify(skins)); invIrTienda('disparos'); }; })(sk.key,sk.costo);
        fila.appendChild(btn2);
      }
      contenido.appendChild(fila);
    });

  } else if(pestana === 'naves') {
    var skinsNave = [
      {key:'nave_m', emoji:'🏋️', nombre:'Entrenador', desc:'La nave original', costo:0, img:'Entrenador1.png'},
      {key:'nave_f', emoji:'🏋️‍♀️', nombre:'Entrenadora', desc:'Versión femenina', costo:150},
      {key:'nave_box', emoji:'🥊', nombre:'Boxeador DT', desc:'Estilo boxeo', costo:300},
      {key:'nave_elite', emoji:'⚡', nombre:'DT Élite', desc:'Versión definitiva', costo:1000}
    ];
    var naveActiva = skins.nave || 'nave_m';
    skinsNave.forEach(function(sk){
      var comprado = sk.costo===0 || skins[sk.key];
      var activa = naveActiva === sk.key;
      var puede = reps >= sk.costo && !comprado;
      var fila = document.createElement('div');
      fila.style.cssText = 'background:'+(activa?'#1a0000':'#1a1a1a')+';border:1px solid '+(activa?'#e31e24':'#2a2a2a')+';border-radius:10px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px';
      var em=document.createElement('div'); em.style.fontSize='24px'; em.textContent=sk.emoji;
      var inf=document.createElement('div'); inf.style.flex='1';
      inf.innerHTML='<div style="font-size:13px;font-weight:700;color:#fff">'+sk.nombre+'</div><div style="font-size:10px;color:#666">'+sk.desc+'</div>';
      fila.appendChild(em); fila.appendChild(inf);
      if(activa){
        var act=document.createElement('div'); act.style.cssText='font-size:10px;color:#e31e24;font-weight:700'; act.textContent='ACTIVO'; fila.appendChild(act);
      } else if(comprado){
        var btn=document.createElement('button');
        btn.style.cssText='background:#333;color:#fff;border:none;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer';
        btn.textContent='Usar';
        (function(k){ btn.onclick=function(){ skins.nave=k; localStorage.setItem('inv_skins',JSON.stringify(skins)); invIrTienda('naves'); }; })(sk.key);
        fila.appendChild(btn);
      } else {
        var btn2=document.createElement('button');
        btn2.style.cssText='background:'+(puede?'#e31e24':'#2a2a2a')+';color:'+(puede?'#fff':'#555')+';border:none;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:'+(puede?'pointer':'not-allowed');
        btn2.textContent=sk.costo+' 💪';
        if(puede)(function(k,co){ btn2.onclick=function(){ var r=parseInt(localStorage.getItem('inv_monedas')||0); if(r<co)return; r-=co; localStorage.setItem('inv_monedas',r); skins[k]=true; skins.nave=k; localStorage.setItem('inv_skins',JSON.stringify(skins)); invIrTienda('naves'); }; })(sk.key,sk.costo);
        fila.appendChild(btn2);
      }
      contenido.appendChild(fila);
    });
  }

  div.appendChild(contenido);
  c.innerHTML='';
  c.appendChild(div);
}

function invCrearFilaTienda(emoji, nombre, desc, nv, max, costo, puede, key, unico) {
  var fila = document.createElement('div');
  fila.style.cssText = 'background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px';
  var em=document.createElement('div'); em.style.fontSize='24px'; em.textContent=emoji;
  var inf=document.createElement('div'); inf.style.flex='1';
  var barras='';
  for(var i=0;i<max;i++) barras+='<div style="width:16px;height:3px;border-radius:2px;background:'+(i<nv?'#f59e0b':'#333')+'"></div>';
  inf.innerHTML='<div style="font-size:13px;font-weight:700;color:#fff">'+nombre+'</div><div style="font-size:10px;color:#666;margin-bottom:4px">'+desc+'</div><div style="display:flex;gap:2px">'+barras+'</div>';
  fila.appendChild(em); fila.appendChild(inf);
  if(nv>=max){
    var mx=document.createElement('div'); mx.style.cssText='font-size:10px;color:#22c55e;font-weight:700;white-space:nowrap'; mx.textContent=unico?'✅ Comprado':'MAX ✅'; fila.appendChild(mx);
  } else {
    var btn=document.createElement('button');
    btn.style.cssText='background:'+(puede?'#e31e24':'#2a2a2a')+';color:'+(puede?'#fff':'#555')+';border:none;border-radius:8px;padding:8px 10px;font-size:11px;font-weight:700;cursor:'+(puede?'pointer':'not-allowed')+';white-space:nowrap';
    btn.textContent=costo+' 💪';
    if(puede)(function(k,co){ btn.onclick=function(){ invComprarItem(k,co); }; })(key,costo);
    fila.appendChild(btn);
  }
  return fila;
}

function invIrTienda_old() {
  var c = document.getElementById('inv-contenido');
  if(!c) return;
  var reps = parseInt(localStorage.getItem('inv_monedas')||0);
  var upgrades = JSON.parse(localStorage.getItem('inv_upgrades')||'{}');
  var items = [
    {key:'velocidad', emoji:'💨', nombre:'Velocidad nave', desc:'Muévete más rápido', costo:30},
    {key:'cadencia', emoji:'⚡', nombre:'Cadencia disparo', desc:'Dispara más seguido', costo:40},
    {key:'vida_max', emoji:'❤️', nombre:'Vida máxima', desc:'+1 vida permanente', costo:50},
    {key:'dano', emoji:'🏋️', nombre:'Barra 100kg', desc:'Daño especial masivo', costo:60},
    {key:'escudo', emoji:'🛡️', nombre:'Escudo pasivo', desc:'Absorbe 1 golpe cada 15s', costo:80},
    {key:'cobertura', emoji:'🧱', nombre:'Coberturas GYM DT', desc:'2 bloques protectores por nivel', costo:45}
  ];
  var div = document.createElement('div');
  div.style.marginTop = '12px';

  var btnVolver = document.createElement('button');
  btnVolver.textContent = '← Inicio';
  btnVolver.style.cssText = 'background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:12px';
  btnVolver.onclick = function(){ c.innerHTML=''; };
  div.appendChild(btnVolver);

  var header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px';
  var titulo = document.createElement('div');
  titulo.style.cssText = 'font-size:14px;font-weight:700;color:#f59e0b';
  titulo.textContent = '🏪 Tienda';
  var repsEl = document.createElement('div');
  repsEl.id = 'inv-tienda-reps';
  repsEl.style.cssText = 'font-size:13px;color:#f59e0b;font-weight:700';
  repsEl.textContent = reps+' 💪 reps';
  header.appendChild(titulo); header.appendChild(repsEl);
  div.appendChild(header);

  items.forEach(function(item) {
    var nv = upgrades[item.key]||0;
    var max = 5;
    var costo = item.costo + nv*20;
    var puede = reps >= costo && nv < max;
    var fila = document.createElement('div');
    fila.style.cssText = 'background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px';
    var emojiEl = document.createElement('div');
    emojiEl.style.fontSize = '24px';
    emojiEl.textContent = item.emoji;
    var info = document.createElement('div');
    info.style.flex = '1';
    var barras = '';
    for(var i=0;i<max;i++) barras += '<div style="width:16px;height:3px;border-radius:2px;background:'+(i<nv?'#f59e0b':'#333')+'"></div>';
    info.innerHTML = '<div style="font-size:13px;font-weight:700;color:#fff">'+item.nombre+'</div><div style="font-size:10px;color:#666;margin-bottom:4px">'+item.desc+'</div><div style="display:flex;gap:2px">'+barras+'</div>';
    fila.appendChild(emojiEl); fila.appendChild(info);
    if(nv >= max) {
      var maxEl = document.createElement('div');
      maxEl.style.cssText = 'font-size:10px;color:#22c55e;font-weight:700;white-space:nowrap';
      maxEl.textContent = 'MAX ✅';
      fila.appendChild(maxEl);
    } else {
      var btn = document.createElement('button');
      btn.style.cssText = 'background:'+(puede?'#e31e24':'#2a2a2a')+';color:'+(puede?'#fff':'#555')+';border:none;border-radius:8px;padding:8px 10px;font-size:11px;font-weight:700;cursor:'+(puede?'pointer':'not-allowed')+';white-space:nowrap';
      btn.textContent = costo+' 💪';
      if(puede) {
        (function(k,co){ btn.onclick = function(){ invComprarItem(k,co); }; })(item.key, costo);
      }
      fila.appendChild(btn);
    }
    div.appendChild(fila);
  });
  c.innerHTML = '';
  c.appendChild(div);
}

function invComprarItem(key, costo) {
  var reps = parseInt(localStorage.getItem('inv_monedas')||0);
  var upgrades = JSON.parse(localStorage.getItem('inv_upgrades')||'{}');
  if(reps < costo || (upgrades[key]||0) >= 5) return;
  upgrades[key] = (upgrades[key]||0) + 1;
  reps -= costo;
  localStorage.setItem('inv_monedas', reps);
  localStorage.setItem('inv_upgrades', JSON.stringify(upgrades));
  invIrTienda();
}

function invEmpezar() {
  var c = document.getElementById('inv-contenido');
  if(!c) return;
  c.innerHTML = `
    <button onclick="desbloquearSwipe();renderJuegos(document.getElementById('herramienta-contenido'));invStop();"  style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:8px">← Juegos</button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-size:11px;color:var(--texto-secundario)">Nivel <span id="inv-nivel" style="color:#e31e24;font-weight:700">1</span></div>
      <div style="font-size:13px;font-weight:700;color:#f59e0b">⭐ <span id="inv-score">0</span></div>
      <div style="font-size:11px;color:var(--texto-secundario)">❤️ <span id="inv-vidas" style="font-weight:700">3</span></div>
    </div>
    <canvas id="inv-canvas" style="width:100%;border-radius:12px;display:block;background:#000;touch-action:none"></canvas>
    <div style="display:flex;gap:6px;margin-top:8px;justify-content:center">
      <div id="inv-btn-fuego" style="background:#e31e24;color:#fff;border:none;border-radius:8px;padding:14px 32px;font-size:14px;font-weight:700;cursor:pointer;user-select:none;-webkit-user-select:none;flex:1;text-align:center">🔫 FUEGO</div>
    </div>
    <div style="text-align:center;font-size:10px;color:var(--texto-secundario);margin-top:6px">Desliza en el canvas para mover · Toca FUEGO para disparar</div>
    <div id="inv-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999;align-items:center;justify-content:center;flex-direction:column;gap:12px">
      <div id="inv-overlay-title" style="font-size:24px;font-weight:700;color:#e31e24;text-align:center"></div>
      <div id="inv-overlay-sub" style="font-size:14px;color:var(--texto-medio);text-align:center"></div>
      <button id="inv-overlay-btn" style="background:#e31e24;color:#fff;border:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px"></button>
    </div>`;
  invInit();
}

var _invImg = {};
var _invImgEntrenador = new Image();
_invImgEntrenador.src = '/images/Entrenador1.png';
_invImgEntrenador.onload = function(){ _invImg.entrenador = _invImgEntrenador; };

var _inv = {
  loop: null, corriendo: false,
  W: 0, H: 0,
  nave: { x: 0, y: 0, w: 36, h: 20, vel: 0, speed: 5 },
  balas: [], enemigas: [], powerups: [], particulas: [],
  enemigos: [], obstaculos: [],
  score: 0, nivel: 1, vidas: 3,
  dirMover: 0, ultimoBalaEnemigo: 0, ultimoFrame: 0,
  mundos: [
    {
      nombre:'Gym Novato', color:'#e31e24',
      emojis:['🧔','👨','👩','🧕','👴','👩‍🦳','🧍'],
      // tipos disponibles en este mundo: 0-6 (gorditos básicos)
      // img futuras: gordito0.png - gordito6.png
      enemigosPool: [
        {tipo:0, emoji:'🧔', nombre:'Gordito Rojo'},
        {tipo:0, emoji:'👨', nombre:'Gordito Común'},
        {tipo:0, emoji:'👩', nombre:'Gordita'},
        {tipo:0, emoji:'🧕', nombre:'Gordita 2'},
        {tipo:0, emoji:'👴', nombre:'Gordito Mayor'},
        {tipo:0, emoji:'👩‍🦳', nombre:'Gordita Mayor'},
        {tipo:0, emoji:'🧍', nombre:'Gordito Negro'}
      ]
    },
    {
      nombre:'Calle', color:'#f59e0b',
      emojis:['🍔','🍕','🍺','🥤','🍟','🍬','🍰','🍦'],
      enemigosPool: [
        {tipo:0, emoji:'🍔', nombre:'Hamburguesa'},
        {tipo:1, emoji:'🍕', nombre:'Pizza', desc:'Zigzag'},
        {tipo:2, emoji:'🍺', nombre:'Cerveza', desc:'Blindado'},
        {tipo:6, emoji:'🥤', nombre:'Refresco', desc:'Francotirador'},
        {tipo:3, emoji:'🍟', nombre:'Papas Fritas', desc:'Bomba'},
        {tipo:5, emoji:'🍬', nombre:'Dulces', desc:'Clonador'},
        {tipo:4, emoji:'🍰', nombre:'Pastel', desc:'Fantasma'},
        {tipo:0, emoji:'🍦', nombre:'Helado'}
      ]
    },
    {
      nombre:'Fast Food', color:'#22c55e',
      emojis:['🎮','📺','📱','📲','🍿','😴'],
      enemigosPool: [
        {tipo:1, emoji:'🎮', nombre:'Videojuegos', desc:'Corredor'},
        {tipo:2, emoji:'📺', nombre:'TV', vida:5, desc:'Blindado fuerte'},
        {tipo:6, emoji:'📱', nombre:'Redes Sociales', desc:'Francotirador'},
        {tipo:6, emoji:'📲', nombre:'Celular', desc:'Francotirador preciso'},
        {tipo:3, emoji:'🍿', nombre:'Comida Chatarra', desc:'Bomba grande'},
        {tipo:0, emoji:'😴', nombre:'Flojera', desc:'Muy lento mucha vida', vida:4}
      ]
    },
    {
      nombre:'Vicios', color:'#a855f7',
      emojis:['🚬','🍾','💊','😵','😤','🦥','🧟'],
      enemigosPool: [
        {tipo:1, emoji:'🚬', nombre:'Fumar', desc:'Dispara humo'},
        {tipo:1, emoji:'🍾', nombre:'Alcohol', desc:'Zigzag borracho'},
        {tipo:2, emoji:'💊', nombre:'Drogas', desc:'Errático'},
        {tipo:4, emoji:'😵', nombre:'No Dormir', desc:'Invisible frecuente'},
        {tipo:1, emoji:'😤', nombre:'Estrés', desc:'Se acelera'},
        {tipo:5, emoji:'🦥', nombre:'Procrastinación', desc:'Reaparece'},
        {tipo:2, emoji:'🧟', nombre:'Aislamiento', desc:'Jefe mini', vida:3}
      ]
    },
    {
      nombre:'Jefe Final', color:'#fff',
      emojis:['👹','💀','😈','🔥','☠️','👿','🤡'],
      enemigosPool: [
        {tipo:2, emoji:'👹', nombre:'Demonio Gordo', vida:3},
        {tipo:6, emoji:'💀', nombre:'Calavera', desc:'Francotirador élite'},
        {tipo:3, emoji:'😈', nombre:'Diablo', desc:'Bomba masiva'},
        {tipo:4, emoji:'🔥', nombre:'Fuego', desc:'Invisible'},
        {tipo:1, emoji:'☠️', nombre:'Veneno', desc:'Corredor élite'},
        {tipo:5, emoji:'👿', nombre:'Maldad', desc:'Clonador élite'},
        {tipo:2, emoji:'🤡', nombre:'Payaso Sedentario', vida:5}
      ]
    }
  ]
};

function invInit() {
  var canvas = document.getElementById('inv-canvas');
  if(!canvas) return;
  var W = canvas.offsetWidth;
  canvas.width = W;
  canvas.height = Math.round(W * 1.5);
  _inv.W = W; _inv.H = canvas.height;
  _inv.nave.x = W/2;
  _inv.nave.y = _inv.H - 50;
  _inv.score = parseInt(localStorage.getItem('inv_score')||0);
  _inv.nivel = parseInt(localStorage.getItem('inv_nivel')||1);
  // Aplicar upgrades comprados
  var up = JSON.parse(localStorage.getItem('inv_upgrades')||'{}');
  // Cadencia — 300ms base, cada nivel -40ms
  _inv.cadenciaMs = Math.max(80, 300 - (up.disparo_vel||0) * 40);
  // Vida máxima
  _inv.vidas = 3 + (up.vida_max||0);
  // Escudo pasivo — cooldown base 15s, cada nivel -2s
  _inv.escudoPasivo = (up.escudo||0) > 0;
  _inv.escudoCooldown = Math.max(5000, 15000 - (up.escudo||0) * 2000);
  _inv.escudoPasivoTimer = 0;
  // Jefe
  invDibujarJefe();
  // Coberturas — cantidad y vida según nivel
  _inv.coberturas = (up.cobertura||0) > 0;
  _inv.coberturasCant = 2 + (up.cobertura||0);
  _inv.coberturasVida = 2 + (up.cobertura||0);
  // Doble disparo permanente
  _inv.dobleDisparo = (up.doble_disparo||0) >= 1;
  // Barra especial desbloqueada
  _inv.barraDesbloqueada = (up.barra_especial||0) >= 1;
  _inv.barraCarga = 0;
  _inv.barraMax = 20;
  _inv.balas = []; _inv.powerups = []; _inv.particulas = [];
  _inv.ultimoEvento = Date.now();
  _inv.proximoEvento = 20000 + Math.random()*15000;
  document.getElementById('inv-score').textContent = _inv.score;
  document.getElementById('inv-nivel').textContent = _inv.nivel;
  document.getElementById('inv-vidas').textContent = _inv.vidas;
  _inv.jefe = null;
  _inv.oleadaActual = 1;
  var digitoNivel = _inv.nivel % 10;
  _inv.oleadasTotal = digitoNivel === 0 ? 1 : digitoNivel <= 3 ? 3 : digitoNivel <= 6 ? 4 : 5;
  _inv.transicion = false;
  invCrearEnemigos();
  if(_inv.coberturas) invCrearCoberturas();
  setTimeout(invBindControles, 100);
  _inv.corriendo = true;
  invLoop();
}

function invCrearCoberturas() {
  _inv.coberturasArr = [];
  var cant = _inv.coberturasCant || 2;
  var vida = _inv.coberturasVida || 3;
  for(var i=0;i<cant;i++) {
    var x = _inv.W * (0.15 + (i/(cant-1||1))*0.7);
    _inv.coberturasArr.push({x:x, y:_inv.H*0.72, vida:vida, maxVida:vida});
  }
}

function invCrearEnemigo(x, y, tipo, emoji, vida, vx, vy) {
  // Si no se pasa emoji, tomar del pool del mundo actual
  var mundo = Math.min(4, Math.floor((_inv.nivel-1)/20));
  var pool = _inv.mundos[mundo].enemigosPool;
  // Buscar en pool un enemigo del tipo solicitado
  var candidatos = pool.filter(function(e){ return e.tipo === (tipo||0); });
  var def = candidatos.length > 0
    ? candidatos[Math.floor(Math.random()*candidatos.length)]
    : pool[Math.floor(Math.random()*pool.length)];
  var vidaFinal = vida || def.vida || 1;
  var emojiFinal = emoji || def.emoji;
  // Posición inicial fuera de pantalla para animación de entrada
  var entradaDesde = Math.floor(Math.random()*3); // 0=arriba 1=izq 2=der
  var startX = entradaDesde===1 ? -40 : entradaDesde===2 ? (_inv.W||400)+40 : x;
  var startY = entradaDesde===0 ? -40 : y;
  return {
    x:startX, y:startY,
    destX:x, destY:y,
    w:28, h:28,
    tipo: def.tipo||0,
    vida: vidaFinal, vidaMax: vidaFinal,
    emoji: emojiFinal,
    nombre: def.nombre||'',
    angulo:0, invisible:false, invisTimer:0,
    vx:vx||0, vy:vy||0,
    entrando: true, entradaT: 0
  };
}

// ═══════════════════════════════════════
// JEFES
// ═══════════════════════════════════════
var _invJefes = [
  {nivel:10,  nombre:'El Gordo del Gym',        emoji:'🧔', vida:60,  color:'#e31e24'},
  {nivel:20,  nombre:'El Rey del Sofá',          emoji:'🛋️', vida:100, color:'#f59e0b'},
  {nivel:30,  nombre:'Ronald Malcomida',         emoji:'🍔', vida:140, color:'#22c55e'},
  {nivel:40,  nombre:'El Señor Vicio',           emoji:'🍾', vida:180, color:'#a855f7'},
  {nivel:50,  nombre:'La Pizza Gigante',         emoji:'🍕', vida:220, color:'#f97316'},
  {nivel:60,  nombre:'El Aguardiente Supremo',   emoji:'🥃', vida:260, color:'#06b6d4'},
  {nivel:70,  nombre:'El Sedentario Élite',      emoji:'😴', vida:300, color:'#6366f1'},
  {nivel:80,  nombre:'El Anti-DT',               emoji:'😈', vida:360, color:'#ec4899'},
  {nivel:90,  nombre:'La Pereza Absoluta',       emoji:'🦥', vida:400, color:'#84cc16'},
  {nivel:100, nombre:'EL SEDENTARIO SUPREMO',    emoji:'👹', vida:600, color:'#e31e24'}
];

function invEsNivelJefe(nivel) { return nivel % 10 === 0; }

function invCrearJefe(nivel) {
  var def = _invJefes.find(function(j){ return j.nivel === nivel; });
  if(!def) def = _invJefes[Math.floor((nivel/10)-1)] || _invJefes[_invJefes.length-1];
  _inv.jefe = {
    x: _inv.W/2, y: 80,
    w: 64, h: 64,
    vida: def.vida + nivel*2,
    vidaMax: def.vida + nivel*2,
    nombre: def.nombre,
    emoji: def.emoji,
    color: def.color,
    fase: 1,
    angulo: 0,
    velX: 1.5,
    ultimoDisparo: 0,
    escolta: []
  };
}

function invUpdateJefe() {
  if(!_inv.jefe) return;
  var j = _inv.jefe;
  var W = _inv.W, H = _inv.H;
  var pct = j.vida / j.vidaMax;

  // Determinar fase
  j.fase = pct > 0.6 ? 1 : pct > 0.3 ? 2 : 3;

  // Movimiento según fase
  j.angulo += 0.02;
  if(j.fase === 1) {
    j.x += j.velX * (1 + (_inv.nivel*0.02));
    if(j.x < 50 || j.x > W-50) j.velX *= -1;
  } else if(j.fase === 2) {
    j.x += j.velX * 1.8;
    j.y = 80 + Math.sin(j.angulo*2)*20;
    if(j.x < 50 || j.x > W-50) j.velX *= -1;
  } else {
    // Fase 3 — parpadea y baja lentamente
    j.x += j.velX * 2.5;
    j.y = Math.min(j.y + 0.05, H*0.35);
    if(j.x < 50 || j.x > W-50) j.velX *= -1;
  }

  // Disparos del jefe
  var ahora = Date.now();
  var cooldown = j.fase===1 ? 2000 : j.fase===2 ? 1200 : 700;
  if(ahora - j.ultimoDisparo > cooldown) {
    j.ultimoDisparo = ahora;
    if(j.fase === 1) {
      // 1 bala hacia la nave
      var dx = _inv.nave.x - j.x, dy = _inv.nave.y - j.y;
      var dist = Math.sqrt(dx*dx+dy*dy)||1;
      _inv.balas.push({x:j.x, y:j.y+35, dy:(dy/dist)*5, dx:(dx/dist)*3, w:10, h:16, esNave:false, esJefe:true});
    } else if(j.fase === 2) {
      // 2 balas en diagonal
      _inv.balas.push({x:j.x-20, y:j.y+35, dy:5, dx:-2, w:10, h:16, esNave:false, esJefe:true});
      _inv.balas.push({x:j.x+20, y:j.y+35, dy:5, dx:2, w:10, h:16, esNave:false, esJefe:true});
    } else {
      // 3 balas en abanico
      for(var bi=-1;bi<=1;bi++)
        _inv.balas.push({x:j.x, y:j.y+35, dy:5, dx:bi*3, w:10, h:16, esNave:false, esJefe:true});
    }
    // Fase 2: invocar escolta
    if(j.fase === 2 && j.escolta.length < 3 && Math.random()<0.3) {
      var mundo = Math.min(4,Math.floor((_inv.nivel-1)/20));
      j.escolta.push(invCrearEnemigo(j.x+(Math.random()-0.5)*100, j.y+80, 0, null, 1));
      _inv.enemigos.push(j.escolta[j.escolta.length-1]);
    }
  }

  // Colisiones balas jugador vs jefe
  _inv.balas.filter(function(b){return b.esNave;}).forEach(function(b){
    if(Math.abs(b.x-j.x)<(j.w/2+b.w/2) && Math.abs(b.y-j.y)<(j.h/2+b.h/2)) {
      var dano = b.especial ? 3 : 1;
      j.vida -= dano;
      b.y = -999;
      invParticulasExp(j.x+(Math.random()-0.5)*30, j.y+(Math.random()-0.5)*30, '💥');
      if(j.vida <= 0) invMatarJefe();
    }
  });

  // Colisión jefe vs nave
  if(Math.abs(j.x-_inv.nave.x)<50 && Math.abs(j.y-_inv.nave.y)<60) {
    invPerdidaVida();
  }
}

function invMatarJefe() {
  var repsJefe = 50 + (_inv.nivel/10)*50;
  var totalReps = parseInt(localStorage.getItem('inv_monedas')||0) + repsJefe;
  localStorage.setItem('inv_monedas', totalReps);
  _inv.score += 500 * _inv.nivel;
  document.getElementById('inv-score').textContent = _inv.score;
  invParticulasExp(_inv.jefe.x, _inv.jefe.y, '🏆');
  invParticulasExp(_inv.jefe.x-30, _inv.jefe.y, '💥');
  invParticulasExp(_inv.jefe.x+30, _inv.jefe.y, '💥');
  _inv.jefe = null;
  invNivelCompletado();
}

function invDibujarJefe() {
  if(!_inv.jefe) return;
  var j = _inv.jefe;
  var ctx = document.getElementById('inv-canvas').getContext('2d');
  var pct = j.vida/j.vidaMax;

  // Parpadeo en fase 3
  if(j.fase === 3 && Math.floor(Date.now()/150)%2===0) ctx.globalAlpha=0.6;

  // Sombra/glow
  ctx.shadowColor = j.color;
  ctx.shadowBlur = 20;
  ctx.font = j.fase===3?'52px sans-serif':'48px sans-serif';
  ctx.textAlign='center';
  ctx.fillText(j.emoji, j.x, j.y+18);
  ctx.shadowBlur=0;
  ctx.globalAlpha=1;

  // Nombre
  ctx.fillStyle=j.color;
  ctx.font='bold 11px sans-serif';
  ctx.fillText(j.nombre, j.x, j.y-38);

  // Barra de vida
  var bw=100, bh=8;
  ctx.fillStyle='#333'; ctx.fillRect(j.x-bw/2, j.y-28, bw, bh);
  ctx.fillStyle = pct>0.6?'#22c55e':pct>0.3?'#f59e0b':'#e31e24';
  ctx.fillRect(j.x-bw/2, j.y-28, bw*pct, bh);
  ctx.strokeStyle='#555'; ctx.lineWidth=1;
  ctx.strokeRect(j.x-bw/2, j.y-28, bw, bh);

  // Fase indicator
  ctx.fillStyle='#fff'; ctx.font='9px sans-serif';
  ctx.fillText('FASE '+j.fase, j.x, j.y-32);
}

function invCrearEnemigos() {
  _inv.enemigos = [];
  var nivel = _inv.nivel;
  var oleada = _inv.oleadaActual || 1;
  var mundo = Math.min(4, Math.floor((nivel-1)/20));
  var emojis = _inv.mundos[mundo].emojis;
  var W = _inv.W;

  function emoji() { return emojis[Math.floor(Math.random()*emojis.length)]; }
  function fila(cant, y, tipo, vida, vx, vy) {
    var espX = (W-30)/cant;
    for(var i=0;i<cant;i++)
      _inv.enemigos.push(invCrearEnemigo(15+i*espX+espX/2, y, tipo||0, emoji(), vida||1, vx||0, vy||0));
  }

  // ═══════════════════════════
  // NIVELES JEFE (múltiplos de 10)
  // ═══════════════════════════
  if(invEsNivelJefe(nivel)) {
    invCrearJefe(nivel);
    // Escoltas iniciales
    fila(3, 130, 0, 1);
    return;
  }

  // ═══════════════════════════
  // NIVEL 1 — Tutorial
  // ═══════════════════════════
  if(nivel === 1) {
    _inv.dirEnemigos = 1;
    _inv.velEnemigos = 0.5;
    if(oleada === 1) {
      // Oleada 1: 2 filas de 5 — lentos, solo izq/der
      fila(5, 45, 0, 1);
      fila(5, 78, 0, 1);
    } else if(oleada === 2) {
      // Oleada 2: 2 filas de 6 — un poco más rápido
      _inv.velEnemigos = 0.65;
      fila(6, 42, 0, 1);
      fila(6, 74, 0, 1);
    } else if(oleada === 3) {
      // Oleada 3: 3 filas de 5 — velocidad normal, algunos disparan
      _inv.velEnemigos = 0.8;
      fila(5, 38, 0, 1);
      fila(5, 68, 0, 1);
      fila(5, 98, 0, 1);
    }
  }
  // ═══════════════════════════
  // NIVEL 2
  // ═══════════════════════════
  else if(nivel === 2) {
    _inv.dirEnemigos = 1;
    _inv.velEnemigos = 0.6 + oleada*0.1;
    if(oleada === 1) {
      // V simple
      var cx=W/2;
      for(var i=0;i<5;i++){
        _inv.enemigos.push(invCrearEnemigo(cx-i*34, 42+i*26, 0, emoji(), 1));
        if(i>0) _inv.enemigos.push(invCrearEnemigo(cx+i*34, 42+i*26, 0, emoji(), 1));
      }
    } else if(oleada === 2) {
      fila(6, 40, 0, 1); fila(6, 70, 0, 1); fila(4, 100, 0, 1);
    } else if(oleada === 3) {
      // V + fila soporte
      var cx2=W/2;
      for(var i2=0;i2<4;i2++){
        _inv.enemigos.push(invCrearEnemigo(cx2-i2*36, 38+i2*26, 0, emoji(), 1));
        if(i2>0) _inv.enemigos.push(invCrearEnemigo(cx2+i2*36, 38+i2*26, 0, emoji(), 1));
      }
      fila(6, 115, 0, 1);
    }
  }
  // ═══════════════════════════
  // NIVELES 3+ — dinámico escalado
  // ═══════════════════════════
  else {
    var cols = Math.min(4+Math.floor(nivel/8), 8);
    var filas = Math.min(2+Math.floor(nivel/6), 6);
    _inv.dirEnemigos = oleada%2===0 ? -1 : 1;
    _inv.velEnemigos = 0.4 + nivel*0.04 + oleada*0.08;
    var espX2 = (W-30)/cols;
    for(var f=0;f<filas;f++) {
      for(var c=0;c<cols;c++) {
        var tipo = f===0&&nivel>5&&Math.random()<0.2 ? 1 : 0;
        var vida2 = f===0&&nivel>8 ? 2 : 1;
        _inv.enemigos.push(invCrearEnemigo(
          15+c*espX2+espX2/2, 38+f*30,
          tipo, emoji(), vida2,
          oleada>=2&&f%2===0?0.3:0, 0
        ));
      }
    }
  }
}

function invBindControles() {
  var canvas = document.getElementById('inv-canvas');
  var fuego = document.getElementById('inv-btn-fuego');
  if(!canvas) return;
  var lastTouchX = null;
  var lastTouchY = null;
  var esHorizontal = false;
  canvas.addEventListener('touchstart', function(e){
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
    esHorizontal = false;
  }, {passive:true});
  canvas.addEventListener('touchmove', function(e){
    if(lastTouchX === null) return;
    var dx = e.touches[0].clientX - lastTouchX;
    var dy = e.touches[0].clientY - lastTouchY;
    if(!esHorizontal && Math.abs(dx) > Math.abs(dy)) esHorizontal = true;
    if(esHorizontal) {
      e.preventDefault();
      _inv.nave.x += dx * 1.8;
      _inv.nave.x = Math.max(20, Math.min(_inv.W-20, _inv.nave.x));
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  }, {passive:false});
  canvas.addEventListener('touchend', function(e){
    lastTouchX = null; lastTouchY = null; esHorizontal = false;
  }, {passive:true});
  if(fuego) {
    var _ultimoTapFuego = 0;
    fuego.textContent = '🏋️ PODER';
    fuego.style.background = '#333';
    fuego.addEventListener('touchstart', function(e){
      e.preventDefault();
      var ahora = Date.now();
      if(_inv.barraDesbloqueada && (_inv.barraCarga||0) >= (_inv.barraMax||20)) {
        invBarraEspecial();
        fuego.style.background = '#f59e0b';
        setTimeout(function(){ fuego.style.background='#333'; }, 500);
      } else if(!_inv.barraDesbloqueada) {
        // Sin barra: disparo manual extra
        invDisparar();
      }
      _ultimoTapFuego = ahora;
    }, {passive:false});
    fuego.addEventListener('click', function(){
      if(!_inv.barraDesbloqueada) invDisparar();
      else if((_inv.barraCarga||0) >= (_inv.barraMax||20)) invBarraEspecial();
    });
  }
}

function invBarraEspecial() {
  if(!_inv.barraDesbloqueada || (_inv.barraCarga||0) < (_inv.barraMax||20)) return;
  _inv.barraCarga = 0;
  // Disparo masivo — 7 balas en abanico
  for(var i=0;i<7;i++) {
    var angulo = -Math.PI/2 + (i-3)*0.2;
    _inv.balas.push({
      x:_inv.nave.x, y:_inv.nave.y-20,
      dy: Math.sin(angulo)*12,
      dx: Math.cos(angulo)*4,
      w:8, h:18, esNave:true, especial:true
    });
  }
  // Flash visual
  invParticulasExp(_inv.nave.x, _inv.nave.y-30, '🏋️');
  invParticulasExp(_inv.nave.x-20, _inv.nave.y-20, '💥');
  invParticulasExp(_inv.nave.x+20, _inv.nave.y-20, '💥');
}

function invStop() {
  _inv.corriendo = false;
  if(_inv.loop) cancelAnimationFrame(_inv.loop);
}

function invMover(dir) { _inv.dirMover = dir; }
function invPararMover() { _inv.dirMover = 0; }

function invDisparar() {
  if(!_inv.corriendo) return;
  var ahora = Date.now();
  if(ahora - (_inv.ultimoBala||0) < (_inv.cadenciaMs||300)) return;
  _inv.ultimoBala = ahora;
  // Doble disparo si está comprado
  if(_inv.dobleDisparo) {
    _inv.balas.push({ x:_inv.nave.x-18, y:_inv.nave.y-20, dy:-9, w:5, h:14, esNave:true });
    _inv.balas.push({ x:_inv.nave.x+18, y:_inv.nave.y-20, dy:-9, w:5, h:14, esNave:true });
  } else {
    _inv.balas.push({ x:_inv.nave.x, y:_inv.nave.y-20, dy:-9, w:5, h:14, esNave:true });
  }
  // Cargar barra especial matando
  if(_inv.barraDesbloqueada) {
    _inv.barraCarga = Math.min((_inv.barraCarga||0) + 0.2, _inv.barraMax||20);
  }
}

function invLoop() {
  if(!_inv.corriendo) return;
  if(!document.getElementById('inv-canvas')) { _inv.corriendo=false; return; }
  invUpdate();
  invDraw();
  _inv.loop = requestAnimationFrame(invLoop);
}

function invUpdate() {
  var W=_inv.W, H=_inv.H;
  // Mover nave
  _inv.nave.x += _inv.dirMover * _inv.nave.speed;
  _inv.nave.x = Math.max(20, Math.min(W-20, _inv.nave.x));
  // Disparo automático
  invDisparar();

  // Mover balas del jugador
  _inv.balas = _inv.balas.filter(function(b){
    b.y += b.dy;
    return b.y > -20 && b.y < H+20;
  });

  // Mover enemigos
  var todosListos = true;
  _inv.enemigos.forEach(function(e){
    // Animación de entrada
    if(e.entrando) {
      todosListos = false;
      e.x += (e.destX - e.x) * 0.12;
      e.y += (e.destY - e.y) * 0.12;
      if(Math.abs(e.x-e.destX)<1.5 && Math.abs(e.y-e.destY)<1.5) {
        e.x=e.destX; e.y=e.destY; e.entrando=false;
      }
      return;
    }
    e.x += _inv.velEnemigos * _inv.dirEnemigos;
    if(e.vx) { e.x += e.vx; if(e.x<16||e.x>W-16) e.vx*=-1; }
  });
  // Solo rebotar si todos ya entraron
  if(todosListos) {
    var normales = _inv.enemigos.filter(function(e){ return !e.entrando; });
    if(normales.length > 0) {
      var minX = Math.min.apply(null, normales.map(function(e){return e.x-e.w/2;}));
      var maxX = Math.max.apply(null, normales.map(function(e){return e.x+e.w/2;}));
      if(minX < 8 || maxX > W-8) {
        _inv.dirEnemigos *= -1;
        _inv.velEnemigos = Math.min(_inv.velEnemigos*1.02, 4);
        // NO bajan al rebotar — solo bajan gradualmente con el tiempo
      }
      // Bajada gradual muy lenta
      if(!_inv._ultimaBajada) _inv._ultimaBajada = Date.now();
      if(Date.now() - _inv._ultimaBajada > 8000) {
        _inv._ultimaBajada = Date.now();
        _inv.enemigos.forEach(function(e){ if(!e.entrando) e.y += 6; });
      }
    }
  }

  // Disparos enemigos aleatorios
  var ahora = Date.now();
  var intervalo = Math.max(600, 2000 - _inv.nivel*30);
  if(ahora - _inv.ultimoBalaEnemigo > intervalo && _inv.enemigos.length > 0) {
    _inv.ultimoBalaEnemigo = ahora;
    var e = _inv.enemigos[Math.floor(Math.random()*_inv.enemigos.length)];
    _inv.balas.push({x:e.x, y:e.y+12, dy:4+_inv.nivel*0.1, w:6, h:10, esNave:false});
  }

  // Colisiones balas jugador vs enemigos
  _inv.balas.filter(function(b){return b.esNave;}).forEach(function(b){
    _inv.enemigos = _inv.enemigos.filter(function(e){
      var hit = Math.abs(b.x-e.x)<(b.w/2+e.w/2) && Math.abs(b.y-e.y)<(b.h/2+e.h/2);
      if(hit){
        e.vida--;
        b.y = -999;
        invParticulasExp(e.x, e.y, e.emoji);
        if(b.especial) e.vida -= 2; // barra especial hace doble daño
        if(e.vida <= 0){
          var puntosBase = e.elite ? 100 : (e.tipo===2?30:e.tipo===6?25:e.tipo===3?20:10);
          _inv.score += puntosBase * _inv.nivel;
          document.getElementById('inv-score').textContent = _inv.score;
          var repsBase = e.elite ? 10 : (e.tipo===2?3:e.tipo===6?2:1);
          var reps = parseInt(localStorage.getItem('inv_monedas')||0) + repsBase;
          localStorage.setItem('inv_monedas', reps);
          if(Math.random()<0.2) invSpawnPowerup(e.x, e.y);
          return false;
        }
      }
      return true;
    });
  });

  // Colisiones balas enemigo vs coberturas
  if(_inv.coberturasArr) {
    _inv.balas.filter(function(b){return !b.esNave;}).forEach(function(b){
      _inv.coberturasArr.forEach(function(cb){
        if(cb.vida<=0) return;
        if(Math.abs(b.x-cb.x)<28 && Math.abs(b.y-cb.y)<16){
          b.y=_inv.H+999;
          cb.vida--;
        }
      });
    });
  }
  // Colisiones balas enemigo vs nave
  _inv.balas.filter(function(b){return !b.esNave;}).forEach(function(b){
    var n=_inv.nave;
    if(Math.abs(b.x-n.x)<(b.w/2+n.w/2) && Math.abs(b.y-n.y)<(b.h/2+n.h/2)){
      b.y=H+999;
      invPerdidaVida();
    }
  });

  // Enemigos llegan a nave
  _inv.enemigos.forEach(function(e){
    // Límite de bajada — rebotan antes de llegar a la nave
    var limY = _inv.H * 0.70;
    if(e.y > limY) {
      e.y = limY;
      if(e.vy > 0) e.vy *= -1; // rebotar hacia arriba
      // Solo pierde vida si toca directamente la nave
      if(Math.abs(e.x - _inv.nave.x) < 30) {
        invPerdidaVida();
        e.y = 50; // el enemigo sube tras golpear
      } else {
        // Empujar todo el grupo hacia arriba
        _inv.enemigos.forEach(function(e2){ if(!e2.entrando) e2.y -= 20; });
      }
    }
  });

  // Eventos aleatorios
  var ahoraEv = Date.now();
  if(ahoraEv - (_inv.ultimoEvento||0) > (_inv.proximoEvento||25000) && _inv.enemigos.length > 0) {
    _inv.ultimoEvento = ahoraEv;
    _inv.proximoEvento = 20000 + Math.random()*15000;
    var evento = Math.floor(Math.random()*4);
    if(evento === 0) {
      // Lluvia de power-ups — 4 caen simultáneos
      for(var pi=0;pi<4;pi++) {
        setTimeout(function(){
          var tipos = ['proteina','creatina','aminoacidos','preentrenoo'];
          var emojisEv = {'proteina':'🥛','creatina':'⚡','aminoacidos':'🛡️','preentrenoo':'💊'};
          var t = tipos[Math.floor(Math.random()*tipos.length)];
          _inv.powerups.push({x:20+Math.random()*(_inv.W-40), y:-20, tipo:t, emoji:emojisEv[t], vel:2.5});
        }, pi*300);
      }
      invParticulasExp(_inv.W/2, 60, '🎁');
    } else if(evento === 1) {
      // Enemigo élite — vale 5x reps
      var mundo = Math.min(4,Math.floor((_inv.nivel-1)/20));
      var pool = _inv.mundos[mundo].enemigosPool;
      var def = pool[Math.floor(Math.random()*pool.length)];
      _inv.enemigos.push({
        x: Math.random()<0.5 ? -30 : _inv.W+30,
        y: 80, destX: _inv.W/2, destY: 80,
        w:36, h:36, tipo:1, vida:4, vidaMax:4,
        emoji: '⭐', nombre:'Élite',
        elite:true, angulo:0, invisible:false, invisTimer:0,
        vx:0, vy:0, entrando:true, entradaT:0
      });
      invParticulasExp(_inv.W/2, 40, '⚠️');
    } else if(evento === 2) {
      // Oleada sorpresa — 3 enemigos débiles, entran lento desde arriba
      var mundo2 = Math.min(4,Math.floor((_inv.nivel-1)/20));
      for(var si=0;si<3;si++) {
        var ex2 = _inv.W*0.2 + si*(_inv.W*0.3);
        var enemSorpresa = invCrearEnemigo(ex2, -40, 0, null, 1, 0, 0);
        // Destino en zona superior — no bajan hasta la nave
        enemSorpresa.destY = 50 + si*25;
        enemSorpresa.y = -40;
        _inv.enemigos.push(enemSorpresa);
      }
      invParticulasExp(_inv.W/2, 40, '👾');
    } else {
      // Escudo gratis cae del cielo
      _inv.powerups.push({x:_inv.W/2, y:-20, tipo:'aminoacidos', emoji:'🛡️', vel:2});
      invParticulasExp(_inv.W/2, 40, '🛡️');
    }
  }

  // Powerups
  _inv.powerups = _inv.powerups.filter(function(p){
    p.y += 1.5;
    var n=_inv.nave;
    if(Math.abs(p.x-n.x)<30 && Math.abs(p.y-n.y)<30){
      invAplicarPowerup(p.tipo);
      return false;
    }
    return p.y < H+20;
  });

  // Partículas
  _inv.particulas = _inv.particulas.filter(function(p){
    p.x+=p.vx; p.y+=p.vy; p.vida--;
    return p.vida>0;
  });

  // ¿Nivel completado?
  if(_inv.enemigos.length === 0 && !_inv.transicion) {
    _inv.transicion = true;
    _inv.oleadaActual = (_inv.oleadaActual||1) + 1;
    if(_inv.oleadaActual > _inv.oleadasTotal) {
      _inv.corriendo = false;
      setTimeout(function(){ invNivelCompletado(); }, 400);
    } else {
      _inv.corriendo = false;
      var ov = document.getElementById('inv-overlay');
      if(ov) {
        ov.style.display='flex';
        document.getElementById('inv-overlay-title').textContent = '💪 Oleada '+(_inv.oleadaActual-1)+' eliminada';
        document.getElementById('inv-overlay-sub').textContent = 'Oleada '+_inv.oleadaActual+' de '+_inv.oleadasTotal+' — ¡Prepárate!';
        document.getElementById('inv-overlay-btn').style.display='none';
      }
      setTimeout(function(){
        if(ov) ov.style.display='none';
        invCrearEnemigos();
        _inv.transicion = false;
        _inv.corriendo = true;
        invLoop();
      }, 1800);
    }
  }
}

function invPerdidaVida() {
  _inv.vidas--;
  document.getElementById('inv-vidas').textContent = Math.max(0,_inv.vidas);
  invParticulasExp(_inv.nave.x, _inv.nave.y, '💥');
  if(_inv.escudoPasivo) {
    var ahora2 = Date.now();
    if(ahora2 - _inv.escudoPasivoTimer > (_inv.escudoCooldown||15000)) {
      _inv.escudoPasivoTimer = ahora2;
      invParticulasExp(_inv.nave.x, _inv.nave.y, '🛡️');
      return;
    }
  }
  if(_inv.vidas <= 0) invGameOver();
}

function invSpawnPowerup(x, y) {
  var tipos = ['proteina','creatina','aminoacidos','preentrenoo','barra'];
  var emojis = {'proteina':'🥛','creatina':'⚡','aminoacidos':'🛡️','preentrenoo':'💊','barra':'🏋️'};
  var tipo = tipos[Math.floor(Math.random()*tipos.length)];
  _inv.powerups.push({x:x,y:y,tipo:tipo,emoji:emojis[tipo]});
}

function invAplicarPowerup(tipo) {
  if(tipo==='proteina'){ _inv.vidas=Math.min(_inv.vidas+1,5); document.getElementById('inv-vidas').textContent=_inv.vidas; }
  else if(tipo==='creatina'){ _inv.dobleDisparo=true; setTimeout(function(){_inv.dobleDisparo=false;},5000); }
  else if(tipo==='aminoacidos'){ _inv.escudo=true; setTimeout(function(){_inv.escudo=false;},5000); }
  else if(tipo==='preentrenoo'){ _inv.nave.speed=9; setTimeout(function(){_inv.nave.speed=5;},5000); }
}

function invParticulasExp(x, y, emoji) {
  for(var i=0;i<8;i++){
    _inv.particulas.push({
      x:x,y:y,
      vx:(Math.random()-0.5)*4,
      vy:(Math.random()-0.5)*4,
      vida:20, emoji:emoji
    });
  }
}

function invNivelCompletado() {
  _inv.corriendo = false;
  _inv.oleadaActual = 1;
  _inv.transicion = false;
  var monedasGanadas = 10 + _inv.nivel * 2;
  var totalReps = parseInt(localStorage.getItem('inv_monedas')||0) + monedasGanadas;
  localStorage.setItem('inv_monedas', totalReps);
  var mejor = parseInt(localStorage.getItem('inv_mejor')||0);
  if(_inv.score > mejor) { localStorage.setItem('inv_mejor', _inv.score); }
  _inv.nivel++;
  localStorage.setItem('inv_nivel', _inv.nivel);
  localStorage.setItem('inv_score', _inv.score);
  invMostrarOverlay('🏆 ¡Nivel completado!', '+'+monedasGanadas+' 💪 reps | Total: '+totalReps+' | Nivel '+_inv.nivel, 'Siguiente nivel ▶', function(){
    _inv.balas=[]; _inv.powerups=[]; _inv.particulas=[];
    _inv.vidas=3; document.getElementById('inv-vidas').textContent=3;
    document.getElementById('inv-nivel').textContent=_inv.nivel;
    invCrearEnemigos();
    _inv.corriendo=true;
    invLoop();
  });
}

function invGameOver() {
  _inv.corriendo = false;
  var nivelMuerto = _inv.nivel;
  localStorage.setItem('inv_score', 0);
  invMostrarOverlay('💀 GAME OVER', 'Puntaje: '+_inv.score+' | Nivel '+nivelMuerto, '🔄 Reintentar nivel', function(){
    _inv.score=0; _inv.vidas=3;
    _inv.balas=[]; _inv.powerups=[]; _inv.particulas=[];
    document.getElementById('inv-score').textContent=0;
    document.getElementById('inv-nivel').textContent=nivelMuerto;
    document.getElementById('inv-vidas').textContent=3;
    _inv.oleadaActual=1;
    var digitoNivel = nivelMuerto % 10;
    _inv.oleadasTotal = digitoNivel===0?1:digitoNivel<=3?3:digitoNivel<=6?4:5;
    _inv.transicion=false;
    invCrearEnemigos();
    _inv.corriendo=true;
    invLoop();
  });
}

function invMostrarOverlay(titulo, sub, btnTxt, cb) {
  var ov = document.getElementById('inv-overlay');
  if(!ov) return;
  ov.style.display='flex';
  document.getElementById('inv-overlay-title').textContent=titulo;
  document.getElementById('inv-overlay-sub').textContent=sub;
  var btn=document.getElementById('inv-overlay-btn');
  btn.style.display='block';
  btn.textContent=btnTxt;
  btn.onclick=function(){ ov.style.display='none'; cb(); };
}

function invDraw() {
  var canvas=document.getElementById('inv-canvas');
  if(!canvas) return;
  var ctx=canvas.getContext('2d');
  var W=_inv.W,H=_inv.H;
  // Fondo estrellado
  ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  // Estrellas (estáticas con seed)
  ctx.fillStyle='rgba(255,255,255,0.5)';
  for(var s=0;s<40;s++){
    var sx=(s*137.5)%W, sy=(s*97.3)%H;
    ctx.fillRect(sx,sy,1,1);
  }
  // Mundo label
  var mundo=Math.min(4,Math.floor((_inv.nivel-1)/20));
  ctx.fillStyle=_inv.mundos[mundo].color+'44';
  ctx.fillRect(0,0,W,24);
  ctx.fillStyle=_inv.mundos[mundo].color;
  ctx.font='10px sans-serif'; ctx.textAlign='left';
  ctx.fillText('Mundo '+(mundo+1)+': '+_inv.mundos[mundo].nombre, 6, 16);

  // Enemigos
  ctx.font='22px sans-serif'; ctx.textAlign='center';
  _inv.enemigos.forEach(function(e){
    ctx.fillText(e.emoji, e.x, e.y+8);
    if(e.vida>1){
      ctx.fillStyle='#e31e24';
      ctx.fillRect(e.x-10, e.y-14, 20, 3);
      ctx.fillStyle='#22c55e';
      ctx.fillRect(e.x-10, e.y-14, 20*(e.vida/2), 3);
    }
  });

  // Balas
  var skins = JSON.parse(localStorage.getItem('inv_skins')||'{}');
  var skinDisp = skins.disparo || 'disp_rojo';
  var coloresDisp = {
    'disp_rojo':'#e31e24','disp_verde':'#22c55e','disp_azul':'#3b82f6',
    'disp_rayo':'#f59e0b','disp_fuego':'#f97316','disp_dorado':'#fbbf24'
  };
  var colorBala = coloresDisp[skinDisp] || '#e31e24';
  _inv.balas.forEach(function(b){
    if(b.esNave) {
      if(b.especial) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = colorBala;
        ctx.shadowColor = colorBala;
        ctx.shadowBlur = 4;
      }
    } else {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowBlur = 0;
    }
    ctx.fillRect(b.x-b.w/2, b.y-b.h/2, b.w, b.h);
    ctx.shadowBlur = 0;
  });

  // Powerups
  ctx.font='18px sans-serif';
  _inv.powerups.forEach(function(p){
    ctx.fillText(p.emoji, p.x, p.y);
  });

  // Partículas
  _inv.particulas.forEach(function(p){
    ctx.globalAlpha = p.vida/20;
    ctx.font='12px sans-serif';
    ctx.fillText(p.emoji, p.x, p.y);
  });
  ctx.globalAlpha=1;

  // Coberturas
  if(_inv.coberturasArr) {
    _inv.coberturasArr.forEach(function(cb){
      if(cb.vida <= 0) return;
      var alpha = cb.vida / cb.maxVida;
      ctx.fillStyle = 'rgba(227,30,36,'+alpha+')';
      ctx.fillRect(cb.x-25, cb.y-12, 50, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 9px sans-serif'; ctx.textAlign='center';
      ctx.fillText('GYM DT', cb.x, cb.y+4);
    });
  }
  // Barra especial HUD
  if(_inv.barraDesbloqueada) {
    var carga = _inv.barraCarga||0, max = _inv.barraMax||20;
    ctx.fillStyle='#222'; ctx.fillRect(W*0.1, H-18, W*0.8, 8);
    ctx.fillStyle = carga>=max ? '#f59e0b' : '#e31e24';
    ctx.fillRect(W*0.1, H-18, W*0.8*(carga/max), 8);
    if(carga>=max){
      ctx.fillStyle='#f59e0b'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center';
      ctx.fillText('🏋️ BARRA LISTA — Toca 2 veces FUEGO', W/2, H-22);
    }
  }
  // Nave (entrenador)
  ctx.font='28px sans-serif'; ctx.textAlign='center';
  if(_invImg.entrenador) {
    var nw=48, nh=56;
    ctx.drawImage(_invImg.entrenador, _inv.nave.x-nw/2, _inv.nave.y-nh/2, nw, nh);
  } else {
    ctx.font='28px sans-serif'; ctx.textAlign='center';
    ctx.fillText('🏋️',_inv.nave.x,_inv.nave.y+10);
  }
  if(_inv.escudo){
    ctx.strokeStyle='#3b82f6'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(_inv.nave.x,_inv.nave.y,22,0,Math.PI*2); ctx.stroke();
  }
}


var _pen = { potTimer:null, potVal:0, potDir:1, animando:false, tiro:1, goles:0, mejor:0, lateral:50, altura:50, potencia:0, W:0, H:0 };

function penInit() {
  var canvas = document.getElementById('pen-canvas');
  if(!canvas) return;
  var W = canvas.offsetWidth;
  canvas.width = W;
  canvas.height = Math.round(W * 0.68);
  _pen.W = W; _pen.H = Math.round(W*0.68);
  _pen.tiro=1; _pen.goles=0; _pen.animando=false;
  _pen.mejor = parseInt(localStorage.getItem('pen_mejor')||0);
  _pen.lateral=50; _pen.altura=50; _pen.potVal=0;
  document.getElementById('pen-mejor').textContent = _pen.mejor;
  document.getElementById('pen-tiro').textContent = '1';
  document.getElementById('pen-goles').textContent = '0';
  penActLateral(); penActAltura();
  penStartPotencia();
  penDrawEstado(null, null, false, false);
}

function penActLateral() {
  var v = parseInt(document.getElementById('pen-lateral').value);
  _pen.lateral = v;
  var label = v < 25 ? '◀◀ Muy izquierda' : v < 42 ? '◀ Izquierda' : v > 75 ? 'Muy derecha ▶▶' : v > 58 ? 'Derecha ▶' : 'Centro';
  document.getElementById('pen-lat-val').textContent = label;
  if(!_pen.animando) penDrawEstado(null, null, false, false);
}

function penActAltura() {
  var v = parseInt(document.getElementById('pen-altura').value);
  _pen.altura = v;
  var label = v < 25 ? 'Muy raso' : v < 42 ? 'Raso' : v > 75 ? 'Muy alto' : v > 58 ? 'Alto' : 'Media altura';
  document.getElementById('pen-alt-val').textContent = label;
  if(!_pen.animando) penDrawEstado(null, null, false, false);
}

function penStartPotencia() {
  if(_pen.potTimer) clearInterval(_pen.potTimer);
  _pen.potVal = 0; _pen.potDir = 1;
  var velocidad = 18;
  _pen.potTimer = setInterval(function(){
    _pen.potVal += _pen.potDir * 2.2;
    if(_pen.potVal >= 100){ _pen.potVal=100; _pen.potDir=-1; }
    if(_pen.potVal <= 0){ _pen.potVal=0; _pen.potDir=1; velocidad = Math.max(10, velocidad-1); }
    var fill = document.getElementById('pen-pot-fill');
    var val = document.getElementById('pen-pot-val');
    if(!fill) { clearInterval(_pen.potTimer); return; }
    var p = _pen.potVal;
    var color = p < 30 ? '#555' : p < 55 ? '#22c55e' : p < 75 ? '#f59e0b' : '#e31e24';
    fill.style.width = p+'%';
    fill.style.background = 'linear-gradient(90deg,#333,'+color+')';
    if(val) val.textContent = Math.round(p)+'%';
  }, velocidad);
}

function penPararPotencia() {
  _pen.potencia = Math.round(_pen.potVal);
  clearInterval(_pen.potTimer);
}

function penLanzar() {
  if(_pen.animando) return;
  _pen.potencia = Math.round(_pen.potVal);
  clearInterval(_pen.potTimer);
  var lat = _pen.lateral;   // 0=izq extremo, 100=der extremo
  var alt = _pen.altura;    // 0=raso, 100=muy alto
  var pot = _pen.potencia;  // 0-100

  // --- Destino del balón ---
  var W = _pen.W, H = _pen.H;
  var gx = W*0.18, gy = H*0.05, gw = W*0.64, gh = H*0.30;
  // Posición en portería según sliders
  var destX = gx + (lat/100)*gw;
  var destY = gy + gh - (alt/100)*gh;

  // --- ¿Sale fuera? ---
  var fueraPorLado = lat < 8 || lat > 92;
  var fueraPorArriba = alt > 88 && pot > 70;
  var sinFuerza = pot < 18;
  var excesoPotencia = pot > 90 && alt > 60;

  // Si sale fuera ajustamos destino visual
  if(fueraPorLado) { destX = lat < 50 ? gx - W*0.12 : gx + gw + W*0.12; }
  if(fueraPorArriba || excesoPotencia) { destY = gy - H*0.15; }
  if(sinFuerza) { destX = W/2; destY = H*0.75; }

  // --- Portero IA ---
  // Lee parcialmente el lateral (70% acierto) y salta
  var aciertaLat = Math.random() < 0.62;
  var zonaLat = lat < 35 ? 'izq' : lat > 65 ? 'der' : 'cen';
  var porteroZona = aciertaLat ? zonaLat : ['izq','cen','der'][Math.floor(Math.random()*3)];
  // Portero NO llega a esquinas muy cerradas ni a tiros muy altos
  var porteroLlega = !(lat < 15 || lat > 85) && !(alt > 72) && pot < 82;

  // --- Resultado ---
  var gol = false;
  var motivo = '';
  if(sinFuerza) { motivo = '😅 ¡Sin potencia! El balón no llegó'; }
  else if(fueraPorLado) { motivo = lat < 50 ? '↙️ Afuera por la izquierda' : '↘️ Afuera por la derecha'; }
  else if(fueraPorArriba || excesoPotencia) { motivo = '🚀 ¡Demasiado alto! Por encima del arco'; }
  else if(porteroZona === zonaLat && porteroLlega) { motivo = '🧤 ¡Atajado! El portero lo leyó'; }
  else { gol = true; motivo = '⚽ ¡GOOOOL!'; }

  _pen.animando = true;
  document.getElementById('pen-btn').disabled = true;
  document.getElementById('pen-resultado').textContent = '';

  penAnimar(destX, destY, pot, gol, porteroZona, porteroLlega, sinFuerza, function(){
    _pen.animando = false;
    var res = document.getElementById('pen-resultado');
    if(res){ res.textContent = motivo; res.style.color = gol ? '#22c55e' : '#e31e24'; }
    if(gol){ _pen.goles++; document.getElementById('pen-goles').textContent = _pen.goles; }
    setTimeout(function(){
      if(_pen.tiro >= 5){ penFin(); return; }
      _pen.tiro++;
      document.getElementById('pen-tiro').textContent = _pen.tiro;
      if(res) res.textContent='';
      var btn = document.getElementById('pen-btn');
      if(btn){ btn.disabled=false; btn.textContent='⚽ LANZAR'; }
      penStartPotencia();
      penDrawEstado(null, null, false, false);
    }, 1800);
  });
}

function penAnimar(destX, destY, pot, gol, porteroZona, porteroLlega, sinFuerza, cb) {
  var canvas = document.getElementById('pen-canvas');
  if(!canvas){ cb(); return; }
  var W=_pen.W, H=_pen.H;
  var frames=0, total = sinFuerza ? 20 : Math.max(22, Math.round(40 - pot*0.15));
  var startX=W/2, startY=H*0.9;
  // Portero posición inicial al centro, salta a su zona
  var gx=W*0.18, gw=W*0.64;
  var portInicX = gx+gw/2;
  var portDestX = porteroZona==='izq' ? gx+gw*0.12 : porteroZona==='der' ? gx+gw*0.88 : gx+gw*0.5;

  var anim = setInterval(function(){
    frames++;
    var t = frames/total;
    var ease = t<0.5 ? 2*t*t : -1+(4-2*t)*t;
    // Balón — trayectoria con arco
    var bx = startX + (destX-startX)*ease;
    var arc = sinFuerza ? 0 : -H*0.08*Math.sin(Math.PI*t);
    var by = startY + (destY-startY)*ease + arc;
    var size = sinFuerza ? 20 : Math.max(8, 22 - t*14);
    // Portero salta en la segunda mitad
    var px = t < 0.4 ? portInicX : portInicX + (portDestX-portInicX)*((t-0.4)/0.6);
    var py_offset = porteroLlega && t > 0.5 ? -Math.sin((t-0.5)*Math.PI)*18 : 0;

    penDrawEstado({x:bx,y:by,size:size}, {x:px,yOff:py_offset}, gol && frames===total, false);
    if(frames>=total){ clearInterval(anim); cb(); }
  }, 22);
}

function penDrawEstado(balon, portero, mostrarGol, preview) {
  var canvas = document.getElementById('pen-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var W=_pen.W, H=_pen.H;

  // Fondo cancha con perspectiva
  var grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'#0d3d0d'); grad.addColorStop(1,'#1a5c1a');
  ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);

  // Líneas cancha
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
  ctx.strokeRect(W*0.05,H*0.02,W*0.9,H*0.9);
  ctx.beginPath(); ctx.moveTo(W*0.05,H*0.5); ctx.lineTo(W*0.95,H*0.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2,H*0.5,W*0.12,0,Math.PI*2); ctx.stroke();

  // Área grande
  ctx.strokeStyle='rgba(255,255,255,0.2)';
  ctx.strokeRect(W*0.15,H*0.02,W*0.7,H*0.42);

  // Portería 3D
  var gx=W*0.18, gy=H*0.05, gw=W*0.64, gh=H*0.30;
  // Sombra portería
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.fillRect(gx+4,gy+4,gw,gh);
  // Fondo red
  ctx.fillStyle='rgba(255,255,255,0.04)';
  ctx.fillRect(gx,gy,gw,gh);
  // Red
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=0.8;
  for(var i=1;i<9;i++){ ctx.beginPath();ctx.moveTo(gx+gw/9*i,gy);ctx.lineTo(gx+gw/9*i,gy+gh);ctx.stroke(); }
  for(var j=1;j<5;j++){ ctx.beginPath();ctx.moveTo(gx,gy+gh/5*j);ctx.lineTo(gx+gw,gy+gh/5*j);ctx.stroke(); }
  // Marco portería
  ctx.strokeStyle='#fff'; ctx.lineWidth=3;
  ctx.strokeRect(gx,gy,gw,gh);
  // Postes 3D
  ctx.fillStyle='#ddd';
  ctx.fillRect(gx-4,gy-4,8,gh+8);
  ctx.fillRect(gx+gw-4,gy-4,8,gh+8);
  ctx.fillRect(gx-4,gy-4,gw+8,8);

  // Indicador de puntería (preview)
  if(!balon) {
    var lat=_pen.lateral, alt=_pen.altura;
    var px2=gx+(lat/100)*gw, py2=gy+gh-(alt/100)*gh;
    var fueraPorLado = lat<8||lat>92;
    var fueraPorArriba = alt>88;
    if(!fueraPorLado && !fueraPorArriba){
      ctx.strokeStyle='rgba(255,255,0,0.4)'; ctx.lineWidth=1;
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(W/2,H*0.9); ctx.lineTo(px2,py2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(255,255,0,0.6)';
      ctx.beginPath(); ctx.arc(px2,py2,6,0,Math.PI*2); ctx.fill();
    }
  }

  // Punto penal
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(W/2,H*0.86,4,0,Math.PI*2); ctx.fill();

  // Portero
  var portX = gx+gw/2, portY = gy+gh*0.42, portYoff=0;
  if(portero){ portX=portero.x; portYoff=portero.yOff||0; }
  // Cuerpo portero
  ctx.fillStyle='#f59e0b';
  ctx.beginPath(); ctx.arc(portX,portY+portYoff,14,0,Math.PI*2); ctx.fill();
  ctx.font='18px sans-serif'; ctx.textAlign='center';
  ctx.fillText('🧤',portX,portY+portYoff+6);
  // Brazos extendidos
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(portX-14,portY+portYoff); ctx.lineTo(portX-28,portY+portYoff-8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(portX+14,portY+portYoff); ctx.lineTo(portX+28,portY+portYoff-8); ctx.stroke();

  // Balón
  if(balon){
    ctx.font=balon.size+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚽',balon.x,balon.y);
    // Sombra balón
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(balon.x, H*0.93, balon.size*0.4, balon.size*0.12, 0,0,Math.PI*2); ctx.fill();
  } else {
    ctx.font='22px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚽',W/2,H*0.9);
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(W/2,H*0.94,9,3,0,0,Math.PI*2); ctx.fill();
  }

  // GOL overlay
  if(mostrarGol){
    ctx.fillStyle='rgba(34,197,94,0.25)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#22c55e'; ctx.font='bold 28px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚽ GOOOOL!',W/2,H/2);
  }
}

function penFin() {
  clearInterval(_pen.potTimer);
  if(_pen.goles > _pen.mejor){
    _pen.mejor=_pen.goles;
    localStorage.setItem('pen_mejor',_pen.mejor);
    document.getElementById('pen-mejor').textContent=_pen.mejor;
  }
  var canvas=document.getElementById('pen-canvas');
  if(canvas){
    var ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,_pen.W,_pen.H);
    var emoji = _pen.goles>=5?'🏆':_pen.goles>=3?'⚽':'😅';
    var msg = _pen.goles>=5?'¡Golejada perfecta!':_pen.goles>=3?'¡Buen partido!':'Sigue entrenando...';
    ctx.fillStyle='#f59e0b'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
    ctx.fillText(emoji+' '+_pen.goles+'/5 goles',_pen.W/2,_pen.H/2-12);
    ctx.fillStyle='#aaa'; ctx.font='13px sans-serif';
    ctx.fillText(msg,_pen.W/2,_pen.H/2+14);
    if(_pen.goles===_pen.mejor && _pen.goles>0){
      ctx.fillStyle='#f59e0b'; ctx.font='12px sans-serif';
      ctx.fillText('🌟 ¡Nuevo récord!',_pen.W/2,_pen.H/2+34);
    }
  }
  var btn=document.getElementById('pen-btn');
  if(btn){
    btn.textContent='🔄 Jugar de nuevo'; btn.disabled=false;
    btn.onclick=function(){
      _pen.tiro=1; _pen.goles=0;
      document.getElementById('pen-tiro').textContent='1';
      document.getElementById('pen-goles').textContent='0';
      document.getElementById('pen-resultado').textContent='';
      btn.textContent='⚽ LANZAR';
      btn.onclick=penLanzar;
      penStartPotencia();
      penDrawEstado(null,null,false,false);
    };
  }
}

function renderSnake(c) {
  bloquearSwipe();
  c.innerHTML = `
    <button onclick="renderJuegos(document.getElementById('herramienta-contenido'))" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:10px">← Juegos</button>
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:15px;font-weight:700;color:var(--texto)">Snake DT</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:12px;color:var(--texto-secundario)">Puntos: <span id="sk-puntos" style="color:var(--texto);font-weight:700">0</span></div>
      <div id="sk-nivel-label" style="font-size:12px;font-weight:700;color:#e31e24">PRINCIPIANTE</div>
      <div style="font-size:12px;color:var(--texto-secundario)">Mejor: <span id="sk-mejor" style="color:#f59e0b;font-weight:700">0</span></div>
    </div>
    <canvas id="sk-canvas" style="width:100%;border-radius:12px;display:block;background:#111;border:1px solid #333"></canvas>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px;max-width:220px;margin-left:auto;margin-right:auto">
      <div></div>
      <button ontouchstart="skDir(0,-1)" onclick="skDir(0,-1)" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:18px;cursor:pointer">▲</button>
      <div></div>
      <button ontouchstart="skDir(-1,0)" onclick="skDir(-1,0)" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:18px;cursor:pointer">◀</button>
      <button ontouchstart="skPause()" onclick="skPause()" style="background:#e31e24;color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:700;cursor:pointer" id="sk-btn">▶</button>
      <button ontouchstart="skDir(1,0)" onclick="skDir(1,0)" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:18px;cursor:pointer">▶</button>
      <div></div>
      <button ontouchstart="skDir(0,1)" onclick="skDir(0,1)" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:18px;cursor:pointer">▼</button>
      <div></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;justify-content:center">
      <button onclick="skSetNivel(1)" style="background:var(--gris);color:#22c55e;border:1px solid #22c55e;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer">🟢 Principiante</button>
      <button onclick="skSetNivel(2)" style="background:var(--gris);color:#f59e0b;border:1px solid #f59e0b;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer">🟡 Intermedio</button>
      <button onclick="skSetNivel(3)" style="background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer">🔴 Avanzado</button>
      <button onclick="skSetNivel(4)" style="background:var(--gris);color:#7c3aed;border:1px solid #7c3aed;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer">💜 Elite</button>
    </div>`;
  skInit();
}

var _sk = {};
var _skColores = ['#e31e24','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316'];
var _skNiveles = { 1:{vel:200,obs:0,label:'PRINCIPIANTE'}, 2:{vel:130,obs:3,label:'INTERMEDIO'}, 3:{vel:80,obs:6,label:'AVANZADO'}, 4:{vel:50,obs:10,label:'ELITE'} };

function skInit() {
  var canvas = document.getElementById('sk-canvas');
  if(!canvas) return;
  var W = canvas.offsetWidth;
  canvas.width = W;
  canvas.height = W;
  var mejor = parseInt(localStorage.getItem('sk_mejor')||0);
  document.getElementById('sk-mejor').textContent = mejor;
  _sk = {
    W: W, cel: Math.floor(W/20), cols: 20, rows: 20,
    serpiente: [{x:10,y:10},{x:9,y:10},{x:8,y:10}],
    dir: {x:1,y:0}, nextDir: {x:1,y:0},
    comida: null, obstaculos: [],
    puntos: 0, mejor: mejor,
    nivel: 1, loop: null, corriendo: false, pausado: false
  };
  skGenerarComida();
  skDraw();
}

function skSetNivel(n) {
  if(_sk.loop) clearInterval(_sk.loop);
  _sk.nivel = n;
  _sk.serpiente = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  _sk.dir = {x:1,y:0}; _sk.nextDir = {x:1,y:0};
  _sk.puntos = 0; _sk.corriendo = false; _sk.pausado = false;
  _sk.obstaculos = [];
  document.getElementById('sk-puntos').textContent = 0;
  document.getElementById('sk-nivel-label').textContent = _skNiveles[n].label;
  document.getElementById('sk-btn').textContent = '▶';
  skGenerarObstaculos();
  skGenerarComida();
  skDraw();
}

function skGenerarObstaculos() {
  _sk.obstaculos = [];
  var cant = _skNiveles[_sk.nivel].obs;
  for(var i=0; i<cant; i++) {
    var o;
    do { o = {x:Math.floor(Math.random()*18)+1, y:Math.floor(Math.random()*18)+1}; }
    while(_sk.serpiente.some(function(s){return s.x===o.x&&s.y===o.y;}));
    _sk.obstaculos.push(o);
  }
}

function skGenerarComida() {
  var f;
  do { f = {x:Math.floor(Math.random()*19)+1, y:Math.floor(Math.random()*19)+1}; }
  while(_sk.serpiente.some(function(s){return s.x===f.x&&s.y===f.y;}) ||
        _sk.obstaculos.some(function(o){return o.x===f.x&&o.y===f.y;}));
  _sk.comida = f;
}

function skDir(x, y) {
  if(!_sk.corriendo) { skPause(); return; }
  if(x!==0 && _sk.dir.x!==0) return;
  if(y!==0 && _sk.dir.y!==0) return;
  _sk.nextDir = {x:x,y:y};
}

function skPause() {
  if(!_sk.corriendo) {
    _sk.corriendo = true; _sk.pausado = false;
    document.getElementById('sk-btn').textContent = '⏸';
    _sk.loop = setInterval(skStep, _skNiveles[_sk.nivel].vel);
  } else {
    _sk.corriendo = false;
    clearInterval(_sk.loop);
    document.getElementById('sk-btn').textContent = '▶';
  }
}

function skStep() {
  if(!document.getElementById('sk-canvas')) { clearInterval(_sk.loop); return; }
  _sk.dir = _sk.nextDir;
  var cab = {x:_sk.serpiente[0].x+_sk.dir.x, y:_sk.serpiente[0].y+_sk.dir.y};
  if(cab.x<0||cab.x>=_sk.cols||cab.y<0||cab.y>=_sk.rows) { skGameOver(); return; }
  if(_sk.serpiente.some(function(s){return s.x===cab.x&&s.y===cab.y;})) { skGameOver(); return; }
  if(_sk.obstaculos.some(function(o){return o.x===cab.x&&o.y===cab.y;})) { skGameOver(); return; }
  _sk.serpiente.unshift(cab);
  if(cab.x===_sk.comida.x && cab.y===_sk.comida.y) {
    _sk.puntos += _sk.nivel * 10;
    document.getElementById('sk-puntos').textContent = _sk.puntos;
    if(_sk.puntos > _sk.mejor) {
      _sk.mejor = _sk.puntos;
      localStorage.setItem('sk_mejor', _sk.mejor);
      document.getElementById('sk-mejor').textContent = _sk.mejor;
    }
    skGenerarComida();
    if(_sk.puntos % 50 === 0) skGenerarObstaculos();
  } else {
    _sk.serpiente.pop();
  }
  skDraw();
}

function skGameOver() {
  clearInterval(_sk.loop);
  _sk.corriendo = false;
  var canvas = document.getElementById('sk-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0,0,_sk.W,_sk.W);
  ctx.fillStyle = '#e31e24';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💀 GAME OVER', _sk.W/2, _sk.W/2-16);
  ctx.fillStyle = '#aaa';
  ctx.font = '14px sans-serif';
  ctx.fillText('Puntos: '+_sk.puntos, _sk.W/2, _sk.W/2+10);
  ctx.fillText('Toca ▶ para reiniciar', _sk.W/2, _sk.W/2+30);
  document.getElementById('sk-btn').textContent = '▶';
  _sk.serpiente = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  _sk.dir={x:1,y:0}; _sk.nextDir={x:1,y:0}; _sk.puntos=0;
  document.getElementById('sk-puntos').textContent=0;
  skGenerarObstaculos(); skGenerarComida();
}

function skDraw() {
  var canvas = document.getElementById('sk-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var cel = _sk.cel;
  ctx.fillStyle = '#111';
  ctx.fillRect(0,0,_sk.W,_sk.W);
  // Grid sutil
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.5;
  for(var i=0;i<_sk.cols;i++){
    ctx.beginPath();ctx.moveTo(i*cel,0);ctx.lineTo(i*cel,_sk.W);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i*cel);ctx.lineTo(_sk.W,i*cel);ctx.stroke();
  }
  // Obstáculos
  _sk.obstaculos.forEach(function(o){
    ctx.fillStyle = '#333';
    ctx.fillRect(o.x*cel+1,o.y*cel+1,cel-2,cel-2);
    ctx.fillStyle = '#555';
    ctx.font = (cel-4)+'px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('🧱',o.x*cel+cel/2,o.y*cel+cel-2);
  });
  // Comida
  if(_sk.comida){
    ctx.font = (cel-2)+'px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('🏋️',_sk.comida.x*cel+cel/2,_sk.comida.y*cel+cel-1);
  }
  // Serpiente
  _sk.serpiente.forEach(function(s,i){
    if(i===0){
      // Cabeza entrenador
      ctx.fillStyle = '#e31e24';
      ctx.beginPath();
      ctx.arc(s.x*cel+cel/2, s.y*cel+cel/2, cel/2-1, 0, Math.PI*2);
      ctx.fill();
      ctx.font = (cel-4)+'px sans-serif';
      ctx.textAlign='center';
      ctx.fillText('🏋️',s.x*cel+cel/2,s.y*cel+cel-2);
    } else {
      // Cuerpo clientes multicolor
      var color = _skColores[i % _skColores.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.x*cel+cel/2, s.y*cel+cel/2, cel/2-2, 0, Math.PI*2);
      ctx.fill();
      var emojis = ['🏃‍♂️','🏃‍♀️','🧑‍🦱','👩‍🦱','🧑‍🦰','👩‍🦰','🧑🏾','👩🏾'];
      ctx.font = (cel-6)+'px sans-serif';
      ctx.fillText(emojis[i%emojis.length],s.x*cel+cel/2,s.y*cel+cel-3);
    }
  });
}

function renderMemoria(c) {
  bloquearSwipe();
  c.innerHTML = `
    <button onclick="renderJuegos(document.getElementById('herramienta-contenido'))" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:10px">← Juegos</button>
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:15px;font-weight:700;color:var(--texto)">Memoria DT</div>
      <div style="font-size:11px;color:var(--texto-secundario);margin-top:3px">Encuentra todos los pares</div>
    </div>
    <div id="mem-niveles" style="display:flex;gap:8px;margin-bottom:14px">
      <button onclick="memStart(8)" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">
        😊 Fácil<div style="font-size:10px;font-weight:400;color:var(--texto-secundario)">16 cartas</div>
        <div style="font-size:10px;color:#f59e0b" id="mem-mejor-8">⏱ --</div>
      </button>
      <button onclick="memStart(10)" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">
        💪 Medio<div style="font-size:10px;font-weight:400;color:var(--texto-secundario)">20 cartas</div>
        <div style="font-size:10px;color:#f59e0b" id="mem-mejor-10">⏱ --</div>
      </button>
      <button onclick="memStart(12)" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">
        🔥 Difícil<div style="font-size:10px;font-weight:400;color:var(--texto-secundario)">24 cartas</div>
        <div style="font-size:10px;color:#f59e0b" id="mem-mejor-12">⏱ --</div>
      </button>
    </div>
    <div id="mem-hud" style="display:none;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="font-size:13px;color:var(--texto-secundario)">Pares: <span id="mem-pares" style="color:var(--texto);font-weight:700">0</span></div>
      <div style="font-size:16px;font-weight:700;color:#e31e24" id="mem-timer">00:00</div>
      <div style="font-size:13px;color:var(--texto-secundario)">Intentos: <span id="mem-intentos" style="color:var(--texto);font-weight:700">0</span></div>
    </div>
    <div id="mem-board" style="display:grid;gap:8px"></div>`;
  memCargarMejores();
}

var _mem = { pares:0, total:0, intentos:0, timer:null, seg:0, volteadas:[], bloqueado:false, nivel:8 };

var _memIconos = [
  '<img src="/images/Fuerza.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Cardio.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Mancuerna.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Proteina.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Shaker.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Termo.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Cronometro.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Correr.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Kettelball.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Guanterojo.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Soga_de_batir.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Trofeo.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Cerebro.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Fuego.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Mira.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Discobasico.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Bolso.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Equismancuerna.png" style="width:56px;height:56px;object-fit:contain">'
];

function memCargarMejores() {
  [8,10,12].forEach(function(n) {
    var mejor = localStorage.getItem('mem_mejor_'+n);
    var el = document.getElementById('mem-mejor-'+n);
    if(el && mejor) el.textContent = '⏱ ' + mejor;
  });
}

function memStart(pares) {
  _mem = { pares:0, total:pares, intentos:0, seg:0, volteadas:[], bloqueado:false, nivel:pares };
  clearInterval(_mem.timer);
  var hud = document.getElementById('mem-hud');
  var niveles = document.getElementById('mem-niveles');
  if(hud) hud.style.display='flex';
  if(niveles) niveles.style.display='none';
  document.getElementById('mem-pares').textContent = '0';
  document.getElementById('mem-intentos').textContent = '0';
  document.getElementById('mem-timer').textContent = '00:00';
  var iconos = _memIconos.slice(0, pares);
  var cartas = [...iconos, ...iconos].sort(function(){ return Math.random()-0.5; });
  var cols = pares === 8 ? 4 : pares === 10 ? 4 : 4;
  var board = document.getElementById('mem-board');
  board.style.gridTemplateColumns = 'repeat('+cols+',1fr)';
  board.innerHTML = cartas.map(function(svg, i) {
    return '<div id="mc'+i+'" onclick="memVoltear('+i+')" data-idx="'+i+'" data-svg="'+encodeURIComponent(svg)+'" style="background:var(--gris);border:1px solid #333;border-radius:10px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:22px;transition:background .2s">🏋️</div>';
  }).join('');
  cartas.forEach(function(svg, i) {
    document.getElementById('mc'+i).dataset.svg = encodeURIComponent(svg);
  });
  board.innerHTML = cartas.map(function(svg, i) {
    return '<div id="mc'+i+'" onclick="memVoltear('+i+')" style="background:#1a1a1a;border:2px solid #333;border-radius:10px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden" data-svg="'+encodeURIComponent(svg)+'" data-volteada="0" data-encontrada="0"><span style="font-size:20px">💪</span></div>';
  }).join('');
  _mem.timer = setInterval(function(){
    _mem.seg++;
    var m = Math.floor(_mem.seg/60).toString().padStart(2,'0');
    var s = (_mem.seg%60).toString().padStart(2,'0');
    var t = document.getElementById('mem-timer');
    if(t) t.textContent = m+':'+s;
  }, 1000);
}

function memVoltear(i) {
  if(_mem.bloqueado) return;
  var el = document.getElementById('mc'+i);
  if(!el || el.dataset.encontrada==='1' || el.dataset.volteada==='1') return;
  el.dataset.volteada = '1';
  el.style.background = '#2a2a2a';
  el.style.borderColor = '#e31e24';
  el.innerHTML = decodeURIComponent(el.dataset.svg);
  _mem.volteadas.push(i);
  if(_mem.volteadas.length === 2) {
    _mem.bloqueado = true;
    _mem.intentos++;
    document.getElementById('mem-intentos').textContent = _mem.intentos;
    var a = document.getElementById('mc'+_mem.volteadas[0]);
    var b = document.getElementById('mc'+_mem.volteadas[1]);
    if(a.dataset.svg === b.dataset.svg) {
      a.dataset.encontrada = '1'; b.dataset.encontrada = '1';
      a.style.borderColor = '#22c55e'; b.style.borderColor = '#22c55e';
      a.style.background = '#052e16'; b.style.background = '#052e16';
      _mem.pares++;
      document.getElementById('mem-pares').textContent = _mem.pares;
      _mem.volteadas = [];
      _mem.bloqueado = false;
      if(_mem.pares === _mem.total) memGanar();
    } else {
      setTimeout(function(){
        a.dataset.volteada='0'; b.dataset.volteada='0';
        a.style.background='#1a1a1a'; b.style.background='#1a1a1a';
        a.style.borderColor='#333'; b.style.borderColor='#333';
        a.innerHTML='<span style="font-size:20px">💪</span>';
        b.innerHTML='<span style="font-size:20px">💪</span>';
        _mem.volteadas=[];
        _mem.bloqueado=false;
      }, 900);
    }
  }
}

function memGanar() {
  clearInterval(_mem.timer);
  var m = Math.floor(_mem.seg/60).toString().padStart(2,'0');
  var s = (_mem.seg%60).toString().padStart(2,'0');
  var tiempo = m+':'+s;
  var mejor = localStorage.getItem('mem_mejor_'+_mem.nivel);
  var esMejor = !mejor || _mem.seg < parseInt(mejor.replace(':',''));
  if(esMejor) localStorage.setItem('mem_mejor_'+_mem.nivel, tiempo);
  var board = document.getElementById('mem-board');
  if(board) board.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px 0"><div style="font-size:40px">🏆</div><div style="font-size:16px;font-weight:700;color:#22c55e;margin-top:8px">¡Completado!</div><div style="font-size:13px;color:var(--texto-secundario);margin-top:6px">Tiempo: '+tiempo+'</div><div style="font-size:12px;color:#f59e0b;margin-top:4px">'+(esMejor?'🌟 Nuevo récord!':'Mejor: '+mejor)+'</div><button onclick="renderMemoria(document.getElementById(\'herramienta-contenido\'))" style="margin-top:16px;background:#e31e24;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer">Jugar de nuevo</button></div>';
}


function renderTriqui(c) {
  bloquearSwipe();
  c.innerHTML = `
    <button onclick="renderJuegos(document.getElementById('herramienta-contenido'))" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:14px">← Juegos</button>
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:15px;font-weight:700;color:var(--texto)">Triqui DT</div>
      <div id="triqui-status" style="font-size:12px;color:var(--texto-secundario);margin-top:4px">Turno: 🏋️ Entrenador</div>
    </div>
    <div id="triqui-board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px;margin:0 auto 16px">
    </div>
    <div style="text-align:center">
      <button onclick="triquiReset()" style="background:#e31e24;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer">🔄 Nueva partida</button>
    </div>`;
  triquiInit();
}

var _triqui = { board: Array(9).fill(null), turno: 0, activo: true };
var _triquiJugadores = [
  { nombre: 'Entrenador', emoji: '<img src="/images/Equismancuerna.png" style="width:48px;height:48px;object-fit:contain">', color: '#e31e24' },
  { nombre: 'Cliente',    emoji: '<img src="/images/Kettelball.png" style="width:48px;height:48px;object-fit:contain">', color: '#3b82f6' }
];
var _triquiGanador = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function triquiInit() {
  _triqui = { board: Array(9).fill(null), turno: 0, activo: true };
  triquiRender();
}
function triquiReset() { triquiInit(); }

function triquiJugar(i) {
  if (!_triqui.activo || _triqui.board[i]) return;
  _triqui.board[i] = _triqui.turno;
  var ganador = triquiChequear();
  if (ganador !== null) {
    _triqui.activo = false;
    triquiRender();
    var st = document.getElementById('triqui-status');
    if (ganador === -1) {
      st.innerHTML = '🤝 ¡Empate!';
      st.style.color = '#f59e0b';
    } else {
      var j = _triquiJugadores[ganador];
      st.innerHTML = j.emoji + ' ¡' + j.nombre + ' gana!';
      st.style.color = j.color;
    }
    return;
  }
  _triqui.turno = _triqui.turno === 0 ? 1 : 0;
  triquiRender();
  var j = _triquiJugadores[_triqui.turno];
  document.getElementById('triqui-status').innerHTML = 'Turno: ' + j.emoji + ' ' + j.nombre;
}

function triquiChequear() {
  var b = _triqui.board;
  for (var w of _triquiGanador) {
    if (b[w[0]] !== null && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]) return b[w[0]];
  }
  if (b.every(function(x){ return x !== null; })) return -1;
  return null;
}

function triquiRender() {
  var board = document.getElementById('triqui-board');
  if (!board) return;
  var html = '';
  for (var i = 0; i < 9; i++) {
    var val = _triqui.board[i];
    var contenido = val !== null ? _triquiJugadores[val].emoji : '';
    var color = val !== null ? _triquiJugadores[val].color : 'transparent';
    html += '<div onclick="triquiJugar(' + i + ')" style="background:var(--card);border:2px solid ' + (val !== null ? color : '#333') + ';border-radius:12px;height:80px;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;transition:border .2s">' + contenido + '</div>';
  }
  board.innerHTML = html;
}
// ═══════════════════════════════
// SWIPE ENTRE PESTAÑAS
// ═══════════════════════════════
const _pages=['clientes','rutinas','logs','enviar'];
let _swipeStartX=0;
let _swipeStartY=0;
let _swipeActivo=false;

// swipe entre pestañas desactivado
// ═══════════════════════════════
// DRAG & DROP TÁCTIL RUTINAS
// ═══════════════════════════════
let _touchDragEl=null;
let _touchDragIdx=null;
let _touchDragTipo=null;
let _touchClone=null;
let _touchOffsetX=0;
let _touchOffsetY=0;

function rutTouchStart(e,i,tipo){
  guardarEjsActuales();
  _touchDragIdx=i;
  _touchDragTipo=tipo;
  _touchDragEl=e.currentTarget;
  const rect=_touchDragEl.getBoundingClientRect();
  _touchOffsetX=e.touches[0].clientX-rect.left;
  _touchOffsetY=e.touches[0].clientY-rect.top;
  _touchClone=_touchDragEl.cloneNode(true);
  _touchClone.style.position='fixed';
  _touchClone.style.width=rect.width+'px';
  _touchClone.style.opacity='0.7';
  _touchClone.style.zIndex='9999';
  _touchClone.style.pointerEvents='none';
  _touchClone.style.left=(e.touches[0].clientX-_touchOffsetX)+'px';
  _touchClone.style.top=(e.touches[0].clientY-_touchOffsetY)+'px';
  document.body.appendChild(_touchClone);
  _touchDragEl.style.opacity='0.3';
  e.preventDefault();
}

function rutTouchMove(e){
  if(!_touchClone)return;
  _touchClone.style.left=(e.touches[0].clientX-_touchOffsetX)+'px';
  _touchClone.style.top=(e.touches[0].clientY-_touchOffsetY)+'px';
  e.preventDefault();
}

function rutTouchEnd(e){
  if(!_touchClone)return;
  const x=e.changedTouches[0].clientX;
  const y=e.changedTouches[0].clientY;
  _touchClone.remove();
  _touchClone=null;
  if(_touchDragEl)_touchDragEl.style.opacity='1';
  const selector='[id^="rut-drag-'+_touchDragTipo+'-"]';
  const els=document.querySelectorAll(selector);
  let targetIdx=null;
  els.forEach(el=>{
    const rect=el.getBoundingClientRect();
    if(x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom){
      const id=el.id;
      targetIdx=parseInt(id.split('-').pop());
    }
  });
  if(targetIdx!==null&&targetIdx!==_touchDragIdx){
    const dia=diaSeleccionado;
    if(_touchDragTipo==='ej'){
      const arr=rutinaActual[dia].ejercicios||[];
      const item=arr.splice(_touchDragIdx,1)[0];
      arr.splice(targetIdx,0,item);
      rutinaActual[dia].ejercicios=arr;
    } else {
      const arr=rutinaActual[dia].cardio||[];
      const item=arr.splice(_touchDragIdx,1)[0];
      arr.splice(targetIdx,0,item);
      rutinaActual[dia].cardio=arr;
    }
    renderRutinaForm();
  }
  _touchDragIdx=null;
  _touchDragTipo=null;
  _touchDragEl=null;
}
// ═══════════════════════════════
// DRAG & DROP RUTINAS
// ═══════════════════════════════
let _rutDragIdx=null;
let _rutDragTipo=null;

function rutDragStart(e,i,tipo){
  guardarEjsActuales();
  _rutDragIdx=i;
  _rutDragTipo=tipo;
  e.target.style.opacity='0.4';
}
function rutDragOver(e,i,tipo){
  e.preventDefault();
  if(tipo!==_rutDragTipo)return;
  document.querySelectorAll('[id^="rut-drag-"]').forEach(el=>el.style.borderTop='');
  var el=document.getElementById('rut-drag-'+tipo+'-'+i);
  if(el)el.style.borderTop='2px solid #e31e24';
}
function rutDrop(e,i,tipo){
  e.preventDefault();
  if(_rutDragIdx===null||_rutDragIdx===i||tipo!==_rutDragTipo)return;
  var dia=diaSeleccionado;
  if(tipo==='ej'){
    var arr=rutinaActual[dia].ejercicios||[];
    var item=arr.splice(_rutDragIdx,1)[0];
    arr.splice(i,0,item);
    rutinaActual[dia].ejercicios=arr;
  } else {
    var arr=rutinaActual[dia].cardio||[];
    var item=arr.splice(_rutDragIdx,1)[0];
    arr.splice(i,0,item);
    rutinaActual[dia].cardio=arr;
  }
  _rutDragIdx=null;
  renderRutinaForm();
}
function rutDragEnd(e){
  _rutDragIdx=null;
  e.target.style.opacity='1';
  document.querySelectorAll('[id^="rut-drag-"]').forEach(el=>el.style.borderTop='');
}
// ═══════════════════════════════

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

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public', 'js', 'admin-inicio.js');
let contenido = fs.readFileSync(file, 'utf8');

const viejo = `window._usuariosCargados=usuarios;
const sActivos=usuarios.filter(u=>u.activo).length;
const sPersonalizados=usuarios.filter(u=>u.activo&&u.tipo==='personalizado').length;
const sAsesorados=usuarios.filter(u=>u.activo&&u.tipo==='asesorado').length;
const sPausados=usuarios.filter(u=>!u.activo).length;
document.getElementById('stat-activos').textContent=sActivos;
document.getElementById('stat-personalizados').textContent=sPersonalizados;
document.getElementById('stat-asesorados').textContent=sAsesorados;
document.getElementById('stat-pausados').textContent=sPausados;`;

if (!contenido.includes(viejo)) {
  console.error('❌ No se encontró el bloque exacto a reemplazar. No se modificó nada.');
  process.exit(1);
}

const nuevo = `window._usuariosCargados=usuarios;
const _ordenAsc=window._ordenClientesAsc||false;
usuarios.sort((a,b)=>{
  if(!!a.activo!==!!b.activo) return a.activo?-1:1;
  const ta=a.fecha_registro?new Date(a.fecha_registro).getTime():0;
  const tb=b.fecha_registro?new Date(b.fecha_registro).getTime():0;
  return _ordenAsc?(ta-tb):(tb-ta);
});
window._usuariosCargados=usuarios;
const sActivos=usuarios.filter(u=>u.activo).length;
const sPersonalizados=usuarios.filter(u=>u.activo&&u.tipo==='personalizado').length;
const sAsesorados=usuarios.filter(u=>u.activo&&u.tipo==='asesorado').length;
const sPausados=usuarios.filter(u=>!u.activo).length;
const sProximo=usuarios.filter(u=>u.activo&&u.estado_pago==='proximo').length;
const sVencido=usuarios.filter(u=>u.activo&&u.estado_pago==='vencido').length;
const chipsDefs=[
  {id:'todos',label:'Todos',n:usuarios.length},
  {id:'activos',label:'🟢 Activos',n:sActivos},
  {id:'pausados',label:'⏸️ Pausados',n:sPausados},
  {id:'personalizado',label:'💪 Personaliz.',n:sPersonalizados},
  {id:'asesorado',label:'📋 Asesorados',n:sAsesorados},
  {id:'proximo',label:'⚠️ Próximo',n:sProximo},
  {id:'vencido',label:'🔴 Vencido',n:sVencido}
];
const chipSel=window._chipClienteSel||'todos';
const chipsEl=document.getElementById('chips-clientes');
if(chipsEl){
  chipsEl.innerHTML=chipsDefs.map(c=>\`<div onclick="filtrarClientesPorChip('\${c.id}')" style="display:inline-block;font-size:11px;font-weight:700;padding:6px 12px;border-radius:20px;cursor:pointer;\${chipSel===c.id?'background:#e31e24;color:#fff':'background:var(--card);color:var(--texto-medio);border:1px solid #333'}">\${c.label} \${c.n}</div>\`).join('');
}`;

contenido = contenido.replace(viejo, nuevo);
fs.writeFileSync(file, contenido);
console.log('✅ cargarClientes() actualizado con orden y chips.');

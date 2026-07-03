const fs = require('fs');
const path = require('path');

// 1. Simplificar filtrarClientesPorChip
const fileCronos = path.join(__dirname, 'public', 'js', 'herramientas-cronos.js');
let cCronos = fs.readFileSync(fileCronos, 'utf8');
const viejoFn = cCronos.match(/function filtrarClientesPorChip\(tipo\)\{[\s\S]*?\n\}\n/);
if (!viejoFn) { console.error('❌ No se encontró filtrarClientesPorChip. No se modificó nada.'); process.exit(1); }
const nuevoFn = `function filtrarClientesPorChip(tipo){
  window._chipClienteSel=tipo;
  cargarClientes();
}
`;
cCronos = cCronos.replace(viejoFn[0], nuevoFn);
fs.writeFileSync(fileCronos, cCronos);

// 2. Agregar el filtrado al final de cargarClientes(), justo despues de pintar chips
const fileAdmin = path.join(__dirname, 'public', 'js', 'admin-inicio.js');
let cAdmin = fs.readFileSync(fileAdmin, 'utf8');
const ancla = `  chipsEl.innerHTML=chipsDefs.map(c=>\`<div onclick="filtrarClientesPorChip('\${c.id}')" style="display:inline-block;font-size:11px;font-weight:700;padding:6px 12px;border-radius:20px;cursor:pointer;\${chipSel===c.id?'background:#e31e24;color:#fff':'background:var(--card);color:var(--texto-medio);border:1px solid #333'}">\${c.label} \${c.n}</div>\`).join('');
}`;
if (!cAdmin.includes(ancla)) { console.error('❌ No se encontró el cierre de chipsEl en admin-inicio.js. No se modificó nada.'); process.exit(1); }
const nuevoAncla = ancla.slice(0, -1) + `
document.querySelectorAll('#lista-clientes>div').forEach((d,i)=>{
  const u=usuarios[i];
  if(!u) return;
  let pasa=true;
  if(chipSel==='activos') pasa=!!u.activo;
  else if(chipSel==='pausados') pasa=!u.activo;
  else if(chipSel==='personalizado') pasa=u.activo&&u.tipo==='personalizado';
  else if(chipSel==='asesorado') pasa=u.activo&&u.tipo==='asesorado';
  else if(chipSel==='proximo') pasa=u.activo&&u.estado_pago==='proximo';
  else if(chipSel==='vencido') pasa=u.activo&&u.estado_pago==='vencido';
  d.style.display=pasa?'flex':'none';
});
}`;
cAdmin = cAdmin.replace(ancla, nuevoAncla);
fs.writeFileSync(fileAdmin, cAdmin);

console.log('✅ Corrección aplicada en ambos archivos.');

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public', 'js', 'herramientas-cronos.js');
let contenido = fs.readFileSync(file, 'utf8');

const ancla = `function filtrarRutinas(){`;

if (!contenido.includes(ancla)) {
  console.error('❌ No se encontró el marcador esperado. No se modificó nada.');
  process.exit(1);
}

const nuevasFunciones = `function filtrarClientesPorChip(tipo){
  window._chipClienteSel=tipo;
  const usuarios=window._usuariosCargados||[];
  document.querySelectorAll('#lista-clientes>div').forEach((d,i)=>{
    const u=usuarios[i];
    if(!u){ return; }
    let pasa=true;
    if(tipo==='activos') pasa=!!u.activo;
    else if(tipo==='pausados') pasa=!u.activo;
    else if(tipo==='personalizado') pasa=u.activo&&u.tipo==='personalizado';
    else if(tipo==='asesorado') pasa=u.activo&&u.tipo==='asesorado';
    else if(tipo==='proximo') pasa=u.activo&&u.estado_pago==='proximo';
    else if(tipo==='vencido') pasa=u.activo&&u.estado_pago==='vencido';
    d.style.display=pasa?'flex':'none';
  });
  const q=document.getElementById('buscador-clientes').value.toLowerCase();
  if(q) filtrarClientes();
  cargarClientes();
}

function toggleOrdenClientes(){
  window._ordenClientesAsc=!window._ordenClientesAsc;
  cargarClientes();
}

`;

contenido = contenido.replace(ancla, nuevasFunciones + ancla);
fs.writeFileSync(file, contenido);
console.log('✅ Funciones de chips y orden agregadas.');

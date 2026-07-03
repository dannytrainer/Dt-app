const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'public', 'index.html');
let contenido = fs.readFileSync(file, 'utf8');

const inicio = '<input type="text" id="buscador-clientes"';
const finTexto = '<p class="st">Clientes registrados</p>';

const idxInicio = contenido.indexOf(inicio);
const idxFinTag = contenido.indexOf(finTexto, idxInicio);

if (idxInicio === -1 || idxFinTag === -1) {
  console.error('❌ No se encontraron los marcadores esperados. No se modificó nada.');
  process.exit(1);
}

const idxFin = idxFinTag + finTexto.length;

const nuevoBloque = `<div style="display:flex;gap:8px;margin-bottom:10px">
<input type="text" id="buscador-clientes" placeholder="🔍 Buscar cliente..." oninput="filtrarClientes()" style="flex:1;background:var(--card);border:1px solid #333;border-radius:8px;padding:11px;color:var(--texto-suave);font-size:14px;outline:none">
<button onclick="toggleOrdenClientes()" style="background:var(--card);border:1px solid #333;border-radius:8px;padding:11px 14px;color:var(--texto-suave);font-size:16px;cursor:pointer">⇅</button>
</div>
<div id="chips-clientes" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;white-space:nowrap"></div>`;

contenido = contenido.slice(0, idxInicio) + nuevoBloque + contenido.slice(idxFin);
fs.writeFileSync(file, contenido);
console.log('✅ HTML de filtro de clientes aplicado.');

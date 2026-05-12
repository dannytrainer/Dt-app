const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

// Agregar buscador en pestaña clientes
c = c.replace(
  '<p class="st">Clientes registrados</p>\n<div id="lista-clientes"></div>',
  '<input type="text" id="buscador-clientes" placeholder="🔍 Buscar cliente..." oninput="filtrarClientes()" style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:11px;color:#f0f0f0;font-size:14px;outline:none;margin-bottom:12px">\n<p class="st">Clientes registrados</p>\n<div id="lista-clientes"></div>'
);

// Agregar buscador en pestaña rutinas
c = c.replace(
  '<p class="st">Selecciona un cliente</p>\n<div id="lista-rutinas-clientes"></div>',
  '<input type="text" id="buscador-rutinas" placeholder="🔍 Buscar cliente..." oninput="filtrarRutinas()" style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:11px;color:#f0f0f0;font-size:14px;outline:none;margin-bottom:12px">\n<p class="st">Selecciona un cliente</p>\n<div id="lista-rutinas-clientes"></div>'
);

// Agregar funciones de filtro
c = c.replace(
  'cargarClientes();',
  `cargarClientes();

let todosLosClientes = [];

async function cargarClientesConCache() {
  const res = await fetch('/api/usuarios');
  todosLosClientes = await res.json();
  renderClientes(todosLosClientes);
}

function filtrarClientes() {
  const q = document.getElementById('buscador-clientes').value.toLowerCase();
  const filtrados = todosLosClientes.filter(u => u.nombre.toLowerCase().includes(q));
  renderClientes(filtrados);
}

function filtrarRutinas() {
  const q = document.getElementById('buscador-rutinas').value.toLowerCase();
  const filtrados = todosLosClientes.filter(u => u.nombre.toLowerCase().includes(q));
  renderRutinasClientes(filtrados);
}

function renderRutinasClientes(usuarios) {
  document.getElementById('lista-rutinas-clientes').innerHTML = usuarios.map(u => \`
    <div class="card" onclick="abrirRutina('\${u.id}','\${u.nombre}')" style="cursor:pointer">
    <div style="display:flex;align-items:center;gap:12px">
    <div class="avatar">\${u.nombre[0].toUpperCase()}</div>
    <div style="flex:1"><div style="font-weight:700">\${u.nombre}</div>
    <div style="font-size:12px;color:#777">Toca para editar rutina</div></div>
    <span style="color:#e31e24;font-size:22px">›</span>
    </div></div>\`).join('');
}

cargarClientes();`
);

fs.writeFileSync('public/index.html', c);
console.log('ok');

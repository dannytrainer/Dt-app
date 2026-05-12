const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

// Agregar filtro simple directo en cargarClientes
c = c.replace(
  "function filtrarClientes() {\n  const q = document.getElementById('buscador-clientes').value.toLowerCase();\n  const filtrados = todosLosClientes.filter(u => u.nombre.toLowerCase().includes(q));\n  renderClientes(filtrados);\n}",
  `function filtrarClientes() {
  const q = document.getElementById('buscador-clientes').value.toLowerCase().trim();
  const cards = document.querySelectorAll('#lista-clientes > div');
  cards.forEach(card => {
    const nombre = card.querySelector('div[style*="font-size:16px"]');
    if (!nombre) return;
    card.style.display = nombre.textContent.toLowerCase().includes(q) ? 'block' : 'none';
  });
}

function filtrarRutinas() {
  const q = document.getElementById('buscador-rutinas').value.toLowerCase().trim();
  const cards = document.querySelectorAll('#lista-rutinas-clientes > div');
  cards.forEach(card => {
    const nombre = card.querySelector('div[style*="font-weight:700"]');
    if (!nombre) return;
    card.style.display = nombre.textContent.toLowerCase().includes(q) ? 'block' : 'none';
  });
}`
);

fs.writeFileSync('public/index.html', c);
console.log('ok');

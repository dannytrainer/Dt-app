const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

// Buscador clientes
c = c.replace(
  '<p class="st">Clientes registrados</p>',
  '<input type="text" id="buscador-clientes" placeholder="🔍 Buscar cliente..." oninput="filtrarClientes()" style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:11px;color:#f0f0f0;font-size:14px;outline:none;margin-bottom:12px"><p class="st">Clientes registrados</p>'
);

// Buscador rutinas
c = c.replace(
  '<p class="st">Selecciona un cliente</p>',
  '<input type="text" id="buscador-rutinas" placeholder="🔍 Buscar cliente..." oninput="filtrarRutinas()" style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:11px;color:#f0f0f0;font-size:14px;outline:none;margin-bottom:12px"><p class="st">Selecciona un cliente</p>'
);

// Funciones de filtro simples
c = c.replace(
  '</script>',
  `function filtrarClientes(){
  const q=document.getElementById('buscador-clientes').value.toLowerCase();
  document.querySelectorAll('#lista-clientes>div').forEach(d=>{
    d.style.display=d.innerText.toLowerCase().includes(q)?'block':'none';
  });
}
function filtrarRutinas(){
  const q=document.getElementById('buscador-rutinas').value.toLowerCase();
  document.querySelectorAll('#lista-rutinas-clientes>div').forEach(d=>{
    d.style.display=d.innerText.toLowerCase().includes(q)?'block':'none';
  });
}
</script>`
);

fs.writeFileSync('public/index.html', c);
console.log('ok');

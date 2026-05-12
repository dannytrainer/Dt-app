const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

// Reemplazar cargarClientes para que use el cache
c = c.replace(
  'async function cargarClientes(){\nconst res=await fetch(\'/api/usuarios\');\nconst usuarios=await res.json();',
  'async function cargarClientes(){\nconst res=await fetch(\'/api/usuarios\');\nconst usuarios=await res.json();\ntodosLosClientes=usuarios;'
);

// Reemplazar renderizado directo por funcion renderClientes
c = c.replace(
  'lista.innerHTML=usuarios.map(u=>{',
  'renderClientes(usuarios);\n}\n\nfunction renderClientes(usuarios){\nconst lista=document.getElementById(\'lista-clientes\');\nconst empty=document.getElementById(\'empty-clientes\');\nif(!usuarios.length){lista.innerHTML=\'\';empty.style.display=\'block\';return;}\nempty.style.display=\'none\';\nlista.innerHTML=usuarios.map(u=>{'
);

// Quitar el cierre duplicado
c = c.replace(
  '}).join(\'\');\n}\n\nfunction selEstado',
  '}).join(\'\');\n}\n\nfunction selEstado'
);

fs.writeFileSync('public/index.html', c);
console.log('ok');

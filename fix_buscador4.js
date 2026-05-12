const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');

// Eliminar todas las funciones de filtro existentes
c = c.replace(/function filtrarClientes\(\)[\s\S]*?(?=function|\}\s*cargarClientes)/g, '');
c = c.replace(/function filtrarRutinas\(\)[\s\S]*?(?=function)/g, '');
c = c.replace(/function renderRutinasClientes[\s\S]*?(?=function)/g, '');
c = c.replace(/function renderClientes[\s\S]*?(?=function)/g, '');
c = c.replace(/let todosLosClientes = \[\];/g, '');
c = c.replace(/async function cargarClientesConCache[\s\S]*?(?=function)/g, '');

// Agregar funciones limpias antes del cierre del script
c = c.replace(
  'cargarClientes();\nsetInterval',
  `function filtrarClientes(){
  const q=document.getElementById('buscador-clientes').value.toLowerCase();
  document.querySelectorAll('#lista-clientes>div').forEach(d=>{
    d.style.display=d.innerText.toLowerCase().includes(q)?'':'none';
  });
}
function filtrarRutinas(){
  const q=document.getElementById('buscador-rutinas').value.toLowerCase();
  document.querySelectorAll('#lista-rutinas-clientes>div').forEach(d=>{
    d.style.display=d.innerText.toLowerCase().includes(q)?'':'none';
  });
}
cargarClientes();
setInterval`
);

fs.writeFileSync('public/index.html', c);
console.log('ok');

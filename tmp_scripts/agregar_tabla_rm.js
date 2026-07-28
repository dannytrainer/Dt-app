const fs = require('fs');

// 1) Agregar funcion global toggleTablaRM al final de app-pesos.js
const pathPesos = 'public/js/app-pesos.js';
let cPesos = fs.readFileSync(pathPesos, 'utf8');
const funcionToggle = `

function toggleTablaRM(el) {
  var t = el.nextElementSibling;
  if (!t) return;
  if (t.style.display === 'none' || t.style.display === '') {
    t.style.display = 'flex';
    el.textContent = 'Ocultar tabla \u25B4';
  } else {
    t.style.display = 'none';
    el.textContent = 'Ver tabla completa \u25BE';
  }
}
`;
if (!cPesos.includes('function toggleTablaRM')) {
  cPesos += funcionToggle;
  fs.writeFileSync(pathPesos, cPesos, 'utf8');
  console.log('OK: toggleTablaRM agregada en app-pesos.js');
} else {
  console.log('YA EXISTIA toggleTablaRM en app-pesos.js, no se toco');
}

// 2) Insertar boton + tabla en herramientas-enc.js y admin-inicio.js
const archivos = ['public/js/herramientas-enc.js', 'public/js/admin-inicio.js'];

const buscar = `      h += '</div>';
      if (semanas.length > 1) {`;

const nuevo = `      h += '</div>';
      if (res.rm_estimado) {
        var repsObjetivo = [1,2,3,4,5,6,7,8,10,12,15];
        var tablaHtml = '<div style="display:none;flex-wrap:wrap;gap:6px;margin-top:8px">';
        repsObjetivo.forEach(function(rep){
          var pesoRep = res.rm_estimado / (1 + rep/30);
          tablaHtml += '<div style="background:#0f0f0f;border:1px solid #2a2a2a;border-radius:6px;padding:6px 8px;text-align:center;min-width:44px"><div style="font-size:13px;font-weight:800;color:#fff">' + Math.round(pesoRep) + '</div><div style="font-size:8px;color:var(--texto-medio);text-transform:uppercase">' + rep + 'RM</div></div>';
        });
        tablaHtml += '</div>';
        h += '<div onclick="toggleTablaRM(this)" style="font-size:11px;color:#888;text-align:center;cursor:pointer;padding:6px 4px;margin-top:4px">Ver tabla completa \u25BE</div>';
        h += tablaHtml;
      }
      if (semanas.length > 1) {`;

archivos.forEach(path => {
  let c = fs.readFileSync(path, 'utf8');
  if (c.includes(buscar)) {
    c = c.replace(buscar, nuevo);
    fs.writeFileSync(path, c, 'utf8');
    console.log('OK aplicado en', path);
  } else {
    console.log('NO SE ENCONTRO en', path);
  }
});

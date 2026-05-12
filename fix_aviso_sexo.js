const fs = require('fs');
let c = fs.readFileSync('public/medidas.js', 'utf8');
c = c.replace(
  "if (!html) html = '<p style=\"color:#555;text-align:center;padding:30px\">Registra pliegues y medidas<br>para ver el análisis</p>';",
  `if (!calc.pctGrasa && (!usuario.perfil || !usuario.perfil.sexo)) {
    html = '<div style="background:#2a1a00;border:1px solid #ff9800;border-radius:10px;padding:16px;text-align:center"><div style="color:#ff9800;font-weight:700;margin-bottom:8px">⚠️ Falta información</div><div style="color:#ccc;font-size:13px">Ve a la pestaña <b>Perfil</b> y completa el <b>sexo</b> del cliente para calcular % de grasa correctamente.</div></div>';
  } else if (!html) {
    html = '<p style="color:#555;text-align:center;padding:30px">Registra pliegues y medidas<br>para ver el análisis</p>';
  }`
);
fs.writeFileSync('public/medidas.js', c);
console.log('ok3');

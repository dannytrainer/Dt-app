const fs = require('fs');

// 1. Actualizar rutas_historial para guardar analisis con cada medicion
let r = fs.readFileSync('rutas_historial.js', 'utf8');
r = r.replace(
  "h[req.params.id].medidas.push({ fecha: new Date().toISOString().split('T')[0], ...req.body });",
  `const calc = require('./calculos');
  const u = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
  const usuario = u.find(x => x.id === req.params.id);
  const perfil = usuario ? (usuario.perfil || {}) : {};
  const pctGrasa = calc.calcularPorcentajeGrasa(req.body, perfil.sexo, perfil.edad);
  const pesos = h[req.params.id].peso || [];
  const pesoActual = pesos.length ? pesos[pesos.length-1].valor : null;
  const kgGrasa = pctGrasa && pesoActual ? Math.round((pctGrasa/100)*pesoActual*10)/10 : null;
  const kgMusculo = kgGrasa && pesoActual ? Math.round((pesoActual-kgGrasa)*10)/10 : null;
  const entrada = { fecha: new Date().toISOString().split('T')[0], ...req.body, analisis: { pctGrasa, kgGrasa, kgMusculo } };
  h[req.params.id].medidas.push(entrada);`
);
fs.writeFileSync('rutas_historial.js', r);
console.log('ok1 - rutas actualizado');

// 2. Actualizar renderAnalisis para mostrar cambio desde ultima medicion
let m = fs.readFileSync('public/medidas.js', 'utf8');
m = m.replace(
  "if (!html) html = '<p style=\"color:#555;text-align:center;padding:30px\">Registra pliegues y medidas<br>para ver el análisis</p>';",
  `// Cambio desde ultima medicion
  const histLocal = await fetch('/api/historial/'+id).then(r=>r.json());
  const medidasLocal = histLocal.medidas || [];
  if (medidasLocal.length >= 2) {
    const actual = medidasLocal[medidasLocal.length-1].analisis || {};
    const anterior = medidasLocal[medidasLocal.length-2].analisis || {};
    if (actual.kgGrasa && anterior.kgGrasa && actual.kgMusculo && anterior.kgMusculo) {
      const difGrasa = (parseFloat(actual.kgGrasa) - parseFloat(anterior.kgGrasa)).toFixed(1);
      const difMusculo = (parseFloat(actual.kgMusculo) - parseFloat(anterior.kgMusculo)).toFixed(1);
      html += \`<div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
        <div style="font-size:11px;color:#e31e24;font-weight:700;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">📈 Cambio desde última medición</div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #151515">
          <span style="font-size:12px;color:#888">Kg de grasa</span>
          <span style="font-size:13px;font-weight:700;color:\${parseFloat(difGrasa)<0?'#4caf50':'#e31e24'}">\${parseFloat(difGrasa)>0?'+':''}\${difGrasa} kg</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0">
          <span style="font-size:12px;color:#888">Kg de músculo</span>
          <span style="font-size:13px;font-weight:700;color:\${parseFloat(difMusculo)>0?'#4caf50':'#e31e24'}">\${parseFloat(difMusculo)>0?'+':''}\${difMusculo} kg</span>
        </div>
      </div>\`;
    }
  }
  if (!html) html = '<p style="color:#555;text-align:center;padding:30px">Registra pliegues y medidas<br>para ver el análisis</p>';`
);
fs.writeFileSync('public/medidas.js', m);
console.log('ok2 - medidas.js actualizado');

// 3. Actualizar compartirProgreso para incluir cambio
let p = fs.readFileSync('public/medidas.js', 'utf8');
p = p.replace(
  "if (calc.pctGrasa) msg += '📊 % Grasa: '+calc.pctGrasa+'%\\n📊 % Masa magra: '+calc.pctMagra+'%\\n';",
  `if (calc.pctGrasa) msg += '📊 % Grasa: '+calc.pctGrasa+'%\\n📊 % Masa magra: '+calc.pctMagra+'%\\n';
  const histShare = await fetch('/api/historial/'+id).then(r=>r.json());
  const medidasShare = histShare.medidas || [];
  if (medidasShare.length >= 2) {
    const actShare = medidasShare[medidasShare.length-1].analisis || {};
    const antShare = medidasShare[medidasShare.length-2].analisis || {};
    if (actShare.kgGrasa && antShare.kgGrasa) {
      const dg = (parseFloat(actShare.kgGrasa)-parseFloat(antShare.kgGrasa)).toFixed(1);
      const dm = (parseFloat(actShare.kgMusculo)-parseFloat(antShare.kgMusculo)).toFixed(1);
      msg += '\\n📈 *Última medición*\\n';
      msg += 'Grasa: '+(parseFloat(dg)>0?'+':'')+dg+' kg\\n';
      msg += 'Músculo: '+(parseFloat(dm)>0?'+':'')+dm+' kg\\n';
    }
  }`
);
fs.writeFileSync('public/medidas.js', p);
console.log('ok3 - compartir actualizado');

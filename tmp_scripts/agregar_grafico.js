const fs = require('fs');

const archivos = ['public/js/herramientas-enc.js', 'public/js/admin-inicio.js'];

const buscar = `      h += '</div>';
      cont2.innerHTML = h;`;

const nuevo = `      h += '</div>';
      if (semanas.length > 1) {
        var maxPeso = Math.max.apply(null, semanas.map(function(s){ return s.peso; }));
        var anchoBarra = 26;
        h += '<div style="margin-top:10px;overflow-x:auto;-webkit-overflow-scrolling:touch" id="enc-progreso-scroll"><div style="display:flex;align-items:flex-end;gap:6px;min-width:' + (semanas.length * (anchoBarra+6)) + 'px;height:100px;padding:6px 2px 2px 2px">';
        semanas.forEach(function(sem){
          var alturaPx = maxPeso > 0 ? Math.max(4, Math.round((sem.peso / maxPeso) * 60)) : 4;
          var fechaCorta = (sem.semana_inicio || '').slice(5).replace('-', '/');
          h += '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;width:' + anchoBarra + 'px">';
          h += '<div style="font-size:9px;color:#ccc;font-weight:700">' + sem.peso + '</div>';
          h += '<div style="width:16px;height:' + alturaPx + 'px;background:#e31e24;border-radius:3px 3px 0 0"></div>';
          h += '<div style="font-size:8px;color:#666">' + fechaCorta + '</div>';
          h += '</div>';
        });
        h += '</div></div>';
      }
      cont2.innerHTML = h;
      var _scrollCont = cont2.querySelector('#enc-progreso-scroll');
      if (_scrollCont) { _scrollCont.scrollLeft = _scrollCont.scrollWidth; }`;

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

function renderCompetencias(c) {
  var cats = [
    {cat:'atleta',  icon:'<img src="/images/comp-mejor-atleta.png" style="width:72px;height:72px;object-fit:contain">', label:'Mejor Atleta',     sub:'Puntaje combinado'},
    {cat:'fuerza',  icon:'<img src="/images/comp-mas-fuerza.png" style="width:72px;height:72px;object-fit:contain">', label:'El Más Fuerte',    sub:'Test de fuerza'},
    {cat:'resist',  icon:'<img src="/images/comp-mas-resistente.png" style="width:72px;height:72px;object-fit:contain">', label:'Más Resistente',   sub:'Test de resistencia'},
    {cat:'especif', icon:'<img src="/images/comp-mas-completo.png" style="width:72px;height:72px;object-fit:contain">', label:'Más Completo',     sub:'Test específico'},
    {cat:'grasa',   icon:'<img src="/images/comp-mas-grasa.png" style="width:72px;height:72px;object-fit:contain">', label:'Más Grasa Bajada', sub:'Reducción de grasa'},
    {cat:'musculo', icon:'<img src="/images/comp-mas-musculo.png" style="width:72px;height:72px;object-fit:contain">', label:'Más Músculo',      sub:'Ganancia muscular'},
  ];
  var cards = '';
  for (var i=0; i<cats.length; i++) {
    var x = cats[i];
    cards += '<div onclick="verRankingCategoria(\'' + x.cat + '\')"' +
      ' onmousedown="this.style.borderColor=\'#e31e24\';this.style.background=\'#1a0000\'"' +
      ' onmouseup="this.style.borderColor=\'#2a0000\';this.style.background=\'#0d0d0d\'"' +
      ' ontouchstart="this.style.borderColor=\'#e31e24\';this.style.background=\'#1a0000\'"' +
      ' ontouchend="this.style.borderColor=\'#2a0000\';this.style.background=\'#0d0d0d\'"' +
      ' style="background:var(--fondo);border:1px solid #2a0000;border-radius:12px;padding:16px 10px;text-align:center;cursor:pointer">' +
      '<div style="font-size:32px;margin-bottom:6px">' + x.icon + '</div>' +
      '<div style="font-size:12px;font-weight:700;color:var(--texto);margin-bottom:3px">' + x.label + '</div>' +
      '<div style="font-size:10px;color:var(--texto-secundario)">' + x.sub + '</div>' +
      '</div>';
  }
  c.innerHTML =
    '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:12px">🏆 Categorías</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + cards + '</div>' +
    '</div>' +
    '<div style="margin-top:10px">' +
      '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px">🏅 Records Personales</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">' +
        '<div onclick="verPRCategoria(\'fuerza\')" onmousedown="this.style.borderColor=\'#ff6b35\';this.style.background=\'#1a0a00\'" onmouseup="this.style.borderColor=\'#2a1500\';this.style.background=\'#0d0d0d\'" ontouchstart="this.style.borderColor=\'#ff6b35\';this.style.background=\'#1a0a00\'" ontouchend="this.style.borderColor=\'#2a1500\';this.style.background=\'#0d0d0d\'" style="background:var(--fondo);border:1px solid #2a1500;border-radius:12px;padding:14px 6px;text-align:center;cursor:pointer">' +
          '<div style="margin-bottom:4px"><img src="/images/comp-pr-fuerza.png" style="width:72px;height:72px;object-fit:contain"></div>' +
          '<div style="font-size:10px;font-weight:700;color:#ff6b35">PR Fuerza</div>' +
        '</div>' +
        '<div onclick="verPRCategoria(\'resist\')" onmousedown="this.style.borderColor=\'#4a9eff\';this.style.background=\'#001020\'" onmouseup="this.style.borderColor=\'#001530\';this.style.background=\'#0d0d0d\'" ontouchstart="this.style.borderColor=\'#4a9eff\';this.style.background=\'#001020\'" ontouchend="this.style.borderColor=\'#001530\';this.style.background=\'#0d0d0d\'" style="background:var(--fondo);border:1px solid #001530;border-radius:12px;padding:14px 6px;text-align:center;cursor:pointer">' +
          '<div style="margin-bottom:4px"><img src="/images/comp-pr-resistencia.png" style="width:72px;height:72px;object-fit:contain"></div>' +
          '<div style="font-size:10px;font-weight:700;color:#e31e24">PR Resist</div>' +
        '</div>' +
        '<div onclick="verPRCategoria(\'especif\')" onmousedown="this.style.borderColor=\'#ffd700\';this.style.background=\'#1a1500\'" onmouseup="this.style.borderColor=\'#2a2200\';this.style.background=\'#0d0d0d\'" ontouchstart="this.style.borderColor=\'#ffd700\';this.style.background=\'#1a1500\'" ontouchend="this.style.borderColor=\'#2a2200\';this.style.background=\'#0d0d0d\'" style="background:var(--fondo);border:1px solid #2a2200;border-radius:12px;padding:14px 6px;text-align:center;cursor:pointer">' +
          '<div style="margin-bottom:4px"><img src="/images/comp-pr-especifico.png" style="width:72px;height:72px;object-fit:contain"></div>' +
          '<div style="font-size:10px;font-weight:700;color:#ffd700">PR Especif</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div style="margin-top:6px;display:flex;flex-direction:column;gap:8px">' +
      '<button onclick="verRankingPersonalizado()" style="width:100%;background:#1a0000;color:#e31e24;border:1px solid #e31e24;border-radius:10px;padding:13px;font-size:13px;font-weight:700;cursor:pointer">✏️ Competencia entre mis usuarios</button>' +
      '<button onclick="verCompetenciasExternas()" style="width:100%;background:#0a0a1a;color:#e31e24;border:1px solid #e31e24;border-radius:10px;padding:13px;font-size:13px;font-weight:700;cursor:pointer">🏟️ Tu Propia Competencia</button>' +
    '</div>';
}

async function verRankingCategoria(cat) {
  var c = (window._compContenedor || document.getElementById('competencias-contenido') || document.getElementById('herramienta-contenido'));
  c.innerHTML = '<div style="text-align:center;padding:40px;color:var(--texto-secundario)">⏳ Cargando ranking...</div>';
  var cats = {
    atleta:  {icon:'<img src="/images/comp-mejor-atleta.png" style="width:36px;height:36px;object-fit:contain">', label:'Mejor Atleta',     color:'#e31e24'},
    fuerza:  {icon:'<img src="/images/comp-mas-fuerza.png" style="width:36px;height:36px;object-fit:contain">', label:'El Más Fuerte',    color:'#ff6b35'},
    resist:  {icon:'<img src="/images/comp-mas-resistente.png" style="width:36px;height:36px;object-fit:contain">', label:'Más Resistente',   color:'#4a9eff'},
    especif: {icon:'<img src="/images/comp-mas-completo.png" style="width:36px;height:36px;object-fit:contain">', label:'Más Completo',     color:'#ffd700'},
    grasa:   {icon:'<img src="/images/comp-mas-grasa.png" style="width:36px;height:36px;object-fit:contain">', label:'Más Grasa Bajada', color:'#ff4500'},
    musculo: {icon:'<img src="/images/comp-mas-musculo.png" style="width:36px;height:36px;object-fit:contain">', label:'Más Músculo',      color:'#4caf50'},
  };
  var info = cats[cat];
  var usuarios = (window._usuariosCargados || []).filter(function(u){return u.activo;});
  if (!usuarios.length) {
    var eid = (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id)||null;
    fetch('/api/usuarios?entrenador_id=' + eid).then(function(r){return r.json();}).then(function(data){
      window._usuariosCargados = data;
      renderCopas(cat, c);
    });
    c.innerHTML = '<div style="text-align:center;padding:40px;color:var(--texto-secundario)">Cargando usuarios...</div>';
    return;
  }
  var ranking = [];
  for (var i=0; i<usuarios.length; i++) {
    var u = usuarios[i];
    var score = 0;
    var detalle = 'Sin datos';
    try {
      var results = await Promise.all([
        fetch('/api/historial/'+u.id).then(function(r){return r.json();}).catch(function(){return {peso:[],medidas:[]};}),
        fetch('/api/tests/'+u.id).then(function(r){return r.json();}).catch(function(){return {registros:[]};})
      ]);
      var hist = results[0];
      var tests = results[1];
      var registros = tests.registros || [];
      var sexo = u.sexo || 'M';
      var pesos = hist.peso || [];
      var peso = pesos.length ? pesos[pesos.length-1].valor : 70;
      if (cat === 'grasa') {
        var medidas = hist.medidas || [];
        if (medidas.length >= 2) {
          var ini = medidas[0].kgGrasa;
          var fin = medidas[medidas.length-1].kgGrasa;
          if (ini != null && fin != null) {
            score = Math.round((ini - fin) * 10) / 10;
            detalle = score > 0 ? '-' + score + ' kg grasa' : 'Sin cambio';
          }
        }
      } else if (cat === 'musculo') {
        var medidas2 = hist.medidas || [];
        if (medidas2.length >= 2) {
          var ini2 = medidas2[0].kgMusculo;
          var fin2 = medidas2[medidas2.length-1].kgMusculo;
          if (ini2 != null && fin2 != null) {
            score = Math.round((fin2 - ini2) * 10) / 10;
            detalle = score > 0 ? '+' + score + ' kg músculo' : 'Sin cambio';
          }
        }
      } else {
        var tipos = cat === 'atleta' ? ['fuerza','resist','especif'] : [cat];
        var total = 0, count = 0;
        for (var t=0; t<tipos.length; t++) {
          var tipo = tipos[t];
          var regs = registros.filter(function(r){return r.tipo===tipo && r.scoreTotal != null;});
          var ultimo = regs.length ? regs[regs.length-1] : null;
          if (ultimo && ultimo.scoreTotal != null) {
            total += ultimo.scoreTotal;
            count++;
          }
        }
        score = count ? Math.round(total / count) : 0;
        detalle = score ? score + ' pts' : 'Sin datos';
      }
    } catch(e) { score = 0; detalle = 'Error'; }
    ranking.push({nombre: u.nombre, score: score, detalle: detalle, id: u.id});
  }
  ranking.sort(function(a,b){return b.score - a.score;});

  var medallas = ['🥇','🥈','🥉'];
  var coloresPodio = ['#ffd700','#c0c0c0','#cd7f32'];
  var top3 = ranking.slice(0,3);
  var resto = ranking.slice(3);
  var podioOrden = [top3[1], top3[0], top3[2]].filter(Boolean);
  var alturasPodio = [75, 100, 60];

  var htmlPodio = '';
  for (var p=0; p<podioOrden.length; p++) {
    var pu = podioOrden[p];
    var posReal = top3.indexOf(pu);
    var altura = alturasPodio[p] || 60;
    var col = coloresPodio[posReal];
    var initials = pu.nombre.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().slice(0,2);
    htmlPodio +=
      '<div style="display:flex;flex-direction:column;align-items:center;flex:1">' +
        '<div style="font-size:11px;font-weight:700;color:var(--texto);margin-bottom:4px;text-align:center;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + pu.nombre.split(' ')[0] + '</div>' +
        '<div style="width:52px;height:52px;border-radius:50%;background:' + col + '22;border:2px solid ' + col + ';display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:' + col + ';margin-bottom:6px">' + initials + '</div>' +
        '<div style="font-size:11px;color:var(--texto-medio);margin-bottom:6px">' + pu.detalle + '</div>' +
        '<div style="width:100%;height:' + altura + 'px;background:linear-gradient(180deg,' + col + '44,' + col + '22);border:1px solid ' + col + '66;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center">' +
          '<span style="font-size:24px">' + medallas[posReal] + '</span>' +
        '</div>' +
      '</div>';
  }

  var htmlResto = '';
  for (var r=0; r<resto.length; r++) {
    var ru = resto[r];
    var pos = r + 4;
    var ri = ru.nombre.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().slice(0,2);
    htmlResto +=
      '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #111">' +
        '<div style="font-size:16px;font-weight:700;color:var(--texto-secundario);width:24px;text-align:center">' + pos + '</div>' +
        '<div style="width:38px;height:38px;border-radius:50%;background:var(--gris);border:1px solid #333;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--texto-medio)">' + ri + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:13px;font-weight:700;color:var(--texto)">' + ru.nombre + '</div>' +
          '<div style="font-size:11px;color:var(--texto-secundario)">' + ru.detalle + '</div>' +
        '</div>' +
        '<div style="font-size:14px;font-weight:700;color:' + info.color + '">' + (ru.score || 0) + '</div>' +
      '</div>';
  }

  c.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
      '<button onclick="renderCompetencias(document.getElementById(\'herramienta-contenido\'))" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer">← Volver</button>' +
      '<div style="font-size:14px;font-weight:700;color:var(--texto)">' + info.icon + ' ' + info.label + '</div>' +
    '</div>' +
    '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:14px;padding:20px 10px 10px;margin-bottom:14px">' +
      '<div style="font-size:10px;color:var(--texto-secundario);text-align:center;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">Podio</div>' +
      '<div style="display:flex;align-items:flex-end;justify-content:center;gap:8px">' + htmlPodio + '</div>' +
    '</div>' +
    (resto.length ? '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:14px;overflow:hidden">' + htmlResto + '</div>' : '') +
    (ranking.length === 0 ? '<div style="text-align:center;padding:30px;color:var(--texto-secundario)">Sin datos suficientes</div>' : '');
}

function verRankingPersonalizado() {
  var c = (window._compContenedor || document.getElementById('competencias-contenido') || document.getElementById('herramienta-contenido'));
  var usuarios = (window._usuariosCargados || []).filter(function(u){return u.activo;});
  var listaU = '';
  for (var i=0; i<usuarios.length; i++) {
    var u = usuarios[i];
    listaU +=
      '<label style="display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid #111;cursor:pointer">' +
        '<input type="checkbox" id="comp-u-' + u.id + '" value="' + u.id + '" checked style="accent-color:#e31e24;width:16px;height:16px">' +
        '<span style="font-size:13px;color:var(--texto)">' + u.nombre + '</span>' +
      '</label>';
  }
  c.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
      '<button onclick="renderCompetencias(document.getElementById(\'herramienta-contenido\'))" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer">← Volver</button>' +
      '<div style="font-size:14px;font-weight:700;color:var(--texto)">✏️ Competencia personalizada</div>' +
    '</div>' +
    '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:12px;padding:14px;margin-bottom:12px">' +
      '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px">¿Qué se compite?</div>' +
      '<select id="comp-metrica" style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px;margin-bottom:12px">' +
        '<option value="atleta">🏆 Mejor Atleta (combinado)</option>' +
        '<option value="fuerza">💪 Más Fuerte</option>' +
        '<option value="resist">🫁 Más Resistente</option>' +
        '<option value="especif">⚡ Más Completo</option>' +
        '<option value="grasa">🔥 Más Grasa Bajada</option>' +
        '<option value="musculo">💚 Más Músculo Ganado</option>' +
      '</select>' +
      '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">Participantes</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:10px">' +
        '<button onclick="_compSelAll(true)" style="flex:1;background:var(--gris);color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:7px;font-size:11px;cursor:pointer">✅ Todos</button>' +
        '<button onclick="_compSelAll(false)" style="flex:1;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:7px;font-size:11px;cursor:pointer">❌ Ninguno</button>' +
      '</div>' +
      '<div id="comp-usuarios-lista" style="max-height:220px;overflow-y:auto">' + listaU + '</div>' +
    '</div>' +
    '<button onclick="_lanzarCompPersonalizada()" style="width:100%;background:#e31e24;color:var(--texto);border:none;border-radius:10px;padding:14px;font-size:14px;font-weight:700;cursor:pointer">🏆 Ver Ranking</button>';
}

function _compSelAll(sel) {
  document.querySelectorAll('[id^="comp-u-"]').forEach(function(cb){cb.checked=sel;});
}

async function _lanzarCompPersonalizada() {
  var metrica = document.getElementById('comp-metrica').value;
  var ids = Array.from(document.querySelectorAll('[id^="comp-u-"]:checked')).map(function(cb){return cb.value;});
  if (ids.length < 2) { toast('⚠️ Selecciona al menos 2 participantes',false); return; }
  var backup = window._usuariosCargados;
  window._usuariosCargados = (backup || []).filter(function(u){return ids.includes(u.id);});
  await verRankingCategoria(metrica);
  window._usuariosCargados = backup;
}

// ═══════════════════════════════════════════
// 🏟️ COMPETENCIAS EXTERNAS
// ═══════════════════════════════════════════


// ── COMPETENCIAS v2 ─────────────────────────────────────────────────────────
var _compExt = [];
var _compExtActual = null;
var _compPruebasSeleccionadas = []; // pruebas al crear

var _compExtMetricas = {
  // ── Fuerza Absoluta (kg) ──────────────────────────────────────────────────
  rm_pecho:      {label:'Press Pecho',       unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_militar:    {label:'Press Militar',     unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_espalda:    {label:'Remo/Jalon',        unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_sentadilla: {label:'Sentadilla',        unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_pmuerto:    {label:'Peso Muerto',       unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_femoral:    {label:'Femoral',           unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_hipthrust:  {label:'Hip Thrust',        unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_gluteo:     {label:'Gluteo (máquina)',  unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_biceps:     {label:'Curl Biceps',       unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  rm_triceps:    {label:'Triceps',           unidad:'kg',   modo:'max', grupo:'Fuerza Absoluta'},
  // ── Fuerza Relativa (reps con % PC — porcentaje editable) ─────────────────
  sent_rel:      {label:'Sentadilla',        unidad:'reps', modo:'max', grupo:'Fuerza Relativa', pct:130},
  pecho_rel:     {label:'Press Pecho',       unidad:'reps', modo:'max', grupo:'Fuerza Relativa', pct:100},
  pmuerto_rel:   {label:'Peso Muerto',       unidad:'reps', modo:'max', grupo:'Fuerza Relativa', pct:150},
  militar_rel:   {label:'Press Militar',     unidad:'reps', modo:'max', grupo:'Fuerza Relativa', pct:75},
  hipthrust_rel: {label:'Hip Thrust',        unidad:'reps', modo:'max', grupo:'Fuerza Relativa', pct:120},
  remo_rel:      {label:'Remo/Jalon',        unidad:'reps', modo:'max', grupo:'Fuerza Relativa', pct:100},
  biceps_rel:    {label:'Curl Biceps',       unidad:'reps', modo:'max', grupo:'Fuerza Relativa', pct:50},
  // ── Resistencia (reps / tiempo) ───────────────────────────────────────────
  pushups:       {label:'Flexiones',         unidad:'reps', modo:'max', grupo:'Resistencia'},
  dominadas:     {label:'Dominadas',         unidad:'reps', modo:'max', grupo:'Resistencia'},
  fondos:        {label:'Fondos',            unidad:'reps', modo:'max', grupo:'Resistencia'},
  sentadilla_r:  {label:'Sentadilla libre',  unidad:'reps', modo:'max', grupo:'Resistencia'},
  sent_salto:    {label:'Sentadilla Salto',  unidad:'reps', modo:'max', grupo:'Resistencia'},
  goblet:        {label:'Sentadilla Goblet', unidad:'reps', modo:'max', grupo:'Resistencia'},
  burpees:       {label:'Burpees',           unidad:'reps', modo:'max', grupo:'Resistencia'},
  plancha:       {label:'Plancha',           unidad:'seg',  modo:'max', grupo:'Resistencia'},
  cuerda:        {label:'Salto Cuerda 1min', unidad:'reps', modo:'max', grupo:'Resistencia'},
  // ── Específico / Funcional ────────────────────────────────────────────────
  cooper:        {label:'Cooper (12min)',     unidad:'m',    modo:'max', grupo:'Especifico'},
  leger:         {label:'Leger',             unidad:'nivel',modo:'max', grupo:'Especifico'},
  sitreach:      {label:'Sit and Reach',     unidad:'cm',   modo:'max', grupo:'Especifico'},
  saltoL:        {label:'Salto Largo',       unidad:'cm',   modo:'max', grupo:'Especifico'},
  saltoV:        {label:'Salto Vertical',    unidad:'cm',   modo:'max', grupo:'Especifico'},
  vel30:         {label:'Velocidad 30m',     unidad:'seg',  modo:'min', grupo:'Especifico'},
  km1:           {label:'1km Carrera',       unidad:'seg',  modo:'min', grupo:'Especifico'},
  km2:           {label:'2km Carrera',       unidad:'seg',  modo:'min', grupo:'Especifico'},
  personalizada: {label:'Prueba personalizada', unidad:'pts', modo:'max', grupo:'Custom'}
};

// ── LISTAR COMPETENCIAS ──────────────────────────────────────────────────────
async function verCompetenciasExternas() {
  var c = (window._compContenedor || document.getElementById('competencias-contenido') || document.getElementById('herramienta-contenido'));
  try {
    var res = await fetch('/api/competencias');
    _compExt = await res.json();
  } catch(e) { _compExt = []; }

  var activas    = _compExt.filter(function(x){return x.estado !== 'finalizada';});
  var finalizadas = _compExt.filter(function(x){return x.estado === 'finalizada';});

  function cardComp(comp) {
    var nPruebas = (comp.pruebas||[]).length;
    var nPartic  = (comp.participantes||[]).length;
    var label = nPruebas + ' prueba' + (nPruebas!==1?'s':'') + ' · ' + nPartic + ' participante' + (nPartic!==1?'s':'');
    return '<div onclick="_abrirCompExt(\'' + comp.id + '\')" style="background:var(--fondo);border:1px solid ' + (comp.estado==='finalizada'?'#1a1a1a':'#1a3a1a') + ';border-radius:12px;padding:14px;margin-bottom:8px;cursor:pointer">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div style="font-size:14px;font-weight:700;color:var(--texto)">' + comp.nombre + '</div>' +
      '<div style="font-size:10px;color:' + (comp.estado==='finalizada'?'#555':'#4caf50') + ';font-weight:700">' + (comp.estado==='finalizada'?'🏁':'🟢') + '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--texto-secundario);margin-top:4px">' + label + '</div>' +
      '</div>';
  }

  var htmlActivas    = activas.map(cardComp).join('') || '<div style="text-align:center;padding:20px;color:var(--texto-secundario);font-size:12px">Sin competencias activas</div>';
  var htmlFinalizadas = finalizadas.length ? '<div style="font-size:10px;color:var(--texto-secundario);text-transform:uppercase;letter-spacing:1px;margin:14px 0 8px">Finalizadas</div>' + finalizadas.map(cardComp).join('') : '';

  c.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
    '<div style="font-size:16px;font-weight:700;color:var(--texto)">🏆 Competencias</div>' +
    '<button onclick="_crearCompExt()" style="background:#4a9eff;color:var(--texto);border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">➕ Nueva</button>' +
    '</div>' +
    htmlActivas + htmlFinalizadas;
}

// ── CREAR COMPETENCIA ────────────────────────────────────────────────────────
function _crearCompExt() {
  if(!entEsPremium()){mostrarCandadoPremium('Crear competencias requiere Plan Premium.');return;}
  _compPruebasSeleccionadas = [];
  var c = (window._compContenedor || document.getElementById('competencias-contenido') || document.getElementById('herramienta-contenido'));

  // Construir selector de pruebas agrupado
  var grupos = {};
  var keys = Object.keys(_compExtMetricas);
  for (var i=0; i<keys.length; i++) {
    var k = keys[i];
    var m = _compExtMetricas[k];
    if (!grupos[m.grupo]) grupos[m.grupo] = [];
    grupos[m.grupo].push({key:k, label:m.label, unidad:m.unidad});
  }

  var htmlGrupos = '';
  var gkeys = Object.keys(grupos);
  for (var g=0; g<gkeys.length; g++) {
    var gn = gkeys[g];
    var gid = 'compg-' + g;
    var iconoGrupo = gn==='Fuerza Absoluta'?'🏋️':gn==='Fuerza Relativa'?'⚖️':gn==='Resistencia'?'🔁':gn==='Especifico'?'🎯':'✨';
    htmlGrupos +=
      '<div onclick="_compToggleGrupo(\'' + gid + '\')" ' +
      'style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--card);border:1px solid #2a2a2a;border-radius:8px;margin-bottom:4px;cursor:pointer;user-select:none">' +
      '<div style="font-size:12px;font-weight:700;color:var(--texto)">' + iconoGrupo + ' ' + gn + '</div>' +
      '<div id="arr-' + gid + '" style="font-size:12px;color:var(--texto-secundario);transition:transform 0.2s">▼</div>' +
      '</div>' +
      '<div id="' + gid + '" style="display:none;margin-bottom:8px">';
    for (var h=0; h<grupos[gn].length; h++) {
      var op = grupos[gn][h];
      var esPctRel = (gn === 'Fuerza Relativa');
      var subLabel = esPctRel ? op.unidad + ' · con % de tu PC' : op.unidad;
      htmlGrupos +=
        '<div onclick="_compTogglePrueba(\'' + op.key + '\',this)" data-key="' + op.key + '" ' +
        'style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--fondo);border:1px solid #222;border-radius:8px;margin-bottom:4px;cursor:pointer">' +
        '<div class="comp-check" style="width:18px;height:18px;border-radius:4px;border:2px solid #444;flex-shrink:0"></div>' +
        '<div style="flex:1">' +
        '<div style="font-size:12px;color:var(--texto);font-weight:600">' + op.label + '</div>' +
        '<div style="font-size:10px;color:var(--texto-secundario)">' + subLabel + '</div>' +
        '</div>' +
        (esPctRel ?
          '<div class="pct-box" style="display:none;align-items:center;gap:4px">' +
          '<input onclick="event.stopPropagation()" id="pct-' + op.key + '" type="number" value="' + (op.pct||100) + '" min="1" max="500" ' +
          'style="width:54px;background:var(--card);color:#e31e24;border:1px solid #e31e24;border-radius:6px;padding:4px 6px;font-size:12px;font-weight:700;text-align:center" ' +
          'onchange="_compActualizarPct(\'' + op.key + '\',this.value)">' +
          '<span style="font-size:10px;color:#e31e24;font-weight:700">% PC</span>' +
          '</div>'
        : '') +
        '</div>';
    }
    htmlGrupos += '</div>';
  }

  // Panel prueba personalizada
  htmlGrupos +=
    '<div style="font-size:10px;color:#ffd700;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 6px">Personalizada</div>' +
    '<div style="background:var(--fondo);border:1px solid #2a2a00;border-radius:8px;padding:12px;margin-bottom:6px">' +
    '<input id="cp-custom-nombre" placeholder="Nombre de la prueba" style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:6px;padding:8px;font-size:12px;margin-bottom:6px;box-sizing:border-box">' +
    '<div style="display:flex;gap:6px">' +
    '<input id="cp-custom-unidad" placeholder="Unidad (kg, reps, seg...)" style="flex:1;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:6px;padding:8px;font-size:12px;box-sizing:border-box">' +
    '<select id="cp-custom-modo" style="background:var(--card);color:var(--texto);border:1px solid #333;border-radius:6px;padding:8px;font-size:12px">' +
    '<option value="max">↑ Mayor</option><option value="min">↓ Menor</option>' +
    '</select>' +
    '</div>' +
    '<button onclick="_compAgregarCustom()" style="width:100%;background:#2a2a00;color:#ffd700;border:1px solid #ffd700;border-radius:6px;padding:8px;font-size:12px;font-weight:700;cursor:pointer;margin-top:6px">➕ Añadir prueba personalizada</button>' +
    '</div>';

  c.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
    '<button onclick="verCompetenciasExternas()" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer">← Volver</button>' +
    '<div style="font-size:14px;font-weight:700;color:var(--texto)">➕ Nueva Competencia</div>' +
    '</div>' +
    '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px;margin-bottom:12px">' +
    '<div>' +
    '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px">Nombre</div>' +
    '<input id="cp-nombre" placeholder="Ej: Reto Fuerza Mayo" style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px;box-sizing:border-box">' +
    '</div>' +
    '<div>' +
    '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px">Categoría</div>' +
    '<select id="cp-categoria" style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px">' +
    '<option value="mixto">Mixto</option><option value="hombres">Hombres</option><option value="mujeres">Mujeres</option>' +
    '</select>' +
    '</div>' +
    '<div>' +
    '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px">Sistema de puntos</div>' +
    '<select id="cp-puntos" style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px">' +
    '<option value="ranking">🏆 Ranking decreciente (recomendado)</option>' +
    '<option value="porcentaje">📊 Porcentaje del mejor</option>' +
    '<option value="fijos">🎯 Puntos fijos por posición</option>' +
    '</select>' +
    '</div>' +
    '</div>' +
    '<div style="font-size:10px;color:var(--texto-medio);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">Selecciona las pruebas</div>' +
    '<div id="cp-pruebas-lista">' + htmlGrupos + '</div>' +
    '<div id="cp-seleccionadas" style="min-height:36px;margin-bottom:8px"></div>' +
    '<button onclick="_guardarCompExt()" style="width:100%;background:#4a9eff;color:var(--texto);border:none;border-radius:10px;padding:14px;font-size:14px;font-weight:700;cursor:pointer">Crear Competencia →</button>';
}

function _compToggleGrupo(gid) {
  var el  = document.getElementById(gid);
  var arr = document.getElementById('arr-' + gid);
  if (!el) return;
  var abierto = el.style.display !== 'none';
  el.style.display  = abierto ? 'none' : 'block';
  if (arr) arr.style.transform = abierto ? '' : 'rotate(180deg)';
}

function _compActualizarPct(key, val) {
  var p = _compPruebasSeleccionadas.find(function(p){return p.key===key;});
  if (p) p.pct = parseFloat(val) || 100;
  _compActualizarSeleccionadas();
}

function _compTogglePrueba(key, el) {
  var idx = _compPruebasSeleccionadas.findIndex(function(p){return p.key===key;});
  var check = el.querySelector('.comp-check');
  var pctBox = el.querySelector('.pct-box');
  if (idx >= 0) {
    _compPruebasSeleccionadas.splice(idx,1);
    el.style.borderColor = '#222';
    el.style.background = '#0d0d0d';
    if (check) { check.style.background=''; check.style.borderColor='#444'; check.innerHTML=''; }
    if (pctBox) pctBox.style.display = 'none';
  } else {
    var m = _compExtMetricas[key];
    var pctInicial = m.pct || null;
    var inputPct = document.getElementById('pct-' + key);
    if (inputPct) pctInicial = parseFloat(inputPct.value) || m.pct || 100;
    _compPruebasSeleccionadas.push({key:key, label:m.label, unidad:m.unidad, modo:m.modo, pct:pctInicial});
    el.style.borderColor = '#4a9eff';
    el.style.background = '#0a0a1a';
    if (check) { check.style.background='#4a9eff'; check.style.borderColor='#4a9eff'; check.innerHTML='<span style="color:var(--texto);font-size:12px">✓</span>'; }
    if (pctBox) pctBox.style.display = 'flex';
  }
  _compActualizarSeleccionadas();
}

function _compAgregarCustom() {
  var nombre = (document.getElementById('cp-custom-nombre').value||'').trim();
  var unidad = (document.getElementById('cp-custom-unidad').value||'pts').trim();
  var modo   = document.getElementById('cp-custom-modo').value;
  if (!nombre) { toast('⚠️ Escribe el nombre de la prueba',false); return; }
  var key = 'custom_' + Date.now();
  _compPruebasSeleccionadas.push({key:key, label:nombre, unidad:unidad, modo:modo, pct:null, custom:true});
  document.getElementById('cp-custom-nombre').value = '';
  document.getElementById('cp-custom-unidad').value = '';
  _compActualizarSeleccionadas();
}

function _compActualizarSeleccionadas() {
  var el = document.getElementById('cp-seleccionadas');
  if (!el) return;
  if (!_compPruebasSeleccionadas.length) { el.innerHTML=''; return; }
  var html = '<div style="font-size:10px;color:#4caf50;font-weight:700;margin-bottom:6px">✅ ' + _compPruebasSeleccionadas.length + ' prueba(s) seleccionada(s):</div>';
  for (var i=0; i<_compPruebasSeleccionadas.length; i++) {
    var p = _compPruebasSeleccionadas[i];
    html += '<div style="display:inline-block;background:#0a1a0a;border:1px solid #1a3a1a;border-radius:6px;padding:4px 8px;font-size:11px;color:#4caf50;margin:2px">' +
      p.label + (p.pct?' ('+p.pct+'%PC)':'') +
      '<span onclick="_compQuitarPrueba(\'' + p.key + '\')" style="margin-left:6px;color:#e31e24;cursor:pointer">✕</span>' +
      '</div>';
  }
  el.innerHTML = html;
}

function _compQuitarPrueba(key) {
  _compPruebasSeleccionadas = _compPruebasSeleccionadas.filter(function(p){return p.key!==key;});
  // desmarcar visualmente si es prueba estándar
  var el = document.querySelector('[data-key="' + key + '"]');
  if (el) {
    el.style.borderColor = '#222';
    el.style.background = '#0d0d0d';
    var check = el.querySelector('.comp-check');
    if (check) { check.style.background=''; check.style.borderColor='#444'; check.innerHTML=''; }
  }
  _compActualizarSeleccionadas();
}

async function _guardarCompExt() {
  var nombre    = (document.getElementById('cp-nombre').value||'').trim();
  var categoria = document.getElementById('cp-categoria').value;
  var puntos    = document.getElementById('cp-puntos').value;
  if (!nombre) { toast('⚠️ Ponle un nombre a la competencia',false); return; }
  if (!_compPruebasSeleccionadas.length) { toast('⚠️ Selecciona al menos una prueba',false); return; }
  var datos = {
    nombre: nombre,
    categoria: categoria,
    sistemaPuntos: puntos,
    pruebas: _compPruebasSeleccionadas,
    participantes: [],
    estado: 'activa'
  };
  try {
    var res = await fetch('/api/competencias', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(datos)});
    var r = await res.json();
    if (r.ok) { await verCompetenciasExternas(); _abrirCompExt(r.id); }
  } catch(e) { toast('❌ Error al guardar',false); }
}

// ── DETALLE COMPETENCIA ──────────────────────────────────────────────────────
function _abrirCompExt(id) {
  _compExtActual = _compExt.find(function(x){return x.id===id;}) || null;
  if (!_compExtActual) return;
  _renderCompExtDetalle();
}

function _calcularPuntosComp(comp) {
  var partic = (comp.participantes || []).slice();
  var pruebas = comp.pruebas || [];
  var sistema = comp.sistemaPuntos || 'ranking';
  var n = partic.length;

  // Inicializar puntos
  partic.forEach(function(p){ p._puntos = 0; p._detalle = {}; });

  pruebas.forEach(function(prueba) {
    // Ordenar por resultado en esta prueba
    var conResultado = partic.filter(function(p){
      return p.resultados && p.resultados[prueba.key] !== undefined && p.resultados[prueba.key] !== '';
    });
    conResultado.sort(function(a,b){
      var va = parseFloat(a.resultados[prueba.key]);
      var vb = parseFloat(b.resultados[prueba.key]);
      return prueba.modo === 'min' ? va - vb : vb - va;
    });

    for (var i=0; i<conResultado.length; i++) {
      var p = conResultado[i];
      var pts = 0;
      if (sistema === 'ranking') {
        // Detectar empates
        var val = parseFloat(p.resultados[prueba.key]);
        var mismoValor = conResultado.filter(function(x){ return parseFloat(x.resultados[prueba.key]) === val; });
        var posSum = 0;
        for (var j=0; j<mismoValor.length; j++) {
          posSum += (conResultado.length - (conResultado.indexOf(mismoValor[j])));
        }
        pts = posSum / mismoValor.length;
      } else if (sistema === 'porcentaje') {
        var mejor = parseFloat(conResultado[0].resultados[prueba.key]);
        var val2  = parseFloat(p.resultados[prueba.key]);
        pts = mejor > 0 ? Math.round((prueba.modo==='min' ? mejor/val2 : val2/mejor) * 100) : 0;
      } else if (sistema === 'fijos') {
        pts = conResultado.length - i;
      }
      p._puntos += pts;
      p._detalle[prueba.key] = pts;
    }
  });

  partic.sort(function(a,b){ return b._puntos - a._puntos; });
  return partic;
}

function _renderCompExtDetalle() {
  var comp = _compExtActual;
  if (!comp) return;
  var c = (window._compContenedor || document.getElementById('competencias-contenido') || document.getElementById('herramienta-contenido'));
  var pruebas  = comp.pruebas || [];
  var sistema  = comp.sistemaPuntos || 'ranking';
  var sistLabel = sistema==='ranking'?'Ranking':(sistema==='porcentaje'?'% del mejor':'Puntos fijos');
  var ranked   = _calcularPuntosComp(comp);
  var n        = ranked.length;

  var medallas    = ['🥇','🥈','🥉'];
  var coloresPodio = ['#ffd700','#c0c0c0','#cd7f32'];
  var top3        = ranked.slice(0,3);
  var resto       = ranked.slice(3);
  var podioOrden  = [top3[1],top3[0],top3[2]].filter(Boolean);
  var alturas     = [75,100,60];

  var htmlPodio = '';
  if (top3.length >= 2) {
    for (var p=0; p<podioOrden.length; p++) {
      var pu  = podioOrden[p];
      var posReal = top3.indexOf(pu);
      var col = coloresPodio[posReal];
      var alt = alturas[p]||60;
      var ini = pu.nombre.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().slice(0,2);
      htmlPodio +=
        '<div style="display:flex;flex-direction:column;align-items:center;flex:1">' +
        '<div style="font-size:11px;font-weight:700;color:var(--texto);margin-bottom:4px;text-align:center;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + pu.nombre.split(' ')[0] + '</div>' +
        '<div style="width:52px;height:52px;border-radius:50%;background:' + col + '22;border:2px solid ' + col + ';display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:' + col + ';margin-bottom:4px">' + ini + '</div>' +
        '<div style="font-size:13px;font-weight:700;color:' + col + ';margin-bottom:4px">' + Math.round(pu._puntos) + ' pts</div>' +
        '<div style="width:100%;height:' + alt + 'px;background:linear-gradient(180deg,' + col + '44,' + col + '22);border:1px solid ' + col + '66;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center">' +
        '<span style="font-size:24px">' + medallas[posReal] + '</span>' +
        '</div>' +
        '</div>';
    }
  }

  var htmlResto = '';
  for (var r=0; r<resto.length; r++) {
    var ru = resto[r];
    var ri = ru.nombre.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().slice(0,2);
    htmlResto +=
      '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #111">' +
      '<div style="font-size:16px;font-weight:700;color:var(--texto-secundario);width:24px;text-align:center">' + (r+4) + '</div>' +
      '<div style="width:38px;height:38px;border-radius:50%;background:var(--gris);border:1px solid #333;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--texto-medio)">' + ri + '</div>' +
      '<div style="flex:1">' +
      '<div style="font-size:13px;font-weight:700;color:var(--texto)">' + ru.nombre + '</div>' +
      '<div style="font-size:11px;color:var(--texto-secundario)">' + Math.round(ru._puntos) + ' pts</div>' +
      '</div>' +
      (comp.estado !== 'finalizada' ? '<button onclick="_agregarParticipanteExt(' + comp.participantes.indexOf(ru) + ')" style="background:var(--gris);color:var(--texto-medio);border:1px solid #333;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer">✏️</button>' : '') +
      '</div>';
  }

  // Tabla de resultados por prueba
  var htmlTabla = '';
  if (pruebas.length) {
    htmlTabla = '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;margin-bottom:14px">' +
      '<div style="padding:10px 14px;border-bottom:1px solid #111;font-size:11px;color:var(--texto-secundario);font-weight:700;text-transform:uppercase;letter-spacing:1px">📋 Resultados por prueba</div>';
    for (var pr=0; pr<pruebas.length; pr++) {
      var prueba = pruebas[pr];
      var conRes = ranked.filter(function(p){ return p.resultados && p.resultados[prueba.key] !== undefined; });
      htmlTabla +=
        '<div style="padding:10px 14px;border-bottom:1px solid #0a0a0a">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--texto)">' + prueba.label + (prueba.pct?' <span style="color:var(--texto-secundario);font-weight:400;font-size:10px">('+prueba.pct+'% PC)</span>':'') + '</div>' +
        '<div style="font-size:10px;color:var(--texto-secundario)">' + prueba.unidad + ' · ' + (prueba.modo==='min'?'↓ menor':'↑ mayor') + '</div>' +
        '</div>';
      if (conRes.length) {
        for (var pi=0; pi<conRes.length; pi++) {
          var pp = conRes[pi];
          var val = pp.resultados[prueba.key];
          var pts = pp._detalle[prueba.key] || 0;
          htmlTabla +=
            '<div style="display:flex;align-items:center;gap:8px;padding:4px 0">' +
            '<div style="width:16px;font-size:10px;color:var(--texto-secundario);text-align:right">' + (pi+1) + '</div>' +
            '<div style="flex:1;font-size:11px;color:var(--texto-medio)">' + pp.nombre + '</div>' +
            (pp.peso ? '<div style="font-size:10px;color:var(--texto-secundario)">' + pp.peso + 'kg</div>' : '') +
            '<div style="font-size:12px;color:var(--texto);font-weight:700">' + val + ' ' + prueba.unidad + '</div>' +
            '<div style="font-size:10px;color:#e31e24;min-width:36px;text-align:right">' + Math.round(pts) + 'p</div>' +
            '</div>';
        }
      } else {
        htmlTabla += '<div style="font-size:11px;color:var(--texto-tenue);padding:4px 0">Sin resultados aún</div>';
      }
      htmlTabla += '</div>';
    }
    htmlTabla += '</div>';
  }

  // Lista general de participantes (solo cuando activa)
  var htmlListaPartic = '';
  if (comp.estado !== 'finalizada' && ranked.length) {
    htmlListaPartic = '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;margin-bottom:14px">' +
      '<div style="padding:10px 14px;border-bottom:1px solid #111;font-size:11px;color:var(--texto-secundario);font-weight:700;text-transform:uppercase;letter-spacing:1px">👥 Participantes</div>';
    for (var ri2=0; ri2<ranked.length; ri2++) {
      var ru2 = ranked[ri2];
      var ri2i = ru2.nombre.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().slice(0,2);
      htmlListaPartic +=
        '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #111">' +
        '<div style="font-size:16px;font-weight:700;color:var(--texto-secundario);width:24px;text-align:center">' + (ri2+1) + '</div>' +
        '<div style="width:36px;height:36px;border-radius:50%;background:var(--gris);border:1px solid #333;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--texto-medio)">' + ri2i + '</div>' +
        '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--texto)">' + ru2.nombre + '</div>' +
        '<div style="font-size:11px;color:var(--texto-secundario)">' + Math.round(ru2._puntos) + ' pts</div></div>' +
        '<button onclick="_agregarParticipanteExt(' + comp.participantes.indexOf(ru2) + ')" style="background:var(--gris);color:var(--texto-medio);border:1px solid #333;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer">✏️</button>' +
        '</div>';
    }
    htmlListaPartic += '</div>';
  }

  var estadoBtn = comp.estado === 'finalizada'
    ? '<button onclick="_toggleEstadoCompExt()" style="flex:1;background:var(--gris);color:var(--texto-secundario);border:1px solid #333;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer">🔄 Reabrir</button>'
    : '<button onclick="_toggleEstadoCompExt()" style="flex:1;background:var(--gris);color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer">🏁 Finalizar</button>';

  c.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
    '<button onclick="verCompetenciasExternas()" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer">← Volver</button>' +
    '<div style="flex:1;font-size:14px;font-weight:700;color:var(--texto)">' + comp.nombre + '</div>' +
    '<div style="font-size:10px;color:' + (comp.estado==='finalizada'?'#555':'#4caf50') + ';font-weight:700">' + (comp.estado==='finalizada'?'🏁 FIN':'🟢 ACTIVA') + '</div>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:12px">' + (comp.categoria||'Mixto') + ' · ' + pruebas.length + ' pruebas · ' + sistLabel + '</div>' +
    (comp.estado === 'finalizada' && n >= 2 ?
      '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:14px;padding:20px 10px 10px;margin-bottom:14px">' +
      '<div style="font-size:10px;color:var(--texto-secundario);text-align:center;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">🏅 Podio</div>' +
      '<div style="display:flex;align-items:flex-end;justify-content:center;gap:8px">' + htmlPodio + '</div>' +
      '</div>'
    : '') +
    htmlListaPartic +
    htmlTabla +
    (comp.estado === 'finalizada' && resto.length ? '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:14px;overflow:hidden;margin-bottom:14px">' + htmlResto + '</div>' : '') +
    (comp.estado !== 'finalizada' ?
      '<button onclick="_agregarParticipanteExt()" style="width:100%;background:#0a0a1a;color:#e31e24;border:1px solid #e31e24;border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:8px">➕ Agregar / Editar Participante</button>'
    : '') +
    '<div style="display:flex;gap:8px">' +
    estadoBtn +
    '<button onclick="_eliminarCompExt()" style="flex:1;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer">🗑️ Eliminar</button>' +
    '</div>';
}

// ── AGREGAR / EDITAR PARTICIPANTE ────────────────────────────────────────────
function _agregarParticipanteExt(editIdx) {
  var comp = _compExtActual;
  if (!comp) return;
  var c = (window._compContenedor || document.getElementById('competencias-contenido') || document.getElementById('herramienta-contenido'));
  var pruebas = comp.pruebas || [];
  var partic  = (editIdx !== undefined) ? comp.participantes[editIdx] : null;

  var htmlPruebas = '';
  for (var i=0; i<pruebas.length; i++) {
    var pr = pruebas[i];
    var valActual = (partic && partic.resultados && partic.resultados[pr.key] !== undefined) ? partic.resultados[pr.key] : '';
    htmlPruebas +=
      '<div>' +
      '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px">' +
      pr.label + (pr.pct ? ' <span style="color:var(--texto-secundario)">('+pr.pct+'% PC)</span>' : '') +
      ' <span style="color:var(--texto-secundario);font-weight:400">· ' + pr.unidad + ' · ' + (pr.modo==='min'?'↓ menor gana':'↑ mayor gana') + '</span>' +
      '</div>' +
      '<input id="cp-res-' + pr.key + '" type="number" step="0.1" placeholder="Dejar vacío si no tiene resultado" value="' + valActual + '" ' +
      'style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px;box-sizing:border-box">' +
      '</div>';
  }

  c.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
    '<button onclick="_renderCompExtDetalle()" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer">← Volver</button>' +
    '<div style="font-size:14px;font-weight:700;color:var(--texto)">' + (partic ? '✏️ Editar' : '➕ Agregar') + ' Participante</div>' +
    '</div>' +
    '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px">' +
    '<div>' +
    '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px">Nombre</div>' +
    '<input id="cp-p-nombre" placeholder="Nombre del participante" value="' + (partic?partic.nombre:'') + '" style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px;box-sizing:border-box">' +
    '</div>' +
    '<div>' +
    '<div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px">Peso corporal (kg) <span style="color:var(--texto-secundario);font-weight:400">— para pruebas relativas</span></div>' +
    '<input id="cp-p-peso" type="number" step="0.1" placeholder="Ej: 75.5" value="' + (partic?partic.peso||'':'') + '" style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px;box-sizing:border-box">' +
    '</div>' +
    htmlPruebas +
    '</div>' +
    '<button onclick="_guardarParticipanteExt(' + (editIdx !== undefined ? editIdx : 'undefined') + ')" style="width:100%;background:#4a9eff;color:var(--texto);border:none;border-radius:10px;padding:14px;font-size:14px;font-weight:700;cursor:pointer;margin-top:12px">Guardar →</button>';
}

async function _guardarParticipanteExt(editIdx) {
  var nombre = (document.getElementById('cp-p-nombre').value||'').trim();
  var peso   = parseFloat(document.getElementById('cp-p-peso').value) || null;
  if (!nombre) { toast('⚠️ Escribe el nombre del participante',false); return; }
  var comp   = _compExtActual;
  var pruebas = comp.pruebas || [];
  var resultados = {};
  for (var i=0; i<pruebas.length; i++) {
    var pr  = pruebas[i];
    var val = document.getElementById('cp-res-' + pr.key).value;
    if (val !== '' && !isNaN(parseFloat(val))) {
      resultados[pr.key] = parseFloat(val);
    }
  }
  var entrada = {nombre:nombre, peso:peso, resultados:resultados, fecha:new Date().toISOString().split('T')[0]};
  if (!comp.participantes) comp.participantes = [];
  if (editIdx !== undefined && editIdx !== null) {
    comp.participantes[editIdx] = entrada;
  } else {
    comp.participantes.push(entrada);
  }
  try {
    await fetch('/api/competencias/' + comp.id, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({participantes:comp.participantes})});
    _renderCompExtDetalle();
  } catch(e) { toast('❌ Error al guardar',false); }
}

async function _toggleEstadoCompExt() {
  var comp = _compExtActual;
  if (!comp) return;
  comp.estado = comp.estado === 'finalizada' ? 'activa' : 'finalizada';
  await fetch('/api/competencias/' + comp.id, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({estado:comp.estado})});
  _renderCompExtDetalle();
}

async function _eliminarCompExt() {
  if (!confirm('Eliminar esta competencia?')) return;
  await fetch('/api/competencias/' + _compExtActual.id, {method:'DELETE'});
  _compExtActual = null;
  await verCompetenciasExternas();
}


var _prMeta = {
  fuerza:  {
    pecho:   {label:'Press Pecho',   modo:'rm'},
    espalda: {label:'Remo Jalon',    modo:'rm'},
    biceps:  {label:'Biceps',        modo:'rm'},
    triceps: {label:'Triceps',       modo:'rm'},
    femoral: {label:'Femoral',       modo:'rm'},
    cuad:    {label:'Cuadriceps',    modo:'rm'},
    gluteo:  {label:'Gluteo',        modo:'rm'}
  },
  resist: {
    pushups:    {label:'Flexiones',    modo:'max'},
    dominadas:  {label:'Dominadas',    modo:'max'},
    fondos:     {label:'Fondos',       modo:'max'},
    sentadilla: {label:'Sentadilla',   modo:'max'},
    plancha:    {label:'Plancha seg',  modo:'max'},
    burpees:    {label:'Burpees',      modo:'max'}
  },
  especif: {
    cooper:   {label:'Cooper m',       modo:'max'},
    leger:    {label:'Leger nivel',    modo:'max'},
    sitreach: {label:'Sit and Reach',  modo:'max'},
    hombro:   {label:'Flex Hombro',    modo:'max'},
    saltoL:   {label:'Salto Largo cm', modo:'max'},
    saltoV:   {label:'Salto Vertical', modo:'max'},
    vel30:    {label:'Vel 30m seg',    modo:'min'}
  }
};

function _prContenedor() { return (window._compContenedor || document.getElementById('competencias-contenido') || document.getElementById('herramienta-contenido')); }
function _prTipoActual() { var s=document.getElementById('pr-ejercicio-sel'); return s?s.getAttribute('data-tipo'):''; }

async function verPRCategoria(tipo) {
  var c = _prContenedor();
  var meta = _prMeta[tipo];
  var keys = Object.keys(meta);
  var infoMap = {
    fuerza:  {icon:'<img src="/images/comp-pr-fuerza.png" style="width:36px;height:36px;object-fit:contain">', label:'PR Fuerza',      color:'#ff6b35'},
    resist:  {icon:'<img src="/images/comp-pr-resistencia.png" style="width:36px;height:36px;object-fit:contain">', label:'PR Resistencia', color:'#4a9eff'},
    especif: {icon:'<img src="/images/comp-pr-especifico.png" style="width:36px;height:36px;object-fit:contain">', label:'PR Especifico',  color:'#ffd700'}
  };
  var inf = infoMap[tipo];
  var opts = '';
  for (var k=0; k<keys.length; k++) {
    opts += '<option value="' + keys[k] + '">' + meta[keys[k]].label + '</option>';
  }
  c.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
      '<button onclick="_prContenedor() && renderCompetencias(_prContenedor())" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer">← Volver</button>' +
      '<div style="font-size:14px;font-weight:700;color:var(--texto)">' + inf.icon + ' ' + inf.label + '</div>' +
    '</div>' +
    '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:12px;padding:14px;margin-bottom:12px">' +
      '<div style="font-size:10px;color:' + inf.color + ';text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">Ejercicio</div>' +
      '<select id="pr-ejercicio-sel" data-tipo="' + tipo + '" onchange="_renderPRRanking()" style="width:100%;background:var(--card);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px">' + opts + '</select>' +
    '</div>' +
    '<div id="pr-ranking-contenido"><div style="text-align:center;padding:30px;color:var(--texto-secundario)">Cargando...</div></div>';
  await _renderPRRanking();
}

async function _renderPRRanking() {
  var sel = document.getElementById('pr-ejercicio-sel');
  if (!sel) return;
  var tipo = sel.getAttribute('data-tipo');
  var ejercicio = sel.value;
  var meta = _prMeta[tipo][ejercicio];
  var contenido = document.getElementById('pr-ranking-contenido');
  contenido.innerHTML = '<div style="text-align:center;padding:30px;color:var(--texto-secundario)">Calculando PRs...</div>';
  var todos = window._usuariosCargados || [];
  var ranking = [];
  for (var i=0; i<todos.length; i++) {
    var u = todos[i];
    var pr = null;
    var prFecha = '';
    try {
      var res = await fetch('/api/tests/'+u.id).then(function(r){return r.json();}).catch(function(){return {registros:[]};});
      var regs = (res.registros||[]).filter(function(r){return r.tipo===tipo;});
      for (var j=0; j<regs.length; j++) {
        var reg = regs[j];
        var campo = reg[ejercicio];
        if (!campo && campo !== 0) continue;
        var val = null;
        if (tipo === 'fuerza' && campo.rm != null) val = campo.rm;
        else if (campo.valor != null) val = campo.valor;
        else if (typeof campo === 'number') val = campo;
        if (val == null) continue;
        if (pr === null) { pr = val; prFecha = reg.fecha; }
        else if (meta.modo === 'min' && val < pr) { pr = val; prFecha = reg.fecha; }
        else if (meta.modo === 'max' && val > pr) { pr = val; prFecha = reg.fecha; }
      }
    } catch(e) {}
    if (pr !== null) {
      var unidad = '';
      if (tipo === 'fuerza') unidad = ' kg RM';
      else if (ejercicio === 'plancha' || ejercicio === 'vel30') unidad = ' seg';
      else if (ejercicio === 'cooper') unidad = ' m';
      else if (ejercicio === 'saltoL' || ejercicio === 'saltoV') unidad = ' cm';
      ranking.push({nombre:u.nombre, pr:pr, detalle:pr+unidad+(prFecha?' · '+prFecha:''), activo:u.activo});
    }
  }
  if (meta.modo === 'min') ranking.sort(function(a,b){return a.pr-b.pr;});
  else ranking.sort(function(a,b){return b.pr-a.pr;});
  if (!ranking.length) {
    contenido.innerHTML = '<div style="text-align:center;padding:30px;color:var(--texto-secundario)">Sin registros para este ejercicio</div>';
    return;
  }
  var medallas = ['🥇','🥈','🥉'];
  var coloresPodio = ['#ffd700','#c0c0c0','#cd7f32'];
  var colorTipo = {fuerza:'#ff6b35',resist:'#4a9eff',especif:'#ffd700'};
  var top3 = ranking.slice(0,3);
  var resto = ranking.slice(3);
  var podioOrden = [top3[1],top3[0],top3[2]].filter(Boolean);
  var alturas = [75,100,60];
  var htmlPodio = '';
  for (var p=0; p<podioOrden.length; p++) {
    var pu = podioOrden[p];
    var posReal = top3.indexOf(pu);
    var col = coloresPodio[posReal];
    var alt = alturas[p]||60;
    var ini = pu.nombre.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().slice(0,2);
    htmlPodio +=
      '<div style="display:flex;flex-direction:column;align-items:center;flex:1">' +
        '<div style="font-size:11px;font-weight:700;color:'+(pu.activo?'#fff':'#888')+';margin-bottom:4px;text-align:center;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+pu.nombre.split(' ')[0]+(pu.activo?'':' 💤')+'</div>' +
        '<div style="width:52px;height:52px;border-radius:50%;background:'+col+'22;border:2px solid '+col+';display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:'+col+';margin-bottom:6px">'+ini+'</div>' +
        '<div style="font-size:11px;color:var(--texto-medio);margin-bottom:6px;text-align:center">'+pu.detalle+'</div>' +
        '<div style="width:100%;height:'+alt+'px;background:linear-gradient(180deg,'+col+'44,'+col+'22);border:1px solid '+col+'66;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center">' +
          '<span style="font-size:24px">'+medallas[posReal]+'</span>' +
        '</div>' +
      '</div>';
  }
  var htmlResto = '';
  for (var r=0; r<resto.length; r++) {
    var ru = resto[r];
    var rini = ru.nombre.split(' ').map(function(n){return n[0]||'';}).join('').toUpperCase().slice(0,2);
    htmlResto +=
      '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #111">' +
        '<div style="font-size:16px;font-weight:700;color:var(--texto-secundario);width:24px;text-align:center">'+(r+4)+'</div>' +
        '<div style="width:38px;height:38px;border-radius:50%;background:var(--gris);border:1px solid #333;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--texto-medio)">'+rini+'</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:13px;font-weight:700;color:'+(ru.activo?'#fff':'#888')+'">'+ru.nombre+(ru.activo?'':' 💤')+'</div>' +
          '<div style="font-size:11px;color:var(--texto-secundario)">'+ru.detalle+'</div>' +
        '</div>' +
        '<div style="font-size:14px;font-weight:700;color:'+colorTipo[tipo]+'">'+ru.pr+'</div>' +
      '</div>';
  }
  contenido.innerHTML =
    '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:14px;padding:20px 10px 10px;margin-bottom:14px">' +
      '<div style="font-size:10px;color:var(--texto-secundario);text-align:center;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">🏅 '+meta.label+' — Mejor de todos los tiempos</div>' +
      '<div style="display:flex;align-items:flex-end;justify-content:center;gap:8px">'+htmlPodio+'</div>' +
    '</div>' +
    (resto.length ? '<div style="background:var(--fondo);border:1px solid #1a1a1a;border-radius:14px;overflow:hidden">'+htmlResto+'</div>' : '');
}



// ═══════════════════════════════

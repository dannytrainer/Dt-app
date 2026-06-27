// ═══════════════════════════════════════════
// 🎮 JUEGOS
// ═══════════════════════════════════════════
function bloquearSwipe() {
  document.body.setAttribute('data-swipe-bloqueado','1');
}
function desbloquearSwipe() {
  document.body.removeAttribute('data-swipe-bloqueado');
}
function _swipeBlockFn(e) {
  if(document.body.getAttribute('data-swipe-bloqueado')==='1') e.preventDefault();
}

function renderJuegos(c) {
  desbloquearSwipe();
  c.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:#e31e24;text-transform:uppercase;margin-bottom:12px">🎮 Juegos</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="card" onclick="renderTriqui((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="cursor:pointer;text-align:center;padding:16px 10px">
          <div style="font-size:28px;margin-bottom:6px">✕○</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">Triqui</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">2 jugadores</div>
        </div>
        <div class="card" onclick="renderSnake((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="cursor:pointer;text-align:center;padding:16px 10px">
          <div style="font-size:28px;margin-bottom:6px">🐍</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">Snake</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">Esquiva y crece</div>
        </div>
        <div class="card" onclick="renderMemoria((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="cursor:pointer;text-align:center;padding:16px 10px">
          <div style="font-size:28px;margin-bottom:6px">🧠</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">Memoria</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">Encuentra los pares</div>
        </div>
        <div class="card" onclick="renderHockey((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="cursor:pointer;text-align:center;padding:16px 10px">
          <div style="font-size:28px;margin-bottom:6px">🏒</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">DT Hockey</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">2 jugadores</div>
        </div>
        </div>
        <div class="card" onclick="(localStorage.getItem('dt_rol')==='cliente'&&!tcEsPremium())?tcMostrarPremium():renderInvaders((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="cursor:pointer;text-align:center;padding:16px 10px;grid-column:1/-1">
          <div style="font-size:28px;margin-bottom:6px">👾</div>
          <div style="font-size:13px;font-weight:700;color:var(--texto)">DT Invaders ⭐</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:3px">100 niveles — Derrota al Sedentario Supremo</div>
        </div>
      </div>
    </div>`;
}

function renderHockey(c) {
  bloquearSwipe();
  c.innerHTML = `
    <button onclick="renderJuegos((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:10px">← Juegos</button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="text-align:center;flex:1">
        <div id="hk-score1" style="font-size:32px;font-weight:700;color:#3b82f6">0</div>
        <div style="font-size:10px;color:var(--texto-secundario)">JUGADOR 1</div>
      </div>
      <div style="font-size:12px;color:var(--texto-secundario)">VS</div>
      <div style="text-align:center;flex:1">
        <div id="hk-score2" style="font-size:32px;font-weight:700;color:#e31e24">0</div>
        <div style="font-size:10px;color:var(--texto-secundario)">JUGADOR 2</div>
      </div>
    </div>
    <canvas id="hk-canvas" style="width:100%;border-radius:12px;display:block;background:#111;border:1px solid #333;touch-action:none"></canvas>
    <div style="text-align:center;margin-top:10px">
      <button onclick="hkReset()" style="background:var(--gris);color:var(--texto);border:none;border-radius:8px;padding:8px 20px;font-size:12px;cursor:pointer">🔄 Reiniciar</button>
    </div>`;
  hkInit();
}

var _hk = {};

function hkInit() {
  var canvas = document.getElementById('hk-canvas');
  if (!canvas) return;
  var W = canvas.offsetWidth;
  var H = Math.round(W * 1.7);
  canvas.width = W;
  canvas.height = H;
  var R = W * 0.07;
  _hk = {
    W: W, H: H, R: R,
    puck: { x: W/2, y: H/2, r: W*0.055, vx: 3, vy: 4 },
    p1: { x: W/2, y: H*0.82, r: R, color: '#3b82f6' },
    p2: { x: W/2, y: H*0.18, r: R, color: '#e31e24' },
    score: [0, 0],
    activo: true,
    goalH: W*0.3,
    postR: W*0.025
  };
  canvas.ontouchstart = hkTouch;
  canvas.ontouchmove = hkTouch;
  hkLoop();
}

function hkTouch(e) {
  e.preventDefault();
  var canvas = document.getElementById('hk-canvas');
  var rect = canvas.getBoundingClientRect();
  var scaleX = _hk.W / rect.width;
  var scaleY = _hk.H / rect.height;
  for (var i = 0; i < e.touches.length; i++) {
    var t = e.touches[i];
    var tx = (t.clientX - rect.left) * scaleX;
    var ty = (t.clientY - rect.top) * scaleY;
    if (ty > _hk.H * 0.5) {
      _hk.p1.x = Math.max(_hk.R, Math.min(_hk.W - _hk.R, tx));
      _hk.p1.y = Math.max(_hk.H * 0.55, Math.min(_hk.H - _hk.R, ty));
    } else {
      _hk.p2.x = Math.max(_hk.R, Math.min(_hk.W - _hk.R, tx));
      _hk.p2.y = Math.max(_hk.R, Math.min(_hk.H * 0.45, ty));
    }
  }
}

function hkLoop() {
  if (!document.getElementById('hk-canvas')) return;
  if (!_hk.activo) return;
  hkUpdate();
  hkDraw();
  requestAnimationFrame(hkLoop);
}

function hkUpdate() {
  var p = _hk.puck;
  p.x += p.vx;
  p.y += p.vy;
  if (p.x - p.r < 0) { p.x = p.r; p.vx = Math.abs(p.vx); }
  if (p.x + p.r > _hk.W) { p.x = _hk.W - p.r; p.vx = -Math.abs(p.vx); }
  // Gol arriba (jugador 2 recibe gol)
  if (p.y - p.r < 0) {
    var gx = _hk.W/2 - _hk.goalH/2;
    if (p.x > gx && p.x < gx + _hk.goalH) {
      _hk.score[0]++;
      document.getElementById('hk-score1').textContent = _hk.score[0];
      hkResetPuck(1);
    } else { p.y = p.r; p.vy = Math.abs(p.vy); }
    return;
  }
  // Gol abajo (jugador 1 recibe gol)
  if (p.y + p.r > _hk.H) {
    var gx = _hk.W/2 - _hk.goalH/2;
    if (p.x > gx && p.x < gx + _hk.goalH) {
      _hk.score[1]++;
      document.getElementById('hk-score2').textContent = _hk.score[1];
      hkResetPuck(-1);
    } else { p.y = _hk.H - p.r; p.vy = -Math.abs(p.vy); }
    return;
  }
  hkColision(_hk.p1);
  hkColision(_hk.p2);
}

function hkColision(player) {
  var p = _hk.puck;
  var dx = p.x - player.x;
  var dy = p.y - player.y;
  var dist = Math.sqrt(dx*dx + dy*dy);
  var minDist = p.r + player.r;
  if (dist < minDist && dist > 0) {
    var nx = dx/dist;
    var ny = dy/dist;
    var speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
    speed = Math.min(speed * 1.05, 14);
    p.vx = nx * speed;
    p.vy = ny * speed;
    p.x = player.x + nx * (minDist + 1);
    p.y = player.y + ny * (minDist + 1);
  }
}

function hkResetPuck(dir) {
  _hk.puck = { x: _hk.W/2, y: _hk.H/2, r: _hk.W*0.055, vx: (Math.random()-0.5)*6, vy: dir*4 };
}

function hkReset() {
  _hk.score = [0,0];
  document.getElementById('hk-score1').textContent = '0';
  document.getElementById('hk-score2').textContent = '0';
  hkResetPuck(1);
}

function hkDraw() {
  var canvas = document.getElementById('hk-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = _hk.W, H = _hk.H;
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, W, H);
  // Línea central
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.setLineDash([8,6]);
  ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
  ctx.setLineDash([]);
  // Círculo central
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(W/2, H/2, W*0.12, 0, Math.PI*2); ctx.stroke();
  // Porterías
  var gx = W/2 - _hk.goalH/2;
  ctx.strokeStyle = '#e31e24';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx + _hk.goalH, 0); ctx.stroke();
  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath(); ctx.moveTo(gx, H); ctx.lineTo(gx + _hk.goalH, H); ctx.stroke();
  // Disco gym (puck)
  var p = _hk.puck;
  ctx.fillStyle = '#888';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#555';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r*0.55, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#666';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r*0.2, 0, Math.PI*2); ctx.fill();
  // Jugadores
  [_hk.p1, _hk.p2].forEach(function(pl) {
    ctx.fillStyle = pl.color;
    ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI*2); ctx.stroke();
  });
}

function renderInvaders(c) {
  bloquearSwipe();
  if(_inv.loop) cancelAnimationFrame(_inv.loop);
  var reps = parseInt(localStorage.getItem('inv_monedas')||0);
  var nivelGuardado = parseInt(localStorage.getItem('inv_nivel')||1);
  var scoreGuardado = parseInt(localStorage.getItem('inv_score')||0);
  var mejor = parseInt(localStorage.getItem('inv_mejor')||0);
  c.innerHTML = `
    <button onclick="desbloquearSwipe();renderJuegos((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')));invStop();" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:12px">← Juegos</button>
    <div style="text-align:center;padding:16px 0 8px">
      <div style="font-size:28px;font-weight:900;color:#e31e24;letter-spacing:2px;text-shadow:0 0 20px #e31e2488">DT INVADERS</div>
      <div style="font-size:11px;color:#666;margin-top:4px;letter-spacing:1px">DERROTA AL SEDENTARIO SUPREMO</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0">
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:18px;font-weight:700;color:#e31e24">${nivelGuardado}</div>
        <div style="font-size:10px;color:#666;margin-top:2px">NIVEL</div>
      </div>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:18px;font-weight:700;color:#f59e0b">${reps} 💪</div>
        <div style="font-size:10px;color:#666;margin-top:2px">REPS</div>
      </div>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:18px;font-weight:700;color:#22c55e">${mejor}</div>
        <div style="font-size:10px;color:#666;margin-top:2px">MEJOR</div>
      </div>
    </div>
    <div style="background:#1a1a1a;border:1px solid #222;border-radius:12px;padding:12px;margin-bottom:16px">
      <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Mundo actual</div>
      <div id="inv-mundo-label" style="font-size:13px;font-weight:700;color:#e31e24"></div>
      <div style="display:flex;gap:4px;margin-top:8px">
        ${[1,2,3,4,5].map((m,i) => '<div style="flex:1;height:4px;border-radius:2px;background:'+(nivelGuardado>(i*20)?'#e31e24':'#333')+'"></div>').join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:#444;margin-top:4px">
        <span>Gym</span><span>Calle</span><span>Fast Food</span><span>Vicios</span><span>Final</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <button onclick="invIrTienda()" style="background:#1a1a1a;color:#f59e0b;border:1px solid #f59e0b;border-radius:10px;padding:14px;font-size:13px;font-weight:700;cursor:pointer">🏪 Tienda</button>
      <button onclick="invIrNiveles()" style="background:#1a1a1a;color:#3b82f6;border:1px solid #3b82f6;border-radius:10px;padding:14px;font-size:13px;font-weight:700;cursor:pointer">🗺️ Niveles</button>
    </div>
    <button onclick="invEmpezar()" style="width:100%;background:#e31e24;color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;letter-spacing:2px">▶ JUGAR — NIVEL ${nivelGuardado}</button>
    <div id="inv-contenido"></div>`;
  var mundo = Math.min(4, Math.floor((nivelGuardado-1)/20));
  var mundos = ['🏋️ Gym Novato','🚶 Calle','🍔 Fast Food','🥃 Vicios Avanzados','👹 Jefe Final'];
  var ml = document.getElementById('inv-mundo-label');
  if(ml) ml.textContent = mundos[mundo];
}

function invIrNiveles() {
  var c = document.getElementById('inv-contenido');
  if(!c) return;
  var nivelActual = parseInt(localStorage.getItem('inv_nivel')||1);
  var mundos = [
    {nombre:'Gym Novato', color:'#e31e24', desde:1, hasta:20},
    {nombre:'Calle', color:'#f59e0b', desde:21, hasta:40},
    {nombre:'Fast Food', color:'#22c55e', desde:41, hasta:60},
    {nombre:'Vicios', color:'#a855f7', desde:61, hasta:80},
    {nombre:'Jefe Final', color:'#fff', desde:81, hasta:100}
  ];
  var div = document.createElement('div');
  div.style.marginTop = '12px';

  var btnVolver = document.createElement('button');
  btnVolver.textContent = '← Inicio';
  btnVolver.style.cssText = 'background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:12px';
  btnVolver.onclick = function(){ c.innerHTML=''; };
  div.appendChild(btnVolver);

  mundos.forEach(function(m) {
    var sec = document.createElement('div');
    sec.style.marginBottom = '16px';
    var titulo = document.createElement('div');
    titulo.style.cssText = 'font-size:12px;font-weight:700;color:'+m.color+';margin-bottom:8px;display:flex;justify-content:space-between';
    titulo.innerHTML = '<span>'+m.nombre+'</span><span style="color:#555;font-weight:400">'+m.desde+'-'+m.hasta+'</span>';
    sec.appendChild(titulo);
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px';
    for(var n=m.desde; n<=m.hasta; n++) {
      var desbloqueado = n <= nivelActual;
      var esActual = n === nivelActual;
      var esJefe = n % 10 === 0;
      var celda = document.createElement('div');
      celda.style.cssText = 'background:'+(esActual?m.color:'#1a1a1a')+';border:1px solid '+(esActual?m.color:desbloqueado?'#333':'#1a1a1a')+';border-radius:8px;padding:6px 2px;text-align:center;cursor:'+(desbloqueado?'pointer':'default');
      celda.innerHTML = '<div style="font-size:14px">'+(esJefe?'👹':desbloqueado?'✅':'🔒')+'</div><div style="font-size:10px;color:'+(esActual?'#fff':desbloqueado?'#aaa':'#333')+';font-weight:'+(esActual?'700':'400')+'">'+n+'</div>';
      if(desbloqueado) {
        (function(nivel){ celda.onclick = function(){ invJugarNivel(nivel); }; })(n);
      }
      grid.appendChild(celda);
    }
    sec.appendChild(grid);
    div.appendChild(sec);
  });
  c.innerHTML = '';
  c.appendChild(div);
}

function invJugarNivel(n) {
  localStorage.setItem('inv_nivel', n);
  invEmpezar();
}

function invIrTienda(pestana) {
  pestana = pestana || 'upgrades';
  var c = document.getElementById('inv-contenido');
  if(!c) return;
  var reps = parseInt(localStorage.getItem('inv_monedas')||0);
  var upgrades = JSON.parse(localStorage.getItem('inv_upgrades')||'{}');
  var skins = JSON.parse(localStorage.getItem('inv_skins')||'{}');

  var div = document.createElement('div');
  div.style.marginTop = '12px';

  // Botón volver
  var btnV = document.createElement('button');
  btnV.textContent = '← Inicio';
  btnV.style.cssText = 'background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:12px';
  btnV.onclick = function(){ c.innerHTML=''; };
  div.appendChild(btnV);

  // Header reps
  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px';
  hdr.innerHTML = '<div style="font-size:15px;font-weight:700;color:#f59e0b">🏪 Tienda</div><div style="font-size:13px;color:#f59e0b;font-weight:700" id="inv-tienda-reps">'+reps+' 💪</div>';
  div.appendChild(hdr);

  // Pestañas
  var tabs = document.createElement('div');
  tabs.style.cssText = 'display:flex;gap:6px;margin-bottom:14px';
  ['upgrades','disparos','naves'].forEach(function(tab){
    var t = document.createElement('button');
    t.textContent = tab==='upgrades'?'⚔️ Mejoras':tab==='disparos'?'💥 Disparos':'🚀 Naves';
    t.style.cssText = 'flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;border:none;background:'+(pestana===tab?'#e31e24':'#1a1a1a')+';color:'+(pestana===tab?'#fff':'#666');
    t.onclick = (function(tb){ return function(){ invIrTienda(tb); }; })(tab);
    tabs.appendChild(t);
  });
  div.appendChild(tabs);

  var contenido = document.createElement('div');

  if(pestana === 'upgrades') {
    // UPGRADES PROGRESIVOS
    var progresivos = [
      {key:'disparo_vel', emoji:'⚡', nombre:'Velocidad disparo', desc:'Dispara más rápido', costo:40, max:5},
      {key:'vida_max', emoji:'❤️', nombre:'Vida máxima', desc:'+1 vida al iniciar nivel', costo:50, max:5},
      {key:'escudo', emoji:'🛡️', nombre:'Escudo pasivo', desc:'Cooldown menor entre escudos', costo:60, max:5},
      {key:'cobertura', emoji:'🧱', nombre:'Coberturas', desc:'+1 cobertura y +1 vida por cobertura', costo:45, max:5}
    ];
    var unicos = [
      {key:'doble_disparo', emoji:'👐', nombre:'Doble disparo', desc:'Dispara por ambas manos siempre', costo:300},
      {key:'barra_especial', emoji:'🏋️', nombre:'Barra 100kg', desc:'Poder especial — carga matando enemigos', costo:500}
    ];

    var sep1 = document.createElement('div');
    sep1.style.cssText = 'font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px';
    sep1.textContent = 'Mejoras progresivas';
    contenido.appendChild(sep1);

    progresivos.forEach(function(item){
      var nv = upgrades[item.key]||0;
      var costo = item.costo + nv*25;
      var puede = reps >= costo && nv < item.max;
      var fila = invCrearFilaTienda(item.emoji, item.nombre, item.desc, nv, item.max, costo, puede, item.key, false);
      contenido.appendChild(fila);
    });

    var sep2 = document.createElement('div');
    sep2.style.cssText = 'font-size:10px;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;margin:12px 0 8px';
    sep2.textContent = '⭐ Compra única';
    contenido.appendChild(sep2);

    unicos.forEach(function(item){
      var comprado = upgrades[item.key] >= 1;
      var puede = reps >= item.costo && !comprado;
      var fila = invCrearFilaTienda(item.emoji, item.nombre, item.desc, comprado?1:0, 1, item.costo, puede, item.key, true);
      contenido.appendChild(fila);
    });

  } else if(pestana === 'disparos') {
    var skinsDisp = [
      {key:'disp_rojo', emoji:'🔴', nombre:'Mancuerna Roja', desc:'Disparo clásico', costo:0},
      {key:'disp_verde', emoji:'🟢', nombre:'Mancuerna Verde', desc:'Disparo energético', costo:50},
      {key:'disp_azul', emoji:'🔵', nombre:'Mancuerna Azul', desc:'Disparo helado', costo:100},
      {key:'disp_rayo', emoji:'⚡', nombre:'Rayo Eléctrico', desc:'Disparo eléctrico', costo:200},
      {key:'disp_fuego', emoji:'🔥', nombre:'Llama de Fuego', desc:'Disparo ardiente', costo:300},
      {key:'disp_dorado', emoji:'⭐', nombre:'Mancuerna Dorada', desc:'Disparo élite', costo:500}
    ];
    var skinActiva = skins.disparo || 'disp_rojo';
    skinsDisp.forEach(function(sk){
      var comprado = sk.costo===0 || skins[sk.key];
      var activa = skinActiva === sk.key;
      var puede = reps >= sk.costo && !comprado;
      var fila = document.createElement('div');
      fila.style.cssText = 'background:'+(activa?'#1a0000':'#1a1a1a')+';border:1px solid '+(activa?'#e31e24':'#2a2a2a')+';border-radius:10px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px';
      var em = document.createElement('div');
      em.style.fontSize='24px'; em.textContent=sk.emoji;
      var inf = document.createElement('div');
      inf.style.flex='1';
      inf.innerHTML='<div style="font-size:13px;font-weight:700;color:#fff">'+sk.nombre+'</div><div style="font-size:10px;color:#666">'+sk.desc+'</div>';
      fila.appendChild(em); fila.appendChild(inf);
      if(activa){
        var act=document.createElement('div');
        act.style.cssText='font-size:10px;color:#e31e24;font-weight:700';
        act.textContent='ACTIVO'; fila.appendChild(act);
      } else if(comprado){
        var btn=document.createElement('button');
        btn.style.cssText='background:#333;color:#fff;border:none;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer';
        btn.textContent='Usar';
        (function(k){ btn.onclick=function(){ skins.disparo=k; localStorage.setItem('inv_skins',JSON.stringify(skins)); invIrTienda('disparos'); }; })(sk.key);
        fila.appendChild(btn);
      } else {
        var btn2=document.createElement('button');
        btn2.style.cssText='background:'+(puede?'#e31e24':'#2a2a2a')+';color:'+(puede?'#fff':'#555')+';border:none;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:'+(puede?'pointer':'not-allowed');
        btn2.textContent=sk.costo+' 💪';
        if(puede)(function(k,co){ btn2.onclick=function(){ var r=parseInt(localStorage.getItem('inv_monedas')||0); if(r<co)return; r-=co; localStorage.setItem('inv_monedas',r); skins[k]=true; skins.disparo=k; localStorage.setItem('inv_skins',JSON.stringify(skins)); invIrTienda('disparos'); }; })(sk.key,sk.costo);
        fila.appendChild(btn2);
      }
      contenido.appendChild(fila);
    });

  } else if(pestana === 'naves') {
    var skinsNave = [
      {key:'nave_m', emoji:'🏋️', nombre:'Entrenador', desc:'La nave original', costo:0, img:'Entrenador1.png'},
      {key:'nave_f', emoji:'🏋️‍♀️', nombre:'Entrenadora', desc:'Versión femenina', costo:150},
      {key:'nave_box', emoji:'🥊', nombre:'Boxeador DT', desc:'Estilo boxeo', costo:300},
      {key:'nave_elite', emoji:'⚡', nombre:'DT Élite', desc:'Versión definitiva', costo:1000}
    ];
    var naveActiva = skins.nave || 'nave_m';
    skinsNave.forEach(function(sk){
      var comprado = sk.costo===0 || skins[sk.key];
      var activa = naveActiva === sk.key;
      var puede = reps >= sk.costo && !comprado;
      var fila = document.createElement('div');
      fila.style.cssText = 'background:'+(activa?'#1a0000':'#1a1a1a')+';border:1px solid '+(activa?'#e31e24':'#2a2a2a')+';border-radius:10px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px';
      var em=document.createElement('div'); em.style.fontSize='24px'; em.textContent=sk.emoji;
      var inf=document.createElement('div'); inf.style.flex='1';
      inf.innerHTML='<div style="font-size:13px;font-weight:700;color:#fff">'+sk.nombre+'</div><div style="font-size:10px;color:#666">'+sk.desc+'</div>';
      fila.appendChild(em); fila.appendChild(inf);
      if(activa){
        var act=document.createElement('div'); act.style.cssText='font-size:10px;color:#e31e24;font-weight:700'; act.textContent='ACTIVO'; fila.appendChild(act);
      } else if(comprado){
        var btn=document.createElement('button');
        btn.style.cssText='background:#333;color:#fff;border:none;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer';
        btn.textContent='Usar';
        (function(k){ btn.onclick=function(){ skins.nave=k; localStorage.setItem('inv_skins',JSON.stringify(skins)); invIrTienda('naves'); }; })(sk.key);
        fila.appendChild(btn);
      } else {
        var btn2=document.createElement('button');
        btn2.style.cssText='background:'+(puede?'#e31e24':'#2a2a2a')+';color:'+(puede?'#fff':'#555')+';border:none;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:'+(puede?'pointer':'not-allowed');
        btn2.textContent=sk.costo+' 💪';
        if(puede)(function(k,co){ btn2.onclick=function(){ var r=parseInt(localStorage.getItem('inv_monedas')||0); if(r<co)return; r-=co; localStorage.setItem('inv_monedas',r); skins[k]=true; skins.nave=k; localStorage.setItem('inv_skins',JSON.stringify(skins)); invIrTienda('naves'); }; })(sk.key,sk.costo);
        fila.appendChild(btn2);
      }
      contenido.appendChild(fila);
    });
  }

  div.appendChild(contenido);
  c.innerHTML='';
  c.appendChild(div);
}

function invCrearFilaTienda(emoji, nombre, desc, nv, max, costo, puede, key, unico) {
  var fila = document.createElement('div');
  fila.style.cssText = 'background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px';
  var em=document.createElement('div'); em.style.fontSize='24px'; em.textContent=emoji;
  var inf=document.createElement('div'); inf.style.flex='1';
  var barras='';
  for(var i=0;i<max;i++) barras+='<div style="width:16px;height:3px;border-radius:2px;background:'+(i<nv?'#f59e0b':'#333')+'"></div>';
  inf.innerHTML='<div style="font-size:13px;font-weight:700;color:#fff">'+nombre+'</div><div style="font-size:10px;color:#666;margin-bottom:4px">'+desc+'</div><div style="display:flex;gap:2px">'+barras+'</div>';
  fila.appendChild(em); fila.appendChild(inf);
  if(nv>=max){
    var mx=document.createElement('div'); mx.style.cssText='font-size:10px;color:#22c55e;font-weight:700;white-space:nowrap'; mx.textContent=unico?'✅ Comprado':'MAX ✅'; fila.appendChild(mx);
  } else {
    var btn=document.createElement('button');
    btn.style.cssText='background:'+(puede?'#e31e24':'#2a2a2a')+';color:'+(puede?'#fff':'#555')+';border:none;border-radius:8px;padding:8px 10px;font-size:11px;font-weight:700;cursor:'+(puede?'pointer':'not-allowed')+';white-space:nowrap';
    btn.textContent=costo+' 💪';
    if(puede)(function(k,co){ btn.onclick=function(){ invComprarItem(k,co); }; })(key,costo);
    fila.appendChild(btn);
  }
  return fila;
}

function invIrTienda_old() {
  var c = document.getElementById('inv-contenido');
  if(!c) return;
  var reps = parseInt(localStorage.getItem('inv_monedas')||0);
  var upgrades = JSON.parse(localStorage.getItem('inv_upgrades')||'{}');
  var items = [
    {key:'velocidad', emoji:'💨', nombre:'Velocidad nave', desc:'Muévete más rápido', costo:30},
    {key:'cadencia', emoji:'⚡', nombre:'Cadencia disparo', desc:'Dispara más seguido', costo:40},
    {key:'vida_max', emoji:'❤️', nombre:'Vida máxima', desc:'+1 vida permanente', costo:50},
    {key:'dano', emoji:'🏋️', nombre:'Barra 100kg', desc:'Daño especial masivo', costo:60},
    {key:'escudo', emoji:'🛡️', nombre:'Escudo pasivo', desc:'Absorbe 1 golpe cada 15s', costo:80},
    {key:'cobertura', emoji:'🧱', nombre:'Coberturas GYM DT', desc:'2 bloques protectores por nivel', costo:45}
  ];
  var div = document.createElement('div');
  div.style.marginTop = '12px';

  var btnVolver = document.createElement('button');
  btnVolver.textContent = '← Inicio';
  btnVolver.style.cssText = 'background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:12px';
  btnVolver.onclick = function(){ c.innerHTML=''; };
  div.appendChild(btnVolver);

  var header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px';
  var titulo = document.createElement('div');
  titulo.style.cssText = 'font-size:14px;font-weight:700;color:#f59e0b';
  titulo.textContent = '🏪 Tienda';
  var repsEl = document.createElement('div');
  repsEl.id = 'inv-tienda-reps';
  repsEl.style.cssText = 'font-size:13px;color:#f59e0b;font-weight:700';
  repsEl.textContent = reps+' 💪 reps';
  header.appendChild(titulo); header.appendChild(repsEl);
  div.appendChild(header);

  items.forEach(function(item) {
    var nv = upgrades[item.key]||0;
    var max = 5;
    var costo = item.costo + nv*20;
    var puede = reps >= costo && nv < max;
    var fila = document.createElement('div');
    fila.style.cssText = 'background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px';
    var emojiEl = document.createElement('div');
    emojiEl.style.fontSize = '24px';
    emojiEl.textContent = item.emoji;
    var info = document.createElement('div');
    info.style.flex = '1';
    var barras = '';
    for(var i=0;i<max;i++) barras += '<div style="width:16px;height:3px;border-radius:2px;background:'+(i<nv?'#f59e0b':'#333')+'"></div>';
    info.innerHTML = '<div style="font-size:13px;font-weight:700;color:#fff">'+item.nombre+'</div><div style="font-size:10px;color:#666;margin-bottom:4px">'+item.desc+'</div><div style="display:flex;gap:2px">'+barras+'</div>';
    fila.appendChild(emojiEl); fila.appendChild(info);
    if(nv >= max) {
      var maxEl = document.createElement('div');
      maxEl.style.cssText = 'font-size:10px;color:#22c55e;font-weight:700;white-space:nowrap';
      maxEl.textContent = 'MAX ✅';
      fila.appendChild(maxEl);
    } else {
      var btn = document.createElement('button');
      btn.style.cssText = 'background:'+(puede?'#e31e24':'#2a2a2a')+';color:'+(puede?'#fff':'#555')+';border:none;border-radius:8px;padding:8px 10px;font-size:11px;font-weight:700;cursor:'+(puede?'pointer':'not-allowed')+';white-space:nowrap';
      btn.textContent = costo+' 💪';
      if(puede) {
        (function(k,co){ btn.onclick = function(){ invComprarItem(k,co); }; })(item.key, costo);
      }
      fila.appendChild(btn);
    }
    div.appendChild(fila);
  });
  c.innerHTML = '';
  c.appendChild(div);
}

function invComprarItem(key, costo) {
  var reps = parseInt(localStorage.getItem('inv_monedas')||0);
  var upgrades = JSON.parse(localStorage.getItem('inv_upgrades')||'{}');
  if(reps < costo || (upgrades[key]||0) >= 5) return;
  upgrades[key] = (upgrades[key]||0) + 1;
  reps -= costo;
  localStorage.setItem('inv_monedas', reps);
  localStorage.setItem('inv_upgrades', JSON.stringify(upgrades));
  invIrTienda();
}

function invEmpezar() {
  var c = document.getElementById('inv-contenido');
  if(!c) return;
  c.innerHTML = `
    <button onclick="desbloquearSwipe();renderJuegos((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')));invStop();"  style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:8px">← Juegos</button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-size:11px;color:var(--texto-secundario)">Nivel <span id="inv-nivel" style="color:#e31e24;font-weight:700">1</span></div>
      <div style="font-size:13px;font-weight:700;color:#f59e0b">⭐ <span id="inv-score">0</span></div>
      <div style="font-size:11px;color:var(--texto-secundario)">❤️ <span id="inv-vidas" style="font-weight:700">3</span></div>
    </div>
    <canvas id="inv-canvas" style="width:100%;border-radius:12px;display:block;background:#000;touch-action:none"></canvas>
    <div style="display:flex;gap:6px;margin-top:8px;justify-content:center">
      <div id="inv-btn-fuego" style="background:#e31e24;color:#fff;border:none;border-radius:8px;padding:14px 32px;font-size:14px;font-weight:700;cursor:pointer;user-select:none;-webkit-user-select:none;flex:1;text-align:center">🔫 FUEGO</div>
    </div>
    <div style="text-align:center;font-size:10px;color:var(--texto-secundario);margin-top:6px">Desliza en el canvas para mover · Toca FUEGO para disparar</div>
    <div id="inv-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999;align-items:center;justify-content:center;flex-direction:column;gap:12px">
      <div id="inv-overlay-title" style="font-size:24px;font-weight:700;color:#e31e24;text-align:center"></div>
      <div id="inv-overlay-sub" style="font-size:14px;color:var(--texto-medio);text-align:center"></div>
      <button id="inv-overlay-btn" style="background:#e31e24;color:#fff;border:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px"></button>
    </div>`;
  invInit();
}

var _invImg = {};
var _invImgEntrenador = new Image();
_invImgEntrenador.src = '/images/Entrenador1.png';
_invImgEntrenador.onload = function(){ _invImg.entrenador = _invImgEntrenador; };

var _inv = {
  loop: null, corriendo: false,
  W: 0, H: 0,
  nave: { x: 0, y: 0, w: 36, h: 20, vel: 0, speed: 5 },
  balas: [], enemigas: [], powerups: [], particulas: [],
  enemigos: [], obstaculos: [],
  score: 0, nivel: 1, vidas: 3,
  dirMover: 0, ultimoBalaEnemigo: 0, ultimoFrame: 0,
  mundos: [
    {
      nombre:'Gym Novato', color:'#e31e24',
      emojis:['🧔','👨','👩','🧕','👴','👩‍🦳','🧍'],
      // tipos disponibles en este mundo: 0-6 (gorditos básicos)
      // img futuras: gordito0.png - gordito6.png
      enemigosPool: [
        {tipo:0, emoji:'🧔', nombre:'Gordito Rojo'},
        {tipo:0, emoji:'👨', nombre:'Gordito Común'},
        {tipo:0, emoji:'👩', nombre:'Gordita'},
        {tipo:0, emoji:'🧕', nombre:'Gordita 2'},
        {tipo:0, emoji:'👴', nombre:'Gordito Mayor'},
        {tipo:0, emoji:'👩‍🦳', nombre:'Gordita Mayor'},
        {tipo:0, emoji:'🧍', nombre:'Gordito Negro'}
      ]
    },
    {
      nombre:'Calle', color:'#f59e0b',
      emojis:['🍔','🍕','🍺','🥤','🍟','🍬','🍰','🍦'],
      enemigosPool: [
        {tipo:0, emoji:'🍔', nombre:'Hamburguesa'},
        {tipo:1, emoji:'🍕', nombre:'Pizza', desc:'Zigzag'},
        {tipo:2, emoji:'🍺', nombre:'Cerveza', desc:'Blindado'},
        {tipo:6, emoji:'🥤', nombre:'Refresco', desc:'Francotirador'},
        {tipo:3, emoji:'🍟', nombre:'Papas Fritas', desc:'Bomba'},
        {tipo:5, emoji:'🍬', nombre:'Dulces', desc:'Clonador'},
        {tipo:4, emoji:'🍰', nombre:'Pastel', desc:'Fantasma'},
        {tipo:0, emoji:'🍦', nombre:'Helado'}
      ]
    },
    {
      nombre:'Fast Food', color:'#22c55e',
      emojis:['🎮','📺','📱','📲','🍿','😴'],
      enemigosPool: [
        {tipo:1, emoji:'🎮', nombre:'Videojuegos', desc:'Corredor'},
        {tipo:2, emoji:'📺', nombre:'TV', vida:5, desc:'Blindado fuerte'},
        {tipo:6, emoji:'📱', nombre:'Redes Sociales', desc:'Francotirador'},
        {tipo:6, emoji:'📲', nombre:'Celular', desc:'Francotirador preciso'},
        {tipo:3, emoji:'🍿', nombre:'Comida Chatarra', desc:'Bomba grande'},
        {tipo:0, emoji:'😴', nombre:'Flojera', desc:'Muy lento mucha vida', vida:4}
      ]
    },
    {
      nombre:'Vicios', color:'#a855f7',
      emojis:['🚬','🍾','💊','😵','😤','🦥','🧟'],
      enemigosPool: [
        {tipo:1, emoji:'🚬', nombre:'Fumar', desc:'Dispara humo'},
        {tipo:1, emoji:'🍾', nombre:'Alcohol', desc:'Zigzag borracho'},
        {tipo:2, emoji:'💊', nombre:'Drogas', desc:'Errático'},
        {tipo:4, emoji:'😵', nombre:'No Dormir', desc:'Invisible frecuente'},
        {tipo:1, emoji:'😤', nombre:'Estrés', desc:'Se acelera'},
        {tipo:5, emoji:'🦥', nombre:'Procrastinación', desc:'Reaparece'},
        {tipo:2, emoji:'🧟', nombre:'Aislamiento', desc:'Jefe mini', vida:3}
      ]
    },
    {
      nombre:'Jefe Final', color:'#fff',
      emojis:['👹','💀','😈','🔥','☠️','👿','🤡'],
      enemigosPool: [
        {tipo:2, emoji:'👹', nombre:'Demonio Gordo', vida:3},
        {tipo:6, emoji:'💀', nombre:'Calavera', desc:'Francotirador élite'},
        {tipo:3, emoji:'😈', nombre:'Diablo', desc:'Bomba masiva'},
        {tipo:4, emoji:'🔥', nombre:'Fuego', desc:'Invisible'},
        {tipo:1, emoji:'☠️', nombre:'Veneno', desc:'Corredor élite'},
        {tipo:5, emoji:'👿', nombre:'Maldad', desc:'Clonador élite'},
        {tipo:2, emoji:'🤡', nombre:'Payaso Sedentario', vida:5}
      ]
    }
  ]
};

function invInit() {
  var canvas = document.getElementById('inv-canvas');
  if(!canvas) return;
  var W = canvas.offsetWidth;
  canvas.width = W;
  canvas.height = Math.round(W * 1.5);
  _inv.W = W; _inv.H = canvas.height;
  _inv.nave.x = W/2;
  _inv.nave.y = _inv.H - 50;
  _inv.score = parseInt(localStorage.getItem('inv_score')||0);
  _inv.nivel = parseInt(localStorage.getItem('inv_nivel')||1);
  // Aplicar upgrades comprados
  var up = JSON.parse(localStorage.getItem('inv_upgrades')||'{}');
  // Cadencia — 300ms base, cada nivel -40ms
  _inv.cadenciaMs = Math.max(80, 300 - (up.disparo_vel||0) * 40);
  // Vida máxima
  _inv.vidas = 3 + (up.vida_max||0);
  // Escudo pasivo — cooldown base 15s, cada nivel -2s
  _inv.escudoPasivo = (up.escudo||0) > 0;
  _inv.escudoCooldown = Math.max(5000, 15000 - (up.escudo||0) * 2000);
  _inv.escudoPasivoTimer = 0;
  // Jefe
  invDibujarJefe();
  // Coberturas — cantidad y vida según nivel
  _inv.coberturas = (up.cobertura||0) > 0;
  _inv.coberturasCant = 2 + (up.cobertura||0);
  _inv.coberturasVida = 2 + (up.cobertura||0);
  // Doble disparo permanente
  _inv.dobleDisparo = (up.doble_disparo||0) >= 1;
  // Barra especial desbloqueada
  _inv.barraDesbloqueada = (up.barra_especial||0) >= 1;
  _inv.barraCarga = 0;
  _inv.barraMax = 20;
  _inv.balas = []; _inv.powerups = []; _inv.particulas = [];
  _inv.ultimoEvento = Date.now();
  _inv.proximoEvento = 20000 + Math.random()*15000;
  document.getElementById('inv-score').textContent = _inv.score;
  document.getElementById('inv-nivel').textContent = _inv.nivel;
  document.getElementById('inv-vidas').textContent = _inv.vidas;
  _inv.jefe = null;
  _inv.oleadaActual = 1;
  var digitoNivel = _inv.nivel % 10;
  _inv.oleadasTotal = digitoNivel === 0 ? 1 : digitoNivel <= 3 ? 3 : digitoNivel <= 6 ? 4 : 5;
  _inv.transicion = false;
  invCrearEnemigos();
  if(_inv.coberturas) invCrearCoberturas();
  setTimeout(invBindControles, 100);
  _inv.corriendo = true;
  invLoop();
}

function invCrearCoberturas() {
  _inv.coberturasArr = [];
  var cant = _inv.coberturasCant || 2;
  var vida = _inv.coberturasVida || 3;
  for(var i=0;i<cant;i++) {
    var x = _inv.W * (0.15 + (i/(cant-1||1))*0.7);
    _inv.coberturasArr.push({x:x, y:_inv.H*0.72, vida:vida, maxVida:vida});
  }
}

function invCrearEnemigo(x, y, tipo, emoji, vida, vx, vy) {
  // Si no se pasa emoji, tomar del pool del mundo actual
  var mundo = Math.min(4, Math.floor((_inv.nivel-1)/20));
  var pool = _inv.mundos[mundo].enemigosPool;
  // Buscar en pool un enemigo del tipo solicitado
  var candidatos = pool.filter(function(e){ return e.tipo === (tipo||0); });
  var def = candidatos.length > 0
    ? candidatos[Math.floor(Math.random()*candidatos.length)]
    : pool[Math.floor(Math.random()*pool.length)];
  var vidaFinal = vida || def.vida || 1;
  var emojiFinal = emoji || def.emoji;
  // Posición inicial fuera de pantalla para animación de entrada
  var entradaDesde = Math.floor(Math.random()*3); // 0=arriba 1=izq 2=der
  var startX = entradaDesde===1 ? -40 : entradaDesde===2 ? (_inv.W||400)+40 : x;
  var startY = entradaDesde===0 ? -40 : y;
  return {
    x:startX, y:startY,
    destX:x, destY:y,
    w:28, h:28,
    tipo: def.tipo||0,
    vida: vidaFinal, vidaMax: vidaFinal,
    emoji: emojiFinal,
    nombre: def.nombre||'',
    angulo:0, invisible:false, invisTimer:0,
    vx:vx||0, vy:vy||0,
    entrando: true, entradaT: 0
  };
}

// ═══════════════════════════════════════
// JEFES
// ═══════════════════════════════════════
var _invJefes = [
  {nivel:10,  nombre:'El Gordo del Gym',        emoji:'🧔', vida:60,  color:'#e31e24'},
  {nivel:20,  nombre:'El Rey del Sofá',          emoji:'🛋️', vida:100, color:'#f59e0b'},
  {nivel:30,  nombre:'Ronald Malcomida',         emoji:'🍔', vida:140, color:'#22c55e'},
  {nivel:40,  nombre:'El Señor Vicio',           emoji:'🍾', vida:180, color:'#a855f7'},
  {nivel:50,  nombre:'La Pizza Gigante',         emoji:'🍕', vida:220, color:'#f97316'},
  {nivel:60,  nombre:'El Aguardiente Supremo',   emoji:'🥃', vida:260, color:'#06b6d4'},
  {nivel:70,  nombre:'El Sedentario Élite',      emoji:'😴', vida:300, color:'#6366f1'},
  {nivel:80,  nombre:'El Anti-DT',               emoji:'😈', vida:360, color:'#ec4899'},
  {nivel:90,  nombre:'La Pereza Absoluta',       emoji:'🦥', vida:400, color:'#84cc16'},
  {nivel:100, nombre:'EL SEDENTARIO SUPREMO',    emoji:'👹', vida:600, color:'#e31e24'}
];

function invEsNivelJefe(nivel) { return nivel % 10 === 0; }

function invCrearJefe(nivel) {
  var def = _invJefes.find(function(j){ return j.nivel === nivel; });
  if(!def) def = _invJefes[Math.floor((nivel/10)-1)] || _invJefes[_invJefes.length-1];
  _inv.jefe = {
    x: _inv.W/2, y: 80,
    w: 64, h: 64,
    vida: def.vida + nivel*2,
    vidaMax: def.vida + nivel*2,
    nombre: def.nombre,
    emoji: def.emoji,
    color: def.color,
    fase: 1,
    angulo: 0,
    velX: 1.5,
    ultimoDisparo: 0,
    escolta: []
  };
}

function invUpdateJefe() {
  if(!_inv.jefe) return;
  var j = _inv.jefe;
  var W = _inv.W, H = _inv.H;
  var pct = j.vida / j.vidaMax;

  // Determinar fase
  j.fase = pct > 0.6 ? 1 : pct > 0.3 ? 2 : 3;

  // Movimiento según fase
  j.angulo += 0.02;
  if(j.fase === 1) {
    j.x += j.velX * (1 + (_inv.nivel*0.02));
    if(j.x < 50 || j.x > W-50) j.velX *= -1;
  } else if(j.fase === 2) {
    j.x += j.velX * 1.8;
    j.y = 80 + Math.sin(j.angulo*2)*20;
    if(j.x < 50 || j.x > W-50) j.velX *= -1;
  } else {
    // Fase 3 — parpadea y baja lentamente
    j.x += j.velX * 2.5;
    j.y = Math.min(j.y + 0.05, H*0.35);
    if(j.x < 50 || j.x > W-50) j.velX *= -1;
  }

  // Disparos del jefe
  var ahora = Date.now();
  var cooldown = j.fase===1 ? 2000 : j.fase===2 ? 1200 : 700;
  if(ahora - j.ultimoDisparo > cooldown) {
    j.ultimoDisparo = ahora;
    if(j.fase === 1) {
      // 1 bala hacia la nave
      var dx = _inv.nave.x - j.x, dy = _inv.nave.y - j.y;
      var dist = Math.sqrt(dx*dx+dy*dy)||1;
      _inv.balas.push({x:j.x, y:j.y+35, dy:(dy/dist)*5, dx:(dx/dist)*3, w:10, h:16, esNave:false, esJefe:true});
    } else if(j.fase === 2) {
      // 2 balas en diagonal
      _inv.balas.push({x:j.x-20, y:j.y+35, dy:5, dx:-2, w:10, h:16, esNave:false, esJefe:true});
      _inv.balas.push({x:j.x+20, y:j.y+35, dy:5, dx:2, w:10, h:16, esNave:false, esJefe:true});
    } else {
      // 3 balas en abanico
      for(var bi=-1;bi<=1;bi++)
        _inv.balas.push({x:j.x, y:j.y+35, dy:5, dx:bi*3, w:10, h:16, esNave:false, esJefe:true});
    }
    // Fase 2: invocar escolta
    if(j.fase === 2 && j.escolta.length < 3 && Math.random()<0.3) {
      var mundo = Math.min(4,Math.floor((_inv.nivel-1)/20));
      j.escolta.push(invCrearEnemigo(j.x+(Math.random()-0.5)*100, j.y+80, 0, null, 1));
      _inv.enemigos.push(j.escolta[j.escolta.length-1]);
    }
  }

  // Colisiones balas jugador vs jefe
  _inv.balas.filter(function(b){return b.esNave;}).forEach(function(b){
    if(Math.abs(b.x-j.x)<(j.w/2+b.w/2) && Math.abs(b.y-j.y)<(j.h/2+b.h/2)) {
      var dano = b.especial ? 3 : 1;
      j.vida -= dano;
      b.y = -999;
      invParticulasExp(j.x+(Math.random()-0.5)*30, j.y+(Math.random()-0.5)*30, '💥');
      if(j.vida <= 0) invMatarJefe();
    }
  });

  // Colisión jefe vs nave
  if(Math.abs(j.x-_inv.nave.x)<50 && Math.abs(j.y-_inv.nave.y)<60) {
    invPerdidaVida();
  }
}

function invMatarJefe() {
  var repsJefe = 50 + (_inv.nivel/10)*50;
  var totalReps = parseInt(localStorage.getItem('inv_monedas')||0) + repsJefe;
  localStorage.setItem('inv_monedas', totalReps);
  _inv.score += 500 * _inv.nivel;
  document.getElementById('inv-score').textContent = _inv.score;
  invParticulasExp(_inv.jefe.x, _inv.jefe.y, '🏆');
  invParticulasExp(_inv.jefe.x-30, _inv.jefe.y, '💥');
  invParticulasExp(_inv.jefe.x+30, _inv.jefe.y, '💥');
  _inv.jefe = null;
  invNivelCompletado();
}

function invDibujarJefe() {
  if(!_inv.jefe) return;
  var j = _inv.jefe;
  var ctx = document.getElementById('inv-canvas').getContext('2d');
  var pct = j.vida/j.vidaMax;

  // Parpadeo en fase 3
  if(j.fase === 3 && Math.floor(Date.now()/150)%2===0) ctx.globalAlpha=0.6;

  // Sombra/glow
  ctx.shadowColor = j.color;
  ctx.shadowBlur = 20;
  ctx.font = j.fase===3?'52px sans-serif':'48px sans-serif';
  ctx.textAlign='center';
  ctx.fillText(j.emoji, j.x, j.y+18);
  ctx.shadowBlur=0;
  ctx.globalAlpha=1;

  // Nombre
  ctx.fillStyle=j.color;
  ctx.font='bold 11px sans-serif';
  ctx.fillText(j.nombre, j.x, j.y-38);

  // Barra de vida
  var bw=100, bh=8;
  ctx.fillStyle='#333'; ctx.fillRect(j.x-bw/2, j.y-28, bw, bh);
  ctx.fillStyle = pct>0.6?'#22c55e':pct>0.3?'#f59e0b':'#e31e24';
  ctx.fillRect(j.x-bw/2, j.y-28, bw*pct, bh);
  ctx.strokeStyle='#555'; ctx.lineWidth=1;
  ctx.strokeRect(j.x-bw/2, j.y-28, bw, bh);

  // Fase indicator
  ctx.fillStyle='#fff'; ctx.font='9px sans-serif';
  ctx.fillText('FASE '+j.fase, j.x, j.y-32);
}

function invCrearEnemigos() {
  _inv.enemigos = [];
  var nivel = _inv.nivel;
  var oleada = _inv.oleadaActual || 1;
  var mundo = Math.min(4, Math.floor((nivel-1)/20));
  var emojis = _inv.mundos[mundo].emojis;
  var W = _inv.W;

  function emoji() { return emojis[Math.floor(Math.random()*emojis.length)]; }
  function fila(cant, y, tipo, vida, vx, vy) {
    var espX = (W-30)/cant;
    for(var i=0;i<cant;i++)
      _inv.enemigos.push(invCrearEnemigo(15+i*espX+espX/2, y, tipo||0, emoji(), vida||1, vx||0, vy||0));
  }

  // ═══════════════════════════
  // NIVELES JEFE (múltiplos de 10)
  // ═══════════════════════════
  if(invEsNivelJefe(nivel)) {
    invCrearJefe(nivel);
    // Escoltas iniciales
    fila(3, 130, 0, 1);
    return;
  }

  // ═══════════════════════════
  // NIVEL 1 — Tutorial
  // ═══════════════════════════
  if(nivel === 1) {
    _inv.dirEnemigos = 1;
    _inv.velEnemigos = 0.5;
    if(oleada === 1) {
      // Oleada 1: 2 filas de 5 — lentos, solo izq/der
      fila(5, 45, 0, 1);
      fila(5, 78, 0, 1);
    } else if(oleada === 2) {
      // Oleada 2: 2 filas de 6 — un poco más rápido
      _inv.velEnemigos = 0.65;
      fila(6, 42, 0, 1);
      fila(6, 74, 0, 1);
    } else if(oleada === 3) {
      // Oleada 3: 3 filas de 5 — velocidad normal, algunos disparan
      _inv.velEnemigos = 0.8;
      fila(5, 38, 0, 1);
      fila(5, 68, 0, 1);
      fila(5, 98, 0, 1);
    }
  }
  // ═══════════════════════════
  // NIVEL 2
  // ═══════════════════════════
  else if(nivel === 2) {
    _inv.dirEnemigos = 1;
    _inv.velEnemigos = 0.6 + oleada*0.1;
    if(oleada === 1) {
      // V simple
      var cx=W/2;
      for(var i=0;i<5;i++){
        _inv.enemigos.push(invCrearEnemigo(cx-i*34, 42+i*26, 0, emoji(), 1));
        if(i>0) _inv.enemigos.push(invCrearEnemigo(cx+i*34, 42+i*26, 0, emoji(), 1));
      }
    } else if(oleada === 2) {
      fila(6, 40, 0, 1); fila(6, 70, 0, 1); fila(4, 100, 0, 1);
    } else if(oleada === 3) {
      // V + fila soporte
      var cx2=W/2;
      for(var i2=0;i2<4;i2++){
        _inv.enemigos.push(invCrearEnemigo(cx2-i2*36, 38+i2*26, 0, emoji(), 1));
        if(i2>0) _inv.enemigos.push(invCrearEnemigo(cx2+i2*36, 38+i2*26, 0, emoji(), 1));
      }
      fila(6, 115, 0, 1);
    }
  }
  // ═══════════════════════════
  // NIVELES 3+ — dinámico escalado
  // ═══════════════════════════
  else {
    var cols = Math.min(4+Math.floor(nivel/8), 8);
    var filas = Math.min(2+Math.floor(nivel/6), 6);
    _inv.dirEnemigos = oleada%2===0 ? -1 : 1;
    _inv.velEnemigos = 0.4 + nivel*0.04 + oleada*0.08;
    var espX2 = (W-30)/cols;
    for(var f=0;f<filas;f++) {
      for(var c=0;c<cols;c++) {
        var tipo = f===0&&nivel>5&&Math.random()<0.2 ? 1 : 0;
        var vida2 = f===0&&nivel>8 ? 2 : 1;
        _inv.enemigos.push(invCrearEnemigo(
          15+c*espX2+espX2/2, 38+f*30,
          tipo, emoji(), vida2,
          oleada>=2&&f%2===0?0.3:0, 0
        ));
      }
    }
  }
}

function invBindControles() {
  var canvas = document.getElementById('inv-canvas');
  var fuego = document.getElementById('inv-btn-fuego');
  if(!canvas) return;
  var lastTouchX = null;
  var lastTouchY = null;
  var esHorizontal = false;
  canvas.addEventListener('touchstart', function(e){
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
    esHorizontal = false;
  }, {passive:true});
  canvas.addEventListener('touchmove', function(e){
    if(lastTouchX === null) return;
    var dx = e.touches[0].clientX - lastTouchX;
    var dy = e.touches[0].clientY - lastTouchY;
    if(!esHorizontal && Math.abs(dx) > Math.abs(dy)) esHorizontal = true;
    if(esHorizontal) {
      e.preventDefault();
      _inv.nave.x += dx * 1.8;
      _inv.nave.x = Math.max(20, Math.min(_inv.W-20, _inv.nave.x));
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  }, {passive:false});
  canvas.addEventListener('touchend', function(e){
    lastTouchX = null; lastTouchY = null; esHorizontal = false;
  }, {passive:true});
  if(fuego) {
    var _ultimoTapFuego = 0;
    fuego.textContent = '🏋️ PODER';
    fuego.style.background = '#333';
    fuego.addEventListener('touchstart', function(e){
      e.preventDefault();
      var ahora = Date.now();
      if(_inv.barraDesbloqueada && (_inv.barraCarga||0) >= (_inv.barraMax||20)) {
        invBarraEspecial();
        fuego.style.background = '#f59e0b';
        setTimeout(function(){ fuego.style.background='#333'; }, 500);
      } else if(!_inv.barraDesbloqueada) {
        // Sin barra: disparo manual extra
        invDisparar();
      }
      _ultimoTapFuego = ahora;
    }, {passive:false});
    fuego.addEventListener('click', function(){
      if(!_inv.barraDesbloqueada) invDisparar();
      else if((_inv.barraCarga||0) >= (_inv.barraMax||20)) invBarraEspecial();
    });
  }
}

function invBarraEspecial() {
  if(!_inv.barraDesbloqueada || (_inv.barraCarga||0) < (_inv.barraMax||20)) return;
  _inv.barraCarga = 0;
  // Disparo masivo — 7 balas en abanico
  for(var i=0;i<7;i++) {
    var angulo = -Math.PI/2 + (i-3)*0.2;
    _inv.balas.push({
      x:_inv.nave.x, y:_inv.nave.y-20,
      dy: Math.sin(angulo)*12,
      dx: Math.cos(angulo)*4,
      w:8, h:18, esNave:true, especial:true
    });
  }
  // Flash visual
  invParticulasExp(_inv.nave.x, _inv.nave.y-30, '🏋️');
  invParticulasExp(_inv.nave.x-20, _inv.nave.y-20, '💥');
  invParticulasExp(_inv.nave.x+20, _inv.nave.y-20, '💥');
}

function invStop() {
  _inv.corriendo = false;
  if(_inv.loop) cancelAnimationFrame(_inv.loop);
}

function invMover(dir) { _inv.dirMover = dir; }
function invPararMover() { _inv.dirMover = 0; }

function invDisparar() {
  if(!_inv.corriendo) return;
  var ahora = Date.now();
  if(ahora - (_inv.ultimoBala||0) < (_inv.cadenciaMs||300)) return;
  _inv.ultimoBala = ahora;
  // Doble disparo si está comprado
  if(_inv.dobleDisparo) {
    _inv.balas.push({ x:_inv.nave.x-18, y:_inv.nave.y-20, dy:-9, w:5, h:14, esNave:true });
    _inv.balas.push({ x:_inv.nave.x+18, y:_inv.nave.y-20, dy:-9, w:5, h:14, esNave:true });
  } else {
    _inv.balas.push({ x:_inv.nave.x, y:_inv.nave.y-20, dy:-9, w:5, h:14, esNave:true });
  }
  // Cargar barra especial matando
  if(_inv.barraDesbloqueada) {
    _inv.barraCarga = Math.min((_inv.barraCarga||0) + 0.2, _inv.barraMax||20);
  }
}

function invLoop() {
  if(!_inv.corriendo) return;
  if(!document.getElementById('inv-canvas')) { _inv.corriendo=false; return; }
  invUpdate();
  invDraw();
  _inv.loop = requestAnimationFrame(invLoop);
}

function invUpdate() {
  var W=_inv.W, H=_inv.H;
  // Mover nave
  _inv.nave.x += _inv.dirMover * _inv.nave.speed;
  _inv.nave.x = Math.max(20, Math.min(W-20, _inv.nave.x));
  // Disparo automático
  invDisparar();

  // Mover balas del jugador
  _inv.balas = _inv.balas.filter(function(b){
    b.y += b.dy;
    return b.y > -20 && b.y < H+20;
  });

  // Mover enemigos
  var todosListos = true;
  _inv.enemigos.forEach(function(e){
    // Animación de entrada
    if(e.entrando) {
      todosListos = false;
      e.x += (e.destX - e.x) * 0.12;
      e.y += (e.destY - e.y) * 0.12;
      if(Math.abs(e.x-e.destX)<1.5 && Math.abs(e.y-e.destY)<1.5) {
        e.x=e.destX; e.y=e.destY; e.entrando=false;
      }
      return;
    }
    e.x += _inv.velEnemigos * _inv.dirEnemigos;
    if(e.vx) { e.x += e.vx; if(e.x<16||e.x>W-16) e.vx*=-1; }
  });
  // Solo rebotar si todos ya entraron
  if(todosListos) {
    var normales = _inv.enemigos.filter(function(e){ return !e.entrando; });
    if(normales.length > 0) {
      var minX = Math.min.apply(null, normales.map(function(e){return e.x-e.w/2;}));
      var maxX = Math.max.apply(null, normales.map(function(e){return e.x+e.w/2;}));
      if(minX < 8 || maxX > W-8) {
        _inv.dirEnemigos *= -1;
        _inv.velEnemigos = Math.min(_inv.velEnemigos*1.02, 4);
        // NO bajan al rebotar — solo bajan gradualmente con el tiempo
      }
      // Bajada gradual muy lenta
      if(!_inv._ultimaBajada) _inv._ultimaBajada = Date.now();
      if(Date.now() - _inv._ultimaBajada > 8000) {
        _inv._ultimaBajada = Date.now();
        _inv.enemigos.forEach(function(e){ if(!e.entrando) e.y += 6; });
      }
    }
  }

  // Disparos enemigos aleatorios
  var ahora = Date.now();
  var intervalo = Math.max(600, 2000 - _inv.nivel*30);
  if(ahora - _inv.ultimoBalaEnemigo > intervalo && _inv.enemigos.length > 0) {
    _inv.ultimoBalaEnemigo = ahora;
    var e = _inv.enemigos[Math.floor(Math.random()*_inv.enemigos.length)];
    _inv.balas.push({x:e.x, y:e.y+12, dy:4+_inv.nivel*0.1, w:6, h:10, esNave:false});
  }

  // Colisiones balas jugador vs enemigos
  _inv.balas.filter(function(b){return b.esNave;}).forEach(function(b){
    _inv.enemigos = _inv.enemigos.filter(function(e){
      var hit = Math.abs(b.x-e.x)<(b.w/2+e.w/2) && Math.abs(b.y-e.y)<(b.h/2+e.h/2);
      if(hit){
        e.vida--;
        b.y = -999;
        invParticulasExp(e.x, e.y, e.emoji);
        if(b.especial) e.vida -= 2; // barra especial hace doble daño
        if(e.vida <= 0){
          var puntosBase = e.elite ? 100 : (e.tipo===2?30:e.tipo===6?25:e.tipo===3?20:10);
          _inv.score += puntosBase * _inv.nivel;
          document.getElementById('inv-score').textContent = _inv.score;
          var repsBase = e.elite ? 10 : (e.tipo===2?3:e.tipo===6?2:1);
          var reps = parseInt(localStorage.getItem('inv_monedas')||0) + repsBase;
          localStorage.setItem('inv_monedas', reps);
          if(Math.random()<0.2) invSpawnPowerup(e.x, e.y);
          return false;
        }
      }
      return true;
    });
  });

  // Colisiones balas enemigo vs coberturas
  if(_inv.coberturasArr) {
    _inv.balas.filter(function(b){return !b.esNave;}).forEach(function(b){
      _inv.coberturasArr.forEach(function(cb){
        if(cb.vida<=0) return;
        if(Math.abs(b.x-cb.x)<28 && Math.abs(b.y-cb.y)<16){
          b.y=_inv.H+999;
          cb.vida--;
        }
      });
    });
  }
  // Colisiones balas enemigo vs nave
  _inv.balas.filter(function(b){return !b.esNave;}).forEach(function(b){
    var n=_inv.nave;
    if(Math.abs(b.x-n.x)<(b.w/2+n.w/2) && Math.abs(b.y-n.y)<(b.h/2+n.h/2)){
      b.y=H+999;
      invPerdidaVida();
    }
  });

  // Enemigos llegan a nave
  _inv.enemigos.forEach(function(e){
    // Límite de bajada — rebotan antes de llegar a la nave
    var limY = _inv.H * 0.70;
    if(e.y > limY) {
      e.y = limY;
      if(e.vy > 0) e.vy *= -1; // rebotar hacia arriba
      // Solo pierde vida si toca directamente la nave
      if(Math.abs(e.x - _inv.nave.x) < 30) {
        invPerdidaVida();
        e.y = 50; // el enemigo sube tras golpear
      } else {
        // Empujar todo el grupo hacia arriba
        _inv.enemigos.forEach(function(e2){ if(!e2.entrando) e2.y -= 20; });
      }
    }
  });

  // Eventos aleatorios
  var ahoraEv = Date.now();
  if(ahoraEv - (_inv.ultimoEvento||0) > (_inv.proximoEvento||25000) && _inv.enemigos.length > 0) {
    _inv.ultimoEvento = ahoraEv;
    _inv.proximoEvento = 20000 + Math.random()*15000;
    var evento = Math.floor(Math.random()*4);
    if(evento === 0) {
      // Lluvia de power-ups — 4 caen simultáneos
      for(var pi=0;pi<4;pi++) {
        setTimeout(function(){
          var tipos = ['proteina','creatina','aminoacidos','preentrenoo'];
          var emojisEv = {'proteina':'🥛','creatina':'⚡','aminoacidos':'🛡️','preentrenoo':'💊'};
          var t = tipos[Math.floor(Math.random()*tipos.length)];
          _inv.powerups.push({x:20+Math.random()*(_inv.W-40), y:-20, tipo:t, emoji:emojisEv[t], vel:2.5});
        }, pi*300);
      }
      invParticulasExp(_inv.W/2, 60, '🎁');
    } else if(evento === 1) {
      // Enemigo élite — vale 5x reps
      var mundo = Math.min(4,Math.floor((_inv.nivel-1)/20));
      var pool = _inv.mundos[mundo].enemigosPool;
      var def = pool[Math.floor(Math.random()*pool.length)];
      _inv.enemigos.push({
        x: Math.random()<0.5 ? -30 : _inv.W+30,
        y: 80, destX: _inv.W/2, destY: 80,
        w:36, h:36, tipo:1, vida:4, vidaMax:4,
        emoji: '⭐', nombre:'Élite',
        elite:true, angulo:0, invisible:false, invisTimer:0,
        vx:0, vy:0, entrando:true, entradaT:0
      });
      invParticulasExp(_inv.W/2, 40, '⚠️');
    } else if(evento === 2) {
      // Oleada sorpresa — 3 enemigos débiles, entran lento desde arriba
      var mundo2 = Math.min(4,Math.floor((_inv.nivel-1)/20));
      for(var si=0;si<3;si++) {
        var ex2 = _inv.W*0.2 + si*(_inv.W*0.3);
        var enemSorpresa = invCrearEnemigo(ex2, -40, 0, null, 1, 0, 0);
        // Destino en zona superior — no bajan hasta la nave
        enemSorpresa.destY = 50 + si*25;
        enemSorpresa.y = -40;
        _inv.enemigos.push(enemSorpresa);
      }
      invParticulasExp(_inv.W/2, 40, '👾');
    } else {
      // Escudo gratis cae del cielo
      _inv.powerups.push({x:_inv.W/2, y:-20, tipo:'aminoacidos', emoji:'🛡️', vel:2});
      invParticulasExp(_inv.W/2, 40, '🛡️');
    }
  }

  // Powerups
  _inv.powerups = _inv.powerups.filter(function(p){
    p.y += 1.5;
    var n=_inv.nave;
    if(Math.abs(p.x-n.x)<30 && Math.abs(p.y-n.y)<30){
      invAplicarPowerup(p.tipo);
      return false;
    }
    return p.y < H+20;
  });

  // Partículas
  _inv.particulas = _inv.particulas.filter(function(p){
    p.x+=p.vx; p.y+=p.vy; p.vida--;
    return p.vida>0;
  });

  // ¿Nivel completado?
  if(_inv.enemigos.length === 0 && !_inv.transicion) {
    _inv.transicion = true;
    _inv.oleadaActual = (_inv.oleadaActual||1) + 1;
    if(_inv.oleadaActual > _inv.oleadasTotal) {
      _inv.corriendo = false;
      setTimeout(function(){ invNivelCompletado(); }, 400);
    } else {
      _inv.corriendo = false;
      var ov = document.getElementById('inv-overlay');
      if(ov) {
        ov.style.display='flex';
        document.getElementById('inv-overlay-title').textContent = '💪 Oleada '+(_inv.oleadaActual-1)+' eliminada';
        document.getElementById('inv-overlay-sub').textContent = 'Oleada '+_inv.oleadaActual+' de '+_inv.oleadasTotal+' — ¡Prepárate!';
        document.getElementById('inv-overlay-btn').style.display='none';
      }
      setTimeout(function(){
        if(ov) ov.style.display='none';
        invCrearEnemigos();
        _inv.transicion = false;
        _inv.corriendo = true;
        invLoop();
      }, 1800);
    }
  }
}

function invPerdidaVida() {
  _inv.vidas--;
  document.getElementById('inv-vidas').textContent = Math.max(0,_inv.vidas);
  invParticulasExp(_inv.nave.x, _inv.nave.y, '💥');
  if(_inv.escudoPasivo) {
    var ahora2 = Date.now();
    if(ahora2 - _inv.escudoPasivoTimer > (_inv.escudoCooldown||15000)) {
      _inv.escudoPasivoTimer = ahora2;
      invParticulasExp(_inv.nave.x, _inv.nave.y, '🛡️');
      return;
    }
  }
  if(_inv.vidas <= 0) invGameOver();
}

function invSpawnPowerup(x, y) {
  var tipos = ['proteina','creatina','aminoacidos','preentrenoo','barra'];
  var emojis = {'proteina':'🥛','creatina':'⚡','aminoacidos':'🛡️','preentrenoo':'💊','barra':'🏋️'};
  var tipo = tipos[Math.floor(Math.random()*tipos.length)];
  _inv.powerups.push({x:x,y:y,tipo:tipo,emoji:emojis[tipo]});
}

function invAplicarPowerup(tipo) {
  if(tipo==='proteina'){ _inv.vidas=Math.min(_inv.vidas+1,5); document.getElementById('inv-vidas').textContent=_inv.vidas; }
  else if(tipo==='creatina'){ _inv.dobleDisparo=true; setTimeout(function(){_inv.dobleDisparo=false;},5000); }
  else if(tipo==='aminoacidos'){ _inv.escudo=true; setTimeout(function(){_inv.escudo=false;},5000); }
  else if(tipo==='preentrenoo'){ _inv.nave.speed=9; setTimeout(function(){_inv.nave.speed=5;},5000); }
}

function invParticulasExp(x, y, emoji) {
  for(var i=0;i<8;i++){
    _inv.particulas.push({
      x:x,y:y,
      vx:(Math.random()-0.5)*4,
      vy:(Math.random()-0.5)*4,
      vida:20, emoji:emoji
    });
  }
}

function invNivelCompletado() {
  _inv.corriendo = false;
  _inv.oleadaActual = 1;
  _inv.transicion = false;
  var monedasGanadas = 10 + _inv.nivel * 2;
  var totalReps = parseInt(localStorage.getItem('inv_monedas')||0) + monedasGanadas;
  localStorage.setItem('inv_monedas', totalReps);
  var mejor = parseInt(localStorage.getItem('inv_mejor')||0);
  if(_inv.score > mejor) { localStorage.setItem('inv_mejor', _inv.score); }
  _inv.nivel++;
  localStorage.setItem('inv_nivel', _inv.nivel);
  localStorage.setItem('inv_score', _inv.score);
  invMostrarOverlay('🏆 ¡Nivel completado!', '+'+monedasGanadas+' 💪 reps | Total: '+totalReps+' | Nivel '+_inv.nivel, 'Siguiente nivel ▶', function(){
    _inv.balas=[]; _inv.powerups=[]; _inv.particulas=[];
    _inv.vidas=3; document.getElementById('inv-vidas').textContent=3;
    document.getElementById('inv-nivel').textContent=_inv.nivel;
    invCrearEnemigos();
    _inv.corriendo=true;
    invLoop();
  });
}

function invGameOver() {
  _inv.corriendo = false;
  var nivelMuerto = _inv.nivel;
  localStorage.setItem('inv_score', 0);
  invMostrarOverlay('💀 GAME OVER', 'Puntaje: '+_inv.score+' | Nivel '+nivelMuerto, '🔄 Reintentar nivel', function(){
    _inv.score=0; _inv.vidas=3;
    _inv.balas=[]; _inv.powerups=[]; _inv.particulas=[];
    document.getElementById('inv-score').textContent=0;
    document.getElementById('inv-nivel').textContent=nivelMuerto;
    document.getElementById('inv-vidas').textContent=3;
    _inv.oleadaActual=1;
    var digitoNivel = nivelMuerto % 10;
    _inv.oleadasTotal = digitoNivel===0?1:digitoNivel<=3?3:digitoNivel<=6?4:5;
    _inv.transicion=false;
    invCrearEnemigos();
    _inv.corriendo=true;
    invLoop();
  });
}

function invMostrarOverlay(titulo, sub, btnTxt, cb) {
  var ov = document.getElementById('inv-overlay');
  if(!ov) return;
  ov.style.display='flex';
  document.getElementById('inv-overlay-title').textContent=titulo;
  document.getElementById('inv-overlay-sub').textContent=sub;
  var btn=document.getElementById('inv-overlay-btn');
  btn.style.display='block';
  btn.textContent=btnTxt;
  btn.onclick=function(){ ov.style.display='none'; cb(); };
}

function invDraw() {
  var canvas=document.getElementById('inv-canvas');
  if(!canvas) return;
  var ctx=canvas.getContext('2d');
  var W=_inv.W,H=_inv.H;
  // Fondo estrellado
  ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
  // Estrellas (estáticas con seed)
  ctx.fillStyle='rgba(255,255,255,0.5)';
  for(var s=0;s<40;s++){
    var sx=(s*137.5)%W, sy=(s*97.3)%H;
    ctx.fillRect(sx,sy,1,1);
  }
  // Mundo label
  var mundo=Math.min(4,Math.floor((_inv.nivel-1)/20));
  ctx.fillStyle=_inv.mundos[mundo].color+'44';
  ctx.fillRect(0,0,W,24);
  ctx.fillStyle=_inv.mundos[mundo].color;
  ctx.font='10px sans-serif'; ctx.textAlign='left';
  ctx.fillText('Mundo '+(mundo+1)+': '+_inv.mundos[mundo].nombre, 6, 16);

  // Enemigos
  ctx.font='22px sans-serif'; ctx.textAlign='center';
  _inv.enemigos.forEach(function(e){
    ctx.fillText(e.emoji, e.x, e.y+8);
    if(e.vida>1){
      ctx.fillStyle='#e31e24';
      ctx.fillRect(e.x-10, e.y-14, 20, 3);
      ctx.fillStyle='#22c55e';
      ctx.fillRect(e.x-10, e.y-14, 20*(e.vida/2), 3);
    }
  });

  // Balas
  var skins = JSON.parse(localStorage.getItem('inv_skins')||'{}');
  var skinDisp = skins.disparo || 'disp_rojo';
  var coloresDisp = {
    'disp_rojo':'#e31e24','disp_verde':'#22c55e','disp_azul':'#3b82f6',
    'disp_rayo':'#f59e0b','disp_fuego':'#f97316','disp_dorado':'#fbbf24'
  };
  var colorBala = coloresDisp[skinDisp] || '#e31e24';
  _inv.balas.forEach(function(b){
    if(b.esNave) {
      if(b.especial) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = colorBala;
        ctx.shadowColor = colorBala;
        ctx.shadowBlur = 4;
      }
    } else {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowBlur = 0;
    }
    ctx.fillRect(b.x-b.w/2, b.y-b.h/2, b.w, b.h);
    ctx.shadowBlur = 0;
  });

  // Powerups
  ctx.font='18px sans-serif';
  _inv.powerups.forEach(function(p){
    ctx.fillText(p.emoji, p.x, p.y);
  });

  // Partículas
  _inv.particulas.forEach(function(p){
    ctx.globalAlpha = p.vida/20;
    ctx.font='12px sans-serif';
    ctx.fillText(p.emoji, p.x, p.y);
  });
  ctx.globalAlpha=1;

  // Coberturas
  if(_inv.coberturasArr) {
    _inv.coberturasArr.forEach(function(cb){
      if(cb.vida <= 0) return;
      var alpha = cb.vida / cb.maxVida;
      ctx.fillStyle = 'rgba(227,30,36,'+alpha+')';
      ctx.fillRect(cb.x-25, cb.y-12, 50, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 9px sans-serif'; ctx.textAlign='center';
      ctx.fillText('GYM DT', cb.x, cb.y+4);
    });
  }
  // Barra especial HUD
  if(_inv.barraDesbloqueada) {
    var carga = _inv.barraCarga||0, max = _inv.barraMax||20;
    ctx.fillStyle='#222'; ctx.fillRect(W*0.1, H-18, W*0.8, 8);
    ctx.fillStyle = carga>=max ? '#f59e0b' : '#e31e24';
    ctx.fillRect(W*0.1, H-18, W*0.8*(carga/max), 8);
    if(carga>=max){
      ctx.fillStyle='#f59e0b'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center';
      ctx.fillText('🏋️ BARRA LISTA — Toca 2 veces FUEGO', W/2, H-22);
    }
  }
  // Nave (entrenador)
  ctx.font='28px sans-serif'; ctx.textAlign='center';
  if(_invImg.entrenador) {
    var nw=48, nh=56;
    ctx.drawImage(_invImg.entrenador, _inv.nave.x-nw/2, _inv.nave.y-nh/2, nw, nh);
  } else {
    ctx.font='28px sans-serif'; ctx.textAlign='center';
    ctx.fillText('🏋️',_inv.nave.x,_inv.nave.y+10);
  }
  if(_inv.escudo){
    ctx.strokeStyle='#3b82f6'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(_inv.nave.x,_inv.nave.y,22,0,Math.PI*2); ctx.stroke();
  }
}


var _pen = { potTimer:null, potVal:0, potDir:1, animando:false, tiro:1, goles:0, mejor:0, lateral:50, altura:50, potencia:0, W:0, H:0 };

function penInit() {
  var canvas = document.getElementById('pen-canvas');
  if(!canvas) return;
  var W = canvas.offsetWidth;
  canvas.width = W;
  canvas.height = Math.round(W * 0.68);
  _pen.W = W; _pen.H = Math.round(W*0.68);
  _pen.tiro=1; _pen.goles=0; _pen.animando=false;
  _pen.mejor = parseInt(localStorage.getItem('pen_mejor')||0);
  _pen.lateral=50; _pen.altura=50; _pen.potVal=0;
  document.getElementById('pen-mejor').textContent = _pen.mejor;
  document.getElementById('pen-tiro').textContent = '1';
  document.getElementById('pen-goles').textContent = '0';
  penActLateral(); penActAltura();
  penStartPotencia();
  penDrawEstado(null, null, false, false);
}

function penActLateral() {
  var v = parseInt(document.getElementById('pen-lateral').value);
  _pen.lateral = v;
  var label = v < 25 ? '◀◀ Muy izquierda' : v < 42 ? '◀ Izquierda' : v > 75 ? 'Muy derecha ▶▶' : v > 58 ? 'Derecha ▶' : 'Centro';
  document.getElementById('pen-lat-val').textContent = label;
  if(!_pen.animando) penDrawEstado(null, null, false, false);
}

function penActAltura() {
  var v = parseInt(document.getElementById('pen-altura').value);
  _pen.altura = v;
  var label = v < 25 ? 'Muy raso' : v < 42 ? 'Raso' : v > 75 ? 'Muy alto' : v > 58 ? 'Alto' : 'Media altura';
  document.getElementById('pen-alt-val').textContent = label;
  if(!_pen.animando) penDrawEstado(null, null, false, false);
}

function penStartPotencia() {
  if(_pen.potTimer) clearInterval(_pen.potTimer);
  _pen.potVal = 0; _pen.potDir = 1;
  var velocidad = 18;
  _pen.potTimer = setInterval(function(){
    _pen.potVal += _pen.potDir * 2.2;
    if(_pen.potVal >= 100){ _pen.potVal=100; _pen.potDir=-1; }
    if(_pen.potVal <= 0){ _pen.potVal=0; _pen.potDir=1; velocidad = Math.max(10, velocidad-1); }
    var fill = document.getElementById('pen-pot-fill');
    var val = document.getElementById('pen-pot-val');
    if(!fill) { clearInterval(_pen.potTimer); return; }
    var p = _pen.potVal;
    var color = p < 30 ? '#555' : p < 55 ? '#22c55e' : p < 75 ? '#f59e0b' : '#e31e24';
    fill.style.width = p+'%';
    fill.style.background = 'linear-gradient(90deg,#333,'+color+')';
    if(val) val.textContent = Math.round(p)+'%';
  }, velocidad);
}

function penPararPotencia() {
  _pen.potencia = Math.round(_pen.potVal);
  clearInterval(_pen.potTimer);
}

function penLanzar() {
  if(_pen.animando) return;
  _pen.potencia = Math.round(_pen.potVal);
  clearInterval(_pen.potTimer);
  var lat = _pen.lateral;   // 0=izq extremo, 100=der extremo
  var alt = _pen.altura;    // 0=raso, 100=muy alto
  var pot = _pen.potencia;  // 0-100

  // --- Destino del balón ---
  var W = _pen.W, H = _pen.H;
  var gx = W*0.18, gy = H*0.05, gw = W*0.64, gh = H*0.30;
  // Posición en portería según sliders
  var destX = gx + (lat/100)*gw;
  var destY = gy + gh - (alt/100)*gh;

  // --- ¿Sale fuera? ---
  var fueraPorLado = lat < 8 || lat > 92;
  var fueraPorArriba = alt > 88 && pot > 70;
  var sinFuerza = pot < 18;
  var excesoPotencia = pot > 90 && alt > 60;

  // Si sale fuera ajustamos destino visual
  if(fueraPorLado) { destX = lat < 50 ? gx - W*0.12 : gx + gw + W*0.12; }
  if(fueraPorArriba || excesoPotencia) { destY = gy - H*0.15; }
  if(sinFuerza) { destX = W/2; destY = H*0.75; }

  // --- Portero IA ---
  // Lee parcialmente el lateral (70% acierto) y salta
  var aciertaLat = Math.random() < 0.62;
  var zonaLat = lat < 35 ? 'izq' : lat > 65 ? 'der' : 'cen';
  var porteroZona = aciertaLat ? zonaLat : ['izq','cen','der'][Math.floor(Math.random()*3)];
  // Portero NO llega a esquinas muy cerradas ni a tiros muy altos
  var porteroLlega = !(lat < 15 || lat > 85) && !(alt > 72) && pot < 82;

  // --- Resultado ---
  var gol = false;
  var motivo = '';
  if(sinFuerza) { motivo = '😅 ¡Sin potencia! El balón no llegó'; }
  else if(fueraPorLado) { motivo = lat < 50 ? '↙️ Afuera por la izquierda' : '↘️ Afuera por la derecha'; }
  else if(fueraPorArriba || excesoPotencia) { motivo = '🚀 ¡Demasiado alto! Por encima del arco'; }
  else if(porteroZona === zonaLat && porteroLlega) { motivo = '🧤 ¡Atajado! El portero lo leyó'; }
  else { gol = true; motivo = '⚽ ¡GOOOOL!'; }

  _pen.animando = true;
  document.getElementById('pen-btn').disabled = true;
  document.getElementById('pen-resultado').textContent = '';

  penAnimar(destX, destY, pot, gol, porteroZona, porteroLlega, sinFuerza, function(){
    _pen.animando = false;
    var res = document.getElementById('pen-resultado');
    if(res){ res.textContent = motivo; res.style.color = gol ? '#22c55e' : '#e31e24'; }
    if(gol){ _pen.goles++; document.getElementById('pen-goles').textContent = _pen.goles; }
    setTimeout(function(){
      if(_pen.tiro >= 5){ penFin(); return; }
      _pen.tiro++;
      document.getElementById('pen-tiro').textContent = _pen.tiro;
      if(res) res.textContent='';
      var btn = document.getElementById('pen-btn');
      if(btn){ btn.disabled=false; btn.textContent='⚽ LANZAR'; }
      penStartPotencia();
      penDrawEstado(null, null, false, false);
    }, 1800);
  });
}

function penAnimar(destX, destY, pot, gol, porteroZona, porteroLlega, sinFuerza, cb) {
  var canvas = document.getElementById('pen-canvas');
  if(!canvas){ cb(); return; }
  var W=_pen.W, H=_pen.H;
  var frames=0, total = sinFuerza ? 20 : Math.max(22, Math.round(40 - pot*0.15));
  var startX=W/2, startY=H*0.9;
  // Portero posición inicial al centro, salta a su zona
  var gx=W*0.18, gw=W*0.64;
  var portInicX = gx+gw/2;
  var portDestX = porteroZona==='izq' ? gx+gw*0.12 : porteroZona==='der' ? gx+gw*0.88 : gx+gw*0.5;

  var anim = setInterval(function(){
    frames++;
    var t = frames/total;
    var ease = t<0.5 ? 2*t*t : -1+(4-2*t)*t;
    // Balón — trayectoria con arco
    var bx = startX + (destX-startX)*ease;
    var arc = sinFuerza ? 0 : -H*0.08*Math.sin(Math.PI*t);
    var by = startY + (destY-startY)*ease + arc;
    var size = sinFuerza ? 20 : Math.max(8, 22 - t*14);
    // Portero salta en la segunda mitad
    var px = t < 0.4 ? portInicX : portInicX + (portDestX-portInicX)*((t-0.4)/0.6);
    var py_offset = porteroLlega && t > 0.5 ? -Math.sin((t-0.5)*Math.PI)*18 : 0;

    penDrawEstado({x:bx,y:by,size:size}, {x:px,yOff:py_offset}, gol && frames===total, false);
    if(frames>=total){ clearInterval(anim); cb(); }
  }, 22);
}

function penDrawEstado(balon, portero, mostrarGol, preview) {
  var canvas = document.getElementById('pen-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var W=_pen.W, H=_pen.H;

  // Fondo cancha con perspectiva
  var grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'#0d3d0d'); grad.addColorStop(1,'#1a5c1a');
  ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);

  // Líneas cancha
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
  ctx.strokeRect(W*0.05,H*0.02,W*0.9,H*0.9);
  ctx.beginPath(); ctx.moveTo(W*0.05,H*0.5); ctx.lineTo(W*0.95,H*0.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2,H*0.5,W*0.12,0,Math.PI*2); ctx.stroke();

  // Área grande
  ctx.strokeStyle='rgba(255,255,255,0.2)';
  ctx.strokeRect(W*0.15,H*0.02,W*0.7,H*0.42);

  // Portería 3D
  var gx=W*0.18, gy=H*0.05, gw=W*0.64, gh=H*0.30;
  // Sombra portería
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.fillRect(gx+4,gy+4,gw,gh);
  // Fondo red
  ctx.fillStyle='rgba(255,255,255,0.04)';
  ctx.fillRect(gx,gy,gw,gh);
  // Red
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=0.8;
  for(var i=1;i<9;i++){ ctx.beginPath();ctx.moveTo(gx+gw/9*i,gy);ctx.lineTo(gx+gw/9*i,gy+gh);ctx.stroke(); }
  for(var j=1;j<5;j++){ ctx.beginPath();ctx.moveTo(gx,gy+gh/5*j);ctx.lineTo(gx+gw,gy+gh/5*j);ctx.stroke(); }
  // Marco portería
  ctx.strokeStyle='#fff'; ctx.lineWidth=3;
  ctx.strokeRect(gx,gy,gw,gh);
  // Postes 3D
  ctx.fillStyle='#ddd';
  ctx.fillRect(gx-4,gy-4,8,gh+8);
  ctx.fillRect(gx+gw-4,gy-4,8,gh+8);
  ctx.fillRect(gx-4,gy-4,gw+8,8);

  // Indicador de puntería (preview)
  if(!balon) {
    var lat=_pen.lateral, alt=_pen.altura;
    var px2=gx+(lat/100)*gw, py2=gy+gh-(alt/100)*gh;
    var fueraPorLado = lat<8||lat>92;
    var fueraPorArriba = alt>88;
    if(!fueraPorLado && !fueraPorArriba){
      ctx.strokeStyle='rgba(255,255,0,0.4)'; ctx.lineWidth=1;
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(W/2,H*0.9); ctx.lineTo(px2,py2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(255,255,0,0.6)';
      ctx.beginPath(); ctx.arc(px2,py2,6,0,Math.PI*2); ctx.fill();
    }
  }

  // Punto penal
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(W/2,H*0.86,4,0,Math.PI*2); ctx.fill();

  // Portero
  var portX = gx+gw/2, portY = gy+gh*0.42, portYoff=0;
  if(portero){ portX=portero.x; portYoff=portero.yOff||0; }
  // Cuerpo portero
  ctx.fillStyle='#f59e0b';
  ctx.beginPath(); ctx.arc(portX,portY+portYoff,14,0,Math.PI*2); ctx.fill();
  ctx.font='18px sans-serif'; ctx.textAlign='center';
  ctx.fillText('🧤',portX,portY+portYoff+6);
  // Brazos extendidos
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(portX-14,portY+portYoff); ctx.lineTo(portX-28,portY+portYoff-8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(portX+14,portY+portYoff); ctx.lineTo(portX+28,portY+portYoff-8); ctx.stroke();

  // Balón
  if(balon){
    ctx.font=balon.size+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚽',balon.x,balon.y);
    // Sombra balón
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(balon.x, H*0.93, balon.size*0.4, balon.size*0.12, 0,0,Math.PI*2); ctx.fill();
  } else {
    ctx.font='22px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚽',W/2,H*0.9);
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(W/2,H*0.94,9,3,0,0,Math.PI*2); ctx.fill();
  }

  // GOL overlay
  if(mostrarGol){
    ctx.fillStyle='rgba(34,197,94,0.25)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#22c55e'; ctx.font='bold 28px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚽ GOOOOL!',W/2,H/2);
  }
}

function penFin() {
  clearInterval(_pen.potTimer);
  if(_pen.goles > _pen.mejor){
    _pen.mejor=_pen.goles;
    localStorage.setItem('pen_mejor',_pen.mejor);
    document.getElementById('pen-mejor').textContent=_pen.mejor;
  }
  var canvas=document.getElementById('pen-canvas');
  if(canvas){
    var ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,_pen.W,_pen.H);
    var emoji = _pen.goles>=5?'🏆':_pen.goles>=3?'⚽':'😅';
    var msg = _pen.goles>=5?'¡Golejada perfecta!':_pen.goles>=3?'¡Buen partido!':'Sigue entrenando...';
    ctx.fillStyle='#f59e0b'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
    ctx.fillText(emoji+' '+_pen.goles+'/5 goles',_pen.W/2,_pen.H/2-12);
    ctx.fillStyle='#aaa'; ctx.font='13px sans-serif';
    ctx.fillText(msg,_pen.W/2,_pen.H/2+14);
    if(_pen.goles===_pen.mejor && _pen.goles>0){
      ctx.fillStyle='#f59e0b'; ctx.font='12px sans-serif';
      ctx.fillText('🌟 ¡Nuevo récord!',_pen.W/2,_pen.H/2+34);
    }
  }
  var btn=document.getElementById('pen-btn');
  if(btn){
    btn.textContent='🔄 Jugar de nuevo'; btn.disabled=false;
    btn.onclick=function(){
      _pen.tiro=1; _pen.goles=0;
      document.getElementById('pen-tiro').textContent='1';
      document.getElementById('pen-goles').textContent='0';
      document.getElementById('pen-resultado').textContent='';
      btn.textContent='⚽ LANZAR';
      btn.onclick=penLanzar;
      penStartPotencia();
      penDrawEstado(null,null,false,false);
    };
  }
}

function renderSnake(c) {
  bloquearSwipe();
  c.innerHTML = `
    <button onclick="renderJuegos((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:10px">← Juegos</button>
    <div style="text-align:center;margin-bottom:10px">
      <div style="font-size:15px;font-weight:700;color:var(--texto)">Snake DT</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:12px;color:var(--texto-secundario)">Puntos: <span id="sk-puntos" style="color:var(--texto);font-weight:700">0</span></div>
      <div id="sk-nivel-label" style="font-size:12px;font-weight:700;color:#e31e24">PRINCIPIANTE</div>
      <div style="font-size:12px;color:var(--texto-secundario)">Mejor: <span id="sk-mejor" style="color:#f59e0b;font-weight:700">0</span></div>
    </div>
    <canvas id="sk-canvas" style="width:100%;border-radius:12px;display:block;background:#111;border:1px solid #333"></canvas>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px;max-width:220px;margin-left:auto;margin-right:auto">
      <div></div>
      <button ontouchstart="skDir(0,-1)" onclick="skDir(0,-1)" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:18px;cursor:pointer">▲</button>
      <div></div>
      <button ontouchstart="skDir(-1,0)" onclick="skDir(-1,0)" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:18px;cursor:pointer">◀</button>
      <button ontouchstart="skPause()" onclick="skPause()" style="background:#e31e24;color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:700;cursor:pointer" id="sk-btn">▶</button>
      <button ontouchstart="skDir(1,0)" onclick="skDir(1,0)" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:18px;cursor:pointer">▶</button>
      <div></div>
      <button ontouchstart="skDir(0,1)" onclick="skDir(0,1)" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:18px;cursor:pointer">▼</button>
      <div></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;justify-content:center">
      <button onclick="skSetNivel(1)" style="background:var(--gris);color:#22c55e;border:1px solid #22c55e;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer">🟢 Principiante</button>
      <button onclick="skSetNivel(2)" style="background:var(--gris);color:#f59e0b;border:1px solid #f59e0b;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer">🟡 Intermedio</button>
      <button onclick="skSetNivel(3)" style="background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer">🔴 Avanzado</button>
      <button onclick="skSetNivel(4)" style="background:var(--gris);color:#7c3aed;border:1px solid #7c3aed;border-radius:8px;padding:6px 10px;font-size:11px;cursor:pointer">💜 Elite</button>
    </div>`;
  skInit();
}

var _sk = {};
var _skColores = ['#e31e24','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316'];
var _skNiveles = { 1:{vel:200,obs:0,label:'PRINCIPIANTE'}, 2:{vel:130,obs:3,label:'INTERMEDIO'}, 3:{vel:80,obs:6,label:'AVANZADO'}, 4:{vel:50,obs:10,label:'ELITE'} };

function skInit() {
  var canvas = document.getElementById('sk-canvas');
  if(!canvas) return;
  var W = canvas.offsetWidth;
  canvas.width = W;
  canvas.height = W;
  var mejor = parseInt(localStorage.getItem('sk_mejor')||0);
  document.getElementById('sk-mejor').textContent = mejor;
  _sk = {
    W: W, cel: Math.floor(W/20), cols: 20, rows: 20,
    serpiente: [{x:10,y:10},{x:9,y:10},{x:8,y:10}],
    dir: {x:1,y:0}, nextDir: {x:1,y:0},
    comida: null, obstaculos: [],
    puntos: 0, mejor: mejor,
    nivel: 1, loop: null, corriendo: false, pausado: false
  };
  skGenerarComida();
  skDraw();
}

function skSetNivel(n) {
  if(_sk.loop) clearInterval(_sk.loop);
  _sk.nivel = n;
  _sk.serpiente = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  _sk.dir = {x:1,y:0}; _sk.nextDir = {x:1,y:0};
  _sk.puntos = 0; _sk.corriendo = false; _sk.pausado = false;
  _sk.obstaculos = [];
  document.getElementById('sk-puntos').textContent = 0;
  document.getElementById('sk-nivel-label').textContent = _skNiveles[n].label;
  document.getElementById('sk-btn').textContent = '▶';
  skGenerarObstaculos();
  skGenerarComida();
  skDraw();
}

function skGenerarObstaculos() {
  _sk.obstaculos = [];
  var cant = _skNiveles[_sk.nivel].obs;
  for(var i=0; i<cant; i++) {
    var o;
    do { o = {x:Math.floor(Math.random()*18)+1, y:Math.floor(Math.random()*18)+1}; }
    while(_sk.serpiente.some(function(s){return s.x===o.x&&s.y===o.y;}));
    _sk.obstaculos.push(o);
  }
}

function skGenerarComida() {
  var f;
  do { f = {x:Math.floor(Math.random()*19)+1, y:Math.floor(Math.random()*19)+1}; }
  while(_sk.serpiente.some(function(s){return s.x===f.x&&s.y===f.y;}) ||
        _sk.obstaculos.some(function(o){return o.x===f.x&&o.y===f.y;}));
  _sk.comida = f;
}

function skDir(x, y) {
  if(!_sk.corriendo) { skPause(); return; }
  if(x!==0 && _sk.dir.x!==0) return;
  if(y!==0 && _sk.dir.y!==0) return;
  _sk.nextDir = {x:x,y:y};
}

function skPause() {
  if(!_sk.corriendo) {
    _sk.corriendo = true; _sk.pausado = false;
    document.getElementById('sk-btn').textContent = '⏸';
    _sk.loop = setInterval(skStep, _skNiveles[_sk.nivel].vel);
  } else {
    _sk.corriendo = false;
    clearInterval(_sk.loop);
    document.getElementById('sk-btn').textContent = '▶';
  }
}

function skStep() {
  if(!document.getElementById('sk-canvas')) { clearInterval(_sk.loop); return; }
  _sk.dir = _sk.nextDir;
  var cab = {x:_sk.serpiente[0].x+_sk.dir.x, y:_sk.serpiente[0].y+_sk.dir.y};
  if(cab.x<0||cab.x>=_sk.cols||cab.y<0||cab.y>=_sk.rows) { skGameOver(); return; }
  if(_sk.serpiente.some(function(s){return s.x===cab.x&&s.y===cab.y;})) { skGameOver(); return; }
  if(_sk.obstaculos.some(function(o){return o.x===cab.x&&o.y===cab.y;})) { skGameOver(); return; }
  _sk.serpiente.unshift(cab);
  if(cab.x===_sk.comida.x && cab.y===_sk.comida.y) {
    _sk.puntos += _sk.nivel * 10;
    document.getElementById('sk-puntos').textContent = _sk.puntos;
    if(_sk.puntos > _sk.mejor) {
      _sk.mejor = _sk.puntos;
      localStorage.setItem('sk_mejor', _sk.mejor);
      document.getElementById('sk-mejor').textContent = _sk.mejor;
    }
    skGenerarComida();
    if(_sk.puntos % 50 === 0) skGenerarObstaculos();
  } else {
    _sk.serpiente.pop();
  }
  skDraw();
}

function skGameOver() {
  clearInterval(_sk.loop);
  _sk.corriendo = false;
  var canvas = document.getElementById('sk-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0,0,_sk.W,_sk.W);
  ctx.fillStyle = '#e31e24';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💀 GAME OVER', _sk.W/2, _sk.W/2-16);
  ctx.fillStyle = '#aaa';
  ctx.font = '14px sans-serif';
  ctx.fillText('Puntos: '+_sk.puntos, _sk.W/2, _sk.W/2+10);
  ctx.fillText('Toca ▶ para reiniciar', _sk.W/2, _sk.W/2+30);
  document.getElementById('sk-btn').textContent = '▶';
  _sk.serpiente = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  _sk.dir={x:1,y:0}; _sk.nextDir={x:1,y:0}; _sk.puntos=0;
  document.getElementById('sk-puntos').textContent=0;
  skGenerarObstaculos(); skGenerarComida();
}

function skDraw() {
  var canvas = document.getElementById('sk-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var cel = _sk.cel;
  ctx.fillStyle = '#111';
  ctx.fillRect(0,0,_sk.W,_sk.W);
  // Grid sutil
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.5;
  for(var i=0;i<_sk.cols;i++){
    ctx.beginPath();ctx.moveTo(i*cel,0);ctx.lineTo(i*cel,_sk.W);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i*cel);ctx.lineTo(_sk.W,i*cel);ctx.stroke();
  }
  // Obstáculos
  _sk.obstaculos.forEach(function(o){
    ctx.fillStyle = '#333';
    ctx.fillRect(o.x*cel+1,o.y*cel+1,cel-2,cel-2);
    ctx.fillStyle = '#555';
    ctx.font = (cel-4)+'px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('🧱',o.x*cel+cel/2,o.y*cel+cel-2);
  });
  // Comida
  if(_sk.comida){
    ctx.font = (cel-2)+'px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('🏋️',_sk.comida.x*cel+cel/2,_sk.comida.y*cel+cel-1);
  }
  // Serpiente
  _sk.serpiente.forEach(function(s,i){
    if(i===0){
      // Cabeza entrenador
      ctx.fillStyle = '#e31e24';
      ctx.beginPath();
      ctx.arc(s.x*cel+cel/2, s.y*cel+cel/2, cel/2-1, 0, Math.PI*2);
      ctx.fill();
      ctx.font = (cel-4)+'px sans-serif';
      ctx.textAlign='center';
      ctx.fillText('🏋️',s.x*cel+cel/2,s.y*cel+cel-2);
    } else {
      // Cuerpo clientes multicolor
      var color = _skColores[i % _skColores.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.x*cel+cel/2, s.y*cel+cel/2, cel/2-2, 0, Math.PI*2);
      ctx.fill();
      var emojis = ['🏃‍♂️','🏃‍♀️','🧑‍🦱','👩‍🦱','🧑‍🦰','👩‍🦰','🧑🏾','👩🏾'];
      ctx.font = (cel-6)+'px sans-serif';
      ctx.fillText(emojis[i%emojis.length],s.x*cel+cel/2,s.y*cel+cel-3);
    }
  });
}

function renderMemoria(c) {
  bloquearSwipe();
  c.innerHTML = `
    <button onclick="renderJuegos((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:10px">← Juegos</button>
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:15px;font-weight:700;color:var(--texto)">Memoria DT</div>
      <div style="font-size:11px;color:var(--texto-secundario);margin-top:3px">Encuentra todos los pares</div>
    </div>
    <div id="mem-niveles" style="display:flex;gap:8px;margin-bottom:14px">
      <button onclick="memStart(8)" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">
        😊 Fácil<div style="font-size:10px;font-weight:400;color:var(--texto-secundario)">16 cartas</div>
        <div style="font-size:10px;color:#f59e0b" id="mem-mejor-8">⏱ --</div>
      </button>
      <button onclick="memStart(10)" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">
        💪 Medio<div style="font-size:10px;font-weight:400;color:var(--texto-secundario)">20 cartas</div>
        <div style="font-size:10px;color:#f59e0b" id="mem-mejor-10">⏱ --</div>
      </button>
      <button onclick="memStart(12)" style="flex:1;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:12px;font-weight:700;cursor:pointer">
        🔥 Difícil<div style="font-size:10px;font-weight:400;color:var(--texto-secundario)">24 cartas</div>
        <div style="font-size:10px;color:#f59e0b" id="mem-mejor-12">⏱ --</div>
      </button>
    </div>
    <div id="mem-hud" style="display:none;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="font-size:13px;color:var(--texto-secundario)">Pares: <span id="mem-pares" style="color:var(--texto);font-weight:700">0</span></div>
      <div style="font-size:16px;font-weight:700;color:#e31e24" id="mem-timer">00:00</div>
      <div style="font-size:13px;color:var(--texto-secundario)">Intentos: <span id="mem-intentos" style="color:var(--texto);font-weight:700">0</span></div>
    </div>
    <div id="mem-board" style="display:grid;gap:8px"></div>`;
  memCargarMejores();
}

var _mem = { pares:0, total:0, intentos:0, timer:null, seg:0, volteadas:[], bloqueado:false, nivel:8 };

var _memIconos = [
  '<img src="/images/Fuerza.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Cardio.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Mancuerna.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Proteina.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Shaker.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Termo.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Cronometro.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Correr.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Kettelball.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Guanterojo.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Soga_de_batir.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Trofeo.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Cerebro.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Fuego.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Mira.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Discobasico.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Bolso.png" style="width:56px;height:56px;object-fit:contain">',
  '<img src="/images/Equismancuerna.png" style="width:56px;height:56px;object-fit:contain">'
];

function memCargarMejores() {
  [8,10,12].forEach(function(n) {
    var mejor = localStorage.getItem('mem_mejor_'+n);
    var el = document.getElementById('mem-mejor-'+n);
    if(el && mejor) el.textContent = '⏱ ' + mejor;
  });
}

function memStart(pares) {
  _mem = { pares:0, total:pares, intentos:0, seg:0, volteadas:[], bloqueado:false, nivel:pares };
  clearInterval(_mem.timer);
  var hud = document.getElementById('mem-hud');
  var niveles = document.getElementById('mem-niveles');
  if(hud) hud.style.display='flex';
  if(niveles) niveles.style.display='none';
  document.getElementById('mem-pares').textContent = '0';
  document.getElementById('mem-intentos').textContent = '0';
  document.getElementById('mem-timer').textContent = '00:00';
  var iconos = _memIconos.slice(0, pares);
  var cartas = [...iconos, ...iconos].sort(function(){ return Math.random()-0.5; });
  var cols = pares === 8 ? 4 : pares === 10 ? 4 : 4;
  var board = document.getElementById('mem-board');
  board.style.gridTemplateColumns = 'repeat('+cols+',1fr)';
  board.innerHTML = cartas.map(function(svg, i) {
    return '<div id="mc'+i+'" onclick="memVoltear('+i+')" data-idx="'+i+'" data-svg="'+encodeURIComponent(svg)+'" style="background:var(--gris);border:1px solid #333;border-radius:10px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:22px;transition:background .2s">🏋️</div>';
  }).join('');
  cartas.forEach(function(svg, i) {
    document.getElementById('mc'+i).dataset.svg = encodeURIComponent(svg);
  });
  board.innerHTML = cartas.map(function(svg, i) {
    return '<div id="mc'+i+'" onclick="memVoltear('+i+')" style="background:#1a1a1a;border:2px solid #333;border-radius:10px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden" data-svg="'+encodeURIComponent(svg)+'" data-volteada="0" data-encontrada="0"><span style="font-size:20px">💪</span></div>';
  }).join('');
  _mem.timer = setInterval(function(){
    _mem.seg++;
    var m = Math.floor(_mem.seg/60).toString().padStart(2,'0');
    var s = (_mem.seg%60).toString().padStart(2,'0');
    var t = document.getElementById('mem-timer');
    if(t) t.textContent = m+':'+s;
  }, 1000);
}

function memVoltear(i) {
  if(_mem.bloqueado) return;
  var el = document.getElementById('mc'+i);
  if(!el || el.dataset.encontrada==='1' || el.dataset.volteada==='1') return;
  el.dataset.volteada = '1';
  el.style.background = '#2a2a2a';
  el.style.borderColor = '#e31e24';
  el.innerHTML = decodeURIComponent(el.dataset.svg);
  _mem.volteadas.push(i);
  if(_mem.volteadas.length === 2) {
    _mem.bloqueado = true;
    _mem.intentos++;
    document.getElementById('mem-intentos').textContent = _mem.intentos;
    var a = document.getElementById('mc'+_mem.volteadas[0]);
    var b = document.getElementById('mc'+_mem.volteadas[1]);
    if(a.dataset.svg === b.dataset.svg) {
      a.dataset.encontrada = '1'; b.dataset.encontrada = '1';
      a.style.borderColor = '#22c55e'; b.style.borderColor = '#22c55e';
      a.style.background = '#052e16'; b.style.background = '#052e16';
      _mem.pares++;
      document.getElementById('mem-pares').textContent = _mem.pares;
      _mem.volteadas = [];
      _mem.bloqueado = false;
      if(_mem.pares === _mem.total) memGanar();
    } else {
      setTimeout(function(){
        a.dataset.volteada='0'; b.dataset.volteada='0';
        a.style.background='#1a1a1a'; b.style.background='#1a1a1a';
        a.style.borderColor='#333'; b.style.borderColor='#333';
        a.innerHTML='<span style="font-size:20px">💪</span>';
        b.innerHTML='<span style="font-size:20px">💪</span>';
        _mem.volteadas=[];
        _mem.bloqueado=false;
      }, 900);
    }
  }
}

function memGanar() {
  clearInterval(_mem.timer);
  var m = Math.floor(_mem.seg/60).toString().padStart(2,'0');
  var s = (_mem.seg%60).toString().padStart(2,'0');
  var tiempo = m+':'+s;
  var mejor = localStorage.getItem('mem_mejor_'+_mem.nivel);
  var esMejor = !mejor || _mem.seg < parseInt(mejor.replace(':',''));
  if(esMejor) localStorage.setItem('mem_mejor_'+_mem.nivel, tiempo);
  var board = document.getElementById('mem-board');
  if(board) board.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px 0"><div style="font-size:40px">🏆</div><div style="font-size:16px;font-weight:700;color:#22c55e;margin-top:8px">¡Completado!</div><div style="font-size:13px;color:var(--texto-secundario);margin-top:6px">Tiempo: '+tiempo+'</div><div style="font-size:12px;color:#f59e0b;margin-top:4px">'+(esMejor?'🌟 Nuevo récord!':'Mejor: '+mejor)+'</div><button onclick="renderMemoria(document.getElementById(\'herramienta-contenido\'))" style="margin-top:16px;background:#e31e24;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer">Jugar de nuevo</button></div>';
}


function renderTriqui(c) {
  bloquearSwipe();
  c.innerHTML = `
    <button onclick="renderJuegos((window._juegosContenedor || document.getElementById('juegos-contenido') || document.getElementById('herramienta-contenido')))" style="background:var(--gris);color:var(--texto-secundario);border:none;border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;margin-bottom:14px">← Juegos</button>
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:15px;font-weight:700;color:var(--texto)">Triqui DT</div>
      <div id="triqui-status" style="font-size:12px;color:var(--texto-secundario);margin-top:4px">Turno: 🏋️ Entrenador</div>
    </div>
    <div id="triqui-board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px;margin:0 auto 16px">
    </div>
    <div style="text-align:center">
      <button onclick="triquiReset()" style="background:#e31e24;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer">🔄 Nueva partida</button>
    </div>`;
  triquiInit();
}

var _triqui = { board: Array(9).fill(null), turno: 0, activo: true };
var _triquiJugadores = [
  { nombre: 'Entrenador', emoji: '<img src="/images/Equismancuerna.png" style="width:48px;height:48px;object-fit:contain">', color: '#e31e24' },
  { nombre: 'Cliente',    emoji: '<img src="/images/Kettelball.png" style="width:48px;height:48px;object-fit:contain">', color: '#3b82f6' }
];
var _triquiGanador = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function triquiInit() {
  _triqui = { board: Array(9).fill(null), turno: 0, activo: true };
  triquiRender();
}
function triquiReset() { triquiInit(); }

function triquiJugar(i) {
  if (!_triqui.activo || _triqui.board[i]) return;
  _triqui.board[i] = _triqui.turno;
  var ganador = triquiChequear();
  if (ganador !== null) {
    _triqui.activo = false;
    triquiRender();
    var st = document.getElementById('triqui-status');
    if (ganador === -1) {
      st.innerHTML = '🤝 ¡Empate!';
      st.style.color = '#f59e0b';
    } else {
      var j = _triquiJugadores[ganador];
      st.innerHTML = j.emoji + ' ¡' + j.nombre + ' gana!';
      st.style.color = j.color;
    }
    return;
  }
  _triqui.turno = _triqui.turno === 0 ? 1 : 0;
  triquiRender();
  var j = _triquiJugadores[_triqui.turno];
  document.getElementById('triqui-status').innerHTML = 'Turno: ' + j.emoji + ' ' + j.nombre;
}

function triquiChequear() {
  var b = _triqui.board;
  for (var w of _triquiGanador) {
    if (b[w[0]] !== null && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]) return b[w[0]];
  }
  if (b.every(function(x){ return x !== null; })) return -1;
  return null;
}

function triquiRender() {
  var board = document.getElementById('triqui-board');
  if (!board) return;
  var html = '';
  for (var i = 0; i < 9; i++) {
    var val = _triqui.board[i];
    var contenido = val !== null ? _triquiJugadores[val].emoji : '';
    var color = val !== null ? _triquiJugadores[val].color : 'transparent';
    html += '<div onclick="triquiJugar(' + i + ')" style="background:var(--card);border:2px solid ' + (val !== null ? color : '#333') + ';border-radius:12px;height:80px;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;transition:border .2s">' + contenido + '</div>';
  }
  board.innerHTML = html;
}

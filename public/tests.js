const ESCALAS = {
  fuerza: {
    pecho: {
      M: [{min:1.60,label:'Elite',icon:'🌟',score:100},{min:1.30,label:'Muy fuerte',icon:'🦾',score:80},{min:1.00,label:'Fuerte',icon:'💪🏻',score:60},{min:0.70,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:1.00,label:'Elite',icon:'🌟',score:100},{min:0.85,label:'Muy fuerte',icon:'🦾',score:80},{min:0.60,label:'Fuerte',icon:'💪🏻',score:60},{min:0.35,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    espalda: {
      M: [{min:1.70,label:'Elite',icon:'🌟',score:100},{min:1.40,label:'Muy fuerte',icon:'🦾',score:80},{min:1.10,label:'Fuerte',icon:'💪🏻',score:60},{min:0.80,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:1.40,label:'Elite',icon:'🌟',score:100},{min:1.10,label:'Muy fuerte',icon:'🦾',score:80},{min:0.80,label:'Fuerte',icon:'💪🏻',score:60},{min:0.50,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    biceps: {
      M: [{min:0.95,label:'Elite',icon:'🌟',score:100},{min:0.75,label:'Muy fuerte',icon:'🦾',score:80},{min:0.55,label:'Fuerte',icon:'💪🏻',score:60},{min:0.35,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:0.65,label:'Elite',icon:'🌟',score:100},{min:0.50,label:'Muy fuerte',icon:'🦾',score:80},{min:0.35,label:'Fuerte',icon:'💪🏻',score:60},{min:0.20,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    triceps: {
      M: [{min:2.00,label:'Elite',icon:'🌟',score:100},{min:1.70,label:'Muy fuerte',icon:'🦾',score:80},{min:1.30,label:'Fuerte',icon:'💪🏻',score:60},{min:1.00,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:1.60,label:'Elite',icon:'🌟',score:100},{min:1.30,label:'Muy fuerte',icon:'🦾',score:80},{min:1.00,label:'Fuerte',icon:'💪🏻',score:60},{min:0.70,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    femoral: {
      M: [{min:2.50,label:'Elite',icon:'🌟',score:100},{min:2.10,label:'Muy fuerte',icon:'🦾',score:80},{min:1.70,label:'Fuerte',icon:'💪🏻',score:60},{min:1.20,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:2.20,label:'Elite',icon:'🌟',score:100},{min:1.80,label:'Muy fuerte',icon:'🦾',score:80},{min:1.40,label:'Fuerte',icon:'💪🏻',score:60},{min:1.00,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    cuad: {
      M: [{min:2.20,label:'Elite',icon:'🌟',score:100},{min:1.80,label:'Muy fuerte',icon:'🦾',score:80},{min:1.40,label:'Fuerte',icon:'💪🏻',score:60},{min:1.00,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:1.90,label:'Elite',icon:'🌟',score:100},{min:1.50,label:'Muy fuerte',icon:'🦾',score:80},{min:1.10,label:'Fuerte',icon:'💪🏻',score:60},{min:0.70,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    gluteo: {
      M: [{min:3.00,label:'Elite',icon:'🌟',score:100},{min:2.40,label:'Muy fuerte',icon:'🦾',score:80},{min:1.80,label:'Fuerte',icon:'💪🏻',score:60},{min:1.00,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:3.20,label:'Elite',icon:'🌟',score:100},{min:2.60,label:'Muy fuerte',icon:'🦾',score:80},{min:1.90,label:'Fuerte',icon:'💪🏻',score:60},{min:1.20,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    }
  },
  resist: {
    pushups: {
      M: [{min:60,label:'Elite',icon:'🌟',score:100},{min:40,label:'Muy fuerte',icon:'🦾',score:80},{min:25,label:'Fuerte',icon:'💪🏻',score:60},{min:10,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:45,label:'Elite',icon:'🌟',score:100},{min:30,label:'Muy fuerte',icon:'🦾',score:80},{min:15,label:'Fuerte',icon:'💪🏻',score:60},{min:5,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    dominadas: {
      M: [{min:22,label:'Elite',icon:'🌟',score:100},{min:15,label:'Muy fuerte',icon:'🦾',score:80},{min:8,label:'Fuerte',icon:'💪🏻',score:60},{min:3,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:15,label:'Elite',icon:'🌟',score:100},{min:9,label:'Muy fuerte',icon:'🦾',score:80},{min:4,label:'Fuerte',icon:'💪🏻',score:60},{min:1,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    fondos: {
      M: [{min:40,label:'Elite',icon:'🌟',score:100},{min:25,label:'Muy fuerte',icon:'🦾',score:80},{min:15,label:'Fuerte',icon:'💪🏻',score:60},{min:8,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:30,label:'Elite',icon:'🌟',score:100},{min:20,label:'Muy fuerte',icon:'🦾',score:80},{min:10,label:'Fuerte',icon:'💪🏻',score:60},{min:3,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    sentadilla: {
      M: [{min:100,label:'Elite',icon:'🌟',score:100},{min:70,label:'Muy fuerte',icon:'🦾',score:80},{min:40,label:'Fuerte',icon:'💪🏻',score:60},{min:20,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:90,label:'Elite',icon:'🌟',score:100},{min:60,label:'Muy fuerte',icon:'🦾',score:80},{min:35,label:'Fuerte',icon:'💪🏻',score:60},{min:15,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    plancha: {
      M: [{min:240,label:'Elite',icon:'🌟',score:100},{min:120,label:'Muy fuerte',icon:'🦾',score:80},{min:60,label:'Fuerte',icon:'💪🏻',score:60},{min:30,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:180,label:'Elite',icon:'🌟',score:100},{min:90,label:'Muy fuerte',icon:'🦾',score:80},{min:50,label:'Fuerte',icon:'💪🏻',score:60},{min:20,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    burpees: {
      M: [{min:26,label:'Elite',icon:'🌟',score:100},{min:20,label:'Muy fuerte',icon:'🦾',score:80},{min:15,label:'Fuerte',icon:'💪🏻',score:60},{min:10,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:23,label:'Elite',icon:'🌟',score:100},{min:18,label:'Muy fuerte',icon:'🦾',score:80},{min:13,label:'Fuerte',icon:'💪🏻',score:60},{min:8,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    }
  },
  especif: {
    cooper: {
      M: [{min:3000,label:'Elite',icon:'🌟',score:100},{min:2700,label:'Muy bueno',icon:'🦾',score:80},{min:2400,label:'Bueno',icon:'💪🏻',score:60},{min:2100,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:2700,label:'Elite',icon:'🌟',score:100},{min:2400,label:'Muy bueno',icon:'🦾',score:80},{min:2100,label:'Bueno',icon:'💪🏻',score:60},{min:1800,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    leger: {
      M: [{min:13,label:'Elite',icon:'🌟',score:100},{min:11,label:'Muy bueno',icon:'🦾',score:80},{min:9,label:'Bueno',icon:'💪🏻',score:60},{min:7,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}],
      F: [{min:11,label:'Elite',icon:'🌟',score:100},{min:9,label:'Muy bueno',icon:'🦾',score:80},{min:7,label:'Bueno',icon:'💪🏻',score:60},{min:5,label:'Moderado',icon:'👍🏻',score:40},{min:0,label:'Débil',icon:'💔',score:20}]
    },
    sitreach: {
      M: [{min:27,label:'Elite',icon:'🌟',score:100},{min:17,label:'Muy flexible',icon:'🦾',score:80},{min:10,label:'Flexible',icon:'💪🏻',score:60},{min:3,label:'Normal',icon:'👍🏻',score:40},{min:-99,label:'Muy rígido',icon:'💔',score:20}],
      F: [{min:33,label:'Elite',icon:'🌟',score:100},{min:23,label:'Muy flexible',icon:'🦾',score:80},{min:15,label:'Flexible',icon:'💪🏻',score:60},{min:7,label:'Normal',icon:'👍🏻',score:40},{min:-99,label:'Muy rígido',icon:'💔',score:20}]
    },
    hombro: {
      M: [{min:10,label:'Elite',icon:'🌟',score:100},{min:5,label:'Muy flexible',icon:'🦾',score:80},{min:0,label:'Flexible',icon:'💪🏻',score:60},{min:-5,label:'Normal',icon:'👍🏻',score:40},{min:-99,label:'Rígido',icon:'💔',score:20}],
      F: [{min:12,label:'Elite',icon:'🌟',score:100},{min:7,label:'Muy flexible',icon:'🦾',score:80},{min:2,label:'Flexible',icon:'💪🏻',score:60},{min:-3,label:'Normal',icon:'👍🏻',score:40},{min:-99,label:'Rígido',icon:'💔',score:20}]
    },
    saltoL: {
      M: [{min:230,label:'Explosivo',icon:'🌟',score:100},{min:200,label:'Potente',icon:'🦾',score:80},{min:170,label:'Bueno',icon:'💪🏻',score:60},{min:140,label:'Normal',icon:'👍🏻',score:40},{min:0,label:'Bajo',icon:'💔',score:20}],
      F: [{min:185,label:'Explosivo',icon:'🌟',score:100},{min:160,label:'Potente',icon:'🦾',score:80},{min:135,label:'Bueno',icon:'💪🏻',score:60},{min:110,label:'Normal',icon:'👍🏻',score:40},{min:0,label:'Bajo',icon:'💔',score:20}]
    },
    saltoV: {
      M: [{min:55,label:'Explosivo',icon:'🌟',score:100},{min:45,label:'Potente',icon:'🦾',score:80},{min:35,label:'Bueno',icon:'💪🏻',score:60},{min:25,label:'Normal',icon:'👍🏻',score:40},{min:0,label:'Bajo',icon:'💔',score:20}],
      F: [{min:45,label:'Explosivo',icon:'🌟',score:100},{min:35,label:'Potente',icon:'🦾',score:80},{min:25,label:'Bueno',icon:'💪🏻',score:60},{min:17,label:'Normal',icon:'👍🏻',score:40},{min:0,label:'Bajo',icon:'💔',score:20}]
    },
    vel30: {
      M: [{max:4.0,label:'Explosivo',icon:'🌟',score:100},{max:4.4,label:'Muy rápido',icon:'🦾',score:80},{max:4.8,label:'Rápido',icon:'💪🏻',score:60},{max:5.2,label:'Normal',icon:'👍🏻',score:40},{max:99,label:'Lento',icon:'💔',score:20}],
      F: [{max:4.5,label:'Explosivo',icon:'🌟',score:100},{max:4.9,label:'Muy rápido',icon:'🦾',score:80},{max:5.3,label:'Rápido',icon:'💪🏻',score:60},{max:5.8,label:'Normal',icon:'👍🏻',score:40},{max:99,label:'Lento',icon:'💔',score:20}]
    }
  }
};

function getScore(categoria, key, valor, sexo, peso) {
  const escala = ESCALAS[categoria]?.[key];
  if (!escala) return { label: '-', icon: '-', score: 0 };
  const tabla = escala[sexo] || escala.M;
const ratio = (categoria === 'fuerza') ? (key === 'triceps' ? (valor + peso) / peso : valor / peso) : valor;
  for (const nivel of tabla) {
    if (nivel.max !== undefined) {
      if (ratio <= nivel.max) return nivel;
    } else {
      if (ratio >= nivel.min) return nivel;
    }
  }
  return tabla[tabla.length - 1];
}

function badgeStyle(icon) {
  const cfg = {
    '🌟': 'background:#1a1a00;color:#ffd700',
    '🦾': 'background:#0a1a2a;color:#4fc3f7',
    '💪🏻': 'background:#1a3a1a;color:#4caf50',
    '👍🏻': 'background:#2a2a0a;color:#ffeb3b',
    '💔': 'background:#3a0a0a;color:#e57373'
  };
  return cfg[icon] || 'background:#2a2a2a;color:#888';
}

function epley(kg, reps) {
  if (!kg || !reps || reps <= 0) return 0;
  if (parseFloat(reps) === 1) return parseFloat(kg);
  return Math.round(parseFloat(kg) * (1 + parseFloat(reps) / 30));
}

function cambioTexto(anterior, actual) {
  if (!anterior || !actual) return '';
  const pct = Math.round(((actual - anterior) / anterior) * 100);
  if (pct === 0) return ' (=)';
  const flecha = pct > 0 ? '↑' : '↓';
  return ' (' + (pct > 0 ? '+' : '') + pct + '% ' + flecha + ')';
}

async function renderTests(id) {
  const u = await fetch('/api/usuarios').then(r => r.json());
  const usuario = u.find(x => x.id === id);
  const hist = await fetch('/api/historial/' + id).then(r => r.json());
  const pesos = hist.peso || [];
  const pesoCorporal = pesos.length ? pesos[pesos.length - 1].valor : 70;
  const perfil = usuario.perfil || {};
  const sexo = perfil.sexo || 'M';

  let histTests = { registros: [] };
  try { histTests = await fetch('/api/tests/' + id).then(r => r.json()); } catch {}
  window._testsHistorial = histTests.registros || [];
  window._testsPeso = pesoCorporal;
  window._testsSexo = sexo;
  window._testsId = id;

  const ultimoFuerza = window._testsHistorial.filter(r => r.tipo === 'fuerza').slice(-1)[0] || {};
  const ultimoResist = window._testsHistorial.filter(r => r.tipo === 'resist').slice(-1)[0] || {};
  const ultimoEspecif = window._testsHistorial.filter(r => r.tipo === 'especif').slice(-1)[0] || {};
  window._ultimoFuerza = ultimoFuerza;
  window._ultimoResist = ultimoResist;
  window._ultimoEspecif = ultimoEspecif;

  document.getElementById('msec-tests').innerHTML = `
    <div style="font-size:10px;color:#888;margin-bottom:10px">Peso corporal: <span style="color:#e31e24;font-weight:700">${pesoCorporal} kg</span> · <span style="color:#e31e24;font-weight:700">${sexo === 'M' ? 'Masculino' : 'Femenino'}</span></div>
    <div style="display:flex;gap:4px;margin-bottom:14px;overflow-x:auto">
      <button id="ttab-fuerza" class="btn br" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showTTab('fuerza')">🏋️ Fuerza</button>
      <button id="ttab-resist" class="btn bg" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showTTab('resist')">💪🏻 Resist.</button>
      <button id="ttab-especif" class="btn bg" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showTTab('especif')">⚡ Específico</button>
      <button id="ttab-historial" class="btn bg" style="flex:1;font-size:11px;padding:8px 4px;white-space:nowrap" onclick="showTTab('historial')">📋 Historial</button>
    </div>
    <div id="tsec-fuerza"></div>
    <div id="tsec-resist" style="display:none"></div>
    <div id="tsec-especif" style="display:none"></div>
    <div id="tsec-historial" style="display:none"></div>
  `;
  showTTab('fuerza');
}

function showTTab(t) {
  ['fuerza', 'resist', 'especif', 'historial'].forEach(x => {
    const sec = document.getElementById('tsec-' + x);
    const btn = document.getElementById('ttab-' + x);
    if (sec) sec.style.display = x === t ? 'block' : 'none';
    if (btn) { btn.className = 'btn ' + (x === t ? 'br' : 'bg'); btn.style.cssText = 'flex:1;font-size:11px;padding:8px 4px;white-space:nowrap'; }
  });
  if (t === 'fuerza') renderFuerza();
  if (t === 'resist') renderResist();
  if (t === 'especif') renderEspecif();
  if (t === 'historial') renderHistorialTests();
}

function filaFuerza(nombre, musculo, key, nota) {
  const ult = window._ultimoFuerza[key];
  const valKg = ult?.kg || '';
  const valReps = ult?.reps || '';
  const rm = ult?.rm || 0;
  const s = rm ? getScore('fuerza', key, rm, window._testsSexo, window._testsPeso) : null;
  return `
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:10px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1">
          <div style="font-size:12px;color:#fff;font-weight:700">${nombre}</div>
          <div style="font-size:10px;color:#555">${musculo}${nota ? ' · ' + nota : ''}</div>
          <div id="${key}-rm-label" style="font-size:11px;color:#888;margin-top:2px">${rm ? '1RM est: <span style="color:#e31e24;font-weight:700">' + rm + ' kg</span>' : ''}</div>
        </div>
        <div style="display:flex;gap:4px">
          <div><div style="font-size:9px;color:#555;text-align:center">${key === 'triceps' ? 'lastre' : 'kg'}</div>
          <input type="number" id="f-${key}-kg" value="${valKg}" placeholder="-" step="0.5" style="width:52px;background:#0a0a0a;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:13px;text-align:center;outline:none" oninput="actualizarFuerza('${key}')"></div>
          <div><div style="font-size:9px;color:#555;text-align:center">reps</div>
          <input type="number" id="f-${key}-reps" value="${valReps}" placeholder="-" style="width:44px;background:#0a0a0a;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:13px;text-align:center;outline:none" oninput="actualizarFuerza('${key}')"></div>
        </div>
        <span id="f-${key}-score" style="display:inline-block;padding:3px 7px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;${s ? badgeStyle(s.icon) : 'background:#2a2a2a;color:#888'}">${s ? s.icon + ' ' + s.label : '-'}</span>
      </div>
    </div>`;
}

function actualizarFuerza(key) {
  const kg = parseFloat(document.getElementById('f-' + key + '-kg')?.value);
  const reps = parseFloat(document.getElementById('f-' + key + '-reps')?.value);
  const scoreEl = document.getElementById('f-' + key + '-score');
  const rmLabel = document.getElementById(key + '-rm-label');
  if (!scoreEl) return;
  if (kg && reps) {
    const rm = epley(kg, reps);
    if (rmLabel) rmLabel.innerHTML = '1RM est: <span style="color:#e31e24;font-weight:700">' + rm + ' kg</span>';
    const s = getScore('fuerza', key, rm, window._testsSexo, window._testsPeso);
    scoreEl.textContent = s.icon + ' ' + s.label;
    scoreEl.style.cssText = 'display:inline-block;padding:3px 7px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;' + badgeStyle(s.icon);
    actualizarRadar('radarFuerza', '_radarFuerzaChart', getScoresFuerza());
  }
}

function getScoresFuerza() {
  const keys = ['pecho', 'espalda', 'biceps', 'triceps', 'femoral', 'cuad', 'gluteo'];
  return keys.map(k => {
    const kg = parseFloat(document.getElementById('f-' + k + '-kg')?.value);
    const reps = parseFloat(document.getElementById('f-' + k + '-reps')?.value);
    if (!kg || !reps) return 0;
    return getScore('fuerza', k, epley(kg, reps), window._testsSexo, window._testsPeso).score;
  });
}

function renderFuerza() {
  const ejercicios = [
    { nombre: 'Press pecho', musculo: 'Pectoral', key: 'pecho' },
    { nombre: 'Remo supino', musculo: 'Dorsal', key: 'espalda' },
    { nombre: 'Curl con barra', musculo: 'Bíceps', key: 'biceps', nota: 'ratio RM/PC' },
    { nombre: 'Fondos lastrados', musculo: 'Tríceps', key: 'triceps', nota: 'lastre+PC/PC' },
    { nombre: 'Peso muerto rumano', musculo: 'Femoral', key: 'femoral' },
    { nombre: 'Sentadilla', musculo: 'Cuádriceps', key: 'cuad' },
    { nombre: 'Empuje de cadera', musculo: 'Glúteo', key: 'gluteo' }
  ];
  document.getElementById('tsec-fuerza').innerHTML = `
    <div style="font-size:10px;color:#e31e24;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">1RM estimado · Fórmula Epley</div>
    ${ejercicios.map(e => filaFuerza(e.nombre, e.musculo, e.key, e.nota || '')).join('')}
    <div style="position:relative;width:100%;height:220px;margin-top:10px">
      <canvas id="radarFuerza" role="img" aria-label="Radar fuerza">Radar fuerza</canvas>
    </div>
    <button class="btn br" style="width:100%;margin-top:10px" onclick="guardarTest('fuerza')">💾 Guardar test de fuerza</button>
    <button style="width:100%;background:#0a1a0a;color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:8px" onclick="enviarTest('fuerza')">📤 Enviar por WhatsApp</button>
  `;
  setTimeout(() => initRadar('radarFuerza', '_radarFuerzaChart', ['Pecho','Espalda','Bíceps','Tríceps','Femoral','Cuád','Glúteo'], getScoresFuerza(), '#e31e24'), 100);
}

function filaResist(nombre, key, unidad) {
  const ult = window._ultimoResist[key];
  const val = ult?.valor || '';
  const s = val ? getScore('resist', key, val, window._testsSexo, window._testsPeso) : null;
  return `
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:10px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;font-size:12px;color:#fff;font-weight:700">${nombre}</div>
        <div><div style="font-size:9px;color:#555;text-align:center">${unidad}</div>
        <input type="number" id="r-${key}" value="${val}" placeholder="-" style="width:60px;background:#0a0a0a;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:13px;text-align:center;outline:none" oninput="actualizarResist('${key}')"></div>
        <span id="r-${key}-score" style="display:inline-block;padding:3px 7px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;${s ? badgeStyle(s.icon) : 'background:#2a2a2a;color:#888'}">${s ? s.icon + ' ' + s.label : '-'}</span>
      </div>
    </div>`;
}

function actualizarResist(key) {
  const val = document.getElementById('r-' + key)?.value;
  const scoreEl = document.getElementById('r-' + key + '-score');
  if (!scoreEl || !val) return;
  const s = getScore('resist', key, val, window._testsSexo, window._testsPeso);
  scoreEl.textContent = s.icon + ' ' + s.label;
  scoreEl.style.cssText = 'display:inline-block;padding:3px 7px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;' + badgeStyle(s.icon);
  actualizarRadar('radarResist', '_radarResistChart', getScoresResist());
}

function getScoresResist() {
  const keys = ['pushups', 'dominadas', 'fondos', 'sentadilla', 'plancha', 'burpees'];
  return keys.map(k => {
    const val = document.getElementById('r-' + k)?.value;
    if (!val) return 0;
    return getScore('resist', k, val, window._testsSexo, window._testsPeso).score;
  });
}

function renderResist() {
  const ejercicios = [
    { nombre: 'Push ups', key: 'pushups', unidad: 'reps' },
    { nombre: 'Dominadas supinas', key: 'dominadas', unidad: 'reps' },
    { nombre: 'Fondos sin lastre', key: 'fondos', unidad: 'reps' },
    { nombre: 'Sentadilla libre', key: 'sentadilla', unidad: 'reps' },
    { nombre: 'Plancha', key: 'plancha', unidad: 'seg' },
    { nombre: 'Burpees / min', key: 'burpees', unidad: 'reps' }
  ];
  document.getElementById('tsec-resist').innerHTML = `
    <div style="font-size:10px;color:#4fc3f7;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">Resistencia muscular</div>
    ${ejercicios.map(e => filaResist(e.nombre, e.key, e.unidad)).join('')}
    <div style="position:relative;width:100%;height:200px;margin-top:10px">
      <canvas id="radarResist" role="img" aria-label="Radar resistencia">Radar resistencia</canvas>
    </div>
    <button class="btn br" style="width:100%;margin-top:10px" onclick="guardarTest('resist')">💾 Guardar test de resistencia</button>
    <button style="width:100%;background:#0a1a0a;color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:8px" onclick="enviarTest('resist')">📤 Enviar por WhatsApp</button>
  `;
  setTimeout(() => initRadar('radarResist', '_radarResistChart', ['Push ups','Dominadas','Fondos','Sentadilla','Plancha','Burpees'], getScoresResist(), '#4fc3f7'), 100);
}

function filaEspecif(nombre, subtitulo, key, unidad) {
  const ult = window._ultimoEspecif[key];
  const val = ult?.valor || '';
  const s = val ? getScore('especif', key, val, window._testsSexo, window._testsPeso) : null;
  return `
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:10px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1">
          <div style="font-size:12px;color:#fff;font-weight:700">${nombre}</div>
          ${subtitulo ? '<div style="font-size:10px;color:#555">' + subtitulo + '</div>' : ''}
        </div>
        <div><div style="font-size:9px;color:#555;text-align:center">${unidad}</div>
        <input type="number" id="e-${key}" value="${val}" placeholder="-" step="0.1" style="width:65px;background:#0a0a0a;border:1px solid #333;border-radius:6px;padding:7px;color:#fff;font-size:13px;text-align:center;outline:none" oninput="actualizarEspecif('${key}')"></div>
        <span id="e-${key}-score" style="display:inline-block;padding:3px 7px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;${s ? badgeStyle(s.icon) : 'background:#2a2a2a;color:#888'}">${s ? s.icon + ' ' + s.label : '-'}</span>
      </div>
    </div>`;
}

function actualizarEspecif(key) {
  const val = document.getElementById('e-' + key)?.value;
  const scoreEl = document.getElementById('e-' + key + '-score');
  if (!scoreEl || !val) return;
  const s = getScore('especif', key, val, window._testsSexo, window._testsPeso);
  scoreEl.textContent = s.icon + ' ' + s.label;
  scoreEl.style.cssText = 'display:inline-block;padding:3px 7px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;' + badgeStyle(s.icon);
  actualizarRadar('radarEspecif', '_radarEspecifChart', getScoresEspecif());
}

function getScoresEspecif() {
  const keys = ['cooper', 'leger', 'sitreach', 'hombro', 'saltoL', 'saltoV', 'vel30'];
  return keys.map(k => {
    const val = document.getElementById('e-' + k)?.value;
    if (!val) return 0;
    return getScore('especif', k, val, window._testsSexo, window._testsPeso).score;
  });
}

function renderEspecif() {
  document.getElementById('tsec-especif').innerHTML = `
    <div style="font-size:10px;color:#ce93d8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">Cardio</div>
    ${filaEspecif('Test Cooper', 'Distancia en 12 min', 'cooper', 'metros')}
    ${filaEspecif('Test Léger', 'Nivel alcanzado', 'leger', 'nivel')}
    <div style="font-size:10px;color:#ce93d8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">Flexibilidad</div>
    ${filaEspecif('Sit & Reach', 'Isquiotibiales', 'sitreach', 'cm')}
    ${filaEspecif('Flex hombro', 'Mano a hombro contrario', 'hombro', 'cm')}
    <div style="font-size:10px;color:#ce93d8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:10px 0 8px">Potencia</div>
    ${filaEspecif('Salto largo', 'Sin impulso', 'saltoL', 'cm')}
    ${filaEspecif('Salto vertical', 'Test Sargent', 'saltoV', 'cm')}
    ${filaEspecif('Velocidad 30m', 'Menor tiempo = mejor', 'vel30', 'seg')}
    <div style="position:relative;width:100%;height:200px;margin-top:10px">
      <canvas id="radarEspecif" role="img" aria-label="Radar específico">Radar específico</canvas>
    </div>
    <button class="btn br" style="width:100%;margin-top:10px" onclick="guardarTest('especif')">💾 Guardar test específico</button>
    <button style="width:100%;background:#0a1a0a;color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:10px;font-weight:700;font-size:13px;cursor:pointer;margin-top:8px" onclick="enviarTest('especif')">📤 Enviar por WhatsApp</button>
  `;
  setTimeout(() => initRadar('radarEspecif', '_radarEspecifChart', ['Cooper','Léger','Sit&Reach','Hombro','S.Largo','S.Vertical','30m'], getScoresEspecif(), '#ce93d8'), 100);
}

function initRadar(canvasId, chartKey, labels, datos, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (window[chartKey]) window[chartKey].destroy();
  window[chartKey] = new Chart(canvas, {
    type: 'radar',
    data: { labels, datasets: [{ data: datos, backgroundColor: color + '33', borderColor: color, borderWidth: 2, pointBackgroundColor: color, pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: '#222' }, angleLines: { color: '#222' }, pointLabels: { color: '#888', font: { size: 10 } } } } }
  });
}

function actualizarRadar(canvasId, chartKey, datos) {
  if (window[chartKey]) { window[chartKey].data.datasets[0].data = datos; window[chartKey].update(); }
}

async function guardarTest(tipo) {
  const id = window._testsId;
  const peso = window._testsPeso;
  const sexo = window._testsSexo;
  const datos = { fecha: new Date().toISOString().split('T')[0], tipo, peso };

  if (tipo === 'fuerza') {
    const keys = ['pecho', 'espalda', 'biceps', 'triceps', 'femoral', 'cuad', 'gluteo'];
    keys.forEach(k => {
      const kg = document.getElementById('f-' + k + '-kg')?.value;
      const reps = document.getElementById('f-' + k + '-reps')?.value;
      if (kg && reps) { const rm = epley(kg, reps); datos[k] = { kg: parseFloat(kg), reps: parseFloat(reps), rm, score: getScore('fuerza', k, rm, sexo, peso).score }; }
    });
  }
  if (tipo === 'resist') {
    const keys = ['pushups', 'dominadas', 'fondos', 'sentadilla', 'plancha', 'burpees'];
    keys.forEach(k => { const val = document.getElementById('r-' + k)?.value; if (val) datos[k] = { valor: parseFloat(val), score: getScore('resist', k, val, sexo, peso).score }; });
  }
  if (tipo === 'especif') {
    const keys = ['cooper', 'leger', 'sitreach', 'hombro', 'saltoL', 'saltoV', 'vel30'];
    keys.forEach(k => { const val = document.getElementById('e-' + k)?.value; if (val) datos[k] = { valor: parseFloat(val), score: getScore('especif', k, val, sexo, peso).score }; });
  }

  const allScores = Object.values(datos).filter(v => typeof v === 'object' && v.score).map(v => v.score);
  datos.scoreTotal = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

  await fetch('/api/tests/' + id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
  window._testsHistorial.push(datos);
  if (tipo === 'fuerza') window._ultimoFuerza = datos;
  if (tipo === 'resist') window._ultimoResist = datos;
  if (tipo === 'especif') window._ultimoEspecif = datos;
  toast('✅ Test guardado');
}

async function enviarTest(tipo) {
  const id = window._testsId;
  const peso = window._testsPeso;
  const sexo = window._testsSexo;
  const u = await fetch('/api/usuarios').then(r => r.json());
  const usuario = u.find(x => x.id === id);
  const tipoLabel = { fuerza: '🏋️ Fuerza', resist: '💪🏻 Resistencia', especif: '⚡ Específico' };
  let msg = tipoLabel[tipo] + ' *Test de ' + usuario.nombre + '*\n\n';

  const anterior = window._testsHistorial.filter(r => r.tipo === tipo).slice(-2, -1)[0];

  if (tipo === 'fuerza') {
    const keys = ['pecho', 'espalda', 'biceps', 'triceps', 'femoral', 'cuad', 'gluteo'];
    const names = ['Press pecho', 'Remo supino', 'Curl barra', 'Fondos lastrados', 'P.Muerto', 'Sentadilla', 'Empuje cadera'];
    keys.forEach((k, i) => {
      const kg = document.getElementById('f-' + k + '-kg')?.value;
      const reps = document.getElementById('f-' + k + '-reps')?.value;
      if (kg && reps) {
        const rm = epley(kg, reps);
        const s = getScore('fuerza', k, rm, sexo, peso);
        const antRM = anterior?.[k]?.rm;
        msg += names[i] + ': ' + rm + ' kg RM ' + s.icon + cambioTexto(antRM, rm) + '\n';
      }
    });
  }
  if (tipo === 'resist') {
    const keys = ['pushups', 'dominadas', 'fondos', 'sentadilla', 'plancha', 'burpees'];
    const names = ['Push ups', 'Dominadas', 'Fondos', 'Sentadilla', 'Plancha', 'Burpees'];
    const units = ['reps', 'reps', 'reps', 'reps', 'seg', 'reps'];
    keys.forEach((k, i) => {
      const val = document.getElementById('r-' + k)?.value;
      if (val) {
        const s = getScore('resist', k, val, sexo, peso);
        const antVal = anterior?.[k]?.valor;
        msg += names[i] + ': ' + val + ' ' + units[i] + ' ' + s.icon + cambioTexto(antVal, parseFloat(val)) + '\n';
      }
    });
  }
  if (tipo === 'especif') {
    const keys = ['cooper', 'leger', 'sitreach', 'hombro', 'saltoL', 'saltoV', 'vel30'];
    const names = ['Cooper', 'Léger', 'Sit&Reach', 'Flex hombro', 'Salto largo', 'Salto vertical', 'Vel 30m'];
    const units = ['m', 'nivel', 'cm', 'cm', 'cm', 'cm', 'seg'];
    keys.forEach((k, i) => {
      const val = document.getElementById('e-' + k)?.value;
      if (val) {
        const s = getScore('especif', k, val, sexo, peso);
        const antVal = anterior?.[k]?.valor;
        msg += names[i] + ': ' + val + ' ' + units[i] + ' ' + s.icon + cambioTexto(antVal, parseFloat(val)) + '\n';
      }
    });
  }

  const ult = window._testsHistorial.filter(r => r.tipo === tipo).slice(-1)[0];
  if (ult?.scoreTotal) msg += '\n📊 Score total: ' + ult.scoreTotal + '/100';

  const res = await fetch('/api/enviar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ telefono: usuario.telefono, mensaje: msg }) });
  const data = await res.json();
  toast(data.ok ? '✅ Enviado' : '❌ Error', data.ok);
}

async function renderHistorialTests() {
  const registros = (window._testsHistorial || []).slice().reverse();
  const tipoLabel = { fuerza: '🏋️ Fuerza', resist: '💪🏻 Resistencia', especif: '⚡ Específico' };
  const keysLabels = {
    fuerza: { pecho: 'Pecho', espalda: 'Espalda', biceps: 'Bíceps', triceps: 'Tríceps', femoral: 'Femoral', cuad: 'Cuád', gluteo: 'Glúteo' },
    resist: { pushups: 'Push ups', dominadas: 'Dominadas', fondos: 'Fondos', sentadilla: 'Sentadilla', plancha: 'Plancha', burpees: 'Burpees' },
    especif: { cooper: 'Cooper', leger: 'Léger', sitreach: 'Sit&Reach', hombro: 'Hombro', saltoL: 'S.Largo', saltoV: 'S.Vertical', vel30: 'Vel 30m' }
  };

  if (!registros.length) {
    document.getElementById('tsec-historial').innerHTML = '<p style="color:#555;text-align:center;padding:30px">Sin tests guardados aún</p>';
    return;
  }

  document.getElementById('tsec-historial').innerHTML = registros.map(r => {
    const labels = keysLabels[r.tipo] || {};
    const filas = Object.entries(labels).map(([k, label]) => {
      if (!r[k]) return '';
      const val = r[k].rm || r[k].valor || '-';
      const s = r[k].score ? Object.values(ESCALAS[r.tipo]?.[k]?.M || []).find(n => n.score === r[k].score) : null;
      return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #111">
        <span style="font-size:12px;color:#888">${label}</span>
        <span style="font-size:12px;color:#fff;font-weight:700">${val}${r.tipo === 'fuerza' ? ' kg' : ''} ${s ? s.icon : ''}</span>
      </div>`;
    }).join('');
    return `
      <div style="background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid #1a1a1a;padding-bottom:8px">
          <span style="font-size:13px;font-weight:700;color:#fff">${tipoLabel[r.tipo] || r.tipo}</span>
          <div style="text-align:right">
            <div style="font-size:11px;color:#666">${r.fecha}</div>
            ${r.scoreTotal ? '<div style="font-size:14px;font-weight:700;color:#e31e24">' + r.scoreTotal + '/100</div>' : ''}
          </div>
        </div>
        ${filas}
      </div>`;
  }).join('');
}

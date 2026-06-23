// ── ALIMENTACIÓN ──────────────────────────────────────────

const FILTROS = {
  medico: ['Diabetes','Hipertensión','Colesterol alto','Hipotiroidismo','Resistencia insulina','Gastritis','Colon irritable','Hígado graso'],
  vida:   ['Vegetariano','Vegano','Keto','Sin gluten','Ayuno intermitente','Low carb','Alto volumen','Flexible'],
  alergia:['Lácteos','Huevo','Mariscos','Frutos secos','Soja','Trigo','Maní','Fructosa']
};

const selFiltros = { medico: new Set(), vida: new Set(), alergia: new Set() };
let nivelEco = 0;

// Inicializar chips al cargar
document.addEventListener('DOMContentLoaded', () => {
  ['medico','vida','alergia'].forEach(tipo => {
    const cont = document.getElementById('chips-' + tipo);
    FILTROS[tipo].forEach(item => {
      const chip = document.createElement('button');
      chip.textContent = item;
      chip.style.cssText = 'padding:6px 10px;border-radius:20px;border:1px solid #333;background:var(--gris);color:var(--texto-medio);font-size:11px;cursor:pointer';
      chip.onclick = () => toggleChip(chip, tipo, item);
      cont.appendChild(chip);
    });
  });

  // Calcular macros en tiempo real
  ['ali-peso-actual','ali-peso-objetivo','ali-proteina','ali-carbos','ali-grasas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcularMacros);
  });
});

function togglePretreno() {
  const check = document.getElementById('ali-pretreno-check');
  const pos   = document.getElementById('ali-pretreno-pos');
  pos.style.display = check.checked ? 'block' : 'none';
}

function selectEco(n) {
  nivelEco = n;
  [1,2,3].forEach(i => {
    const btn = document.getElementById('eco-' + i);
    btn.style.border    = i === n ? '2px solid #e31e24' : '2px solid #2a2a2a';
    btn.style.color     = i === n ? '#f0f0f0'           : '#888';
    btn.style.background = i === n ? '#2a0a0a'          : '#1a1a1a';
  });
}

function toggleFiltro(tipo) {
  const div = document.getElementById('filtro-' + tipo);
  div.style.display = div.style.display === 'none' ? 'flex' : 'none';
  div.style.flexWrap = 'wrap';
  div.style.gap = '6px';
}

function toggleChip(chip, tipo, item) {
  if (selFiltros[tipo].has(item)) {
    selFiltros[tipo].delete(item);
    chip.style.border     = '1px solid #333';
    chip.style.background = '#1a1a1a';
    chip.style.color      = '#888';
  } else {
    selFiltros[tipo].add(item);
    chip.style.border     = '1px solid #e31e24';
    chip.style.background = '#2a0a0a';
    chip.style.color      = '#f0f0f0';
  }
  const badge = document.getElementById('badge-' + tipo);
  badge.textContent = selFiltros[tipo].size > 0 ? selFiltros[tipo].size + ' sel.' : '';
}

function calcularMacros() {
  const pesoObj    = parseFloat(document.getElementById('ali-peso-objetivo').value) || 0;
  const pesoActual = parseFloat(document.getElementById('ali-peso-actual').value)   || 0;
  const prot  = parseFloat(document.getElementById('ali-proteina').value)    || 0;
  const carbs = parseFloat(document.getElementById('ali-carbos').value)      || 0;
  const gras  = parseFloat(document.getElementById('ali-grasas').value)      || 0;

  if (pesoObj === 0) { document.getElementById('ali-resumen').style.display = 'none'; return; }

  // Macros basados en peso objetivo
  const tProt  = Math.round(pesoObj * prot);
  const tCarbs = Math.round(pesoObj * carbs);
  const tGras  = Math.round(pesoObj * gras);
  const kcalObj = (tProt * 4) + (tCarbs * 4) + (tGras * 9);

  document.getElementById('res-proteina').textContent = tProt  + 'g';
  document.getElementById('res-carbos').textContent   = tCarbs + 'g';
  document.getElementById('res-grasas').textContent   = tGras  + 'g';
  document.getElementById('res-calorias').textContent = kcalObj + ' kcal totales';

  // Déficit / superávit si hay peso actual
  const elDif = document.getElementById('res-diferencia');
  if (pesoActual > 0 && elDif) {
    const kcalActual = Math.round((pesoActual * prot * 4) + (pesoActual * carbs * 4) + (pesoActual * gras * 9));
    const dif = kcalObj - kcalActual;
    if (dif < 0) {
      elDif.textContent = '🔻 Déficit de ' + Math.abs(dif) + ' kcal/día';
      elDif.style.color = '#e31e24';
    } else if (dif > 0) {
      elDif.textContent = '🔺 Superávit de ' + dif + ' kcal/día';
      elDif.style.color = '#4caf50';
    } else {
      elDif.textContent = '⚖️ Mantenimiento calórico';
      elDif.style.color = '#aaa';
    }
    elDif.style.display = 'block';
  } else if (elDif) {
    elDif.style.display = 'none';
  }

  document.getElementById('ali-resumen').style.display = 'block';
}

async function guardarAlimentacion() {
  const id = window.clienteMedidasId;
  if (!id) { toast('⚠️ Selecciona un cliente primero',false); return; }

  const datos = {
    peso_actual:   parseFloat(document.getElementById('ali-peso-actual').value)   || 0,
    peso_objetivo: parseFloat(document.getElementById('ali-peso-objetivo').value) || 0,
    proteina:      parseFloat(document.getElementById('ali-proteina').value)      || 0,
    carbos:        parseFloat(document.getElementById('ali-carbos').value)        || 0,
    grasas:        parseFloat(document.getElementById('ali-grasas').value)        || 0,
    objetivo:      document.getElementById('ali-objetivo') ? document.getElementById('ali-objetivo').value : '',
    comidas:       parseInt(document.getElementById('ali-comidas').value),
    pretreno:      document.getElementById('ali-pretreno-check').checked,
    pretreno_pos:  parseInt(document.getElementById('ali-pretreno-pos').value) || 0,
    nivel_eco:     nivelEco,
    medico:        [...selFiltros.medico],
    vida:          [...selFiltros.vida],
    alergias:      [...selFiltros.alergia]
  };

  if (!datos.peso_actual || !datos.proteina) {
    toast('⚠️ Completa el peso actual y la proteína',false);
    return;
  }

  try {
    const r = await fetch(`/api/alimentacion/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const res = await r.json();
    if (res.ok) toast('✅ Plan guardado correctamente');
    else alert('❌ Error: ' + (res.error || 'desconocido'));
  } catch(e) {
    toast('❌ No se pudo conectar con el servidor',false);
  }
}
</script>

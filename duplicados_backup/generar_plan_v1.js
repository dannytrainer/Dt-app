// ============================================================
// generar_plan.js — Generador automático de plan alimentario
// ============================================================

const fs = require('fs');
const path = require('path');

function generarPlanAlimentario(idCliente, dataDir, diaOffset) {
  dataDir = dataDir || path.join(__dirname, 'data');

  // ── 1. Cargar datos ──────────────────────────────────────
  const usuarios     = JSON.parse(fs.readFileSync(path.join(dataDir, 'usuarios.json'), 'utf8'));
  const alimentacion = JSON.parse(fs.readFileSync(path.join(dataDir, 'alimentacion.json'), 'utf8'));
  const alimentos    = JSON.parse(fs.readFileSync(path.join(dataDir, 'alimentos.json'), 'utf8'));

  const usuario = usuarios.find(u => u.id == idCliente || u.telefono == idCliente);
  if (!usuario) throw new Error('Cliente no encontrado');

  const config = alimentacion[idCliente] || alimentacion[usuario.telefono];
  if (!config) throw new Error('Sin configuración de alimentación');

  const perfil = usuario.perfil || {};
  const sexo   = (perfil.sexo || 'M').toUpperCase();
  const edad   = parseInt(perfil.edad) || 30;

  // ── 2. Calcular macros totales (sobre peso objetivo) ─────
  const pesoObj = parseFloat(config.peso_objetivo);
  const esVegano = (config.vida||[]).some(v => v === 'Vegano');
  const esVegetariano = (config.vida||[]).some(v => v === 'Vegetariano');
  const limiteProtVegano = esVegano ? 1.4 : esVegetariano ? 1.6 : null;
  const proteinaFinal = limiteProtVegano ? Math.min(parseFloat(config.proteina), limiteProtVegano) : parseFloat(config.proteina);
  const totalProt  = Math.round(proteinaFinal * pesoObj);
  const totalCarbs = Math.round(parseFloat(config.carbos)   * pesoObj);
  const totalGrasa = Math.round(parseFloat(config.grasas)   * pesoObj);
  const totalKcal  = Math.round((totalProt * 4) + (totalCarbs * 4) + (totalGrasa * 9));

  // ── 3. Definir comidas del día ───────────────────────────
  const nombreComidas = ['Desayuno', 'Snack 1', 'Almuerzo', 'Snack 2', 'Cena', 'Pre entreno'];
  let numComidas = parseInt(config.comidas) || 3;
  if (numComidas > 6) numComidas = 6;
  if (numComidas < 1) numComidas = 1;

  // Seleccionar comidas base según cantidad
  const comidasBase = ['Desayuno', 'Almuerzo', 'Cena'];
  const extras = ['Snack 1', 'Snack 2', 'Pre entreno'];
  let comidasDia = [...comidasBase];
  for (let i = 0; i < numComidas - 3 && i < extras.length; i++) {
    if (extras[i] === 'Pre entreno' && !config.pretreno) continue;
    comidasDia.push(extras[i]);
  }
  if (numComidas <= 2) comidasDia = comidasBase.slice(0, numComidas);
  if (numComidas === 1) comidasDia = ['Almuerzo'];

  // Ordenar: Desayuno → Snack1 → Almuerzo → Snack2 → Pre entreno → Cena
  const orden = ['Desayuno','Snack 1','Almuerzo','Snack 2','Pre entreno','Cena'];
  comidasDia.sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

  const n = comidasDia.length;

  // ── 4. Distribuir macros por comida ──────────────────────
  // Reglas:
  // Primera comida → 35% carbs, 20% prot, 15% grasa
  // Última comida  → 35% prot, 20% carbs, 25% grasa
  // Intermedias    → resto dividido equitativamente

  function distribuirMacros(total, pct_primera, pct_ultima, n) {
    if (n === 1) return [total];
    if (n === 2) {
      const p = Math.round(total * pct_primera);
      return [p, total - p];
    }
    const primera = Math.round(total * pct_primera);
    const ultima  = Math.round(total * pct_ultima);
    const resto   = total - primera - ultima;
    const nMedio  = n - 2;
    const medio   = Math.round(resto / nMedio);
    const dist = [primera];
    for (let i = 0; i < nMedio; i++) dist.push(medio);
    dist.push(ultima);
    // Ajustar diferencia de redondeo en la última
    const suma = dist.reduce((a,b) => a+b, 0);
    dist[dist.length-1] += (total - suma);
    return dist;
  }

  // Distribución balanceada: desayuno sólido, cena proteica, snacks con carbos reales
  // Porcentajes por tipo de comida
  // Distribución dinámica según número de comidas
  const n_comidas = comidasDia.length;
  const pctPorComida = n_comidas <= 3 ? {
    // 3 comidas — proteína repartida en las 3
    'Desayuno':    { prot: 0.25, carbs: 0.30, grasa: 0.25 },
    'Almuerzo':    { prot: 0.38, carbs: 0.40, grasa: 0.35 },
    'Cena':        { prot: 0.37, carbs: 0.30, grasa: 0.40 },
    'Pre entreno': { prot: 0.08, carbs: 0.12, grasa: 0.03 }
  } : n_comidas <= 4 ? {
    // 4 comidas — proteína alta en almuerzo y cena
    'Desayuno':    { prot: 0.20, carbs: 0.28, grasa: 0.20 },
    'Almuerzo':    { prot: 0.30, carbs: 0.35, grasa: 0.28 },
    'Cena':        { prot: 0.38, carbs: 0.22, grasa: 0.32 },
    'Snack 1':     { prot: 0.12, carbs: 0.15, grasa: 0.20 },
    'Pre entreno': { prot: 0.08, carbs: 0.12, grasa: 0.03 }
  } : {
    // 5-6 comidas — distribuir más uniformemente
    'Desayuno':    { prot: 0.15, carbs: 0.25, grasa: 0.18 },
    'Almuerzo':    { prot: 0.25, carbs: 0.35, grasa: 0.22 },
    'Cena':        { prot: 0.35, carbs: 0.18, grasa: 0.28 },
    'Snack 1':     { prot: 0.10, carbs: 0.10, grasa: 0.12 },
    'Snack 2':     { prot: 0.08, carbs: 0.08, grasa: 0.10 },
    'Snack 3':     { prot: 0.06, carbs: 0.07, grasa: 0.06 },
    'Pre entreno': { prot: 0.08, carbs: 0.12, grasa: 0.03 }
  };
  // Normalizar porcentajes segun comidas activas
  const sumProt  = comidasDia.reduce((s,c) => s + (pctPorComida[c]?.prot  || 0.10), 0);
  const sumCarbs = comidasDia.reduce((s,c) => s + (pctPorComida[c]?.carbs || 0.12), 0);
  const sumGrasa = comidasDia.reduce((s,c) => s + (pctPorComida[c]?.grasa || 0.10), 0);
  const distProt  = comidasDia.map(c => Math.round(totalProt  * (pctPorComida[c]?.prot  || 0.10) / sumProt));
  const distCarbs = comidasDia.map(c => Math.round(totalCarbs * (pctPorComida[c]?.carbs || 0.12) / sumCarbs));
  const distGrasa = comidasDia.map(c => Math.round(totalGrasa * (pctPorComida[c]?.grasa || 0.10) / sumGrasa));

  // ── 5. Filtrar alimentos disponibles ─────────────────────
  const nivelEco = (parseInt(config.nivel_eco) || 1) - 1; // 1=eco, 2=medio, 3=premium → 0,1,2
  const niveles  = ['economico','medio','premium'];
  const nivelesPermitidos = niveles.slice(0, nivelEco + 1);

  const medico   = config.medico   || [];
  const vida     = config.vida     || [];
  const alergias = config.alergias || [];

  // Reglas de exclusión por condición
  const exclusiones = {
    // Diabetes — excluir IG > 55, limitar azúcares simples
    'diabetes':           a => a.indice_glucemico > 70 || ['aguapanela'].includes(a._id),
    // Hipertensión — sodio bajo, sin sal añadida
    'hipertension':       a => a.sodio > 400 || ['sal','embutidos','tocineta','chorizo'].some(x => a._id.includes(x)),
    // Ácido úrico / gota — purinas bajas, sin vísceras ni mariscos
    'acido_urico':        a => a.purinas > 150 || ['higado','sardina','camaron','langostino','anchoa'].some(x => a._id.includes(x)),
    'gota':               a => a.purinas > 150 || ['higado','sardina','camaron','langostino','anchoa'].some(x => a._id.includes(x)),
    // Enfermedad renal
    'enfermedad_renal':   a => a.proteina > 20 || a.potasio > 300 || a.fosforo > 200,
    // Hipotiroidismo — evitar soja y crucíferas en exceso
    'hipotiroidismo':     a => ['soya'].includes(a._id),
    // Gastritis — evitar irritantes
    'gastritis':          a => ['cafe','alcohol','pimienta','aji'].some(x => a._id.includes(x)),
    'colesterol_alto':    a => a.grasas_saturadas > 5 || ['mantequilla','crema','chorizo','tocineta'].some(x => a._id.includes(x)),
    'colon_irritable':    a => ['leche','lacteo','gluten','pan','pasta','repollo','brocoli','coliflor','cebolla'].some(x => a._id.includes(x)),
    'higado_graso':       a => a.grasas > 20 || ['alcohol','mantequilla','tocineta','chorizo','crema'].some(x => a._id.includes(x)),
    'resistencia_insulina': a => a.indice_glucemico > 60 || ['azucar','miel','aguapanela','gaseosa','jugo'].some(x => a._id.includes(x)),
    'calculos_renales':   a => a.oxalato_alto,
    'vegano':             a => a.es_animal === true || a.es_lacteo === true,
    'vegetariano':        a => a.es_animal === true && !a.es_huevo && !a.es_lacteo,
    'keto':               a => a.carbohidratos > 10 || ['arroz','papa','yuca','platano','arepa','pan','pasta','avena','jugo','azucar','miel','aguapanela'].some(t => a._id.includes(t)),
    'low_carb':           a => a.carbohidratos > 20 || ['azucar','miel','aguapanela','gaseosa','jugo'].some(t => a._id.includes(t)),
    'sin_gluten':         a => ['pan','pasta','avena','bulgur','cuscus','galleta','harina_trigo'].some(t => a._id.includes(t)),
    'sin_lactosa':        a => a._cat === 'lacteo' && !['kefir','leche_vegetal'].includes(a._id),
    'sin_cerdo':          a => a._id.includes('cerdo'),
    'alergia_huevo':      a => a._id.includes('huevo'),
    'alergia_soya':       a => a._id.includes('soya'),
    'alergia_mariscos':   a => ['camaron','langostino','pulpo','calamar'].some(t => a._id.includes(t)),
    'alergia_frutos_secos': a => ['almendras','nueces','marañon','mani'].some(t => a._id.includes(t)),
  };

  const todosLosFiltros = [...medico, ...vida, ...alergias];

  const esVeganoVeg = (config.vida||[]).some(v => ['Vegano','Vegetariano'].includes(v));

  function alimentoPermitido(alimento, variante) {
    if (!nivelesPermitidos.includes(alimento.nivel)) return false;
    if (alimento.solo_vegano && !esVeganoVeg) return false;
    const ctx = { ...variante, _id: alimento.id, _cat: alimento.categoria, es_animal: alimento.es_animal || false, es_huevo: alimento.es_huevo || false, es_lacteo: alimento.es_lacteo || false };
    for (const filtro of todosLosFiltros) {
      const clave = filtro.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ /g,'_').replace(/\//g,'_');
      if (exclusiones[clave] && exclusiones[clave](ctx)) return false;
    }
    return true;
  }

  // Aplanar alimentos con variantes permitidas
  const alimentosFiltrados = [];
  for (const al of alimentos) {
    for (const variante of al.variantes) {
      if (alimentoPermitido(al, variante)) {
        alimentosFiltrados.push({ ...al, variante, varId: `${al.id}__${variante.preparacion}` });
      }
    }
  }

  // Separar por categoría
  const porCat = {};
  for (const a of alimentosFiltrados) {
    if (!porCat[a.categoria]) porCat[a.categoria] = [];
    porCat[a.categoria].push(a);
  }

  // ── 6. Ajustes por sexo y edad ───────────────────────────
  // Prioridades adicionales
  let priorizarHierro  = sexo === 'F' && edad < 50;
  let priorizarCalcio  = edad > 45;
  let priorizarVitD    = edad > 40;
  let priorizarFolato  = sexo === 'F' && edad < 45;

  // Seed determinística por cliente (para que no cambie en cada carga)
  // pero diferente por cliente
  const hoy = new Date();
  const diaAnio = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 86400000);
  const seedBase = idCliente.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  const seed = (seedBase * 31 + diaAnio * 7 + (diaOffset||0) * 97) % 9999991;
  function seededRand(arr, offset) {
    if (!arr || arr.length === 0) return null;
    return arr[((seed * 13) + offset * 29) % arr.length];
  }
  function elegirConPrioridad(arr, offset) {
    if (!arr || arr.length === 0) return null;
    // Tomar los top 3 por prioridad y elegir entre ellos con seed
    const top = arr.slice(0, Math.min(10, arr.length));
    return top[((seed * 31) + offset * 17) % top.length];
  }

  // ── 7. Seleccionar alimentos por comida ──────────────────
  const usados = new Set();
  const ultimoPorCategoria = {};
  const usosPorAlimento = {}; // contador de veces usado por id
  const targetGrasa = totalGrasa;
  const grasaXkilo = totalGrasa / pesoObj;
  const proteinaBajaGrasa = grasaXkilo < 1.3;

  const pocasComidas = comidasDia.length <= 3;

  function elegirAlimento(categoria, offset, excluirUsados, comida) {
    let pool = (porCat[categoria] || []);
    if (excluirUsados) pool = pool.filter(a => !usados.has(a.varId));
    // Respetar max_por_dia
    pool = pool.filter(a => !a.max_por_dia || (usosPorAlimento[a.id] || 0) < a.max_por_dia);
    // En almuerzo y cena no repetir mismo alimento base (por id)
    if (excluirUsados && (comida === 'almuerzo' || comida === 'cena') && categoria === 'proteina') {
      const usadosIds = Object.keys(usosPorAlimento);
      pool = pool.filter(a => !usadosIds.includes(a.id));
      if (pool.length === 0) pool = pool; // si no hay opciones dejar pasar
    }
    // Ordenar por prioridad descendente
    pool = pool.slice().sort((a, b) => (b.prioridad || 5) - (a.prioridad || 5));
    const ultimo = ultimoPorCategoria[categoria];
    const poolSinUltimo = ultimo ? pool.filter(a => a.varId !== ultimo) : pool;
    if (poolSinUltimo.length > 0) pool = poolSinUltimo;
    if (pool.length === 0) pool = porCat[categoria] || [];
    if (pool.length === 0) return null;
    if (comida && comidasDia.length > 3) {
      const filtrado = pool.filter(a => !a.comidas_permitidas || a.comidas_permitidas.includes(comida.toLowerCase().replace(/ /g,"_")));
      if (filtrado.length > 0) pool = filtrado;
    }
    const usarPrioridad = (categoria === 'proteina' && (comida === 'almuerzo' || comida === 'cena')) || (categoria === 'carbohidrato');
    const elegido = usarPrioridad ? elegirConPrioridad(pool, offset) : seededRand(pool, offset);
    if (elegido) {
      usados.add(elegido.varId);
      ultimoPorCategoria[categoria] = elegido.varId;
      usosPorAlimento[elegido.id] = (usosPorAlimento[elegido.id] || 0) + 1;
    }
    return elegido;
  }

  const factorPorcion = Math.min(3.0, 6 / (comidasDia.length || 4));
  const PORCION_MAX = {
    'proteina':    Math.round(200 * factorPorcion),
    'carbohidrato':Math.round(300 * factorPorcion),
    'grasa':       Math.round(60  * factorPorcion),
    'fruta':       200,
    'verdura':     200,
    'lacteo':      Math.round(300 * factorPorcion)
  };
  const PORCION_MIN = { 'proteina': 30, 'carbohidrato': 40, 'grasa': 5, 'fruta': 60 };

  const altaProteina = totalProt > 200;
  function calcularPorcion(alimento, macroObjetivo, macroTipo) {
    const v = alimento.variante;
    const macroPorPorcion = v[macroTipo];
    if (!macroPorPorcion || macroPorPorcion === 0) return v.porcion_g;
    const factor = macroObjetivo / macroPorPorcion;
    let porcion = Math.round(v.porcion_g * factor);
    const cat = alimento.categoria;
    if (PORCION_MAX[cat] && porcion > PORCION_MAX[cat]) porcion = PORCION_MAX[cat];
    if (PORCION_MIN[cat] && porcion < PORCION_MIN[cat]) porcion = PORCION_MIN[cat];
    // Respetar porcion_maxima especifica del alimento
    const porcionMaxAjustada = alimento.porcion_maxima ? (altaProteina && alimento.categoria === 'proteina' ? Math.round(alimento.porcion_maxima * 1.3) : alimento.porcion_maxima) : null;
    if (porcionMaxAjustada && porcion > porcionMaxAjustada) porcion = porcionMaxAjustada;
    return porcion;
  }

  const planComidas = [];

  comidasDia.forEach((nombreComida, i) => {
    const protComida  = distProt[i];
    const carbsComida = distCarbs[i];
    const grasaComida = distGrasa[i];
    const kcalComida  = Math.round((protComida*4) + (carbsComida*4) + (grasaComida*9));

    const items = [];
    const offset = i * 10;

    // DESAYUNO: proteína moderada + alto carbs + grasa pequeña
    // CENA: alta proteína + moderado carbs + grasa moderada
    // SNACKS: fruta o verdura + algo de proteína o grasa
    // ALMUERZO: proteína + carbs + verdura
    // PRE ENTRENO: carbs + proteína moderada

    if (nombreComida === 'Desayuno') {
      const poolCarbDesayuno = (porCat['carbohidrato'] || []).filter(a => !usados.has(a.varId) && a.subcategoria === 'carb_desayuno').sort((a,b) => (b.prioridad||0) - (a.prioridad||0));
      const idxCarbDesayuno = (seed + (diaOffset||0) * 41) % (poolCarbDesayuno.length || 1);
      const carb = poolCarbDesayuno.length > 0 ? poolCarbDesayuno[idxCarbDesayuno] : null;
      if(carb) { usados.add(carb.varId); }
      const protPool = [...(porCat['proteina'] || []), ...(porCat['lacteo'] || [])].filter(a => !usados.has(a.varId) && (pocasComidas || !a.comidas_permitidas || a.comidas_permitidas.includes('desayuno'))).sort((a,b) => (b.prioridad||0) - (a.prioridad||0));
      const prot = protPool.length > 0 ? protPool[0] : null;
      if(prot) { usados.add(prot.varId); usosPorAlimento[prot.id] = (usosPorAlimento[prot.id]||0)+1; }
      const poolFrutas = (porCat['fruta'] || []).filter(a => !usados.has(a.varId) && (!a.comidas_permitidas || a.comidas_permitidas.includes('desayuno')));
      const idsVistosF = new Set();
      const frutasMix = poolFrutas.filter(v => { if(idsVistosF.has(v.id)) return false; idsVistosF.add(v.id); return true; }).slice(0, 2);
      frutasMix.forEach(f => usados.add(f.varId));
      const fruta = frutasMix.length > 0 ? { ...frutasMix[0], _ensalada_frutas: frutasMix } : null;
      const grasa = elegirAlimento('grasa', offset+3, true, 'desayuno');
      if (carb)  items.push({ ...carb,  porcion_g: calcularPorcion(carb, carbsComida * 0.7, 'carbohidratos'), nota: 'Base energética' });
      if (prot)  items.push({ ...prot,  porcion_g: calcularPorcion(prot, protComida, 'proteina'), nota: 'Proteína matutina' });
      if (fruta) {
        if (fruta._ensalada_frutas && fruta._ensalada_frutas.length > 1) {
          const nombresFruta = fruta._ensalada_frutas.map(f => f.nombre).join(', ');
          items.push({ ...fruta, porcion_g: 150, nota: 'Ensalada de frutas', nombre: 'Ensalada de frutas', _detalle: nombresFruta });
        } else {
          items.push({ ...fruta, porcion_g: fruta.variante.porcion_g, nota: 'Micronutrientes' });
        }
      }
      const grasaImpDesayuno = (prot ? (prot.variante.grasas * calcularPorcion(prot, protComida, 'proteina') / prot.variante.porcion_g) : 0)
                             + (carb ? (carb.variante.grasas * calcularPorcion(carb, carbsComida * 0.7, 'carbohidratos') / carb.variante.porcion_g) : 0);
      const grasaNetaDesayuno = Math.max(0, grasaComida - grasaImpDesayuno);
      if (grasa && grasaNetaDesayuno > 3) items.push({ ...grasa, porcion_g: calcularPorcion(grasa, grasaNetaDesayuno, 'grasas'), nota: 'Grasa matutina' });
    }
    else if (nombreComida === 'Almuerzo') {
      let poolCarbAlmuerzo = (porCat['carbohidrato'] || []).filter(a =>
        !usados.has(a.varId) && a.subcategoria === 'carb_almuerzo' && a.id !== 'frijoles'
      ).sort((a,b) => (b.prioridad||0) - (a.prioridad||0));
      const idxCarb = (seed + (diaOffset||0) * 17) % (poolCarbAlmuerzo.length || 1);
      const carb = poolCarbAlmuerzo.length > 0 ? poolCarbAlmuerzo[idxCarb] : null;
      if(carb) { usados.add(carb.varId); ultimoPorCategoria['carbohidrato'] = carb.varId; }
      // Rotar proteína de almuerzo usando diaOffset
const legVeganas = esVeganoVeg ? (porCat['legumbre']||[]).filter(a => a.es_proteina_vegana && !usados.has(a.varId)) : [];
      const poolProtAlmuerzo = [...(porCat['proteina'] || []), ...legVeganas].filter(a =>
        !usados.has(a.varId) &&
        (a.subcategoria === 'proteina_principal' || a.es_proteina_vegana) &&
        (!a.comidas_permitidas || a.comidas_permitidas.includes('almuerzo')) &&
        (!proteinaBajaGrasa || a.grasa_nivel !== 'alto')
      ).sort((a,b) => (b.prioridad_nutricional||b.prioridad||5) - (a.prioridad_nutricional||a.prioridad||5));
      const idxProt = (seed + (diaOffset||0) * 13) % (poolProtAlmuerzo.length || 1);
      const prot = poolProtAlmuerzo.length > 0 ? poolProtAlmuerzo[idxProt] : null;
      if(prot) { usados.add(prot.varId); ultimoPorCategoria['proteina'] = prot.varId; usosPorAlimento[prot.id] = (usosPorAlimento[prot.id]||0)+1; }
      // Ensalada variada — tomar hasta 3 verduras diferentes
      const poolVerduras = (porCat['verdura'] || []).filter(a => !usados.has(a.varId)).sort(() => Math.random() - 0.5);
      const idsVistos = new Set();
      const verduras = poolVerduras.filter(v => { if(idsVistos.has(v.id)) return false; idsVistos.add(v.id); return true; }).slice(0, 3);
      verduras.forEach(v => usados.add(v.varId));
      const verdura = verduras.length > 0 ? { ...verduras[0], _ensalada: verduras } : null;
      const grasa   = elegirAlimento('grasa', offset+3, true, 'almuerzo');
      if (prot)    items.push({ ...prot,    porcion_g: calcularPorcion(prot, protComida, 'proteina'), nota: 'Proteína principal' });
      const protAportada = prot ? (prot.variante.proteina * calcularPorcion(prot, protComida, 'proteina') / prot.variante.porcion_g) : 0;
      if (protAportada < protComida * 0.85) {
        const protFaltante = protComida - protAportada;
        // Complemento solo si proteína principal no es premium ni pescado
      const esProteinaPremium = prot && ['salmon','lomo_res','camaron','carne_res','cerdo_lomo'].includes(prot.id);
      const esProteínaPescado = prot && ['tilapia','bagre','mojarra','sardina','atun_enlatado'].includes(prot.id);
      const complemento = (esProteinaPremium || esProteínaPescado) ? null : (porCat['proteina'] || []).filter(a => 
          !usados.has(a.varId) && 
          a.id !== (prot ? prot.id : '') &&
          a.subcategoria === 'proteina_complemento'
        ).sort((a,b) => (b.prioridad||0)-(a.prioridad||0))[0];
        if (complemento) items.push({ ...complemento, porcion_g: calcularPorcion(complemento, protFaltante, 'proteina'), nota: 'Complemento proteína' });
      }
      if (carb)    items.push({ ...carb,    porcion_g: calcularPorcion(carb, carbsComida, 'carbohidratos'), nota: 'Energía' });
      if (verdura) {
        if (verdura._ensalada && verdura._ensalada.length > 1) {
          const nombres = verdura._ensalada.map(v => v.nombre).join(', ');
          items.push({ ...verdura, porcion_g: 100, nota: 'Ensalada variada', nombre: 'Ensalada variada', _detalle: nombres });
        } else {
          items.push({ ...verdura, porcion_g: 100, nota: 'Micronutrientes y fibra' });
        }
      }
      const grasaImplicita = (prot ? (prot.variante.grasas * calcularPorcion(prot, protComida, 'proteina') / prot.variante.porcion_g) : 0)
                          + (carb ? (carb.variante.grasas * calcularPorcion(carb, carbsComida, 'carbohidratos') / carb.variante.porcion_g) : 0);
      const grasaNeta = Math.max(0, grasaComida - grasaImplicita);
      if (grasa && grasaNeta > 3) items.push({ ...grasa, porcion_g: calcularPorcion(grasa, grasaNeta, 'grasas'), nota: 'Grasa saludable' });
    }
    else if (nombreComida === 'Cena') {
        const legVeganasCena = esVeganoVeg ? (porCat['legumbre']||[]).filter(a => a.es_proteina_vegana && !usados.has(a.varId)) : [];
      const poolProtCena = [...(porCat['proteina'] || []), ...legVeganasCena].filter(a =>
        !usados.has(a.varId) &&
        (a.subcategoria === 'proteina_principal' || a.es_proteina_vegana) &&
        (!a.comidas_permitidas || a.comidas_permitidas.includes('cena')) &&
        (!proteinaBajaGrasa || a.grasa_nivel !== 'alto')
      ).sort((a,b) => (b.prioridad_nutricional||b.prioridad||5) - (a.prioridad_nutricional||a.prioridad||5));
      const idxProtCena = (seed + (diaOffset||0) * 31) % (poolProtCena.length || 1);
      const prot = poolProtCena.length > 0 ? poolProtCena[idxProtCena] : null;
      if(prot) { usados.add(prot.varId); ultimoPorCategoria['proteina'] = prot.varId; usosPorAlimento[prot.id] = (usosPorAlimento[prot.id]||0)+1; }
      const poolCarbCena = (porCat['carbohidrato'] || []).filter(a =>
        !usados.has(a.varId) && a.subcategoria === 'carb_almuerzo'
      ).sort((a,b) => (b.prioridad||0) - (a.prioridad||0));
      const idxCarbCena = (seed + (diaOffset||0) * 23) % (poolCarbCena.length || 1);
      const carb = poolCarbCena.length > 0 ? poolCarbCena[idxCarbCena] : null;
      if(carb) { usados.add(carb.varId); }
      const poolVerdurasCena = (porCat['verdura'] || []).filter(a => !usados.has(a.varId)).sort(() => Math.random() - 0.5);
      const idsVistosCena = new Set();
      const verdurasCena = poolVerdurasCena.filter(v => { if(idsVistosCena.has(v.id)) return false; idsVistosCena.add(v.id); return true; }).slice(0, 3);
      verdurasCena.forEach(v => usados.add(v.varId));
      const verdura = verdurasCena.length > 0 ? { ...verdurasCena[0], _ensalada: verdurasCena } : null;
      const grasa   = elegirAlimento('grasa', offset+3, true, 'cena');
      if (prot)    items.push({ ...prot,    porcion_g: calcularPorcion(prot, protComida, 'proteina'), nota: 'Alta proteína nocturna' });
      const protAportadaCena = prot ? (prot.variante.proteina * calcularPorcion(prot, protComida, 'proteina') / prot.variante.porcion_g) : 0;
      if (protAportadaCena < protComida * 0.75) {
        const compCena = (porCat['proteina'] || []).filter(a => 
          !usados.has(a.varId) && a.subcategoria === 'proteina_complemento'
        ).sort((a,b) => (b.prioridad||0)-(a.prioridad||0))[0];
        if(compCena) items.push({ ...compCena, porcion_g: calcularPorcion(compCena, protComida * 0.4, 'proteina'), nota: 'Complemento proteína' });
      }
      if (carb)    items.push({ ...carb,    porcion_g: calcularPorcion(carb, carbsComida, 'carbohidratos'), nota: 'Carbs moderados' });
      if (verdura) {
        if (verdura._ensalada && verdura._ensalada.length > 1) {
          const nombres = verdura._ensalada.map(v => v.nombre).join(', ');
          items.push({ ...verdura, porcion_g: 100, nota: 'Ensalada variada', nombre: 'Ensalada variada', _detalle: nombres });
        } else {
          items.push({ ...verdura, porcion_g: 100, nota: 'Micronutrientes' });
        }
      }
      const grasaImpCena = (prot ? (prot.variante.grasas * calcularPorcion(prot, protComida, 'proteina') / prot.variante.porcion_g) : 0)
                        + (carb ? (carb.variante.grasas * calcularPorcion(carb, carbsComida * 0.6, 'carbohidratos') / carb.variante.porcion_g) : 0);
      const grasaNetaCena = Math.max(0, grasaComida - grasaImpCena);
      if (grasa && grasaNetaCena > 3) items.push({ ...grasa, porcion_g: calcularPorcion(grasa, grasaNetaCena, 'grasas'), nota: 'Grasa nocturna' });
    }
    else if (nombreComida === 'Snack 1' || nombreComida === 'Snack 2' || nombreComida === 'Snack 3') {
      const snackIdx = nombreComida === 'Snack 1' ? 0 : 1;
      const esEnsalada = ((seed + snackIdx) % 10) < 3;
      
      if (esEnsalada) {
        const poolVerdSnack = (porCat['verdura'] || []).filter(a => !usados.has(a.varId));
        const idsVistosS = new Set();
        const verdsSnack = poolVerdSnack.filter(v => { if(idsVistosS.has(v.id)) return false; idsVistosS.add(v.id); return true; }).slice(0, 2);
        verdsSnack.forEach(v => usados.add(v.varId));
        if(verdsSnack.length > 0) {
          const nombresVerd = verdsSnack.map(v => v.nombre).join(', ');
          items.push({ ...verdsSnack[0], porcion_g: 100, nota: 'Snack ensalada', nombre: 'Ensalada snack', _detalle: nombresVerd });
        }
        const protLigera = (porCat['proteina'] || []).filter(a =>
          !usados.has(a.varId) && a.subcategoria === 'proteina_complemento' &&
          (!a.comidas_permitidas || a.comidas_permitidas.includes('snack'))
        ).sort((a,b) => (b.prioridad||0)-(a.prioridad||0))[0];
        if(protLigera) { items.push({ ...protLigera, porcion_g: calcularPorcion(protLigera, protComida, 'proteina'), nota: 'Proteína ensalada snack' }); usados.add(protLigera.varId); }
      } else {
        const principal = elegirAlimento('fruta', offset, true, 'snack');
        if (principal) items.push({ ...principal, porcion_g: principal.variante.porcion_g, nota: 'Snack principal' });
        const protSnack = [...(porCat['proteina']||[]), ...(porCat['lacteo']||[])].filter(a =>
          !usados.has(a.varId) && a.subcategoria === 'proteina_complemento' &&
          (!a.comidas_permitidas || a.comidas_permitidas.includes('snack'))
        ).sort((a,b) => (b.prioridad||0)-(a.prioridad||0))[0];
        if (protSnack) { items.push({ ...protSnack, porcion_g: calcularPorcion(protSnack, protComida, 'proteina'), nota: 'Proteína snack' }); usados.add(protSnack.varId); }
        if (n_comidas <= 4 && nombreComida === 'Snack 1' && kcalComida > 400) {
          const carbSnack = (porCat['carbohidrato'] || []).filter(a =>
            !usados.has(a.varId) && a.subcategoria === 'carb_desayuno' &&
            (!a.comidas_permitidas || a.comidas_permitidas.includes('snack'))
          ).sort((a,b) => (b.prioridad||0)-(a.prioridad||0))[0];
          if (carbSnack) items.push({ ...carbSnack, porcion_g: calcularPorcion(carbSnack, carbsComida * 0.5, 'carbohidratos'), nota: 'Energía snack' });
        }
      }
    }
    else if (nombreComida === 'Pre entreno') {
      const carbsPreEntreno = Math.min(carbsComida, 40);
      const protPreEntreno = Math.min(protComida, 20);
      const poolCarbRapido = (porCat['carbohidrato'] || []).filter(a =>
        !usados.has(a.varId) && (a.subcategoria === 'carb_rapido' || a.id === 'arroz_blanco')
      ).sort((a,b) => (b.prioridad||0) - (a.prioridad||0));
      const carb = poolCarbRapido.length > 0 ? poolCarbRapido[0] : null;
      if(carb) { usados.add(carb.varId); }
      const prot = elegirAlimento('proteina', offset+1, true, 'pre_entreno');
      if (carb) items.push({ ...carb, porcion_g: calcularPorcion(carb, carbsPreEntreno, 'carbohidratos'), nota: 'Energía pre entreno' });
      if (prot) items.push({ ...prot, porcion_g: calcularPorcion(prot, protPreEntreno, 'proteina'), nota: 'Proteína pre entreno' });
    }

    // Calcular macros reales de los items seleccionados
    let kcalReal = 0, protReal = 0, carbsReal = 0, grasaReal = 0;
    items.forEach(item => {
      const factor = item.porcion_g / item.variante.porcion_g;
      kcalReal  += Math.round(item.variante.calorias       * factor);
      protReal  += Math.round(item.variante.proteina       * factor * 10) / 10;
      carbsReal += Math.round(item.variante.carbohidratos  * factor * 10) / 10;
      grasaReal += Math.round(item.variante.grasas         * factor * 10) / 10;
    });

    planComidas.push({
      nombre: nombreComida,
      macros_objetivo: { proteina: protComida, carbos: carbsComida, grasas: grasaComida, kcal: kcalComida },
      macros_reales:   { proteina: protReal,   carbos: carbsReal,   grasas: grasaReal,  kcal: kcalReal },
      alimentos: items.map(item => ({
        nombre:      item.nombre,
        preparacion: item.variante.preparacion,
        porcion_g:   item.porcion_g,
        categoria:   item.categoria,
        nivel:       item.nivel,
        macros: {
          proteina:      Math.round(item.variante.proteina      * (item.porcion_g / item.variante.porcion_g) * 10) / 10,
          carbohidratos: Math.round(item.variante.carbohidratos * (item.porcion_g / item.variante.porcion_g) * 10) / 10,
          grasas:        Math.round(item.variante.grasas        * (item.porcion_g / item.variante.porcion_g) * 10) / 10,
          calorias:      Math.round(item.variante.calorias      * (item.porcion_g / item.variante.porcion_g))
        },
        nota: item.nota,
        detalle: item._detalle || null,
        unidad: (() => {
          const uRaw = item.unidad_natural;
          if (!uRaw) return null;
          const u = typeof uRaw === 'string'
            ? { nombre: uRaw, plural: item.unidad_natural_plural || uRaw, peso_unitario: item.peso_unidad, solo_enteros: item.solo_enteros || false }
            : uRaw;
          const cantidadExacta = item.porcion_g / u.peso_unitario;
          const cantidad = u.solo_enteros
            ? Math.max(1, Math.round(cantidadExacta))
            : Math.max(0.5, Math.round(cantidadExacta * 2) / 2);
          item = { ...item, porcion_g: Math.round(cantidad * u.peso_unitario) };
          if (cantidad <= 0) return null;
          const nombre = cantidad === 1 ? u.nombre : (u.plural || u.nombre);
          const parteEntera = Math.floor(cantidad);
          const media = cantidad % 1 === 0.5;
          let textoUnidad;
          const esFemenino = ['arepa','taza','tazas','porción','porciones','tajada','tajadas','cucharada','cucharadas','galleta','galletas','lata','latas'].some(p => u.nombre.includes(p) || (u.plural||'').includes(p));
          const medioTexto = esFemenino ? 'media' : 'medio';
          const yMedioTexto = esFemenino ? 'y media' : 'y medio';
          if (media && parteEntera === 0) {
            textoUnidad = medioTexto + ' ' + u.nombre;
          } else if (media) {
            textoUnidad = parteEntera + ' ' + (parteEntera === 1 ? u.nombre : u.plural) + ' ' + yMedioTexto;
          } else {
            textoUnidad = cantidad + ' ' + (cantidad === 1 ? u.nombre : u.plural);
          }
          return { cantidad, nombre, texto: textoUnidad + ' (' + item.porcion_g + 'g)' };
        })()
      }))
    });
  });

  // ── 8. Construir resultado final ─────────────────────────
  return {
    id_cliente:   idCliente,
    nombre:       usuario.nombre,
    sexo,
    edad,
    generado:     new Date().toISOString(),
    peso_actual:  config.peso_actual,
    peso_objetivo: pesoObj,
    nivel_eco:    niveles[nivelEco] || 'economico',
    filtros_activos: todosLosFiltros,
    totales: {
      proteina:      totalProt,
      carbohidratos: totalCarbs,
      grasas:        totalGrasa,
      calorias:      totalKcal
    },
    comidas: planComidas
  };
}

function generarPlanSemanal(idCliente, dataDir) {
  const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  return dias.map((dia, i) => {
    const plan = generarPlanAlimentario(idCliente, dataDir, i);
    return { dia, ...plan };
  });
}

module.exports = { generarPlanAlimentario, generarPlanSemanal };

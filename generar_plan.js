// ============================================================
// generar_plan.js — Generador automático de plan alimentario
// ============================================================

const fs = require('fs');
const path = require('path');

function generarPlanAlimentario(idCliente, dataDir) {
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
  const totalProt  = Math.round(parseFloat(config.proteina) * pesoObj);
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
  const distProt  = distribuirMacros(totalProt,  0.20, 0.30, n);
  const distCarbs = distribuirMacros(totalCarbs, 0.28, 0.18, n);
  const distGrasa = distribuirMacros(totalGrasa, 0.18, 0.22, n);

  // ── 5. Filtrar alimentos disponibles ─────────────────────
  const nivelEco = parseInt(config.nivel_eco) || 0; // 0=eco, 1=medio, 2=premium
  const niveles  = ['economico','medio','premium'];
  const nivelesPermitidos = niveles.slice(0, nivelEco + 1);

  const medico   = config.medico   || [];
  const vida     = config.vida     || [];
  const alergias = config.alergias || [];

  // Reglas de exclusión por condición
  const exclusiones = {
    'diabetes':           a => a.indice_glucemico > 55,
    'hipertension':       a => a.sodio > 400,
    'acido_urico':        a => a.purinas > 150,
    'gota':               a => a.purinas > 150,
    'calculos_renales':   a => a.oxalato_alto,
    'enfermedad_renal':   a => a.proteina > 25 || a.potasio > 400,
    'vegano':             a => ['proteina','lacteo'].includes(a._cat) && 
                               ['pollo','res','cerdo','pescado','huevo','lacteo'].some(t => a._id.includes(t)),
    'vegetariano':        a => ['proteina'].includes(a._cat) && 
                               ['pollo','res','cerdo','pescado','salmon','atun','tilapia','bagre','mojarra','sardina','camaron','langostino','pulpo','calamar','trucha','pavo'].some(t => a._id.includes(t)),
    'sin_gluten':         a => ['pan','pasta','avena','bulgur','cuscus'].some(t => a._id.includes(t)),
    'sin_lactosa':        a => a._cat === 'lacteo' && !['kefir','leche_vegetal'].includes(a._id),
    'sin_cerdo':          a => a._id.includes('cerdo'),
    'alergia_huevo':      a => a._id.includes('huevo'),
    'alergia_soya':       a => a._id.includes('soya'),
    'alergia_mariscos':   a => ['camaron','langostino','pulpo','calamar'].some(t => a._id.includes(t)),
    'alergia_frutos_secos': a => ['almendras','nueces','marañon','mani'].some(t => a._id.includes(t)),
  };

  const todosLosFiltros = [...medico, ...vida, ...alergias];

  function alimentoPermitido(alimento, variante) {
    if (!nivelesPermitidos.includes(alimento.nivel)) return false;
    const ctx = { ...variante, _id: alimento.id, _cat: alimento.categoria };
    for (const filtro of todosLosFiltros) {
      const clave = filtro.toLowerCase().replace(/ /g,'_').replace(/\//g,'_');
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
  const seed = idCliente.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  function seededRand(arr, offset) {
    if (!arr || arr.length === 0) return null;
    return arr[(seed + offset) % arr.length];
  }

  // ── 7. Seleccionar alimentos por comida ──────────────────
  const usados = new Set();
  const ultimoPorCategoria = {};

  function elegirAlimento(categoria, offset, excluirUsados) {
    let pool = (porCat[categoria] || []);
    if (excluirUsados) pool = pool.filter(a => !usados.has(a.varId));
    const ultimo = ultimoPorCategoria[categoria];
    const poolSinUltimo = ultimo ? pool.filter(a => a.varId !== ultimo) : pool;
    if (poolSinUltimo.length > 0) pool = poolSinUltimo;
    if (pool.length === 0) pool = porCat[categoria] || [];
    if (pool.length === 0) return null;
    const elegido = seededRand(pool, offset);
    if (elegido) {
      usados.add(elegido.varId);
      ultimoPorCategoria[categoria] = elegido.varId;
    }
    return elegido;
  }

  const PORCION_MAX = { 'proteina': 300, 'carbohidrato': 400, 'grasa': 80, 'fruta': 250, 'verdura': 200, 'lacteo': 400 };
  const PORCION_MIN = { 'proteina': 80, 'carbohidrato': 100, 'grasa': 15, 'fruta': 80 };

  function calcularPorcion(alimento, macroObjetivo, macroTipo) {
    const v = alimento.variante;
    const macroPorPorcion = v[macroTipo];
    if (!macroPorPorcion || macroPorPorcion === 0) return v.porcion_g;
    const factor = macroObjetivo / macroPorPorcion;
    let porcion = Math.round(v.porcion_g * factor);
    const cat = alimento.categoria;
    if (PORCION_MAX[cat] && porcion > PORCION_MAX[cat]) porcion = PORCION_MAX[cat];
    if (PORCION_MIN[cat] && porcion < PORCION_MIN[cat]) porcion = PORCION_MIN[cat];
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
      const carb  = elegirAlimento('carbohidrato', offset, true);
      const prot  = elegirAlimento('proteina', offset+1, true);
      const fruta = elegirAlimento('fruta', offset+2, true);
      if (carb)  items.push({ ...carb,  porcion_g: calcularPorcion(carb, carbsComida * 0.7, 'carbohidratos'), nota: 'Base energética' });
      if (prot)  items.push({ ...prot,  porcion_g: calcularPorcion(prot, protComida, 'proteina'), nota: 'Proteína matutina' });
      if (fruta) items.push({ ...fruta, porcion_g: fruta.variante.porcion_g, nota: 'Micronutrientes' });
    }
    else if (nombreComida === 'Almuerzo') {
      const EXCLUIR_ALMUERZO = ['avena','cereal','granola','milo'];
      let poolCarbAlmuerzo = (porCat['carbohidrato'] || []).filter(a =>
        !usados.has(a.varId) &&
        !EXCLUIR_ALMUERZO.some(x => a.id.includes(x)) &&
        !EXCLUIR_ALMUERZO.some(x => (a.variante.preparacion || '').toLowerCase().includes(x))
      );
      if (poolCarbAlmuerzo.length === 0) poolCarbAlmuerzo = porCat['carbohidrato'] || [];
      const prot    = elegirAlimento('proteina', offset, true);
      const carb    = (() => {
        const elegido = seededRand(poolCarbAlmuerzo, offset+1);
        if (elegido) { usados.add(elegido.varId); ultimoPorCategoria['carbohidrato'] = elegido.varId; }
        return elegido;
      })();
      const verdura = elegirAlimento('verdura', offset+2, true);
      const grasa   = elegirAlimento('grasa', offset+3, true);
      if (prot)    items.push({ ...prot,    porcion_g: calcularPorcion(prot, protComida, 'proteina'), nota: 'Proteína principal' });
      if (carb)    items.push({ ...carb,    porcion_g: calcularPorcion(carb, carbsComida, 'carbohidratos'), nota: 'Energía' });
      if (verdura) items.push({ ...verdura, porcion_g: 100, nota: 'Micronutrientes y fibra' });
      if (grasa)   items.push({ ...grasa,   porcion_g: calcularPorcion(grasa, grasaComida, 'grasas'), nota: 'Grasas saludables' });
    }
    else if (nombreComida === 'Cena') {
      const prot    = elegirAlimento('proteina', offset, true);
      const carb    = elegirAlimento('carbohidrato', offset+1, true);
      const verdura = elegirAlimento('verdura', offset+2, true);
      const grasa   = elegirAlimento('grasa', offset+3, true);
      if (prot)    items.push({ ...prot,    porcion_g: calcularPorcion(prot, protComida, 'proteina'), nota: 'Alta proteína nocturna' });
      if (carb)    items.push({ ...carb,    porcion_g: calcularPorcion(carb, carbsComida * 0.6, 'carbohidratos'), nota: 'Carbs moderados' });
      if (verdura) items.push({ ...verdura, porcion_g: 100, nota: 'Fibra y vitaminas' });
      if (grasa)   items.push({ ...grasa,   porcion_g: calcularPorcion(grasa, grasaComida, 'grasas'), nota: 'Grasa nocturna' });
    }
    else if (nombreComida.includes('Snack')) {
      const fruta = elegirAlimento('fruta', offset, true);
      const prot  = elegirAlimento('proteina', offset+1, true);
      const carbSnack = carbsComida >= 30 ? elegirAlimento('carbohidrato', offset+2, true) : null;
      if (fruta) items.push({ ...fruta, porcion_g: fruta.variante.porcion_g, nota: 'Snack natural' });
      if (carbSnack) items.push({ ...carbSnack, porcion_g: calcularPorcion(carbSnack, carbsComida * 0.6, 'carbohidratos'), nota: 'Energía snack' });
      if (prot && protComida > 10) items.push({ ...prot, porcion_g: calcularPorcion(prot, protComida * 0.85, 'proteina'), nota: 'Proteína snack' });
    }
    else if (nombreComida === 'Pre entreno') {
      const carb = elegirAlimento('carbohidrato', offset, true);
      const prot = elegirAlimento('proteina', offset+1, true);
      if (carb) items.push({ ...carb, porcion_g: calcularPorcion(carb, carbsComida, 'carbohidratos'), nota: 'Energía pre entreno' });
      if (prot) items.push({ ...prot, porcion_g: calcularPorcion(prot, protComida * 0.5, 'proteina'), nota: 'Proteína pre entreno' });
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
        nota: item.nota
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

module.exports = { generarPlanAlimentario };

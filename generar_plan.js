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
  // Porcentajes por tipo de comida
  const pctPorComida = {
    'Desayuno':    { prot: 0.20, carbs: 0.25, grasa: 0.20 },
    'Almuerzo':    { prot: 0.30, carbs: 0.30, grasa: 0.25 },
    'Cena':        { prot: 0.30, carbs: 0.18, grasa: 0.25 },
    'Snack 1':     { prot: 0.08, carbs: 0.12, grasa: 0.10 },
    'Snack 2':     { prot: 0.08, carbs: 0.10, grasa: 0.10 },
    'Snack 3':     { prot: 0.07, carbs: 0.08, grasa: 0.08 },
    'Pre entreno': { prot: 0.10, carbs: 0.20, grasa: 0.05 }
  };
  // Normalizar porcentajes segun comidas activas
  const sumProt  = comidasDia.reduce((s,c) => s + (pctPorComida[c]?.prot  || 0.10), 0);
  const sumCarbs = comidasDia.reduce((s,c) => s + (pctPorComida[c]?.carbs || 0.12), 0);
  const sumGrasa = comidasDia.reduce((s,c) => s + (pctPorComida[c]?.grasa || 0.10), 0);
  const distProt  = comidasDia.map(c => Math.round(totalProt  * (pctPorComida[c]?.prot  || 0.10) / sumProt));
  const distCarbs = comidasDia.map(c => Math.round(totalCarbs * (pctPorComida[c]?.carbs || 0.12) / sumCarbs));
  const distGrasa = comidasDia.map(c => Math.round(totalGrasa * (pctPorComida[c]?.grasa || 0.10) / sumGrasa));

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
  const hoy = new Date();
  const diaAnio = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 86400000);
  const seed = idCliente.split('').reduce((a,c) => a + c.charCodeAt(0), 0) + (diaAnio * 7);
  function seededRand(arr, offset) {
    if (!arr || arr.length === 0) return null;
    return arr[(seed + offset) % arr.length];
  }
  function elegirConPrioridad(arr, offset) {
    if (!arr || arr.length === 0) return null;
    // Tomar los top 3 por prioridad y elegir entre ellos con seed
    const top = arr.slice(0, Math.min(3, arr.length));
    return top[(seed + offset) % top.length];
  }

  // ── 7. Seleccionar alimentos por comida ──────────────────
  const usados = new Set();
  const ultimoPorCategoria = {};
  const usosPorAlimento = {}; // contador de veces usado por id

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
    if (comida) {
      const filtrado = pool.filter(a => !a.comidas_permitidas || a.comidas_permitidas.includes(comida));
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
    // Respetar porcion_maxima especifica del alimento
    if (alimento.porcion_maxima && porcion > alimento.porcion_maxima) porcion = alimento.porcion_maxima;
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
      const carb  = elegirAlimento('carbohidrato', offset, true, 'desayuno');
      const prot  = elegirAlimento('proteina', offset+1, true, 'desayuno');
      const fruta = elegirAlimento('fruta', offset+2, true, 'desayuno');
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
      const prot    = elegirAlimento('proteina', offset, true, 'almuerzo');
      const carb    = (() => {
        const elegido = seededRand(poolCarbAlmuerzo, offset+1);
        if (elegido) { usados.add(elegido.varId); ultimoPorCategoria['carbohidrato'] = elegido.varId; }
        return elegido;
      })();
      const verdura = elegirAlimento('verdura', offset+2, true, 'almuerzo');
      const grasa   = elegirAlimento('grasa', offset+3, true, 'almuerzo');
      if (prot)    items.push({ ...prot,    porcion_g: calcularPorcion(prot, protComida, 'proteina'), nota: 'Proteína principal' });
      if (prot && prot.complemento_proteina) {
        const huevo = (porCat['proteina'] || []).find(a => a.id === 'huevo');
        if (huevo) items.push({ ...huevo, porcion_g: 60, nota: 'Complemento aminoácidos' });
      }
      if (carb)    items.push({ ...carb,    porcion_g: calcularPorcion(carb, carbsComida, 'carbohidratos'), nota: 'Energía' });
      if (verdura) items.push({ ...verdura, porcion_g: 100, nota: 'Micronutrientes y fibra' });
      // Descontar grasa ya aportada por proteina y carb
      const grasaImplicita = (prot ? (prot.variante.grasas * calcularPorcion(prot, protComida, 'proteina') / prot.variante.porcion_g) : 0)
                          + (carb ? (carb.variante.grasas * calcularPorcion(carb, carbsComida, 'carbohidratos') / carb.variante.porcion_g) : 0);
      const grasaRestante = Math.max(0, grasaComida - grasaImplicita);
      if (grasa && grasaRestante > 3) items.push({ ...grasa, porcion_g: calcularPorcion(grasa, grasaRestante, 'grasas'), nota: 'Grasas saludables' });
    }
    else if (nombreComida === 'Cena') {
      const prot    = elegirAlimento('proteina', offset, true, 'cena');
      const carb    = elegirAlimento('carbohidrato', offset+1, true, 'cena');
      const verdura = elegirAlimento('verdura', offset+2, true, 'cena');
      const grasa   = elegirAlimento('grasa', offset+3, true, 'cena');
      if (prot)    items.push({ ...prot,    porcion_g: calcularPorcion(prot, protComida, 'proteina'), nota: 'Alta proteína nocturna' });
      if (carb)    items.push({ ...carb,    porcion_g: calcularPorcion(carb, carbsComida * 0.6, 'carbohidratos'), nota: 'Carbs moderados' });
      if (verdura) items.push({ ...verdura, porcion_g: 100, nota: 'Fibra y vitaminas' });
      if (grasa)   items.push({ ...grasa,   porcion_g: calcularPorcion(grasa, grasaComida, 'grasas'), nota: 'Grasa nocturna' });
    }
    else if (nombreComida.includes('Snack')) {
      // Snack: máximo 2 items. Primero algo natural (fruta o snack ligero), luego proteína si se requiere
      const principal = elegirAlimento('fruta', offset, true, 'snack') || elegirAlimento('snack', offset, true, 'snack');
      if (principal) items.push({ ...principal, porcion_g: principal.variante.porcion_g, nota: 'Snack principal' });
      // Agregar proteina siempre que el objetivo lo requiera
      if (protComida > 5) {
        const catPrincipal = principal ? principal.categoria : null;
        // Priorizar snack ligero (yogur, galleta, maní) sobre proteína pesada
        const protSnack = elegirAlimento('snack', offset+1, true, 'snack') || 
                          (catPrincipal !== 'proteina' ? elegirAlimento('proteina', offset+1, true, 'snack') : null);
        if (protSnack) items.push({ ...protSnack, porcion_g: calcularPorcion(protSnack, protComida * 0.8, 'proteina'), nota: 'Complemento proteína' });
      }
    }
    else if (nombreComida === 'Pre entreno') {
      const carb = elegirAlimento('carbohidrato', offset, true, 'pre_entreno');
      const prot = elegirAlimento('proteina', offset+1, true, 'pre_entreno');
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
        nota: item.nota,
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

module.exports = { generarPlanAlimentario };

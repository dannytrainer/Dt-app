// ============================================================
// generar_plan.js — Generador automático de plan alimentario
// Versión 2.0 — Lógica limpia por macro exacto
// ============================================================

const fs   = require('fs');
const path = require('path');

function generarPlanAlimentario(idCliente, dataDir, diaOffset) {
  dataDir = dataDir || path.join(__dirname, 'data');

  // ── 1. Cargar datos ──────────────────────────────────────
  const usuarios     = JSON.parse(fs.readFileSync(path.join(dataDir, 'usuarios.json'),     'utf8'));
  const alimentacion = JSON.parse(fs.readFileSync(path.join(dataDir, 'alimentacion.json'), 'utf8'));
  const alimentos    = JSON.parse(fs.readFileSync(path.join(dataDir, 'alimentos.json'),    'utf8'));

  const usuario = usuarios.find(u => u.id == idCliente || u.telefono == idCliente);
  if (!usuario) throw new Error('Cliente no encontrado');

  const config = alimentacion[idCliente] || alimentacion[usuario.telefono];
  if (!config) throw new Error('Sin configuración de alimentación');

  const perfil = usuario.perfil || {};
  const sexo   = (perfil.sexo || 'M').toUpperCase();
  const edad   = parseInt(perfil.edad) || 30;

  // ── 2. Calcular macros totales ───────────────────────────
  const pesoObj = parseFloat(config.peso_objetivo);

  // Ajuste automático proteína vegana/vegetariana
  const esVegano      = (config.vida || []).some(v => v === 'Vegano');
  const esVegetariano = (config.vida || []).some(v => v === 'Vegetariano');
  const limProt       = esVegano ? 1.4 : esVegetariano ? 1.6 : null;
  const protXkg       = limProt ? Math.min(parseFloat(config.proteina), limProt) : parseFloat(config.proteina);

  const totalProt  = Math.round(protXkg       * pesoObj);
  const totalCarbs = Math.round(parseFloat(config.carbos)  * pesoObj);
  const totalGrasa = Math.round(parseFloat(config.grasas)  * pesoObj);
  const totalKcal  = Math.round((totalProt * 4) + (totalCarbs * 4) + (totalGrasa * 9));

  // ── 3. Definir comidas del día ───────────────────────────
  let numComidas = Math.min(5, Math.max(3, parseInt(config.comidas) || 3));

  const ordenComidas = ['Desayuno', 'Snack 1', 'Almuerzo', 'Snack 2', 'Pre entreno', 'Cena'];
  const comidasBase  = ['Desayuno', 'Almuerzo', 'Cena'];
  const extras       = ['Snack 1', 'Snack 2', 'Pre entreno'];

  let comidasDia = [...comidasBase];
  if (numComidas <= 2) comidasDia = comidasBase.slice(0, numComidas);
  else if (numComidas === 1) comidasDia = ['Almuerzo'];
  else {
    for (let i = 0; i < numComidas - 3 && i < extras.length; i++) {
      if (extras[i] === 'Pre entreno' && !config.pretreno) continue;
      comidasDia.push(extras[i]);
    }
  }
  comidasDia.sort((a, b) => ordenComidas.indexOf(a) - ordenComidas.indexOf(b));

  const n = comidasDia.length;

  // ── 4. Distribuir macros por comida ──────────────────────
  // Porcentajes fijos por tipo de comida, normalizados según comidas activas
  const pctBase = {
    'Desayuno':    { prot: 0.22, carbs: 0.28, grasa: 0.22 },
    'Almuerzo':    { prot: 0.30, carbs: 0.35, grasa: 0.28 },
    'Cena':        { prot: 0.32, carbs: 0.22, grasa: 0.30 },
    'Snack 1':     { prot: 0.10, carbs: 0.10, grasa: 0.10 },
    'Snack 2':     { prot: 0.06, carbs: 0.08, grasa: 0.10 },
    'Pre entreno': { prot: 0.08, carbs: 0.12, grasa: 0.05 },
  };

  const sumP = comidasDia.reduce((s, c) => s + (pctBase[c]?.prot  || 0.08), 0);
  const sumC = comidasDia.reduce((s, c) => s + (pctBase[c]?.carbs || 0.10), 0);
  const sumG = comidasDia.reduce((s, c) => s + (pctBase[c]?.grasa || 0.08), 0);

  const distProt  = comidasDia.map(c => Math.round(totalProt  * (pctBase[c]?.prot  || 0.08) / sumP));
  const distCarbs = comidasDia.map(c => Math.round(totalCarbs * (pctBase[c]?.carbs || 0.10) / sumC));
  const distGrasa = comidasDia.map(c => Math.round(totalGrasa * (pctBase[c]?.grasa || 0.08) / sumG));

  // Corregir redondeo — ajustar última comida principal
  const ajustarDist = (dist, total) => {
    const suma = dist.reduce((a, b) => a + b, 0);
    const diff = total - suma;
    // Ajustar en almuerzo si existe, sino en el último
    const idxAlm = comidasDia.indexOf('Almuerzo');
    const idx = idxAlm >= 0 ? idxAlm : dist.length - 1;
    dist[idx] += diff;
    return dist;
  };
  ajustarDist(distProt,  totalProt);
  ajustarDist(distCarbs, totalCarbs);
  ajustarDist(distGrasa, totalGrasa);

  // ── 5. Filtrar alimentos disponibles ─────────────────────
  const nivelEco        = (parseInt(config.nivel_eco) || 1) - 1;
  const nivelesPermitidos = ['economico', 'medio', 'premium'].slice(0, nivelEco + 1);
  const medico   = config.medico   || [];
  const vida     = config.vida     || [];
  const alergias = config.alergias || [];
  const todosLosFiltros = [...medico, ...vida, ...alergias];

  const exclusiones = {
    'diabetes':             a => a.indice_glucemico > 70,
    'hipertension':         a => a.sodio > 400,
    'acido_urico':          a => a.purinas > 150 || ['higado','sardina','camaron'].some(x => (a._id||'').includes(x)),
    'gota':                 a => a.purinas > 150 || ['higado','sardina','camaron'].some(x => (a._id||'').includes(x)),
    'enfermedad_renal':     a => a.proteina > 20 || a.potasio > 300,
    'hipotiroidismo':       a => (a._id||'').includes('soya'),
    'gastritis':            a => ['cafe','alcohol','pimienta','aji'].some(x => (a._id||'').includes(x)),
    'colesterol_alto':      a => a.grasas_saturadas > 5,
    'colon_irritable':      a => ['leche','gluten','pan','pasta','repollo','brocoli','coliflor','cebolla'].some(x => (a._id||'').includes(x)),
    'higado_graso':         a => a.grasas > 20,
    'resistencia_insulina': a => a.indice_glucemico > 60,
    'vegano':               a => a.es_animal === true || a.es_lacteo === true,
    'vegetariano':          a => a.es_animal === true && !a.es_huevo && !a.es_lacteo,
    'keto':                 a => a.carbohidratos > 10,
    'low_carb':             a => a.carbohidratos > 20,
    'sin_gluten':           a => ['pan','pasta','avena'].some(t => (a._id||'').includes(t)),
    'sin_lactosa':          a => a._cat === 'lacteo',
    'sin_cerdo':            a => (a._id||'').includes('cerdo'),
    'alergia_huevo':        a => (a._id||'').includes('huevo'),
    'alergia_soya':         a => (a._id||'').includes('soya'),
    'alergia_mariscos':     a => ['camaron','langostino','pulpo'].some(t => (a._id||'').includes(t)),
    'alergia_frutos_secos': a => ['almendras','nueces','mani'].some(t => (a._id||'').includes(t)),
  };

  const esVegVeg = esVegano || esVegetariano;

  function permitido(al, variante) {
    if (!nivelesPermitidos.includes(al.nivel)) return false;
    if (al.solo_vegano && !esVegVeg) return false;
    const ctx = {
      ...variante,
      _id:       al.id,
      _cat:      al.categoria,
      es_animal: al.es_animal  || false,
      es_huevo:  al.es_huevo   || false,
      es_lacteo: al.es_lacteo  || false,
    };
    for (const f of todosLosFiltros) {
      const clave = f.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[ /]/g, '_');
      if (exclusiones[clave] && exclusiones[clave](ctx)) return false;
    }
    return true;
  }

  // Aplanar alimentos con variantes
  const pool = [];
  for (const al of alimentos) {
    for (const v of al.variantes) {
      if (permitido(al, v)) {
        pool.push({ ...al, variante: v, varId: `${al.id}__${v.preparacion}` });
      }
    }
  }

  // Agrupar por categoría y subcategoría
  const porCat = {};
  const porSub = {};
  for (const a of pool) {
    const cat = a.categoria;
    const sub = a.subcategoria || cat;
    if (!porCat[cat]) porCat[cat] = [];
    if (!porSub[sub]) porSub[sub] = [];
    porCat[cat].push(a);
    porSub[sub].push(a);
  }

  // ── 6. Seed determinística ───────────────────────────────
  const hoy     = new Date();
  const diaAnio = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 86400000);
  const seedBase = idCliente.toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const seed     = (seedBase * 31 + diaAnio * 7 + (diaOffset || 0) * 97) % 9999991;

  function elegir(arr, offset) {
    if (!arr || arr.length === 0) return null;
    const sorted = arr.slice().sort((a, b) => (b.prioridad || 5) - (a.prioridad || 5));
    const top    = sorted.slice(0, Math.min(8, sorted.length));
    return top[((seed * 13) + offset * 29) % top.length];
  }

  function elegirSin(arr, excluirIds, offset) {
    const filtrado = (arr || []).filter(a => !excluirIds.has(a.id));
    return elegir(filtrado.length > 0 ? filtrado : arr, offset);
  }

  // ── 7. Calcular porción exacta por regla de tres ─────────
  // Límites máximos REALES (no artificiales)
  const LIMITES = {
    proteina:    { max: 250, min: 25 },
    carbohidrato:{ max: 300, min: 30 },
    grasa:       { max: 40,  min: 5  },
    fruta:       { max: 250, min: 60 },
    verdura:     { max: 200, min: 50 },
    lacteo:      { max: 300, min: 30 },
    legumbre:    { max: 300, min: 50 },
  };

  function porcionExacta(alimento, macroObjetivo, macroTipo) {
    const v           = alimento.variante;
    const macroPor100 = v[macroTipo];
    if (!macroPor100 || macroPor100 === 0) return v.porcion_g;

    // Regla de tres pura
    let porcion = Math.round((macroObjetivo / macroPor100) * v.porcion_g);

    // Respetar porcion_maxima específica del alimento (límite nutricional real)
    if (alimento.porcion_maxima && porcion > alimento.porcion_maxima) {
      porcion = alimento.porcion_maxima;
    }

    // Límites por categoría
    const lim = LIMITES[alimento.categoria] || { max: 300, min: 20 };
    if (porcion > lim.max) porcion = lim.max;
    if (porcion < lim.min) porcion = lim.min;

    return porcion;
  }

  // Cuánto macro aporta un alimento a una porción dada
  function macroReal(alimento, porcion_g, tipo) {
    return (alimento.variante[tipo] / alimento.variante.porcion_g) * porcion_g;
  }

  // ── 8. Generar comidas ───────────────────────────────────
  const usadosProtPrincipal = new Set(); // Solo para evitar repetir proteína principal
  const planComidas = [];

  comidasDia.forEach((nombreComida, i) => {
    const protObj  = distProt[i];
    const carbsObj = distCarbs[i];
    const grasaObj = distGrasa[i];
    const kcalObj  = Math.round(protObj * 4 + carbsObj * 4 + grasaObj * 9);
    const off      = i * 20;
    const items    = [];

    // ── Función para agregar proteína hasta cubrir objetivo ──
    function cubrirProteina(objetivo, esSnack) {
      let restante = objetivo;
      let intentos = 0;

      // Pool proteína según comida
      const poolProt = esSnack
        ? [...(porSub['proteina_complemento'] || []), ...(porCat['lacteo'] || [])]
        : [
            ...(porSub['proteina_principal'] || []),
            ...(esVegVeg ? (porCat['legumbre'] || []).filter(a => a.es_proteina_vegana) : [])
          ];

      const umbral = Math.max(8, objetivo * 0.15);
      while (restante > umbral && intentos < 3) {
        const disponibles = poolProt.filter(a =>
          intentos === 0
            ? !usadosProtPrincipal.has(a.id)
            : true
        );
        const elegido = elegirSin(disponibles, usadosProtPrincipal, off + intentos * 7);
        if (!elegido) break;

        const porcion = porcionExacta(elegido, restante, 'proteina');
        const aporte  = macroReal(elegido, porcion, 'proteina');

        items.push({ ...elegido, porcion_g: porcion, nota: intentos === 0 ? 'Proteína principal' : 'Complemento proteína' });
        if (!esSnack) usadosProtPrincipal.add(elegido.id);
        restante -= aporte;
        intentos++;
      }

      // Si aún falta mucho y hay whey disponible, completar
      if (restante > 10) {
        const whey = (porSub['proteina_complemento'] || []).find(a => a.id === 'proteina_whey' || a.id === 'proteina_vegana_polvo');
        if (whey) {
          const porcion = porcionExacta(whey, restante, 'proteina');
          items.push({ ...whey, porcion_g: porcion, nota: 'Complemento proteína' });
        }
      }
    }

    // ── Función para agregar carbos hasta cubrir objetivo ──
    function cubrirCarbos(objetivo, subcats) {
      let restante = objetivo;
      let intentos = 0;

      while (restante > 8 && intentos < 2) {
        const poolCarb = subcats.flatMap(s => porSub[s] || []).filter(a =>
          !items.some(it => it.id === a.id)
        );
        const elegido = elegir(poolCarb, off + 50 + intentos * 11);
        if (!elegido) break;

        const porcion = porcionExacta(elegido, restante, 'carbohidratos');
        const aporte  = macroReal(elegido, porcion, 'carbohidratos');
        items.push({ ...elegido, porcion_g: porcion, nota: 'Energía' });
        restante -= aporte;
        intentos++;
      }
    }

    // ── Función para completar grasa ──
    function cubrirGrasa(objetivo) {
      // Calcular grasa ya aportada por proteínas y carbos
      const grasaYa = items.reduce((s, it) => s + macroReal(it, it.porcion_g, 'grasas'), 0);
      const restante = objetivo - grasaYa;
      if (restante < 4) return; // Ya está cubierta

      const subcatGrasa = ['grasa_natural', 'grasa_coccion', 'grasa_snack'];
      const poolGrasa = subcatGrasa.flatMap(s => porSub[s] || []).filter(a =>
        !items.some(it => it.id === a.id)
      );
      const elegido = elegir(poolGrasa, off + 80);
      if (!elegido) return;

      const porcion = porcionExacta(elegido, restante, 'grasas');
      items.push({ ...elegido, porcion_g: porcion, nota: 'Grasa saludable' });
    }

    // ── Función para agregar verduras ──
    function agregarVerduras(cantidad) {
      const poolVerd = (porCat['verdura'] || []).filter(a =>
        !items.some(it => it.id === a.id)
      );
      const vistas = new Set();
      const seleccionadas = poolVerd
        .sort(() => ((seed * 17 + i * 31) % 7) - 3)
        .filter(v => { if (vistas.has(v.id)) return false; vistas.add(v.id); return true; })
        .slice(0, cantidad);

      if (seleccionadas.length === 0) return;
      if (seleccionadas.length > 1) {
        const nombres = seleccionadas.map(v => v.nombre).join(', ');
        items.push({ ...seleccionadas[0], porcion_g: 100, nota: 'Ensalada variada', nombre: 'Ensalada variada', _detalle: nombres });
      } else {
        items.push({ ...seleccionadas[0], porcion_g: 100, nota: 'Micronutrientes' });
      }
    }

    // ── Función para agregar frutas ──
    function agregarFrutas(cantidad) {
      const poolFruta = [...(porSub['fruta'] || []), ...(porSub['carb_rapido'] || [])].filter(a =>
        !items.some(it => it.id === a.id)
      );
      const vistas = new Set();
      const seleccionadas = poolFruta
        .filter(v => { if (vistas.has(v.id)) return false; vistas.add(v.id); return true; })
        .slice(0, cantidad);

      if (seleccionadas.length === 0) return;
      if (seleccionadas.length > 1) {
        const nombres = seleccionadas.map(v => v.nombre).join(', ');
        items.push({ ...seleccionadas[0], porcion_g: 150, nota: 'Ensalada de frutas', nombre: 'Ensalada de frutas', _detalle: nombres });
      } else {
        items.push({ ...seleccionadas[0], porcion_g: seleccionadas[0].variante.porcion_g, nota: 'Micronutrientes' });
      }
    }

    // ── Construir cada comida ─────────────────────────────

    if (nombreComida === 'Desayuno') {
      cubrirCarbos(carbsObj * 0.75, ['carb_desayuno']);
      cubrirProteina(protObj, false);
      agregarFrutas(2);
      cubrirGrasa(grasaObj);
    }

    else if (nombreComida === 'Almuerzo') {
      cubrirProteina(protObj, false);
      cubrirCarbos(carbsObj, ['carb_almuerzo']);
      agregarVerduras(3);
      cubrirGrasa(grasaObj);
    }

    else if (nombreComida === 'Cena') {
      cubrirProteina(protObj, false);
      cubrirCarbos(carbsObj * 0.7, ['carb_almuerzo']);
      agregarVerduras(2);
      cubrirGrasa(grasaObj);
    }

    else if (nombreComida === 'Snack 1' || nombreComida === 'Snack 2') {
      const usarFruta = ((seed + i) % 10) < 7; // 70% fruta, 30% ensalada
      if (usarFruta) {
        agregarFrutas(1);
      } else {
        agregarVerduras(2);
      }
      cubrirProteina(protObj, true);
      cubrirGrasa(grasaObj);
    }

    else if (nombreComida === 'Pre entreno') {
      // Carbos rápidos + proteína moderada
      cubrirCarbos(Math.min(carbsObj, 45), ['carb_rapido', 'carb_desayuno']);
      cubrirProteina(Math.min(protObj, 25), true);
    }

    // ── Calcular macros reales de la comida ──────────────
    let protReal = 0, carbsReal = 0, grasaReal = 0, kcalReal = 0;
    items.forEach(it => {
      const f = it.porcion_g / it.variante.porcion_g;
      protReal  += it.variante.proteina      * f;
      carbsReal += it.variante.carbohidratos * f;
      grasaReal += it.variante.grasas        * f;
      kcalReal  += it.variante.calorias      * f;
    });

    planComidas.push({
      nombre: nombreComida,
      macros_objetivo: { proteina: protObj, carbos: carbsObj, grasas: grasaObj, kcal: kcalObj },
      macros_reales:   { proteina: Math.round(protReal * 10) / 10, carbos: Math.round(carbsReal * 10) / 10, grasas: Math.round(grasaReal * 10) / 10, kcal: Math.round(kcalReal) },
      alimentos: items.map(item => {
        const f = item.porcion_g / item.variante.porcion_g;
        return {
          nombre:      item.nombre,
          preparacion: item.variante.preparacion,
          porcion_g:   item.porcion_g,
          categoria:   item.categoria,
          nivel:       item.nivel,
          macros: {
            proteina:      Math.round(item.variante.proteina      * f * 10) / 10,
            carbohidratos: Math.round(item.variante.carbohidratos * f * 10) / 10,
            grasas:        Math.round(item.variante.grasas        * f * 10) / 10,
            calorias:      Math.round(item.variante.calorias      * f),
          },
          nota:   item.nota,
          detalle: item._detalle || null,
          unidad: (() => {
            const uRaw = item.unidad_natural;
            if (!uRaw) return null;
            const u = typeof uRaw === 'string'
              ? { nombre: uRaw, plural: item.unidad_natural_plural || uRaw, peso_unitario: item.peso_unidad, solo_enteros: item.solo_enteros || false }
              : uRaw;
            if (!u.peso_unitario) return null;
            const cantidadExacta = item.porcion_g / u.peso_unitario;
            const cantidad = u.solo_enteros
              ? Math.max(1, Math.round(cantidadExacta))
              : Math.max(0.5, Math.round(cantidadExacta * 2) / 2);
            if (cantidad <= 0) return null;
            const nombre      = cantidad === 1 ? u.nombre : (u.plural || u.nombre);
            const parteEntera = Math.floor(cantidad);
            const media       = cantidad % 1 === 0.5;
            const esFem = ['arepa','taza','tazas','porción','porciones','tajada','tajadas','cucharada','cucharadas','galleta','galletas','lata','latas'].some(p => u.nombre.includes(p) || (u.plural || '').includes(p));
            const medioT = esFem ? 'media' : 'medio';
            const yMedioT = esFem ? 'y media' : 'y medio';
            let texto;
            if (media && parteEntera === 0) texto = medioT + ' ' + u.nombre;
            else if (media) texto = parteEntera + ' ' + (parteEntera === 1 ? u.nombre : u.plural) + ' ' + yMedioT;
            else texto = cantidad + ' ' + (cantidad === 1 ? u.nombre : u.plural);
            return { cantidad, nombre, texto: texto + ' (' + item.porcion_g + 'g)' };
          })(),
        };
      }),
    });
  });

  // ── 9. Ajuste final del día ──────────────────────────────
  // Si el error total > 10%, escalar porciones del almuerzo proporcionalmente
  const totRP = planComidas.reduce((s, c) => s + c.macros_reales.proteina, 0);
  const totRC = planComidas.reduce((s, c) => s + c.macros_reales.carbos,   0);
  const totRG = planComidas.reduce((s, c) => s + c.macros_reales.grasas,   0);

  const errP = totalProt  > 0 ? (totRP - totalProt)  / totalProt  : 0;
  const errC = totalCarbs > 0 ? (totRC - totalCarbs) / totalCarbs : 0;
  const errG = totalGrasa > 0 ? (totRG - totalGrasa) / totalGrasa : 0;

  // Escalar TODAS las comidas proporcionalmente
  const escalaP = Math.abs(errP) > 0.06 ? Math.max(0.5, Math.min(1.8, 1 / (1 + errP))) : 1;
  const escalaC = Math.abs(errC) > 0.06 ? Math.max(0.5, Math.min(1.8, 1 / (1 + errC))) : 1;
  const escalaG = Math.abs(errG) > 0.06 ? Math.max(0.5, Math.min(1.8, 1 / (1 + errG))) : 1;

  if (escalaP !== 1 || escalaC !== 1 || escalaG !== 1) {
    planComidas.forEach(comida => {
      comida.alimentos = comida.alimentos.map(item => {
        let escala = 1;
        if (item.categoria === 'proteina' || item.categoria === 'lacteo') escala = escalaP;
        else if (item.categoria === 'carbohidrato' || item.categoria === 'legumbre') escala = escalaC;
        else if (item.categoria === 'grasa') escala = escalaG;
        if (escala === 1) return item;
        const nuevaG = Math.round(item.porcion_g * escala);
        const f2 = nuevaG / (item.porcion_g || 1);
        return {
          ...item,
          porcion_g: nuevaG,
          macros: {
            proteina:      Math.round(item.macros.proteina      * f2 * 10) / 10,
            carbohidratos: Math.round(item.macros.carbohidratos * f2 * 10) / 10,
            grasas:        Math.round(item.macros.grasas        * f2 * 10) / 10,
            calorias:      Math.round(item.macros.calorias      * f2),
          },
        };
      });
    });
  }

  // ── 10. Resultado final ──────────────────────────────────
  return {
    id_cliente:    idCliente,
    nombre:        usuario.nombre,
    sexo,
    edad,
    generado:      new Date().toISOString(),
    peso_actual:   config.peso_actual,
    peso_objetivo: pesoObj,
    nivel_eco:     ['economico', 'medio', 'premium'][nivelEco] || 'economico',
    filtros_activos: todosLosFiltros,
    totales: {
      proteina:      totalProt,
      carbohidratos: totalCarbs,
      grasas:        totalGrasa,
      calorias:      totalKcal,
    },
    comidas: planComidas,
  };
}

function generarPlanSemanal(idCliente, dataDir) {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return dias.map((dia, i) => {
    const plan = generarPlanAlimentario(idCliente, dataDir, i);
    return { dia, ...plan };
  });
}

module.exports = { generarPlanAlimentario, generarPlanSemanal };

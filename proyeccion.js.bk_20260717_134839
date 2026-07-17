const { calcularEstimuloConFallback } = require('./estimulo_real');
const { proyectarCrecimiento, ESTIMULO_REFERENCIA, ESTIMULO_TECHO } = require('./proyeccion/hipertrofia');
const { evaluarSoloLectura } = require('./alertas');

const TABLAS_12M = {
  'Brazo':       { principiante: [3.0, 5.0], intermedio: [1.5, 3.0], avanzado: [0.8, 1.8] },
  'Pecho':       { principiante: [3.5, 6.0], intermedio: [1.8, 4.0], avanzado: [1.0, 2.5] },
  'Pierna':      { principiante: [4.0, 8.0], intermedio: [2.0, 5.0], avanzado: [1.0, 2.5] },
  'Pantorrilla': { principiante: [0.5, 1.5], intermedio: [0.5, 1.5], avanzado: [0.5, 1.5] },
  'Hombros':     { principiante: [3.0, 5.0], intermedio: [1.5, 3.0], avanzado: [0.8, 1.8] },
};

const MAPEO_MUSCULO_PERIMETRO = {
  'Bíceps':         { perimetro: 'Brazo', peso: 1.0 },
  'Tríceps':        { perimetro: 'Brazo', peso: 1.0 },
  'Antebrazo':      { perimetro: 'Brazo', peso: 0.2 },

  'Pecho':          { perimetro: 'Pecho', peso: 1.0 },
  'Espalda':        { perimetro: 'Pecho', peso: 0.5 },

  'Hombros':        { perimetro: 'Hombros', peso: 1.0 },

  'Cuádriceps':     { perimetro: 'Pierna', peso: 1.0 },
  'Isquiotibiales': { perimetro: 'Pierna', peso: 1.0 },
  'Glúteos':        { perimetro: 'Pierna', peso: 1.0 },
  'Aductores':      { perimetro: 'Pierna', peso: 0.5 },
  'Cadera':         { perimetro: 'Pierna', peso: 0.2 },

  'Gemelos':        { perimetro: 'Pantorrilla', peso: 1.0 },
};

const PESO_TOTAL_PERIMETRO = {};
for (const { perimetro, peso } of Object.values(MAPEO_MUSCULO_PERIMETRO)) {
  PESO_TOTAL_PERIMETRO[perimetro] = (PESO_TOTAL_PERIMETRO[perimetro] || 0) + peso;
}

// Suma el estímulo (global o efectivo) de los músculos que aportan a cada perímetro.
function agregarPorPerimetro(estimuloPorMusculo) {
  const resultado = {};
  for (const musculo of Object.keys(estimuloPorMusculo)) {
    const mapeo = MAPEO_MUSCULO_PERIMETRO[musculo];
    if (!mapeo) continue;
    const aporte = estimuloPorMusculo[musculo] * mapeo.peso;
    resultado[mapeo.perimetro] = (resultado[mapeo.perimetro] || 0) + aporte;
  }
  return resultado;
}

function proyectarCliente(clienteId, nivel, semanasProyeccion, semanasHistorial, factorSexo = 1.0) {
  const { estimuloGlobal, estimuloEfectivo, fuente } = calcularEstimuloConFallback(clienteId);
  const musculos = {};

  // Alertas de sobrecarga: usan GLOBAL (miden fatiga/carga articular total, no si fue "efectiva").
  for (const musculo of Object.keys(estimuloGlobal)) {
    const sobrecarga = evaluarSoloLectura(clienteId, musculo, estimuloGlobal[musculo], nivel);
    musculos[musculo] = {
      estimuloGlobal: estimuloGlobal[musculo],
      estimuloEfectivo: estimuloEfectivo[musculo] || 0,
      sobrecarga,
    };
  }

  const perimetroGlobal = agregarPorPerimetro(estimuloGlobal);
  const perimetroEfectivo = agregarPorPerimetro(estimuloEfectivo);

  const perimetros = {};
  for (const perimetro of Object.keys(perimetroGlobal)) {
    const tabla = TABLAS_12M[perimetro];
    if (!tabla) {
      perimetros[perimetro] = { estimulo: perimetroGlobal[perimetro], proyeccion: 'TODO: falta tabla en TABLAS_12M' };
      continue;
    }

    // Proyección de cm usa EFECTIVO (predice hipertrofia real). Si no hay dato efectivo
    // (ej. estímulo real por chat, sin RIR por serie), usa GLOBAL como aproximación y lo marca.
    const tieneEfectivo = (perimetroEfectivo[perimetro] || 0) > 0;
    const estimuloParaProyeccion = tieneEfectivo ? perimetroEfectivo[perimetro] : perimetroGlobal[perimetro];

    const pesoTotal = PESO_TOTAL_PERIMETRO[perimetro] || 1;
    const estimuloReferencia = ESTIMULO_REFERENCIA * pesoTotal;
    const estimuloTecho = ESTIMULO_TECHO * pesoTotal;

    // Alto rendimiento no tiene tabla de cm propia (no hay literatura de que el techo genético
    // sea distinto) — usa la tabla de "avanzado" como base. Lo único que cambia con alto
    // rendimiento es el cap de escala (ver hipertrofia.js), no la ganancia máxima en cm.
    const nivelTabla = nivel === 'alto_rendimiento' ? 'avanzado' : nivel;
    const [tablaMin12m, tablaMax12m] = tabla[nivelTabla];
    const proy = proyectarCrecimiento({
      estimuloReal: estimuloParaProyeccion,
      tablaMin12m, tablaMax12m,
      semanasTranscurridas: semanasProyeccion,
      nivel, semanasHistorial,
      estimuloReferencia, estimuloTecho,
      factorSexo,
    });

    perimetros[perimetro] = {
      estimuloGlobal: perimetroGlobal[perimetro],
      estimuloEfectivo: perimetroEfectivo[perimetro] || 0,
      proyeccionAproximada: !tieneEfectivo, // true = se usó global porque no había dato efectivo (RIR)
      proyeccion: proy,
    };
  }

  return { musculos, perimetros, fuenteEstimulo: fuente };
}

module.exports = { proyectarCliente, TABLAS_12M, MAPEO_MUSCULO_PERIMETRO };

if (require.main === module) {
  const id = process.argv[2] || 'cli_1778377049231';
  const nivel = process.argv[3] || 'intermedio';
  const r = proyectarCliente(id, nivel, 13, 6);
  console.log(JSON.stringify(r, null, 2));
}

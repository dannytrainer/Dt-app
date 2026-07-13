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

// Suma de pesos por perímetro → referencia y techo local para calcularEscala.
// Ej: Pierna suma 5 músculos (peso total 3.7) → su referencia es 3.7x más alta que la de un músculo solo.
const PESO_TOTAL_PERIMETRO = {};
for (const { perimetro, peso } of Object.values(MAPEO_MUSCULO_PERIMETRO)) {
  PESO_TOTAL_PERIMETRO[perimetro] = (PESO_TOTAL_PERIMETRO[perimetro] || 0) + peso;
}

function proyectarCliente(clienteId, nivel, semanasProyeccion, semanasHistorial, factorSexo = 1.0) {
  const { estimulo, fuente } = calcularEstimuloConFallback(clienteId);
  const musculos = {};
  const estimuloPerimetro = {};

  for (const musculo of Object.keys(estimulo)) {
    const sobrecarga = evaluarSoloLectura(clienteId, musculo, estimulo[musculo]);
    musculos[musculo] = { estimulo: estimulo[musculo], sobrecarga };

    const mapeo = MAPEO_MUSCULO_PERIMETRO[musculo];
    if (!mapeo) continue;
    const aporte = estimulo[musculo] * mapeo.peso;
    estimuloPerimetro[mapeo.perimetro] = (estimuloPerimetro[mapeo.perimetro] || 0) + aporte;
  }

  const perimetros = {};
  for (const perimetro of Object.keys(estimuloPerimetro)) {
    const tabla = TABLAS_12M[perimetro];
    if (!tabla) {
      perimetros[perimetro] = { estimulo: estimuloPerimetro[perimetro], proyeccion: 'TODO: falta tabla en TABLAS_12M' };
      continue;
    }
    const pesoTotal = PESO_TOTAL_PERIMETRO[perimetro] || 1;
    const estimuloReferencia = ESTIMULO_REFERENCIA * pesoTotal;
    const estimuloTecho = ESTIMULO_TECHO * pesoTotal;

    const [tablaMin12m, tablaMax12m] = tabla[nivel];
    const proy = proyectarCrecimiento({
      estimuloReal: estimuloPerimetro[perimetro],
      tablaMin12m, tablaMax12m,
      semanasTranscurridas: semanasProyeccion,
      nivel, semanasHistorial,
      estimuloReferencia, estimuloTecho,
      factorSexo,
    });
    perimetros[perimetro] = { estimulo: estimuloPerimetro[perimetro], proyeccion: proy };
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

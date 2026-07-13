/**
 * DT-APP — Módulo de Proyección: Hipertrofia
 * Lógica resuelta para los 3 problemas del estadístico + alerta de sobrecarga.
 * Fuente: Pelland et al. (2024), meta-regresión volumen→hipertrofia.
 */

// ── Constantes ──────────────────────────────────────────────
const ESTIMULO_REFERENCIA = 15;          // series efectivas/semana, punto medio zona óptima (10-20), por MÚSCULO individual
const ESTIMULO_TECHO = 20;               // techo de zona óptima, por MÚSCULO individual
const TAU_SEMANAS = {                    // constante de saturación temporal por nivel
  principiante: 52,
  intermedio: 26,
  avanzado: 13,
};

// ── PROBLEMA 1: escala estímulo → cm (raíz cuadrada, no lineal) ──
// El ratio estimulo/referencia se cap-ea en (techo/referencia), NO en un múltiplo fijo (1.5x).
// Así, pasar el techo de zona óptima deja de dar más escala — se aplana, en vez de seguir premiando el exceso.
// Para perímetros que agregan varios músculos, pasa estimuloReferencia y estimuloTecho ya escalados
// (ej: referencia_perimetro = 15 × suma_pesos_musculos_del_perimetro).
function calcularEscala(estimuloReal, estimuloReferencia = ESTIMULO_REFERENCIA, estimuloTecho = ESTIMULO_TECHO) {
  if (estimuloReal <= 0) return 0;
  const techoRatio = estimuloTecho / estimuloReferencia;
  const ratio = Math.min(estimuloReal / estimuloReferencia, techoRatio);
  return Math.sqrt(ratio);
}

// ── PROBLEMA 2: curva temporal (saturación exponencial, no logarítmica) ──
// ganancia(t) = ganancia_12m_tabla × (1 − e^(−t/τ)) / (1 − e^(−52/τ))
function calcularGananciaEnTiempo(ganancia12mTabla, semanasTranscurridas, nivel) {
  const tau = TAU_SEMANAS[nivel];
  if (!tau) throw new Error(`Nivel inválido: ${nivel}. Usa 'principiante' | 'intermedio' | 'avanzado'.`);
  const numerador = 1 - Math.exp(-semanasTranscurridas / tau);
  const denominador = 1 - Math.exp(-52 / tau);
  return ganancia12mTabla * (numerador / denominador);
}

// ── PROBLEMA 3: rango estimado (no "intervalo de confianza") ──
// factor_incertidumbre usa 1/√n, no 1/n (así se comporta el error estándar real)
function calcularRangoEstimado({ cmMin, cmMax, semanasHistorial, mesesProyeccion }) {
  const factorIncertidumbre = 1 + 1 / Math.sqrt(Math.max(semanasHistorial, 1));
  const factorTiempo = 1 + mesesProyeccion / 24;

  const centro = (cmMin + cmMax) / 2;
  const semirango = ((cmMax - cmMin) / 2) * factorIncertidumbre * factorTiempo;

  return {
    cmMinFinal: +(centro - semirango).toFixed(2),
    cmMaxFinal: +(centro + semirango).toFixed(2),
    factorIncertidumbre: +factorIncertidumbre.toFixed(3),
    factorTiempo: +factorTiempo.toFixed(3),
  };
}

// ── Pipeline completo: de estímulo semanal a rango final proyectado ──
function proyectarCrecimiento({
  estimuloReal,          // series efectivas × coeficiente, semanal
  tablaMin12m,           // cm mínimo a 12 meses (tabla del nivel/perímetro)
  tablaMax12m,           // cm máximo a 12 meses
  semanasTranscurridas,  // horizonte de la proyección, en semanas
  nivel,                 // 'principiante' | 'intermedio' | 'avanzado'
  semanasHistorial,      // semanas de datos reales del usuario
  estimuloReferencia = ESTIMULO_REFERENCIA,  // referencia local (escala si es multi-músculo)
  estimuloTecho = ESTIMULO_TECHO,            // techo local (escala igual que la referencia)
  factorSexo = 1.0,      // 0.6 para mujeres (Excel: tablas calibradas para hombres, mujeres ganan al 50-70% de esa tasa)
}) {
  const escala = calcularEscala(estimuloReal, estimuloReferencia, estimuloTecho);
  const gananciaMin = calcularGananciaEnTiempo(tablaMin12m * escala * factorSexo, semanasTranscurridas, nivel);
  const gananciaMax = calcularGananciaEnTiempo(tablaMax12m * escala * factorSexo, semanasTranscurridas, nivel);

  const mesesProyeccion = +(semanasTranscurridas / 4.345).toFixed(1);
  const rango = calcularRangoEstimado({
    cmMin: gananciaMin,
    cmMax: gananciaMax,
    semanasHistorial,
    mesesProyeccion,
  });

  return { escala: +escala.toFixed(3), gananciaMin: +gananciaMin.toFixed(2), gananciaMax: +gananciaMax.toFixed(2), ...rango };
}

// ── Alerta de sobrecarga muscular (al entrenador) — SIN CAMBIOS, sigue por músculo individual ──
function evaluarSobrecarga(estimuloEfectivoSemanal, historialSemanasSobreUmbral = 0) {
  const indiceEficiencia = +(estimuloEfectivoSemanal / ESTIMULO_TECHO).toFixed(2);
  const sobreUmbral = indiceEficiencia > 1.0;
  const semanasConsecutivas = sobreUmbral ? historialSemanasSobreUmbral + 1 : 0;
  const alerta = semanasConsecutivas >= 2;

  return {
    indiceEficiencia,
    semanasConsecutivas,
    alerta,
    mensaje: alerta
      ? `Recibe ${estimuloEfectivoSemanal} pts/semana, ${Math.round((indiceEficiencia - 1) * 100)}% sobre el techo de zona óptima. Las ganancias adicionales son marginales — considera redistribuir series a un músculo con menor estímulo relativo.`
      : null,
  };
}

module.exports = {
  ESTIMULO_REFERENCIA, ESTIMULO_TECHO, TAU_SEMANAS,
  calcularEscala, calcularGananciaEnTiempo, calcularRangoEstimado,
  proyectarCrecimiento, evaluarSobrecarga,
};

// ── Demo: correr con `node hipertrofia.js` para verificar ──
if (require.main === module) {
  console.log('— Ejemplo: brazo, intermedio, 3 meses —');
  console.log(proyectarCrecimiento({
    estimuloReal: 27,
    tablaMin12m: 1.5,
    tablaMax12m: 3.0,
    semanasTranscurridas: 13,
    nivel: 'intermedio',
    semanasHistorial: 6,
  }));

  console.log('\n— Ejemplo: alerta de sobrecarga —');
  console.log(evaluarSobrecarga(26.4, 1));
}

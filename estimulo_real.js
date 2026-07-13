const fs = require('fs');
const path = require('path');
const { canonico } = require('./normalizar_musculos');
const { buscarEjercicio, partirCombo, COEF_PRINCIPAL, COEF_SECUNDARIO } = require('./estimulo');
const { extraerReportesCliente } = require('./parsear_reportes');

const DIAS_VENTANA = 7; // solo reportes de los últimos 7 días cuentan como "estímulo real de esta semana"

// Calcula estímulo semanal REAL (series efectivamente ejecutadas, desde reportes de chat)
// en vez de PLANEADO (rutinas.json). Usa exactamente el mismo matching y coeficientes que estimulo.js.
// NOTA: los reportes de chat no capturan RIR por serie individual, así que — por regla explícita
// del entrenador — todo el estímulo real va a GLOBAL. EFECTIVO queda vacío para esta fuente,
// hasta que se rediseñe qué reporta el cliente en el chat.
function calcularEstimuloRealSemanal(clienteId, fechaReferencia = new Date()) {
  const enciclopedia = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/enciclopedia.json'), 'utf8'));
  const reportes = extraerReportesCliente(clienteId);

  const limite = new Date(fechaReferencia);
  limite.setDate(limite.getDate() - DIAS_VENTANA);

  const reportesVentana = reportes.filter(r => {
    if (!r.fecha) return false;
    const fechaReporte = new Date(r.fecha);
    return fechaReporte >= limite && fechaReporte <= fechaReferencia;
  });

  const estimuloGlobal = {};
  const noEncontrados = [];

  for (const reporte of reportesVentana) {
    for (const ej of reporte.porEjercicio || []) {
      const partes = partirCombo(ej.nombre);
      const seriesHechas = ej.seriesHechas || 0;
      if (seriesHechas <= 0) continue;

      // Si el ejercicio es combinado ("A + B"), reparte las series hechas entre las partes
      // (misma serie física cuenta para ambos músculos, no se duplica el conteo).
      for (const parte of partes) {
        const match = buscarEjercicio(parte, enciclopedia);
        if (!match) { noEncontrados.push(parte); continue; }

        (match.musculos_principales || []).forEach((m, i) => {
          const nombre = canonico(m);
          const coef = COEF_PRINCIPAL[i] || 0.5;
          estimuloGlobal[nombre] = (estimuloGlobal[nombre] || 0) + seriesHechas * coef;
        });
        (match.musculos_secundarios || []).forEach((m, i) => {
          const nombre = canonico(m);
          const coef = COEF_SECUNDARIO[i] || 0.05;
          estimuloGlobal[nombre] = (estimuloGlobal[nombre] || 0) + seriesHechas * coef;
        });
      }
    }
  }

  Object.keys(estimuloGlobal).forEach(m => estimuloGlobal[m] = +estimuloGlobal[m].toFixed(1));
  return {
    estimuloGlobal,
    estimuloEfectivo: {}, // sin dato de RIR en reportes de chat — ver nota arriba
    noEncontrados: [...new Set(noEncontrados)],
    reportesUsados: reportesVentana.length,
    tieneDatosReales: reportesVentana.length > 0,
  };
}

// Cuenta semanas DISTINTAS (histórico completo, no solo últimos 7 días) con al menos
// un reporte de chat — usado como evidencia real de cuánto historial de adherencia hay,
// en vez de asumir que toda la antigüedad del cliente (fecha_inicio) es evidencia confiable.
function calcularSemanasHistorialReal(clienteId) {
  const reportes = extraerReportesCliente(clienteId);
  const semanas = new Set();
  reportes.forEach(r => {
    if (!r.fecha) return;
    const d = new Date(r.fecha);
    if (isNaN(d)) return;
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const semana = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
    semanas.add(d.getFullYear() + '-W' + semana);
  });
  return semanas.size;
}

// Punto único de entrada para proyeccion.js: usa estímulo REAL si hay reportes en los
// últimos 7 días; si no, cae a PLANEADO (rutinas.json — que sí trae estimuloEfectivo por RIR).
function calcularEstimuloConFallback(clienteId, fechaReferencia = new Date()) {
  const { calcularEstimuloSemanal } = require('./estimulo');
  const real = calcularEstimuloRealSemanal(clienteId, fechaReferencia);
  if (real.tieneDatosReales) {
    const semanasHistorialReal = calcularSemanasHistorialReal(clienteId);
    return { ...real, fuente: 'real', semanasHistorialReal };
  }
  const planeado = calcularEstimuloSemanal(clienteId);
  return { ...planeado, reportesUsados: 0, tieneDatosReales: false, fuente: 'planeado' };
}

module.exports = { calcularEstimuloRealSemanal, calcularEstimuloConFallback, calcularSemanasHistorialReal };

if (require.main === module) {
  const id = process.argv[2] || 'cli_1778377049231';
  const real = calcularEstimuloRealSemanal(id);
  console.log('— Solo REAL (últimos 7 días) —');
  console.log('Reportes usados:', real.reportesUsados);
  console.log('Estímulo GLOBAL:', real.estimuloGlobal);
  console.log('Estímulo EFECTIVO:', real.estimuloEfectivo, '(vacío: sin RIR en reportes de chat)');
  console.log('No encontrados:', real.noEncontrados);

  console.log('\n— Con FALLBACK —');
  const conFallback = calcularEstimuloConFallback(id);
  console.log('Fuente usada:', conFallback.fuente);
  console.log('Estímulo GLOBAL:', conFallback.estimuloGlobal);
  console.log('Estímulo EFECTIVO:', conFallback.estimuloEfectivo);
}

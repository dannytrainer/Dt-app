function calcularPorcentajeGrasa(pliegues, sexo, edad) {
  const { triceps, subescapular, abdominal, suprailiaco } = pliegues;
  if (!triceps || !subescapular || !abdominal || !suprailiaco) return null;
  const suma = parseFloat(triceps) + parseFloat(subescapular) + parseFloat(abdominal) + parseFloat(suprailiaco);
  const logSuma = Math.log10(suma);
  const e = parseFloat(edad) || 25;
  let densidad;
  if (sexo === 'M') {
    if (e < 17)      densidad = 1.1533 - (0.0643 * logSuma);
    else if (e < 20) densidad = 1.1620 - (0.0630 * logSuma);
    else if (e < 30) densidad = 1.1631 - (0.0632 * logSuma);
    else if (e < 40) densidad = 1.1422 - (0.0544 * logSuma);
    else if (e < 50) densidad = 1.1620 - (0.0700 * logSuma);
    else             densidad = 1.1715 - (0.0779 * logSuma);
  } else {
    if (e < 17)      densidad = 1.1369 - (0.0598 * logSuma);
    else if (e < 20) densidad = 1.1549 - (0.0678 * logSuma);
    else if (e < 30) densidad = 1.1599 - (0.0717 * logSuma);
    else if (e < 40) densidad = 1.1423 - (0.0632 * logSuma);
    else if (e < 50) densidad = 1.1333 - (0.0612 * logSuma);
    else             densidad = 1.1339 - (0.0645 * logSuma);
  }
  const pctGrasa = ((4.95 / densidad) - 4.50) * 100;
  return Math.round(pctGrasa * 10) / 10;
}

function calcularProporciones(medidas) {
  const { cintura, cadera, pecho, brazo, hombros, pierna } = medidas;
  const resultado = {};
  if (hombros && cintura) {
    const ratio = (parseFloat(hombros) / parseFloat(cintura)).toFixed(2);
    resultado.hombros_cintura = { valor: ratio, estado: ratio >= 1.4 ? 'Ideal' : ratio >= 1.2 ? 'Bueno' : 'Mejorar', nivel: ratio >= 1.4 ? 'ok' : ratio >= 1.2 ? 'warn' : 'danger' };
  }
  if (pecho && cintura) {
    const ratio = (parseFloat(pecho) / parseFloat(cintura)).toFixed(2);
    resultado.pecho_cintura = { valor: ratio, estado: ratio >= 1.2 ? 'Ideal' : ratio >= 1.0 ? 'Bueno' : 'Mejorar', nivel: ratio >= 1.2 ? 'ok' : ratio >= 1.0 ? 'warn' : 'danger' };
  }
  if (brazo && cintura) {
    const ratio = (parseFloat(brazo) / parseFloat(cintura)).toFixed(2);
    resultado.brazo_cintura = { valor: ratio, estado: ratio >= 0.5 ? 'Ideal' : ratio >= 0.4 ? 'Bueno' : 'Mejorar', nivel: ratio >= 0.5 ? 'ok' : ratio >= 0.4 ? 'warn' : 'danger' };
  }
  return resultado;
}

function calcularSaludMetabolica(medidas, altura) {
  const { cintura, cadera } = medidas;
  const resultado = {};
  if (cintura && cadera) {
    const icc = (parseFloat(cintura) / parseFloat(cadera)).toFixed(2);
    resultado.icc = { valor: icc, estado: icc <= 0.85 ? 'Normal' : icc <= 0.95 ? 'Riesgo moderado' : 'Riesgo alto', nivel: icc <= 0.85 ? 'ok' : icc <= 0.95 ? 'warn' : 'danger' };
  }
  if (cintura && altura) {
    const ica = (parseFloat(cintura) / parseFloat(altura)).toFixed(2);
    resultado.ica = { valor: ica, estado: ica <= 0.5 ? 'Saludable' : ica <= 0.6 ? 'Precaución' : 'Riesgo alto', nivel: ica <= 0.5 ? 'ok' : ica <= 0.6 ? 'warn' : 'danger' };
  }
  return resultado;
}

module.exports = { calcularPorcentajeGrasa, calcularProporciones, calcularSaludMetabolica };

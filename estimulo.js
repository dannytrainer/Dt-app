const fs = require('fs');
const path = require('path');
const { canonico } = require('./normalizar_musculos');
const COEF_PRINCIPAL = [1, 0.7, 0.5];
const COEF_SECUNDARIO = [0.3, 0.2, 0.1, 0.05];
const STOPWORDS = new Set(['de','en','con','la','el','los','las','y','individual','indv','post','a']);

function tokens(txt) {
  return txt.toLowerCase()
    .replace(/^[a-z]\d+\s*/i, '')
    .replace(/[^a-zñáéíóú0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function scoreMatch(a, b) {
  const setB = new Set(b);
  const comunes = a.filter(w => setB.has(w) || b.some(x => x.includes(w) || w.includes(x)));
  return comunes.length / Math.max(a.length, 1);
}

function buscarEjercicio(nombreRutina, enciclopedia) {
  const objetivo = tokens(nombreRutina);
  if (!objetivo.length) return null;
  let mejor = null, mejorScore = 0;
  for (const ex of enciclopedia) {
    const score = scoreMatch(objetivo, tokens(ex.nombre));
    if (score > mejorScore) { mejorScore = score; mejor = ex; }
  }
  return mejorScore >= 0.5 ? mejor : null;
}

function partirCombo(nombre) {
  return nombre.split('+').map(s => s.trim()).filter(Boolean);
}

// Una serie cuenta como EFECTIVA solo si tiene RIR registrado y es <= 3 (65-85% RM aprox,
// según el protocolo del documento). RIR vacío o alto (4+) se considera solo en el GLOBAL,
// sin beneficio de la duda — así lo definió el entrenador explícitamente.
const RIR_MAX_EFECTIVA = 3;
function esEfectiva(rir) {
  if (rir === undefined || rir === null || rir === '') return false;
  const n = parseFloat(rir);
  if (isNaN(n)) return false;
  return n <= RIR_MAX_EFECTIVA;
}

function calcularEstimuloSemanal(clienteId) {
  const rutinas = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/rutinas.json'), 'utf8'));
  const enciclopedia = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/enciclopedia.json'), 'utf8'));
  const rutina = rutinas[clienteId];
  if (!rutina) throw new Error('Cliente sin rutina: ' + clienteId);

  const estimuloGlobal = {};
  const estimuloEfectivo = {};
  const noEncontrados = [];

  for (const dia of Object.keys(rutina)) {
    const ejercicios = rutina[dia].ejercicios || [];
    for (const ej of ejercicios) {
      const partes = partirCombo(ej.nombre);
      const series = parseFloat(ej.series) || 0;
      const efectiva = esEfectiva(ej.rir);

      for (const parte of partes) {
        const match = buscarEjercicio(parte, enciclopedia);
        if (!match) { noEncontrados.push(parte); continue; }
        (match.musculos_principales || []).forEach((m, i) => {
          const nombre = canonico(m);
          const coef = COEF_PRINCIPAL[i] || 0.5;
          const aporte = series * coef;
          estimuloGlobal[nombre] = (estimuloGlobal[nombre] || 0) + aporte;
          if (efectiva) estimuloEfectivo[nombre] = (estimuloEfectivo[nombre] || 0) + aporte;
        });
        (match.musculos_secundarios || []).forEach((m, i) => {
          const nombre = canonico(m);
          const coef = COEF_SECUNDARIO[i] || 0.05;
          const aporte = series * coef;
          estimuloGlobal[nombre] = (estimuloGlobal[nombre] || 0) + aporte;
          if (efectiva) estimuloEfectivo[nombre] = (estimuloEfectivo[nombre] || 0) + aporte;
        });
      }
    }
  }

  Object.keys(estimuloGlobal).forEach(m => estimuloGlobal[m] = +estimuloGlobal[m].toFixed(1));
  Object.keys(estimuloEfectivo).forEach(m => estimuloEfectivo[m] = +estimuloEfectivo[m].toFixed(1));
  return { estimuloGlobal, estimuloEfectivo, noEncontrados: [...new Set(noEncontrados)] };
}

module.exports = { calcularEstimuloSemanal, buscarEjercicio, tokens, partirCombo, COEF_PRINCIPAL, COEF_SECUNDARIO, esEfectiva, RIR_MAX_EFECTIVA };

if (require.main === module) {
  const id = process.argv[2] || 'cli_1778216541791';
  const r = calcularEstimuloSemanal(id);
  console.log('Estímulo GLOBAL:', r.estimuloGlobal);
  console.log('\nEstímulo EFECTIVO (RIR<=3):', r.estimuloEfectivo);
  console.log('\nNo encontrados (revisar manual):', r.noEncontrados);
}

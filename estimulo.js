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

function calcularEstimuloSemanal(clienteId) {
  const rutinas = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/rutinas.json'), 'utf8'));
  const enciclopedia = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/enciclopedia.json'), 'utf8'));
  const rutina = rutinas[clienteId];
  if (!rutina) throw new Error('Cliente sin rutina: ' + clienteId);

  const estimulo = {};
  const noEncontrados = [];

  for (const dia of Object.keys(rutina)) {
    const ejercicios = rutina[dia].ejercicios || [];
    for (const ej of ejercicios) {
      const partes = partirCombo(ej.nombre);
      const series = parseFloat(ej.series) || 0;

      for (const parte of partes) {
        const match = buscarEjercicio(parte, enciclopedia);
        if (!match) { noEncontrados.push(parte); continue; }

        (match.musculos_principales || []).forEach((m, i) => {
          const nombre = canonico(m);
          const coef = COEF_PRINCIPAL[i] || 0.5;
          estimulo[nombre] = (estimulo[nombre] || 0) + series * coef;
        });
        (match.musculos_secundarios || []).forEach((m, i) => {
          const nombre = canonico(m);
          const coef = COEF_SECUNDARIO[i] || 0.05;
          estimulo[nombre] = (estimulo[nombre] || 0) + series * coef;
        });
      }
    }
  }

  Object.keys(estimulo).forEach(m => estimulo[m] = +estimulo[m].toFixed(1));
  return { estimulo, noEncontrados: [...new Set(noEncontrados)] };
}

module.exports = { calcularEstimuloSemanal, buscarEjercicio, tokens, partirCombo, COEF_PRINCIPAL, COEF_SECUNDARIO };

if (require.main === module) {
  const id = process.argv[2] || 'cli_1778216541791';
  const r = calcularEstimuloSemanal(id);
  console.log('Estímulo semanal por músculo:', r.estimulo);
  console.log('\nNo encontrados (revisar manual):', r.noEncontrados);
}

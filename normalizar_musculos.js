function quitarTildes(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const SINONIMOS_RAW = {
  'gluteos': 'Glúteos', 'gluteo': 'Glúteos', 'gluteo medio': 'Glúteos', 'gluteo menor': 'Glúteos',
  'biceps': 'Bíceps', 'biceps braquial': 'Bíceps', 'braquial anterior': 'Bíceps',
  'triceps': 'Tríceps',
  'isquiotibiales': 'Isquiotibiales', 'femoral': 'Isquiotibiales', 'femorales': 'Isquiotibiales',
  'gemelos': 'Gemelos', 'gastrocnemio': 'Gemelos', 'soleo': 'Gemelos',
  'cuadriceps': 'Cuádriceps',
  'pectoral': 'Pecho',
  'dorsales': 'Espalda', 'middle back': 'Espalda', 'lumbar': 'Espalda',
  'hombros': 'Hombros',
  'aductores': 'Aductores',
  'core': 'Core',
  'forearm': 'Antebrazo', 'antebrazo (flexores)': 'Antebrazo',
  'tensor de la fascia lata': 'Cadera', 'tendon de aquiles': 'Gemelos',
};

// Todas las claves se normalizan (sin tildes) al cargar, para que no vuelva a pasar este bug
const SINONIMOS = {};
Object.keys(SINONIMOS_RAW).forEach(k => { SINONIMOS[quitarTildes(k)] = SINONIMOS_RAW[k]; });

function canonico(nombreMusculo) {
  const key = quitarTildes(nombreMusculo.toLowerCase().trim());
  if (SINONIMOS[key]) return SINONIMOS[key];
  return nombreMusculo.trim();
}

module.exports = { canonico };

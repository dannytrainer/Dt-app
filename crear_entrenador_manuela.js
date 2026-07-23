// crear_entrenador_manuela.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const EMAIL_MANUELA = 'manugavi_146@hotmail.es';
const NOMBRE_MANUELA = 'Manuela Gaviria';

function cargarJSON(nombre, def) {
  const p = path.join(DATA_DIR, nombre);
  if (!fs.existsSync(p)) return def;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function guardarJSON(nombre, data) {
  const p = path.join(DATA_DIR, nombre);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

const cuentasPath = path.join(DATA_DIR, 'cuentas.json');
const backupPath = path.join(DATA_DIR, `cuentas.json.bak_${Date.now()}`);
fs.copyFileSync(cuentasPath, backupPath);
console.log('Backup creado en:', backupPath);

const cuentas = cargarJSON('cuentas.json', { entrenadores: [], clientes: [] });

const yaEsEntrenador = cuentas.entrenadores.find(e => e.email === EMAIL_MANUELA);
if (yaEsEntrenador) {
  console.log('Manuela YA tiene cuenta de entrenador. No se hizo ningún cambio.');
  console.log('Código actual:', yaEsEntrenador.codigo_vinculacion);
  process.exit(0);
}

const nuevo = {
  id: 'ent_' + Date.now(),
  email: EMAIL_MANUELA,
  password: '',
  nombre: NOMBRE_MANUELA,
  codigo_vinculacion: Array.from({ length: 3 }, () =>
    Math.random().toString(36).substring(2, 6).toUpperCase()
  ).join('-'),
  roles: ['entrenador', 'cliente'],
  activo: true,
  fecha_registro: new Date().toISOString().split('T')[0]
};

cuentas.entrenadores.push(nuevo);
guardarJSON('cuentas.json', cuentas);

guardarJSON(`config_${nuevo.id}.json`, {
  nombre_entrenador: nuevo.nombre,
  email: nuevo.email,
  codigo_vinculacion: nuevo.codigo_vinculacion,
  msg_prellenado: false,
  cobro_auto_activo: true,
  premium_entrenador: false
});

guardarJSON(`horarios_${nuevo.id}.json`, { recurrentes: [], unicos: [] });
guardarJSON(`administrativo_${nuevo.id}.json`, { clientes: {} });

console.log('');
console.log('✅ Cuenta de entrenador creada para Manuela');
console.log('   id:', nuevo.id);
console.log('   codigo_vinculacion:', nuevo.codigo_vinculacion);
console.log('');
console.log('Nota: el registro viejo en cuentas.clientes (cli_1781365886924, con roles');
console.log('["entrenador","cliente"] y entrenador_id null) sigue existiendo tal cual.');
console.log('Era el que la dejaba ENTRAR a la interfaz sin tener código real; ahora que');
console.log('ya existe su cuenta real en cuentas.entrenadores, el código sí va a aparecer.');
console.log('Ese registro duplicado se puede limpiar después si quieres, pero no es urgente.');

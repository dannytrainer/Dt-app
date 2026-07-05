const fs = require('fs');
const archivo = 'public/js/app-terminal.js';
let contenido = fs.readFileSync(archivo, 'utf8');

const original = `function tcMostrarBannerTimer() {
  const banner = document.getElementById('tc-banner-timer');
  if (!banner) return;
  banner.style.display = 'flex';
  _tcCierrePorTiempoEjecutado = false;
  console.log('DEBUG _tcDia:', _tcDia, '_tcRutina existe:', !!_tcRutina, 'tiempo_max_min:', _tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].tiempo_max_min);
  const _debugTxt = document.getElementById('tc-timer-rutina-txt');
  if (_debugTxt) _debugTxt.title = 'dia=' + _tcDia + ' tmax=' + (_tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].tiempo_max_min);
  if (_tcTimerRutina) clearInterval(_tcTimerRutina);
  _tcTimerRutina = setInterval(() => {
    const inicio = parseInt(localStorage.getItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x')));
    if (!inicio) { clearInterval(_tcTimerRutina); return; }
    const tiempoMaxMin = (_tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].tiempo_max_min) || 0;
    const seg = Math.floor((Date.now() - inicio) / 1000);
    const txt = document.getElementById('tc-timer-rutina-txt');
    if (tiempoMaxMin > 0) {
      const restanteSeg = Math.max(0, (tiempoMaxMin * 60) - seg);
      const h = String(Math.floor(restanteSeg/3600)).padStart(2,'0');
      const m = String(Math.floor((restanteSeg%3600)/60)).padStart(2,'0');
      const s = String(restanteSeg%60).padStart(2,'0');
      if (txt) txt.textContent = h+':'+m+':'+s;
      document.title = 'RESTA:' + restanteSeg + 's';
      _tcCheckTiempoLimite();
    } else {
      const h = String(Math.floor(seg/3600)).padStart(2,'0');
      const m = String(Math.floor((seg%3600)/60)).padStart(2,'0');
      const s = String(seg%60).padStart(2,'0');
      if (txt) txt.textContent = h+':'+m+':'+s;
    }
  }, 1000);`;

const nuevo = `function tcMostrarBannerTimer() {
  const banner = document.getElementById('tc-banner-timer');
  if (!banner) return;
  banner.style.display = 'flex';
  _tcCierrePorTiempoEjecutado = false;
  let _tcLimiteDiv = document.getElementById('tc-limite-visible');
  if (!_tcLimiteDiv) {
    _tcLimiteDiv = document.createElement('span');
    _tcLimiteDiv.id = 'tc-limite-visible';
    _tcLimiteDiv.style.cssText = 'font-size:11px;color:#ff9800;font-weight:700;margin-left:10px';
    banner.appendChild(_tcLimiteDiv);
  }
  if (_tcTimerRutina) clearInterval(_tcTimerRutina);
  _tcTimerRutina = setInterval(() => {
    const inicio = parseInt(localStorage.getItem('tc-timer-inicio-' + ((_tcUsuario && _tcUsuario.id) || 'x')));
    if (!inicio) { clearInterval(_tcTimerRutina); return; }
    const tiempoMaxMin = (_tcRutina && _tcRutina[_tcDia] && _tcRutina[_tcDia].tiempo_max_min) || 0;
    const seg = Math.floor((Date.now() - inicio) / 1000);
    const txt = document.getElementById('tc-timer-rutina-txt');
    const h = String(Math.floor(seg/3600)).padStart(2,'0');
    const m = String(Math.floor((seg%3600)/60)).padStart(2,'0');
    const s = String(seg%60).padStart(2,'0');
    if (txt) txt.textContent = h+':'+m+':'+s;
    if (_tcLimiteDiv) {
      _tcLimiteDiv.textContent = tiempoMaxMin > 0 ? ('Límite: ' + tiempoMaxMin + ' min') : '';
    }
    if (tiempoMaxMin > 0) {
      _tcCheckTiempoLimite();
    }
  }, 1000);`;

if (!contenido.includes(original)) {
  console.log('❌ NO SE ENCONTRÓ el texto original exacto. No se modificó nada.');
  process.exit(1);
}
if (contenido.split(original).length - 1 !== 1) {
  console.log('❌ El texto aparece más de una vez. No se modificó nada.');
  process.exit(1);
}
contenido = contenido.replace(original, nuevo);
fs.writeFileSync(archivo, contenido);
console.log('✅ Cronómetro rediseñado: cuenta hacia arriba + indicador de límite visible.');

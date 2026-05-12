const fs = require('fs');
let c = fs.readFileSync('public/tests.js', 'utf8');
c = c.replace(
  `function cambioTexto(anterior, actual) {
  if (!anterior || !actual) return '';
  const pct = Math.round(((actual - anterior) / anterior) * 100);
  if (pct === 0) return '<span style="color:#888"> (=)</span>';
  const flecha = pct > 0 ? '↑' : '↓';
  const color = pct > 0 ? '#4caf50' : '#e57373';
  return \`<span style="color:\${color}"> (\${pct > 0 ? '+' : ''}\${pct}% \${flecha})</span>\`;
}`,
  `function cambioTexto(anterior, actual) {
  if (!anterior || !actual) return '';
  const pct = Math.round(((actual - anterior) / anterior) * 100);
  if (pct === 0) return ' (=)';
  const flecha = pct > 0 ? '↑' : '↓';
  return ' (' + (pct > 0 ? '+' : '') + pct + '% ' + flecha + ')';
}`
);
fs.writeFileSync('public/tests.js', c);
console.log('ok');

const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  '<script src="/medidas.js"></script>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>\n<script src="/medidas.js"></script>\n<script src="/tests.js"></script>'
);
fs.writeFileSync('public/index.html', c);
console.log('ok2');

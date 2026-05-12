const fs = require('fs');
let c = fs.readFileSync('public/index.html', 'utf8');
c = c.replace(
  '.bti{background:#1a1a2a;color:#7986cb}',
  '.bti-asesorado{background:#0a2a0a;color:#4caf50;display:inline-block;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;margin-right:4px}\n.bti-personalizado{background:#2a0a0a;color:#e31e24;display:inline-block;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;margin-right:4px}'
);
c = c.replace(
  '<span class="badge bti">${u.tipo}</span>',
  '<span class="bti-${u.tipo}">${u.tipo}</span>'
);
fs.writeFileSync('public/index.html', c);
console.log('ok2');

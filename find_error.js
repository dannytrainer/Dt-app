const fs = require('fs');
let c = fs.readFileSync('public/index.html','utf8');
const scripts = [];
let i = 0;
while(true) {
  const s = c.indexOf('<script>', i);
  if(s===-1) break;
  const e = c.indexOf('</script>', s);
  scripts.push(c.slice(s+8, e));
  i = e+9;
}
const code = scripts[0];
const lines = code.split('\n');
lines.forEach((l, i) => {
  if(l.includes('<\/script>') || l.includes('</script>')) {
    console.log('Linea', i+1, ':', l.substring(0,120));
  }
});

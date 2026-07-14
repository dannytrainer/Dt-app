#!/data/data/com.termux/files/usr/bin/bash
TS=$(date +%s)
sed -i "s|/medidas.js?v=[0-9]*\"|/medidas.js?v=$TS\"|; s|/medidas.js\"|/medidas.js?v=$TS\"|" ~/Dt-app/public/index.html
sed -i "s|js/admin-clase-presencial.js?v=[0-9]*\"|js/admin-clase-presencial.js?v=$TS\"|; s|js/admin-clase-presencial.js\"|js/admin-clase-presencial.js?v=$TS\"|" ~/Dt-app/public/index.html
sed -i "s|js/admin-inicio.js?v=[0-9]*\"|js/admin-inicio.js?v=$TS\"|; s|js/admin-inicio.js\"|js/admin-inicio.js?v=$TS\"|" ~/Dt-app/public/index.html
sed -i "s|js/admin-config.js?v=[0-9]*\"|js/admin-config.js?v=$TS\"|; s|js/admin-config.js\"|js/admin-config.js?v=$TS\"|" ~/Dt-app/public/index.html
echo "🔄 Versión de cache actualizada: $TS"

#!/bin/bash
mkdir -p /sdcard/Download/DTApp_Backups
FECHA=$(date +%Y-%m-%d_%H-%M)
ARCHIVO="/sdcard/Download/DTApp_Backups/v_$FECHA.sh"

cat > $ARCHIVO << 'RESTORE_SCRIPT'
#!/bin/bash
echo "🚀 Restaurando DT App..."
pkg update -y
pkg install nodejs git -y
termux-setup-storage
mkdir -p ~/gymbot/public ~/gymbot/data ~/gymbot/auth
cd ~/gymbot
RESTORE_SCRIPT

echo "# ===package.json===" >> $ARCHIVO
echo "cat > ~/gymbot/package.json << 'PKGJSON'" >> $ARCHIVO
cat package.json >> $ARCHIVO
echo "PKGJSON" >> $ARCHIVO

echo "# ===index.js===" >> $ARCHIVO
echo "cat > ~/gymbot/index.js << 'INDEXJS'" >> $ARCHIVO
cat index.js >> $ARCHIVO
echo "INDEXJS" >> $ARCHIVO

echo "# ===rutas_historial.js===" >> $ARCHIVO
echo "cat > ~/gymbot/rutas_historial.js << 'RUTASJS'" >> $ARCHIVO
cat rutas_historial.js >> $ARCHIVO
echo "RUTASJS" >> $ARCHIVO

echo "# ===calculos.js===" >> $ARCHIVO
echo "cat > ~/gymbot/calculos.js << 'CALCJS'" >> $ARCHIVO
cat calculos.js >> $ARCHIVO
echo "CALCJS" >> $ARCHIVO

echo "# ===sincronizar.js===" >> $ARCHIVO
echo "cat > ~/gymbot/sincronizar.js << 'SINCJS'" >> $ARCHIVO
cat sincronizar.js >> $ARCHIVO
echo "SINCJS" >> $ARCHIVO

echo "# ===public/index.html===" >> $ARCHIVO
echo "cat > ~/gymbot/public/index.html << 'INDEXHTML'" >> $ARCHIVO
cat public/index.html >> $ARCHIVO
echo "INDEXHTML" >> $ARCHIVO

echo "# ===public/medidas.js===" >> $ARCHIVO
echo "cat > ~/gymbot/public/medidas.js << 'MEDIDASJS'" >> $ARCHIVO
cat public/medidas.js >> $ARCHIVO
echo "MEDIDASJS" >> $ARCHIVO

echo "# ===public/tests.js===" >> $ARCHIVO
echo "cat > ~/gymbot/public/tests.js << 'TESTSJS'" >> $ARCHIVO
cat public/tests.js >> $ARCHIVO
echo "TESTSJS" >> $ARCHIVO

echo "# ===public/logo.svg===" >> $ARCHIVO
echo "cat > ~/gymbot/public/logo.svg << 'LOGOSVG'" >> $ARCHIVO
cat public/logo.svg >> $ARCHIVO
echo "LOGOSVG" >> $ARCHIVO

echo "# ===public/manifest.json===" >> $ARCHIVO
echo "cat > ~/gymbot/public/manifest.json << 'MANIFESTJSON'" >> $ARCHIVO
cat public/manifest.json >> $ARCHIVO
echo "MANIFESTJSON" >> $ARCHIVO

echo "# ===public/icon.png en base64===" >> $ARCHIVO
echo "base64 -d << 'ICONB64' > ~/gymbot/public/icon.png" >> $ARCHIVO
base64 public/icon.png >> $ARCHIVO
echo "ICONB64" >> $ARCHIVO

echo "# ===data===" >> $ARCHIVO
for f in data/*.json; do
  VARNAME=$(echo $f | tr '/' '_' | tr '.' '_' | tr '-' '_' | tr '[:lower:]' '[:upper:]')
  echo "cat > ~/gymbot/$f << '${VARNAME}'" >> $ARCHIVO
  cat $f >> $ARCHIVO
  echo "${VARNAME}" >> $ARCHIVO
done

echo "# ===msmtp config===" >> $ARCHIVO
echo "cat > ~/.msmtprc << 'MSMTPRC'" >> $ARCHIVO
cat ~/.msmtprc >> $ARCHIVO
echo "MSMTPRC" >> $ARCHIVO
echo "chmod 600 ~/.msmtprc" >> $ARCHIVO

cat >> $ARCHIVO << 'FINAL_SCRIPT'
cd ~/gymbot
npm install @whiskeysockets/baileys qrcode-terminal node-cron express axios qrcode --ignore-scripts
echo 'alias dt="cd ~/gymbot && node index.js"' >> ~/.bashrc
source ~/.bashrc
echo ""
echo "✅ DT App restaurada exitosamente"
echo "📱 Ejecuta: dt"
echo "🌐 Luego abre: localhost:3000"
echo "📷 Escanea el QR con WhatsApp"
FINAL_SCRIPT


# === FINALIZACIÓN DEL ARCHIVO ===
chmod +x $ARCHIVO

SIZE=$(wc -c < $ARCHIVO)

# === MENSAJE BACKUP ===
echo "✅ Backup restaurable: v_$FECHA.sh ($SIZE bytes)"
echo "📧 Enviado a tu correo"

# === GIT SYNC DENTRO DEL RESTORE SCRIPT ===
echo "" >> $ARCHIVO
echo "# === GIT SYNC ===" >> $ARCHIVO
echo "echo \"🔄 Sincronizando con GitHub...\"" >> $ARCHIVO
echo "cd ~/gymbot && git add . && git commit -m \"auto backup $FECHA\" && git push origin main && echo \"✅ Subido a GitHub con éxito\"" >> $ARCHIVO


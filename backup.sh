#!/bin/bash
# ═══════════════════════════════
# DT APP — BACKUP COMPLETO
# ═══════════════════════════════
mkdir -p /sdcard/Download/DTApp_Backups
mkdir -p /sdcard/Download/DTApp_Backups/html

FECHA=$(date +%Y-%m-%d_%H-%M)
ARCHIVO="/sdcard/Download/DTApp_Backups/v_$FECHA.sh"

# — Backup rápido del index.html —
cp ~/Dt-app/public/index.html "/sdcard/Download/DTApp_Backups/html/index_$FECHA.html"
# Mantener solo los últimos 10 backups de html
ls -t /sdcard/Download/DTApp_Backups/html/index_*.html 2>/dev/null | tail -n +11 | xargs rm -f

cat > "$ARCHIVO" << 'RESTORE_SCRIPT'
#!/bin/bash
echo "🚀 Restaurando DT App..."
pkg update -y
pkg install nodejs git msmtp -y
termux-setup-storage
mkdir -p ~/Dt-app/public ~/Dt-app/data ~/Dt-app/auth
cd ~/Dt-app
RESTORE_SCRIPT

escribir_archivo() {
  local DESTINO=$1
  local MARKER=$2
  local FUENTE=$3
  echo "cat > $DESTINO << '$MARKER'" >> "$ARCHIVO"
  cat "$FUENTE" >> "$ARCHIVO"
  echo "$MARKER" >> "$ARCHIVO"
}

escribir_archivo '~/Dt-app/package.json'           'PKGJSON'      package.json
escribir_archivo '~/Dt-app/index.js'               'INDEXJS'      index.js
escribir_archivo '~/Dt-app/rutas_historial.js'     'RUTASJS'      rutas_historial.js
escribir_archivo '~/Dt-app/calculos.js'            'CALCJS'       calculos.js
escribir_archivo '~/Dt-app/sincronizar.js'         'SINCJS'       sincronizar.js
escribir_archivo '~/Dt-app/public/index.html'      'INDEXHTML'    public/index.html
escribir_archivo '~/Dt-app/public/medidas.js'      'MEDIDASJS'    public/medidas.js
escribir_archivo '~/Dt-app/public/tests.js'        'TESTSJS'      public/tests.js
escribir_archivo '~/Dt-app/public/unidades.js'     'UNIDADESJS'   public/unidades.js
escribir_archivo '~/Dt-app/public/logo.svg'        'LOGOSVG'      public/logo.svg
escribir_archivo '~/Dt-app/public/manifest.json'   'MANIFESTJSON' public/manifest.json

# icon.png en base64
echo "base64 -d << 'ICONB64' > ~/Dt-app/public/icon.png" >> "$ARCHIVO"
base64 public/icon.png >> "$ARCHIVO"
echo "ICONB64" >> "$ARCHIVO"

# data JSONs
for f in data/*.json; do
  MARKER=$(echo $f | tr '/.:-' '_' | tr '[:lower:]' '[:upper:]')
  echo "cat > ~/Dt-app/$f << '${MARKER}'" >> "$ARCHIVO"
  cat "$f" >> "$ARCHIVO"
  echo "${MARKER}" >> "$ARCHIVO"
done

# msmtp
echo "cat > ~/.msmtprc << 'MSMTPRC'" >> "$ARCHIVO"
cat ~/.msmtprc >> "$ARCHIVO"
echo "MSMTPRC" >> "$ARCHIVO"
echo "chmod 600 ~/.msmtprc" >> "$ARCHIVO"

cat >> "$ARCHIVO" << 'FINAL_SCRIPT'
cd ~/Dt-app
npm install @whiskeysockets/baileys qrcode-terminal node-cron express axios qrcode --ignore-scripts
echo 'alias dt="cd ~/Dt-app && node index.js"' >> ~/.bashrc
echo 'alias backup="cd ~/Dt-app && bash backup.sh && git add -A && git commit -m \"backup\" && git push"' >> ~/.bashrc
echo 'alias bk="cp ~/Dt-app/public/index.html \"/sdcard/Download/DTApp_Backups/html/index_bk_$(date +%H-%M).html\" && echo ✅ HTML guardado"' >> ~/.bashrc
echo 'alias bk1="ls -t /sdcard/Download/DTApp_Backups/html/index_*.html 2>/dev/null | sed -n 1p | xargs -I{} cp {} ~/Dt-app/public/index.html && echo ✅ Restaurado bk1"' >> ~/.bashrc
echo 'alias bk2="ls -t /sdcard/Download/DTApp_Backups/html/index_*.html 2>/dev/null | sed -n 2p | xargs -I{} cp {} ~/Dt-app/public/index.html && echo ✅ Restaurado bk2"' >> ~/.bashrc
echo 'alias bkfull="bash /sdcard/Download/DTApp_Backups/$(ls -t /sdcard/Download/DTApp_Backups/v_*.sh 2>/dev/null | head -1 | xargs basename)"' >> ~/.bashrc
source ~/.bashrc
echo ""
echo "✅ DT App restaurada exitosamente"
echo "📱 Ejecuta: dt"
echo "🌐 Luego abre: localhost:3000"
echo "📷 Escanea el QR con WhatsApp"
FINAL_SCRIPT

chmod +x "$ARCHIVO"
SIZE=$(wc -c < "$ARCHIVO")
echo "✅ Backup restaurable: v_$FECHA.sh ($SIZE bytes)"
(echo "Subject: DT App Backup $FECHA"; echo "Restaurable. Ejecuta este archivo en Termux."; echo ""; cat "$ARCHIVO") | msmtp danielgaviriabotero@gmail.com
echo "📧 Enviado a tu correo"

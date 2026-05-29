#!/bin/bash
echo ""
echo "╔══════════════════════════════════╗"
echo "║     DT-APP  —  INSTALACIÓN       ║"
echo "╚══════════════════════════════════╝"
echo ""

pkg update -y -q
pkg install -y -q nodejs git

if [ -d "$HOME/Dt-app/.git" ]; then
  echo "🔄 Actualizando..."
  cd ~/Dt-app
  git stash 2>/dev/null
  git pull origin main
else
  echo "📥 Clonando..."
  cd ~
  git clone https://github.com/dannytrainer/Dt-app.git
  cd ~/Dt-app
fi

echo "🖼️  Descargando imágenes enciclopedia..."
cd ~/Dt-app
git checkout origin/main -- public/enciclopedia/imgs/ 2>/dev/null
echo "   ✅ $(ls public/enciclopedia/imgs/ 2>/dev/null | wc -l) imágenes"

echo "📦 npm install..."
npm install --silent

mkdir -p ~/Dt-app/data/fotos ~/Dt-app/backups ~/Dt-app/auth

[ ! -f ~/Dt-app/data/usuarios.json ]       && echo '[]' > ~/Dt-app/data/usuarios.json
[ ! -f ~/Dt-app/data/rutinas.json ]        && echo '{}' > ~/Dt-app/data/rutinas.json
[ ! -f ~/Dt-app/data/alimentacion.json ]   && echo '{}' > ~/Dt-app/data/alimentacion.json
[ ! -f ~/Dt-app/data/historial.json ]      && echo '{}' > ~/Dt-app/data/historial.json
[ ! -f ~/Dt-app/data/chats.json ]          && echo '{}' > ~/Dt-app/data/chats.json
[ ! -f ~/Dt-app/data/administrativo.json ] && echo '{"config":{"moneda_default":"COP"},"clientes":{}}' > ~/Dt-app/data/administrativo.json
[ ! -f ~/Dt-app/data/logs.json ]           && echo '{}' > ~/Dt-app/data/logs.json
[ ! -f ~/Dt-app/data/festivos.json ]       && echo '[]' > ~/Dt-app/data/festivos.json
[ ! -f ~/Dt-app/data/hiit.json ]           && echo '[]' > ~/Dt-app/data/hiit.json
[ ! -f ~/Dt-app/data/horarios.json ]       && echo '{}' > ~/Dt-app/data/horarios.json
[ ! -f ~/Dt-app/data/competencias.json ]   && echo '[]' > ~/Dt-app/data/competencias.json
[ ! -f ~/Dt-app/data/tests.json ]          && echo '{}' > ~/Dt-app/data/tests.json
[ ! -f ~/Dt-app/data/enciclopedia_personalizados.json ] && echo '{"ejercicios":[]}' > ~/Dt-app/data/enciclopedia_personalizados.json
[ ! -f ~/Dt-app/data/alimentos.json ]      && echo '[]' > ~/Dt-app/data/alimentos.json

if [ ! -f ~/Dt-app/data/config.json ]; then
  echo ""
  echo "⚙️  Configuración inicial"
  read -p "   Nombre del entrenador: " NOMBRE
  read -p "   Contraseña de acceso:  " PASS
  CODIGO="DT-$(cat /dev/urandom | tr -dc 'A-Z0-9' | head -c6)"
  cat > ~/Dt-app/data/config.json << JSONEOF
{
  "nombre_entrenador": "${NOMBRE:-Mi Entrenador}",
  "color_acento": "#e31e24",
  "fondo": "#000000",
  "envios_pausados_hasta": null,
  "logo_entrenador": "/logo_trainer.png",
  "codigo_vinculacion": "${CODIGO}",
  "password_entrenador": "${PASS:-1234}",
  "plan": "free"
}
JSONEOF
  echo "   ✅ Código: $CODIGO"
fi

if ! grep -q "alias dt=" ~/.bashrc 2>/dev/null; then
  cat >> ~/.bashrc << 'BASHEOF'

# ── DT-APP ──────────────────────────────
alias dt='cd ~/Dt-app && node index.js'
alias dtr='pkill -f "node index" 2>/dev/null; sleep 1; dt'
alias update='cd ~/Dt-app && git stash 2>/dev/null; git gc --quiet 2>/dev/null; git pull origin main && git checkout origin/main -- public/enciclopedia/imgs/ 2>/dev/null && npm install --silent && echo "✅ App actualizada"'
alias bk='cp ~/Dt-app/public/index.html "/sdcard/Download/index_bk_$(date +%H-%M).html" 2>/dev/null && echo "✅ HTML guardado" || echo "⚠️ Sin sdcard"'
# ────────────────────────────────────────
BASHEOF
fi

echo ""
echo "╔══════════════════════════════════════╗"
echo "║      ✅  INSTALACIÓN COMPLETA        ║"
echo "╠══════════════════════════════════════╣"
echo "║  Arrancar:   source ~/.bashrc && dt  ║"
echo "║  Actualizar: update                  ║"
echo "║  Escanea el QR con WhatsApp          ║"
echo "╚══════════════════════════════════════╝"

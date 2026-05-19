#!/bin/bash
set -e

echo "🚀 Instalando Dt-app..."

# 1. Dependencias Termux
pkg update -y && pkg upgrade -y
pkg install -y nodejs git python

# 2. Clonar o actualizar repo
if [ ! -d "$HOME/Dt-app/.git" ]; then
  echo "📥 Clonando repositorio..."
  rm -rf "$HOME/Dt-app"
  git clone https://github.com/dannytrainer/Dt-app.git "$HOME/Dt-app"
else
  echo "🔄 Actualizando repositorio..."
  cd "$HOME/Dt-app" && git pull
fi

cd "$HOME/Dt-app"

# 3. Instalar dependencias Node
echo "📦 Instalando dependencias npm..."
npm install

# 4. Crear carpetas necesarias
mkdir -p data/fotos auth backups

# 5. Alias dtr
if ! grep -q "alias dtr=" ~/.bashrc; then
  echo 'alias dtr="cd $HOME/Dt-app && node index.js"' >> ~/.bashrc
fi
source ~/.bashrc 2>/dev/null || true

echo ""
echo "✅ INSTALACIÓN COMPLETA"
echo "👉 Escribe: dtr"

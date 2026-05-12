#!/bin/bash

echo "🚀 Iniciando instalación segura de GymBot..."

# =========================
# 1. DEPENDENCIAS BASE
# =========================
echo "📦 Verificando dependencias..."

pkg update -y
pkg upgrade -y

pkg install nodejs git -y

# =========================
# 2. VALIDAR CARPETA
# =========================
echo "📁 Verificando proyecto..."

cd ~/gymbot || {
  echo "❌ Carpeta gymbot no existe"
  exit 1
}

# =========================
# 3. VALIDAR GIT
# =========================
if [ ! -d ".git" ]; then
  echo "⚠️ No hay repo git, clonando desde GitHub..."
  cd ~
  rm -rf gymbot
  git clone https://github.com/dannytrainer/Dt-app.git
  cd gymbot
else
  echo "✔ Git detectado"
fi

# =========================
# 4. DEPENDENCIAS NODE
# =========================
echo "📦 Instalando dependencias npm..."

npm install

# =========================
# 5. VALIDAR INDEX
# =========================
if [ ! -f "index.js" ]; then
  echo "❌ ERROR: falta index.js"
  echo "👉 Revisa GitHub o backup"
  exit 1
fi

# =========================
# 6. RESTAURAR ALIAS
# =========================
echo "🔧 Configurando alias dt..."

if ! grep -q "alias dt=" ~/.bashrc; then
  echo 'alias dt="cd ~/gymbot && node index.js"' >> ~/.bashrc
fi

source ~/.bashrc

# =========================
# 7. FINAL
# =========================
echo ""
echo "✅ INSTALACIÓN COMPLETA"
echo "👉 Ejecuta ahora:"
echo "   dt"
echo ""
echo "🌐 Sistema listo en localhost si aplica"

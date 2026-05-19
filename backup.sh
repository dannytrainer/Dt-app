#!/bin/bash
echo "☁️ Subiendo backup a Google Drive..."

# Data completa (fotos, clientes, etc)
rclone sync ~/Dt-app/data "danielgaviriabotero@gmail.com:Dt-app-backup/data" --progress

# Auth — solo archivos esenciales de sesión WhatsApp
for archivo in creds.json app-state-sync-key*.json session*.json; do
  find ~/Dt-app/auth -maxdepth 2 -name "$archivo" | while read f; do
    rclone copyto "$f" "danielgaviriabotero@gmail.com:Dt-app-backup/auth/$(basename $f)" --progress
  done
done

echo ""
echo "✅ Backup completo en Google Drive"
echo "📁 Carpeta: Dt-app-backup"

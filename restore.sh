#!/bin/bash
echo "📥 Restaurando desde Google Drive..."

mkdir -p ~/Dt-app/data ~/Dt-app/auth

rclone sync "danielgaviriabotero@gmail.com:Dt-app-backup/data" ~/Dt-app/data --progress
rclone sync "danielgaviriabotero@gmail.com:Dt-app-backup/auth" ~/Dt-app/auth --progress

echo ""
echo "✅ Restauración completa"
echo "👉 Escribe: dtr"

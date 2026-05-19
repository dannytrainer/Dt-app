#!/bin/bash
echo "☁️ Subiendo backup a Google Drive..."

rclone sync ~/Dt-app/data "danielgaviriabotero@gmail.com:Dt-app-backup/data" --progress
rclone sync ~/Dt-app/auth "danielgaviriabotero@gmail.com:Dt-app-backup/auth" --progress

echo ""
echo "✅ Backup completo en Google Drive"
echo "📁 Carpeta: Dt-app-backup"

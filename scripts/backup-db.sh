#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$PROJECT_DIR/app"
BACKUP_DIR="$PROJECT_DIR/db-backups"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
FILENAME="supabase-dump_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

# Get access token from macOS keychain
ACCESS_TOKEN=$(security find-generic-password -s "Supabase CLI" -w 2>/dev/null | sed 's/^go-keyring-base64://' | base64 -d 2>/dev/null || echo "")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Supabase access token not found in keychain."
  echo "   Run 'npx supabase login' to authenticate."
  exit 1
fi

export SUPABASE_ACCESS_TOKEN="$ACCESS_TOKEN"

echo "🔄 Exporting all tables to $FILENAME ..."
cd "$APP_DIR"
node "$SCRIPT_DIR/dump-db.js" "$BACKUP_DIR" "$FILENAME"

gzip -f "$BACKUP_DIR/$FILENAME"
echo "✅ Backup: ${BACKUP_DIR}/${FILENAME}.gz ($(du -h "$BACKUP_DIR/${FILENAME}.gz" | cut -f1))"

ls -t "$BACKUP_DIR"/*.gz 2>/dev/null | tail -n +31 | xargs -I{} rm -f {} 2>/dev/null || true
echo "   (Retaining last 30 backups)"

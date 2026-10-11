#!/usr/bin/env bash
# Выкладка сайта на VPS: статика в /var/www, серверный код в /opt, перезапуск сервиса.
#
# GitHub Pages остаётся как есть — там статика собирается своим workflow
# с префиксом подпапки. Здесь сборка корневая: сайт отдаётся с корня адреса,
# поэтому rebase-dist не запускается.
set -euo pipefail

HOST="${DEPLOY_HOST:-root@45.12.72.227}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/seo_factory_tunnel_ed25519}"
SITE_URL="${PUBLIC_SITE_URL:-https://evolution-car-by.45.12.72.227.nip.io}"
WWW="/var/www/evolution-car-by"
APP="/opt/evolution-car-by"
SERVICE="evolution-car-by"

cd "$(dirname "$0")/.."

echo "==> сборка под $SITE_URL"
PUBLIC_SITE_URL="$SITE_URL" PUBLIC_LEAD_ENDPOINT="${PUBLIC_LEAD_ENDPOINT:-/api/lead}" npm run build

echo "==> статика -> $WWW"
rsync -az --delete -e "ssh -i $KEY -o StrictHostKeyChecking=no" dist/ "$HOST:$WWW/"

# Серверный код без --delete: рядом лежат leads.db и lead.env, их затирать нельзя.
echo "==> серверный код -> $APP"
rsync -az -e "ssh -i $KEY -o StrictHostKeyChecking=no" server/*.py "$HOST:$APP/"

echo "==> перезапуск $SERVICE"
ssh -i "$KEY" -o StrictHostKeyChecking=no "$HOST" "systemctl restart $SERVICE && sleep 1 && systemctl is-active $SERVICE"

echo "==> проверка"
curl -fsS -o /dev/null -w "главная: %{http_code}\n" "$SITE_URL/"
curl -fsS -w "health: %{http_code}\n" "$SITE_URL/api/lead/health" || true
echo
echo "Готово: $SITE_URL"

#!/usr/bin/env bash
# Publish guide.inphox.net: build guide/ and install it into /var/www/guide on the box that serves it (nginx root, no
# reload needed: folders resolve by try_files). Keeps /var/www/guide/staging-*/ (staging_ctl.py's status page) and
# backs up what is live first to ~/backups/guide/<UTC>/. Rollback: guide/deploy.sh --restore ~/backups/guide/<UTC>
# No rm of a variable path anywhere: rsync --delete on the one literal folder, staging-* excluded on both sides.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
stamp=$(date -u +%Y%m%dT%H%M%SZ)
backup="$HOME/backups/guide/$stamp"
if [ "${1:-}" = "--restore" ]; then
  src=${2:?backup folder}
  [ -f "$src/index.html" ] || { echo "no index.html in $src"; exit 1; }
  sudo rsync -a --delete --exclude 'staging-*' --chown=root:root "$src/" /var/www/guide/
  echo "restored $src"
  exit 0
fi
out="$HOME/backups/guide/build-$stamp"
mkdir -p "$out" "$backup"
node "$here/build.mjs" "$out"
[ -f "$out/index.html" ] && [ -f "$out/search.json" ] || { echo "STOP: the build did not produce the guide"; exit 1; }
sudo rsync -a --exclude 'staging-*' /var/www/guide/ "$backup/"
sudo chown -R "$(id -u):$(id -g)" "$backup"
sudo rsync -a --delete --exclude 'staging-*' --chown=root:root --chmod=D755,F644 "$out/" /var/www/guide/
echo "guide live ($stamp); previous copy in $backup; this build in $out"

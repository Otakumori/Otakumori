#!/usr/bin/env bash
set -euo pipefail

case "${1:-}" in
  lock)
    chmod -R a-w prisma/ public/assets/ scripts/
    echo "Locked prisma/, public/assets/, scripts/"
    ;;
  unlock)
    chmod -R u+w prisma/ public/assets/ scripts/
    echo "Unlocked prisma/, public/assets/, scripts/"
    ;;
  *)
    echo "usage: $0 {lock|unlock}"
    exit 2
    ;;
esac

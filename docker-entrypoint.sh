#!/bin/sh
set -e

mkdir -p /app/db
node /app/docker-init-db.mjs

exec "$@"

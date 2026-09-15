#!/bin/sh
set -e
DB_HOST_VAL="${DB_HOST:-db}"
DB_PORT_VAL="${DB_PORT:-5432}"
echo "Waiting for Postgres at $DB_HOST_VAL:$DB_PORT_VAL..."
until node -e "const net=require('net');const h=process.env.DB_HOST||'db';const p=parseInt(process.env.DB_PORT||'5432',10);const s=net.connect({host:h,port:p},()=>{process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),2000).unref();"; do
  echo "Postgres unavailable - retrying in 2s"
  sleep 2
done
echo "Postgres is up."
exec "$@"

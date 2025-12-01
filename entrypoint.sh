#!/bin/sh

echo "⏳ Aguardando o banco de dados subir..."

# Testa conexão via Python (sem netcat)
until python - <<EOF
import socket
try:
    s = socket.socket()
    s.settimeout(1)
    s.connect(("db", 5432))
except Exception:
    exit(1)
EOF
do
    sleep 1
done

echo "✔ Banco disponível!"

echo "📌 Rodando migrations..."
python manage.py migrate --noinput

echo "🚀 Iniciando servidor Django..."
exec "$@"

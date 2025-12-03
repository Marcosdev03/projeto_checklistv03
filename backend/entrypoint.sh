#!/bin/sh

echo "⏳ Aguardando 3 segundos antes de rodar migrations..."
sleep 3

echo "📌 Rodando migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

echo "🚀 Iniciando servidor Django..."
exec "$@"
#!/bin/sh
set -e

attempt=1
until python manage.py migrate --noinput; do
    if [ "$attempt" -ge 12 ]; then
        echo "Database migration failed after $attempt attempts."
        exit 1
    fi

    echo "Database unavailable; retrying migration in 10 seconds ($attempt/12)."
    attempt=$((attempt + 1))
    sleep 10
done

python manage.py collectstatic --noinput

exec "$@"

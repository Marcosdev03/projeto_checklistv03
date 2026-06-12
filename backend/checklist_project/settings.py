from pathlib import Path
from decouple import config, Csv
from datetime import timedelta
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# =======================================================
# 🔐 SEGURANÇA
# =======================================================

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="checklists.tech,www.checklists.tech,127.0.0.1,localhost",
    cast=Csv()
)

# =======================================================
# 🔑 APPS
# =======================================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Terceiros
    'rest_framework',
    'corsheaders',

    # Apps próprios
    'authentication',
    'tasks'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',

    # CORS
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'checklist_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR.parent / 'frontend_dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'checklist_project.wsgi.application'

# =======================================================
# 🗄 BANCO DE DADOS
# =======================================================

DATABASE_URL = config('DATABASE_URL', default='')

DATABASES = {
    'default': dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=600,
        ssl_require=config('DATABASE_SSL_REQUIRE', default=True, cast=bool),
    ) if DATABASE_URL else {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / config('DB_NAME', default='db.sqlite3'),
    }
}

# =======================================================
# 🔐 VALIDAÇÃO DE SENHA
# =======================================================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =======================================================
# 🌎 INTERNACIONALIZAÇÃO
# =======================================================

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# =======================================================
# STATIC FILES
# =======================================================
STATIC_URL = '/static/'

# Diretório onde os arquivos estáticos serão COLETADOS
# /app/staticfiles dentro do container
STATIC_ROOT = BASE_DIR / 'staticfiles'

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

WHITENOISE_ROOT = BASE_DIR.parent / 'frontend_dist'

# NOVO: Diretórios ADICIONAIS onde o Django deve PROCURAR arquivos estáticos.
# Esta linha é crucial para garantir que os arquivos do Admin e
# qualquer static file na raiz do projeto sejam encontrados pelo collectstatic.
# STATICFILES_DIRS = [
#     # Adicione aqui o caminho para a pasta 'static' na raiz do seu projeto (se existir)
#     # Exemplo: BASE_DIR / "static"
# ]

# =======================================================
# CUSTOM USER
# =======================================================

AUTH_USER_MODEL = 'authentication.CustomUser'

# =======================================================
# EMAIL
# =======================================================

if DEBUG:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = config("EMAIL_HOST")
    EMAIL_PORT = config("EMAIL_PORT", cast=int)
    EMAIL_USE_TLS = config("EMAIL_USE_TLS", cast=bool)
    EMAIL_HOST_USER = config("EMAIL_HOST_USER")
    EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
    DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# =======================================================
# JWT CONFIG
# =======================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "BLACKLIST_AFTER_ROTATION": True,
}

# =======================================================
# CORS
# =======================================================

CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://checklists.tech,https://www.checklists.tech',
    cast=Csv(),
)

# =======================================================
# TRUSTED ORIGINS (OBRIGATÓRIO COM NGINX)
# =======================================================

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://56.124.122.69:80",
    "http://check.zelchi.com",
    # "https://seu-dominio.com",  # produção
]

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default=(
        "http://localhost:8000,http://127.0.0.1:8000,"
        "http://localhost:5173,http://127.0.0.1:5173,"
        "https://checklists.tech,https://www.checklists.tech"
    ),
    cast=Csv(),
)

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

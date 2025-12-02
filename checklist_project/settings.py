from pathlib import Path
from decouple import config
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# =======================================================
# 🔐 SEGURANÇA
# =======================================================

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="*",
    cast=lambda v: v.split(",")
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
        'DIRS': [],
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

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': config('DB_HOST'),
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'PORT': config('DB_PORT', default='5432'),
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
STATIC_ROOT = BASE_DIR / "staticfiles"

# NOVO: Diretórios ADICIONAIS onde o Django deve PROCURAR arquivos estáticos.
# Esta linha é crucial para garantir que os arquivos do Admin e
# qualquer static file na raiz do projeto sejam encontrados pelo collectstatic.
STATICFILES_DIRS = [
    # Adicione aqui o caminho para a pasta 'static' na raiz do seu projeto (se existir)
    # Exemplo: BASE_DIR / "static"
]

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

CORS_ALLOW_ALL_ORIGINS = True  # dev

# =======================================================
# TRUSTED ORIGINS (OBRIGATÓRIO COM NGINX)
# =======================================================

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    # "https://seu-dominio.com",  # produção
]

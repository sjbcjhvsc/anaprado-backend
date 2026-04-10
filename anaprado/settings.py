"""
Ana Prado – Django Settings
Usa variables de entorno para todos los secretos (ver .env.example)
"""

from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# ──────────────────────────────────────────
# SEGURIDAD
# ──────────────────────────────────────────
SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1").split(",")

# ──────────────────────────────────────────
# APPS
# ──────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Terceros
    "rest_framework",
    "corsheaders",
    # Propias
    "contacto",
    "tienda",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # sirve estáticos en producción
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "anaprado.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "anaprado.wsgi.application"

# ──────────────────────────────────────────
# BASE DE DATOS  (PostgreSQL en producción)
# ──────────────────────────────────────────
#DATABASES = {
#    "default": {
#        "ENGINE": "django.db.backends.postgresql",
#        "NAME":     config("DB_NAME",     default="anaprado_db"),
#        "USER":     config("DB_USER",     default="postgres"),
#        "PASSWORD": config("DB_PASSWORD", default=""),
#        "HOST":     config("DB_HOST",     default="localhost"),
#        "PORT":     config("DB_PORT",     default="5432"),
#    }
#}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ──────────────────────────────────────────
# REST FRAMEWORK
# ──────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "30/hour",   # limita abuso del formulario
    },
}

# ──────────────────────────────────────────
# CORS  – permite peticiones desde el front React
# ──────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000,http://localhost:5173",
).split(",")

CORS_ALLOW_METHODS = ["GET", "POST", "OPTIONS"]
CORS_ALLOW_HEADERS = ["content-type", "x-csrftoken", "accept"]

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:3000,http://localhost:5173",
).split(",")

# ──────────────────────────────────────────
# PAYU – credenciales sandbox / producción
# ──────────────────────────────────────────
PAYU_MERCHANT_ID  = config("PAYU_MERCHANT_ID",  default="")
PAYU_API_KEY      = config("PAYU_API_KEY",       default="")
PAYU_API_LOGIN    = config("PAYU_API_LOGIN",     default="")
PAYU_ACCOUNT_ID   = config("PAYU_ACCOUNT_ID",   default="")
PAYU_TEST         = config("PAYU_TEST",          default=True,  cast=bool)

PAYU_BASE_URL = (
    "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi"
    if PAYU_TEST else
    "https://api.payulatam.com/payments-api/4.0/service.cgi"
)

# URL base del frontend para redirecciones post-pago
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")

# ──────────────────────────────────────────
# INTERNACIONALIZACIÓN
# ──────────────────────────────────────────
LANGUAGE_CODE = "es-co"
TIME_ZONE     = "America/Bogota"
USE_I18N      = True
USE_TZ        = True

# ──────────────────────────────────────────
# ARCHIVOS ESTÁTICOS
# ──────────────────────────────────────────
STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

import dj_database_url

if database_url := config("DATABASE_URL", default=None):
    DATABASES["default"] = dj_database_url.parse(database_url)
    
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
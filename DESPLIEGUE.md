# Ana Prado — Guía de despliegue completa

## Estructura del proyecto

```
anaprado_backend/
├── anaprado/               ← Configuración principal Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── contacto/               ← App formulario de contacto
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── tienda/                 ← App bolsa + pagos PayU
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   └── payu.py             ← Lógica de integración PayU
├── frontend/
│   └── ana-prado-store-v2.jsx  ← React con llamadas reales al backend
├── manage.py
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Endpoints disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/contacto/` | Guarda mensaje de contacto en BD |
| POST | `/api/tienda/checkout/` | Crea orden y procesa pago con PayU |
| POST | `/api/tienda/webhook/` | Recibe notificaciones IPN de PayU |
| GET  | `/api/tienda/orden/<ref>/` | Consulta estado de una orden |
| GET/POST | `/admin/` | Panel de administración Django |

---

## 1. Instalación local (desarrollo)

### Prerequisitos
- Python 3.11+
- PostgreSQL 14+
- Node.js 18+ (para el frontend React)

### Backend

```bash
# 1. Clonar / descomprimir el proyecto
cd anaprado_backend

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Crear base de datos en PostgreSQL
psql -U postgres
CREATE DATABASE anaprado_db;
\q

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# 6. Aplicar migraciones
python manage.py migrate

# 7. Crear superusuario para el admin
python manage.py createsuperuser

# 8. Recopilar archivos estáticos
python manage.py collectstatic --noinput

# 9. Arrancar servidor de desarrollo
python manage.py runserver
# API disponible en http://localhost:8000
```

### Frontend

```bash
# En la carpeta de tu proyecto React (Vite o CRA)
# Copia ana-prado-store-v2.jsx a src/

# Crear archivo .env en el frontend
echo "VITE_API_URL=http://localhost:8000" > .env

npm install
npm run dev
# Frontend en http://localhost:5173
```

---

## 2. Credenciales de PayU

### Obtener credenciales sandbox (pruebas)

1. Ir a https://developers.payulatam.com
2. Crear cuenta de prueba (sandbox)
3. En el panel: **Configuración → Configuración técnica**
4. Copiar: `merchantId`, `apiKey`, `apiLogin`, `accountId`
5. Pegar en tu archivo `.env`

### Tarjetas de prueba PayU (sandbox)

| Franquicia | Número | CVV | Vencimiento |
|------------|--------|-----|-------------|
| Visa | 4111111111111111 | 123 | 12/26 |
| Mastercard | 5500000000000004 | 123 | 12/26 |
| Amex | 378282246310005 | 1234 | 12/26 |

### Activar cuenta de producción

1. Completa el proceso KYC en PayU Colombia
2. Cambia `PAYU_TEST=False` en `.env`
3. Actualiza las credenciales por las de producción

### Configurar webhook en PayU

En el panel de PayU → **Configuración técnica → URL de confirmación**:
```
https://tudominio.com/api/tienda/webhook/
```

---

## 3. Despliegue en producción (VPS / DigitalOcean / AWS)

### Usando Gunicorn + Nginx

```bash
# Instalar Nginx
sudo apt update && sudo apt install nginx -y

# Arrancar con Gunicorn (4 workers recomendado)
gunicorn anaprado.wsgi:application \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --daemon \
  --access-logfile /var/log/gunicorn-access.log \
  --error-logfile /var/log/gunicorn-error.log
```

**Configuración Nginx** (`/etc/nginx/sites-available/anaprado`):

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate     /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Archivos estáticos Django
    location /static/ {
        alias /ruta/a/anaprado_backend/staticfiles/;
    }

    # API Django
    location /api/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Admin Django
    location /admin/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }

    # Frontend React (build estático)
    location / {
        root   /ruta/a/tu-frontend/dist;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Activar sitio y recargar Nginx
sudo ln -s /etc/nginx/sites-available/anaprado /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL gratis con Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

---

## 4. Despliegue en Railway (más sencillo)

Railway es la opción más rápida para Colombia. Todo desde el dashboard:

1. Crear cuenta en https://railway.app
2. **New Project → Deploy from GitHub**
3. Conectar tu repositorio
4. Agregar servicio **PostgreSQL** desde Railway
5. En **Variables** copiar todos los valores de `.env.example`
6. Railway asigna `DATABASE_URL` automáticamente — actualizar `settings.py`:

```python
# Al final de settings.py, agregar:
import dj_database_url
if database_url := config("DATABASE_URL", default=None):
    DATABASES["default"] = dj_database_url.parse(database_url)
```

7. Agregar `dj-database-url` a `requirements.txt`
8. El `Procfile` se genera automáticamente con Gunicorn

---

## 5. Panel de administración

Una vez desplegado, accede a:
```
https://tudominio.com/admin/
```

Desde el admin puedes:
- **Contacto → Mensajes de contacto**: ver todos los mensajes, marcarlos como leídos
- **Tienda → Órdenes**: ver todas las compras con estado (aprobada/rechazada/pendiente), items, totales y respuesta raw de PayU

---

## 6. Checklist antes de salir a producción

- [ ] `DEBUG=False` en `.env`
- [ ] `SECRET_KEY` cambiada por una clave aleatoria larga
- [ ] `PAYU_TEST=False` y credenciales de producción
- [ ] SSL activo (HTTPS)
- [ ] Webhook de PayU apuntando al dominio real
- [ ] `ALLOWED_HOSTS` con el dominio real
- [ ] `CORS_ALLOWED_ORIGINS` con el dominio del frontend
- [ ] `VITE_API_URL` del frontend apuntando al backend real
- [ ] Superusuario del admin creado con contraseña segura
- [ ] Backups automáticos de la BD configurados

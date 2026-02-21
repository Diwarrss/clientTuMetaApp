# Despliegue en VPS (apicooperative + tumetaapp)

Dominios:

- **API:** apicooperative.tecnologicaslf.com → Laravel
- **Frontend:** tumetaapp.tecnologicaslf.com → Nuxt

En el VPS usarás **Docker** para la app y **Nginx** en el host como reverse proxy (y SSL con Certbot).

---

## 1. Requisitos del VPS

- Ubuntu 22.04 o 24.04 (o Debian 11/12)
- Acceso root o sudo
- DNS: que **apicooperative.tecnologicaslf.com** y **tumetaapp.tecnologicaslf.com** apunten al **IP del VPS** (registros A)

---

## 2. Instalar Docker (si no lo tienes)

```bash
# Actualizar e instalar dependencias
sudo apt update && sudo apt install -y ca-certificates curl

# Añadir clave y repo de Docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME:-$VERSION}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker y Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Usuario actual pueda usar Docker (opcional)
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar para que aplique
```

---

## 3. Subir el proyecto al VPS

Desde tu máquina (o desde el VPS si clonas por git):

```bash
# Opción A: clonar por git
cd /opt  # o donde quieras
sudo git clone https://tu-repo/tumetaapp.git
cd tumetaapp

# Opción B: subir con rsync desde tu PC
# rsync -avz --exclude node_modules --exclude vendor ./tumetaapp usuario@IP_VPS:/opt/tumetaapp
```

Estructura esperada en el VPS:

```
/opt/tumetaapp/
├── apiTuMetaApp/
│   └── .env          # con credenciales y URLs de producción
├── clientTuMetaApp/
│   ├── docker-compose.yml
│   └── vps-nginx/    # configs de Nginx
└── .env              # opcional: DB_* para Postgres (si usas compose desde aquí)
```

---

## 4. Configurar variables de entorno (producción)

### 4.1 `apiTuMetaApp/.env`

Edita en el VPS:

```bash
nano /opt/tumetaapp/apiTuMetaApp/.env
```

Ajusta al menos:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://apicooperative.tecnologicaslf.com
FRONTEND_URL=https://tumetaapp.tecnologicaslf.com

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=tumetaapp
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password_seguro

SANCTUM_STATEFUL_DOMAINS=tumetaapp.tecnologicaslf.com
CORS_ALLOWED_ORIGINS=https://tumetaapp.tecnologicaslf.com

# Para que el front (tumetaapp) pueda leer la cookie CSRF que setea la API (apicooperative)
SESSION_DOMAIN=.tecnologicaslf.com
```

> **Si ya desplegaste y ves error CORS** (p. ej. "Access-Control-Allow-Origin' that is not equal to the supplied origin"): edita `apiTuMetaApp/.env` en el VPS y pon `FRONTEND_URL` y `CORS_ALLOWED_ORIGINS` con la URL del front en producción (`https://tumetaapp.tecnologicaslf.com`). Luego reinicia el contenedor API:  
> `docker compose -f clientTuMetaApp/docker-compose.yml restart api`

> **Si ves "Session store not set on request"** al hacer login: `SANCTUM_STATEFUL_DOMAINS` en `apiTuMetaApp/.env` debe incluir el dominio del frontend (solo host, sin `https://`). Ejemplo: `SANCTUM_STATEFUL_DOMAINS=tumetaapp.tecnologicaslf.com`. Reinicia el contenedor API tras cambiar `.env`.

> **Si ves "CSRF token mismatch" (419)** al hacer login: la cookie XSRF-TOKEN la setea la API (apicooperative) y el front (tumetaapp) no puede leerla si cada uno tiene su subdominio. En `apiTuMetaApp/.env` pon `SESSION_DOMAIN=.tecnologicaslf.com` (con el punto delante) para que la cookie se comparta entre subdominios. Reinicia el contenedor API.

Genera `APP_KEY` si no lo tienes (o ejecútalo dentro del contenedor después de levantar):

```bash
cd /opt/tumetaapp/apiTuMetaApp && php artisan key:generate --force
```

(Si no tienes PHP en el host, lo harás en el paso 6 desde el contenedor.)

### 4.2 `.env` en la raíz (para Docker Compose y Postgres)

Si ejecutas compose desde `/opt/tumetaapp`:

```bash
nano /opt/tumetaapp/.env
```

Contenido mínimo (mismas credenciales que en `apiTuMetaApp/.env` y URL de la API para el build del cliente):

```env
DB_DATABASE=tumetaapp
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password_seguro

NUXT_PUBLIC_API_BASE=https://apicooperative.tecnologicaslf.com
```

### 4.3 Cliente Nuxt (URL de la API)

El frontend debe llamar a la API por su URL pública. En el **mismo `.env` de la raíz** (`/opt/tumetaapp/.env`) añade:

```env
NUXT_PUBLIC_API_BASE=https://apicooperative.tecnologicaslf.com
```

Docker Compose usa este valor al construir la imagen del cliente. Si ya construiste antes, vuelve a construir: `docker compose -f clientTuMetaApp/docker-compose.yml build client --no-cache`.

---

## 5. Levantar la aplicación con Docker

Desde la carpeta que contiene `apiTuMetaApp/` y `clientTuMetaApp/` (por ejemplo `/opt/tumetaapp`):

```bash
cd /opt/tumetaapp

# Build y levantar (NUXT_PUBLIC_API_BASE se lee del .env de esta carpeta)
docker compose -f clientTuMetaApp/docker-compose.yml build --no-cache
docker compose -f clientTuMetaApp/docker-compose.yml up -d

# Comprobar que todo está arriba
docker compose -f clientTuMetaApp/docker-compose.yml ps
```

Migraciones y seed (si hace falta):

```bash
docker compose -f clientTuMetaApp/docker-compose.yml exec api php artisan migrate --force
docker compose -f clientTuMetaApp/docker-compose.yml exec api php artisan db:seed --force
```

En este punto la API responde en `http://IP_VPS:8686` y el front en `http://IP_VPS:3737`. Siguiente paso: poner Nginx delante y los dominios.

---

## 6. Instalar Nginx en el VPS (reverse proxy)

```bash
sudo apt update
sudo apt install -y nginx
```

Copiar las configuraciones del repo a Nginx:

```bash
sudo cp clientTuMetaApp/vps-nginx/apicooperative.tecnologicaslf.com.conf /etc/nginx/sites-available/
sudo cp clientTuMetaApp/vps-nginx/tumetaapp.tecnologicaslf.com.conf /etc/nginx/sites-available/

sudo ln -s /etc/nginx/sites-available/apicooperative.tecnologicaslf.com.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/tumetaapp.tecnologicaslf.com.conf /etc/nginx/sites-enabled/
```

Comprobar y recargar Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Comprueba en el navegador (aún en HTTP):

- http://apicooperative.tecnologicaslf.com
- http://tumetaapp.tecnologicaslf.com

---

## 7. Activar HTTPS con Let's Encrypt (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d apicooperative.tecnologicaslf.com -d tumetaapp.tecnologicaslf.com
```

Sigue las preguntas (email, aceptar términos). Certbot modificará los sitios de Nginx y añadirá SSL.

Renovación automática (ya suele estar activa):

```bash
sudo certbot renew --dry-run
```

---

## 8. Comprobar variables finales (Laravel)

Que en `apiTuMetaApp/.env` tengas:

- `APP_URL=https://apicooperative.tecnologicaslf.com`
- `FRONTEND_URL=https://tumetaapp.tecnologicaslf.com`
- `SANCTUM_STATEFUL_DOMAINS=tumetaapp.tecnologicaslf.com`
- `CORS_ALLOWED_ORIGINS=https://tumetaapp.tecnologicaslf.com`

Si cambias algo de entorno, reinicia el contenedor API:

```bash
docker compose -f clientTuMetaApp/docker-compose.yml restart api
```

---

## 9. Resumen de puertos

| Servicio   | Puerto en el host | Dominio                            |
| ---------- | ----------------- | ---------------------------------- |
| API        | 8686              | apicooperative.tecnologicaslf.com  |
| Frontend   | 3737              | tumetaapp.tecnologicaslf.com       |
| PostgreSQL | 5435              | solo local (no exponer a internet) |

Nginx escucha 80/443 y hace proxy a 8686 y 3737.

---

## Comandos útiles en el VPS

```bash
# Logs
docker compose -f clientTuMetaApp/docker-compose.yml logs -f api

# Reiniciar todo el stack
docker compose -f clientTuMetaApp/docker-compose.yml restart

# Parar
docker compose -f clientTuMetaApp/docker-compose.yml down

# Levantar de nuevo
docker compose -f clientTuMetaApp/docker-compose.yml up -d
```

Si algo no carga, revisa que los dominios apunten al VPS y que los contenedores estén en ejecución (`docker ps`).

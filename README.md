# MAO Systems — Landing Page

Landing page oficial de **MAO Systems**, empresa peruana de desarrollo de software y consultoría tecnológica.

**Dominio:** maosystems.io

---

## Stack

| Capa     | Tecnología                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite                     |
| Backend  | Node.js + Express                   |
| Deploy   | Vercel (client) · Render (server)   |

---

## Estructura del proyecto

```
landing/
├── client/          # SPA React — maosystems.io
├── server/          # API Express — api.maosystems.io
├── LANDING_GUIDE.md # Guía completa de setup y despliegue
└── README.md
```

---

## Requisitos

- Node.js >= 18
- npm >= 9

---

## Setup local

### 1. Clonar el repositorio

```bash
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>/landing
```

### 2. Configurar el client

```bash
cd client
npm install
cp .env.example .env
npm run dev
# → http://localhost:3000
```

### 3. Configurar el server

```bash
cd server
npm install
cp .env.example .env
# Editar .env con las credenciales SMTP (ver sección Variables de entorno)
npm run dev
# → http://localhost:5000/health
```

> En desarrollo, Vite hace proxy automático de `/api/*` hacia el server — no se necesita configuración adicional.

---

## Variables de entorno

### `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

### `server/.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
CONTACT_TO_EMAIL=correo-destino@ejemplo.com

# SMTP (opción A — Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# SMTP (opción B — Resend)
# SMTP_HOST=smtp.resend.com
# SMTP_PORT=465
# SMTP_USER=resend
# SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxx
```

> **Nunca subas archivos `.env` con datos reales al repositorio.** Usa siempre las variables de entorno del dashboard de Vercel / Render en producción.

---

## Comandos disponibles

### Client

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build de producción → dist/
npm run preview  # Preview del build en :4173
```

### Server

```bash
npm run dev      # Nodemon (auto-reload en cada cambio)
npm start        # Producción (sin nodemon)
```

---

## Despliegue en producción

| Servicio | Plataforma | Dominio               |
|----------|------------|-----------------------|
| Client   | Vercel     | maosystems.io         |
| Server   | Render     | api.maosystems.io     |

Consulta `LANDING_GUIDE.md` para el paso a paso completo de despliegue, configuración de DNS y variables de entorno en producción.

---

## Variables de entorno en producción

### Vercel (client)

| Variable        | Valor                        |
|-----------------|------------------------------|
| `VITE_API_URL`  | `https://api.maosystems.io`  |

### Render (server)

| Variable             | Valor                          |
|----------------------|--------------------------------|
| `NODE_ENV`           | `production`                   |
| `CLIENT_ORIGIN`      | `https://maosystems.io`        |
| `CONTACT_TO_EMAIL`   | — por completar —              |
| `SMTP_HOST`          | — por completar —              |
| `SMTP_PORT`          | — por completar —              |
| `SMTP_USER`          | — por completar —              |
| `SMTP_PASS`          | — por completar —              |

---

## Flujo de ramas (Git Flow simplificado)

```
develop   →  rama de desarrollo activo
main      →  rama de producción (refleja lo que está en vivo)
```

- Todo el trabajo nuevo se hace en `develop` (o en feature branches que hacen merge a `develop`).
- Cuando hay una versión lista para desplegar, se abre un Pull Request de `develop` → `main`.
- Vercel y Render están configurados para escuchar `main` en auto-deploy.

---

## Licencia

Proyecto privado — MAO Systems © 2025. Todos los derechos reservados.

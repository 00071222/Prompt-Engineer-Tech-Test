# Sistema de Facturación y Control de Inventarios

Este proyecto es una plataforma completa de facturación y control de stock en tiempo real, diseñada con un enfoque robusto que combina la consistencia e inmutabilidad financiera del backend con una experiencia de usuario (UX) interactiva, responsiva y fluida en el frontend.

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** con **Express.js** (TypeScript)
- **Prisma ORM** como motor de mapeo y consultas de base de datos
- **PostgreSQL** mediante el adaptador nativo `@prisma/adapter-pg` y `pg`
- **bcryptjs** para hashing criptográfico de contraseñas
- **jsonwebtoken** para autenticación y protección de endpoints mediante JWT

### Frontend
- **Next.js 16+** (App Router y React Server Components)
- **React 19**
- **Tailwind CSS v4** (Diseño Mobile-First y variables CSS personalizadas)
- **Zustand** para la gestión global y reactiva de estados UI
- **TanStack Query** (React Query) para la sincronización de estado del servidor
- **Auth.js (NextAuth v5)** para gestión segura de sesiones e interceptores JWT

## 📋 Requisitos Previos
- **Node.js**: Versión v20 o superior
- **PostgreSQL**: Base de datos activa y accesible local o remotamente
- **pnpm**: Versión v11 o superior (gestor de paquetes recomendado)

## 🚀 Guía de Instalación Rápida

### 1. Configuración de Variables de Entorno

#### Backend (`/backend/.env`)
Crea un archivo `.env` en la raíz de la carpeta `backend/` con las siguientes variables:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db?schema=public"
JWT_SECRET="clave_secreta_para_firmar_tokens_jwt"
PORT=3001
```

#### Frontend (`/frontend/.env.local`)
Crea un archivo `.env.local` en la raíz de la carpeta `frontend/` con las siguientes variables:
```env
AUTH_SECRET="clave_secreta_aleatoria_para_encriptar_la_sesion"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 2. Puesta en Marcha del Backend
Desde una terminal en la carpeta `/backend`:
```bash
# 1. Instalar dependencias
pnpm install

# 2. Generar el cliente de Prisma basado en el esquema
pnpm prisma generate

# 3. Sincronizar el esquema físico con PostgreSQL
#    (Requiere que DATABASE_URL esté configurado en /backend/.env)
pnpm prisma db push

# 4. Poblar la base de datos con registros semilla (Admin, Clientes, Productos, Facturas)
pnpm prisma db seed

# 5. Compilar código TypeScript a JS (genera la carpeta dist/)
pnpm build

# 6. Iniciar servidor en modo producción (puerto 3001)
pnpm start
```
> **Modo desarrollo:** `pnpm dev` usa nodemon sobre `dist/index.js`.
> Cada vez que modifiques el código fuente, debes recompilar con `pnpm build` para que los cambios surtan efecto.

---

### 3. Puesta en Marcha del Frontend
Desde una terminal en la carpeta `/frontend`:
```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar el servidor Next.js en modo desarrollo (puerto 3000)
#    (Hot-reload automático, no requiere compilación previa)
pnpm dev
```

El panel de control estará accesible en: **`http://localhost:3000`**

> **Para producción:** ejecuta `pnpm build && pnpm start` en lugar de `pnpm dev`.

## 🔑 Credenciales de Seed
- **Email**: admin@empresa.com
- **Password**: admin123

# Sistema de Facturación y Control de Inventarios (Fullstack API & Dashboard)

Este proyecto es una plataforma completa de facturación y control de stock en tiempo real, diseñada con un enfoque robusto que combina la consistencia e inmutabilidad financiera del backend con una experiencia de usuario (UX) interactiva, responsiva y fluida en el frontend.

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** con **Express.js** (TypeScript)
- **Prisma ORM** como motor de mapeo y consultas de base de datos
- **PostgreSQL** mediante el adaptador nativo `@prisma/adapter-pg` y `pg`
- **bcryptjs** para hashing criptográfico de contraseñas
- **jsonwebtoken** para autenticación y protección de endpoints mediante JWT

### Frontend
- **Next.js 15+** (App Router y React Server Components)
- **React 19**
- **Tailwind CSS v4** (Diseño Mobile-First y variables CSS personalizadas)
- **Zustand** para la gestión global y reactiva de estados UI
- **TanStack Query** (React Query) para la sincronización de estado del servidor
- **Auth.js (NextAuth v5)** para gestión segura de sesiones e interceptores JWT

---

## 📋 Requisitos Previos
- **Node.js**: Versión v20 o superior
- **PostgreSQL**: Base de datos activa y accesible local o remotamente
- **pnpm**: Versión v9 o superior (gestor de paquetes recomendado)

---

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

---

### 2. Puesta en Marcha del Backend
Desde una terminal en la carpeta `/backend`:
```bash
# 1. Instalar dependencias
pnpm install

# 2. Generar el cliente de Prisma basado en el esquema
pnpm prisma generate

# 3. Sincronizar el esquema físico con PostgreSQL
pnpm prisma db push

# 4. Poblar la base de datos con registros semilla (Admin, Clientes, Productos, Facturas)
pnpm prisma db seed

# 5. Compilar código TypeScript a JS
pnpm build

# 6. Iniciar servidor en modo producción (puerto 3001)
pnpm start
```
*Para desarrollo con reinicio automático de cambios:* `pnpm dev`

---

### 3. Puesta en Marcha del Frontend
Desde una terminal en la carpeta `/frontend`:
```bash
# 1. Instalar dependencias
pnpm install

# 2. Compilar el proyecto para verificar tipado y optimizaciones
pnpm build

# 3. Iniciar el servidor Next.js en modo desarrollo (puerto 3000)
pnpm dev
```

El panel de control estará accesible en: **`http://localhost:3000`**

---

## 📚 Catálogo de Componentes UI (Reutilizables)

### 1. `<Button />`
Ubicación: `frontend/src/components/ui/button.tsx`
Botón maestro reusable que implementa variantes de estilo Tailwind y control de carga.

#### Props
| Prop | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Define la paleta de colores del botón. |
| `isLoading` | `boolean` | `false` | Activa el spinner interno y deshabilita el elemento. |
| `disabled` | `boolean` | `undefined` | Deshabilita la interacción de forma manual. |

#### Ejemplo de Uso
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" isLoading={cargando} onClick={handleAction}>
  Crear Factura
</Button>
```

---

### 2. `<Input />`
Ubicación: `frontend/src/components/ui/input.tsx`
Campo de entrada modular con soporte para referencias (utilizado con React Hook Form) y visualización de errores.

#### Props
| Prop | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `undefined` | Texto superior que actúa como rótulo descriptivo. |
| `error` | `string` | `undefined` | Mensaje de validación. Si existe, pinta los bordes del input de rojo. |
| `...props` | `InputHTMLAttributes` | `—` | Hereda todos los parámetros estándar de un `<input />` HTML. |

#### Ejemplo de Uso
```tsx
import { Input } from "@/components/ui/input";

<Input 
  label="Cantidad" 
  type="number" 
  error={errors.cantidad?.message} 
  placeholder="1"
  {...register("cantidad")}
/>
```

---

### 3. `<Badge />`
Ubicación: `frontend/src/components/ui/badge.tsx`
Componente ligero para etiquetas de estados con variantes armoniosas de HSL.

#### Props
| Prop | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `variant` | `'BORRADOR' \| 'EMITIDA' \| 'PAGADA' \| 'ANULADA'` | Sí | Determina el estilo de color de fondo y texto del badge. |

#### Estilos Asociados
- `BORRADOR`: Gris / Slate
- `EMITIDA`: Azul / Indigo
- `PAGADA`: Verde / Emerald
- `ANULADA`: Rojo / Rose

#### Ejemplo de Uso
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="PAGADA">PAGADA</Badge>
```

---

### 4. `<GlobalLoader />`
Ubicación: `frontend/src/components/shared/global-loader.tsx`
Pantalla completa modal no interactiva con efecto de desenfoque (`backdrop-blur-sm`), la cual bloquea clics accidentales y duplicados durante transacciones de backend.

#### Estado (Zustand)
Escucha la tienda global `useUIStore` que expone los siguientes métodos y variables:
- `isGlobalLoading` (boolean)
- `showLoader()` (función)
- `hideLoader()` (función)

#### Ejemplo de Uso
```tsx
// Se monta una única vez a nivel de Layout de forma transparente
import GlobalLoader from "@/components/shared/global-loader";

// Desde cualquier componente para activarlo en mutaciones:
import { useUIStore } from "@/store/ui-store";

const showLoader = useUIStore((state) => state.showLoader);
const hideLoader = useUIStore((state) => state.hideLoader);

const fetchApi = async () => {
  showLoader();
  await procesarPago();
  hideLoader();
};
```

---

## 📖 Documentación de la API REST

### 1. Iniciar Sesión `[POST] /api/auth/login`
Endpoint público para validar credenciales y emitir tokens JWT.

#### Request Body
```json
{
  "email": "admin@empresa.com",
  "password": "admin123"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-del-usuario",
    "email": "admin@empresa.com",
    "rol": "ADMIN"
  }
}
```

---

### 2. Crear Nueva Factura `[POST] /api/facturas`
Endpoint protegido para emitir de forma transaccional e inmutable una factura en estado `EMITIDA`.

#### Headers
```http
Authorization: Bearer <token_jwt>
```

#### Request Body
```json
{
  "clienteId": "uuid-del-cliente",
  "detalles": [
    {
      "productoId": "uuid-del-producto",
      "cantidad": 2,
      "porcentajeImpuesto": 16.00
    }
  ]
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Factura emitida exitosamente y stock actualizado.",
  "data": {
    "id": "uuid-factura",
    "numeroFactura": "FAC-000001",
    "estado": "EMITIDA",
    "total": "231.98",
    "detalles": [...]
  }
}
```

---

### 3. Listado de Facturas `[GET] /api/facturas`
Retorna el histórico completo de facturas con sus clientes relacionados.

#### Headers
```http
Authorization: Bearer <token_jwt>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-factura",
      "numeroFactura": "FAC-000001",
      "estado": "EMITIDA",
      "total": "231.98",
      "cliente": {
        "nombre": "Acme Corporation S.A."
      }
    }
  ]
}
```
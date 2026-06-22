# Sistema de Facturación y Control de Inventarios (Backend API)

Este repositorio contiene la capa del backend de una plataforma de facturación robusta construida con **Node.js**, **Express**, **TypeScript** y **Prisma**. El sistema está diseñado bajo principios de inmutabilidad financiera (preservación histórica de precios y nombres ante cambios de catálogo) e integridad transaccional de inventarios en tiempo real con blindaje contra condiciones de carrera.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- Node.js (v18+)
- pnpm (v9+)
- Base de datos PostgreSQL activa

### Instalación y Configuración
1. Instalar dependencias en el directorio del backend:
   ```bash
   pnpm install
   ```
2. Configurar las variables de entorno en un archivo `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/mi_base_datos?schema=public"
   JWT_SECRET="mi_secreto_super_seguro"
   PORT=3000
   ```
3. Generar el cliente de Prisma:
   ```bash
   pnpm prisma generate
   ```
4. Compilar el proyecto TypeScript:
   ```bash
   pnpm build
   ```
5. Iniciar en modo desarrollo:
   ```bash
   pnpm dev
   ```

---

## 📖 Documentación de la API

### 🛡️ Seguridad y Autenticación
Todos los endpoints bajo el prefijo `/api` (a excepción de endpoints públicos de salud) requieren autenticación por medio de un JSON Web Token (JWT).
- **Esquema de Autenticación**: Bearer Authentication
- **Header Requerido**: `Authorization: Bearer <JWT_TOKEN>`
- **Payload esperado en el Token**:
  ```json
  {
    "userId": "uuid-del-usuario",
    "rol": "VENDEDOR | ADMIN | CONTADOR"
  }
  ```

---

### 🧾 Crear Nueva Factura [POST] `/api/facturas`

#### Descripción
Crea, calcula y emite de manera atómica una nueva factura comercial en estado `EMITIDA`. La lógica de negocio está totalmente blindada dentro de una transacción interactiva de base de datos que garantiza las siguientes reglas de consistencia:
1. **Verificación de Entidades**: Valida que tanto el cliente (`clienteId`) como el usuario emisor (`req.userId`, extraído de forma segura del JWT) existan en la base de datos.
2. **Cálculo Centralizado**: Ignora cualquier total o precio unitario enviado en la petición. Los subtotales e impuestos se calculan estrictamente en el backend utilizando los precios actuales del catálogo de productos y precisión decimal (`Prisma.Decimal`).
3. **Inmutabilidad Financiera**: Congela el `precioUnitario` y el `nombreProducto` dentro del detalle de la factura. Si en el futuro se editan los precios o nombres del catálogo general, la factura emitida preservará los valores con los que fue facturada originalmente.
4. **Control de Inventarios**: Evalúa atómicamente si hay existencias suficientes de cada producto. Utiliza una actualización selectiva con exclusión condicional (`where: { stock: { gte: cantidad } }`) para evitar condiciones de carrera (*Race Conditions*) bajo alta concurrencia.
5. **Consecutivo Legal**: Genera secuencialmente el número de la factura con formato `FAC-XXXXXX` e inicia el ciclo de vida del documento en `EMITIDA` con fecha de emisión del servidor.

#### Headers Requeridos
```http
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

#### Cuerpo de la Petición (Request Body)
| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `clienteId` | `String (UUID)` | Sí | Identificador único del cliente receptor. |
| `detalles` | `Array<Object>` | Sí | Listado de artículos a facturar. |
| `detalles[].productoId` | `String (UUID)` | Sí | Identificador único del producto en el catálogo. |
| `detalles[].cantidad` | `Int` | Sí | Cantidad física a facturar (debe ser mayor a `0`). |
| `detalles[].porcentajeImpuesto` | `Decimal` | Sí | Porcentaje de tasa impositiva aplicable (Ej: `16.00` representa el 16% de IVA). |

##### Ejemplo de Payload (JSON)
```json
{
  "clienteId": "a7b3c2d4-1234-5678-90ab-cdef12345678",
  "detalles": [
    {
      "productoId": "8f3e2d1c-5678-1234-90ab-cdef90ab1234",
      "cantidad": 5,
      "porcentajeImpuesto": 16.00
    },
    {
      "productoId": "c9b8a7f6-90ab-1234-5678-cdef12345678",
      "cantidad": 2,
      "porcentajeImpuesto": 8.00
    }
  ]
}
```

---

#### Respuestas Esperadas (Responses)

##### 🟢 201 Created (Factura Creada Exitosamente)
Retorna la factura recién emitida, incluyendo sus detalles históricos congelados y la información del cliente.
```json
{
  "success": true,
  "message": "Factura emitida exitosamente y stock actualizado.",
  "data": {
    "id": "e4f5a6b7-cdef-1234-5678-90abcdef1234",
    "numeroFactura": "FAC-000045",
    "fechaEmision": "2026-06-22T21:15:30.123Z",
    "estado": "EMITIDA",
    "subtotal": "550.00",
    "totalImpuestos": "80.00",
    "total": "630.00",
    "clienteId": "a7b3c2d4-1234-5678-90ab-cdef12345678",
    "usuarioId": "d5e4c3b2-90ab-5678-1234-cdef12345678",
    "createdAt": "2026-06-22T21:15:30.123Z",
    "updatedAt": "2026-06-22T21:15:30.123Z",
    "detalles": [
      {
        "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
        "facturaId": "e4f5a6b7-cdef-1234-5678-90abcdef1234",
        "productoId": "8f3e2d1c-5678-1234-90ab-cdef90ab1234",
        "nombreProducto": "Teclado Mecánico RGB",
        "cantidad": 5,
        "precioUnitario": "100.00",
        "porcentajeImpuesto": "16.00",
        "montoImpuesto": "80.00",
        "subtotal": "500.00",
        "total": "580.00"
      },
      {
        "id": "5e6f7g8h-90ab-cdef-1234-567890abcdef",
        "facturaId": "e4f5a6b7-cdef-1234-5678-90abcdef1234",
        "productoId": "c9b8a7f6-90ab-1234-5678-cdef12345678",
        "nombreProducto": "Cable HDMI 2.1",
        "cantidad": 2,
        "precioUnitario": "25.00",
        "porcentajeImpuesto": "8.00",
        "montoImpuesto": "0.00",
        "subtotal": "50.00",
        "total": "50.00"
      }
    ],
    "cliente": {
      "id": "a7b3c2d4-1234-5678-90ab-cdef12345678",
      "documentoId": "12345678-9",
      "nombre": "Acme Corporation S.A."
    }
  }
}
```

##### 🟡 400 Bad Request (Violación de Reglas de Negocio / Validaciones)
Ocurre cuando la petición no pasa los filtros de validación de estructura de datos o infringe una regla de negocio del negocio (como falta de existencias).

- **Ejemplo: Producto inactivo o inexistente**
  ```json
  {
    "success": false,
    "error": "El producto con ID 8f3e2d1c-5678-1234-90ab-cdef90ab1234 no existe."
  }
  ```
- **Ejemplo: Stock Insuficiente o Conflicto Concurrente (Race Condition)**
  ```json
  {
    "success": false,
    "error": "No se pudo actualizar el stock para 'Teclado Mecánico RGB'. Posible stock insuficiente o producto inactivo debido a una compra concurrente."
  }
  ```
- **Ejemplo: Formato incorrecto o campos vacíos**
  ```json
  {
    "success": false,
    "error": "Datos de entrada inválidos. Se requiere clienteId y un arreglo detalles no vacío."
  }
  ```

##### 🔴 401 Unauthorized (Autenticación fallida o ausente)
Ocurre si el token de autenticación no es provisto, está mal estructurado o ha expirado.
```json
{
  "success": false,
  "error": "Token inválido o expirado."
}
```

##### 🔴 500 Internal Server Error (Fallo general del servidor)
Retornado en caso de que ocurra un error imprevisto de infraestructura o base de datos fuera de la lógica comercial común.
```json
{
  "success": false,
  "error": "Error interno del servidor. Intente más tarde."
}
```

---

#### Ejemplo de Uso (cURL)
Reemplaza `<JWT_TOKEN>` por un token válido generado por tu sistema de autenticación antes de ejecutar el comando en la terminal:

```bash
curl -X POST http://localhost:3000/api/facturas \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "a7b3c2d4-1234-5678-90ab-cdef12345678",
    "detalles": [
      {
        "productoId": "8f3e2d1c-5678-1234-90ab-cdef90ab1234",
        "cantidad": 2,
        "porcentajeImpuesto": 16.00
      }
    ]
  }'
```

---

### 🔍 Verificar Salud del Servidor [GET] `/health`

#### Descripción
Endpoint público y ligero utilizado para verificar la disponibilidad y estado del servidor backend (utilizado comúnmente en herramientas de orquestación, balanceadores de carga y health checks de contenedores). No requiere token de autenticación.

#### Ejemplo de Respuesta (200 OK)
```json
{
  "status": "healthy"
}
```

#### Ejemplo de Uso (cURL)
```bash
curl -X GET http://localhost:3000/health
```
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

## 📖 Documentación de la API

### 🛡️ Seguridad y Autenticación
Todos los endpoints bajo el prefijo `/api` (a excepción de `/api/auth/login`) requieren autenticación por medio de un JSON Web Token (JWT) firmado.
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

### 🔑 Autenticación (Auth)

#### 🟢 Autenticar Usuario [POST] `/api/auth/login`
- **Descripción**: Inicia sesión en el sistema y retorna un token JWT válido por 8 horas.
- **Body (JSON)**:
  ```json
  {
    "email": "admin@empresa.com",
    "password": "admin123"
  }
  ```
- **Respuesta (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "d5e4c3b2-90ab-5678-1234-cdef12345678",
      "email": "admin@empresa.com",
      "rol": "ADMIN"
    }
  }
  ```
- **Respuesta (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": "Credenciales inválidas."
  }
  ```

---

### 🧾 Facturas (Invoices)

#### 🟢 Crear Nueva Factura / Borrador [POST] `/api/facturas`
- **Descripción**: Crea una nueva factura comercial en estado `EMITIDA` (por defecto) o `BORRADOR`.
  Si se emite como `EMITIDA`:
  - Valida stock y estado activo del producto de manera atómica con transacción interactiva.
  - Decrementa el stock del inventario.
  - Genera el correlativo oficial secuencial `FAC-XXXXXX`.
  - Congela los precios y nombres históricos de los productos.
  Si se emite como `BORRADOR`:
  - Guarda los ítems sin alterar existencias de inventario ni generar correlativo legal.
- **Body (JSON)**:
  ```json
  {
    "clienteId": "uuid-del-cliente",
    "estado": "EMITIDA | BORRADOR",
    "detalles": [
      {
        "productoId": "uuid-del-producto",
        "cantidad": 5,
        "porcentajeImpuesto": 16.00
      }
    ]
  }
  ```
- **Respuesta (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Factura emitida exitosamente y stock actualizado.",
    "data": {
      "id": "e4f5a6b7-cdef-1234-5678-90abcdef1234",
      "numeroFactura": "FAC-000045",
      "fechaEmision": "2026-06-22T21:15:30.123Z",
      "estado": "EMITIDA",
      "subtotal": "500.00",
      "totalImpuestos": "80.00",
      "total": "580.00",
      "clienteId": "a7b3c2d4-1234-5678-90ab-cdef12345678",
      "usuarioId": "d5e4c3b2-90ab-5678-1234-cdef12345678",
      "detalles": [
        {
          "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
          "productoId": "8f3e2d1c-5678-1234-90ab-cdef90ab1234",
          "nombreProducto": "Teclado Mecánico RGB",
          "cantidad": 5,
          "precioUnitario": "100.00",
          "porcentajeImpuesto": "16.00",
          "montoImpuesto": "80.00",
          "subtotal": "500.00",
          "total": "580.00"
        }
      ]
    }
  }
  ```

#### 🟢 Obtener Listado de Facturas [GET] `/api/facturas`
- **Descripción**: Obtiene el listado histórico de facturas en orden cronológico descendente, incluyendo nombre y RUT/documento del cliente.
- **Respuesta (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e4f5a6b7-cdef-1234-5678-90abcdef1234",
        "numeroFactura": "FAC-000045",
        "fechaEmision": "2026-06-22T21:15:30.123Z",
        "estado": "EMITIDA",
        "total": "580.00",
        "cliente": {
          "nombre": "Acme Corporation S.A.",
          "documentoId": "12345678-9"
        }
      }
    ]
  }
  ```

#### 🟢 Obtener Detalles de una Factura [GET] `/api/facturas/:id`
- **Descripción**: Recupera el detalle completo de una factura específica mediante su ID.
- **Respuesta (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e4f5a6b7-cdef-1234-5678-90abcdef1234",
      "numeroFactura": "FAC-000045",
      "estado": "EMITIDA",
      "subtotal": "500.00",
      "totalImpuestos": "80.00",
      "total": "580.00",
      "cliente": {
        "id": "a7b3c2d4-1234-5678-90ab-cdef12345678",
        "nombre": "Acme Corporation S.A.",
        "documentoId": "12345678-9",
        "email": "contacto@acme.com"
      },
      "detalles": [
        {
          "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
          "productoId": "8f3e2d1c-5678-1234-90ab-cdef90ab1234",
          "nombreProducto": "Teclado Mecánico RGB",
          "cantidad": 5,
          "precioUnitario": "100.00",
          "porcentajeImpuesto": "16.00",
          "montoImpuesto": "80.00",
          "subtotal": "500.00",
          "total": "580.00"
        }
      ]
    }
  }
  ```

#### 🟢 Actualizar / Emitir Factura Borrador [PUT] `/api/facturas/:id`
- **Descripción**: Permite reescribir y actualizar los ítems de una factura en estado `BORRADOR`, o realizar su transición oficial a `EMITIDA` (aplicando el descuento de inventario correspondiente y generando el consecutivo `FAC-XXXXXX`). Las facturas que ya han sido emitidas son inmutables y devolverán un error `400`.
- **Body (JSON)**: Igual que `POST /api/facturas`.
- **Respuesta (200 OK)**: Retorna la factura modificada y el estado del procesamiento.

---

### 👥 Clientes (Clients)

#### 🟢 Obtener Listado de Clientes [GET] `/api/clientes`
- **Descripción**: Obtiene la lista de clientes. Admite búsquedas y paginación rápida de hasta 20 resultados por defecto.
- **Query Params**:
  - `search` (opcional): Filtra por nombre o documento ID (RUT) con coincidencia insensible a mayúsculas y minúsculas (ej: `/api/clientes?search=Acme`).
- **Respuesta (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "a7b3c2d4-1234-5678-90ab-cdef12345678",
        "documentoId": "12345678-9",
        "nombre": "Acme Corporation S.A.",
        "email": "contacto@acme.com",
        "telefono": "+56912345678",
        "direccion": "Av. Industrial 1234, Santiago"
      }
    ]
  }
  ```

#### 🟢 Crear Nuevo Cliente [POST] `/api/clientes`
- **Descripción**: Crea un nuevo cliente receptor.
- **Body (JSON)**:
  ```json
  {
    "documentoId": "12345678-9",
    "nombre": "Acme Corporation S.A.",
    "email": "contacto@acme.com",
    "telefono": "+56912345678",
    "direccion": "Av. Industrial 1234, Santiago"
  }
  ```
- **Respuesta (201 Created)**: Retorna el objeto del cliente recién creado.
- **Respuesta (400 Bad Request)**: Si el `documentoId` ya se encuentra registrado.

#### 🟢 Actualizar Cliente [PUT] `/api/clientes/:id`
- **Descripción**: Modifica la ficha de datos de un cliente existente.
- **Body (JSON)**: Igual que `POST /api/clientes`.
- **Respuesta (200 OK)**: Retorna el cliente actualizado.

#### 🟢 Eliminar Cliente [DELETE] `/api/clientes/:id`
- **Descripción**: Elimina a un cliente de la base de datos si no cuenta con facturas asociadas.
- **Respuesta (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cliente eliminado correctamente."
  }
  ```
- **Respuesta (409 Conflict)**: Si el cliente posee transacciones o facturas, garantizando la integridad referencial.
  ```json
  {
    "success": false,
    "error": "No se puede eliminar el cliente porque tiene facturas asociadas."
  }
  ```

---

### 📦 Catálogo de Productos (Products)

#### 🟢 Obtener Catálogo de Productos [GET] `/api/productos`
- **Descripción**: Obtiene la lista de todos los productos en el inventario.
- **Respuesta (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "8f3e2d1c-5678-1234-90ab-cdef90ab1234",
        "codigo": "PROD-MSI-240",
        "nombre": "Monitor MSI Optix 240Hz",
        "descripcion": "Monitor gamer de alto rendimiento",
        "precio": "299.99",
        "stock": 50,
        "activo": true
      }
    ]
  }
  ```

#### 🟢 Crear Nuevo Producto [POST] `/api/productos`
- **Descripción**: Añade un nuevo producto al catálogo.
- **Body (JSON)**:
  ```json
  {
    "codigo": "PROD-MSI-240",
    "nombre": "Monitor MSI Optix 240Hz",
    "descripcion": "Monitor gamer de alto rendimiento",
    "precio": "299.99",
    "stock": 50,
    "activo": true
  }
  ```
- **Respuesta (201 Created)**: Retorna el objeto del producto creado.

#### 🟢 Actualizar Producto [PUT] `/api/productos/:id`
- **Descripción**: Modifica los datos de un producto.
- **Body (JSON)**: Igual que `POST /api/productos`.
- **Respuesta (200 OK)**: Retorna el producto modificado.

---

### 🔍 Verificar Salud del Servidor [GET] `/health`
- **Descripción**: Endpoint público y ligero utilizado para verificar la disponibilidad y estado del servidor backend. No requiere token.
- **Respuesta (200 OK)**:
  ```json
  {
    "status": "healthy"
  }
  ```
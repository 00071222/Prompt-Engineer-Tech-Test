# Plan de Mejoras y Producción

Este documento detalla la hoja de ruta técnica y arquitectónica recomendada para elevar la presente aplicación a estándares de producción reales, garantizando seguridad, tolerancia a fallos, alta disponibilidad y cumplimiento normativo de auditoría financiera.

---

## 1. Infraestructura, Contenerización y Orquestación

### Diagnóstico Actual
La aplicación corre localmente sobre Node.js directo y asume dependencias instaladas en el sistema operativo local.

### Propuesta de Producción
1. **Contenerización con Docker**: Crear imágenes de Docker multi-etapa (*multi-stage builds*) para el Backend y Frontend para reducir el tamaño final de la imagen y omitir dependencias de desarrollo en el entorno final:
   - **Backend**: Imagen base de Node Alpine, copia de código precompilado (`/dist`), y producción de `node_modules` reducidos.
   - **Frontend**: Servido bajo modo standalone de Next.js o empaquetado para distribución optimizada.
2. **Orquestación mediante Kubernetes (K8s)**:
   - Implementar un clúster de K8s para gestionar el ciclo de vida y escalado automático de los Pods.
   - Configurar **HPA (Horizontal Pod Autoscaler)** basado en consumo de CPU/Memoria.
   - Configurar **Probes (Liveness & Readiness)** apuntando al endpoint `/health` para autorecuperación inmediata ante bloqueos de hilos o caídas del runtime.

---

## 2. Rendimiento, Escalabilidad y Caché

### Diagnóstico Actual
Las consultas al catálogo de productos y clientes tocan de manera directa PostgreSQL en cada render o petición del frontend. Un pico de tráfico podría saturar el pool de conexiones de la base de datos física.

### Propuesta de Producción
1. **Caché en Memoria con Redis**:
   - Almacenar el catálogo de productos activos (`GET /api/productos`) en Redis utilizando una estrategia de cache-aside.
   - Tiempo de expiración (TTL) controlado (ej. 30 minutos) con invalidación reactiva mediante eventos al actualizar el inventario.
2. **Limitación de Peticiones (Rate Limiting)**:
   - Implementar middlewares como `express-rate-limit` y `redis-rate-limiter` en el backend para frenar ataques de fuerza bruta en `/auth/login` y abusos en la creación de facturas.
3. **Optimización de Conexiones**:
   - Integrar un orquestador de conexiones de bases de datos como **PgBouncer** frente a PostgreSQL para centralizar miles de micro-conexiones simultáneas en un pool virtualizado y eficiente.

---

## 3. Procesamiento Asíncrono y Desacoplamiento (Workers)

### Diagnóstico Actual
La generación de PDFs, reportes fiscales o integraciones con pasarelas de pago se ejecutan de manera síncrona en el hilo principal. Operaciones de E/S de este tipo bloquean el *Event Loop* de Node.js, degradando el rendimiento del servidor completo.

### Propuesta de Producción
1. **Cola de Mensajes y Arquitectura Asíncrona**:
   - Integrar un agente de colas como **RabbitMQ** o **Amazon SQS**.
   - Cuando se crea una factura exitosamente en Express, se emite un evento `invoice.created` a la cola.
2. **Worker Nodes Desacoplados**:
   - Desarrollar microservicios ligeros e independientes (Workers) en Node.js o Go, cuya única responsabilidad sea consumir eventos de la cola.
   - El Worker toma el evento, genera el PDF de forma asíncrona, lo almacena en un Bucket S3 y notifica al cliente final vía WebSocket o correo electrónico.
   - Esto mantiene la API REST del backend ligera y libre de tareas intensivas de CPU.

---

## 4. Validación robusta de Capa de Red (Network Middleware)

### Diagnóstico Actual
La entrada de datos se valida mediante condicionales `if` manuales. La falta de sanitización estricta expone la aplicación a datos inconsistentes y vulnerabilidades por payloads maliciosos.

### Propuesta de Producción
1. **Validación Declarativa con Zod o Joi**:
   - Incorporar esquemas Zod a nivel de middleware en Express para interceptar y validar los payloads entrantes.
   - Si el payload no cumple estrictamente con el esquema esperado, se detiene la ejecución en la red antes de iniciar la transacción en Prisma o consultar la base de datos, ahorrando recursos de hardware.
2. **Ejemplo de Middleware de Validación**:
   ```typescript
   import { z } from 'zod';
   
   const createInvoiceSchema = z.object({
     clienteId: z.string().uuid(),
     detalles: z.array(
       z.object({
         productoId: z.string().uuid(),
         cantidad: z.number().int().positive(),
         porcentajeImpuesto: z.number().min(0).max(100),
       })
     ).nonempty(),
   });
   
   export const validateCreateInvoice = (req: Request, res: Response, next: NextFunction) => {
     const result = createInvoiceSchema.safeParse(req.body);
     if (!result.success) {
       return res.status(400).json({ success: false, errors: result.error.errors });
     }
     next();
   };
   ```

---

## 5. Auditoría Financiera y Registro Inmutable (Compliance)

### Diagnóstico Actual
Si un administrador modifica los datos de un cliente o descontinúa un producto, no hay registros de versiones previas ni bitácoras de auditoría de modificaciones a nivel de base de datos.

### Propuesta de Producción
1. **Tablas Espejo (Shadow Tables) e Históricos**:
   - Crear tablas de auditoría `clientes_auditoria` y `productos_auditoria`.
   - Implementar **Triggers (Desparadores)** directamente en PostgreSQL a nivel de base de datos.
   - Cualquier sentencia `UPDATE` o `DELETE` copia de forma instantánea el estado anterior del registro en la tabla espejo, capturando el ID de sesión, acción de base de datos (`UPDATE`/`DELETE`) y la marca de tiempo de la operación.
2. **Inmutabilidad Absoluta**:
   - Denegar explícitamente permisos de `DELETE` y `UPDATE` sobre la tabla `facturas` y `facturas_detalles` a nivel de base de datos mediante permisos de roles de base de datos (PostgreSQL Security Group Roles). Las facturas emitidas son inmutables por ley; cualquier corrección posterior debe realizarse emitiendo una Nota de Crédito (otra factura con importes negativos), garantizando la transparencia contable y el cumplimiento fiscal.


## 6. Roles
### 1. Roles de Autenticación y Autorización (RBAC)

Actualmente la aplicación solo cuenta con un rol ADMIN que puede realizar todas las acciones. Es fundamental implementar un esquema de **Control de Acceso Basado en Roles (RBAC)** para separar las responsabilidades y mejorar la seguridad.

- **Administrador**:
  - Puede crear, editar y deshabilitar productos.
  - Puede crear, editar y deshabilitar clientes.
  - Puede ver y gestionar todas las facturas.
  - Puede ver todos los usuarios.
  - Puede gestionar roles y permisos (futuro).

- **Editor/Contable**:
  - Puede crear y editar facturas.(futuro)
  - Puede editar productos y clientes (control de inventario).(futuro)
  - No puede ver información sensible como salarios o datos de empleados (si se implementan en el futuro).(futuro)

- **Cliente/Solo Lectura**:
  - Puede ver sus propias facturas.(futuro)
  - No puede realizar modificaciones.(futuro)
  - Puede ver el catálogo de productos para referencia.(futuro)
  
## 7. Modo dia
actualmente solo cuenta con un modo noche el cual esta activado por defecto al iniciar la aplicacion es necesario implementar el modo dia el cual se puede activar y desactivar mediante un boton el cual se encuentra ubicado en la barra lateral izquierda. (a futuro)

## 8. Soft-delete
Manejar todos los datos con un soft delete para mantener persistencia de la informacion y respaldo de la informacion historica.
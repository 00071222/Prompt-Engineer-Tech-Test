import { PrismaClient, Rol, EstadoFactura, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Iniciando Sembrado de la Base de Datos ---');

  // 1. Limpieza inicial en orden inverso de dependencias de FK
  console.log('Limpiando registros antiguos...');
  await prisma.facturaDetalle.deleteMany();
  await prisma.factura.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();

  // 2. Creación del Usuario Administrador
  console.log('Sembrando usuario administrador...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@empresa.com',
      passwordHash: passwordHash,
      rol: Rol.ADMIN,
    },
  });

  // 3. Creación de Clientes
  console.log('Sembrando clientes...');
  const cliente1 = await prisma.cliente.create({
    data: {
      documentoId: '12345678-9',
      nombre: 'Acme Corporation S.A.',
      email: 'contacto@acme.com',
      telefono: '+56912345678',
      direccion: 'Av. Industrial 1234, Santiago',
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      documentoId: '98765432-1',
      nombre: 'Tech Solutions Ltda',
      email: 'ventas@techsolutions.cl',
      telefono: '+56987654321',
      direccion: 'Paseo Tecnológico 500, Santiago',
    },
  });

  // 4. Creación de Productos
  // Los stocks reflejan el estado POST-VENTA (ya descontadas las unidades
  // de las facturas EMITIDA y PAGADA sembradas a continuación):
  //   - MSI:     50 unidades (solo aparece en BORRADOR, no se descuenta)
  //   - Pixel:   19 unidades (20 iniciales - 1 vendida en FAC-000001 EMITIDA)
  //   - Razer:   29 unidades (30 iniciales - 1 vendida en FAC-000002 PAGADA)
  //   - Samsung: 97 unidades (100 iniciales - 3 vendidas: 2 en BORRADOR [no descuenta] + 1 en PAGADA)
  //   Nota: el BORRADOR no descuenta stock; solo EMITIDA y PAGADA lo hacen.
  console.log('Sembrando catálogo de productos...');
  const msi = await prisma.producto.create({
    data: {
      codigo: 'PROD-MSI-240',
      nombre: 'Monitor MSI Optix 240Hz',
      descripcion: 'Monitor gamer de alto rendimiento de 24 pulgadas FHD.',
      precio: new Prisma.Decimal(299.99),
      stock: 50,  // Sin ventas emitidas; aparece solo en BORRADOR
      activo: true,
    },
  });

  const razer = await prisma.producto.create({
    data: {
      codigo: 'PROD-RAZ-HUN',
      nombre: 'Teclado Razer Huntsman V2 8kHz Polling Rate',
      descripcion: 'Teclado óptico analógico para juegos con tasa de sondeo ultra rápida.',
      precio: new Prisma.Decimal(189.99),
      stock: 29,  // 30 iniciales - 1 en FAC-000002 (PAGADA)
      activo: true,
    },
  });

  const pixel = await prisma.producto.create({
    data: {
      codigo: 'PROD-GOG-PX8',
      nombre: 'Google Pixel 8',
      descripcion: 'Smartphone de Google con cámara de última generación e inteligencia artificial.',
      precio: new Prisma.Decimal(699.00),
      stock: 19,  // 20 iniciales - 1 en FAC-000001 (EMITIDA)
      activo: true,
    },
  });

  const samsung = await prisma.producto.create({
    data: {
      codigo: 'PROD-SAM-25W',
      nombre: 'Cargador Samsung 25W USB-C',
      descripcion: 'Cargador de pared de carga rápida con entrada tipo C.',
      precio: new Prisma.Decimal(19.99),
      stock: 99,  // 100 iniciales - 1 en FAC-000002 (PAGADA). Los 2 del BORRADOR no descuentan.
      activo: true,
    },
  });

  // 5. Creación de Facturas de Prueba

  // Factura 1: BORRADOR (No requiere numeroFactura ni fechaEmision legal)
  console.log('Creando Factura 1: BORRADOR...');
  await prisma.factura.create({
    data: {
      estado: EstadoFactura.BORRADOR,
      numeroFactura: null,
      fechaEmision: null,
      subtotal: new Prisma.Decimal(339.97),
      totalImpuestos: new Prisma.Decimal(54.40),
      total: new Prisma.Decimal(394.37),
      clienteId: cliente1.id,
      usuarioId: admin.id,
      detalles: {
        create: [
          {
            productoId: msi.id,
            nombreProducto: msi.nombre,
            cantidad: 1,
            precioUnitario: msi.precio,
            porcentajeImpuesto: new Prisma.Decimal(16.00),
            montoImpuesto: new Prisma.Decimal(48.00),
            subtotal: new Prisma.Decimal(299.99),
            total: new Prisma.Decimal(347.99),
          },
          {
            productoId: samsung.id,
            nombreProducto: samsung.nombre,
            cantidad: 2,
            precioUnitario: samsung.precio,
            porcentajeImpuesto: new Prisma.Decimal(16.00),
            montoImpuesto: new Prisma.Decimal(6.40),
            subtotal: new Prisma.Decimal(39.98),
            total: new Prisma.Decimal(46.38),
          },
        ],
      },
    },
  });

  // Factura 2: EMITIDA (Requiere numeroFactura y fechaEmision legal)
  console.log('Creando Factura 2: EMITIDA...');
  await prisma.factura.create({
    data: {
      estado: EstadoFactura.EMITIDA,
      numeroFactura: 'FAC-000001',
      fechaEmision: new Date(),
      subtotal: new Prisma.Decimal(699.00),
      totalImpuestos: new Prisma.Decimal(111.84),
      total: new Prisma.Decimal(810.84),
      clienteId: cliente1.id,
      usuarioId: admin.id,
      detalles: {
        create: [
          {
            productoId: pixel.id,
            nombreProducto: pixel.nombre,
            cantidad: 1,
            precioUnitario: pixel.precio,
            porcentajeImpuesto: new Prisma.Decimal(16.00),
            montoImpuesto: new Prisma.Decimal(111.84),
            subtotal: new Prisma.Decimal(699.00),
            total: new Prisma.Decimal(810.84),
          },
        ],
      },
    },
  });

  // Factura 3: PAGADA
  console.log('Creando Factura 3: PAGADA...');
  await prisma.factura.create({
    data: {
      estado: EstadoFactura.PAGADA,
      numeroFactura: 'FAC-000002',
      fechaEmision: new Date(),
      subtotal: new Prisma.Decimal(209.98),
      totalImpuestos: new Prisma.Decimal(33.60),
      total: new Prisma.Decimal(243.58),
      clienteId: cliente2.id,
      usuarioId: admin.id,
      detalles: {
        create: [
          {
            productoId: razer.id,
            nombreProducto: razer.nombre,
            cantidad: 1,
            precioUnitario: razer.precio,
            porcentajeImpuesto: new Prisma.Decimal(16.00),
            montoImpuesto: new Prisma.Decimal(30.40),
            subtotal: new Prisma.Decimal(189.99),
            total: new Prisma.Decimal(220.39),
          },
          {
            productoId: samsung.id,
            nombreProducto: samsung.nombre,
            cantidad: 1,
            precioUnitario: samsung.precio,
            porcentajeImpuesto: new Prisma.Decimal(16.00),
            montoImpuesto: new Prisma.Decimal(3.20),
            subtotal: new Prisma.Decimal(19.99),
            total: new Prisma.Decimal(23.19),
          },
        ],
      },
    },
  });

  // Factura 4: ANULADA (cubre el cuarto estado del enum EstadoFactura)
  // Una factura anulada mantiene registro histórico pero su saldo neto es cero.
  // El stock NO se descuenta (fue anulada antes o durante la emisión).
  console.log('Creando Factura 4: ANULADA...');
  await prisma.factura.create({
    data: {
      estado: EstadoFactura.ANULADA,
      numeroFactura: 'FAC-000003',
      fechaEmision: new Date(),
      subtotal: new Prisma.Decimal(189.99),
      totalImpuestos: new Prisma.Decimal(30.40),
      total: new Prisma.Decimal(220.39),
      clienteId: cliente2.id,
      usuarioId: admin.id,
      detalles: {
        create: [
          {
            productoId: razer.id,
            nombreProducto: razer.nombre,
            cantidad: 1,
            precioUnitario: razer.precio,
            porcentajeImpuesto: new Prisma.Decimal(16.00),
            montoImpuesto: new Prisma.Decimal(30.40),
            subtotal: new Prisma.Decimal(189.99),
            total: new Prisma.Decimal(220.39),
          },
        ],
      },
    },
  });

  console.log('--- Sembrado Completado con Éxito ---');
}

main()
  .catch((e) => {
    console.error('Error durante el sembrado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

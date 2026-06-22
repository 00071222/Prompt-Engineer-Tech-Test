import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma, EstadoFactura } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Inicialización del cliente utilizando el adaptador de base de datos de Prisma 7
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Tipado de la petición
interface FacturaItemInput {
  productoId: string;
  cantidad: number;
  porcentajeImpuesto?: number; // IVA opcional, por defecto 16.00%
}

interface CrearFacturaRequest {
  clienteId: string;
  usuarioId: string; // Para auditoría (quién generó la factura)
  estado?: EstadoFactura; // BORRADOR o EMITIDA
  items: FacturaItemInput[];
}

/**
 * Controlador para la creación de facturas
 * POST /api/facturas
 */
export const crearFactura = async (
  req: Request<{}, {}, CrearFacturaRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { clienteId, usuarioId, estado = EstadoFactura.EMITIDA, items } = req.body;

    // 1. Validaciones iniciales del cuerpo de la petición
    if (!clienteId || !usuarioId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos. Se requiere clienteId, usuarioId y un arreglo de items no vacío.',
      });
      return;
    }

    // 2. Ejecutar transacción interactiva
    const resultado = await prisma.$transaction(async (tx) => {
      // A. Validar que el cliente exista
      const cliente = await tx.cliente.findUnique({
        where: { id: clienteId },
      });
      if (!cliente) {
        throw new Error(`El cliente con ID ${clienteId} no existe.`);
      }

      // B. Validar que el usuario emisor exista (auditoría)
      const usuario = await tx.user.findUnique({
        where: { id: usuarioId },
      });
      if (!usuario) {
        throw new Error(`El usuario emisor con ID ${usuarioId} no existe.`);
      }

      let facturaSubtotal = new Prisma.Decimal(0.0);
      let facturaTotalImpuestos = new Prisma.Decimal(0.0);
      let facturaTotal = new Prisma.Decimal(0.0);

      const detallesCrear: Prisma.FacturaDetalleCreateManyFacturaInput[] = [];
      const productosAActualizar: { id: string; nuevoStock: number }[] = [];

      // C. Validar inventario y calcular totales línea por línea
      for (const item of items) {
        const { productoId, cantidad, porcentajeImpuesto = 16.00 } = item;

        if (cantidad <= 0) {
          throw new Error(`La cantidad para el producto ${productoId} debe ser mayor a cero.`);
        }

        // Obtener el estado actual del producto en el catálogo
        const producto = await tx.producto.findUnique({
          where: { id: productoId },
        });

        if (!producto) {
          throw new Error(`El producto con ID ${productoId} no existe.`);
        }

        if (!producto.activo) {
          throw new Error(`El producto ${producto.nombre} está descontinuado.`);
        }

        // Validación estricta de stock
        if (producto.stock < cantidad) {
          throw new Error(`Stock insuficiente para el producto '${producto.nombre}'. Disponible: ${producto.stock}, Solicitado: ${cantidad}.`);
        }

        // --- CONGELACIÓN HISTÓRICA DE PRECIOS E IMPUESTOS (El Cisne Negro) ---
        const precioUnitario = new Prisma.Decimal(producto.precio);
        const cantidadDecimal = new Prisma.Decimal(cantidad);
        const tasaImpuesto = new Prisma.Decimal(porcentajeImpuesto);

        // Operaciones aritméticas de precisión utilizando Prisma.Decimal (decimal.js)
        const subtotalLinea = precioUnitario.mul(cantidadDecimal);
        const montoImpuestoLinea = subtotalLinea.mul(tasaImpuesto.div(100));
        const totalLinea = subtotalLinea.add(montoImpuestoLinea);

        // Acumular los totales de la cabecera de la factura
        facturaSubtotal = facturaSubtotal.add(subtotalLinea);
        facturaTotalImpuestos = facturaTotalImpuestos.add(montoImpuestoLinea);
        facturaTotal = facturaTotal.add(totalLinea);

        // Preparar la creación del detalle (sin el campo facturaId, ya que se creará de forma anidada)
        detallesCrear.push({
          productoId: producto.id,
          nombreProducto: producto.nombre, // Congelamos el nombre comercial exacto
          cantidad: cantidad,
          precioUnitario: precioUnitario, // Congelamos el precio unitario exacto
          porcentajeImpuesto: tasaImpuesto,
          montoImpuesto: montoImpuestoLinea,
          subtotal: subtotalLinea,
          total: totalLinea,
        });

        // Registrar el nuevo stock para actualizarlo posteriormente dentro de la transacción
        productosAActualizar.push({
          id: producto.id,
          nuevoStock: producto.stock - cantidad,
        });
      }

      // D. Actualizar el stock en la base de datos para cada producto
      for (const prod of productosAActualizar) {
        await tx.producto.update({
          where: { id: prod.id },
          data: { stock: prod.nuevoStock },
        });
      }

      // E. Generar un número de factura correlativo si el estado es EMITIDA
      let numeroFactura: string | null = null;
      if (estado === EstadoFactura.EMITIDA) {
        // Obtenemos la última factura emitida para generar el consecutivo
        const ultimaFactura = await tx.factura.findFirst({
          where: {
            estado: EstadoFactura.EMITIDA,
            numeroFactura: { not: null },
          },
          orderBy: { numeroFactura: 'desc' },
        });

        if (ultimaFactura && ultimaFactura.numeroFactura) {
          const ultimoNumero = parseInt(ultimaFactura.numeroFactura.replace('FAC-', ''), 10);
          numeroFactura = `FAC-${String(ultimoNumero + 1).padStart(6, '0')}`;
        } else {
          numeroFactura = 'FAC-000001';
        }
      }

      // F. Crear la Factura y sus detalles anidados
      const nuevaFactura = await tx.factura.create({
        data: {
          numeroFactura,
          estado,
          subtotal: facturaSubtotal,
          totalImpuestos: facturaTotalImpuestos,
          total: facturaTotal,
          clienteId,
          usuarioId,
          fechaEmision: estado === EstadoFactura.EMITIDA ? new Date() : null,
          detalles: {
            createMany: {
              data: detallesCrear,
            },
          },
        },
        include: {
          detalles: true,
          cliente: {
            select: {
              nombre: true,
              documentoId: true,
            },
          },
        },
      });

      return nuevaFactura;
    });

    // 3. Respuesta de éxito
    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente.',
      data: resultado,
    });
  } catch (error: any) {
    // 4. Manejo de errores y rollback de la transacción (automático por Prisma)
    res.status(400).json({
      success: false,
      error: error.message || 'Error en las reglas de negocio al procesar la factura.',
    });
  }
};

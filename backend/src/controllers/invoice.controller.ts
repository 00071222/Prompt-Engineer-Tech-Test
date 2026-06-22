import { Request, Response, NextFunction } from 'express';
import { Prisma, EstadoFactura } from '@prisma/client';
import { prisma } from '../utils/prisma.client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface InvoiceItemInput {
  productoId: string;
  cantidad: number;
  porcentajeImpuesto: number;
}

interface CreateInvoiceBody {
  clienteId: string;
  detalles: InvoiceItemInput[];
}

export const createInvoice = async (
  req: Request<{}, {}, CreateInvoiceBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { clienteId, detalles } = req.body;
    const usuarioId = req.userId;

    if (!usuarioId) {
      res.status(401).json({
        success: false,
        error: 'No autorizado. Trazabilidad de usuario requerida.',
      });
      return;
    }

    if (!clienteId || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos. Se requiere clienteId y un arreglo detalles no vacío.',
      });
      return;
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.findUnique({
        where: { id: clienteId },
      });
      if (!cliente) {
        throw new Error(`El cliente con ID ${clienteId} no existe.`);
      }

      const usuario = await tx.user.findUnique({
        where: { id: usuarioId },
      });
      if (!usuario) {
        throw new Error(`El usuario emisor con ID ${usuarioId} no existe.`);
      }

      let facturaSubtotal = new Prisma.Decimal(0.0);
      let facturaTotalImpuestos = new Prisma.Decimal(0.0);
      let facturaTotal = new Prisma.Decimal(0.0);

      const detallesData: Prisma.FacturaDetalleCreateWithoutFacturaInput[] = [];

      for (const item of detalles) {
        const { productoId, cantidad, porcentajeImpuesto } = item;

        if (cantidad <= 0) {
          throw new Error('La cantidad de cada producto debe ser mayor a cero.');
        }

        if (porcentajeImpuesto < 0) {
          throw new Error('El porcentaje de impuesto no puede ser negativo.');
        }

        const producto = await tx.producto.findUnique({
          where: { id: productoId },
        });

        if (!producto) {
          throw new Error(`El producto con ID ${productoId} no existe.`);
        }

        if (!producto.activo) {
          throw new Error(`El producto '${producto.nombre}' está inactivo y no puede venderse.`);
        }

        if (producto.stock < cantidad) {
          throw new Error(`Stock insuficiente para el producto '${producto.nombre}'. Stock disponible: ${producto.stock}, solicitado: ${cantidad}.`);
        }

        const precioUnitario = new Prisma.Decimal(producto.precio);
        const cantidadDecimal = new Prisma.Decimal(cantidad);
        const tasaImpuesto = new Prisma.Decimal(porcentajeImpuesto);

        const subtotalLinea = precioUnitario.mul(cantidadDecimal);
        const montoImpuestoLinea = subtotalLinea.mul(tasaImpuesto.div(100));
        const totalLinea = subtotalLinea.add(montoImpuestoLinea);

        facturaSubtotal = facturaSubtotal.add(subtotalLinea);
        facturaTotalImpuestos = facturaTotalImpuestos.add(montoImpuestoLinea);
        facturaTotal = facturaTotal.add(totalLinea);

        detallesData.push({
          producto: { connect: { id: producto.id } },
          nombreProducto: producto.nombre,
          cantidad,
          precioUnitario,
          porcentajeImpuesto: tasaImpuesto,
          montoImpuesto: montoImpuestoLinea,
          subtotal: subtotalLinea,
          total: totalLinea,
        });

        const updateResult = await tx.producto.updateMany({
          where: {
            id: productoId,
            stock: { gte: cantidad },
            activo: true,
          },
          data: {
            stock: {
              decrement: cantidad,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(
            `No se pudo actualizar el stock para '${producto.nombre}'. Posible stock insuficiente o producto inactivo debido a una compra concurrente.`
          );
        }
      }

      let numeroFactura: string | null = null;
      const ultimaFactura = await tx.factura.findFirst({
        where: {
          estado: EstadoFactura.EMITIDA,
          numeroFactura: { not: null },
        },
        orderBy: { numeroFactura: 'desc' },
      });

      if (ultimaFactura && ultimaFactura.numeroFactura) {
        const ultimoNumero = parseInt(ultimaFactura.numeroFactura.replace('FAC-', ''), 10);
        if (isNaN(ultimoNumero)) {
          numeroFactura = 'FAC-000001';
        } else {
          numeroFactura = `FAC-${String(ultimoNumero + 1).padStart(6, '0')}`;
        }
      } else {
        numeroFactura = 'FAC-000001';
      }

      const nuevaFactura = await tx.factura.create({
        data: {
          numeroFactura,
          estado: EstadoFactura.EMITIDA,
          fechaEmision: new Date(),
          subtotal: facturaSubtotal,
          totalImpuestos: facturaTotalImpuestos,
          total: facturaTotal,
          clienteId,
          usuarioId,
          detalles: {
            create: detallesData,
          },
        },
        include: {
          detalles: true,
          cliente: true,
        },
      });

      return nuevaFactura;
    });

    res.status(201).json({
      success: true,
      message: 'Factura emitida exitosamente y stock actualizado.',
      data: resultado,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al procesar la factura en la base de datos.',
    });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email y contraseña requeridos.' });
      return;
    }

    const usuario = await prisma.user.findUnique({
      where: { email },
    });

    if (!usuario) {
      res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
      return;
    }

    const validPassword = await bcrypt.compare(password, usuario.passwordHash);

    if (!validPassword) {
      res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'secret-secreto-por-defecto';
    const token = jwt.sign(
      { userId: usuario.id, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error en el servidor.' });
  }
};

export const getClients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.status(200).json({ success: true, data: clientes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error al obtener los clientes.' });
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
    res.status(200).json({ success: true, data: productos });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error al obtener los productos.' });
  }
};

export const getInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const facturas = await prisma.factura.findMany({
      include: {
        cliente: {
          select: {
            nombre: true,
            documentoId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: facturas });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error al obtener las facturas.' });
  }
};

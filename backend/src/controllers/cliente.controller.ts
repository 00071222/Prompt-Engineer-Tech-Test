import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.client.js';
import { Prisma } from '@prisma/client';

export const getClients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search } = req.query;

    if (search) {
      const searchStr = String(search);
      const clientes = await prisma.cliente.findMany({
        where: {
          OR: [
            { nombre: { contains: searchStr, mode: 'insensitive' } },
            { documentoId: { contains: searchStr, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });
      res.status(200).json({ success: true, data: clientes });
      return;
    }

    // Si no hay search, devuelve los últimos 20 creados
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.status(200).json({ success: true, data: clientes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error al obtener los clientes.' });
  }
};

export const updateClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { documentoId, nombre, email, telefono, direccion } = req.body;

    if (!documentoId || !nombre) {
      res.status(400).json({ success: false, error: 'El documentoId y nombre son requeridos.' });
      return;
    }

    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: {
        documentoId,
        nombre,
        email: email || null,
        telefono: telefono || null,
        direccion: direccion || null,
      },
    });

    res.status(200).json({ success: true, data: clienteActualizado });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(400).json({ success: false, error: `El documentoId '${req.body.documentoId}' ya está registrado en otro cliente.` });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Cliente no encontrado.' });
      return;
    }
    res.status(500).json({ success: false, error: error.message || 'Error al actualizar el cliente.' });
  }
};

export const deleteClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    await prisma.cliente.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Cliente eliminado correctamente.' });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Cliente no encontrado.' });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      res.status(409).json({ success: false, error: 'No se puede eliminar el cliente porque tiene facturas asociadas.' });
      return;
    }
    res.status(500).json({ success: false, error: error.message || 'Error al eliminar el cliente.' });
  }
};

export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { documentoId, nombre, email, telefono, direccion } = req.body;

    if (!documentoId || !nombre) {
      res.status(400).json({ success: false, error: 'El documentoId y nombre son requeridos.' });
      return;
    }

    const nuevoCliente = await prisma.cliente.create({
      data: {
        documentoId,
        nombre,
        email: email || null,
        telefono: telefono || null,
        direccion: direccion || null,
      },
    });

    res.status(201).json({ success: true, data: nuevoCliente });
  } catch (error: any) {
    // Captura de error de restricción única de Prisma (código P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(400).json({ success: false, error: `El documentoId '${req.body.documentoId}' ya está registrado en el sistema.` });
      return;
    }
    res.status(500).json({ success: false, error: error.message || 'Error al crear el cliente.' });
  }
};

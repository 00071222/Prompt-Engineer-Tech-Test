import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Rol } from '@prisma/client';

export interface DecodedToken {
  userId: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      rol?: Rol;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Acceso denegado. No se proporcionó un token o el formato es incorrecto.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'secret-secreto-por-defecto';
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    req.userId = decoded.userId;
    req.rol = decoded.rol;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido o expirado.',
    });
  }
};

import { Router } from 'express';
import { crearFactura, login, getClientes, getProductos, getFacturas } from '../controllers/factura.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Public auth endpoint
router.post('/auth/login', login);

// Protected catalog endpoints
router.get('/clientes', authMiddleware, getClientes);
router.get('/productos', authMiddleware, getProductos);
router.get('/facturas', authMiddleware, getFacturas);

// POST /api/facturas (se monta bajo /api en index.ts)
router.post('/facturas', authMiddleware, crearFactura);

export default router;

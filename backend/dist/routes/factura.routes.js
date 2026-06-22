import { Router } from 'express';
import { crearFactura, login } from '../controllers/factura.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = Router();
// Public auth endpoint
router.post('/auth/login', login);
// POST /api/facturas (se monta bajo /api en index.ts)
router.post('/facturas', authMiddleware, crearFactura);
export default router;

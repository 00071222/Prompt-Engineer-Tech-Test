import { Router } from 'express';
import { crearFactura } from '../controllers/factura.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = Router();
// POST /api/facturas (se monta bajo /api en index.ts)
router.post('/facturas', authMiddleware, crearFactura);
export default router;

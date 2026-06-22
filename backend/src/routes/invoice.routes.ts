import { Router } from 'express';
import { createInvoice, login, getClients, getProducts, getInvoices } from '../controllers/invoice.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Public auth endpoint
router.post('/auth/login', login);

// Protected catalog endpoints
router.get('/clientes', authMiddleware, getClients);
router.get('/productos', authMiddleware, getProducts);
router.get('/facturas', authMiddleware, getInvoices);

// POST /api/facturas (se monta bajo /api en index.ts)
router.post('/facturas', authMiddleware, createInvoice);

export default router;

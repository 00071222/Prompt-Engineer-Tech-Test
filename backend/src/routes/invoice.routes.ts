import { Router } from 'express';
import { 
  createInvoice, 
  login, 
  getClients, 
  getProducts, 
  getInvoices,
  createProduct,
  updateProduct,
  getInvoiceById,
  updateInvoice
} from '../controllers/invoice.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Public auth endpoint
router.post('/auth/login', login);

// Protected catalog endpoints
router.get('/productos', authMiddleware, getProducts);
router.get('/facturas', authMiddleware, getInvoices);
router.get('/facturas/:id', authMiddleware, getInvoiceById);

// Protected management endpoints
router.post('/productos', authMiddleware, createProduct);
router.put('/productos/:id', authMiddleware, updateProduct);
router.put('/facturas/:id', authMiddleware, updateInvoice);

// POST /api/facturas (se monta bajo /api en index.ts)
router.post('/facturas', authMiddleware, createInvoice);

export default router;

import { Router } from 'express';
import { getClients, createClient } from '../controllers/cliente.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = Router();
// GET /api/clientes - Búsqueda de clientes
router.get('/clientes', authMiddleware, getClients);
// POST /api/clientes - Creación rápida de cliente
router.post('/clientes', authMiddleware, createClient);
export default router;

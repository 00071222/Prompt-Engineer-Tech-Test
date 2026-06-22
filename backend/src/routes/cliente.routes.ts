import { Router } from 'express';
import { getClients, createClient, updateClient, deleteClient } from '../controllers/cliente.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/clientes - Búsqueda de clientes
router.get('/clientes', authMiddleware, getClients);

// POST /api/clientes - Creación rápida de cliente
router.post('/clientes', authMiddleware, createClient);

// PUT /api/clientes/:id - Actualización de cliente
router.put('/clientes/:id', authMiddleware, updateClient);

// DELETE /api/clientes/:id - Eliminación de cliente
router.delete('/clientes/:id', authMiddleware, deleteClient);

export default router;

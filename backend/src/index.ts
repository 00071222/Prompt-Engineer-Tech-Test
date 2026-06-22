import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import facturaRouter from './routes/factura.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Montar rutas bajo el prefijo /api
app.use('/api', facturaRouter);

// Ruta de estado simple para verificar que el servicio responda
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// 1. Configurar el pool de conexiones de pg
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Instanciar el adaptador de Prisma para pg
const adapter = new PrismaPg(pool);

// 3. Crear el cliente inyectando el adaptador
export const prisma = new PrismaClient({ adapter });

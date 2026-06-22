import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de petición para inyectar dinámicamente el token JWT de la sesión de NextAuth
api.interceptors.request.use(
  async (config) => {
    // 1. Evitar buscar la sesión para el endpoint de login (no requiere token y evita dependencias circulares/bloqueos)
    if (config.url === '/auth/login' || config.url?.endsWith('/auth/login')) {
      return config;
    }

    // 2. Solo intentar resolver la sesión si estamos en el navegador (lado del cliente)
    if (typeof window !== 'undefined') {
      try {
        const session = await getSession();
        if (session?.user?.token) {
          config.headers.Authorization = `Bearer ${session.user.token}`;
        }
      } catch (err) {
        console.error('Error obteniendo la sesión en el cliente (Axios Interceptor):', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

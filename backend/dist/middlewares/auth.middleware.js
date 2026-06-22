import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: 'Acceso denegado. No se proporcionó un token o el formato es incorrecto.',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'secret-secreto-por-defecto';
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.rol = decoded.rol;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado.',
        });
    }
};

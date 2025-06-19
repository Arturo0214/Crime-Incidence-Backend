const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secretkey';

const auth = (req, res, next) => {
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);

    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No auth header or invalid format');
        return res.status(401).json({ message: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? 'Existe' : 'No existe');

    try {
        const decoded = jwt.verify(token, SECRET);
        console.log('Token decoded successfully:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = auth; 
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar headers de seguridad
app.use((req, res, next) => {
    // Headers de seguridad
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Las peticiones a la API externa se hacen directamente desde el cliente
    // No necesitamos configurar CORS para eso
    next();
});

// Bloquear acceso a archivos sensibles
app.use((req, res, next) => {
    const requestedFile = path.basename(req.path);
    const sensitiveFiles = [
        'server.js',
        'package.json',
        'package-lock.json',
        'Dockerfile',
        'render.yaml',
        '.dockerignore',
        '.gitignore',
        'README.md',
        'node_modules'
    ];
    
    if (requestedFile.startsWith('.') || sensitiveFiles.includes(requestedFile)) {
        return res.status(403).send('Acceso denegado');
    }
    
    next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    index: false // No servir index automáticamente, lo manejamos manualmente
}));

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para dashboard
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Manejar rutas no encontradas - redirigir a index
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores
process.on('unhandledRejection', (err) => {
    console.error('Error no manejado:', err);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT recibido, cerrando servidor...');
    process.exit(0);
});

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { ClaimTypes } = require('../config/claimtypes');
const notificacionService = require('../services/notificacion.service');
const notificacionesController = require('../controllers/notificaciones.controller');
const { Authorize } = require('../middlewares/auth.middleware');

const autorizarSSE = (req, res, next) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(401).json({ mensaje: 'Acceso denegado' });

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.decodedToken = decodedToken;
        next();
    } catch {
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
};

// GET /notificaciones/suscribir/:idUsuario?token=<jwt>
router.get('/suscribir/:idUsuario', autorizarSSE, notificacionService.suscribirNotificacionUsuario);

// GET /notificaciones/
router.get('/', Authorize('Cliente,Administrador'), notificacionesController.obtenerNotificaciones);

// PATCH /notificaciones/leidas  — marcar todas como leídas
router.patch('/leidas', Authorize('Cliente,Administrador'), notificacionesController.marcarTodasComoLeidas);

// PATCH /notificaciones/:id/leida  — marcar una como leída
router.patch('/:id/leida', Authorize('Cliente,Administrador'), notificacionesController.validaciones.marcarUna, notificacionesController.marcarComoLeida);

module.exports = router;

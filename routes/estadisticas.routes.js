const router = require('express').Router();
const estadisticas = require('../controllers/estadisticas.controller');
const { Authorize } = require('../middlewares/auth.middleware');
const bitacoraLogger = require('../middlewares/bitacora.middleware');

// GET /estadisticas/rentas
router.get('/rentas', bitacoraLogger, Authorize('Administrador'), estadisticas.estadisticasRentas);

// GET /estadisticas/suscripciones
router.get('/suscripciones', bitacoraLogger, Authorize('Administrador'), estadisticas.estadisticasSuscripciones);

// GET /estadisticas/usuarios
router.get('/usuarios', bitacoraLogger, Authorize('Administrador'), estadisticas.estadisticasUsuarios);

// GET /estadisticas/uso-vehiculos
router.get('/uso-vehiculos', bitacoraLogger, Authorize('Administrador'), estadisticas.estadisticasUsoVehiculos);

// GET /estadisticas/ingresos
router.get('/ingresos', bitacoraLogger, Authorize('Administrador'), estadisticas.estadisticasIngresos);

module.exports = router;

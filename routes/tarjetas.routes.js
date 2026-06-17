const router = require('express').Router();
const tarjetas = require('../controllers/tarjetas.controller');
const { Authorize } = require('../middlewares/auth.middleware');
const bitacoraLogger = require('../middlewares/bitacora.middleware');

// GET /tarjetas/
router.get('/', Authorize('Cliente'), tarjetas.obtenerTarjetas);

// POST /tarjetas/
router.post('/', bitacoraLogger, Authorize('Cliente'), tarjetas.validaciones.guardar, tarjetas.guardarTarjeta);

// DELETE /tarjetas/:id
router.delete('/:id', bitacoraLogger, Authorize('Cliente'), tarjetas.validaciones.eliminar, tarjetas.eliminarTarjeta);

module.exports = router;

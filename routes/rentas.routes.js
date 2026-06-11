const router = require('express').Router();
const rentas = require('../controllers/rentas.controller');
const {Authorize} = require('../middlewares/auth.middleware');
const bitacoraLogger = require('../middlewares/bitacora.middleware');

//POST /rentas/
router.post('/', bitacoraLogger, Authorize('Cliente'), rentas.validaciones.crearRenta, rentas.crearRenta);

//GET /rentas/historial/:idUsuario
router.get('/historial/:idUsuario', bitacoraLogger, Authorize('Cliente'), rentas.validaciones.obtenerHistorial, rentas.obtenerHistorial);

//PUT /rentas/:idRenta/finalizar
router.put('/:idRenta/finalizar', bitacoraLogger, Authorize('Cliente'), rentas.validaciones.finalizarRenta, rentas.finalizarRenta);

//PUT /rentas/:idRenta/cancelar
router.put('/:idRenta/cancelar', bitacoraLogger, Authorize('Cliente'), rentas.validaciones.cancelarRenta, rentas.cancelarRenta);

module.exports = router;
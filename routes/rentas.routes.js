const router = require('express').Router();
const rentas = require('../controllers/rentas.controller');
const {Authorize} = require('../middlewares/auth.middleware');
const bitacoraLogger = require('../middlewares/bitacora.middleware');

//POST /rentas/
router.post('/', bitacoraLogger, Authorize('Cliente'), rentas.validaciones.crearRenta, rentas.crearRenta);

module.exports = router;
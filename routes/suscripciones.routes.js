const { Router } = require('express');
const { 
    getPlanes, 
    getMiSuscripcion, 
    postSuscribirse, 
    putCambiarMetodoPago,
    putCancelarSuscripcion,
    postCambiarPlan
} = require('../controllers/suscripciones.controller');

// Importamos Authorize correctamente
const { Authorize } = require('../middlewares/auth.middleware');

const router = Router();

// Rutas Públicas
router.get('/planes', getPlanes);

// Rutas Privadas: Reemplazamos validarJWT por Authorize('Cliente')
router.get('/mi-suscripcion', Authorize('Cliente'), getMiSuscripcion);
router.post('/suscribirse', Authorize('Cliente'), postSuscribirse);
router.put('/metodo-pago', Authorize('Cliente'), putCambiarMetodoPago);
router.put('/cancelar', Authorize('Cliente'), putCancelarSuscripcion);
router.post('/cambiar-plan', Authorize('Cliente'), postCambiarPlan);

module.exports = router;
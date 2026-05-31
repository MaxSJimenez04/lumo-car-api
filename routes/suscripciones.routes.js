const { Router } = require('express');
const { 
    getPlanes, 
    getMiSuscripcion, 
    postSuscribirse, 
    putCambiarMetodoPago,
    putCancelarSuscripcion,
    postCambiarPlan
} = require('../controllers/suscripciones.controller');

const { validarJWT } = require('../middlewares/auth.middleware');

const router = Router();

// Rutas Públicas
router.get('/planes', getPlanes);

// Rutas Privadas
router.get('/mi-suscripcion', validarJWT, getMiSuscripcion);
router.post('/suscribirse', validarJWT, postSuscribirse);
router.put('/metodo-pago', validarJWT, putCambiarMetodoPago);
router.put('/cancelar', validarJWT, putCancelarSuscripcion);
router.post('/cambiar-plan', validarJWT, postCambiarPlan);

module.exports = router;
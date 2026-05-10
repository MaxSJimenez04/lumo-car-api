const router = require('express').Router()
const auth = require('../controllers/auth.controller')
const {Authorize, LoginLimit} = require('../middlewares/auth.middleware')
const bitacoraLogger = require('../middlewares/bitacora.middleware')

//POST: /login
router.post('/login', bitacoraLogger, LoginLimit ,auth.login)

//GET: /auth/tiempo
router.get('/tiempo', Authorize('Cliente,Administrador,S_Administrador'), auth.tiempoRestante)

//GET: /auth/forgot-password
router.post('/forgot-password/:usuario', bitacoraLogger, auth.validaciones.solicitarRestablecer, auth.solicitudRestablecerContrasena)

//POST /auth/forgot-password/verify
router.post('/forgot-password/verify/:usuario', auth.validaciones.validarCodigo, auth.validarCodigoSolicitud)

//POST /auth/reset-password/
router.post('/reset-password/:usuario', auth.validaciones.validarContrasena, auth.cambiarContrasena)

module.exports = router
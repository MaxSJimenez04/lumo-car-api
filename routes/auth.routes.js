const router = require('express').Router()
const auth = require('../controllers/auth.controller')
const {Authorize, LoginLimit} = require('../middlewares/auth.middleware')
const bitacoraLogger = require('../middlewares/bitacora.middleware')

//El middleware de bitacora se llama solamente especificandola en el método del Router
//POST: /login
router.post('/login', bitacoraLogger, LoginLimit ,auth.login) 

//Lo de Authorize no es librería tal cual, solo se colocan los roles que pueden hacer el método sin espacios, solo comas
//GET: /auth/tiempo
router.get('/tiempo', Authorize('Cliente,Administrador,S_Administrador'), auth.tiempoRestante)


//Aqui se usan las validaciones llamandolas como un atributo, y express se encarga de validarlo
//GET: /auth/forgot-password
router.post('/forgot-password/:usuario', bitacoraLogger, auth.validaciones.solicitarRestablecer, auth.solicitudRestablecerContrasena)

//POST /auth/forgot-password/verify
router.post('/forgot-password/verify/:usuario', auth.validaciones.validarCodigo, auth.validarCodigoSolicitud)

//POST /auth/reset-password/
router.post('/reset-password/:usuario', auth.validaciones.validarContrasena, auth.cambiarContrasena)

module.exports = router
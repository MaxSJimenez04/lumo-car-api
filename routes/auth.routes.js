const router = require('express').Router()
const auth = require('../controllers/auth.controller')
const {Authorize, LoginLimit} = require('../middlewares/auth.middleware')
const bitacoraLogger = require('../middlewares/bitacora.middleware')

//POST: /login
router.post('/login', bitacoraLogger, LoginLimit ,auth.login)

//GET: /auth/tiempo
router.get('/tiempo', Authorize('Usuario,Administrador,S_Administrador'), auth.tiempoRestante)

module.exports = router
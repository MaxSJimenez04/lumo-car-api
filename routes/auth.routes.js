const router = require('express').Router()
const auth = require('../controllers/auth.controller')
const Authorize = require('../middlewares/auth.middleware')

//POST: /login
router.post('/login', auth.login)

//GET: /auth/tiempo
router.get('/tiempo', Authorize('Usuario,Administrador,S_Administrador'), auth.tiempoRestante)

module.exports = router
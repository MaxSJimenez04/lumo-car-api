const router = require('express').Router()
const usuarios = require('../controllers/usuarios.controller')
const {Authorize} = require('../middlewares/auth.middleware')
const bitacoraLogger = require('../middlewares/bitacora.middleware')


//POST /usuarios/
router.post('/', bitacoraLogger,usuarios.validaciones.crearUsuario,usuarios.registro)

//GET /usuarios/
router.get('/', Authorize('S_Administrador'), usuarios.consultaGeneral)

//GET /usuarios/usuario
router.get('/:usuario', Authorize('Cliente,Administrador,S_Administrador'), usuarios.validaciones.consultarPerfil, usuarios.consultar)

//PUT /usuarios/usuario
router.put('/:usuario',bitacoraLogger,Authorize('Cliente,Administrador'), usuarios.validaciones.modificarPerfil, usuarios.modificar)

/*
//GET /usuarios/usuario/pfp
router.get()

//POST /usuarios/usuario/pfp/
router.post()

//PUT /usuarios/usuario/pfp/
router.put()
*/
//DELETE /usuarios/usuario
router.delete('/', Authorize('Usuario,S_Administrador'), usuarios.validaciones.elimnarUsuario, usuarios.eliminar)

/*
//POST /usuarios/admin-sucursal
router.post()

//PUT /usuarios/admin-sucursal
router.put()
*/

module.exports = router
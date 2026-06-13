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

//GET /usuarios/usuario/pfp
router.get('/:usuario/pfp', Authorize('Cliente,Administrador,S_Administrador'), usuarios.validaciones.consultarFoto, usuarios.consultarFotoPerfil)

//POST /usuarios/usuario/pfp/
router.post('/:usuario/pfp/', bitacoraLogger, Authorize('Cliente,Administrador'), usuarios.validaciones.subirFoto, usuarios.asociarFotoPerfil)

//DELETE /usuarios/1
router.delete('/:id', Authorize('Usuario,S_Administrador'), usuarios.validaciones.elimnarUsuario, usuarios.eliminar)

//PUT /usuarios/usuario/admin-sucursal
router.put('/:usuario/admin-sucursal',Authorize('Administrador,S_Administrador'), bitacoraLogger,usuarios.validaciones.cambiarSucursal, usuarios.transferirSucursal)

module.exports = router
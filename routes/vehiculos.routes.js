const router = require('express').Router()
const vehiculos = require('../controllers/vehiculos.controller')
const {Authorize} = require('../middlewares/auth.middleware')
const bitacoraLogger = require('../middlewares/bitacora.middleware')


//POST /vehiculos/colores
router.get('/colores', vehiculos.validaciones.consultarColor, vehiculos.consultarColor)

//GET /vehiculos/colores
router.post('/colores', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.registrarColor, vehiculos.registrarColor)

//POST /vehiculos/
router.post('/', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.registrarVehiculo, vehiculos.registrar)

//GET /vehiculos/
router.get('/', vehiculos.validaciones.consultarVehiculos, vehiculos.consultarTodos)

//DELETE /vehiculos/:id
router.delete('/', bitacoraLogger,Authorize('Administrador,S_Administrador'), vehiculos.validaciones.eliminarVehiculo ,vehiculos.eliminar)

//GET /vehiculos/:id
router.get('/:id', vehiculos.idValidator, vehiculos.consultar)

//PUT /vehiculos/:id
router.put('/:id', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.modificarVehiculo, vehiculos.modificar)

//GET /vehiculos/:id/main-picture
router.get('/:id/main-picture', vehiculos.idValidator, vehiculos.consultarFotoPrincipal)

//GET /vehiculos/:id/routes-pictures
router.get('/:id/routes-pictures', vehiculos.idValidator, vehiculos.consultarFotos)

//GET /vehiculos/:id/picture
router.get('/:id/picture', vehiculos.idValidator, vehiculos.consultarFoto)

//PUT /vehiculos/:id/main-picture
router.put('/:id/main-picture', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.actualizarFotoPrincipal, vehiculos.actualizarFotoPrincipal)

module.exports = router
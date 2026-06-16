const router = require('express').Router()
const vehiculos = require('../controllers/vehiculos.controller')
const {Authorize} = require('../middlewares/auth.middleware')
const bitacoraLogger = require('../middlewares/bitacora.middleware')


//GET vehiculos/colores/1
router.get('/color', vehiculos.validaciones.consultarColor, vehiculos.consultarColor)

//GET /vehiculos/colores
router.get('/colores', vehiculos.consultarColores)

//POST /vehiculos/colores/
router.post('/colores/', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.registrarColor, vehiculos.registrarColor)

//POST /vehiculos/
router.post('/', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.registrarVehiculo, vehiculos.registrar)

//GET /vehiculos/1
router.get('/', vehiculos.validaciones.consultarVehiculos, vehiculos.consultarPorSucursal)

//DELETE /vehiculos/:id
router.delete('/:id', bitacoraLogger,Authorize('Administrador,S_Administrador'), vehiculos.validaciones.eliminarVehiculo ,vehiculos.eliminar)

//GET /vehiculos/:id
router.get('/:id', vehiculos.idValidator, vehiculos.consultar)

//PUT /vehiculos/:id
router.put('/:id', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.modificarVehiculo, vehiculos.modificar)

// GET  /vehiculos/:id/main-picture
router.get('/:id/main-picture', vehiculos.idValidator, vehiculos.consultarFotoPrincipal)
 
// PATCH /vehiculos/:id/foto-principal
router.put('/:id/foto-principal', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.asociarFoto, vehiculos.asociarFotoPrincipal)
 
// GET  /vehiculos/:id/secondary-pictures
router.get('/:id/secondary-pictures', vehiculos.idValidator, vehiculos.consultarFotosSecundarias)
 
//PUT /vehiculos/:id/fotos-secundarias
router.put('/:id/fotos-secundarias', bitacoraLogger, Authorize('Administrador,S_Administrador'), vehiculos.validaciones.asociarFoto, vehiculos.asociarFotoSecundaria)

module.exports = router
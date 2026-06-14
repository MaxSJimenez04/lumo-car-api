const router = require('express').Router()
const archivos = require('../controllers/archivos.controller')
const {Authorize} = require('../middlewares/auth.middleware')
const {uploadUsuarios, uploadVehiculos, uploadVehiculosMultiple} = require("../middlewares/archivos.middleware")


//POST: archivos/usuarios
router.post('/usuarios', uploadUsuarios.single("file") , Authorize('Cliente,Administrador'),archivos.crearUsuario)

//POST: archivos/vehiculos/principal
router.post('/vehiculos/principal', uploadVehiculos.single("file"), Authorize('Administrador,S_Administrador'), archivos.crearVehiculo)

//DELETE archivos/
router.delete('/:id', Authorize('Administrador,S_Administrador'), archivos.eliminar)

module.exports = router
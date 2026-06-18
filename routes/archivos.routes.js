const router = require('express').Router()
const archivos = require('../controllers/archivos.controller')
const {Authorize} = require('../middlewares/auth.middleware')
const {uploadUsuarios, uploadVehiculos, uploadVehiculosMultiple} = require("../middlewares/archivos.middleware")


//POST: archivos/usuarios
router.post('/usuarios', Authorize('Cliente,Administrador'), uploadUsuarios.single("file"), archivos.crearUsuario)

//POST: archivos/vehiculos
router.post('/vehiculos', Authorize('Administrador,S_Administrador'), uploadVehiculos.single("file"), archivos.crearVehiculo)

//DELETE archivos/
router.delete('/:id', Authorize('Administrador,S_Administrador'), archivos.eliminar)

module.exports = router
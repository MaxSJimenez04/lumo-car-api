const router = require('express').Router()
const archivos = require('../controllers/archivos.controller')
const Authorize = require('../middlewares/auth.middleware')
const subirArchivo = require('../middlewares/archivos.middleware')

//POST: archivos/
router.post('/', subirArchivo.single("file"), Authorize('Cliente,Administrador'),archivos.crear)

//DELETE archivos/
router.delete('/:id', Authorize('Administrador,S_Administrador'), archivos.eliminar)

module.exports = router
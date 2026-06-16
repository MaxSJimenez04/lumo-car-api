const router = require('express').Router()
const marcas = require('../controllers/marcas.controller')

//GET marcas/
router.get('/', marcas.consultarMarcas)

module.exports = router
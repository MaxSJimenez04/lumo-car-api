const router = require('express').Router()
const sucursales = require('../controllers/sucursales.controller')
const {Authorize} = require ('../middlewares/auth.middleware')
const bitacoraLogger = require('../middlewares//bitacora.middleware')

//POST /sucursales/
router.post('/', bitacoraLogger, Authorize('Administrador,S_Administrador'), sucursales.validaciones.registrar, sucursales.registrar)

//GET /sucursales/
router.get('/', sucursales.validaciones.consultarSucursales, sucursales.consultarSucursales)

//GET /sucursales/ciudades
router.get('/ciudades', sucursales.validaciones.consultarCiudades, sucursales.consultarCiudades)

//POST /sucursales/ciudad
router.post('/ciudad', bitacoraLogger, Authorize('S_Administrador'), sucursales.validaciones.registrarCiudad, sucursales.registrarCiudad)

//GET /sucursales/estados
router.get('/estados', sucursales.consultarEstados)

module.exports = router
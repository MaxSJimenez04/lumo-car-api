const router = require('express').Router()
const sucursales = require('../controllers/sucursales.controller')
const {Authorize} = require ('../middlewares/auth.middleware')
const bitacoraLogger = require('../middlewares//bitacora.middleware')

//POST /sucursales/
router.post('/', bitacoraLogger, Authorize('Administrador,S_Administrador'), sucursales.validaciones.registrar, sucursales.registrar)

//GET /sucursales/general
router.get('/general', sucursales.consultar)

//GET /sucursales/15
router.get('/', sucursales.validaciones.consultarSucursales, sucursales.consultarSucursales)

//GET /sucursales/ciudades/15
router.get('/ciudades', sucursales.validaciones.consultarCiudades, sucursales.consultarCiudades)

//POST /sucursales/ciudad
router.post('/ciudad', bitacoraLogger, Authorize('S_Administrador'), sucursales.validaciones.registrarCiudad, sucursales.registrarCiudad)

//GET /sucursales/estados
router.get('/estados', sucursales.consultarEstados)

module.exports = router
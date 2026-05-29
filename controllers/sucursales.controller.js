const {Sucursal,Ciudad,Estado, sequelize} = require('../models')
const Sequelize = require('sequelize')
const bitacora = require('../middlewares/bitacora.middleware')
const {validationResult, body, param} = require('express-validator')


let self = {}

self.validaciones = {
    registrar:[
        body('nombre', 'La sucursal debe tener un nombre').isString().notEmpty(),
        body('direccion', 'La sucursal debe tener una direccion').isString.notEmpty(),
        body('capacidad', 'Dato inválido').isInt(),
        body('idCiudad','La sucursal debe estar ligada a una ciudad').isInt()
    ],

    registrarCiudad:[
        body('nombreCiudad', 'La ciudad debe tener un nombre').isString().notEmpty(),
        body('idEstado', 'La ciudad se debe ubicar en algún estado de la República Mexicana').isInt()
    ],

    consultarCiudades:[
        body('idEstado', 'Se debe especificar el estado').isInt()
    ],

    consultarSucursales:[
        body('idCiudad', 'Se debe especificar ciudad').isInt()
    ]
}

self.consultarSucursales = async function(req,res,next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }
        let idCiudadFiltro = req.body.idCiudad

        let sucursales = await Sucursal.findAll({
            where: {idCiudad: idCiudadFiltro},
            raw:true,
            attributes: ['id', 'nombre', 'direccion', 'capacidad', 'idCiudad', Sequelize.col(Ciudad.nombreCiudad)],
            include:{model:Ciudad, attributes:[]}
        })

        if (sucursales === null) {
            return res.status(404).json({mensaje: "No se encontraron sucursales"})
        }
    } catch (error) {
        next(error)
    }
}

self.registrar = async function(req,res,next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        let {datosSucursal} = req.body

        let sucursalNueva = await Sucursal.create({
            nombre:datosSucursal.nombre,
            direccion: datosSucursal.direccion,
            capacidad: datosSucursal.cantidad,
            idCiudad: datosSucursal.idCiudad
        })

        if (req.bitacora) {
            req.bitacora(`NUEVA SUCURSAL REGISTRADA CON NOMBRE ${sucursalNueva.nombre}`)
        }

        return res.status(201).json(sucursalNueva)
    } catch (error) {
        next(error)
    }
}

self.registrarCiudad = async function(req,res,next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        let {datosCiudad} = req.body

        let ciudadNueva = await Ciudad.create({
            nombreCiudad: datosCiudad.nombreCiudad,
            idEstado = datosCiudad.idEstado
        })

        if (req.bitacora) {
            req.bitacora(`NUEVA CIUDAD REGISTRADA: ${ciudadNueva.nombreCiudad}`)
        }

        return res.status(201).json(ciudadNueva)
    } catch (error) {
        next(error)
    }
}

self.consultarCiudades = async function(req,res,next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        let idEstadoFiltro = req.body.idEstado

        let ciudades = await Ciudad.findAll({
            where: {idEstado: idEstadoFiltro},
            raw: true,
            attributes:['id', 'nombreCiudad', 'idEstado', Sequelize.col('Estado.nombreEstado')],
            include:{model:Estado, attributes:[]}
        })

        if (ciudades ===  null) {
            return res.status(404).json({mensaje: "No se encontraron ciudades"})
        }
        
        return res.status(200).json(ciudades)

    } catch (error) {
        next(error)
    }
}

self.consultarEstados = async function(req,res,next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        let estados = await Estado.findAll({
            raw: true,
            attributes:['id','nombreEstado']
        })

        if (estados === null) {
            return res.status(404).json({mensaje:"No se encontraron estados"})
        }

        return res.status(200).json(estados)
    } catch (error) {
        next(error)
    }

}


module.exports = self
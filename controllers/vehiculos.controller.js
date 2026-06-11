const {Vehiculo,Sucursal,Color,Marca,Archivo,VistaVehiculo, sequelize} = require('../models')
const Sequelize = require('sequelize')
const bitacora = require('../middlewares/bitacora.middleware')
const {validationResult, body, param} = require('express-validator')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

let self = {}
self.idValidator = [
    param('id', 'Especificar id válida').isUUID().notEmpty(),
]

self.validaciones = {
    registrarVehiculo:[
        body('placa', 'No se especifico una placa válida').notEmpty().isString().isLength(9),
        body('modelo', 'No se especificó un modelo').notEmpty().isString(),
        body('pasajeros', 'Formato inválido').isInt(),
        body('transmision','formato invalido').isBoolean(),
        body('tamano', 'formato invalido').isString().isLength(1),
        body('tipo_combustible', 'Formato inválido').isInt(),
        body('aireAcondicionado').isBoolean(),
        body('idColor', 'Especificar un color').isInt().notEmpty(),
        body('idMarca', 'Especificar una marca').isInt().notEmpty(),
        body('idSucursal', 'Especificar una sucursal').isInt().notEmpty()
    ],

    modificarVehiculo:[
        param('id', 'Especificar id válida').isUUID().notEmpty(),
        body('pasajeros', 'Formato inválido').isInt(),
        body('aire_acondicionado').isBoolean(),
        body('idColor', 'Especificar un color').isInt(),
        body('idSucursal', 'Especificar una sucursal').isInt()
    ],
    
    consultarVehiculos:[
        body('idSucursal', 'Especificar una sucursal válida').isInt()
    ],

    eliminarVehiculo:[
        body('id','Especificar id válida').isUUID().notEmpty()
    ],
    actualizarFotoPrincipal:[
        body('idArchivo', 'Especificar ID del Archivo').isInt().notEmpty(),
        param('id', 'Especificar id válida').isUUID().notEmpty()
    ],

    consultarColor:[
        body('idColor', 'Especificar ID de color válido').isInt()
    ],

    registrarColor:[
        body('color', 'Campo vacío').isString().notEmpty(),
        body('codigoHex', 'Campo invalido').isHexColor()
    ],
}

self.registrar = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }

        let idVehiculo = crypto.randomUUID()
        let datosVehiculo = req.body
        let tipo_combustible = req.body.tipo_combustible
        

        if (datosVehiculo.pasajeros <= 0) {
            return res.status(400).json({mensaje: "Número de pasajeros debe ser mayor que 0"})
        }
        if(datosVehiculo.tamano !== 'A' && datosVehiculo.tamano !== 'B' && datosVehiculo.tamano !== 'C' && datosVehiculo.tamano !== 'D' && 
            datosVehiculo.tamano !== 'E' && datosVehiculo.tamano !== 'F' && datosVehiculo.tamano !== 'S'){
                return res.status(400).json({mensaje: "Tamaño no reconocido"})
        }

        if (tipo_combustible !== 0 && tipo_combustible !== 1 && tipo_combustible !== 2) {
            return res.status(400).json({mensaje: "Tipo de combustible no reconocido"})
        }

        let vehiculoGenerado = await Vehiculo.create({
            id: idVehiculo,
            placa: datosVehiculo.placa,
            modelo: datosVehiculo.modelo,
            pasajeros: datosVehiculo.pasajeros,
            transmision: datosVehiculo.transmision,
            tamano: datosVehiculo.tamano,
            tipo_combustible: datosVehiculo.tipo_combustible,
            aire_acondicionado: datosVehiculo.aireAcondicionado,
            estado: 1,
            idColor: datosVehiculo.idColor,
            idMarca: datosVehiculo.idMarca,
            idSucursal: datosVehiculo.idSucursal
        })

        if (req.bitacora) {
            req.bitacora(`VEHICULO REGISTRADO ${vehiculoGenerado.id}`)
        }
        return res.status(201).json(vehiculoGenerado)
    } catch (error) {
        next(error)
    }
}

self.modificar = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }
        let idVehiculo = req.params.id
        let datosVehiculo = req.body
        console.log(idVehiculo);
        
        let datos = await Vehiculo.findByPk(idVehiculo,{
            raw: true,
            attributes: ['id', 'placa', 'idMarca','idSucursal']
        })

        if (datos === null) {
            return res.status(404).json({mensaje: "No se encontró el vehículo especificado"})
        }

        let vehiculoActualizado = await Vehiculo.update(datosVehiculo,{where:{id:datos.id}})
        if (req.bitacora) {
            req.bitacora(`MODIFICACIÓN DE VEHICULO CON PLACA ${datos.placa} CON ID ${datosVehiculo.id}`)
        }
        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

self.consultarTodos = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }
        let idSucursalSeleccionada = req.body.idSucursal 
        let vehiculosSucursal = await VistaVehiculo.findAll({
            where:{idSucursal: idSucursalSeleccionada},
        })

        if (vehiculosSucursal === null) {
            return res.status(404).json({mensaje:"No se encontraron vehículos para esa sucursal"})
        }

        return res.status(200).json(vehiculosSucursal)
    } catch (error) {
        next(error)
    }
}

self.consultar = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }

        let {id} = req.params
        let datosVehiculo = await Vehiculo.findOne({
            where:{id:id},
            raw:true,
            attributes:['id','placa','modelo','pasajeros','transmision','tamano','tipo_combustible','aire_acondicionado','idColor','idMarca',
                [Sequelize.col('Color.color'), 'color'],[Sequelize.col('Color.codigoHex'),'codigoHex'],[Sequelize.col('Marca.nombreMarca'),'nombreMarca']],
            include:[{model:Color, attributes:[]},{model:Marca, attributes:[]}]
        })

        if (datosVehiculo === null || datosVehiculo === undefined) {
            return res.status(404).json({mensaje:"No se encontró el vehículo"})
        }

        return res.status(200).json(datosVehiculo)
    } catch (error) {
        next(error)
    }
}

self.consultarFotoPrincipal = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }

        const {idVehiculo} = req.params.id
        let datosVehiculo = await Vehiculo.findByPk(idVehiculo,{
            attributes: ['id', 'placa', 'idSucursal']
        })

        if (datosVehiculo === null || datosVehiculo === undefined) {
            return res.status(404).json({mensaje: "No se encontró el vehículo"})
        }

        let idVehiculoBD = datosVehiculo.id
        let imagen = await Archivo.findOne({
            where: {idVehiculo: idVehiculoBD, esPrincipal:true},
            raw: true,
            attributes:['id', 'nombreArchivo', 'ruta', 'esPrincipal', 'idVehiculo']
        })

        if (imagen === null | imagen === undefined) {
            let rutaImagen = path.join(__dirname, '../uploads/vehiculos', 'default-car-picture.png')
            return res.status(200).sendFile(rutaImagen)
        }else{
            let rutaImagen = path.join(__dirname,'../uploads/usuarios', imagen.nombreArchivo)
            return res.status(200).sendFile(rutaImagen)
        }

    } catch (error) {
        next(error)
    }
}

self.consultarFotos = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }

        const {idVehiculo} = req.params.id
        let datosVehiculo = await Vehiculo.findByPk(idVehiculo,{
            attributes: ['id', 'placa', 'idSucursal']
        })

        if (datosVehiculo === null || datosVehiculo === undefined) {
            return res.status(404).json({mensaje: "No se encontró el vehículo"})
        }
        let idVehiculoBD = datosVehiculo.id

        let ImagenesVehiculo = await Vehiculo.findAll({
            where:{id:idVehiculoBD, esPrincipal:false},
            raw: true,
            attributes:['id', 'ruta', 'nombreArchivo', 'esPrincipal']
        })

        if (!ImagenesVehiculo.length === 0) {
            let rutaImagen = path.join(__dirname, '../uploads/vehiculos', 'default-car-picture-png')
            return res.status(200).sendFile(rutaImagen)
        }else{
            let rutasImagenes = []
            ImagenesVehiculo.forEach(imagen => {
                let ruta = imagen.ruta
                rutasImagenes.push(ruta)
            });

            return res.status(200).json({rutas: rutasImagenes})
        }
    } catch (error) {
        next(error)
    }
}

self.consultarFoto = async function(req,res,next){
    try {
        let rutaImagen = req.body.ruta

        res.status(200).sendFile(rutaImagen, {root: __dirname})
    } catch (error) {
        next(error)
    }
}

self.actualizarFotoPrincipal = async function(req,res,next){
    try {
       const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }

        const {idVehiculo} = req.params.id
        const idArchivo = req.params.idArchivo
        let datosVehiculo = await Vehiculo.findByPk(idVehiculo,{
            attributes: ['id', 'placa', 'idSucursal']
        })

        if (datosVehiculo === null || datosVehiculo === undefined) {
            return res.status(404).json({mensaje: "No se encontró el vehículo"})
        }
        let idVehiculoBD = datosVehiculo.id

        let imagen = await Archivo.findOne({
            where: {idVehiculo: idVehiculoBD, esPrincipal:true},
            raw: true,
            attributes:['id', 'nombreArchivo', 'ruta', 'esPrincipal', 'idVehiculo']
        })

        if (imagen !== null) {
            let data = await Archivo.destroy({where: {id: imagen.id}})
        }
            
        let imagenActualizada = findOne({
            where:{id:idArchivo},
            raw:true,
            attributes: ['id', 'ruta', 'esPrincipal','idVehiculo']
        })
        if (imagenActualizada === null) {
            res.status(404).json({mensaje: "No se encontró la imagen actualizada"})
        }

        let asociacion = await Archivo.update({idVehiculo:idVehiculoBD, esPrincipal: true},{where:{id:idArchivo}})

        if (req.bitacora) {
            req.bitacora(`ACTUALIZACION DE FOTO PRINCIPAL DE VEHICULO: ${idVehiculoBD}`)
        }

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

self.eliminar = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }

        let idVehiculo = req.body.id
        let vehiculo = await Vehiculo.destroy(
            {where:
                {id:idVehiculo}
            }
        )

        if (vehiculo[0] === 0) {
            return res.status(404).json({mensaje: "No se encontró el vehiculo"})
        }

        if (req.bitacora) {
            req.bitacora(`ELIMINACIÓN DE VEHICULO ${idVehiculo}`)
        }

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}


self.consultarColor = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }
        let idColor = req.body.idColor

        let color = await Color.findByPk(idColor, {
            raw:true,
            attributes:['id', 'color', 'codigoHex']
        })

        if (color === null) {
            return res.status(404).json({mensaje:"No se enecontró el color especificado"})
        }

        return res.status(200).json(color)
    } catch (error) {
        next(error)
    }
}

self.registrarColor = async function (req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }

        let datosColor = req.body

        console.log(datosColor);
        
        let validarColor = await Color.findOne({
            where:{color: datosColor.color},
            raw:true,
            attributes:['codigoHex']
        })

        console.log(validarColor);
        
        if (validarColor !== null) {
            return res.status(400).json({mensaje:"Ya hay existe ese color registrado"})
        }

        let colorNuevo = await Color.create({
            color:datosColor.color,
            codigoHex: datosColor.codigoHex
        })

        if (req.bitacora) {
            req.bitacora(`NUEVO COLOR REGISTRADO: ${colorNuevo.color}`)
        }

        return res.status(201).json(colorNuevo)
    } catch (error) {
        next(error)
    }
}

module.exports = self
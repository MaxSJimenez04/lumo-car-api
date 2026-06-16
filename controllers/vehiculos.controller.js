const {Vehiculo,Sucursal,Color,Marca,Archivo,VistaVehiculo, sequelize} = require('../models')
const Sequelize = require('sequelize')
const bitacora = require('../middlewares/bitacora.middleware')
const {validationResult, body, param, query} = require('express-validator')
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
        query('idSucursal', 'Especificar una sucursal válida').isInt()
    ],

    eliminarVehiculo:[
        param('id','Especificar id válida').isUUID().notEmpty()
    ],
    actualizarFotoPrincipal:[
        body('idArchivo', 'Especificar ID del Archivo').isInt().notEmpty(),
        param('id', 'Especificar id válida').isUUID().notEmpty()
    ],

    asociarFoto: [
        param('id', 'Especificar id válida').isUUID().notEmpty(),
        body('idArchivo', 'Especificar ID del Archivo').isUUID().notEmpty()
    ],

    registrarColor:[
        body('color', 'Campo vacío').isString().notEmpty(),
        body('codigoHex', 'Campo invalido').isHexColor()
    ],

    consultarColor:[
        query('idColor', 'Campo vacío').isInt()
    ]
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

self.consultarPorSucursal = async function(req,res,next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }
        let idSucursalSeleccionada = req.query.idSucursal
        let vehiculosSucursal = await Vehiculo.findAll({
            where:{idSucursal: idSucursalSeleccionada},
            raw:true,
            attributes:['id','placa','modelo','pasajeros','transmision','tamano','tipo_combustible','aire_acondicionado','idColor','idMarca',
                [Sequelize.col('Color.color'), 'color'],[Sequelize.col('Color.codigoHex'),'codigoHex'],[Sequelize.col('Marca.nombreMarca'),'nombreMarca']],
            include:[{model:Color, attributes:[]},{model:Marca, attributes:[]}]
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

self.consultarFotoPrincipal = async function (req, res, next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }
 
        const idVehiculo = req.params.id
 
        let datosVehiculo = await Vehiculo.findByPk(idVehiculo, {
            attributes: ['id']
        })
 
        if (!datosVehiculo) {
            return res.status(404).json({mensaje: "No se encontró el vehículo"})
        }
 
        let imagen = await Archivo.findOne({
            where: {idVehiculo: datosVehiculo.id, esPrincipal: true},
            raw: true,
            attributes: ['nombreArchivo']
        })
 
        if (!imagen) {
            return res.status(200).sendFile(
                path.join(__dirname, '../uploads/vehiculos/default-car-picture.png')
            )
        }
 
        return res.status(200).sendFile(
            path.join(__dirname, '../uploads/vehiculos', imagen.nombreArchivo)
        )
    } catch (error) {
        next(error)
    }
}


self.consultarFotosSecundarias = async function (req, res, next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }
 
        const idVehiculo = req.params.id
 
        let datosVehiculo = await Vehiculo.findByPk(idVehiculo, { attributes: ['id'] })
 
        if (!datosVehiculo) {
            return res.status(404).json({mensaje: "No se encontró el vehículo"})
        }
 
        let imagenes = await Archivo.findAll({
            where: {idVehiculo: datosVehiculo.id, esPrincipal: false},
            raw: true,
            attributes: ['id', 'nombreArchivo', 'ruta'],
            limit: 5
        })
 
        if (!imagenes || imagenes.length === 0) {
            return res.status(404).json({mensaje: "El vehículo no tiene fotos secundarias"})
        }
 
        // Verificar que todos los archivos existen en disco antes de comenzar la respuesta
        for (const img of imagenes) {
            const rutaAbsoluta = path.join(__dirname, '..', img.ruta)
            if (!fs.existsSync(rutaAbsoluta)) {
                return res.status(500).json({
                    mensaje: `Archivo no encontrado en disco: ${img.nombreArchivo}`
                })
            }
        }
 
        const boundary = `----FotosVehiculo${Date.now()}`
        res.setHeader('Content-Type', `multipart/form-data; boundary=${boundary}`)
        res.status(200)
 
        for (const img of imagenes) {
            const rutaAbsoluta = path.join(__dirname, '..', img.ruta)
            const extension = path.extname(img.nombreArchivo).toLowerCase().replace('.', '')
            const mimeType = extension === 'png'  ? 'image/png'
                           : extension === 'webp' ? 'image/webp'
                           : 'image/jpeg'
 
            const contenido = fs.readFileSync(rutaAbsoluta)
 
            // name es el id del archivo para identificarlo en el frontend
            res.write(
                `--${boundary}\r\n` +
                `Content-Disposition: form-data; name="${img.id}"; filename="${img.nombreArchivo}"\r\n` +
                `Content-Type: ${mimeType}\r\n\r\n`
            )
            res.write(contenido)
            res.write('\r\n')
        }
 
        res.end(`--${boundary}--\r\n`)
 
    } catch (error) {
        next(error)
    }
}
 
self.asociarFotoPrincipal = async function (req, res, next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }
 
        let idVehiculo = req.params.id
        let idArchivo = req.body.idArchivo
        console.log(req.body.idArchivo);
        
 
        let datosVehiculo = await Vehiculo.findByPk(idVehiculo, { attributes: ['id'] })
 
        if (!datosVehiculo) {
            return res.status(404).json({mensaje: "No se encontró el vehículo"})
        }
 
        let archivo = await Archivo.findOne({
            where: {id: idArchivo},
            raw: true,
            attributes: ['id', 'idVehiculo', 'esPrincipal']
        })
 
        if (!archivo) {
            return res.status(404).json({mensaje: "No se encontró el archivo especificado"})
        }
 
        if (archivo.idVehiculo && archivo.idVehiculo !== datosVehiculo.id) {
            return res.status(400).json({mensaje: "El archivo ya está asociado a otro vehículo"})
        }
 
        await Archivo.update(
            {esPrincipal: false},
            {where: {idVehiculo: datosVehiculo.id, esPrincipal: true}}
        )
 
        await Archivo.update(
            {idVehiculo: datosVehiculo.id, esPrincipal: true},
            {where: {id: idArchivo}}
        )
 
        if (req.bitacora) {
            req.bitacora(`FOTO PRINCIPAL ASOCIADA AL VEHÍCULO ${datosVehiculo.id}: archivo ${idArchivo}`)
        }
 
        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}
 
self.asociarFotoSecundaria = async function (req, res, next) {
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }
 
        const idVehiculo = req.params.id
        const { idArchivo } = req.body
 
        let datosVehiculo = await Vehiculo.findByPk(idVehiculo, { attributes: ['id'] })
 
        if (!datosVehiculo) {
            return res.status(404).json({mensaje: "No se encontró el vehículo"})
        }
 
        // Verificar límite de 5 fotos secundarias
        const cantidadActual = await Archivo.count({
            where: {idVehiculo: datosVehiculo.id, esPrincipal: false}
        })
 
        if (cantidadActual >= 5) {
            return res.status(400).json({
                mensaje: "El vehículo ya tiene el máximo de 5 fotos secundarias permitidas"
            })
        }
 
        // Verificar que el archivo exista y no esté ya asociado a otro vehículo
        let archivo = await Archivo.findOne({
            where: {id: idArchivo},
            raw: true,
            attributes: ['id', 'idVehiculo']
        })
 
        if (!archivo) {
            return res.status(404).json({mensaje: "No se encontró el archivo especificado"})
        }
 
        if (archivo.idVehiculo && archivo.idVehiculo !== datosVehiculo.id) {
            return res.status(400).json({mensaje: "El archivo ya está asociado a otro vehículo"})
        }
 
        await Archivo.update(
            {idVehiculo: datosVehiculo.id, esPrincipal: false},
            {where: {id: idArchivo}}
        )
 
        if (req.bitacora) {
            req.bitacora(`FOTO SECUNDARIA ASOCIADA AL VEHÍCULO ${datosVehiculo.id}: archivo ${idArchivo}`)
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

        let idVehiculo = req.params.id
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


self.consultarColores = async function(req,res,next) {
    try {

        let colores = await Color.findAll()

        if (colores === null) {
            return res.status(404).json({mensaje:"No se encontraron colores"})
        }

        return res.status(200).json(colores)
    } catch (error) {
        next(error)
    }
}

self.consultarColor = async function(req,res,next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        let idColor = req.query.idColor

        let color = await Color.findByPk(idColor)

        if (color === null) {
            return res.status(404).json({mensaje: "No se encontró el color"})
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
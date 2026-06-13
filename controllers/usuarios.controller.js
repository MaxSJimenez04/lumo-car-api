const {Usuario, Rol, Archivo, Sucursal, sequelize} = require('../models')
const Sequelize = require('sequelize')
const bitacora = require('../middlewares/bitacora.middleware')
const {validationResult, param, body} = require('express-validator')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const path = require('path')
const fs = require('fs')

let self = {}

self.usuarioValidator = [
    body('id', 'Campo vacío').not().isEmpty(),
    body('usuario', 'Campo inválido').notEmpty().isString(),
    body('contrasena', 'Contraseña debe ser de 8 caracteres hasta 255').notEmpty().isLength({min: 8, max: 255})
]

self.validaciones = {
    crearUsuario:[
        body('usuario', 'El usuario debe ser una cadena no vacia').notEmpty().isString(),
        body('usuario', 'El usuario es muy grande').isLength({max: 255, min: 5}),
        body('contrasena', 'Contraseña debe ser de 8 caracteres hasta 255').notEmpty().isString().isLength({min:8,max:255}),
        body('contrasena', 'La contraseña debe tener al menos un caracter especial y un número').isStrongPassword({minLowercase: 0, minUppercase:0, minNumbers:1, minSymbols:1}),
        body('correo', 'Formato de correo inválido').notEmpty().isEmail(),
        body('correo', 'El correo es muy grande').isLength({max:255}),
        body('nombre', 'Especificar un nombre').notEmpty().isString(),
        body('nombre', 'El nombre es muy grande').isLength({max:255}),
        body('apellidos', 'Especificar un apellido minimo').notEmpty().isString(),
        body('apellidos', 'El campo apellidos es muy grande').isLength({max:255}),
        body('telefono', 'Formato inválido').notEmpty().isString(),
        body('telefono', 'El teléfono es muy grande').isLength({max:255}),
        body('fecha', 'Especificar fecha de nacimiento').notEmpty(),
        body('fecha.mes','El mes deben ser un número entre 0 (enero) y 11 (diciembre)').isInt({min:0, max: 11}),
        body('idRol', 'Se debe especificar un rol').notEmpty().isInt()
    ],

    consultarPerfil:[
        param('usuario', 'El usuario debe ser una cadena no vacia').notEmpty().isString(),
        param('usuario', 'El usuario es muy grande').isLength({max: 255})
    ],

    modificarPerfil:[ 
        param('usuario', 'El usuario es muy grande').isLength({max: 255}),
        body('correo', 'El correo es muy grande').isLength({max:255}),
        body('nombre', 'El nombre es muy grande').isString().isLength({max:255}),
        body('apellidos', 'El campo apellidos es muy grande').isLength({max:255}),
        body('telefono', 'El teléfono es muy grande').isString().isLength({max:255}),
    ],

    elimnarUsuario:[
        param('id', 'Campo vacío').isUUID().notEmpty()
    ],

    asignarSucursal:[
        body('idSucursal', 'Se debe especificar la sucursal').notEmpty(),
        param('usuario', 'campo vacío').notEmpty().isString()
    ],

    cambiarSucursal:[
        body('idSucursal', 'Se debe especificar la sucursal').notEmpty(),
        param('usuario', 'campo vacío').notEmpty().isString()
    ],
    subirFoto:[
        body('idArchivo', 'Se debe especificar el archivo').notEmpty(),
        param('usuario', 'Se debe especificar el usuario asociado').notEmpty()
    ],
    consultarFoto:[
        param('usuario', 'Se debe especificar el usuario asociado').notEmpty()
    ]

}

self.registro = async function(req, res, next){
    try {
        const errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        let contrasenaHasheada = await bcrypt.hash(req.body.contrasena, 10)
        let {fecha, idSucursal }= req.body

        let fechaParseada = new Date(fecha.ano, fecha.mes, fecha.dia)
        let idGenerada = crypto.randomUUID()
        let datos = await Usuario.create({
            id: idGenerada,
            usuario: req.body.usuario,
            contrasena: contrasenaHasheada,
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            correo: req.body.correo,
            telefono: req.body.telefono,
            fecha_nacimiento: fechaParseada,
            idRol: req.body.idRol,
            idSucursal: idSucursal ?? null
        })

        if (req.bitacora) {
            req.bitacora(`REGISTRO DE USUARIO ${datos.id}`)
        }

        return res.status(201).json(datos)
    } catch (error) {
        next(error)
    }
}


self.consultaGeneral = async function(req, res, next){
    try {
        const { idSucursal } = req.query;

        const where = {
            idRol: 2
        };

        if (idSucursal) {
            where.idSucursal = idSucursal;
        }

        let datos = await Usuario.findAll({
            where,
            raw: true,
            attributes: [
                'id',
                'usuario',
                'nombre',
                'apellidos',
                'correo',
                'telefono',
                'fecha_nacimiento',
                'idRol',
                'idSucursal',
                [Sequelize.col('Rol.nombreRol'), 'Rol'],
                [Sequelize.col('Sucursal.nombre'), 'Sucursal']
            ],
            include: [
                {
                    model: Rol,
                    attributes: []
                },
                {
                    model: Sucursal,
                    attributes: []
                }
            ]
        });

        if (datos.length === 0) {
            return res.status(404).json({
                mensaje: "No se encontraron empleados"
            });
        }

        return res.status(200).json(datos);

    } catch (error) {
        next(error);
    }
}

self.consultar = async function(req, res, next){
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        const {usuario} = req.params
        let datos = await Usuario.findOne({
            where: {usuario: usuario},
            raw: true,
            attributes: ['id', 'usuario', 'nombre', 'apellidos', 'correo', 'telefono', 'fecha_nacimiento', 'idRol', Sequelize.col('Rol.nombreRol')],
            include: {model: Rol, attributes: []}
        })

        if (datos === null) {
            return res.status(404).json({mensaje: "No se encontró el usuario"})
        }

        return res.status(200).json(datos)
    } catch (error) {
        next(error)
    }
}


self.modificar = async function(req, res, next){
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        let {usuario} = req.params

        if (req.body.telefono !== undefined) {
            let telefonoReq = req.body.telefono
        }

        if (req.body.correo !== undefined) {
            let correoReq = req.body.correo
        }

        if (req.body.apellidos !== undefined) {
            
        }

        if (req.body.nombre !== undefined) {
            
        }


        let body = req.body
        let coincidencia = await Usuario.findOne({
            where: {usuario: usuario},
            raw: true,
            attributes: ['id']
        })

        if (coincidencia == null) {
            return res.status(400).json({mensaje: "No se encontró el usuario"})
        }

        let datos = await Usuario.update(body, {where: {id: coincidencia.id}})

        if (datos[0] === 0) {
            return res.status(404).json({mensaje: "No se pudo modificar el usuario"})
        }

        if (req.bitacora) {
            req.bitacora(`MODIFICACION DE PERFIL ${usuario} con ID ${coincidencia.id}`)
        }

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

self.eliminar = async function(req, res, next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json(errores.array())
        }

        let id = req.params.id

        let datos = Usuario.destroy(
            {
                where: {id: id}
            }
        )

        if (datos[0] === 0) {
            return res.status(404).json({mensaje:"No se encontró el usuario"})
        }

        if (req.bitacora) {
            req.bitacora(`ELIMINICACIÓN DE USUARIO CON ID ${id}`)
        }

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

self.transferirSucursal = async function(req, res, next) {
    try {
        let errores =  validationResult(req)
        if (!errores == null) {
            return res.status(400).json(errores.array())
        }

        let {usuario} = req.params
        let idNuevaSucursal = req.body.idSucursal

        let datosUsuario = await Usuario.findOne({
            where: {usuario : usuario},
            raw: true,
            attributes: ['id', 'usuario', 'idRol']
        })

        if (datosUsuario == null) {
            return res.status(404).json({mensaje: "No se encontró el usuario"})
        }

        let sucursalExiste = await Sucursal.findByPk(idNuevaSucursal)

        if (sucursalExiste == null) {
            return res.status(404).json({mensaje: "No se encontró la sucursal"})
        }

        let usuarioActualizar = await Usuario.update({idSucursal: idNuevaSucursal}, {where: {id: datosUsuario.id}})

        if (usuarioActualizar[0] === 0) {
            return res.status(400).json({mensaje: "No se pudo cambiar la sucursal"})
        }

        if(req.bitacora){
            req.bitacora(`ACTUALIZACIÓN DE SUCURSAL PARA ADMINISTRADOR ${usuario}`)
        }

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
}

self.consultarFotoPerfil = async function(req, res, next) {
    try {
        let errores = validationResult(req)
        if (!errores.isEmpty()) {
            return res.status(400).json({mensaje: errores.array()})
        }

        const {usuario} = req.params
        let datosUsuario = await Usuario.findOne({
            where: {usuario: usuario},
            raw: true,
            attributes: ['id','usuario']
        })

        if (datosUsuario === null || datosUsuario === undefined) {
            return res.status(404).json({mensaje: "No se encontró el usuario especificado"})
        }

        let idUsuarioBD = datosUsuario.id

        let datosImagen = await Archivo.findOne({
            where: {idUsuario: idUsuarioBD, esPrincipal: true},
            raw:true,
            attributes:['id', 'nombreArchivo','ruta']
        })

        
        if (datosImagen === null || datosImagen === undefined) {
            let rutaImagen = path.join(__dirname, '../uploads/usuarios', 'default-profile-picture.png')
            return res.status(200).sendFile(rutaImagen)
        }else{
            let rutaImagen = path.join(__dirname,'../uploads/usuarios', datosImagen.nombreArchivo)
            return res.status(200).sendFile(rutaImagen)
        }

    } catch (error) {
        next(error)
    }
}

self.asociarFotoPerfil = async function(req,res, next) {
    try {
        let errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({errores: errores.array()})
        }

        let {usuario} = req.params
        let idArchivo = req.body.idArchivo
        let existeImagen = await Archivo.findOne({
            where: {id: idArchivo},
            raw: true,
            attributes: ['id', 'idUsuario', 'esPrincipal']
        })

        let usuarioBD = await Usuario.findOne({
            where: {usuario: usuario},
            raw: true,
            attributes: ['id']
        })

        if (!usuarioBD) {
                return res.status(404).json({mensaje: "No se encontró el usuario"})
        }
        
        let idUsuario = usuarioBD.id

        

        let imagenesExistentes = await Archivo.findAll({
            where: {idUsuario: idUsuario},
            raw:true,
            attributes:['id', 'esPrincipal']
        })

        if (existeImagen === null || existeImagen === undefined) {
            return res.status(404).json({mensaje: "No se encontró el archivo especificado"})
        }

        if (existeImagen.idUsuario === idUsuario) {
            return res.status(400).json({mensaje: "El archivo ya está asociado al usuario"})
        }
        
        if (imagenesExistentes.length !== 0) {
              await Promise.all(
                    imagenesExistentes.filter(imagen => imagen.esPrincipal).map(imagen =>
                    Archivo.update({ esPrincipal: false },{ where: { id: imagen.id } })
            ));  
        }

        let datos = await Archivo.update({idUsuario: idUsuario, esPrincipal: true}, {where:{id:idArchivo}})

        if (datos[0] === 0) {
            return res.status(400).json({mensaje: "No se pudo asociar la imagen"})
        }

        if (req.bitacora) {
            req.bitacora(`CARGA DE FOTO DE PERFIL PARA USUARIO CON ID: ${idUsuario}`)
        }
        return res.status(204).send()   
    } catch (error) {
        next(error)
    }
}
module.exports = self
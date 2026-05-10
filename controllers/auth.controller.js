const bcrypt = require('bcrypt')
const crypto = require('crypto')
const {usuario, rol, Usuario, Rol} = require('../models')
const {GenerarToken, tiempoRestanteToken} = require('../services/jwtservice')
const EmailService = require('../services/correo.service')
const bitacora = require('../middlewares/bitacora.middleware')
const {body, param, validationResult} = require('express-validator')
const Sequelize = require('sequelize')

let self = {}

var listaCodigos = new Map()

self.loginValidator = [
    body('usuario', 'campo vacío').not().isEmpty(),
    body('contrasena', 'campo vacío').not().isEmpty(),  
]

self.validaciones ={
    solicitarRestablecer:[
        param('usuario', 'campo vacio').not().isEmpty(),
        param('usuario', 'formato inválido').isString()
    ],

    validarCodigo:[
        param('usuario', 'campo vacio').not().isEmpty(),
        param('usuario', 'formato inválido').isString(),
        body('codigo', 'campo vacío').not().isEmpty()
    ],
    validarContrasena:[
        body('contrasena', 'campo vacio').not().isEmpty(),
        body('contrasena', 'La contrasena debe tener al menos 8 caracteres').isLength({min: 8}),
        param('usuario', 'campo vacio').not().isEmpty(),
        param('usuario', 'formato inválido').isString()
    ]
}

self.login = async function(req, res, next) {
    const{usuario, contrasena} = req.body

    const validacion = validationResult(req)
    if (!validacion.isEmpty()) {
        return res.status(400).json(validacion.array())
    }
    try {
        let datosLogin = await Usuario.findOne({
            where: {usuario : usuario},
            raw: true,
            attributes: ['id', 'usuario', 'nombre', 'contrasena', Sequelize.col('rol.nombreRol'), 'idRol'],
            include: {model: Rol, attributes: []}
        })

        if (datosLogin === null) {
            return res.status(401).json({mensaje: "Usuario o contraseña incorrectos."})
        }
        
        let comparacion = await self.compararContrasena(contrasena, datosLogin.contrasena)
        if (!comparacion) {
            return res.status(401).json({mensaje: "Usuario o contraseña incorrectos"})
        }

        var token = GenerarToken(datosLogin.usuario, datosLogin.nombre, datosLogin.nombreRol)

       if (req.bitacora) {
        req.bitacora(`Inicio de Sesión: ${datosLogin.usuario}`)
       }

        res.status(200).json({
            usuario: datosLogin.usuario,
            nombre: datosLogin.nombre,
            rol: datosLogin.nombreRol,
            jwt: token
        })

    } catch (error) {
       console.log("Error: " + error);
       next(error)
    }
}

self.solicitudRestablecerContrasena = async function(req, res, next) {
    const {usuario} = req.params

    const validacion = validationResult(req)
    if (!validacion.isEmpty()) {
        return res.status(400).json(validacion.array())
    }
    try {
        let usuarioBD = await Usuario.findOne({
            where: {usuario: usuario},
            raw: true,
            attributes: ['id','usuario', 'nombre','correo']
        })

        if (usuarioBD === null) {
        return res.status(404).json({mensaje: "No se encontró usuario con el usuario ingresado."})
        }

        if (usuarioBD.correo === null) {
            return res.status(404).json({mensaje: "El usuario no tiene correo asociado"})
        }

        codigo = self.generarCodigo()

        listaCodigos.set(usuario, codigo)
        
        let respuesta = await EmailService.enviarCorreoRecuperacion(usuarioBD.correo, usuarioBD.nombre, codigo)
        
        if (!respuesta) {
            return res.status(400).json({mensaje: "Ocurrió un error al envíar el correo"})
        }

        if(req.bitacora){
            req.bitacora(`Solicitud de restablecimiento de contraseña para ${usuarioBD.usuario}`)
        }
        
        return res.status(200).json(
            {
                mensaje: `Código enviado al correo: ${usuarioBD.correo}`,
                usuario: usuarioBD.usuario
            }
        )
            
    } catch (error) {
        console.log("Error: " + error);
        next(error)
    }
}

self.tiempoRestante = async function(req,res) {
    const tiempo = tiempoRestanteToken(req)

    if (tiempo === null) {
        return res.status(401).json({mensaje: "Token inválido o ya ha expirado"})
    }
    return res.status(200).json({tiempo: tiempo})
}

self.validarCodigoSolicitud = async function(req, res) {
    let {usuario} = req.params
    let {codigo} = req.body
    const validacion = validationResult(req)
    if (!validacion.isEmpty()) {
        return res.status(400).json(validacion.array())
    }

    if (listaCodigos.get(usuario) !== codigo) {

        return res.status(401).json({mensaje: "Código inválido"})
    }

    return res.status(200).json({mensaje: "Código válido"})
}

self.cambiarContrasena = async function(req, res, next) {
    const {usuario} = req.params
    const {contrasena} = req.body
    const validacion = validationResult(req)
    if (!validacion.isEmpty()) {
        return res.status(401).json(validacion.array())
    }

    try {
        let usuarioBD = await Usuario.findOne({
            where: {usuario: usuario},
            raw: true,
            attributes: ['id', 'usuario', 'contrasena', 'nombre', 'correo']
        })

        if (usuarioBD === null) {
            return res.status(404).json({mensaje: "No se encontró el usuario especificado"})
        }

        let contrasenaCifrada = await bcrypt.hash(contrasena, 10)

        let modificarUsuario = await Usuario.update({contrasena: contrasenaCifrada}, {where: {id: usuarioBD.id}})

        if (modificarUsuario[0] == 0) {
            return res.status(400).json({mensaje: "Error al actualizar el usuario."})
        }

        if(req.bitacora){
            req.bitacora(`RESTABLECIMIENTO DE CONTRASEÑA ${usuarioBD.usuario}`)
        }

        return res.status(200).json({mensaje: "Contraseña restablecida correctamente."})

    } catch (error) {
        console.log("Error: " , error);
        next(error)
    }
}

self.compararContrasena = async function(contrasenaComparar, contrasenaHasheada) {
    return await bcrypt.compare(contrasenaComparar, contrasenaHasheada)
}

self.generarCodigo = function() {
    const codigo = Math.floor(100000 + Math.random() * 900000)
    console.log(codigo);
    return codigo
}



module.exports = self
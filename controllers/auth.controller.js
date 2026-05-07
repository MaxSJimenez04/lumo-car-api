const bcrypt = require('bcrypt')
const {usuario, rol, Usuario, Rol} = require('../models')
const {GenerarToken, tiempoRestante} = require('../services/jwtservice')
const bitacora = require('../middlewares/bitacora.middleware')
const {body, param, validationResult} = require('express-validator')
const Sequelize = require('sequelize')

let self = {}

self.loginValidator = [
    body('usuario', 'campo vacío').not().isEmpty(),
    body('contrasena', 'campo vacío').not().isEmpty(),  
]

self.login = async function(req, res, next) {
    const{usuario, contrasena} = req.body

    const validacion = validationResult(req)
    if (!validacion.isEmpty()) {
        return res.status(400).json(validacion.array())
    }
    try {
        let contador = 0
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

        var token = GenerarToken(datosLogin.usuario, datosLogin.nombre, datosLogin.rol)

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

self.tiempoRestante = async function(req,res) {
    const tiempo = tiempoRestante(req)

    if (tiempo === null) {
        return res.status(401).json({mensaje: "Token inválido o ya ha expirado"})
    }

    return res.status(200).json({tiempo: tiempo})
}

self.compararContrasena = async function(contrasenaComparar, contrasenaHasheada) {
    return await bcrypt.compare(contrasenaComparar, contrasenaHasheada)
}

module.exports = self
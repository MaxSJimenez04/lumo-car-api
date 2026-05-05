const bcrypt = require('bcrypt')
const {usuario, rol, Sequelize, Usuario, Rol} = require('../models')
const {GeneraToken, tiempoRestante} = require('../services/jwtservice')
const bitacora = require('../middlewares/bitacora.middleware')

let self = {}


self.login = async function(req, res, next) {
    const{usuarioLogin, contrasenaLogin} = req.body
    try {
        let contador = 0
        let datosLogin = await Usuario.findOne({
            where: {usuario : usuarioLogin},
            raw: true,
            attributes: ['id', 'usuario', 'nombre', 'contrasena', [Sequelize.col('rol.nombreRol')], 'idRol'],
            include: {model: Rol, attributes: []}
        })

        if (datosLogin === null) {
            return res.status(401).json({mensaje: "Usuario o contraseña incorrectos."})
            contador++
        }

        const compararContrasena = await bcrypt.compare(contrasenaLogin, datosLogin.contrasena)

        if (!compararContrasena) {
            contador++
            return res.status(401).json({mensaje: "Usuario o contraseña incorrectos."})
            
        }

        var token = GeneraToken(datosLogin.usuario, datosLogin.nombre, datosLogin.rol)

        bitacora.bitacora("INICIO DE SESION");

        res.status(200).json({
            usuario: datosLogin.usuario,
            nombre: datosLogin.nombre,
            rol: datosLogin.rol,
            jwt: token
        })

    } catch (error) {
       console.log("Error: " + error);
       next(error)
    }
}

self.tiempoRestante = async function(req,res ) {
    const tiempo = tiempoRestante(req)

    if (tiempo === null) {
        return res.status(401).json({mensaje: "Token inválido o ya ha expirado"})
    }

    return res.status(200).json({tiempo: tiempo})
}

module.exports = self
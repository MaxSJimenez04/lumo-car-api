const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const {ClaimTypes} = require('../config/claimtypes')
const { GenerarToken } = require('../services/jwtservice')
const rateLimit = require('express-rate-limit')

const Authorize = (rol) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.header('Authorization')

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ mensaje: 'Acceso denegado' })
            }

            const token = authHeader.split(' ')[1]
            const decodedToken = jwt.verify(token, jwtSecret)

            if (rol.split(',').indexOf(decodedToken[ClaimTypes.Role]) === -1) {
                return res.status(401).json({ mensaje: 'Acceso denegado' })
            }

            req.decodedToken = decodedToken

            const segundosRestantes =
                decodedToken.exp - Math.floor(Date.now() / 1000)

            if (segundosRestantes < 120) {
                req.nuevoToken = GenerarToken(
                    decodedToken[ClaimTypes.Name],
                    decodedToken[ClaimTypes.GivenName],
                    decodedToken[ClaimTypes.Role]
                )
            }

            return next()
        } catch (error) {
            return res.status(401).json({ mensaje: 'Token inválido' })
        }
    }
}

//Middleware para limitar los intentos de Login por IP
const LoginLimit = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutos
    max: 5, //Hasta 5 intentos para iniciar sesión
    skipSuccessfulRequests: true, //Ignora los inicios de sesión exitosos
    message: {
        status: 429,
        message: "Demasiados intentos desde esta conexión. Intenta de nuevo en 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false
})

module.exports = {Authorize, LoginLimit}
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const ClaimTypes = require('../config/claimtypes')
const { GeneraToken } = require('../services/jwtservice')
const rateLimit = require('express-rate-limit')

const Authorize = (rol) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.header('Authorization')
            const error = new Error('Acceso Denegado')

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                const error = new Error('Acceso denegado')
                error.statusCode = 401
                return next(error)
            }

            const token = authHeader.split(' ')[1]
            const decodedToken = jwt.verify(token, jwtSecret)

            if (rol.split(',').indexOf(decodedToken[ClaimTypes.Role]) == -1) {
                return next(error)
            }

            req.decodedToken = decodedToken

            var minutosRestantes = (decodedToken.exp - (new Date().getTime() / 1000) / 60)

            //Renovar token cuando tiempo restate < 2 minutos
            if (minutosRestantes < 2) {
                var nuevoToken = GeneraToken(decodedToken[ClaimTypes.Name],decodedToken[ClaimTypes.GivenName], decodedToken[ClaimTypes.Role])
                res.header("Set-Authorization", nuevoToken)
            }

            return next()
        } catch (error) {
            error.statusCode = 401
            return next(error)
        }
    }
}

//Middleware para limitar los intentos de Login por IP
const LoginLimit = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutos
    max: 5, //Hasta 5 intentos para iniciar sesión
    skipSuccessfulRequest: true, //Ignora los inicios de sesión exitosos
    message: {
        status: 429,
        message: "Demasiados intentos desde esta conexión. Intenta de nuevo en 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false
})

module.exports = {Authorize, LoginLimit}
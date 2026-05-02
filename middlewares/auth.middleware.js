const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const ClaimTypes = require('../config/claimtypes')
const { GeneraToken } = require('../services/jwtservice')

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

module.exports = Authorize